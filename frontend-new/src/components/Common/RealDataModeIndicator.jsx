import React from 'react';
import { Alert, Box, Typography, Button, Chip } from '@mui/material';
import { CheckCircle, Storage, Warning } from '@mui/icons-material';

const RealDataModeIndicator = () => {
  const dataSourceMode = localStorage.getItem('data_source_mode');
  const useRealDataOnly = localStorage.getItem('use_real_data_only');
  const isRealDataMode = dataSourceMode === 'firebase' && useRealDataOnly === 'true';

  const handleShowDebugInfo = () => {
    console.log('📊 Trading Journal Real Data Status:');
    console.log('- Data Source Mode:', dataSourceMode);
    console.log('- Real Data Only:', useRealDataOnly);
    console.log('- Is Real Data Mode:', isRealDataMode);
    console.log('- Sample Data Disabled:', window.sampleDataDisabled);
    console.log('- Window Real Data Mode:', window.isRealDataMode);
    
    alert(`Real Data Mode: ${isRealDataMode ? 'ACTIVE' : 'INACTIVE'}\nData Source: ${dataSourceMode}\nCheck console for full details.`);
  };

  if (!isRealDataMode) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning />
          <Typography variant="body2">
            Warning: Not in Real Data Mode. Click to fix.
          </Typography>
          <Button 
            size="small" 
            onClick={() => {
              localStorage.setItem('data_source_mode', 'firebase');
              localStorage.setItem('use_real_data_only', 'true');
              window.location.reload();
            }}
          >
            Enable Real Data Mode
          </Button>
        </Box>
      </Alert>
    );
  }

  return (
    <Alert severity="success" sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <CheckCircle sx={{ color: 'success.main' }} />
        <Typography variant="body2" sx={{ flex: 1 }}>
          <strong>Real Data Mode Active</strong> - All data stored in Firebase
        </Typography>
        <Chip 
          icon={<Storage />} 
          label="Firebase" 
          color="success" 
          size="small" 
        />
        <Button 
          size="small" 
          variant="outlined"
          onClick={handleShowDebugInfo}
        >
          Debug Info
        </Button>
      </Box>
    </Alert>
  );
};

export default RealDataModeIndicator;