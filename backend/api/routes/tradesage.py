# File: backend/api/routes/tradesage.py
# Purpose: API endpoints for TradeSage AI assistant

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from datetime import date, datetime, timedelta
from pydantic import BaseModel

from ...db.database import get_db
from sqlalchemy.orm import Session

from ...services.tradesage_service import TradeSageService
from ...services.trade_service import TradeService

# Pydantic models for request/response
class AnalysisRequest(BaseModel):
    """Request model for trading pattern analysis"""
    user_id: int
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    
class AnalysisResponse(BaseModel):
    """Response model for trading pattern analysis"""
    insights: List[Dict[str, Any]]
    recommendations: List[str]
    summary: str

class QuestionRequest(BaseModel):
    """Request model for asking TradeSage a question"""
    user_id: int
    question: str
    
class QuestionResponse(BaseModel):
    """Response model for TradeSage question answers"""
    answer: str
    confidence: float
    sources: Optional[List[Dict[str, Any]]] = None

class ImprovementPlanResponse(BaseModel):
    """Response model for improvement plan"""
    strengths: List[str]
    weaknesses: List[str]
    plan: Dict[str, List[Dict[str, Any]]]
    timeline: str

# Create the router
router = APIRouter()

@router.post("/analyze-patterns", response_model=AnalysisResponse)
async def analyze_trading_patterns(
    request: AnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze trading patterns for insights and recommendations
    """
    try:
        tradesage_service = TradeSageService(db)
        
        # Set default date range if not provided
        if not request.start_date and not request.end_date:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=90)  # Default to last 90 days
        else:
            start_date = request.start_date
            end_date = request.end_date or datetime.now().date()
        
        # Create date range dict
        date_range = {
            "start": start_date,
            "end": end_date
        } if start_date else None
        
        # Analyze trading patterns
        analysis_result = await tradesage_service.analyze_trading_patterns(
            user_id=request.user_id,
            date_range=date_range
        )
        
        if not analysis_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No trading data available for analysis"
            )
        
        return AnalysisResponse(
            insights=analysis_result.get("insights", []),
            recommendations=analysis_result.get("recommendations", []),
            summary=analysis_result.get("summary", "No summary available.")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@router.post("/ask", response_model=QuestionResponse)
async def ask_question(
    request: QuestionRequest,
    db: Session = Depends(get_db)
):
    """
    Ask a question to TradeSage AI assistant
    """
    try:
        tradesage_service = TradeSageService(db)
        
        if not request.question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question cannot be empty"
            )
        
        # Get answer
        answer_result = await tradesage_service.answer_trading_question(
            user_id=request.user_id,
            question=request.question
        )
        
        if not answer_result:
            return QuestionResponse(
                answer="I'm unable to answer this question at the moment.",
                confidence=0.0
            )
        
        return QuestionResponse(
            answer=answer_result.get("answer", "No answer available."),
            confidence=answer_result.get("confidence", 0.0),
            sources=answer_result.get("sources", [])
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Question processing failed: {str(e)}"
        )

@router.get("/insights/{user_id}", response_model=Dict[str, Any])
async def get_performance_insights(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get performance insights for a user
    """
    try:
        tradesage_service = TradeSageService(db)
        
        # Get insights
        insights = await tradesage_service.get_performance_insights(user_id)
        
        if not insights:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No trading data available for insights"
            )
        
        return insights
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Insights generation failed: {str(e)}"
        )

@router.get("/improvement-plan/{user_id}", response_model=ImprovementPlanResponse)
async def get_improvement_plan(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Generate an improvement plan for a user
    """
    try:
        tradesage_service = TradeSageService(db)
        
        # Generate plan
        plan = await tradesage_service.generate_improvement_plan(user_id)
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Unable to generate improvement plan due to insufficient data"
            )
        
        return ImprovementPlanResponse(
            strengths=plan.get("strengths", []),
            weaknesses=plan.get("weaknesses", []),
            plan=plan.get("plan", {"shortTerm": [], "mediumTerm": [], "longTerm": []}),
            timeline=plan.get("timeline", "No timeline available.")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Plan generation failed: {str(e)}"
        )

@router.get("/compare-trades/{user_id}", response_model=Dict[str, Any])
async def compare_winning_and_losing_trades(
    user_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Compare winning and losing trades to identify patterns
    """
    try:
        # Get trades for analysis
        trade_service = TradeService(db)
        
        # Set default date range if not provided
        if not start_date:
            end_date_value = end_date or datetime.now().date()
            start_date_value = end_date_value - timedelta(days=90)  # Default to last 90 days
        else:
            start_date_value = start_date
            end_date_value = end_date or datetime.now().date()
        
        # Get trades
        trades = trade_service.get_trades(
            user_id=user_id,
            start_date=start_date_value,
            end_date=end_date_value
        )
        
        if not trades:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No trading data available for comparison"
            )
        
        # Separate winning and losing trades
        winning_trades = [t for t in trades if t.outcome == "Win"]
        losing_trades = [t for t in trades if t.outcome == "Loss"]
        
        # Mock comparison analysis (in a real implementation, this would be done by TradeSage)
        # Group by different factors
        
        # By time of day
        winning_trades_by_hour = {}
        losing_trades_by_hour = {}
        
        for trade in winning_trades:
            if trade.entry_time:
                hour = trade.entry_time.hour
                if hour not in winning_trades_by_hour:
                    winning_trades_by_hour[hour] = 0
                winning_trades_by_hour[hour] += 1
        
        for trade in losing_trades:
            if trade.entry_time:
                hour = trade.entry_time.hour
                if hour not in losing_trades_by_hour:
                    losing_trades_by_hour[hour] = 0
                losing_trades_by_hour[hour] += 1
        
        # By setup type
        winning_trades_by_setup = {}
        losing_trades_by_setup = {}
        
        for trade in winning_trades:
            setup = trade.setup_type or "Unknown"
            if setup not in winning_trades_by_setup:
                winning_trades_by_setup[setup] = 0
            winning_trades_by_setup[setup] += 1
        
        for trade in losing_trades:
            setup = trade.setup_type or "Unknown"
            if setup not in losing_trades_by_setup:
                losing_trades_by_setup[setup] = 0
            losing_trades_by_setup[setup] += 1
        
        # By emotional state
        winning_trades_by_emotion = {}
        losing_trades_by_emotion = {}
        
        for trade in winning_trades:
            emotion = trade.emotional_state or "Unknown"
            if emotion not in winning_trades_by_emotion:
                winning_trades_by_emotion[emotion] = 0
            winning_trades_by_emotion[emotion] += 1
        
        for trade in losing_trades:
            emotion = trade.emotional_state or "Unknown"
            if emotion not in losing_trades_by_emotion:
                losing_trades_by_emotion[emotion] = 0
            losing_trades_by_emotion[emotion] += 1
        
        # By plan adherence
        winning_trades_by_adherence = {}
        losing_trades_by_adherence = {}
        
        for trade in winning_trades:
            adherence = trade.plan_adherence or "Unknown"
            if adherence not in winning_trades_by_adherence:
                winning_trades_by_adherence[adherence] = 0
            winning_trades_by_adherence[adherence] += 1
        
        for trade in losing_trades:
            adherence = trade.plan_adherence or "Unknown"
            if adherence not in losing_trades_by_adherence:
                losing_trades_by_adherence[adherence] = 0
            losing_trades_by_adherence[adherence] += 1
        
        # Generate insights
        insights = []
        
        # Time of day insights
        best_time = max(winning_trades_by_hour.items(), key=lambda x: x[1])[0] if winning_trades_by_hour else None
        worst_time = max(losing_trades_by_hour.items(), key=lambda x: x[1])[0] if losing_trades_by_hour else None
        
        if best_time and worst_time:
            insights.append(f"Your winning trades tend to occur more frequently around {best_time}:00, while losing trades are more common around {worst_time}:00.")
        
        # Setup insights
        best_setup = max(winning_trades_by_setup.items(), key=lambda x: x[1])[0] if winning_trades_by_setup else None
        worst_setup = max(losing_trades_by_setup.items(), key=lambda x: x[1])[0] if losing_trades_by_setup else None
        
        if best_setup and worst_setup:
            insights.append(f"Your most successful setup is '{best_setup}', while '{worst_setup}' has a higher proportion of losing trades.")
        
        # Emotional state insights
        best_emotion = max(winning_trades_by_emotion.items(), key=lambda x: x[1])[0] if winning_trades_by_emotion else None
        worst_emotion = max(losing_trades_by_emotion.items(), key=lambda x: x[1])[0] if losing_trades_by_emotion else None
        
        if best_emotion and worst_emotion:
            insights.append(f"Trading when you feel '{best_emotion}' leads to more winning trades, while trading during '{worst_emotion}' states tends to result in more losses.")
        
        # Plan adherence insights
        best_adherence = max(winning_trades_by_adherence.items(), key=lambda x: x[1])[0] if winning_trades_by_adherence else None
        worst_adherence = max(losing_trades_by_adherence.items(), key=lambda x: x[1])[0] if losing_trades_by_adherence else None
        
        if best_adherence and worst_adherence:
            insights.append(f"Your winning trades show better plan adherence ('{best_adherence}'), while losing trades often have '{worst_adherence}' plan adherence.")
        
        return {
            "totalTrades": len(trades),
            "winningTrades": len(winning_trades),
            "losingTrades": len(losing_trades),
            "byTimeOfDay": {
                "winning": winning_trades_by_hour,
                "losing": losing_trades_by_hour
            },
            "bySetupType": {
                "winning": winning_trades_by_setup,
                "losing": losing_trades_by_setup
            },
            "byEmotionalState": {
                "winning": winning_trades_by_emotion,
                "losing": losing_trades_by_emotion
            },
            "byPlanAdherence": {
                "winning": winning_trades_by_adherence,
                "losing": losing_trades_by_adherence
            },
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Comparison failed: {str(e)}"
        )
