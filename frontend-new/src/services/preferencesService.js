// File: src/services/preferencesService.js
// Purpose: Service for managing user preferences and theme customization

import api from './api';

/**
 * Get user preferences
 * @param {number} userId - User ID
 * @returns {Promise} - Promise with preferences data
 */
export const getUserPreferences = async (userId) => {
  try {
    const response = await api.get(`/mcp/preferences/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
};

/**
 * Update user preferences
 * @param {number} userId - User ID
 * @param {object} preferences - Preferences data to update
 * @returns {Promise} - Promise with updated preferences data
 */
export const updateUserPreferences = async (userId, preferences) => {
  try {
    const response = await api.put(`/mcp/preferences/${userId}`, preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

/**
 * Get user theme preferences
 * @param {number} userId - User ID
 * @returns {Promise} - Promise with theme data
 */
export const getUserTheme = async (userId) => {
  try {
    const response = await api.get(`/mcp/preferences/${userId}/theme`);
    return response.data.theme;
  } catch (error) {
    console.error('Error fetching user theme:', error);
    throw error;
  }
};

/**
 * Update user theme
 * @param {number} userId - User ID
 * @param {object} theme - Theme data to update
 * @returns {Promise} - Promise with updated theme data
 */
export const updateUserTheme = async (userId, theme) => {
  try {
    const response = await api.put(`/mcp/preferences/${userId}/theme`, { theme });
    return response.data.theme;
  } catch (error) {
    console.error('Error updating user theme:', error);
    throw error;
  }
};

/**
 * Get available themes
 * @returns {Promise} - Promise with available themes
 */
export const getAvailableThemes = async () => {
  try {
    const response = await api.get(`/mcp/preferences/themes/available`);
    return response.data.themes;
  } catch (error) {
    console.error('Error fetching available themes:', error);
    throw error;
  }
};

/**
 * Get user dashboard layout
 * @param {number} userId - User ID
 * @returns {Promise} - Promise with dashboard layout data
 */
export const getDashboardLayout = async (userId) => {
  try {
    const response = await api.get(`/mcp/preferences/${userId}/dashboard`);
    return response.data.dashboard_layout;
  } catch (error) {
    console.error('Error fetching dashboard layout:', error);
    throw error;
  }
};

/**
 * Update user dashboard layout
 * @param {number} userId - User ID
 * @param {object} layout - Dashboard layout data to update
 * @returns {Promise} - Promise with updated dashboard layout data
 */
export const updateDashboardLayout = async (userId, layout) => {
  try {
    const response = await api.put(`/mcp/preferences/${userId}/dashboard`, { dashboard_layout: layout });
    return response.data.dashboard_layout;
  } catch (error) {
    console.error('Error updating dashboard layout:', error);
    throw error;
  }
};

/**
 * Get notification preferences
 * @param {number} userId - User ID
 * @returns {Promise} - Promise with notification preferences data
 */
export const getNotificationPreferences = async (userId) => {
  try {
    const response = await api.get(`/mcp/preferences/${userId}/notifications`);
    return response.data.notification_preferences;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    throw error;
  }
};

/**
 * Update notification preferences
 * @param {number} userId - User ID
 * @param {object} preferences - Notification preferences data to update
 * @returns {Promise} - Promise with updated notification preferences data
 */
export const updateNotificationPreferences = async (userId, preferences) => {
  try {
    const response = await api.put(`/mcp/preferences/${userId}/notifications`, { notification_preferences: preferences });
    return response.data.notification_preferences;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

// Default export
const preferencesService = {
  getUserPreferences,
  updateUserPreferences,
  getUserTheme,
  updateUserTheme,
  getAvailableThemes,
  getDashboardLayout,
  updateDashboardLayout,
  getNotificationPreferences,
  updateNotificationPreferences
};

export default preferencesService;