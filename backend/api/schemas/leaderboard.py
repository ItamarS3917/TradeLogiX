# File: backend/api/schemas/leaderboard.py
# Purpose: Pydantic schemas for leaderboard API responses

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class LeaderboardResponse(BaseModel):
    """Response model for leaderboard entries"""
    
    rank: int = Field(..., description="Ranking position")
    anonymous_id: str = Field(..., description="Anonymous identifier for the trader")
    win_rate: float = Field(..., description="Win rate percentage")
    profit_factor: float = Field(..., description="Profit factor ratio")
    total_trades: int = Field(..., description="Total number of trades")
    total_pnl: float = Field(..., description="Total profit/loss")
    max_drawdown: float = Field(..., description="Maximum drawdown")
    consistency_score: float = Field(..., description="Consistency score (0-100)")
    risk_score: float = Field(..., description="Risk management score (0-100)")
    percentile: float = Field(..., description="Percentile ranking (0-100)")
    
    class Config:
        from_attributes = True

class UserRankResponse(BaseModel):
    """Response model for user's rank in leaderboard"""
    
    rank: int = Field(..., description="User's current rank")
    anonymous_id: str = Field(..., description="User's anonymous identifier")
    win_rate: float = Field(..., description="User's win rate")
    profit_factor: float = Field(..., description="User's profit factor")
    total_trades: int = Field(..., description="User's total trades")
    total_pnl: float = Field(..., description="User's total P&L")
    percentile: float = Field(..., description="User's percentile ranking")
    total_participants: int = Field(..., description="Total participants in leaderboard")
    
    class Config:
        from_attributes = True

class AchievementResponse(BaseModel):
    """Response model for user achievements"""
    
    id: int
    achievement_type: str = Field(..., description="Type of achievement")
    title: str = Field(..., description="Achievement title")
    description: str = Field(..., description="Achievement description")
    icon: str = Field(..., description="Achievement icon")
    criteria_met: Dict[str, Any] = Field(..., description="Criteria that were met")
    earned_at: datetime = Field(..., description="When the achievement was earned")
    is_featured: bool = Field(..., description="Whether to feature this achievement")
    
    class Config:
        from_attributes = True

class ChallengeResponse(BaseModel):
    """Response model for challenges"""
    
    id: int
    title: str = Field(..., description="Challenge title")
    description: str = Field(..., description="Challenge description")
    challenge_type: str = Field(..., description="Type of challenge")
    target_metric: str = Field(..., description="Target metric for scoring")
    start_date: datetime = Field(..., description="Challenge start date")
    end_date: datetime = Field(..., description="Challenge end date")
    max_participants: Optional[int] = Field(None, description="Maximum participants")
    current_participants: int = Field(..., description="Current number of participants")
    rules: Dict[str, Any] = Field(..., description="Challenge rules")
    rewards: Dict[str, Any] = Field(..., description="Challenge rewards")
    is_active: bool = Field(..., description="Whether challenge is active")
    is_featured: bool = Field(..., description="Whether challenge is featured")
    
    class Config:
        from_attributes = True

class ChallengeCreateRequest(BaseModel):
    """Request model for creating challenges"""
    
    title: str = Field(..., min_length=1, max_length=100, description="Challenge title")
    description: str = Field(..., min_length=1, max_length=500, description="Challenge description")
    challenge_type: str = Field(..., description="Type of challenge")
    target_metric: str = Field(..., description="Target metric for scoring")
    start_date: datetime = Field(..., description="Challenge start date")
    end_date: datetime = Field(..., description="Challenge end date")
    max_participants: Optional[int] = Field(None, description="Maximum participants")
    rules: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Challenge rules")
    rewards: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Challenge rewards")

class ChallengeParticipationResponse(BaseModel):
    """Response model for challenge participation"""
    
    id: int
    user_id: int
    challenge_id: int
    joined_at: datetime = Field(..., description="When user joined the challenge")
    current_score: float = Field(..., description="Current score in the challenge")
    current_rank: Optional[int] = Field(None, description="Current rank in the challenge")
    trades_count: int = Field(..., description="Number of trades made in challenge")
    completed: bool = Field(..., description="Whether challenge is completed")
    
    class Config:
        from_attributes = True

class LeaderboardTypeResponse(BaseModel):
    """Response model for leaderboard types"""
    
    value: str = Field(..., description="Leaderboard type value")
    name: str = Field(..., description="Human-readable name")
    description: str = Field(..., description="Description of the leaderboard")

class AchievementTypeResponse(BaseModel):
    """Response model for achievement types"""
    
    value: str = Field(..., description="Achievement type value")
    name: str = Field(..., description="Human-readable name")
    description: str = Field(..., description="Description of the achievement")

class GlobalStatsResponse(BaseModel):
    """Response model for global leaderboard statistics"""
    
    total_active_users: int = Field(..., description="Total active users")
    current_month_participants: int = Field(..., description="Participants this month")
    active_challenges: int = Field(..., description="Number of active challenges")
    achievements_awarded_this_month: int = Field(..., description="Achievements awarded this month")
    leaderboard_types: int = Field(..., description="Number of leaderboard types")
    achievement_types: int = Field(..., description="Number of achievement types")

class ChallengeLeaderboardEntry(BaseModel):
    """Response model for challenge leaderboard entries"""
    
    rank: int = Field(..., description="Rank in the challenge")
    anonymous_id: str = Field(..., description="Anonymous identifier")
    score: float = Field(..., description="Challenge score")
    trades_count: int = Field(..., description="Number of trades")
    joined_at: datetime = Field(..., description="When they joined the challenge")

class UserStatsResponse(BaseModel):
    """Response model for detailed user statistics"""
    
    total_trades: int
    win_count: int
    loss_count: int
    breakeven_count: int
    win_rate: float
    total_pnl: float
    profit_factor: float
    avg_win: float
    avg_loss: float
    largest_win: float
    largest_loss: float
    max_drawdown: float
    current_streak: int
    current_streak_type: Optional[str]
    max_win_streak: int
    max_loss_streak: int
    consistency_score: float
    plan_adherence_rate: float
    risk_score: float
    setup_stats: Dict[str, Any]
    
    class Config:
        from_attributes = True

class LeaderboardUpdateResponse(BaseModel):
    """Response model for leaderboard update operations"""
    
    message: str = Field(..., description="Update status message")
    entries_updated: int = Field(..., description="Number of entries updated")
    period_start: datetime = Field(..., description="Period start date")
    period_end: datetime = Field(..., description="Period end date")

class AchievementCheckResponse(BaseModel):
    """Response model for achievement check operations"""
    
    message: str = Field(..., description="Check status message")
    new_achievements: int = Field(..., description="Number of new achievements awarded")
    achievements_awarded: List[str] = Field(default_factory=list, description="List of achievement types awarded")
