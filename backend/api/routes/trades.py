# File: backend/api/routes/trades.py
# Purpose: API endpoints for trade management

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

# Import database session
from ...db.database import get_db

# Import services
from ...services.trade_service import TradeService

# Import schemas (will implement later)
from ...db.schemas import TradeCreate, TradeResponse, TradeUpdate, TradeStatistics

router = APIRouter()

@router.post("/", response_model=TradeResponse, status_code=status.HTTP_201_CREATED)
async def create_trade(trade: TradeCreate, db: Session = Depends(get_db)):
    """
    Create a new trade entry
    """
    trade_service = TradeService(db)
    try:
        return trade_service.create_trade(trade)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

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
    trade = trade_service.update_trade(trade_id, trade_update)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade

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