// File: frontend/src/services/statistics_service.js
// Purpose: Service for fetching and processing statistics data

import api from './api';
import { useMcpClient } from './mcp_client';

/**
 * Fetch trading statistics with optional date range and filters
 * @param {Object} params - Query parameters
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {string} params.symbol - Filter by symbol (e.g., "NQ")
 * @param {string} params.setupType - Filter by setup type
 * @returns {Promise<Object>} Statistics data
 */
export const getStatistics = async (params = {}) => {
  try {
    // Attempt to use MCP statistics server if available
    const { mcpClient, mcpConnected } = useMcpClient();
    
    if (mcpConnected && mcpClient?.statistics) {
      // Use MCP statistics server for enhanced analytics
      const mcpStats = await mcpClient.statistics.getStatistics(params);
      return mcpStats;
    }
    
    // Fallback to regular API if MCP is not available
    const response = await api.get('/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

/**
 * Get win rate by setup type
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Array of setup types with win rates
 */
export const getWinRateBySetup = async (params = {}) => {
  try {
    const response = await api.get('/statistics/win-rate-by-setup', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching win rate by setup:', error);
    throw error;
  }
};

/**
 * Get profitability by time of day
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Array of time slots with profitability data
 */
export const getProfitabilityByTime = async (params = {}) => {
  try {
    const response = await api.get('/statistics/profitability-by-time', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching profitability by time:', error);
    throw error;
  }
};

/**
 * Get risk/reward ratio analysis
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Risk/reward analysis data
 */
export const getRiskRewardAnalysis = async (params = {}) => {
  try {
    const response = await api.get('/statistics/risk-reward', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching risk/reward analysis:', error);
    throw error;
  }
};

/**
 * Get emotional correlation analysis
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Emotional correlation data
 */
export const getEmotionalAnalysis = async (params = {}) => {
  try {
    // This is ideal for MCP enhancement with sentiment analysis
    const { mcpClient, mcpConnected } = useMcpClient();
    
    if (mcpConnected && mcpClient?.sentimentAnalysis) {
      // Use MCP for enhanced emotional analytics
      const mcpAnalysis = await mcpClient.sentimentAnalysis.analyzeEmotionalImpact(params);
      return mcpAnalysis;
    }
    
    // Fallback to regular API
    const response = await api.get('/statistics/emotional-analysis', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching emotional analysis:', error);
    throw error;
  }
};

/**
 * Get performance by market conditions
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Performance data by market condition
 */
export const getMarketConditionPerformance = async (params = {}) => {
  try {
    const response = await api.get('/statistics/market-conditions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching market condition performance:', error);
    throw error;
  }
};

/**
 * Get plan adherence correlation analysis
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Plan adherence correlation data
 */
export const getPlanAdherenceAnalysis = async (params = {}) => {
  try {
    const response = await api.get('/statistics/plan-adherence', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching plan adherence analysis:', error);
    throw error;
  }
};

/**
 * Export statistics data to CSV or PDF
 * @param {string} format - Export format ('csv' or 'pdf')
 * @param {Object} params - Query parameters
 * @returns {Promise<Blob>} Exported file as Blob
 */
export const exportStatistics = async (format = 'csv', params = {}) => {
  try {
    const response = await api.get(`/statistics/export/${format}`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error(`Error exporting statistics as ${format}:`, error);
    throw error;
  }
};

/**
 * Generate AI-powered insights based on statistics
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} AI-generated insights
 */
export const generateStatisticalInsights = async (params = {}) => {
  try {
    // This is ideal for TradeSage AI integration via MCP
    const { mcpClient, mcpConnected } = useMcpClient();
    
    if (mcpConnected && mcpClient?.tradeSage) {
      // Use TradeSage for AI-powered insights
      const insights = await mcpClient.tradeSage.generateStatisticalInsights(params);
      return insights;
    }
    
    // Fallback to regular API
    const response = await api.post('/statistics/insights', params);
    return response.data;
  } catch (error) {
    console.error('Error generating statistical insights:', error);
    throw error;
  }
};
