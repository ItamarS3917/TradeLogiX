# File: backend/mcp/tools/sentiment_analysis.py
# Purpose: Sentiment analysis tools for trading journal and emotional analysis

import re
import logging
from typing import Dict, List, Any, Optional
import json

logger = logging.getLogger(__name__)

# Sentiment dictionaries
POSITIVE_WORDS = {
    'confident': 3,
    'focused': 2,
    'calm': 2,
    'patient': 2,
    'disciplined': 3,
    'positive': 2,
    'prepared': 2,
    'success': 3,
    'profitable': 3,
    'gain': 2,
    'control': 2,
    'strategy': 1,
    'plan': 1,
    'win': 3,
    'opportunity': 2,
    'reward': 2,
    'growth': 2,
    'improvement': 2,
    'happy': 3,
    'satisfied': 3,
    'determined': 2,
    'consistent': 2,
    'precise': 2,
    'steady': 2,
    'clear': 2,
    'balance': 2,
    'excellent': 3,
    'perfect': 3,
    'great': 3
}

NEGATIVE_WORDS = {
    'anxious': 3,
    'fearful': 3,
    'stressed': 3,
    'worried': 2,
    'frustrated': 3,
    'angry': 3,
    'impatient': 2,
    'doubt': 2,
    'hesitant': 2,
    'uncertain': 2,
    'loss': 3,
    'mistake': 2,
    'error': 2,
    'regret': 3,
    'revenge': 3,
    'impulsive': 3,
    'emotional': 2,
    'confused': 2,
    'distracted': 2,
    'bored': 2,
    'overwhelmed': 3,
    'panic': 3,
    'disaster': 3,
    'terrible': 3,
    'bad': 2,
    'poor': 2,
    'disappointed': 3,
    'upset': 3,
    'desperate': 3
}

# Emotion categories
EMOTION_CATEGORIES = {
    'fear': ['anxious', 'fearful', 'worried', 'panic', 'scared', 'afraid', 'nervous', 'terrified'],
    'anger': ['angry', 'frustrated', 'irritated', 'annoyed', 'furious', 'mad', 'rage', 'hostile'],
    'joy': ['happy', 'excited', 'pleased', 'satisfied', 'delighted', 'joyful', 'cheerful', 'thrilled'],
    'confidence': ['confident', 'certain', 'assured', 'strong', 'powerful', 'capable', 'determined'],
    'focus': ['focused', 'concentrated', 'attentive', 'alert', 'aware', 'mindful', 'sharp'],
    'confusion': ['confused', 'uncertain', 'puzzled', 'perplexed', 'unsure', 'doubtful', 'hesitant'],
    'disappointment': ['disappointed', 'upset', 'let down', 'dissatisfied', 'disheartened'],
    'patience': ['patient', 'calm', 'composed', 'relaxed', 'tranquil', 'serene', 'peaceful'],
    'regret': ['regret', 'remorse', 'sorry', 'guilty', 'apologetic', 'shame'],
    'pride': ['proud', 'accomplished', 'satisfied', 'fulfilled', 'content', 'pleased']
}

def analyze_text_sentiment(text: str) -> Dict[str, Any]:
    """
    Analyze sentiment of text content
    Returns sentiment label, score, and detected emotions
    """
    try:
        if not text:
            return {
                "sentiment": "neutral",
                "score": 0,
                "emotions": {},
                "keywords": []
            }
        
        # Tokenize text
        words = re.findall(r'\b\w+\b', text.lower())
        
        # Calculate positive and negative scores
        positive_score = 0
        negative_score = 0
        
        for word in words:
            positive_score += POSITIVE_WORDS.get(word, 0)
            negative_score += NEGATIVE_WORDS.get(word, 0)
        
        # Calculate sentiment score (-1.0 to 1.0)
        total = positive_score + negative_score
        if total == 0:
            sentiment_score = 0
        else:
            sentiment_score = (positive_score - negative_score) / (positive_score + negative_score)
        
        # Determine sentiment label
        if sentiment_score > 0.2:
            sentiment_label = "positive"
        elif sentiment_score < -0.2:
            sentiment_label = "negative"
        else:
            sentiment_label = "neutral"
        
        # Detect emotions
        emotions = {}
        for category, emotion_words in EMOTION_CATEGORIES.items():
            category_score = 0
            for emotion_word in emotion_words:
                if emotion_word in text.lower():
                    category_score += 1
            
            if category_score > 0:
                emotions[category] = category_score / len(emotion_words)
        
        # Extract emotional keywords
        keywords = get_emotional_keywords(text)
        
        return {
            "sentiment": sentiment_label,
            "score": round(sentiment_score, 2),
            "emotions": emotions,
            "keywords": keywords
        }
    except Exception as e:
        logger.error(f"Error analyzing text sentiment: {str(e)}")
        return {
            "sentiment": "neutral",
            "score": 0,
            "emotions": {},
            "keywords": []
        }

def get_emotional_keywords(text: str) -> List[Dict[str, Any]]:
    """
    Extract emotional keywords from text content
    Returns list of words with their sentiment values
    """
    try:
        if not text:
            return []
        
        # Tokenize text
        words = re.findall(r'\b\w+\b', text.lower())
        
        # Find emotional words
        keywords = []
        for word in words:
            if word in POSITIVE_WORDS:
                keywords.append({
                    "word": word,
                    "sentiment": "positive",
                    "intensity": POSITIVE_WORDS[word]
                })
            elif word in NEGATIVE_WORDS:
                keywords.append({
                    "word": word,
                    "sentiment": "negative",
                    "intensity": NEGATIVE_WORDS[word]
                })
        
        # Sort by intensity
        keywords.sort(key=lambda x: x["intensity"], reverse=True)
        
        # Return top 10 keywords
        return keywords[:10]
    except Exception as e:
        logger.error(f"Error extracting emotional keywords: {str(e)}")
        return []

def analyze_emotional_impact(emotional_states: List[str], outcomes: List[str]) -> Dict[str, Any]:
    """
    Analyze the relationship between emotional states and trading outcomes
    """
    try:
        if not emotional_states or not outcomes or len(emotional_states) != len(outcomes):
            return {
                "correlation": 0,
                "best_emotion": None,
                "worst_emotion": None,
                "impact_score": 0
            }
        
        # Count outcomes by emotion
        emotion_outcomes = {}
        for emotion, outcome in zip(emotional_states, outcomes):
            if not emotion:
                continue
                
            if emotion not in emotion_outcomes:
                emotion_outcomes[emotion] = {"win": 0, "loss": 0, "total": 0}
            
            emotion_outcomes[emotion]["total"] += 1
            
            if outcome == "Win":
                emotion_outcomes[emotion]["win"] += 1
            elif outcome == "Loss":
                emotion_outcomes[emotion]["loss"] += 1
        
        # Calculate win rates
        emotion_win_rates = {}
        for emotion, counts in emotion_outcomes.items():
            if counts["total"] >= 3:  # Need at least 3 trades for meaningful data
                win_rate = counts["win"] / counts["total"]
                emotion_win_rates[emotion] = win_rate
        
        if not emotion_win_rates:
            return {
                "correlation": 0,
                "best_emotion": None,
                "worst_emotion": None,
                "impact_score": 0
            }
        
        # Find best and worst emotions
        best_emotion = max(emotion_win_rates.items(), key=lambda x: x[1])
        worst_emotion = min(emotion_win_rates.items(), key=lambda x: x[1])
        
        # Calculate impact score
        if best_emotion[1] - worst_emotion[1] > 0.5:
            impact_score = 3  # High impact
        elif best_emotion[1] - worst_emotion[1] > 0.3:
            impact_score = 2  # Medium impact
        else:
            impact_score = 1  # Low impact
        
        # Calculate correlation
        correlation = best_emotion[1] - worst_emotion[1]
        
        return {
            "correlation": round(correlation, 2),
            "best_emotion": best_emotion[0],
            "worst_emotion": worst_emotion[0],
            "impact_score": impact_score
        }
    except Exception as e:
        logger.error(f"Error analyzing emotional impact: {str(e)}")
        return {
            "correlation": 0,
            "best_emotion": None,
            "worst_emotion": None,
            "impact_score": 0
        }

def generate_emotional_insights(emotion_data: Dict[str, Any]) -> str:
    """
    Generate insights based on emotional analysis
    """
    try:
        if not emotion_data or "best_emotion" not in emotion_data or not emotion_data["best_emotion"]:
            return "Not enough emotional data to generate insights."
        
        best_emotion = emotion_data["best_emotion"]
        worst_emotion = emotion_data["worst_emotion"]
        correlation = emotion_data["correlation"]
        impact_score = emotion_data["impact_score"]
        
        insights = []
        
        if impact_score == 3:
            insights.append(f"Your emotional state has a significant impact on your trading results. ")
        elif impact_score == 2:
            insights.append(f"Your emotional state has a moderate impact on your trading results. ")
        else:
            insights.append(f"Your emotional state has a relatively minor impact on your trading results. ")
        
        insights.append(f"Trading while feeling '{best_emotion}' has led to your best results, ")
        insights.append(f"while trading during '{worst_emotion}' states has been less successful. ")
        
        if correlation > 0.5:
            insights.append(f"Consider delaying trades when you notice yourself feeling {worst_emotion}. ")
            insights.append(f"Try developing techniques to cultivate a {best_emotion} mindset before trading sessions.")
        
        return "".join(insights)
    except Exception as e:
        logger.error(f"Error generating emotional insights: {str(e)}")
        return "Unable to generate emotional insights due to insufficient data."
