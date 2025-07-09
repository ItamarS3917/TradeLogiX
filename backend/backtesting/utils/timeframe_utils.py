"""
Timeframe Utilities
==================

Utilities for handling multi-timeframe data conversions and synchronization.
"""

import pandas as pd
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class TimeframeConverter:
    """
    Utility class for timeframe conversions and synchronization.
    """
    
    # Timeframe mappings
    TIMEFRAME_MAP = {
        '1T': '1min',
        '5T': '5min', 
        '15T': '15min',
        '30T': '30min',
        '1H': '1hour',
        '4H': '4hour',
        '1D': '1day'
    }
    
    # Minutes per timeframe
    TIMEFRAME_MINUTES = {
        '1T': 1,
        '5T': 5,
        '15T': 15,
        '30T': 30,
        '1H': 60,
        '4H': 240,
        '1D': 1440
    }
    
    @classmethod
    def convert_timeframe_notation(cls, tf: str) -> str:
        """Convert pandas timeframe notation to readable format."""
        return cls.TIMEFRAME_MAP.get(tf, tf)
    
    @classmethod
    def get_timeframe_minutes(cls, tf: str) -> int:
        """Get number of minutes in timeframe."""
        return cls.TIMEFRAME_MINUTES.get(tf, 5)
    
    @classmethod
    def sort_timeframes_by_duration(cls, timeframes: List[str]) -> List[str]:
        """Sort timeframes from shortest to longest duration."""
        return sorted(timeframes, key=lambda tf: cls.get_timeframe_minutes(tf))
    
    @classmethod
    def get_higher_timeframes(cls, base_tf: str, max_count: int = 3) -> List[str]:
        """Get higher timeframes from a base timeframe."""
        base_minutes = cls.get_timeframe_minutes(base_tf)
        higher_tfs = []
        
        for tf, minutes in cls.TIMEFRAME_MINUTES.items():
            if minutes > base_minutes and len(higher_tfs) < max_count:
                higher_tfs.append(tf)
        
        return cls.sort_timeframes_by_duration(higher_tfs)
    
    @classmethod
    def validate_timeframe_hierarchy(cls, timeframes: List[str]) -> bool:
        """Validate that timeframes form a proper hierarchy."""
        if len(timeframes) < 2:
            return True
        
        sorted_tfs = cls.sort_timeframes_by_duration(timeframes)
        
        # Check each timeframe is a multiple of the previous
        for i in range(1, len(sorted_tfs)):
            current_minutes = cls.get_timeframe_minutes(sorted_tfs[i])
            previous_minutes = cls.get_timeframe_minutes(sorted_tfs[i-1])
            
            if current_minutes % previous_minutes != 0:
                return False
        
        return True

def calculate_session_times(timezone: str = 'UTC') -> Dict[str, Dict[str, int]]:
    """
    Calculate trading session times for different markets.
    
    Args:
        timezone: Timezone for session calculations
        
    Returns:
        Dictionary with session start/end hours
    """
    # All times in UTC
    sessions = {
        'ASIAN': {'start': 21, 'end': 6},      # Tokyo session
        'LONDON': {'start': 7, 'end': 16},     # London session  
        'NY': {'start': 13, 'end': 22},        # New York session
        'OVERLAP': {'start': 13, 'end': 16}    # London/NY overlap
    }
    
    return sessions

def detect_market_hours(timestamp: datetime) -> str:
    """
    Detect which market session a timestamp belongs to.
    
    Args:
        timestamp: Datetime to classify
        
    Returns:
        Session name ('ASIAN', 'LONDON', 'NY', 'OVERLAP')
    """
    sessions = calculate_session_times()
    hour = timestamp.hour
    
    # Check overlap first (most important session)
    if sessions['OVERLAP']['start'] <= hour < sessions['OVERLAP']['end']:
        return 'OVERLAP'
    
    # Check London session
    elif sessions['LONDON']['start'] <= hour < sessions['LONDON']['end']:
        return 'LONDON'
    
    # Check NY session
    elif sessions['NY']['start'] <= hour < sessions['NY']['end']:
        return 'NY'
    
    # Default to Asian session
    else:
        return 'ASIAN'

def align_timestamps_to_timeframe(timestamps: pd.DatetimeIndex, 
                                 target_timeframe: str) -> pd.DatetimeIndex:
    """
    Align timestamps to specific timeframe boundaries.
    
    Args:
        timestamps: Original timestamps
        target_timeframe: Target timeframe (e.g., '5T', '1H')
        
    Returns:
        Aligned timestamps
    """
    # Round down to timeframe boundaries
    aligned = timestamps.floor(target_timeframe)
    return aligned

def calculate_timeframe_correlation(data1: pd.Series, data2: pd.Series) -> float:
    """
    Calculate correlation between two timeframe series.
    
    Args:
        data1: First timeframe data
        data2: Second timeframe data
        
    Returns:
        Correlation coefficient
    """
    # Align indices
    common_index = data1.index.intersection(data2.index)
    
    if len(common_index) < 2:
        return 0.0
    
    aligned_data1 = data1.reindex(common_index)
    aligned_data2 = data2.reindex(common_index)
    
    return aligned_data1.corr(aligned_data2)

def create_timeframe_summary(mtf_data: Dict[str, pd.DataFrame]) -> Dict[str, Dict]:
    """
    Create summary of multi-timeframe data.
    
    Args:
        mtf_data: Multi-timeframe data dictionary
        
    Returns:
        Summary statistics for each timeframe
    """
    summary = {}
    
    for tf, data in mtf_data.items():
        if not data.empty:
            summary[tf] = {
                'timeframe': TimeframeConverter.convert_timeframe_notation(tf),
                'start_time': data.index[0].isoformat(),
                'end_time': data.index[-1].isoformat(),
                'total_bars': len(data),
                'date_range_days': (data.index[-1] - data.index[0]).days,
                'price_range': {
                    'high': data['high'].max(),
                    'low': data['low'].min(),
                    'range_pct': ((data['high'].max() - data['low'].min()) / data['close'].mean()) * 100
                },
                'volatility': {
                    'avg_true_range': data.get('atr_14', pd.Series()).mean(),
                    'price_std': data['close'].std(),
                    'returns_std': data['close'].pct_change().std()
                }
            }
    
    return summary

# Example usage
if __name__ == "__main__":
    # Test timeframe utilities
    converter = TimeframeConverter()
    
    timeframes = ['1T', '5T', '15T', '1H', '4H']
    print("Timeframes sorted by duration:", converter.sort_timeframes_by_duration(timeframes))
    print("Higher timeframes from 5T:", converter.get_higher_timeframes('5T'))
    print("Timeframe hierarchy valid:", converter.validate_timeframe_hierarchy(timeframes))
    
    # Test session detection
    test_time = datetime(2024, 1, 15, 14, 30)  # 14:30 UTC
    session = detect_market_hours(test_time)
    print(f"Session for {test_time}: {session}")
