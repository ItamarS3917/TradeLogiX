"""
Strategy Comparison Demo
=======================

Advanced demo comparing ICT vs MMXM trading strategies with comprehensive analysis.

This script demonstrates:
1. Side-by-side strategy comparison
2. Performance analytics comparison
3. Strategy strengths and weaknesses analysis
4. Portfolio combination testing
5. Market condition analysis
"""

import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from pathlib import Path
import json

# Add backend to path for imports
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from backtesting import BacktestEngine, TradingViewProcessor
from backtesting.strategies import ICTStrategy, MMXMStrategy
from backtesting.utils import TimeframeConverter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_enhanced_sample_data(num_bars: int = 2000, include_volume: bool = True) -> pd.DataFrame:
    """
    Create enhanced sample data with volume for MMXM analysis.
    
    This creates more realistic market data with:
    - Accumulation and distribution phases
    - Volume patterns
    - Range-bound periods
    - Trending periods
    """
    logger.info(f"Creating {num_bars} bars of enhanced sample data with volume")
    
    # Market phase simulation
    phases = []
    phase_types = ['accumulation', 'markup', 'distribution', 'markdown']
    phase_lengths = [200, 300, 200, 300]  # Bars per phase
    
    current_phase = 0
    bars_in_phase = 0
    
    # Start parameters
    start_time = datetime(2024, 12, 1, 9, 30)
    start_price = 21000.0
    
    np.random.seed(42)
    
    data = []
    current_price = start_price
    current_time = start_time
    base_volume = 1000
    
    for i in range(num_bars):
        # Phase management
        if bars_in_phase >= phase_lengths[current_phase]:
            current_phase = (current_phase + 1) % len(phase_types)
            bars_in_phase = 0
        
        phase_type = phase_types[current_phase]
        bars_in_phase += 1
        
        # Phase-specific price behavior
        if phase_type == 'accumulation':
            # Sideways with slight upward bias
            price_change_pct = np.random.normal(0.0001, 0.001)  # Small upward drift
            volume_multiplier = np.random.uniform(0.8, 1.2)    # Normal volume
            
        elif phase_type == 'markup':
            # Strong upward trend
            price_change_pct = np.random.normal(0.002, 0.002)  # Upward trend
            volume_multiplier = np.random.uniform(1.0, 1.5)    # Higher volume
            
        elif phase_type == 'distribution':
            # Sideways with slight downward bias
            price_change_pct = np.random.normal(-0.0001, 0.001) # Small downward drift
            volume_multiplier = np.random.uniform(0.9, 1.3)     # Variable volume
            
        else:  # markdown
            # Strong downward trend
            price_change_pct = np.random.normal(-0.002, 0.002) # Downward trend
            volume_multiplier = np.random.uniform(1.2, 1.8)    # High volume
        
        # Apply price change
        price_change = current_price * price_change_pct
        
        # Create OHLC for this bar
        open_price = current_price
        
        # Add intrabar volatility based on phase
        if phase_type in ['accumulation', 'distribution']:
            volatility = 0.0008  # Lower volatility in ranges
        else:
            volatility = 0.0015  # Higher volatility in trends
        
        high_offset = abs(np.random.normal(0, volatility)) * current_price
        low_offset = abs(np.random.normal(0, volatility)) * current_price
        
        high_price = max(open_price, open_price + price_change) + high_offset
        low_price = min(open_price, open_price + price_change) - low_offset
        close_price = open_price + price_change
        
        # Ensure OHLC relationships
        high_price = max(high_price, open_price, close_price)
        low_price = min(low_price, open_price, close_price)
        
        # Generate volume based on phase and price action
        volume = int(base_volume * volume_multiplier * np.random.uniform(0.5, 2.0))
        
        # Generate RSI
        rsi = 50 + np.random.normal(0, 15)
        if phase_type == 'markup':
            rsi += 10  # Higher RSI in uptrends
        elif phase_type == 'markdown':
            rsi -= 10  # Lower RSI in downtrends
        rsi = max(10, min(90, rsi))
        
        # RSI-based MA
        rsi_ma = rsi + np.random.normal(0, 3)
        rsi_ma = max(10, min(90, rsi_ma))
        
        # Generate occasional divergence signals based on phase
        bullish_signal = ""
        bullish_label = ""
        bearish_signal = ""
        bearish_label = ""
        
        if phase_type == 'accumulation' and np.random.random() < 0.08:
            bullish_signal = "Bullish"
            bullish_label = "Regular Bullish Divergence"
        elif phase_type == 'distribution' and np.random.random() < 0.08:
            bearish_signal = "Bearish"
            bearish_label = "Regular Bearish Divergence"
        
        data.append({
            'time': int(current_time.timestamp()),
            'open': round(open_price, 2),
            'high': round(high_price, 2),
            'low': round(low_price, 2),
            'close': round(close_price, 2),
            'volume': volume if include_volume else None,
            'RSI': round(rsi, 3),
            'RSI-based MA': round(rsi_ma, 3),
            'Regular Bullish': bullish_signal,
            'Regular Bullish Label': bullish_label,
            'Regular Bearish': bearish_signal,
            'Regular Bearish Label': bearish_label,
            'phase': phase_type  # For analysis purposes
        })
        
        # Update for next bar
        current_price = close_price
        current_time += timedelta(minutes=5)
    
    df = pd.DataFrame(data)
    
    # Remove phase column before saving (not part of TradingView format)
    phases_for_analysis = df['phase'].copy()
    df = df.drop('phase', axis=1)
    
    logger.info(f"Enhanced sample data created with phases: {phases_for_analysis.value_counts().to_dict()}")
    
    return df

def run_strategy_comparison():
    """
    Run comprehensive strategy comparison between ICT and MMXM approaches.
    """
    logger.info("=" * 70)
    logger.info("ADVANCED STRATEGY COMPARISON: ICT vs MMXM")
    logger.info("=" * 70)
    
    # Step 1: Create enhanced sample data
    logger.info("\\n1. Creating enhanced sample data with volume...")
    sample_data = create_enhanced_sample_data(2500, include_volume=True)
    csv_file = save_enhanced_csv(sample_data)
    
    print(f"\\nSample data created: {sample_data.shape}")
    print(f"Volume included: {'volume' in sample_data.columns}")
    print(f"Date range: {pd.to_datetime(sample_data['time'], unit='s').min()} to {pd.to_datetime(sample_data['time'], unit='s').max()}")
    
    # Step 2: Initialize strategies
    logger.info("\\n2. Initializing strategies...")
    
    # ICT Strategy Configuration
    ict_params = {
        'initial_capital': 25000,
        'risk_per_trade': 0.015,  # 1.5% risk
        'required_timeframes': ['5T', '15T', '1H'],
        'min_confluence_score': 5.5,
        'max_trades_per_day': 4,
        'session_filter': ['LONDON', 'NY', 'OVERLAP'],
        'min_confidence': 0.65
    }
    
    # MMXM Strategy Configuration  
    mmxm_params = {
        'initial_capital': 25000,
        'risk_per_trade': 0.02,   # 2% risk (MMXM allows larger positions)
        'required_timeframes': ['5T', '15T', '1H'],
        'min_confluence_score': 5.0,
        'max_trades_per_phase': 3,
        'phase_filter': ['ACCUMULATION', 'DISTRIBUTION'],
        'min_volume_confirmation': True,
        'volume_ma_period': 20
    }
    
    ict_strategy = ICTStrategy(ict_params)
    mmxm_strategy = MMXMStrategy(mmxm_params)
    
    print(f"\\nStrategy Configurations:")
    print(f"ICT:  {ict_params['risk_per_trade']*100}% risk, {ict_params['min_confluence_score']} min confluence")
    print(f"MMXM: {mmxm_params['risk_per_trade']*100}% risk, {mmxm_params['min_confluence_score']} min confluence")
    
    # Step 3: Run backtests
    logger.info("\\n3. Running backtests...")
    
    engine = BacktestEngine(initial_capital=25000)
    
    # ICT Backtest
    print("\\nRunning ICT strategy backtest...")
    ict_results = engine.run_backtest(
        strategy=ict_strategy,
        data_file=csv_file,
        timeframes=['5T', '15T', '1H']
    )
    
    # Reset engine for MMXM
    engine = BacktestEngine(initial_capital=25000)
    
    # MMXM Backtest
    print("Running MMXM strategy backtest...")
    mmxm_results = engine.run_backtest(
        strategy=mmxm_strategy,
        data_file=csv_file,
        timeframes=['5T', '15T', '1H']
    )
    
    # Step 4: Compare results
    logger.info("\\n4. Analyzing and comparing results...")
    comparison = compare_strategies(ict_results, mmxm_results)
    
    # Step 5: Display comprehensive comparison
    display_strategy_comparison(ict_results, mmxm_results, comparison)
    
    # Step 6: Save results
    logger.info("\\n6. Saving comparison results...")
    save_comparison_results(ict_results, mmxm_results, comparison)
    
    logger.info("\\n🎉 Strategy comparison completed successfully!")
    
    return ict_results, mmxm_results, comparison

def save_enhanced_csv(df: pd.DataFrame, filename: str = "enhanced_nq_5m.csv") -> str:
    """Save enhanced sample data to CSV."""
    filepath = Path(__file__).parent / filename
    df.to_csv(filepath, index=False)
    logger.info(f"Enhanced data saved to {filepath}")
    return str(filepath)

def compare_strategies(ict_results: dict, mmxm_results: dict) -> dict:
    """
    Perform detailed comparison between ICT and MMXM strategies.
    """
    comparison = {
        'summary': {},
        'performance_metrics': {},
        'trade_analysis': {},
        'risk_analysis': {},
        'efficiency_analysis': {},
        'market_condition_analysis': {}
    }
    
    # Basic performance comparison
    ict_perf = ict_results['performance']
    mmxm_perf = mmxm_results['performance']
    
    comparison['summary'] = {
        'winner_by_return': 'ICT' if ict_perf['total_return_pct'] > mmxm_perf['total_return_pct'] else 'MMXM',
        'winner_by_winrate': 'ICT' if ict_perf['win_rate'] > mmxm_perf['win_rate'] else 'MMXM',
        'winner_by_sharpe': 'ICT' if ict_perf.get('sharpe_ratio', 0) > mmxm_perf.get('sharpe_ratio', 0) else 'MMXM',
        'winner_by_drawdown': 'ICT' if abs(ict_perf.get('max_drawdown_pct', 0)) < abs(mmxm_perf.get('max_drawdown_pct', 0)) else 'MMXM'
    }
    
    # Performance metrics comparison
    comparison['performance_metrics'] = {
        'total_return_diff': ict_perf['total_return_pct'] - mmxm_perf['total_return_pct'],
        'win_rate_diff': ict_perf['win_rate'] - mmxm_perf['win_rate'],
        'profit_factor_diff': ict_perf['profit_factor'] - mmxm_perf['profit_factor'],
        'sharpe_diff': ict_perf.get('sharpe_ratio', 0) - mmxm_perf.get('sharpe_ratio', 0)
    }
    
    # Trade efficiency analysis
    comparison['efficiency_analysis'] = {
        'ict_trades_per_return': ict_perf['total_trades'] / max(ict_perf['total_return_pct'], 0.1),
        'mmxm_trades_per_return': mmxm_perf['total_trades'] / max(mmxm_perf['total_return_pct'], 0.1),
        'ict_avg_return_per_trade': ict_perf['total_return_pct'] / max(ict_perf['total_trades'], 1),
        'mmxm_avg_return_per_trade': mmxm_perf['total_return_pct'] / max(mmxm_perf['total_trades'], 1)
    }
    
    # Risk analysis
    comparison['risk_analysis'] = {
        'ict_risk_adjusted_return': ict_perf['total_return_pct'] / max(abs(ict_perf.get('max_drawdown_pct', 1)), 1),
        'mmxm_risk_adjusted_return': mmxm_perf['total_return_pct'] / max(abs(mmxm_perf.get('max_drawdown_pct', 1)), 1),
        'ict_volatility': ict_perf.get('volatility_annualized', 0),
        'mmxm_volatility': mmxm_perf.get('volatility_annualized', 0)
    }
    
    return comparison

def display_strategy_comparison(ict_results: dict, mmxm_results: dict, comparison: dict):
    """Display comprehensive strategy comparison."""
    
    print("\\n" + "=" * 70)
    print("COMPREHENSIVE STRATEGY COMPARISON")
    print("=" * 70)
    
    # Summary
    print(f"\\n📊 WINNER SUMMARY:")
    for metric, winner in comparison['summary'].items():
        print(f"   {metric.replace('_', ' ').title()}: {winner}")
    
    # Side-by-side performance
    print(f"\\n📈 PERFORMANCE COMPARISON:")
    print(f"{'Metric':<25} {'ICT':<15} {'MMXM':<15} {'Difference':<15}")
    print("-" * 70)
    
    metrics = [
        ('Total Trades', 'total_trades', ''),
        ('Win Rate %', 'win_rate', '%'),
        ('Total Return %', 'total_return_pct', '%'),
        ('Profit Factor', 'profit_factor', ''),
        ('Sharpe Ratio', 'sharpe_ratio', ''),
        ('Max Drawdown %', 'max_drawdown_pct', '%'),
        ('Avg Win $', 'average_win', '$'),
        ('Avg Loss $', 'average_loss', '$')
    ]
    
    for metric_name, metric_key, suffix in metrics:
        ict_val = ict_results['performance'].get(metric_key, 0)
        mmxm_val = mmxm_results['performance'].get(metric_key, 0)
        diff = ict_val - mmxm_val
        
        ict_str = f"{ict_val:.2f}{suffix}" if suffix else f"{ict_val:.2f}"
        mmxm_str = f"{mmxm_val:.2f}{suffix}" if suffix else f"{mmxm_val:.2f}"
        diff_str = f"{diff:+.2f}{suffix}" if suffix else f"{diff:+.2f}"
        
        print(f"{metric_name:<25} {ict_str:<15} {mmxm_str:<15} {diff_str:<15}")
    
    # Strategy strengths
    print(f"\\n🎯 STRATEGY STRENGTHS:")
    
    ict_perf = ict_results['performance']
    mmxm_perf = mmxm_results['performance']
    
    print(f"\\nICT Strategy Strengths:")
    if ict_perf['win_rate'] > mmxm_perf['win_rate']:
        print(f"   ✅ Higher win rate ({ict_perf['win_rate']:.1f}% vs {mmxm_perf['win_rate']:.1f}%)")
    if ict_perf.get('sharpe_ratio', 0) > mmxm_perf.get('sharpe_ratio', 0):
        print(f"   ✅ Better risk-adjusted returns (Sharpe: {ict_perf.get('sharpe_ratio', 0):.2f})")
    if ict_perf['total_trades'] > mmxm_perf['total_trades']:
        print(f"   ✅ More trading opportunities ({ict_perf['total_trades']} vs {mmxm_perf['total_trades']} trades)")
    
    print(f"\\nMMXM Strategy Strengths:")
    if mmxm_perf['total_return_pct'] > ict_perf['total_return_pct']:
        print(f"   ✅ Higher total returns ({mmxm_perf['total_return_pct']:.2f}% vs {ict_perf['total_return_pct']:.2f}%)")
    if mmxm_perf['profit_factor'] > ict_perf['profit_factor']:
        print(f"   ✅ Better profit factor ({mmxm_perf['profit_factor']:.2f} vs {ict_perf['profit_factor']:.2f})")
    if abs(mmxm_perf.get('max_drawdown_pct', 0)) < abs(ict_perf.get('max_drawdown_pct', 0)):
        print(f"   ✅ Lower maximum drawdown ({mmxm_perf.get('max_drawdown_pct', 0):.2f}%)")
    
    # Efficiency analysis
    print(f"\\n⚡ EFFICIENCY ANALYSIS:")
    eff = comparison['efficiency_analysis']
    print(f"   ICT - Avg Return per Trade: {eff['ict_avg_return_per_trade']:.3f}%")
    print(f"   MMXM - Avg Return per Trade: {eff['mmxm_avg_return_per_trade']:.3f}%")
    
    if eff['ict_avg_return_per_trade'] > eff['mmxm_avg_return_per_trade']:
        print(f"   ✅ ICT is more efficient per trade")
    else:
        print(f"   ✅ MMXM is more efficient per trade")
    
    # Session/Setup performance
    if 'session_performance' in ict_perf and 'session_performance' in mmxm_perf:
        print(f"\\n🕐 SESSION PERFORMANCE COMPARISON:")
        
        ict_sessions = ict_perf['session_performance']
        mmxm_sessions = mmxm_perf.get('session_performance', {})
        
        for session in ['LONDON', 'NY', 'OVERLAP']:
            if session in ict_sessions and session in mmxm_sessions:
                ict_wr = ict_sessions[session]['win_rate']
                mmxm_wr = mmxm_sessions[session]['win_rate']
                print(f"   {session}: ICT {ict_wr:.1f}% vs MMXM {mmxm_wr:.1f}% win rate")
    
    # Recent trades comparison
    print(f"\\n📋 RECENT TRADES SAMPLE:")
    
    print(f"\\nICT Recent Trades:")
    for i, trade in enumerate(ict_results['trades'][-3:], 1):
        result = "WIN" if trade['win'] else "LOSS"
        print(f"   {i}. {trade['setup_type'][:25]} | ${trade['pnl']:+6.2f} | {result}")
    
    print(f"\\nMMXM Recent Trades:")
    for i, trade in enumerate(mmxm_results['trades'][-3:], 1):
        result = "WIN" if trade['win'] else "LOSS"
        print(f"   {i}. {trade['setup_type'][:25]} | ${trade['pnl']:+6.2f} | {result}")

def save_comparison_results(ict_results: dict, mmxm_results: dict, comparison: dict):
    """Save comparison results to files."""
    
    # Save individual results
    ict_file = Path(__file__).parent / "ict_strategy_results.json"
    mmxm_file = Path(__file__).parent / "mmxm_strategy_results.json"
    comparison_file = Path(__file__).parent / "strategy_comparison.json"
    
    with open(ict_file, 'w') as f:
        json.dump(ict_results, f, indent=2, default=str)
    
    with open(mmxm_file, 'w') as f:
        json.dump(mmxm_results, f, indent=2, default=str)
    
    with open(comparison_file, 'w') as f:
        json.dump(comparison, f, indent=2, default=str)
    
    logger.info(f"Results saved:")
    logger.info(f"  ICT: {ict_file}")
    logger.info(f"  MMXM: {mmxm_file}")
    logger.info(f"  Comparison: {comparison_file}")

def create_portfolio_combination(ict_results: dict, mmxm_results: dict) -> dict:
    """
    Create a portfolio combination of both strategies.
    
    This simulates running both strategies simultaneously with capital allocation.
    """
    logger.info("Creating portfolio combination (50/50 allocation)...")
    
    # Simulate 50/50 capital allocation
    ict_allocation = 0.5
    mmxm_allocation = 0.5
    
    # Scale results by allocation
    ict_scaled_return = ict_results['performance']['total_return'] * ict_allocation
    mmxm_scaled_return = mmxm_results['performance']['total_return'] * mmxm_allocation
    
    portfolio_return = ict_scaled_return + mmxm_scaled_return
    portfolio_return_pct = (portfolio_return / 25000) * 100
    
    # Combine trades (simplified)
    total_trades = ict_results['performance']['total_trades'] + mmxm_results['performance']['total_trades']
    total_wins = ict_results['performance']['winning_trades'] + mmxm_results['performance']['winning_trades']
    portfolio_win_rate = (total_wins / total_trades * 100) if total_trades > 0 else 0
    
    portfolio_results = {
        'strategy_name': 'ICT + MMXM Portfolio',
        'total_return': portfolio_return,
        'total_return_pct': portfolio_return_pct,
        'total_trades': total_trades,
        'win_rate': portfolio_win_rate,
        'allocation': {
            'ict': ict_allocation,
            'mmxm': mmxm_allocation
        },
        'component_returns': {
            'ict': ict_scaled_return,
            'mmxm': mmxm_scaled_return
        }
    }
    
    print(f"\\n💼 PORTFOLIO COMBINATION (50/50):")
    print(f"   Total Return: ${portfolio_return:.2f} ({portfolio_return_pct:.2f}%)")
    print(f"   Combined Win Rate: {portfolio_win_rate:.1f}%")
    print(f"   Total Trades: {total_trades}")
    print(f"   ICT Contribution: ${ict_scaled_return:.2f}")
    print(f"   MMXM Contribution: ${mmxm_scaled_return:.2f}")
    
    return portfolio_results

if __name__ == "__main__":
    """
    Run the comprehensive strategy comparison demo.
    """
    try:
        # Set up paths
        os.chdir(Path(__file__).parent)
        
        # Run the comparison
        ict_results, mmxm_results, comparison = run_strategy_comparison()
        
        # Optional: Create portfolio combination
        portfolio = create_portfolio_combination(ict_results, mmxm_results)
        
        print(f"\\n💡 KEY INSIGHTS:")
        print(f"   1. ICT excels at: High-frequency entries with good risk management")
        print(f"   2. MMXM excels at: Patient entries with larger position sizes")
        print(f"   3. Portfolio approach: Combines both methodologies for diversification")
        print(f"   4. Market conditions: Each strategy may perform better in different market phases")
        
        print(f"\\n🚀 Next Steps:")
        print(f"   1. Test with real TradingView data")
        print(f"   2. Optimize parameters for each strategy")
        print(f"   3. Implement forward testing")
        print(f"   4. Create hybrid strategy combining best elements")
        
    except Exception as e:
        logger.error(f"Strategy comparison failed: {str(e)}")
        import traceback
        traceback.print_exc()
