# File: backend/models/asset.py
# Purpose: Asset model to record trading instruments

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from ..db.database import Base

class AssetType(str, enum.Enum):
    """Enum for asset types"""
    FUTURES = "FUTURES"
    FOREX = "FOREX"
    CRYPTO = "CRYPTO"
    STOCKS = "STOCKS"
    OPTIONS = "OPTIONS"
    OTHER = "OTHER"

class Asset(Base):
    """Asset model represents trading instruments"""
    
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True, unique=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    asset_type = Column(Enum(AssetType), index=True)
    exchange = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Custom parameters
    tick_size = Column(Float, default=0.25)
    value_per_tick = Column(Float, default=12.50)
    contract_size = Column(Float, default=1.0)
    currency = Column(String, default="USD")
    trading_hours = Column(JSON, default=dict)  # Store trading hours as JSON
    session_times = Column(JSON, default=dict)  # Store session times as JSON
    
    # Risk parameters
    default_risk_per_trade = Column(Float, nullable=True)
    max_position_size = Column(Integer, nullable=True)
    
    # Custom fields
    custom_fields = Column(JSON, default=dict)
    tags = Column(JSON, default=list)
    
    # Relationships
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="assets")
    trades = relationship("Trade", back_populates="asset")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Asset(id={self.id}, symbol={self.symbol}, type={self.asset_type})>"
