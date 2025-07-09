// serviceFactory.js
// CONFIGURED FOR REAL DATA ONLY - No sample/mock data allowed
// Factory to select between API and Firebase implementations with caching support

import apiTradeService from './tradeService';
import firebaseTradeService from './firebase/tradeService';
import apiPlanningService from './planningService';
import firebasePlanningService from './firebase/planningService';
import apiJournalService from './journalService';
import firebaseJournalService from './firebase/journalService';
import apiBridge from './apiBridge';
import enhancedApiBridge from './enhancedApiBridge';
import { isFirebaseDirectMode } from '../config/firebaseConfig';

// Feature flag for enabling enhanced API bridge with caching
const USE_ENHANCED_API_BRIDGE = true;

/**
 * Indicates which data source mode to use
 * CONFIGURED FOR REAL DATA ONLY - No sample/mock data
 * @returns {string} 'firebase', 'api', or 'bridge'
 */
export const getDataSourceMode = () => {
  // Check if we're in production mode (real data only)
  const isProductionMode = import.meta.env.VITE_PRODUCTION_MODE === 'true';
  const disableSampleData = import.meta.env.VITE_DISABLE_SAMPLE_DATA === 'true';
  
  if (isProductionMode || disableSampleData) {
    console.log('🔒 PRODUCTION MODE: Using Firebase for real data only');
    return 'firebase';
  }
  
  // Check for localStorage override (allows manual toggling)
  const localStorageMode = localStorage.getItem('data_source_mode');
  if (localStorageMode && ['firebase', 'api', 'bridge'].includes(localStorageMode)) {
    console.log('Using data source mode from localStorage:', localStorageMode);
    return localStorageMode;
  }
  
  // Check for environment variable
  if (import.meta.env.VITE_DATA_SOURCE_MODE) {
    return import.meta.env.VITE_DATA_SOURCE_MODE;
  }
  
  // Default to Firebase mode to ensure we're using real data storage
  console.log('📊 Using Firebase for real trading data');
  return 'firebase';
};

/**
 * Check if sample data is disabled
 * @returns {boolean} Whether sample data should be disabled
 */
export const isSampleDataDisabled = () => {
  return import.meta.env.VITE_DISABLE_SAMPLE_DATA === 'true' || 
         import.meta.env.VITE_PRODUCTION_MODE === 'true';
};

/**
 * Helper function to get the appropriate service
 * @param {Object} apiService - API implementation
 * @param {Object} firebaseService - Firebase implementation
 * @param {Object} bridgeService - Bridge implementation
 * @param {Object} enhancedBridgeService - Enhanced bridge implementation with caching
 * @returns {Object} - Selected service
 */
const getService = (apiService, firebaseService, bridgeService, enhancedBridgeService) => {
  const mode = getDataSourceMode();
  console.log('Using data source mode:', mode);
  
  // For debugging - Save references to the window object
  if (typeof window !== 'undefined') {
    window.apiService = apiService;
    window.firebaseService = firebaseService;
    window.bridgeService = bridgeService;
    window.enhancedBridgeService = enhancedBridgeService;
    window.dataSourceMode = mode;
    window.serviceFactory = { getDataSourceMode, isSampleDataDisabled };
    window.isRealDataMode = true; // Flag to indicate we're using real data only
  }
  
  switch (mode) {
    case 'firebase':
      return firebaseService;
    case 'api':
      return apiService;
    case 'bridge':
      return isUsingEnhancedApiBridge() ? enhancedBridgeService : bridgeService;
    default:
      // Fallback to Firebase if unexpected mode
      console.log('Unknown mode, falling back to Firebase for real data');
      return firebaseService;
  }
};

/**
 * Get Firebase trade service directly
 * Useful for the bridge implementation to access Firebase
 */
export const getFirebaseTradeService = () => firebaseTradeService;

/**
 * Get Firebase planning service directly
 * Useful for the bridge implementation to access Firebase
 */
export const getFirebasePlanningService = () => firebasePlanningService;

/**
 * Get Firebase journal service directly
 * Useful for the bridge implementation to access Firebase
 */
export const getFirebaseJournalService = () => firebaseJournalService;

/**
 * Check if enhanced API bridge is enabled
 * @returns {boolean} Whether enhanced API bridge is enabled
 */
export const isUsingEnhancedApiBridge = () => {
  const storedValue = localStorage.getItem('use_enhanced_api_bridge');
  
  if (storedValue !== null) {
    return storedValue === 'true';
  }
  
  return USE_ENHANCED_API_BRIDGE;
};

/**
 * Toggle enhanced API bridge with caching
 * @param {boolean} useEnhanced - Whether to use enhanced API bridge
 */
export const setUseEnhancedApiBridge = (useEnhanced) => {
  localStorage.setItem('use_enhanced_api_bridge', useEnhanced ? 'true' : 'false');
  
  // Force refresh to apply changes
  window.location.reload();
};

// Export services via getters to ensure they're evaluated at usage time
export const tradeService = getService(apiTradeService, firebaseTradeService, apiBridge.trades, enhancedApiBridge.trades);
export const planningService = getService(apiPlanningService, firebasePlanningService, apiBridge.plans, enhancedApiBridge.plans);
export const journalService = getService(apiJournalService, firebaseJournalService, apiBridge.journals, enhancedApiBridge.journals);

/**
 * Force real data mode (Firebase only)
 * This ensures we never use sample/mock data
 */
export const forceRealDataMode = () => {
  localStorage.setItem('data_source_mode', 'firebase');
  console.log('🎯 Forced real data mode: Firebase only');
  
  // Clear any potential sample data flags
  localStorage.removeItem('use_sample_data');
  localStorage.removeItem('enable_mock_data');
  
  // Force refresh to apply changes
  window.location.reload();
};

/**
 * Toggle between data sources programmatically
 * Useful for testing or for providing a UI toggle
 * @param {string} mode - 'firebase', 'api', or 'bridge'
 */
export const setDataSourceMode = (mode) => {
  // If sample data is disabled, force Firebase mode
  if (isSampleDataDisabled() && mode !== 'firebase') {
    console.warn('Sample data disabled - forcing Firebase mode for real data only');
    mode = 'firebase';
  }
  
  if (!['firebase', 'api', 'bridge'].includes(mode)) {
    console.error('Invalid data source mode:', mode);
    return;
  }
  
  localStorage.setItem('data_source_mode', mode);
  
  // Force refresh to apply changes
  window.location.reload();
};

/**
 * Get cache service statistics
 * Useful for debugging and monitoring
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  if (isUsingEnhancedApiBridge()) {
    return enhancedApiBridge.cache.getStats();
  }
  
  return { enabled: false };
};

/**
 * Clear the cache
 * @returns {number} Number of cache entries cleared
 */
export const clearCache = () => {
  if (isUsingEnhancedApiBridge()) {
    return enhancedApiBridge.cache.clear();
  }
  
  return 0;
};

// Add other services following the same pattern
