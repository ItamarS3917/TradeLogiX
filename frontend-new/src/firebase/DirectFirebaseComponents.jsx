// DirectFirebaseComponents.jsx
// Wrapper components that directly use Firebase services

import React, { useState, useEffect } from 'react';
import firebaseTradeService from '../services/firebase/tradeService';
import firebasePlanningService from '../services/firebase/planningService';
import firebaseJournalService from '../services/firebase/journalService';

// Context for Firebase services
export const FirebaseServicesContext = React.createContext({
  tradeService: null,
  planningService: null,
  journalService: null
});

// Provider component
export const FirebaseServicesProvider = ({ children }) => {
  // Make the Firebase services available to all children
  const services = {
    tradeService: firebaseTradeService,
    planningService: firebasePlanningService,
    journalService: firebaseJournalService
  };
  
  return (
    <FirebaseServicesContext.Provider value={services}>
      {children}
    </FirebaseServicesContext.Provider>
  );
};

// Custom hook to use Firebase services
export const useFirebaseServices = () => {
  const context = React.useContext(FirebaseServicesContext);
  
  if (context === undefined) {
    throw new Error('useFirebaseServices must be used within a FirebaseServicesProvider');
  }
  
  return context;
};

// Direct Firebase trade components
export const DirectFirebaseTradeForm = (props) => {
  const { tradeService } = useFirebaseServices();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting trade using direct Firebase service', data);
      const result = props.isEditing 
        ? await tradeService.updateTrade(props.initialData.id, data)
        : await tradeService.createTrade(data);
      
      console.log('Trade saved result:', result);
      props.onSubmit && props.onSubmit(result);
    } catch (error) {
      console.error('Error saving trade in direct component:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Pass the direct handler to the wrapped component
  const modifiedProps = {
    ...props,
    onSubmit: handleSubmit,
    isLoading: isSubmitting || props.isLoading
  };
  
  // Just forward to the real component with modified props
  const TradeForm = React.lazy(() => import('../components/Trades/TradeForm'));
  
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <TradeForm {...modifiedProps} />
    </React.Suspense>
  );
};

// Utility function to wrap a component with Firebase services
export const withFirebaseServices = (Component) => {
  return (props) => (
    <FirebaseServicesProvider>
      <Component {...props} />
    </FirebaseServicesProvider>
  );
};

// Direct Firebase wrapper for the entire app
export const FirebaseWrapper = ({ children }) => {
  return (
    <FirebaseServicesProvider>
      {children}
    </FirebaseServicesProvider>
  );
};
