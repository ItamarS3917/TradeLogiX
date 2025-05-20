// apiBridge.js
// A bridge service to transition from Firebase to backend API
// This service will detect which data source to use and route calls accordingly

import api from './api';
import { getFirebaseTradeService, getFirebasePlanningService, getFirebaseJournalService } from './serviceFactory';

/**
 * Utility function to determine if we should use Firebase or API
 * This can be controlled by a feature flag or environment variable
 * @returns {boolean} Whether to use API (true) or Firebase (false)
 */
const shouldUseApi = () => {
  return process.env.REACT_APP_USE_API === 'true' || localStorage.getItem('use_api') === 'true';
};

/**
 * ApiBridge service - routes calls to either Firebase or backend API
 * This provides a smooth transition path during migration
 */
const apiBridge = {
  /**
   * Trade service bridging
   */
  trades: {
    /**
     * Get all trades with filtering
     * @param {Object} params - Query parameters
     * @returns {Promise} - Response from service
     */
    getAllTrades: async (params = {}) => {
      if (shouldUseApi()) {
        try {
          const response = await api.get('/trades', { params });
          return response.data;
        } catch (error) {
          console.error('API Error getting trades:', error);
          // If API fails, fallback to Firebase
          console.log('Falling back to Firebase for getAllTrades');
          const firebaseService = getFirebaseTradeService();
          return firebaseService.getAllTrades(params);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseTradeService();
        return firebaseService.getAllTrades(params);
      }
    },

    /**
     * Get trade by ID
     * @param {string|number} id - Trade ID
     * @returns {Promise} - Response from service
     */
    getTradeById: async (id) => {
      if (shouldUseApi()) {
        try {
          const response = await api.get(`/trades/${id}`);
          return response.data;
        } catch (error) {
          console.error('API Error getting trade by ID:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for getTradeById');
          const firebaseService = getFirebaseTradeService();
          return firebaseService.getTradeById(id);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseTradeService();
        return firebaseService.getTradeById(id);
      }
    },

    /**
     * Create new trade
     * @param {Object} tradeData - Trade data
     * @returns {Promise} - Response from service
     */
    createTrade: async (tradeData) => {
      if (shouldUseApi()) {
        try {
          // Transform data if needed for API
          const apiTradeData = transformTradeDataForApi(tradeData);
          
          const response = await api.post('/trades', apiTradeData);
          return response.data;
        } catch (error) {
          console.error('API Error creating trade:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for createTrade');
          const firebaseService = getFirebaseTradeService();
          return firebaseService.createTrade(tradeData);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseTradeService();
        return firebaseService.createTrade(tradeData);
      }
    },

    /**
     * Update existing trade
     * @param {string|number} id - Trade ID
     * @param {Object} tradeData - Updated trade data
     * @returns {Promise} - Response from service
     */
    updateTrade: async (id, tradeData) => {
      if (shouldUseApi()) {
        try {
          // Transform data if needed for API
          const apiTradeData = transformTradeDataForApi(tradeData);
          
          const response = await api.put(`/trades/${id}`, apiTradeData);
          return response.data;
        } catch (error) {
          console.error('API Error updating trade:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for updateTrade');
          const firebaseService = getFirebaseTradeService();
          return firebaseService.updateTrade(id, tradeData);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseTradeService();
        return firebaseService.updateTrade(id, tradeData);
      }
    },

    /**
     * Delete trade
     * @param {string|number} id - Trade ID
     * @returns {Promise} - Response from service
     */
    deleteTrade: async (id) => {
      if (shouldUseApi()) {
        try {
          const response = await api.delete(`/trades/${id}`);
          return response.data || { detail: "Trade deleted successfully" };
        } catch (error) {
          console.error('API Error deleting trade:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for deleteTrade');
          const firebaseService = getFirebaseTradeService();
          return firebaseService.deleteTrade(id);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseTradeService();
        return firebaseService.deleteTrade(id);
      }
    },

    /**
     * Upload trade screenshot
     * @param {string|number} tradeId - Trade ID
     * @param {File} file - Screenshot file
     * @returns {Promise} - Response from service
     */
    uploadScreenshot: async (tradeId, file) => {
      if (shouldUseApi()) {
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
          console.error('API Error uploading screenshot:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for uploadScreenshot');
          const firebaseService = getFirebaseTradeService();
          return firebaseService.uploadScreenshot(tradeId, file);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseTradeService();
        return firebaseService.uploadScreenshot(tradeId, file);
      }
    }
  },

  /**
   * Planning service bridging
   */
  plans: {
    /**
     * Get all daily plans
     * @param {Object} params - Query parameters
     * @returns {Promise} - Response from service
     */
    getAllDailyPlans: async (params = {}) => {
      if (shouldUseApi()) {
        try {
          const response = await api.get('/planning', { params });
          return response.data;
        } catch (error) {
          console.error('API Error getting daily plans:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for getAllDailyPlans');
          const firebaseService = getFirebasePlanningService();
          return firebaseService.getAllDailyPlans(params);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebasePlanningService();
        return firebaseService.getAllDailyPlans(params);
      }
    },

    /**
     * Get daily plan by date
     * @param {string} date - Date in ISO format
     * @returns {Promise} - Response from service
     */
    getDailyPlanByDate: async (date) => {
      if (shouldUseApi()) {
        try {
          const response = await api.get('/planning/date', { params: { date } });
          return response.data;
        } catch (error) {
          console.error('API Error getting daily plan by date:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for getDailyPlanByDate');
          const firebaseService = getFirebasePlanningService();
          return firebaseService.getDailyPlanByDate(date);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebasePlanningService();
        return firebaseService.getDailyPlanByDate(date);
      }
    },

    /**
     * Create new daily plan
     * @param {Object} planData - Daily plan data
     * @returns {Promise} - Response from service
     */
    createDailyPlan: async (planData) => {
      if (shouldUseApi()) {
        try {
          // Transform data if needed for API
          const apiPlanData = transformPlanDataForApi(planData);
          
          const response = await api.post('/planning', apiPlanData);
          return response.data;
        } catch (error) {
          console.error('API Error creating daily plan:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for createDailyPlan');
          const firebaseService = getFirebasePlanningService();
          return firebaseService.createDailyPlan(planData);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebasePlanningService();
        return firebaseService.createDailyPlan(planData);
      }
    },

    /**
     * Update existing daily plan
     * @param {string|number} id - Plan ID
     * @param {Object} planData - Updated plan data
     * @returns {Promise} - Response from service
     */
    updateDailyPlan: async (id, planData) => {
      if (shouldUseApi()) {
        try {
          // Transform data if needed for API
          const apiPlanData = transformPlanDataForApi(planData);
          
          const response = await api.put(`/planning/${id}`, apiPlanData);
          return response.data;
        } catch (error) {
          console.error('API Error updating daily plan:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for updateDailyPlan');
          const firebaseService = getFirebasePlanningService();
          return firebaseService.updateDailyPlan(id, planData);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebasePlanningService();
        return firebaseService.updateDailyPlan(id, planData);
      }
    },

    /**
     * Delete daily plan
     * @param {string|number} id - Plan ID
     * @returns {Promise} - Response from service
     */
    deleteDailyPlan: async (id) => {
      if (shouldUseApi()) {
        try {
          const response = await api.delete(`/planning/${id}`);
          return response.data || { detail: "Daily plan deleted successfully" };
        } catch (error) {
          console.error('API Error deleting daily plan:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for deleteDailyPlan');
          const firebaseService = getFirebasePlanningService();
          return firebaseService.deleteDailyPlan(id);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebasePlanningService();
        return firebaseService.deleteDailyPlan(id);
      }
    }
  },

  /**
   * Journal service bridging
   */
  journals: {
    /**
     * Get all journal entries
     * @param {Object} params - Query parameters
     * @returns {Promise} - Response from service
     */
    getAllJournalEntries: async (params = {}) => {
      if (shouldUseApi()) {
        try {
          const response = await api.get('/journals', { params });
          return response.data;
        } catch (error) {
          console.error('API Error getting journal entries:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for getAllJournalEntries');
          const firebaseService = getFirebaseJournalService();
          return firebaseService.getAllJournalEntries(params);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseJournalService();
        return firebaseService.getAllJournalEntries(params);
      }
    },

    /**
     * Get journal entry by ID
     * @param {string|number} id - Journal entry ID
     * @returns {Promise} - Response from service
     */
    getJournalEntryById: async (id) => {
      if (shouldUseApi()) {
        try {
          const response = await api.get(`/journals/${id}`);
          return response.data;
        } catch (error) {
          console.error('API Error getting journal entry by ID:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for getJournalEntryById');
          const firebaseService = getFirebaseJournalService();
          return firebaseService.getJournalEntryById(id);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseJournalService();
        return firebaseService.getJournalEntryById(id);
      }
    },

    /**
     * Create new journal entry
     * @param {Object} journalData - Journal entry data
     * @returns {Promise} - Response from service
     */
    createJournalEntry: async (journalData) => {
      if (shouldUseApi()) {
        try {
          // Transform data if needed for API
          const apiJournalData = transformJournalDataForApi(journalData);
          
          const response = await api.post('/journals', apiJournalData);
          return response.data;
        } catch (error) {
          console.error('API Error creating journal entry:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for createJournalEntry');
          const firebaseService = getFirebaseJournalService();
          return firebaseService.createJournalEntry(journalData);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseJournalService();
        return firebaseService.createJournalEntry(journalData);
      }
    },

    /**
     * Update existing journal entry
     * @param {string|number} id - Journal entry ID
     * @param {Object} journalData - Updated journal entry data
     * @returns {Promise} - Response from service
     */
    updateJournalEntry: async (id, journalData) => {
      if (shouldUseApi()) {
        try {
          // Transform data if needed for API
          const apiJournalData = transformJournalDataForApi(journalData);
          
          const response = await api.put(`/journals/${id}`, apiJournalData);
          return response.data;
        } catch (error) {
          console.error('API Error updating journal entry:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for updateJournalEntry');
          const firebaseService = getFirebaseJournalService();
          return firebaseService.updateJournalEntry(id, journalData);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseJournalService();
        return firebaseService.updateJournalEntry(id, journalData);
      }
    },

    /**
     * Delete journal entry
     * @param {string|number} id - Journal entry ID
     * @returns {Promise} - Response from service
     */
    deleteJournalEntry: async (id) => {
      if (shouldUseApi()) {
        try {
          const response = await api.delete(`/journals/${id}`);
          return response.data || { detail: "Journal entry deleted successfully" };
        } catch (error) {
          console.error('API Error deleting journal entry:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for deleteJournalEntry');
          const firebaseService = getFirebaseJournalService();
          return firebaseService.deleteJournalEntry(id);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseJournalService();
        return firebaseService.deleteJournalEntry(id);
      }
    }
  }
};

/**
 * Transform trade data from Firebase format to API format
 * @param {Object} tradeData - Trade data in Firebase format
 * @returns {Object} - Trade data in API format
 */
const transformTradeDataForApi = (tradeData) => {
  // Deep clone to avoid modifying the original data
  const apiData = JSON.parse(JSON.stringify(tradeData));
  
  // Convert camelCase to snake_case if needed
  if (apiData.setupType && !apiData.setup_type) {
    apiData.setup_type = apiData.setupType;
    delete apiData.setupType;
  }
  
  if (apiData.entryPrice && !apiData.entry_price) {
    apiData.entry_price = apiData.entryPrice;
    delete apiData.entryPrice;
  }
  
  if (apiData.exitPrice && !apiData.exit_price) {
    apiData.exit_price = apiData.exitPrice;
    delete apiData.exitPrice;
  }
  
  if (apiData.entryTime && !apiData.entry_time) {
    apiData.entry_time = apiData.entryTime;
    delete apiData.entryTime;
  }
  
  if (apiData.exitTime && !apiData.exit_time) {
    apiData.exit_time = apiData.exitTime;
    delete apiData.exitTime;
  }
  
  if (apiData.positionSize && !apiData.position_size) {
    apiData.position_size = apiData.positionSize;
    delete apiData.positionSize;
  }
  
  if (apiData.plannedRiskReward && !apiData.planned_risk_reward) {
    apiData.planned_risk_reward = apiData.plannedRiskReward;
    delete apiData.plannedRiskReward;
  }
  
  if (apiData.actualRiskReward && !apiData.actual_risk_reward) {
    apiData.actual_risk_reward = apiData.actualRiskReward;
    delete apiData.actualRiskReward;
  }
  
  if (apiData.profitLoss && !apiData.profit_loss) {
    apiData.profit_loss = apiData.profitLoss;
    delete apiData.profitLoss;
  }
  
  if (apiData.emotionalState && !apiData.emotional_state) {
    apiData.emotional_state = apiData.emotionalState;
    delete apiData.emotionalState;
  }
  
  if (apiData.planAdherence && !apiData.plan_adherence) {
    apiData.plan_adherence = apiData.planAdherence;
    delete apiData.planAdherence;
  }
  
  if (apiData.userId && !apiData.user_id) {
    apiData.user_id = apiData.userId;
    delete apiData.userId;
  }
  
  // Handle timestamps
  if (apiData.createdAt && !apiData.created_at) {
    apiData.created_at = apiData.createdAt;
    delete apiData.createdAt;
  }
  
  if (apiData.updatedAt && !apiData.updated_at) {
    apiData.updated_at = apiData.updatedAt;
    delete apiData.updatedAt;
  }
  
  return apiData;
};

/**
 * Transform plan data from Firebase format to API format
 * @param {Object} planData - Plan data in Firebase format
 * @returns {Object} - Plan data in API format
 */
const transformPlanDataForApi = (planData) => {
  // Deep clone to avoid modifying the original data
  const apiData = JSON.parse(JSON.stringify(planData));
  
  // Convert camelCase to snake_case if needed
  if (apiData.marketBias && !apiData.market_bias) {
    apiData.market_bias = apiData.marketBias;
    delete apiData.marketBias;
  }
  
  if (apiData.keyLevels && !apiData.key_levels) {
    apiData.key_levels = apiData.keyLevels;
    delete apiData.keyLevels;
  }
  
  if (apiData.riskParameters && !apiData.risk_parameters) {
    apiData.risk_parameters = apiData.riskParameters;
    delete apiData.riskParameters;
  }
  
  if (apiData.mentalState && !apiData.mental_state) {
    apiData.mental_state = apiData.mentalState;
    delete apiData.mentalState;
  }
  
  if (apiData.userId && !apiData.user_id) {
    apiData.user_id = apiData.userId;
    delete apiData.userId;
  }
  
  // Handle timestamps
  if (apiData.createdAt && !apiData.created_at) {
    apiData.created_at = apiData.createdAt;
    delete apiData.createdAt;
  }
  
  if (apiData.updatedAt && !apiData.updated_at) {
    apiData.updated_at = apiData.updatedAt;
    delete apiData.updatedAt;
  }
  
  return apiData;
};

/**
 * Transform journal data from Firebase format to API format
 * @param {Object} journalData - Journal data in Firebase format
 * @returns {Object} - Journal data in API format
 */
const transformJournalDataForApi = (journalData) => {
  // Deep clone to avoid modifying the original data
  const apiData = JSON.parse(JSON.stringify(journalData));
  
  // Convert camelCase to snake_case if needed
  if (apiData.moodRating && !apiData.mood_rating) {
    apiData.mood_rating = apiData.moodRating;
    delete apiData.moodRating;
  }
  
  if (apiData.relatedTradeIds && !apiData.related_trade_ids) {
    apiData.related_trade_ids = apiData.relatedTradeIds;
    delete apiData.relatedTradeIds;
  }
  
  if (apiData.userId && !apiData.user_id) {
    apiData.user_id = apiData.userId;
    delete apiData.userId;
  }
  
  // Handle timestamps
  if (apiData.createdAt && !apiData.created_at) {
    apiData.created_at = apiData.createdAt;
    delete apiData.createdAt;
  }
  
  if (apiData.updatedAt && !apiData.updated_at) {
    apiData.updated_at = apiData.updatedAt;
    delete apiData.updatedAt;
  }
  
  return apiData;
};

export default apiBridge;
