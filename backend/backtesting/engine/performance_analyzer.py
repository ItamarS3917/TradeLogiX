"""
Performance Analyzer
===================

Comprehensive performance analysis for backtesting results.
Includes standard metrics plus ICT/MMXM specific analytics.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any, Optional
from datetime import datetime, timedelta
import logging
from scipy import stats
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class PerformanceMetrics:
    """Container for performance metrics."""
    total_trades: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    win_rate: float = 0.0
    total_return: float = 0.0
    total_return_pct: float = 0.0
    sharpe_ratio: float = 0.0
    calmar_ratio: float = 0.0
    max_drawdown: float = 0.0
    max_drawdown_pct: float = 0.0
    profit_factor: float = 0.0
    average_win: float = 0.0
    average_loss: float = 0.0
    largest_win: float = 0.0
    largest_loss: float = 0.0
    consecutive_wins: int = 0
    consecutive_losses: int = 0
    average_trade_duration: float = 0.0
    total_commission: float = 0.0

class PerformanceAnalyzer:
    """
    Advanced performance analysis for trading strategies.
    
    Provides comprehensive metrics including:
    - Basic performance metrics
    - Risk-adjusted returns
    - Drawdown analysis
    - Trade distribution analysis
    - ICT/MMXM specific metrics
    """
    
    def __init__(self):
        pass
    
    def analyze_performance(self, trades: List[Any], 
                          equity_curve: List[Tuple[datetime, float]],
                          initial_capital: float) -> Dict[str, Any]:
        """
        Comprehensive performance analysis.
        
        Args:
            trades: List of Trade objects
            equity_curve: List of (timestamp, equity) tuples
            initial_capital: Starting capital
            
        Returns:
            Dictionary containing all performance metrics
        """
        if not trades:
            return self._empty_performance_metrics()
        
        # Convert to DataFrames for easier analysis
        trades_df = self._trades_to_dataframe(trades)
        equity_df = self._equity_curve_to_dataframe(equity_curve)
        
        # Calculate basic metrics
        basic_metrics = self._calculate_basic_metrics(trades_df, initial_capital)
        
        # Calculate risk metrics
        risk_metrics = self._calculate_risk_metrics(trades_df, equity_df, initial_capital)
        
        # Calculate advanced metrics
        advanced_metrics = self._calculate_advanced_metrics(trades_df, equity_df)
        
        # Calculate ICT/MMXM specific metrics
        ict_metrics = self._calculate_ict_metrics(trades_df)
        
        # Calculate time-based metrics
        time_metrics = self._calculate_time_based_metrics(trades_df)
        
        # Combine all metrics
        performance = {
            **basic_metrics,
            **risk_metrics,
            **advanced_metrics,
            **ict_metrics,
            **time_metrics,
            'analysis_timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Performance analysis completed for {len(trades)} trades")
        return performance
    
    def _empty_performance_metrics(self) -> Dict[str, Any]:
        """Return empty metrics for when no trades exist."""
        return {
            'total_trades': 0,
            'message': 'No trades to analyze',
            'analysis_timestamp': datetime.now().isoformat()
        }
    
    def _trades_to_dataframe(self, trades: List[Any]) -> pd.DataFrame:
        """Convert trade objects to DataFrame."""
        trade_data = []
        
        for trade in trades:
            trade_data.append({
                'entry_time': trade.entry_time,
                'exit_time': trade.exit_time,
                'entry_price': trade.entry_price,
                'exit_price': trade.exit_price,
                'position_size': trade.position_size,
                'pnl': trade.pnl,
                'pnl_pct': trade.pnl_pct,
                'duration_minutes': trade.duration_minutes,
                'win': trade.win,
                'r_multiple': trade.r_multiple,
                'signal_type': trade.entry_signal.signal_type.value if hasattr(trade.entry_signal, 'signal_type') else 'UNKNOWN',
                'setup_type': getattr(trade.entry_signal, 'setup_type', ''),
                'confidence': getattr(trade.entry_signal, 'confidence', 0),
                'confluence_score': getattr(trade.entry_signal, 'confluence_score', 0),
                'session': getattr(trade.entry_signal, 'session', ''),
                'exit_reason': trade.exit_reason,
                'commission': trade.commission
            })
        
        return pd.DataFrame(trade_data)
    
    def _equity_curve_to_dataframe(self, equity_curve: List[Tuple[datetime, float]]) -> pd.DataFrame:
        """Convert equity curve to DataFrame."""
        if not equity_curve:
            return pd.DataFrame(columns=['timestamp', 'equity'])
        
        df = pd.DataFrame(equity_curve, columns=['timestamp', 'equity'])
        df.set_index('timestamp', inplace=True)
        return df
    
    def _calculate_basic_metrics(self, trades_df: pd.DataFrame, 
                               initial_capital: float) -> Dict[str, float]:
        """Calculate basic performance metrics."""
        total_trades = len(trades_df)
        winning_trades = len(trades_df[trades_df['win'] == True])
        losing_trades = len(trades_df[trades_df['win'] == False])
        
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
        
        total_pnl = trades_df['pnl'].sum()
        total_return_pct = (total_pnl / initial_capital) * 100
        
        winning_pnl = trades_df[trades_df['win']]['pnl'].sum()
        losing_pnl = abs(trades_df[~trades_df['win']]['pnl'].sum())
        
        profit_factor = (winning_pnl / losing_pnl) if losing_pnl > 0 else float('inf')
        
        average_win = trades_df[trades_df['win']]['pnl'].mean() if winning_trades > 0 else 0
        average_loss = trades_df[~trades_df['win']]['pnl'].mean() if losing_trades > 0 else 0
        
        largest_win = trades_df['pnl'].max() if total_trades > 0 else 0
        largest_loss = trades_df['pnl'].min() if total_trades > 0 else 0
        
        total_commission = trades_df['commission'].sum()
        
        return {
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': losing_trades,
            'win_rate': win_rate,
            'total_return': total_pnl,
            'total_return_pct': total_return_pct,
            'profit_factor': profit_factor,
            'average_win': average_win,
            'average_loss': average_loss,
            'largest_win': largest_win,
            'largest_loss': largest_loss,
            'total_commission': total_commission,
            'net_profit': total_pnl - total_commission
        }
    
    def _calculate_risk_metrics(self, trades_df: pd.DataFrame, 
                              equity_df: pd.DataFrame,
                              initial_capital: float) -> Dict[str, float]:
        """Calculate risk-adjusted performance metrics."""
        if equity_df.empty:
            return {}
        
        # Calculate returns
        equity_df['returns'] = equity_df['equity'].pct_change()
        daily_returns = equity_df['returns'].dropna()
        
        # Sharpe Ratio (annualized, assuming 252 trading days)
        if len(daily_returns) > 1 and daily_returns.std() > 0:
            mean_return = daily_returns.mean() * 252
            std_return = daily_returns.std() * np.sqrt(252)
            sharpe_ratio = mean_return / std_return
        else:
            sharpe_ratio = 0
        
        # Maximum Drawdown
        equity_df['peak'] = equity_df['equity'].expanding().max()
        equity_df['drawdown'] = equity_df['equity'] - equity_df['peak']
        equity_df['drawdown_pct'] = (equity_df['drawdown'] / equity_df['peak']) * 100
        
        max_drawdown = equity_df['drawdown'].min()
        max_drawdown_pct = equity_df['drawdown_pct'].min()
        
        # Calmar Ratio
        annual_return = ((equity_df['equity'].iloc[-1] / initial_capital) ** (252 / len(equity_df)) - 1) * 100
        calmar_ratio = (annual_return / abs(max_drawdown_pct)) if max_drawdown_pct < 0 else 0
        
        # Sortino Ratio
        negative_returns = daily_returns[daily_returns < 0]
        downside_deviation = negative_returns.std() * np.sqrt(252) if len(negative_returns) > 0 else 0
        sortino_ratio = (mean_return / downside_deviation) if downside_deviation > 0 else 0
        
        # Value at Risk (95% confidence)
        var_95 = np.percentile(daily_returns, 5) if len(daily_returns) > 0 else 0
        
        return {
            'sharpe_ratio': sharpe_ratio,
            'sortino_ratio': sortino_ratio,
            'calmar_ratio': calmar_ratio,
            'max_drawdown': max_drawdown,
            'max_drawdown_pct': max_drawdown_pct,
            'var_95': var_95,
            'volatility_annualized': std_return if 'std_return' in locals() else 0
        }
    
    def _calculate_advanced_metrics(self, trades_df: pd.DataFrame, 
                                  equity_df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate advanced performance metrics."""
        # Consecutive wins/losses
        consecutive_wins = self._max_consecutive(trades_df['win'], True)
        consecutive_losses = self._max_consecutive(trades_df['win'], False)
        
        # Average trade duration
        avg_duration = trades_df['duration_minutes'].mean() if len(trades_df) > 0 else 0
        
        # R-multiple analysis
        r_multiples = trades_df['r_multiple'].dropna()
        avg_r_multiple = r_multiples.mean() if len(r_multiples) > 0 else 0
        
        # Trade distribution
        trade_distribution = {
            'r_multiple_distribution': {
                'negative': len(r_multiples[r_multiples < 0]),
                '0_to_1': len(r_multiples[(r_multiples >= 0) & (r_multiples < 1)]),
                '1_to_2': len(r_multiples[(r_multiples >= 1) & (r_multiples < 2)]),
                '2_to_3': len(r_multiples[(r_multiples >= 2) & (r_multiples < 3)]),
                'above_3': len(r_multiples[r_multiples >= 3])
            }
        }
        
        # Monthly performance (if data spans multiple months)
        monthly_performance = self._calculate_monthly_performance(trades_df)
        
        return {
            'consecutive_wins': consecutive_wins,
            'consecutive_losses': consecutive_losses,
            'average_trade_duration_minutes': avg_duration,
            'average_r_multiple': avg_r_multiple,
            'trade_distribution': trade_distribution,
            'monthly_performance': monthly_performance
        }
    
    def _calculate_ict_metrics(self, trades_df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate ICT/MMXM specific metrics."""
        ict_metrics = {}
        
        # Performance by setup type
        if 'setup_type' in trades_df.columns:
            setup_performance = {}
            for setup in trades_df['setup_type'].unique():
                if setup:  # Skip empty setup types
                    setup_trades = trades_df[trades_df['setup_type'] == setup]
                    setup_performance[setup] = {
                        'total_trades': len(setup_trades),
                        'win_rate': (setup_trades['win'].sum() / len(setup_trades) * 100) if len(setup_trades) > 0 else 0,
                        'avg_pnl': setup_trades['pnl'].mean(),
                        'total_pnl': setup_trades['pnl'].sum()
                    }
            ict_metrics['setup_performance'] = setup_performance
        
        # Performance by session
        if 'session' in trades_df.columns:
            session_performance = {}
            for session in trades_df['session'].unique():
                if session:  # Skip empty sessions
                    session_trades = trades_df[trades_df['session'] == session]
                    session_performance[session] = {
                        'total_trades': len(session_trades),
                        'win_rate': (session_trades['win'].sum() / len(session_trades) * 100) if len(session_trades) > 0 else 0,
                        'avg_pnl': session_trades['pnl'].mean(),
                        'total_pnl': session_trades['pnl'].sum()
                    }
            ict_metrics['session_performance'] = session_performance
        
        # Confluence analysis
        if 'confluence_score' in trades_df.columns:
            # Bin confluence scores
            trades_df['confluence_bin'] = pd.cut(trades_df['confluence_score'], 
                                               bins=[0, 3, 6, 8, 10], 
                                               labels=['Low', 'Medium', 'High', 'Very High'])
            
            confluence_performance = {}
            for conf_level in trades_df['confluence_bin'].cat.categories:
                conf_trades = trades_df[trades_df['confluence_bin'] == conf_level]
                if len(conf_trades) > 0:
                    confluence_performance[conf_level] = {
                        'total_trades': len(conf_trades),
                        'win_rate': (conf_trades['win'].sum() / len(conf_trades) * 100),
                        'avg_pnl': conf_trades['pnl'].mean()
                    }
            ict_metrics['confluence_performance'] = confluence_performance
        
        return ict_metrics
    
    def _calculate_time_based_metrics(self, trades_df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate time-based performance metrics."""
        if 'entry_time' not in trades_df.columns:
            return {}
        
        # Ensure entry_time is datetime
        trades_df['entry_time'] = pd.to_datetime(trades_df['entry_time'])
        
        # Performance by hour of day
        trades_df['hour'] = trades_df['entry_time'].dt.hour
        hourly_performance = {}
        
        for hour in range(24):
            hour_trades = trades_df[trades_df['hour'] == hour]
            if len(hour_trades) > 0:
                hourly_performance[f'{hour:02d}:00'] = {
                    'total_trades': len(hour_trades),
                    'win_rate': (hour_trades['win'].sum() / len(hour_trades) * 100),
                    'avg_pnl': hour_trades['pnl'].mean(),
                    'total_pnl': hour_trades['pnl'].sum()
                }
        
        # Performance by day of week
        trades_df['day_of_week'] = trades_df['entry_time'].dt.day_name()
        daily_performance = {}
        
        for day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']:
            day_trades = trades_df[trades_df['day_of_week'] == day]
            if len(day_trades) > 0:
                daily_performance[day] = {
                    'total_trades': len(day_trades),
                    'win_rate': (day_trades['win'].sum() / len(day_trades) * 100),
                    'avg_pnl': day_trades['pnl'].mean(),
                    'total_pnl': day_trades['pnl'].sum()
                }
        
        return {
            'hourly_performance': hourly_performance,
            'daily_performance': daily_performance
        }
    
    def _calculate_monthly_performance(self, trades_df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate monthly performance breakdown."""
        if 'entry_time' not in trades_df.columns:
            return {}
        
        trades_df['entry_time'] = pd.to_datetime(trades_df['entry_time'])
        trades_df['month_year'] = trades_df['entry_time'].dt.to_period('M')
        
        monthly_stats = {}
        for month in trades_df['month_year'].unique():
            month_trades = trades_df[trades_df['month_year'] == month]
            monthly_stats[str(month)] = {
                'total_trades': len(month_trades),
                'winning_trades': month_trades['win'].sum(),
                'win_rate': (month_trades['win'].sum() / len(month_trades) * 100),
                'total_pnl': month_trades['pnl'].sum(),
                'avg_pnl': month_trades['pnl'].mean()
            }
        
        return monthly_stats
    
    def _max_consecutive(self, series: pd.Series, value: bool) -> int:
        """Calculate maximum consecutive occurrences of a value."""
        if len(series) == 0:
            return 0
        
        max_consecutive = 0
        current_consecutive = 0
        
        for val in series:
            if val == value:
                current_consecutive += 1
                max_consecutive = max(max_consecutive, current_consecutive)
            else:
                current_consecutive = 0
        
        return max_consecutive
    
    def generate_performance_report(self, performance_data: Dict[str, Any]) -> str:
        """
        Generate a human-readable performance report.
        
        Args:
            performance_data: Performance metrics dictionary
            
        Returns:
            Formatted performance report string
        """
        if performance_data.get('total_trades', 0) == 0:
            return "No trades to analyze."
        
        report = []
        report.append("=" * 60)
        report.append("TRADING PERFORMANCE REPORT")
        report.append("=" * 60)
        
        # Basic Performance
        report.append(f"\n📊 BASIC PERFORMANCE:")
        report.append(f"   Total Trades: {performance_data.get('total_trades', 0)}")
        report.append(f"   Win Rate: {performance_data.get('win_rate', 0):.1f}%")
        report.append(f"   Total Return: ${performance_data.get('total_return', 0):,.2f}")
        report.append(f"   Return %: {performance_data.get('total_return_pct', 0):.2f}%")
        report.append(f"   Profit Factor: {performance_data.get('profit_factor', 0):.2f}")
        
        # Risk Metrics
        report.append(f"\n⚠️  RISK METRICS:")
        report.append(f"   Sharpe Ratio: {performance_data.get('sharpe_ratio', 0):.2f}")
        report.append(f"   Max Drawdown: {performance_data.get('max_drawdown_pct', 0):.2f}%")
        report.append(f"   Calmar Ratio: {performance_data.get('calmar_ratio', 0):.2f}")
        
        # Trade Analysis
        report.append(f"\n📈 TRADE ANALYSIS:")
        report.append(f"   Average Win: ${performance_data.get('average_win', 0):.2f}")
        report.append(f"   Average Loss: ${performance_data.get('average_loss', 0):.2f}")
        report.append(f"   Largest Win: ${performance_data.get('largest_win', 0):.2f}")
        report.append(f"   Largest Loss: ${performance_data.get('largest_loss', 0):.2f}")
        report.append(f"   Avg Duration: {performance_data.get('average_trade_duration_minutes', 0):.0f} minutes")
        
        # ICT Performance
        if 'session_performance' in performance_data:
            report.append(f"\n🎯 SESSION PERFORMANCE:")
            for session, stats in performance_data['session_performance'].items():
                report.append(f"   {session}: {stats['win_rate']:.1f}% WR, ${stats['total_pnl']:.2f} P&L")
        
        report.append("\n" + "=" * 60)
        
        return "\n".join(report)

# Example usage
if __name__ == "__main__":
    analyzer = PerformanceAnalyzer()
    print("PerformanceAnalyzer initialized successfully!")
