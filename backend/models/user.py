# File: backend/models/user.py
# Purpose: User model with preferences and settings

from sqlalchemy import Column, Integer, String, JSON, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..db.database import Base

class User(Base):
    """User model represents traders using the application"""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # User preferences stored as JSON
    preferences = Column(JSON, default=dict)
    
    # Relationships
    trades = relationship("Trade", back_populates="user")
    assets = relationship("Asset", back_populates="user")
    daily_plans = relationship("DailyPlan", back_populates="user")
    journals = relationship("Journal", back_populates="user")
    alerts = relationship("Alert", back_populates="user")
    preferences_obj = relationship("Preferences", back_populates="user", uselist=False)
    chart_templates = relationship("ChartTemplate", back_populates="user")
    
    # Backtesting relationships
    backtest_strategies = relationship("BacktestStrategy", back_populates="user")
    backtests = relationship("Backtest", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"
