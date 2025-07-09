# File: backend/services/backtest_service.py
# Purpose: Service for managing backtesting operations

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc

from ..models.backtest import (
    BacktestStrategy, 
    Backtest, 
    BacktestTrade, 
    BacktestComparison,
    BacktestStatus,
    StrategyType
)
from ..models.trade import Trade
from ..models.user import User
from ..db.database import get_db
# Temporarily disabled - StatisticsService class doesn't exist
# from .statistics_service import StatisticsService
from ..mcp.servers.market_data_server import MarketDataServer

logger = logging.getLogger(__name__)

class BacktestService:
    """Service for backtesting trading strategies"""
    
    def __init__(self, db: Session):
        self.db = db
        # Temporarily disabled - StatisticsService class doesn't exist
        # self.stats_service = StatisticsService(db)
        self.market_data_server = MarketDataServer()
    
    async def create_strategy_from_trades(
        self, 
        user_id: int, 
        trade_ids: List[int],
        strategy_name: str,
        description: str = None
    ) -> BacktestStrategy:
        """Create a backtesting strategy based on user's actual trades"""
        
        # Fetch the actual trades
        trades = self.db.query(Trade).filter(
            and_(Trade.user_id == user_id, Trade.id.in_(trade_ids))
        ).all()
        
        if not trades:
            raise ValueError("No trades found for the given IDs")
        
        # Analyze trades to extract strategy patterns
        strategy_analysis = self._analyze_trades_for_strategy(trades)
        
        # Create strategy
        strategy = BacktestStrategy(
            user_id=user_id,
            name=strategy_name,
            description=description or f"Strategy based on {len(trades)} actual trades",
            strategy_type=self._determine_strategy_type(trades),
            entry_conditions=strategy_analysis['entry_conditions'],
            exit_conditions=strategy_analysis['exit_conditions'],
            risk_management=strategy_analysis['risk_management'],
            filters=strategy_analysis['filters'],
            setup_types=strategy_analysis['setup_types'],
            timeframes=strategy_analysis['timeframes'],
            created_from_trades=True
        )
        
        self.db.add(strategy)
        self.db.commit()
        self.db.refresh(strategy)
        
        logger.info(f"Created strategy {strategy.name} from {len(trades)} trades")
        return strategy
    
    async def create_custom_strategy(
        self,
        user_id: int,
        strategy_data: Dict[str, Any]
    ) -> BacktestStrategy:
        """Create a custom backtesting strategy"""
        
        strategy = BacktestStrategy(
            user_id=user_id,
            name=strategy_data['name'],
            description=strategy_data.get('description'),
            strategy_type=StrategyType(strategy_data['strategy_type']),
            entry_conditions=strategy_data['entry_conditions'],
            exit_conditions=strategy_data['exit_conditions'],
            risk_management=strategy_data['risk_management'],
            filters=strategy_data.get('filters', {}),
            setup_types=strategy_data.get('setup_types', []),
            timeframes=strategy_data.get('timeframes', ['5m', '15m']),
            created_from_trades=False
        )
        
        self.db.add(strategy)
        self.db.commit()
        self.db.refresh(strategy)
        
        return strategy
    
    async def run_backtest(
        self,
        strategy_id: int,
        user_id: int,
        backtest_config: Dict[str, Any]
    ) -> Backtest:
        """Execute a backtest for a given strategy"""
        
        # Get the strategy
        strategy = self.db.query(BacktestStrategy).filter(
            and_(BacktestStrategy.id == strategy_id, BacktestStrategy.user_id == user_id)
        ).first()
        
        if not strategy:
            raise ValueError("Strategy not found")
        
        # Create backtest record
        backtest = Backtest(
            user_id=user_id,
            strategy_id=strategy_id,
            name=backtest_config.get('name', f"Backtest {strategy.name}"),
            symbol=backtest_config.get('symbol', 'NQ'),
            start_date=backtest_config['start_date'],
            end_date=backtest_config['end_date'],
            initial_capital=backtest_config.get('initial_capital', 10000.0),
            status=BacktestStatus.RUNNING
        )
        
        self.db.add(backtest)
        self.db.commit()
        self.db.refresh(backtest)
        
        try:
            # Run the backtest in the background
            await self._execute_backtest(backtest, strategy)
            
            # Calculate final metrics
            await self._calculate_backtest_metrics(backtest)
            
            # Update status
            backtest.status = BacktestStatus.COMPLETED
            backtest.completed_at = datetime.utcnow()
            
        except Exception as e:
            logger.error(f"Backtest {backtest.id} failed: {str(e)}")
            backtest.status = BacktestStatus.FAILED
            backtest.error_message = str(e)
        
        self.db.commit()
        return backtest
    
    async def _execute_backtest(self, backtest: Backtest, strategy: BacktestStrategy):
        """Execute the core backtesting logic"""
        
        # Get historical data
        historical_data = await self.market_data_server.get_historical_data(
            symbol=backtest.symbol,
            start_date=backtest.start_date,
            end_date=backtest.end_date,
            timeframe='1m'  # Use 1-minute data for precision
        )
        
        if not historical_data:
            raise ValueError("No historical data available for the specified period")
        
        # Initialize backtesting state
        current_capital = backtest.initial_capital
        current_position = None
        trades = []
        equity_curve = []
        
        total_bars = len(historical_data)
        processed_bars = 0
        
        # Process each bar
        for i, bar in enumerate(historical_data):
            processed_bars += 1
            
            # Update progress
            progress = (processed_bars / total_bars) * 100
            backtest.progress_percent = progress
            
            if i % 1000 == 0:  # Commit progress every 1000 bars
                self.db.commit()
            
            # Check for entry signals if no position
            if current_position is None:
                entry_signal = self._check_entry_conditions(
                    strategy, 
                    historical_data, 
                    i
                )
                
                if entry_signal:
                    current_position = {
                        'entry_time': bar['timestamp'],
                        'entry_price': entry_signal['price'],
                        'direction': entry_signal['direction'],
                        'setup_type': entry_signal['setup_type'],
                        'position_size': self._calculate_position_size(
                            strategy, current_capital, entry_signal
                        ),
                        'stop_loss': entry_signal.get('stop_loss'),
                        'take_profit': entry_signal.get('take_profit')
                    }
            
            # Check for exit signals if in position
            elif current_position:
                exit_signal = self._check_exit_conditions(
                    strategy,
                    historical_data,
                    i,
                    current_position
                )
                
                if exit_signal:
                    # Close the trade
                    trade_result = self._close_trade(
                        current_position,
                        exit_signal,
                        bar['timestamp']
                    )
                    
                    # Update capital
                    current_capital += trade_result['profit_loss']
                    
                    # Record the trade
                    backtest_trade = BacktestTrade(
                        backtest_id=backtest.id,
                        user_id=backtest.user_id,
                        symbol=backtest.symbol,
                        setup_type=current_position['setup_type'],
                        entry_price=current_position['entry_price'],
                        exit_price=exit_signal['price'],
                        position_size=current_position['position_size'],
                        entry_time=current_position['entry_time'],
                        exit_time=bar['timestamp'],
                        outcome=trade_result['outcome'],
                        profit_loss=trade_result['profit_loss'],
                        profit_loss_percent=trade_result['profit_loss_percent'],
                        risk_reward_ratio=trade_result['risk_reward_ratio'],
                        entry_reason=exit_signal['reason'],
                        exit_reason=exit_signal['reason'],
                        market_condition=bar.get('market_condition', 'Unknown'),
                        trade_direction=current_position['direction'],
                        timeframe=strategy.timeframes[0] if strategy.timeframes else '5m'
                    )
                    
                    trades.append(backtest_trade)
                    current_position = None
            
            # Record equity curve point
            equity_curve.append({
                'timestamp': bar['timestamp'],
                'equity': current_capital,
                'drawdown': max(0, max([e['equity'] for e in equity_curve] + [current_capital]) - current_capital)
            })
        
        # Save all trades
        self.db.add_all(trades)
        
        # Update backtest with equity curve
        backtest.equity_curve = equity_curve
        backtest.total_trades = len(trades)
        
        self.db.commit()
    
    def _analyze_trades_for_strategy(self, trades: List[Trade]) -> Dict[str, Any]:
        """Analyze actual trades to extract strategy patterns"""
        
        # Extract common patterns
        setup_types = list(set([t.setup_type for t in trades if t.setup_type]))
        timeframes = list(set([t.trade_timeframe for t in trades if t.trade_timeframe]))
        
        # Analyze winning trades for entry patterns
        winning_trades = [t for t in trades if t.outcome.value == 'Win']
        losing_trades = [t for t in trades if t.outcome.value == 'Loss']
        
        # Entry conditions based on successful patterns
        entry_conditions = {
            'setup_types': setup_types,
            'min_risk_reward': min([t.planned_risk_reward for t in winning_trades if t.planned_risk_reward]) if winning_trades else 1.0,
            'preferred_market_conditions': self._extract_market_conditions(winning_trades),
            'time_filters': self._extract_time_patterns(winning_trades)
        }
        
        # Exit conditions
        exit_conditions = {
            'take_profit_ratio': self._calculate_avg_profit_ratio(winning_trades),
            'stop_loss_ratio': self._calculate_avg_loss_ratio(losing_trades),
            'max_hold_time': self._calculate_max_hold_time(trades)
        }
        
        # Risk management
        risk_management = {
            'max_risk_per_trade': 0.02,  # 2% default
            'position_sizing': 'fixed_percent',
            'max_concurrent_trades': 1
        }
        
        # Filters
        filters = {
            'avoid_news_times': True,
            'market_session': 'regular_hours'
        }
        
        return {
            'entry_conditions': entry_conditions,
            'exit_conditions': exit_conditions,
            'risk_management': risk_management,
            'filters': filters,
            'setup_types': setup_types,
            'timeframes': timeframes
        }
    
    def _check_entry_conditions(
        self, 
        strategy: BacktestStrategy, 
        data: List[Dict], 
        current_index: int
    ) -> Optional[Dict[str, Any]]:
        """Check if entry conditions are met at current bar"""
        
        if current_index < 20:  # Need some history
            return None
        
        current_bar = data[current_index]
        entry_conditions = strategy.entry_conditions
        
        # Simple implementation - in practice, this would be much more sophisticated
        # based on the specific setup types and technical indicators
        
        # Example: Look for a specific pattern based on setup type
        if strategy.strategy_type == StrategyType.ICT_ORDER_BLOCK:
            return self._check_order_block_entry(data, current_index)
        elif strategy.strategy_type == StrategyType.MMXM_SUPPLY_DEMAND:
            return self._check_supply_demand_entry(data, current_index)
        
        return None
    
    def _check_exit_conditions(
        self,
        strategy: BacktestStrategy,
        data: List[Dict],
        current_index: int,
        position: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Check if exit conditions are met"""
        
        current_bar = data[current_index]
        current_price = current_bar['close']
        
        # Time-based exit
        entry_time = position['entry_time']
        current_time = current_bar['timestamp']
        hold_time = (current_time - entry_time).total_seconds() / 3600  # hours
        
        max_hold_time = strategy.exit_conditions.get('max_hold_time', 24)  # 24 hours default
        
        if hold_time > max_hold_time:
            return {
                'price': current_price,
                'reason': 'Time-based exit',
                'type': 'time_exit'
            }
        
        # Stop loss
        if position['stop_loss']:
            if position['direction'] == 'long' and current_price <= position['stop_loss']:
                return {
                    'price': position['stop_loss'],
                    'reason': 'Stop loss hit',
                    'type': 'stop_loss'
                }
            elif position['direction'] == 'short' and current_price >= position['stop_loss']:
                return {
                    'price': position['stop_loss'],
                    'reason': 'Stop loss hit',
                    'type': 'stop_loss'
                }
        
        # Take profit
        if position['take_profit']:
            if position['direction'] == 'long' and current_price >= position['take_profit']:
                return {
                    'price': position['take_profit'],
                    'reason': 'Take profit hit',
                    'type': 'take_profit'
                }
            elif position['direction'] == 'short' and current_price <= position['take_profit']:
                return {
                    'price': position['take_profit'],
                    'reason': 'Take profit hit',
                    'type': 'take_profit'
                }
        
        return None
    
    def _check_order_block_entry(self, data: List[Dict], current_index: int) -> Optional[Dict[str, Any]]:
        """Check for ICT Order Block entry pattern"""
        # Simplified implementation - real implementation would be much more sophisticated
        current_bar = data[current_index]
        
        # Look for a basic reversal pattern
        if current_index >= 5:
            recent_bars = data[current_index-5:current_index+1]
            lows = [bar['low'] for bar in recent_bars]
            highs = [bar['high'] for bar in recent_bars]
            
            # Simple bullish order block detection
            if current_bar['close'] > current_bar['open'] and min(lows) == lows[-2]:
                return {
                    'price': current_bar['close'],
                    'direction': 'long',
                    'setup_type': 'ICT Order Block',
                    'stop_loss': min(lows) * 0.999,
                    'take_profit': current_bar['close'] * 1.01
                }
        
        return None
    
    def _check_supply_demand_entry(self, data: List[Dict], current_index: int) -> Optional[Dict[str, Any]]:
        """Check for MMXM Supply/Demand entry pattern"""
        # Simplified implementation
        current_bar = data[current_index]
        
        if current_index >= 10:
            # Look for demand zone bounce
            recent_bars = data[current_index-10:current_index+1]
            lows = [bar['low'] for bar in recent_bars]
            
            # Find potential demand zone
            demand_level = min(lows)
            
            if current_bar['low'] <= demand_level * 1.001 and current_bar['close'] > current_bar['open']:
                return {
                    'price': current_bar['close'],
                    'direction': 'long',
                    'setup_type': 'MMXM Demand Zone',
                    'stop_loss': demand_level * 0.998,
                    'take_profit': current_bar['close'] * 1.015
                }
        
        return None
    
    # Additional helper methods would be implemented here...
    
    async def get_backtest_results(self, backtest_id: int, user_id: int) -> Dict[str, Any]:
        """Get comprehensive backtest results"""
        
        backtest = self.db.query(Backtest).filter(
            and_(Backtest.id == backtest_id, Backtest.user_id == user_id)
        ).first()
        
        if not backtest:
            raise ValueError("Backtest not found")
        
        # Get all trades
        trades = self.db.query(BacktestTrade).filter(
            BacktestTrade.backtest_id == backtest_id
        ).all()
        
        return {
            'backtest': backtest,
            'trades': trades,
            'summary_metrics': {
                'total_trades': backtest.total_trades,
                'win_rate': backtest.win_rate,
                'total_return': backtest.total_return,
                'max_drawdown': backtest.max_drawdown,
                'profit_factor': backtest.profit_factor,
                'sharpe_ratio': backtest.sharpe_ratio
            },
            'equity_curve': backtest.equity_curve,
            'monthly_returns': backtest.monthly_returns,
            'trade_distribution': backtest.trade_distribution
        }
    
    # More helper methods would be implemented here for calculations...
