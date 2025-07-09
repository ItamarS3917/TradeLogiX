"""
Advanced Backtesting Module for ICT/MMXM Trading Strategies
===========================================================

This module provides comprehensive backtesting capabilities specifically designed for
Inner Circle Trader (ICT) and Market Maker Move (MMXM) trading concepts.

Key Features:
- Multi-timeframe analysis (1m, 5m, 15m, 1h, 4h, Daily)
- ICT concept validation (Order Blocks, Fair Value Gaps, Market Structure)
- MMXM pattern recognition and analysis
- Advanced performance analytics
- MCP integration for enhanced functionality
- TradingView CSV data processing

Usage:
    from backend.backtesting import BacktestEngine, ICTStrategy
    
    engine = BacktestEngine()
    strategy = ICTStrategy(parameters={'risk_per_trade': 0.02})
    results = engine.run_backtest(strategy, data_file='NQ_5m_data.csv')
"""

from .engine.backtester import BacktestEngine
from .engine.data_processor import TradingViewProcessor
from .strategies.base_strategy import BaseStrategy
from .strategies.ict_strategy import ICTStrategy
from .strategies.mmxm_strategy import MMXMStrategy

__version__ = "1.0.0"
__author__ = "Trading Journal Team"

__all__ = [
    'BacktestEngine',
    'TradingViewProcessor', 
    'BaseStrategy',
    'ICTStrategy',
    'MMXMStrategy'
]
