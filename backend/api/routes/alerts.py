# File: backend/api/routes/alerts.py
# Purpose: API routes for managing trading alerts

from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import json

from ...db.database import get_db
from ...models.alert import Alert
from ...services.alert_service import (
    create_alert,
    update_alert,
    delete_alert,
    get_alert_by_id,
    get_alerts,
    check_alerts,
    mark_alert_as_read
)
from ...mcp.mcp_client import get_mcp_client

router = APIRouter(
    prefix="/alerts",
    tags=["alerts"],
    responses={404: {"description": "Alert not found"}}
)

@router.post("/", response_model=Dict[str, Any])
async def create_alert_route(
    alert_data: Dict[str, Any],
    db: Session = Depends(get_db),
    mcp_client = Depends(get_mcp_client)
):
    """
    Create a new alert
    """
    try:
        # Try using MCP alerts server if available
        if mcp_client and hasattr(mcp_client, 'alerts'):
            try:
                # Create alert through MCP
                mcp_alert = await mcp_client.alerts.create_alert(alert_data)
                return {
                    "id": mcp_alert.get("id"),
                    "message": "Alert created successfully through MCP",
                    "alert": mcp_alert
                }
            except Exception as e:
                # Fall back to regular implementation
                pass
        
        # Create the alert
        alert = create_alert(db, alert_data)
        
        return {
            "id": alert.id,
            "message": "Alert created successfully",
            "alert": {
                "id": alert.id,
                "user_id": alert.user_id,
                "type": alert.type,
                "message": alert.message,
                "status": alert.status,
                "created_at": alert.created_at
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{alert_id}", response_model=Dict[str, Any])
async def get_alert(
    alert_id: int = Path(..., description="ID of the alert to get"),
    db: Session = Depends(get_db)
):
    """
    Get an alert by ID
    """
    alert = get_alert_by_id(db, alert_id)
    
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert with ID {alert_id} not found")
    
    # Convert to dict
    alert_dict = {
        "id": alert.id,
        "user_id": alert.user_id,
        "type": alert.type,
        "message": alert.message,
        "details": json.loads(alert.details) if alert.details else {},
        "status": alert.status,
        "created_at": alert.created_at,
        "triggered_at": alert.triggered_at,
        "read_at": alert.read_at
    }
    
    return alert_dict

@router.put("/{alert_id}", response_model=Dict[str, Any])
async def update_alert_route(
    alert_data: Dict[str, Any],
    alert_id: int = Path(..., description="ID of the alert to update"),
    db: Session = Depends(get_db)
):
    """
    Update an alert
    """
    try:
        # Check if alert exists
        existing_alert = get_alert_by_id(db, alert_id)
        
        if not existing_alert:
            raise HTTPException(status_code=404, detail=f"Alert with ID {alert_id} not found")
        
        # Update the alert
        updated_alert = update_alert(db, alert_id, alert_data)
        
        return {
            "id": updated_alert.id,
            "message": "Alert updated successfully"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{alert_id}", response_model=Dict[str, Any])
async def delete_alert_route(
    alert_id: int = Path(..., description="ID of the alert to delete"),
    db: Session = Depends(get_db)
):
    """
    Delete an alert
    """
    try:
        # Check if alert exists
        existing_alert = get_alert_by_id(db, alert_id)
        
        if not existing_alert:
            raise HTTPException(status_code=404, detail=f"Alert with ID {alert_id} not found")
        
        # Delete the alert
        delete_alert(db, alert_id)
        
        return {
            "id": alert_id,
            "message": "Alert deleted successfully"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=Dict[str, Any])
async def get_alerts_route(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status (active, triggered, read)"),
    type: Optional[str] = Query(None, description="Filter by alert type"),
    db: Session = Depends(get_db)
):
    """
    Get alerts with pagination and filters
    """
    try:
        # Get alerts
        alerts_list, total, pagination = get_alerts(
            db,
            page=page,
            limit=limit,
            status=status,
            type=type
        )
        
        # Convert alerts to dict
        alerts_dicts = []
        for alert in alerts_list:
            alert_dict = {
                "id": alert.id,
                "user_id": alert.user_id,
                "type": alert.type,
                "message": alert.message,
                "status": alert.status,
                "created_at": alert.created_at,
                "triggered_at": alert.triggered_at,
                "read_at": alert.read_at
            }
            alerts_dicts.append(alert_dict)
        
        return {
            "alerts": alerts_dicts,
            "total": total,
            "pagination": pagination
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/check", response_model=Dict[str, Any])
async def check_alerts_route(
    db: Session = Depends(get_db),
    mcp_client = Depends(get_mcp_client)
):
    """
    Check and process alerts
    """
    try:
        # Try using MCP alerts server if available
        if mcp_client and hasattr(mcp_client, 'alerts'):
            try:
                # Check alerts through MCP
                mcp_result = await mcp_client.alerts.check_alerts()
                return mcp_result
            except Exception as e:
                # Fall back to regular implementation
                pass
        
        # Check alerts
        triggered = check_alerts(db)
        
        return {
            "triggered": triggered,
            "message": f"Checked alerts: {len(triggered)} triggered"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{alert_id}/read", response_model=Dict[str, Any])
async def mark_as_read_route(
    alert_id: int = Path(..., description="ID of the alert to mark as read"),
    db: Session = Depends(get_db)
):
    """
    Mark an alert as read
    """
    try:
        # Check if alert exists
        existing_alert = get_alert_by_id(db, alert_id)
        
        if not existing_alert:
            raise HTTPException(status_code=404, detail=f"Alert with ID {alert_id} not found")
        
        # Mark alert as read
        mark_alert_as_read(db, alert_id)
        
        return {
            "id": alert_id,
            "message": "Alert marked as read"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
