# File: backend/services/plan_service.py
# Purpose: Service layer for daily trading plans

from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..db.schemas import DailyPlanCreate, DailyPlanUpdate, DailyPlanResponse
from ..models.daily_plan import DailyPlan

class PlanService:
    """Service for managing daily trading plans"""
    
    def __init__(self, db: Session):
        """
        Initialize the service with a database session
        
        Args:
            db (Session): SQLAlchemy database session
        """
        self.db = db
    
    def create_plan(self, plan: DailyPlanCreate) -> DailyPlanResponse:
        """
        Create a new daily trading plan
        
        Args:
            plan (DailyPlanCreate): Plan data
            
        Returns:
            DailyPlanResponse: Created plan
        """
        # Check if a plan already exists for this date and user
        existing_plan = self.db.query(DailyPlan).filter(
            DailyPlan.user_id == plan.user_id,
            DailyPlan.date == plan.date
        ).first()
        
        if existing_plan:
            # Update existing plan instead of creating a new one
            for key, value in plan.dict().items():
                setattr(existing_plan, key, value)
            self.db.commit()
            self.db.refresh(existing_plan)
            return existing_plan
        
        # Create new plan
        db_plan = DailyPlan(**plan.dict())
        self.db.add(db_plan)
        self.db.commit()
        self.db.refresh(db_plan)
        return db_plan
    
    def get_plan(self, plan_id: int) -> Optional[DailyPlanResponse]:
        """
        Get a plan by ID
        
        Args:
            plan_id (int): Plan ID
            
        Returns:
            Optional[DailyPlanResponse]: Plan if found, None otherwise
        """
        return self.db.query(DailyPlan).filter(DailyPlan.id == plan_id).first()
    
    def get_plan_by_date(self, date_obj: date, user_id: Optional[int] = None) -> Optional[DailyPlanResponse]:
        """
        Get a plan by date
        
        Args:
            date_obj (date): Date to find plan for
            user_id (Optional[int], optional): User ID to filter by. Defaults to None.
            
        Returns:
            Optional[DailyPlanResponse]: Plan if found, None otherwise
        """
        query = self.db.query(DailyPlan).filter(DailyPlan.date == date_obj)
        
        if user_id:
            query = query.filter(DailyPlan.user_id == user_id)
            
        return query.first()
    
    def get_plans(
        self, 
        skip: int = 0, 
        limit: int = 100,
        user_id: Optional[int] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[DailyPlanResponse]:
        """
        Get a list of plans with optional filtering
        
        Args:
            skip (int, optional): Number of plans to skip. Defaults to 0.
            limit (int, optional): Maximum number of plans to return. Defaults to 100.
            user_id (Optional[int], optional): User ID to filter by. Defaults to None.
            start_date (Optional[date], optional): Start date for filtering. Defaults to None.
            end_date (Optional[date], optional): End date for filtering. Defaults to None.
            
        Returns:
            List[DailyPlanResponse]: List of plans
        """
        query = self.db.query(DailyPlan)
        
        # Apply filters if provided
        if user_id:
            query = query.filter(DailyPlan.user_id == user_id)
            
        if start_date:
            query = query.filter(DailyPlan.date >= start_date)
            
        if end_date:
            query = query.filter(DailyPlan.date <= end_date)
            
        # Order by date (newest first) and apply pagination
        return query.order_by(desc(DailyPlan.date)).offset(skip).limit(limit).all()
    
    def update_plan(self, plan_id: int, plan_update: DailyPlanUpdate) -> Optional[DailyPlanResponse]:
        """
        Update an existing plan
        
        Args:
            plan_id (int): Plan ID
            plan_update (DailyPlanUpdate): Updated plan data
            
        Returns:
            Optional[DailyPlanResponse]: Updated plan if found, None otherwise
        """
        db_plan = self.db.query(DailyPlan).filter(DailyPlan.id == plan_id).first()
        
        if not db_plan:
            return None
            
        # Update fields
        update_data = plan_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_plan, key, value)
            
        self.db.commit()
        self.db.refresh(db_plan)
        return db_plan
    
    def delete_plan(self, plan_id: int) -> bool:
        """
        Delete a plan
        
        Args:
            plan_id (int): Plan ID
            
        Returns:
            bool: True if deleted, False if not found
        """
        db_plan = self.db.query(DailyPlan).filter(DailyPlan.id == plan_id).first()
        
        if not db_plan:
            return False
            
        self.db.delete(db_plan)
        self.db.commit()
        return True
