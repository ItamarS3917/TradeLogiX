import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Snackbar,
  Alert,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Slider,
  Card,
  CardContent,
  Collapse,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  WbSunny as LightModeIcon,
  DarkMode as DarkModeIcon,
  Palette as PaletteIcon,
  BarChart as ChartIcon,
  Dashboard as DashboardIcon,
  Key as KeyIcon,
  Notifications as NotificationIcon,
  Visibility as VisibilityIcon,
  Sync as SyncIcon,
  Speed as PerformanceIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Colorize as ColorPickerIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useSnackbar } from '../../../contexts/SnackbarContext';
import { useFirebase } from '../../../contexts/FirebaseContext';

/**
 * UserPreferencesManager - Comprehensive user preferences management
 * 
 * Features:
 * - Theme customization
 * - Dashboard layout preferences
 * - Chart and visualization defaults
 * - Notification settings
 * - Data synchronization options
 * - Accessibility preferences
 */
const UserPreferencesManager = () => {
  const theme = useTheme();
  const { activeTheme, updateThemeWithPreset, getThemePresets, availableThemes } = useAppTheme();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const firebase = useFirebase();
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    // Visual preferences
    theme: activeTheme,
    compactMode: true,
    animationsEnabled: true,
    highContrastMode: false,
    
    // Dashboard preferences
    showWelcomeBanner: true,
    defaultPage: 'dashboard',
    dashboardLayouts: null,
    
    // Chart preferences
    defaultChartType: 'area',
    defaultTimeframe: '1M',
    enableAdvancedCharts: true,
    colorScheme: 'default',
    
    // Notification preferences
    enableNotifications: true,
    emailNotifications: false,
    tradeReminders: true,
    marketAlerts: true,
    
    // Data preferences
    autoSyncEnabled: true,
    syncFrequency: 'hourly',
    backupFrequency: 'daily',
    includeScreenshots: true,
    
    // Performance preferences
    lazyLoadImages: true,
    prefetchData: true,
    cacheTimeout: 60
  });
  
  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id || !firebase?.db) return;
      
      setIsLoading(true);
      
      try {
        const userPrefsRef = firebase.doc(firebase.db, 'user_preferences', user.id);
        const docSnap = await firebase.getDoc(userPrefsRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Merge existing preferences with loaded preferences
          if (data.preferences) {
            setPreferences(prev => ({
              ...prev,
              ...data.preferences
            }));
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        showSnackbar('Failed to load preferences', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, [user?.id, firebase?.db]);
  
  // Handle preference change
  const handlePreferenceChange = (category, setting, value) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Handle theme change
  const handleThemeChange = (themeId) => {
    setPreferences(prev => ({
      ...prev,
      theme: themeId
    }));
    
    // Update theme immediately for preview
    updateThemeWithPreset(themeId);
  };
  
  // Save preferences
  const handleSave = async () => {
    if (!user?.id || !firebase?.db) {
      showSnackbar('Cannot save preferences - authentication issue', 'error');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const userPrefsRef = firebase.doc(firebase.db, 'user_preferences', user.id);
      
      // Check if document exists first
      const docSnap = await firebase.getDoc(userPrefsRef);
      
      if (docSnap.exists()) {
        // Update only the preferences field
        await firebase.updateDoc(userPrefsRef, { 
          preferences,
          updated_at: new Date()
        });
      } else {
        // Create new document with preferences
        await firebase.setDoc(userPrefsRef, { 
          user_id: user.id,
          preferences,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
      
      showSnackbar('Preferences saved successfully', 'success');
    } catch (error) {
      console.error('Error saving preferences:', error);
      showSnackbar('Failed to save preferences', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Reset preferences to defaults
  const handleReset = () => {
    // Reset theme
    updateThemeWithPreset('procharts');
    
    // Reset other preferences to defaults
    setPreferences({
      theme: 'procharts',
      compactMode: true,
      animationsEnabled: true,
      highContrastMode: false,
      
      showWelcomeBanner: true,
      defaultPage: 'dashboard',
      dashboardLayouts: null,
      
      defaultChartType: 'area',
      defaultTimeframe: '1M',
      enableAdvancedCharts: true,
      colorScheme: 'default',
      
      enableNotifications: true,
      emailNotifications: false,
      tradeReminders: true,
      marketAlerts: true,
      
      autoSyncEnabled: true,
      syncFrequency: 'hourly',
      backupFrequency: 'daily',
      includeScreenshots: true,
      
      lazyLoadImages: true,
      prefetchData: true,
      cacheTimeout: 60
    });
    
    showSnackbar('Preferences reset to defaults', 'info');
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Theme presets
  const themePresets = getThemePresets();
  
  // Render visual preferences tab
  const renderVisualPreferences = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Theme Selection
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {themePresets.map((themePreset) => (
          <Grid item xs={6} sm={4} md={3} key={themePreset.id}>
            <Paper
              elevation={0}
              onClick={() => handleThemeChange(themePreset.id)}
              sx={{
                p: 2,
                border: `2px solid ${themePreset.id === preferences.theme 
                  ? theme.palette.primary.main 
                  : alpha(theme.palette.text.primary, 0.1)}`,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                },
                bgcolor: themePreset.id === preferences.theme 
                  ? alpha(theme.palette.primary.main, 0.05)
                  : 'background.paper'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Box 
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: themePreset.primary,
                    mr: 1.5,
                    border: '2px solid white',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                  }}
                />
                
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {themePreset.name}
                </Typography>
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                {themePreset.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Typography>
              
              {themePreset.id === preferences.theme && (
                <Chip
                  size="small"
                  label="Active"
                  color="primary"
                  sx={{ 
                    position: 'absolute',
                    top: 8, 
                    right: 8,
                    height: 22,
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Divider sx={{ mb: 4 }} />
      
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Visual Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch 
                checked={preferences.compactMode}
                onChange={(e) => handlePreferenceChange('visual', 'compactMode', e.target.checked)}
                color="primary"
              />
            }
            label="Compact Mode"
          />
          <Typography variant="caption" color="text.secondary" paragraph sx={{ ml: 4 }}>
            Use more condensed layout to fit more content on screen
          </Typography>
          
          <FormControlLabel
            control={
              <Switch 
                checked={preferences.animationsEnabled}
                onChange={(e) => handlePreferenceChange('visual', 'animationsEnabled', e.target.checked)}
                color="primary"
              />
            }
            label="Enable Animations"
          />
          <Typography variant="caption" color="text.secondary" paragraph sx={{ ml: 4 }}>
            Use animations for transitions and UI interactions
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch 
                checked={preferences.highContrastMode}
                onChange={(e) => handlePreferenceChange('visual', 'highContrastMode', e.target.checked)}
                color="primary"
              />
            }
            label="High Contrast Mode"
          />
          <Typography variant="caption" color="text.secondary" paragraph sx={{ ml: 4 }}>
            Increase contrast for better readability
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
  
  // Render dashboard preferences tab
  const renderDashboardPreferences = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Dashboard Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch 
                checked={preferences.showWelcomeBanner}
                onChange={(e) => handlePreferenceChange('dashboard', 'showWelcomeBanner', e.target.checked)}
                color="primary"
              />
            }
            label="Show Welcome Banner"
          />
          <Typography variant="caption" color="text.secondary" paragraph sx={{ ml: 4 }}>
            Display welcome message and quick stats on dashboard
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="default-page-label">Default Landing Page</InputLabel>
            <Select
              labelId="default-page-label"
              id="default-page"
              value={preferences.defaultPage}
              onChange={(e) => handlePreferenceChange('dashboard', 'defaultPage', e.target.value)}
              label="Default Landing Page"
            >
              <MenuItem value="dashboard">Dashboard</MenuItem>
              <MenuItem value="trades">Trade Journal</MenuItem>
              <MenuItem value="planning">Daily Planning</MenuItem>
              <MenuItem value="statistics">Statistics</MenuItem>
              <MenuItem value="tradesage">TradeSage AI</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Page to show when you first log in
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.03),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Dashboard Layout Customization
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You can customize your dashboard widgets and layout from the Dashboard page.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<DashboardIcon />}
              sx={{ 
                fontWeight: 600,
                borderRadius: 8,
                whiteSpace: 'nowrap',
                ml: 2
              }}
              href="/dashboard?edit=true"
            >
              Edit Dashboard
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
  
  // Render chart preferences tab
  const renderChartPreferences = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Chart Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="chart-type-label">Default Chart Type</InputLabel>
            <Select
              labelId="chart-type-label"
              id="chart-type"
              value={preferences.defaultChartType}
              onChange={(e) => handlePreferenceChange('chart', 'defaultChartType', e.target.value)}
              label="Default Chart Type"
            >
              <MenuItem value="area">Area Chart</MenuItem>
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="bar">Bar Chart</MenuItem>
              <MenuItem value="candlestick">Candlestick</MenuItem>
              <MenuItem value="heatmap">Heatmap</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="timeframe-label">Default Timeframe</InputLabel>
            <Select
              labelId="timeframe-label"
              id="timeframe"
              value={preferences.defaultTimeframe}
              onChange={(e) => handlePreferenceChange('chart', 'defaultTimeframe', e.target.value)}
              label="Default Timeframe"
            >
              <MenuItem value="1D">1 Day</MenuItem>
              <MenuItem value="1W">1 Week</MenuItem>
              <MenuItem value="1M">1 Month</MenuItem>
              <MenuItem value="3M">3 Months</MenuItem>
              <MenuItem value="6M">6 Months</MenuItem>
              <MenuItem value="1Y">1 Year</MenuItem>
              <MenuItem value="ALL">All Time</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch 
                checked={preferences.enableAdvancedCharts}
                onChange={(e) => handlePreferenceChange('chart', 'enableAdvancedCharts', e.target.checked)}
                color="primary"
              />
            }
            label="Enable Advanced Charts"
          />
          <Typography variant="caption" color="text.secondary" paragraph sx={{ ml: 4 }}>
            Use more sophisticated chart types and technical indicators
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="color-scheme-label">Chart Color Scheme</InputLabel>
            <Select
              labelId="color-scheme-label"
              id="color-scheme"
              value={preferences.colorScheme}
              onChange={(e) => handlePreferenceChange('chart', 'colorScheme', e.target.value)}
              label="Chart Color Scheme"
            >
              <MenuItem value="default">Theme Default</MenuItem>
              <MenuItem value="classic">Classic (Green/Red)</MenuItem>
              <MenuItem value="monochrome">Monochrome</MenuItem>
              <MenuItem value="colorblind">Colorblind Friendly</MenuItem>
              <MenuItem value="pastel">Pastel</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
  
  // Render notification preferences tab
  const renderNotificationPreferences = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Notification Settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch 
                checked={preferences.enableNotifications}
                onChange={(e) => handlePreferenceChange('notification', 'enableNotifications', e.target.checked)}
                color="primary"
              />
            }
            label="Enable Notifications"
          />
          <Typography variant="caption" color="text.secondary" paragraph sx={{ ml: 4 }}>
            Receive notifications about trades, reminders, and alerts
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch 
                checked={preferences.emailNotifications}
                onChange={(e) => handlePreferenceChange('notification', 'emailNotifications', e.target.checked)}
                disabled={!preferences.enableNotifications}
                color="primary"
              />
            }
            label="Email Notifications"
          />
          <Typography variant="caption" color="text.secondary" paragraph sx={{ ml: 4 }}>
            Receive important notifications by email
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch 
                checked={preferences.tradeReminders}
                onChange={(e) => handlePreferenceChange('notification', 'tradeReminders', e.target.checked)}
                disabled={!preferences.enableNotifications}
                color="primary"
              />
            }
            label="Trade Reminders"
          />
          <Typography variant="caption" color="text.secondary" paragraph sx={{ ml: 4 }}>
            Receive reminders about trade journaling
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch 
                checked={preferences.marketAlerts}
                onChange={(e) => handlePreferenceChange('notification', 'marketAlerts', e.target.checked)}
                disabled={!preferences.enableNotifications}
                color="primary"
              />
            }
            label="Market Alerts"
          />
          <Typography variant="caption" color="text.secondary" paragraph sx={{ ml: 4 }}>
            Receive alerts about market events
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
  
  // Render data preferences tab
  const renderDataPreferences = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Data Synchronization
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch 
                checked={preferences.autoSyncEnabled}
                onChange={(e) => handlePreferenceChange('data', 'autoSyncEnabled', e.target.checked)}
                color="primary"
              />
            }
            label="Enable Automatic Sync"
          />
          <Typography variant="caption" color="text.secondary" paragraph sx={{ ml: 4 }}>
            Automatically synchronize data between devices
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl 
            fullWidth 
            variant="outlined" 
            size="small"
            disabled={!preferences.autoSyncEnabled}
          >
            <InputLabel id="sync-frequency-label">Sync Frequency</InputLabel>
            <Select
              labelId="sync-frequency-label"
              id="sync-frequency"
              value={preferences.syncFrequency}
              onChange={(e) => handlePreferenceChange('data', 'syncFrequency', e.target.value)}
              label="Sync Frequency"
            >
              <MenuItem value="realtime">Real-time</MenuItem>
              <MenuItem value="hourly">Hourly</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="manual">Manual Only</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="backup-frequency-label">Backup Frequency</InputLabel>
            <Select
              labelId="backup-frequency-label"
              id="backup-frequency"
              value={preferences.backupFrequency}
              onChange={(e) => handlePreferenceChange('data', 'backupFrequency', e.target.value)}
              label="Backup Frequency"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="manual">Manual Only</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch 
                checked={preferences.includeScreenshots}
                onChange={(e) => handlePreferenceChange('data', 'includeScreenshots', e.target.checked)}
                color="primary"
              />
            }
            label="Include Screenshots in Sync/Backup"
          />
          <Typography variant="caption" color="text.secondary" paragraph sx={{ ml: 4 }}>
            Include trade screenshots in sync and backup operations
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
  
  // Render performance preferences tab
  const renderPerformancePreferences = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Performance Settings
      </Typography>
      
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.warning.main, 0.1),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
        }}
      >
        <Typography variant="body2" color="text.secondary">
          These settings can affect application performance. Default values are recommended for most users.
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch 
                checked={preferences.lazyLoadImages}
                onChange={(e) => handlePreferenceChange('performance', 'lazyLoadImages', e.target.checked)}
                color="primary"
              />
            }
            label="Lazy Load Images"
          />
          <Typography variant="caption" color="text.secondary" paragraph sx={{ ml: 4 }}>
            Load images only when they come into view
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch 
                checked={preferences.prefetchData}
                onChange={(e) => handlePreferenceChange('performance', 'prefetchData', e.target.checked)}
                color="primary"
              />
            }
            label="Prefetch Data"
          />
          <Typography variant="caption" color="text.secondary" paragraph sx={{ ml: 4 }}>
            Preload data for faster navigation
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Cache Timeout (minutes)
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Slider
                value={preferences.cacheTimeout}
                onChange={(e, newValue) => handlePreferenceChange('performance', 'cacheTimeout', newValue)}
                min={5}
                max={240}
                step={5}
                valueLabelDisplay="auto"
                aria-labelledby="cache-timeout-slider"
              />
            </Grid>
            <Grid item>
              <Typography variant="body2" color="text.primary">
                {preferences.cacheTimeout} min
              </Typography>
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary">
            How long to keep cached data before refreshing
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
  
  // Tab content mapping
  const tabContent = [
    { label: 'Visual', icon: <PaletteIcon />, content: renderVisualPreferences() },
    { label: 'Dashboard', icon: <DashboardIcon />, content: renderDashboardPreferences() },
    { label: 'Charts', icon: <ChartIcon />, content: renderChartPreferences() },
    { label: 'Notifications', icon: <NotificationIcon />, content: renderNotificationPreferences() },
    { label: 'Data', icon: <SyncIcon />, content: renderDataPreferences() },
    { label: 'Performance', icon: <PerformanceIcon />, content: renderPerformancePreferences() }
  ];
  
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SettingsIcon 
                sx={{ 
                  fontSize: 28, 
                  mr: 1.5, 
                  color: theme.palette.primary.main 
                }} 
              />
              <Typography variant="h5" fontWeight={700}>
                User Preferences
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                sx={{ fontWeight: 600 }}
              >
                Reset to Defaults
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={isSaving}
                sx={{ fontWeight: 600 }}
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
            }}
          >
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderRight: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  pl: 2,
                  py: 2,
                  minHeight: 64
                }
              }}
            >
              {tabContent.map((tab, index) => (
                <Tab 
                  key={index}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 1.5, color: theme.palette.primary.main }}>
                        {tab.icon}
                      </Box>
                      {tab.label}
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
              position: 'relative'
            }}
          >
            {isLoading && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: alpha(theme.palette.background.paper, 0.6),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  borderRadius: 'inherit'
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Loading preferences...
                  </Typography>
                </Box>
              </Box>
            )}
            
            <CardContent sx={{ p: 3 }}>
              {tabContent[activeTab].content}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserPreferencesManager;