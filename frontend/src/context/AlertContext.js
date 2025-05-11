import React, { createContext, useState, useContext } from 'react';

// Create context
const AlertContext = createContext(null);

// Provider component
export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Add an alert
  const addAlert = (message, type = 'info', timeout = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newAlert = { id, message, type };
    
    setAlerts(prevAlerts => [...prevAlerts, newAlert]);
    
    // Auto-dismiss after timeout
    if (timeout > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, timeout);
    }
    
    return id;
  };

  // Remove an alert by id
  const removeAlert = (id) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  };

  // Success alert shorthand
  const success = (message, timeout = 5000) => addAlert(message, 'success', timeout);
  
  // Error alert shorthand
  const error = (message, timeout = 5000) => addAlert(message, 'error', timeout);
  
  // Warning alert shorthand
  const warning = (message, timeout = 5000) => addAlert(message, 'warning', timeout);
  
  // Info alert shorthand
  const info = (message, timeout = 5000) => addAlert(message, 'info', timeout);

  const value = {
    alerts,
    addAlert,
    removeAlert,
    success,
    error,
    warning,
    info
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      {/* Alert display component could go here */}
    </AlertContext.Provider>
  );
};

// Custom hook for using alerts
export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === null) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

export default AlertContext;
