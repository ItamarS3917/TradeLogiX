# File: backend/services/statistics_service.py
# Purpose: Service functions for calculating trading statistics and analytics

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy import func, case, and_, extract
from sqlalchemy.orm import Session
import json
import statistics as stats

from ..models.trade import Trade
from ..models.daily_plan import DailyPlan

def calculate_overall_statistics(
    db: Session,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    symbol: Optional[str] = None,
    setup_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Calculate overall trading statistics with optional filters
    """
    # Build the base query with filters
    query = db.query(Trade)
    
    if start_date:
        query = query.filter(Trade.entry_time >= start_date)
    if end_date:
        # Include the entire end date by setting time to 23:59:59
        end_datetime = datetime.combine(end_date.date(), datetime.max.time())
        query = query.filter(Trade.entry_time <= end_datetime)
    if symbol:
        query = query.filter(Trade.symbol == symbol)
    if setup_type:
        query = query.filter(Trade.setup_type == setup_type)
    
    # Execute the query to get all filtered trades
    trades = query.all()
    
    # Calculate statistics from the trades
    total_trades = len(trades)
    
    if total_trades == 0:
        return {
            "totalTrades": 0,
            "winRate": 0,
            "profitFactor": 0,
            "netProfit": 0,
            "grossProfit": 0,
            "grossLoss": 0,
            "averageWin": 0,
            "averageLoss": 0,
            "largestWin": 0,
            "largestLoss": 0,
            "averageRiskReward": 0,
            "averageTradeDuration": 0,
            "profitableTradeCount": 0,
            "unprofitableTradeCount": 0,
            "streakData": {
                "currentStreak": 0,
                "currentStreakType": "none",
                "longestWinStreak": 0,
                "longestLossStreak": 0,
                "consistency": 0,
                "lastTwoWeeks": []
            },
            "dailyPnL": []
        }
    
    # Calculate win/loss statistics
    winning_trades = [trade for trade in trades if trade.outcome == "Win"]
    losing_trades = [trade for trade in trades if trade.outcome == "Loss"]
    breakeven_trades = [trade for trade in trades if trade.outcome == "Breakeven"]
    
    win_count = len(winning_trades)
    loss_count = len(losing_trades)
    breakeven_count = len(breakeven_trades)
    
    # Calculate win rate
    win_rate = round((win_count / total_trades) * 100, 2) if total_trades > 0 else 0
    
    # Calculate profit statistics
    net_profit = sum(trade.profit_loss for trade in trades)
    gross_profit = sum(trade.profit_loss for trade in trades if trade.profit_loss > 0)
    gross_loss = sum(trade.profit_loss for trade in trades if trade.profit_loss < 0)
    
    # Calculate profit factor
    profit_factor = abs(gross_profit / gross_loss) if gross_loss != 0 else (1 if gross_profit > 0 else 0)
    
    # Calculate average win/loss
    average_win = gross_profit / win_count if win_count > 0 else 0
    average_loss = gross_loss / loss_count if loss_count > 0 else 0
    
    # Calculate largest win/loss
    largest_win = max((trade.profit_loss for trade in winning_trades), default=0)
    largest_loss = min((trade.profit_loss for trade in losing_trades), default=0)
    
    # Calculate average risk/reward ratio
    risk_rewards = [trade.actual_risk_reward for trade in trades if trade.actual_risk_reward is not None]
    average_risk_reward = sum(risk_rewards) / len(risk_rewards) if risk_rewards else 0
    
    # Calculate average trade duration in minutes
    durations = []
    for trade in trades:
        if trade.entry_time and trade.exit_time:
            duration = (trade.exit_time - trade.entry_time).total_seconds() / 60
            durations.append(duration)
    
    average_duration = sum(durations) / len(durations) if durations else 0
    
    # Calculate streak data
    streak_data = calculate_streak_data(db, trades)
    
    # Calculate daily P&L
    daily_pnl = calculate_daily_pnl(trades)
    
    # Assemble the result
    return {
        "totalTrades": total_trades,
        "winRate": win_rate,
        "profitFactor": profit_factor,
        "netProfit": net_profit,
        "grossProfit": gross_profit,
        "grossLoss": gross_loss,
        "averageWin": average_win,
        "averageLoss": average_loss,
        "largestWin": largest_win,
        "largestLoss": largest_loss,
        "averageRiskReward": average_risk_reward,
        "averageTradeDuration": average_duration,
        "profitableTradeCount": win_count,
        "unprofitableTradeCount": loss_count,
        "streakData": streak_data,
        "dailyPnL": daily_pnl
    }

def calculate_streak_data(db: Session, trades: List[Trade]) -> Dict[str, Any]:
    """
    Calculate streak data based on trade history
    """
    if not trades:
        return {
            "currentStreak": 0,
            "currentStreakType": "none",
            "longestWinStreak": 0,
            "longestLossStreak": 0,
            "consistency": 0,
            "lastTwoWeeks": []
        }
    
    # Sort trades by date
    sorted_trades = sorted(trades, key=lambda x: x.entry_time or datetime.min)
    
    # Calculate streaks
    current_streak = 0
    current_streak_type = "none"
    longest_win_streak = 0
    longest_loss_streak = 0
    current_win_streak = 0
    current_loss_streak = 0
    
    for trade in sorted_trades:
        if trade.outcome == "Win":
            if current_streak_type == "win":
                current_streak += 1
            else:
                current_streak = 1
                current_streak_type = "win"
            
            current_win_streak += 1
            current_loss_streak = 0
            longest_win_streak = max(longest_win_streak, current_win_streak)
        elif trade.outcome == "Loss":
            if current_streak_type == "loss":
                current_streak += 1
            else:
                current_streak = 1
                current_streak_type = "loss"
            
            current_loss_streak += 1
            current_win_streak = 0
            longest_loss_streak = max(longest_loss_streak, current_loss_streak)
        else:  # Breakeven
            # Breakeven trades don't affect streaks
            pass
    
    # Calculate consistency score (0-100)
    # Simple version: 100 - (longest_loss_streak / total_trades * 100)
    consistency = max(0, min(100, 100 - (longest_loss_streak / len(trades) * 100)))
    
    # Generate last two weeks data
    today = datetime.now().date()
    two_weeks_ago = today - timedelta(days=14)
    
    # Create a dict for each day in the last two weeks
    last_two_weeks = []
    for i in range(14):
        day = two_weeks_ago + timedelta(days=i)
        day_trades = [trade for trade in trades if trade.entry_time and trade.entry_time.date() == day]
        
        if day_trades:
            # Determine outcome based on P&L for the day
            day_pnl = sum(trade.profit_loss for trade in day_trades)
            outcome = "win" if day_pnl > 0 else "loss" if day_pnl < 0 else "breakeven"
            
            last_two_weeks.append({
                "date": day.strftime("%Y-%m-%d"),
                "tradeCount": len(day_trades),
                "profit_loss": day_pnl,
                "outcome": outcome
            })
        else:
            # No trades for this day
            last_two_weeks.append({
                "date": day.strftime("%Y-%m-%d"),
                "tradeCount": 0,
                "profit_loss": 0,
                "outcome": "no_trade"
            })
    
    return {
        "currentStreak": current_streak,
        "currentStreakType": current_streak_type,
        "longestWinStreak": longest_win_streak,
        "longestLossStreak": longest_loss_streak,
        "consistency": round(consistency, 2),
        "lastTwoWeeks": last_two_weeks
    }

def calculate_daily_pnl(trades: List[Trade]) -> List[Dict[str, Any]]:
    """
    Calculate daily profit and loss
    """
    if not trades:
        return []
    
    # Group trades by date
    daily_trades = {}
    for trade in trades:
        if not trade.entry_time:
            continue
        
        date_str = trade.entry_time.date().strftime("%Y-%m-%d")
        if date_str not in daily_trades:
            daily_trades[date_str] = []
        
        daily_trades[date_str].append(trade)
    
    # Calculate P&L for each day
    daily_pnl = []
    for date_str, day_trades in daily_trades.items():
        pnl = sum(trade.profit_loss for trade in day_trades)
        win_count = sum(1 for trade in day_trades if trade.outcome == "Win")
        loss_count = sum(1 for trade in day_trades if trade.outcome == "Loss")
        
        daily_pnl.append({
            "date": date_str,
            "pnl": pnl,
            "tradeCount": len(day_trades),
            "winCount": win_count,
            "lossCount": loss_count
        })
    
    # Sort by date
    sorted_daily_pnl = sorted(daily_pnl, key=lambda x: x["date"])
    
    return sorted_daily_pnl

def calculate_win_rate_by_setup(
    db: Session,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    symbol: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Calculate win rate and performance metrics by setup type
    """
    # Build the base query with filters
    query = db.query(Trade)
    
    if start_date:
        query = query.filter(Trade.entry_time >= start_date)
    if end_date:
        end_datetime = datetime.combine(end_date.date(), datetime.max.time())
        query = query.filter(Trade.entry_time <= end_datetime)
    if symbol:
        query = query.filter(Trade.symbol == symbol)
    
    # Execute the query to get all filtered trades
    trades = query.all()
    
    if not trades:
        return []
    
    # Group trades by setup type
    setup_trades = {}
    for trade in trades:
        setup = trade.setup_type or "Unknown"
        if setup not in setup_trades:
            setup_trades[setup] = []
        
        setup_trades[setup].append(trade)
    
    # Calculate metrics for each setup type
    setup_stats = []
    for setup, s_trades in setup_trades.items():
        total = len(s_trades)
        wins = sum(1 for t in s_trades if t.outcome == "Win")
        losses = sum(1 for t in s_trades if t.outcome == "Loss")
        
        win_rate = round((wins / total) * 100, 2) if total > 0 else 0
        
        win_amounts = [t.profit_loss for t in s_trades if t.outcome == "Win"]
        loss_amounts = [t.profit_loss for t in s_trades if t.outcome == "Loss"]
        
        avg_win = sum(win_amounts) / len(win_amounts) if win_amounts else 0
        avg_loss = sum(loss_amounts) / len(loss_amounts) if loss_amounts else 0
        
        gross_profit = sum(t.profit_loss for t in s_trades if t.profit_loss > 0)
        gross_loss = sum(t.profit_loss for t in s_trades if t.profit_loss < 0)
        net_profit = gross_profit + gross_loss
        
        profit_factor = abs(gross_profit / gross_loss) if gross_loss != 0 else (1 if gross_profit > 0 else 0)
        
        largest_win = max([t.profit_loss for t in s_trades if t.outcome == "Win"], default=0)
        largest_loss = min([t.profit_loss for t in s_trades if t.outcome == "Loss"], default=0)
        
        # Risk/reward metrics
        rr_values = [t.actual_risk_reward for t in s_trades if t.actual_risk_reward is not None]
        avg_rr = sum(rr_values) / len(rr_values) if rr_values else 0
        
        # Win/loss ratio
        win_loss_ratio = wins / losses if losses > 0 else (float('inf') if wins > 0 else 0)
        
        setup_stats.append({
            "setupType": setup,
            "tradeCount": total,
            "winCount": wins,
            "lossCount": losses,
            "winRate": win_rate,
            "averageWin": avg_win,
            "averageLoss": avg_loss,
            "netProfit": net_profit,
            "grossProfit": gross_profit,
            "grossLoss": gross_loss,
            "profitFactor": profit_factor,
            "largestWin": largest_win,
            "largestLoss": largest_loss,
            "averageRR": avg_rr,
            "winLossRatio": win_loss_ratio
        })
    
    # Sort by win rate (descending)
    setup_stats.sort(key=lambda x: x["winRate"], reverse=True)
    
    return setup_stats

def calculate_profitability_by_time(
    db: Session,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    symbol: Optional[str] = None,
    setup_type: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Calculate profitability metrics by time of day
    """
    # Build the base query with filters
    query = db.query(Trade)
    
    if start_date:
        query = query.filter(Trade.entry_time >= start_date)
    if end_date:
        end_datetime = datetime.combine(end_date.date(), datetime.max.time())
        query = query.filter(Trade.entry_time <= end_datetime)
    if symbol:
        query = query.filter(Trade.symbol == symbol)
    if setup_type:
        query = query.filter(Trade.setup_type == setup_type)
    
    # Execute the query to get all filtered trades
    trades = query.all()
    
    if not trades:
        return []
    
    # Define time slots (30-minute intervals)
    time_slots = [
        ("9:30-10:00", (9, 30, 10, 0)),
        ("10:00-10:30", (10, 0, 10, 30)),
        ("10:30-11:00", (10, 30, 11, 0)),
        ("11:00-11:30", (11, 0, 11, 30)),
        ("11:30-12:00", (11, 30, 12, 0)),
        ("12:00-12:30", (12, 0, 12, 30)),
        ("12:30-13:00", (12, 30, 13, 0)),
        ("13:00-13:30", (13, 0, 13, 30)),
        ("13:30-14:00", (13, 30, 14, 0)),
        ("14:00-14:30", (14, 0, 14, 30)),
        ("14:30-15:00", (14, 30, 15, 0)),
        ("15:00-15:30", (15, 0, 15, 30)),
        ("15:30-16:00", (15, 30, 16, 0)),
        # Add more time slots as needed
    ]
    
    # Group trades by time slot
    time_slot_trades = {slot[0]: [] for slot in time_slots}
    
    for trade in trades:
        if not trade.entry_time:
            continue
        
        # Convert to local time if needed
        trade_hour = trade.entry_time.hour
        trade_minute = trade.entry_time.minute
        
        # Find the matching time slot
        for slot_name, (start_h, start_m, end_h, end_m) in time_slots:
            if (trade_hour > start_h or (trade_hour == start_h and trade_minute >= start_m)) and \
               (trade_hour < end_h or (trade_hour == end_h and trade_minute < end_m)):
                time_slot_trades[slot_name].append(trade)
                break
    
    # Calculate metrics for each time slot
    time_stats = []
    for slot_name, slot_trades in time_slot_trades.items():
        if not slot_trades:
            # Include empty slots with zero values
            time_stats.append({
                "timeSlot": slot_name,
                "tradeCount": 0,
                "winCount": 0,
                "lossCount": 0,
                "winRate": 0,
                "netProfit": 0,
                "averageProfit": 0
            })
            continue
        
        total = len(slot_trades)
        wins = sum(1 for t in slot_trades if t.outcome == "Win")
        losses = sum(1 for t in slot_trades if t.outcome == "Loss")
        
        win_rate = round((wins / total) * 100, 2) if total > 0 else 0
        
        net_profit = sum(t.profit_loss for t in slot_trades)
        average_profit = net_profit / total if total > 0 else 0
        
        time_stats.append({
            "timeSlot": slot_name,
            "tradeCount": total,
            "winCount": wins,
            "lossCount": losses,
            "winRate": win_rate,
            "netProfit": net_profit,
            "averageProfit": average_profit
        })
    
    return time_stats

def calculate_risk_reward_analysis(
    db: Session,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    symbol: Optional[str] = None,
    setup_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Calculate risk/reward ratio analysis
    """
    # Build the base query with filters
    query = db.query(Trade)
    
    if start_date:
        query = query.filter(Trade.entry_time >= start_date)
    if end_date:
        end_datetime = datetime.combine(end_date.date(), datetime.max.time())
        query = query.filter(Trade.entry_time <= end_datetime)
    if symbol:
        query = query.filter(Trade.symbol == symbol)
    if setup_type:
        query = query.filter(Trade.setup_type == setup_type)
    
    # Execute the query to get all filtered trades
    trades = query.all()
    
    if not trades:
        return {
            "averagePlannedRR": 0,
            "averageActualRR": 0,
            "rrDistribution": [],
            "rrByOutcome": {},
            "planAdherenceCorrelation": 0
        }
    
    # Calculate risk/reward metrics
    planned_rr_values = [t.planned_risk_reward for t in trades if t.planned_risk_reward is not None]
    actual_rr_values = [t.actual_risk_reward for t in trades if t.actual_risk_reward is not None]
    
    avg_planned_rr = sum(planned_rr_values) / len(planned_rr_values) if planned_rr_values else 0
    avg_actual_rr = sum(actual_rr_values) / len(actual_rr_values) if actual_rr_values else 0
    
    # Group R:R values into distribution buckets
    rr_buckets = {
        "0-0.5": 0,
        "0.5-1": 0,
        "1-1.5": 0,
        "1.5-2": 0,
        "2-3": 0,
        "3-5": 0,
        "5+": 0
    }
    
    for rr in actual_rr_values:
        if rr < 0.5:
            rr_buckets["0-0.5"] += 1
        elif rr < 1:
            rr_buckets["0.5-1"] += 1
        elif rr < 1.5:
            rr_buckets["1-1.5"] += 1
        elif rr < 2:
            rr_buckets["1.5-2"] += 1
        elif rr < 3:
            rr_buckets["2-3"] += 1
        elif rr < 5:
            rr_buckets["3-5"] += 1
        else:
            rr_buckets["5+"] += 1
    
    # Convert to list format for frontend
    rr_distribution = [{"range": k, "count": v} for k, v in rr_buckets.items()]
    
    # Calculate R:R by outcome
    rr_by_outcome = {
        "Win": {
            "averagePlannedRR": 0,
            "averageActualRR": 0,
            "count": 0
        },
        "Loss": {
            "averagePlannedRR": 0,
            "averageActualRR": 0,
            "count": 0
        },
        "Breakeven": {
            "averagePlannedRR": 0,
            "averageActualRR": 0,
            "count": 0
        }
    }
    
    win_planned_rr = [t.planned_risk_reward for t in trades if t.outcome == "Win" and t.planned_risk_reward is not None]
    win_actual_rr = [t.actual_risk_reward for t in trades if t.outcome == "Win" and t.actual_risk_reward is not None]
    
    loss_planned_rr = [t.planned_risk_reward for t in trades if t.outcome == "Loss" and t.planned_risk_reward is not None]
    loss_actual_rr = [t.actual_risk_reward for t in trades if t.outcome == "Loss" and t.actual_risk_reward is not None]
    
    be_planned_rr = [t.planned_risk_reward for t in trades if t.outcome == "Breakeven" and t.planned_risk_reward is not None]
    be_actual_rr = [t.actual_risk_reward for t in trades if t.outcome == "Breakeven" and t.actual_risk_reward is not None]
    
    rr_by_outcome["Win"]["averagePlannedRR"] = sum(win_planned_rr) / len(win_planned_rr) if win_planned_rr else 0
    rr_by_outcome["Win"]["averageActualRR"] = sum(win_actual_rr) / len(win_actual_rr) if win_actual_rr else 0
    rr_by_outcome["Win"]["count"] = len(win_actual_rr)
    
    rr_by_outcome["Loss"]["averagePlannedRR"] = sum(loss_planned_rr) / len(loss_planned_rr) if loss_planned_rr else 0
    rr_by_outcome["Loss"]["averageActualRR"] = sum(loss_actual_rr) / len(loss_actual_rr) if loss_actual_rr else 0
    rr_by_outcome["Loss"]["count"] = len(loss_actual_rr)
    
    rr_by_outcome["Breakeven"]["averagePlannedRR"] = sum(be_planned_rr) / len(be_planned_rr) if be_planned_rr else 0
    rr_by_outcome["Breakeven"]["averageActualRR"] = sum(be_actual_rr) / len(be_actual_rr) if be_actual_rr else 0
    rr_by_outcome["Breakeven"]["count"] = len(be_actual_rr)
    
    # Calculate correlation between plan adherence and R:R
    plan_adherence_values = [t.plan_adherence for t in trades if t.plan_adherence is not None and t.actual_risk_reward is not None]
    corresponding_rr_values = [t.actual_risk_reward for t in trades if t.plan_adherence is not None and t.actual_risk_reward is not None]
    
    # Calculate correlation coefficient if enough data points
    if len(plan_adherence_values) > 1 and len(corresponding_rr_values) > 1:
        try:
            correlation = stats.correlation(plan_adherence_values, corresponding_rr_values)
        except:
            correlation = 0
    else:
        correlation = 0
    
    return {
        "averagePlannedRR": avg_planned_rr,
        "averageActualRR": avg_actual_rr,
        "rrDistribution": rr_distribution,
        "rrByOutcome": rr_by_outcome,
        "planAdherenceCorrelation": correlation
    }

def calculate_emotional_analysis(
    db: Session,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    symbol: Optional[str] = None,
    setup_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Calculate analysis of trading performance by emotional state
    """
    # Build the base query with filters
    query = db.query(Trade)
    
    if start_date:
        query = query.filter(Trade.entry_time >= start_date)
    if end_date:
        end_datetime = datetime.combine(end_date.date(), datetime.max.time())
        query = query.filter(Trade.entry_time <= end_datetime)
    if symbol:
        query = query.filter(Trade.symbol == symbol)
    if setup_type:
        query = query.filter(Trade.setup_type == setup_type)
    
    # Execute the query to get all filtered trades
    trades = query.all()
    
    if not trades:
        return {
            "emotions": [],
            "bestEmotionByWinRate": None,
            "worstEmotionByWinRate": None,
            "mostProfitableEmotion": None,
        }
    
    # Group trades by emotional state
    emotion_trades = {}
    for trade in trades:
        if not trade.emotional_state:
            continue
        
        emotion = trade.emotional_state
        if emotion not in emotion_trades:
            emotion_trades[emotion] = []
        
        emotion_trades[emotion].append(trade)
    
    # Calculate metrics for each emotional state
    emotion_stats = []
    for emotion, e_trades in emotion_trades.items():
        total = len(e_trades)
        if total == 0:
            continue
            
        wins = sum(1 for t in e_trades if t.outcome == "Win")
        losses = sum(1 for t in e_trades if t.outcome == "Loss")
        
        win_rate = round((wins / total) * 100, 2) if total > 0 else 0
        
        net_profit = sum(t.profit_loss for t in e_trades)
        average_profit = net_profit / total
        
        emotion_stats.append({
            "name": emotion,
            "count": total,
            "winCount": wins,
            "lossCount": losses,
            "winRate": win_rate,
            "netProfit": net_profit,
            "averageProfit": average_profit
        })
    
    # Find best and worst emotions
    if emotion_stats:
        best_emotion_by_win_rate = max(emotion_stats, key=lambda x: x["winRate"])
        worst_emotion_by_win_rate = min(emotion_stats, key=lambda x: x["winRate"])
        most_profitable_emotion = max(emotion_stats, key=lambda x: x["averageProfit"])
    else:
        best_emotion_by_win_rate = None
        worst_emotion_by_win_rate = None
        most_profitable_emotion = None
    
    return {
        "emotions": emotion_stats,
        "bestEmotionByWinRate": best_emotion_by_win_rate,
        "worstEmotionByWinRate": worst_emotion_by_win_rate,
        "mostProfitableEmotion": most_profitable_emotion,
    }

def calculate_market_condition_performance(
    db: Session,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    symbol: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Calculate analysis of trading performance by market conditions
    """
    # This would typically involve integrating with external market data
    # For now, we'll return placeholder data
    return [
        {
            "condition": "Trending Up",
            "tradeCount": 45,
            "winRate": 68.5,
            "averageProfit": 152.38
        },
        {
            "condition": "Trending Down",
            "tradeCount": 32,
            "winRate": 59.2,
            "averageProfit": 123.47
        },
        {
            "condition": "Ranging",
            "tradeCount": 28,
            "winRate": 42.8,
            "averageProfit": -35.92
        },
        {
            "condition": "High Volatility",
            "tradeCount": 37,
            "winRate": 54.3,
            "averageProfit": 178.65
        },
        {
            "condition": "Low Volatility",
            "tradeCount": 21,
            "winRate": 38.6,
            "averageProfit": -42.18
        }
    ]

def calculate_plan_adherence_analysis(
    db: Session,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    symbol: Optional[str] = None
) -> Dict[str, Any]:
    """
    Calculate analysis of trading performance by plan adherence
    """
    # Build the base query with filters
    query = db.query(Trade)
    
    if start_date:
        query = query.filter(Trade.entry_time >= start_date)
    if end_date:
        end_datetime = datetime.combine(end_date.date(), datetime.max.time())
        query = query.filter(Trade.entry_time <= end_datetime)
    if symbol:
        query = query.filter(Trade.symbol == symbol)
    
    # Execute the query to get all filtered trades
    trades = query.all()
    
    if not trades:
        return {
            "adherenceLevels": [],
            "correlation": 0,
            "adherenceOverTime": []
        }
    
    # Group trades by plan adherence level (1-10)
    adherence_trades = {}
    for i in range(1, 11):  # Adherence levels 1-10
        adherence_trades[i] = []
    
    for trade in trades:
        if trade.plan_adherence is None:
            continue
            
        level = max(1, min(10, trade.plan_adherence))  # Ensure it's in range 1-10
        adherence_trades[level].append(trade)
    
    # Calculate metrics for each adherence level
    adherence_stats = []
    for level, a_trades in adherence_trades.items():
        total = len(a_trades)
        if total == 0:
            adherence_stats.append({
                "level": level,
                "tradeCount": 0,
                "winRate": 0,
                "averageProfit": 0,
                "netProfit": 0
            })
            continue
            
        wins = sum(1 for t in a_trades if t.outcome == "Win")
        
        win_rate = round((wins / total) * 100, 2) if total > 0 else 0
        
        net_profit = sum(t.profit_loss for t in a_trades)
        average_profit = net_profit / total
        
        adherence_stats.append({
            "level": level,
            "tradeCount": total,
            "winRate": win_rate,
            "averageProfit": average_profit,
            "netProfit": net_profit
        })
    
    # Calculate correlation between adherence and profitability
    adherence_values = [t.plan_adherence for t in trades if t.plan_adherence is not None]
    profit_values = [t.profit_loss for t in trades if t.plan_adherence is not None]
    
    # Calculate correlation coefficient if enough data points
    if len(adherence_values) > 1 and len(profit_values) > 1:
        try:
            correlation = stats.correlation(adherence_values, profit_values)
        except:
            correlation = 0
    else:
        correlation = 0
    
    # Calculate adherence over time
    adherence_over_time = []
    # Group trades by week
    trades_by_week = {}
    
    for trade in trades:
        if not trade.entry_time or not trade.plan_adherence:
            continue
        
        # Get the start of the week (Monday)
        week_start = trade.entry_time.date() - timedelta(days=trade.entry_time.weekday())
        week_key = week_start.strftime("%Y-%m-%d")
        
        if week_key not in trades_by_week:
            trades_by_week[week_key] = []
        
        trades_by_week[week_key].append(trade)
    
    for week_key, week_trades in trades_by_week.items():
        avg_adherence = sum(t.plan_adherence for t in week_trades if t.plan_adherence is not None) / len(week_trades)
        win_rate = sum(1 for t in week_trades if t.outcome == "Win") / len(week_trades) * 100
        
        adherence_over_time.append({
            "week": week_key,
            "averageAdherence": round(avg_adherence, 2),
            "tradeCount": len(week_trades),
            "winRate": round(win_rate, 2)
        })
    
    # Sort by week
    adherence_over_time.sort(key=lambda x: x["week"])
    
    return {
        "adherenceLevels": adherence_stats,
        "correlation": correlation,
        "adherenceOverTime": adherence_over_time
    }
