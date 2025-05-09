# File: backend/models/journal.py
# Purpose: Journal entries model for trading reflection

from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, DateTime, JSON, Enum, SmallInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from ..db.database import Base

class MoodRating(int, enum.Enum):
    """Enum for mood ratings (1-5)"""
    VERY_POOR = 1
    POOR = 2
    NEUTRAL = 3
    GOOD = 4
    EXCELLENT = 5

class Journal(Base):
    """Journal model represents trading diary entries"""
    
    __tablename__ = "journals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, index=True)
    
    # Journal Content
    title = Column(String)
    content = Column(Text)
    mood_rating = Column(SmallInteger)
    insights = Column(Text)
    tags = Column(JSON, default=list)
    
    # Relationships
    user = relationship("User", back_populates="journals")
    related_trade_ids = Column(JSON, default=list)  # List of related trade IDs
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Journal(id={self.id}, date={self.date}, mood_rating={self.mood_rating})>"
