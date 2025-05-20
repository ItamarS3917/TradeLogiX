# File: backend/db/schemas.py
# Purpose: Pydantic schemas for API request/response validation

from typing import List, Optional, Dict, Any, Union
from datetime import datetime, date
import json

from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator
from typing_extensions import Self

# ======== User Schemas ========

class UserBase(BaseModel):
    """Base schema for user data"""
    username: str
    email: EmailStr
    fullname: Optional[str] = None

class UserCreate(UserBase):
    """Schema for user creation request"""
    password: str

class UserUpdate(BaseModel):
    """Schema for user update request"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    fullname: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    """Schema for user response"""
    id: int
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ======== Trade Schemas ========

class TradeBase(BaseModel):
    """Base schema for trade data"""
    symbol: str
    setup_type: str
    entry_price: float
    exit_price: float
    position_size: float
    entry_time: Union[datetime, str]  # Accept both datetime objects and strings
    exit_time: Union[datetime, str]   # Accept both datetime objects and strings
    planned_risk_reward: Optional[float] = None
    actual_risk_reward: Optional[float] = None
    outcome: str  # Win/Loss/Breakeven
    profit_loss: float
    emotional_state: Optional[str] = None
    plan_adherence: Optional[int] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    daily_plan_id: Optional[int] = None
    
    # Convert datetime string to actual datetime object during validation
    @model_validator(mode='after')
    def validate_datetimes(self) -> Self:
        if isinstance(self.entry_time, str):
            try:
                if self.entry_time.endswith('Z'):
                    # Convert 'Z' to +00:00 for better compatibility
                    self.entry_time = self.entry_time[:-1] + '+00:00'
                self.entry_time = datetime.fromisoformat(self.entry_time)
            except (ValueError, TypeError):
                # Keep as is and let the repository handle it
                pass
                
        if isinstance(self.exit_time, str):
            try:
                if self.exit_time.endswith('Z'):
                    # Convert 'Z' to +00:00 for better compatibility
                    self.exit_time = self.exit_time[:-1] + '+00:00'
                self.exit_time = datetime.fromisoformat(self.exit_time)
            except (ValueError, TypeError):
                # Keep as is and let the repository handle it
                pass
                
        return self

class TradeCreate(TradeBase):
    """Schema for trade creation request"""
    screenshots: Optional[List[str]] = None
    
    @field_validator('outcome')
    @classmethod
    def validate_outcome(cls, v: str) -> str:
        valid_outcomes = ['Win', 'Loss', 'Breakeven']
        if v not in valid_outcomes:
            raise ValueError(f'Outcome must be one of {valid_outcomes}')
        return v
    
    @field_validator('plan_adherence')
    @classmethod
    def validate_plan_adherence(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 1 or v > 10):
            raise ValueError('Plan adherence must be between 1 and 10')
        return v

class TradeUpdate(BaseModel):
    """Schema for trade update request"""
    symbol: Optional[str] = None
    setup_type: Optional[str] = None
    entry_price: Optional[float] = None
    exit_price: Optional[float] = None
    position_size: Optional[float] = None
    entry_time: Optional[datetime] = None
    exit_time: Optional[datetime] = None
    planned_risk_reward: Optional[float] = None
    actual_risk_reward: Optional[float] = None
    outcome: Optional[str] = None
    profit_loss: Optional[float] = None
    emotional_state: Optional[str] = None
    plan_adherence: Optional[int] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    screenshots: Optional[List[str]] = None
    daily_plan_id: Optional[int] = None
    
    @field_validator('outcome')
    @classmethod
    def validate_outcome(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            valid_outcomes = ['Win', 'Loss', 'Breakeven']
            if v not in valid_outcomes:
                raise ValueError(f'Outcome must be one of {valid_outcomes}')
        return v
    
    @field_validator('plan_adherence')
    @classmethod
    def validate_plan_adherence(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 1 or v > 10):
            raise ValueError('Plan adherence must be between 1 and 10')
        return v

class TradeResponse(TradeBase):
    """Schema for trade response"""
    id: int
    user_id: int
    screenshots: List[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ======== DailyPlan Schemas ========

class DailyPlanBase(BaseModel):
    """Base schema for daily trading plan"""
    date: date
    market_bias: str
    key_levels: Dict[str, Any]
    goals: Optional[List[str]] = None
    risk_parameters: Optional[Dict[str, Any]] = None
    mental_state: Optional[str] = None
    notes: Optional[str] = None

class DailyPlanCreate(DailyPlanBase):
    """Schema for daily plan creation request"""
    pass

class DailyPlanUpdate(BaseModel):
    """Schema for daily plan update request"""
    market_bias: Optional[str] = None
    key_levels: Optional[Dict[str, Any]] = None
    goals: Optional[List[str]] = None
    risk_parameters: Optional[Dict[str, Any]] = None
    mental_state: Optional[str] = None
    notes: Optional[str] = None

class DailyPlanResponse(DailyPlanBase):
    """Schema for daily plan response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    trades: Optional[List["TradeResponse"]] = None
    
    class Config:
        from_attributes = True

# ======== Journal Schemas ========

class JournalBase(BaseModel):
    """Base schema for journal entries"""
    date: date
    content: str
    mood_rating: Optional[int] = None
    tags: Optional[List[str]] = None
    related_trade_ids: Optional[List[int]] = None

class JournalCreate(JournalBase):
    """Schema for journal creation request"""
    
    @field_validator('mood_rating')
    @classmethod
    def validate_mood_rating(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 1 or v > 10):
            raise ValueError('Mood rating must be between 1 and 10')
        return v

class JournalUpdate(BaseModel):
    """Schema for journal update request"""
    content: Optional[str] = None
    mood_rating: Optional[int] = None
    tags: Optional[List[str]] = None
    related_trade_ids: Optional[List[int]] = None
    
    @field_validator('mood_rating')
    @classmethod
    def validate_mood_rating(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 1 or v > 10):
            raise ValueError('Mood rating must be between 1 and 10')
        return v

class JournalResponse(JournalBase):
    """Schema for journal response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ======== Alert Schemas ========

class AlertBase(BaseModel):
    """Base schema for alerts"""
    type: str
    title: str
    message: str
    status: str = "ACTIVE"
    trigger_conditions: Optional[Dict[str, Any]] = None

class AlertCreate(AlertBase):
    """Schema for alert creation request"""
    
    @field_validator('type')
    @classmethod
    def validate_type(cls, v: str) -> str:
        valid_types = ['PERFORMANCE', 'RULE_VIOLATION', 'GOAL_ACHIEVEMENT', 
                      'RISK_MANAGEMENT', 'PATTERN_DETECTION', 'CUSTOM']
        if v not in valid_types:
            raise ValueError(f'Alert type must be one of {valid_types}')
        return v
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid_statuses = ['ACTIVE', 'TRIGGERED', 'DISMISSED', 'SNOOZED']
        if v not in valid_statuses:
            raise ValueError(f'Alert status must be one of {valid_statuses}')
        return v

class AlertUpdate(BaseModel):
    """Schema for alert update request"""
    type: Optional[str] = None
    title: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None
    trigger_conditions: Optional[Dict[str, Any]] = None
    
    @field_validator('type')
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            valid_types = ['PERFORMANCE', 'RULE_VIOLATION', 'GOAL_ACHIEVEMENT', 
                          'RISK_MANAGEMENT', 'PATTERN_DETECTION', 'CUSTOM']
            if v not in valid_types:
                raise ValueError(f'Alert type must be one of {valid_types}')
        return v
    
    @field_validator('status')
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            valid_statuses = ['ACTIVE', 'TRIGGERED', 'DISMISSED', 'SNOOZED']
            if v not in valid_statuses:
                raise ValueError(f'Alert status must be one of {valid_statuses}')
        return v

class AlertResponse(AlertBase):
    """Schema for alert response"""
    id: int
    user_id: int
    created_at: datetime
    triggered_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ======== Statistics Schemas ========

class StatisticBase(BaseModel):
    """Base schema for statistics"""
    name: str
    category: str
    period: str
    value: Optional[float] = None
    text_value: Optional[str] = None
    json_value: Optional[Dict[str, Any]] = None

class StatisticCreate(StatisticBase):
    """Schema for statistic creation request"""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    filters: Optional[Dict[str, Any]] = None

class StatisticUpdate(BaseModel):
    """Schema for statistic update request"""
    value: Optional[float] = None
    text_value: Optional[str] = None
    json_value: Optional[Dict[str, Any]] = None

class StatisticResponse(StatisticBase):
    """Schema for statistic response"""
    id: int
    user_id: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    filters: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ======== Trade Statistics Schema ========

class TradeStatistics(BaseModel):
    """Schema for trade statistics"""
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    profit_factor: float
    average_win: float
    average_loss: float
    largest_win: float
    largest_loss: float
    net_profit_loss: float
    setup_performance: Dict[str, Dict[str, Any]]
    emotional_state_performance: Dict[str, Dict[str, Any]]
    plan_adherence_performance: Dict[str, Dict[str, Any]]

# ======== Chart Template Schemas ========

class ChartTemplateBase(BaseModel):
    """Base schema for chart template data"""
    name: str
    description: Optional[str] = None
    config: Dict[str, Any]

class ChartTemplateCreate(ChartTemplateBase):
    """Schema for creating a new chart template"""
    pass

class ChartTemplateUpdate(BaseModel):
    """Schema for updating an existing chart template"""
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = None

class ChartTemplateResponse(ChartTemplateBase):
    """Schema for chart template responses"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ======== Authentication Schemas ========

class Token(BaseModel):
    """Schema for authentication token"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Schema for token payload"""
    username: Optional[str] = None
    exp: Optional[datetime] = None
