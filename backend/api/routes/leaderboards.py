# File: backend/api/routes/leaderboards.py
# Purpose: API routes for leaderboard and achievement system

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..dependencies import get_db, get_current_user
from ..schemas.leaderboard import (
    LeaderboardResponse, UserRankResponse, AchievementResponse,
    ChallengeResponse, ChallengeCreateRequest, ChallengeParticipationResponse
)
from ...services.leaderboard_service import LeaderboardService
from ...models.leaderboard import LeaderboardType, AchievementType, Achievement, Challenge, ChallengeParticipation
from ...models.user import User

router = APIRouter(prefix="/leaderboards", tags=["leaderboards"])

@router.get("/", response_model=List[LeaderboardResponse])
async def get_leaderboard(
    leaderboard_type: LeaderboardType = Query(..., description="Type of leaderboard"),
    period: str = Query("current_month", description="Time period (current_month, last_month, current_week, last_week)"),
    limit: int = Query(50, ge=1, le=100, description="Number of entries to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: Session = Depends(get_db)
):
    """Get leaderboard entries for a specific type and period"""
    
    service = LeaderboardService(db)
    
    # Calculate period dates
    period_start, period_end = _get_period_dates(period)
    
    # Update leaderboard if needed (async in production)
    service.update_leaderboards(leaderboard_type, period_start, period_end)
    
    # Get leaderboard data
    entries = service.get_leaderboard(leaderboard_type, period_start, limit, offset)
    
    return [LeaderboardResponse(**entry) for entry in entries]

@router.get("/my-rank", response_model=UserRankResponse)
async def get_my_rank(
    leaderboard_type: LeaderboardType = Query(..., description="Type of leaderboard"),
    period: str = Query("current_month", description="Time period"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's rank in the leaderboard"""
    
    service = LeaderboardService(db)
    
    # Calculate period dates
    period_start, period_end = _get_period_dates(period)
    
    # Get user rank
    rank_data = service.get_user_rank(current_user.id, leaderboard_type, period_start)
    
    if not rank_data:
        raise HTTPException(status_code=404, detail="User not found in leaderboard")
    
    return UserRankResponse(**rank_data)

@router.get("/types")
async def get_leaderboard_types():
    """Get available leaderboard types"""
    
    types = []
    for lb_type in LeaderboardType:
        types.append({
            "value": lb_type.value,
            "name": lb_type.value.replace("_", " ").title(),
            "description": _get_leaderboard_description(lb_type)
        })
    
    return types

@router.post("/update/{leaderboard_type}")
async def update_leaderboard(
    leaderboard_type: LeaderboardType,
    period: str = Query("current_month", description="Time period to update"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually trigger leaderboard update (admin function)"""
    
    # In production, add admin check here
    
    service = LeaderboardService(db)
    period_start, period_end = _get_period_dates(period)
    
    entries_updated = service.update_leaderboards(leaderboard_type, period_start, period_end)
    
    return {"message": f"Updated {entries_updated} leaderboard entries"}

@router.get("/achievements/my", response_model=List[AchievementResponse])
async def get_my_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's achievements"""
    
    achievements = db.query(Achievement).filter(
        Achievement.user_id == current_user.id,
        Achievement.is_active == True
    ).order_by(Achievement.earned_at.desc()).all()
    
    return [AchievementResponse.from_orm(achievement) for achievement in achievements]

@router.post("/achievements/check")
async def check_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check and award new achievements for current user"""
    
    service = LeaderboardService(db)
    new_achievements = service.check_and_award_achievements(current_user.id)
    
    return {"message": f"Awarded {new_achievements} new achievements"}

@router.get("/achievements/types")
async def get_achievement_types():
    """Get available achievement types with descriptions"""
    
    types = []
    for achievement_type in AchievementType:
        types.append({
            "value": achievement_type.value,
            "name": achievement_type.value.replace("_", " ").title(),
            "description": _get_achievement_description(achievement_type)
        })
    
    return types

@router.get("/challenges", response_model=List[ChallengeResponse])
async def get_active_challenges(
    active_only: bool = Query(True, description="Return only active challenges"),
    db: Session = Depends(get_db)
):
    """Get list of challenges"""
    
    query = db.query(Challenge)
    
    if active_only:
        query = query.filter(Challenge.is_active == True)
    
    challenges = query.order_by(Challenge.created_at.desc()).all()
    
    return [ChallengeResponse.from_orm(challenge) for challenge in challenges]

@router.post("/challenges", response_model=ChallengeResponse)
async def create_challenge(
    challenge_data: ChallengeCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new challenge (admin function)"""
    
    # In production, add admin check here
    
    service = LeaderboardService(db)
    
    challenge = service.create_challenge(
        title=challenge_data.title,
        description=challenge_data.description,
        challenge_type=challenge_data.challenge_type,
        target_metric=challenge_data.target_metric,
        start_date=challenge_data.start_date,
        end_date=challenge_data.end_date,
        rules=challenge_data.rules,
        rewards=challenge_data.rewards
    )
    
    return ChallengeResponse.from_orm(challenge)

@router.post("/challenges/{challenge_id}/join", response_model=ChallengeParticipationResponse)
async def join_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join a challenge"""
    
    service = LeaderboardService(db)
    
    # Check if challenge exists and is active
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    if not challenge.is_active:
        raise HTTPException(status_code=400, detail="Challenge is not active")
    
    if datetime.now() > challenge.end_date:
        raise HTTPException(status_code=400, detail="Challenge has ended")
    
    participation = service.join_challenge(current_user.id, challenge_id)
    
    return ChallengeParticipationResponse.from_orm(participation)

@router.get("/challenges/{challenge_id}/leaderboard")
async def get_challenge_leaderboard(
    challenge_id: int,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Get leaderboard for a specific challenge"""
    
    # Update challenge scores
    service = LeaderboardService(db)
    service.update_challenge_scores(challenge_id)
    
    # Get participants with scores
    participants = db.query(ChallengeParticipation).filter(
        ChallengeParticipation.challenge_id == challenge_id
    ).order_by(ChallengeParticipation.current_rank).offset(offset).limit(limit).all()
    
    leaderboard = []
    for participation in participants:
        user = db.query(User).filter(User.id == participation.user_id).first()
        
        leaderboard.append({
            "rank": participation.current_rank,
            "anonymous_id": f"Challenger_{participation.user_id % 10000:04d}",  # Simple anonymization
            "score": participation.current_score,
            "trades_count": participation.trades_count,
            "joined_at": participation.joined_at
        })
    
    return leaderboard

@router.get("/stats/global")
async def get_global_stats(db: Session = Depends(get_db)):
    """Get global leaderboard statistics"""
    
    total_users = db.query(User).filter(User.is_active == True).count()
    
    # Calculate current month participation
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    current_month_participants = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.period_start == current_month_start
    ).count()
    
    # Active challenges
    active_challenges = db.query(Challenge).filter(Challenge.is_active == True).count()
    
    # Total achievements awarded this month
    achievements_this_month = db.query(Achievement).filter(
        Achievement.earned_at >= current_month_start
    ).count()
    
    return {
        "total_active_users": total_users,
        "current_month_participants": current_month_participants,
        "active_challenges": active_challenges,
        "achievements_awarded_this_month": achievements_this_month,
        "leaderboard_types": len(LeaderboardType),
        "achievement_types": len(AchievementType)
    }

# Helper functions

def _get_period_dates(period: str) -> tuple:
    """Calculate start and end dates for period"""
    
    now = datetime.now()
    
    if period == "current_month":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if now.month == 12:
            end = start.replace(year=now.year + 1, month=1)
        else:
            end = start.replace(month=now.month + 1)
    
    elif period == "last_month":
        if now.month == 1:
            start = now.replace(year=now.year - 1, month=12, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start = now.replace(month=now.month - 1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    elif period == "current_week":
        start = now - timedelta(days=now.weekday())
        start = start.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=7)
    
    elif period == "last_week":
        current_week_start = now - timedelta(days=now.weekday())
        start = current_week_start - timedelta(days=7)
        start = start.replace(hour=0, minute=0, second=0, microsecond=0)
        end = current_week_start.replace(hour=0, minute=0, second=0, microsecond=0)
    
    else:
        raise HTTPException(status_code=400, detail="Invalid period")
    
    return start, end

def _get_leaderboard_description(leaderboard_type: LeaderboardType) -> str:
    """Get description for leaderboard type"""
    
    descriptions = {
        LeaderboardType.MONTHLY_WIN_RATE: "Traders with highest win rate this month (minimum 5 trades)",
        LeaderboardType.MONTHLY_PROFIT_FACTOR: "Traders with best profit factor this month",
        LeaderboardType.MONTHLY_MAX_DRAWDOWN: "Traders with lowest maximum drawdown (best risk control)",
        LeaderboardType.WEEKLY_CONSISTENCY: "Most consistent traders this week",
        LeaderboardType.SETUP_SPECIFIC: "Best performance on specific trading setups",
        LeaderboardType.DAILY_CHALLENGE: "Daily trading challenges and competitions",
        LeaderboardType.STREAK_MASTER: "Traders with longest win streaks",
        LeaderboardType.RISK_MANAGER: "Best risk management scores"
    }
    
    return descriptions.get(leaderboard_type, "Trading performance leaderboard")

def _get_achievement_description(achievement_type: AchievementType) -> str:
    """Get description for achievement type"""
    
    descriptions = {
        AchievementType.CONSISTENCY_KING: "Maintain 80%+ win rate with at least 20 trades",
        AchievementType.RISK_MANAGER: "Achieve 3.0+ profit factor with at least 15 trades",
        AchievementType.ICT_KILLZONE_MASTER: "75%+ win rate on ICT Kill Zone setups",
        AchievementType.MMXM_BREAKOUT_EXPERT: "75%+ win rate on MMXM breakout setups",
        AchievementType.PLAN_FOLLOWER: "Follow trading plan in 90%+ of trades",
        AchievementType.EARLY_BIRD: "Consistent pre-market planning for 10+ days",
        AchievementType.WIN_STREAK_5: "Win 5 consecutive trades",
        AchievementType.WIN_STREAK_10: "Win 10 consecutive trades",
        AchievementType.WIN_STREAK_20: "Win 20 consecutive trades - Legendary achievement!"
    }
    
    return descriptions.get(achievement_type, "Trading achievement")
