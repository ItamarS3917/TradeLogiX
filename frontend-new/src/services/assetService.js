import api from './api';

/**
 * Asset service for handling asset-related operations
 */
const assetService = {
  /**
   * Get all assets
   * @returns {Promise} - Response from API
   */
  getAssets: async () => {
    try {
      const response = await api.get('/assets');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get asset by ID
   * @param {string} id - Asset ID
   * @returns {Promise} - Response from API
   */
  getAssetById: async (id) => {
    try {
      const response = await api.get(`/assets/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get asset types
   * @returns {Promise} - Response from API
   */
  getAssetTypes: async () => {
    try {
      const response = await api.get('/assets/types');
      return response.data;
    } catch (error) {
      console.error('Error fetching asset types:', error);
      // Return default asset types if API fails
      return ['Futures', 'Forex', 'Crypto', 'Stocks', 'Options'];
    }
  },

  /**
   * Create a new asset
   * @param {Object} assetData - Asset data
   * @returns {Promise} - Response from API
   */
  createAsset: async (assetData) => {
    try {
      const response = await api.post('/assets', assetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update an asset
   * @param {string} id - Asset ID
   * @param {Object} assetData - Updated asset data
   * @returns {Promise} - Response from API
   */
  updateAsset: async (id, assetData) => {
    try {
      const response = await api.put(`/assets/${id}`, assetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete an asset
   * @param {string} id - Asset ID
   * @returns {Promise} - Response from API
   */
  deleteAsset: async (id) => {
    try {
      const response = await api.delete(`/assets/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default assetService;