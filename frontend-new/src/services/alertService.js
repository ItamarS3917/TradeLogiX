// File: src/services/alertService.js
// Purpose: Service for managing alerts and notifications

import api from './api';

/**
 * Get alerts for a user
 * @param {number} userId - User ID
 * @param {object} filters - Optional filters (status, type)
 * @returns {Promise} - Promise with alerts data
 */
export const getUserAlerts = async (userId, filters = {}) => {
  try {
    const params = { user_id: userId, ...filters };
    const response = await api.get('/mcp/alerts', { params });
    return response.data.alerts;
  } catch (error) {
    console.error('Error fetching user alerts:', error);
    throw error;
  }
};

/**
 * Create a new alert
 * @param {object} alertData - Alert data object
 * @returns {Promise} - Promise with created alert data
 */
export const createAlert = async (alertData) => {
  try {
    const response = await api.post('/mcp/alerts', alertData);
    return response.data;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

/**
 * Get alert details
 * @param {number} alertId - Alert ID
 * @returns {Promise} - Promise with alert details
 */
export const getAlertDetails = async (alertId) => {
  try {
    const response = await api.get(`/mcp/alerts/${alertId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alert details:', error);
    throw error;
  }
};

/**
 * Update an alert
 * @param {number} alertId - Alert ID
 * @param {object} alertData - Updated alert data
 * @returns {Promise} - Promise with updated alert data
 */
export const updateAlert = async (alertId, alertData) => {
  try {
    const response = await api.put(`/mcp/alerts/${alertId}`, alertData);
    return response.data;
  } catch (error) {
    console.error('Error updating alert:', error);
    throw error;
  }
};

/**
 * Delete an alert
 * @param {number} alertId - Alert ID
 * @returns {Promise} - Promise with deletion result
 */
export const deleteAlert = async (alertId) => {
  try {
    const response = await api.delete(`/mcp/alerts/${alertId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting alert:', error);
    throw error;
  }
};

/**
 * Trigger an alert manually
 * @param {number} alertId - Alert ID
 * @returns {Promise} - Promise with trigger result
 */
export const triggerAlert = async (alertId) => {
  try {
    const response = await api.post(`/mcp/alerts/${alertId}/trigger`);
    return response.data;
  } catch (error) {
    console.error('Error triggering alert:', error);
    throw error;
  }
};

/**
 * Check if any alerts should be triggered
 * @param {number} userId - User ID
 * @param {object} data - Data to check against alert conditions
 * @returns {Promise} - Promise with check result
 */
export const checkAlerts = async (userId, data) => {
  try {
    const payload = {
      user_id: userId,
      metrics: data.metrics || {},
      trade_data: data.trade_data || {}
    };
    const response = await api.post('/mcp/alerts/check', payload);
    return response.data;
  } catch (error) {
    console.error('Error checking alerts:', error);
    throw error;
  }
};

/**
 * Get alert types
 * @returns {Promise} - Promise with alert types
 */
export const getAlertTypes = async () => {
  try {
    const response = await api.get('/mcp/alerts/types');
    return response.data.types;
  } catch (error) {
    console.error('Error fetching alert types:', error);
    throw error;
  }
};

/**
 * Get alert rules
 * @returns {Promise} - Promise with alert rules
 */
export const getAlertRules = async () => {
  try {
    const response = await api.get('/mcp/alerts/rules');
    return response.data.rules;
  } catch (error) {
    console.error('Error fetching alert rules:', error);
    throw error;
  }
};

// Default export
const alertService = {
  getUserAlerts,
  createAlert,
  getAlertDetails,
  updateAlert,
  deleteAlert,
  triggerAlert,
  checkAlerts,
  getAlertTypes,
  getAlertRules
};

export default alertService;