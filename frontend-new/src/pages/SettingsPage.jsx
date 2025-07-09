import React from 'react';
import { 
  Box, Typography, Paper, Button, Divider, Tab, Tabs
} from '@mui/material';
import { useState } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import DataSourceSettings from '../components/Settings/DataSourceSettings';
import AuthenticationSettings from '../components/Settings/AuthenticationSettings';
import CacheManager from '../components/Settings/CacheManager';

/**
 * SettingsPage component for application settings
 * @returns {JSX.Element} Settings UI
 */
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { showOnboardingTutorial, resetOnboarding, hasCompletedOnboarding, handleTutorialComplete } = useOnboarding();
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Data Source" />
          <Tab label="Authentication" />
          <Tab label="Migration" />
          <Tab label="Performance" />
          <Tab label="Interface" />
        </Tabs>
      </Box>
      
      {/* Data Source Settings */}
      {activeTab === 0 && <DataSourceSettings />}
      
      {/* Authentication Settings */}
      {activeTab === 1 && <AuthenticationSettings />}
      
      {/* Data Migration Settings */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Data Migration
          </Typography>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Migrate from Firebase to Backend API
            </Typography>
            
            <Typography paragraph>
              If you're ready to migrate your data from Firebase to the backend API,
              you can use the migration tool to transfer all your data.
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary"
              href="/migration"
            >
              Open Migration Tool
            </Button>
          </Paper>
        </Box>
      )}
      
      {/* Performance Settings */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Performance Settings
          </Typography>
          
          <CacheManager />
        </Box>
      )}
      
      {/* Interface Settings */}
      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Interface Settings
          </Typography>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Tutorial & Help
            </Typography>
            
            <Typography paragraph>
              Need a refresher on how to use the trading journal? You can replay the tutorial at any time.
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Current Status: {hasCompletedOnboarding ? '✅ Tutorial Completed' : '⚠️ Tutorial Not Completed'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={showOnboardingTutorial}
              >
                Show Tutorial
              </Button>
              
              {!hasCompletedOnboarding && (
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={() => handleTutorialComplete(false)}
                >
                  Mark as Completed
                </Button>
              )}
              
              <Button 
                variant="outlined" 
                color="warning"
                onClick={resetOnboarding}
              >
                Reset Tutorial
              </Button>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Interface Customization
            </Typography>
            
            <Typography paragraph>
              Additional interface customization options will be available in a future update.
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default SettingsPage;
