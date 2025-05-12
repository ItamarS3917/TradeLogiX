# File: backend/mcp/tools/ai_integration.py
# Purpose: Integration with Claude for AI-powered trading insights

import os
import logging
import json
import httpx
import asyncio
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ClaudeClient:
    """
    Client for Anthropic Claude API integration
    Provides methods for generating trading insights and answering questions
    """
    
    def __init__(self, api_key: Optional[str] = None, model: str = "claude-3-sonnet-20240229"):
        """
        Initialize Claude client
        
        Args:
            api_key (Optional[str], optional): Anthropic API key. Defaults to None.
            model (str, optional): Claude model to use. Defaults to "claude-3-sonnet-20240229".
        """
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        self.model = model
        self.api_url = "https://api.anthropic.com/v1/messages"
        self.client = httpx.AsyncClient(timeout=120.0)  # 2-minute timeout for API calls
        
        # Verify we have an API key
        if not self.api_key:
            logger.warning("No Anthropic API key provided. The Claude integration will not work.")
    
    async def analyze_trading_patterns(self, trades: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze trading patterns using Claude
        
        Args:
            trades (List[Dict[str, Any]]): List of trades
            
        Returns:
            Dict[str, Any]: Analysis results
        """
        try:
            if not self.api_key:
                # Return placeholder data if no API key
                return self._generate_mock_trading_insights()
            
            # Prepare trade data summary for Claude
            trade_summary = self._prepare_trade_summary(trades)
            
            # Create prompt for Claude
            system_prompt = """You are TradeSage, an expert trading coach and analyzer specialized in helping day traders improve their performance.
You are analyzing trading data to identify patterns, strengths, weaknesses, and actionable insights.
Your goal is to provide specific, data-driven insights that will help the trader improve their performance.
Focus on identifying patterns in the data such as:
1. Time of day patterns
2. Emotional state impacts
3. Setup type performance
4. Plan adherence correlation
5. Position sizing insights

Provide clear, concise insights with specific recommendations."""
            
            user_prompt = f"""Please analyze the following trading data summary and identify key patterns, strengths, weaknesses, and actionable insights:

{trade_summary}

Provide your analysis in the following format:
1. A brief summary of the overall performance
2. 3-5 key patterns identified in the trading data
3. 3-5 actionable recommendations based on the patterns
4. A concise conclusion about the trader's performance"""
            
            # Make request to Claude API
            response = await self._call_claude_api(system_prompt, user_prompt)
            
            # Parse and structure the response
            return self._parse_trading_insight_response(response)
            
        except Exception as e:
            logger.error(f"Error analyzing trading patterns with Claude: {str(e)}")
            return self._generate_mock_trading_insights()
    
    async def answer_trading_question(self, question: str, trading_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Use Claude to answer a trading-related question
        
        Args:
            question (str): User's question
            trading_context (Dict[str, Any]): Trading context (stats, recent trades, etc.)
            
        Returns:
            Dict[str, Any]: Answer
        """
        try:
            if not self.api_key:
                # Return placeholder data if no API key
                return {
                    "answer": "I don't have access to Claude at the moment. Here's a general response to your question.",
                    "confidence": 0.5,
                    "sources": []
                }
            
            # Prepare trading context summary for Claude
            context_summary = self._prepare_trading_context(trading_context)
            
            # Create prompt for Claude
            system_prompt = """You are TradeSage, an expert trading coach and advisor specialized in helping day traders improve their performance.
You are answering specific questions about trading performance based on the trader's data.
Focus on providing accurate, data-driven answers that are tailored to the trader's specific patterns.
Be specific and actionable in your advice. Avoid generic trading advice.
Consider emotional aspects of trading as well as technical patterns.
Your responses should be concise, clear and directly address the trader's question."""
            
            user_prompt = f"""Based on the following trading context, please answer this question:

QUESTION: {question}

TRADING CONTEXT:
{context_summary}

Provide a clear, concise answer that directly addresses the question based on the trading data provided."""
            
            # Make request to Claude API
            response = await self._call_claude_api(system_prompt, user_prompt)
            
            # Return structured response
            return {
                "answer": response.strip(),
                "confidence": 0.85,  # Default confidence
                "sources": [{"type": "trading_data", "count": trading_context.get("trade_count", 0)}]
            }
            
        except Exception as e:
            logger.error(f"Error answering trading question with Claude: {str(e)}")
            return {
                "answer": f"I wasn't able to process your question due to a technical error. Here's what happened: {str(e)}",
                "confidence": 0.0,
                "sources": []
            }
    
    async def generate_improvement_plan(self, trades: List[Dict[str, Any]], journal_entries: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate a personalized trading improvement plan using Claude
        
        Args:
            trades (List[Dict[str, Any]]): List of trades
            journal_entries (List[Dict[str, Any]], optional): List of journal entries. Defaults to None.
            
        Returns:
            Dict[str, Any]: Improvement plan
        """
        try:
            if not self.api_key:
                # Return placeholder data if no API key
                return self._generate_mock_improvement_plan()
            
            # Prepare trade data and journal summaries for Claude
            trade_summary = self._prepare_trade_summary(trades)
            journal_summary = self._prepare_journal_summary(journal_entries) if journal_entries else ""
            
            # Create prompt for Claude
            system_prompt = """You are TradeSage, an expert trading coach and advisor specialized in helping day traders improve their performance.
You are creating a personalized improvement plan based on detailed analysis of the trader's performance data.
Focus on identifying strengths to leverage, weaknesses to address, and specific actionable steps the trader can take.
The plan should include short-term (1-2 weeks), medium-term (1-2 months), and long-term (3-6 months) goals and actions.
Make all recommendations specific, measurable, achievable, relevant, and time-bound (SMART).
Be direct and focused in your advice, avoiding generic trading wisdom."""
            
            user_prompt = f"""Please create a personalized trading improvement plan based on the following data:

TRADING DATA:
{trade_summary}

JOURNAL ENTRIES SUMMARY:
{journal_summary}

Create an improvement plan with the following sections:
1. 3-5 key strengths the trader should leverage
2. 3-5 weaknesses or areas for improvement
3. Short-term actions (next 1-2 weeks)
4. Medium-term actions (next 1-2 months)
5. Long-term actions (next 3-6 months)
6. A timeline for implementation

For each action, include a specific measurable outcome so the trader can track progress."""
            
            # Make request to Claude API
            response = await self._call_claude_api(system_prompt, user_prompt)
            
            # Parse and structure the response
            return self._parse_improvement_plan_response(response)
            
        except Exception as e:
            logger.error(f"Error generating improvement plan with Claude: {str(e)}")
            return self._generate_mock_improvement_plan()
    
    async def analyze_journal_entries(self, journal_entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze journal entries for sentiment and patterns using Claude
        
        Args:
            journal_entries (List[Dict[str, Any]]): List of journal entries
            
        Returns:
            Dict[str, Any]: Analysis results
        """
        try:
            if not self.api_key or not journal_entries:
                # Return placeholder data if no API key or no entries
                return {
                    "emotional_trends": {
                        "dominant_emotions": ["focus", "confidence", "uncertainty"],
                        "sentiment_trend": "stable"
                    },
                    "insights": [
                        "Consider journaling more regularly to track emotional patterns",
                        "Your emotional state appears to impact trading decisions"
                    ],
                    "recommendations": [
                        "Practice mindfulness before trading sessions",
                        "Develop a pre-trade routine to manage emotions"
                    ]
                }
            
            # Prepare journal summary for Claude
            journal_summary = self._prepare_journal_summary(journal_entries)
            
            # Create prompt for Claude
            system_prompt = """You are TradeSage, an expert trading coach with a specialization in trading psychology.
You are analyzing a trader's journal entries to identify emotional patterns, psychological factors, and their impact on trading decisions.
Focus on identifying recurring emotional states, psychological biases, and how they correlate with trading outcomes.
Provide specific, actionable recommendations to improve the trader's psychological approach to trading."""
            
            user_prompt = f"""Please analyze the following trading journal entries and identify emotional patterns, psychological factors, and their impact on trading:

{journal_summary}

Provide your analysis in the following format:
1. Dominant emotions identified in the journal entries
2. Overall sentiment trend
3. Key insights about psychological factors affecting trading
4. Specific recommendations to improve the trader's psychological approach"""
            
            # Make request to Claude API
            response = await self._call_claude_api(system_prompt, user_prompt)
            
            # Parse and structure the response
            return self._parse_journal_analysis_response(response)
            
        except Exception as e:
            logger.error(f"Error analyzing journal entries with Claude: {str(e)}")
            return {
                "emotional_trends": {
                    "dominant_emotions": ["focus", "confidence", "uncertainty"],
                    "sentiment_trend": "stable"
                },
                "insights": [
                    "Consider journaling more regularly to track emotional patterns",
                    "Your emotional state appears to impact trading decisions"
                ],
                "recommendations": [
                    "Practice mindfulness before trading sessions",
                    "Develop a pre-trade routine to manage emotions"
                ]
            }
    
    async def _call_claude_api(self, system_prompt: str, user_prompt: str) -> str:
        """
        Call Claude API with the given prompts
        
        Args:
            system_prompt (str): System prompt
            user_prompt (str): User prompt
            
        Returns:
            str: Claude's response
        """
        try:
            # Prepare request payload
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "max_tokens": 4000
            }
            
            # Prepare headers
            headers = {
                "Content-Type": "application/json",
                "X-API-Key": self.api_key,
                "anthropic-version": "2023-06-01"
            }
            
            # Make API call
            async with self.client as client:
                response = await client.post(
                    self.api_url,
                    json=payload,
                    headers=headers
                )
                
                # Check for success
                response.raise_for_status()
                
                # Parse response
                result = response.json()
                
                # Extract the assistant's message
                if "content" in result:
                    return result["content"][0]["text"]
                elif "response" in result:  # For older API versions
                    return result["response"]
                else:
                    logger.error(f"Unexpected Claude API response format: {result}")
                    raise ValueError("Unexpected API response format")
                
        except Exception as e:
            logger.error(f"Error calling Claude API: {str(e)}")
            raise
    
    def _prepare_trade_summary(self, trades: List[Dict[str, Any]]) -> str:
        """
        Prepare a summary of trades for Claude analysis
        
        Args:
            trades (List[Dict[str, Any]]): List of trades
            
        Returns:
            str: Summary of trades
        """
        # Basic stats
        total_trades = len(trades)
        if total_trades == 0:
            return "No trades available for analysis."
        
        winning_trades = [t for t in trades if t.get("outcome") == "Win"]
        losing_trades = [t for t in trades if t.get("outcome") == "Loss"]
        
        win_rate = (len(winning_trades) / total_trades) * 100 if total_trades > 0 else 0
        total_profit = sum(t.get("profit_loss", 0) for t in trades)
        avg_win = sum(t.get("profit_loss", 0) for t in winning_trades) / len(winning_trades) if winning_trades else 0
        avg_loss = sum(t.get("profit_loss", 0) for t in losing_trades) / len(losing_trades) if losing_trades else 0
        
        # Analyze by setup type
        setups = {}
        for trade in trades:
            setup = trade.get("setup_type", "Unknown")
            if setup not in setups:
                setups[setup] = {"count": 0, "wins": 0, "total_pnl": 0}
            
            setups[setup]["count"] += 1
            if trade.get("outcome") == "Win":
                setups[setup]["wins"] += 1
            setups[setup]["total_pnl"] += trade.get("profit_loss", 0)
        
        # Analyze by time of day
        time_of_day = {}
        for trade in trades:
            if not trade.get("entry_time"):
                continue
                
            try:
                hour = trade.get("entry_time").hour
                if hour not in time_of_day:
                    time_of_day[hour] = {"count": 0, "wins": 0, "total_pnl": 0}
                
                time_of_day[hour]["count"] += 1
                if trade.get("outcome") == "Win":
                    time_of_day[hour]["wins"] += 1
                time_of_day[hour]["total_pnl"] += trade.get("profit_loss", 0)
            except:
                # Skip if we can't parse the time
                pass
        
        # Analyze by emotional state
        emotions = {}
        for trade in trades:
            emotion = trade.get("emotional_state", "Unknown")
            if emotion not in emotions:
                emotions[emotion] = {"count": 0, "wins": 0, "total_pnl": 0}
            
            emotions[emotion]["count"] += 1
            if trade.get("outcome") == "Win":
                emotions[emotion]["wins"] += 1
            emotions[emotion]["total_pnl"] += trade.get("profit_loss", 0)
        
        # Format summary
        summary = f"TRADE SUMMARY:\n"
        summary += f"Total Trades: {total_trades}\n"
        summary += f"Win Rate: {win_rate:.1f}%\n"
        summary += f"Total Profit/Loss: ${total_profit:.2f}\n"
        summary += f"Average Win: ${avg_win:.2f}\n"
        summary += f"Average Loss: ${avg_loss:.2f}\n\n"
        
        # Top setups by win rate (with at least 3 trades)
        valid_setups = {k: v for k, v in setups.items() if v["count"] >= 3}
        if valid_setups:
            summary += "SETUP PERFORMANCE:\n"
            sorted_setups = sorted(valid_setups.items(), key=lambda x: (x[1]["wins"] / x[1]["count"] if x[1]["count"] > 0 else 0), reverse=True)
            
            for setup, stats in sorted_setups[:5]:  # Top 5 setups
                setup_win_rate = (stats["wins"] / stats["count"]) * 100 if stats["count"] > 0 else 0
                summary += f"- {setup}: {setup_win_rate:.1f}% win rate ({stats['wins']}/{stats['count']} trades), ${stats['total_pnl']:.2f} total P&L\n"
            summary += "\n"
        
        # Top times of day by win rate (with at least 3 trades)
        valid_times = {k: v for k, v in time_of_day.items() if v["count"] >= 3}
        if valid_times:
            summary += "TIME OF DAY PERFORMANCE:\n"
            sorted_times = sorted(valid_times.items(), key=lambda x: (x[1]["wins"] / x[1]["count"] if x[1]["count"] > 0 else 0), reverse=True)
            
            for hour, stats in sorted_times[:5]:  # Top 5 times
                time_win_rate = (stats["wins"] / stats["count"]) * 100 if stats["count"] > 0 else 0
                summary += f"- {hour}:00: {time_win_rate:.1f}% win rate ({stats['wins']}/{stats['count']} trades), ${stats['total_pnl']:.2f} total P&L\n"
            summary += "\n"
        
        # Top emotional states by win rate (with at least 3 trades)
        valid_emotions = {k: v for k, v in emotions.items() if v["count"] >= 3 and k != "Unknown"}
        if valid_emotions:
            summary += "EMOTIONAL STATE PERFORMANCE:\n"
            sorted_emotions = sorted(valid_emotions.items(), key=lambda x: (x[1]["wins"] / x[1]["count"] if x[1]["count"] > 0 else 0), reverse=True)
            
            for emotion, stats in sorted_emotions[:5]:  # Top 5 emotions
                emotion_win_rate = (stats["wins"] / stats["count"]) * 100 if stats["count"] > 0 else 0
                summary += f"- {emotion}: {emotion_win_rate:.1f}% win rate ({stats['wins']}/{stats['count']} trades), ${stats['total_pnl']:.2f} total P&L\n"
            summary += "\n"
        
        # Include sample of 5 recent trades
        recent_trades = sorted(trades, key=lambda x: x.get("entry_time", ""), reverse=True)[:5]
        if recent_trades:
            summary += "RECENT TRADES (SAMPLE):\n"
            for i, trade in enumerate(recent_trades, 1):
                summary += f"{i}. {trade.get('symbol', 'Unknown')} {trade.get('outcome', 'Unknown')}: ${trade.get('profit_loss', 0):.2f}, "
                summary += f"Setup: {trade.get('setup_type', 'Unknown')}, "
                summary += f"Emotional state: {trade.get('emotional_state', 'Unknown')}\n"
            summary += "\n"
        
        return summary
    
    def _prepare_journal_summary(self, journal_entries: List[Dict[str, Any]]) -> str:
        """
        Prepare a summary of journal entries for Claude analysis
        
        Args:
            journal_entries (List[Dict[str, Any]]): List of journal entries
            
        Returns:
            str: Summary of journal entries
        """
        if not journal_entries:
            return "No journal entries available for analysis."
        
        # Sort entries by date (descending)
        sorted_entries = sorted(journal_entries, key=lambda x: x.get("date", ""), reverse=True)
        
        # Format summary
        summary = f"JOURNAL ENTRIES SUMMARY:\n"
        summary += f"Total Journal Entries: {len(journal_entries)}\n\n"
        
        # Include sample of 5 recent entries
        recent_entries = sorted_entries[:5]
        summary += "RECENT JOURNAL ENTRIES (SAMPLE):\n"
        
        for i, entry in enumerate(recent_entries, 1):
            date = entry.get("date", "Unknown date")
            mood = entry.get("mood_rating", "N/A")
            content = entry.get("content", "No content")
            
            # Truncate long entries
            if len(content) > 300:
                content = content[:300] + "..."
            
            summary += f"{i}. Date: {date}, Mood: {mood}/10\n"
            summary += f"Content: {content}\n\n"
        
        return summary
    
    def _prepare_trading_context(self, trading_context: Dict[str, Any]) -> str:
        """
        Prepare trading context for Claude
        
        Args:
            trading_context (Dict[str, Any]): Trading context
            
        Returns:
            str: Formatted trading context
        """
        context = "TRADING CONTEXT:\n"
        
        # Overall stats
        overall_stats = trading_context.get("overall_stats", {})
        if overall_stats:
            context += "OVERALL STATS:\n"
            for key, value in overall_stats.items():
                # Format numeric values
                if isinstance(value, (int, float)):
                    if "rate" in key.lower() or "percentage" in key.lower():
                        context += f"- {key}: {value:.1f}%\n"
                    elif "pnl" in key.lower() or "profit" in key.lower() or "loss" in key.lower():
                        context += f"- {key}: ${value:.2f}\n"
                    else:
                        context += f"- {key}: {value}\n"
                else:
                    context += f"- {key}: {value}\n"
            context += "\n"
        
        # Recent trades
        recent_trades = trading_context.get("recent_trades", [])
        if recent_trades:
            context += "RECENT TRADES:\n"
            for i, trade in enumerate(recent_trades[:5], 1):  # Show up to 5 recent trades
                context += f"{i}. {trade.get('symbol', 'Unknown')} {trade.get('outcome', 'Unknown')}: ${trade.get('profit_loss', 0):.2f}, "
                context += f"Setup: {trade.get('setup_type', 'Unknown')}\n"
            context += "\n"
        
        # Setup performance
        setup_performance = trading_context.get("setup_performance", {})
        if setup_performance:
            context += "SETUP PERFORMANCE:\n"
            for setup, stats in setup_performance.items():
                win_rate = stats.get("win_rate", 0)
                profit = stats.get("profit", 0)
                context += f"- {setup}: {win_rate:.1f}% win rate, ${profit:.2f} total P&L\n"
            context += "\n"
        
        # Emotional state impact
        emotional_impact = trading_context.get("emotional_impact", {})
        if emotional_impact:
            context += "EMOTIONAL STATE IMPACT:\n"
            for emotion, stats in emotional_impact.items():
                win_rate = stats.get("win_rate", 0)
                profit = stats.get("profit", 0)
                context += f"- {emotion}: {win_rate:.1f}% win rate, ${profit:.2f} total P&L\n"
            context += "\n"
        
        return context
    
    def _parse_trading_insight_response(self, response: str) -> Dict[str, Any]:
        """
        Parse Claude's response into a structured trading insight format
        
        Args:
            response (str): Claude's response
            
        Returns:
            Dict[str, Any]: Structured insights
        """
        # Simple parsing - in a real implementation, this would be more sophisticated
        lines = response.strip().split("\n")
        
        insights = []
        recommendations = []
        summary = ""
        
        # Simple parsing based on common patterns in Claude's responses
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            # Try to identify sections based on common patterns
            if "summary" in line.lower() and not summary:
                current_section = "summary"
                continue
            elif "pattern" in line.lower() or "insight" in line.lower():
                current_section = "insights"
                continue
            elif "recommendation" in line.lower() or "action" in line.lower():
                current_section = "recommendations"
                continue
            elif "conclusion" in line.lower():
                current_section = "conclusion"
                continue
            
            # Skip empty lines
            if not line:
                continue
            
            # Process line based on current section
            if current_section == "summary":
                if not summary:
                    summary = line
            elif current_section == "insights":
                # Check if line starts with a number or bullet
                if line.startswith(("-", "•", "*")) or (line[0].isdigit() and line[1:3] in (". ", ") ")):
                    insights.append({"type": "pattern", "description": line.split(". ", 1)[-1] if ". " in line else line[2:]})
            elif current_section == "recommendations":
                # Check if line starts with a number or bullet
                if line.startswith(("-", "•", "*")) or (line[0].isdigit() and line[1:3] in (". ", ") ")):
                    recommendations.append(line.split(". ", 1)[-1] if ". " in line else line[2:])
            elif current_section == "conclusion":
                if not summary:  # Use conclusion as summary if no summary found
                    summary = line
        
        # If we didn't find structured sections, use a simpler approach
        if not insights and not recommendations:
            # Try to extract bullet points or numbered items
            for line in lines:
                line = line.strip()
                if line.startswith(("-", "•", "*")) or (line[0].isdigit() and line[1:3] in (". ", ") ")):
                    # Decide if it's more likely an insight or recommendation
                    if "should" in line.lower() or "consider" in line.lower() or "try" in line.lower():
                        recommendations.append(line.split(". ", 1)[-1] if ". " in line else line[2:])
                    else:
                        insights.append({"type": "pattern", "description": line.split(". ", 1)[-1] if ". " in line else line[2:]})
        
        # If still no summary, use the first paragraph
        if not summary and lines:
            for line in lines:
                if line.strip():
                    summary = line.strip()
                    break
        
        # Ensure we have at least something in each category
        if not insights:
            insights = [{"type": "general", "description": "Analysis completed but no specific patterns identified."}]
        
        if not recommendations:
            recommendations = ["Consider logging more trades to enable better pattern recognition."]
        
        if not summary:
            summary = "Trading pattern analysis completed."
        
        return {
            "insights": insights[:5],  # Limit to 5 insights
            "recommendations": recommendations[:5],  # Limit to 5 recommendations
            "summary": summary
        }
    
    def _parse_improvement_plan_response(self, response: str) -> Dict[str, Any]:
        """
        Parse Claude's response into a structured improvement plan format
        
        Args:
            response (str): Claude's response
            
        Returns:
            Dict[str, Any]: Structured improvement plan
        """
        # Simple parsing - in a real implementation, this would be more sophisticated
        lines = response.strip().split("\n")
        
        strengths = []
        weaknesses = []
        short_term = []
        medium_term = []
        long_term = []
        timeline = ""
        
        # Simple parsing based on common patterns in Claude's responses
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            # Try to identify sections based on common patterns
            if "strength" in line.lower():
                current_section = "strengths"
                continue
            elif "weakness" in line.lower() or "improvement" in line.lower():
                current_section = "weaknesses"
                continue
            elif "short" in line.lower() and "term" in line.lower() or "week" in line.lower():
                current_section = "short_term"
                continue
            elif "medium" in line.lower() and "term" in line.lower() or "month" in line.lower():
                current_section = "medium_term"
                continue
            elif "long" in line.lower() and "term" in line.lower():
                current_section = "long_term"
                continue
            elif "timeline" in line.lower() or "implementation" in line.lower():
                current_section = "timeline"
                continue
            
            # Skip empty lines
            if not line:
                continue
            
            # Process line based on current section
            if current_section == "strengths":
                # Check if line starts with a number or bullet
                if line.startswith(("-", "•", "*")) or (line[0].isdigit() and line[1:3] in (". ", ") ")):
                    strengths.append(line.split(". ", 1)[-1] if ". " in line else line[2:])
            elif current_section == "weaknesses":
                # Check if line starts with a number or bullet
                if line.startswith(("-", "•", "*")) or (line[0].isdigit() and line[1:3] in (". ", ") ")):
                    weaknesses.append(line.split(". ", 1)[-1] if ". " in line else line[2:])
            elif current_section == "short_term":
                # Check if line starts with a number or bullet
                if line.startswith(("-", "•", "*")) or (line[0].isdigit() and line[1:3] in (". ", ") ")):
                    action_text = line.split(". ", 1)[-1] if ". " in line else line[2:]
                    
                    # Try to extract timeframe and measurable if formatted with colons
                    timeframe = "1-2 weeks"
                    measurable = "Complete action"
                    
                    if ": " in action_text:
                        parts = action_text.split(": ")
                        action_text = parts[0]
                        if len(parts) > 1:
                            # Check if there are multiple additional parts
                            additional = parts[1].split(", ")
                            if len(additional) > 1:
                                for part in additional:
                                    if "time" in part.lower() or "week" in part.lower() or "day" in part.lower():
                                        timeframe = part
                                    else:
                                        measurable = part
                            else:
                                measurable = parts[1]
                    
                    short_term.append({
                        "action": action_text,
                        "timeframe": timeframe,
                        "measurable": measurable
                    })
            elif current_section == "medium_term":
                # Check if line starts with a number or bullet
                if line.startswith(("-", "•", "*")) or (line[0].isdigit() and line[1:3] in (". ", ") ")):
                    action_text = line.split(". ", 1)[-1] if ". " in line else line[2:]
                    
                    # Try to extract timeframe and measurable if formatted with colons
                    timeframe = "1-2 months"
                    measurable = "Complete action"
                    
                    if ": " in action_text:
                        parts = action_text.split(": ")
                        action_text = parts[0]
                        if len(parts) > 1:
                            # Check if there are multiple additional parts
                            additional = parts[1].split(", ")
                            if len(additional) > 1:
                                for part in additional:
                                    if "time" in part.lower() or "month" in part.lower() or "week" in part.lower():
                                        timeframe = part
                                    else:
                                        measurable = part
                            else:
                                measurable = parts[1]
                    
                    medium_term.append({
                        "action": action_text,
                        "timeframe": timeframe,
                        "measurable": measurable
                    })
            elif current_section == "long_term":
                # Check if line starts with a number or bullet
                if line.startswith(("-", "•", "*")) or (line[0].isdigit() and line[1:3] in (". ", ") ")):
                    action_text = line.split(". ", 1)[-1] if ". " in line else line[2:]
                    
                    # Try to extract timeframe and measurable if formatted with colons
                    timeframe = "3-6 months"
                    measurable = "Complete action"
                    
                    if ": " in action_text:
                        parts = action_text.split(": ")
                        action_text = parts[0]
                        if len(parts) > 1:
                            # Check if there are multiple additional parts
                            additional = parts[1].split(", ")
                            if len(additional) > 1:
                                for part in additional:
                                    if "time" in part.lower() or "month" in part.lower():
                                        timeframe = part
                                    else:
                                        measurable = part
                            else:
                                measurable = parts[1]
                    
                    long_term.append({
                        "action": action_text,
                        "timeframe": timeframe,
                        "measurable": measurable
                    })
            elif current_section == "timeline":
                if not timeline:
                    timeline = line
                else:
                    timeline += " " + line
        
        # If we didn't parse sufficient data, provide some defaults
        if not strengths:
            strengths = ["Consistent trading approach", "Disciplined tracking of trades", "Willingness to learn and improve"]
        
        if not weaknesses:
            weaknesses = ["Inconsistent trading results", "Needs more data for comprehensive analysis", "Potential for more detailed journaling"]
        
        if not short_term:
            short_term = [
                {"action": "Review all trades from the past two weeks", "timeframe": "1 week", "measurable": "Complete trade review document"}
            ]
        
        if not medium_term:
            medium_term = [
                {"action": "Develop a trading plan template", "timeframe": "1 month", "measurable": "Complete documented plan"}
            ]
        
        if not long_term:
            long_term = [
                {"action": "Build a consistent track record", "timeframe": "6 months", "measurable": "Positive returns for 4 out of 6 months"}
            ]
        
        if not timeline:
            timeline = "This improvement plan is designed to be implemented over the next 6 months, with regular reviews and adjustments based on performance."
        
        return {
            "strengths": strengths[:5],  # Limit to 5 strengths
            "weaknesses": weaknesses[:5],  # Limit to 5 weaknesses
            "plan": {
                "shortTerm": short_term[:3],  # Limit to 3 short-term actions
                "mediumTerm": medium_term[:3],  # Limit to 3 medium-term actions
                "longTerm": long_term[:3]  # Limit to 3 long-term actions
            },
            "timeline": timeline
        }
    
    def _parse_journal_analysis_response(self, response: str) -> Dict[str, Any]:
        """
        Parse Claude's journal analysis response
        
        Args:
            response (str): Claude's response
            
        Returns:
            Dict[str, Any]: Structured journal analysis
        """
        # Simple parsing - in a real implementation, this would be more sophisticated
        lines = response.strip().split("\n")
        
        dominant_emotions = []
        sentiment_trend = "neutral"
        insights = []
        recommendations = []
        
        # Simple parsing based on common patterns in Claude's responses
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            # Try to identify sections based on common patterns
            if "emotion" in line.lower() and "dominant" in line.lower():
                current_section = "emotions"
                continue
            elif "sentiment" in line.lower() and "trend" in line.lower():
                current_section = "sentiment"
                continue
            elif "insight" in line.lower() or "factor" in line.lower():
                current_section = "insights"
                continue
            elif "recommendation" in line.lower() or "improve" in line.lower():
                current_section = "recommendations"
                continue
            
            # Skip empty lines
            if not line:
                continue
            
            # Process line based on current section
            if current_section == "emotions":
                # Try to extract emotions from the line
                if line.startswith(("-", "•", "*")) or (line[0].isdigit() and line[1:3] in (". ", ") ")):
                    # Clean up line
                    emotion_text = line.split(". ", 1)[-1] if ". " in line else line[2:]
                    
                    # Extract emotion words
                    words = emotion_text.lower().split()
                    emotion_words = []
                    
                    for word in words:
                        # Clean up punctuation
                        word = word.strip(",.;:()\"'")
                        
                        # Common emotion words
                        common_emotions = [
                            "anxious", "anxiety", "nervous", "fear", "scared", "worried",
                            "excited", "happy", "elated", "confident", "optimistic",
                            "frustrated", "angry", "upset", "disappointed", "sad",
                            "calm", "focused", "determined", "disciplined", "patient",
                            "confused", "uncertain", "doubtful", "hesitant"
                        ]
                        
                        if word in common_emotions:
                            emotion_words.append(word)
                    
                    # Add any found emotions
                    dominant_emotions.extend(emotion_words)
                    
                    # If no specific emotions found, add the whole line as a potential emotion
                    if not emotion_words and len(emotion_text.split()) <= 3:  # If it's a short phrase, likely an emotion
                        dominant_emotions.append(emotion_text.lower())
            elif current_section == "sentiment":
                # Try to extract sentiment trend
                lower_line = line.lower()
                
                if "positive" in lower_line:
                    sentiment_trend = "positive"
                elif "negative" in lower_line:
                    sentiment_trend = "negative"
                elif "neutral" in lower_line:
                    sentiment_trend = "neutral"
                elif "stable" in lower_line:
                    sentiment_trend = "stable"
                elif "improving" in lower_line:
                    sentiment_trend = "improving"
                elif "declining" in lower_line:
                    sentiment_trend = "declining"
                elif "volatile" in lower_line:
                    sentiment_trend = "volatile"
                elif "mixed" in lower_line:
                    sentiment_trend = "mixed"
            elif current_section == "insights":
                # Check if line starts with a number or bullet
                if line.startswith(("-", "•", "*")) or (line[0].isdigit() and line[1:3] in (". ", ") ")):
                    insights.append(line.split(". ", 1)[-1] if ". " in line else line[2:])
            elif current_section == "recommendations":
                # Check if line starts with a number or bullet
                if line.startswith(("-", "•", "*")) or (line[0].isdigit() and line[1:3] in (". ", ") ")):
                    recommendations.append(line.split(". ", 1)[-1] if ". " in line else line[2:])
        
        # Remove duplicates while preserving order
        dominant_emotions = list(dict.fromkeys(dominant_emotions))
        
        # If we didn't parse sufficient data, provide some defaults
        if not dominant_emotions:
            dominant_emotions = ["focused", "anxious", "confident"]
        
        if not insights:
            insights = [
                "Your emotional state appears to impact your trading decisions",
                "Consider more detailed emotional tracking in your journal"
            ]
        
        if not recommendations:
            recommendations = [
                "Practice mindfulness before trading sessions",
                "Develop a pre-trade routine to manage emotions",
                "Consider journaling more regularly to track emotional patterns"
            ]
        
        return {
            "emotional_trends": {
                "dominant_emotions": dominant_emotions[:5],  # Limit to 5 emotions
                "sentiment_trend": sentiment_trend
            },
            "insights": insights[:5],  # Limit to 5 insights
            "recommendations": recommendations[:5]  # Limit to 5 recommendations
        }
    
    def _generate_mock_trading_insights(self) -> Dict[str, Any]:
        """
        Generate mock trading insights when Claude API is not available
        
        Returns:
            Dict[str, Any]: Mock insights
        """
        return {
            "insights": [
                {"type": "time_of_day", "description": "Your trading performance is significantly better in the morning."},
                {"type": "emotional_impact", "description": "Trading when you feel 'Calm' or 'Focused' leads to better results."},
                {"type": "setup_performance", "description": "Your MMXM setups have a higher win rate than other setups."},
                {"type": "plan_adherence", "description": "Trades with high plan adherence show significantly better outcomes."},
                {"type": "overtrading", "description": "You tend to overtrade on Mondays, leading to lower win rates."}
            ],
            "recommendations": [
                "Focus your trading during the first 2 hours of the market session.",
                "Implement a pre-trading mindfulness routine to maintain a calm emotional state.",
                "Concentrate more on MMXM setups where you have a statistical edge.",
                "Create a detailed pre-trade checklist to ensure high plan adherence.",
                "Limit yourself to a maximum of 3 trades on Mondays to avoid overtrading."
            ],
            "summary": "Your trading shows consistent patterns with strong performance on MMXM setups but potential overtrading on Mondays. Your emotional state correlates strongly with performance, with better outcomes when you report feeling 'Calm' or 'Focused'."
        }
    
    def _generate_mock_improvement_plan(self) -> Dict[str, Any]:
        """
        Generate a mock improvement plan when Claude API is not available
        
        Returns:
            Dict[str, Any]: Mock improvement plan
        """
        return {
            "strengths": [
                "Strong performance with MMXM setup types",
                "Disciplined in recording trades and journaling",
                "Consistent morning trading routine",
                "Solid win rate when following trading plan",
                "Effective risk management on winning trades"
            ],
            "weaknesses": [
                "Tendency to overtrade on high volatility days",
                "Emotional decision-making after losses",
                "Inconsistent position sizing approach",
                "Premature exits on winning trades",
                "Poor performance during afternoon sessions"
            ],
            "plan": {
                "shortTerm": [
                    {
                        "action": "Implement a trade checklist",
                        "timeframe": "1 week",
                        "measurable": "100% plan adherence on all trades"
                    },
                    {
                        "action": "Limit trading to morning sessions only",
                        "timeframe": "2 weeks",
                        "measurable": "No trades after 12:00 PM"
                    },
                    {
                        "action": "Practice meditation before trading",
                        "timeframe": "Daily",
                        "measurable": "10 minutes of mindfulness before each session"
                    }
                ],
                "mediumTerm": [
                    {
                        "action": "Focus exclusively on MMXM setups",
                        "timeframe": "1 month",
                        "measurable": "75% or higher win rate"
                    },
                    {
                        "action": "Implement trailing stops on winning trades",
                        "timeframe": "1 month",
                        "measurable": "Increase average win by 20%"
                    },
                    {
                        "action": "Standardize position sizing approach",
                        "timeframe": "1 month",
                        "measurable": "Fixed risk per trade of 1% of account"
                    }
                ],
                "longTerm": [
                    {
                        "action": "Develop a personalized trading system",
                        "timeframe": "3 months",
                        "measurable": "Documented system with back-tested results"
                    },
                    {
                        "action": "Achieve consistent profitability",
                        "timeframe": "6 months",
                        "measurable": "Profitable in 4 out of 6 months"
                    },
                    {
                        "action": "Add a second setup type to your strategy",
                        "timeframe": "6 months",
                        "measurable": "Win rate above 60% on new setup"
                    }
                ]
            },
            "timeline": "This improvement plan is designed to be implemented over the next 6 months, with regular reviews and adjustments based on your performance. Focus first on the short-term actions to build momentum."
        }
    
    async def close(self):
        """
        Close the client
        """
        if self.client:
            await self.client.aclose()

# Singleton instance for Claude client
_claude_client = None

async def get_claude_client() -> ClaudeClient:
    """
    Get a Claude client instance (singleton)
    
    Returns:
        ClaudeClient: Claude client
    """
    global _claude_client
    if _claude_client is None:
        _claude_client = ClaudeClient()
    
    return _claude_client
