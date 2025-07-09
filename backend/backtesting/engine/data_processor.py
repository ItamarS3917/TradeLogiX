"""
TradingView Data Processor
=========================

Handles processing of TradingView CSV exports for backtesting.
Supports multi-timeframe alignment and ICT/MMXM specific calculations.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class TradingViewProcessor:
    """
    Process TradingView CSV exports into structured data for backtesting.
    
    Expected CSV format:
    time,open,high,low,close,RSI,RSI-based MA,Regular Bullish,Regular Bullish Label,Regular Bearish,Regular Bearish Label
    1735570200,21315.25,21321.5,21309.5,21316.75,45.123,46.789,"","","",""
    """
    
    REQUIRED_COLUMNS = ['time', 'open', 'high', 'low', 'close']
    OPTIONAL_COLUMNS = ['RSI', 'RSI-based MA', 'Regular Bullish', 'Regular Bullish Label', 
                       'Regular Bearish', 'Regular Bearish Label', 'volume']
    
    # Trading sessions (UTC times)
    SESSIONS = {
        'ASIAN': {'start': 21, 'end': 6},      # 21:00 UTC - 06:00 UTC
        'LONDON': {'start': 7, 'end': 16},     # 07:00 UTC - 16:00 UTC
        'NY': {'start': 13, 'end': 22},        # 13:00 UTC - 22:00 UTC
        'OVERLAP': {'start': 13, 'end': 16}    # London/NY Overlap
    }
    
    def __init__(self):
        self.data_cache = {}
        
    def load_csv(self, file_path: str) -> pd.DataFrame:
        """
        Load and validate TradingView CSV data.
        
        Args:
            file_path: Path to CSV file
            
        Returns:
            Validated DataFrame with required columns
            
        Raises:
            ValueError: If required columns are missing
            FileNotFoundError: If file doesn't exist
        """
        try:
            # Load CSV
            df = pd.read_csv(file_path)
            logger.info(f"Loaded {len(df)} rows from {file_path}")
            
            # Validate required columns
            missing_cols = [col for col in self.REQUIRED_COLUMNS if col not in df.columns]
            if missing_cols:
                raise ValueError(f"Missing required columns: {missing_cols}")
            
            # Convert timestamp to datetime
            df['datetime'] = pd.to_datetime(df['time'], unit='s')
            df.set_index('datetime', inplace=True)
            
            # Sort by time
            df.sort_index(inplace=True)
            
            # Add session information
            df['session'] = df.apply(self._classify_session, axis=1)
            
            # Calculate basic price action metrics
            df = self._add_price_action_metrics(df)
            
            logger.info(f"Processed data from {df.index[0]} to {df.index[-1]}")
            return df
            
        except Exception as e:
            logger.error(f"Error loading CSV {file_path}: {str(e)}")
            raise
    
    def _classify_session(self, row) -> str:
        """Classify trading session based on UTC hour."""
        hour = row.name.hour
        
        if self.SESSIONS['OVERLAP']['start'] <= hour < self.SESSIONS['OVERLAP']['end']:
            return 'OVERLAP'
        elif self.SESSIONS['LONDON']['start'] <= hour < self.SESSIONS['LONDON']['end']:
            return 'LONDON'
        elif self.SESSIONS['NY']['start'] <= hour < self.SESSIONS['NY']['end']:
            return 'NY'
        else:
            return 'ASIAN'
    
    def _add_price_action_metrics(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add basic price action calculations."""
        # True Range
        df['true_range'] = np.maximum(
            df['high'] - df['low'],
            np.maximum(
                abs(df['high'] - df['close'].shift(1)),
                abs(df['low'] - df['close'].shift(1))
            )
        )
        
        # Average True Range (14 period)
        df['atr_14'] = df['true_range'].rolling(window=14).mean()
        
        # Price range percentage
        df['range_pct'] = ((df['high'] - df['low']) / df['close']) * 100
        
        # Body size and wick analysis
        df['body_size'] = abs(df['close'] - df['open'])
        df['upper_wick'] = df['high'] - np.maximum(df['open'], df['close'])
        df['lower_wick'] = np.minimum(df['open'], df['close']) - df['low']
        
        # Bullish/Bearish candle
        df['bullish'] = df['close'] > df['open']
        df['bearish'] = df['close'] < df['open']
        df['doji'] = abs(df['close'] - df['open']) < (df['atr_14'] * 0.1)
        
        return df
    
    def resample_to_timeframe(self, df: pd.DataFrame, timeframe: str) -> pd.DataFrame:
        """
        Resample data to different timeframe.
        
        Args:
            df: Source DataFrame (should be 1m or 5m data)
            timeframe: Target timeframe ('5T', '15T', '1H', '4H', '1D')
            
        Returns:
            Resampled DataFrame
        """
        try:
            # OHLC resampling rules
            ohlc_rules = {
                'open': 'first',
                'high': 'max', 
                'low': 'min',
                'close': 'last',
                'volume': 'sum' if 'volume' in df.columns else 'mean'
            }
            
            # Indicator resampling rules
            indicator_rules = {}
            for col in df.columns:
                if col not in ['open', 'high', 'low', 'close', 'volume']:
                    if 'RSI' in col or 'MA' in col:
                        indicator_rules[col] = 'last'  # Take last value for indicators
                    elif col in ['session']:
                        indicator_rules[col] = 'last'
                    else:
                        indicator_rules[col] = 'mean'  # Average for other metrics
            
            # Combine rules
            all_rules = {**ohlc_rules, **indicator_rules}
            
            # Resample
            resampled = df.resample(timeframe).agg(all_rules)
            
            # Remove any rows with NaN in OHLC
            resampled.dropna(subset=['open', 'high', 'low', 'close'], inplace=True)
            
            # Recalculate basic metrics for new timeframe
            resampled = self._add_price_action_metrics(resampled)
            
            logger.info(f"Resampled to {timeframe}: {len(resampled)} bars")
            return resampled
            
        except Exception as e:
            logger.error(f"Error resampling to {timeframe}: {str(e)}")
            raise
    
    def create_multi_timeframe_dataset(self, base_data: pd.DataFrame, 
                                     timeframes: List[str]) -> Dict[str, pd.DataFrame]:
        """
        Create multi-timeframe dataset from base data.
        
        Args:
            base_data: Base timeframe data (1m or 5m)
            timeframes: List of target timeframes ['5T', '15T', '1H', '4H', '1D']
            
        Returns:
            Dictionary with timeframe as key and DataFrame as value
        """
        mtf_data = {}
        
        # Determine base timeframe
        time_diff = (base_data.index[1] - base_data.index[0]).total_seconds() / 60
        base_tf = f"{int(time_diff)}T" if time_diff < 60 else f"{int(time_diff/60)}H"
        
        # Add base timeframe
        mtf_data[base_tf] = base_data.copy()
        
        # Create higher timeframes
        for tf in timeframes:
            if tf != base_tf:
                mtf_data[tf] = self.resample_to_timeframe(base_data, tf)
        
        logger.info(f"Created multi-timeframe dataset with {len(mtf_data)} timeframes")
        return mtf_data
    
    def align_timeframes_for_analysis(self, mtf_data: Dict[str, pd.DataFrame], 
                                    reference_timeframe: str) -> Dict[str, pd.DataFrame]:
        """
        Align all timeframes to the reference timeframe timestamps.
        
        This is crucial for backtesting to ensure we only use data available 
        at each point in time.
        """
        reference_df = mtf_data[reference_timeframe]
        aligned_data = {reference_timeframe: reference_df}
        
        for tf, df in mtf_data.items():
            if tf != reference_timeframe:
                # Forward fill higher timeframe data to match reference timestamps
                aligned_df = df.reindex(reference_df.index, method='ffill')
                aligned_data[tf] = aligned_df
        
        logger.info(f"Aligned {len(mtf_data)} timeframes to {reference_timeframe}")
        return aligned_data
    
    def validate_data_quality(self, df: pd.DataFrame) -> Dict[str, any]:
        """
        Validate data quality and return quality metrics.
        
        Returns:
            Dictionary with quality metrics and issues found
        """
        quality_report = {
            'total_rows': len(df),
            'missing_data': {},
            'data_gaps': [],
            'price_anomalies': [],
            'quality_score': 0.0
        }
        
        # Check for missing values
        for col in self.REQUIRED_COLUMNS:
            missing_count = df[col].isna().sum()
            if missing_count > 0:
                quality_report['missing_data'][col] = missing_count
        
        # Check for data gaps (missing time periods)
        time_diffs = df.index.to_series().diff()
        expected_diff = time_diffs.mode()[0]  # Most common time difference
        gaps = time_diffs[time_diffs > expected_diff * 1.5]
        quality_report['data_gaps'] = len(gaps)
        
        # Check for price anomalies
        # Extreme price moves (>10% in one candle)
        price_changes = ((df['close'] - df['close'].shift(1)) / df['close'].shift(1) * 100).abs()
        extreme_moves = price_changes[price_changes > 10]
        quality_report['price_anomalies'] = len(extreme_moves)
        
        # Calculate quality score (0-100)
        quality_score = 100
        quality_score -= (sum(quality_report['missing_data'].values()) / len(df)) * 100
        quality_score -= min(quality_report['data_gaps'] * 5, 50)
        quality_score -= min(quality_report['price_anomalies'] * 10, 30)
        quality_report['quality_score'] = max(0, quality_score)
        
        logger.info(f"Data quality score: {quality_report['quality_score']:.1f}/100")
        return quality_report
    
    def export_processed_data(self, mtf_data: Dict[str, pd.DataFrame], 
                            output_dir: str) -> List[str]:
        """Export processed multi-timeframe data to CSV files."""
        output_dir = Path(output_dir)
        output_dir.mkdir(exist_ok=True)
        
        exported_files = []
        
        for timeframe, df in mtf_data.items():
            filename = f"NQ_{timeframe}_processed.csv"
            filepath = output_dir / filename
            
            # Reset index to include datetime as column
            export_df = df.reset_index()
            export_df.to_csv(filepath, index=False)
            
            exported_files.append(str(filepath))
            logger.info(f"Exported {timeframe} data to {filepath}")
        
        return exported_files

# Example usage and testing
if __name__ == "__main__":
    # Example of how to use the processor
    processor = TradingViewProcessor()
    
    # This would be used with actual data
    # df = processor.load_csv("path/to/your/NQ_5m_data.csv")
    # mtf_data = processor.create_multi_timeframe_dataset(df, ['15T', '1H', '4H'])
    # quality = processor.validate_data_quality(df)
    
    print("TradingView Processor initialized successfully!")
