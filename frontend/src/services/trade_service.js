// File: frontend/src/services/trade_service.js
// Purpose: Service for fetching and managing trade data

import api from './api';
import { useMcpClient } from './mcp_client';

/**
 * Fetch performance metrics for the dashboard
 * @param {Object} params - Query parameters
 * @param {string} params.period - Time period ('day', 'week', 'month', 'year', 'all')
 * @returns {Promise<Object>} Performance metrics
 */
export const getPerformanceMetrics = async (params = {}) => {
  try {
    // Set default period if not provided
    const period = params.period || 'month';
    
    // Attempt to use MCP statistics server if available
    const { mcpClient, mcpConnected } = useMcpClient();
    
    if (mcpConnected && mcpClient?.statistics) {
      // Use MCP statistics server for enhanced analytics
      const mcpMetrics = await mcpClient.statistics.getStatistics({
        ...params,
        period
      });
      return mcpMetrics;
    }
    
    // Fallback to regular API if MCP is not available
    const response = await api.get('/trades/metrics', { params: { ...params, period } });
    return response.data;
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    throw error;
  }
};

/**
 * Fetch recent trades
 * @param {number} limit - Maximum number of trades to return
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Recent trades
 */
export const getRecentTrades = async (limit = 5, params = {}) => {
  try {
    const response = await api.get('/trades/recent', { 
      params: { 
        ...params,
        limit 
      } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent trades:', error);
    throw error;
  }
};

/**
 * Get a single trade by ID
 * @param {string|number} id - Trade ID
 * @returns {Promise<Object>} Trade data
 */
export const getTrade = async (id) => {
  try {
    const response = await api.get(`/trades/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching trade ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch trades with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {string} params.symbol - Filter by symbol
 * @param {string} params.setupType - Filter by setup type
 * @param {string} params.outcome - Filter by outcome ('Win', 'Loss', 'Breakeven')
 * @param {number} params.page - Page number for pagination
 * @param {number} params.limit - Number of trades per page
 * @param {string} params.sortBy - Field to sort by
 * @param {string} params.sortDir - Sort direction ('asc' or 'desc')
 * @returns {Promise<Object>} Paginated trades with metadata
 */
export const getTrades = async (params = {}) => {
  try {
    const response = await api.get('/trades', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching trades:', error);
    throw error;
  }
};

/**
 * Create a new trade
 * @param {Object} tradeData - Trade data
 * @returns {Promise<Object>} Created trade
 */
export const createTrade = async (tradeData) => {
  try {
    // Attempt to use MCP pattern recognition if available
    const { mcpClient, mcpConnected } = useMcpClient();
    
    if (mcpConnected && mcpClient?.patternRecognition) {
      try {
        // Enhance trade data with pattern recognition
        const enhancedData = await mcpClient.patternRecognition.identifySetups(tradeData);
        // Use enhanced data if available, otherwise use original
        tradeData = enhancedData || tradeData;
      } catch (e) {
        console.warn('MCP pattern recognition failed:', e);
        // Continue with original data
      }
    }
    
    const response = await api.post('/trades', tradeData);
    return response.data;
  } catch (error) {
    console.error('Error creating trade:', error);
    throw error;
  }
};

/**
 * Update an existing trade
 * @param {string|number} id - Trade ID
 * @param {Object} tradeData - Updated trade data
 * @returns {Promise<Object>} Updated trade
 */
export const updateTrade = async (id, tradeData) => {
  try {
    const response = await api.put(`/trades/${id}`, tradeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating trade ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a trade
 * @param {string|number} id - Trade ID
 * @returns {Promise<void>}
 */
export const deleteTrade = async (id) => {
  try {
    await api.delete(`/trades/${id}`);
  } catch (error) {
    console.error(`Error deleting trade ${id}:`, error);
    throw error;
  }
};

/**
 * Get trade statistics (used for the TradeList view)
 * @param {Object} params - Query parameters (same as getTrades)
 * @returns {Promise<Object>} Trade statistics
 */
export const getTradeStats = async (params = {}) => {
  try {
    const response = await api.get('/trades/stats', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching trade statistics:', error);
    throw error;
  }
};

/**
 * Upload a trade screenshot
 * @param {string|number} tradeId - Trade ID
 * @param {File} imageFile - Screenshot file
 * @returns {Promise<Object>} Upload result with URL
 */
export const uploadTradeScreenshot = async (tradeId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('screenshot', imageFile);
    
    const response = await api.post(`/trades/${tradeId}/screenshots`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading trade screenshot:', error);
    throw error;
  }
};

/**
 * Get trade tags (for filtering)
 * @returns {Promise<Array>} List of available tags
 */
export const getTradeTags = async () => {
  try {
    const response = await api.get('/trades/tags');
    return response.data;
  } catch (error) {
    console.error('Error fetching trade tags:', error);
    throw error;
  }
};

/**
 * Get setup types (for filtering and dropdowns)
 * @returns {Promise<Array>} List of available setup types
 */
export const getSetupTypes = async () => {
  try {
    const response = await api.get('/trades/setup-types');
    return response.data;
  } catch (error) {
    console.error('Error fetching setup types:', error);
    throw error;
  }
};

/**
 * Get trading symbols (for filtering and dropdowns)
 * @returns {Promise<Array>} List of available symbols
 */
export const getSymbols = async () => {
  try {
    const response = await api.get('/trades/symbols');
    return response.data;
  } catch (error) {
    console.error('Error fetching symbols:', error);
    throw error;
  }
};

/**
 * Get trade performance by day of week
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Performance data by day of week
 */
export const getPerformanceByDayOfWeek = async (params = {}) => {
  try {
    const response = await api.get('/trades/performance/day-of-week', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching performance by day of week:', error);
    throw error;
  }
};

/**
 * Get consecutive win/loss streaks
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Streak data
 */
export const getTradeStreaks = async (params = {}) => {
  try {
    const response = await api.get('/trades/streaks', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching trade streaks:', error);
    throw error;
  }
};

/**
 * Generate AI insights for a specific trade
 * @param {string|number} tradeId - Trade ID
 * @returns {Promise<Object>} AI-generated insights
 */
export const generateTradeInsights = async (tradeId) => {
  try {
    // This is ideal for TradeSage AI integration via MCP
    const { mcpClient, mcpConnected } = useMcpClient();
    
    if (mcpConnected && mcpClient?.tradeSage) {
      // Use TradeSage for AI-powered insights
      const insights = await mcpClient.tradeSage.generateInsights({ tradeId });
      return insights;
    }
    
    // Fallback to regular API
    const response = await api.post(`/trades/${tradeId}/insights`);
    return response.data;
  } catch (error) {
    console.error(`Error generating insights for trade ${tradeId}:`, error);
    throw error;
  }
};
