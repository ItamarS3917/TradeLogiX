// realDataManager.js
// Utility to ensure the app only uses real trading data

/**
 * Clear all fake/sample data and ensure real data mode
 */
export const initializeRealDataMode = () => {
  console.log('🚀 Initializing Trading Journal in Real Data Mode');
  
  // Clear any sample data flags
  const keysToRemove = [
    'use_sample_data',
    'enable_mock_data',
    'sample_data_added',
    'demo_mode',
    'test_data_enabled'
  ];
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🧹 Cleared ${key} from localStorage`);
    }
  });
  
  // Force Firebase mode for real data
  localStorage.setItem('data_source_mode', 'firebase');
  localStorage.setItem('use_real_data_only', 'true');
  
  console.log('✅ Real data mode initialized');
  console.log('📊 Using Firebase for all data storage');
  
  return true;
};

/**
 * Check if app is in real data mode
 */
export const isRealDataMode = () => {
  const dataSourceMode = localStorage.getItem('data_source_mode');
  const useRealDataOnly = localStorage.getItem('use_real_data_only');
  
  return dataSourceMode === 'firebase' && useRealDataOnly === 'true';
};

/**
 * Validate that no sample data is present
 */
export const validateNoSampleData = () => {
  const sampleDataIndicators = [
    'use_sample_data',
    'enable_mock_data',
    'sample_data_added',
    'demo_mode'
  ];
  
  const foundSampleData = sampleDataIndicators.filter(key => 
    localStorage.getItem(key) === 'true'
  );
  
  if (foundSampleData.length > 0) {
    console.warn('⚠️ Found sample data indicators:', foundSampleData);
    return false;
  }
  
  console.log('✅ No sample data indicators found');
  return true;
};

/**
 * Get real data configuration status
 */
export const getRealDataStatus = () => {
  return {
    isRealDataMode: isRealDataMode(),
    dataSourceMode: localStorage.getItem('data_source_mode'),
    noSampleDataFound: validateNoSampleData(),
    timestamp: new Date().toISOString()
  };
};

/**
 * Emergency function to clear all data and reset to real data mode
 * Use this if you accidentally get sample data mixed in
 */
export const emergencyRealDataReset = () => {
  console.log('🚨 Emergency Real Data Reset');
  
  // Clear all localStorage except essential items
  const essentialKeys = ['firebase_auth_user', 'theme_preference'];
  const allKeys = Object.keys(localStorage);
  
  allKeys.forEach(key => {
    if (!essentialKeys.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  
  // Reinitialize real data mode
  initializeRealDataMode();
  
  console.log('🔄 Emergency reset complete - page will reload');
  window.location.reload();
};

// Auto-initialize on import
initializeRealDataMode();

export default {
  initializeRealDataMode,
  isRealDataMode,
  validateNoSampleData,
  getRealDataStatus,
  emergencyRealDataReset
};
