import api from './api';

/**
 * Service for interacting with the TradeSage AI assistant API
 */
const tradesageService = {
  /**
   * Ask a question to TradeSage AI
   * @param {string} question - The question to ask
   * @param {Array} tradeData - Optional trade data for context
   * @param {number} userId - User ID
   * @returns {Promise} - Promise containing the answer data
   */
  askQuestion: async (question, tradeData = null, userId = null) => {
    try {
      const response = await api.post('/tradesage/ask', {
        question,
        trade_data: tradeData,
        user_id: userId
      });
      return response.data;
    } catch (error) {
      console.error('Error asking TradeSage a question:', error);
      throw error;
    }
  },

  /**
   * Analyze trading patterns
   * @param {Object} data - Analysis request data
   * @returns {Promise} - Promise containing the analysis results
   */
  analyzePatterns: async (data) => {
    try {
      const response = await api.post('/tradesage/analyze-patterns', data);
      return response.data;
    } catch (error) {
      console.error('Error analyzing patterns with TradeSage:', error);
      throw error;
    }
  },

  /**
   * Generate an improvement plan
   * @param {number} userId - User ID
   * @param {boolean} useMcp - Whether to use MCP enhancements
   * @returns {Promise} - Promise containing the improvement plan
   */
  generateImprovementPlan: async (userId, useMcp = true) => {
    try {
      const response = await api.get(`/tradesage/improvement-plan/${userId}?use_mcp=${useMcp}`);
      return response.data;
    } catch (error) {
      console.error('Error generating improvement plan with TradeSage:', error);
      throw error;
    }
  },

  /**
   * Analyze complex patterns using MCP
   * @param {Object} data - Complex pattern analysis request data
   * @returns {Promise} - Promise containing the complex pattern analysis results
   */
  analyzeComplexPatterns: async (data) => {
    try {
      const response = await api.post('/tradesage/complex-patterns', data);
      return response.data;
    } catch (error) {
      console.error('Error analyzing complex patterns with TradeSage:', error);
      throw error;
    }
  },

  /**
   * Compare winning and losing trades
   * @param {number} userId - User ID
   * @param {string} startDate - Optional start date
   * @param {string} endDate - Optional end date
   * @returns {Promise} - Promise containing the comparison results
   */
  compareWinningAndLosingTrades: async (userId, startDate = null, endDate = null) => {
    try {
      let url = `/tradesage/compare-trades/${userId}`;
      
      // Add query parameters if provided
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error comparing trades with TradeSage:', error);
      throw error;
    }
  }
};

export default tradesageService;
