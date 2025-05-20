import api from './api';

/**
 * Statistics service for handling analytics operations
 */
const statisticsService = {
  /**
   * Get overall trading statistics with optional filters
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response from API
   */
  getStatistics: async (params = {}) => {
    try {
      const response = await api.get('/statistics', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get win rate and performance metrics by setup type
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response from API
   */
  getWinRateBySetup: async (params = {}) => {
    try {
      const response = await api.get('/statistics/win-rate-by-setup', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get profitability metrics by time of day
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response from API
   */
  getProfitabilityByTime: async (params = {}) => {
    try {
      const response = await api.get('/statistics/profitability-by-time', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get risk/reward ratio analysis
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response from API
   */
  getRiskRewardAnalysis: async (params = {}) => {
    try {
      const response = await api.get('/statistics/risk-reward', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get analysis of trading performance by emotional state
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response from API
   */
  getEmotionalAnalysis: async (params = {}) => {
    try {
      const response = await api.get('/statistics/emotional-analysis', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get analysis of trading performance by market conditions
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response from API
   */
  getMarketConditionPerformance: async (params = {}) => {
    try {
      const response = await api.get('/statistics/market-conditions', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get analysis of trading performance by plan adherence
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response from API
   */
  getPlanAdherenceAnalysis: async (params = {}) => {
    try {
      const response = await api.get('/statistics/plan-adherence', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get performance comparison across different asset classes
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response from API
   */
  getAssetComparison: async (params = {}) => {
    try {
      const response = await api.get('/statistics/asset-comparison', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get correlation analysis between different assets
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response from API
   */
  getAssetCorrelation: async (params = {}) => {
    try {
      const response = await api.get('/statistics/asset-correlation', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get effectiveness of different strategies for specific market types
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response from API
   */
  getMarketStrategyPerformance: async (params = {}) => {
    try {
      const response = await api.get('/statistics/market-strategy', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generate AI-powered insights based on trading statistics
   * @param {Object} params - Parameters for insight generation
   * @returns {Promise} - Response from API
   */
  generateStatisticalInsights: async (params = {}) => {
    try {
      const response = await api.post('/statistics/insights', params);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Export statistics data in CSV or PDF format
   * @param {string} format - 'csv' or 'pdf'
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response from API
   */
  exportStatistics: async (format, params = {}) => {
    try {
      const response = await api.get(`/statistics/export/${format}`, { 
        params,
        responseType: 'blob' 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default statisticsService;