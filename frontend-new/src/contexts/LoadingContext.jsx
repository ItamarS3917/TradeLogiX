import React, { createContext, useState, useContext } from 'react';

// Create the loading context
export const LoadingContext = createContext(null);

// Custom hook for using the loading context
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === null) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Loading provider component
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  
  // Start loading with optional message
  const startLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };
  
  // Stop loading
  const stopLoading = () => {
    setIsLoading(false);
  };
  
  // Context value
  const value = {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading
  };
  
  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;
