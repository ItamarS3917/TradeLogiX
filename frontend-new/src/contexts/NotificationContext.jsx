import React, { createContext, useState, useContext, useEffect } from 'react';
import { Snackbar, Alert, Button } from '@mui/material';

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
  const [action, setAction] = useState(null);
  
  // Show notification with optional action button
  const showNotification = (
    newMessage, 
    newSeverity = 'info', 
    newAutoHideDuration = 6000,
    newAction = null
  ) => {
    setMessage(newMessage);
    setSeverity(newSeverity);
    setAutoHideDuration(newAutoHideDuration);
    setAction(newAction);
    setOpen(true);
  };
  
  // Show success notification with optional action
  const showSuccess = (newMessage, newAutoHideDuration = 6000, newAction = null) => {
    showNotification(newMessage, 'success', newAutoHideDuration, newAction);
  };
  
  // Show error notification with optional action
  const showError = (newMessage, newAutoHideDuration = 6000, newAction = null) => {
    showNotification(newMessage, 'error', newAutoHideDuration, newAction);
  };
  
  // Show warning notification with optional action
  const showWarning = (newMessage, newAutoHideDuration = 6000, newAction = null) => {
    showNotification(newMessage, 'warning', newAutoHideDuration, newAction);
  };
  
  // Show info notification with optional action
  const showInfo = (newMessage, newAutoHideDuration = 6000, newAction = null) => {
    showNotification(newMessage, 'info', newAutoHideDuration, newAction);
  };

  // Schedule a notification for future delivery
  const scheduleNotification = (message, severity, delay) => {
    const timerId = setTimeout(() => {
      showNotification(message, severity);
    }, delay);
    return timerId;
  };

  // Cancel a scheduled notification
  const cancelScheduledNotification = (timerId) => {
    if (timerId) {
      clearTimeout(timerId);
      return true;
    }
    return false;
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
    closeNotification,
    scheduleNotification,
    cancelScheduledNotification,
    notificationPermission: 'default',
    enabledNotificationChannels: { inApp: true, browser: false, email: false, sms: false },
    toggleNotificationChannel: () => true
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
        <Alert 
          onClose={closeNotification} 
          severity={severity} 
          variant="filled"
          action={action ? (
            <Button color="inherit" size="small" onClick={() => {
              action.onClick();
              closeNotification();
            }}>
              {action.label}
            </Button>
          ) : null}
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
