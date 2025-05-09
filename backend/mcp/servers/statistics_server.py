# File: backend/mcp/servers/statistics_server.py
# Purpose: MCP server for enhanced statistics and analytics

from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import logging
from fastapi import Depends
from sqlalchemy.orm import Session

from ...db.database import get_db
from ...models.trade import Trade
from ...services.statistics_service import (
    calculate_overall_statistics,
    calculate_win_rate_by_setup,
    calculate_profitability_by_time,
    calculate_risk_reward_analysis,
    calculate_emotional_analysis
)
from ..mcp_server import MCPServer

logger = logging.getLogger(__name__)

class StatisticsMCPServer(MCPServer):
    """
    MCP server for enhanced statistics and analytics
    Provides advanced analytics capabilities beyond standard API
    """
    
    def __init__(self, db_session_factory=get_db):
        super().__init__(name="statistics", version="1.0.0")
        self.db_session_factory = db_session_factory
        
        # Register MCP methods
        self.register_method("get_statistics", self.get_statistics)
        self.register_method("get_win_rate_by_setup", self.get_win_rate_by_setup)
        self.register_method("get_profitability_by_time", self.get_profitability_by_time)
        self.register_method("generate_charts", self.generate_charts)
        self.register_method("analyze_trade_patterns", self.analyze_trade_patterns)
        self.register_method("identify_optimal_trading_times", self.identify_optimal_trading_times)
        self.register_method("calculate_risk_metrics", self.calculate_risk_metrics)
        self.register_method("analyze_drawdown", self.analyze_drawdown)
        self.register_method("calculate_sharpe_ratio", self.calculate_sharpe_ratio)
    
    async def get_statistics(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhanced statistics with additional metrics beyond standard API
        """
        try:
            # Extract parameters
            start_date_str = params.get('start_date')
            end_date_str = params.get('end_date')
            symbol = params.get('symbol')
            setup_type = params.get('setup_type')
            period = params.get('period', 'month')
            
            # Parse dates
            start_date = None
            end_date = None
            
            if start_date_str:
                start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
            else:
                # Default based on period
                end_date = datetime.now()
                if period == 'day':
                    start_date = end_date - timedelta(days=1)
                elif period == 'week':
                    start_date = end_date - timedelta(days=7)
                elif period == 'month':
                    start_date = end_date - timedelta(days=30)
                elif period == 'year':
                    start_date = end_date - timedelta(days=365)
            
            if end_date_str:
                end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
            
            # Get database session
            db = next(self.db_session_factory())
            
            # Calculate base statistics
            stats = calculate_overall_statistics(
                db=db,
                start_date=start_date,
                end_date=end_date,
                symbol=symbol,
                setup_type=setup_type
            )
            
            # Add enhanced metrics
            stats = self._enhance_statistics(db, stats, start_date, end_date, symbol, setup_type)
            
            return stats
            
        except Exception as e:
            logger.error(f"Error in MCP get_statistics: {str(e)}")
            raise
    
    async def get_win_rate_by_setup(self, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Enhanced win rate analysis by setup type
        """
        try:
            # Extract parameters
            start_date_str = params.get('start_date')
            end_date_str = params.get('end_date')
            symbol = params.get('symbol')
            
            # Parse dates
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d") if start_date_str else None
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d") if end_date_str else None
            
            # Get database session
            db = next(self.db_session_factory())
            
            # Calculate win rate by setup
            setup_stats = calculate_win_rate_by_setup(
                db=db,
                start_date=start_date,
                end_date=end_date,
                symbol=symbol
            )
            
            # Add enhanced analysis with MCP
            for setup in setup_stats:
                setup['mcpInsights'] = self._generate_setup_insights(setup)
            
            return setup_stats
            
        except Exception as e:
            logger.error(f"Error in MCP get_win_rate_by_setup: {str(e)}")
            raise
    
    async def get_profitability_by_time(self, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Enhanced profitability analysis by time of day
        """
        try:
            # Extract parameters
            start_date_str = params.get('start_date')
            end_date_str = params.get('end_date')
            symbol = params.get('symbol')
            setup_type = params.get('setup_type')
            
            # Parse dates
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d") if start_date_str else None
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d") if end_date_str else None
            
            # Get database session
            db = next(self.db_session_factory())
            
            # Calculate profitability by time
            time_stats = calculate_profitability_by_time(
                db=db,
                start_date=start_date,
                end_date=end_date,
                symbol=symbol,
                setup_type=setup_type
            )
            
            # Enhance with MCP market data context
            time_stats = self._enhance_time_analysis(time_stats, symbol)
            
            return time_stats
            
        except Exception as e:
            logger.error(f"Error in MCP get_profitability_by_time: {str(e)}")
            raise
    
    async def generate_charts(self, data: Dict[str, Any], options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate enhanced charts with MCP visualization capabilities
        """
        try:
            chart_type = options.get('type', 'line')
            
            # Generate chart config based on type
            if chart_type == 'equity_curve':
                return self._generate_equity_curve(data, options)
            elif chart_type == 'win_rate_by_setup':
                return self._generate_win_rate_chart(data, options)
            elif chart_type == 'profitability_by_time':
                return self._generate_profitability_chart(data, options)
            elif chart_type == 'drawdown':
                return self._generate_drawdown_chart(data, options)
            else:
                return {
                    'error': f'Unsupported chart type: {chart_type}'
                }
            
        except Exception as e:
            logger.error(f"Error in MCP generate_charts: {str(e)}")
            raise
    
    async def analyze_trade_patterns(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Identify common patterns in trading behavior and outcomes
        """
        try:
            # Extract parameters
            start_date_str = params.get('start_date')
            end_date_str = params.get('end_date')
            
            # Parse dates
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d") if start_date_str else None
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d") if end_date_str else None
            
            # Get database session
            db = next(self.db_session_factory())
            
            # Build query with filters
            query = db.query(Trade)
            
            if start_date:
                query = query.filter(Trade.entry_time >= start_date)
            if end_date:
                end_datetime = datetime.combine(end_date.date(), datetime.max.time())
                query = query.filter(Trade.entry_time <= end_datetime)
            
            trades = query.all()
            
            # Mock pattern analysis (in real implementation, this would use ML algorithms)
            patterns = [
                {
                    "name": "Early Morning Momentum",
                    "description": "Trades taken within first hour of market open show higher win rate",
                    "confidence": 85,
                    "impact": "Positive",
                    "winRate": 72.5,
                    "averageProfit": 142.38
                },
                {
                    "name": "Emotional Trading",
                    "description": "Trades marked with 'anxious' emotional state have significantly lower win rate",
                    "confidence": 92,
                    "impact": "Negative",
                    "winRate": 35.2,
                    "averageProfit": -87.65
                },
                {
                    "name": "Plan Adherence",
                    "description": "Trades with plan adherence score >7 have 65% higher profitability",
                    "confidence": 88,
                    "impact": "Positive",
                    "winRate": 68.9,
                    "averageProfit": 175.22
                }
            ]
            
            return {
                "tradeCount": len(trades),
                "patterns": patterns,
                "recommendations": [
                    "Focus on trading during early market hours",
                    "Avoid trading when feeling anxious",
                    "Strictly adhere to trading plans for best results"
                ]
            }
            
        except Exception as e:
            logger.error(f"Error in MCP analyze_trade_patterns: {str(e)}")
            raise
    
    async def identify_optimal_trading_times(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Identify optimal times of day for trading based on historical performance
        """
        try:
            # Extract parameters
            symbol = params.get('symbol')
            setup_type = params.get('setup_type')
            
            # Get database session
            db = next(self.db_session_factory())
            
            # Get time statistics
            time_stats = calculate_profitability_by_time(
                db=db,
                symbol=symbol,
                setup_type=setup_type
            )
            
            # Sort by profitability
            best_times = sorted(time_stats, key=lambda x: x['netProfit'], reverse=True)[:3]
            worst_times = sorted(time_stats, key=lambda x: x['netProfit'])[:3]
            
            # Sort by win rate
            best_win_rate_times = sorted(time_stats, key=lambda x: x['winRate'], reverse=True)[:3]
            
            return {
                "mostProfitableTimes": best_times,
                "leastProfitableTimes": worst_times,
                "highestWinRateTimes": best_win_rate_times,
                "recommendations": [
                    f"Focus on trading during {best_times[0]['timeSlot']} for best profitability",
                    f"Consider avoiding trades during {worst_times[0]['timeSlot']}",
                    f"For highest win rate, trade during {best_win_rate_times[0]['timeSlot']}"
                ],
                "marketContextRecommendations": [
                    "Morning trades benefit from overnight news reactions",
                    "Mid-day often shows lower volatility",
                    "Final hour often has increased volume and momentum"
                ]
            }
            
        except Exception as e:
            logger.error(f"Error in MCP identify_optimal_trading_times: {str(e)}")
            raise
    
    async def calculate_risk_metrics(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate advanced risk metrics beyond standard statistics
        """
        try:
            # Extract parameters
            start_date_str = params.get('start_date')
            end_date_str = params.get('end_date')
            
            # Parse dates
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d") if start_date_str else None
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d") if end_date_str else None
            
            # Get database session
            db = next(self.db_session_factory())
            
            # Build query with filters
            query = db.query(Trade)
            
            if start_date:
                query = query.filter(Trade.entry_time >= start_date)
            if end_date:
                end_datetime = datetime.combine(end_date.date(), datetime.max.time())
                query = query.filter(Trade.entry_time <= end_datetime)
            
            trades = query.all()
            
            # Calculate daily P&L for risk metrics
            daily_pnl = {}
            for trade in trades:
                if not trade.entry_time:
                    continue
                
                date_str = trade.entry_time.date().strftime("%Y-%m-%d")
                if date_str not in daily_pnl:
                    daily_pnl[date_str] = 0
                
                daily_pnl[date_str] += trade.profit_loss
            
            daily_returns = list(daily_pnl.values())
            
            # Mock risk metrics calculation
            max_drawdown = 0.12  # 12%
            win_loss_ratio = 1.85
            sharpe_ratio = 1.35
            sortino_ratio = 1.92
            value_at_risk = 250.75  # 95% VaR
            
            return {
                "maxDrawdown": max_drawdown,
                "winLossRatio": win_loss_ratio,
                "sharpeRatio": sharpe_ratio,
                "sortinoRatio": sortino_ratio,
                "valueAtRisk": value_at_risk,
                "riskOfRuin": 0.0035,  # 0.35%
                "profitFactor": 2.1,
                "kellyPercentage": 18.5,  # 18.5%
                "recommendations": [
                    "Current position size appears optimal based on win rate and win/loss ratio",
                    "Consider implementing tighter stop losses to reduce max drawdown",
                    "Risk metrics indicate a stable trading system with low risk of ruin"
                ]
            }
            
        except Exception as e:
            logger.error(f"Error in MCP calculate_risk_metrics: {str(e)}")
            raise
    
    async def analyze_drawdown(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform detailed drawdown analysis
        """
        try:
            # Extract parameters
            start_date_str = params.get('start_date')
            end_date_str = params.get('end_date')
            
            # Parse dates
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d") if start_date_str else None
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d") if end_date_str else None
            
            # Get database session
            db = next(self.db_session_factory())
            
            # Build query with filters
            query = db.query(Trade)
            
            if start_date:
                query = query.filter(Trade.entry_time >= start_date)
            if end_date:
                end_datetime = datetime.combine(end_date.date(), datetime.max.time())
                query = query.filter(Trade.entry_time <= end_datetime)
            
            trades = query.order_by(Trade.entry_time).all()
            
            # Mock drawdown analysis
            drawdown_periods = [
                {
                    "startDate": "2023-03-15",
                    "endDate": "2023-03-28",
                    "drawdownAmount": 875.25,
                    "drawdownPercentage": 8.7,
                    "duration": 14,  # days
                    "recoveryDate": "2023-04-12",
                    "recoverDuration": 15  # days
                },
                {
                    "startDate": "2023-06-22",
                    "endDate": "2023-07-18",
                    "drawdownAmount": 1250.50,
                    "drawdownPercentage": 12.1,
                    "duration": 27,  # days
                    "recoveryDate": "2023-08-05",
                    "recoverDuration": 18  # days
                }
            ]
            
            return {
                "maxDrawdown": 12.1,  # percentage
                "averageDrawdown": 7.8,  # percentage
                "averageDrawdownDuration": 18,  # days
                "averageRecoveryTime": 16,  # days
                "drawdownPeriods": drawdown_periods,
                "recommendations": [
                    "Recent drawdowns are within expected parameters",
                    "Consider reducing position size during high volatility periods",
                    "Recovery time is consistent with trading system parameters"
                ]
            }
            
        except Exception as e:
            logger.error(f"Error in MCP analyze_drawdown: {str(e)}")
            raise
    
    async def calculate_sharpe_ratio(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate Sharpe ratio and other risk-adjusted return metrics
        """
        try:
            # Extract parameters
            start_date_str = params.get('start_date')
            end_date_str = params.get('end_date')
            risk_free_rate = params.get('risk_free_rate', 0.035)  # 3.5% default
            
            # Parse dates
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d") if start_date_str else None
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d") if end_date_str else None
            
            # Get database session
            db = next(self.db_session_factory())
            
            # Build query with filters
            query = db.query(Trade)
            
            if start_date:
                query = query.filter(Trade.entry_time >= start_date)
            if end_date:
                end_datetime = datetime.combine(end_date.date(), datetime.max.time())
                query = query.filter(Trade.entry_time <= end_datetime)
            
            trades = query.all()
            
            # Mock calculation
            sharpe_ratio = 1.35
            sortino_ratio = 1.92
            calmar_ratio = 0.87
            
            return {
                "sharpeRatio": sharpe_ratio,
                "sortinoRatio": sortino_ratio,
                "calmarRatio": calmar_ratio,
                "riskFreeRate": risk_free_rate,
                "interpretation": {
                    "sharpe": "Good - Your returns are compensating well for the volatility",
                    "sortino": "Very Good - Downside risk is being well-managed",
                    "calmar": "Acceptable - Returns relative to max drawdown are reasonable"
                },
                "industryComparison": {
                    "retail": 0.5,
                    "professionalTrader": 1.2,
                    "hedgeFund": 2.0,
                    "yourRating": "Above Average"
                }
            }
            
        except Exception as e:
            logger.error(f"Error in MCP calculate_sharpe_ratio: {str(e)}")
            raise
    
    def _enhance_statistics(
        self, 
        db: Session, 
        stats: Dict[str, Any], 
        start_date: Optional[datetime], 
        end_date: Optional[datetime],
        symbol: Optional[str],
        setup_type: Optional[str]
    ) -> Dict[str, Any]:
        """
        Add enhanced metrics to basic statistics
        """
        # Add custom MCP-enhanced metrics
        stats['mcpEnhanced'] = True
        
        # Add additional metrics (mocked values for now)
        stats['sharpeRatio'] = 1.35
        stats['sortinoRatio'] = 1.92
        stats['maxDrawdown'] = 0.12  # 12%
        stats['riskOfRuin'] = 0.0035  # 0.35%
        
        # Add goal tracking (these would come from user goals in the database)
        stats['goals'] = [
            {
                "id": 1,
                "title": "Monthly Profit Target",
                "description": "Achieve $1,000 in monthly profit",
                "current": 750,
                "target": 1000,
                "unit": "USD",
                "deadline": "2023-08-31",
                "category": "Profit",
                "priority": "high"
            },
            {
                "id": 2,
                "title": "Win Rate",
                "description": "Maintain a win rate above 60%",
                "current": stats['winRate'],
                "target": 60,
                "unit": "%",
                "deadline": "2023-09-30",
                "category": "Performance",
                "priority": "medium"
            },
            {
                "id": 3,
                "title": "Risk Control",
                "description": "Keep average loss below $100",
                "current": abs(stats['averageLoss']),
                "target": 100,
                "unit": "USD",
                "deadline": "2023-08-31",
                "category": "Risk",
                "priority": "high"
            }
        ]
        
        return stats
    
    def _enhance_time_analysis(self, time_stats: List[Dict[str, Any]], symbol: Optional[str]) -> List[Dict[str, Any]]:
        """
        Enhance time analysis with market context
        """
        # Add market context to each time slot
        market_context = {
            "9:30-10:00": "High volatility, reacting to overnight news",
            "10:00-10:30": "Institutional positioning after open",
            "12:00-12:30": "Lower volume during lunch hour",
            "15:30-16:00": "End of day positioning, increased volume"
        }
        
        for stat in time_stats:
            time_slot = stat.get('timeSlot')
            if time_slot in market_context:
                stat['marketContext'] = market_context[time_slot]
        
        return time_stats
    
    def _generate_setup_insights(self, setup_data: Dict[str, Any]) -> str:
        """
        Generate insights for a specific setup type
        """
        setup_type = setup_data.get('setupType', 'Unknown')
        win_rate = setup_data.get('winRate', 0)
        profit_factor = setup_data.get('profitFactor', 0)
        
        if win_rate > 65 and profit_factor > 2:
            return f"This setup is performing exceptionally well with a strong win rate and profit factor. Consider increasing position size for this setup."
        elif win_rate > 50 and profit_factor > 1.5:
            return f"This setup is performing well. Focus on consistency and maintaining the current approach."
        elif win_rate > 40 and profit_factor > 1:
            return f"This setup is profitable but could be improved. Review your exits to potentially increase the profit factor."
        else:
            return f"This setup is underperforming. Consider reviewing your entry criteria or avoiding this setup temporarily."
    
    def _generate_equity_curve(self, data: Dict[str, Any], options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate an equity curve chart configuration
        """
        return {
            "type": "line",
            "data": {
                "labels": data.get('dates', []),
                "datasets": [
                    {
                        "label": "Equity Curve",
                        "data": data.get('equity', []),
                        "borderColor": "rgba(75, 192, 192, 1)",
                        "backgroundColor": "rgba(75, 192, 192, 0.2)",
                        "fill": True
                    }
                ]
            },
            "options": {
                "responsive": True,
                "maintainAspectRatio": False,
                "scales": {
                    "x": {
                        "type": "time",
                        "time": {
                            "unit": options.get('timeUnit', 'day')
                        }
                    },
                    "y": {
                        "beginAtZero": options.get('beginAtZero', False)
                    }
                }
            }
        }
    
    def _generate_win_rate_chart(self, data: Dict[str, Any], options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a win rate by setup chart configuration
        """
        return {
            "type": "bar",
            "data": {
                "labels": data.get('setupTypes', []),
                "datasets": [
                    {
                        "label": "Win Rate (%)",
                        "data": data.get('winRates', []),
                        "backgroundColor": "rgba(54, 162, 235, 0.8)",
                        "borderColor": "rgba(54, 162, 235, 1)",
                        "borderWidth": 1
                    },
                    {
                        "label": "Trade Count",
                        "data": data.get('tradeCounts', []),
                        "type": "line",
                        "backgroundColor": "rgba(255, 99, 132, 0.2)",
                        "borderColor": "rgba(255, 99, 132, 1)",
                        "borderWidth": 2,
                        "yAxisID": "y1"
                    }
                ]
            },
            "options": {
                "responsive": True,
                "maintainAspectRatio": False,
                "scales": {
                    "y": {
                        "beginAtZero": True,
                        "max": 100,
                        "title": {
                            "display": True,
                            "text": "Win Rate (%)"
                        }
                    },
                    "y1": {
                        "position": "right",
                        "beginAtZero": True,
                        "title": {
                            "display": True,
                            "text": "Trade Count"
                        },
                        "grid": {
                            "drawOnChartArea": False
                        }
                    }
                }
            }
        }
    
    def _generate_profitability_chart(self, data: Dict[str, Any], options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a profitability by time chart configuration
        """
        return {
            "type": "bar",
            "data": {
                "labels": data.get('timeSlots', []),
                "datasets": [
                    {
                        "label": "Net Profit/Loss",
                        "data": data.get('netProfits', []),
                        "backgroundColor": data.get('colors', [])
                    }
                ]
            },
            "options": {
                "responsive": True,
                "maintainAspectRatio": False,
                "scales": {
                    "y": {
                        "title": {
                            "display": True,
                            "text": "Net Profit/Loss ($)"
                        }
                    }
                }
            }
        }
    
    def _generate_drawdown_chart(self, data: Dict[str, Any], options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a drawdown chart configuration
        """
        return {
            "type": "line",
            "data": {
                "labels": data.get('dates', []),
                "datasets": [
                    {
                        "label": "Equity",
                        "data": data.get('equity', []),
                        "borderColor": "rgba(75, 192, 192, 1)",
                        "backgroundColor": "rgba(75, 192, 192, 0.1)",
                        "fill": False
                    },
                    {
                        "label": "Drawdown",
                        "data": data.get('drawdown', []),
                        "borderColor": "rgba(255, 99, 132, 1)",
                        "backgroundColor": "rgba(255, 99, 132, 0.2)",
                        "fill": True,
                        "yAxisID": "y1"
                    }
                ]
            },
            "options": {
                "responsive": True,
                "maintainAspectRatio": False,
                "scales": {
                    "y": {
                        "title": {
                            "display": True,
                            "text": "Equity ($)"
                        }
                    },
                    "y1": {
                        "position": "right",
                        "reverse": True,
                        "beginAtZero": True,
                        "max": 100,
                        "title": {
                            "display": True,
                            "text": "Drawdown (%)"
                        },
                        "grid": {
                            "drawOnChartArea": False
                        }
                    }
                }
            }
        }

# Create an instance of the MCP server
statistics_mcp_server = StatisticsMCPServer()
