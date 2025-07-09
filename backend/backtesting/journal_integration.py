"""
Trading Journal Integration Guide
===============================

Guide for integrating the advanced backtesting system with the existing trading journal.

This integration provides:
1. Forward testing capabilities
2. Strategy validation against live trading
3. Performance gap analysis
4. Real-time signal generation
5. AI-powered improvement suggestions
"""

import sys
import os
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
import logging

# Add paths for imports
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

logger = logging.getLogger(__name__)

class JournalBacktestIntegration:
    """
    Integration layer between backtesting system and trading journal.
    
    This class provides methods to:
    - Import live trades from journal
    - Compare with backtest expectations
    - Generate improvement suggestions
    - Create forward testing plans
    """
    
    def __init__(self, journal_db_path: str = None):
        """
        Initialize integration with trading journal.
        
        Args:
            journal_db_path: Path to trading journal database
        """
        self.journal_db_path = journal_db_path
        
    def import_live_trades(self, start_date: str, end_date: str) -> List[Dict]:
        """
        Import live trades from the trading journal.
        
        Args:
            start_date: Start date for trade import (YYYY-MM-DD)
            end_date: End date for trade import (YYYY-MM-DD)
            
        Returns:
            List of live trade dictionaries
        """
        # This would connect to the actual trading journal database
        # For now, we'll simulate the data structure
        
        sample_live_trades = [
            {
                'id': 1,
                'entry_time': '2024-12-15T14:30:00Z',
                'exit_time': '2024-12-15T16:45:00Z',
                'symbol': 'NQ',
                'setup_type': 'ICT_Order_Block_Mitigation',
                'entry_price': 21250.5,
                'exit_price': 21310.25,
                'position_size': 1.0,
                'pnl': 59.75,
                'win': True,
                'confluence_factors': ['market_structure_break', 'order_block', 'rsi_divergence'],
                'session': 'NY',
                'notes': 'Clean order block mitigation with volume confirmation'
            },
            {
                'id': 2,
                'entry_time': '2024-12-16T08:15:00Z',
                'exit_time': '2024-12-16T09:30:00Z',
                'symbol': 'NQ',
                'setup_type': 'MMXM_Spring_Pattern',
                'entry_price': 21180.0,
                'exit_price': 21195.5,
                'position_size': 2.0,
                'pnl': 31.0,
                'win': True,
                'confluence_factors': ['spring_pattern', 'volume_confirmation', 'accumulation_phase'],
                'session': 'LONDON',
                'notes': 'Spring in accumulation zone with high volume confirmation'
            }
        ]
        
        logger.info(f"Imported {len(sample_live_trades)} live trades from {start_date} to {end_date}")
        return sample_live_trades
    
    def compare_with_backtest(self, live_trades: List[Dict], 
                            backtest_results: Dict) -> Dict[str, Any]:
        """
        Compare live trading performance with backtest expectations.
        
        Args:
            live_trades: List of live trades from journal
            backtest_results: Backtest results from strategy
            
        Returns:
            Comparison analysis
        """
        if not live_trades:
            return {'error': 'No live trades to compare'}
        
        # Calculate live performance metrics
        live_performance = self._calculate_live_performance(live_trades)
        backtest_performance = backtest_results['performance']
        
        # Performance gap analysis
        performance_gap = {
            'win_rate_gap': live_performance['win_rate'] - backtest_performance['win_rate'],
            'avg_win_gap': live_performance['avg_win'] - backtest_performance['average_win'],
            'avg_loss_gap': live_performance['avg_loss'] - backtest_performance['average_loss'],
            'profit_factor_gap': live_performance['profit_factor'] - backtest_performance['profit_factor']
        }
        
        # Setup performance comparison
        setup_comparison = self._compare_setup_performance(live_trades, backtest_results)
        
        # Implementation issues analysis
        implementation_issues = self._analyze_implementation_issues(live_trades, backtest_results)
        
        comparison = {
            'live_performance': live_performance,
            'backtest_performance': backtest_performance,
            'performance_gap': performance_gap,
            'setup_comparison': setup_comparison,
            'implementation_issues': implementation_issues,
            'overall_assessment': self._assess_implementation_quality(performance_gap)
        }
        
        logger.info("Live vs backtest comparison completed")
        return comparison
    
    def generate_improvement_suggestions(self, comparison: Dict[str, Any]) -> List[str]:
        """
        Generate AI-powered suggestions for improving live trading performance.
        
        Args:
            comparison: Comparison analysis from compare_with_backtest
            
        Returns:
            List of improvement suggestions
        """
        suggestions = []
        
        performance_gap = comparison['performance_gap']
        implementation_issues = comparison['implementation_issues']
        
        # Win rate analysis
        if performance_gap['win_rate_gap'] < -10:  # Live win rate significantly lower
            suggestions.append(
                "🎯 Win Rate Issue: Your live win rate is significantly lower than backtested. "
                "Consider: 1) Tightening entry criteria, 2) Waiting for higher confluence scores, "
                "3) Avoiding FOMO entries during high volatility periods."
            )
        
        # Average win/loss analysis
        if performance_gap['avg_win_gap'] < -50:  # Smaller live wins
            suggestions.append(
                "💰 Profit Taking Issue: Your live trades are capturing smaller wins than backtested. "
                "Consider: 1) Holding positions longer for target achievement, 2) Using trailing stops "
                "instead of fixed targets, 3) Partial profit taking strategies."
            )
        
        if performance_gap['avg_loss_gap'] < -30:  # Larger live losses
            suggestions.append(
                "🛡️ Risk Management Issue: Your live losses are larger than backtested. "
                "Consider: 1) Honoring stop losses without exception, 2) Reducing position sizes "
                "during high volatility, 3) Avoiding revenge trading after losses."
            )
        
        # Setup-specific suggestions
        if 'setup_issues' in implementation_issues:
            for setup, issue in implementation_issues['setup_issues'].items():
                if issue == 'poor_execution':
                    suggestions.append(
                        f"⚡ Execution Issue ({setup}): Poor execution timing detected. "
                        f"Consider using limit orders and waiting for precise entry levels."
                    )
        
        # Session-specific suggestions
        if 'session_issues' in implementation_issues:
            for session, issue in implementation_issues['session_issues'].items():
                suggestions.append(
                    f"🕐 Session Issue ({session}): {issue}. Consider focusing on your "
                    f"most profitable sessions and avoiding overtrading."
                )
        
        # Confluence analysis
        if implementation_issues.get('confluence_discipline', False):
            suggestions.append(
                "🔧 Confluence Discipline: You're taking trades with lower confluence than "
                "backtested. Stick to your minimum confluence score requirements and "
                "avoid 'good enough' setups."
            )
        
        # Psychology suggestions
        if len(suggestions) > 3:  # Multiple issues suggest psychological factors
            suggestions.append(
                "🧠 Psychology Focus: Multiple execution issues suggest emotional trading. "
                "Consider: 1) Pre-market planning sessions, 2) Trade size reduction during "
                "stress, 3) Daily review of rule adherence, 4) Taking breaks after losses."
            )
        
        if not suggestions:
            suggestions.append(
                "✅ Excellent Implementation: Your live trading closely matches backtest "
                "expectations. Continue following your rules and consider gradually "
                "increasing position sizes."
            )
        
        return suggestions
    
    def create_forward_testing_plan(self, best_strategies: List[str]) -> Dict[str, Any]:
        """
        Create a forward testing plan for validating strategies in live markets.
        
        Args:
            best_strategies: List of best performing strategy names
            
        Returns:
            Forward testing plan
        """
        plan = {
            'phase_1_paper_trading': {
                'duration_weeks': 4,
                'strategies': best_strategies[:2],  # Start with top 2 strategies
                'position_size': 0.25,  # 25% of normal size
                'success_criteria': {
                    'min_win_rate': 60,
                    'min_profit_factor': 1.5,
                    'max_drawdown': 5.0
                }
            },
            'phase_2_small_live': {
                'duration_weeks': 6,
                'strategies': best_strategies[:1],  # Best strategy only
                'position_size': 0.5,   # 50% of normal size
                'success_criteria': {
                    'min_win_rate': 55,
                    'min_profit_factor': 1.3,
                    'max_drawdown': 7.0
                }
            },
            'phase_3_full_implementation': {
                'duration_weeks': 12,
                'strategies': best_strategies[:1],
                'position_size': 1.0,   # Full size
                'success_criteria': {
                    'min_win_rate': 50,
                    'min_profit_factor': 1.2,
                    'max_drawdown': 10.0
                }
            },
            'monitoring_requirements': {
                'daily_review': True,
                'weekly_analysis': True,
                'monthly_optimization': True,
                'risk_alerts': True
            },
            'exit_criteria': {
                'consecutive_losses': 5,
                'drawdown_breach': True,
                'win_rate_below_threshold': True
            }
        }
        
        logger.info(f"Created forward testing plan for {len(best_strategies)} strategies")
        return plan
    
    def _calculate_live_performance(self, live_trades: List[Dict]) -> Dict[str, float]:
        """Calculate performance metrics for live trades."""
        if not live_trades:
            return {}
        
        total_trades = len(live_trades)
        winning_trades = [t for t in live_trades if t['win']]
        losing_trades = [t for t in live_trades if not t['win']]
        
        win_rate = len(winning_trades) / total_trades * 100
        total_pnl = sum(t['pnl'] for t in live_trades)
        
        avg_win = sum(t['pnl'] for t in winning_trades) / len(winning_trades) if winning_trades else 0
        avg_loss = sum(t['pnl'] for t in losing_trades) / len(losing_trades) if losing_trades else 0
        
        total_wins = sum(t['pnl'] for t in winning_trades)
        total_losses = abs(sum(t['pnl'] for t in losing_trades))
        profit_factor = total_wins / total_losses if total_losses > 0 else float('inf')
        
        return {
            'total_trades': total_trades,
            'win_rate': win_rate,
            'total_pnl': total_pnl,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'profit_factor': profit_factor
        }
    
    def _compare_setup_performance(self, live_trades: List[Dict], 
                                 backtest_results: Dict) -> Dict[str, Any]:
        """Compare setup performance between live and backtest."""
        setup_comparison = {}
        
        # Group live trades by setup
        live_by_setup = {}
        for trade in live_trades:
            setup = trade['setup_type']
            if setup not in live_by_setup:
                live_by_setup[setup] = []
            live_by_setup[setup].append(trade)
        
        # Compare with backtest setup performance
        backtest_setups = backtest_results['performance'].get('setup_performance', {})
        
        for setup, live_setup_trades in live_by_setup.items():
            live_wr = len([t for t in live_setup_trades if t['win']]) / len(live_setup_trades) * 100
            
            if setup in backtest_setups:
                backtest_wr = backtest_setups[setup]['win_rate']
                setup_comparison[setup] = {
                    'live_win_rate': live_wr,
                    'backtest_win_rate': backtest_wr,
                    'gap': live_wr - backtest_wr
                }
        
        return setup_comparison
    
    def _analyze_implementation_issues(self, live_trades: List[Dict], 
                                     backtest_results: Dict) -> Dict[str, Any]:
        """Analyze implementation issues in live trading."""
        issues = {}
        
        # Check confluence discipline
        low_confluence_trades = [t for t in live_trades if len(t.get('confluence_factors', [])) < 3]
        if len(low_confluence_trades) / len(live_trades) > 0.3:  # >30% low confluence
            issues['confluence_discipline'] = True
        
        # Check setup execution issues
        setup_issues = {}
        for trade in live_trades:
            setup = trade['setup_type']
            # Simplified check - in reality would analyze execution quality
            if trade['pnl'] < -100:  # Large loss suggests poor execution
                if setup not in setup_issues:
                    setup_issues[setup] = 'poor_execution'
        
        if setup_issues:
            issues['setup_issues'] = setup_issues
        
        return issues
    
    def _assess_implementation_quality(self, performance_gap: Dict[str, float]) -> str:
        """Assess overall implementation quality."""
        gaps = [abs(gap) for gap in performance_gap.values()]
        avg_gap = sum(gaps) / len(gaps)
        
        if avg_gap < 5:
            return "Excellent - Live performance closely matches backtest"
        elif avg_gap < 15:
            return "Good - Minor implementation gaps that can be improved"
        elif avg_gap < 30:
            return "Fair - Significant gaps requiring attention"
        else:
            return "Poor - Major implementation issues need immediate addressing"

def create_integration_example():
    """
    Example of how to use the journal integration.
    """
    print("Trading Journal Integration Example")
    print("=" * 50)
    
    # Initialize integration
    integration = JournalBacktestIntegration()
    
    # Import live trades
    live_trades = integration.import_live_trades('2024-12-01', '2024-12-31')
    print(f"\\nImported {len(live_trades)} live trades")
    
    # Simulate backtest results (in real use, this would come from actual backtest)
    sample_backtest_results = {
        'performance': {
            'win_rate': 65.0,
            'average_win': 75.0,
            'average_loss': -45.0,
            'profit_factor': 2.1,
            'setup_performance': {
                'ICT_Order_Block_Mitigation': {'win_rate': 70.0},
                'MMXM_Spring_Pattern': {'win_rate': 60.0}
            }
        }
    }
    
    # Compare performance
    comparison = integration.compare_with_backtest(live_trades, sample_backtest_results)
    
    print(f"\\nPerformance Comparison:")
    print(f"Live Win Rate: {comparison['live_performance']['win_rate']:.1f}%")
    print(f"Backtest Win Rate: {comparison['backtest_performance']['win_rate']:.1f}%")
    print(f"Gap: {comparison['performance_gap']['win_rate_gap']:+.1f}%")
    
    # Generate improvement suggestions
    suggestions = integration.generate_improvement_suggestions(comparison)
    
    print(f"\\nImprovement Suggestions:")
    for i, suggestion in enumerate(suggestions, 1):
        print(f"{i}. {suggestion}")
    
    # Create forward testing plan
    forward_plan = integration.create_forward_testing_plan(['ICT_Strategy', 'MMXM_Strategy'])
    
    print(f"\\nForward Testing Plan Created:")
    print(f"Phase 1: {forward_plan['phase_1_paper_trading']['duration_weeks']} weeks paper trading")
    print(f"Phase 2: {forward_plan['phase_2_small_live']['duration_weeks']} weeks small live")
    print(f"Phase 3: {forward_plan['phase_3_full_implementation']['duration_weeks']} weeks full implementation")

# Real-time signal generation integration
class RealTimeSignalGenerator:
    """
    Generate real-time trading signals for the journal.
    
    This class can be integrated with the trading journal to provide
    live signal generation based on current market data.
    """
    
    def __init__(self, strategies: List[Any]):
        """
        Initialize with list of strategies.
        
        Args:
            strategies: List of strategy instances
        """
        self.strategies = strategies
        self.last_signals = {}
    
    def generate_live_signals(self, current_data: Dict[str, pd.DataFrame]) -> List[Dict]:
        """
        Generate live signals based on current market data.
        
        Args:
            current_data: Current multi-timeframe market data
            
        Returns:
            List of signal dictionaries
        """
        signals = []
        
        for strategy in self.strategies:
            try:
                # Generate signals for current bar
                current_index = len(current_data[strategy.required_timeframes[0]]) - 1
                strategy_signals = strategy.generate_signals(current_data, current_index)
                
                for signal in strategy_signals:
                    signals.append({
                        'strategy': strategy.name,
                        'timestamp': signal.timestamp.isoformat(),
                        'signal_type': signal.signal_type.value,
                        'entry_price': signal.entry_price,
                        'stop_loss': signal.stop_loss,
                        'take_profit': signal.take_profit,
                        'confluence_score': signal.confluence_score,
                        'setup_type': signal.setup_type,
                        'notes': signal.notes
                    })
                
            except Exception as e:
                logger.error(f"Error generating signals for {strategy.name}: {e}")
        
        return signals

if __name__ == "__main__":
    """
    Run the integration example.
    """
    try:
        create_integration_example()
        
        print(f"\\n🔗 Integration Complete!")
        print(f"\\nNext Steps for Full Integration:")
        print(f"1. Connect to actual trading journal database")
        print(f"2. Implement real-time data feeds")
        print(f"3. Create automated signal alerts")
        print(f"4. Build performance dashboard")
        print(f"5. Add mobile notifications")
        
    except Exception as e:
        logger.error(f"Integration example failed: {str(e)}")
        import traceback
        traceback.print_exc()
