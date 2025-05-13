import React, { useState } from 'react';
import { Box, Breadcrumbs, Typography, Link, Paper, Tabs, Tab } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import TradingViewSelector from '../../components/TradingView/TradingViewSelector';

const TradingViewPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [theme, setTheme] = useState('dark');
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleScreenshotCapture = (screenshotData) => {
    console.log('Screenshot captured:', screenshotData);
    // In a real app, you'd handle saving the screenshot to the trade
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Dashboard
        </Link>
        <Typography color="textPrimary">TradingView Integration</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        TradingView Charts
      </Typography>
      
      <Paper 
        sx={{ 
          mb: 3, 
          backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F5F5F5',
          color: theme === 'dark' ? '#FFF' : '#333',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor={theme === 'dark' ? 'inherit' : 'primary'}
          indicatorColor="primary"
          variant="fullWidth"
          sx={{ 
            borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
            '& .MuiTab-root': {
              color: theme === 'dark' ? '#aaa' : 'inherit',
              '&.Mui-selected': {
                color: theme === 'dark' ? '#fff' : 'primary.main',
              },
            }
          }}
        >
          <Tab label="Live Charts" />
          <Tab label="Chart Screenshots" />
          <Tab label="Saved Layouts" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <TradingViewSelector 
              onScreenshotCapture={handleScreenshotCapture} 
              theme={theme}
            />
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Chart Screenshots
              </Typography>
              <Typography>
                Your saved chart screenshots will appear here. Use the live chart tab to capture new screenshots.
              </Typography>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Saved Chart Layouts
              </Typography>
              <Typography>
                Browse and manage your saved chart layouts and templates.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TradingViewPage;
