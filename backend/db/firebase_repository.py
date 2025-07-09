# File: backend/db/firebase_repository.py
# Purpose: Firebase-based repository for Trading Journal entities

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from .firebase_database import get_firebase_db

logger = logging.getLogger(__name__)

class FirebaseRepository:
    """
    Firebase-based repository for Trading Journal entities
    """
    
    def __init__(self):
        self.db = get_firebase_db()
    
    # ============= USER OPERATIONS =============
    
    def create_user(self, user_data: Dict[str, Any]) -> str:
        """Create a new user"""
        try:
            # Add default fields
            user_data.update({
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'is_active': True
            })
            
            user_id = self.db.add_document('users', user_data, user_data.get('uid'))
            logger.info(f"Created user: {user_id}")
            return user_id
        except Exception as e:
            logger.error(f"Failed to create user: {str(e)}")
            raise
    
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        return self.db.get_document('users', user_id)
    
    def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user data"""
        return self.db.update_document('users', user_id, update_data)
    
    # ============= TRADE OPERATIONS =============
    
    def create_trade(self, trade_data: Dict[str, Any]) -> str:
        """Create a new trade"""
        try:
            # Validate required fields
            required_fields = ['user_id', 'symbol', 'entry_time', 'outcome']
            for field in required_fields:
                if field not in trade_data:
                    raise ValueError(f"Missing required field: {field}")
            
            # Convert entry_time to datetime if it's a string
            if isinstance(trade_data.get('entry_time'), str):
                trade_data['entry_time'] = datetime.fromisoformat(trade_data['entry_time'].replace('Z', '+00:00'))
            
            if isinstance(trade_data.get('exit_time'), str):
                trade_data['exit_time'] = datetime.fromisoformat(trade_data['exit_time'].replace('Z', '+00:00'))
            
            trade_id = self.db.add_document('trades', trade_data)
            logger.info(f"Created trade: {trade_id}")
            return trade_id
        except Exception as e:
            logger.error(f"Failed to create trade: {str(e)}")
            raise
    
    def get_trade(self, trade_id: str) -> Optional[Dict[str, Any]]:
        """Get trade by ID"""
        return self.db.get_document('trades', trade_id)
    
    def get_user_trades(self, user_id: str, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all trades for a user"""
        return self.db.get_user_documents('trades', user_id, 'entry_time', limit)
    
    def update_trade(self, trade_id: str, update_data: Dict[str, Any]) -> bool:
        """Update trade data"""
        # Convert datetime strings if present
        if isinstance(update_data.get('entry_time'), str):
            update_data['entry_time'] = datetime.fromisoformat(update_data['entry_time'].replace('Z', '+00:00'))
        
        if isinstance(update_data.get('exit_time'), str):
            update_data['exit_time'] = datetime.fromisoformat(update_data['exit_time'].replace('Z', '+00:00'))
        
        return self.db.update_document('trades', trade_id, update_data)
    
    def delete_trade(self, trade_id: str) -> bool:
        """Delete a trade"""
        return self.db.delete_document('trades', trade_id)
    
    def get_trades_by_date_range(self, user_id: str, start_date: datetime, end_date: datetime) -> List[Dict[str, Any]]:
        """Get trades within a date range"""
        filters = [
            ['user_id', '==', user_id],
            ['entry_time', '>=', start_date],
            ['entry_time', '<=', end_date]
        ]
        return self.db.query_documents('trades', filters, 'entry_time')
    
    # ============= DAILY PLAN OPERATIONS =============
    
    def create_plan(self, plan_data: Dict[str, Any]) -> str:
        """Create a new daily plan"""
        try:
            # Validate required fields
            required_fields = ['user_id', 'date']
            for field in required_fields:
                if field not in plan_data:
                    raise ValueError(f"Missing required field: {field}")
            
            # Convert date string to datetime if necessary
            if isinstance(plan_data.get('date'), str):
                plan_data['date'] = datetime.fromisoformat(plan_data['date'].replace('Z', '+00:00'))
            
            plan_id = self.db.add_document('plans', plan_data)
            logger.info(f"Created plan: {plan_id}")
            return plan_id
        except Exception as e:
            logger.error(f"Failed to create plan: {str(e)}")
            raise
    
    def get_plan(self, plan_id: str) -> Optional[Dict[str, Any]]:
        """Get plan by ID"""
        return self.db.get_document('plans', plan_id)
    
    def get_user_plans(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all plans for a user"""
        return self.db.get_user_documents('plans', user_id, 'date')
    
    def get_plan_by_date(self, user_id: str, date: datetime) -> Optional[Dict[str, Any]]:
        """Get plan for a specific date"""
        # Find plan for the specific date
        filters = [
            ['user_id', '==', user_id],
            ['date', '>=', date.replace(hour=0, minute=0, second=0, microsecond=0)],
            ['date', '<', date.replace(hour=23, minute=59, second=59, microsecond=999999)]
        ]
        plans = self.db.query_documents('plans', filters, limit=1)
        return plans[0] if plans else None
    
    def update_plan(self, plan_id: str, update_data: Dict[str, Any]) -> bool:
        """Update plan data"""
        if isinstance(update_data.get('date'), str):
            update_data['date'] = datetime.fromisoformat(update_data['date'].replace('Z', '+00:00'))
        
        return self.db.update_document('plans', plan_id, update_data)
    
    def delete_plan(self, plan_id: str) -> bool:
        """Delete a plan"""
        return self.db.delete_document('plans', plan_id)
    
    # ============= JOURNAL OPERATIONS =============
    
    def create_journal_entry(self, journal_data: Dict[str, Any]) -> str:
        """Create a new journal entry"""
        try:
            # Validate required fields
            required_fields = ['user_id', 'date']
            for field in required_fields:
                if field not in journal_data:
                    raise ValueError(f"Missing required field: {field}")
            
            # Convert date string to datetime if necessary
            if isinstance(journal_data.get('date'), str):
                journal_data['date'] = datetime.fromisoformat(journal_data['date'].replace('Z', '+00:00'))
            
            journal_id = self.db.add_document('journal_entries', journal_data)
            logger.info(f"Created journal entry: {journal_id}")
            return journal_id
        except Exception as e:
            logger.error(f"Failed to create journal entry: {str(e)}")
            raise
    
    def get_journal_entry(self, journal_id: str) -> Optional[Dict[str, Any]]:
        """Get journal entry by ID"""
        return self.db.get_document('journal_entries', journal_id)
    
    def get_user_journal_entries(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all journal entries for a user"""
        return self.db.get_user_documents('journal_entries', user_id, 'date')
    
    def update_journal_entry(self, journal_id: str, update_data: Dict[str, Any]) -> bool:
        """Update journal entry data"""
        if isinstance(update_data.get('date'), str):
            update_data['date'] = datetime.fromisoformat(update_data['date'].replace('Z', '+00:00'))
        
        return self.db.update_document('journal_entries', journal_id, update_data)
    
    def delete_journal_entry(self, journal_id: str) -> bool:
        """Delete a journal entry"""
        return self.db.delete_document('journal_entries', journal_id)
    
    # ============= ALERT OPERATIONS =============
    
    def create_alert(self, alert_data: Dict[str, Any]) -> str:
        """Create a new alert"""
        try:
            alert_id = self.db.add_document('alerts', alert_data)
            logger.info(f"Created alert: {alert_id}")
            return alert_id
        except Exception as e:
            logger.error(f"Failed to create alert: {str(e)}")
            raise
    
    def get_user_alerts(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all alerts for a user"""
        return self.db.get_user_documents('alerts', user_id, 'created_at')
    
    def update_alert(self, alert_id: str, update_data: Dict[str, Any]) -> bool:
        """Update alert data"""
        return self.db.update_document('alerts', alert_id, update_data)
    
    def delete_alert(self, alert_id: str) -> bool:
        """Delete an alert"""
        return self.db.delete_document('alerts', alert_id)
    
    # ============= STATISTICS OPERATIONS =============
    
    def get_user_statistics(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive statistics for a user"""
        return self.db.get_statistics(user_id)
    
    def get_monthly_statistics(self, user_id: str, year: int, month: int) -> Dict[str, Any]:
        """Get statistics for a specific month"""
        try:
            # Calculate date range for the month
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month + 1, 1)
            
            # Get trades for the month
            trades = self.get_trades_by_date_range(user_id, start_date, end_date)
            
            if not trades:
                return {
                    'total_trades': 0,
                    'win_rate': 0,
                    'total_pnl': 0,
                    'average_win': 0,
                    'average_loss': 0,
                    'wins': 0,
                    'losses': 0
                }
            
            # Calculate statistics
            total_trades = len(trades)
            wins = [t for t in trades if t.get('outcome') == 'Win']
            losses = [t for t in trades if t.get('outcome') == 'Loss']
            
            win_rate = (len(wins) / total_trades) * 100 if total_trades > 0 else 0
            
            total_pnl = sum(t.get('profit_loss', 0) for t in trades)
            average_win = sum(t.get('profit_loss', 0) for t in wins) / len(wins) if wins else 0
            average_loss = sum(t.get('profit_loss', 0) for t in losses) / len(losses) if losses else 0
            
            return {
                'month': month,
                'year': year,
                'total_trades': total_trades,
                'win_rate': round(win_rate, 2),
                'total_pnl': round(total_pnl, 2),
                'average_win': round(average_win, 2),
                'average_loss': round(average_loss, 2),
                'wins': len(wins),
                'losses': len(losses)
            }
            
        except Exception as e:
            logger.error(f"Failed to get monthly statistics: {str(e)}")
            raise
    
    # ============= PREFERENCES OPERATIONS =============
    
    def get_user_preferences(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user preferences"""
        return self.db.get_document('user_preferences', user_id)
    
    def update_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> bool:
        """Update user preferences"""
        existing_prefs = self.get_user_preferences(user_id)
        if existing_prefs:
            return self.db.update_document('user_preferences', user_id, preferences)
        else:
            preferences['user_id'] = user_id
            self.db.add_document('user_preferences', preferences, user_id)
            return True

# Global repository instance
firebase_repo = FirebaseRepository()

def get_firebase_repository() -> FirebaseRepository:
    """
    Get Firebase repository instance
    
    Returns:
        Firebase repository instance
    """
    return firebase_repo
