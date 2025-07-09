// File: frontend-new/src/services/backtestService.js
// Purpose: Service for backtesting API operations

import api from './api';

class BacktestService {
  constructor() {
    this.baseUrl = '/backtest';
  }

  // Strategy Management
  async getStrategies() {
    try {
      const response = await api.get(`${this.baseUrl}/strategies`);
      return response.data;
    } catch (error) {
      console.error('Error fetching strategies:', error);
      throw error;
    }
  }

  async getStrategy(strategyId) {
    try {
      const response = await api.get(`${this.baseUrl}/strategies/${strategyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching strategy:', error);
      throw error;
    }
  }

  async createStrategyFromTrades(data) {
    try {
      const response = await api.post(`${this.baseUrl}/strategies/from-trades`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating strategy from trades:', error);
      throw error;
    }
  }

  async createCustomStrategy(data) {
    try {
      const response = await api.post(`${this.baseUrl}/strategies`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating custom strategy:', error);
      throw error;
    }
  }

  async updateStrategy(strategyId, data) {
    try {
      const response = await api.put(`${this.baseUrl}/strategies/${strategyId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating strategy:', error);
      throw error;
    }
  }

  async deleteStrategy(strategyId) {
    try {
      await api.delete(`${this.baseUrl}/strategies/${strategyId}`);
      return true;
    } catch (error) {
      console.error('Error deleting strategy:', error);
      throw error;
    }
  }

  // Backtest Management
  async getBacktests(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`${this.baseUrl}/backtests?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching backtests:', error);
      throw error;
    }
  }

  async getBacktest(backtestId) {
    try {
      const response = await api.get(`${this.baseUrl}/backtests/${backtestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching backtest:', error);
      throw error;
    }
  }

  async runBacktest(strategyId, config) {
    try {
      const response = await api.post(`${this.baseUrl}/strategies/${strategyId}/backtest`, config);
      return response.data;
    } catch (error) {
      console.error('Error running backtest:', error);
      throw error;
    }
  }

  async stopBacktest(backtestId) {
    try {
      const response = await api.post(`${this.baseUrl}/backtests/${backtestId}/stop`);
      return response.data;
    } catch (error) {
      console.error('Error stopping backtest:', error);
      throw error;
    }
  }

  async getBacktestResults(backtestId) {
    try {
      const response = await api.get(`${this.baseUrl}/backtests/${backtestId}/results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching backtest results:', error);
      throw error;
    }
  }

  // Performance Analysis
  async getStrategyPerformance(strategyId) {
    try {
      const response = await api.get(`${this.baseUrl}/strategies/${strategyId}/performance`);
      return response.data;
    } catch (error) {
      console.error('Error fetching strategy performance:', error);
      throw error;
    }
  }

  async compareStrategies(strategyIds) {
    try {
      const response = await api.post(`${this.baseUrl}/compare`, { strategy_ids: strategyIds });
      return response.data;
    } catch (error) {
      console.error('Error comparing strategies:', error);
      throw error;
    }
  }

  async getStrategyRecommendations(strategyId) {
    try {
      const response = await api.get(`${this.baseUrl}/strategies/${strategyId}/recommendations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching strategy recommendations:', error);
      throw error;
    }
  }

  // Utility Methods
  async validateStrategyData(data) {
    // Client-side validation
    const errors = {};

    if (!data.name || data.name.trim().length === 0) {
      errors.name = 'Strategy name is required';
    }

    if (data.name && data.name.length > 100) {
      errors.name = 'Strategy name must be less than 100 characters';
    }

    if (!data.strategy_type) {
      errors.strategy_type = 'Strategy type is required';
    }

    if (!data.entry_conditions || Object.keys(data.entry_conditions).length === 0) {
      errors.entry_conditions = 'Entry conditions are required';
    }

    if (!data.exit_conditions || Object.keys(data.exit_conditions).length === 0) {
      errors.exit_conditions = 'Exit conditions are required';
    }

    return Object.keys(errors).length === 0 ? null : errors;
  }

  async validateBacktestConfig(config) {
    // Client-side validation for backtest configuration
    const errors = {};

    if (!config.name || config.name.trim().length === 0) {
      errors.name = 'Backtest name is required';
    }

    if (!config.start_date) {
      errors.start_date = 'Start date is required';
    }

    if (!config.end_date) {
      errors.end_date = 'End date is required';
    }

    if (config.start_date && config.end_date) {
      const startDate = new Date(config.start_date);
      const endDate = new Date(config.end_date);
      
      if (endDate <= startDate) {
        errors.end_date = 'End date must be after start date';
      }

      // Check if period is too long (more than 5 years)
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 1825) { // 5 years
        errors.end_date = 'Backtest period cannot exceed 5 years';
      }
    }

    if (!config.initial_capital || config.initial_capital <= 0) {
      errors.initial_capital = 'Initial capital must be greater than 0';
    }

    if (config.initial_capital && config.initial_capital > 1000000) {
      errors.initial_capital = 'Initial capital cannot exceed $1,000,000';
    }

    return Object.keys(errors).length === 0 ? null : errors;
  }

  // Helper methods for data formatting
  formatStrategyType(type) {
    const typeMap = {
      'MMXM_SUPPLY_DEMAND': 'MMXM Supply/Demand',
      'ICT_ORDER_BLOCK': 'ICT Order Block',
      'ICT_FAIR_VALUE_GAP': 'ICT Fair Value Gap',
      'ICT_BREAKER': 'ICT Breaker',
      'ICT_MITIGATION': 'ICT Mitigation',
      'LIQUIDITY_GRAB': 'Liquidity Grab',
      'CUSTOM_SETUP': 'Custom Setup',
      'COMBINED_STRATEGY': 'Combined Strategy'
    };
    return typeMap[type] || type;
  }

  getStrategyTypeOptions() {
    return [
      { value: 'MMXM_SUPPLY_DEMAND', label: 'MMXM Supply/Demand' },
      { value: 'ICT_ORDER_BLOCK', label: 'ICT Order Block' },
      { value: 'ICT_FAIR_VALUE_GAP', label: 'ICT Fair Value Gap' },
      { value: 'ICT_BREAKER', label: 'ICT Breaker' },
      { value: 'ICT_MITIGATION', label: 'ICT Mitigation' },
      { value: 'LIQUIDITY_GRAB', label: 'Liquidity Grab' },
      { value: 'CUSTOM_SETUP', label: 'Custom Setup' },
      { value: 'COMBINED_STRATEGY', label: 'Combined Strategy' }
    ];
  }

  getTimeframeOptions() {
    return [
      { value: '1m', label: '1 Minute' },
      { value: '5m', label: '5 Minutes' },
      { value: '15m', label: '15 Minutes' },
      { value: '30m', label: '30 Minutes' },
      { value: '1h', label: '1 Hour' },
      { value: '4h', label: '4 Hours' },
      { value: '1d', label: '1 Day' }
    ];
  }

  getDefaultStrategyTemplate(type) {
    const templates = {
      'MMXM_SUPPLY_DEMAND': {
        entry_conditions: {
          setup_types: ['MMXM Demand Zone', 'MMXM Supply Zone'],
          min_risk_reward: 1.5,
          confluence_required: true
        },
        exit_conditions: {
          take_profit_ratio: 2.0,
          stop_loss_ratio: 1.0,
          max_hold_time: 24
        },
        risk_management: {
          max_risk_per_trade: 0.02,
          position_sizing: 'fixed_percent',
          max_concurrent_trades: 1
        }
      },
      'ICT_ORDER_BLOCK': {
        entry_conditions: {
          setup_types: ['ICT Order Block'],
          min_risk_reward: 2.0,
          market_structure_required: true
        },
        exit_conditions: {
          take_profit_ratio: 3.0,
          stop_loss_ratio: 1.0,
          max_hold_time: 12
        },
        risk_management: {
          max_risk_per_trade: 0.015,
          position_sizing: 'fixed_percent',
          max_concurrent_trades: 1
        }
      }
    };

    return templates[type] || {
      entry_conditions: {},
      exit_conditions: {},
      risk_management: {
        max_risk_per_trade: 0.02,
        position_sizing: 'fixed_percent',
        max_concurrent_trades: 1
      }
    };
  }

  // Real-time updates for running backtests
  async pollBacktestStatus(backtestId, onUpdate, intervalMs = 5000) {
    const poll = async () => {
      try {
        const backtest = await this.getBacktest(backtestId);
        onUpdate(backtest);
        
        // Continue polling if still running
        if (backtest.status === 'Running' || backtest.status === 'Pending') {
          setTimeout(poll, intervalMs);
        }
      } catch (error) {
        console.error('Error polling backtest status:', error);
        // Continue polling even on error (network issues might be temporary)
        setTimeout(poll, intervalMs);
      }
    };

    // Start polling
    poll();
  }

  // Bulk operations
  async createBulkBacktests(strategyIds, config) {
    try {
      const response = await api.post(`${this.baseUrl}/bulk-backtest`, {
        strategy_ids: strategyIds,
        config: config
      });
      return response.data;
    } catch (error) {
      console.error('Error creating bulk backtests:', error);
      throw error;
    }
  }

  // Export functionality
  async exportBacktestResults(backtestId, format = 'csv') {
    try {
      const response = await api.get(`${this.baseUrl}/backtests/${backtestId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backtest_${backtestId}_results.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting backtest results:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const backtestService = new BacktestService();
export { backtestService };
export default backtestService;
