import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  FormHelperText,
  IconButton
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Computer as ComputerIcon,
  NotificationsActive as NotificationsActiveIcon
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
    toggleNotificationChannel: async () => true,
    notificationPermission: 'default',
    requestNotificationPermission: async () => 'default'
  };
};

const NotificationSettings = ({ open, onClose }) => {
  const { 
    enabledNotificationChannels, 
    toggleNotificationChannel,
    notificationPermission,
    requestNotificationPermission
  } = useNotification();
  
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  // Handle email channel toggle
  const handleEmailToggle = async () => {
    await toggleNotificationChannel('email');
  };
  
  // Handle SMS channel toggle
  const handleSmsToggle = async () => {
    await toggleNotificationChannel('sms');
  };
  
  // Handle browser notification toggle
  const handleBrowserToggle = async () => {
    await toggleNotificationChannel('browser');
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <NotificationsIcon color="primary" />
          <Typography variant="h6">Notification Settings</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            Configure how you want to receive notifications from the Trading Journal app.
          </Typography>
        </Box>
        
        <List>
          {/* In-app notifications */}
          <ListItem>
            <ListItemIcon>
              <NotificationsActiveIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="In-app Notifications" 
              secondary="Notifications shown within the application"
            />
            <Switch 
              edge="end"
              checked={true}
              disabled={true}
              inputProps={{ 'aria-label': 'in-app notifications toggle' }}
            />
          </ListItem>
          
          {/* Browser notifications */}
          <ListItem>
            <ListItemIcon>
              <ComputerIcon color={enabledNotificationChannels.browser ? "primary" : "action"} />
            </ListItemIcon>
            <ListItemText 
              primary="Browser Notifications" 
              secondary="Notifications shown by your browser when the app is in background"
            />
            <Switch 
              edge="end"
              checked={enabledNotificationChannels.browser}
              onChange={handleBrowserToggle}
              inputProps={{ 'aria-label': 'browser notifications toggle' }}
            />
          </ListItem>
          
          {notificationPermission === 'denied' && (
            <Box mx={2} my={1}>
              <Alert severity="warning" variant="outlined">
                Browser notifications are blocked. Please enable them in your browser settings.
              </Alert>
            </Box>
          )}
          
          <Divider variant="inset" component="li" />
          
          {/* Email notifications */}
          <ListItem>
            <ListItemIcon>
              <EmailIcon color={enabledNotificationChannels.email ? "primary" : "action"} />
            </ListItemIcon>
            <ListItemText 
              primary="Email Notifications" 
              secondary="Receive important alerts via email"
            />
            <Switch 
              edge="end"
              checked={enabledNotificationChannels.email}
              onChange={handleEmailToggle}
              inputProps={{ 'aria-label': 'email notifications toggle' }}
            />
          </ListItem>
          
          {(enabledNotificationChannels.email || emailError) && (
            <ListItem sx={{ pl: 9, pt: 0 }}>
              <TextField
                fullWidth
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!emailError}
                helperText={emailError}
                size="small"
                margin="dense"
              />
            </ListItem>
          )}
          
          <Divider variant="inset" component="li" />
          
          {/* SMS notifications */}
          <ListItem>
            <ListItemIcon>
              <SmsIcon color={enabledNotificationChannels.sms ? "primary" : "action"} />
            </ListItemIcon>
            <ListItemText 
              primary="SMS Notifications" 
              secondary="Receive alerts via text message"
            />
            <Switch 
              edge="end"
              checked={enabledNotificationChannels.sms}
              onChange={handleSmsToggle}
              inputProps={{ 'aria-label': 'sms notifications toggle' }}
            />
          </ListItem>
          
          {(enabledNotificationChannels.sms || phoneError) && (
            <ListItem sx={{ pl: 9, pt: 0 }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                error={!!phoneError}
                helperText={phoneError || "Include country code (e.g., +1)"}
                size="small"
                margin="dense"
              />
            </ListItem>
          )}
        </List>
        
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Notification Types
          </Typography>
          
          <FormGroup>
            <FormControlLabel 
              control={<Checkbox defaultChecked />} 
              label="Trade Alerts" 
            />
            <FormHelperText sx={{ mt: -1, ml: 4 }}>
              Notifications about trade opportunities and rule violations
            </FormHelperText>
            
            <FormControlLabel 
              control={<Checkbox defaultChecked />} 
              label="Performance Alerts" 
            />
            <FormHelperText sx={{ mt: -1, ml: 4 }}>
              Updates about your trading performance metrics
            </FormHelperText>
            
            <FormControlLabel 
              control={<Checkbox defaultChecked />} 
              label="Daily Planning Reminders" 
            />
            <FormHelperText sx={{ mt: -1, ml: 4 }}>
              Reminders to create your daily trading plan
            </FormHelperText>
            
            <FormControlLabel 
              control={<Checkbox defaultChecked />} 
              label="Journal Reminders" 
            />
            <FormHelperText sx={{ mt: -1, ml: 4 }}>
              Reminders to journal your trades
            </FormHelperText>
          </FormGroup>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationSettings;
