// enhancedApiBridge.js
// An enhanced version of the API bridge with caching for better performance

import api from './api';
import cacheService from './cacheService';
import { getFirebaseTradeService, getFirebasePlanningService, getFirebaseJournalService } from './serviceFactory';

// Cache durations for different endpoints
const CACHE_DURATIONS = {
  // Read operations - cache for a while
  GET_ALL_TRADES: 5 * 60 * 1000, // 5 minutes
  GET_TRADE_BY_ID: 5 * 60 * 1000, // 5 minutes
  GET_ALL_PLANS: 5 * 60 * 1000, // 5 minutes
  GET_PLAN_BY_DATE: 5 * 60 * 1000, // 5 minutes
  GET_ALL_JOURNALS: 5 * 60 * 1000, // 5 minutes
  GET_JOURNAL_BY_ID: 5 * 60 * 1000, // 5 minutes
  
  // Write operations don't use cache, but invalidate relevant cache entries
};

/**
 * Utility function to determine if we should use Firebase or API
 * This can be controlled by a feature flag or environment variable
 * @returns {boolean} Whether to use API (true) or Firebase (false)
 */
const shouldUseApi = () => {
  return import.meta.env.VITE_USE_API === 'true' || localStorage.getItem('use_api') === 'true';
};

/**
 * Enhanced API Bridge service with caching
 * This service routes calls to either Firebase or backend API
 * and implements caching for better performance
 */
const enhancedApiBridge = {
  /**
   * Trade service bridging with caching
   */
  trades: {
    /**
     * Get all trades with filtering
     * @param {Object} params - Query parameters
     * @returns {Promise} - Response from service
     */
    getAllTrades: async (params = {}) => {
      // Use query parameters as part of the cache key
      const endpoint = '/trades';
      
      if (shouldUseApi()) {
        // Try to get from cache first
        return await cacheService.getOrSet(
          endpoint,
          params,
          async () => {
            try {
              const response = await api.get(endpoint, { params });
              return response.data;
            } catch (error) {
              console.error('API Error getting trades:', error);
              // If API fails, fallback to Firebase
              console.log('Falling back to Firebase for getAllTrades');
              const firebaseService = getFirebaseTradeService();
              return firebaseService.getAllTrades(params);
            }
          },
          CACHE_DURATIONS.GET_ALL_TRADES
        );
      } else {
        // Use Firebase with caching
        return await cacheService.getOrSet(
          `firebase${endpoint}`,
          params,
          async () => {
            const firebaseService = getFirebaseTradeService();
            return firebaseService.getAllTrades(params);
          },
          CACHE_DURATIONS.GET_ALL_TRADES
        );
      }
    },

    /**
     * Get trade by ID
     * @param {string|number} id - Trade ID
     * @returns {Promise} - Response from service
     */
    getTradeById: async (id) => {
      const endpoint = `/trades/${id}`;
      
      if (shouldUseApi()) {
        // Try to get from cache first
        return await cacheService.getOrSet(
          endpoint,
          {},
          async () => {
            try {
              const response = await api.get(endpoint);
              return response.data;
            } catch (error) {
              console.error('API Error getting trade by ID:', error);
              // Fallback to Firebase
              console.log('Falling back to Firebase for getTradeById');
              const firebaseService = getFirebaseTradeService();
              return firebaseService.getTradeById(id);
            }
          },
          CACHE_DURATIONS.GET_TRADE_BY_ID
        );
      } else {
        // Use Firebase with caching
        return await cacheService.getOrSet(
          `firebase${endpoint}`,
          {},
          async () => {
            const firebaseService = getFirebaseTradeService();
            return firebaseService.getTradeById(id);
          },
          CACHE_DURATIONS.GET_TRADE_BY_ID
        );
      }
    },

    /**
     * Create new trade
     * @param {Object} tradeData - Trade data
     * @returns {Promise} - Response from service
     */
    createTrade: async (tradeData) => {
      // Write operations always go directly to the backend or Firebase
      // After creating, invalidate relevant cache entries
      
      let result;
      
      if (shouldUseApi()) {
        try {
          // Transform data if needed for API
          const apiTradeData = transformTradeDataForApi(tradeData);
          
          const response = await api.post('/trades', apiTradeData);
          result = response.data;
        } catch (error) {
          console.error('API Error creating trade:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for createTrade');
          const firebaseService = getFirebaseTradeService();
          result = await firebaseService.createTrade(tradeData);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseTradeService();
        result = await firebaseService.createTrade(tradeData);
      }
      
      // Invalidate cache for trades list - the list is now outdated
      cacheService.invalidateByPrefix('/trades');
      cacheService.invalidateByPrefix('firebase/trades');
      
      return result;
    },

    /**
     * Update existing trade
     * @param {string|number} id - Trade ID
     * @param {Object} tradeData - Updated trade data
     * @returns {Promise} - Response from service
     */
    updateTrade: async (id, tradeData) => {
      // Write operations always go directly to the backend or Firebase
      // After updating, invalidate relevant cache entries
      
      let result;
      
      if (shouldUseApi()) {
        try {
          // Transform data if needed for API
          const apiTradeData = transformTradeDataForApi(tradeData);
          
          const response = await api.put(`/trades/${id}`, apiTradeData);
          result = response.data;
        } catch (error) {
          console.error('API Error updating trade:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for updateTrade');
          const firebaseService = getFirebaseTradeService();
          result = await firebaseService.updateTrade(id, tradeData);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseTradeService();
        result = await firebaseService.updateTrade(id, tradeData);
      }
      
      // Invalidate cache for this trade and trades list
      cacheService.invalidate(`/trades/${id}`, {});
      cacheService.invalidate(`firebase/trades/${id}`, {});
      cacheService.invalidateByPrefix('/trades');
      cacheService.invalidateByPrefix('firebase/trades');
      
      return result;
    },

    /**
     * Delete trade
     * @param {string|number} id - Trade ID
     * @returns {Promise} - Response from service
     */
    deleteTrade: async (id) => {
      // Write operations always go directly to the backend or Firebase
      // After deleting, invalidate relevant cache entries
      
      let result;
      
      if (shouldUseApi()) {
        try {
          const response = await api.delete(`/trades/${id}`);
          result = response.data || { detail: "Trade deleted successfully" };
        } catch (error) {
          console.error('API Error deleting trade:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for deleteTrade');
          const firebaseService = getFirebaseTradeService();
          result = await firebaseService.deleteTrade(id);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseTradeService();
        result = await firebaseService.deleteTrade(id);
      }
      
      // Invalidate cache for this trade and trades list
      cacheService.invalidate(`/trades/${id}`, {});
      cacheService.invalidate(`firebase/trades/${id}`, {});
      cacheService.invalidateByPrefix('/trades');
      cacheService.invalidateByPrefix('firebase/trades');
      
      return result;
    },

    /**
     * Upload trade screenshot
     * @param {string|number} tradeId - Trade ID
     * @param {File} file - Screenshot file
     * @returns {Promise} - Response from service
     */
    uploadScreenshot: async (tradeId, file) => {
      // Write operations always go directly to the backend or Firebase
      // After uploading, invalidate relevant cache entries
      
      let result;
      
      if (shouldUseApi()) {
        try {
          const formData = new FormData();
          formData.append('screenshot', file);
          
          const response = await api.post(`/trades/${tradeId}/screenshot`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          result = response.data;
        } catch (error) {
          console.error('API Error uploading screenshot:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for uploadScreenshot');
          const firebaseService = getFirebaseTradeService();
          result = await firebaseService.uploadScreenshot(tradeId, file);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseTradeService();
        result = await firebaseService.uploadScreenshot(tradeId, file);
      }
      
      // Invalidate cache for this trade
      cacheService.invalidate(`/trades/${tradeId}`, {});
      cacheService.invalidate(`firebase/trades/${tradeId}`, {});
      
      return result;
    }
  },

  /**
   * Planning service bridging with caching
   */
  plans: {
    /**
     * Get all daily plans
     * @param {Object} params - Query parameters
     * @returns {Promise} - Response from service
     */
    getAllDailyPlans: async (params = {}) => {
      const endpoint = '/planning';
      
      if (shouldUseApi()) {
        // Try to get from cache first
        return await cacheService.getOrSet(
          endpoint,
          params,
          async () => {
            try {
              const response = await api.get(endpoint, { params });
              return response.data;
            } catch (error) {
              console.error('API Error getting daily plans:', error);
              // Fallback to Firebase
              console.log('Falling back to Firebase for getAllDailyPlans');
              const firebaseService = getFirebasePlanningService();
              return firebaseService.getAllDailyPlans(params);
            }
          },
          CACHE_DURATIONS.GET_ALL_PLANS
        );
      } else {
        // Use Firebase with caching
        return await cacheService.getOrSet(
          `firebase${endpoint}`,
          params,
          async () => {
            const firebaseService = getFirebasePlanningService();
            return firebaseService.getAllDailyPlans(params);
          },
          CACHE_DURATIONS.GET_ALL_PLANS
        );
      }
    },

    /**
     * Get daily plan by date
     * @param {string} date - Date in ISO format
     * @returns {Promise} - Response from service
     */
    getDailyPlanByDate: async (date) => {
      const endpoint = '/planning/date';
      const params = { date };
      
      if (shouldUseApi()) {
        // Try to get from cache first
        return await cacheService.getOrSet(
          endpoint,
          params,
          async () => {
            try {
              const response = await api.get(endpoint, { params });
              return response.data;
            } catch (error) {
              console.error('API Error getting daily plan by date:', error);
              // Fallback to Firebase
              console.log('Falling back to Firebase for getDailyPlanByDate');
              const firebaseService = getFirebasePlanningService();
              return firebaseService.getDailyPlanByDate(date);
            }
          },
          CACHE_DURATIONS.GET_PLAN_BY_DATE
        );
      } else {
        // Use Firebase with caching
        return await cacheService.getOrSet(
          `firebase${endpoint}`,
          params,
          async () => {
            const firebaseService = getFirebasePlanningService();
            return firebaseService.getDailyPlanByDate(date);
          },
          CACHE_DURATIONS.GET_PLAN_BY_DATE
        );
      }
    },

    /**
     * Create new daily plan
     * @param {Object} planData - Daily plan data
     * @returns {Promise} - Response from service
     */
    createDailyPlan: async (planData) => {
      let result;
      
      if (shouldUseApi()) {
        try {
          // Transform data if needed for API
          const apiPlanData = transformPlanDataForApi(planData);
          
          const response = await api.post('/planning', apiPlanData);
          result = response.data;
        } catch (error) {
          console.error('API Error creating daily plan:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for createDailyPlan');
          const firebaseService = getFirebasePlanningService();
          result = await firebaseService.createDailyPlan(planData);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebasePlanningService();
        result = await firebaseService.createDailyPlan(planData);
      }
      
      // Invalidate cache for plans list
      cacheService.invalidateByPrefix('/planning');
      cacheService.invalidateByPrefix('firebase/planning');
      
      return result;
    },

    /**
     * Update existing daily plan
     * @param {string|number} id - Plan ID
     * @param {Object} planData - Updated plan data
     * @returns {Promise} - Response from service
     */
    updateDailyPlan: async (id, planData) => {
      let result;
      
      if (shouldUseApi()) {
        try {
          // Transform data if needed for API
          const apiPlanData = transformPlanDataForApi(planData);
          
          const response = await api.put(`/planning/${id}`, apiPlanData);
          result = response.data;
        } catch (error) {
          console.error('API Error updating daily plan:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for updateDailyPlan');
          const firebaseService = getFirebasePlanningService();
          result = await firebaseService.updateDailyPlan(id, planData);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebasePlanningService();
        result = await firebaseService.updateDailyPlan(id, planData);
      }
      
      // Invalidate related cache entries
      cacheService.invalidateByPrefix('/planning');
      cacheService.invalidateByPrefix('firebase/planning');
      
      // If the plan contains a date, invalidate that specific date cache as well
      if (planData.date) {
        const dateString = typeof planData.date === 'string'
          ? planData.date
          : planData.date.toISOString().split('T')[0];
          
        cacheService.invalidate('/planning/date', { date: dateString });
        cacheService.invalidate('firebase/planning/date', { date: dateString });
      }
      
      return result;
    },

    /**
     * Delete daily plan
     * @param {string|number} id - Plan ID
     * @returns {Promise} - Response from service
     */
    deleteDailyPlan: async (id) => {
      let result;
      
      if (shouldUseApi()) {
        try {
          const response = await api.delete(`/planning/${id}`);
          result = response.data || { detail: "Daily plan deleted successfully" };
        } catch (error) {
          console.error('API Error deleting daily plan:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for deleteDailyPlan');
          const firebaseService = getFirebasePlanningService();
          result = await firebaseService.deleteDailyPlan(id);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebasePlanningService();
        result = await firebaseService.deleteDailyPlan(id);
      }
      
      // Invalidate related cache entries
      cacheService.invalidateByPrefix('/planning');
      cacheService.invalidateByPrefix('firebase/planning');
      
      return result;
    }
  },

  /**
   * Journal service bridging with caching
   */
  journals: {
    /**
     * Get all journal entries
     * @param {Object} params - Query parameters
     * @returns {Promise} - Response from service
     */
    getAllJournalEntries: async (params = {}) => {
      const endpoint = '/journals';
      
      if (shouldUseApi()) {
        // Try to get from cache first
        return await cacheService.getOrSet(
          endpoint,
          params,
          async () => {
            try {
              const response = await api.get(endpoint, { params });
              return response.data;
            } catch (error) {
              console.error('API Error getting journal entries:', error);
              // Fallback to Firebase
              console.log('Falling back to Firebase for getAllJournalEntries');
              const firebaseService = getFirebaseJournalService();
              return firebaseService.getAllJournalEntries(params);
            }
          },
          CACHE_DURATIONS.GET_ALL_JOURNALS
        );
      } else {
        // Use Firebase with caching
        return await cacheService.getOrSet(
          `firebase${endpoint}`,
          params,
          async () => {
            const firebaseService = getFirebaseJournalService();
            return firebaseService.getAllJournalEntries(params);
          },
          CACHE_DURATIONS.GET_ALL_JOURNALS
        );
      }
    },

    /**
     * Get journal entry by ID
     * @param {string|number} id - Journal entry ID
     * @returns {Promise} - Response from service
     */
    getJournalEntryById: async (id) => {
      const endpoint = `/journals/${id}`;
      
      if (shouldUseApi()) {
        // Try to get from cache first
        return await cacheService.getOrSet(
          endpoint,
          {},
          async () => {
            try {
              const response = await api.get(endpoint);
              return response.data;
            } catch (error) {
              console.error('API Error getting journal entry by ID:', error);
              // Fallback to Firebase
              console.log('Falling back to Firebase for getJournalEntryById');
              const firebaseService = getFirebaseJournalService();
              return firebaseService.getJournalEntryById(id);
            }
          },
          CACHE_DURATIONS.GET_JOURNAL_BY_ID
        );
      } else {
        // Use Firebase with caching
        return await cacheService.getOrSet(
          `firebase${endpoint}`,
          {},
          async () => {
            const firebaseService = getFirebaseJournalService();
            return firebaseService.getJournalEntryById(id);
          },
          CACHE_DURATIONS.GET_JOURNAL_BY_ID
        );
      }
    },

    /**
     * Create new journal entry
     * @param {Object} journalData - Journal entry data
     * @returns {Promise} - Response from service
     */
    createJournalEntry: async (journalData) => {
      let result;
      
      if (shouldUseApi()) {
        try {
          // Transform data if needed for API
          const apiJournalData = transformJournalDataForApi(journalData);
          
          const response = await api.post('/journals', apiJournalData);
          result = response.data;
        } catch (error) {
          console.error('API Error creating journal entry:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for createJournalEntry');
          const firebaseService = getFirebaseJournalService();
          result = await firebaseService.createJournalEntry(journalData);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseJournalService();
        result = await firebaseService.createJournalEntry(journalData);
      }
      
      // Invalidate cache for journals list
      cacheService.invalidateByPrefix('/journals');
      cacheService.invalidateByPrefix('firebase/journals');
      
      return result;
    },

    /**
     * Update existing journal entry
     * @param {string|number} id - Journal entry ID
     * @param {Object} journalData - Updated journal entry data
     * @returns {Promise} - Response from service
     */
    updateJournalEntry: async (id, journalData) => {
      let result;
      
      if (shouldUseApi()) {
        try {
          // Transform data if needed for API
          const apiJournalData = transformJournalDataForApi(journalData);
          
          const response = await api.put(`/journals/${id}`, apiJournalData);
          result = response.data;
        } catch (error) {
          console.error('API Error updating journal entry:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for updateJournalEntry');
          const firebaseService = getFirebaseJournalService();
          result = await firebaseService.updateJournalEntry(id, journalData);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseJournalService();
        result = await firebaseService.updateJournalEntry(id, journalData);
      }
      
      // Invalidate cache for this journal and journals list
      cacheService.invalidate(`/journals/${id}`, {});
      cacheService.invalidate(`firebase/journals/${id}`, {});
      cacheService.invalidateByPrefix('/journals');
      cacheService.invalidateByPrefix('firebase/journals');
      
      return result;
    },

    /**
     * Delete journal entry
     * @param {string|number} id - Journal entry ID
     * @returns {Promise} - Response from service
     */
    deleteJournalEntry: async (id) => {
      let result;
      
      if (shouldUseApi()) {
        try {
          const response = await api.delete(`/journals/${id}`);
          result = response.data || { detail: "Journal entry deleted successfully" };
        } catch (error) {
          console.error('API Error deleting journal entry:', error);
          // Fallback to Firebase
          console.log('Falling back to Firebase for deleteJournalEntry');
          const firebaseService = getFirebaseJournalService();
          result = await firebaseService.deleteJournalEntry(id);
        }
      } else {
        // Use Firebase
        const firebaseService = getFirebaseJournalService();
        result = await firebaseService.deleteJournalEntry(id);
      }
      
      // Invalidate cache for this journal and journals list
      cacheService.invalidate(`/journals/${id}`, {});
      cacheService.invalidate(`firebase/journals/${id}`, {});
      cacheService.invalidateByPrefix('/journals');
      cacheService.invalidateByPrefix('firebase/journals');
      
      return result;
    }
  },
  
  /**
   * Cache management functions
   */
  cache: {
    // Expose cache service functions
    clear: cacheService.clear,
    getStats: cacheService.getStats,
    
    /**
     * Invalidate all cache for specific resource type
     * @param {string} resourceType - Resource type ('trades', 'plans', 'journals')
     */
    invalidateResource: (resourceType) => {
      let endpoint;
      
      switch (resourceType) {
        case 'trades':
          endpoint = '/trades';
          break;
        case 'plans':
          endpoint = '/planning';
          break;
        case 'journals':
          endpoint = '/journals';
          break;
        default:
          console.warn(`Unknown resource type for invalidation: ${resourceType}`);
          return 0;
      }
      
      // Invalidate both API and Firebase cache for this resource
      const apiCount = cacheService.invalidateByPrefix(endpoint);
      const firebaseCount = cacheService.invalidateByPrefix(`firebase${endpoint}`);
      
      return apiCount + firebaseCount;
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

export default enhancedApiBridge;