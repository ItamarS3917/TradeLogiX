# File: backend/models/trade.py
# Purpose: Trade model to record trading activities

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from ..db.database import Base

class TradeOutcome(str, enum.Enum):
    """Enum for trade outcomes"""
    WIN = "WIN"
    LOSS = "LOSS"
    BREAKEVEN = "BREAKEVEN"

class EmotionalState(str, enum.Enum):
    """Enum for emotional states during trading"""
    CALM = "CALM"
    EXCITED = "EXCITED"
    FEARFUL = "FEARFUL"
    GREEDY = "GREEDY"
    ANXIOUS = "ANXIOUS"
    CONFIDENT = "CONFIDENT"
    FRUSTRATED = "FRUSTRATED"
    NEUTRAL = "NEUTRAL"
    OTHER = "OTHER"

class PlanAdherence(str, enum.Enum):
    """Enum for plan adherence levels"""
    FOLLOWED = "FOLLOWED"
    PARTIAL = "PARTIAL"
    DEVIATED = "DEVIATED"
    NO_PLAN = "NO_PLAN"

class Trade(Base):
    """Trade model represents individual trades placed by the user"""
    
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Trade details
    symbol = Column(String, index=True)
    setup_type = Column(String, index=True)  # MMXM/ICT concept categories
    entry_price = Column(Float)
    exit_price = Column(Float)
    position_size = Column(Float)
    entry_time = Column(DateTime(timezone=True))
    exit_time = Column(DateTime(timezone=True))
    
    # Risk/Reward
    planned_risk_reward = Column(Float)
    actual_risk_reward = Column(Float)
    
    # Outcome
    outcome = Column(Enum(TradeOutcome), index=True)
    profit_loss = Column(Float, index=True)
    
    # Psychological factors
    emotional_state = Column(Enum(EmotionalState))
    plan_adherence = Column(Enum(PlanAdherence))
    
    # Notes and media
    notes = Column(Text)
    screenshots = Column(JSON, default=list)  # Store paths to screenshots
    tags = Column(JSON, default=list)  # Store tags as a list
    
    # Relationships
    user = relationship("User", back_populates="trades")
    related_plan_id = Column(Integer, ForeignKey("daily_plans.id"), nullable=True)
    related_plan = relationship("DailyPlan", back_populates="trades")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Trade(id={self.id}, symbol={self.symbol}, outcome={self.outcome})>"
