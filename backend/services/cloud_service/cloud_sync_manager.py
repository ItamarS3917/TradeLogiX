from typing import Dict, Any, List, Optional, Union
import logging
import os
import json
import asyncio
import sqlite3
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
                "provider_config": {}
            }
        
        self.config = config
        self.provider_type = config.get("provider_type", "local")
        self.sync_db_path = config.get("sync_db_path", "./cloud_sync.db")
        self.auto_sync_enabled = config.get("auto_sync_enabled", True)
        self.sync_interval = config.get("sync_interval", 3600)
        self.conflict_resolution = config.get("conflict_resolution", "newest")
        self.provider_config = config.get("provider_config", {})
        
        self.provider = None
        self.sync_db = None
        self.sync_task = None
    
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
            
            self.logger.info(f"Initialized cloud sync manager with provider: {self.provider_type}")
            return {
                "status": "success", 
                "provider": provider_result,
                "auto_sync": self.auto_sync_enabled,
                "sync_interval": self.sync_interval
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
            
            # Insert default config values if not exists
            cursor.execute('''
            INSERT OR IGNORE INTO sync_config (key, value)
            VALUES 
                ('auto_sync_enabled', ?),
                ('sync_interval', ?),
                ('conflict_resolution', ?),
                ('last_sync', ?),
                ('provider_type', ?)
            ''', (
                str(self.auto_sync_enabled).lower(),
                str(self.sync_interval),
                self.conflict_resolution,
                datetime.now().isoformat(),
                self.provider_type
            ))
            
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
    
    async def close(self):
        """Close cloud sync manager and release resources"""
        try:
            # Stop auto-sync
            self.stop_auto_sync()
            
            # Close database connection
            if self.sync_db is not None:
                self.sync_db.close()
                self.sync_db = None
            
            self.logger.info("Closed cloud sync manager")
        except Exception as e:
            self.logger.error(f"Error closing cloud sync manager: {str(e)}")
    
    async def sync_all(self) -> Dict[str, Any]:
        """Synchronize all registered files"""
        try:
            # Get all files from sync database
            cursor = self.sync_db.cursor()
            cursor.execute('SELECT local_path, remote_path FROM sync_status')
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
    
    async def register_file(self, local_path: str, remote_path: str = None, sync_direction: str = "bidirectional") -> Dict[str, Any]:
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
            
            # Check if file already registered
            cursor = self.sync_db.cursor()
            cursor.execute('SELECT * FROM sync_status WHERE local_path = ?', (local_path,))
            existing = cursor.fetchone()
            
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
                    status, last_sync, size, sync_direction, conflict, resolution
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    None  # resolution
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
            
            self.sync_db.commit()
            
            return {
                "status": "success",
                "config": {
                    "auto_sync_enabled": self.auto_sync_enabled,
                    "sync_interval": self.sync_interval,
                    "conflict_resolution": self.conflict_resolution,
                    "provider_type": self.provider_type
                }
            }
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
                if key == "auto_sync_enabled":
                    config[key] = value.lower() == "true"
                elif key == "sync_interval":
                    config[key] = int(value)
                else:
                    config[key] = value
            
            return {"status": "success", "config": config}
        except Exception as e:
            self.logger.error(f"Error getting config: {str(e)}")
            return {"status": "error", "error": str(e)}
