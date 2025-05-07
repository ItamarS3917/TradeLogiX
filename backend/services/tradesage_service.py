# File: backend/services/tradesage_service.py
# Purpose: Service for handling TradeSage AI assistant functionality

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from ..db.repository import TradeRepository, UserRepository
from ..mcp.servers.ai_server import get_ai_client

class TradeSageService:
    """
    Service for the TradeSage AI assistant functionality
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.trade_repository = TradeRepository(db)
        self.user_repository = UserRepository(db)
        
    async def analyze_trading_patterns(self, user_id: int, date_range: Optional[Dict[str, datetime]] = None) -> Dict[str, Any]:
        """
        Analyze trading patterns for a user
        
        Args:
            user_id: ID of the user
            date_range: Optional date range for analysis
            
        Returns:
            Dictionary containing analysis results
        """
        # Get user trades
        trades = self.trade_repository.get_by_user(user_id, date_range)
        
        if not trades:
            return {
                "message": "Not enough trade data for analysis",
                "insights": []
            }
        
        # Get AI client from MCP
        ai_client = await get_ai_client()
        
        # Prepare data for analysis
        trade_data = [self._extract_trade_data(trade) for trade in trades]
        
        # Get user preferences for personalization
        user = self.user_repository.get_by_id(user_id)
        user_preferences = user.preferences if user else {}
        
        # Send data to AI for analysis
        analysis_result = await ai_client.analyze_trading_patterns(
            trade_data=trade_data,
            user_preferences=user_preferences
        )
        
        return analysis_result
    
    async def get_performance_insights(self, user_id: int) -> Dict[str, Any]:
        """
        Get performance insights for a user
        
        Args:
            user_id: ID of the user
            
        Returns:
            Dictionary containing performance insights
        """
        # Get user trades for last 30 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        date_range = {"start": start_date, "end": end_date}
        
        trades = self.trade_repository.get_by_user(user_id, date_range)
        
        # Get AI client from MCP
        ai_client = await get_ai_client()
        
        # Prepare data for analysis
        trade_data = [self._extract_trade_data(trade) for trade in trades]
        
        # Get performance insights from AI
        insights = await ai_client.get_performance_insights(trade_data)
        
        return insights
    
    async def generate_improvement_plan(self, user_id: int) -> Dict[str, Any]:
        """
        Generate an improvement plan for a user
        
        Args:
            user_id: ID of the user
            
        Returns:
            Dictionary containing improvement plan
        """
        # Get user trades
        trades = self.trade_repository.get_by_user(user_id)
        
        # Get AI client from MCP
        ai_client = await get_ai_client()
        
        # Prepare data for analysis
        trade_data = [self._extract_trade_data(trade) for trade in trades]
        
        # Get user goals and preferences
        user = self.user_repository.get_by_id(user_id)
        user_goals = user.goals if user else []
        user_preferences = user.preferences if user else {}
        
        # Generate improvement plan from AI
        improvement_plan = await ai_client.generate_improvement_plan(
            trade_data=trade_data,
            user_goals=user_goals,
            user_preferences=user_preferences
        )
        
        return improvement_plan
    
    async def answer_trading_question(self, user_id: int, question: str) -> Dict[str, Any]:
        """
        Get an answer to a trading-related question
        
        Args:
            user_id: ID of the user
            question: The user's question
            
        Returns:
            Dictionary containing the answer
        """
        # Get recent user trades for context
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        date_range = {"start": start_date, "end": end_date}
        
        trades = self.trade_repository.get_by_user(user_id, date_range)
        
        # Get AI client from MCP
        ai_client = await get_ai_client()
        
        # Prepare data for context
        trade_data = [self._extract_trade_data(trade) for trade in trades]
        
        # Get answer from AI
        answer = await ai_client.answer_question(
            question=question,
            trade_data=trade_data,
            user_id=user_id
        )
        
        return answer
    
    def _extract_trade_data(self, trade) -> Dict[str, Any]:
        """
        Extract relevant data from a trade object for AI analysis
        
        Args:
            trade: Trade object
            
        Returns:
            Dictionary containing extracted trade data
        """
        return {
            "id": trade.id,
            "symbol": trade.symbol,
            "setup_type": trade.setup_type,
            "entry_price": trade.entry_price,
            "exit_price": trade.exit_price,
            "position_size": trade.position_size,
            "entry_time": trade.entry_time.isoformat() if trade.entry_time else None,
            "exit_time": trade.exit_time.isoformat() if trade.exit_time else None,
            "planned_risk_reward": trade.planned_risk_reward,
            "actual_risk_reward": trade.actual_risk_reward,
            "outcome": trade.outcome,
            "profit_loss": trade.profit_loss,
            "emotional_state": trade.emotional_state,
            "plan_adherence": trade.plan_adherence,
            "notes": trade.notes,
            "tags": trade.tags,
            "created_at": trade.created_at.isoformat() if trade.created_at else None,
        }
    
    # TODO: Implement pattern detection methods
    # TODO: Implement emotional analysis methods
    # TODO: Implement plan adherence analysis methods
    # TODO: Implement goal tracking methods