# File: backend/services/leaderboard_service.py
# Purpose: Service for managing leaderboards, achievements, and challenges

import hashlib
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
import json

from ..models.leaderboard import (
    LeaderboardEntry, Achievement, Challenge, ChallengeParticipation, UserStats,
    LeaderboardType, AchievementType
)
from ..models.trade import Trade, TradeOutcome
from ..models.user import User
from ..models.daily_plan import DailyPlan

class LeaderboardService:
    """Service for managing competitive features and leaderboards"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def generate_anonymous_id(self, user_id: int, period_start: datetime) -> str:
        """Generate anonymous identifier for leaderboard display"""
        # Create a hash based on user_id and period to ensure consistency within period
        # but anonymity across periods
        hash_input = f"{user_id}_{period_start.isoformat()}_{uuid.uuid4().hex[:8]}"
        hash_digest = hashlib.md5(hash_input.encode()).hexdigest()[:8]
        
        # Generate a fun trading name
        prefixes = [
            "TradeMaster", "ScalpKing", "SwingLord", "RiskMaster", "ProfitHunter",
            "ChartWizard", "MarketNinja", "TrendRider", "BreakoutPro", "MomentumAce",
            "ICTGuru", "MMXMExpert", "PatternSeeker", "VolatilityKing", "FlowTrader"
        ]
        prefix = prefixes[int(hash_digest[:2], 16) % len(prefixes)]
        return f"{prefix}_{hash_digest[-4:]}"
    
    def calculate_user_stats(self, user_id: int, period_start: datetime = None, period_end: datetime = None) -> Dict:
        """Calculate comprehensive trading statistics for a user"""
        
        # Base query for trades
        query = self.db.query(Trade).filter(Trade.user_id == user_id)
        
        # Apply date filters if provided
        if period_start:
            query = query.filter(Trade.entry_time >= period_start)
        if period_end:
            query = query.filter(Trade.entry_time <= period_end)
        
        trades = query.all()
        
        if not trades:
            return self._empty_stats()
        
        # Basic counts
        total_trades = len(trades)
        wins = [t for t in trades if t.outcome == TradeOutcome.WIN]
        losses = [t for t in trades if t.outcome == TradeOutcome.LOSS]
        breakevens = [t for t in trades if t.outcome == TradeOutcome.BREAKEVEN]
        
        # Performance calculations
        win_count = len(wins)
        loss_count = len(losses)
        win_rate = (win_count / total_trades * 100) if total_trades > 0 else 0
        
        # P&L calculations
        total_pnl = sum(t.profit_loss for t in trades if t.profit_loss)
        winning_pnl = sum(t.profit_loss for t in wins if t.profit_loss)
        losing_pnl = sum(t.profit_loss for t in losses if t.profit_loss)
        
        avg_win = winning_pnl / win_count if win_count > 0 else 0
        avg_loss = losing_pnl / loss_count if loss_count > 0 else 0
        profit_factor = abs(winning_pnl / losing_pnl) if losing_pnl != 0 else float('inf')
        
        # Risk metrics
        largest_win = max((t.profit_loss for t in wins if t.profit_loss), default=0)
        largest_loss = min((t.profit_loss for t in losses if t.profit_loss), default=0)
        
        # Calculate drawdown
        max_drawdown = self._calculate_max_drawdown(trades)
        
        # Streak calculations
        current_streak, current_streak_type = self._calculate_current_streak(trades)
        max_win_streak = self._calculate_max_streak(trades, TradeOutcome.WIN)
        max_loss_streak = self._calculate_max_streak(trades, TradeOutcome.LOSS)
        
        # Consistency score (custom metric based on multiple factors)
        consistency_score = self._calculate_consistency_score(trades)
        
        # Plan adherence rate
        plan_adherence_rate = self._calculate_plan_adherence_rate(trades)
        
        # Risk management score
        risk_score = self._calculate_risk_score(trades)
        
        # Setup-specific statistics
        setup_stats = self._calculate_setup_stats(trades)
        
        return {
            'total_trades': total_trades,
            'win_count': win_count,
            'loss_count': loss_count,
            'breakeven_count': len(breakevens),
            'win_rate': round(win_rate, 2),
            'total_pnl': round(total_pnl, 2),
            'profit_factor': round(profit_factor, 2) if profit_factor != float('inf') else 999.99,
            'avg_win': round(avg_win, 2),
            'avg_loss': round(avg_loss, 2),
            'largest_win': round(largest_win, 2),
            'largest_loss': round(largest_loss, 2),
            'max_drawdown': round(max_drawdown, 2),
            'current_streak': current_streak,
            'current_streak_type': current_streak_type,
            'max_win_streak': max_win_streak,
            'max_loss_streak': max_loss_streak,
            'consistency_score': round(consistency_score, 2),
            'plan_adherence_rate': round(plan_adherence_rate, 2),
            'risk_score': round(risk_score, 2),
            'setup_stats': setup_stats
        }
    
    def update_leaderboards(self, leaderboard_type: LeaderboardType, period_start: datetime, period_end: datetime):
        """Update leaderboard entries for a specific period"""
        
        # Get all users who traded in this period
        user_ids = self.db.query(Trade.user_id).filter(
            and_(Trade.entry_time >= period_start, Trade.entry_time <= period_end)
        ).distinct().all()
        
        entries = []
        for (user_id,) in user_ids:
            stats = self.calculate_user_stats(user_id, period_start, period_end)
            
            # Skip users with insufficient data
            if stats['total_trades'] < 5:  # Minimum trades for leaderboard inclusion
                continue
            
            # Create or update leaderboard entry
            entry = self.db.query(LeaderboardEntry).filter(
                and_(
                    LeaderboardEntry.user_id == user_id,
                    LeaderboardEntry.leaderboard_type == leaderboard_type,
                    LeaderboardEntry.period_start == period_start
                )
            ).first()
            
            if not entry:
                entry = LeaderboardEntry(
                    user_id=user_id,
                    leaderboard_type=leaderboard_type,
                    period_start=period_start,
                    period_end=period_end,
                    anonymous_id=self.generate_anonymous_id(user_id, period_start)
                )
                self.db.add(entry)
            
            # Update metrics based on leaderboard type
            entry.win_rate = stats['win_rate']
            entry.profit_factor = stats['profit_factor']
            entry.total_trades = stats['total_trades']
            entry.total_pnl = stats['total_pnl']
            entry.max_drawdown = stats['max_drawdown']
            entry.consistency_score = stats['consistency_score']
            entry.risk_score = stats['risk_score']
            
            entries.append(entry)
        
        # Calculate rankings
        self._calculate_rankings(entries, leaderboard_type)
        
        self.db.commit()
        return len(entries)
    
    def get_leaderboard(self, leaderboard_type: LeaderboardType, period_start: datetime, 
                       limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get leaderboard entries for display"""
        
        # Determine the sorting metric based on leaderboard type
        sort_column = self._get_sort_column(leaderboard_type)
        
        entries = self.db.query(LeaderboardEntry).filter(
            and_(
                LeaderboardEntry.leaderboard_type == leaderboard_type,
                LeaderboardEntry.period_start == period_start
            )
        ).order_by(asc(LeaderboardEntry.rank)).offset(offset).limit(limit).all()
        
        result = []
        for entry in entries:
            result.append({
                'rank': entry.rank,
                'anonymous_id': entry.anonymous_id,
                'win_rate': entry.win_rate,
                'profit_factor': entry.profit_factor,
                'total_trades': entry.total_trades,
                'total_pnl': entry.total_pnl,
                'max_drawdown': entry.max_drawdown,
                'consistency_score': entry.consistency_score,
                'risk_score': entry.risk_score,
                'percentile': entry.percentile
            })
        
        return result
    
    def get_user_rank(self, user_id: int, leaderboard_type: LeaderboardType, 
                     period_start: datetime) -> Optional[Dict]:
        """Get a specific user's rank in the leaderboard"""
        
        entry = self.db.query(LeaderboardEntry).filter(
            and_(
                LeaderboardEntry.user_id == user_id,
                LeaderboardEntry.leaderboard_type == leaderboard_type,
                LeaderboardEntry.period_start == period_start
            )
        ).first()
        
        if not entry:
            return None
        
        return {
            'rank': entry.rank,
            'anonymous_id': entry.anonymous_id,
            'win_rate': entry.win_rate,
            'profit_factor': entry.profit_factor,
            'total_trades': entry.total_trades,
            'total_pnl': entry.total_pnl,
            'percentile': entry.percentile,
            'total_participants': self.db.query(LeaderboardEntry).filter(
                and_(
                    LeaderboardEntry.leaderboard_type == leaderboard_type,
                    LeaderboardEntry.period_start == period_start
                )
            ).count()
        }
    
    def check_and_award_achievements(self, user_id: int):
        """Check if user has earned any new achievements"""
        
        # Get current user stats
        stats = self.calculate_user_stats(user_id)
        recent_trades = self.db.query(Trade).filter(
            and_(
                Trade.user_id == user_id,
                Trade.entry_time >= datetime.now() - timedelta(days=30)
            )
        ).order_by(desc(Trade.entry_time)).all()
        
        new_achievements = []
        
        # Check performance achievements
        new_achievements.extend(self._check_performance_achievements(user_id, stats))
        
        # Check behavioral achievements
        new_achievements.extend(self._check_behavioral_achievements(user_id, recent_trades))
        
        # Check streak achievements
        new_achievements.extend(self._check_streak_achievements(user_id, stats, recent_trades))
        
        # Award new achievements
        for achievement_type, criteria in new_achievements:
            if not self._has_achievement(user_id, achievement_type):
                self._award_achievement(user_id, achievement_type, criteria)
        
        self.db.commit()
        return len(new_achievements)
    
    def create_challenge(self, title: str, description: str, challenge_type: str,
                        target_metric: str, start_date: datetime, end_date: datetime,
                        rules: Dict = None, rewards: Dict = None) -> Challenge:
        """Create a new trading challenge"""
        
        challenge = Challenge(
            title=title,
            description=description,
            challenge_type=challenge_type,
            target_metric=target_metric,
            start_date=start_date,
            end_date=end_date,
            rules=rules or {},
            rewards=rewards or {},
            is_active=True
        )
        
        self.db.add(challenge)
        self.db.commit()
        self.db.refresh(challenge)
        
        return challenge
    
    def join_challenge(self, user_id: int, challenge_id: int) -> ChallengeParticipation:
        """Join a user to a challenge"""
        
        # Check if already participating
        existing = self.db.query(ChallengeParticipation).filter(
            and_(
                ChallengeParticipation.user_id == user_id,
                ChallengeParticipation.challenge_id == challenge_id
            )
        ).first()
        
        if existing:
            return existing
        
        participation = ChallengeParticipation(
            user_id=user_id,
            challenge_id=challenge_id
        )
        
        self.db.add(participation)
        
        # Update challenge participant count
        challenge = self.db.query(Challenge).filter(Challenge.id == challenge_id).first()
        if challenge:
            challenge.current_participants += 1
        
        self.db.commit()
        self.db.refresh(participation)
        
        return participation
    
    def update_challenge_scores(self, challenge_id: int):
        """Update scores for all participants in a challenge"""
        
        challenge = self.db.query(Challenge).filter(Challenge.id == challenge_id).first()
        if not challenge:
            return
        
        participants = self.db.query(ChallengeParticipation).filter(
            ChallengeParticipation.challenge_id == challenge_id
        ).all()
        
        scores = []
        for participation in participants:
            stats = self.calculate_user_stats(
                participation.user_id, 
                challenge.start_date, 
                challenge.end_date
            )
            
            # Calculate score based on challenge target metric
            score = stats.get(challenge.target_metric, 0)
            participation.current_score = score
            participation.trades_count = stats['total_trades']
            
            scores.append((participation, score))
        
        # Sort and assign ranks
        scores.sort(key=lambda x: x[1], reverse=True)
        for rank, (participation, score) in enumerate(scores, 1):
            participation.current_rank = rank
        
        self.db.commit()
    
    # Helper methods
    
    def _empty_stats(self) -> Dict:
        """Return empty statistics dictionary"""
        return {
            'total_trades': 0, 'win_count': 0, 'loss_count': 0, 'breakeven_count': 0,
            'win_rate': 0, 'total_pnl': 0, 'profit_factor': 0, 'avg_win': 0, 'avg_loss': 0,
            'largest_win': 0, 'largest_loss': 0, 'max_drawdown': 0, 'current_streak': 0,
            'current_streak_type': None, 'max_win_streak': 0, 'max_loss_streak': 0,
            'consistency_score': 0, 'plan_adherence_rate': 0, 'risk_score': 0, 'setup_stats': {}
        }
    
    def _calculate_max_drawdown(self, trades: List[Trade]) -> float:
        """Calculate maximum drawdown from running P&L"""
        if not trades:
            return 0
        
        # Sort trades by time
        sorted_trades = sorted(trades, key=lambda t: t.entry_time)
        
        running_pnl = 0
        peak = 0
        max_drawdown = 0
        
        for trade in sorted_trades:
            if trade.profit_loss:
                running_pnl += trade.profit_loss
                if running_pnl > peak:
                    peak = running_pnl
                drawdown = peak - running_pnl
                if drawdown > max_drawdown:
                    max_drawdown = drawdown
        
        return max_drawdown
    
    def _calculate_current_streak(self, trades: List[Trade]) -> Tuple[int, Optional[str]]:
        """Calculate current win/loss streak"""
        if not trades:
            return 0, None
        
        # Sort trades by time (most recent first)
        sorted_trades = sorted(trades, key=lambda t: t.entry_time, reverse=True)
        
        if not sorted_trades:
            return 0, None
        
        streak_type = sorted_trades[0].outcome.value.lower()
        if streak_type == 'breakeven':
            return 0, None
        
        streak = 0
        for trade in sorted_trades:
            if trade.outcome.value.lower() == streak_type:
                streak += 1
            else:
                break
        
        return streak, streak_type
    
    def _calculate_max_streak(self, trades: List[Trade], outcome: TradeOutcome) -> int:
        """Calculate maximum consecutive streak of specific outcome"""
        if not trades:
            return 0
        
        sorted_trades = sorted(trades, key=lambda t: t.entry_time)
        max_streak = 0
        current_streak = 0
        
        for trade in sorted_trades:
            if trade.outcome == outcome:
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0
        
        return max_streak
    
    def _calculate_consistency_score(self, trades: List[Trade]) -> float:
        """Calculate custom consistency score based on multiple factors"""
        if not trades or len(trades) < 5:
            return 0
        
        # Factors that contribute to consistency:
        # 1. Standard deviation of returns (lower is better)
        # 2. Win rate stability over time
        # 3. Plan adherence rate
        # 4. Risk management consistency
        
        returns = [t.profit_loss for t in trades if t.profit_loss]
        if not returns:
            return 0
        
        # Calculate return standard deviation (normalized)
        mean_return = sum(returns) / len(returns)
        variance = sum((r - mean_return) ** 2 for r in returns) / len(returns)
        std_dev = variance ** 0.5
        
        # Normalize std dev (lower values get higher scores)
        std_score = max(0, 100 - (std_dev / abs(mean_return) * 100)) if mean_return != 0 else 50
        
        # Plan adherence consistency
        adherence_score = self._calculate_plan_adherence_rate(trades)
        
        # Risk consistency (based on position sizing consistency)
        risk_consistency = self._calculate_risk_consistency(trades)
        
        # Combine scores (weighted average)
        consistency = (std_score * 0.4 + adherence_score * 0.3 + risk_consistency * 0.3)
        
        return min(100, max(0, consistency))
    
    def _calculate_plan_adherence_rate(self, trades: List[Trade]) -> float:
        """Calculate percentage of trades that followed the plan"""
        if not trades:
            return 0
        
        plan_trades = [t for t in trades if hasattr(t, 'plan_adherence') and t.plan_adherence]
        if not plan_trades:
            return 0
        
        followed_plan = sum(1 for t in plan_trades if t.plan_adherence.value in ['Followed', 'Partial'])
        return (followed_plan / len(plan_trades)) * 100
    
    def _calculate_risk_score(self, trades: List[Trade]) -> float:
        """Calculate risk management score"""
        if not trades:
            return 0
        
        # Factors: consistent position sizing, proper stop losses, good R:R ratios
        
        risk_scores = []
        
        for trade in trades:
            score = 0
            
            # R:R ratio score
            if trade.actual_risk_reward and trade.actual_risk_reward > 0:
                if trade.actual_risk_reward >= 2:
                    score += 40
                elif trade.actual_risk_reward >= 1:
                    score += 20
            
            # Plan adherence for risk
            if hasattr(trade, 'plan_adherence') and trade.plan_adherence:
                if trade.plan_adherence.value == 'Followed':
                    score += 30
                elif trade.plan_adherence.value == 'Partial':
                    score += 15
            
            # Position size consistency (bonus for keeping sizes reasonable)
            if trade.position_size and 0 < trade.position_size <= 10:  # Assuming reasonable range
                score += 30
            
            risk_scores.append(score)
        
        return sum(risk_scores) / len(risk_scores) if risk_scores else 0
    
    def _calculate_risk_consistency(self, trades: List[Trade]) -> float:
        """Calculate consistency of risk management"""
        if not trades:
            return 0
        
        position_sizes = [t.position_size for t in trades if t.position_size]
        if len(position_sizes) < 2:
            return 50  # Default score for insufficient data
        
        # Calculate coefficient of variation for position sizes
        mean_size = sum(position_sizes) / len(position_sizes)
        variance = sum((s - mean_size) ** 2 for s in position_sizes) / len(position_sizes)
        std_dev = variance ** 0.5
        
        cv = (std_dev / mean_size) if mean_size > 0 else 1
        
        # Convert to score (lower CV = higher consistency)
        return max(0, 100 - (cv * 100))
    
    def _calculate_setup_stats(self, trades: List[Trade]) -> Dict:
        """Calculate statistics by setup type"""
        setup_stats = {}
        
        for trade in trades:
            setup = trade.setup_type or 'Unknown'
            if setup not in setup_stats:
                setup_stats[setup] = {'trades': 0, 'wins': 0, 'total_pnl': 0}
            
            setup_stats[setup]['trades'] += 1
            if trade.outcome == TradeOutcome.WIN:
                setup_stats[setup]['wins'] += 1
            if trade.profit_loss:
                setup_stats[setup]['total_pnl'] += trade.profit_loss
        
        # Calculate win rates
        for setup, stats in setup_stats.items():
            stats['win_rate'] = (stats['wins'] / stats['trades'] * 100) if stats['trades'] > 0 else 0
            stats['win_rate'] = round(stats['win_rate'], 2)
            stats['total_pnl'] = round(stats['total_pnl'], 2)
        
        return setup_stats
    
    def _calculate_rankings(self, entries: List[LeaderboardEntry], leaderboard_type: LeaderboardType):
        """Calculate rankings and percentiles for leaderboard entries"""
        
        # Sort entries based on leaderboard type
        if leaderboard_type == LeaderboardType.MONTHLY_WIN_RATE:
            entries.sort(key=lambda e: e.win_rate, reverse=True)
        elif leaderboard_type == LeaderboardType.MONTHLY_PROFIT_FACTOR:
            entries.sort(key=lambda e: e.profit_factor, reverse=True)
        elif leaderboard_type == LeaderboardType.MONTHLY_MAX_DRAWDOWN:
            entries.sort(key=lambda e: e.max_drawdown)  # Lower is better
        elif leaderboard_type == LeaderboardType.WEEKLY_CONSISTENCY:
            entries.sort(key=lambda e: e.consistency_score, reverse=True)
        elif leaderboard_type == LeaderboardType.RISK_MANAGER:
            entries.sort(key=lambda e: e.risk_score, reverse=True)
        
        # Assign ranks and percentiles
        total_entries = len(entries)
        for i, entry in enumerate(entries):
            entry.rank = i + 1
            entry.percentile = ((total_entries - i) / total_entries) * 100 if total_entries > 0 else 0
    
    def _get_sort_column(self, leaderboard_type: LeaderboardType):
        """Get the appropriate column for sorting leaderboard"""
        mapping = {
            LeaderboardType.MONTHLY_WIN_RATE: 'win_rate',
            LeaderboardType.MONTHLY_PROFIT_FACTOR: 'profit_factor',
            LeaderboardType.MONTHLY_MAX_DRAWDOWN: 'max_drawdown',
            LeaderboardType.WEEKLY_CONSISTENCY: 'consistency_score',
            LeaderboardType.RISK_MANAGER: 'risk_score'
        }
        return mapping.get(leaderboard_type, 'win_rate')
    
    def _check_performance_achievements(self, user_id: int, stats: Dict) -> List[Tuple]:
        """Check for performance-based achievements"""
        achievements = []
        
        # Win rate achievements
        if stats['win_rate'] >= 80 and stats['total_trades'] >= 20:
            achievements.append((AchievementType.CONSISTENCY_KING, {'win_rate': stats['win_rate']}))
        
        # Profit factor achievements
        if stats['profit_factor'] >= 3.0 and stats['total_trades'] >= 15:
            achievements.append((AchievementType.RISK_MANAGER, {'profit_factor': stats['profit_factor']}))
        
        # Setup mastery
        for setup, setup_stats in stats['setup_stats'].items():
            if setup_stats['win_rate'] >= 75 and setup_stats['trades'] >= 10:
                if 'ICT' in setup.upper():
                    achievements.append((AchievementType.ICT_KILLZONE_MASTER, setup_stats))
                elif 'MMXM' in setup.upper():
                    achievements.append((AchievementType.MMXM_BREAKOUT_EXPERT, setup_stats))
        
        return achievements
    
    def _check_behavioral_achievements(self, user_id: int, recent_trades: List[Trade]) -> List[Tuple]:
        """Check for behavioral achievements"""
        achievements = []
        
        # Plan adherence
        if recent_trades:
            adherence_rate = self._calculate_plan_adherence_rate(recent_trades)
            if adherence_rate >= 90 and len(recent_trades) >= 10:
                achievements.append((AchievementType.PLAN_FOLLOWER, {'adherence_rate': adherence_rate}))
        
        # Early bird (consistent pre-market planning)
        # Check if user has daily plans for most trading days
        recent_plans = self.db.query(DailyPlan).filter(
            and_(
                DailyPlan.user_id == user_id,
                DailyPlan.date >= datetime.now().date() - timedelta(days=14)
            )
        ).count()
        
        if recent_plans >= 10:  # 10 out of last 14 days
            achievements.append((AchievementType.EARLY_BIRD, {'plans_count': recent_plans}))
        
        return achievements
    
    def _check_streak_achievements(self, user_id: int, stats: Dict, recent_trades: List[Trade]) -> List[Tuple]:
        """Check for streak-based achievements"""
        achievements = []
        
        # Win streak achievements
        current_streak = stats['current_streak']
        streak_type = stats['current_streak_type']
        
        if streak_type == 'win':
            if current_streak >= 20:
                achievements.append((AchievementType.WIN_STREAK_20, {'streak': current_streak}))
            elif current_streak >= 10:
                achievements.append((AchievementType.WIN_STREAK_10, {'streak': current_streak}))
            elif current_streak >= 5:
                achievements.append((AchievementType.WIN_STREAK_5, {'streak': current_streak}))
        
        # Green week/month achievements would require additional date-based analysis
        
        return achievements
    
    def _has_achievement(self, user_id: int, achievement_type: AchievementType) -> bool:
        """Check if user already has a specific achievement"""
        return self.db.query(Achievement).filter(
            and_(
                Achievement.user_id == user_id,
                Achievement.achievement_type == achievement_type,
                Achievement.is_active == True
            )
        ).first() is not None
    
    def _award_achievement(self, user_id: int, achievement_type: AchievementType, criteria: Dict):
        """Award an achievement to a user"""
        
        # Define achievement details
        achievement_details = self._get_achievement_details(achievement_type)
        
        achievement = Achievement(
            user_id=user_id,
            achievement_type=achievement_type,
            title=achievement_details['title'],
            description=achievement_details['description'],
            icon=achievement_details['icon'],
            criteria_met=criteria,
            is_active=True
        )
        
        self.db.add(achievement)
    
    def _get_achievement_details(self, achievement_type: AchievementType) -> Dict:
        """Get title, description, and icon for achievement types"""
        
        details = {
            AchievementType.CONSISTENCY_KING: {
                'title': 'Consistency King',
                'description': 'Achieved 80%+ win rate with at least 20 trades',
                'icon': 'crown'
            },
            AchievementType.RISK_MANAGER: {
                'title': 'Risk Manager',
                'description': 'Maintained 3.0+ profit factor with at least 15 trades',
                'icon': 'shield'
            },
            AchievementType.ICT_KILLZONE_MASTER: {
                'title': 'ICT Kill Zone Master',
                'description': 'Achieved 75%+ win rate on ICT setups',
                'icon': 'target'
            },
            AchievementType.MMXM_BREAKOUT_EXPERT: {
                'title': 'MMXM Breakout Expert',
                'description': 'Achieved 75%+ win rate on MMXM breakouts',
                'icon': 'trending_up'
            },
            AchievementType.PLAN_FOLLOWER: {
                'title': 'Plan Follower',
                'description': 'Followed trading plan in 90%+ of recent trades',
                'icon': 'assignment_turned_in'
            },
            AchievementType.EARLY_BIRD: {
                'title': 'Early Bird',
                'description': 'Consistent pre-market planning for 10+ days',
                'icon': 'schedule'
            },
            AchievementType.WIN_STREAK_5: {
                'title': '5-Win Streak',
                'description': 'Won 5 consecutive trades',
                'icon': 'whatshot'
            },
            AchievementType.WIN_STREAK_10: {
                'title': '10-Win Streak',
                'description': 'Won 10 consecutive trades',
                'icon': 'local_fire_department'
            },
            AchievementType.WIN_STREAK_20: {
                'title': '20-Win Streak',
                'description': 'Won 20 consecutive trades - Legendary!',
                'icon': 'military_tech'
            }
        }
        
        return details.get(achievement_type, {
            'title': achievement_type.value.replace('_', ' ').title(),
            'description': f'Earned {achievement_type.value.replace("_", " ").title()} achievement',
            'icon': 'emoji_events'
        })
