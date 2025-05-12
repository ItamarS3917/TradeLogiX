# File: backend/mcp/servers/sentiment_analysis.py
# Purpose: MCP server for sentiment analysis and emotional impact evaluation

from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import logging
from fastapi import Depends, Request
from sqlalchemy.orm import Session
import json
import re

from ...db.database import get_db
from ...models.trade import Trade
from ...models.journal import Journal
from ..mcp_server import MCPServer
from ..tools.sentiment_analysis import analyze_text_sentiment, get_emotional_keywords

logger = logging.getLogger(__name__)

class SentimentAnalysisServer(MCPServer):
    """
    MCP server for sentiment analysis and emotional impact evaluation
    Provides enhanced analysis of trading psychology and emotional patterns
    """
    
    def __init__(self, db_session_factory=get_db):
        super().__init__({"name": "sentiment_analysis", "version": "1.0.0", "port": 8006})
        self.db_session_factory = db_session_factory
        
    def register_routes(self):
        """
        Register API routes for the sentiment analysis server
        """
        # Sentiment analysis endpoints
        @self.app.post("/api/v1/sentiment/emotional-impact")
        async def emotional_impact_endpoint(request: Request):
            params = await request.json()
            return await self.analyze_emotional_impact(params)
            
        @self.app.post("/api/v1/sentiment/analyze-text")
        async def analyze_text_endpoint(request: Request):
            params = await request.json()
            return await self.analyze_text_sentiment(params)
            
        @self.app.post("/api/v1/sentiment/emotional-keywords")
        async def emotional_keywords_endpoint(request: Request):
            params = await request.json()
            return await self.get_emotional_keywords(params)
            
        @self.app.post("/api/v1/sentiment/journal-analysis")
        async def journal_sentiment_endpoint(request: Request):
            params = await request.json()
            return await self.analyze_journal_sentiment(params)
            
        @self.app.post("/api/v1/sentiment/compare-emotions")
        async def compare_emotions_endpoint(request: Request):
            params = await request.json()
            return await self.compare_emotional_states(params)
            
        @self.app.post("/api/v1/sentiment/generate-insights")
        async def generate_insights_endpoint(request: Request):
            params = await request.json()
            return await self.generate_emotional_insights(params)
    
    async def analyze_emotional_impact(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze the relationship between emotional states and trading performance
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
            
            # Build query with filters
            query = db.query(Trade)
            
            if start_date:
                query = query.filter(Trade.entry_time >= start_date)
            if end_date:
                end_datetime = datetime.combine(end_date.date(), datetime.max.time())
                query = query.filter(Trade.entry_time <= end_datetime)
            if symbol:
                query = query.filter(Trade.symbol == symbol)
            if setup_type:
                query = query.filter(Trade.setup_type == setup_type)
            
            # Execute the query to get all trades with emotions
            trades = query.filter(Trade.emotional_state != None).all()
            
            if not trades:
                return {
                    "emotions": [],
                    "bestEmotionByWinRate": None,
                    "worstEmotionByWinRate": None,
                    "mostProfitableEmotion": None,
                    "mcpInsights": "Not enough emotional data to analyze. Try recording your emotional state before trading."
                }
            
            # Group trades by emotional state
            emotion_trades = {}
            for trade in trades:
                emotion = trade.emotional_state
                if emotion not in emotion_trades:
                    emotion_trades[emotion] = []
                
                emotion_trades[emotion].append(trade)
            
            # Calculate metrics for each emotional state
            emotion_stats = []
            for emotion, e_trades in emotion_trades.items():
                total = len(e_trades)
                if total == 0:
                    continue
                    
                wins = sum(1 for t in e_trades if t.outcome == "Win")
                losses = sum(1 for t in e_trades if t.outcome == "Loss")
                
                win_rate = round((wins / total) * 100, 2) if total > 0 else 0
                
                net_profit = sum(t.profit_loss for t in e_trades)
                average_profit = net_profit / total
                
                emotion_stats.append({
                    "name": emotion,
                    "count": total,
                    "winCount": wins,
                    "lossCount": losses,
                    "winRate": win_rate,
                    "netProfit": net_profit,
                    "averageProfit": average_profit
                })
            
            # Find best and worst emotions
            if emotion_stats:
                best_emotion_by_win_rate = max(emotion_stats, key=lambda x: x["winRate"])
                worst_emotion_by_win_rate = min(emotion_stats, key=lambda x: x["winRate"])
                most_profitable_emotion = max(emotion_stats, key=lambda x: x["averageProfit"])
            else:
                best_emotion_by_win_rate = None
                worst_emotion_by_win_rate = None
                most_profitable_emotion = None
            
            # Generate MCP-powered insights
            mcp_insights = self._generate_emotion_insights(
                emotion_stats,
                best_emotion_by_win_rate,
                worst_emotion_by_win_rate,
                most_profitable_emotion
            )
            
            return {
                "emotions": emotion_stats,
                "bestEmotionByWinRate": best_emotion_by_win_rate,
                "worstEmotionByWinRate": worst_emotion_by_win_rate,
                "mostProfitableEmotion": most_profitable_emotion,
                "mcpInsights": mcp_insights
            }
            
        except Exception as e:
            logger.error(f"Error in MCP analyze_emotional_impact: {str(e)}")
            raise
    
    async def analyze_text_sentiment(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze sentiment of text content
        """
        try:
            text = params.get('text', '')
            
            if not text:
                return {
                    "sentiment": "neutral",
                    "score": 0,
                    "emotions": {},
                    "keywords": []
                }
            
            # Call the sentiment analysis tool
            result = analyze_text_sentiment(text)
            
            return result
            
        except Exception as e:
            logger.error(f"Error in MCP analyze_text_sentiment: {str(e)}")
            raise
    
    async def get_emotional_keywords(self, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Get emotional keywords from text content
        """
        try:
            text = params.get('text', '')
            
            if not text:
                return []
            
            # Call the emotional keywords tool
            keywords = get_emotional_keywords(text)
            
            return keywords
            
        except Exception as e:
            logger.error(f"Error in MCP get_emotional_keywords: {str(e)}")
            raise
    
    async def analyze_journal_sentiment(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze sentiment trends in trading journal entries
        """
        try:
            # Extract parameters
            start_date_str = params.get('start_date')
            end_date_str = params.get('end_date')
            user_id = params.get('user_id')
            
            # Parse dates
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d") if start_date_str else None
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d") if end_date_str else None
            
            # Get database session
            db = next(self.db_session_factory())
            
            # Build query with filters
            query = db.query(Journal)
            
            if user_id:
                query = query.filter(Journal.user_id == user_id)
            if start_date:
                query = query.filter(Journal.created_at >= start_date)
            if end_date:
                end_datetime = datetime.combine(end_date.date(), datetime.max.time())
                query = query.filter(Journal.created_at <= end_datetime)
            
            # Execute the query to get all journal entries
            journals = query.order_by(Journal.created_at).all()
            
            if not journals:
                return {
                    "sentimentTrend": [],
                    "emotionDistribution": {},
                    "insights": "No journal entries found for the specified period."
                }
            
            # Analyze sentiment of each journal entry
            sentiment_trend = []
            emotion_counts = {}
            total_entries = len(journals)
            
            for journal in journals:
                if not journal.content:
                    continue
                
                # Analyze sentiment
                sentiment_result = analyze_text_sentiment(journal.content)
                
                # Add to trend
                sentiment_trend.append({
                    "date": journal.created_at.strftime("%Y-%m-%d"),
                    "sentiment": sentiment_result["sentiment"],
                    "score": sentiment_result["score"],
                    "mood": journal.mood_rating if hasattr(journal, 'mood_rating') else None
                })
                
                # Count emotions
                for emotion, value in sentiment_result["emotions"].items():
                    if emotion not in emotion_counts:
                        emotion_counts[emotion] = 0
                    emotion_counts[emotion] += value
            
            # Normalize emotion counts
            emotion_distribution = {
                emotion: count / total_entries
                for emotion, count in emotion_counts.items()
            }
            
            # Generate insights
            insights = self._generate_journal_insights(sentiment_trend, emotion_distribution)
            
            return {
                "sentimentTrend": sentiment_trend,
                "emotionDistribution": emotion_distribution,
                "insights": insights
            }
            
        except Exception as e:
            logger.error(f"Error in MCP analyze_journal_sentiment: {str(e)}")
            raise
    
    async def compare_emotional_states(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compare trading performance across different emotional states
        """
        try:
            # Extract parameters
            emotions = params.get('emotions', [])
            user_id = params.get('user_id')
            
            if not emotions:
                return {
                    "comparison": [],
                    "recommendation": "No emotions specified for comparison."
                }
            
            # Get database session
            db = next(self.db_session_factory())
            
            # Define the metrics to compare
            metrics = [
                "winRate",
                "averageProfit",
                "profitFactor",
                "averageRiskReward"
            ]
            
            # Initialize comparison results
            comparison = []
            
            # Get trades for each emotion
            for emotion in emotions:
                # Query trades with this emotion
                trades = db.query(Trade).filter(
                    Trade.emotional_state == emotion
                )
                
                if user_id:
                    trades = trades.filter(Trade.user_id == user_id)
                
                trades = trades.all()
                
                if not trades:
                    comparison.append({
                        "emotion": emotion,
                        "tradeCount": 0,
                        "metrics": {metric: None for metric in metrics}
                    })
                    continue
                
                # Calculate metrics
                total = len(trades)
                wins = sum(1 for t in trades if t.outcome == "Win")
                
                win_rate = round((wins / total) * 100, 2) if total > 0 else 0
                
                gross_profit = sum(t.profit_loss for t in trades if t.profit_loss > 0)
                gross_loss = abs(sum(t.profit_loss for t in trades if t.profit_loss < 0))
                profit_factor = round(gross_profit / gross_loss, 2) if gross_loss > 0 else float('inf')
                
                avg_profit = sum(t.profit_loss for t in trades) / total if total > 0 else 0
                
                risk_rewards = [t.actual_risk_reward for t in trades if t.actual_risk_reward is not None]
                avg_rr = sum(risk_rewards) / len(risk_rewards) if risk_rewards else 0
                
                # Add to comparison
                comparison.append({
                    "emotion": emotion,
                    "tradeCount": total,
                    "metrics": {
                        "winRate": win_rate,
                        "averageProfit": avg_profit,
                        "profitFactor": profit_factor,
                        "averageRiskReward": avg_rr
                    }
                })
            
            # Generate recommendation
            recommendation = self._generate_emotional_comparison_recommendation(comparison)
            
            return {
                "comparison": comparison,
                "recommendation": recommendation
            }
            
        except Exception as e:
            logger.error(f"Error in MCP compare_emotional_states: {str(e)}")
            raise
    
    async def generate_emotional_insights(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate personalized insights on emotional trading patterns
        """
        try:
            # Extract parameters
            user_id = params.get('user_id')
            days = params.get('days', 30)
            
            # Get database session
            db = next(self.db_session_factory())
            
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Get trades in date range
            trades_query = db.query(Trade).filter(
                Trade.entry_time >= start_date,
                Trade.entry_time <= end_date
            )
            
            if user_id:
                trades_query = trades_query.filter(Trade.user_id == user_id)
            
            trades = trades_query.all()
            
            # Get journal entries in date range
            journals_query = db.query(Journal).filter(
                Journal.created_at >= start_date,
                Journal.created_at <= end_date
            )
            
            if user_id:
                journals_query = journals_query.filter(Journal.user_id == user_id)
            
            journals = journals_query.all()
            
            # Define result structure
            result = {
                "emotionalPatterns": [],
                "tradingPsychologyProfile": {},
                "improvementSuggestions": []
            }
            
            # Analyze emotional patterns
            if trades:
                emotion_trades = {}
                for trade in trades:
                    if not trade.emotional_state:
                        continue
                    
                    emotion = trade.emotional_state
                    if emotion not in emotion_trades:
                        emotion_trades[emotion] = []
                    
                    emotion_trades[emotion].append(trade)
                
                patterns = []
                for emotion, e_trades in emotion_trades.items():
                    total = len(e_trades)
                    if total < 3:  # Need at least 3 trades to identify a pattern
                        continue
                    
                    wins = sum(1 for t in e_trades if t.outcome == "Win")
                    win_rate = round((wins / total) * 100, 2)
                    
                    avg_profit = sum(t.profit_loss for t in e_trades) / total
                    
                    pattern = {
                        "emotion": emotion,
                        "tradeCount": total,
                        "winRate": win_rate,
                        "averageProfit": avg_profit,
                        "impact": "positive" if win_rate > 50 else "negative"
                    }
                    
                    patterns.append(pattern)
                
                result["emotionalPatterns"] = patterns
            
            # Create trading psychology profile
            if trades or journals:
                # Extract journal content
                journal_text = " ".join([j.content for j in journals if j.content])
                
                # Analyze sentiment if journal content exists
                journal_sentiment = analyze_text_sentiment(journal_text) if journal_text else None
                
                # Identify dominant emotions from trades
                dominant_emotions = {}
                for trade in trades:
                    if not trade.emotional_state:
                        continue
                    
                    emotion = trade.emotional_state
                    if emotion not in dominant_emotions:
                        dominant_emotions[emotion] = 0
                    
                    dominant_emotions[emotion] += 1
                
                # Calculate psychological profile
                profile = {
                    "dominantEmotions": sorted(
                        [{"emotion": e, "frequency": c} for e, c in dominant_emotions.items()], 
                        key=lambda x: x["frequency"], 
                        reverse=True
                    )[:3],
                    "sentiment": journal_sentiment["sentiment"] if journal_sentiment else None,
                    "emotionalStability": self._calculate_emotional_stability(trades),
                    "riskTolerance": self._calculate_risk_tolerance(trades),
                    "decisionStyle": self._analyze_decision_style(trades, journals)
                }
                
                result["tradingPsychologyProfile"] = profile
            
            # Generate improvement suggestions
            result["improvementSuggestions"] = self._generate_emotional_improvement_suggestions(
                trades, journals, result["emotionalPatterns"], result["tradingPsychologyProfile"]
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error in MCP generate_emotional_insights: {str(e)}")
            raise
    
    def _generate_emotion_insights(
        self,
        emotion_stats,
        best_emotion,
        worst_emotion,
        most_profitable_emotion
    ) -> str:
        """
        Generate insights based on emotional analysis
        """
        if not emotion_stats:
            return "Not enough emotional data to generate insights."
        
        insights = []
        
        # Compare best and worst emotions
        if best_emotion and worst_emotion and best_emotion["name"] != worst_emotion["name"]:
            win_rate_diff = best_emotion["winRate"] - worst_emotion["winRate"]
            insights.append(
                f"Trading while feeling '{best_emotion['name']}' results in a {win_rate_diff:.1f}% higher "
                f"win rate compared to trading while feeling '{worst_emotion['name']}'."
            )
        
        # Most profitable emotion
        if most_profitable_emotion:
            insights.append(
                f"Your most profitable emotional state is '{most_profitable_emotion['name']}', "
                f"with an average profit of ${most_profitable_emotion['averageProfit']:.2f} per trade."
            )
        
        # Analyze negative emotions
        negative_emotions = [e for e in emotion_stats if e["winRate"] < 50 and e["count"] >= 3]
        if negative_emotions:
            worst_neg = min(negative_emotions, key=lambda x: x["winRate"])
            insights.append(
                f"Consider avoiding trading when feeling '{worst_neg['name']}', as this emotional state "
                f"has led to a {worst_neg['winRate']}% win rate over {worst_neg['count']} trades."
            )
        
        # General recommendation
        if best_emotion:
            insights.append(
                f"To improve your trading performance, try to cultivate the emotional state of "
                f"'{best_emotion['name']}' before trading sessions."
            )
        
        return " ".join(insights)
    
    def _generate_journal_insights(self, sentiment_trend, emotion_distribution) -> str:
        """
        Generate insights based on journal sentiment analysis
        """
        if not sentiment_trend:
            return "No journal entries to analyze."
        
        insights = []
        
        # Analyze sentiment trend
        sentiment_scores = [entry["score"] for entry in sentiment_trend]
        avg_sentiment = sum(sentiment_scores) / len(sentiment_scores)
        
        if avg_sentiment > 0.2:
            insights.append("Your journal entries show a generally positive outlook, which may contribute to better trading decisions.")
        elif avg_sentiment < -0.2:
            insights.append("Your journal entries indicate a negative outlook, which could be affecting your trading performance.")
        else:
            insights.append("Your journal entries show a balanced emotional outlook.")
        
        # Identify dominant emotions
        if emotion_distribution:
            dominant_emotion = max(emotion_distribution.items(), key=lambda x: x[1])
            insights.append(f"Your journal entries frequently express '{dominant_emotion[0]}', which represents {dominant_emotion[1]:.1%} of emotional content.")
        
        # Look for patterns
        if len(sentiment_trend) >= 5:
            recent_trend = sentiment_trend[-5:]
            recent_scores = [entry["score"] for entry in recent_trend]
            
            if all(score > 0 for score in recent_scores):
                insights.append("Your recent journal entries show consistently positive sentiment, suggesting improved trading psychology.")
            elif all(score < 0 for score in recent_scores):
                insights.append("Your recent journal entries show consistently negative sentiment, which may be impacting your trading decisions.")
        
        return " ".join(insights)
    
    def _generate_emotional_comparison_recommendation(self, comparison) -> str:
        """
        Generate recommendation based on emotional state comparison
        """
        if not comparison or all(comp["tradeCount"] == 0 for comp in comparison):
            return "Not enough trading data to compare emotional states."
        
        valid_comparisons = [comp for comp in comparison if comp["tradeCount"] >= 3]
        if not valid_comparisons:
            return "More trades needed for each emotional state to make meaningful comparisons."
        
        recommendation = []
        
        # Find best emotion for win rate
        best_win_rate = max(valid_comparisons, key=lambda x: x["metrics"]["winRate"])
        recommendation.append(
            f"Trading while feeling '{best_win_rate['emotion']}' gives you the highest win rate at {best_win_rate['metrics']['winRate']}%."
        )
        
        # Find best emotion for profitability
        best_profit = max(valid_comparisons, key=lambda x: x["metrics"]["averageProfit"])
        if best_profit["emotion"] != best_win_rate["emotion"]:
            recommendation.append(
                f"However, trading while feeling '{best_profit['emotion']}' results in the highest average profit at ${best_profit['metrics']['averageProfit']:.2f} per trade."
            )
        
        # Find worst emotion
        worst_emotion = min(valid_comparisons, key=lambda x: x["metrics"]["winRate"])
        if worst_emotion["metrics"]["winRate"] < 40:
            recommendation.append(
                f"Consider avoiding trading when feeling '{worst_emotion['emotion']}' as it has led to a low win rate of {worst_emotion['metrics']['winRate']}%."
            )
        
        # Overall recommendation
        recommendation.append(
            f"Based on your historical performance, try to trade more when feeling '{best_profit['emotion']}' for optimal results."
        )
        
        return " ".join(recommendation)
    
    def _calculate_emotional_stability(self, trades) -> Dict[str, Any]:
        """
        Calculate emotional stability based on trade history
        """
        if not trades or not any(t.emotional_state for t in trades):
            return {
                "score": None,
                "level": "unknown",
                "description": "Not enough emotional data to analyze stability."
            }
        
        # Count emotional state changes
        emotional_states = [t.emotional_state for t in trades if t.emotional_state]
        
        if len(emotional_states) < 5:
            return {
                "score": None,
                "level": "insufficient_data",
                "description": "More emotional data needed to analyze stability."
            }
        
        # Calculate changes
        changes = sum(1 for i in range(1, len(emotional_states)) if emotional_states[i] != emotional_states[i-1])
        change_ratio = changes / (len(emotional_states) - 1)
        
        # Normalize to 0-100 score (lower change ratio = higher stability)
        stability_score = round(100 * (1 - change_ratio))
        
        # Determine level
        if stability_score >= 75:
            level = "high"
            description = "You maintain consistent emotional states across multiple trading sessions."
        elif stability_score >= 50:
            level = "moderate"
            description = "You have some emotional variability between trading sessions, but generally maintain consistency."
        else:
            level = "low"
            description = "Your emotional states vary significantly between trading sessions."
        
        return {
            "score": stability_score,
            "level": level,
            "description": description
        }
    
    def _calculate_risk_tolerance(self, trades) -> Dict[str, Any]:
        """
        Calculate risk tolerance based on trade history
        """
        if not trades:
            return {
                "score": None,
                "level": "unknown",
                "description": "Not enough trade data to analyze risk tolerance."
            }
        
        # Extract risk/reward ratios
        risk_rewards = [t.planned_risk_reward for t in trades if t.planned_risk_reward is not None]
        
        if not risk_rewards or len(risk_rewards) < 5:
            return {
                "score": None,
                "level": "insufficient_data",
                "description": "More trade data needed to analyze risk tolerance."
            }
        
        # Calculate average R:R
        avg_rr = sum(risk_rewards) / len(risk_rewards)
        
        # Calculate max drawdown (as a proxy for risk tolerance)
        pnl_values = [t.profit_loss for t in trades]
        max_drawdown = self._calculate_max_drawdown(pnl_values)
        
        # Normalize to 0-100 score (higher R:R and lower drawdown = higher risk tolerance)
        rr_score = min(100, max(0, 50 * avg_rr))
        drawdown_score = min(100, max(0, 100 * (1 - max_drawdown / 100)))
        
        risk_score = round((rr_score + drawdown_score) / 2)
        
        # Determine level
        if risk_score >= 75:
            level = "high"
            description = "You're comfortable taking significant risks in pursuit of higher returns."
        elif risk_score >= 50:
            level = "moderate"
            description = "You balance risk and reward, neither overly conservative nor aggressive."
        else:
            level = "low"
            description = "You prefer conservative trades with lower risk exposure."
        
        return {
            "score": risk_score,
            "level": level,
            "description": description
        }
    
    def _analyze_decision_style(self, trades, journals) -> Dict[str, Any]:
        """
        Analyze trading decision style based on trade and journal data
        """
        if not trades and not journals:
            return {
                "style": "unknown",
                "description": "Not enough data to analyze decision style."
            }
        
        # Extract indicators from trade data
        plan_adherence = [t.plan_adherence for t in trades if t.plan_adherence is not None]
        trade_notes = [t.notes for t in trades if t.notes]
        
        # Extract content from journals
        journal_content = " ".join([j.content for j in journals if j.content])
        
        # Check for indicators of different decision styles
        intuitive_indicators = 0
        analytical_indicators = 0
        
        # Plan adherence (higher = more analytical)
        if plan_adherence:
            avg_adherence = sum(plan_adherence) / len(plan_adherence)
            if avg_adherence > 7:
                analytical_indicators += 2
            elif avg_adherence < 4:
                intuitive_indicators += 2
        
        # Keywords in trade notes
        all_notes = " ".join(trade_notes)
        
        analytical_keywords = ["analysis", "pattern", "indicator", "strategy", "plan", "data", "calculation", "risk", "probability"]
        intuitive_keywords = ["feel", "sense", "gut", "instinct", "intuition", "hunch", "emotion", "feeling"]
        
        for keyword in analytical_keywords:
            if re.search(r'\b' + keyword + r'\b', all_notes, re.IGNORECASE):
                analytical_indicators += 1
        
        for keyword in intuitive_keywords:
            if re.search(r'\b' + keyword + r'\b', all_notes, re.IGNORECASE):
                intuitive_indicators += 1
        
        # Journal content analysis
        for keyword in analytical_keywords:
            if re.search(r'\b' + keyword + r'\b', journal_content, re.IGNORECASE):
                analytical_indicators += 0.5
        
        for keyword in intuitive_keywords:
            if re.search(r'\b' + keyword + r'\b', journal_content, re.IGNORECASE):
                intuitive_indicators += 0.5
        
        # Determine style
        if analytical_indicators > intuitive_indicators * 1.5:
            style = "analytical"
            description = "You take a methodical, data-driven approach to trading decisions."
        elif intuitive_indicators > analytical_indicators * 1.5:
            style = "intuitive"
            description = "You rely heavily on instinct and market feel for trading decisions."
        else:
            style = "balanced"
            description = "You blend analytical methods with intuitive judgments in your trading approach."
        
        return {
            "style": style,
            "description": description,
            "analyticalScore": analytical_indicators,
            "intuitiveScore": intuitive_indicators
        }
    
    def _calculate_max_drawdown(self, pnl_values) -> float:
        """
        Calculate maximum drawdown from a list of profit/loss values
        """
        if not pnl_values:
            return 0
        
        # Calculate cumulative P&L
        cum_pnl = [0]
        for pnl in pnl_values:
            cum_pnl.append(cum_pnl[-1] + pnl)
        
        # Calculate running maximum
        running_max = [cum_pnl[0]]
        for i in range(1, len(cum_pnl)):
            running_max.append(max(running_max[i-1], cum_pnl[i]))
        
        # Calculate drawdowns
        drawdowns = [((running_max[i] - cum_pnl[i]) / max(1, running_max[i])) * 100 for i in range(len(cum_pnl))]
        
        return max(drawdowns) if drawdowns else 0
    
    def _generate_emotional_improvement_suggestions(self, trades, journals, emotional_patterns, psychology_profile) -> List[str]:
        """
        Generate personalized suggestions for emotional trading improvement
        """
        suggestions = []
        
        # Based on emotional patterns
        if emotional_patterns:
            negative_patterns = [p for p in emotional_patterns if p["impact"] == "negative"]
            positive_patterns = [p for p in emotional_patterns if p["impact"] == "positive"]
            
            if negative_patterns:
                worst_pattern = min(negative_patterns, key=lambda x: x["winRate"])
                suggestions.append(
                    f"Avoid trading when feeling {worst_pattern['emotion']}. Consider taking a break or using "
                    f"relaxation techniques when this emotion arises."
                )
            
            if positive_patterns:
                best_pattern = max(positive_patterns, key=lambda x: x["winRate"])
                suggestions.append(
                    f"Cultivate the emotional state of {best_pattern['emotion']} before trading sessions. "
                    f"This state has led to your best performance with a {best_pattern['winRate']}% win rate."
                )
        
        # Based on psychology profile
        if psychology_profile:
            # Decision style recommendations
            decision_style = psychology_profile.get("decisionStyle", {}).get("style")
            
            if decision_style == "analytical":
                suggestions.append(
                    "Your analytical approach is an asset, but consider developing more intuitive awareness "
                    "of market sentiment. Try journaling about market 'feel' alongside your analysis."
                )
            elif decision_style == "intuitive":
                suggestions.append(
                    "While your intuition serves you well, adding more structured analysis could improve results. "
                    "Consider documenting your trading plan more thoroughly and tracking adherence."
                )
            
            # Emotional stability recommendations
            stability = psychology_profile.get("emotionalStability", {}).get("level")
            
            if stability == "low":
                suggestions.append(
                    "Work on emotional consistency during trading. Consider meditation, breathing exercises, "
                    "or a pre-trading routine to stabilize your emotional state."
                )
            
            # Risk tolerance recommendations
            risk_level = psychology_profile.get("riskTolerance", {}).get("level")
            
            if risk_level == "high":
                suggestions.append(
                    "Your high risk tolerance can lead to greater rewards but also larger drawdowns. "
                    "Consider implementing stricter position sizing rules to protect your capital."
                )
            elif risk_level == "low":
                suggestions.append(
                    "Your conservative approach preserves capital but may limit profits. "
                    "Consider gradually increasing position size when your confidence is high."
                )
        
        # General suggestions if not enough data
        if not suggestions:
            suggestions = [
                "Keep a detailed trading journal that includes your emotional state before, during, and after trades.",
                "Practice mindfulness techniques to maintain emotional balance during market volatility.",
                "Develop a clear trading plan and measure how well you adhere to it in different emotional states.",
                "Track your performance across different market conditions to identify when your psychology helps or hinders you."
            ]
        
        return suggestions[:3]  # Return top 3 most relevant suggestions

# Create an instance of the MCP server
sentiment_analysis_mcp_server = SentimentAnalysisServer()
