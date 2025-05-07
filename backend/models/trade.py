# File: backend/models/trade.py
# Purpose: Trade model definition for the Trading Journal application

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from ..db.database import Base

class Trade(Base):
    """
    Trade model representing a trading transaction in the journal
    """
    __tablename__ = "trades"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"))
    daily_plan_id = Column(Integer, ForeignKey("daily_plans.id"), nullable=True)
    
    # Trade details
    symbol = Column(String, index=True)  # Initially focused on NQ
    setup_type = Column(String, index=True)  # MMXM/ICT concept categories
    
    # Trade execution details
    entry_price = Column(Float)
    exit_price = Column(Float)
    position_size = Column(Float)
    entry_time = Column(DateTime)
    exit_time = Column(DateTime)
    
    # Risk and reward
    planned_risk_reward = Column(Float)
    actual_risk_reward = Column(Float)
    
    # Outcome
    outcome = Column(String)  # Win/Loss/Breakeven
    profit_loss = Column(Float, index=True)
    
    # Psychological factors
    emotional_state = Column(String)
    plan_adherence = Column(Integer)  # Scale 1-10
    
    # Notes and attachments
    notes = Column(Text)
    screenshots = Column(Text)  # JSON array of paths or blobs
    tags = Column(Text)  # JSON array of tags
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="trades")
    daily_plan = relationship("DailyPlan", back_populates="trades")
    
    # TODO: Add MCP-specific fields
    # TODO: Add validation methods
    # TODO: Add analytics methods
    # TODO: Add serialization methods