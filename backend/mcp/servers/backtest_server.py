# File: backend/mcp/servers/backtest_server.py
# Purpose: MCP server for backtesting operations

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from mcp.server import Server
from mcp.types import Tool, TextContent
import json

from ...services.backtest_service import BacktestService
from ...models.backtest import BacktestStrategy, Backtest, StrategyType
from ...db.database import get_db

logger = logging.getLogger(__name__)

class BacktestMCPServer:
    """MCP Server for backtesting functionality"""
    
    def __init__(self):
        self.server = Server("backtest-server")
        self.setup_tools()
    
    def setup_tools(self):
        """Register MCP tools for backtesting"""
        
        # Tool: Create strategy from trades
        @self.server.call_tool()
        async def create_strategy_from_trades(arguments: dict) -> List[TextContent]:
            """Create a backtesting strategy based on actual trades"""
            try:
                db = next(get_db())
                service = BacktestService(db)
                
                strategy = await service.create_strategy_from_trades(
                    user_id=arguments['user_id'],
                    trade_ids=arguments['trade_ids'],
                    strategy_name=arguments['strategy_name'],
                    description=arguments.get('description')
                )
                
                return [TextContent(
                    type="text",
                    text=f"Successfully created strategy '{strategy.name}' with ID {strategy.id}"
                )]
                
            except Exception as e:
                logger.error(f"Error creating strategy: {str(e)}")
                return [TextContent(
                    type="text",
                    text=f"Error creating strategy: {str(e)}"
                )]
        
        # Tool: Run backtest
        @self.server.call_tool()
        async def run_backtest(arguments: dict) -> List[TextContent]:
            """Execute a backtest for a strategy"""
            try:
                db = next(get_db())
                service = BacktestService(db)
                
                backtest = await service.run_backtest(
                    strategy_id=arguments['strategy_id'],
                    user_id=arguments['user_id'],
                    backtest_config=arguments['config']
                )
                
                return [TextContent(
                    type="text",
                    text=f"Backtest started with ID {backtest.id}. Status: {backtest.status.value}"
                )]
                
            except Exception as e:
                logger.error(f"Error running backtest: {str(e)}")
                return [TextContent(
                    type="text",
                    text=f"Error running backtest: {str(e)}"
                )]
        
        # Tool: Get backtest results
        @self.server.call_tool()
        async def get_backtest_results(arguments: dict) -> List[TextContent]:
            """Get comprehensive backtest results"""
            try:
                db = next(get_db())
                service = BacktestService(db)
                
                results = await service.get_backtest_results(
                    backtest_id=arguments['backtest_id'],
                    user_id=arguments['user_id']
                )
                
                summary = {
                    'backtest_id': results['backtest'].id,
                    'strategy_name': results['backtest'].strategy.name,
                    'total_trades': results['summary_metrics']['total_trades'],
                    'win_rate': f"{results['summary_metrics']['win_rate']:.2%}",
                    'total_return': f"${results['summary_metrics']['total_return']:.2f}",
                    'total_return_percent': f"{results['summary_metrics']['total_return'] / results['backtest'].initial_capital * 100:.2f}%",
                    'max_drawdown': f"{results['summary_metrics']['max_drawdown']:.2%}",
                    'profit_factor': f"{results['summary_metrics']['profit_factor']:.2f}",
                    'sharpe_ratio': f"{results['summary_metrics']['sharpe_ratio']:.2f}"
                }
                
                return [TextContent(
                    type="text",
                    text=json.dumps(summary, indent=2)
                )]
                
            except Exception as e:
                logger.error(f"Error getting backtest results: {str(e)}")
                return [TextContent(
                    type="text",
                    text=f"Error getting backtest results: {str(e)}"
                )]
        
        # Tool: Analyze strategy performance
        @self.server.call_tool()
        async def analyze_strategy_performance(arguments: dict) -> List[TextContent]:
            """Analyze the performance of a backtesting strategy"""
            try:
                db = next(get_db())
                service = BacktestService(db)
                
                # Get all backtests for this strategy
                strategy_id = arguments['strategy_id']
                user_id = arguments['user_id']
                
                backtests = db.query(Backtest).filter(
                    Backtest.strategy_id == strategy_id,
                    Backtest.user_id == user_id,
                    Backtest.status == 'Completed'
                ).all()
                
                if not backtests:
                    return [TextContent(
                        type="text",
                        text="No completed backtests found for this strategy"
                    )]
                
                # Calculate aggregate performance
                analysis = {
                    'strategy_id': strategy_id,
                    'total_backtests': len(backtests),
                    'avg_win_rate': sum([bt.win_rate for bt in backtests]) / len(backtests),
                    'avg_return': sum([bt.total_return_percent for bt in backtests]) / len(backtests),
                    'avg_max_drawdown': sum([bt.max_drawdown_percent for bt in backtests]) / len(backtests),
                    'consistency_score': self._calculate_consistency_score(backtests),
                    'best_backtest': max(backtests, key=lambda x: x.total_return_percent),
                    'worst_backtest': min(backtests, key=lambda x: x.total_return_percent)
                }
                
                return [TextContent(
                    type="text",
                    text=json.dumps(analysis, indent=2, default=str)
                )]
                
            except Exception as e:
                logger.error(f"Error analyzing strategy: {str(e)}")
                return [TextContent(
                    type="text",
                    text=f"Error analyzing strategy: {str(e)}"
                )]
        
        # Tool: Compare strategies
        @self.server.call_tool()
        async def compare_strategies(arguments: dict) -> List[TextContent]:
            """Compare performance of multiple strategies"""
            try:
                db = next(get_db())
                strategy_ids = arguments['strategy_ids']
                user_id = arguments['user_id']
                
                comparisons = []
                
                for strategy_id in strategy_ids:
                    strategy = db.query(BacktestStrategy).filter(
                        BacktestStrategy.id == strategy_id,
                        BacktestStrategy.user_id == user_id
                    ).first()
                    
                    if not strategy:
                        continue
                    
                    backtests = db.query(Backtest).filter(
                        Backtest.strategy_id == strategy_id,
                        Backtest.status == 'Completed'
                    ).all()
                    
                    if backtests:
                        avg_return = sum([bt.total_return_percent for bt in backtests]) / len(backtests)
                        avg_win_rate = sum([bt.win_rate for bt in backtests]) / len(backtests)
                        avg_drawdown = sum([bt.max_drawdown_percent for bt in backtests]) / len(backtests)
                        
                        comparisons.append({
                            'strategy_id': strategy_id,
                            'strategy_name': strategy.name,
                            'strategy_type': strategy.strategy_type.value,
                            'total_backtests': len(backtests),
                            'avg_return_percent': avg_return,
                            'avg_win_rate': avg_win_rate,
                            'avg_max_drawdown': avg_drawdown,
                            'risk_adjusted_return': avg_return / max(avg_drawdown, 0.01)  # Simple Calmar ratio
                        })
                
                # Sort by risk-adjusted return
                comparisons.sort(key=lambda x: x['risk_adjusted_return'], reverse=True)
                
                return [TextContent(
                    type="text",
                    text=json.dumps(comparisons, indent=2)
                )]
                
            except Exception as e:
                logger.error(f"Error comparing strategies: {str(e)}")
                return [TextContent(
                    type="text",
                    text=f"Error comparing strategies: {str(e)}"
                )]
        
        # Tool: Get strategy recommendations
        @self.server.call_tool()
        async def get_strategy_recommendations(arguments: dict) -> List[TextContent]:
            """Get AI-powered recommendations for strategy improvement"""
            try:
                db = next(get_db())
                user_id = arguments['user_id']
                strategy_id = arguments.get('strategy_id')
                
                recommendations = []
                
                if strategy_id:
                    # Analyze specific strategy
                    strategy = db.query(BacktestStrategy).filter(
                        BacktestStrategy.id == strategy_id,
                        BacktestStrategy.user_id == user_id
                    ).first()
                    
                    if strategy:
                        recommendations.extend(self._analyze_strategy_for_recommendations(strategy, db))
                else:
                    # Analyze all user strategies
                    strategies = db.query(BacktestStrategy).filter(
                        BacktestStrategy.user_id == user_id
                    ).all()
                    
                    for strategy in strategies:
                        recommendations.extend(self._analyze_strategy_for_recommendations(strategy, db))
                
                return [TextContent(
                    type="text",
                    text=json.dumps(recommendations, indent=2, default=str)
                )]
                
            except Exception as e:
                logger.error(f"Error getting recommendations: {str(e)}")
                return [TextContent(
                    type="text",
                    text=f"Error getting recommendations: {str(e)}"
                )]
    
    def _calculate_consistency_score(self, backtests: List[Backtest]) -> float:
        """Calculate consistency score for a strategy"""
        if len(backtests) < 2:
            return 0.0
        
        returns = [bt.total_return_percent for bt in backtests]
        mean_return = sum(returns) / len(returns)
        variance = sum([(r - mean_return) ** 2 for r in returns]) / len(returns)
        std_dev = variance ** 0.5
        
        # Consistency score: higher is better (lower volatility relative to mean)
        if std_dev == 0:
            return 100.0
        
        coefficient_of_variation = abs(std_dev / mean_return) if mean_return != 0 else float('inf')
        consistency_score = max(0, 100 - (coefficient_of_variation * 10))
        
        return min(100, consistency_score)
    
    def _analyze_strategy_for_recommendations(self, strategy: BacktestStrategy, db) -> List[Dict[str, Any]]:
        """Analyze a strategy and provide improvement recommendations"""
        recommendations = []
        
        # Get backtests for this strategy
        backtests = db.query(Backtest).filter(
            Backtest.strategy_id == strategy.id,
            Backtest.status == 'Completed'
        ).all()
        
        if not backtests:
            recommendations.append({
                'strategy_id': strategy.id,
                'strategy_name': strategy.name,
                'type': 'warning',
                'recommendation': 'No completed backtests found. Run backtests to analyze performance.'
            })
            return recommendations
        
        avg_win_rate = sum([bt.win_rate for bt in backtests]) / len(backtests)
        avg_return = sum([bt.total_return_percent for bt in backtests]) / len(backtests)
        avg_drawdown = sum([bt.max_drawdown_percent for bt in backtests]) / len(backtests)
        
        # Win rate analysis
        if avg_win_rate < 0.4:
            recommendations.append({
                'strategy_id': strategy.id,
                'strategy_name': strategy.name,
                'type': 'improvement',
                'metric': 'win_rate',
                'current_value': avg_win_rate,
                'recommendation': 'Low win rate detected. Consider tightening entry conditions or improving setup quality.'
            })
        
        # Return analysis
        if avg_return < 5:
            recommendations.append({
                'strategy_id': strategy.id,
                'strategy_name': strategy.name,
                'type': 'improvement',
                'metric': 'returns',
                'current_value': avg_return,
                'recommendation': 'Low returns detected. Consider adjusting risk-reward ratios or position sizing.'
            })
        
        # Drawdown analysis
        if avg_drawdown > 15:
            recommendations.append({
                'strategy_id': strategy.id,
                'strategy_name': strategy.name,
                'type': 'warning',
                'metric': 'drawdown',
                'current_value': avg_drawdown,
                'recommendation': 'High drawdown detected. Consider implementing stricter risk management rules.'
            })
        
        # Positive feedback
        if avg_win_rate > 0.6 and avg_return > 15 and avg_drawdown < 10:
            recommendations.append({
                'strategy_id': strategy.id,
                'strategy_name': strategy.name,
                'type': 'success',
                'recommendation': 'Excellent strategy performance! Consider increasing position size or expanding to additional timeframes.'
            })
        
        return recommendations
    
    def get_tools(self) -> List[Tool]:
        """Return list of available MCP tools"""
        return [
            Tool(
                name="create_strategy_from_trades",
                description="Create a backtesting strategy based on actual trades",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "integer"},
                        "trade_ids": {"type": "array", "items": {"type": "integer"}},
                        "strategy_name": {"type": "string"},
                        "description": {"type": "string"}
                    },
                    "required": ["user_id", "trade_ids", "strategy_name"]
                }
            ),
            Tool(
                name="run_backtest",
                description="Execute a backtest for a strategy",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "strategy_id": {"type": "integer"},
                        "user_id": {"type": "integer"},
                        "config": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "symbol": {"type": "string"},
                                "start_date": {"type": "string"},
                                "end_date": {"type": "string"},
                                "initial_capital": {"type": "number"}
                            }
                        }
                    },
                    "required": ["strategy_id", "user_id", "config"]
                }
            ),
            Tool(
                name="get_backtest_results",
                description="Get comprehensive backtest results",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "backtest_id": {"type": "integer"},
                        "user_id": {"type": "integer"}
                    },
                    "required": ["backtest_id", "user_id"]
                }
            ),
            Tool(
                name="analyze_strategy_performance",
                description="Analyze the performance of a backtesting strategy",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "strategy_id": {"type": "integer"},
                        "user_id": {"type": "integer"}
                    },
                    "required": ["strategy_id", "user_id"]
                }
            ),
            Tool(
                name="compare_strategies",
                description="Compare performance of multiple strategies",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "strategy_ids": {"type": "array", "items": {"type": "integer"}},
                        "user_id": {"type": "integer"}
                    },
                    "required": ["strategy_ids", "user_id"]
                }
            ),
            Tool(
                name="get_strategy_recommendations",
                description="Get AI-powered recommendations for strategy improvement",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "integer"},
                        "strategy_id": {"type": "integer"}
                    },
                    "required": ["user_id"]
                }
            )
        ]

# Initialize the server
backtest_server = BacktestMCPServer()
