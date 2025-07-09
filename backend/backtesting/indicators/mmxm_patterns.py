"""
MMXM (Market Maker Move) Pattern Recognition
==========================================

Implementation of Market Maker Move concepts including:
- Accumulation and Distribution phases
- Composite Man behavior analysis
- Wyckoff principles
- Institutional flow patterns
- Spring and Upthrust detection
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class MarketPhase(Enum):
    """Market phases according to Wyckoff/MMXM theory."""
    ACCUMULATION = "ACCUMULATION"
    MARKUP = "MARKUP"
    DISTRIBUTION = "DISTRIBUTION"
    MARKDOWN = "MARKDOWN"
    REACCUMULATION = "REACCUMULATION"
    REDISTRIBUTION = "REDISTRIBUTION"

class VolumePattern(Enum):
    """Volume patterns for MMXM analysis."""
    CLIMAX_VOLUME = "CLIMAX_VOLUME"
    NO_DEMAND = "NO_DEMAND"
    NO_SUPPLY = "NO_SUPPLY"
    EFFORT_VS_RESULT = "EFFORT_VS_RESULT"
    BACKGROUND_VOLUME = "BACKGROUND_VOLUME"

@dataclass
class MMXMSignal:
    """Represents an MMXM trading signal."""
    timestamp: pd.Timestamp
    phase: MarketPhase
    signal_type: str  # "spring", "upthrust", "test", "breakout"
    strength: float  # 1-10
    volume_confirmation: bool
    price_level: float
    notes: str = ""

@dataclass
class AccumulationZone:
    """Represents a Wyckoff accumulation zone."""
    start_index: int
    end_index: int
    support_level: float
    resistance_level: float
    volume_average: float
    phase: MarketPhase
    spring_detected: bool = False
    test_count: int = 0

@dataclass
class DistributionZone:
    """Represents a Wyckoff distribution zone."""
    start_index: int
    end_index: int
    support_level: float
    resistance_level: float
    volume_average: float
    phase: MarketPhase
    upthrust_detected: bool = False
    test_count: int = 0

class MMXMAnalyzer:
    """
    Market Maker Move (MMXM) analyzer implementing Wyckoff principles.
    
    This analyzer identifies:
    - Accumulation and distribution phases
    - Spring and upthrust patterns
    - Composite man behavior
    - Volume-price relationships
    - Institutional flow patterns
    """
    
    def __init__(self, volume_ma_period: int = 20, range_threshold: float = 0.02):
        """
        Initialize MMXM Analyzer.
        
        Args:
            volume_ma_period: Period for volume moving average
            range_threshold: Threshold for range identification (2% default)
        """
        self.volume_ma_period = volume_ma_period
        self.range_threshold = range_threshold
        self.min_range_bars = 10  # Minimum bars for range identification
        
    def analyze_market_phases(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyze market phases according to Wyckoff theory.
        
        Args:
            data: OHLC data with volume
            
        Returns:
            Dictionary containing phase analysis
        """
        # Prepare data with volume analysis
        enhanced_data = self._enhance_data_with_volume_analysis(data)
        
        # Identify ranges and trends
        ranges = self._identify_trading_ranges(enhanced_data)
        trends = self._identify_trends(enhanced_data)
        
        # Classify phases
        phases = self._classify_market_phases(enhanced_data, ranges, trends)
        
        # Detect specific patterns
        springs = self._detect_springs(enhanced_data, ranges)
        upthrusts = self._detect_upthrusts(enhanced_data, ranges)
        
        return {
            'enhanced_data': enhanced_data,
            'trading_ranges': ranges,
            'trends': trends,
            'market_phases': phases,
            'springs': springs,
            'upthrusts': upthrusts,
            'current_phase': self._determine_current_phase(phases)
        }
    
    def detect_accumulation_patterns(self, data: pd.DataFrame) -> List[AccumulationZone]:
        """
        Detect Wyckoff accumulation patterns.
        
        Accumulation characteristics:
        - Price in sideways range
        - Decreasing volume on declines
        - Tests of support with no follow-through
        - Potential spring (false breakdown)
        """
        accumulation_zones = []
        
        # Find potential ranges
        ranges = self._identify_trading_ranges(data)
        
        for range_data in ranges:
            start_idx = range_data['start']
            end_idx = range_data['end']
            range_bars = data.iloc[start_idx:end_idx+1]
            
            # Check accumulation characteristics
            if self._is_accumulation_pattern(range_bars, range_data):
                
                # Check for spring pattern
                spring_detected = self._check_for_spring(range_bars, range_data)
                
                accumulation_zone = AccumulationZone(
                    start_index=start_idx,
                    end_index=end_idx,
                    support_level=range_data['support'],
                    resistance_level=range_data['resistance'],
                    volume_average=range_bars.get('volume', pd.Series()).mean(),
                    phase=MarketPhase.ACCUMULATION,
                    spring_detected=spring_detected,
                    test_count=self._count_support_tests(range_bars, range_data['support'])
                )
                
                accumulation_zones.append(accumulation_zone)
        
        logger.info(f"Detected {len(accumulation_zones)} accumulation zones")
        return accumulation_zones
    
    def detect_distribution_patterns(self, data: pd.DataFrame) -> List[DistributionZone]:
        """
        Detect Wyckoff distribution patterns.
        
        Distribution characteristics:
        - Price in sideways range after uptrend
        - Increasing volume on rallies but price doesn't advance
        - Tests of resistance with rejection
        - Potential upthrust (false breakout)
        """
        distribution_zones = []
        
        # Find potential ranges
        ranges = self._identify_trading_ranges(data)
        
        for range_data in ranges:
            start_idx = range_data['start']
            end_idx = range_data['end']
            range_bars = data.iloc[start_idx:end_idx+1]
            
            # Check distribution characteristics
            if self._is_distribution_pattern(range_bars, range_data):
                
                # Check for upthrust pattern
                upthrust_detected = self._check_for_upthrust(range_bars, range_data)
                
                distribution_zone = DistributionZone(
                    start_index=start_idx,
                    end_index=end_idx,
                    support_level=range_data['support'],
                    resistance_level=range_data['resistance'],
                    volume_average=range_bars.get('volume', pd.Series()).mean(),
                    phase=MarketPhase.DISTRIBUTION,
                    upthrust_detected=upthrust_detected,
                    test_count=self._count_resistance_tests(range_bars, range_data['resistance'])
                )
                
                distribution_zones.append(distribution_zone)
        
        logger.info(f"Detected {len(distribution_zones)} distribution zones")
        return distribution_zones
    
    def analyze_volume_price_relationship(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyze volume-price relationships for MMXM signals.
        
        Key relationships:
        - High volume + small range = absorption
        - Low volume + large range = no interest
        - Volume climax patterns
        - Effort vs Result analysis
        """
        if 'volume' not in data.columns:
            return {'error': 'Volume data required for MMXM analysis'}
        
        # Calculate volume metrics
        data = data.copy()
        data['volume_ma'] = data['volume'].rolling(window=self.volume_ma_period).mean()
        data['volume_ratio'] = data['volume'] / data['volume_ma']
        data['price_range'] = data['high'] - data['low']
        data['price_change'] = abs(data['close'] - data['open'])
        
        # Identify volume patterns
        volume_patterns = {
            'climax_volume': self._identify_climax_volume(data),
            'no_demand': self._identify_no_demand(data),
            'no_supply': self._identify_no_supply(data),
            'effort_vs_result': self._analyze_effort_vs_result(data),
            'absorption': self._identify_absorption(data)
        }
        
        return {
            'volume_analysis': data[['volume', 'volume_ma', 'volume_ratio', 'price_range']],
            'volume_patterns': volume_patterns,
            'overall_bias': self._determine_volume_bias(volume_patterns)
        }
    
    def generate_mmxm_signals(self, data: pd.DataFrame) -> List[MMXMSignal]:
        """
        Generate MMXM trading signals based on Wyckoff principles.
        
        Args:
            data: OHLC data with volume
            
        Returns:
            List of MMXM signals
        """
        signals = []
        
        # Analyze market phases
        phase_analysis = self.analyze_market_phases(data)
        
        # Generate signals based on phases
        current_phase = phase_analysis['current_phase']
        
        if current_phase == MarketPhase.ACCUMULATION:
            # Look for spring signals (buying opportunities)
            spring_signals = self._generate_spring_signals(data, phase_analysis)
            signals.extend(spring_signals)
            
        elif current_phase == MarketPhase.DISTRIBUTION:
            # Look for upthrust signals (selling opportunities)
            upthrust_signals = self._generate_upthrust_signals(data, phase_analysis)
            signals.extend(upthrust_signals)
            
        elif current_phase == MarketPhase.MARKUP:
            # Look for reaccumulation patterns
            reaccumulation_signals = self._generate_reaccumulation_signals(data, phase_analysis)
            signals.extend(reaccumulation_signals)
            
        elif current_phase == MarketPhase.MARKDOWN:
            # Look for redistribution patterns
            redistribution_signals = self._generate_redistribution_signals(data, phase_analysis)
            signals.extend(redistribution_signals)
        
        logger.info(f"Generated {len(signals)} MMXM signals")
        return signals
    
    def _enhance_data_with_volume_analysis(self, data: pd.DataFrame) -> pd.DataFrame:
        """Enhance data with volume-based calculations."""
        enhanced = data.copy()
        
        if 'volume' in enhanced.columns:
            # Volume moving averages
            enhanced['volume_ma'] = enhanced['volume'].rolling(window=self.volume_ma_period).mean()
            enhanced['volume_ratio'] = enhanced['volume'] / enhanced['volume_ma']
            
            # Volume-weighted price
            enhanced['vwap'] = (enhanced['volume'] * enhanced['close']).cumsum() / enhanced['volume'].cumsum()
            
            # Money flow
            enhanced['money_flow'] = enhanced['volume'] * enhanced['close']
            enhanced['money_flow_ma'] = enhanced['money_flow'].rolling(window=10).mean()
        
        # Price metrics
        enhanced['true_range'] = np.maximum(
            enhanced['high'] - enhanced['low'],
            np.maximum(
                abs(enhanced['high'] - enhanced['close'].shift(1)),
                abs(enhanced['low'] - enhanced['close'].shift(1))
            )
        )
        enhanced['atr'] = enhanced['true_range'].rolling(window=14).mean()
        
        return enhanced
    
    def _identify_trading_ranges(self, data: pd.DataFrame) -> List[Dict[str, Any]]:
        """Identify sideways trading ranges."""
        ranges = []
        
        # Simple range identification based on price action
        window_size = 20
        
        for i in range(window_size, len(data) - window_size):
            window_data = data.iloc[i-window_size:i+window_size]
            
            # Calculate range characteristics
            high_price = window_data['high'].max()
            low_price = window_data['low'].min()
            range_size = (high_price - low_price) / window_data['close'].mean()
            
            # Check if this looks like a range (low volatility)
            if range_size < self.range_threshold:
                # Look for range boundaries
                support_level = window_data['low'].quantile(0.1)
                resistance_level = window_data['high'].quantile(0.9)
                
                range_info = {
                    'start': i - window_size,
                    'end': i + window_size,
                    'support': support_level,
                    'resistance': resistance_level,
                    'range_size': range_size,
                    'center': (support_level + resistance_level) / 2
                }
                
                ranges.append(range_info)
        
        # Filter overlapping ranges
        return self._filter_overlapping_ranges(ranges)
    
    def _identify_trends(self, data: pd.DataFrame) -> List[Dict[str, Any]]:
        """Identify trend periods."""
        trends = []
        
        # Simple trend identification using moving averages
        data['ma_short'] = data['close'].rolling(window=10).mean()
        data['ma_long'] = data['close'].rolling(window=30).mean()
        
        # Trend direction
        data['trend'] = np.where(data['ma_short'] > data['ma_long'], 1, -1)
        data['trend_change'] = data['trend'].diff()
        
        trend_starts = data[data['trend_change'] != 0].index
        
        for i in range(len(trend_starts) - 1):
            start_idx = data.index.get_loc(trend_starts[i])
            end_idx = data.index.get_loc(trend_starts[i + 1])
            
            trend_data = data.iloc[start_idx:end_idx]
            trend_direction = trend_data['trend'].iloc[0]
            
            trends.append({
                'start': start_idx,
                'end': end_idx,
                'direction': 'up' if trend_direction > 0 else 'down',
                'strength': abs(trend_data['close'].iloc[-1] - trend_data['close'].iloc[0]) / trend_data['close'].iloc[0]
            })
        
        return trends
    
    def _classify_market_phases(self, data: pd.DataFrame, ranges: List[Dict], trends: List[Dict]) -> List[Dict[str, Any]]:
        """Classify market phases based on ranges and trends."""
        phases = []
        
        for i, range_info in enumerate(ranges):
            # Look at trend before and after range
            range_start = range_info['start']
            range_end = range_info['end']
            
            # Find trends before and after
            trend_before = None
            trend_after = None
            
            for trend in trends:
                if trend['end'] <= range_start:
                    trend_before = trend
                elif trend['start'] >= range_end:
                    if trend_after is None:
                        trend_after = trend
            
            # Classify phase
            if trend_before and trend_before['direction'] == 'down':
                if trend_after and trend_after['direction'] == 'up':
                    phase = MarketPhase.ACCUMULATION
                else:
                    phase = MarketPhase.ACCUMULATION  # Assume accumulation after downtrend
            elif trend_before and trend_before['direction'] == 'up':
                if trend_after and trend_after['direction'] == 'down':
                    phase = MarketPhase.DISTRIBUTION
                else:
                    phase = MarketPhase.REACCUMULATION  # Range in uptrend
            else:
                phase = MarketPhase.ACCUMULATION  # Default
            
            phases.append({
                'start': range_start,
                'end': range_end,
                'phase': phase,
                'range_info': range_info
            })
        
        return phases
    
    def _detect_springs(self, data: pd.DataFrame, ranges: List[Dict]) -> List[Dict[str, Any]]:
        """Detect spring patterns (false breakdowns)."""
        springs = []
        
        for range_info in ranges:
            range_data = data.iloc[range_info['start']:range_info['end']]
            support_level = range_info['support']
            
            # Look for breaks below support that quickly reverse
            breaks = range_data[range_data['low'] < support_level]
            
            for break_idx in breaks.index:
                break_bar = range_data.loc[break_idx]
                
                # Check if it's a spring (quick reversal)
                if break_bar['close'] > support_level:  # Closed back above support
                    # Check for volume characteristics
                    volume_confirmation = False
                    if 'volume' in range_data.columns:
                        avg_volume = range_data['volume'].mean()
                        volume_confirmation = break_bar['volume'] > avg_volume * 1.5
                    
                    springs.append({
                        'timestamp': break_idx,
                        'price': break_bar['low'],
                        'support_level': support_level,
                        'volume_confirmation': volume_confirmation,
                        'range_info': range_info
                    })
        
        return springs
    
    def _detect_upthrusts(self, data: pd.DataFrame, ranges: List[Dict]) -> List[Dict[str, Any]]:
        """Detect upthrust patterns (false breakouts)."""
        upthrusts = []
        
        for range_info in ranges:
            range_data = data.iloc[range_info['start']:range_info['end']]
            resistance_level = range_info['resistance']
            
            # Look for breaks above resistance that quickly reverse
            breaks = range_data[range_data['high'] > resistance_level]
            
            for break_idx in breaks.index:
                break_bar = range_data.loc[break_idx]
                
                # Check if it's an upthrust (quick reversal)
                if break_bar['close'] < resistance_level:  # Closed back below resistance
                    # Check for volume characteristics
                    volume_confirmation = False
                    if 'volume' in range_data.columns:
                        avg_volume = range_data['volume'].mean()
                        volume_confirmation = break_bar['volume'] > avg_volume * 1.5
                    
                    upthrusts.append({
                        'timestamp': break_idx,
                        'price': break_bar['high'],
                        'resistance_level': resistance_level,
                        'volume_confirmation': volume_confirmation,
                        'range_info': range_info
                    })
        
        return upthrusts
    
    def _determine_current_phase(self, phases: List[Dict]) -> MarketPhase:
        """Determine current market phase."""
        if not phases:
            return MarketPhase.ACCUMULATION  # Default
        
        # Return the most recent phase
        latest_phase = phases[-1]
        return latest_phase['phase']
    
    # Additional helper methods for pattern recognition
    def _is_accumulation_pattern(self, range_bars: pd.DataFrame, range_data: Dict) -> bool:
        """Check if range shows accumulation characteristics."""
        # Simplified check - in real implementation, this would be more sophisticated
        return True  # Placeholder
    
    def _is_distribution_pattern(self, range_bars: pd.DataFrame, range_data: Dict) -> bool:
        """Check if range shows distribution characteristics."""
        # Simplified check - in real implementation, this would be more sophisticated
        return True  # Placeholder
    
    def _check_for_spring(self, range_bars: pd.DataFrame, range_data: Dict) -> bool:
        """Check for spring pattern in range."""
        # Simplified implementation
        support = range_data['support']
        return any(range_bars['low'] < support) and range_bars['close'].iloc[-1] > support
    
    def _check_for_upthrust(self, range_bars: pd.DataFrame, range_data: Dict) -> bool:
        """Check for upthrust pattern in range."""
        # Simplified implementation
        resistance = range_data['resistance']
        return any(range_bars['high'] > resistance) and range_bars['close'].iloc[-1] < resistance
    
    def _count_support_tests(self, range_bars: pd.DataFrame, support_level: float) -> int:
        """Count number of support tests."""
        tolerance = support_level * 0.002  # 0.2% tolerance
        tests = range_bars[abs(range_bars['low'] - support_level) <= tolerance]
        return len(tests)
    
    def _count_resistance_tests(self, range_bars: pd.DataFrame, resistance_level: float) -> int:
        """Count number of resistance tests."""
        tolerance = resistance_level * 0.002  # 0.2% tolerance
        tests = range_bars[abs(range_bars['high'] - resistance_level) <= tolerance]
        return len(tests)
    
    def _filter_overlapping_ranges(self, ranges: List[Dict]) -> List[Dict]:
        """Filter out overlapping ranges, keeping the strongest ones."""
        if not ranges:
            return ranges
        
        # Sort by range quality (smaller range size = better)
        sorted_ranges = sorted(ranges, key=lambda x: x['range_size'])
        filtered = []
        
        for range_data in sorted_ranges:
            # Check if it overlaps with any existing filtered range
            overlaps = False
            for existing in filtered:
                if (range_data['start'] < existing['end'] and 
                    range_data['end'] > existing['start']):
                    overlaps = True
                    break
            
            if not overlaps:
                filtered.append(range_data)
        
        return filtered
    
    def _identify_climax_volume(self, data: pd.DataFrame) -> List[int]:
        """Identify volume climax points."""
        volume_threshold = data['volume_ma'] * 2  # 2x average volume
        climax_points = data[data['volume'] > volume_threshold].index.tolist()
        return [data.index.get_loc(idx) for idx in climax_points]
    
    def _identify_no_demand(self, data: pd.DataFrame) -> List[int]:
        """Identify no demand conditions (up move on low volume)."""
        up_moves = data[data['close'] > data['open']]
        low_volume = up_moves[up_moves['volume'] < up_moves['volume_ma'] * 0.7]
        return [data.index.get_loc(idx) for idx in low_volume.index]
    
    def _identify_no_supply(self, data: pd.DataFrame) -> List[int]:
        """Identify no supply conditions (down move on low volume)."""
        down_moves = data[data['close'] < data['open']]
        low_volume = down_moves[down_moves['volume'] < down_moves['volume_ma'] * 0.7]
        return [data.index.get_loc(idx) for idx in low_volume.index]
    
    def _analyze_effort_vs_result(self, data: pd.DataFrame) -> List[Dict]:
        """Analyze effort vs result (volume vs price movement)."""
        effort_result = []
        
        for i in range(1, len(data)):
            volume_ratio = data.iloc[i]['volume_ratio']
            price_change = abs(data.iloc[i]['close'] - data.iloc[i-1]['close'])
            price_change_pct = price_change / data.iloc[i-1]['close']
            
            # High effort (volume) but low result (price change)
            if volume_ratio > 1.5 and price_change_pct < 0.005:  # 0.5% price change
                effort_result.append({
                    'index': i,
                    'type': 'high_effort_low_result',
                    'volume_ratio': volume_ratio,
                    'price_change_pct': price_change_pct
                })
        
        return effort_result
    
    def _identify_absorption(self, data: pd.DataFrame) -> List[int]:
        """Identify absorption (high volume, small range)."""
        high_volume = data[data['volume_ratio'] > 1.5]
        small_range = high_volume[high_volume['price_range'] < high_volume['atr'] * 0.5]
        return [data.index.get_loc(idx) for idx in small_range.index]
    
    def _determine_volume_bias(self, volume_patterns: Dict) -> str:
        """Determine overall volume bias."""
        # Simplified implementation
        no_demand_count = len(volume_patterns.get('no_demand', []))
        no_supply_count = len(volume_patterns.get('no_supply', []))
        
        if no_supply_count > no_demand_count:
            return "bullish"
        elif no_demand_count > no_supply_count:
            return "bearish"
        else:
            return "neutral"
    
    def _generate_spring_signals(self, data: pd.DataFrame, phase_analysis: Dict) -> List[MMXMSignal]:
        """Generate signals based on spring patterns."""
        signals = []
        springs = phase_analysis.get('springs', [])
        
        for spring in springs:
            if spring['volume_confirmation']:
                signal = MMXMSignal(
                    timestamp=spring['timestamp'],
                    phase=MarketPhase.ACCUMULATION,
                    signal_type="spring",
                    strength=8.0,  # High strength for volume-confirmed spring
                    volume_confirmation=True,
                    price_level=spring['price'],
                    notes=f"Spring at {spring['price']:.2f}, support at {spring['support_level']:.2f}"
                )
                signals.append(signal)
        
        return signals
    
    def _generate_upthrust_signals(self, data: pd.DataFrame, phase_analysis: Dict) -> List[MMXMSignal]:
        """Generate signals based on upthrust patterns."""
        signals = []
        upthrusts = phase_analysis.get('upthrusts', [])
        
        for upthrust in upthrusts:
            if upthrust['volume_confirmation']:
                signal = MMXMSignal(
                    timestamp=upthrust['timestamp'],
                    phase=MarketPhase.DISTRIBUTION,
                    signal_type="upthrust",
                    strength=8.0,  # High strength for volume-confirmed upthrust
                    volume_confirmation=True,
                    price_level=upthrust['price'],
                    notes=f"Upthrust at {upthrust['price']:.2f}, resistance at {upthrust['resistance_level']:.2f}"
                )
                signals.append(signal)
        
        return signals
    
    def _generate_reaccumulation_signals(self, data: pd.DataFrame, phase_analysis: Dict) -> List[MMXMSignal]:
        """Generate signals for reaccumulation patterns."""
        # Placeholder implementation
        return []
    
    def _generate_redistribution_signals(self, data: pd.DataFrame, phase_analysis: Dict) -> List[MMXMSignal]:
        """Generate signals for redistribution patterns."""
        # Placeholder implementation
        return []

# Example usage
if __name__ == "__main__":
    analyzer = MMXMAnalyzer()
    print("MMXM Analyzer initialized successfully!")
