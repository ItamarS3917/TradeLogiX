# File: backend/db/schemas.py
# Purpose: Pydantic schemas for API request/response validation

from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import date, datetime
import enum

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    preferences: Dict[str, Any]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Trade Schemas
class TradeOutcomeEnum(str, enum.Enum):
    WIN = "WIN"
    LOSS = "LOSS"
    BREAKEVEN = "BREAKEVEN"

class EmotionalStateEnum(str, enum.Enum):
    CALM = "CALM"
    EXCITED = "EXCITED"
    FEARFUL = "FEARFUL"
    GREEDY = "GREEDY"
    ANXIOUS = "ANXIOUS"
    CONFIDENT = "CONFIDENT"
    FRUSTRATED = "FRUSTRATED"
    NEUTRAL = "NEUTRAL"
    OTHER = "OTHER"

class PlanAdherenceEnum(str, enum.Enum):
    FOLLOWED = "FOLLOWED"
    PARTIAL = "PARTIAL"
    DEVIATED = "DEVIATED"
    NO_PLAN = "NO_PLAN"

class TradeBase(BaseModel):
    user_id: int
    symbol: str
    setup_type: str
    entry_price: float
    exit_price: float
    position_size: float
    entry_time: datetime
    exit_time: datetime
    planned_risk_reward: float
    actual_risk_reward: float
    outcome: TradeOutcomeEnum
    profit_loss: float
    emotional_state: EmotionalStateEnum
    plan_adherence: PlanAdherenceEnum
    notes: Optional[str] = None
    screenshots: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    related_plan_id: Optional[int] = None

class TradeCreate(TradeBase):
    pass

class TradeUpdate(BaseModel):
    symbol: Optional[str] = None
    setup_type: Optional[str] = None
    entry_price: Optional[float] = None
    exit_price: Optional[float] = None
    position_size: Optional[float] = None
    entry_time: Optional[datetime] = None
    exit_time: Optional[datetime] = None
    planned_risk_reward: Optional[float] = None
    actual_risk_reward: Optional[float] = None
    outcome: Optional[TradeOutcomeEnum] = None
    profit_loss: Optional[float] = None
    emotional_state: Optional[EmotionalStateEnum] = None
    plan_adherence: Optional[PlanAdherenceEnum] = None
    notes: Optional[str] = None
    screenshots: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    related_plan_id: Optional[int] = None

class TradeResponse(TradeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class TradeStatistics(BaseModel):
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    profit_factor: Optional[float] = None
    average_win: Optional[float] = None
    average_loss: Optional[float] = None
    largest_win: Optional[float] = None
    largest_loss: Optional[float] = None
    net_profit_loss: float
    setup_performance: Optional[Dict[str, Any]] = None
    emotional_state_performance: Optional[Dict[str, Any]] = None
    plan_adherence_performance: Optional[Dict[str, Any]] = None

# DailyPlan Schemas
class MarketBiasEnum(str, enum.Enum):
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"
    NEUTRAL = "NEUTRAL"
    UNDECIDED = "UNDECIDED"

class MentalStateEnum(str, enum.Enum):
    FOCUSED = "FOCUSED"
    DISTRACTED = "DISTRACTED"
    TIRED = "TIRED"
    ENERGETIC = "ENERGETIC"
    OVERWHELMED = "OVERWHELMED"
    CALM = "CALM"
    STRESSED = "STRESSED"
    OTHER = "OTHER"

class DailyPlanBase(BaseModel):
    user_id: int
    date: date
    market_bias: MarketBiasEnum
    key_levels: List[Dict[str, Any]]
    goals: str
    risk_parameters: Dict[str, Any]
    mental_state: MentalStateEnum
    notes: Optional[str] = None

class DailyPlanCreate(DailyPlanBase):
    pass

class DailyPlanUpdate(BaseModel):
    market_bias: Optional[MarketBiasEnum] = None
    key_levels: Optional[List[Dict[str, Any]]] = None
    goals: Optional[str] = None
    risk_parameters: Optional[Dict[str, Any]] = None
    mental_state: Optional[MentalStateEnum] = None
    notes: Optional[str] = None

class DailyPlanResponse(DailyPlanBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Journal Schemas
class JournalBase(BaseModel):
    user_id: int
    date: date
    title: str
    content: str
    mood_rating: int = Field(..., ge=1, le=5)
    insights: Optional[str] = None
    tags: Optional[List[str]] = None
    related_trade_ids: Optional[List[int]] = None

class JournalCreate(JournalBase):
    pass

class JournalUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    mood_rating: Optional[int] = Field(None, ge=1, le=5)
    insights: Optional[str] = None
    tags: Optional[List[str]] = None
    related_trade_ids: Optional[List[int]] = None

class JournalResponse(JournalBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Alert Schemas
class AlertTypeEnum(str, enum.Enum):
    PERFORMANCE = "PERFORMANCE"
    RULE_VIOLATION = "RULE_VIOLATION"
    GOAL_ACHIEVEMENT = "GOAL_ACHIEVEMENT"
    RISK_MANAGEMENT = "RISK_MANAGEMENT"
    PATTERN_DETECTION = "PATTERN_DETECTION"
    CUSTOM = "CUSTOM"

class AlertStatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    TRIGGERED = "TRIGGERED"
    DISMISSED = "DISMISSED"
    SNOOZED = "SNOOZED"

class AlertBase(BaseModel):
    user_id: int
    type: AlertTypeEnum
    title: str
    message: str
    status: AlertStatusEnum = AlertStatusEnum.ACTIVE
    trigger_conditions: Dict[str, Any]

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    status: Optional[AlertStatusEnum] = None
    trigger_conditions: Optional[Dict[str, Any]] = None

class AlertResponse(AlertBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    triggered_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Statistic Schemas
class StatisticBase(BaseModel):
    user_id: int
    start_date: date
    end_date: date
    period_type: str
    win_rate: float
    profit_factor: float
    average_win: float
    average_loss: float
    largest_win: float
    largest_loss: float
    total_trades: int
    winning_trades: int
    losing_trades: int
    expectancy: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    sortino_ratio: Optional[float] = None
    max_drawdown: Optional[float] = None
    max_drawdown_percentage: Optional[float] = None
    setup_metrics: Optional[Dict[str, Any]] = None
    time_metrics: Optional[Dict[str, Any]] = None
    emotion_metrics: Optional[Dict[str, Any]] = None

class StatisticCreate(StatisticBase):
    pass

class StatisticResponse(StatisticBase):
    id: int
    calculated_at: datetime

    class Config:
        orm_mode = True
