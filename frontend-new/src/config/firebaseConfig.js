// File: firebaseConfig.js
// Purpose: Helper functions for Firebase configuration

// Always force Firebase direct mode to be true
const FORCE_FIREBASE_MODE = true;

/**
 * Check if Firebase direct mode is enabled
 * @returns {boolean} True if Firebase direct mode is enabled
 */
export const isFirebaseDirectMode = () => {
  // Force Firebase mode to be true regardless of environment variable
  if (FORCE_FIREBASE_MODE) {
    console.log('FORCING Firebase direct mode to be TRUE');
    return true;
  }
  
  const envValue = import.meta.env.VITE_USE_FIREBASE_DIRECTLY;
  const isDirect = envValue === 'true';
  console.log(`Firebase direct mode from env: ${isDirect} (${envValue})`);
  return isDirect;
};

/**
 * Get debug info about Firebase mode
 * @returns {Object} Debug info
 */
export const getFirebaseDebugInfo = () => {
  return {
    forceMode: FORCE_FIREBASE_MODE,
    isFirebaseDirect: isFirebaseDirectMode(),
    envValue: import.meta.env.VITE_USE_FIREBASE_DIRECTLY,
  };
};
