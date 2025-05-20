# File: backend/models/chart_template.py
# Purpose: Chart template model for storing user-defined chart layouts and settings

from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..db.database import Base

class ChartTemplate(Base):
    """Chart template model for storing custom chart configurations"""
    
    __tablename__ = "chart_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    config = Column(JSON, nullable=False)  # Stores chart configuration as JSON
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chart_templates")
    
    def __repr__(self):
        return f"<ChartTemplate(id={self.id}, name={self.name})>"
