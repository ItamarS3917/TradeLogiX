"""
Base Strategy Framework
======================

Abstract base class for all trading strategies in the backtesting system.
Provides the foundation for ICT and MMXM strategy implementations.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum
import pandas as pd
import numpy as np
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class SignalType(Enum):
    """Trading signal types."""
    LONG = "LONG"
    SHORT = "SHORT"
    CLOSE_LONG = "CLOSE_LONG"
    CLOSE_SHORT = "CLOSE_SHORT"
    HOLD = "HOLD"

class PositionType(Enum):
    """Position types."""
    NONE = "NONE"
    LONG = "LONG"
    SHORT = "SHORT"

@dataclass
class TradingSignal:
    """
    Represents a trading signal with all necessary information.
    """
    timestamp: datetime
    signal_type: SignalType
    entry_price: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    position_size: Optional[float] = None
    confidence: float = 0.0  # 0-1 scale
    confluence_score: float = 0.0  # 0-10 scale
    setup_type: str = ""
    notes: str = ""
    
    # ICT/MMXM specific fields
    market_structure_bias: str = ""  # "bullish", "bearish", "neutral"
    session: str = ""
    timeframe_confluence: Dict[str, bool] = None
    risk_reward_ratio: float = 0.0
    
    def __post_init__(self):
        if self.timeframe_confluence is None:
            self.timeframe_confluence = {}

@dataclass
class Trade:
    """
    Represents a completed trade with all execution details.
    """
    entry_signal: TradingSignal
    exit_signal: Optional[TradingSignal] = None
    entry_time: Optional[datetime] = None
    exit_time: Optional[datetime] = None
    entry_price: float = 0.0
    exit_price: float = 0.0
    position_size: float = 0.0
    pnl: float = 0.0
    pnl_pct: float = 0.0
    commission: float = 0.0
    duration_minutes: int = 0
    max_favorable_excursion: float = 0.0  # MFE
    max_adverse_excursion: float = 0.0    # MAE
    exit_reason: str = ""
    
    # Performance metrics
    win: bool = False
    breakeven: bool = False
    r_multiple: float = 0.0  # Risk multiple (profit/initial_risk)
    
    def calculate_metrics(self):
        """Calculate trade performance metrics."""
        if self.exit_price and self.entry_price:
            if self.entry_signal.signal_type == SignalType.LONG:
                self.pnl = (self.exit_price - self.entry_price) * self.position_size
                self.pnl_pct = ((self.exit_price / self.entry_price) - 1) * 100
            elif self.entry_signal.signal_type == SignalType.SHORT:
                self.pnl = (self.entry_price - self.exit_price) * self.position_size
                self.pnl_pct = ((self.entry_price / self.exit_price) - 1) * 100
            
            self.pnl -= self.commission
            self.win = self.pnl > 0
            self.breakeven = abs(self.pnl) < 0.01
            
            # Calculate R-multiple
            if self.entry_signal.stop_loss:
                initial_risk = abs(self.entry_price - self.entry_signal.stop_loss) * self.position_size
                if initial_risk > 0:
                    self.r_multiple = self.pnl / initial_risk

class BaseStrategy(ABC):
    """
    Abstract base class for all trading strategies.
    
    This class defines the interface that all strategies must implement,
    including ICT and MMXM specific strategies.
    """
    
    def __init__(self, parameters: Dict[str, Any]):
        """
        Initialize strategy with parameters.
        
        Args:
            parameters: Dictionary containing strategy parameters
        """
        self.parameters = parameters
        self.name = self.__class__.__name__
        self.trades: List[Trade] = []
        self.current_position = PositionType.NONE
        self.position_entry_time: Optional[datetime] = None
        self.position_entry_price: float = 0.0
        self.position_size: float = 0.0
        self.equity_curve: List[float] = []
        self.current_equity: float = parameters.get('initial_capital', 10000)
        
        # Risk management parameters
        self.risk_per_trade = parameters.get('risk_per_trade', 0.02)  # 2% risk
        self.max_position_size = parameters.get('max_position_size', 0.1)  # 10% of capital
        self.commission_per_trade = parameters.get('commission', 2.0)  # $2 per trade
        
        # Strategy specific parameters
        self.required_timeframes = parameters.get('required_timeframes', ['5T'])
        self.min_confidence = parameters.get('min_confidence', 0.6)
        self.min_confluence_score = parameters.get('min_confluence_score', 5.0)
        
        logger.info(f"Initialized {self.name} with parameters: {parameters}")
    
    @abstractmethod
    def generate_signals(self, mtf_data: Dict[str, pd.DataFrame], 
                        current_index: int) -> List[TradingSignal]:
        """
        Generate trading signals based on market data.
        
        Args:
            mtf_data: Multi-timeframe market data
            current_index: Current bar index in the reference timeframe
            
        Returns:
            List of trading signals
        """
        pass
    
    @abstractmethod
    def validate_entry(self, signal: TradingSignal, 
                      market_context: Dict[str, Any]) -> bool:
        """
        Validate entry signal with additional checks.
        
        Args:
            signal: Trading signal to validate
            market_context: Additional market context
            
        Returns:
            True if signal is valid for entry
        """
        pass
    
    @abstractmethod
    def calculate_position_size(self, signal: TradingSignal, 
                              account_balance: float) -> float:
        """
        Calculate position size based on risk management rules.
        
        Args:
            signal: Trading signal
            account_balance: Current account balance
            
        Returns:
            Position size in contracts/shares
        """
        pass
    
    @abstractmethod
    def should_exit(self, mtf_data: Dict[str, pd.DataFrame], 
                   current_index: int, current_trade: Trade) -> Tuple[bool, str]:
        """
        Determine if current position should be exited.
        
        Args:
            mtf_data: Multi-timeframe market data
            current_index: Current bar index
            current_trade: Current open trade
            
        Returns:
            Tuple of (should_exit, exit_reason)
        """
        pass
    
    def calculate_confluence_score(self, signals: Dict[str, Any]) -> float:
        """
        Calculate confluence score based on multiple factors.
        
        This can be overridden by specific strategies for custom scoring.
        
        Args:
            signals: Dictionary of various signals and confirmations
            
        Returns:
            Confluence score (0-10)
        """
        score = 0.0
        
        # Multi-timeframe confluence
        timeframe_signals = signals.get('timeframe_signals', {})
        aligned_signals = sum(1 for tf_signal in timeframe_signals.values() if tf_signal)
        score += min(aligned_signals * 2, 4)  # Max 4 points for timeframe confluence
        
        # Technical indicator confluence
        if signals.get('rsi_divergence', False):
            score += 1
        if signals.get('market_structure_break', False):
            score += 2
        if signals.get('order_block_present', False):
            score += 2
        if signals.get('liquidity_sweep', False):
            score += 1
        
        return min(score, 10.0)
    
    def calculate_standard_position_size(self, signal: TradingSignal, 
                                       account_balance: float) -> float:
        """
        Standard position sizing based on fixed risk percentage.
        
        This is a default implementation that can be used by strategies.
        """
        if not signal.stop_loss:
            # If no stop loss, use ATR-based risk
            risk_amount = account_balance * self.risk_per_trade
            return min(risk_amount / (signal.entry_price * 0.02), 
                      account_balance * self.max_position_size / signal.entry_price)
        
        # Calculate position size based on risk per trade
        risk_amount = account_balance * self.risk_per_trade
        risk_per_contract = abs(signal.entry_price - signal.stop_loss)
        
        if risk_per_contract <= 0:
            return 0
        
        position_size = risk_amount / risk_per_contract
        
        # Apply maximum position size limit
        max_contracts = (account_balance * self.max_position_size) / signal.entry_price
        
        return min(position_size, max_contracts)
    
    def update_equity_curve(self, new_equity: float):
        """Update the equity curve with new equity value."""
        self.current_equity = new_equity
        self.equity_curve.append(new_equity)
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """
        Get basic performance summary of the strategy.
        
        Returns:
            Dictionary with performance metrics
        """
        if not self.trades:
            return {'total_trades': 0, 'message': 'No trades executed'}
        
        winning_trades = [t for t in self.trades if t.win]
        losing_trades = [t for t in self.trades if not t.win and not t.breakeven]
        
        total_pnl = sum(t.pnl for t in self.trades)
        win_rate = len(winning_trades) / len(self.trades) * 100
        
        avg_win = np.mean([t.pnl for t in winning_trades]) if winning_trades else 0
        avg_loss = np.mean([t.pnl for t in losing_trades]) if losing_trades else 0
        
        profit_factor = (abs(sum(t.pnl for t in winning_trades)) / 
                        abs(sum(t.pnl for t in losing_trades))) if losing_trades else float('inf')
        
        return {
            'strategy_name': self.name,
            'total_trades': len(self.trades),
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'win_rate': win_rate,
            'total_pnl': total_pnl,
            'average_win': avg_win,
            'average_loss': avg_loss,
            'profit_factor': profit_factor,
            'final_equity': self.current_equity,
            'return_pct': ((self.current_equity / self.parameters.get('initial_capital', 10000)) - 1) * 100
        }
    
    def reset(self):
        """Reset strategy state for new backtest."""
        self.trades.clear()
        self.current_position = PositionType.NONE
        self.position_entry_time = None
        self.position_entry_price = 0.0
        self.position_size = 0.0
        self.equity_curve.clear()
        self.current_equity = self.parameters.get('initial_capital', 10000)
        logger.info(f"Reset {self.name} strategy state")

# Utility functions for common strategy operations
def is_bullish_candle(bar: pd.Series) -> bool:
    """Check if candle is bullish."""
    return bar['close'] > bar['open']

def is_bearish_candle(bar: pd.Series) -> bool:
    """Check if candle is bearish."""
    return bar['close'] < bar['open']

def calculate_candle_body_pct(bar: pd.Series) -> float:
    """Calculate candle body as percentage of total range."""
    total_range = bar['high'] - bar['low']
    if total_range == 0:
        return 0
    body_size = abs(bar['close'] - bar['open'])
    return (body_size / total_range) * 100

def is_doji(bar: pd.Series, threshold: float = 5.0) -> bool:
    """Check if candle is a doji (small body)."""
    return calculate_candle_body_pct(bar) < threshold

def has_long_upper_wick(bar: pd.Series, threshold: float = 70.0) -> bool:
    """Check if candle has long upper wick."""
    total_range = bar['high'] - bar['low']
    if total_range == 0:
        return False
    upper_wick = bar['high'] - max(bar['open'], bar['close'])
    return (upper_wick / total_range) * 100 > threshold

def has_long_lower_wick(bar: pd.Series, threshold: float = 70.0) -> bool:
    """Check if candle has long lower wick."""
    total_range = bar['high'] - bar['low']
    if total_range == 0:
        return False
    lower_wick = min(bar['open'], bar['close']) - bar['low']
    return (lower_wick / total_range) * 100 > threshold
