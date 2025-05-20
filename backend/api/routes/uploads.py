from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
import os
import shutil
from typing import List
import uuid
from datetime import datetime

# Import database session
from ...db.database import get_db

# Root directory for file storage
STATIC_DIR = "static"
SCREENSHOT_DIR = os.path.join(STATIC_DIR, "screenshots")
CLOUD_STORAGE_DIR = "cloud_storage"

# Ensure directories exist
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
os.makedirs(CLOUD_STORAGE_DIR, exist_ok=True)

router = APIRouter()

@router.post("/screenshot", response_model=dict)
async def upload_screenshot(
    trade_id: int = None,
    file: UploadFile = File(...)
):
    """
    Upload a screenshot for a trade
    
    Args:
        trade_id: Trade ID (optional)
        file: Screenshot file
        
    Returns:
        Dict with file URL
    """
    try:
        # Create a directory for the trade if provided
        if trade_id:
            trade_dir = os.path.join(SCREENSHOT_DIR, str(trade_id))
            os.makedirs(trade_dir, exist_ok=True)
            
            # Save file
            file_ext = os.path.splitext(file.filename)[1]
            filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(trade_dir, filename)
            
            # Ensure the directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Save the file
            with open(file_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
        else:
            # Save to general screenshots directory with date prefix
            date_prefix = datetime.now().strftime("%Y%m%d")
            file_ext = os.path.splitext(file.filename)[1]
            filename = f"{date_prefix}_{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(SCREENSHOT_DIR, filename)
            
            # Ensure the directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Save the file
            with open(file_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
        
        # Return file URL
        file_url = f"/{file_path}"
        
        return {"url": file_url, "filename": filename}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@router.post("/multiple", response_model=List[dict])
async def upload_multiple_files(
    files: List[UploadFile] = File(...)
):
    """
    Upload multiple files
    
    Args:
        files: List of files
        
    Returns:
        List of file URLs
    """
    
    results = []
    
    try:
        # Generate unique subfolder based on timestamp
        subfolder = datetime.now().strftime("%Y%m%d%H%M%S")
        folder_path = os.path.join(CLOUD_STORAGE_DIR, subfolder)
        os.makedirs(folder_path, exist_ok=True)
        
        for file in files:
            # Save file with original name
            file_path = os.path.join(folder_path, file.filename)
            
            with open(file_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
            
            # Add to results
            results.append({
                "url": f"/{file_path}",
                "filename": file.filename,
                "size": os.path.getsize(file_path)
            })
        
        return results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading files: {str(e)}")

@router.delete("/screenshot/{filename}")
async def delete_screenshot(filename: str):
    """
    Delete a screenshot
    
    Args:
        filename: Filename to delete
        
    Returns:
        Success message
    """
    
    try:
        # Search for the file in the screenshots directory
        for root, dirs, files in os.walk(SCREENSHOT_DIR):
            if filename in files:
                file_path = os.path.join(root, filename)
                os.remove(file_path)
                return {"message": "File deleted successfully"}
        
        # If we get here, file was not found
        raise HTTPException(status_code=404, detail="File not found")
    
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")
