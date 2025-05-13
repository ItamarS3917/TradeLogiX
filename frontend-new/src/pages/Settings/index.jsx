// File: src/pages/Settings/index.jsx
// Purpose: Settings pages entry point

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Tabs, 
  Tab, 
  Typography,
  Paper
} from '@mui/material';
import ThemeSettings from './ThemeSettings';
import AlertSettings from './AlertSettings';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <ThemeSettings />;
      case 1:
        return <AlertSettings />;
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
          variant="fullWidth"
        >
          <Tab label="Theme" />
          <Tab label="Alerts" />
        </Tabs>
      </Paper>

      <Box mt={3}>
        {renderTabContent()}
      </Box>
    </Container>
  );
};

export default SettingsPage;