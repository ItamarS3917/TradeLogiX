import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, FormControl, FormControlLabel, 
  RadioGroup, Radio, Button, Alert, Divider, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Switch
} from '@mui/material';
import { getDataSourceMode, setDataSourceMode, isUsingEnhancedApiBridge, setUseEnhancedApiBridge } from '../../services/serviceFactory';

/**
 * DataSourceSettings component for selecting the data source mode
 * @returns {JSX.Element} Data source settings UI
 */
const DataSourceSettings = () => {
  const [dataSourceMode, setDataSourceModeState] = useState(getDataSourceMode());
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState('');
  const [enhancedBridgeEnabled, setEnhancedBridgeEnabled] = useState(isUsingEnhancedApiBridge());
  
  /**
   * Handle data source mode change
   * @param {React.ChangeEvent<HTMLInputElement>} event - Change event
   */
  const handleModeChange = (event) => {
    setSelectedMode(event.target.value);
    setConfirmDialogOpen(true);
  };
  
  /**
   * Apply the selected data source mode
   */
  const applySelectedMode = () => {
    setDataSourceMode(selectedMode);
    setDataSourceModeState(selectedMode);
    setConfirmDialogOpen(false);
  };
  
  /**
   * Handle enhanced bridge toggle
   * @param {React.ChangeEvent<HTMLInputElement>} event - Change event
   */
  const handleEnhancedBridgeToggle = (event) => {
    const newValue = event.target.checked;
    setUseEnhancedApiBridge(newValue);
    setEnhancedBridgeEnabled(newValue);
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Data Source Settings
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Select Data Source Mode
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          This setting determines where your data is stored and accessed.
          Firebase is the recommended option for stability and reliability.
          The bridge and API options are available for testing but may have issues.
        </Alert>
        
        <FormControl component="fieldset">
          <RadioGroup
            name="dataSourceMode"
            value={dataSourceMode}
            onChange={handleModeChange}
          >
            <FormControlLabel
              value="firebase"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Firebase (Recommended)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use Firebase for all data operations - most stable option
                  </Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              value="bridge"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Bridge (For Testing)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Attempt to use the backend API, but fall back to Firebase if needed
                  </Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              value="api"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Backend API (For Testing)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use the backend API for all data operations - not recommended for production
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
        
        {dataSourceMode !== 'firebase' && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            You are currently using a non-default data source mode.
            If you encounter any issues, switch back to Firebase mode.
          </Alert>
        )}
      </Paper>
      
      {dataSourceMode === 'bridge' && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            API Bridge Enhancement
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            The enhanced API bridge includes caching to improve performance and reduce API calls.
            Enable this option for better performance when using the bridge mode.
          </Alert>
          
          <FormControlLabel
            control={
              <Switch
                checked={enhancedBridgeEnabled}
                onChange={handleEnhancedBridgeToggle}
                color="primary"
              />
            }
            label="Use Enhanced API Bridge with Caching"
          />
          
          {enhancedBridgeEnabled && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Enhanced API bridge is enabled. API responses will be cached to improve performance.
              Visit the Performance tab for more details and cache management options.
            </Alert>
          )}
        </Paper>
      )}
      
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Data Source Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Changing the data source mode will refresh the application.
            Make sure you've saved any unsaved changes before continuing.
            
            {selectedMode !== 'firebase' && (
              <Box component="div" sx={{ mt: 2, color: 'warning.main' }}>
                <strong>Warning:</strong> Switching away from Firebase may cause stability issues.
                Only use other modes for testing purposes.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={applySelectedMode} 
            color="primary" 
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataSourceSettings;