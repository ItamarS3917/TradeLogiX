import React from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import OnboardingTutorial from './OnboardingTutorial';
import { CircularProgress, Backdrop } from '@mui/material';

/**
 * Main onboarding controller component
 * This component manages all onboarding-related UI elements
 */
const OnboardingController = () => {
  const { 
    showTutorial, 
    setShowTutorial, 
    handleTutorialComplete,
    isLoadingSampleData
  } = useOnboarding();

  return (
    <>
      {/* Onboarding Tutorial Dialog */}
      <OnboardingTutorial
        open={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />

      {/* Loading Indicator for Sample Data */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2
        }}
        open={isLoadingSampleData}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default OnboardingController;