"""
MMXM Trading Strategy Implementation
===================================

Market Maker Move (MMXM) based trading strategy that implements:
- Wyckoff accumulation/distribution patterns
- Spring and upthrust entries
- Volume-price analysis
- Composite man behavior tracking
- Multi-timeframe MMXM confluence
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from datetime import datetime, timedelta
import logging

from .base_strategy import (
    BaseStrategy, TradingSignal, SignalType, PositionType, Trade
)
from ..indicators.mmxm_patterns import (
    MMXMAnalyzer, MarketPhase, MMXMSignal, AccumulationZone, DistributionZone
)

logger = logging.getLogger(__name__)

class MMXMStrategy(BaseStrategy):
    """
    MMXM (Market Maker Move) based trading strategy.
    
    This strategy implements Wyckoff principles and composite man behavior:
    - Accumulation phase entries (springs, tests)
    - Distribution phase entries (upthrusts, tests)
    - Volume-price relationship analysis
    - Multi-timeframe phase confirmation
    - Institutional flow following
    """
    
    def __init__(self, parameters: Dict[str, Any]):
        """
        Initialize MMXM Strategy.
        
        Required parameters:
        - initial_capital: Starting capital
        - risk_per_trade: Risk percentage per trade (0.01-0.05)
        - required_timeframes: List of timeframes ['5T', '15T', '1H']
        
        Optional parameters:
        - min_volume_confirmation: Require volume confirmation (default: True)
        - max_trades_per_phase: Maximum trades per market phase (default: 2)
        - phase_filter: Market phases to trade (default: ['ACCUMULATION', 'DISTRIBUTION'])
        - min_range_duration: Minimum bars for range identification (default: 20)
        """
        super().__init__(parameters)
        
        # MMXM specific parameters
        self.mmxm_analyzer = MMXMAnalyzer(
            volume_ma_period=parameters.get('volume_ma_period', 20),
            range_threshold=parameters.get('range_threshold', 0.02)
        )
        
        self.min_volume_confirmation = parameters.get('min_volume_confirmation', True)
        self.max_trades_per_phase = parameters.get('max_trades_per_phase', 2)
        self.phase_filter = parameters.get('phase_filter', ['ACCUMULATION', 'DISTRIBUTION'])
        self.min_range_duration = parameters.get('min_range_duration', 20)
        
        # Strategy state
        self.current_market_phase = MarketPhase.ACCUMULATION
        self.phase_trade_count = 0
        self.active_accumulation_zones = []
        self.active_distribution_zones = []
        self.last_phase_change = None
        
        # Signal weights for MMXM concepts
        self.mmxm_weights = {
            'spring_pattern': 4.0,
            'upthrust_pattern': 4.0,
            'volume_confirmation': 2.0,
            'phase_alignment': 2.0,
            'range_test_count': 1.0,
            'composite_man_behavior': 1.0
        }
        
        logger.info(f"Initialized MMXM Strategy with phase filter: {self.phase_filter}")
    
    def generate_signals(self, mtf_data: Dict[str, pd.DataFrame], 
                        current_index: int) -> List[TradingSignal]:
        """
        Generate MMXM-based trading signals.
        
        Args:
            mtf_data: Multi-timeframe market data
            current_index: Current bar index in reference timeframe
            
        Returns:
            List of trading signals
        """
        signals = []
        
        # Get reference timeframe data
        ref_tf = self.required_timeframes[0]
        current_bar = mtf_data[ref_tf].iloc[current_index]
        current_time = mtf_data[ref_tf].index[current_index]
        
        # Check if we have enough data for analysis
        if current_index < 50:  # Need at least 50 bars for MMXM analysis
            return signals
        
        # Update MMXM analysis
        self._update_mmxm_analysis(mtf_data, current_index)
        
        # Check phase trade limits
        if self.phase_trade_count >= self.max_trades_per_phase:
            return signals
        
        # Generate signals based on current market phase
        if self.current_market_phase == MarketPhase.ACCUMULATION:
            signals.extend(self._scan_for_accumulation_signals(mtf_data, current_index))
        
        elif self.current_market_phase == MarketPhase.DISTRIBUTION:
            signals.extend(self._scan_for_distribution_signals(mtf_data, current_index))
        
        elif self.current_market_phase == MarketPhase.REACCUMULATION:
            signals.extend(self._scan_for_reaccumulation_signals(mtf_data, current_index))
        
        elif self.current_market_phase == MarketPhase.REDISTRIBUTION:
            signals.extend(self._scan_for_redistribution_signals(mtf_data, current_index))
        
        # Filter signals by phase filter
        filtered_signals = [s for s in signals if s.setup_type.split('_')[1] in self.phase_filter]
        
        if filtered_signals:
            logger.debug(f"Generated {len(filtered_signals)} MMXM signals in {self.current_market_phase.value} phase")
        
        return filtered_signals
    
    def validate_entry(self, signal: TradingSignal, 
                      market_context: Dict[str, Any]) -> bool:
        """
        Validate MMXM entry signal with additional checks.
        
        Args:
            signal: Trading signal to validate
            market_context: Additional market context
            
        Returns:
            True if signal is valid for entry
        """
        # Volume confirmation requirement
        if (self.min_volume_confirmation and 
            not signal.notes.lower().find('volume') > -1):
            return False
        
        # Phase alignment check
        if signal.market_structure_bias not in self.phase_filter:
            return False
        
        # Risk:reward validation
        if signal.stop_loss and signal.take_profit:
            risk = abs(signal.entry_price - signal.stop_loss)
            reward = abs(signal.take_profit - signal.entry_price)
            if risk > 0:
                rr_ratio = reward / risk
                if rr_ratio < 2.0:  # MMXM requires minimum 2:1 RR
                    return False
                signal.risk_reward_ratio = rr_ratio
        
        # Multi-timeframe validation
        return self._validate_multiframe_alignment(signal, market_context)
    
    def calculate_position_size(self, signal: TradingSignal, 
                              account_balance: float) -> float:
        """
        Calculate position size based on MMXM risk management.
        
        MMXM emphasizes patient entries with larger position sizes
        when confluence is high.
        """
        if not signal.stop_loss:
            return 0
        
        # Base position size calculation
        base_risk_amount = account_balance * self.risk_per_trade
        
        # Adjust based on confluence score and signal strength
        confluence_multiplier = min(signal.confluence_score / 5.0, 2.0)  # Max 2x size
        adjusted_risk_amount = base_risk_amount * confluence_multiplier
        
        # Calculate position size
        risk_per_contract = abs(signal.entry_price - signal.stop_loss)
        if risk_per_contract <= 0:
            return 0
        
        position_size = adjusted_risk_amount / risk_per_contract
        
        # Apply maximum position size limit
        max_contracts = (account_balance * self.max_position_size) / signal.entry_price
        
        return min(position_size, max_contracts)
    
    def should_exit(self, mtf_data: Dict[str, pd.DataFrame], 
                   current_index: int, current_trade: Trade) -> Tuple[bool, str]:
        """
        Determine if current MMXM position should be exited.
        
        MMXM exits are based on:
        - Phase change signals
        - Volume exhaustion
        - Range breakouts/failures
        """
        ref_tf = self.required_timeframes[0]
        current_bar = mtf_data[ref_tf].iloc[current_index]
        current_price = current_bar['close']
        
        # Standard stop loss and take profit checks
        if current_trade.entry_signal.stop_loss:
            if current_trade.entry_signal.signal_type == SignalType.LONG:
                if current_price <= current_trade.entry_signal.stop_loss:
                    return True, "Stop Loss Hit"
            else:  # SHORT
                if current_price >= current_trade.entry_signal.stop_loss:
                    return True, "Stop Loss Hit"
        
        if current_trade.entry_signal.take_profit:
            if current_trade.entry_signal.signal_type == SignalType.LONG:
                if current_price >= current_trade.entry_signal.take_profit:
                    return True, "Take Profit Hit"
            else:  # SHORT
                if current_price <= current_trade.entry_signal.take_profit:
                    return True, "Take Profit Hit"
        
        # MMXM-specific exits
        
        # 1. Market phase change
        if self._detect_phase_change(mtf_data, current_index, current_trade):
            return True, "Market Phase Change"
        
        # 2. Volume exhaustion
        if self._detect_volume_exhaustion(mtf_data, current_index, current_trade):
            return True, "Volume Exhaustion"
        
        # 3. Range breakout/failure
        if self._detect_range_violation(mtf_data, current_index, current_trade):
            return True, "Range Violation"
        
        # 4. Composite man behavior change
        if self._detect_composite_man_change(mtf_data, current_index, current_trade):
            return True, "Composite Man Behavior Change"
        
        return False, ""
    
    def _update_mmxm_analysis(self, mtf_data: Dict[str, pd.DataFrame], 
                            current_index: int):
        """Update MMXM analysis for current market conditions."""
        
        # Analyze on higher timeframe for phase determination
        higher_tf = self.required_timeframes[-1] if len(self.required_timeframes) > 1 else self.required_timeframes[0]
        
        # Get sufficient data for analysis
        lookback_bars = min(100, current_index)
        analysis_data = mtf_data[higher_tf].iloc[current_index-lookback_bars:current_index+1]
        
        # Update market phase analysis
        phase_analysis = self.mmxm_analyzer.analyze_market_phases(analysis_data)
        
        # Update current phase
        previous_phase = self.current_market_phase
        self.current_market_phase = phase_analysis['current_phase']
        
        # Reset phase trade count if phase changed
        if previous_phase != self.current_market_phase:
            self.phase_trade_count = 0
            self.last_phase_change = mtf_data[self.required_timeframes[0]].index[current_index]
            logger.info(f"Market phase changed from {previous_phase.value} to {self.current_market_phase.value}")
        
        # Update accumulation/distribution zones
        self.active_accumulation_zones = self.mmxm_analyzer.detect_accumulation_patterns(analysis_data)
        self.active_distribution_zones = self.mmxm_analyzer.detect_distribution_patterns(analysis_data)
    
    def _scan_for_accumulation_signals(self, mtf_data: Dict[str, pd.DataFrame], 
                                     current_index: int) -> List[TradingSignal]:
        """Scan for accumulation phase trading signals."""
        signals = []
        
        ref_tf = self.required_timeframes[0]
        current_bar = mtf_data[ref_tf].iloc[current_index]
        current_time = mtf_data[ref_tf].index[current_index]
        current_price = current_bar['close']
        
        # Look for spring patterns in accumulation zones
        for zone in self.active_accumulation_zones:
            if zone.spring_detected:
                # Check if we're near the spring level
                spring_level = zone.support_level
                distance_to_spring = abs(current_price - spring_level) / current_price
                
                if distance_to_spring < 0.005:  # Within 0.5% of spring level
                    # Generate bullish signal
                    confluence_factors = {
                        'spring_pattern': True,
                        'volume_confirmation': zone.volume_average > 0,  # Simplified check
                        'phase_alignment': self.current_market_phase == MarketPhase.ACCUMULATION,
                        'range_test_count': zone.test_count >= 2,
                        'composite_man_behavior': self._check_composite_man_accumulation(mtf_data, current_index)
                    }
                    
                    confluence_score = self._calculate_mmxm_confluence_score(confluence_factors)
                    
                    if confluence_score >= self.min_confluence_score:
                        stop_loss = spring_level - (current_bar.get('atr_14', 10) * 0.5)
                        take_profit = zone.resistance_level  # Target resistance
                        
                        signal = TradingSignal(
                            timestamp=current_time,
                            signal_type=SignalType.LONG,
                            entry_price=current_price,
                            stop_loss=stop_loss,
                            take_profit=take_profit,
                            confidence=0.85,
                            confluence_score=confluence_score,
                            setup_type="MMXM_ACCUMULATION_Spring",
                            market_structure_bias="bullish",
                            session=current_bar.get('session', ''),
                            notes=f"Spring pattern in accumulation zone at {spring_level:.2f}"
                        )
                        signals.append(signal)
        
        # Look for support tests in accumulation zones
        for zone in self.active_accumulation_zones:
            support_level = zone.support_level
            distance_to_support = abs(current_price - support_level) / current_price
            
            if distance_to_support < 0.002 and zone.test_count >= 2:  # Near support with multiple tests
                confluence_factors = {
                    'spring_pattern': False,
                    'volume_confirmation': self._check_volume_support(mtf_data, current_index),
                    'phase_alignment': True,
                    'range_test_count': zone.test_count >= 3,
                    'composite_man_behavior': self._check_composite_man_accumulation(mtf_data, current_index)
                }
                
                confluence_score = self._calculate_mmxm_confluence_score(confluence_factors)
                
                if confluence_score >= self.min_confluence_score - 1.0:  # Lower threshold for support tests
                    stop_loss = support_level - (current_bar.get('atr_14', 10) * 0.3)
                    take_profit = zone.resistance_level
                    
                    signal = TradingSignal(
                        timestamp=current_time,
                        signal_type=SignalType.LONG,
                        entry_price=current_price,
                        stop_loss=stop_loss,
                        take_profit=take_profit,
                        confidence=0.75,
                        confluence_score=confluence_score,
                        setup_type="MMXM_ACCUMULATION_Test",
                        market_structure_bias="bullish",
                        session=current_bar.get('session', ''),
                        notes=f"Support test #{zone.test_count} in accumulation zone"
                    )
                    signals.append(signal)
        
        return signals
    
    def _scan_for_distribution_signals(self, mtf_data: Dict[str, pd.DataFrame], 
                                     current_index: int) -> List[TradingSignal]:
        """Scan for distribution phase trading signals."""
        signals = []
        
        ref_tf = self.required_timeframes[0]
        current_bar = mtf_data[ref_tf].iloc[current_index]
        current_time = mtf_data[ref_tf].index[current_index]
        current_price = current_bar['close']
        
        # Look for upthrust patterns in distribution zones
        for zone in self.active_distribution_zones:
            if zone.upthrust_detected:
                # Check if we're near the upthrust level
                upthrust_level = zone.resistance_level
                distance_to_upthrust = abs(current_price - upthrust_level) / current_price
                
                if distance_to_upthrust < 0.005:  # Within 0.5% of upthrust level
                    # Generate bearish signal
                    confluence_factors = {
                        'upthrust_pattern': True,
                        'volume_confirmation': zone.volume_average > 0,  # Simplified check
                        'phase_alignment': self.current_market_phase == MarketPhase.DISTRIBUTION,
                        'range_test_count': zone.test_count >= 2,
                        'composite_man_behavior': self._check_composite_man_distribution(mtf_data, current_index)
                    }
                    
                    confluence_score = self._calculate_mmxm_confluence_score(confluence_factors)
                    
                    if confluence_score >= self.min_confluence_score:
                        stop_loss = upthrust_level + (current_bar.get('atr_14', 10) * 0.5)
                        take_profit = zone.support_level  # Target support
                        
                        signal = TradingSignal(
                            timestamp=current_time,
                            signal_type=SignalType.SHORT,
                            entry_price=current_price,
                            stop_loss=stop_loss,
                            take_profit=take_profit,
                            confidence=0.85,
                            confluence_score=confluence_score,
                            setup_type="MMXM_DISTRIBUTION_Upthrust",
                            market_structure_bias="bearish",
                            session=current_bar.get('session', ''),
                            notes=f"Upthrust pattern in distribution zone at {upthrust_level:.2f}"
                        )
                        signals.append(signal)
        
        return signals
    
    def _scan_for_reaccumulation_signals(self, mtf_data: Dict[str, pd.DataFrame], 
                                       current_index: int) -> List[TradingSignal]:
        """Scan for reaccumulation (continuation) signals."""
        # Placeholder - would implement reaccumulation pattern recognition
        return []
    
    def _scan_for_redistribution_signals(self, mtf_data: Dict[str, pd.DataFrame], 
                                       current_index: int) -> List[TradingSignal]:
        """Scan for redistribution (continuation) signals."""
        # Placeholder - would implement redistribution pattern recognition
        return []
    
    def _calculate_mmxm_confluence_score(self, confluence_factors: Dict[str, bool]) -> float:
        """Calculate MMXM-specific confluence score."""
        score = 0.0
        
        for factor, present in confluence_factors.items():
            if present and factor in self.mmxm_weights:
                score += self.mmxm_weights[factor]
        
        return min(score, 10.0)
    
    def _validate_multiframe_alignment(self, signal: TradingSignal, 
                                     market_context: Dict[str, Any]) -> bool:
        """Validate signal against higher timeframe structure."""
        # Simplified implementation
        # In real trading, this would check higher timeframe phase alignment
        return True
    
    def _detect_phase_change(self, mtf_data: Dict[str, pd.DataFrame], 
                           current_index: int, current_trade: Trade) -> bool:
        """Detect if market phase has changed against the trade."""
        # Check if phase changed recently
        if self.last_phase_change:
            time_since_change = mtf_data[self.required_timeframes[0]].index[current_index] - self.last_phase_change
            if time_since_change < timedelta(hours=1):  # Recent phase change
                # Check if new phase is against the trade
                if (current_trade.entry_signal.signal_type == SignalType.LONG and 
                    self.current_market_phase in [MarketPhase.DISTRIBUTION, MarketPhase.MARKDOWN]):
                    return True
                elif (current_trade.entry_signal.signal_type == SignalType.SHORT and 
                      self.current_market_phase in [MarketPhase.ACCUMULATION, MarketPhase.MARKUP]):
                    return True
        
        return False
    
    def _detect_volume_exhaustion(self, mtf_data: Dict[str, pd.DataFrame], 
                                current_index: int, current_trade: Trade) -> bool:
        """Detect volume exhaustion patterns."""
        ref_tf = self.required_timeframes[0]
        
        if 'volume' not in mtf_data[ref_tf].columns:
            return False
        
        # Simple volume exhaustion check
        recent_data = mtf_data[ref_tf].iloc[current_index-5:current_index+1]
        avg_volume = recent_data['volume'].mean()
        current_volume = recent_data['volume'].iloc[-1]
        
        # Volume dropping below 50% of recent average
        return current_volume < avg_volume * 0.5
    
    def _detect_range_violation(self, mtf_data: Dict[str, pd.DataFrame], 
                              current_index: int, current_trade: Trade) -> bool:
        """Detect range breakout/breakdown that invalidates the setup."""
        # Simplified implementation
        # Would check if price has broken out of expected accumulation/distribution range
        return False
    
    def _detect_composite_man_change(self, mtf_data: Dict[str, pd.DataFrame], 
                                   current_index: int, current_trade: Trade) -> bool:
        """Detect change in composite man behavior."""
        # Placeholder for composite man behavior analysis
        return False
    
    def _check_composite_man_accumulation(self, mtf_data: Dict[str, pd.DataFrame], 
                                        current_index: int) -> bool:
        """Check for signs of composite man accumulation."""
        # Simplified check for accumulation behavior
        ref_tf = self.required_timeframes[0]
        
        if current_index < 10:
            return False
        
        recent_data = mtf_data[ref_tf].iloc[current_index-10:current_index+1]
        
        # Look for absorption on declines (high volume, small range down moves)
        down_moves = recent_data[recent_data['close'] < recent_data['open']]
        if len(down_moves) > 0 and 'volume' in recent_data.columns:
            avg_volume = recent_data['volume'].mean()
            high_volume_down = down_moves[down_moves['volume'] > avg_volume * 1.2]
            return len(high_volume_down) > 0
        
        return False
    
    def _check_composite_man_distribution(self, mtf_data: Dict[str, pd.DataFrame], 
                                        current_index: int) -> bool:
        """Check for signs of composite man distribution."""
        # Simplified check for distribution behavior
        ref_tf = self.required_timeframes[0]
        
        if current_index < 10:
            return False
        
        recent_data = mtf_data[ref_tf].iloc[current_index-10:current_index+1]
        
        # Look for high volume on up moves with small price progress
        up_moves = recent_data[recent_data['close'] > recent_data['open']]
        if len(up_moves) > 0 and 'volume' in recent_data.columns:
            avg_volume = recent_data['volume'].mean()
            high_volume_up = up_moves[up_moves['volume'] > avg_volume * 1.2]
            
            # Check if high volume up moves had small price progress
            if len(high_volume_up) > 0:
                price_progress = (high_volume_up['close'] - high_volume_up['open']).mean()
                atr = recent_data.get('atr_14', pd.Series([10])).iloc[-1]
                return price_progress < atr * 0.3  # Small progress relative to ATR
        
        return False
    
    def _check_volume_support(self, mtf_data: Dict[str, pd.DataFrame], 
                            current_index: int) -> bool:
        """Check for volume support at current level."""
        ref_tf = self.required_timeframes[0]
        
        if 'volume' not in mtf_data[ref_tf].columns or current_index < 5:
            return False
        
        recent_data = mtf_data[ref_tf].iloc[current_index-5:current_index+1]
        current_volume = recent_data['volume'].iloc[-1]
        avg_volume = recent_data['volume'].mean()
        
        # Current volume above average suggests support
        return current_volume > avg_volume * 1.1

# Example usage
if __name__ == "__main__":
    # Example parameters for MMXM strategy
    parameters = {
        'initial_capital': 25000,
        'risk_per_trade': 0.025,  # 2.5% risk per trade
        'required_timeframes': ['5T', '15T', '1H'],
        'min_confluence_score': 5.0,
        'max_trades_per_phase': 2,
        'phase_filter': ['ACCUMULATION', 'DISTRIBUTION'],
        'min_volume_confirmation': True,
        'min_range_duration': 20
    }
    
    strategy = MMXMStrategy(parameters)
    print(f"MMXM Strategy initialized: {strategy.name}")
    print(f"Phase filter: {strategy.phase_filter}")
    print(f"Volume confirmation required: {strategy.min_volume_confirmation}")
