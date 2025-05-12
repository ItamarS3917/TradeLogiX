# File: backend/mcp/servers/tradesage_server.py
# Purpose: MCP server for TradeSage AI assistant capabilities

import logging
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, Query

from ..mcp_server import MCPServer
from ..tools.pattern_recognition import identify_trade_patterns
from ..tools.sentiment_analysis import analyze_text_sentiment, analyze_emotional_impact
from ..tools.ai_integration import get_claude_client
from ...db.database import get_db
# Avoid circular import by importing services when needed, not at module level
# from ...services.trade_service import TradeService
# from ...services.journal_service import JournalService
# from ...services.plan_service import PlanService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TradeSageMCPServer(MCPServer):
    """MCP server for TradeSage AI assistant"""
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize TradeSage MCP server
        
        Args:
            config (Dict[str, Any], optional): Server configuration. Defaults to None.
        """
        if config is None:
            config = {
                "name": "tradeSage",
                "host": "localhost",
                "port": 8091,
                "version": "1.0.0"
            }
        
        super().__init__(config)
        logger.info(f"Initialized TradeSage MCP server")
    
    def register_routes(self):
        """Register API routes"""
        # Health check endpoint
        @self.app.get("/api/v1/health")
        async def health_check():
            return {"status": "healthy", "server": self.name}
        
        # Analyze trading patterns
        @self.app.post("/api/v1/analyze-patterns")
        async def analyze_patterns(
            trades: List[Dict[str, Any]]
        ):
            """
            Analyze trading patterns from historical trades
            
            Args:
                trades (List[Dict[str, Any]]): List of trades
                
            Returns:
                Dict[str, Any]: Analysis results
            """
            try:
                if not trades:
                    raise HTTPException(status_code=400, detail="No trades provided")
                
                patterns = identify_trade_patterns(trades)
                
                # Generate insights based on patterns
                insights = []
                recommendations = []
                
                for pattern in patterns:
                    insights.append({
                        "type": pattern.get("type", "unknown"),
                        "name": pattern.get("name", "Unknown Pattern"),
                        "description": pattern.get("description", "No description"),
                        "confidence": pattern.get("confidence", 0.0),
                        "evidence": pattern.get("recommendation", "No recommendation")
                    })
                    
                    if "recommendation" in pattern:
                        recommendations.append(pattern["recommendation"])
                
                # Generate summary
                if patterns:
                    summary = "Analysis of your trading data has identified several patterns. "
                    
                    # Add most confident pattern to summary
                    if patterns[0].get("confidence", 0) > 0.7:
                        summary += f"Most notably, {patterns[0].get('description')} "
                    
                    # Add recommendation count
                    summary += f"We've generated {len(recommendations)} recommendations to help improve your trading."
                else:
                    summary = "No significant patterns were found in your trading data. Add more trades or expand the date range for more insights."
                
                # Use Claude to analyze trading patterns if available
                try:
                    claude_client = await get_claude_client()
                    claude_analysis = await claude_client.analyze_trading_patterns(trades)
                    
                    # Add Claude insights to patterns
                    claude_insights = claude_analysis.get("insights", [])
                    for insight in claude_insights:
                        if insight not in patterns:
                            patterns.append(insight)
                    
                    # Add Claude recommendations
                    claude_recommendations = claude_analysis.get("recommendations", [])
                    for recommendation in claude_recommendations:
                        if recommendation not in recommendations:
                            recommendations.append(recommendation)
                    
                    # Use Claude summary if available
                    if claude_analysis.get("summary"):
                        summary = claude_analysis.get("summary")
                except Exception as e:
                    logger.warning(f"Error using Claude for pattern analysis: {str(e)}")
                
                return {
                    "patterns": patterns,
                    "insights": insights,
                    "recommendations": recommendations,
                    "summary": summary
                }
            except Exception as e:
                logger.error(f"Error analyzing patterns: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
        
        # Analyze journal entries
        @self.app.post("/api/v1/analyze-journals")
        async def analyze_journals(
            journals: List[Dict[str, Any]]
        ):
            """
            Analyze journal entries for sentiment and patterns
            
            Args:
                journals (List[Dict[str, Any]]): List of journal entries
                
            Returns:
                Dict[str, Any]: Analysis results
            """
            try:
                if not journals:
                    raise HTTPException(status_code=400, detail="No journal entries provided")
                
                # Analyze sentiment for each journal
                sentiment_results = []
                
                for journal in journals:
                    content = journal.get("content", "")
                    if content:
                        sentiment = analyze_text_sentiment(content)
                        sentiment_results.append({
                            "journal_id": journal.get("id"),
                            "date": journal.get("date"),
                            "sentiment": sentiment
                        })
                
                # Identify emotional patterns
                emotional_trends = self._identify_emotional_trends(sentiment_results)
                
                # Generate insights
                insights = []
                recommendations = []
                
                if emotional_trends.get("dominant_emotions"):
                    top_emotions = emotional_trends["dominant_emotions"][:3]
                    insights.append({
                        "type": "emotional_trend",
                        "name": "Dominant Emotions",
                        "description": f"Your dominant emotions while trading are {', '.join(top_emotions)}.",
                        "confidence": 0.8
                    })
                
                if emotional_trends.get("sentiment_trend"):
                    trend = emotional_trends["sentiment_trend"]
                    insights.append({
                        "type": "sentiment_trend",
                        "name": "Sentiment Trend",
                        "description": f"Your overall sentiment is trending {trend} over the analyzed period.",
                        "confidence": 0.75
                    })
                
                # Generate recommendations based on sentiment
                if emotional_trends.get("negative_dominant") and emotional_trends["negative_dominant"]:
                    recommendations.append(
                        "Consider mindfulness or relaxation techniques before trading to manage dominant negative emotions."
                    )
                
                if emotional_trends.get("mood_trading_correlation") and abs(emotional_trends["mood_trading_correlation"]) > 0.5:
                    recommendations.append(
                        "Your mood significantly affects your trading. Consider not trading on days when you feel particularly negative emotions."
                    )
                
                # Default recommendations if none generated
                if not recommendations:
                    recommendations.append(
                        "Continue journaling regularly to track your emotional patterns in relation to your trading performance."
                    )
                
                # Generate summary
                summary = "Analysis of your trading journals shows "
                
                if emotional_trends.get("sentiment_trend"):
                    summary += f"a {emotional_trends['sentiment_trend']} sentiment trend. "
                else:
                    summary += "mixed sentiment patterns. "
                
                if emotional_trends.get("dominant_emotions"):
                    summary += f"Your dominant emotions are {', '.join(emotional_trends['dominant_emotions'][:2])}. "
                
                summary += f"We've generated {len(recommendations)} recommendations based on your emotional patterns."
                
                # Use Claude to analyze journal entries if available
                try:
                    claude_client = await get_claude_client()
                    claude_analysis = await claude_client.analyze_journal_entries(journals)
                    
                    # Add Claude insights
                    claude_insights = claude_analysis.get("insights", [])
                    for insight in claude_insights:
                        if insight not in recommendations:
                            recommendations.append(insight)
                    
                    # Add Claude recommendations
                    claude_recommendations = claude_analysis.get("recommendations", [])
                    for recommendation in claude_recommendations:
                        if recommendation not in recommendations:
                            recommendations.append(recommendation)
                except Exception as e:
                    logger.warning(f"Error using Claude for journal analysis: {str(e)}")
                
                return {
                    "sentiment_results": sentiment_results,
                    "emotional_trends": emotional_trends,
                    "insights": insights,
                    "recommendations": recommendations,
                    "summary": summary
                }
            except Exception as e:
                logger.error(f"Error analyzing journals: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
        
        # Generate improvement plan
        @self.app.post("/api/v1/generate-plan")
        async def generate_improvement_plan(
            trades: List[Dict[str, Any]],
            journals: Optional[List[Dict[str, Any]]] = None,
            user_goals: Optional[List[Dict[str, Any]]] = None
        ):
            """
            Generate a personalized trading improvement plan
            
            Args:
                trades (List[Dict[str, Any]]): List of trades
                journals (Optional[List[Dict[str, Any]]], optional): List of journal entries. Defaults to None.
                user_goals (Optional[List[Dict[str, Any]]], optional): List of user goals. Defaults to None.
                
            Returns:
                Dict[str, Any]: Improvement plan
            """
            try:
                if not trades:
                    raise HTTPException(status_code=400, detail="No trades provided")
                
                # Identify strengths and weaknesses
                strengths = []
                weaknesses = []
                
                # Analyze trade patterns
                patterns = identify_trade_patterns(trades)
                
                # Extract winning setups
                win_rates_by_setup = {}
                profit_by_setup = {}
                
                for trade in trades:
                    setup = trade.get("setup_type", "Unknown")
                    outcome = trade.get("outcome", "Unknown")
                    profit_loss = trade.get("profit_loss", 0)
                    
                    if setup not in win_rates_by_setup:
                        win_rates_by_setup[setup] = {"wins": 0, "total": 0}
                        profit_by_setup[setup] = 0
                    
                    win_rates_by_setup[setup]["total"] += 1
                    
                    if outcome == "Win":
                        win_rates_by_setup[setup]["wins"] += 1
                    
                    profit_by_setup[setup] += profit_loss
                
                # Calculate win rates
                for setup, stats in win_rates_by_setup.items():
                    if stats["total"] >= 5:  # Only consider setups with enough trades
                        win_rate = (stats["wins"] / stats["total"]) * 100
                        
                        if win_rate >= 60:
                            strengths.append(f"Your {setup} setup has a strong {win_rate:.1f}% win rate")
                        elif win_rate <= 40:
                            weaknesses.append(f"Your {setup} setup has a low {win_rate:.1f}% win rate")
                        
                        if profit_by_setup[setup] > 0 and stats["total"] >= 5:
                            avg_profit = profit_by_setup[setup] / stats["total"]
                            if avg_profit > 100:
                                strengths.append(f"Your {setup} setup averages ${avg_profit:.2f} profit per trade")
                
                # Extract timing strengths/weaknesses from patterns
                for pattern in patterns:
                    if pattern["type"] == "time_of_day" and pattern["confidence"] >= 0.7:
                        strengths.append(f"You perform well when trading around {pattern['best_hour'] % 12 or 12} {'AM' if pattern['best_hour'] < 12 else 'PM'}")
                        weaknesses.append(f"You underperform when trading around {pattern['worst_hour'] % 12 or 12} {'AM' if pattern['worst_hour'] < 12 else 'PM'}")
                    
                    elif pattern["type"] == "emotional_impact" and pattern["confidence"] >= 0.7:
                        strengths.append(f"You trade well when feeling {pattern['best_emotion']}")
                        weaknesses.append(f"You should avoid trading when feeling {pattern['worst_emotion']}")
                
                # Add default strengths/weaknesses if none found
                if not strengths:
                    strengths = [
                        "Consistent journaling and self-reflection",
                        "Dedication to trading improvement",
                        "Awareness of psychological factors in trading"
                    ]
                
                if not weaknesses:
                    weaknesses = [
                        "Insufficient data to identify specific weaknesses",
                        "Need more consistent trade documentation",
                        "May benefit from more detailed trading rules"
                    ]
                
                # Generate plan
                plan = {
                    "shortTerm": [
                        {
                            "action": "Review all losing trades from the past month",
                            "timeframe": "1 week",
                            "measurable": "Complete analysis document with common factors"
                        },
                        {
                            "action": "Implement a pre-trade checklist",
                            "timeframe": "2 weeks",
                            "measurable": "Checklist used for 100% of trades"
                        }
                    ],
                    "mediumTerm": [
                        {
                            "action": "Focus on your highest win-rate setups",
                            "timeframe": "1 month",
                            "measurable": "80% of trades match your best patterns"
                        },
                        {
                            "action": "Reduce trading during your worst-performing hours",
                            "timeframe": "1 month",
                            "measurable": "Zero trades during low-performance periods"
                        }
                    ],
                    "longTerm": [
                        {
                            "action": "Develop a quantified trading system based on your edge",
                            "timeframe": "3 months",
                            "measurable": "Documented system with clear rules"
                        },
                        {
                            "action": "Build a consistent track record",
                            "timeframe": "6 months",
                            "measurable": "Profitability in 4 out of 6 months"
                        }
                    ]
                }
                
                # Add pattern-specific actions
                for pattern in patterns:
                    if pattern["confidence"] >= 0.75:
                        if pattern["type"] == "overtrading":
                            plan["shortTerm"].append({
                                "action": f"Limit yourself to {min(pattern.get('overtrading_threshold', 5) - 1, 5)} trades per day",
                                "timeframe": "2 weeks",
                                "measurable": "Daily trade count never exceeds limit"
                            })
                        
                        elif pattern["type"] == "revenge_trading":
                            plan["shortTerm"].append({
                                "action": f"Take a {pattern.get('time_threshold', 15)} minute break after any losing trade",
                                "timeframe": "2 weeks",
                                "measurable": "Zero trades taken immediately after losses"
                            })
                
                # Generate timeline
                timeline = "This improvement plan is designed to be implemented over the next 6 months, with regular reviews and adjustments based on your performance. Focus first on the short-term actions to build momentum."
                
                # Use Claude to generate improvement plan if available
                try:
                    claude_client = await get_claude_client()
                    claude_plan = await claude_client.generate_improvement_plan(trades, journals)
                    
                    # Combine with existing plan
                    strengths.extend([s for s in claude_plan.get("strengths", []) if s not in strengths])
                    weaknesses.extend([w for w in claude_plan.get("weaknesses", []) if w not in weaknesses])
                    
                    # Add Claude plan actions
                    claude_plan_actions = claude_plan.get("plan", {})
                    
                    # Short-term actions
                    claude_short_term = claude_plan_actions.get("shortTerm", [])
                    for action in claude_short_term:
                        existing_actions = [a.get("action") for a in plan["shortTerm"]]
                        if action.get("action") not in existing_actions:
                            plan["shortTerm"].append(action)
                    
                    # Medium-term actions
                    claude_medium_term = claude_plan_actions.get("mediumTerm", [])
                    for action in claude_medium_term:
                        existing_actions = [a.get("action") for a in plan["mediumTerm"]]
                        if action.get("action") not in existing_actions:
                            plan["mediumTerm"].append(action)
                    
                    # Long-term actions
                    claude_long_term = claude_plan_actions.get("longTerm", [])
                    for action in claude_long_term:
                        existing_actions = [a.get("action") for a in plan["longTerm"]]
                        if action.get("action") not in existing_actions:
                            plan["longTerm"].append(action)
                    
                    # Use Claude timeline if available
                    if claude_plan.get("timeline"):
                        timeline = claude_plan.get("timeline")
                except Exception as e:
                    logger.warning(f"Error using Claude for generating improvement plan: {str(e)}")
                
                return {
                    "strengths": strengths,
                    "weaknesses": weaknesses,
                    "plan": plan,
                    "timeline": timeline
                }
            except Exception as e:
                logger.error(f"Error generating improvement plan: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Plan generation failed: {str(e)}")
        
        # Answer trading questions
        @self.app.post("/api/v1/ask")
        async def answer_question(
            question: str,
            trade_data: Optional[List[Dict[str, Any]]] = None,
            user_id: Optional[int] = None
        ):
            """
            Answer trading-related questions
            
            Args:
                question (str): User's question
                trade_data (Optional[List[Dict[str, Any]]], optional): Trade data for context. Defaults to None.
                user_id (Optional[int], optional): User ID. Defaults to None.
                
            Returns:
                Dict[str, Any]: Answer response
            """
            try:
                if not question:
                    raise HTTPException(status_code=400, detail="No question provided")
                
                # Process the question (lowercase for easier matching)
                question_lower = question.lower()
                
                # Simple question matching system (would be replaced with a real NLP system)
                confidence = 0.7  # Default confidence
                
                # Generate answer based on question content
                if "win rate" in question_lower:
                    if trade_data:
                        wins = sum(1 for t in trade_data if t.get("outcome") == "Win")
                        total = len(trade_data)
                        win_rate = (wins / total) * 100 if total else 0
                        
                        answer = f"Your overall win rate is {win_rate:.1f}% based on {total} trades. "
                        
                        # Add setup-specific win rates if available
                        setup_trades = {}
                        for trade in trade_data:
                            setup = trade.get("setup_type", "Unknown")
                            outcome = trade.get("outcome", "Unknown")
                            
                            if setup not in setup_trades:
                                setup_trades[setup] = {"wins": 0, "total": 0}
                            
                            setup_trades[setup]["total"] += 1
                            
                            if outcome == "Win":
                                setup_trades[setup]["wins"] += 1
                        
                        # Get top setup by win rate
                        best_setup = None
                        best_win_rate = 0
                        
                        for setup, stats in setup_trades.items():
                            if stats["total"] >= 5:  # Only consider setups with enough trades
                                setup_win_rate = (stats["wins"] / stats["total"]) * 100
                                
                                if setup_win_rate > best_win_rate:
                                    best_setup = setup
                                    best_win_rate = setup_win_rate
                        
                        if best_setup:
                            answer += f"Your best setup is {best_setup} with a {best_win_rate:.1f}% win rate."
                        
                        confidence = 0.95
                    else:
                        answer = "I need your trading data to calculate an accurate win rate. Try using the Statistics page to view your win rate."
                        confidence = 0.7
                
                elif "best setup" in question_lower or "best pattern" in question_lower:
                    if trade_data:
                        # Analyze setups
                        setup_stats = {}
                        for trade in trade_data:
                            setup = trade.get("setup_type", "Unknown")
                            outcome = trade.get("outcome", "Unknown")
                            profit_loss = trade.get("profit_loss", 0)
                            
                            if setup not in setup_stats:
                                setup_stats[setup] = {
                                    "wins": 0, 
                                    "total": 0, 
                                    "profit": 0
                                }
                            
                            setup_stats[setup]["total"] += 1
                            setup_stats[setup]["profit"] += profit_loss
                            
                            if outcome == "Win":
                                setup_stats[setup]["wins"] += 1
                        
                        # Find best setup by win rate
                        best_by_win_rate = None
                        best_win_rate = 0
                        
                        # Find best setup by profit
                        best_by_profit = None
                        best_profit = 0
                        
                        for setup, stats in setup_stats.items():
                            if stats["total"] >= 5:  # Only consider setups with enough trades
                                win_rate = (stats["wins"] / stats["total"]) * 100
                                
                                if win_rate > best_win_rate:
                                    best_by_win_rate = setup
                                    best_win_rate = win_rate
                                
                                if stats["profit"] > best_profit:
                                    best_by_profit = setup
                                    best_profit = stats["profit"]
                        
                        if best_by_win_rate:
                            answer = f"Your best setup by win rate is {best_by_win_rate} with a {best_win_rate:.1f}% win rate. "
                            
                            if best_by_profit and best_by_profit != best_by_win_rate:
                                answer += f"However, your most profitable setup is {best_by_profit} with ${best_profit:.2f} total profit."
                            
                            confidence = 0.9
                        else:
                            answer = "You don't have enough trades per setup to determine which is best. Try to log at least 5 trades for each setup type."
                            confidence = 0.8
                    else:
                        answer = "I need your trading data to identify your best setup. Try using the Statistics page to view setup performance."
                        confidence = 0.7
                
                elif "losing" in question_lower or "loss" in question_lower:
                    if trade_data:
                        # Analyze losing trades
                        losing_trades = [t for t in trade_data if t.get("outcome") == "Loss"]
                        total_losses = len(losing_trades)
                        
                        if total_losses > 0:
                            # Analyze common factors in losing trades
                            time_slots = {}
                            emotions = {}
                            setups = {}
                            
                            for trade in losing_trades:
                                # Time analysis
                                entry_time = trade.get("entry_time")
                                if entry_time:
                                    try:
                                        hour = datetime.fromisoformat(entry_time).hour
                                        time_slot = f"{hour}:00"
                                        
                                        if time_slot not in time_slots:
                                            time_slots[time_slot] = 0
                                        
                                        time_slots[time_slot] += 1
                                    except (ValueError, TypeError):
                                        pass
                                
                                # Emotional state
                                emotion = trade.get("emotional_state")
                                if emotion:
                                    if emotion not in emotions:
                                        emotions[emotion] = 0
                                    
                                    emotions[emotion] += 1
                                
                                # Setup type
                                setup = trade.get("setup_type")
                                if setup:
                                    if setup not in setups:
                                        setups[setup] = 0
                                    
                                    setups[setup] += 1
                            
                            # Find most common factors
                            most_common_time = max(time_slots.items(), key=lambda x: x[1])[0] if time_slots else None
                            most_common_emotion = max(emotions.items(), key=lambda x: x[1])[0] if emotions else None
                            most_common_setup = max(setups.items(), key=lambda x: x[1])[0] if setups else None
                            
                            # Build answer
                            answer = f"Analyzing your {total_losses} losing trades, here are the common factors:\n\n"
                            
                            if most_common_time:
                                time_percentage = (time_slots[most_common_time] / total_losses) * 100
                                answer += f"• {time_percentage:.0f}% of your losses occur around {most_common_time}.\n"
                            
                            if most_common_emotion:
                                emotion_percentage = (emotions[most_common_emotion] / total_losses) * 100
                                answer += f"• {emotion_percentage:.0f}% of your losses happen when you feel '{most_common_emotion}'.\n"
                            
                            if most_common_setup:
                                setup_percentage = (setups[most_common_setup] / total_losses) * 100
                                answer += f"• {setup_percentage:.0f}% of your losses come from '{most_common_setup}' setups.\n"
                            
                            answer += "\nConsider adjusting your approach during these specific conditions to improve results."
                            confidence = 0.85
                        else:
                            answer = "You don't have any losing trades in the analyzed period. Great job! However, this means I can't identify losing patterns."
                            confidence = 0.8
                    else:
                        answer = "I need your trading data to analyze losing patterns. Try using the Statistics page to view detailed loss analysis."
                        confidence = 0.7
                
                elif "improve" in question_lower or "better" in question_lower:
                    # Generate general improvement recommendations
                    patterns = identify_trade_patterns(trade_data) if trade_data else []
                    
                    if patterns:
                        # Use pattern recommendations
                        recommendations = [p.get("recommendation") for p in patterns if "recommendation" in p][:3]
                        
                        if recommendations:
                            answer = "Based on your trading data, here are my top recommendations for improvement:\n\n"
                            
                            for i, rec in enumerate(recommendations, 1):
                                answer += f"{i}. {rec}\n"
                            
                            confidence = 0.85
                        else:
                            answer = "Based on your trading patterns, focus on these areas for improvement:\n\n1. Be more selective with your trades and wait for your highest-probability setups.\n2. Review your trade management to optimize your risk-reward ratio.\n3. Maintain emotional discipline, especially after a losing trade."
                            confidence = 0.7
                    else:
                        answer = "To improve your trading, I recommend these general best practices:\n\n1. Maintain a detailed trading journal and review it weekly.\n2. Define clear entry and exit criteria for each trade setup.\n3. Practice proper risk management (limit risk to 1-2% per trade).\n4. Focus on process over outcome to maintain consistency."
                        confidence = 0.6
                
                else:
                    # Generic response for unrecognized questions
                    answer = "I don't have enough context to answer that specific question. Try asking about your win rate, best setups, losing patterns, or how to improve your trading. You can also check the Statistics page for detailed data."
                    confidence = 0.5
                
                # Use Claude to answer the question if available
                try:
                    claude_client = await get_claude_client()
                    trading_context = {
                        "overall_stats": {
                            "win_rate": win_rate if 'win_rate' in locals() else None,
                            "total_trades": len(trade_data) if trade_data else 0,
                            "total_profit": sum(t.get("profit_loss", 0) for t in trade_data) if trade_data else 0,
                            "profit_per_trade": sum(t.get("profit_loss", 0) for t in trade_data) / len(trade_data) if trade_data and len(trade_data) > 0 else 0
                        },
                        "recent_trades": trade_data[:5] if trade_data else [],
                        "trade_count": len(trade_data) if trade_data else 0
                    }
                    
                    claude_answer = await claude_client.answer_trading_question(question, trading_context)
                    if claude_answer.get("answer"):
                        answer = claude_answer.get("answer")
                        confidence = claude_answer.get("confidence", 0.7)
                except Exception as e:
                    logger.warning(f"Error using Claude for answering question: {str(e)}")
                
                return {
                    "answer": answer,
                    "confidence": confidence,
                    "sources": [
                        {"type": "trade_data", "count": len(trade_data) if trade_data else 0},
                        {"type": "pattern_analysis", "count": len(patterns) if 'patterns' in locals() else 0}
                    ]
                }
            except Exception as e:
                logger.error(f"Error answering question: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to answer question: {str(e)}")
    
    def _identify_emotional_trends(self, sentiment_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Identify emotional trends from sentiment analysis results
        
        Args:
            sentiment_results (List[Dict[str, Any]]): Sentiment analysis results
            
        Returns:
            Dict[str, Any]: Emotional trends
        """
        if not sentiment_results:
            return {}
        
        # Extract sentiment scores over time
        sentiment_scores = [(result.get('date'), result.get('sentiment', {}).get('score', 0)) 
                           for result in sentiment_results 
                           if result.get('date') and 'sentiment' in result]
        
        # Sort by date
        sentiment_scores.sort(key=lambda x: x[0])
        
        # Calculate trend
        if len(sentiment_scores) >= 3:
            scores = [score for _, score in sentiment_scores]
            first_half = scores[:len(scores)//2]
            second_half = scores[len(scores)//2:]
            
            first_half_avg = sum(first_half) / len(first_half) if first_half else 0
            second_half_avg = sum(second_half) / len(second_half) if second_half else 0
            
            if second_half_avg - first_half_avg > 0.2:
                trend = "positive"
            elif first_half_avg - second_half_avg > 0.2:
                trend = "negative"
            else:
                trend = "stable"
        else:
            trend = "insufficient data"
        
        # Extract dominant emotions
        all_emotions = {}
        
        for result in sentiment_results:
            emotions = result.get('sentiment', {}).get('emotions', {})
            
            for emotion, value in emotions.items():
                if emotion not in all_emotions:
                    all_emotions[emotion] = 0
                
                all_emotions[emotion] += value
        
        # Sort emotions by frequency
        dominant_emotions = sorted(all_emotions.items(), key=lambda x: x[1], reverse=True)
        dominant_emotions = [emotion for emotion, _ in dominant_emotions]
        
        # Determine if negative emotions are dominant
        negative_emotions = {'fear', 'anger', 'confusion', 'disappointment', 'regret'}
        negative_count = sum(1 for emotion in dominant_emotions[:3] if emotion in negative_emotions)
        negative_dominant = negative_count >= 2
        
        return {
            "sentiment_trend": trend,
            "dominant_emotions": dominant_emotions,
            "negative_dominant": negative_dominant,
            "mood_trading_correlation": 0.65  # Placeholder value
        }

# Create server instance
tradesage_server = TradeSageMCPServer()

# Start server function
def start_server():
    """Start TradeSage MCP server"""
    tradesage_server.start()
    return tradesage_server

# Get TradeSage client
def get_tradesage_client():
    """
    Get TradeSage client
    
    Returns:
        object: TradeSage client
    """
    from ..mcp_client import MCPClient
    from ..mcp_config import get_mcp_config
    
    config = get_mcp_config()
    client = MCPClient(config)
    
    return client.tradeSage
