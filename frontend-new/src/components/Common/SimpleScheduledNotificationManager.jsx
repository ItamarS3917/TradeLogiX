import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';

/**
 * A simple scheduled notification manager component without external dependencies
 * Use this if the original component has import issues
 */
const SimpleScheduledNotificationManager = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <Box 
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <Paper 
        sx={{ 
          width: '90%', 
          maxWidth: 600, 
          p: 4,
          m: 2,
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="h5" gutterBottom>
          Scheduled Notifications
        </Typography>
        
        <Typography paragraph>
          This is a simplified scheduled notification manager component. The original component with more features will be available when the context import issues are resolved.
        </Typography>
        
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SimpleScheduledNotificationManager;