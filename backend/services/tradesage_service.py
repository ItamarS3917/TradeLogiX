# File: backend/services/tradesage_service.py
# Purpose: Service for handling TradeSage AI assistant functionality

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from ..db.repository import TradeRepository, UserRepository, JournalRepository
from ..mcp.servers.ai_server import get_ai_client
from ..mcp.tools.pattern_recognition import identify_trade_patterns, detect_mcp_complex_patterns
from ..mcp.tools.sentiment_analysis import analyze_text_sentiment

class TradeSageService:
    """
    Service for the TradeSage AI assistant functionality
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.trade_repository = TradeRepository(db)
        self.user_repository = UserRepository(db)
        self.journal_repository = JournalRepository(db)
        
        # MCP feature flags
        self.use_advanced_mcp = True
        
    async def analyze_trading_patterns(self, user_id: int, date_range: Optional[Dict[str, datetime]] = None) -> Dict[str, Any]:
        """
        Analyze trading patterns for a user
        
        Args:
            user_id: ID of the user
            date_range: Optional date range for analysis
            
        Returns:
            Dictionary containing analysis results
        """
        # Get user trades
        trades = self.trade_repository.get_by_user(user_id, date_range)
        
        if not trades:
            return {
                "message": "Not enough trade data for analysis",
                "insights": []
            }
        
        # Prepare data for analysis
        trade_data = [self._extract_trade_data(trade) for trade in trades]
        
        # Use MCP pattern recognition tools first
        patterns = []
        complex_patterns = []
        
        # Standard pattern recognition
        patterns = identify_trade_patterns(trade_data)
        
        # Enhanced MCP pattern recognition if enabled
        if self.use_advanced_mcp and len(trade_data) >= 5:
            complex_patterns = detect_mcp_complex_patterns(trade_data)
            
        # Get user preferences for personalization
        user = self.user_repository.get_by_id(user_id)
        user_preferences = user.preferences if user and hasattr(user, 'preferences') else {}
        
        # Get AI client from MCP for enhanced insights
        ai_client = await get_ai_client()
        
        # Send data to AI for analysis
        analysis_result = await ai_client.analyze_trading_patterns(
            trade_data=trade_data,
            user_preferences=user_preferences
        )
        
        # Combine MCP patterns with AI analysis
        insights = analysis_result.get("insights", [])
        recommendations = analysis_result.get("recommendations", [])
        
        # Add pattern insights and recommendations
        for pattern in patterns + complex_patterns:
            if pattern.get("confidence", 0) > 0.7:  # Only include high confidence patterns
                insights.append({
                    "type": "pattern",
                    "name": pattern.get("name", "Pattern"),
                    "description": pattern.get("description", "No description"),
                    "confidence": pattern.get("confidence", 0.0),
                    "pattern_type": pattern.get("type", "unknown")
                })
                
                if "recommendation" in pattern:
                    recommendations.append(pattern["recommendation"])
        
        # Generate summary based on patterns
        summary = self._generate_summary_from_patterns(patterns + complex_patterns)
        
        # Enhanced return with pattern data
        return {
            "insights": insights,
            "recommendations": recommendations,
            "summary": summary or analysis_result.get("summary", "Analysis complete."),
            "patterns": patterns,
            "complex_patterns": complex_patterns,
            "mcp_enhanced": self.use_advanced_mcp
        }
    
    async def get_performance_insights(self, user_id: int) -> Dict[str, Any]:
        """
        Get performance insights for a user
        
        Args:
            user_id: ID of the user
            
        Returns:
            Dictionary containing performance insights
        """
        # Get user trades for last 30 days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        date_range = {"start": start_date, "end": end_date}
        
        trades = self.trade_repository.get_by_user(user_id, date_range)
        
        # Get AI client from MCP
        ai_client = await get_ai_client()
        
        # Prepare data for analysis
        trade_data = [self._extract_trade_data(trade) for trade in trades]
        
        # Get performance insights from AI
        insights = await ai_client.get_performance_insights(trade_data)
        
        return insights
    
    async def generate_improvement_plan(self, user_id: int) -> Dict[str, Any]:
        """
        Generate an improvement plan for a user
        
        Args:
            user_id: ID of the user
            
        Returns:
            Dictionary containing improvement plan
        """
        # Get user trades
        trades = self.trade_repository.get_by_user(user_id)
        
        if not trades:
            return {
                "message": "Not enough trade data for analysis",
                "strengths": [],
                "weaknesses": [],
                "plan": {"shortTerm": [], "mediumTerm": [], "longTerm": []},
                "timeline": "Unable to generate timeline due to insufficient data."
            }
        
        # Prepare data for analysis
        trade_data = [self._extract_trade_data(trade) for trade in trades]
        
        # Get user journals for emotional context
        journals = self.journal_repository.get_by_user_id(user_id)
        journal_data = []
        
        if journals:
            for journal in journals:
                journal_data.append({
                    "id": journal.id,
                    "date": journal.date.isoformat() if journal.date else None,
                    "content": journal.content,
                    "mood_rating": journal.mood_rating if hasattr(journal, 'mood_rating') else None,
                    "tags": journal.tags if hasattr(journal, 'tags') else None
                })
        
        # Use MCP pattern recognition
        complex_patterns = []
        if self.use_advanced_mcp and len(trade_data) >= 10:
            complex_patterns = detect_mcp_complex_patterns(trade_data)
        
        # Get user goals and preferences
        user = self.user_repository.get_by_id(user_id)
        user_goals = user.goals if user and hasattr(user, 'goals') else []
        user_preferences = user.preferences if user and hasattr(user, 'preferences') else {}
        
        # Get AI client from MCP
        ai_client = await get_ai_client()
        
        # Generate improvement plan from AI
        improvement_plan = await ai_client.generate_improvement_plan(
            trade_data=trade_data,
            user_goals=user_goals,
            user_preferences=user_preferences
        )
        
        # Enhance plan with MCP pattern insights
        strengths = improvement_plan.get("strengths", [])
        weaknesses = improvement_plan.get("weaknesses", [])
        
        # Add insights from complex patterns
        for pattern in complex_patterns:
            if pattern.get("confidence", 0) > 0.75:  # Only high confidence patterns
                if pattern.get("description") and pattern.get("name"):
                    pattern_insight = f"{pattern['name']}: {pattern['description']}"
                    
                    # Determine if this is a strength or weakness
                    if "optimal" in pattern.get("type", "") or "correlation" in pattern.get("type", ""):
                        strengths.append(pattern_insight)
                    else:
                        weaknesses.append(pattern_insight)
        
        # Add pattern-specific actions to the plan
        plan = improvement_plan.get("plan", {"shortTerm": [], "mediumTerm": [], "longTerm": []})
        
        for pattern in complex_patterns:
            if pattern.get("confidence", 0) > 0.7 and "recommendation" in pattern:
                # Add to appropriate time frame based on pattern type
                if pattern.get("type") in ["emotional_impact", "plan_adherence_correlation", "revenge_trading", "overtrading"]:
                    # These require immediate action
                    plan["shortTerm"].append({
                        "action": pattern["recommendation"],
                        "timeframe": "2 weeks",
                        "measurable": "Track in trading journal"
                    })
                elif pattern.get("type") in ["risk_reward_correlation", "trade_duration_impact", "session_profitability"]:
                    # These are more strategic
                    plan["mediumTerm"].append({
                        "action": pattern["recommendation"],
                        "timeframe": "1 month",
                        "measurable": "Compare metrics before and after implementation"
                    })
                else:
                    # Longer-term changes
                    plan["longTerm"].append({
                        "action": pattern["recommendation"],
                        "timeframe": "3 months",
                        "measurable": "Gradual implementation with periodic assessment"
                    })
        
        # Enhanced return
        return {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "plan": plan,
            "timeline": improvement_plan.get("timeline", "Implementation over the next 3 months."),
            "mcp_enhanced": bool(complex_patterns),
            "patterns": complex_patterns
        }
    
    async def answer_trading_question(self, user_id: int, question: str) -> Dict[str, Any]:
        """
        Get an answer to a trading-related question
        
        Args:
            user_id: ID of the user
            question: The user's question
            
        Returns:
            Dictionary containing the answer
        """
        # Get recent user trades for context
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        date_range = {"start": start_date, "end": end_date}
        
        trades = self.trade_repository.get_by_user(user_id, date_range)
        
        # Get AI client from MCP
        ai_client = await get_ai_client()
        
        # Prepare data for context
        trade_data = [self._extract_trade_data(trade) for trade in trades]
        
        # Get answer from AI
        answer = await ai_client.answer_question(
            question=question,
            trade_data=trade_data,
            user_id=user_id
        )
        
        return answer
    
    def _extract_trade_data(self, trade) -> Dict[str, Any]:
        """
        Extract relevant data from a trade object for AI analysis
        
        Args:
            trade: Trade object
            
        Returns:
            Dictionary containing extracted trade data
        """
        return {
            "id": trade.id,
            "symbol": trade.symbol,
            "setup_type": trade.setup_type,
            "entry_price": trade.entry_price,
            "exit_price": trade.exit_price,
            "position_size": trade.position_size,
            "entry_time": trade.entry_time.isoformat() if trade.entry_time else None,
            "exit_time": trade.exit_time.isoformat() if trade.exit_time else None,
            "planned_risk_reward": trade.planned_risk_reward if hasattr(trade, 'planned_risk_reward') else None,
            "actual_risk_reward": trade.actual_risk_reward if hasattr(trade, 'actual_risk_reward') else None,
            "outcome": trade.outcome,
            "profit_loss": trade.profit_loss,
            "emotional_state": trade.emotional_state if hasattr(trade, 'emotional_state') else None,
            "plan_adherence": trade.plan_adherence if hasattr(trade, 'plan_adherence') else None,
            "notes": trade.notes if hasattr(trade, 'notes') else None,
            "tags": trade.tags if hasattr(trade, 'tags') else None,
            "created_at": trade.created_at.isoformat() if hasattr(trade, 'created_at') and trade.created_at else None,
        }
    
    def _generate_summary_from_patterns(self, patterns: List[Dict[str, Any]]) -> str:
        """
        Generate a summary based on detected patterns
        
        Args:
            patterns: List of patterns
            
        Returns:
            Summary string
        """
        if not patterns:
            return None
            
        # Filter for high confidence patterns
        high_confidence_patterns = [p for p in patterns if p.get("confidence", 0) > 0.7]
        
        if not high_confidence_patterns:
            return None
            
        # Count pattern types
        pattern_types = {}
        for pattern in high_confidence_patterns:
            pattern_type = pattern.get("type", "unknown")
            if pattern_type not in pattern_types:
                pattern_types[pattern_type] = 0
            pattern_types[pattern_type] += 1
        
        # Generate summary
        summary = "Analysis of your trading data has identified several significant patterns. "
        
        # Add most confident pattern first
        most_confident = max(high_confidence_patterns, key=lambda p: p.get("confidence", 0))
        summary += f"Most notably, {most_confident.get('description')}. "
        
        # Add pattern type counts
        if len(pattern_types) > 1:
            summary += "We've identified patterns related to "
            pattern_descriptions = []
            
            for pattern_type, count in pattern_types.items():
                readable_type = pattern_type.replace("_", " ")
                pattern_descriptions.append(f"{readable_type} ({count})")
                
            summary += ", ".join(pattern_descriptions[:-1])
            if len(pattern_descriptions) > 1:
                summary += f" and {pattern_descriptions[-1]}"
            else:
                summary += pattern_descriptions[0]
            summary += ". "
        
        # Add recommendation count
        recommendation_count = sum(1 for p in high_confidence_patterns if "recommendation" in p)
        if recommendation_count > 0:
            summary += f"Based on these patterns, we've generated {recommendation_count} specific recommendations to help improve your trading performance."
        
        return summary

    def analyze_emotional_patterns(self, journal_entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze emotional patterns from journal entries
        
        Args:
            journal_entries: List of journal entries
            
        Returns:
            Dictionary containing emotional analysis
        """
        if not journal_entries:
            return {
                "dominant_emotions": [],
                "sentiment_trend": "neutral",
                "negative_dominant": False,
                "recommendations": []
            }
        
        # Analyze sentiment for each journal
        sentiment_results = []
        
        for journal in journal_entries:
            content = journal.get("content", "")
            if content:
                sentiment = analyze_text_sentiment(content)
                sentiment_results.append({
                    "journal_id": journal.get("id"),
                    "date": journal.get("date"),
                    "sentiment": sentiment
                })
        
        if not sentiment_results:
            return {
                "dominant_emotions": [],
                "sentiment_trend": "neutral",
                "negative_dominant": False,
                "recommendations": []
            }
        
        # Identify emotional trends
        all_emotions = {}
        sentiment_scores = []
        
        for result in sentiment_results:
            sentiment = result.get("sentiment", {})
            emotions = sentiment.get("emotions", {})
            score = sentiment.get("score", 0)
            
            sentiment_scores.append((result.get("date"), score))
            
            for emotion, value in emotions.items():
                if emotion not in all_emotions:
                    all_emotions[emotion] = 0
                all_emotions[emotion] += value
        
        # Sort emotions by frequency
        dominant_emotions = sorted(all_emotions.items(), key=lambda x: x[1], reverse=True)
        dominant_emotions = [emotion for emotion, _ in dominant_emotions[:5]]  # Top 5 emotions
        
        # Determine if negative emotions are dominant
        negative_emotions = {'fear', 'anger', 'anxiety', 'disappointment', 'regret', 'frustrated', 'confusion'}
        negative_count = sum(1 for emotion in dominant_emotions[:3] if emotion.lower() in negative_emotions)
        negative_dominant = negative_count >= 2
        
        # Calculate sentiment trend
        if len(sentiment_scores) >= 3:
            # Sort by date
            sentiment_scores.sort(key=lambda x: x[0] if x[0] else "")
            
            # Split into first and second half
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
        
        # Generate recommendations
        recommendations = []
        
        if negative_dominant:
            recommendations.append(
                "Consider mindfulness or relaxation techniques before trading to manage dominant negative emotions."
            )
        
        if trend == "negative":
            recommendations.append(
                "Your emotional state appears to be trending negative. Consider taking a short break from trading to reset."
            )
        
        # Add default recommendation if none generated
        if not recommendations:
            recommendations.append(
                "Continue journaling regularly to track your emotional patterns in relation to your trading performance."
            )
        
        return {
            "dominant_emotions": dominant_emotions,
            "sentiment_trend": trend,
            "negative_dominant": negative_dominant,
            "recommendations": recommendations
        }

    def analyze_plan_adherence(self, trades: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze plan adherence and its impact on trading results
        
        Args:
            trades: List of trades
            
        Returns:
            Dictionary containing plan adherence analysis
        """
        if not trades:
            return {
                "adherence_correlation": 0,
                "high_adherence_win_rate": 0,
                "low_adherence_win_rate": 0,
                "recommendation": "Insufficient data for plan adherence analysis."
            }
        
        # Filter trades with plan adherence data
        valid_trades = [t for t in trades if t.get("plan_adherence") is not None]
        
        if len(valid_trades) < 5:  # Need at least 5 trades
            return {
                "adherence_correlation": 0,
                "high_adherence_win_rate": 0,
                "low_adherence_win_rate": 0,
                "recommendation": "Insufficient plan adherence data for analysis."
            }
        
        # Categorize adherence
        high_adherence_trades = [t for t in valid_trades if t.get("plan_adherence", 0) >= 7]
        low_adherence_trades = [t for t in valid_trades if t.get("plan_adherence", 0) <= 3]
        
        # Calculate win rates
        high_adherence_wins = sum(1 for t in high_adherence_trades if t.get("outcome") == "Win")
        low_adherence_wins = sum(1 for t in low_adherence_trades if t.get("outcome") == "Win")
        
        high_adherence_win_rate = (high_adherence_wins / len(high_adherence_trades) * 100) if high_adherence_trades else 0
        low_adherence_win_rate = (low_adherence_wins / len(low_adherence_trades) * 100) if low_adherence_trades else 0
        
        # Calculate correlation
        correlation = 0
        if high_adherence_trades and low_adherence_trades:
            correlation = (high_adherence_win_rate - low_adherence_win_rate) / 100
        
        # Generate recommendation
        if correlation > 0.3:  # Strong positive correlation
            recommendation = "Your trading plan is highly effective when followed. Create a pre-trade checklist to ensure high adherence on every trade."
        elif correlation > 0.1:  # Moderate correlation
            recommendation = "Following your trading plan correlates with better results. Consider reviewing and refining your plan to make it more practical to follow consistently."
        elif correlation > -0.1:  # Weak correlation
            recommendation = "Your plan adherence has minimal impact on results. Your plan may need significant revision to better capture profitable setups."
        else:  # Negative correlation
            recommendation = "Surprisingly, deviating from your plan correlates with better results. Your current plan may not be aligned with your trading strengths."
        
        return {
            "adherence_correlation": correlation,
            "high_adherence_win_rate": high_adherence_win_rate,
            "low_adherence_win_rate": low_adherence_win_rate,
            "high_adherence_trades": len(high_adherence_trades),
            "low_adherence_trades": len(low_adherence_trades),
            "recommendation": recommendation
        }