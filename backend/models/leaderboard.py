# File: backend/models/leaderboard.py
# Purpose: Leaderboard and achievement models for anonymous competitive features

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from datetime import datetime, timedelta

from ..db.database import Base

class LeaderboardType(str, enum.Enum):
    """Types of leaderboards"""
    MONTHLY_WIN_RATE = "monthly_win_rate"
    MONTHLY_PROFIT_FACTOR = "monthly_profit_factor"
    MONTHLY_MAX_DRAWDOWN = "monthly_max_drawdown"
    WEEKLY_CONSISTENCY = "weekly_consistency"
    SETUP_SPECIFIC = "setup_specific"
    DAILY_CHALLENGE = "daily_challenge"
    STREAK_MASTER = "streak_master"
    RISK_MANAGER = "risk_manager"

class AchievementType(str, enum.Enum):
    """Types of trading achievements"""
    # Performance Badges
    BREAKOUT_MASTER = "breakout_master"
    RISK_MANAGER = "risk_manager"
    CONSISTENCY_KING = "consistency_king"
    SCALP_MASTER = "scalp_master"
    SWING_EXPERT = "swing_expert"
    
    # Strategy Badges
    ICT_KILLZONE_MASTER = "ict_killzone_master"
    MMXM_BREAKOUT_EXPERT = "mmxm_breakout_expert"
    MOMENTUM_TRADER = "momentum_trader"
    REVERSAL_SPECIALIST = "reversal_specialist"
    
    # Behavioral Badges
    PLAN_FOLLOWER = "plan_follower"
    EMOTIONAL_CONTROL = "emotional_control"
    DISCIPLINED_TRADER = "disciplined_trader"
    EARLY_BIRD = "early_bird"  # Consistent pre-market planning
    
    # Streak Badges
    WIN_STREAK_5 = "win_streak_5"
    WIN_STREAK_10 = "win_streak_10"
    WIN_STREAK_20 = "win_streak_20"
    GREEN_WEEK = "green_week"
    GREEN_MONTH = "green_month"

class LeaderboardEntry(Base):
    """Individual leaderboard entry for anonymous ranking"""
    
    __tablename__ = "leaderboard_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Leaderboard details
    leaderboard_type = Column(Enum(LeaderboardType), index=True)
    period_start = Column(DateTime(timezone=True))
    period_end = Column(DateTime(timezone=True))
    
    # Anonymous identifier (generated hash for each period)
    anonymous_id = Column(String, index=True)  # e.g., "TradeMaster_7b2f"
    
    # Performance metrics
    win_rate = Column(Float, default=0.0)
    profit_factor = Column(Float, default=0.0)
    total_trades = Column(Integer, default=0)
    total_pnl = Column(Float, default=0.0)
    max_drawdown = Column(Float, default=0.0)
    consistency_score = Column(Float, default=0.0)  # Custom consistency metric
    risk_score = Column(Float, default=0.0)  # Risk management score
    
    # Additional context
    setup_type = Column(String, nullable=True)  # For setup-specific leaderboards
    challenge_details = Column(JSON, default=dict)  # For special challenges
    
    # Ranking
    rank = Column(Integer, index=True)
    percentile = Column(Float)  # 0-100 percentile rank
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<LeaderboardEntry(id={self.id}, type={self.leaderboard_type}, rank={self.rank})>"

class Achievement(Base):
    """Achievement/Badge system for gamification"""
    
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Achievement details
    achievement_type = Column(Enum(AchievementType), index=True)
    title = Column(String)
    description = Column(Text)
    icon = Column(String)  # Icon name or path
    
    # Achievement criteria
    criteria_met = Column(JSON, default=dict)  # Store the actual values that earned the badge
    threshold_value = Column(Float, nullable=True)  # Threshold that was met
    
    # Earned details
    earned_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Display on profile
    is_featured = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<Achievement(id={self.id}, type={self.achievement_type}, user_id={self.user_id})>"

class Challenge(Base):
    """Periodic challenges for community engagement"""
    
    __tablename__ = "challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Challenge details
    title = Column(String)
    description = Column(Text)
    rules = Column(JSON, default=dict)  # Challenge-specific rules
    
    # Timing
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    
    # Challenge type and criteria
    challenge_type = Column(String, index=True)  # e.g., "best_friday_scalper", "risk_manager_week"
    target_metric = Column(String)  # e.g., "win_rate", "profit_factor", "max_drawdown"
    
    # Participation
    max_participants = Column(Integer, nullable=True)
    current_participants = Column(Integer, default=0)
    
    # Rewards
    rewards = Column(JSON, default=dict)  # Badge rewards, recognition, etc.
    
    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Challenge(id={self.id}, title={self.title}, active={self.is_active})>"

class ChallengeParticipation(Base):
    """User participation in challenges"""
    
    __tablename__ = "challenge_participations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    challenge_id = Column(Integer, ForeignKey("challenges.id"))
    
    # Participation details
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Performance tracking
    current_score = Column(Float, default=0.0)
    current_rank = Column(Integer, nullable=True)
    trades_count = Column(Integer, default=0)
    
    # Final results
    final_score = Column(Float, nullable=True)
    final_rank = Column(Integer, nullable=True)
    completed = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User")
    challenge = relationship("Challenge")
    
    def __repr__(self):
        return f"<ChallengeParticipation(user_id={self.user_id}, challenge_id={self.challenge_id})>"

class UserStats(Base):
    """Aggregated user statistics for leaderboard calculations"""
    
    __tablename__ = "user_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Overall statistics
    total_trades = Column(Integer, default=0)
    total_wins = Column(Integer, default=0)
    total_losses = Column(Integer, default=0)
    total_breakeven = Column(Integer, default=0)
    total_pnl = Column(Float, default=0.0)
    
    # Performance metrics
    overall_win_rate = Column(Float, default=0.0)
    overall_profit_factor = Column(Float, default=0.0)
    max_consecutive_wins = Column(Integer, default=0)
    max_consecutive_losses = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    current_streak_type = Column(String, nullable=True)  # "win" or "loss"
    
    # Risk metrics
    largest_win = Column(Float, default=0.0)
    largest_loss = Column(Float, default=0.0)
    max_drawdown = Column(Float, default=0.0)
    average_win = Column(Float, default=0.0)
    average_loss = Column(Float, default=0.0)
    
    # Behavioral metrics
    plan_adherence_rate = Column(Float, default=0.0)
    emotional_control_score = Column(Float, default=0.0)
    consistency_score = Column(Float, default=0.0)
    
    # Setup-specific stats (JSON for flexibility)
    setup_stats = Column(JSON, default=dict)
    
    # Time-based stats
    monthly_stats = Column(JSON, default=dict)
    weekly_stats = Column(JSON, default=dict)
    
    # Last update
    last_calculated = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self):
        return f"<UserStats(user_id={self.user_id}, win_rate={self.overall_win_rate})>"
