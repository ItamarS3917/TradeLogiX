import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid
} from '@mui/material';
import {
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Simple mock of useNotification hook to avoid import errors
const useNotification = () => {
  return {
    enabledNotificationChannels: { 
      inApp: true, 
      browser: false,
      email: false,
      sms: false
    },
    scheduleNotification: () => 1
  };
};

const ScheduledNotificationManager = ({ open, onClose }) => {
  const { 
    scheduleNotification, 
    enabledNotificationChannels
  } = useNotification();
  
  // State for the scheduled notifications
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ScheduleIcon color="primary" />
          <Typography variant="h6">Scheduled Notifications & Reports</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography paragraph color="text.secondary">
              This is a simplified scheduled notification manager for testing purposes.
              The full functionality will be available in the next update.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduledNotificationManager;
