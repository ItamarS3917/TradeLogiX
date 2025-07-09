"""
Advanced Backtesting Engine
==========================

Main backtesting engine that orchestrates strategy testing with multi-timeframe data.
Designed specifically for ICT/MMXM trading concepts with comprehensive analytics.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import logging
from pathlib import Path
import json

from .data_processor import TradingViewProcessor
from ..strategies.base_strategy import BaseStrategy, Trade, TradingSignal, SignalType, PositionType
from .performance_analyzer import PerformanceAnalyzer

logger = logging.getLogger(__name__)

class BacktestEngine:
    """
    Advanced backtesting engine for ICT/MMXM trading strategies.
    
    Features:
    - Multi-timeframe strategy testing
    - Realistic trade execution simulation
    - Comprehensive performance analytics
    - MCP integration capabilities
    - Export/import functionality
    """
    
    def __init__(self, initial_capital: float = 10000.0):
        """
        Initialize backtesting engine.
        
        Args:
            initial_capital: Starting capital for backtesting
        """
        self.initial_capital = initial_capital
        self.data_processor = TradingViewProcessor()
        self.performance_analyzer = PerformanceAnalyzer()
        
        # Execution settings
        self.slippage_pips = 0.5  # Execution slippage in NQ points
        self.commission_per_trade = 2.0  # Commission per round turn
        self.max_spread = 1.0  # Maximum spread in points
        
        # State tracking
        self.current_equity = initial_capital
        self.current_position: Optional[Trade] = None
        self.all_trades: List[Trade] = []
        self.equity_curve: List[Tuple[datetime, float]] = []
        
        logger.info(f"Initialized BacktestEngine with ${initial_capital:,.2f} capital")
    
    def run_backtest(self, strategy: BaseStrategy, data_file: str, 
                    start_date: Optional[str] = None, 
                    end_date: Optional[str] = None,
                    timeframes: List[str] = None) -> Dict[str, Any]:
        """
        Run complete backtest for a strategy.
        
        Args:
            strategy: Trading strategy to test
            data_file: Path to TradingView CSV file
            start_date: Start date for backtest (YYYY-MM-DD)
            end_date: End date for backtest (YYYY-MM-DD)
            timeframes: List of timeframes to create ['5T', '15T', '1H']
            
        Returns:
            Dictionary containing backtest results
        """
        try:
            logger.info(f"Starting backtest for {strategy.name}")
            
            # Reset strategy state
            strategy.reset()
            self._reset_engine_state()
            
            # Load and process data
            base_data = self.data_processor.load_csv(data_file)
            
            # Filter by date range if specified
            if start_date:
                base_data = base_data[base_data.index >= pd.to_datetime(start_date)]
            if end_date:
                base_data = base_data[base_data.index <= pd.to_datetime(end_date)]
            
            # Create multi-timeframe dataset
            if timeframes is None:
                timeframes = strategy.required_timeframes
            
            mtf_data = self.data_processor.create_multi_timeframe_dataset(base_data, timeframes)
            
            # Align timeframes for backtesting
            reference_tf = min(timeframes)  # Use shortest timeframe as reference
            aligned_data = self.data_processor.align_timeframes_for_analysis(mtf_data, reference_tf)
            
            # Run the simulation
            results = self._simulate_trading(strategy, aligned_data, reference_tf)
            
            # Analyze performance
            performance_metrics = self.performance_analyzer.analyze_performance(
                self.all_trades, self.equity_curve, self.initial_capital
            )
            
            # Combine results
            final_results = {
                'strategy_name': strategy.name,
                'backtest_period': {
                    'start': base_data.index[0].isoformat(),
                    'end': base_data.index[-1].isoformat(),
                    'total_bars': len(base_data)
                },
                'trades': [self._trade_to_dict(trade) for trade in self.all_trades],
                'performance': performance_metrics,
                'equity_curve': [(dt.isoformat(), equity) for dt, equity in self.equity_curve],
                'parameters': strategy.parameters,
                'execution_settings': {
                    'slippage_pips': self.slippage_pips,
                    'commission_per_trade': self.commission_per_trade,
                    'initial_capital': self.initial_capital
                }
            }
            
            logger.info(f"Backtest completed: {len(self.all_trades)} trades, "
                       f"Final equity: ${self.current_equity:,.2f}")
            
            return final_results
            
        except Exception as e:
            logger.error(f"Backtest failed: {str(e)}")
            raise
    
    def _simulate_trading(self, strategy: BaseStrategy, 
                         mtf_data: Dict[str, pd.DataFrame], 
                         reference_tf: str) -> Dict[str, Any]:
        """
        Simulate trading execution bar by bar.
        
        Args:
            strategy: Trading strategy
            mtf_data: Multi-timeframe data
            reference_tf: Reference timeframe for bar iteration
            
        Returns:
            Simulation results
        """
        reference_data = mtf_data[reference_tf]
        total_bars = len(reference_data)
        
        logger.info(f"Simulating {total_bars} bars on {reference_tf} timeframe")
        
        for i in range(1, total_bars):  # Start from 1 to have previous bar data
            current_time = reference_data.index[i]
            current_bar = reference_data.iloc[i]
            
            # Update equity curve
            self.equity_curve.append((current_time, self.current_equity))
            
            # Create market context for current bar
            market_context = self._create_market_context(mtf_data, i, reference_tf)
            
            # Check for exit signals first (if we have a position)
            if self.current_position is not None:
                should_exit, exit_reason = strategy.should_exit(mtf_data, i, self.current_position)
                if should_exit:
                    self._execute_exit(current_bar, current_time, exit_reason)
            
            # Generate new entry signals (if no position)
            if self.current_position is None:
                signals = strategy.generate_signals(mtf_data, i)
                
                for signal in signals:
                    if self._validate_signal(signal, strategy, market_context):
                        if self._execute_entry(signal, current_bar, current_time, strategy):
                            break  # Only take one position at a time
            
            # Progress logging
            if i % 1000 == 0:
                progress = (i / total_bars) * 100
                logger.info(f"Progress: {progress:.1f}% - Equity: ${self.current_equity:,.2f}")
        
        # Close any remaining position at the end
        if self.current_position is not None:
            final_bar = reference_data.iloc[-1]
            final_time = reference_data.index[-1]
            self._execute_exit(final_bar, final_time, "End of backtest")
        
        return {
            'total_bars_processed': total_bars,
            'trades_executed': len(self.all_trades),
            'final_equity': self.current_equity
        }
    
    def _create_market_context(self, mtf_data: Dict[str, pd.DataFrame], 
                              current_index: int, reference_tf: str) -> Dict[str, Any]:
        """Create market context for current bar."""
        context = {
            'current_index': current_index,
            'reference_timeframe': reference_tf,
            'timestamp': mtf_data[reference_tf].index[current_index],
            'session': mtf_data[reference_tf].iloc[current_index].get('session', 'UNKNOWN')
        }
        
        # Add current bar data for each timeframe
        for tf, data in mtf_data.items():
            if current_index < len(data):
                context[f'{tf}_current'] = data.iloc[current_index]
                if current_index > 0:
                    context[f'{tf}_previous'] = data.iloc[current_index - 1]
        
        return context
    
    def _validate_signal(self, signal: TradingSignal, strategy: BaseStrategy, 
                        market_context: Dict[str, Any]) -> bool:
        """Validate signal before execution."""
        # Basic validation
        if signal.confidence < strategy.min_confidence:
            return False
        
        if signal.confluence_score < strategy.min_confluence_score:
            return False
        
        # Strategy-specific validation
        if not strategy.validate_entry(signal, market_context):
            return False
        
        # Market condition validation
        current_bar = market_context[f'{strategy.required_timeframes[0]}_current']
        
        # Check spread (for NQ, spread should be reasonable)
        implied_spread = current_bar['high'] - current_bar['low']
        if implied_spread > self.max_spread * 5:  # 5x normal spread threshold
            logger.warning(f"Rejecting signal due to wide spread: {implied_spread}")
            return False
        
        return True
    
    def _execute_entry(self, signal: TradingSignal, current_bar: pd.Series, 
                      current_time: datetime, strategy: BaseStrategy) -> bool:
        """
        Execute entry order with realistic slippage and commission.
        
        Returns:
            True if trade was executed successfully
        """
        try:
            # Calculate position size
            position_size = strategy.calculate_position_size(signal, self.current_equity)
            
            if position_size <= 0:
                return False
            
            # Apply slippage
            if signal.signal_type == SignalType.LONG:
                execution_price = signal.entry_price + self.slippage_pips
            else:
                execution_price = signal.entry_price - self.slippage_pips
            
            # Create trade
            trade = Trade(
                entry_signal=signal,
                entry_time=current_time,
                entry_price=execution_price,
                position_size=position_size,
                commission=self.commission_per_trade
            )
            
            # Update equity for commission
            self.current_equity -= self.commission_per_trade
            
            # Set as current position
            self.current_position = trade
            
            logger.debug(f"Entered {signal.signal_type.value} at {execution_price:.2f}, "
                        f"Size: {position_size:.2f}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to execute entry: {str(e)}")
            return False
    
    def _execute_exit(self, current_bar: pd.Series, current_time: datetime, 
                     exit_reason: str):
        """Execute exit order and finalize trade."""
        if self.current_position is None:
            return
        
        try:
            # Determine exit price based on exit reason
            if "stop_loss" in exit_reason.lower():
                exit_price = self.current_position.entry_signal.stop_loss
            elif "take_profit" in exit_reason.lower():
                exit_price = self.current_position.entry_signal.take_profit
            else:
                # Market exit at current price
                if self.current_position.entry_signal.signal_type == SignalType.LONG:
                    exit_price = current_bar['close'] - self.slippage_pips
                else:
                    exit_price = current_bar['close'] + self.slippage_pips
            
            # Finalize trade
            self.current_position.exit_time = current_time
            self.current_position.exit_price = exit_price
            self.current_position.exit_reason = exit_reason
            self.current_position.duration_minutes = int(
                (current_time - self.current_position.entry_time).total_seconds() / 60
            )
            
            # Calculate trade metrics
            self.current_position.calculate_metrics()
            
            # Update equity
            self.current_equity += self.current_position.pnl
            self.current_equity -= self.commission_per_trade  # Exit commission
            
            # Add to completed trades
            self.all_trades.append(self.current_position)
            self.current_position = None
            
            logger.debug(f"Exited trade: P&L ${self.current_position.pnl:.2f}, "
                        f"Reason: {exit_reason}")
            
        except Exception as e:
            logger.error(f"Failed to execute exit: {str(e)}")
    
    def _trade_to_dict(self, trade: Trade) -> Dict[str, Any]:
        """Convert Trade object to dictionary for serialization."""
        return {
            'entry_time': trade.entry_time.isoformat() if trade.entry_time else None,
            'exit_time': trade.exit_time.isoformat() if trade.exit_time else None,
            'entry_price': trade.entry_price,
            'exit_price': trade.exit_price,
            'position_size': trade.position_size,
            'pnl': trade.pnl,
            'pnl_pct': trade.pnl_pct,
            'duration_minutes': trade.duration_minutes,
            'exit_reason': trade.exit_reason,
            'win': trade.win,
            'r_multiple': trade.r_multiple,
            'signal_type': trade.entry_signal.signal_type.value,
            'setup_type': trade.entry_signal.setup_type,
            'confidence': trade.entry_signal.confidence,
            'confluence_score': trade.entry_signal.confluence_score,
            'session': trade.entry_signal.session
        }
    
    def _reset_engine_state(self):
        """Reset engine state for new backtest."""
        self.current_equity = self.initial_capital
        self.current_position = None
        self.all_trades.clear()
        self.equity_curve.clear()
    
    def export_results(self, results: Dict[str, Any], output_file: str):
        """Export backtest results to JSON file."""
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        logger.info(f"Results exported to {output_path}")
    
    def load_results(self, results_file: str) -> Dict[str, Any]:
        """Load backtest results from JSON file."""
        with open(results_file, 'r') as f:
            results = json.load(f)
        
        logger.info(f"Results loaded from {results_file}")
        return results
    
    def compare_strategies(self, results_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compare multiple strategy results.
        
        Args:
            results_list: List of backtest results dictionaries
            
        Returns:
            Comparison analysis
        """
        if len(results_list) < 2:
            raise ValueError("Need at least 2 results to compare")
        
        comparison = {
            'strategies': [],
            'comparison_metrics': {},
            'winner': None
        }
        
        # Extract key metrics for each strategy
        for results in results_list:
            strategy_summary = {
                'name': results['strategy_name'],
                'total_trades': len(results['trades']),
                'win_rate': results['performance']['win_rate'],
                'total_return': results['performance']['total_return_pct'],
                'sharpe_ratio': results['performance']['sharpe_ratio'],
                'max_drawdown': results['performance']['max_drawdown_pct'],
                'profit_factor': results['performance']['profit_factor']
            }
            comparison['strategies'].append(strategy_summary)
        
        # Determine winner based on risk-adjusted return
        best_score = -float('inf')
        winner_idx = 0
        
        for i, strategy in enumerate(comparison['strategies']):
            # Simple scoring: (Return - MaxDrawdown) * Sharpe
            score = (strategy['total_return'] - abs(strategy['max_drawdown'])) * strategy['sharpe_ratio']
            if score > best_score:
                best_score = score
                winner_idx = i
        
        comparison['winner'] = comparison['strategies'][winner_idx]['name']
        
        logger.info(f"Strategy comparison completed. Winner: {comparison['winner']}")
        return comparison

# Example usage
if __name__ == "__main__":
    # This would be used with actual strategy implementations
    engine = BacktestEngine(initial_capital=10000)
    print("BacktestEngine initialized successfully!")
