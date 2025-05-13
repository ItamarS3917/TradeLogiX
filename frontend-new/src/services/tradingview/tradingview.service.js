import axios from 'axios';

// TradingView API service for frontend
class TradingViewService {
  constructor() {
    this.apiBase = '/api/v1/tradingview';
    this.mcpClient = null;
    this.authenticated = false;
  }
  
  // Initialize the service with MCP client
  initialize(mcpClient) {
    this.mcpClient = mcpClient;
    return this;
  }
  
  // Authenticate with TradingView
  async authenticate(username, password) {
    try {
      const response = await axios.post(`${this.apiBase}/auth`, { username, password });
      
      if (response.data.status === 'success') {
        this.authenticated = true;
        return response.data.data;
      }
      
      throw new Error('Authentication failed');
    } catch (error) {
      console.error('TradingView authentication error:', error);
      throw error;
    }
  }
  
  // Get chart image for a symbol
  async getChartImage(symbol, interval, study = null) {
    try {
      const params = { symbol, interval };
      if (study) {
        params.study = study;
      }
      
      const response = await axios.get(`${this.apiBase}/chart`, { params });
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error('Failed to fetch chart image');
    } catch (error) {
      console.error('TradingView chart retrieval error:', error);
      throw error;
    }
  }
  
  // Get real-time market data for a symbol
  async getMarketData(symbol) {
    try {
      const response = await axios.get(`${this.apiBase}/market-data`, { 
        params: { symbol }
      });
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error('Failed to fetch market data');
    } catch (error) {
      console.error('TradingView market data error:', error);
      throw error;
    }
  }
  
  // Get technical indicators for a symbol
  async getIndicators(symbol, indicators) {
    try {
      const indicatorsStr = Array.isArray(indicators) 
        ? indicators.join(',') 
        : indicators;
      
      const response = await axios.get(`${this.apiBase}/indicators`, { 
        params: { symbol, indicators: indicatorsStr }
      });
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error('Failed to fetch indicators');
    } catch (error) {
      console.error('TradingView indicators error:', error);
      throw error;
    }
  }
  
  // Save chart layout and settings
  async saveChart(chartId, chartData) {
    try {
      const response = await axios.post(`${this.apiBase}/save-chart`, {
        chart_id: chartId,
        chart_data: chartData
      });
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error('Failed to save chart');
    } catch (error) {
      console.error('TradingView save chart error:', error);
      throw error;
    }
  }
  
  // Get user's saved chart layouts
  async getLayouts() {
    try {
      const response = await axios.get(`${this.apiBase}/layouts`);
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error('Failed to fetch layouts');
    } catch (error) {
      console.error('TradingView layouts error:', error);
      throw error;
    }
  }
  
  // Take a screenshot of a chart
  async takeScreenshot(chartId, width = 1280, height = 720) {
    try {
      const response = await axios.post(`${this.apiBase}/screenshot`, {
        chart_id: chartId,
        width,
        height
      });
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error('Failed to take screenshot');
    } catch (error) {
      console.error('TradingView screenshot error:', error);
      throw error;
    }
  }
  
  // Create a TradingView widget
  createWidget(container, options) {
    // This is a client-side helper method to create a TradingView widget
    // Note: This requires the TradingView widget library to be loaded
    if (typeof TradingView === 'undefined' || !TradingView.widget) {
      console.error('TradingView widget library not loaded');
      return null;
    }
    
    const defaultOptions = {
      symbol: 'NASDAQ:NQ',
      interval: 'D',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#f1f3f6',
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: container
    };
    
    return new TradingView.widget({
      ...defaultOptions,
      ...options
    });
  }
}

export const tradingViewService = new TradingViewService();
export default tradingViewService;
