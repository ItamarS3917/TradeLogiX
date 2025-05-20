import api from './api';

/**
 * Trade service for handling trade-related operations
 */
const tradeService = {
  /**
   * Get all trades
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response from API
   */
  getAllTrades: async (params = {}) => {
    try {
      const response = await api.get('/trades', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get trade by ID
   * @param {string} id - Trade ID
   * @returns {Promise} - Response from API
   */
  getTradeById: async (id) => {
    try {
      const response = await api.get(`/trades/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new trade
   * @param {Object} tradeData - Trade data
   * @returns {Promise} - Response from API
   */
  createTrade: async (tradeData) => {
    try {
      const response = await api.post('/trades', tradeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update existing trade
   * @param {string} id - Trade ID
   * @param {Object} tradeData - Updated trade data
   * @returns {Promise} - Response from API
   */
  updateTrade: async (id, tradeData) => {
    try {
      const response = await api.put(`/trades/${id}`, tradeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete trade
   * @param {string} id - Trade ID
   * @returns {Promise} - Response from API
   */
  deleteTrade: async (id) => {
    try {
      const response = await api.delete(`/trades/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get trades by date range
   * @param {string} startDate - Start date in ISO format
   * @param {string} endDate - End date in ISO format
   * @returns {Promise} - Response from API
   */
  getTradesByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get('/trades/date-range', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get trades by setup type
   * @param {string} setupType - Setup type
   * @returns {Promise} - Response from API
   */
  getTradesBySetupType: async (setupType) => {
    try {
      const response = await api.get('/trades/setup', {
        params: { setupType }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload trade screenshot
   * @param {string} tradeId - Trade ID
   * @param {File} file - Screenshot file
   * @returns {Promise} - Response from API
   */
  uploadScreenshot: async (tradeId, file) => {
    try {
      const formData = new FormData();
      formData.append('screenshot', file);
      
      const response = await api.post(`/trades/${tradeId}/screenshot`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all available setup types
   * @returns {Promise} - Response from API or default types
   */
  getSetupTypes: async () => {
    try {
      const response = await api.get('/trades/setup-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching setup types:', error);
      // Return default setup types if API fails
      return [
        'FVG Fill',
        'BPR',
        'OTE',
        'PD Level',
        'Liquidity Grab',
        'Order Block',
        'Smart Money Concept',
        'Double Top/Bottom',
        'Fibonacci Retracement',
        'EQH/EQL',
        'Other'
      ];
    }
  },

  /**
   * Get all available symbols
   * @returns {Promise} - Response from API or default symbols
   */
  getSymbols: async () => {
    try {
      const response = await api.get('/trades/symbols');
      return response.data;
    } catch (error) {
      console.error('Error fetching symbols:', error);
      // Return default symbols if API fails
      return ['NQ', 'ES', 'CL', 'GC', 'EURUSD', 'BTCUSD'];
    }
  }
};

export default tradeService;
