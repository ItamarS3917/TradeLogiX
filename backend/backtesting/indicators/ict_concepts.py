"""
ICT (Inner Circle Trader) Concepts Implementation
===============================================

Core ICT trading concepts including:
- Market Structure Analysis
- Order Block Detection
- Fair Value Gap (FVG) Identification
- Liquidity Analysis
- Break of Structure (BOS) and Change of Character (CHoCH)
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class MarketStructure(Enum):
    """Market structure types."""
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"
    NEUTRAL = "NEUTRAL"
    CONSOLIDATION = "CONSOLIDATION"

class OrderBlockType(Enum):
    """Order block types."""
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"

@dataclass
class SwingPoint:
    """Represents a swing high or low point."""
    index: int
    timestamp: pd.Timestamp
    price: float
    type: str  # "high" or "low"
    strength: int  # Number of bars on each side
    
@dataclass
class OrderBlock:
    """Represents an institutional order block."""
    start_index: int
    end_index: int
    high: float
    low: float
    type: OrderBlockType
    strength: float  # 1-10 rating
    mitigation_count: int = 0
    last_test_time: Optional[pd.Timestamp] = None
    
@dataclass
class FairValueGap:
    """Represents a Fair Value Gap (FVG)."""
    index: int
    timestamp: pd.Timestamp
    high: float
    low: float
    type: str  # "bullish" or "bearish"
    size: float
    filled: bool = False
    fill_time: Optional[pd.Timestamp] = None

@dataclass
class LiquidityZone:
    """Represents a liquidity zone."""
    price: float
    timestamp: pd.Timestamp
    type: str  # "equal_highs", "equal_lows", "range_high", "range_low"
    strength: float
    swept: bool = False
    sweep_time: Optional[pd.Timestamp] = None

class ICTAnalyzer:
    """
    Main class for ICT concept analysis.
    
    Implements all core ICT trading concepts including market structure,
    order blocks, fair value gaps, and liquidity analysis.
    """
    
    def __init__(self, lookback_period: int = 20):
        """
        Initialize ICT Analyzer.
        
        Args:
            lookback_period: Number of bars to look back for swing point identification
        """
        self.lookback_period = lookback_period
        self.swing_strength = 5  # Minimum bars on each side for swing point
        self.equal_level_tolerance = 0.1  # Percentage tolerance for equal levels
        
    def analyze_market_structure(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Analyze overall market structure.
        
        Args:
            data: OHLC data with datetime index
            
        Returns:
            Dictionary containing market structure analysis
        """
        # Find swing points
        swing_highs = self._find_swing_highs(data)
        swing_lows = self._find_swing_lows(data)
        
        # Analyze structure trend
        structure_trend = self._analyze_structure_trend(swing_highs, swing_lows)
        
        # Detect BOS and CHoCH
        bos_points = self._detect_break_of_structure(data, swing_highs, swing_lows)
        choch_points = self._detect_change_of_character(data, swing_highs, swing_lows)
        
        return {
            'swing_highs': swing_highs,
            'swing_lows': swing_lows,
            'structure_trend': structure_trend,
            'break_of_structure': bos_points,
            'change_of_character': choch_points,
            'current_bias': self._determine_current_bias(swing_highs, swing_lows)
        }
    
    def detect_order_blocks(self, data: pd.DataFrame) -> List[OrderBlock]:
        """
        Detect institutional order blocks.
        
        Order blocks are areas where institutions placed large orders,
        typically identified by strong moves away from consolidation areas.
        
        Args:
            data: OHLC data with datetime index
            
        Returns:
            List of OrderBlock objects
        """
        order_blocks = []
        
        # Look for strong moves (>1.5% in one candle for NQ)
        data['price_change_pct'] = data['close'].pct_change() * 100
        strong_moves = data[abs(data['price_change_pct']) > 1.5]
        
        for idx in strong_moves.index:
            current_idx = data.index.get_loc(idx)
            
            # Look back for the last candle before the move
            if current_idx > 0:
                prev_candle = data.iloc[current_idx - 1]
                current_candle = data.iloc[current_idx]
                
                # Determine order block type
                if current_candle['close'] > prev_candle['close']:  # Bullish move
                    ob_type = OrderBlockType.BULLISH
                    # Order block is the previous candle's range
                    ob_high = prev_candle['high']
                    ob_low = prev_candle['low']
                else:  # Bearish move
                    ob_type = OrderBlockType.BEARISH
                    ob_high = prev_candle['high']
                    ob_low = prev_candle['low']
                
                # Calculate strength based on move size and volume
                strength = self._calculate_order_block_strength(
                    prev_candle, current_candle, data.iloc[current_idx:current_idx+5]
                )
                
                order_block = OrderBlock(
                    start_index=current_idx - 1,
                    end_index=current_idx - 1,
                    high=ob_high,
                    low=ob_low,
                    type=ob_type,
                    strength=strength
                )
                
                order_blocks.append(order_block)
        
        # Remove duplicate/overlapping order blocks
        order_blocks = self._filter_order_blocks(order_blocks)
        
        logger.info(f"Detected {len(order_blocks)} order blocks")
        return order_blocks
    
    def detect_fair_value_gaps(self, data: pd.DataFrame) -> List[FairValueGap]:
        """
        Detect Fair Value Gaps (FVGs).
        
        FVGs occur when there's a gap between candles that indicates
        inefficient price delivery that may be filled later.
        
        Args:
            data: OHLC data with datetime index
            
        Returns:
            List of FairValueGap objects
        """
        fvgs = []
        
        for i in range(2, len(data)):
            candle1 = data.iloc[i-2]  # First candle
            candle2 = data.iloc[i-1]  # Middle candle  
            candle3 = data.iloc[i]    # Third candle
            
            # Bullish FVG: Gap between candle1 high and candle3 low
            if (candle1['high'] < candle3['low'] and 
                candle2['close'] > candle2['open']):  # Middle candle is bullish
                
                gap_high = candle3['low']
                gap_low = candle1['high']
                gap_size = gap_high - gap_low
                
                if gap_size > 0:  # Valid gap
                    fvg = FairValueGap(
                        index=i-1,
                        timestamp=data.index[i-1],
                        high=gap_high,
                        low=gap_low,
                        type="bullish",
                        size=gap_size
                    )
                    fvgs.append(fvg)
            
            # Bearish FVG: Gap between candle1 low and candle3 high
            elif (candle1['low'] > candle3['high'] and 
                  candle2['close'] < candle2['open']):  # Middle candle is bearish
                
                gap_high = candle1['low']
                gap_low = candle3['high']
                gap_size = gap_high - gap_low
                
                if gap_size > 0:  # Valid gap
                    fvg = FairValueGap(
                        index=i-1,
                        timestamp=data.index[i-1],
                        high=gap_high,
                        low=gap_low,
                        type="bearish",
                        size=gap_size
                    )
                    fvgs.append(fvg)
        
        logger.info(f"Detected {len(fvgs)} fair value gaps")
        return fvgs
    
    def identify_liquidity_zones(self, data: pd.DataFrame) -> List[LiquidityZone]:
        """
        Identify liquidity zones including equal highs/lows.
        
        These are areas where stops are likely to be placed.
        
        Args:
            data: OHLC data with datetime index
            
        Returns:
            List of LiquidityZone objects
        """
        liquidity_zones = []
        
        # Find recent highs and lows
        recent_data = data.tail(50)  # Last 50 bars
        
        # Identify equal highs
        equal_highs = self._find_equal_levels(recent_data['high'], 'high')
        for price, indices in equal_highs.items():
            if len(indices) >= 2:  # At least 2 equal levels
                zone = LiquidityZone(
                    price=price,
                    timestamp=data.index[indices[-1]],
                    type="equal_highs",
                    strength=len(indices)
                )
                liquidity_zones.append(zone)
        
        # Identify equal lows
        equal_lows = self._find_equal_levels(recent_data['low'], 'low')
        for price, indices in equal_lows.items():
            if len(indices) >= 2:  # At least 2 equal levels
                zone = LiquidityZone(
                    price=price,
                    timestamp=data.index[indices[-1]],
                    type="equal_lows",
                    strength=len(indices)
                )
                liquidity_zones.append(zone)
        
        # Identify range highs/lows
        range_zones = self._identify_range_extremes(data)
        liquidity_zones.extend(range_zones)
        
        logger.info(f"Identified {len(liquidity_zones)} liquidity zones")
        return liquidity_zones
    
    def check_liquidity_sweeps(self, data: pd.DataFrame, 
                             liquidity_zones: List[LiquidityZone]) -> List[LiquidityZone]:
        """
        Check if any liquidity zones have been swept.
        
        Args:
            data: OHLC data
            liquidity_zones: List of liquidity zones to check
            
        Returns:
            Updated list of liquidity zones with sweep information
        """
        for zone in liquidity_zones:
            if zone.swept:
                continue  # Already swept
            
            # Check if price has swept through the zone
            if zone.type in ["equal_highs", "range_high"]:
                # Check for sweep above the level
                sweep_bars = data[data['high'] > zone.price]
                if not sweep_bars.empty:
                    zone.swept = True
                    zone.sweep_time = sweep_bars.index[0]
            
            elif zone.type in ["equal_lows", "range_low"]:
                # Check for sweep below the level
                sweep_bars = data[data['low'] < zone.price]
                if not sweep_bars.empty:
                    zone.swept = True
                    zone.sweep_time = sweep_bars.index[0]
        
        return liquidity_zones
    
    def _find_swing_highs(self, data: pd.DataFrame) -> List[SwingPoint]:
        """Find swing high points in the data."""
        swing_highs = []
        
        for i in range(self.swing_strength, len(data) - self.swing_strength):
            current_high = data.iloc[i]['high']
            
            # Check if this is a swing high
            is_swing_high = True
            for j in range(i - self.swing_strength, i + self.swing_strength + 1):
                if j != i and data.iloc[j]['high'] >= current_high:
                    is_swing_high = False
                    break
            
            if is_swing_high:
                swing_point = SwingPoint(
                    index=i,
                    timestamp=data.index[i],
                    price=current_high,
                    type="high",
                    strength=self.swing_strength
                )
                swing_highs.append(swing_point)
        
        return swing_highs
    
    def _find_swing_lows(self, data: pd.DataFrame) -> List[SwingPoint]:
        """Find swing low points in the data."""
        swing_lows = []
        
        for i in range(self.swing_strength, len(data) - self.swing_strength):
            current_low = data.iloc[i]['low']
            
            # Check if this is a swing low
            is_swing_low = True
            for j in range(i - self.swing_strength, i + self.swing_strength + 1):
                if j != i and data.iloc[j]['low'] <= current_low:
                    is_swing_low = False
                    break
            
            if is_swing_low:
                swing_point = SwingPoint(
                    index=i,
                    timestamp=data.index[i],
                    price=current_low,
                    type="low",
                    strength=self.swing_strength
                )
                swing_lows.append(swing_point)
        
        return swing_lows
    
    def _analyze_structure_trend(self, swing_highs: List[SwingPoint], 
                               swing_lows: List[SwingPoint]) -> MarketStructure:
        """Analyze the overall structure trend."""
        if len(swing_highs) < 2 or len(swing_lows) < 2:
            return MarketStructure.NEUTRAL
        
        # Get last 2 swing highs and lows
        recent_highs = sorted(swing_highs, key=lambda x: x.index)[-2:]
        recent_lows = sorted(swing_lows, key=lambda x: x.index)[-2:]
        
        # Check for higher highs and higher lows
        higher_highs = recent_highs[1].price > recent_highs[0].price
        higher_lows = recent_lows[1].price > recent_lows[0].price
        
        # Check for lower highs and lower lows
        lower_highs = recent_highs[1].price < recent_highs[0].price
        lower_lows = recent_lows[1].price < recent_lows[0].price
        
        if higher_highs and higher_lows:
            return MarketStructure.BULLISH
        elif lower_highs and lower_lows:
            return MarketStructure.BEARISH
        else:
            return MarketStructure.CONSOLIDATION
    
    def _detect_break_of_structure(self, data: pd.DataFrame, 
                                 swing_highs: List[SwingPoint], 
                                 swing_lows: List[SwingPoint]) -> List[Dict[str, Any]]:
        """Detect Break of Structure (BOS) points."""
        bos_points = []
        
        # Look for breaks above recent swing highs
        for swing_high in swing_highs[-5:]:  # Last 5 swing highs
            break_bars = data[data.index > swing_high.timestamp]
            breaks = break_bars[break_bars['close'] > swing_high.price]
            
            if not breaks.empty:
                bos_points.append({
                    'timestamp': breaks.index[0],
                    'price': swing_high.price,
                    'type': 'bullish_bos',
                    'strength': swing_high.strength
                })
        
        # Look for breaks below recent swing lows
        for swing_low in swing_lows[-5:]:  # Last 5 swing lows
            break_bars = data[data.index > swing_low.timestamp]
            breaks = break_bars[break_bars['close'] < swing_low.price]
            
            if not breaks.empty:
                bos_points.append({
                    'timestamp': breaks.index[0],
                    'price': swing_low.price,
                    'type': 'bearish_bos',
                    'strength': swing_low.strength
                })
        
        return bos_points
    
    def _detect_change_of_character(self, data: pd.DataFrame, 
                                  swing_highs: List[SwingPoint], 
                                  swing_lows: List[SwingPoint]) -> List[Dict[str, Any]]:
        """Detect Change of Character (CHoCH) points."""
        choch_points = []
        
        # This is a simplified implementation
        # CHoCH is more complex and involves internal structure analysis
        if len(swing_highs) >= 2 and len(swing_lows) >= 2:
            last_high = swing_highs[-1]
            last_low = swing_lows[-1]
            
            # Check for potential CHoCH
            if last_high.index > last_low.index:
                # Last structure was high, look for break below previous low
                if len(swing_lows) >= 2:
                    prev_low = swing_lows[-2]
                    break_bars = data[data.index > last_high.timestamp]
                    breaks = break_bars[break_bars['close'] < prev_low.price]
                    
                    if not breaks.empty:
                        choch_points.append({
                            'timestamp': breaks.index[0],
                            'price': prev_low.price,
                            'type': 'bearish_choch'
                        })
        
        return choch_points
    
    def _determine_current_bias(self, swing_highs: List[SwingPoint], 
                              swing_lows: List[SwingPoint]) -> str:
        """Determine current market bias."""
        structure = self._analyze_structure_trend(swing_highs, swing_lows)
        
        if structure == MarketStructure.BULLISH:
            return "bullish"
        elif structure == MarketStructure.BEARISH:
            return "bearish"
        else:
            return "neutral"
    
    def _calculate_order_block_strength(self, prev_candle: pd.Series, 
                                      current_candle: pd.Series, 
                                      following_candles: pd.DataFrame) -> float:
        """Calculate order block strength (1-10)."""
        strength = 5.0  # Base strength
        
        # Size of the initial move
        move_size = abs(current_candle['close'] - prev_candle['close'])
        if move_size > prev_candle['close'] * 0.02:  # >2% move
            strength += 2
        
        # Follow-through in next few candles
        follow_through = 0
        for i in range(min(3, len(following_candles))):
            if len(following_candles) > i:
                next_candle = following_candles.iloc[i]
                if ((current_candle['close'] > prev_candle['close'] and 
                     next_candle['close'] > next_candle['open']) or
                    (current_candle['close'] < prev_candle['close'] and 
                     next_candle['close'] < next_candle['open'])):
                    follow_through += 1
        
        strength += follow_through * 0.5
        
        return min(10.0, max(1.0, strength))
    
    def _filter_order_blocks(self, order_blocks: List[OrderBlock]) -> List[OrderBlock]:
        """Remove overlapping or weak order blocks."""
        if not order_blocks:
            return order_blocks
        
        # Sort by strength (descending)
        sorted_blocks = sorted(order_blocks, key=lambda x: x.strength, reverse=True)
        filtered_blocks = []
        
        for block in sorted_blocks:
            # Check if it overlaps with any existing filtered block
            overlaps = False
            for existing_block in filtered_blocks:
                if (block.low <= existing_block.high and 
                    block.high >= existing_block.low):
                    overlaps = True
                    break
            
            if not overlaps and block.strength >= 3.0:  # Minimum strength threshold
                filtered_blocks.append(block)
        
        return filtered_blocks
    
    def _find_equal_levels(self, series: pd.Series, level_type: str) -> Dict[float, List[int]]:
        """Find equal price levels within tolerance."""
        equal_levels = {}
        tolerance_pct = self.equal_level_tolerance / 100
        
        for i, price in enumerate(series):
            if pd.isna(price):
                continue
                
            # Check if this price is equal to any existing level
            found_equal = False
            for existing_price in list(equal_levels.keys()):
                if abs(price - existing_price) / existing_price <= tolerance_pct:
                    equal_levels[existing_price].append(i)
                    found_equal = True
                    break
            
            if not found_equal:
                equal_levels[price] = [i]
        
        # Filter to only include levels with multiple occurrences
        return {price: indices for price, indices in equal_levels.items() 
                if len(indices) >= 2}
    
    def _identify_range_extremes(self, data: pd.DataFrame) -> List[LiquidityZone]:
        """Identify range highs and lows."""
        range_zones = []
        
        # Simple implementation: find highest high and lowest low in recent period
        recent_data = data.tail(20)
        
        highest_high = recent_data['high'].max()
        lowest_low = recent_data['low'].min()
        
        # Add as range extremes
        range_zones.append(LiquidityZone(
            price=highest_high,
            timestamp=recent_data[recent_data['high'] == highest_high].index[0],
            type="range_high",
            strength=3.0
        ))
        
        range_zones.append(LiquidityZone(
            price=lowest_low,
            timestamp=recent_data[recent_data['low'] == lowest_low].index[0],
            type="range_low",
            strength=3.0
        ))
        
        return range_zones

# Example usage and testing
if __name__ == "__main__":
    # Example of how to use the ICT analyzer
    analyzer = ICTAnalyzer()
    
    # This would be used with actual market data
    # market_structure = analyzer.analyze_market_structure(data)
    # order_blocks = analyzer.detect_order_blocks(data)
    # fvgs = analyzer.detect_fair_value_gaps(data)
    # liquidity_zones = analyzer.identify_liquidity_zones(data)
    
    print("ICT Analyzer initialized successfully!")
