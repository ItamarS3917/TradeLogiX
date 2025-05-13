# File: backend/models/preferences.py
# Purpose: User preferences model for theme and UI customization

from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..db.database import Base

class Preferences(Base):
    """User preferences model for storing theme and UI customization preferences"""
    
    __tablename__ = "preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Theme preferences stored as JSON object
    theme = Column(JSON, default=dict)
    
    # Dashboard layout preferences stored as JSON object
    dashboard_layout = Column(JSON, default=dict)
    
    # Chart preferences stored as JSON object
    chart_preferences = Column(JSON, default=dict)
    
    # Notification preferences stored as JSON object
    notification_preferences = Column(JSON, default=dict)
    
    # General UI preferences
    timezone = Column(String, default="UTC")
    date_format = Column(String, default="MM/DD/YYYY")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="preferences_obj")
    
    def __repr__(self):
        return f"<Preferences(id={self.id}, user_id={self.user_id})>"
