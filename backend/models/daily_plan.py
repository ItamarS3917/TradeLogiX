# File: backend/models/daily_plan.py
# Purpose: Daily trading plan model

from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, DateTime, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from ..db.database import Base

class MarketBias(str, enum.Enum):
    """Enum for market bias"""
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"
    NEUTRAL = "NEUTRAL"
    UNDECIDED = "UNDECIDED"

class MentalState(str, enum.Enum):
    """Enum for mental states"""
    FOCUSED = "FOCUSED"
    DISTRACTED = "DISTRACTED"
    TIRED = "TIRED"
    ENERGETIC = "ENERGETIC"
    OVERWHELMED = "OVERWHELMED"
    CALM = "CALM"
    STRESSED = "STRESSED"
    OTHER = "OTHER"

class DailyPlan(Base):
    """DailyPlan model represents pre-market planning for a trading day"""
    
    __tablename__ = "daily_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, index=True)
    
    # Market Analysis
    market_bias = Column(Enum(MarketBias))
    key_levels = Column(JSON, default=list)  # List of important price levels
    
    # Plan Details
    goals = Column(Text)
    risk_parameters = Column(JSON, default=dict)  # Max loss, position sizing, etc.
    mental_state = Column(Enum(MentalState))
    notes = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="daily_plans")
    trades = relationship("Trade", back_populates="related_plan")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<DailyPlan(id={self.id}, date={self.date}, bias={self.market_bias})>"
