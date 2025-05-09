# File: backend/models/statistic.py
# Purpose: Calculated statistics model

from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..db.database import Base

class Statistic(Base):
    """Statistic model for storing calculated trading metrics"""
    
    __tablename__ = "statistics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Time Period
    start_date = Column(Date)
    end_date = Column(Date)
    period_type = Column(String)  # daily, weekly, monthly, custom
    
    # Core Metrics
    win_rate = Column(Float)
    profit_factor = Column(Float)
    average_win = Column(Float)
    average_loss = Column(Float)
    largest_win = Column(Float)
    largest_loss = Column(Float)
    total_trades = Column(Integer)
    winning_trades = Column(Integer)
    losing_trades = Column(Integer)
    
    # Advanced Metrics
    expectancy = Column(Float)
    sharpe_ratio = Column(Float)
    sortino_ratio = Column(Float)
    max_drawdown = Column(Float)
    max_drawdown_percentage = Column(Float)
    
    # Segmented Metrics
    setup_metrics = Column(JSON, default=dict)  # Performance by setup type
    time_metrics = Column(JSON, default=dict)  # Performance by time of day
    emotion_metrics = Column(JSON, default=dict)  # Performance by emotional state
    
    # Timestamps
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<Statistic(id={self.id}, period={self.period_type}, win_rate={self.win_rate})>"
