# File: backend/api/routes/trades.py
# Purpose: API endpoints for trade management

from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import date
import logging

# Import database session
from ...db.database import get_db

# Import services
from ...services.trade_service import *

# Import schemas (will implement later)
from ...db.schemas import TradeCreate, TradeResponse, TradeUpdate, TradeStatistics

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=TradeResponse, status_code=status.HTTP_201_CREATED)
async def create_trade(trade: TradeCreate, db: Session = Depends(get_db)):
    """
    Create a new trade entry
    """
    trade_service = TradeService(db)
    try:
        # Log the trade data for debugging
        logger.info(f"Creating trade with screenshots: {trade.screenshots}")
        logger.info(f"Creating trade with tags: {trade.tags}")
        
        created_trade = trade_service.create_trade(trade)
        logger.info(f"Trade created with ID: {created_trade.id}, screenshots: {created_trade.screenshots}")
        return created_trade
    except ValueError as e:
        logger.error(f"Error creating trade: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error creating trade: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("/", response_model=List[TradeResponse])
async def get_trades(
    skip: int = 0, 
    limit: int = 100, 
    user_id: Optional[int] = None,
    symbol: Optional[str] = None,
    setup_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    outcome: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all trades with optional filtering
    """
    trade_service = TradeService(db)
    return trade_service.get_trades(
        skip=skip, 
        limit=limit,
        user_id=user_id,
        symbol=symbol,
        setup_type=setup_type,
        start_date=start_date,
        end_date=end_date,
        outcome=outcome
    )

@router.get("/{trade_id}", response_model=TradeResponse)
async def get_trade(trade_id: int, db: Session = Depends(get_db)):
    """
    Get trade by ID
    """
    trade_service = TradeService(db)
    trade = trade_service.get_trade(trade_id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade

@router.put("/{trade_id}", response_model=TradeResponse)
async def update_trade(trade_id: int, trade_update: TradeUpdate, db: Session = Depends(get_db)):
    """
    Update trade
    """
    trade_service = TradeService(db)
    try:
        # Log the trade data for debugging
        logger.info(f"Updating trade {trade_id} with screenshots: {trade_update.screenshots}")
        logger.info(f"Updating trade {trade_id} with tags: {trade_update.tags}")
        
        trade = trade_service.update_trade(trade_id, trade_update)
        if not trade:
            raise HTTPException(status_code=404, detail="Trade not found")
            
        logger.info(f"Trade updated with ID: {trade.id}, screenshots: {trade.screenshots}")
        return trade
    except Exception as e:
        logger.error(f"Error updating trade: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.delete("/{trade_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trade(trade_id: int, db: Session = Depends(get_db)):
    """
    Delete trade
    """
    trade_service = TradeService(db)
    if not trade_service.delete_trade(trade_id):
        raise HTTPException(status_code=404, detail="Trade not found")
    return None

@router.get("/statistics/{user_id}", response_model=TradeStatistics)
async def get_trade_statistics(
    user_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Get trade statistics for a user
    """
    trade_service = TradeService(db)
    return trade_service.get_statistics(
        user_id=user_id,
        start_date=start_date,
        end_date=end_date
    )

# TODO: Add trade analysis endpoints
# TODO: Add trade screenshot upload endpoint
# TODO: Add trade export/import endpoints