// File: src/pages/Settings/index.jsx
// Purpose: Settings pages entry point

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Tabs, 
  Tab, 
  Typography,
  Paper,
  Button,
  Grid
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Keyboard as KeyboardIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import ThemeSettings from './ThemeSettings';
import AlertSettings from './AlertSettings';
import KeyboardShortcutsManager from '../../components/Common/KeyboardShortcuts/KeyboardShortcutsManager';

// Import both regular and simplified components
import NotificationSettings from '../../components/Common/NotificationSettings';
import SimpleNotificationSettings from '../../components/Common/SimpleNotificationSettings';
import ScheduledNotificationManager from '../../components/Common/ScheduledNotificationManager';
import SimpleScheduledNotificationManager from '../../components/Common/SimpleScheduledNotificationManager';

// Use try-catch to determine if we need simplified versions
let UseSimpleComponents = false;
try {
  // Check if the notification context can be imported
  require('../../contexts/NotificationContext');
} catch (error) {
  console.warn('Using simplified components due to missing context:', error);
  UseSimpleComponents = true;
}

const ActualNotificationSettings = UseSimpleComponents ? SimpleNotificationSettings : NotificationSettings;
const ActualScheduledNotificationManager = UseSimpleComponents ? SimpleScheduledNotificationManager : ScheduledNotificationManager;

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  // Import OnboardingContext with a try-catch
let resetOnboarding = () => console.log('Onboarding reset not available');
let showOnboardingTutorial = () => console.log('Onboarding tutorial not available');

try {
  const { useOnboarding } = require('../../contexts/OnboardingContext');
  // This will only execute if the import succeeds
  const OnboardingHooks = () => {
    const onboarding = useOnboarding();
    resetOnboarding = onboarding.resetOnboarding;
    showOnboardingTutorial = onboarding.showOnboardingTutorial;
  };
  // Immediately invoke the function
  try { OnboardingHooks(); } catch (e) { console.warn('Error using onboarding hooks:', e); }
} catch (error) {
  console.warn('Onboarding context not available:', error);
}

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <ThemeSettings />;
      case 1:
        return <AlertSettings />;
      case 2:
        return <KeyboardShortcutsManager />;
      case 3:
        return (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<NotificationsIcon />}
                  onClick={() => setShowNotificationSettings(true)}
                  sx={{ py: 2 }}
                >
                  Configure Notification Channels
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  onClick={() => setShowScheduleManager(true)}
                  sx={{ py: 2 }}
                >
                  Manage Scheduled Notifications
                </Button>
              </Grid>
            </Grid>
          </Box>
        );
      case 4:
        return (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Onboarding & Help
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<SchoolIcon />}
                  onClick={() => showOnboardingTutorial()}
                  sx={{ py: 2 }}
                >
                  Show Onboarding Tutorial
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={() => resetOnboarding()}
                  sx={{ py: 2 }}
                >
                  Reset Onboarding (For Testing)
                </Button>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return <ThemeSettings />;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Customize your trading journal experience
        </Typography>
      </Box>

      <Paper elevation={3}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PaletteIcon />} label="Theme" />
          <Tab icon={<NotificationsIcon />} label="Alerts" />
          <Tab icon={<KeyboardIcon />} label="Keyboard Shortcuts" />
          <Tab icon={<ScheduleIcon />} label="Notifications" />
          <Tab icon={<SchoolIcon />} label="Onboarding & Help" />
        </Tabs>
      </Paper>

      <Box mt={3}>
        {renderTabContent()}
      </Box>

      {/* Notification Settings Dialog */}
      <ActualNotificationSettings 
        open={showNotificationSettings} 
        onClose={() => setShowNotificationSettings(false)} 
      />
      
      {/* Scheduled Notification Manager */}
      <ActualScheduledNotificationManager
        open={showScheduleManager}
        onClose={() => setShowScheduleManager(false)}
      />
    </Container>
  );
};

export default SettingsPage;