# File: backend/models/backtest.py
# Purpose: Backtesting models for strategy validation

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from typing import List, Dict, Any

from ..db.database import Base

class BacktestStatus(str, enum.Enum):
    """Enum for backtest execution status"""
    PENDING = "Pending"
    RUNNING = "Running"
    COMPLETED = "Completed"
    FAILED = "Failed"
    CANCELLED = "Cancelled"

class StrategyType(str, enum.Enum):
    """Enum for strategy types based on user's trading setups"""
    MMXM_SUPPLY_DEMAND = "MMXM Supply/Demand"
    ICT_ORDER_BLOCK = "ICT Order Block"
    ICT_FAIR_VALUE_GAP = "ICT Fair Value Gap"
    ICT_BREAKER = "ICT Breaker"
    ICT_MITIGATION = "ICT Mitigation"
    LIQUIDITY_GRAB = "Liquidity Grab"
    CUSTOM_SETUP = "Custom Setup"
    COMBINED_STRATEGY = "Combined Strategy"

class BacktestStrategy(Base):
    """Strategy definition for backtesting"""
    
    __tablename__ = "backtest_strategies"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Strategy details
    name = Column(String, nullable=False)
    description = Column(Text)
    strategy_type = Column(Enum(StrategyType))
    
    # Strategy parameters (stored as JSON for flexibility)
    entry_conditions = Column(JSON)  # Entry criteria
    exit_conditions = Column(JSON)   # Exit criteria
    risk_management = Column(JSON)   # Risk/position sizing rules
    filters = Column(JSON)           # Market condition filters
    
    # Based on user's actual trading patterns
    setup_types = Column(JSON, default=list)  # References to user's setup types
    timeframes = Column(JSON, default=list)   # Trading timeframes
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_from_trades = Column(Boolean, default=False)  # If strategy was derived from actual trades
    
    # Relationships
    user = relationship("User", back_populates="backtest_strategies")
    backtests = relationship("Backtest", back_populates="strategy")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Backtest(Base):
    """Individual backtest execution"""
    
    __tablename__ = "backtests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    strategy_id = Column(Integer, ForeignKey("backtest_strategies.id"))
    
    # Backtest parameters
    name = Column(String)
    symbol = Column(String, default="NQ")  # Default to NQ futures
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    initial_capital = Column(Float, default=10000.0)
    
    # Execution details
    status = Column(Enum(BacktestStatus), default=BacktestStatus.PENDING)
    progress_percent = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)
    
    # Results summary
    total_trades = Column(Integer, default=0)
    winning_trades = Column(Integer, default=0)
    losing_trades = Column(Integer, default=0)
    breakeven_trades = Column(Integer, default=0)
    
    # Performance metrics
    total_return = Column(Float, default=0.0)
    total_return_percent = Column(Float, default=0.0)
    max_drawdown = Column(Float, default=0.0)
    max_drawdown_percent = Column(Float, default=0.0)
    win_rate = Column(Float, default=0.0)
    avg_win = Column(Float, default=0.0)
    avg_loss = Column(Float, default=0.0)
    profit_factor = Column(Float, default=0.0)
    sharpe_ratio = Column(Float, default=0.0)
    
    # Risk metrics
    var_95 = Column(Float, default=0.0)  # Value at Risk at 95%
    max_consecutive_losses = Column(Integer, default=0)
    largest_loss = Column(Float, default=0.0)
    
    # Additional analytics (stored as JSON for flexibility)
    detailed_metrics = Column(JSON, default=dict)
    monthly_returns = Column(JSON, default=list)
    equity_curve = Column(JSON, default=list)
    trade_distribution = Column(JSON, default=dict)
    
    # Relationships
    user = relationship("User", back_populates="backtests")
    strategy = relationship("BacktestStrategy", back_populates="backtests")
    trades = relationship("BacktestTrade", back_populates="backtest")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

class BacktestTrade(Base):
    """Individual trades generated during backtesting"""
    
    __tablename__ = "backtest_trades"
    
    id = Column(Integer, primary_key=True, index=True)
    backtest_id = Column(Integer, ForeignKey("backtests.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Trade details (similar to regular Trade model)
    symbol = Column(String)
    setup_type = Column(String)
    entry_price = Column(Float)
    exit_price = Column(Float)
    position_size = Column(Float)
    entry_time = Column(DateTime(timezone=True))
    exit_time = Column(DateTime(timezone=True))
    
    # Trade context
    market_condition = Column(String)
    trade_direction = Column(String)
    timeframe = Column(String)
    
    # Results
    outcome = Column(String)  # Win/Loss/Breakeven
    profit_loss = Column(Float)
    profit_loss_percent = Column(Float)
    risk_reward_ratio = Column(Float)
    
    # Trade analysis
    entry_reason = Column(Text)  # Why the strategy triggered
    exit_reason = Column(Text)   # Why the trade was closed
    trade_quality_score = Column(Float)  # Quality assessment (0-10)
    
    # Market data at trade time (for analysis)
    market_data = Column(JSON, default=dict)
    indicators = Column(JSON, default=dict)
    
    # Relationships
    backtest = relationship("Backtest", back_populates="trades")
    user = relationship("User")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BacktestComparison(Base):
    """Compare multiple backtests or backtest vs actual trading"""
    
    __tablename__ = "backtest_comparisons"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    name = Column(String)
    description = Column(Text)
    
    # Comparison data
    backtest_ids = Column(JSON, default=list)  # List of backtest IDs to compare
    comparison_metrics = Column(JSON, default=dict)  # Calculated comparison metrics
    
    # vs Actual Trading comparison
    include_actual_trades = Column(Boolean, default=False)
    actual_trades_start_date = Column(DateTime(timezone=True), nullable=True)
    actual_trades_end_date = Column(DateTime(timezone=True), nullable=True)
    actual_vs_backtest_analysis = Column(JSON, default=dict)
    
    # Relationships
    user = relationship("User")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
