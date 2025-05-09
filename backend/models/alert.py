# File: backend/models/alert.py
# Purpose: Alert and notification model

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from ..db.database import Base

class AlertType(str, enum.Enum):
    """Enum for alert types"""
    PERFORMANCE = "PERFORMANCE"
    RULE_VIOLATION = "RULE_VIOLATION"
    GOAL_ACHIEVEMENT = "GOAL_ACHIEVEMENT"
    RISK_MANAGEMENT = "RISK_MANAGEMENT"
    PATTERN_DETECTION = "PATTERN_DETECTION"
    CUSTOM = "CUSTOM"

class AlertStatus(str, enum.Enum):
    """Enum for alert statuses"""
    ACTIVE = "ACTIVE"
    TRIGGERED = "TRIGGERED"
    DISMISSED = "DISMISSED"
    SNOOZED = "SNOOZED"

class Alert(Base):
    """Alert model for system-generated notifications"""
    
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Alert Details
    type = Column(Enum(AlertType))
    title = Column(String)
    message = Column(Text)
    status = Column(Enum(AlertStatus), default=AlertStatus.ACTIVE)
    
    # Trigger conditions stored as JSON
    trigger_conditions = Column(JSON, default=dict)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    triggered_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="alerts")
    
    def __repr__(self):
        return f"<Alert(id={self.id}, type={self.type}, status={self.status})>"
