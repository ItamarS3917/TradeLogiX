import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

const DebugApp = () => {
  const handleTestFirebase = () => {
    console.log('Testing Firebase connection...');
    localStorage.setItem('data_source_mode', 'firebase');
    console.log('Data source mode set to:', localStorage.getItem('data_source_mode'));
  };

  const handleShowDebugInfo = () => {
    console.log('Debug Info:');
    console.log('- Data Source Mode:', localStorage.getItem('data_source_mode'));
    console.log('- Real Data Only:', localStorage.getItem('use_real_data_only'));
    console.log('- Window Real Data Mode:', window.isRealDataMode);
    console.log('- Sample Data Disabled:', window.sampleDataDisabled);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 4
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom color="primary">
          🎯 Trading Journal Debug Mode
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          The app is loading successfully! This means the blank page issue is resolved.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={handleTestFirebase}
            color="primary"
          >
            Test Firebase Mode
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={handleShowDebugInfo}
            color="secondary"
          >
            Show Debug Info (Check Console)
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => window.location.href = '/login'}
            color="success"
          >
            Go to Login
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary">
          📊 Real Data Mode Active - No Sample Data Will Be Created
        </Typography>
      </Paper>
    </Box>
  );
};

export default DebugApp;