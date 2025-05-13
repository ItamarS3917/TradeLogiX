from typing import Dict, Any, List, Optional
import logging
import os
import json
import asyncio
import aiohttp
from datetime import datetime

class BaseCloudProvider:
    """Base class for cloud storage providers"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(__name__)
    
    async def initialize(self):
        """Initialize the cloud provider"""
        raise NotImplementedError("Cloud provider must implement initialize method")
    
    async def upload_file(self, file_path: str, target_path: str) -> Dict[str, Any]:
        """Upload a file to cloud storage"""
        raise NotImplementedError("Cloud provider must implement upload_file method")
    
    async def download_file(self, cloud_path: str, local_path: str) -> Dict[str, Any]:
        """Download a file from cloud storage"""
        raise NotImplementedError("Cloud provider must implement download_file method")
    
    async def list_files(self, path: str) -> List[Dict[str, Any]]:
        """List files in a directory in cloud storage"""
        raise NotImplementedError("Cloud provider must implement list_files method")
    
    async def delete_file(self, path: str) -> Dict[str, Any]:
        """Delete a file from cloud storage"""
        raise NotImplementedError("Cloud provider must implement delete_file method")
    
    async def get_file_metadata(self, path: str) -> Dict[str, Any]:
        """Get metadata for a file in cloud storage"""
        raise NotImplementedError("Cloud provider must implement get_file_metadata method")


class LocalStorageProvider(BaseCloudProvider):
    """Local storage provider for development and testing"""
    
    def __init__(self, config: Dict[str, Any] = None):
        if config is None:
            config = {
                "storage_dir": "./cloud_storage",
                "provider_name": "local"
            }
        super().__init__(config)
        self.storage_dir = config.get("storage_dir", "./cloud_storage")
    
    async def initialize(self):
        """Initialize the local storage provider"""
        os.makedirs(self.storage_dir, exist_ok=True)
        self.logger.info(f"Initialized local storage provider with directory: {self.storage_dir}")
        return {"status": "success", "provider": "local", "storage_dir": self.storage_dir}
    
    async def upload_file(self, file_path: str, target_path: str) -> Dict[str, Any]:
        """Upload a file to local storage"""
        try:
            # Create target directory if it doesn't exist
            target_dir = os.path.dirname(os.path.join(self.storage_dir, target_path))
            os.makedirs(target_dir, exist_ok=True)
            
            # Copy file to target location
            import shutil
            target_full_path = os.path.join(self.storage_dir, target_path)
            shutil.copy2(file_path, target_full_path)
            
            # Get file metadata
            file_stats = os.stat(target_full_path)
            
            return {
                "status": "success",
                "provider": "local",
                "file_path": target_path,
                "size": file_stats.st_size,
                "last_modified": datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
                "created": datetime.fromtimestamp(file_stats.st_ctime).isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error uploading file to local storage: {str(e)}")
            return {"status": "error", "provider": "local", "error": str(e)}
    
    async def download_file(self, cloud_path: str, local_path: str) -> Dict[str, Any]:
        """Download a file from local storage"""
        try:
            # Create target directory if it doesn't exist
            target_dir = os.path.dirname(local_path)
            os.makedirs(target_dir, exist_ok=True)
            
            # Copy file to local path
            import shutil
            source_path = os.path.join(self.storage_dir, cloud_path)
            shutil.copy2(source_path, local_path)
            
            # Get file metadata
            file_stats = os.stat(local_path)
            
            return {
                "status": "success",
                "provider": "local",
                "file_path": local_path,
                "size": file_stats.st_size,
                "last_modified": datetime.fromtimestamp(file_stats.st_mtime).isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error downloading file from local storage: {str(e)}")
            return {"status": "error", "provider": "local", "error": str(e)}
    
    async def list_files(self, path: str = "") -> List[Dict[str, Any]]:
        """List files in a directory in local storage"""
        try:
            target_dir = os.path.join(self.storage_dir, path)
            if not os.path.exists(target_dir):
                return []
            
            files = []
            for item in os.listdir(target_dir):
                item_path = os.path.join(target_dir, item)
                item_stats = os.stat(item_path)
                rel_path = os.path.relpath(item_path, self.storage_dir)
                
                files.append({
                    "name": item,
                    "path": rel_path,
                    "size": item_stats.st_size,
                    "last_modified": datetime.fromtimestamp(item_stats.st_mtime).isoformat(),
                    "created": datetime.fromtimestamp(item_stats.st_ctime).isoformat(),
                    "is_dir": os.path.isdir(item_path)
                })
            
            return files
        except Exception as e:
            self.logger.error(f"Error listing files in local storage: {str(e)}")
            return []
    
    async def delete_file(self, path: str) -> Dict[str, Any]:
        """Delete a file from local storage"""
        try:
            target_path = os.path.join(self.storage_dir, path)
            
            if os.path.isdir(target_path):
                import shutil
                shutil.rmtree(target_path)
            else:
                os.remove(target_path)
            
            return {
                "status": "success",
                "provider": "local",
                "deleted_path": path
            }
        except Exception as e:
            self.logger.error(f"Error deleting file from local storage: {str(e)}")
            return {"status": "error", "provider": "local", "error": str(e)}
    
    async def get_file_metadata(self, path: str) -> Dict[str, Any]:
        """Get metadata for a file in local storage"""
        try:
            target_path = os.path.join(self.storage_dir, path)
            file_stats = os.stat(target_path)
            
            return {
                "status": "success",
                "provider": "local",
                "file_path": path,
                "size": file_stats.st_size,
                "last_modified": datetime.fromtimestamp(file_stats.st_mtime).isoformat(),
                "created": datetime.fromtimestamp(file_stats.st_ctime).isoformat(),
                "is_dir": os.path.isdir(target_path)
            }
        except Exception as e:
            self.logger.error(f"Error getting file metadata from local storage: {str(e)}")
            return {"status": "error", "provider": "local", "error": str(e)}


class S3CloudProvider(BaseCloudProvider):
    """AWS S3 cloud storage provider"""
    
    def __init__(self, config: Dict[str, Any] = None):
        if config is None:
            config = {
                "provider_name": "s3",
                "bucket_name": "tradingjournal-data",
                "region": "us-east-1",
                "access_key": os.environ.get("AWS_ACCESS_KEY", ""),
                "secret_key": os.environ.get("AWS_SECRET_KEY", ""),
                "endpoint_url": os.environ.get("S3_ENDPOINT_URL", None)
            }
        super().__init__(config)
        self.bucket_name = config.get("bucket_name", "tradingjournal-data")
        self.region = config.get("region", "us-east-1")
        self.access_key = config.get("access_key", os.environ.get("AWS_ACCESS_KEY", ""))
        self.secret_key = config.get("secret_key", os.environ.get("AWS_SECRET_KEY", ""))
        self.endpoint_url = config.get("endpoint_url", os.environ.get("S3_ENDPOINT_URL", None))
        self.client = None
        self.resource = None
    
    async def initialize(self):
        """Initialize the S3 storage provider"""
        try:
            import boto3
            
            # Initialize S3 client
            self.client = boto3.client(
                's3',
                region_name=self.region,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                endpoint_url=self.endpoint_url
            )
            
            # Initialize S3 resource
            self.resource = boto3.resource(
                's3',
                region_name=self.region,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                endpoint_url=self.endpoint_url
            )
            
            # Check if bucket exists, create if not
            try:
                self.client.head_bucket(Bucket=self.bucket_name)
            except:
                # Bucket doesn't exist, create it
                self.client.create_bucket(Bucket=self.bucket_name)
            
            self.logger.info(f"Initialized S3 storage provider with bucket: {self.bucket_name}")
            return {"status": "success", "provider": "s3", "bucket": self.bucket_name}
        except Exception as e:
            self.logger.error(f"Error initializing S3 storage provider: {str(e)}")
            return {"status": "error", "provider": "s3", "error": str(e)}
    
    async def upload_file(self, file_path: str, target_path: str) -> Dict[str, Any]:
        """Upload a file to S3 storage"""
        try:
            # Upload file to S3
            import boto3
            
            response = self.client.upload_file(
                file_path,
                self.bucket_name,
                target_path
            )
            
            # Get file metadata
            obj = self.resource.Object(self.bucket_name, target_path)
            metadata = obj.metadata
            
            return {
                "status": "success",
                "provider": "s3",
                "bucket": self.bucket_name,
                "file_path": target_path,
                "metadata": metadata
            }
        except Exception as e:
            self.logger.error(f"Error uploading file to S3: {str(e)}")
            return {"status": "error", "provider": "s3", "error": str(e)}
    
    async def download_file(self, cloud_path: str, local_path: str) -> Dict[str, Any]:
        """Download a file from S3 storage"""
        try:
            # Create target directory if it doesn't exist
            target_dir = os.path.dirname(local_path)
            os.makedirs(target_dir, exist_ok=True)
            
            # Download file from S3
            self.client.download_file(
                self.bucket_name,
                cloud_path,
                local_path
            )
            
            # Get file metadata
            file_stats = os.stat(local_path)
            
            return {
                "status": "success",
                "provider": "s3",
                "bucket": self.bucket_name,
                "file_path": local_path,
                "size": file_stats.st_size,
                "last_modified": datetime.fromtimestamp(file_stats.st_mtime).isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error downloading file from S3: {str(e)}")
            return {"status": "error", "provider": "s3", "error": str(e)}
    
    async def list_files(self, path: str = "") -> List[Dict[str, Any]]:
        """List files in a directory in S3 storage"""
        try:
            # List objects in S3 bucket with prefix
            response = self.client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=path
            )
            
            files = []
            if 'Contents' in response:
                for item in response['Contents']:
                    # Skip the directory placeholder itself
                    if item['Key'] == path:
                        continue
                    
                    is_dir = item['Key'].endswith('/')
                    files.append({
                        "name": os.path.basename(item['Key']),
                        "path": item['Key'],
                        "size": item['Size'],
                        "last_modified": item['LastModified'].isoformat(),
                        "is_dir": is_dir
                    })
            
            return files
        except Exception as e:
            self.logger.error(f"Error listing files in S3: {str(e)}")
            return []
    
    async def delete_file(self, path: str) -> Dict[str, Any]:
        """Delete a file from S3 storage"""
        try:
            # Delete object from S3
            self.client.delete_object(
                Bucket=self.bucket_name,
                Key=path
            )
            
            return {
                "status": "success",
                "provider": "s3",
                "bucket": self.bucket_name,
                "deleted_path": path
            }
        except Exception as e:
            self.logger.error(f"Error deleting file from S3: {str(e)}")
            return {"status": "error", "provider": "s3", "error": str(e)}
    
    async def get_file_metadata(self, path: str) -> Dict[str, Any]:
        """Get metadata for a file in S3 storage"""
        try:
            # Get object metadata from S3
            response = self.client.head_object(
                Bucket=self.bucket_name,
                Key=path
            )
            
            return {
                "status": "success",
                "provider": "s3",
                "bucket": self.bucket_name,
                "file_path": path,
                "size": response['ContentLength'],
                "last_modified": response['LastModified'].isoformat(),
                "metadata": response.get('Metadata', {})
            }
        except Exception as e:
            self.logger.error(f"Error getting file metadata from S3: {str(e)}")
            return {"status": "error", "provider": "s3", "error": str(e)}


# Factory function to create cloud provider based on configuration
def create_cloud_provider(provider_type: str, config: Dict[str, Any] = None) -> BaseCloudProvider:
    """Create a cloud provider based on the provider type"""
    if provider_type.lower() == "local":
        return LocalStorageProvider(config)
    elif provider_type.lower() == "s3":
        return S3CloudProvider(config)
    else:
        raise ValueError(f"Unsupported cloud provider type: {provider_type}")
