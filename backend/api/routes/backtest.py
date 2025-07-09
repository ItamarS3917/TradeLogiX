# File: backend/api/routes/backtest.py
# Purpose: API routes for backtesting functionality

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from ...db.database import get_db
from ...services.backtest_service import BacktestService
from ...models.backtest import BacktestStrategy, Backtest, BacktestStatus, StrategyType
from ...models.user import User
from ..dependencies import get_current_user
from ..schemas.backtest import (
    BacktestStrategyCreate,
    BacktestStrategyResponse,
    BacktestCreate,
    BacktestResponse,
    BacktestResultsResponse,
    StrategyFromTradesCreate,
    BacktestComparisonResponse
)

router = APIRouter(prefix="/backtest", tags=["backtest"])

@router.post("/strategies/from-trades", response_model=BacktestStrategyResponse)
async def create_strategy_from_trades(
    strategy_data: StrategyFromTradesCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a backtesting strategy based on actual trades"""
    
    try:
        service = BacktestService(db)
        strategy = await service.create_strategy_from_trades(
            user_id=current_user.id,
            trade_ids=strategy_data.trade_ids,
            strategy_name=strategy_data.strategy_name,
            description=strategy_data.description
        )
        return strategy
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/strategies", response_model=BacktestStrategyResponse)
async def create_custom_strategy(
    strategy_data: BacktestStrategyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a custom backtesting strategy"""
    
    try:
        service = BacktestService(db)
        strategy = await service.create_custom_strategy(
            user_id=current_user.id,
            strategy_data=strategy_data.dict()
        )
        return strategy
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/strategies", response_model=List[BacktestStrategyResponse])
async def get_user_strategies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all strategies for the current user"""
    
    strategies = db.query(BacktestStrategy).filter(
        BacktestStrategy.user_id == current_user.id
    ).all()
    
    return strategies

@router.get("/strategies/{strategy_id}", response_model=BacktestStrategyResponse)
async def get_strategy(
    strategy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific strategy"""
    
    strategy = db.query(BacktestStrategy).filter(
        BacktestStrategy.id == strategy_id,
        BacktestStrategy.user_id == current_user.id
    ).first()
    
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Strategy not found"
        )
    
    return strategy

@router.post("/strategies/{strategy_id}/backtest", response_model=BacktestResponse)
async def run_backtest(
    strategy_id: int,
    backtest_data: BacktestCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start a backtest for a strategy"""
    
    # Verify strategy exists and belongs to user
    strategy = db.query(BacktestStrategy).filter(
        BacktestStrategy.id == strategy_id,
        BacktestStrategy.user_id == current_user.id
    ).first()
    
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Strategy not found"
        )
    
    try:
        service = BacktestService(db)
        
        # Create backtest config
        config = {
            'name': backtest_data.name,
            'symbol': backtest_data.symbol,
            'start_date': backtest_data.start_date,
            'end_date': backtest_data.end_date,
            'initial_capital': backtest_data.initial_capital
        }
        
        # Run backtest in background
        background_tasks.add_task(
            service.run_backtest,
            strategy_id,
            current_user.id,
            config
        )
        
        # Return immediate response
        return {
            'id': 0,  # Will be assigned by the background task
            'status': BacktestStatus.PENDING,
            'message': 'Backtest started. Check status for progress.'
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/backtests", response_model=List[BacktestResponse])
async def get_user_backtests(
    strategy_id: Optional[int] = None,
    status: Optional[BacktestStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all backtests for the current user"""
    
    query = db.query(Backtest).filter(Backtest.user_id == current_user.id)
    
    if strategy_id:
        query = query.filter(Backtest.strategy_id == strategy_id)
    
    if status:
        query = query.filter(Backtest.status == status)
    
    backtests = query.order_by(Backtest.created_at.desc()).all()
    return backtests

@router.get("/backtests/{backtest_id}", response_model=BacktestResponse)
async def get_backtest(
    backtest_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific backtest"""
    
    backtest = db.query(Backtest).filter(
        Backtest.id == backtest_id,
        Backtest.user_id == current_user.id
    ).first()
    
    if not backtest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Backtest not found"
        )
    
    return backtest

@router.get("/backtests/{backtest_id}/results", response_model=BacktestResultsResponse)
async def get_backtest_results(
    backtest_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed backtest results"""
    
    try:
        service = BacktestService(db)
        results = await service.get_backtest_results(backtest_id, current_user.id)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/backtests/{backtest_id}/stop")
async def stop_backtest(
    backtest_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Stop a running backtest"""
    
    backtest = db.query(Backtest).filter(
        Backtest.id == backtest_id,
        Backtest.user_id == current_user.id
    ).first()
    
    if not backtest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Backtest not found"
        )
    
    if backtest.status not in [BacktestStatus.PENDING, BacktestStatus.RUNNING]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Backtest is not running"
        )
    
    backtest.status = BacktestStatus.CANCELLED
    db.commit()
    
    return {"message": "Backtest stopped successfully"}

@router.get("/strategies/{strategy_id}/performance")
async def get_strategy_performance(
    strategy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive performance analysis for a strategy"""
    
    # Verify strategy exists and belongs to user
    strategy = db.query(BacktestStrategy).filter(
        BacktestStrategy.id == strategy_id,
        BacktestStrategy.user_id == current_user.id
    ).first()
    
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Strategy not found"
        )
    
    # Get all completed backtests for this strategy
    backtests = db.query(Backtest).filter(
        Backtest.strategy_id == strategy_id,
        Backtest.status == BacktestStatus.COMPLETED
    ).all()
    
    if not backtests:
        return {
            "strategy": strategy,
            "backtests": [],
            "performance_summary": {},
            "message": "No completed backtests found"
        }
    
    # Calculate performance metrics
    total_backtests = len(backtests)
    avg_win_rate = sum([bt.win_rate for bt in backtests]) / total_backtests
    avg_return = sum([bt.total_return_percent for bt in backtests]) / total_backtests
    avg_drawdown = sum([bt.max_drawdown_percent for bt in backtests]) / total_backtests
    best_backtest = max(backtests, key=lambda x: x.total_return_percent)
    worst_backtest = min(backtests, key=lambda x: x.total_return_percent)
    
    return {
        "strategy": strategy,
        "backtests": backtests,
        "performance_summary": {
            "total_backtests": total_backtests,
            "average_win_rate": avg_win_rate,
            "average_return_percent": avg_return,
            "average_max_drawdown_percent": avg_drawdown,
            "best_return_percent": best_backtest.total_return_percent,
            "worst_return_percent": worst_backtest.total_return_percent,
            "consistency_score": _calculate_consistency_score(backtests)
        }
    }

@router.post("/compare", response_model=BacktestComparisonResponse)
async def compare_strategies(
    strategy_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Compare performance of multiple strategies"""
    
    if len(strategy_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 strategies required for comparison"
        )
    
    comparisons = []
    
    for strategy_id in strategy_ids:
        strategy = db.query(BacktestStrategy).filter(
            BacktestStrategy.id == strategy_id,
            BacktestStrategy.user_id == current_user.id
        ).first()
        
        if not strategy:
            continue
        
        backtests = db.query(Backtest).filter(
            Backtest.strategy_id == strategy_id,
            Backtest.status == BacktestStatus.COMPLETED
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
                'risk_adjusted_return': avg_return / max(avg_drawdown, 0.01)
            })
    
    # Sort by risk-adjusted return
    comparisons.sort(key=lambda x: x['risk_adjusted_return'], reverse=True)
    
    return {
        'comparisons': comparisons,
        'best_strategy': comparisons[0] if comparisons else None,
        'analysis': _generate_comparison_analysis(comparisons)
    }

@router.get("/strategies/{strategy_id}/recommendations")
async def get_strategy_recommendations(
    strategy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-powered recommendations for strategy improvement"""
    
    # This would integrate with TradeSage AI for advanced recommendations
    # For now, provide basic rule-based recommendations
    
    strategy = db.query(BacktestStrategy).filter(
        BacktestStrategy.id == strategy_id,
        BacktestStrategy.user_id == current_user.id
    ).first()
    
    if not strategy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Strategy not found"
        )
    
    backtests = db.query(Backtest).filter(
        Backtest.strategy_id == strategy_id,
        Backtest.status == BacktestStatus.COMPLETED
    ).all()
    
    if not backtests:
        return {
            "recommendations": [{
                "type": "info",
                "title": "No Data Available",
                "description": "Run backtests to get personalized recommendations",
                "priority": "low"
            }]
        }
    
    recommendations = _generate_strategy_recommendations(strategy, backtests)
    
    return {"recommendations": recommendations}

def _calculate_consistency_score(backtests: List[Backtest]) -> float:
    """Calculate consistency score for backtests"""
    if len(backtests) < 2:
        return 0.0
    
    returns = [bt.total_return_percent for bt in backtests]
    mean_return = sum(returns) / len(returns)
    variance = sum([(r - mean_return) ** 2 for r in returns]) / len(returns)
    std_dev = variance ** 0.5
    
    if std_dev == 0:
        return 100.0
    
    coefficient_of_variation = abs(std_dev / mean_return) if mean_return != 0 else float('inf')
    consistency_score = max(0, 100 - (coefficient_of_variation * 10))
    
    return min(100, consistency_score)

def _generate_comparison_analysis(comparisons: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate analysis insights from strategy comparison"""
    if not comparisons:
        return {}
    
    best = comparisons[0]
    analysis = {
        "winner": best['strategy_name'],
        "key_insights": []
    }
    
    # Add insights based on performance
    if best['avg_return_percent'] > 20:
        analysis["key_insights"].append("Top performer shows excellent returns")
    
    if best['avg_win_rate'] > 0.6:
        analysis["key_insights"].append("High win rate indicates good entry timing")
    
    if best['avg_max_drawdown'] < 10:
        analysis["key_insights"].append("Low drawdown shows good risk management")
    
    return analysis

def _generate_strategy_recommendations(strategy: BacktestStrategy, backtests: List[Backtest]) -> List[Dict[str, Any]]:
    """Generate recommendations for strategy improvement"""
    recommendations = []
    
    avg_win_rate = sum([bt.win_rate for bt in backtests]) / len(backtests)
    avg_return = sum([bt.total_return_percent for bt in backtests]) / len(backtests)
    avg_drawdown = sum([bt.max_drawdown_percent for bt in backtests]) / len(backtests)
    
    # Win rate recommendations
    if avg_win_rate < 0.4:
        recommendations.append({
            "type": "improvement",
            "title": "Low Win Rate",
            "description": f"Current win rate: {avg_win_rate:.1%}. Consider tightening entry criteria or improving setup quality.",
            "priority": "high",
            "metric": "win_rate",
            "current_value": avg_win_rate
        })
    
    # Return recommendations
    if avg_return < 10:
        recommendations.append({
            "type": "improvement",
            "title": "Low Returns",
            "description": f"Current average return: {avg_return:.1f}%. Consider adjusting risk-reward ratios or position sizing.",
            "priority": "medium",
            "metric": "returns",
            "current_value": avg_return
        })
    
    # Drawdown recommendations
    if avg_drawdown > 15:
        recommendations.append({
            "type": "warning",
            "title": "High Drawdown",
            "description": f"Current max drawdown: {avg_drawdown:.1f}%. Implement stricter risk management rules.",
            "priority": "high",
            "metric": "drawdown",
            "current_value": avg_drawdown
        })
    
    # Positive feedback
    if avg_win_rate > 0.6 and avg_return > 15 and avg_drawdown < 10:
        recommendations.append({
            "type": "success",
            "title": "Excellent Performance",
            "description": "Strategy shows strong performance across all metrics. Consider scaling up.",
            "priority": "low"
        })
    
    if not recommendations:
        recommendations.append({
            "type": "info",
            "title": "Balanced Performance",
            "description": "Strategy shows balanced performance. Continue monitoring and optimizing.",
            "priority": "low"
        })
    
    return recommendations
