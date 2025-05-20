from typing import Dict, Any, List, Optional, Union, Set
import logging
import os
import json
import asyncio
import sqlite3
import zlib
from datetime import datetime

from .providers import create_cloud_provider, BaseCloudProvider


class CloudSyncManager:
    """Manager for cloud synchronization"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.logger = logging.getLogger(__name__)
        
        if config is None:
            config = {
                "provider_type": os.environ.get("CLOUD_PROVIDER", "local"),
                "sync_db_path": "./cloud_sync.db",
                "auto_sync_enabled": True,
                "sync_interval": 3600,  # 1 hour
                "conflict_resolution": "newest",  # newest, local, remote, manual
                "backup_schedule_enabled": False,
                "backup_schedule_interval": 86400,  # 24 hours
                "backup_retention_count": 7,  # Keep 7 backups
                "encryption_enabled": False,
                "provider_config": {}
            }
        
        self.config = config
        self.provider_type = config.get("provider_type", "local")
        self.sync_db_path = config.get("sync_db_path", "./cloud_sync.db")
        self.auto_sync_enabled = config.get("auto_sync_enabled", True)
        self.sync_interval = config.get("sync_interval", 3600)
        self.conflict_resolution = config.get("conflict_resolution", "newest")
        self.backup_schedule_enabled = config.get("backup_schedule_enabled", False)
        self.backup_schedule_interval = config.get("backup_schedule_interval", 86400)
        self.backup_retention_count = config.get("backup_retention_count", 7)
        self.encryption_enabled = config.get("encryption_enabled", False)
        self.provider_config = config.get("provider_config", {})
        
        self.provider = None
        self.sync_db = None
        self.sync_task = None
        self.backup_task = None
    
    async def initialize(self):
        """Initialize the cloud sync manager"""
        try:
            # Create cloud provider
            self.provider = create_cloud_provider(self.provider_type, self.provider_config)
            provider_result = await self.provider.initialize()
            
            # Initialize sync database
            self._init_sync_db()
            
            # Start auto-sync if enabled
            if self.auto_sync_enabled:
                self.start_auto_sync()
            
            # Start backup schedule if enabled
            if self.backup_schedule_enabled:
                self.start_backup_schedule()
            
            self.logger.info(f"Initialized cloud sync manager with provider: {self.provider_type}")
            return {
                "status": "success", 
                "provider": provider_result,
                "auto_sync": self.auto_sync_enabled,
                "sync_interval": self.sync_interval,
                "backup_schedule": self.backup_schedule_enabled,
                "encryption_enabled": self.encryption_enabled
            }
        except Exception as e:
            self.logger.error(f"Error initializing cloud sync manager: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    def _init_sync_db(self):
        """Initialize the sync database"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(self.sync_db_path), exist_ok=True)
            
            # Connect to SQLite database
            self.sync_db = sqlite3.connect(self.sync_db_path)
            cursor = self.sync_db.cursor()
            
            # Create sync_status table if it doesn't exist
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS sync_status (
                local_path TEXT PRIMARY KEY,
                remote_path TEXT,
                local_modified TEXT,
                remote_modified TEXT,
                status TEXT,
                last_sync TEXT,
                size INTEGER,
                sync_direction TEXT,
                conflict BOOLEAN,
                resolution TEXT
            )
            ''')
            
            # Create sync_config table if it doesn't exist
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS sync_config (
                key TEXT PRIMARY KEY,
                value TEXT
            )
            ''')
            
            # Create data_types table if it doesn't exist
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS data_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE,
                enabled BOOLEAN DEFAULT 1,
                priority INTEGER DEFAULT 0,
                compression_enabled BOOLEAN DEFAULT 0
            )
            ''')
            
            # Create sync_log table if it doesn't exist
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS sync_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                action TEXT,
                local_path TEXT,
                remote_path TEXT,
                status TEXT,
                error TEXT
            )
            ''')
            
            # Create backups table if it doesn't exist
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS backups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                remote_path TEXT,
                size INTEGER,
                status TEXT,
                encrypted BOOLEAN,
                note TEXT
            )
            ''')
            
            # Insert default config values if not exists
            cursor.execute('''
            INSERT OR IGNORE INTO sync_config (key, value)
            VALUES 
                ('auto_sync_enabled', ?),
                ('sync_interval', ?),
                ('conflict_resolution', ?),
                ('last_sync', ?),
                ('provider_type', ?),
                ('compression_enabled', ?),
                ('selective_sync_enabled', ?),
                ('backup_schedule_enabled', ?),
                ('backup_schedule_interval', ?),
                ('backup_retention_count', ?),
                ('encryption_enabled', ?)
            ''', (
                str(self.auto_sync_enabled).lower(),
                str(self.sync_interval),
                self.conflict_resolution,
                datetime.now().isoformat(),
                self.provider_type,
                "true",  # Enable compression by default
                "true",  # Enable selective sync by default
                "false", # Backup scheduling disabled by default
                "86400", # Daily backup by default (24 hours in seconds)
                "7",     # Keep 7 backups by default
                "false"  # Encryption disabled by default
            ))
            
            # Insert default data types if not exists
            cursor.execute('''
            INSERT OR IGNORE INTO data_types (name, enabled, priority, compression_enabled)
            VALUES
                ('trades', 1, 10, 1),
                ('daily_plans', 1, 20, 1),
                ('journals', 1, 30, 1),
                ('statistics', 1, 40, 1),
                ('preferences', 1, 50, 1),
                ('screenshots', 1, 60, 0),
                ('chart_templates', 1, 70, 1),
                ('alerts', 1, 80, 1)
            ''')
            
            self.sync_db.commit()
            self.logger.info(f"Initialized sync database at {self.sync_db_path}")
        except Exception as e:
            self.logger.error(f"Error initializing sync database: {str(e)}")
            raise
    
    def start_auto_sync(self):
        """Start automatic synchronization task"""
        if self.sync_task is not None:
            self.sync_task.cancel()
        
        async def sync_task():
            while True:
                try:
                    await self.sync_all()
                    await asyncio.sleep(self.sync_interval)
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    self.logger.error(f"Error in auto-sync task: {str(e)}")
                    await asyncio.sleep(60)  # Retry after 1 minute if error
        
        self.sync_task = asyncio.create_task(sync_task())
        self.logger.info(f"Started auto-sync task with interval: {self.sync_interval} seconds")
    
    def stop_auto_sync(self):
        """Stop automatic synchronization task"""
        if self.sync_task is not None:
            self.sync_task.cancel()
            self.sync_task = None
            self.logger.info("Stopped auto-sync task")
            
    def start_backup_schedule(self):
        """Start automated backup schedule"""
        if self.backup_task is not None:
            self.backup_task.cancel()
        
        async def backup_task():
            while True:
                try:
                    await self.create_backup()
                    # Cleanup old backups
                    await self.cleanup_old_backups()
                    await asyncio.sleep(self.backup_schedule_interval)
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    self.logger.error(f"Error in backup task: {str(e)}")
                    await asyncio.sleep(60)  # Retry after 1 minute if error
        
        self.backup_task = asyncio.create_task(backup_task())
        self.logger.info(f"Started backup schedule with interval: {self.backup_schedule_interval} seconds")
    
    def stop_backup_schedule(self):
        """Stop automated backup schedule"""
        if self.backup_task is not None:
            self.backup_task.cancel()
            self.backup_task = None
            self.logger.info("Stopped backup schedule")
    
    async def close(self):
        """Close cloud sync manager and release resources"""
        try:
            # Stop auto-sync
            self.stop_auto_sync()
            
            # Stop backup schedule
            self.stop_backup_schedule()
            
            # Close database connection
            if self.sync_db is not None:
                self.sync_db.close()
                self.sync_db = None
            
            self.logger.info("Closed cloud sync manager")
        except Exception as e:
            self.logger.error(f"Error closing cloud sync manager: {str(e)}")
    
    async def sync_all(self) -> Dict[str, Any]:
        return await self.sync_by_data_types(None)
        
    async def sync_by_data_types(self, data_types: Optional[List[str]] = None) -> Dict[str, Any]:
        """Synchronize all registered files"""
        try:
            # Get files from sync database based on data types
            cursor = self.sync_db.cursor()
            
            if data_types is not None and len(data_types) > 0:
                # Get only specific data types
                placeholders = ', '.join(['?'] * len(data_types))
                cursor.execute(f'''
                SELECT s.local_path, s.remote_path 
                FROM sync_status s
                INNER JOIN data_types d ON s.data_type = d.name
                WHERE d.enabled = 1 AND s.data_type IN ({placeholders})
                ''', data_types)
            else:
                # Get all data types that are enabled
                cursor.execute('''
                SELECT s.local_path, s.remote_path 
                FROM sync_status s
                LEFT JOIN data_types d ON s.data_type = d.name
                WHERE d.enabled = 1 OR s.data_type IS NULL
                ''')
                
            files = cursor.fetchall()
            
            results = {
                "success": [],
                "errors": [],
                "total": len(files),
                "successful": 0,
                "failed": 0
            }
            
            # Sync each file
            for local_path, remote_path in files:
                try:
                    result = await self.sync_file(local_path)
                    results["success"].append({
                        "local_path": local_path,
                        "remote_path": remote_path,
                        "result": result
                    })
                    results["successful"] += 1
                except Exception as e:
                    self.logger.error(f"Error syncing file {local_path}: {str(e)}")
                    results["errors"].append({
                        "local_path": local_path,
                        "remote_path": remote_path,
                        "error": str(e)
                    })
                    results["failed"] += 1
            
            # Update last sync time
            cursor.execute('''
            UPDATE sync_config 
            SET value = ?
            WHERE key = 'last_sync'
            ''', (datetime.now().isoformat(),))
            
            self.sync_db.commit()
            
            return {
                "status": "success",
                "timestamp": datetime.now().isoformat(),
                "results": results
            }
        except Exception as e:
            self.logger.error(f"Error in sync_all: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def sync_file(self, local_path: str) -> Dict[str, Any]:
        """Synchronize a specific file"""
        try:
            # Get file info from sync database
            cursor = self.sync_db.cursor()
            cursor.execute('''
            SELECT remote_path, local_modified, remote_modified, status, sync_direction
            FROM sync_status
            WHERE local_path = ?
            ''', (local_path,))
            
            row = cursor.fetchone()
            if row is None:
                raise ValueError(f"File not registered for sync: {local_path}")
            
            remote_path, local_modified, remote_modified, status, sync_direction = row
            
            # Check if file exists locally
            if not os.path.exists(local_path):
                # File deleted locally, needs to be downloaded or deleted remotely
                if sync_direction == "download":
                    # Download file from cloud
                    download_result = await self.provider.download_file(remote_path, local_path)
                    new_status = "synced"
                    new_local_modified = datetime.now().isoformat()
                elif sync_direction == "upload":
                    # Delete file remotely
                    delete_result = await self.provider.delete_file(remote_path)
                    new_status = "deleted"
                    new_local_modified = local_modified
                else:  # bidirectional
                    # Check if file exists remotely
                    try:
                        remote_metadata = await self.provider.get_file_metadata(remote_path)
                        # File exists remotely but not locally, download it
                        download_result = await self.provider.download_file(remote_path, local_path)
                        new_status = "synced"
                        new_local_modified = datetime.now().isoformat()
                    except:
                        # File doesn't exist remotely either, mark as deleted
                        new_status = "deleted"
                        new_local_modified = local_modified
            else:
                # File exists locally
                # Get local file info
                local_stat = os.stat(local_path)
                new_local_modified = datetime.fromtimestamp(local_stat.st_mtime).isoformat()
                
                # Check if file exists remotely
                try:
                    remote_metadata = await self.provider.get_file_metadata(remote_path)
                    new_remote_modified = remote_metadata.get("last_modified", remote_modified)
                    
                    # Check if there's a conflict
                    conflict = False
                    if local_modified != new_local_modified and remote_modified != new_remote_modified:
                        conflict = True
                    
                    if conflict:
                        # Resolve conflict based on configuration
                        if self.conflict_resolution == "newest":
                            local_dt = datetime.fromisoformat(new_local_modified)
                            remote_dt = datetime.fromisoformat(new_remote_modified)
                            
                            if local_dt > remote_dt:
                                # Local is newer, upload
                                upload_result = await self.provider.upload_file(local_path, remote_path)
                                new_status = "synced"
                            else:
                                # Remote is newer, download
                                download_result = await self.provider.download_file(remote_path, local_path)
                                new_status = "synced"
                        elif self.conflict_resolution == "local":
                            # Always prefer local version
                            upload_result = await self.provider.upload_file(local_path, remote_path)
                            new_status = "synced"
                        elif self.conflict_resolution == "remote":
                            # Always prefer remote version
                            download_result = await self.provider.download_file(remote_path, local_path)
                            new_status = "synced"
                        else:  # manual
                            # Mark as conflict for manual resolution
                            new_status = "conflict"
                    else:
                        # No conflict, sync based on modification times
                        if local_modified != new_local_modified:
                            # Local file modified, upload
                            upload_result = await self.provider.upload_file(local_path, remote_path)
                            new_status = "synced"
                        elif remote_modified != new_remote_modified:
                            # Remote file modified, download
                            download_result = await self.provider.download_file(remote_path, local_path)
                            new_status = "synced"
                        else:
                            # No changes, already in sync
                            new_status = "synced"
                except Exception as e:
                    # File doesn't exist remotely, upload it
                    upload_result = await self.provider.upload_file(local_path, remote_path)
                    new_status = "synced"
                    new_remote_modified = datetime.now().isoformat()
            
            # Update sync status in database
            cursor.execute('''
            UPDATE sync_status
            SET local_modified = ?,
                remote_modified = ?,
                status = ?,
                last_sync = ?,
                size = ?,
                conflict = ?
            WHERE local_path = ?
            ''', (
                new_local_modified,
                new_remote_modified if 'new_remote_modified' in locals() else remote_modified,
                new_status,
                datetime.now().isoformat(),
                os.path.getsize(local_path) if os.path.exists(local_path) else 0,
                1 if new_status == "conflict" else 0,
                local_path
            ))
            
            # Log sync action
            cursor.execute('''
            INSERT INTO sync_log (timestamp, action, local_path, remote_path, status, error)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                datetime.now().isoformat(),
                "sync",
                local_path,
                remote_path,
                new_status,
                None
            ))
            
            self.sync_db.commit()
            
            return {
                "status": "success",
                "sync_status": new_status,
                "local_path": local_path,
                "remote_path": remote_path,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error syncing file {local_path}: {str(e)}")
            
            # Log sync error
            cursor = self.sync_db.cursor()
            cursor.execute('''
            INSERT INTO sync_log (timestamp, action, local_path, remote_path, status, error)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                datetime.now().isoformat(),
                "sync",
                local_path,
                remote_path if 'remote_path' in locals() else None,
                "error",
                str(e)
            ))
            
            self.sync_db.commit()
            
            raise
    
    async def register_file(self, local_path: str, remote_path: str = None, sync_direction: str = "bidirectional", data_type: str = None, compress: bool = None) -> Dict[str, Any]:
        """Register a file for synchronization"""
        try:
            # Validate sync direction
            if sync_direction not in ["upload", "download", "bidirectional"]:
                raise ValueError(f"Invalid sync direction: {sync_direction}")
            
            # Get file info
            if not os.path.exists(local_path):
                raise FileNotFoundError(f"Local file not found: {local_path}")
            
            local_stat = os.stat(local_path)
            local_modified = datetime.fromtimestamp(local_stat.st_mtime).isoformat()
            
            # Generate remote path if not provided
            if remote_path is None:
                remote_path = os.path.basename(local_path)
                
            # Check if data type is provided and valid
            if data_type is not None:
                cursor = self.sync_db.cursor()
                cursor.execute('SELECT enabled, compression_enabled FROM data_types WHERE name = ?', (data_type,))
                data_type_info = cursor.fetchone()
                
                if data_type_info is None:
                    # Data type doesn't exist, create it
                    cursor.execute('''
                    INSERT INTO data_types (name, enabled, compression_enabled)
                    VALUES (?, 1, ?)
                    ''', (data_type, 1 if compress else 0))
                    data_type_enabled = True
                    data_type_compression = bool(compress) if compress is not None else False
                else:
                    data_type_enabled, data_type_compression = data_type_info[0], data_type_info[1]
                    
                    # Only sync if data type is enabled
                    if not data_type_enabled:
                        return {
                            "status": "warning",
                            "message": f"Data type '{data_type}' is disabled for synchronization",
                            "local_path": local_path
                        }
                    
                    # Override compression setting if specified
                    if compress is not None:
                        data_type_compression = bool(compress)
            
            # Check if file already registered
            cursor = self.sync_db.cursor()
            cursor.execute('SELECT * FROM sync_status WHERE local_path = ?', (local_path,))
            existing = cursor.fetchone()
            
            # Prepare for compression if needed
            compress_file = False
            if data_type is not None and data_type_compression:
                compress_file = True
            elif data_type is None and compress:
                compress_file = True
            
            if existing is not None:
                # Update existing record
                cursor.execute('''
                UPDATE sync_status
                SET remote_path = ?,
                    local_modified = ?,
                    status = ?,
                    sync_direction = ?
                WHERE local_path = ?
                ''', (
                    remote_path,
                    local_modified,
                    "pending",
                    sync_direction,
                    local_path
                ))
            else:
                # Insert new record
                cursor.execute('''
                INSERT INTO sync_status (
                    local_path, remote_path, local_modified, remote_modified,
                    status, last_sync, size, sync_direction, conflict, resolution,
                    data_type, compressed
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    local_path,
                    remote_path,
                    local_modified,
                    None,  # remote_modified
                    "pending",  # status
                    None,  # last_sync
                    local_stat.st_size,  # size
                    sync_direction,
                    0,  # conflict
                    None,  # resolution
                    data_type,  # data_type
                    1 if compress_file else 0  # compressed
                ))
            
            # Log registration
            cursor.execute('''
            INSERT INTO sync_log (timestamp, action, local_path, remote_path, status, error)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                datetime.now().isoformat(),
                "register",
                local_path,
                remote_path,
                "success",
                None
            ))
            
            self.sync_db.commit()
            
            # Perform initial sync
            sync_result = await self.sync_file(local_path)
            
            return {
                "status": "success",
                "local_path": local_path,
                "remote_path": remote_path,
                "sync_direction": sync_direction,
                "sync_result": sync_result
            }
        except Exception as e:
            self.logger.error(f"Error registering file {local_path}: {str(e)}")
            
            # Log registration error
            if 'cursor' in locals():
                cursor.execute('''
                INSERT INTO sync_log (timestamp, action, local_path, remote_path, status, error)
                VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    datetime.now().isoformat(),
                    "register",
                    local_path,
                    remote_path if 'remote_path' in locals() else None,
                    "error",
                    str(e)
                ))
                
                self.sync_db.commit()
            
            return {"status": "error", "error": str(e)}
    
    async def unregister_file(self, local_path: str, delete_remote: bool = False) -> Dict[str, Any]:
        """Unregister a file from synchronization"""
        try:
            # Check if file is registered
            cursor = self.sync_db.cursor()
            cursor.execute('SELECT remote_path FROM sync_status WHERE local_path = ?', (local_path,))
            row = cursor.fetchone()
            
            if row is None:
                return {"status": "error", "error": f"File not registered: {local_path}"}
            
            remote_path = row[0]
            
            # Delete remote file if requested
            if delete_remote:
                try:
                    delete_result = await self.provider.delete_file(remote_path)
                except Exception as e:
                    self.logger.error(f"Error deleting remote file {remote_path}: {str(e)}")
            
            # Remove from sync status
            cursor.execute('DELETE FROM sync_status WHERE local_path = ?', (local_path,))
            
            # Log unregistration
            cursor.execute('''
            INSERT INTO sync_log (timestamp, action, local_path, remote_path, status, error)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                datetime.now().isoformat(),
                "unregister",
                local_path,
                remote_path,
                "success",
                None
            ))
            
            self.sync_db.commit()
            
            return {
                "status": "success",
                "local_path": local_path,
                "remote_path": remote_path,
                "delete_remote": delete_remote
            }
        except Exception as e:
            self.logger.error(f"Error unregistering file {local_path}: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def get_sync_status(self, local_path: str = None) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
        """Get synchronization status for a file or all files"""
        try:
            cursor = self.sync_db.cursor()
            
            if local_path is not None:
                # Get status for specific file
                cursor.execute('''
                SELECT local_path, remote_path, local_modified, remote_modified,
                       status, last_sync, size, sync_direction, conflict, resolution
                FROM sync_status
                WHERE local_path = ?
                ''', (local_path,))
                
                row = cursor.fetchone()
                if row is None:
                    return {"status": "error", "error": f"File not registered: {local_path}"}
                
                columns = ["local_path", "remote_path", "local_modified", "remote_modified",
                          "status", "last_sync", "size", "sync_direction", "conflict", "resolution"]
                
                result = {columns[i]: row[i] for i in range(len(columns))}
                result["exists_locally"] = os.path.exists(local_path)
                
                # Check if exists remotely
                try:
                    remote_metadata = await self.provider.get_file_metadata(result["remote_path"])
                    result["exists_remotely"] = True
                except:
                    result["exists_remotely"] = False
                
                return {"status": "success", "data": result}
            else:
                # Get status for all files
                cursor.execute('''
                SELECT local_path, remote_path, local_modified, remote_modified,
                       status, last_sync, size, sync_direction, conflict, resolution
                FROM sync_status
                ''')
                
                rows = cursor.fetchall()
                columns = ["local_path", "remote_path", "local_modified", "remote_modified",
                          "status", "last_sync", "size", "sync_direction", "conflict", "resolution"]
                
                results = []
                for row in rows:
                    result = {columns[i]: row[i] for i in range(len(columns))}
                    result["exists_locally"] = os.path.exists(result["local_path"])
                    results.append(result)
                
                return {"status": "success", "data": results}
        except Exception as e:
            self.logger.error(f"Error getting sync status: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def get_sync_logs(self, limit: int = 100, offset: int = 0) -> Dict[str, Any]:
        """Get synchronization logs"""
        try:
            cursor = self.sync_db.cursor()
            
            # Get total count
            cursor.execute('SELECT COUNT(*) FROM sync_log')
            total = cursor.fetchone()[0]
            
            # Get logs with pagination
            cursor.execute('''
            SELECT id, timestamp, action, local_path, remote_path, status, error
            FROM sync_log
            ORDER BY id DESC
            LIMIT ? OFFSET ?
            ''', (limit, offset))
            
            rows = cursor.fetchall()
            columns = ["id", "timestamp", "action", "local_path", "remote_path", "status", "error"]
            
            results = []
            for row in rows:
                result = {columns[i]: row[i] for i in range(len(columns))}
                results.append(result)
            
            return {
                "status": "success",
                "data": results,
                "pagination": {
                    "total": total,
                    "limit": limit,
                    "offset": offset,
                    "has_more": (offset + limit) < total
                }
            }
        except Exception as e:
            self.logger.error(f"Error getting sync logs: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def resolve_conflict(self, local_path: str, resolution: str) -> Dict[str, Any]:
        """Resolve a synchronization conflict"""
        try:
            # Validate resolution
            if resolution not in ["local", "remote", "manual"]:
                raise ValueError(f"Invalid conflict resolution: {resolution}")
            
            # Check if file is registered and has conflict
            cursor = self.sync_db.cursor()
            cursor.execute('''
            SELECT remote_path, conflict
            FROM sync_status
            WHERE local_path = ?
            ''', (local_path,))
            
            row = cursor.fetchone()
            if row is None:
                return {"status": "error", "error": f"File not registered: {local_path}"}
            
            remote_path, conflict = row
            
            if conflict != 1:
                return {"status": "error", "error": f"File has no conflict: {local_path}"}
            
            # Resolve conflict
            if resolution == "local":
                # Upload local file to remote
                upload_result = await self.provider.upload_file(local_path, remote_path)
            elif resolution == "remote":
                # Download remote file to local
                download_result = await self.provider.download_file(remote_path, local_path)
            # For manual resolution, no action needed, just update status
            
            # Update sync status
            cursor.execute('''
            UPDATE sync_status
            SET conflict = 0,
                resolution = ?,
                status = ?,
                last_sync = ?
            WHERE local_path = ?
            ''', (
                resolution,
                "synced" if resolution != "manual" else "conflict_resolved",
                datetime.now().isoformat(),
                local_path
            ))
            
            # Log resolution
            cursor.execute('''
            INSERT INTO sync_log (timestamp, action, local_path, remote_path, status, error)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                datetime.now().isoformat(),
                "resolve_conflict",
                local_path,
                remote_path,
                resolution,
                None
            ))
            
            self.sync_db.commit()
            
            return {
                "status": "success",
                "local_path": local_path,
                "remote_path": remote_path,
                "resolution": resolution
            }
        except Exception as e:
            self.logger.error(f"Error resolving conflict for {local_path}: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def get_data_types(self) -> Dict[str, Any]:
        """Get configured data types for synchronization"""
        try:
            cursor = self.sync_db.cursor()
            cursor.execute('SELECT id, name, enabled, priority, compression_enabled FROM data_types ORDER BY priority')
            
            data_types = []
            for id, name, enabled, priority, compression_enabled in cursor.fetchall():
                data_types.append({
                    "id": id,
                    "name": name,
                    "enabled": bool(enabled),
                    "priority": priority,
                    "compression_enabled": bool(compression_enabled)
                })
            
            return {"status": "success", "data_types": data_types}
        except Exception as e:
            self.logger.error(f"Error getting data types: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def update_data_type(self, name: str, enabled: bool = None, priority: int = None, compression_enabled: bool = None) -> Dict[str, Any]:
        """Update data type configuration"""
        try:
            cursor = self.sync_db.cursor()
            
            # Check if data type exists
            cursor.execute('SELECT id FROM data_types WHERE name = ?', (name,))
            if cursor.fetchone() is None:
                # Create new data type
                cursor.execute('''
                INSERT INTO data_types (name, enabled, priority, compression_enabled)
                VALUES (?, ?, ?, ?)
                ''', (
                    name,
                    1 if enabled is None else enabled,
                    0 if priority is None else priority,
                    0 if compression_enabled is None else compression_enabled
                ))
            else:
                # Update existing data type
                update_fields = []
                params = []
                
                if enabled is not None:
                    update_fields.append("enabled = ?")
                    params.append(1 if enabled else 0)
                
                if priority is not None:
                    update_fields.append("priority = ?")
                    params.append(priority)
                
                if compression_enabled is not None:
                    update_fields.append("compression_enabled = ?")
                    params.append(1 if compression_enabled else 0)
                
                if update_fields:
                    params.append(name)  # Add name for WHERE clause
                    cursor.execute(f'''
                    UPDATE data_types
                    SET {', '.join(update_fields)}
                    WHERE name = ?
                    ''', params)
            
            self.sync_db.commit()
            
            # Get updated data type
            cursor.execute('''
            SELECT id, name, enabled, priority, compression_enabled
            FROM data_types
            WHERE name = ?
            ''', (name,))
            
            row = cursor.fetchone()
            if row is None:
                return {"status": "error", "error": f"Data type not found: {name}"}
            
            id, name, enabled, priority, compression_enabled = row
            
            return {
                "status": "success",
                "data_type": {
                    "id": id,
                    "name": name,
                    "enabled": bool(enabled),
                    "priority": priority,
                    "compression_enabled": bool(compression_enabled)
                }
            }
        except Exception as e:
            self.logger.error(f"Error updating data type {name}: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def compress_file(self, local_path: str) -> bytes:
        """Compress a file using zlib"""
        try:
            with open(local_path, 'rb') as f:
                data = f.read()
            
            compressed_data = zlib.compress(data)
            return compressed_data
        except Exception as e:
            self.logger.error(f"Error compressing file {local_path}: {str(e)}")
            raise
    
    async def decompress_file(self, data: bytes) -> bytes:
        """Decompress a file using zlib"""
        try:
            decompressed_data = zlib.decompress(data)
            return decompressed_data
        except Exception as e:
            self.logger.error(f"Error decompressing data: {str(e)}")
            raise
    
    async def update_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Update configuration"""
        try:
            cursor = self.sync_db.cursor()
            
            for key, value in config.items():
                if key == "auto_sync_enabled":
                    self.auto_sync_enabled = bool(value)
                    
                    # Start or stop auto-sync
                    if self.auto_sync_enabled and self.sync_task is None:
                        self.start_auto_sync()
                    elif not self.auto_sync_enabled and self.sync_task is not None:
                        self.stop_auto_sync()
                    
                    cursor.execute('''
                    UPDATE sync_config
                    SET value = ?
                    WHERE key = ?
                    ''', (str(value).lower(), key))
                elif key == "sync_interval":
                    self.sync_interval = int(value)
                    
                    # Restart auto-sync if running
                    if self.sync_task is not None:
                        self.stop_auto_sync()
                        self.start_auto_sync()
                    
                    cursor.execute('''
                    UPDATE sync_config
                    SET value = ?
                    WHERE key = ?
                    ''', (str(value), key))
                elif key == "conflict_resolution":
                    if value not in ["newest", "local", "remote", "manual"]:
                        raise ValueError(f"Invalid conflict resolution: {value}")
                    
                    self.conflict_resolution = value
                    
                    cursor.execute('''
                    UPDATE sync_config
                    SET value = ?
                    WHERE key = ?
                    ''', (value, key))
                elif key == "provider_type":
                    # Can't change provider type after initialization
                    return {"status": "error", "error": "Cannot change provider type after initialization"}
                elif key == "compression_enabled":
                    if isinstance(value, bool) or (isinstance(value, str) and value.lower() in ["true", "false"]):
                        if isinstance(value, str):
                            value = value.lower() == "true"
                        cursor.execute('''
                        UPDATE sync_config
                        SET value = ?
                        WHERE key = ?
                        ''', (str(value).lower(), key))
                elif key in ["selective_sync_enabled", "backup_schedule_enabled", "encryption_enabled"]:
                    if isinstance(value, bool) or (isinstance(value, str) and value.lower() in ["true", "false"]):
                        if isinstance(value, str):
                            value = value.lower() == "true"
                            
                        # Update value in database
                        cursor.execute('''
                        UPDATE sync_config
                        SET value = ?
                        WHERE key = ?
                        ''', (str(value).lower(), key))
                        
                        # Update instance variable if applicable
                        if key == "backup_schedule_enabled":
                            self.backup_schedule_enabled = value
                            # Start or stop backup schedule based on new value
                            if value and self.backup_task is None:
                                self.start_backup_schedule()
                            elif not value and self.backup_task is not None:
                                self.stop_backup_schedule()
                        elif key == "encryption_enabled":
                            self.encryption_enabled = value
                elif key == "backup_schedule_interval":
                    if isinstance(value, (int, str)):
                        # Convert to int if it's a string
                        if isinstance(value, str):
                            try:
                                value = int(value)
                            except ValueError:
                                raise ValueError(f"Invalid backup schedule interval: {value}")
                        
                        self.backup_schedule_interval = value
                        
                        # Update value in database
                        cursor.execute('''
                        UPDATE sync_config
                        SET value = ?
                        WHERE key = ?
                        ''', (str(value), key))
                        
                        # Restart backup schedule if running
                        if self.backup_task is not None:
                            self.stop_backup_schedule()
                            self.start_backup_schedule()
                elif key == "backup_retention_count":
                    if isinstance(value, (int, str)):
                        # Convert to int if it's a string
                        if isinstance(value, str):
                            try:
                                value = int(value)
                            except ValueError:
                                raise ValueError(f"Invalid backup retention count: {value}")
                        
                        self.backup_retention_count = value
                        
                        # Update value in database
                        cursor.execute('''
                        UPDATE sync_config
                        SET value = ?
                        WHERE key = ?
                        ''', (str(value), key))
            
            self.sync_db.commit()
            
            # Get updated config
            updated_config = await self.get_config()
            return updated_config
        except Exception as e:
            self.logger.error(f"Error updating config: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def get_config(self) -> Dict[str, Any]:
        """Get current configuration"""
        try:
            cursor = self.sync_db.cursor()
            cursor.execute('SELECT key, value FROM sync_config')
            
            config = {}
            for key, value in cursor.fetchall():
                if key in ["auto_sync_enabled", "backup_schedule_enabled", "encryption_enabled", "selective_sync_enabled"]:
                    config[key] = value.lower() == "true"
                elif key in ["sync_interval", "backup_schedule_interval", "backup_retention_count"]:
                    config[key] = int(value)
                else:
                    config[key] = value
            
            return {"status": "success", "config": config}
        except Exception as e:
            self.logger.error(f"Error getting config: {str(e)}")
            return {"status": "error", "error": str(e)}
            
    async def create_backup(self) -> Dict[str, Any]:
        """Create a backup of all tracked files"""
        try:
            self.logger.info("Creating backup...")
            
            # Get current timestamp
            timestamp = datetime.now().isoformat()
            timestamp_formatted = timestamp.replace(':', '-').replace('.', '-')
            
            # Create backup folder on the cloud provider
            backup_folder = f"backups/{timestamp_formatted}"
            
            try:
                await self.provider.create_folder(backup_folder)
            except Exception as e:
                self.logger.warning(f"Could not create backup folder: {str(e)}")
            
            # Get all registered files
            cursor = self.sync_db.cursor()
            cursor.execute('''
            SELECT local_path, remote_path, data_type 
            FROM sync_status 
            WHERE status != 'deleted'
            ''')
            
            files = cursor.fetchall()
            total_size = 0
            backup_files = []
            errors = []
            
            # Backup each file
            for local_path, remote_path, data_type in files:
                if not os.path.exists(local_path):
                    continue
                
                try:
                    # Get file size
                    file_size = os.path.getsize(local_path)
                    total_size += file_size
                    
                    # Create backup file path
                    backup_file_path = f"{backup_folder}/{os.path.basename(local_path)}"
                    
                    # Read file data
                    with open(local_path, 'rb') as f:
                        file_data = f.read()
                    
                    # Encrypt if enabled
                    if self.encryption_enabled:
                        from cryptography.fernet import Fernet
                        from cryptography.hazmat.primitives import hashes
                        from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
                        import base64
                        
                        # Generate a key from app-specific data
                        # In production, use a proper key management solution
                        salt = b'trading_journal_app_salt'  # This should be securely stored
                        password = b'TradingJournalBackupKey'  # This should be securely stored or derived
                        
                        kdf = PBKDF2HMAC(
                            algorithm=hashes.SHA256(),
                            length=32,
                            salt=salt,
                            iterations=100000,
                        )
                        key = base64.urlsafe_b64encode(kdf.derive(password))
                        
                        # Encrypt the data
                        fernet = Fernet(key)
                        file_data = fernet.encrypt(file_data)
                        
                        # Update file path to indicate encryption
                        backup_file_path += '.encrypted'
                    
                    # Upload file to backup folder
                    await self.provider.upload_data(file_data, backup_file_path)
                    
                    backup_files.append({
                        "local_path": local_path,
                        "backup_path": backup_file_path,
                        "size": file_size,
                        "encrypted": self.encryption_enabled
                    })
                    
                except Exception as e:
                    self.logger.error(f"Error backing up file {local_path}: {str(e)}")
                    errors.append({
                        "local_path": local_path,
                        "error": str(e)
                    })
            
            # Create a backup manifest file
            manifest = {
                "timestamp": timestamp,
                "total_size": total_size,
                "file_count": len(backup_files),
                "encrypted": self.encryption_enabled,
                "files": backup_files
            }
            
            manifest_json = json.dumps(manifest, indent=2)
            manifest_path = f"{backup_folder}/manifest.json"
            
            await self.provider.upload_data(manifest_json.encode('utf-8'), manifest_path)
            
            # Add backup to database
            cursor.execute('''
            INSERT INTO backups (timestamp, remote_path, size, status, encrypted, note)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                timestamp,
                backup_folder,
                total_size,
                "complete" if not errors else "partial",
                1 if self.encryption_enabled else 0,
                f"Errors: {len(errors)}" if errors else None
            ))
            
            self.sync_db.commit()
            
            self.logger.info(f"Backup completed: {backup_folder}, {len(backup_files)} files, {total_size} bytes")
            
            return {
                "status": "success",
                "timestamp": timestamp,
                "backup_path": backup_folder,
                "total_size": total_size,
                "file_count": len(backup_files),
                "errors": errors,
                "encrypted": self.encryption_enabled
            }
            
        except Exception as e:
            self.logger.error(f"Error creating backup: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def restore_backup(self, backup_path: str, target_folder: str = None) -> Dict[str, Any]:
        """Restore from a backup"""
        try:
            self.logger.info(f"Restoring from backup: {backup_path}")
            
            # Default target folder is the local directory
            if target_folder is None:
                target_folder = "./restored"
            
            # Create target folder if it doesn't exist
            os.makedirs(target_folder, exist_ok=True)
            
            # Read backup manifest
            manifest_path = f"{backup_path}/manifest.json"
            
            try:
                manifest_data = await self.provider.download_data(manifest_path)
                manifest = json.loads(manifest_data.decode('utf-8'))
            except Exception as e:
                self.logger.error(f"Error reading backup manifest: {str(e)}")
                return {"status": "error", "error": f"Invalid backup: {str(e)}"}
            
            # Check if backup is encrypted
            encrypted = manifest.get("encrypted", False)
            
            # Prepare decryption if needed
            fernet = None
            if encrypted:
                from cryptography.fernet import Fernet
                from cryptography.hazmat.primitives import hashes
                from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
                import base64
                
                # Generate the same key used for encryption
                salt = b'trading_journal_app_salt'  # Should match encryption salt
                password = b'TradingJournalBackupKey'  # Should match encryption password
                
                kdf = PBKDF2HMAC(
                    algorithm=hashes.SHA256(),
                    length=32,
                    salt=salt,
                    iterations=100000,
                )
                key = base64.urlsafe_b64encode(kdf.derive(password))
                fernet = Fernet(key)
            
            # Restore each file
            restored_files = []
            errors = []
            
            for file_info in manifest.get("files", []):
                local_path = file_info.get("local_path")
                backup_path = file_info.get("backup_path")
                is_encrypted = file_info.get("encrypted", False)
                
                if not local_path or not backup_path:
                    continue
                
                try:
                    # Determine restore destination
                    if target_folder == "original":
                        restore_path = local_path
                    else:
                        restore_path = os.path.join(target_folder, os.path.basename(local_path))
                    
                    # Create directory if needed
                    os.makedirs(os.path.dirname(restore_path), exist_ok=True)
                    
                    # Download file data
                    file_data = await self.provider.download_data(backup_path)
                    
                    # Decrypt if encrypted
                    if is_encrypted and fernet:
                        try:
                            file_data = fernet.decrypt(file_data)
                        except Exception as e:
                            self.logger.error(f"Error decrypting file {backup_path}: {str(e)}")
                            errors.append({
                                "file": backup_path,
                                "error": f"Decryption failed: {str(e)}"
                            })
                            continue
                    
                    # Write file to restore location
                    with open(restore_path, 'wb') as f:
                        f.write(file_data)
                    
                    restored_files.append({
                        "backup_path": backup_path,
                        "restore_path": restore_path,
                        "size": len(file_data)
                    })
                    
                except Exception as e:
                    self.logger.error(f"Error restoring file {backup_path}: {str(e)}")
                    errors.append({
                        "file": backup_path,
                        "error": str(e)
                    })
            
            self.logger.info(f"Restore completed: {len(restored_files)} files restored, {len(errors)} errors")
            
            return {
                "status": "success",
                "backup_path": backup_path,
                "restored_files": len(restored_files),
                "errors": errors
            }
            
        except Exception as e:
            self.logger.error(f"Error restoring backup: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def list_backups(self, limit: int = 10, offset: int = 0) -> Dict[str, Any]:
        """List available backups"""
        try:
            cursor = self.sync_db.cursor()
            
            # Get total count
            cursor.execute('SELECT COUNT(*) FROM backups')
            total = cursor.fetchone()[0]
            
            # Get backups with pagination
            cursor.execute('''
            SELECT id, timestamp, remote_path, size, status, encrypted, note
            FROM backups
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
            ''', (limit, offset))
            
            rows = cursor.fetchall()
            columns = ["id", "timestamp", "remote_path", "size", "status", "encrypted", "note"]
            
            results = []
            for row in rows:
                result = {columns[i]: row[i] for i in range(len(columns))}
                result["encrypted"] = bool(result["encrypted"])
                results.append(result)
            
            return {
                "status": "success",
                "data": results,
                "pagination": {
                    "total": total,
                    "limit": limit,
                    "offset": offset,
                    "has_more": (offset + limit) < total
                }
            }
        except Exception as e:
            self.logger.error(f"Error listing backups: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def cleanup_old_backups(self) -> Dict[str, Any]:
        """Remove old backups exceeding retention count"""
        try:
            cursor = self.sync_db.cursor()
            
            # Get backups sorted by timestamp, oldest first
            cursor.execute('''
            SELECT id, remote_path
            FROM backups
            ORDER BY timestamp ASC
            ''')
            
            backups = cursor.fetchall()
            
            # If we have more backups than the retention count, delete the oldest ones
            if len(backups) > self.backup_retention_count:
                to_delete = backups[:len(backups) - self.backup_retention_count]
                deleted = []
                errors = []
                
                for id, remote_path in to_delete:
                    try:
                        # Delete from cloud storage
                        try:
                            await self.provider.delete_folder(remote_path)
                        except Exception as e:
                            self.logger.warning(f"Error deleting backup folder {remote_path}: {str(e)}")
                            # Continue with database cleanup even if remote deletion fails
                        
                        # Delete from database
                        cursor.execute('DELETE FROM backups WHERE id = ?', (id,))
                        deleted.append(remote_path)
                    except Exception as e:
                        self.logger.error(f"Error cleaning up backup {remote_path}: {str(e)}")
                        errors.append({
                            "id": id,
                            "path": remote_path,
                            "error": str(e)
                        })
                
                self.sync_db.commit()
                
                self.logger.info(f"Cleaned up {len(deleted)} old backups, {len(errors)} errors")
                
                return {
                    "status": "success",
                    "deleted": deleted,
                    "errors": errors,
                    "retained": self.backup_retention_count
                }
            else:
                return {
                    "status": "success",
                    "message": f"No backups to clean up, {len(backups)} backups are within retention limit of {self.backup_retention_count}"
                }
        except Exception as e:
            self.logger.error(f"Error cleaning up old backups: {str(e)}")
            return {"status": "error", "error": str(e)}
