import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, FormControl, FormControlLabel, 
  RadioGroup, Radio, Button, Alert, Divider, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Switch
} from '@mui/material';
import { getDataSourceMode, setDataSourceMode } from '../../services/serviceFactory';
import { useAuthBridge } from '../../contexts/AuthContextBridge';

/**
 * AuthenticationSettings component for configuring authentication options
 * @returns {JSX.Element} Authentication settings UI
 */
const AuthenticationSettings = () => {
  // Try to use auth bridge if available
  const authBridge = (() => {
    try {
      return useAuthBridge();
    } catch (error) {
      return null;
    }
  })();
  
  const [authMode, setAuthMode] = useState(authBridge?.authMode || 'firebase');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState('');
  
  // Update auth mode when it changes in the context
  useEffect(() => {
    if (authBridge?.authMode) {
      setAuthMode(authBridge.authMode);
    }
  }, [authBridge?.authMode]);
  
  /**
   * Handle auth mode change
   * @param {React.ChangeEvent<HTMLInputElement>} event - Change event
   */
  const handleModeChange = (event) => {
    setSelectedMode(event.target.value);
    setConfirmDialogOpen(true);
  };
  
  /**
   * Apply the selected auth mode
   */
  const applySelectedMode = () => {
    if (authBridge?.toggleAuthMode) {
      authBridge.toggleAuthMode();
    }
    setAuthMode(selectedMode);
    setConfirmDialogOpen(false);
  };
  
  // Check if auth bridge is available
  if (!authBridge) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Authentication Settings
        </Typography>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Alert severity="info">
            Authentication bridge is not available. To configure authentication settings,
            please use the Data Source Settings to switch to Bridge mode.
          </Alert>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Authentication Settings
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Select Authentication Mode
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          This setting determines which authentication provider to use.
          Firebase Auth is the default, but you can switch to Backend API
          authentication when migrating to the backend.
        </Alert>
        
        <FormControl component="fieldset">
          <RadioGroup
            name="authMode"
            value={authMode}
            onChange={handleModeChange}
          >
            <FormControlLabel
              value="firebase"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Firebase Authentication</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use Firebase for user authentication
                  </Typography>
                </Box>
              }
            />
            
            <FormControlLabel
              value="api"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Backend API Authentication</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use the backend API for user authentication
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Session Management
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={true} 
                onChange={() => {}} 
                disabled
              />
            }
            label="Remember me on this device"
          />
        </Box>
        
        <Button 
          variant="outlined" 
          color="error"
          onClick={() => authBridge.logout()}
          sx={{ mt: 1 }}
        >
          Logout from all devices
        </Button>
      </Paper>
      
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Authentication Mode Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Changing the authentication mode will log you out.
            Make sure you've saved any unsaved changes before continuing.
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

export default AuthenticationSettings;
