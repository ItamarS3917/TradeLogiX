# File: backend/mcp/tools/pattern_recognition.py
# Purpose: Trading pattern recognition tools for identifying trade setups and behaviors
#          Enhanced with MCP capabilities for advanced pattern detection

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from collections import defaultdict

logger = logging.getLogger(__name__)

def identify_trade_patterns(trades: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Identify patterns in trading data
    
    Args:
        trades (List[Dict[str, Any]]): List of trade data
        
    Returns:
        List[Dict[str, Any]]: List of identified patterns
    """
    try:
        if not trades:
            return []
        
        # Convert to DataFrame for easier analysis
        df = pd.DataFrame(trades)
        
        # Ensure required columns exist
        required_columns = ['entry_time', 'exit_time', 'outcome', 'profit_loss', 'setup_type', 'emotional_state']
        for col in required_columns:
            if col not in df.columns:
                df[col] = None
        
        # Convert datetime strings to datetime objects
        for col in ['entry_time', 'exit_time']:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        
        # Initialize patterns list
        patterns = []
        
        # Pattern 1: Time of day analysis
        time_pattern = analyze_time_of_day(df)
        if time_pattern:
            patterns.append(time_pattern)
        
        # Pattern 2: Day of week analysis
        dow_pattern = analyze_day_of_week(df)
        if dow_pattern:
            patterns.append(dow_pattern)
        
        # Pattern 3: Emotional state correlation
        emotion_pattern = analyze_emotional_impact(df)
        if emotion_pattern:
            patterns.append(emotion_pattern)
        
        # Pattern 4: Setup type performance
        setup_pattern = analyze_setup_performance(df)
        if setup_pattern:
            patterns.append(setup_pattern)
        
        # Pattern 5: Overtrading detection
        overtrading_pattern = detect_overtrading(df)
        if overtrading_pattern:
            patterns.append(overtrading_pattern)
        
        # Pattern 6: Revenge trading detection
        revenge_pattern = detect_revenge_trading(df)
        if revenge_pattern:
            patterns.append(revenge_pattern)
        
        # Pattern 7: Win/loss streak analysis
        streak_pattern = analyze_streaks(df)
        if streak_pattern:
            patterns.append(streak_pattern)
        
        # Sort patterns by confidence (descending)
        patterns.sort(key=lambda x: x.get('confidence', 0), reverse=True)
        
        return patterns
    
    except Exception as e:
        logger.error(f"Error identifying trade patterns: {str(e)}")
        return []

def analyze_time_of_day(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """
    Analyze trading performance by time of day
    
    Args:
        df (pd.DataFrame): Trade data
        
    Returns:
        Optional[Dict[str, Any]]: Time of day pattern if found
    """
    try:
        # Ensure we have entry times and outcomes
        if df['entry_time'].isna().all() or df['outcome'].isna().all():
            return None
        
        # Extract hour from entry time
        df['hour'] = df['entry_time'].dt.hour
        
        # Group by hour and calculate win rate
        hour_stats = df.groupby('hour').agg({
            'outcome': lambda x: (x == 'Win').mean() * 100,  # Win rate as percentage
            'profit_loss': 'mean',  # Average P&L
            'id': 'count'  # Number of trades
        }).reset_index()
        
        # Rename columns for clarity
        hour_stats.columns = ['hour', 'win_rate', 'avg_pnl', 'trade_count']
        
        # Only consider hours with enough trades
        min_trades = max(3, int(len(df) * 0.05))  # At least 3 trades or 5% of total
        hour_stats = hour_stats[hour_stats['trade_count'] >= min_trades]
        
        if len(hour_stats) == 0:
            return None
        
        # Find best and worst hours
        best_hour = hour_stats.loc[hour_stats['win_rate'].idxmax()]
        worst_hour = hour_stats.loc[hour_stats['win_rate'].idxmin()]
        
        # Only report if there's a significant difference
        if best_hour['win_rate'] - worst_hour['win_rate'] < 15:  # Less than 15% difference
            return None
        
        # Format best and worst hours in 12-hour format
        best_hour_fmt = f"{best_hour['hour'] % 12 or 12} {'AM' if best_hour['hour'] < 12 else 'PM'}"
        worst_hour_fmt = f"{worst_hour['hour'] % 12 or 12} {'AM' if worst_hour['hour'] < 12 else 'PM'}"
        
        # Calculate confidence based on trade count and win rate difference
        confidence = min(0.95, 0.5 + (best_hour['win_rate'] - worst_hour['win_rate']) / 100 + min(1, best_hour['trade_count'] / 20) * 0.2)
        
        return {
            "type": "time_of_day",
            "name": "Time of Day Performance",
            "description": f"Your trading performance is significantly better around {best_hour_fmt} ({best_hour['win_rate']:.1f}% win rate) compared to {worst_hour_fmt} ({worst_hour['win_rate']:.1f}% win rate).",
            "best_hour": int(best_hour['hour']),
            "worst_hour": int(worst_hour['hour']),
            "best_win_rate": float(best_hour['win_rate']),
            "worst_win_rate": float(worst_hour['win_rate']),
            "best_avg_pnl": float(best_hour['avg_pnl']),
            "worst_avg_pnl": float(worst_hour['avg_pnl']),
            "confidence": confidence,
            "recommendation": f"Consider focusing your trading activities around {best_hour_fmt} and reducing trading around {worst_hour_fmt}."
        }
    except Exception as e:
        logger.error(f"Error analyzing time of day: {str(e)}")
        return None

def analyze_day_of_week(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """
    Analyze trading performance by day of week
    
    Args:
        df (pd.DataFrame): Trade data
        
    Returns:
        Optional[Dict[str, Any]]: Day of week pattern if found
    """
    try:
        # Ensure we have entry times and outcomes
        if df['entry_time'].isna().all() or df['outcome'].isna().all():
            return None
        
        # Extract day of week from entry time
        df['day_of_week'] = df['entry_time'].dt.day_name()
        
        # Group by day of week and calculate win rate
        dow_stats = df.groupby('day_of_week').agg({
            'outcome': lambda x: (x == 'Win').mean() * 100,  # Win rate as percentage
            'profit_loss': 'mean',  # Average P&L
            'id': 'count'  # Number of trades
        }).reset_index()
        
        # Rename columns for clarity
        dow_stats.columns = ['day_of_week', 'win_rate', 'avg_pnl', 'trade_count']
        
        # Only consider days with enough trades
        min_trades = max(3, int(len(df) * 0.1))  # At least 3 trades or 10% of total
        dow_stats = dow_stats[dow_stats['trade_count'] >= min_trades]
        
        if len(dow_stats) == 0:
            return None
        
        # Find best and worst days
        best_day = dow_stats.loc[dow_stats['win_rate'].idxmax()]
        worst_day = dow_stats.loc[dow_stats['win_rate'].idxmin()]
        
        # Only report if there's a significant difference
        if best_day['win_rate'] - worst_day['win_rate'] < 15:  # Less than 15% difference
            return None
        
        # Calculate confidence based on trade count and win rate difference
        confidence = min(0.9, 0.5 + (best_day['win_rate'] - worst_day['win_rate']) / 100 + min(1, best_day['trade_count'] / 20) * 0.2)
        
        return {
            "type": "day_of_week",
            "name": "Day of Week Performance",
            "description": f"Your trading performance is significantly better on {best_day['day_of_week']}s ({best_day['win_rate']:.1f}% win rate) compared to {worst_day['day_of_week']}s ({worst_day['win_rate']:.1f}% win rate).",
            "best_day": best_day['day_of_week'],
            "worst_day": worst_day['day_of_week'],
            "best_win_rate": float(best_day['win_rate']),
            "worst_win_rate": float(worst_day['win_rate']),
            "best_avg_pnl": float(best_day['avg_pnl']),
            "worst_avg_pnl": float(worst_day['avg_pnl']),
            "confidence": confidence,
            "recommendation": f"Consider focusing your trading activities on {best_day['day_of_week']}s and being more selective or cautious on {worst_day['day_of_week']}s."
        }
    except Exception as e:
        logger.error(f"Error analyzing day of week: {str(e)}")
        return None

def analyze_emotional_impact(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """
    Analyze impact of emotional state on trading performance
    
    Args:
        df (pd.DataFrame): Trade data
        
    Returns:
        Optional[Dict[str, Any]]: Emotional impact pattern if found
    """
    try:
        # Filter out rows with missing emotional state or outcome
        df_valid = df.dropna(subset=['emotional_state', 'outcome'])
        
        if len(df_valid) < 5:  # Need at least 5 valid trades
            return None
        
        # Group by emotional state and calculate metrics
        emotion_stats = df_valid.groupby('emotional_state').agg({
            'outcome': lambda x: (x == 'Win').mean() * 100,  # Win rate as percentage
            'profit_loss': 'mean',  # Average P&L
            'id': 'count'  # Number of trades
        }).reset_index()
        
        # Rename columns for clarity
        emotion_stats.columns = ['emotional_state', 'win_rate', 'avg_pnl', 'trade_count']
        
        # Only consider emotional states with enough trades
        min_trades = max(3, int(len(df_valid) * 0.1))  # At least 3 trades or 10% of total
        emotion_stats = emotion_stats[emotion_stats['trade_count'] >= min_trades]
        
        if len(emotion_stats) < 2:  # Need at least 2 different emotional states
            return None
        
        # Find best and worst emotional states
        best_emotion = emotion_stats.loc[emotion_stats['win_rate'].idxmax()]
        worst_emotion = emotion_stats.loc[emotion_stats['win_rate'].idxmin()]
        
        # Only report if there's a significant difference
        if best_emotion['win_rate'] - worst_emotion['win_rate'] < 20:  # Less than 20% difference
            return None
        
        # Calculate confidence based on trade count and win rate difference
        confidence = min(0.95, 0.6 + (best_emotion['win_rate'] - worst_emotion['win_rate']) / 100 + min(1, best_emotion['trade_count'] / 15) * 0.15)
        
        return {
            "type": "emotional_impact",
            "name": "Emotional State Impact",
            "description": f"Trading when you feel '{best_emotion['emotional_state']}' leads to much better results ({best_emotion['win_rate']:.1f}% win rate) compared to when you feel '{worst_emotion['emotional_state']}' ({worst_emotion['win_rate']:.1f}% win rate).",
            "best_emotion": best_emotion['emotional_state'],
            "worst_emotion": worst_emotion['emotional_state'],
            "best_win_rate": float(best_emotion['win_rate']),
            "worst_win_rate": float(worst_emotion['win_rate']),
            "best_avg_pnl": float(best_emotion['avg_pnl']),
            "worst_avg_pnl": float(worst_emotion['avg_pnl']),
            "confidence": confidence,
            "recommendation": f"Try to cultivate a '{best_emotion['emotional_state']}' state before trading. Consider not trading or using smaller position sizes when feeling '{worst_emotion['emotional_state']}'."
        }
    except Exception as e:
        logger.error(f"Error analyzing emotional impact: {str(e)}")
        return None

def analyze_setup_performance(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """
    Analyze performance by setup type
    
    Args:
        df (pd.DataFrame): Trade data
        
    Returns:
        Optional[Dict[str, Any]]: Setup performance pattern if found
    """
    try:
        # Filter out rows with missing setup type or outcome
        df_valid = df.dropna(subset=['setup_type', 'outcome'])
        
        if len(df_valid) < 5:  # Need at least 5 valid trades
            return None
        
        # Group by setup type and calculate metrics
        setup_stats = df_valid.groupby('setup_type').agg({
            'outcome': lambda x: (x == 'Win').mean() * 100,  # Win rate as percentage
            'profit_loss': 'mean',  # Average P&L
            'id': 'count'  # Number of trades
        }).reset_index()
        
        # Rename columns for clarity
        setup_stats.columns = ['setup_type', 'win_rate', 'avg_pnl', 'trade_count']
        
        # Only consider setup types with enough trades
        min_trades = max(3, int(len(df_valid) * 0.1))  # At least 3 trades or 10% of total
        setup_stats = setup_stats[setup_stats['trade_count'] >= min_trades]
        
        if len(setup_stats) < 2:  # Need at least 2 different setup types
            return None
        
        # Find best and worst setup types
        best_setup = setup_stats.loc[setup_stats['win_rate'].idxmax()]
        worst_setup = setup_stats.loc[setup_stats['win_rate'].idxmin()]
        
        # Only report if there's a significant difference
        if best_setup['win_rate'] - worst_setup['win_rate'] < 15:  # Less than 15% difference
            return None
        
        # Calculate confidence based on trade count and win rate difference
        confidence = min(0.95, 0.55 + (best_setup['win_rate'] - worst_setup['win_rate']) / 100 + min(1, best_setup['trade_count'] / 20) * 0.2)
        
        return {
            "type": "setup_performance",
            "name": "Setup Type Performance",
            "description": f"Your '{best_setup['setup_type']}' setup outperforms other setups with a {best_setup['win_rate']:.1f}% win rate, while your '{worst_setup['setup_type']}' setup has only a {worst_setup['win_rate']:.1f}% win rate.",
            "best_setup": best_setup['setup_type'],
            "worst_setup": worst_setup['setup_type'],
            "best_win_rate": float(best_setup['win_rate']),
            "worst_win_rate": float(worst_setup['win_rate']),
            "best_avg_pnl": float(best_setup['avg_pnl']),
            "worst_avg_pnl": float(worst_setup['avg_pnl']),
            "confidence": confidence,
            "recommendation": f"Focus more on your '{best_setup['setup_type']}' setup where you have a clear edge. Consider reducing exposure to or refining your '{worst_setup['setup_type']}' setup."
        }
    except Exception as e:
        logger.error(f"Error analyzing setup performance: {str(e)}")
        return None

def detect_overtrading(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """
    Detect overtrading patterns
    
    Args:
        df (pd.DataFrame): Trade data
        
    Returns:
        Optional[Dict[str, Any]]: Overtrading pattern if found
    """
    try:
        # Ensure we have entry times
        if df['entry_time'].isna().all():
            return None
        
        # Sort by entry time
        df_sorted = df.sort_values('entry_time')
        
        # Calculate trades per day
        df_sorted['trade_date'] = df_sorted['entry_time'].dt.date
        trades_per_day = df_sorted.groupby('trade_date').size().reset_index(name='trade_count')
        
        # Calculate average trades per day
        avg_trades_per_day = trades_per_day['trade_count'].mean()
        
        # Identify days with excessive trading
        threshold = max(5, avg_trades_per_day * 1.5)  # 50% more than average or at least 5
        high_volume_days = trades_per_day[trades_per_day['trade_count'] >= threshold]
        
        if len(high_volume_days) < 2:  # Need at least 2 high volume days
            return None
        
        # Calculate win rate on high volume vs. normal days
        high_volume_dates = high_volume_days['trade_date'].tolist()
        df_sorted['high_volume_day'] = df_sorted['trade_date'].isin(high_volume_dates)
        
        # Calculate win rates
        high_volume_win_rate = (df_sorted[df_sorted['high_volume_day']]['outcome'] == 'Win').mean() * 100
        normal_win_rate = (df_sorted[~df_sorted['high_volume_day']]['outcome'] == 'Win').mean() * 100
        
        # Only report if high volume days have significantly worse performance
        if normal_win_rate - high_volume_win_rate < 10:  # Less than 10% difference
            return None
        
        # Calculate confidence
        confidence = min(0.9, 0.5 + (normal_win_rate - high_volume_win_rate) / 100 + min(1, len(high_volume_days) / 10) * 0.2)
        
        return {
            "type": "overtrading",
            "name": "Overtrading Detection",
            "description": f"On days when you trade more than {threshold:.0f} times, your win rate drops to {high_volume_win_rate:.1f}% compared to {normal_win_rate:.1f}% on normal trading days.",
            "normal_trades_per_day": float(avg_trades_per_day),
            "overtrading_threshold": float(threshold),
            "high_volume_win_rate": float(high_volume_win_rate),
            "normal_win_rate": float(normal_win_rate),
            "high_volume_days": len(high_volume_days),
            "confidence": confidence,
            "recommendation": f"Limit yourself to no more than {min(threshold, avg_trades_per_day + 2):.0f} trades per day to maintain quality over quantity."
        }
    except Exception as e:
        logger.error(f"Error detecting overtrading: {str(e)}")
        return None

def detect_revenge_trading(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """
    Detect revenge trading patterns (taking trades quickly after losses)
    
    Args:
        df (pd.DataFrame): Trade data
        
    Returns:
        Optional[Dict[str, Any]]: Revenge trading pattern if found
    """
    try:
        # Ensure we have entry times, exit times, and outcomes
        if df['entry_time'].isna().all() or df['exit_time'].isna().all() or df['outcome'].isna().all():
            return None
        
        # Sort by entry time
        df_sorted = df.sort_values('entry_time').reset_index(drop=True)
        
        # Calculate time between exit and next entry
        df_sorted['next_entry_time'] = df_sorted['entry_time'].shift(-1)
        df_sorted['time_to_next_trade'] = (df_sorted['next_entry_time'] - df_sorted['exit_time']).dt.total_seconds() / 60  # minutes
        
        # Filter out last trade (no next trade)
        df_sorted = df_sorted.dropna(subset=['time_to_next_trade'])
        
        if len(df_sorted) < 5:  # Need at least 5 valid trades
            return None
        
        # Define quick re-entry threshold (15 minutes)
        threshold_minutes = 15
        
        # Identify potential revenge trades (quick entry after loss)
        df_sorted['potential_revenge'] = (df_sorted['outcome'] == 'Loss') & (df_sorted['time_to_next_trade'] <= threshold_minutes)
        
        # Get trades that followed losses
        after_loss_trades = df_sorted[df_sorted['potential_revenge'].shift(1) == True].copy()
        
        # Get regular trades (not after quick loss)
        regular_trades = df_sorted[df_sorted['potential_revenge'].shift(1) != True].copy()
        
        # Ensure we have enough of each type
        if len(after_loss_trades) < 3 or len(regular_trades) < 3:
            return None
        
        # Calculate win rates
        revenge_win_rate = (after_loss_trades['outcome'] == 'Win').mean() * 100
        regular_win_rate = (regular_trades['outcome'] == 'Win').mean() * 100
        
        # Only report if there's a significant difference
        if regular_win_rate - revenge_win_rate < 15:  # Less than 15% difference
            return None
        
        # Calculate number of potential revenge trades
        revenge_count = df_sorted['potential_revenge'].sum()
        revenge_percentage = (revenge_count / len(df_sorted)) * 100
        
        # Calculate confidence
        confidence = min(0.9, 0.6 + (regular_win_rate - revenge_win_rate) / 100 + min(1, revenge_count / 10) * 0.2)
        
        return {
            "type": "revenge_trading",
            "name": "Revenge Trading Detection",
            "description": f"When you re-enter the market within {threshold_minutes} minutes after a loss, your win rate drops to {revenge_win_rate:.1f}% compared to {regular_win_rate:.1f}% for your other trades.",
            "revenge_trade_count": int(revenge_count),
            "revenge_percentage": float(revenge_percentage),
            "revenge_win_rate": float(revenge_win_rate),
            "regular_win_rate": float(regular_win_rate),
            "time_threshold": threshold_minutes,
            "confidence": confidence,
            "recommendation": f"After a losing trade, take a break of at least {threshold_minutes} minutes to reset emotionally before entering a new position."
        }
    except Exception as e:
        logger.error(f"Error detecting revenge trading: {str(e)}")
        return None

def analyze_streaks(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """
    Analyze trading streaks and their impact
    
    Args:
        df (pd.DataFrame): Trade data
        
    Returns:
        Optional[Dict[str, Any]]: Streak analysis pattern if found
    """
    try:
        # Ensure we have entry times and outcomes
        if df['entry_time'].isna().all() or df['outcome'].isna().all():
            return None
        
        # Sort by entry time
        df_sorted = df.sort_values('entry_time').reset_index(drop=True)
        
        # Only consider win/loss (exclude breakeven)
        df_sorted = df_sorted[df_sorted['outcome'].isin(['Win', 'Loss'])]
        
        if len(df_sorted) < 10:  # Need at least 10 valid trades
            return None
        
        # Calculate streaks
        df_sorted['streak_type'] = df_sorted['outcome']
        df_sorted['streak_id'] = (df_sorted['streak_type'] != df_sorted['streak_type'].shift(1)).cumsum()
        
        # Group by streak
        streaks = df_sorted.groupby(['streak_id', 'streak_type']).size().reset_index(name='streak_length')
        
        # Identify trades after winning and losing streaks
        df_sorted['prev_streak_type'] = df_sorted['streak_type'].shift(1)
        df_sorted['prev_streak_id'] = df_sorted['streak_id'].shift(1)
        
        # Join streak lengths
        streak_lengths = streaks.set_index('streak_id')['streak_length']
        df_sorted['prev_streak_length'] = df_sorted['prev_streak_id'].map(streak_lengths)
        
        # Filter to only include trades after streaks
        after_streak = df_sorted.dropna(subset=['prev_streak_length', 'prev_streak_type'])
        
        # Define what counts as a "long" streak
        long_win_streak = after_streak['prev_streak_length'] >= 3
        long_loss_streak = after_streak['prev_streak_length'] >= 2
        
        # Filter trades after long streaks
        after_win_streak = after_streak[(after_streak['prev_streak_type'] == 'Win') & long_win_streak]
        after_loss_streak = after_streak[(after_streak['prev_streak_type'] == 'Loss') & long_loss_streak]
        
        # Calculate win rates
        if len(after_win_streak) >= 5:
            win_rate_after_win_streak = (after_win_streak['outcome'] == 'Win').mean() * 100
        else:
            win_rate_after_win_streak = None
            
        if len(after_loss_streak) >= 5:
            win_rate_after_loss_streak = (after_loss_streak['outcome'] == 'Win').mean() * 100
        else:
            win_rate_after_loss_streak = None
            
        overall_win_rate = (df_sorted['outcome'] == 'Win').mean() * 100
        
        # Determine which pattern is more significant
        if win_rate_after_win_streak is not None and abs(win_rate_after_win_streak - overall_win_rate) >= 15:
            streak_type = "winning"
            comparison_rate = win_rate_after_win_streak
            streak_threshold = 3
            direction = "increases" if win_rate_after_win_streak > overall_win_rate else "decreases"
        elif win_rate_after_loss_streak is not None and abs(win_rate_after_loss_streak - overall_win_rate) >= 15:
            streak_type = "losing"
            comparison_rate = win_rate_after_loss_streak
            streak_threshold = 2
            direction = "increases" if win_rate_after_loss_streak > overall_win_rate else "decreases"
        else:
            return None  # No significant pattern found
        
        # Calculate confidence
        confidence = min(0.85, 0.5 + abs(comparison_rate - overall_win_rate) / 100 + min(1, len(after_win_streak if streak_type == "winning" else after_loss_streak) / 15) * 0.15)
        
        # Prepare the appropriate recommendation
        if streak_type == "winning" and direction == "decreases":
            recommendation = f"After a streak of {streak_threshold}+ wins, consider reducing position size or taking a break to reset overconfidence."
        elif streak_type == "winning" and direction == "increases":
            recommendation = f"You perform well after winning streaks, so try to capitalize on this confidence by maintaining your trading approach."
        elif streak_type == "losing" and direction == "decreases":
            recommendation = f"After {streak_threshold}+ consecutive losses, take a longer break to reset emotionally before trading again."
        else:  # losing streak but win rate increases
            recommendation = f"You show resilience after losing streaks with improved performance, reflecting good psychological recovery."
        
        return {
            "type": "streak_impact",
            "name": "Trading Streak Impact",
            "description": f"After a {streak_type} streak of {streak_threshold}+ trades, your win rate {direction} to {comparison_rate:.1f}% compared to your overall win rate of {overall_win_rate:.1f}%.",
            "streak_type": streak_type,
            "streak_threshold": streak_threshold,
            "win_rate_after_streak": float(comparison_rate),
            "overall_win_rate": float(overall_win_rate),
            "confidence": confidence,
            "recommendation": recommendation
        }
    except Exception as e:
        logger.error(f"Error analyzing streaks: {str(e)}")
        return None

def recognize_price_patterns(price_data: Dict[str, Any], trade_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recognize common price patterns in market data and correlate with trade entries
    
    Args:
        price_data (Dict[str, Any]): Market price data
        trade_data (Dict[str, Any]): Trade entry/exit data
        
    Returns:
        Dict[str, Any]: Analysis of price patterns at trade entries
    """
    # This is a placeholder for future implementation
    # Would implement pattern recognition for common patterns like:
    # - Double tops/bottoms
    # - Head and shoulders
    # - Breakouts
    # - Support/resistance tests
    # - Trend lines
    # - Moving average crosses
    
    return {
        "recognized_patterns": [],
        "trade_correlation": {},
        "recommendations": []
    }


def detect_mcp_complex_patterns(trades: List[Dict[str, Any]], market_data: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Enhanced pattern detection using MCP technology
    Performs multi-dimensional analysis across various trade metrics
    
    Args:
        trades (List[Dict[str, Any]]): List of trade data
        market_data (Optional[Dict[str, Any]], optional): Market data for context. Defaults to None.
        
    Returns:
        List[Dict[str, Any]]: List of complex patterns identified
    """
    try:
        if not trades or len(trades) < 10:
            return []
        
        # Convert to DataFrame for advanced analysis
        df = pd.DataFrame(trades)
        
        # Ensure datetime conversion
        for col in ['entry_time', 'exit_time']:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        
        # Initialize patterns
        patterns = []
        
        # Pattern 1: Risk-Reward vs Win Rate Correlation
        rr_pattern = analyze_risk_reward_correlation(df)
        if rr_pattern:
            patterns.append(rr_pattern)
        
        # Pattern 2: Trade Duration Impact
        duration_pattern = analyze_trade_duration_impact(df)
        if duration_pattern:
            patterns.append(duration_pattern)
        
        # Pattern 3: Plan Adherence Correlation
        if 'plan_adherence' in df.columns:
            adherence_pattern = analyze_plan_adherence(df)
            if adherence_pattern:
                patterns.append(adherence_pattern)
        
        # Pattern 4: Position Sizing Optimization
        position_pattern = analyze_position_sizing(df)
        if position_pattern:
            patterns.append(position_pattern)
        
        # Pattern 5: Market Condition Correlation (if market data available)
        if market_data:
            market_pattern = analyze_market_conditions(df, market_data)
            if market_pattern:
                patterns.append(market_pattern)
        
        # Pattern 6: Session Time Profitability
        session_pattern = analyze_session_profitability(df)
        if session_pattern:
            patterns.append(session_pattern)
        
        # Pattern 7: Win/Loss Sequence Prediction
        sequence_pattern = predict_win_loss_sequence(df)
        if sequence_pattern:
            patterns.append(sequence_pattern)
            
        # Sort patterns by confidence (descending)
        patterns.sort(key=lambda x: x.get('confidence', 0), reverse=True)
        
        return patterns
    
    except Exception as e:
        logger.error(f"Error in MCP complex pattern detection: {str(e)}")
        return []

def analyze_risk_reward_correlation(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """
    Analyze correlation between risk:reward ratios and win rates
    
    Args:
        df (pd.DataFrame): Trade data
        
    Returns:
        Optional[Dict[str, Any]]: Risk-reward correlation pattern if found
    """
    try:
        # Check if we have the required columns
        required_columns = ['planned_risk_reward', 'actual_risk_reward', 'outcome']
        
        # Create empty columns if they don't exist
        for col in required_columns:
            col_name = col.lower().replace(':', '_')
            if col_name not in df.columns:
                # Try alternative column names
                alternatives = {
                    'planned_risk_reward': ['planned_rr', 'risk_reward_planned'],
                    'actual_risk_reward': ['actual_rr', 'risk_reward_actual'],
                    'outcome': ['result', 'trade_outcome']
                }
                
                found = False
                for alt in alternatives.get(col_name, []):
                    if alt in df.columns:
                        df[col_name] = df[alt]
                        found = True
                        break
                        
                if not found:
                    df[col_name] = None
        
        # Drop rows with missing values
        df_clean = df.dropna(subset=['planned_risk_reward', 'actual_risk_reward', 'outcome'])
        
        if len(df_clean) < 10:  # Need at least 10 valid trades
            return None
        
        # Create risk:reward categories
        def categorize_rr(rr):
            if rr < 1.0:
                return "Low (<1.0)"
            elif rr < 2.0:
                return "Medium (1.0-2.0)"
            else:
                return "High (>2.0)"
                
        df_clean['planned_rr_category'] = df_clean['planned_risk_reward'].apply(categorize_rr)
        
        # Calculate win rate by RR category
        rr_stats = df_clean.groupby('planned_rr_category').agg({
            'outcome': lambda x: (x == 'Win').mean() * 100,  # Win rate
            'profit_loss': 'mean',  # Average P&L
            'planned_risk_reward': 'mean',  # Average planned RR
            'actual_risk_reward': 'mean',  # Average actual RR
            'id': 'count'  # Number of trades
        }).reset_index()
        
        # Rename columns
        rr_stats.columns = ['rr_category', 'win_rate', 'avg_pnl', 'avg_planned_rr', 'avg_actual_rr', 'trade_count']
        
        # Only consider categories with enough trades
        min_trades = 5
        rr_stats = rr_stats[rr_stats['trade_count'] >= min_trades]
        
        if len(rr_stats) < 2:  # Need at least 2 categories for comparison
            return None
        
        # Find optimal RR category
        # Calculate expected value (win_rate/100 * avg_planned_rr - (1-win_rate/100))
        rr_stats['expected_value'] = (rr_stats['win_rate']/100 * rr_stats['avg_planned_rr']) - (1 - rr_stats['win_rate']/100)
        optimal_rr = rr_stats.loc[rr_stats['expected_value'].idxmax()]
        worst_rr = rr_stats.loc[rr_stats['expected_value'].idxmin()]
        
        # Only report if there's a significant difference
        if optimal_rr['expected_value'] - worst_rr['expected_value'] < 0.2:  # Minimal difference
            return None
        
        # Calculate confidence
        confidence = min(0.9, 0.6 + (optimal_rr['expected_value'] - worst_rr['expected_value']) + min(1, optimal_rr['trade_count'] / 20) * 0.15)
        
        # Format description with optimal RR range
        if optimal_rr['rr_category'] == "Low (<1.0)":
            rr_recommendation = "Consider focusing on setups with lower risk:reward ratios (below 1.0) where your win rate is higher."
            optimal_range = "below 1.0"
        elif optimal_rr['rr_category'] == "Medium (1.0-2.0)":
            rr_recommendation = "Your optimal risk:reward ratio appears to be between 1.0 and 2.0, with a good balance of win rate and reward."
            optimal_range = "between 1.0 and 2.0"
        else:  # High
            rr_recommendation = "You perform best with higher risk:reward ratios (above 2.0), suggesting you should focus on trades with larger profit potential."
            optimal_range = "above 2.0"
        
        return {
            "type": "risk_reward_correlation",
            "name": "Optimal Risk:Reward Ratio",
            "description": f"Your optimal risk:reward ratio is {optimal_range}, yielding a {optimal_rr['win_rate']:.1f}% win rate and expected value of {optimal_rr['expected_value']:.2f}.",
            "optimal_category": optimal_rr['rr_category'],
            "optimal_win_rate": float(optimal_rr['win_rate']),
            "optimal_expected_value": float(optimal_rr['expected_value']),
            "optimal_avg_rr": float(optimal_rr['avg_planned_rr']),
            "rr_categories": rr_stats[['rr_category', 'win_rate', 'expected_value', 'trade_count']].to_dict('records'),
            "confidence": confidence,
            "recommendation": rr_recommendation
        }
    except Exception as e:
        logger.error(f"Error analyzing risk-reward correlation: {str(e)}")
        return None

def analyze_trade_duration_impact(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """
    Analyze impact of trade duration on performance
    
    Args:
        df (pd.DataFrame): Trade data
        
    Returns:
        Optional[Dict[str, Any]]: Trade duration impact pattern if found
    """
    try:
        # Ensure we have entry and exit times
        if 'entry_time' not in df.columns or 'exit_time' not in df.columns:
            return None
            
        # Filter out rows with missing entry or exit times
        df_valid = df.dropna(subset=['entry_time', 'exit_time', 'outcome'])
        
        if len(df_valid) < 10:  # Need at least 10 valid trades
            return None
            
        # Calculate trade duration in minutes
        df_valid['duration_minutes'] = (df_valid['exit_time'] - df_valid['entry_time']).dt.total_seconds() / 60
        
        # Filter out invalid durations (negative or extreme values)
        df_valid = df_valid[(df_valid['duration_minutes'] >= 0) & (df_valid['duration_minutes'] <= 1440)]  # Max 24 hours
        
        if len(df_valid) < 10:  # Still need enough trades after filtering
            return None
        
        # Create duration categories
        def categorize_duration(minutes):
            if minutes < 5:
                return "Very short (<5 min)"
            elif minutes < 15:
                return "Short (5-15 min)"
            elif minutes < 60:
                return "Medium (15-60 min)"
            else:
                return "Long (>60 min)"
                
        df_valid['duration_category'] = df_valid['duration_minutes'].apply(categorize_duration)
        
        # Calculate win rate by duration category
        duration_stats = df_valid.groupby('duration_category').agg({
            'outcome': lambda x: (x == 'Win').mean() * 100,  # Win rate
            'profit_loss': 'mean',  # Average P&L
            'duration_minutes': 'mean',  # Average duration
            'id': 'count'  # Number of trades
        }).reset_index()
        
        # Rename columns
        duration_stats.columns = ['duration_category', 'win_rate', 'avg_pnl', 'avg_duration', 'trade_count']
        
        # Only consider categories with enough trades
        min_trades = 5
        duration_stats = duration_stats[duration_stats['trade_count'] >= min_trades]
        
        if len(duration_stats) < 2:  # Need at least 2 categories for comparison
            return None
        
        # Find best and worst duration categories by average P&L
        best_duration = duration_stats.loc[duration_stats['avg_pnl'].idxmax()]
        worst_duration = duration_stats.loc[duration_stats['avg_pnl'].idxmin()]
        
        # Only report if there's a significant difference
        pnl_diff = best_duration['avg_pnl'] - worst_duration['avg_pnl']
        avg_abs_pnl = (abs(best_duration['avg_pnl']) + abs(worst_duration['avg_pnl'])) / 2
        
        if avg_abs_pnl > 0 and pnl_diff / avg_abs_pnl < 0.3:  # Less than 30% difference
            return None
        
        # Calculate confidence
        confidence = min(0.9, 0.5 + min(1, pnl_diff / 100) * 0.2 + min(1, best_duration['trade_count'] / 20) * 0.2)
        
        # Format recommendation based on best duration
        if best_duration['duration_category'] == "Very short (<5 min)":
            duration_recommendation = "You perform best with very short-term trades that last less than 5 minutes. Consider focusing on quick scalping strategies."
        elif best_duration['duration_category'] == "Short (5-15 min)":
            duration_recommendation = "Your most profitable trades typically last between 5-15 minutes. This balanced approach works well for your trading style."
        elif best_duration['duration_category'] == "Medium (15-60 min)":
            duration_recommendation = "Your sweet spot appears to be trades lasting 15-60 minutes, allowing time for your ideas to develop without excessive waiting."
        else:  # Long
            duration_recommendation = "You perform best with longer-term trades (>60 minutes). Consider allowing your trades more time to develop rather than exiting too early."
        
        return {
            "type": "trade_duration_impact",
            "name": "Optimal Trade Duration",
            "description": f"Your {best_duration['duration_category']} trades are most profitable with an average P&L of ${best_duration['avg_pnl']:.2f} compared to ${worst_duration['avg_pnl']:.2f} for {worst_duration['duration_category']} trades.",
            "best_duration_category": best_duration['duration_category'],
            "worst_duration_category": worst_duration['duration_category'],
            "best_win_rate": float(best_duration['win_rate']),
            "worst_win_rate": float(worst_duration['win_rate']),
            "best_avg_pnl": float(best_duration['avg_pnl']),
            "worst_avg_pnl": float(worst_duration['avg_pnl']),
            "duration_categories": duration_stats[['duration_category', 'win_rate', 'avg_pnl', 'trade_count']].to_dict('records'),
            "confidence": confidence,
            "recommendation": duration_recommendation
        }
    except Exception as e:
        logger.error(f"Error analyzing trade duration impact: {str(e)}")
        return None

def analyze_plan_adherence(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """
    Analyze correlation between plan adherence and trade outcomes
    
    Args:
        df (pd.DataFrame): Trade data with plan_adherence column
        
    Returns:
        Optional[Dict[str, Any]]: Plan adherence correlation pattern if found
    """
    try:
        # Check if we have plan adherence data
        if 'plan_adherence' not in df.columns:
            return None
            
        # Filter out rows with missing plan adherence or outcome
        df_valid = df.dropna(subset=['plan_adherence', 'outcome'])
        
        if len(df_valid) < 10:  # Need at least 10 valid trades
            return None
        
        # Create adherence categories
        def categorize_adherence(adherence):
            # Assuming plan_adherence is on a 1-10 scale
            if adherence <= 3:
                return "Low (1-3)"
            elif adherence <= 7:
                return "Medium (4-7)"
            else:
                return "High (8-10)"
                
        df_valid['adherence_category'] = df_valid['plan_adherence'].apply(categorize_adherence)
        
        # Calculate metrics by adherence category
        adherence_stats = df_valid.groupby('adherence_category').agg({
            'outcome': lambda x: (x == 'Win').mean() * 100,  # Win rate
            'profit_loss': 'mean',  # Average P&L
            'plan_adherence': 'mean',  # Average adherence score
            'id': 'count'  # Number of trades
        }).reset_index()
        
        # Rename columns
        adherence_stats.columns = ['adherence_category', 'win_rate', 'avg_pnl', 'avg_adherence', 'trade_count']
        
        # Only consider categories with enough trades
        min_trades = 3
        adherence_stats = adherence_stats[adherence_stats['trade_count'] >= min_trades]
        
        if len(adherence_stats) < 2:  # Need at least 2 categories for comparison
            return None
        
        # Find high and low adherence categories
        high_adherence = adherence_stats[adherence_stats['adherence_category'] == "High (8-10)"].iloc[0] if "High (8-10)" in adherence_stats['adherence_category'].values else None
        low_adherence = adherence_stats[adherence_stats['adherence_category'] == "Low (1-3)"].iloc[0] if "Low (1-3)" in adherence_stats['adherence_category'].values else None
        
        # If we don't have both high and low, get the highest and lowest available
        if high_adherence is None or low_adherence is None:
            adherence_stats = adherence_stats.sort_values('avg_adherence')
            high_adherence = adherence_stats.iloc[-1]
            low_adherence = adherence_stats.iloc[0]
        
        # Calculate win rate and P&L differences
        win_rate_diff = high_adherence['win_rate'] - low_adherence['win_rate']
        pnl_diff = high_adherence['avg_pnl'] - low_adherence['avg_pnl']
        
        # Only report if there's a significant difference
        if win_rate_diff < 15 and pnl_diff < 50:  # Small differences
            return None
        
        # Calculate confidence
        confidence = min(0.95, 0.6 + min(1, win_rate_diff / 50) * 0.2 + min(1, pnl_diff / 200) * 0.15)
        
        return {
            "type": "plan_adherence_correlation",
            "name": "Trading Plan Adherence Impact",
            "description": f"Following your trading plan closely correlates strongly with better results. Trades with high adherence have a {high_adherence['win_rate']:.1f}% win rate compared to {low_adherence['win_rate']:.1f}% with low adherence.",
            "high_adherence_win_rate": float(high_adherence['win_rate']),
            "low_adherence_win_rate": float(low_adherence['win_rate']),
            "high_adherence_avg_pnl": float(high_adherence['avg_pnl']),
            "low_adherence_avg_pnl": float(low_adherence['avg_pnl']),
            "win_rate_difference": float(win_rate_diff),
            "pnl_difference": float(pnl_diff),
            "adherence_categories": adherence_stats[['adherence_category', 'win_rate', 'avg_pnl', 'trade_count']].to_dict('records'),
            "confidence": confidence,
            "recommendation": "Create a detailed pre-trade checklist to ensure high adherence to your trading plan on every trade."
        }
    except Exception as e:
        logger.error(f"Error analyzing plan adherence: {str(e)}")
        return None

def analyze_position_sizing(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """
    Analyze optimal position sizing based on trade performance
    
    Args:
        df (pd.DataFrame): Trade data
        
    Returns:
        Optional[Dict[str, Any]]: Position sizing pattern if found
    """
    try:
        # Check if we have position size data
        position_columns = ['position_size', 'contracts', 'shares', 'size', 'quantity']
        position_col = None
        
        for col in position_columns:
            if col in df.columns and not df[col].isna().all():
                position_col = col
                break
                
        if position_col is None:
            return None
            
        # Filter out rows with missing position size or outcome
        df_valid = df.dropna(subset=[position_col, 'outcome', 'profit_loss'])
        
        if len(df_valid) < 15:  # Need at least 15 valid trades for reliable analysis
            return None
        
        # Calculate position tiers
        position_range = (df_valid[position_col].max() - df_valid[position_col].min())
        if position_range == 0:  # All positions are the same size
            return None
            
        q1, q2, q3 = df_valid[position_col].quantile([0.33, 0.5, 0.67])
        
        # Create position size categories
        def categorize_position(size):
            if size <= q1:
                return "Small (Bottom 33%)"
            elif size <= q3:
                return "Medium (Middle 33%)"
            else:
                return "Large (Top 33%)"
                
        df_valid['position_category'] = df_valid[position_col].apply(categorize_position)
        
        # Calculate metrics by position category
        position_stats = df_valid.groupby('position_category').agg({
            'outcome': lambda x: (x == 'Win').mean() * 100,  # Win rate
            'profit_loss': 'mean',  # Average P&L
            position_col: 'mean',  # Average position size
            'id': 'count'  # Number of trades
        }).reset_index()
        
        # Rename columns
        position_stats.columns = ['position_category', 'win_rate', 'avg_pnl', 'avg_size', 'trade_count']
        
        # Calculate risk-adjusted return (avg_pnl / avg_size)
        position_stats['risk_adjusted_return'] = position_stats['avg_pnl'] / position_stats['avg_size']
        
        # Only consider categories with enough trades
        min_trades = 5
        position_stats = position_stats[position_stats['trade_count'] >= min_trades]
        
        if len(position_stats) < 2:  # Need at least 2 categories for comparison
            return None
        
        # Find optimal position category by risk-adjusted return
        best_position = position_stats.loc[position_stats['risk_adjusted_return'].idxmax()]
        worst_position = position_stats.loc[position_stats['risk_adjusted_return'].idxmin()]
        
        # Only report if there's a significant difference
        if best_position['risk_adjusted_return'] <= 0 or worst_position['risk_adjusted_return'] >= 0:
            # If both are negative or both are positive, compare the absolute difference
            diff_ratio = abs((best_position['risk_adjusted_return'] - worst_position['risk_adjusted_return']) / 
                            max(abs(best_position['risk_adjusted_return']), abs(worst_position['risk_adjusted_return'])))
            
            if diff_ratio < 0.3:  # Less than 30% difference
                return None
        
        # Calculate confidence
        confidence = min(0.85, 0.55 + min(1, diff_ratio) * 0.2 + min(1, best_position['trade_count'] / 30) * 0.1)
        
        # Format recommendation based on optimal position size
        if best_position['position_category'] == "Small (Bottom 33%)":
            position_recommendation = "Your smaller position sizes perform best on a risk-adjusted basis. Consider trading smaller until you see consistent profitability."
            msg = "smaller"
        elif best_position['position_category'] == "Medium (Middle 33%)":
            position_recommendation = "Your medium-sized positions show the best risk-adjusted returns. This balanced approach appears optimal for your current skill level."
            msg = "medium-sized"
        else:  # Large
            position_recommendation = "Your larger positions show better risk-adjusted returns. If your risk management is solid, consider gradually increasing your position size."
            msg = "larger"
        
        return {
            "type": "position_sizing_optimization",
            "name": "Optimal Position Sizing",
            "description": f"Your {msg} positions ({best_position['position_category']}) show better risk-adjusted returns of {best_position['risk_adjusted_return']:.4f} compared to {worst_position['risk_adjusted_return']:.4f} for {worst_position['position_category']} positions.",
            "optimal_category": best_position['position_category'],
            "optimal_win_rate": float(best_position['win_rate']),
            "optimal_avg_pnl": float(best_position['avg_pnl']),
            "optimal_risk_adjusted": float(best_position['risk_adjusted_return']),
            "position_categories": position_stats[['position_category', 'win_rate', 'avg_pnl', 'risk_adjusted_return', 'trade_count']].to_dict('records'),
            "confidence": confidence,
            "recommendation": position_recommendation
        }
    except Exception as e:
        logger.error(f"Error analyzing position sizing: {str(e)}")
        return None

def analyze_session_profitability(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """
    Analyze profitability by market session (open, mid-day, close)
    
    Args:
        df (pd.DataFrame): Trade data
        
    Returns:
        Optional[Dict[str, Any]]: Session profitability pattern if found
    """
    try:
        # Check if we have entry time data
        if 'entry_time' not in df.columns or df['entry_time'].isna().all():
            return None
            
        # Filter out rows with missing entry time or outcome
        df_valid = df.dropna(subset=['entry_time', 'outcome', 'profit_loss'])
        
        if len(df_valid) < 15:  # Need at least 15 valid trades
            return None
        
        # Extract hour from entry time
        df_valid['hour'] = df_valid['entry_time'].dt.hour
        
        # Define market sessions (assuming US market hours)
        def categorize_session(hour):
            if 9 <= hour <= 10:  # 9:30-11:00 AM
                return "Opening (9:30-11:00 AM)"
            elif 11 <= hour <= 13:  # 11:00 AM-2:00 PM
                return "Mid-day (11:00 AM-2:00 PM)"
            elif 14 <= hour <= 16:  # 2:00-4:00 PM
                return "Closing (2:00-4:00 PM)"
            else:
                return "After-hours"
                
        df_valid['session'] = df_valid['hour'].apply(categorize_session)
        
        # Calculate metrics by session
        session_stats = df_valid.groupby('session').agg({
            'outcome': lambda x: (x == 'Win').mean() * 100,  # Win rate
            'profit_loss': 'mean',  # Average P&L
            'id': 'count'  # Number of trades
        }).reset_index()
        
        # Rename columns
        session_stats.columns = ['session', 'win_rate', 'avg_pnl', 'trade_count']
        
        # Only consider sessions with enough trades
        min_trades = 5
        session_stats = session_stats[session_stats['trade_count'] >= min_trades]
        
        # Filter out after-hours if present
        session_stats = session_stats[session_stats['session'] != "After-hours"]
        
        if len(session_stats) < 2:  # Need at least 2 sessions for comparison
            return None
        
        # Find best and worst sessions by average P&L
        best_session = session_stats.loc[session_stats['avg_pnl'].idxmax()]
        worst_session = session_stats.loc[session_stats['avg_pnl'].idxmin()]
        
        # Only report if there's a significant difference
        pnl_diff = best_session['avg_pnl'] - worst_session['avg_pnl']
        avg_abs_pnl = (abs(best_session['avg_pnl']) + abs(worst_session['avg_pnl'])) / 2
        
        if avg_abs_pnl > 0 and pnl_diff / avg_abs_pnl < 0.3:  # Less than 30% difference
            return None
        
        # Calculate confidence
        confidence = min(0.85, 0.5 + min(1, pnl_diff / 100) * 0.2 + min(1, best_session['trade_count'] / 25) * 0.15)
        
        return {
            "type": "session_profitability",
            "name": "Market Session Performance",
            "description": f"Your trading is significantly more profitable during the {best_session['session']} session (${best_session['avg_pnl']:.2f} average P&L) compared to the {worst_session['session']} session (${worst_session['avg_pnl']:.2f}).",
            "best_session": best_session['session'],
            "worst_session": worst_session['session'],
            "best_win_rate": float(best_session['win_rate']),
            "worst_win_rate": float(worst_session['win_rate']),
            "best_avg_pnl": float(best_session['avg_pnl']),
            "worst_avg_pnl": float(worst_session['avg_pnl']),
            "sessions": session_stats[['session', 'win_rate', 'avg_pnl', 'trade_count']].to_dict('records'),
            "confidence": confidence,
            "recommendation": f"Consider focusing your trading efforts during the {best_session['session']} session and being more selective or reducing size during the {worst_session['session']} session."
        }
    except Exception as e:
        logger.error(f"Error analyzing session profitability: {str(e)}")
        return None

def predict_win_loss_sequence(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """
    Analyze and predict patterns in win/loss sequences
    
    Args:
        df (pd.DataFrame): Trade data
        
    Returns:
        Optional[Dict[str, Any]]: Win/loss sequence pattern if found
    """
    try:
        # Check if we have entry time and outcome data
        if 'entry_time' not in df.columns or 'outcome' not in df.columns:
            return None
            
        # Filter out rows with missing entry time or outcome
        df_valid = df.dropna(subset=['entry_time', 'outcome'])
        
        if len(df_valid) < 20:  # Need at least 20 valid trades for sequence analysis
            return None
        
        # Sort by entry time
        df_sorted = df_valid.sort_values('entry_time').reset_index(drop=True)
        
        # Convert outcomes to binary (1 for win, 0 for loss)
        df_sorted['win'] = df_sorted['outcome'].apply(lambda x: 1 if x == 'Win' else 0)
        
        # Generate n-gram sequences of length 3
        sequences = {}
        for i in range(len(df_sorted) - 3):
            seq = tuple(df_sorted['win'].iloc[i:i+3].tolist())
            next_outcome = df_sorted['win'].iloc[i+3]
            
            if seq not in sequences:
                sequences[seq] = {'wins': 0, 'losses': 0, 'total': 0}
                
            sequences[seq]['total'] += 1
            if next_outcome == 1:
                sequences[seq]['wins'] += 1
            else:
                sequences[seq]['losses'] += 1
        
        # Filter sequences with enough occurrences
        min_occurrences = 3
        predictive_sequences = {seq: stats for seq, stats in sequences.items() 
                               if stats['total'] >= min_occurrences and 
                               (stats['wins'] / stats['total'] >= 0.75 or stats['losses'] / stats['total'] >= 0.75)}
        
        if not predictive_sequences:
            return None
        
        # Find the most predictive sequence
        most_predictive = max(predictive_sequences.items(), 
                            key=lambda x: max(x[1]['wins'] / x[1]['total'], x[1]['losses'] / x[1]['total']))
        
        seq, stats = most_predictive
        win_probability = stats['wins'] / stats['total'] * 100
        
        # Format sequence as text
        seq_text = "-".join(["Win" if outcome == 1 else "Loss" for outcome in seq])
        prediction = "Win" if win_probability > 50 else "Loss"
        prediction_prob = win_probability if prediction == "Win" else (100 - win_probability)
        
        # Calculate confidence
        confidence = min(0.8, 0.4 + min(1, stats['total'] / 10) * 0.2 + min(1, abs(win_probability - 50) / 30) * 0.2)
        
        return {
            "type": "win_loss_sequence",
            "name": "Win/Loss Sequence Pattern",
            "description": f"After a {seq_text} sequence, your next trade is {prediction_prob:.1f}% likely to be a {prediction}.",
            "sequence": seq_text,
            "win_probability": float(win_probability),
            "observation_count": stats['total'],
            "prediction": prediction,
            "confidence": confidence,
            "recommendation": f"Be aware of this pattern after a {seq_text} sequence. {'Consider increasing position size' if prediction == 'Win' else 'Consider being more selective or reducing size'} on your next trade after this pattern occurs."
        }
    except Exception as e:
        logger.error(f"Error predicting win/loss sequence: {str(e)}")
        return None

def analyze_market_conditions(df: pd.DataFrame, market_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Analyze correlation between market conditions and trading performance
    
    Args:
        df (pd.DataFrame): Trade data
        market_data (Dict[str, Any]): Market condition data
        
    Returns:
        Optional[Dict[str, Any]]: Market condition correlation pattern if found
    """
    # This is a placeholder for future implementation
    # Would analyze correlation between market conditions (volatility, trend direction, etc.)
    # and trading performance
    return None
