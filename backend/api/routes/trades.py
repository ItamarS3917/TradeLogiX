# File: backend/api/routes/trades.py
# Purpose: API endpoints for trade management (Firebase-only)

from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from typing import List, Optional, Dict, Any
from datetime import date, datetime
import logging

# Import Firebase repository
from ...db.firebase_repository import get_firebase_repository

# Import Pydantic models for request/response validation
from pydantic import BaseModel, Field
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# ============= PYDANTIC MODELS =============

class TradeCreate(BaseModel):
    user_id: str
    symbol: str
    entry_price: Optional[float] = None
    exit_price: Optional[float] = None
    position_size: Optional[float] = None
    entry_time: datetime
    exit_time: Optional[datetime] = None
    setup_type: Optional[str] = None
    outcome: str  # Win, Loss, Breakeven
    profit_loss: Optional[float] = None
    planned_risk_reward: Optional[float] = None
    actual_risk_reward: Optional[float] = None
    emotional_state: Optional[str] = None
    plan_adherence: Optional[str] = None
    screenshots: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    notes: Optional[str] = None

class TradeUpdate(BaseModel):
    symbol: Optional[str] = None
    entry_price: Optional[float] = None
    exit_price: Optional[float] = None
    position_size: Optional[float] = None
    entry_time: Optional[datetime] = None
    exit_time: Optional[datetime] = None
    setup_type: Optional[str] = None
    outcome: Optional[str] = None
    profit_loss: Optional[float] = None
    planned_risk_reward: Optional[float] = None
    actual_risk_reward: Optional[float] = None
    emotional_state: Optional[str] = None
    plan_adherence: Optional[str] = None
    screenshots: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None

class TradeResponse(BaseModel):
    id: str
    user_id: str
    symbol: str
    entry_price: Optional[float] = None
    exit_price: Optional[float] = None
    position_size: Optional[float] = None
    entry_time: datetime
    exit_time: Optional[datetime] = None
    setup_type: Optional[str] = None
    outcome: str
    profit_loss: Optional[float] = None
    planned_risk_reward: Optional[float] = None
    actual_risk_reward: Optional[float] = None
    emotional_state: Optional[str] = None
    plan_adherence: Optional[str] = None
    screenshots: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class TradeStatistics(BaseModel):
    total_trades: int
    win_rate: float
    total_pnl: float
    average_win: float
    average_loss: float
    wins: int
    losses: int

# ============= API ENDPOINTS =============

@router.post("/", response_model=TradeResponse, status_code=status.HTTP_201_CREATED)
async def create_trade(trade: TradeCreate):
    """
    Create a new trade entry
    """
    try:
        repo = get_firebase_repository()
        
        # Convert to dict and create trade
        trade_data = trade.dict()
        trade_id = repo.create_trade(trade_data)
        
        # Get the created trade
        created_trade = repo.get_trade(trade_id)
        if not created_trade:
            raise HTTPException(status_code=500, detail="Failed to retrieve created trade")
        
        logger.info(f"Trade created with ID: {trade_id}")
        return TradeResponse(**created_trade)
        
    except ValueError as e:
        logger.error(f"Error creating trade: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error creating trade: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("/user/{user_id}", response_model=List[TradeResponse])
async def get_user_trades(
    user_id: str,
    limit: Optional[int] = Query(100, description="Maximum number of trades to return")
):
    """
    Get all trades for a specific user
    """
    try:
        repo = get_firebase_repository()
        trades = repo.get_user_trades(user_id, limit)
        return [TradeResponse(**trade) for trade in trades]
    except Exception as e:
        logger.error(f"Error getting user trades: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{trade_id}", response_model=TradeResponse)
async def get_trade(trade_id: str):
    """
    Get trade by ID
    """
    try:
        repo = get_firebase_repository()
        trade = repo.get_trade(trade_id)
        if not trade:
            raise HTTPException(status_code=404, detail="Trade not found")
        return TradeResponse(**trade)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting trade: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{trade_id}", response_model=TradeResponse)
async def update_trade(trade_id: str, trade_update: TradeUpdate):
    """
    Update trade
    """
    try:
        repo = get_firebase_repository()
        
        # Check if trade exists
        existing_trade = repo.get_trade(trade_id)
        if not existing_trade:
            raise HTTPException(status_code=404, detail="Trade not found")
        
        # Update only provided fields
        update_data = {}
        for field, value in trade_update.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        if update_data:
            success = repo.update_trade(trade_id, update_data)
            if not success:
                raise HTTPException(status_code=500, detail="Failed to update trade")
        
        # Get updated trade
        updated_trade = repo.get_trade(trade_id)
        logger.info(f"Trade updated with ID: {trade_id}")
        return TradeResponse(**updated_trade)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating trade: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.delete("/{trade_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trade(trade_id: str):
    """
    Delete trade
    """
    try:
        repo = get_firebase_repository()
        
        # Check if trade exists
        existing_trade = repo.get_trade(trade_id)
        if not existing_trade:
            raise HTTPException(status_code=404, detail="Trade not found")
        
        success = repo.delete_trade(trade_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete trade")
        
        logger.info(f"Trade deleted with ID: {trade_id}")
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting trade: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/statistics/{user_id}", response_model=TradeStatistics)
async def get_trade_statistics(
    user_id: str,
    year: Optional[int] = Query(None, description="Year for statistics"),
    month: Optional[int] = Query(None, description="Month for statistics (1-12)")
):
    """
    Get trade statistics for a user
    """
    try:
        repo = get_firebase_repository()
        
        if year and month:
            # Get monthly statistics
            stats = repo.get_monthly_statistics(user_id, year, month)
        else:
            # Get overall statistics
            stats = repo.get_user_statistics(user_id)
        
        return TradeStatistics(**stats)
        
    except Exception as e:
        logger.error(f"Error getting trade statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}/date-range")
async def get_trades_by_date_range(
    user_id: str,
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)")
):
    """
    Get trades within a date range
    """
    try:
        repo = get_firebase_repository()
        
        # Convert dates to datetime
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        trades = repo.get_trades_by_date_range(user_id, start_datetime, end_datetime)
        return [TradeResponse(**trade) for trade in trades]
        
    except Exception as e:
        logger.error(f"Error getting trades by date range: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
