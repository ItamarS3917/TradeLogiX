# File: backend/api/schemas/backtest.py
# Purpose: Pydantic schemas for backtesting API

from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, validator
from enum import Enum

from ...models.backtest import BacktestStatus, StrategyType

# Strategy Schemas
class BacktestStrategyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    strategy_type: StrategyType
    entry_conditions: Dict[str, Any] = Field(default_factory=dict)
    exit_conditions: Dict[str, Any] = Field(default_factory=dict)
    risk_management: Dict[str, Any] = Field(default_factory=dict)
    filters: Dict[str, Any] = Field(default_factory=dict)
    setup_types: List[str] = Field(default_factory=list)
    timeframes: List[str] = Field(default_factory=list)

class BacktestStrategyCreate(BacktestStrategyBase):
    """Schema for creating a custom strategy"""
    
    @validator('timeframes')
    def validate_timeframes(cls, v):
        valid_timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d']
        for tf in v:
            if tf not in valid_timeframes:
                raise ValueError(f'Invalid timeframe: {tf}')
        return v

class StrategyFromTradesCreate(BaseModel):
    """Schema for creating strategy from actual trades"""
    trade_ids: List[int] = Field(..., min_items=1)
    strategy_name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    
    @validator('trade_ids')
    def validate_trade_ids(cls, v):
        if len(v) > 1000:  # Reasonable limit
            raise ValueError('Too many trades selected (max 1000)')
        return v

class BacktestStrategyResponse(BacktestStrategyBase):
    """Schema for strategy response"""
    id: int
    user_id: int
    is_active: bool
    created_from_trades: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Backtest Schemas
class BacktestBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    symbol: str = Field(default="NQ", max_length=10)
    start_date: datetime
    end_date: datetime
    initial_capital: float = Field(default=10000.0, gt=0, le=1000000)

class BacktestCreate(BacktestBase):
    """Schema for creating a backtest"""
    
    @validator('end_date')
    def validate_date_range(cls, v, values):
        start_date = values.get('start_date')
        if start_date and v <= start_date:
            raise ValueError('End date must be after start date')
        
        # Don't allow backtests more than 5 years
        if start_date and (v - start_date).days > 1825:
            raise ValueError('Backtest period cannot exceed 5 years')
        
        return v

class BacktestResponse(BacktestBase):
    """Schema for backtest response"""
    id: int
    user_id: int
    strategy_id: int
    status: BacktestStatus
    progress_percent: float = 0.0
    error_message: Optional[str] = None
    
    # Results (will be None for incomplete backtests)
    total_trades: Optional[int] = None
    winning_trades: Optional[int] = None
    losing_trades: Optional[int] = None
    breakeven_trades: Optional[int] = None
    
    # Performance metrics
    total_return: Optional[float] = None
    total_return_percent: Optional[float] = None
    max_drawdown: Optional[float] = None
    max_drawdown_percent: Optional[float] = None
    win_rate: Optional[float] = None
    avg_win: Optional[float] = None
    avg_loss: Optional[float] = None
    profit_factor: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    
    # Risk metrics
    var_95: Optional[float] = None
    max_consecutive_losses: Optional[int] = None
    largest_loss: Optional[float] = None
    
    created_at: datetime
    updated_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Trade Schemas
class BacktestTradeResponse(BaseModel):
    """Schema for individual backtest trade"""
    id: int
    backtest_id: int
    symbol: str
    setup_type: str
    entry_price: float
    exit_price: float
    position_size: float
    entry_time: datetime
    exit_time: datetime
    
    # Trade context
    market_condition: Optional[str]
    trade_direction: Optional[str]
    timeframe: Optional[str]
    
    # Results
    outcome: str
    profit_loss: float
    profit_loss_percent: float
    risk_reward_ratio: float
    
    # Analysis
    entry_reason: Optional[str]
    exit_reason: Optional[str]
    trade_quality_score: Optional[float]
    
    created_at: datetime
    
    class Config:
        from_attributes = True

# Results Schemas
class BacktestSummaryMetrics(BaseModel):
    """Summary metrics for backtest results"""
    total_trades: int
    win_rate: float
    total_return: float
    total_return_percent: float
    max_drawdown: float
    max_drawdown_percent: float
    profit_factor: float
    sharpe_ratio: float
    avg_win: float
    avg_loss: float
    largest_win: float
    largest_loss: float
    max_consecutive_wins: int
    max_consecutive_losses: int

class EquityCurvePoint(BaseModel):
    """Single point in equity curve"""
    timestamp: datetime
    equity: float
    drawdown: float

class MonthlyReturn(BaseModel):
    """Monthly return data"""
    year: int
    month: int
    return_percent: float
    trades_count: int

class TradeDistribution(BaseModel):
    """Trade distribution statistics"""
    by_setup_type: Dict[str, int]
    by_outcome: Dict[str, int]
    by_hour: Dict[int, int]
    by_day_of_week: Dict[str, int]
    by_profit_loss_ranges: Dict[str, int]

class BacktestResultsResponse(BaseModel):
    """Comprehensive backtest results"""
    backtest: BacktestResponse
    trades: List[BacktestTradeResponse]
    summary_metrics: BacktestSummaryMetrics
    equity_curve: List[EquityCurvePoint]
    monthly_returns: List[MonthlyReturn]
    trade_distribution: TradeDistribution
    
    # Additional analytics
    best_trade: Optional[BacktestTradeResponse]
    worst_trade: Optional[BacktestTradeResponse]
    avg_trade_duration: Optional[float]  # in hours
    
    class Config:
        from_attributes = True

# Comparison Schemas
class StrategyComparison(BaseModel):
    """Single strategy comparison data"""
    strategy_id: int
    strategy_name: str
    strategy_type: str
    total_backtests: int
    avg_return_percent: float
    avg_win_rate: float
    avg_max_drawdown: float
    risk_adjusted_return: float
    consistency_score: Optional[float] = None

class ComparisonAnalysis(BaseModel):
    """Analysis insights from comparison"""
    winner: str
    key_insights: List[str]
    recommendations: List[str] = Field(default_factory=list)

class BacktestComparisonResponse(BaseModel):
    """Response for strategy comparison"""
    comparisons: List[StrategyComparison]
    best_strategy: Optional[StrategyComparison]
    analysis: ComparisonAnalysis

# Recommendation Schemas
class RecommendationType(str, Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    IMPROVEMENT = "improvement"
    ERROR = "error"

class RecommendationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class StrategyRecommendation(BaseModel):
    """Single strategy recommendation"""
    type: RecommendationType
    title: str
    description: str
    priority: RecommendationPriority
    metric: Optional[str] = None
    current_value: Optional[float] = None
    target_value: Optional[float] = None
    action_items: List[str] = Field(default_factory=list)

class RecommendationsResponse(BaseModel):
    """Response for strategy recommendations"""
    strategy_id: int
    strategy_name: str
    recommendations: List[StrategyRecommendation]
    overall_score: Optional[float] = None  # Overall strategy score 0-100
    last_analysis: datetime = Field(default_factory=datetime.utcnow)

# Performance Analysis Schemas
class PerformanceMetric(BaseModel):
    """Individual performance metric"""
    name: str
    value: Union[float, int, str]
    benchmark: Optional[Union[float, int]] = None
    percentile: Optional[float] = None  # Percentile vs other strategies
    trend: Optional[str] = None  # improving, declining, stable

class PerformanceSummary(BaseModel):
    """Comprehensive performance summary"""
    strategy_id: int
    strategy_name: str
    total_backtests: int
    date_range: Dict[str, datetime]  # earliest and latest backtest dates
    
    # Key metrics
    metrics: List[PerformanceMetric]
    
    # Trends
    performance_trend: str  # improving, declining, stable
    consistency_score: float
    reliability_score: float
    
    # Best/worst periods
    best_period: Optional[Dict[str, Any]]
    worst_period: Optional[Dict[str, Any]]

# Filter and Search Schemas
class BacktestFilter(BaseModel):
    """Filters for backtest queries"""
    strategy_ids: Optional[List[int]] = None
    status: Optional[List[BacktestStatus]] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    min_return: Optional[float] = None
    max_drawdown: Optional[float] = None
    min_trades: Optional[int] = None

class StrategyFilter(BaseModel):
    """Filters for strategy queries"""
    strategy_types: Optional[List[StrategyType]] = None
    created_from_trades: Optional[bool] = None
    is_active: Optional[bool] = None
    setup_types: Optional[List[str]] = None

# Bulk Operations Schemas
class BulkBacktestCreate(BaseModel):
    """Schema for creating multiple backtests"""
    strategy_ids: List[int] = Field(..., min_items=1, max_items=10)
    config: BacktestCreate
    stagger_start: bool = Field(default=True)  # Stagger starts to avoid overload

class BulkBacktestResponse(BaseModel):
    """Response for bulk backtest creation"""
    created_backtests: List[int]  # List of backtest IDs
    failed_strategies: List[Dict[str, Any]]  # Strategies that failed with reasons
    estimated_completion_time: Optional[datetime]
