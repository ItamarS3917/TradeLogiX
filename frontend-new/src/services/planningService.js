import api from './api';

/**
 * Planning service for handling daily planning operations
 */
const planningService = {
  /**
   * Get all daily plans
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response from API
   */
  getAllDailyPlans: async (params = {}) => {
    try {
      const response = await api.get('/planning', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get daily plan by ID
   * @param {string} id - Plan ID
   * @returns {Promise} - Response from API
   */
  getDailyPlanById: async (id) => {
    try {
      const response = await api.get(`/planning/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get daily plan by date
   * @param {string} date - Date in ISO format
   * @returns {Promise} - Response from API
   */
  getDailyPlanByDate: async (date) => {
    try {
      const response = await api.get('/planning/date', {
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new daily plan
   * @param {Object} planData - Daily plan data
   * @returns {Promise} - Response from API
   */
  createDailyPlan: async (planData) => {
    try {
      const response = await api.post('/planning', planData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update existing daily plan
   * @param {string} id - Plan ID
   * @param {Object} planData - Updated plan data
   * @returns {Promise} - Response from API
   */
  updateDailyPlan: async (id, planData) => {
    try {
      const response = await api.put(`/planning/${id}`, planData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete daily plan
   * @param {string} id - Plan ID
   * @returns {Promise} - Response from API
   */
  deleteDailyPlan: async (id) => {
    try {
      const response = await api.delete(`/planning/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get today's plan
   * @returns {Promise} - Response from API
   */
  getTodaysPlan: async () => {
    try {
      const response = await api.get('/planning/today');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get plans by market bias
   * @param {string} bias - Market bias to filter by
   * @returns {Promise} - Response from API
   */
  getPlansByMarketBias: async (bias) => {
    try {
      const response = await api.get('/planning/bias', {
        params: { bias }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add key level to daily plan
   * @param {string} planId - Plan ID
   * @param {Object} levelData - Key level data
   * @returns {Promise} - Response from API
   */
  addKeyLevel: async (planId, levelData) => {
    try {
      const response = await api.post(`/planning/${planId}/levels`, levelData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove key level from daily plan
   * @param {string} planId - Plan ID
   * @param {string} levelId - Level ID
   * @returns {Promise} - Response from API
   */
  removeKeyLevel: async (planId, levelId) => {
    try {
      const response = await api.delete(`/planning/${planId}/levels/${levelId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default planningService;
