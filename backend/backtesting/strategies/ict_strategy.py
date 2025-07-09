"""
ICT Trading Strategy Implementation
=================================

Comprehensive ICT-based trading strategy that combines:
- Market structure analysis
- Order block mitigation
- Fair value gap entries
- Liquidity sweep setups
- Multi-timeframe confluence
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
import logging

from .base_strategy import (
    BaseStrategy, TradingSignal, SignalType, PositionType, Trade
)
from ..indicators.ict_concepts import (
    ICTAnalyzer, MarketStructure, OrderBlock, FairValueGap, LiquidityZone
)

logger = logging.getLogger(__name__)

class ICTStrategy(BaseStrategy):
    """
    ICT (Inner Circle Trader) based trading strategy.
    
    This strategy implements core ICT concepts including:
    - Market structure breaks for directional bias
    - Order block mitigation for entries
    - Fair value gap fills for additional entries
    - Liquidity sweeps for high probability setups
    - Multi-timeframe confluence validation
    """
    
    def __init__(self, parameters: Dict[str, Any]):
        """
        Initialize ICT Strategy.
        
        Required parameters:
        - initial_capital: Starting capital
        - risk_per_trade: Risk percentage per trade (0.01-0.05)
        - required_timeframes: List of timeframes ['5T', '15T', '1H']
        
        Optional parameters:
        - min_confluence_score: Minimum confluence score (default: 6.0)
        - max_trades_per_day: Maximum trades per day (default: 3)
        - session_filter: Trading sessions to trade (default: ['LONDON', 'NY'])
        """
        super().__init__(parameters)
        
        # ICT specific parameters
        self.ict_analyzer = ICTAnalyzer()
        self.min_confluence_score = parameters.get('min_confluence_score', 6.0)
        self.max_trades_per_day = parameters.get('max_trades_per_day', 3)
        self.session_filter = parameters.get('session_filter', ['LONDON', 'NY', 'OVERLAP'])
        
        # Strategy state
        self.daily_trade_count = 0
        self.current_date = None
        self.market_bias = "neutral"
        self.active_order_blocks = []
        self.active_fvgs = []
        self.active_liquidity_zones = []
        
        # Entry criteria weights
        self.weights = {
            'market_structure_break': 3.0,
            'order_block_mitigation': 2.5,
            'fair_value_gap': 2.0,
            'liquidity_sweep': 2.5,
            'rsi_divergence': 1.0,
            'timeframe_confluence': 2.0
        }
        
        logger.info(f"Initialized ICT Strategy with confluence threshold: {self.min_confluence_score}")
    
    def generate_signals(self, mtf_data: Dict[str, pd.DataFrame], 
                        current_index: int) -> List[TradingSignal]:
        """
        Generate ICT-based trading signals.
        
        Args:
            mtf_data: Multi-timeframe market data
            current_index: Current bar index in reference timeframe
            
        Returns:
            List of trading signals
        """
        signals = []
        
        # Get reference timeframe (shortest timeframe)
        ref_tf = self.required_timeframes[0]
        current_bar = mtf_data[ref_tf].iloc[current_index]
        current_time = mtf_data[ref_tf].index[current_index]
        
        # Reset daily trade count if new day
        if self._is_new_trading_day(current_time):
            self.daily_trade_count = 0
            self.current_date = current_time.date()
        
        # Check daily trade limit
        if self.daily_trade_count >= self.max_trades_per_day:
            return signals
        
        # Check session filter
        current_session = current_bar.get('session', 'UNKNOWN')
        if current_session not in self.session_filter:
            return signals
        
        # Update market analysis
        self._update_market_analysis(mtf_data, current_index)
        
        # Look for entry setups
        bullish_signals = self._scan_for_bullish_setups(mtf_data, current_index)
        bearish_signals = self._scan_for_bearish_setups(mtf_data, current_index)
        
        signals.extend(bullish_signals)
        signals.extend(bearish_signals)
        
        # Filter signals by confluence score
        filtered_signals = [s for s in signals if s.confluence_score >= self.min_confluence_score]
        
        if filtered_signals:
            logger.debug(f"Generated {len(filtered_signals)} ICT signals at {current_time}")
        
        return filtered_signals
    
    def validate_entry(self, signal: TradingSignal, 
                      market_context: Dict[str, Any]) -> bool:
        """
        Validate ICT entry signal with additional checks.
        
        Args:
            signal: Trading signal to validate
            market_context: Additional market context
            
        Returns:
            True if signal is valid for entry
        """
        # Check if signal aligns with market bias
        if signal.market_structure_bias != "neutral":
            if signal.signal_type == SignalType.LONG and signal.market_structure_bias != "bullish":
                return False
            if signal.signal_type == SignalType.SHORT and signal.market_structure_bias != "bearish":
                return False
        
        # Validate risk:reward ratio
        if signal.stop_loss and signal.take_profit:
            risk = abs(signal.entry_price - signal.stop_loss)
            reward = abs(signal.take_profit - signal.entry_price)
            if risk > 0:
                rr_ratio = reward / risk
                if rr_ratio < 1.5:  # Minimum 1.5:1 RR
                    return False
                signal.risk_reward_ratio = rr_ratio
        
        # Check for conflicting signals in higher timeframes
        if not self._check_higher_timeframe_alignment(signal, market_context):
            return False
        
        return True
    
    def calculate_position_size(self, signal: TradingSignal, 
                              account_balance: float) -> float:
        """
        Calculate position size based on ICT risk management.
        
        ICT emphasizes small, consistent risk per trade.
        """
        if not signal.stop_loss:
            return 0  # No position without stop loss
        
        # Calculate risk amount
        risk_amount = account_balance * self.risk_per_trade
        
        # Calculate position size based on stop loss distance
        risk_per_contract = abs(signal.entry_price - signal.stop_loss)
        
        if risk_per_contract <= 0:
            return 0
        
        position_size = risk_amount / risk_per_contract
        
        # Apply maximum position size limit
        max_contracts = (account_balance * self.max_position_size) / signal.entry_price
        
        return min(position_size, max_contracts)
    
    def should_exit(self, mtf_data: Dict[str, pd.DataFrame], 
                   current_index: int, current_trade: Trade) -> Tuple[bool, str]:
        """
        Determine if current ICT position should be exited.
        
        Args:
            mtf_data: Multi-timeframe market data
            current_index: Current bar index
            current_trade: Current open trade
            
        Returns:
            Tuple of (should_exit, exit_reason)
        """
        ref_tf = self.required_timeframes[0]
        current_bar = mtf_data[ref_tf].iloc[current_index]
        current_price = current_bar['close']
        
        # Check stop loss
        if current_trade.entry_signal.stop_loss:
            if current_trade.entry_signal.signal_type == SignalType.LONG:
                if current_price <= current_trade.entry_signal.stop_loss:
                    return True, "Stop Loss Hit"
            else:  # SHORT
                if current_price >= current_trade.entry_signal.stop_loss:
                    return True, "Stop Loss Hit"
        
        # Check take profit
        if current_trade.entry_signal.take_profit:
            if current_trade.entry_signal.signal_type == SignalType.LONG:
                if current_price >= current_trade.entry_signal.take_profit:
                    return True, "Take Profit Hit"
            else:  # SHORT
                if current_price <= current_trade.entry_signal.take_profit:
                    return True, "Take Profit Hit"
        
        # ICT-specific exit conditions
        
        # 1. Market structure change against position
        if self._check_structure_invalidation(mtf_data, current_index, current_trade):
            return True, "Market Structure Change"
        
        # 2. Time-based exit (end of session)
        current_session = current_bar.get('session', 'UNKNOWN')
        if current_session not in self.session_filter:
            return True, "Session End"
        
        # 3. Maximum hold time (4 hours for day trading)
        if current_trade.entry_time:
            hold_time = mtf_data[ref_tf].index[current_index] - current_trade.entry_time
            if hold_time > timedelta(hours=4):
                return True, "Maximum Hold Time"
        
        return False, ""
    
    def _update_market_analysis(self, mtf_data: Dict[str, pd.DataFrame], 
                              current_index: int):
        """Update market analysis for current bar."""
        # Analyze market structure on higher timeframe
        higher_tf = self.required_timeframes[-1] if len(self.required_timeframes) > 1 else self.required_timeframes[0]
        
        # Get sufficient data for analysis
        lookback_bars = min(100, current_index)
        analysis_data = mtf_data[higher_tf].iloc[current_index-lookback_bars:current_index+1]
        
        # Update market structure
        market_structure = self.ict_analyzer.analyze_market_structure(analysis_data)
        self.market_bias = market_structure['current_bias']
        
        # Update order blocks
        self.active_order_blocks = self.ict_analyzer.detect_order_blocks(analysis_data)
        
        # Update fair value gaps
        self.active_fvgs = self.ict_analyzer.detect_fair_value_gaps(analysis_data)
        
        # Update liquidity zones
        self.active_liquidity_zones = self.ict_analyzer.identify_liquidity_zones(analysis_data)
    
    def _scan_for_bullish_setups(self, mtf_data: Dict[str, pd.DataFrame], 
                               current_index: int) -> List[TradingSignal]:
        """Scan for bullish ICT setups."""
        signals = []
        
        if self.market_bias == "bearish":
            return signals  # Don't trade against strong bias
        
        ref_tf = self.required_timeframes[0]
        current_bar = mtf_data[ref_tf].iloc[current_index]
        current_time = mtf_data[ref_tf].index[current_index]
        current_price = current_bar['close']
        
        # Setup 1: Bullish Order Block Mitigation
        for ob in self.active_order_blocks:
            if (ob.type.value == "BULLISH" and 
                ob.low <= current_price <= ob.high and
                current_bar['close'] > current_bar['open']):  # Bullish candle at OB
                
                confluence_factors = {
                    'market_structure_break': self.market_bias == "bullish",
                    'order_block_mitigation': True,
                    'fair_value_gap': self._check_fvg_confluence(current_price, "bullish"),
                    'liquidity_sweep': self._check_recent_liquidity_sweep("bullish"),
                    'rsi_divergence': self._check_rsi_divergence(mtf_data, current_index, "bullish"),
                    'timeframe_confluence': self._check_timeframe_confluence(mtf_data, current_index, "bullish")
                }
                
                confluence_score = self.calculate_confluence_score({'timeframe_signals': confluence_factors})
                
                if confluence_score >= self.min_confluence_score:
                    # Calculate stop loss and take profit
                    stop_loss = ob.low - (current_bar.get('atr_14', 10) * 0.5)
                    take_profit = current_price + (abs(current_price - stop_loss) * 2.0)  # 2:1 RR
                    
                    signal = TradingSignal(
                        timestamp=current_time,
                        signal_type=SignalType.LONG,
                        entry_price=current_price,
                        stop_loss=stop_loss,
                        take_profit=take_profit,
                        confidence=0.8,
                        confluence_score=confluence_score,
                        setup_type="ICT_Bullish_OB_Mitigation",
                        market_structure_bias=self.market_bias,
                        session=current_bar.get('session', ''),
                        notes=f"Order block mitigation at {ob.low:.2f}-{ob.high:.2f}"
                    )
                    signals.append(signal)
        
        # Setup 2: Bullish Fair Value Gap Fill
        for fvg in self.active_fvgs:
            if (fvg.type == "bullish" and not fvg.filled and
                fvg.low <= current_price <= fvg.high):
                
                confluence_factors = {
                    'market_structure_break': self.market_bias == "bullish",
                    'fair_value_gap': True,
                    'order_block_mitigation': self._check_nearby_order_blocks(current_price, "bullish"),
                    'liquidity_sweep': self._check_recent_liquidity_sweep("bullish"),
                    'rsi_divergence': self._check_rsi_divergence(mtf_data, current_index, "bullish"),
                    'timeframe_confluence': self._check_timeframe_confluence(mtf_data, current_index, "bullish")
                }
                
                confluence_score = self.calculate_confluence_score({'timeframe_signals': confluence_factors})
                
                if confluence_score >= self.min_confluence_score:
                    stop_loss = fvg.low - (current_bar.get('atr_14', 10) * 0.5)
                    take_profit = current_price + (abs(current_price - stop_loss) * 1.5)  # 1.5:1 RR
                    
                    signal = TradingSignal(
                        timestamp=current_time,
                        signal_type=SignalType.LONG,
                        entry_price=current_price,
                        stop_loss=stop_loss,
                        take_profit=take_profit,
                        confidence=0.7,
                        confluence_score=confluence_score,
                        setup_type="ICT_Bullish_FVG_Fill",
                        market_structure_bias=self.market_bias,
                        session=current_bar.get('session', ''),
                        notes=f"FVG fill at {fvg.low:.2f}-{fvg.high:.2f}"
                    )
                    signals.append(signal)
        
        return signals
    
    def _scan_for_bearish_setups(self, mtf_data: Dict[str, pd.DataFrame], 
                               current_index: int) -> List[TradingSignal]:
        """Scan for bearish ICT setups."""
        signals = []
        
        if self.market_bias == "bullish":
            return signals  # Don't trade against strong bias
        
        ref_tf = self.required_timeframes[0]
        current_bar = mtf_data[ref_tf].iloc[current_index]
        current_time = mtf_data[ref_tf].index[current_index]
        current_price = current_bar['close']
        
        # Setup 1: Bearish Order Block Mitigation
        for ob in self.active_order_blocks:
            if (ob.type.value == "BEARISH" and 
                ob.low <= current_price <= ob.high and
                current_bar['close'] < current_bar['open']):  # Bearish candle at OB
                
                confluence_factors = {
                    'market_structure_break': self.market_bias == "bearish",
                    'order_block_mitigation': True,
                    'fair_value_gap': self._check_fvg_confluence(current_price, "bearish"),
                    'liquidity_sweep': self._check_recent_liquidity_sweep("bearish"),
                    'rsi_divergence': self._check_rsi_divergence(mtf_data, current_index, "bearish"),
                    'timeframe_confluence': self._check_timeframe_confluence(mtf_data, current_index, "bearish")
                }
                
                confluence_score = self.calculate_confluence_score({'timeframe_signals': confluence_factors})
                
                if confluence_score >= self.min_confluence_score:
                    stop_loss = ob.high + (current_bar.get('atr_14', 10) * 0.5)
                    take_profit = current_price - (abs(stop_loss - current_price) * 2.0)  # 2:1 RR
                    
                    signal = TradingSignal(
                        timestamp=current_time,
                        signal_type=SignalType.SHORT,
                        entry_price=current_price,
                        stop_loss=stop_loss,
                        take_profit=take_profit,
                        confidence=0.8,
                        confluence_score=confluence_score,
                        setup_type="ICT_Bearish_OB_Mitigation",
                        market_structure_bias=self.market_bias,
                        session=current_bar.get('session', ''),
                        notes=f"Order block mitigation at {ob.low:.2f}-{ob.high:.2f}"
                    )
                    signals.append(signal)
        
        # Setup 2: Bearish Fair Value Gap Fill
        for fvg in self.active_fvgs:
            if (fvg.type == "bearish" and not fvg.filled and
                fvg.low <= current_price <= fvg.high):
                
                confluence_factors = {
                    'market_structure_break': self.market_bias == "bearish",
                    'fair_value_gap': True,
                    'order_block_mitigation': self._check_nearby_order_blocks(current_price, "bearish"),
                    'liquidity_sweep': self._check_recent_liquidity_sweep("bearish"),
                    'rsi_divergence': self._check_rsi_divergence(mtf_data, current_index, "bearish"),
                    'timeframe_confluence': self._check_timeframe_confluence(mtf_data, current_index, "bearish")
                }
                
                confluence_score = self.calculate_confluence_score({'timeframe_signals': confluence_factors})
                
                if confluence_score >= self.min_confluence_score:
                    stop_loss = fvg.high + (current_bar.get('atr_14', 10) * 0.5)
                    take_profit = current_price - (abs(stop_loss - current_price) * 1.5)  # 1.5:1 RR
                    
                    signal = TradingSignal(
                        timestamp=current_time,
                        signal_type=SignalType.SHORT,
                        entry_price=current_price,
                        stop_loss=stop_loss,
                        take_profit=take_profit,
                        confidence=0.7,
                        confluence_score=confluence_score,
                        setup_type="ICT_Bearish_FVG_Fill",
                        market_structure_bias=self.market_bias,
                        session=current_bar.get('session', ''),
                        notes=f"FVG fill at {fvg.low:.2f}-{fvg.high:.2f}"
                    )
                    signals.append(signal)
        
        return signals
    
    def _check_fvg_confluence(self, current_price: float, direction: str) -> bool:
        """Check if current price is near a relevant FVG."""
        for fvg in self.active_fvgs:
            if fvg.type == direction and not fvg.filled:
                if fvg.low <= current_price <= fvg.high:
                    return True
        return False
    
    def _check_nearby_order_blocks(self, current_price: float, direction: str) -> bool:
        """Check if current price is near a relevant order block."""
        for ob in self.active_order_blocks:
            if ob.type.value.lower() == direction:
                distance = min(abs(current_price - ob.low), abs(current_price - ob.high))
                if distance < current_price * 0.001:  # Within 0.1%
                    return True
        return False
    
    def _check_recent_liquidity_sweep(self, direction: str) -> bool:
        """Check if there was a recent liquidity sweep in the expected direction."""
        # Simplified implementation
        for zone in self.active_liquidity_zones:
            if zone.swept and zone.sweep_time:
                # Check if sweep was in the last few bars and in correct direction
                if direction == "bullish" and zone.type in ["equal_lows", "range_low"]:
                    return True
                elif direction == "bearish" and zone.type in ["equal_highs", "range_high"]:
                    return True
        return False
    
    def _check_rsi_divergence(self, mtf_data: Dict[str, pd.DataFrame], 
                            current_index: int, direction: str) -> bool:
        """Check for RSI divergence in the expected direction."""
        ref_tf = self.required_timeframes[0]
        
        if 'RSI' not in mtf_data[ref_tf].columns:
            return False
        
        # Get last 20 bars for divergence analysis
        if current_index < 20:
            return False
        
        recent_data = mtf_data[ref_tf].iloc[current_index-20:current_index+1]
        
        # Simple divergence check
        price_trend = recent_data['close'].iloc[-1] - recent_data['close'].iloc[0]
        rsi_trend = recent_data['RSI'].iloc[-1] - recent_data['RSI'].iloc[0]
        
        if direction == "bullish":
            return price_trend < 0 and rsi_trend > 0  # Price down, RSI up
        else:
            return price_trend > 0 and rsi_trend < 0  # Price up, RSI down
    
    def _check_timeframe_confluence(self, mtf_data: Dict[str, pd.DataFrame], 
                                  current_index: int, direction: str) -> bool:
        """Check for multi-timeframe confluence."""
        if len(self.required_timeframes) < 2:
            return True  # Single timeframe
        
        # Check if higher timeframe supports the direction
        higher_tf = self.required_timeframes[-1]
        
        if current_index < 5:
            return False
        
        higher_tf_data = mtf_data[higher_tf].iloc[current_index-5:current_index+1]
        
        # Simple trend check on higher timeframe
        higher_tf_trend = higher_tf_data['close'].iloc[-1] - higher_tf_data['close'].iloc[0]
        
        if direction == "bullish":
            return higher_tf_trend > 0
        else:
            return higher_tf_trend < 0
    
    def _check_higher_timeframe_alignment(self, signal: TradingSignal, 
                                        market_context: Dict[str, Any]) -> bool:
        """Check if signal aligns with higher timeframe structure."""
        # This would check higher timeframe trend and structure
        # Simplified implementation
        return True
    
    def _check_structure_invalidation(self, mtf_data: Dict[str, pd.DataFrame], 
                                    current_index: int, current_trade: Trade) -> bool:
        """Check if market structure has invalidated the trade thesis."""
        # Simplified implementation
        # In real ICT trading, this would check for:
        # - Break of structure against the trade
        # - Change of character
        # - Violation of key levels
        return False
    
    def _is_new_trading_day(self, current_time: datetime) -> bool:
        """Check if this is a new trading day."""
        if self.current_date is None:
            return True
        return current_time.date() != self.current_date
    
    def calculate_confluence_score(self, signals: Dict[str, Any]) -> float:
        """
        Calculate ICT-specific confluence score.
        
        Overrides base method with ICT-specific weights.
        """
        score = 0.0
        timeframe_signals = signals.get('timeframe_signals', {})
        
        for factor, present in timeframe_signals.items():
            if present and factor in self.weights:
                score += self.weights[factor]
        
        return min(score, 10.0)

# Example usage
if __name__ == "__main__":
    # Example parameters for ICT strategy
    parameters = {
        'initial_capital': 10000,
        'risk_per_trade': 0.02,  # 2% risk per trade
        'required_timeframes': ['5T', '15T', '1H'],
        'min_confluence_score': 6.0,
        'max_trades_per_day': 3,
        'session_filter': ['LONDON', 'NY', 'OVERLAP']
    }
    
    strategy = ICTStrategy(parameters)
    print(f"ICT Strategy initialized: {strategy.name}")
    print(f"Risk per trade: {strategy.risk_per_trade*100}%")
    print(f"Required confluence score: {strategy.min_confluence_score}")
