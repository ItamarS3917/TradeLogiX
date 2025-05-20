import React from 'react';
import { Alert, Box, Button } from '@mui/material';
import { getDataSourceMode, setDataSourceMode } from '../../services/serviceFactory';

/**
 * DataSourceWarning component to display warnings when not using Firebase
 * @returns {JSX.Element} Warning banner
 */
const DataSourceWarning = () => {
  const dataSourceMode = getDataSourceMode();
  
  // Only show warning if not using Firebase
  if (dataSourceMode === 'firebase') {
    return null;
  }
  
  /**
   * Switch back to Firebase
   */
  const switchToFirebase = () => {
    setDataSourceMode('firebase');
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      <Alert 
        severity="warning"
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={switchToFirebase}
          >
            Switch to Firebase
          </Button>
        }
      >
        <strong>Warning:</strong> You are currently using {dataSourceMode.toUpperCase()} mode instead of Firebase.
        This may cause stability issues. Click the button to switch back to Firebase mode.
      </Alert>
    </Box>
  );
};

export default DataSourceWarning;
