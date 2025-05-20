# File: backend/api/schemas/asset.py
# Purpose: Pydantic schemas for asset API

from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

from ...models.asset import AssetType

class AssetBase(BaseModel):
    symbol: str
    name: str
    description: Optional[str] = None
    asset_type: AssetType
    exchange: Optional[str] = None
    is_active: bool = True
    
    # Custom parameters
    tick_size: float = 0.25
    value_per_tick: float = 12.50
    contract_size: float = 1.0
    currency: str = "USD"
    trading_hours: Optional[Dict[str, Any]] = None
    session_times: Optional[Dict[str, Any]] = None
    
    # Risk parameters
    default_risk_per_trade: Optional[float] = None
    max_position_size: Optional[int] = None
    
    # Custom fields
    custom_fields: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    asset_type: Optional[AssetType] = None
    exchange: Optional[str] = None
    is_active: Optional[bool] = None
    
    # Custom parameters
    tick_size: Optional[float] = None
    value_per_tick: Optional[float] = None
    contract_size: Optional[float] = None
    currency: Optional[str] = None
    trading_hours: Optional[Dict[str, Any]] = None
    session_times: Optional[Dict[str, Any]] = None
    
    # Risk parameters
    default_risk_per_trade: Optional[float] = None
    max_position_size: Optional[int] = None
    
    # Custom fields
    custom_fields: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None

class AssetResponse(AssetBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
