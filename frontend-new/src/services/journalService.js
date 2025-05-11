import api from './api';

/**
 * Journal service for handling journal-related operations
 */
const journalService = {
  /**
   * Get all journal entries
   * @param {Object} params - Query parameters
   * @returns {Promise} - Response from API
   */
  getAllJournalEntries: async (params = {}) => {
    try {
      const response = await api.get('/journal', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get journal entry by ID
   * @param {string} id - Journal entry ID
   * @returns {Promise} - Response from API
   */
  getJournalEntryById: async (id) => {
    try {
      const response = await api.get(`/journal/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new journal entry
   * @param {Object} journalData - Journal entry data
   * @returns {Promise} - Response from API
   */
  createJournalEntry: async (journalData) => {
    try {
      const response = await api.post('/journal', journalData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update existing journal entry
   * @param {string} id - Journal entry ID
   * @param {Object} journalData - Updated journal entry data
   * @returns {Promise} - Response from API
   */
  updateJournalEntry: async (id, journalData) => {
    try {
      const response = await api.put(`/journal/${id}`, journalData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete journal entry
   * @param {string} id - Journal entry ID
   * @returns {Promise} - Response from API
   */
  deleteJournalEntry: async (id) => {
    try {
      const response = await api.delete(`/journal/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get journal entries by date
   * @param {string} date - Date in ISO format
   * @returns {Promise} - Response from API
   */
  getJournalEntriesByDate: async (date) => {
    try {
      const response = await api.get('/journal/date', {
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get journal entries by tag
   * @param {string} tag - Tag to filter by
   * @returns {Promise} - Response from API
   */
  getJournalEntriesByTag: async (tag) => {
    try {
      const response = await api.get('/journal/tag', {
        params: { tag }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get journal entries by mood rating
   * @param {number} rating - Mood rating to filter by
   * @returns {Promise} - Response from API
   */
  getJournalEntriesByMoodRating: async (rating) => {
    try {
      const response = await api.get('/journal/mood', {
        params: { rating }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search journal entries
   * @param {string} query - Search query
   * @returns {Promise} - Response from API
   */
  searchJournalEntries: async (query) => {
    try {
      const response = await api.get('/journal/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default journalService;
