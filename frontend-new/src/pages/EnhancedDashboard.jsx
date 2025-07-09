import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Paper,
  Alert,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  Settings as SettingsIcon,
  AutoAwesome as MagicIcon,
  RestoreFromTrash as ResetIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';

// Import dashboard components
import CustomizableDashboard from '../components/Dashboard/CustomizableDashboard';
import TraditionalDashboard from './Dashboard'; // The current dashboard

// Import widget system
import { getAvailableWidgets, getDefaultDashboardLayout } from '../components/Widgets/widgetRegistry.jsx';

/**
 * Enhanced Dashboard Page - Allows switching between traditional and customizable dashboard
 */
const EnhancedDashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  
  // State management
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [availableWidgets, setAvailableWidgets] = useState([]);
  const [savedLayouts, setSavedLayouts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize dashboard
  useEffect(() => {
    initializeDashboard();
  }, [user?.uid]);
  
  const initializeDashboard = async () => {
    try {
      setIsLoading(true);
      
      // Load available widgets
      const widgets = getAvailableWidgets();
      setAvailableWidgets(widgets);
      
      // Load saved dashboard configuration from localStorage
      // In a real app, this would come from the backend
      const savedConfig = localStorage.getItem(`dashboard-config-${user?.uid}`);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setIsCustomizable(config.isCustomizable || false);
        setSavedLayouts(config.layouts || null);
      } else {
        // Use default layout for new users
        const defaultLayouts = getDefaultDashboardLayout();
        setSavedLayouts(defaultLayouts);
      }
      
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      showSnackbar('Failed to load dashboard configuration', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle dashboard mode toggle
  const handleModeToggle = (event) => {
    const newMode = event.target.checked;
    setIsCustomizable(newMode);
    
    // Save preference
    saveDashboardConfiguration({ isCustomizable: newMode });
    
    showSnackbar(
      newMode ? 'Switched to customizable dashboard' : 'Switched to traditional dashboard',
      'success'
    );
  };
  
  // Handle layout changes in customizable dashboard
  const handleLayoutChange = (layouts) => {
    setSavedLayouts(layouts);
    saveDashboardConfiguration({ layouts });
  };
  
  // Handle widget settings changes
  const handleSettingChange = (widgetId, settings) => {
    console.log('Widget settings changed:', widgetId, settings);
    // In a real app, save to backend
    showSnackbar('Widget settings updated', 'success');
  };
  
  // Handle widget refresh
  const handleRefreshWidget = (widgetId) => {
    console.log('Refreshing widget:', widgetId);
    showSnackbar('Widget refreshed', 'info');
  };
  
  // Save dashboard configuration
  const saveDashboardConfiguration = (config) => {
    try {
      const currentConfig = localStorage.getItem(`dashboard-config-${user?.uid}`);
      const parsedConfig = currentConfig ? JSON.parse(currentConfig) : {};
      
      const newConfig = {
        ...parsedConfig,
        ...config,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(`dashboard-config-${user?.uid}`, JSON.stringify(newConfig));
    } catch (error) {
      console.error('Error saving dashboard configuration:', error);
    }
  };
  
  // Reset dashboard to defaults
  const handleResetDashboard = () => {
    const defaultLayouts = getDefaultDashboardLayout();
    setSavedLayouts(defaultLayouts);
    setIsCustomizable(false);
    
    // Clear saved configuration
    localStorage.removeItem(`dashboard-config-${user?.uid}`);
    
    showSnackbar('Dashboard reset to defaults', 'info');
  };
  
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <Typography variant="h6" color="text.secondary">
          Loading dashboard...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Dashboard Header */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.06)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
          backdropFilter: 'blur(12px)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.primary.main} 100%)`,
            opacity: 0.8
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{
              width: 64,
              height: 64,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
              border: `2px solid ${alpha('#fff', 0.2)}`
            }}>
              <DashboardIcon 
                sx={{ 
                  fontSize: 36, 
                  color: '#fff'
                }} 
              />
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={900} gutterBottom sx={{
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}>
                Trading Dashboard
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={isCustomizable ? <GridIcon /> : <ListIcon />}
                  label={isCustomizable ? 'Customizable Mode' : 'Traditional Mode'}
                  color={isCustomizable ? 'primary' : 'default'}
                  size="medium"
                  sx={{ 
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    borderRadius: 2,
                    height: 32
                  }}
                />
                {isCustomizable && (
                  <Chip
                    icon={<MagicIcon />}
                    label="Drag & Drop Enabled"
                    color="secondary"
                    size="medium"
                    variant="outlined"
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      borderRadius: 2,
                      height: 32,
                      borderWidth: '2px'
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isCustomizable}
                  onChange={handleModeToggle}
                  color="primary"
                  size="medium"
                  sx={{
                    '& .MuiSwitch-thumb': {
                      boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                    }
                  }}
                />
              }
              label={
                <Typography variant="body1" fontWeight={700} sx={{ fontSize: '1rem' }}>
                  Customizable Layout
                </Typography>
              }
            />
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<ResetIcon />}
              onClick={handleResetDashboard}
              sx={{ 
                fontWeight: 700,
                borderRadius: 3,
                borderWidth: '2px',
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                '&:hover': {
                  borderWidth: '2px',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                },
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
        
        {/* Mode Description */}
        <Box sx={{ mt: 3 }}>
          {isCustomizable ? (
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                backgroundColor: alpha(theme.palette.info.main, 0.03),
                backdropFilter: 'blur(8px)',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                <strong>Customizable Mode:</strong> Drag widgets to rearrange, resize for better views, and add/remove widgets to personalize your dashboard experience.
              </Typography>
            </Alert>
          ) : (
            <Alert 
              severity="success" 
              sx={{ 
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
                backgroundColor: alpha(theme.palette.success.main, 0.03),
                backdropFilter: 'blur(8px)',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                <strong>Traditional Mode:</strong> Fixed layout optimized for quick overview of your trading performance and recent activity.
              </Typography>
            </Alert>
          )}
        </Box>
      </Paper>
      
      {/* Dashboard Content */}
      <Fade in timeout={600}>
        <Box sx={{
          '& > *': {
            animation: 'slide-in-right 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
            animationFillMode: 'both'
          }
        }}>
          {isCustomizable ? (
            <CustomizableDashboard
              availableWidgets={availableWidgets}
              onLayoutChange={handleLayoutChange}
              onSettingChange={handleSettingChange}
              onRefreshWidget={handleRefreshWidget}
              savedLayouts={savedLayouts}
              defaultLayout={getDefaultDashboardLayout()}
            />
          ) : (
            <TraditionalDashboard />
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default EnhancedDashboard;
