from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path
from typing import Dict, Any, List, Optional

from ..utils.helpers import get_current_user
from ...services.cloud_service import CloudSyncManager

router = APIRouter()
cloud_sync_manager = None


async def get_cloud_sync_manager():
    """Get or initialize cloud sync manager"""
    global cloud_sync_manager
    
    if cloud_sync_manager is None:
        cloud_sync_manager = CloudSyncManager()
        await cloud_sync_manager.initialize()
    
    return cloud_sync_manager


@router.get("/status", response_model=Dict[str, Any])
async def get_sync_status(
    file_path: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user),
    sync_manager: CloudSyncManager = Depends(get_cloud_sync_manager)
):
    """Get synchronization status for a file or all files"""
    return await sync_manager.get_sync_status(file_path)


@router.post("/register", response_model=Dict[str, Any])
async def register_file(
    local_path: str = Body(...),
    remote_path: Optional[str] = Body(None),
    sync_direction: str = Body("bidirectional"),
    current_user: Dict[str, Any] = Depends(get_current_user),
    sync_manager: CloudSyncManager = Depends(get_cloud_sync_manager)
):
    """Register a file for synchronization"""
    return await sync_manager.register_file(local_path, remote_path, sync_direction)


@router.post("/unregister", response_model=Dict[str, Any])
async def unregister_file(
    local_path: str = Body(...),
    delete_remote: bool = Body(False),
    current_user: Dict[str, Any] = Depends(get_current_user),
    sync_manager: CloudSyncManager = Depends(get_cloud_sync_manager)
):
    """Unregister a file from synchronization"""
    return await sync_manager.unregister_file(local_path, delete_remote)


@router.post("/sync", response_model=Dict[str, Any])
async def sync_files(
    local_path: Optional[str] = Body(None),
    current_user: Dict[str, Any] = Depends(get_current_user),
    sync_manager: CloudSyncManager = Depends(get_cloud_sync_manager)
):
    """Synchronize files - all files or a specific file"""
    if local_path:
        return await sync_manager.sync_file(local_path)
    else:
        return await sync_manager.sync_all()


@router.get("/logs", response_model=Dict[str, Any])
async def get_sync_logs(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    current_user: Dict[str, Any] = Depends(get_current_user),
    sync_manager: CloudSyncManager = Depends(get_cloud_sync_manager)
):
    """Get synchronization logs"""
    return await sync_manager.get_sync_logs(limit, offset)


@router.post("/resolve-conflict", response_model=Dict[str, Any])
async def resolve_conflict(
    local_path: str = Body(...),
    resolution: str = Body(...),
    current_user: Dict[str, Any] = Depends(get_current_user),
    sync_manager: CloudSyncManager = Depends(get_cloud_sync_manager)
):
    """Resolve a synchronization conflict"""
    return await sync_manager.resolve_conflict(local_path, resolution)


@router.get("/config", response_model=Dict[str, Any])
async def get_config(
    current_user: Dict[str, Any] = Depends(get_current_user),
    sync_manager: CloudSyncManager = Depends(get_cloud_sync_manager)
):
    """Get synchronization configuration"""
    return await sync_manager.get_config()


@router.post("/config", response_model=Dict[str, Any])
async def update_config(
    config: Dict[str, Any] = Body(...),
    current_user: Dict[str, Any] = Depends(get_current_user),
    sync_manager: CloudSyncManager = Depends(get_cloud_sync_manager)
):
    """Update synchronization configuration"""
    return await sync_manager.update_config(config)
