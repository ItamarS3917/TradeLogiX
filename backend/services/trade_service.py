# File: backend/services/trade_service.py
# Purpose: Trade management service

import logging
from typing import List, Optional, Dict, Any
from datetime import date, datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from ..db.repository import Repository
from ..models.trade import Trade, TradeOutcome
from ..db.schemas import TradeCreate, TradeUpdate, TradeStatistics
from ..mcp.mcp_client import get_trade_analysis_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TradeService:
    """Service for trade management operations"""
    
    def __init__(self, db: Session):
        """
        Initialize trade service
        
        Args:
            db (Session): Database session
        """
        self.db = db
        self.repository = Repository[Trade, TradeCreate, TradeUpdate](Trade, db)
        
        # Initialize MCP client
        try:
            self.trade_analysis_client = get_trade_analysis_client()
        except Exception as e:
            logger.warning(f"Failed to initialize trade analysis client: {str(e)}")
            self.trade_analysis_client = None
    
    def create_trade(self, trade_data: TradeCreate) -> Trade:
        """
        Create a new trade
        
        Args:
            trade_data (TradeCreate): Trade data
            
        Returns:
            Trade: Created trade
        """
        trade = self.repository.create(trade_data)
        
        # Analyze trade using MCP if available
        if self.trade_analysis_client:
            try:
                # Send trade to MCP for analysis
                analysis_result = self.trade_analysis_client.post(
                    "trades/analyze",
                    data={
                        "trade_id": trade.id,
                        "symbol": trade.symbol,
                        "setup_type": trade.setup_type,
                        "entry_price": trade.entry_price,
                        "exit_price": trade.exit_price,
                        "entry_time": trade.entry_time.isoformat(),
                        "exit_time": trade.exit_time.isoformat(),
                        "outcome": trade.outcome.value,
                        "profit_loss": trade.profit_loss
                    }
                )
                
                logger.info(f"Trade analysis result: {analysis_result}")
                
                # TODO: Update trade with analysis results if needed
            
            except Exception as e:
                logger.error(f"Error analyzing trade: {str(e)}")
        
        return trade
    
    def get_trade(self, trade_id: int) -> Optional[Trade]:
        """
        Get trade by ID
        
        Args:
            trade_id (int): Trade ID
            
        Returns:
            Optional[Trade]: Trade if found, None otherwise
        """
        return self.repository.get_by_id(trade_id)
    
    def get_trades(
        self,
        user_id: Optional[int] = None,
        symbol: Optional[str] = None,
        setup_type: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        outcome: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Trade]:
        """
        Get trades with filtering and pagination
        
        Args:
            user_id (Optional[int], optional): User ID filter. Defaults to None.
            symbol (Optional[str], optional): Symbol filter. Defaults to None.
            setup_type (Optional[str], optional): Setup type filter. Defaults to None.
            start_date (Optional[date], optional): Start date filter. Defaults to None.
            end_date (Optional[date], optional): End date filter. Defaults to None.
            outcome (Optional[str], optional): Outcome filter. Defaults to None.
            skip (int, optional): Number of trades to skip. Defaults to 0.
            limit (int, optional): Maximum number of trades to return. Defaults to 100.
            
        Returns:
            List[Trade]: List of trades
        """
        query = self.db.query(Trade)
        
        # Apply filters
        if user_id:
            query = query.filter(Trade.user_id == user_id)
        
        if symbol:
            query = query.filter(Trade.symbol == symbol)
        
        if setup_type:
            query = query.filter(Trade.setup_type == setup_type)
        
        if start_date:
            query = query.filter(Trade.entry_time >= datetime.combine(start_date, datetime.min.time()))
        
        if end_date:
            query = query.filter(Trade.entry_time <= datetime.combine(end_date, datetime.max.time()))
        
        if outcome:
            try:
                outcome_enum = TradeOutcome(outcome)
                query = query.filter(Trade.outcome == outcome_enum)
            except ValueError:
                logger.warning(f"Invalid outcome: {outcome}")
        
        # Order by entry time descending
        query = query.order_by(desc(Trade.entry_time))
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        return query.all()
    
    def update_trade(self, trade_id: int, trade_data: TradeUpdate) -> Optional[Trade]:
        """
        Update trade
        
        Args:
            trade_id (int): Trade ID
            trade_data (TradeUpdate): Trade data
            
        Returns:
            Optional[Trade]: Updated trade if found, None otherwise
        """
        return self.repository.update(trade_id, trade_data)
    
    def delete_trade(self, trade_id: int) -> bool:
        """
        Delete trade
        
        Args:
            trade_id (int): Trade ID
            
        Returns:
            bool: True if trade was deleted, False otherwise
        """
        return self.repository.delete(trade_id)
    
    def get_statistics(
        self,
        user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> TradeStatistics:
        """
        Get trade statistics
        
        Args:
            user_id (int): User ID
            start_date (Optional[date], optional): Start date. Defaults to None.
            end_date (Optional[date], optional): End date. Defaults to None.
            
        Returns:
            TradeStatistics: Trade statistics
        """
        # Default dates if not provided
        if not start_date:
            start_date = date(2000, 1, 1)  # Far in the past
        
        if not end_date:
            end_date = date(2100, 1, 1)  # Far in the future
        
        # Convert dates to datetime
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        # Get trades for the user within date range
        query = self.db.query(Trade).filter(
            Trade.user_id == user_id,
            Trade.entry_time >= start_datetime,
            Trade.entry_time <= end_datetime
        )
        
        trades = query.all()
        
        # Calculate statistics
        total_trades = len(trades)
        winning_trades = sum(1 for trade in trades if trade.outcome == TradeOutcome.WIN)
        losing_trades = sum(1 for trade in trades if trade.outcome == TradeOutcome.LOSS)
        
        # Avoid division by zero
        win_rate = (winning_trades / total_trades) if total_trades > 0 else 0
        
        # Calculate average win and loss
        winning_amounts = [trade.profit_loss for trade in trades if trade.outcome == TradeOutcome.WIN]
        losing_amounts = [trade.profit_loss for trade in trades if trade.outcome == TradeOutcome.LOSS]
        
        average_win = sum(winning_amounts) / len(winning_amounts) if winning_amounts else 0
        average_loss = sum(losing_amounts) / len(losing_amounts) if losing_amounts else 0
        
        # Calculate profit factor
        gross_profit = sum(winning_amounts)
        gross_loss = abs(sum(losing_amounts))
        profit_factor = gross_profit / gross_loss if gross_loss != 0 else float('inf')
        
        # Calculate largest win and loss
        largest_win = max(winning_amounts) if winning_amounts else 0
        largest_loss = min(losing_amounts) if losing_amounts else 0
        
        # Calculate net profit/loss
        net_profit_loss = sum(trade.profit_loss for trade in trades)
        
        # Calculate setup performance
        setup_performance = {}
        setup_types = set(trade.setup_type for trade in trades)
        
        for setup in setup_types:
            setup_trades = [trade for trade in trades if trade.setup_type == setup]
            setup_total = len(setup_trades)
            setup_wins = sum(1 for trade in setup_trades if trade.outcome == TradeOutcome.WIN)
            setup_profit = sum(trade.profit_loss for trade in setup_trades)
            
            setup_performance[setup] = {
                "total_trades": setup_total,
                "winning_trades": setup_wins,
                "win_rate": (setup_wins / setup_total) if setup_total > 0 else 0,
                "profit_loss": setup_profit
            }
        
        # Calculate emotional state performance
        emotional_state_performance = {}
        emotional_states = set(trade.emotional_state.value for trade in trades)
        
        for state in emotional_states:
            state_trades = [trade for trade in trades if trade.emotional_state.value == state]
            state_total = len(state_trades)
            state_wins = sum(1 for trade in state_trades if trade.outcome == TradeOutcome.WIN)
            state_profit = sum(trade.profit_loss for trade in state_trades)
            
            emotional_state_performance[state] = {
                "total_trades": state_total,
                "winning_trades": state_wins,
                "win_rate": (state_wins / state_total) if state_total > 0 else 0,
                "profit_loss": state_profit
            }
        
        # Calculate plan adherence performance
        plan_adherence_performance = {}
        adherence_types = set(trade.plan_adherence.value for trade in trades)
        
        for adherence in adherence_types:
            adherence_trades = [trade for trade in trades if trade.plan_adherence.value == adherence]
            adherence_total = len(adherence_trades)
            adherence_wins = sum(1 for trade in adherence_trades if trade.outcome == TradeOutcome.WIN)
            adherence_profit = sum(trade.profit_loss for trade in adherence_trades)
            
            plan_adherence_performance[adherence] = {
                "total_trades": adherence_total,
                "winning_trades": adherence_wins,
                "win_rate": (adherence_wins / adherence_total) if adherence_total > 0 else 0,
                "profit_loss": adherence_profit
            }
        
        # Return statistics
        return TradeStatistics(
            total_trades=total_trades,
            winning_trades=winning_trades,
            losing_trades=losing_trades,
            win_rate=win_rate,
            profit_factor=profit_factor,
            average_win=average_win,
            average_loss=average_loss,
            largest_win=largest_win,
            largest_loss=largest_loss,
            net_profit_loss=net_profit_loss,
            setup_performance=setup_performance,
            emotional_state_performance=emotional_state_performance,
            plan_adherence_performance=plan_adherence_performance
        )
    
    def get_trades_by_date_range(
        self,
        user_id: int,
        start_date: date,
        end_date: date
    ) -> List[Trade]:
        """
        Get trades by date range
        
        Args:
            user_id (int): User ID
            start_date (date): Start date
            end_date (date): End date
            
        Returns:
            List[Trade]: List of trades
        """
        # Convert dates to datetime
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        
        # Get trades
        return self.db.query(Trade).filter(
            Trade.user_id == user_id,
            Trade.entry_time >= start_datetime,
            Trade.entry_time <= end_datetime
        ).order_by(Trade.entry_time).all()
    
    def get_trades_by_symbol(self, user_id: int, symbol: str) -> List[Trade]:
        """
        Get trades by symbol
        
        Args:
            user_id (int): User ID
            symbol (str): Symbol
            
        Returns:
            List[Trade]: List of trades
        """
        return self.db.query(Trade).filter(
            Trade.user_id == user_id,
            Trade.symbol == symbol
        ).order_by(Trade.entry_time).all()
    
    def get_trades_by_setup(self, user_id: int, setup_type: str) -> List[Trade]:
        """
        Get trades by setup type
        
        Args:
            user_id (int): User ID
            setup_type (str): Setup type
            
        Returns:
            List[Trade]: List of trades
        """
        return self.db.query(Trade).filter(
            Trade.user_id == user_id,
            Trade.setup_type == setup_type
        ).order_by(Trade.entry_time).all()
