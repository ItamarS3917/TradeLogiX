# File: backend/api/routes/plans.py
# Purpose: API routes for daily trading plans

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session

from ...db.database import get_db
from ...db.schemas import DailyPlanCreate, DailyPlanUpdate, DailyPlanResponse
from ...services.plan_service import PlanService

# Create router
router = APIRouter()

@router.post("/", response_model=DailyPlanResponse)
def create_plan(
    plan: DailyPlanCreate,
    db: Session = Depends(get_db)
):
    """Create a new daily trading plan"""
    try:
        plan_service = PlanService(db)
        return plan_service.create_plan(plan)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating plan: {str(e)}")

@router.get("/{plan_id}", response_model=DailyPlanResponse)
def get_plan(
    plan_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific daily trading plan by ID"""
    try:
        plan_service = PlanService(db)
        plan = plan_service.get_plan(plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        return plan
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving plan: {str(e)}")

@router.get("/date/{date}", response_model=DailyPlanResponse)
def get_plan_by_date(
    date: str,
    db: Session = Depends(get_db)
):
    """Get the daily trading plan for a specific date"""
    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        plan_service = PlanService(db)
        plan = plan_service.get_plan_by_date(date_obj)
        if not plan:
            raise HTTPException(status_code=404, detail=f"No plan found for {date}")
        return plan
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving plan: {str(e)}")

@router.get("/", response_model=List[DailyPlanResponse])
def get_plans(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get a list of trading plans with optional date filtering"""
    try:
        # Parse dates if provided
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date() if start_date else None
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else None
        
        plan_service = PlanService(db)
        return plan_service.get_plans(
            skip=skip,
            limit=limit,
            start_date=start_date_obj,
            end_date=end_date_obj
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving plans: {str(e)}")

@router.put("/{plan_id}", response_model=DailyPlanResponse)
def update_plan(
    plan_id: int,
    plan: DailyPlanUpdate,
    db: Session = Depends(get_db)
):
    """Update a specific daily trading plan"""
    try:
        plan_service = PlanService(db)
        updated_plan = plan_service.update_plan(plan_id, plan)
        if not updated_plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        return updated_plan
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating plan: {str(e)}")

@router.delete("/{plan_id}")
def delete_plan(
    plan_id: int,
    db: Session = Depends(get_db)
):
    """Delete a specific daily trading plan"""
    try:
        plan_service = PlanService(db)
        result = plan_service.delete_plan(plan_id)
        if not result:
            raise HTTPException(status_code=404, detail="Plan not found")
        return {"message": "Plan deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting plan: {str(e)}")
