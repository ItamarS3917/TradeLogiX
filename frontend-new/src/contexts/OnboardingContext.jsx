import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNotification } from './NotificationContext';

// Create context
export const OnboardingContext = createContext(null);

// Custom hook to use the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === null) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isLoadingSampleData, setIsLoadingSampleData] = useState(false);
  const { showSuccess, showError } = useNotification();

  // Check if user has completed onboarding before
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (onboardingCompleted === 'true') {
      setHasCompletedOnboarding(true);
    } else {
      setIsFirstTimeUser(true);
      // Auto-show tutorial for first-time users (after a slight delay)
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle tutorial completion
  const handleTutorialComplete = (addSampleData = false) => {
    setHasCompletedOnboarding(true);
    localStorage.setItem('onboardingCompleted', 'true');
    
    if (addSampleData) {
      addSampleDataForUser();
    }
  };

  // Add sample data for demonstration
  const addSampleDataForUser = async () => {
    try {
      setIsLoadingSampleData(true);
      
      // Add sample data
      setTimeout(() => {
        showSuccess('Sample data added successfully!');
        setIsLoadingSampleData(false);
      }, 1500);
    } catch (error) {
      console.error('Error adding sample data:', error);
      showError('Failed to add sample data. Please try again later.');
      setIsLoadingSampleData(false);
    }
  };

  // Reset onboarding (for testing purposes)
  const resetOnboarding = () => {
    localStorage.removeItem('onboardingCompleted');
    setHasCompletedOnboarding(false);
    setIsFirstTimeUser(true);
    setShowTutorial(true);
  };

  // Show tutorial manually (e.g., from help menu)
  const showOnboardingTutorial = () => {
    setShowTutorial(true);
  };

  const contextValue = {
    showTutorial,
    setShowTutorial,
    hasCompletedOnboarding,
    isFirstTimeUser,
    isLoadingSampleData,
    handleTutorialComplete,
    addSampleDataForUser,
    resetOnboarding,
    showOnboardingTutorial
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;
