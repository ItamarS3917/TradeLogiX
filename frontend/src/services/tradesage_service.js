// File: frontend/src/services/tradesage_service.js
// Purpose: Service for interacting with TradeSage AI assistant API

import api from './api';

/**
 * Service for interacting with TradeSage AI assistant
 */
class TradeSageService {
  /**
   * Analyze trading patterns for insights and recommendations
   * 
   * @param {number} userId - User ID
   * @param {object} dateRange - Date range for analysis (optional)
   * @returns {Promise<object>} - Analysis results
   */
  static async analyzePatterns(userId, dateRange = null) {
    try {
      const request = {
        user_id: userId,
      };

      if (dateRange) {
        if (dateRange.startDate) {
          request.start_date = dateRange.startDate;
        }
        if (dateRange.endDate) {
          request.end_date = dateRange.endDate;
        }
      }

      const response = await api.post('/api/tradesage/analyze-patterns', request);
      return response.data;
    } catch (error) {
      console.error('Error analyzing trading patterns:', error);
      throw error;
    }
  }

  /**
   * Get performance insights for a user
   * 
   * @param {number} userId - User ID
   * @returns {Promise<object>} - Performance insights
   */
  static async getInsights(userId) {
    try {
      const response = await api.get(`/api/tradesage/insights/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting performance insights:', error);
      throw error;
    }
  }

  /**
   * Ask TradeSage a question
   * 
   * @param {number} userId - User ID
   * @param {string} question - User's question
   * @returns {Promise<object>} - TradeSage's answer
   */
  static async askQuestion(userId, question) {
    try {
      const request = {
        user_id: userId,
        question: question
      };

      const response = await api.post('/api/tradesage/ask', request);
      return response.data;
    } catch (error) {
      console.error('Error asking TradeSage question:', error);
      throw error;
    }
  }

  /**
   * Get improvement plan for a user
   * 
   * @param {number} userId - User ID
   * @returns {Promise<object>} - Improvement plan
   */
  static async getImprovementPlan(userId) {
    try {
      const response = await api.get(`/api/tradesage/improvement-plan/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting improvement plan:', error);
      throw error;
    }
  }

  /**
   * Compare winning and losing trades
   * 
   * @param {number} userId - User ID
   * @param {object} dateRange - Date range for comparison (optional)
   * @returns {Promise<object>} - Comparison results
   */
  static async compareWinningAndLosingTrades(userId, dateRange = null) {
    try {
      let url = `/api/tradesage/compare-trades/${userId}`;
      
      if (dateRange) {
        const params = new URLSearchParams();
        
        if (dateRange.startDate) {
          params.append('start_date', dateRange.startDate);
        }
        
        if (dateRange.endDate) {
          params.append('end_date', dateRange.endDate);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error comparing trades:', error);
      throw error;
    }
  }

  /**
   * Get TradeSage chat history
   * 
   * @param {number} userId - User ID
   * @returns {Promise<array>} - Chat history
   */
  static async getChatHistory(userId) {
    // This is a mock implementation since we don't have this endpoint yet
    return [
      {
        id: 1,
        userId: userId,
        question: "What are my best performing setups?",
        answer: "Your MMXM setup has the highest win rate at 72%, followed by ICT BPR at 65%.",
        timestamp: new Date("2023-08-15T10:30:00").toISOString(),
        confidence: 0.92
      },
      {
        id: 2,
        userId: userId,
        question: "Why am I losing money on Mondays?",
        answer: "Analysis shows you tend to overtrade on Mondays, with 40% more trades than other days but a 15% lower win rate. Consider reducing your trading frequency on Mondays and focusing on your highest probability setups only.",
        timestamp: new Date("2023-08-14T14:45:00").toISOString(),
        confidence: 0.85
      },
      {
        id: 3,
        userId: userId,
        question: "How can I improve my win rate?",
        answer: "Based on your trading data, three key areas for improvement are: 1) Reducing trade frequency on Mondays where you tend to overtrade, 2) Focusing more on MMXM setups where you have a proven edge, and 3) Maintaining a calm emotional state which correlates with your best performance.",
        timestamp: new Date("2023-08-10T09:15:00").toISOString(),
        confidence: 0.88
      }
    ];
  }
}

export default TradeSageService;
