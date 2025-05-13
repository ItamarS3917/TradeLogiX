// File: src/pages/Settings/AlertSettings.jsx
// Purpose: Page for managing alert settings

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Container,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { getUserAlerts, getAlertTypes, getAlertRules, createAlert, updateAlert, deleteAlert } from '../../services/alertService';
import { getNotificationPreferences, updateNotificationPreferences } from '../../services/preferencesService';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';

const AlertSettings = () => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [alerts, setAlerts] = useState([]);
  const [alertTypes, setAlertTypes] = useState([]);
  const [alertRules, setAlertRules] = useState({});
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_notifications: false,
    in_app_notifications: true,
    browser_notifications: false,
    alert_types: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [alertFormData, setAlertFormData] = useState({
    user_id: user?.id,
    type: '',
    title: '',
    message: '',
    trigger_conditions: {}
  });

  // Load alerts and alert types
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        if (user?.id) {
          // Load user alerts
          const userAlerts = await getUserAlerts(user.id);
          setAlerts(userAlerts);
          
          // Load alert types
          const types = await getAlertTypes();
          setAlertTypes(types);
          
          // Load alert rules
          const rules = await getAlertRules();
          setAlertRules(rules);
          
          // Load notification preferences
          const prefs = await getNotificationPreferences(user.id);
          setNotificationPrefs(prefs);
        }
      } catch (error) {
        console.error("Error loading alerts data:", error);
        showSnackbar("Error loading alerts data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id, showSnackbar]);

  // Handle notification preference change
  const handleNotificationPrefChange = async (key, value) => {
    try {
      const updatedPrefs = { ...notificationPrefs, [key]: value };
      setNotificationPrefs(updatedPrefs);
      await updateNotificationPreferences(user.id, updatedPrefs);
      showSnackbar("Notification preferences updated", "success");
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      showSnackbar("Error updating notification preferences", "error");
    }
  };

  // Handle alert type preference change
  const handleAlertTypePrefChange = async (type, value) => {
    try {
      const updatedAlertTypes = { ...notificationPrefs.alert_types, [type]: value };
      const updatedPrefs = { ...notificationPrefs, alert_types: updatedAlertTypes };
      setNotificationPrefs(updatedPrefs);
      await updateNotificationPreferences(user.id, updatedPrefs);
      showSnackbar("Alert type preferences updated", "success");
    } catch (error) {
      console.error("Error updating alert type preferences:", error);
      showSnackbar("Error updating alert type preferences", "error");
    }
  };

  // Open alert dialog
  const handleOpenAlertDialog = (alert = null) => {
    if (alert) {
      // Edit mode
      setEditingAlert(alert);
      setAlertFormData({
        user_id: user?.id,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        trigger_conditions: alert.trigger_conditions || {}
      });
    } else {
      // Create mode
      setEditingAlert(null);
      setAlertFormData({
        user_id: user?.id,
        type: alertTypes.length > 0 ? alertTypes[0].id : '',
        title: '',
        message: '',
        trigger_conditions: {}
      });
    }
    setOpenDialog(true);
  };

  // Close alert dialog
  const handleCloseAlertDialog = () => {
    setOpenDialog(false);
    setEditingAlert(null);
  };

  // Handle form field change
  const handleFormChange = (field, value) => {
    setAlertFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle condition change
  const handleConditionChange = (key, value) => {
    setAlertFormData(prev => ({
      ...prev,
      trigger_conditions: {
        ...prev.trigger_conditions,
        [key]: value
      }
    }));
  };

  // Save alert
  const handleSaveAlert = async () => {
    try {
      if (editingAlert) {
        // Update existing alert
        await updateAlert(editingAlert.id, alertFormData);
        showSnackbar("Alert updated successfully", "success");
      } else {
        // Create new alert
        await createAlert(alertFormData);
        showSnackbar("Alert created successfully", "success");
      }
      
      // Refresh alerts
      const userAlerts = await getUserAlerts(user.id);
      setAlerts(userAlerts);
      
      // Close dialog
      handleCloseAlertDialog();
    } catch (error) {
      console.error("Error saving alert:", error);
      showSnackbar("Error saving alert", "error");
    }
  };

  // Delete alert
  const handleDeleteAlert = async (alertId) => {
    try {
      await deleteAlert(alertId);
      showSnackbar("Alert deleted successfully", "success");
      
      // Refresh alerts
      const userAlerts = await getUserAlerts(user.id);
      setAlerts(userAlerts);
    } catch (error) {
      console.error("Error deleting alert:", error);
      showSnackbar("Error deleting alert", "error");
    }
  };

  // Render form fields based on alert type
  const renderConditionFields = () => {
    const selectedType = alertFormData.type;
    if (!selectedType || !alertRules[selectedType]) return null;
    
    const typeRules = alertRules[selectedType];
    
    return Object.entries(typeRules).map(([key, rule]) => (
      <Box key={key} mb={2}>
        <Typography variant="subtitle2" gutterBottom>{rule.description}</Typography>
        
        {rule.threshold_type === 'percentage' && (
          <TextField
            label="Percentage"
            type="number"
            value={alertFormData.trigger_conditions[key]?.threshold || 0}
            onChange={(e) => handleConditionChange(key, {
              ...alertFormData.trigger_conditions[key],
              threshold: parseFloat(e.target.value),
              operator: alertFormData.trigger_conditions[key]?.operator || '>='
            })}
            InputProps={{ endAdornment: '%' }}
            fullWidth
            variant="outlined"
            size="small"
          />
        )}
        
        {rule.threshold_type === 'currency' && (
          <TextField
            label="Amount"
            type="number"
            value={alertFormData.trigger_conditions[key]?.threshold || 0}
            onChange={(e) => handleConditionChange(key, {
              ...alertFormData.trigger_conditions[key],
              threshold: parseFloat(e.target.value),
              operator: alertFormData.trigger_conditions[key]?.operator || '>='
            })}
            InputProps={{ startAdornment: '$' }}
            fullWidth
            variant="outlined"
            size="small"
          />
        )}
        
        {rule.threshold_type === 'count' && (
          <TextField
            label="Count"
            type="number"
            value={alertFormData.trigger_conditions[key]?.threshold || 0}
            onChange={(e) => handleConditionChange(key, {
              ...alertFormData.trigger_conditions[key],
              threshold: parseInt(e.target.value, 10),
              operator: alertFormData.trigger_conditions[key]?.operator || '>='
            })}
            fullWidth
            variant="outlined"
            size="small"
          />
        )}
        
        {rule.threshold_type === 'boolean' && (
          <FormControlLabel
            control={
              <Switch 
                checked={alertFormData.trigger_conditions[key] || false} 
                onChange={(e) => handleConditionChange(key, e.target.checked)}
                color="primary"
              />
            }
            label="Enabled"
          />
        )}
        
        {rule.operators && (
          <FormControl fullWidth variant="outlined" size="small" sx={{ mt: 1 }}>
            <InputLabel>Operator</InputLabel>
            <Select
              value={alertFormData.trigger_conditions[key]?.operator || '>='}
              onChange={(e) => handleConditionChange(key, {
                ...alertFormData.trigger_conditions[key],
                operator: e.target.value
              })}
              label="Operator"
            >
              {rule.operators.map(op => (
                <MenuItem key={op} value={op}>{op}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
    ));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>Alert Settings</Typography>
        <Typography variant="body1" paragraph>
          Configure alerts and notifications to stay informed about your trading performance.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Notification Preferences */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>Notification Preferences</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationPrefs.in_app_notifications} 
                    onChange={(e) => handleNotificationPrefChange('in_app_notifications', e.target.checked)}
                    color="primary"
                  />
                }
                label="In-App Notifications"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationPrefs.email_notifications} 
                    onChange={(e) => handleNotificationPrefChange('email_notifications', e.target.checked)}
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={notificationPrefs.browser_notifications} 
                    onChange={(e) => handleNotificationPrefChange('browser_notifications', e.target.checked)}
                    color="primary"
                  />
                }
                label="Browser Notifications"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Alert Type Preferences */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>Alert Type Preferences</Typography>
          <Grid container spacing={2}>
            {alertTypes.map(type => (
              <Grid item xs={12} sm={6} md={4} key={type.id}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={notificationPrefs.alert_types?.[type.id] !== false} 
                      onChange={(e) => handleAlertTypePrefChange(type.id, e.target.checked)}
                      color="primary"
                    />
                  }
                  label={type.name}
                />
                <Typography variant="body2" color="textSecondary">
                  {type.description}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Alert Management */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Your Alerts</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenAlertDialog()}
            >
              Create Alert
            </Button>
          </Box>
          
          <List>
            {alerts.length > 0 ? (
              alerts.map(alert => (
                <ListItem 
                  key={alert.id}
                  divider
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" onClick={() => handleOpenAlertDialog(alert)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteAlert(alert.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText 
                    primary={alert.title} 
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {alert.message}
                        </Typography>
                        <Box mt={1}>
                          <Chip 
                            label={alert.type} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                            sx={{ mr: 1 }}
                          />
                          <Chip 
                            label={alert.status} 
                            size="small" 
                            color={alert.status === 'ACTIVE' ? 'success' : 'default'} 
                            variant="outlined" 
                          />
                        </Box>
                      </Box>
                    } 
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
                No alerts created yet. Click the "Create Alert" button to create your first alert.
              </Typography>
            )}
          </List>
        </Box>
      </Paper>
      
      {/* Alert Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseAlertDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingAlert ? "Edit Alert" : "Create Alert"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>Alert Type</InputLabel>
                <Select
                  value={alertFormData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  label="Alert Type"
                >
                  {alertTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Alert Title"
                value={alertFormData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                label="Alert Message"
                value={alertFormData.message}
                onChange={(e) => handleFormChange('message', e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom>Alert Conditions</Typography>
              {renderConditionFields()}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAlertDialog}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveAlert}
          >
            {editingAlert ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AlertSettings;