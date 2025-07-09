"""
Backtesting Demo Script
======================

Comprehensive demo showing how to use the ICT backtesting system 
with TradingView CSV data format.

This script demonstrates:
1. Loading TradingView CSV data
2. Creating multi-timeframe datasets
3. Running ICT strategy backtests
4. Analyzing performance results
5. Generating reports
"""

import sys
import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from pathlib import Path

# Add backend to path for imports
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from backtesting import BacktestEngine, TradingViewProcessor
from backtesting.strategies import ICTStrategy
from backtesting.utils import TimeframeConverter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_sample_data(num_bars: int = 1000) -> pd.DataFrame:
    """
    Create sample NQ futures data in TradingView format.
    
    This simulates realistic NQ price action with proper OHLC relationships.
    """
    logger.info(f"Creating {num_bars} bars of sample NQ data")
    
    # Start parameters
    start_time = datetime(2024, 12, 1, 9, 30)  # Market open
    start_price = 21000.0
    
    # Generate realistic price movements
    np.random.seed(42)  # For reproducible results
    
    data = []
    current_price = start_price
    current_time = start_time
    
    for i in range(num_bars):
        # Generate random price change (-0.5% to +0.5%)
        price_change_pct = np.random.normal(0, 0.002)  # 0.2% volatility
        price_change = current_price * price_change_pct
        
        # Create OHLC for this bar
        open_price = current_price
        
        # Add some intrabar volatility
        high_offset = abs(np.random.normal(0, 0.001)) * current_price
        low_offset = abs(np.random.normal(0, 0.001)) * current_price
        
        high_price = max(open_price, open_price + price_change) + high_offset
        low_price = min(open_price, open_price + price_change) - low_offset
        close_price = open_price + price_change
        
        # Ensure OHLC relationships are valid
        high_price = max(high_price, open_price, close_price)
        low_price = min(low_price, open_price, close_price)
        
        # Generate RSI (simplified)
        rsi = 50 + np.random.normal(0, 15)
        rsi = max(10, min(90, rsi))  # Keep between 10-90
        
        # RSI-based MA (smoothed RSI)
        rsi_ma = rsi + np.random.normal(0, 5)
        rsi_ma = max(10, min(90, rsi_ma))
        
        # Occasional divergence signals
        bullish_signal = "Bullish" if np.random.random() < 0.05 else ""
        bullish_label = "Regular Bullish Divergence" if bullish_signal else ""
        bearish_signal = "Bearish" if np.random.random() < 0.05 else ""
        bearish_label = "Regular Bearish Divergence" if bearish_signal else ""
        
        data.append({
            'time': int(current_time.timestamp()),
            'open': round(open_price, 2),
            'high': round(high_price, 2),
            'low': round(low_price, 2),
            'close': round(close_price, 2),
            'RSI': round(rsi, 3),
            'RSI-based MA': round(rsi_ma, 3),
            'Regular Bullish': bullish_signal,
            'Regular Bullish Label': bullish_label,
            'Regular Bearish': bearish_signal,
            'Regular Bearish Label': bearish_label
        })
        
        # Update for next bar
        current_price = close_price
        current_time += timedelta(minutes=5)  # 5-minute bars
    
    df = pd.DataFrame(data)
    logger.info(f"Sample data created: {len(df)} bars from {start_time} to {current_time}")
    
    return df

def save_sample_csv(df: pd.DataFrame, filename: str = "sample_nq_5m.csv") -> str:
    """Save sample data to CSV file."""
    filepath = Path(__file__).parent / filename
    df.to_csv(filepath, index=False)
    logger.info(f"Sample data saved to {filepath}")
    return str(filepath)

def run_ict_backtest_demo():
    """
    Main demo function showing complete ICT backtesting workflow.
    """
    logger.info("=" * 60)
    logger.info("ICT BACKTESTING DEMO")
    logger.info("=" * 60)
    
    # Step 1: Create or load sample data
    logger.info("\n1. Creating sample TradingView data...")
    sample_data = create_sample_data(2000)  # 2000 bars ≈ 1 week of 5m data
    csv_file = save_sample_csv(sample_data)
    
    # Display sample data format
    print("\nSample TradingView CSV Format:")
    print(sample_data.head())
    print(f"\nData shape: {sample_data.shape}")
    
    # Step 2: Initialize data processor
    logger.info("\n2. Processing TradingView data...")
    processor = TradingViewProcessor()
    
    # Load and validate data
    df = processor.load_csv(csv_file)
    quality_report = processor.validate_data_quality(df)
    
    print(f"\nData Quality Report:")
    print(f"  Quality Score: {quality_report['quality_score']:.1f}/100")
    print(f"  Data Gaps: {quality_report['data_gaps']}")
    print(f"  Price Anomalies: {quality_report['price_anomalies']}")
    
    # Step 3: Create multi-timeframe dataset
    logger.info("\n3. Creating multi-timeframe dataset...")
    timeframes = ['5T', '15T', '1H']
    mtf_data = processor.create_multi_timeframe_dataset(df, timeframes)
    
    print(f"\nMulti-timeframe dataset created:")
    for tf, data in mtf_data.items():
        tf_name = TimeframeConverter.convert_timeframe_notation(tf)
        print(f"  {tf_name}: {len(data)} bars")
    
    # Step 4: Initialize ICT strategy
    logger.info("\n4. Initializing ICT strategy...")
    strategy_params = {
        'initial_capital': 25000,           # $25k starting capital
        'risk_per_trade': 0.01,            # 1% risk per trade (conservative)
        'required_timeframes': timeframes,
        'min_confluence_score': 5.0,       # Lower for demo (normally 6-7)
        'max_trades_per_day': 5,           # Max 5 trades per day
        'session_filter': ['LONDON', 'NY', 'OVERLAP'],
        'min_confidence': 0.6
    }
    
    ict_strategy = ICTStrategy(strategy_params)
    
    print(f"\nICT Strategy Configuration:")
    print(f"  Capital: ${strategy_params['initial_capital']:,}")
    print(f"  Risk per trade: {strategy_params['risk_per_trade']*100}%")
    print(f"  Min confluence: {strategy_params['min_confluence_score']}")
    print(f"  Timeframes: {timeframes}")
    
    # Step 5: Run backtest
    logger.info("\n5. Running ICT backtest...")
    engine = BacktestEngine(initial_capital=strategy_params['initial_capital'])
    
    # Run the backtest
    results = engine.run_backtest(
        strategy=ict_strategy,
        data_file=csv_file,
        timeframes=timeframes
    )
    
    # Step 6: Display results
    logger.info("\n6. Analyzing results...")
    display_backtest_results(results)
    
    # Step 7: Save results
    logger.info("\n7. Saving results...")
    results_file = Path(__file__).parent / "ict_backtest_results.json"
    engine.export_results(results, str(results_file))
    
    logger.info(f"\n🎉 Demo completed successfully!")
    logger.info(f"Results saved to: {results_file}")
    
    return results

def display_backtest_results(results: dict):
    """Display formatted backtest results."""
    
    print("\n" + "=" * 60)
    print("BACKTEST RESULTS")
    print("=" * 60)
    
    # Basic info
    print(f"\nStrategy: {results['strategy_name']}")
    print(f"Period: {results['backtest_period']['start'][:10]} to {results['backtest_period']['end'][:10]}")
    print(f"Total bars analyzed: {results['backtest_period']['total_bars']:,}")
    
    # Performance summary
    perf = results['performance']
    print(f"\n📊 PERFORMANCE SUMMARY:")
    print(f"  Total Trades: {perf['total_trades']}")
    print(f"  Winning Trades: {perf['winning_trades']}")
    print(f"  Win Rate: {perf['win_rate']:.1f}%")
    print(f"  Total Return: ${perf['total_return']:,.2f}")
    print(f"  Return %: {perf['total_return_pct']:.2f}%")
    print(f"  Profit Factor: {perf['profit_factor']:.2f}")
    
    # Risk metrics
    print(f"\n⚠️  RISK METRICS:")
    print(f"  Sharpe Ratio: {perf.get('sharpe_ratio', 0):.2f}")
    print(f"  Max Drawdown: {perf.get('max_drawdown_pct', 0):.2f}%")
    print(f"  Average Trade Duration: {perf.get('average_trade_duration_minutes', 0):.0f} minutes")
    
    # Trade analysis
    if perf['total_trades'] > 0:
        print(f"\n📈 TRADE ANALYSIS:")
        print(f"  Average Win: ${perf['average_win']:.2f}")
        print(f"  Average Loss: ${perf['average_loss']:.2f}")
        print(f"  Largest Win: ${perf['largest_win']:.2f}")
        print(f"  Largest Loss: ${perf['largest_loss']:.2f}")
    
    # ICT specific metrics
    if 'session_performance' in perf:
        print(f"\n🎯 SESSION PERFORMANCE:")
        for session, stats in perf['session_performance'].items():
            print(f"  {session}: {stats['total_trades']} trades, "
                  f"{stats['win_rate']:.1f}% WR, ${stats['total_pnl']:.2f} P&L")
    
    # Setup performance
    if 'setup_performance' in perf:
        print(f"\n🔧 SETUP PERFORMANCE:")
        for setup, stats in perf['setup_performance'].items():
            if stats['total_trades'] > 0:
                print(f"  {setup}: {stats['total_trades']} trades, "
                      f"{stats['win_rate']:.1f}% WR, ${stats['total_pnl']:.2f} P&L")
    
    # Recent trades
    if results['trades']:
        print(f"\n📋 RECENT TRADES (Last 5):")
        recent_trades = results['trades'][-5:]
        for i, trade in enumerate(recent_trades, 1):
            pnl_str = f"${trade['pnl']:+.2f}"
            win_loss = "WIN" if trade['win'] else "LOSS"
            print(f"  {i}. {trade['setup_type']} | {pnl_str} | {win_loss} | "
                  f"{trade['duration_minutes']}m | {trade['exit_reason']}")

def create_performance_report(results: dict) -> str:
    """Create a detailed performance report."""
    from backtesting.engine import PerformanceAnalyzer
    
    analyzer = PerformanceAnalyzer()
    return analyzer.generate_performance_report(results['performance'])

if __name__ == "__main__":
    """
    Run the ICT backtesting demo.
    
    This demonstrates the complete workflow from data loading to results analysis.
    """
    try:
        # Set up paths
        os.chdir(Path(__file__).parent)
        
        # Run the demo
        results = run_ict_backtest_demo()
        
        # Optional: Generate detailed report
        print("\n" + "=" * 60)
        print("DETAILED PERFORMANCE REPORT")
        print("=" * 60)
        report = create_performance_report(results)
        print(report)
        
    except Exception as e:
        logger.error(f"Demo failed: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print(f"\n💡 Next steps:")
    print(f"   1. Replace sample data with real TradingView CSV exports")
    print(f"   2. Adjust ICT strategy parameters for your trading style")
    print(f"   3. Add custom confluence factors and exit rules")
    print(f"   4. Integrate with your trading journal for forward testing")
