# File: backend/api/routes/statistics.py
# Purpose: API routes for statistics and analytics

from fastapi import APIRouter, Depends, Query, HTTPException, Response
from typing import Optional, List
from datetime import datetime, timedelta
import json
from sqlalchemy.orm import Session

from ...db.database import get_db
from ...models.trade import Trade
from ...services.statistics_service import (
    calculate_overall_statistics,
    calculate_win_rate_by_setup,
    calculate_profitability_by_time,
    calculate_risk_reward_analysis,
    calculate_emotional_analysis,
    calculate_market_condition_performance,
    calculate_plan_adherence_analysis
)
from ...mcp.mcp_dependency import get_mcp_client

router = APIRouter(
    prefix="/statistics",
    tags=["statistics"],
    responses={404: {"description": "Statistics not found"}},
)

@router.get("/")
async def get_statistics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    symbol: Optional[str] = None,
    setup_type: Optional[str] = None,
    db: Session = Depends(get_db),
    mcp_client = Depends(get_mcp_client)
):
    """
    Get overall trading statistics with optional filters
    """
    try:
        # Parse dates if provided
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        # Try using MCP statistics server if available
        if mcp_client and hasattr(mcp_client, 'statistics'):
            try:
                mcp_stats = await mcp_client.statistics.get_statistics({
                    'start_date': start_date,
                    'end_date': end_date,
                    'symbol': symbol,
                    'setup_type': setup_type
                })
                return mcp_stats
            except Exception as e:
                print(f"MCP statistics server error: {e}")
                # Fall back to regular implementation
        
        # Calculate statistics using the service
        stats = calculate_overall_statistics(
            db=db,
            start_date=start_date_obj,
            end_date=end_date_obj,
            symbol=symbol,
            setup_type=setup_type
        )
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating statistics: {str(e)}")

@router.get("/win-rate-by-setup")
async def get_win_rate_by_setup(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    symbol: Optional[str] = None,
    db: Session = Depends(get_db),
    mcp_client = Depends(get_mcp_client)
):
    """
    Get win rate and performance metrics by setup type
    """
    try:
        # Parse dates if provided
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        # Try using MCP statistics server if available
        if mcp_client and hasattr(mcp_client, 'statistics'):
            try:
                mcp_stats = await mcp_client.statistics.get_win_rate_by_setup({
                    'start_date': start_date,
                    'end_date': end_date,
                    'symbol': symbol
                })
                return mcp_stats
            except Exception as e:
                print(f"MCP statistics server error: {e}")
                # Fall back to regular implementation
        
        # Calculate statistics using the service
        setup_stats = calculate_win_rate_by_setup(
            db=db,
            start_date=start_date_obj,
            end_date=end_date_obj,
            symbol=symbol
        )
        
        return setup_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating win rate by setup: {str(e)}")

@router.get("/profitability-by-time")
async def get_profitability_by_time(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    symbol: Optional[str] = None,
    setup_type: Optional[str] = None,
    db: Session = Depends(get_db),
    mcp_client = Depends(get_mcp_client)
):
    """
    Get profitability metrics by time of day
    """
    try:
        # Parse dates if provided
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        # Try using MCP statistics server if available
        if mcp_client and hasattr(mcp_client, 'statistics'):
            try:
                mcp_stats = await mcp_client.statistics.get_profitability_by_time({
                    'start_date': start_date,
                    'end_date': end_date,
                    'symbol': symbol,
                    'setup_type': setup_type
                })
                return mcp_stats
            except Exception as e:
                print(f"MCP statistics server error: {e}")
                # Fall back to regular implementation
        
        # Calculate statistics using the service
        time_stats = calculate_profitability_by_time(
            db=db,
            start_date=start_date_obj,
            end_date=end_date_obj,
            symbol=symbol,
            setup_type=setup_type
        )
        
        return time_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating profitability by time: {str(e)}")

@router.get("/risk-reward")
async def get_risk_reward_analysis(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    symbol: Optional[str] = None,
    setup_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get risk/reward ratio analysis
    """
    try:
        # Parse dates if provided
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        # Calculate statistics using the service
        rr_analysis = calculate_risk_reward_analysis(
            db=db,
            start_date=start_date_obj,
            end_date=end_date_obj,
            symbol=symbol,
            setup_type=setup_type
        )
        
        return rr_analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating risk/reward analysis: {str(e)}")

@router.get("/emotional-analysis")
async def get_emotional_analysis(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    symbol: Optional[str] = None,
    setup_type: Optional[str] = None,
    db: Session = Depends(get_db),
    mcp_client = Depends(get_mcp_client)
):
    """
    Get analysis of trading performance by emotional state
    """
    try:
        # Parse dates if provided
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        # Try using MCP sentiment analysis if available
        if mcp_client and hasattr(mcp_client, 'sentimentAnalysis'):
            try:
                mcp_analysis = await mcp_client.sentimentAnalysis.analyze_emotional_impact({
                    'start_date': start_date,
                    'end_date': end_date,
                    'symbol': symbol,
                    'setup_type': setup_type
                })
                return mcp_analysis
            except Exception as e:
                print(f"MCP sentiment analysis error: {e}")
                # Fall back to regular implementation
        
        # Calculate statistics using the service
        emotional_stats = calculate_emotional_analysis(
            db=db,
            start_date=start_date_obj,
            end_date=end_date_obj,
            symbol=symbol,
            setup_type=setup_type
        )
        
        return emotional_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating emotional analysis: {str(e)}")

@router.get("/market-conditions")
async def get_market_condition_performance(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    symbol: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get analysis of trading performance by market conditions
    """
    try:
        # Parse dates if provided
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        # Calculate statistics using the service
        market_stats = calculate_market_condition_performance(
            db=db,
            start_date=start_date_obj,
            end_date=end_date_obj,
            symbol=symbol
        )
        
        return market_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating market condition performance: {str(e)}")

@router.get("/asset-comparison")
async def get_asset_comparison(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    asset_types: Optional[str] = None,
    db: Session = Depends(get_db),
    mcp_client = Depends(get_mcp_client)
):
    """
    Get performance comparison across different asset classes
    """
    try:
        # Parse dates if provided
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        # Parse asset types if provided (comma-separated)
        asset_types_list = asset_types.split(',') if asset_types else None
        
        # Try using MCP statistics server if available
        if mcp_client and hasattr(mcp_client, 'statistics'):
            try:
                mcp_stats = await mcp_client.statistics.get_asset_comparison({
                    'start_date': start_date,
                    'end_date': end_date,
                    'asset_types': asset_types_list
                })
                return mcp_stats
            except Exception as e:
                print(f"MCP statistics server error: {e}")
                # Fall back to regular implementation
        
        # Calculate statistics using the service
        comparison_stats = calculate_asset_comparison(
            db=db,
            start_date=start_date_obj,
            end_date=end_date_obj,
            asset_types=asset_types_list
        )
        
        return comparison_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating asset comparison: {str(e)}")

@router.get("/asset-correlation")
async def get_asset_correlation(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    symbols: Optional[str] = None,
    db: Session = Depends(get_db),
    mcp_client = Depends(get_mcp_client)
):
    """
    Get correlation analysis between different assets
    """
    try:
        # Parse dates if provided
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        # Parse symbols if provided (comma-separated)
        symbols_list = symbols.split(',') if symbols else None
        
        # Try using MCP statistics server if available
        if mcp_client and hasattr(mcp_client, 'statistics'):
            try:
                mcp_stats = await mcp_client.statistics.get_asset_correlation({
                    'start_date': start_date,
                    'end_date': end_date,
                    'symbols': symbols_list
                })
                return mcp_stats
            except Exception as e:
                print(f"MCP statistics server error: {e}")
                # Fall back to regular implementation
        
        # Calculate statistics using the service
        correlation_stats = calculate_asset_correlation_analysis(
            db=db,
            start_date=start_date_obj,
            end_date=end_date_obj,
            symbols=symbols_list
        )
        
        return correlation_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating asset correlation: {str(e)}")

@router.get("/market-strategy")
async def get_market_strategy_performance(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    asset_type: Optional[str] = None,
    db: Session = Depends(get_db),
    mcp_client = Depends(get_mcp_client)
):
    """
    Get effectiveness of different strategies for specific market types
    """
    try:
        # Parse dates if provided
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        # Try using MCP statistics server if available
        if mcp_client and hasattr(mcp_client, 'statistics'):
            try:
                mcp_stats = await mcp_client.statistics.get_market_strategy_performance({
                    'start_date': start_date,
                    'end_date': end_date,
                    'asset_type': asset_type
                })
                return mcp_stats
            except Exception as e:
                print(f"MCP statistics server error: {e}")
                # Fall back to regular implementation
        
        # Calculate statistics using the service
        strategy_stats = calculate_market_specific_strategy_performance(
            db=db,
            start_date=start_date_obj,
            end_date=end_date_obj,
            asset_type=asset_type
        )
        
        return strategy_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating market strategy performance: {str(e)}")

@router.get("/plan-adherence")
async def get_plan_adherence_analysis(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    symbol: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get analysis of trading performance by plan adherence
    """
    try:
        # Parse dates if provided
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        # Calculate statistics using the service
        adherence_stats = calculate_plan_adherence_analysis(
            db=db,
            start_date=start_date_obj,
            end_date=end_date_obj,
            symbol=symbol
        )
        
        return adherence_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating plan adherence analysis: {str(e)}")

@router.post("/insights")
async def generate_statistical_insights(
    params: dict,
    db: Session = Depends(get_db),
    mcp_client = Depends(get_mcp_client)
):
    """
    Generate AI-powered insights based on trading statistics
    """
    try:
        # This endpoint requires MCP TradeSage integration
        if not mcp_client or not hasattr(mcp_client, 'tradeSage'):
            raise HTTPException(status_code=501, detail="TradeSage AI insights not available")
        
        # Generate insights using MCP TradeSage
        insights = await mcp_client.tradeSage.generate_statistical_insights(params)
        
        return insights
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating statistical insights: {str(e)}")

@router.get("/export/{format}")
async def export_statistics(
    format: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    symbol: Optional[str] = None,
    setup_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Export statistics data in CSV or PDF format
    """
    try:
        if format not in ['csv', 'pdf']:
            raise HTTPException(status_code=400, detail="Format must be 'csv' or 'pdf'")
        
        # Parse dates if provided
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        # TODO: Implement actual export functionality
        if format == 'csv':
            content = "date,symbol,setup,win,profit\n2023-01-01,NQ,MMXM_STANDARD,true,150.25"
            headers = {
                'Content-Disposition': 'attachment; filename="statistics.csv"'
            }
            return Response(content=content, media_type='text/csv', headers=headers)
        else:  # PDF
            # This would require a PDF generation library
            content = b"%PDF-1.4 mock data"
            headers = {
                'Content-Disposition': 'attachment; filename="statistics.pdf"'
            }
            return Response(content=content, media_type='application/pdf', headers=headers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting statistics: {str(e)}")
