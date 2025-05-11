import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';

// Create the notification context
export const NotificationContext = createContext(null);

// Custom hook for using the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info'); // 'success', 'error', 'warning', 'info'
  const [autoHideDuration, setAutoHideDuration] = useState(6000);
  
  // Show notification
  const showNotification = (newMessage, newSeverity = 'info', newAutoHideDuration = 6000) => {
    setMessage(newMessage);
    setSeverity(newSeverity);
    setAutoHideDuration(newAutoHideDuration);
    setOpen(true);
  };
  
  // Show success notification
  const showSuccess = (newMessage, newAutoHideDuration = 6000) => {
    showNotification(newMessage, 'success', newAutoHideDuration);
  };
  
  // Show error notification
  const showError = (newMessage, newAutoHideDuration = 6000) => {
    showNotification(newMessage, 'error', newAutoHideDuration);
  };
  
  // Show warning notification
  const showWarning = (newMessage, newAutoHideDuration = 6000) => {
    showNotification(newMessage, 'warning', newAutoHideDuration);
  };
  
  // Show info notification
  const showInfo = (newMessage, newAutoHideDuration = 6000) => {
    showNotification(newMessage, 'info', newAutoHideDuration);
  };
  
  // Close notification
  const closeNotification = () => {
    setOpen(false);
  };
  
  // Context value
  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeNotification
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeNotification} severity={severity} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
