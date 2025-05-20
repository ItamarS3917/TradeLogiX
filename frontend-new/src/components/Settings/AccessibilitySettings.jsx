import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  Slider,
  Button,
  Divider,
  FormControlLabel,
  Paper,
  Grid,
  IconButton,
  Alert,
  Tooltip,
  useTheme,
  alpha,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  Collapse
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  TextFormat as TextFormatIcon,
  Contrast as ContrastIcon,
  TouchApp as TouchAppIcon,
  Keyboard as KeyboardIcon,
  Refresh as ResetIcon,
  Check as CheckIcon,
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
  Save as SaveIcon,
  AccessibilityNew as AccessibilityIcon,
  Speed as SpeedIcon,
  BrightnessAuto as AutoIcon
} from '@mui/icons-material';

/**
 * AccessibilitySettings Component - Comprehensive accessibility settings panel
 * 
 * Features:
 * - Visual contrast adjustments
 * - Text scaling options
 * - Animation controls
 * - Keyboard navigation improvements
 * - Touch targets optimization
 * - Preset accessibility profiles
 */
const AccessibilitySettings = ({ 
  onSave, 
  initialSettings = null,
  onClose
}) => {
  const theme = useTheme();
  
  // Default settings
  const defaultSettings = {
    // Visual settings
    highContrastMode: false,
    contrastLevel: 1.0, // Normal contrast
    reduceBrightColors: false,
    
    // Text settings
    textScalingFactor: 1.0, // Normal text scale
    increaseFontWeight: false,
    improveTextSpacing: false,
    
    // Motion settings
    reduceMotion: false,
    animationSpeed: 1.0, // Normal animation speed
    
    // Input settings
    largerClickTargets: false,
    keyboardFocusHighlight: true,
    
    // Focus settings
    focusModeEnabled: false,
    enhancedKeyboardNavigation: false
  };
  
  // State management
  const [settings, setSettings] = useState(initialSettings || defaultSettings);
  const [activeSection, setActiveSection] = useState('visual');
  const [showPreview, setShowPreview] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Handle setting changes
  const handleSettingChange = (setting) => (event) => {
    const value = event.target?.type === 'checkbox' 
      ? event.target.checked 
      : (typeof event === 'number' ? event : event.target.value);
    
    setSettings(prev => ({ ...prev, [setting]: value }));
  };
  
  // Handle profile selection
  const handleProfileSelect = (profile) => {
    switch(profile) {
      case 'vision-impaired':
        setSettings({
          ...defaultSettings,
          highContrastMode: true,
          contrastLevel: 1.5,
          textScalingFactor: 1.5,
          increaseFontWeight: true,
          improveTextSpacing: true,
          largerClickTargets: true
        });
        break;
      case 'motion-sensitive':
        setSettings({
          ...defaultSettings,
          reduceMotion: true,
          animationSpeed: 0.5,
          reduceBrightColors: true,
          keyboardFocusHighlight: true,
          enhancedKeyboardNavigation: true
        });
        break;
      case 'cognitive':
        setSettings({
          ...defaultSettings,
          reduceMotion: true,
          focusModeEnabled: true,
          improveTextSpacing: true,
          textScalingFactor: 1.15
        });
        break;
      case 'keyboard-user':
        setSettings({
          ...defaultSettings,
          keyboardFocusHighlight: true,
          enhancedKeyboardNavigation: true,
          largerClickTargets: true
        });
        break;
      default:
        setSettings(defaultSettings);
    }
    
    setSuccessMessage(`Applied ${profile.replace('-', ' ')} profile`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  // Reset to defaults
  const handleReset = () => {
    setSettings(defaultSettings);
    setSuccessMessage('Settings reset to defaults');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  // Save settings
  const handleSave = () => {
    if (onSave) {
      onSave(settings);
      setSuccessMessage('Accessibility settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };
  
  // Section components
  const sections = {
    visual: {
      title: 'Visual Settings',
      icon: <VisibilityIcon />,
      content: (
        <>
          <FormControlLabel
            control={
              <Switch 
                checked={settings.highContrastMode} 
                onChange={handleSettingChange('highContrastMode')}
                color="primary"
              />
            }
            label="High Contrast Mode"
          />
          
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Contrast Level
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  value={settings.contrastLevel}
                  onChange={(e, value) => handleSettingChange('contrastLevel')(value)}
                  min={0.8}
                  max={2.0}
                  step={0.1}
                  aria-labelledby="contrast-level-slider"
                  marks={[
                    { value: 0.8, label: 'Low' },
                    { value: 1.0, label: 'Normal' },
                    { value: 1.5, label: 'High' },
                    { value: 2.0, label: 'Very High' }
                  ]}
                />
              </Grid>
              <Grid item>
                <Typography variant="body2">
                  {settings.contrastLevel.toFixed(1)}x
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <FormControlLabel
            control={
              <Switch 
                checked={settings.reduceBrightColors} 
                onChange={handleSettingChange('reduceBrightColors')}
                color="primary"
              />
            }
            label="Reduce Bright Colors"
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            High contrast mode makes text and UI elements more visible by increasing contrast between
            foreground and background colors.
          </Typography>
        </>
      )
    },
    text: {
      title: 'Text Settings',
      icon: <TextFormatIcon />,
      content: (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Text Size Scaling
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  value={settings.textScalingFactor}
                  onChange={(e, value) => handleSettingChange('textScalingFactor')(value)}
                  min={0.8}
                  max={1.8}
                  step={0.1}
                  aria-labelledby="text-scaling-slider"
                  marks={[
                    { value: 0.8, label: 'Small' },
                    { value: 1.0, label: 'Normal' },
                    { value: 1.4, label: 'Large' },
                    { value: 1.8, label: 'XL' }
                  ]}
                />
              </Grid>
              <Grid item>
                <Typography variant="body2">
                  {settings.textScalingFactor.toFixed(1)}x
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <FormControlLabel
            control={
              <Switch 
                checked={settings.increaseFontWeight} 
                onChange={handleSettingChange('increaseFontWeight')}
                color="primary"
              />
            }
            label="Increase Font Weight"
          />
          
          <FormControlLabel
            control={
              <Switch 
                checked={settings.improveTextSpacing} 
                onChange={handleSettingChange('improveTextSpacing')}
                color="primary"
              />
            }
            label="Improve Text Spacing"
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Text scaling increases the size of all text throughout the application. Improved spacing
            adds more room between letters and lines for easier reading.
          </Typography>
        </>
      )
    },
    motion: {
      title: 'Motion & Animation',
      icon: <SpeedIcon />,
      content: (
        <>
          <FormControlLabel
            control={
              <Switch 
                checked={settings.reduceMotion} 
                onChange={handleSettingChange('reduceMotion')}
                color="primary"
              />
            }
            label="Reduce Motion"
          />
          
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Animation Speed
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs>
                <Slider
                  value={settings.animationSpeed}
                  onChange={(e, value) => handleSettingChange('animationSpeed')(value)}
                  min={0.2}
                  max={1.5}
                  step={0.1}
                  disabled={settings.reduceMotion}
                  aria-labelledby="animation-speed-slider"
                  marks={[
                    { value: 0.2, label: 'Slow' },
                    { value: 0.6, label: 'Medium' },
                    { value: 1.0, label: 'Normal' },
                    { value: 1.5, label: 'Fast' }
                  ]}
                />
              </Grid>
              <Grid item>
                <Typography variant="body2">
                  {settings.animationSpeed.toFixed(1)}x
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Reducing motion minimizes or eliminates animations and transitions that can cause discomfort
            for some users. Animation speed controls how quickly the remaining animations play.
          </Typography>
        </>
      )
    },
    input: {
      title: 'Input & Navigation',
      icon: <KeyboardIcon />,
      content: (
        <>
          <FormControlLabel
            control={
              <Switch 
                checked={settings.largerClickTargets} 
                onChange={handleSettingChange('largerClickTargets')}
                color="primary"
              />
            }
            label="Larger Touch Targets"
          />
          
          <FormControlLabel
            control={
              <Switch 
                checked={settings.keyboardFocusHighlight} 
                onChange={handleSettingChange('keyboardFocusHighlight')}
                color="primary"
              />
            }
            label="Highlight Keyboard Focus"
          />
          
          <FormControlLabel
            control={
              <Switch 
                checked={settings.enhancedKeyboardNavigation} 
                onChange={handleSettingChange('enhancedKeyboardNavigation')}
                color="primary"
              />
            }
            label="Enhanced Keyboard Navigation"
          />
          
          <FormControlLabel
            control={
              <Switch 
                checked={settings.focusModeEnabled} 
                onChange={handleSettingChange('focusModeEnabled')}
                color="primary"
              />
            }
            label="Focus Mode"
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            These settings improve interaction for keyboard and touch users. Enhanced keyboard navigation
            adds shortcuts and improved tab order. Focus mode reduces distractions by simplifying UI elements.
          </Typography>
        </>
      )
    }
  };
  
  // Render settings preview
  const renderPreview = () => {
    // Calculate preview styles based on settings
    const getPreviewStyles = () => {
      const styles = {
        fontSize: `${16 * settings.textScalingFactor}px`,
        lineHeight: settings.improveTextSpacing ? '1.8' : '1.5',
        letterSpacing: settings.improveTextSpacing ? '0.02em' : 'normal',
        fontWeight: settings.increaseFontWeight ? 500 : 400,
      };
      
      if (settings.highContrastMode) {
        styles.backgroundColor = theme.palette.mode === 'dark' ? '#000' : '#fff';
        styles.color = theme.palette.mode === 'dark' ? '#fff' : '#000';
        styles.border = `2px solid ${theme.palette.mode === 'dark' ? '#fff' : '#000'}`;
      }
      
      return styles;
    };
    
    const getButtonStyles = () => {
      return {
        padding: settings.largerClickTargets ? '12px 24px' : '8px 16px',
        fontSize: `${14 * settings.textScalingFactor}px`,
        fontWeight: settings.increaseFontWeight ? 600 : 500,
        outline: settings.keyboardFocusHighlight ? `2px solid ${theme.palette.primary.main}` : 'none',
        outlineOffset: 3,
        transition: settings.reduceMotion ? 'none' : `all ${0.3 / settings.animationSpeed}s ease`
      };
    };
    
    return (
      <Box sx={{ 
        mt: 4, 
        mb: 3,
        display: showPreview ? 'block' : 'none'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Preview
          </Typography>
          <Button 
            size="small" 
            onClick={() => setShowPreview(false)}
            endIcon={<CollapseIcon />}
          >
            Hide
          </Button>
        </Box>
        
        <Paper 
          elevation={0}
          sx={{
            p: 3,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
            ...getPreviewStyles()
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: settings.increaseFontWeight ? 700 : 600 }}>
            Sample Heading
          </Typography>
          <Typography variant="body1" paragraph>
            This is a preview of how content will appear with your selected accessibility settings.
            The text size, spacing, and contrast will reflect your preferences.
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mt: 3,
            flexWrap: 'wrap'
          }}>
            <Button 
              variant="contained" 
              sx={getButtonStyles()}
            >
              Primary Button
            </Button>
            <Button 
              variant="outlined" 
              sx={getButtonStyles()}
            >
              Secondary Button
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  };
  
  // Render profile selection
  const renderProfiles = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Accessibility Profiles
      </Typography>
      
      <FormControl component="fieldset">
        <RadioGroup
          row
          aria-label="accessibility profile"
          name="profile"
          onChange={(e) => handleProfileSelect(e.target.value)}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
                onClick={() => handleProfileSelect('vision-impaired')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Radio
                    value="vision-impaired"
                    id="vision-profile"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Vision Impaired
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  High contrast, larger text, and improved spacing
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
                onClick={() => handleProfileSelect('motion-sensitive')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Radio
                    value="motion-sensitive"
                    id="motion-profile"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Motion Sensitive
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Reduced animations and less visual stimulation
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
                onClick={() => handleProfileSelect('cognitive')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Radio
                    value="cognitive"
                    id="cognitive-profile"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Cognitive Support
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Focus mode, improved text spacing, reduced distractions
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
                onClick={() => handleProfileSelect('keyboard-user')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Radio
                    value="keyboard-user"
                    id="keyboard-profile"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Keyboard User
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Enhanced focus highlighting and keyboard navigation
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </RadioGroup>
      </FormControl>
    </Box>
  );
  
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Success message */}
      <Collapse in={!!successMessage}>
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          action={
            <IconButton
              size="small"
              onClick={() => setSuccessMessage('')}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
          }
        >
          {successMessage}
        </Alert>
      </Collapse>
      
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AccessibilityIcon sx={{ fontSize: 28, mr: 1.5, color: theme.palette.primary.main }} />
        <Typography variant="h5" fontWeight={700}>
          Accessibility Settings
        </Typography>
      </Box>
      
      {/* Main content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          {/* Settings navigation */}
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
            }}
          >
            {Object.keys(sections).map((sectionKey) => (
              <Button
                key={sectionKey}
                fullWidth
                size="large"
                startIcon={sections[sectionKey].icon}
                onClick={() => setActiveSection(sectionKey)}
                sx={{
                  justifyContent: 'flex-start',
                  py: 2,
                  borderRadius: 0,
                  borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                  backgroundColor: activeSection === sectionKey 
                    ? alpha(theme.palette.primary.main, 0.1) 
                    : 'transparent',
                  color: activeSection === sectionKey 
                    ? theme.palette.primary.main 
                    : theme.palette.text.primary,
                  fontWeight: activeSection === sectionKey ? 600 : 400,
                  '&:hover': {
                    backgroundColor: activeSection === sectionKey 
                      ? alpha(theme.palette.primary.main, 0.15) 
                      : alpha(theme.palette.text.primary, 0.05)
                  }
                }}
              >
                {sections[sectionKey].title}
              </Button>
            ))}
            
            <Button
              fullWidth
              size="large"
              color="error"
              startIcon={<ResetIcon />}
              onClick={handleReset}
              sx={{
                justifyContent: 'flex-start',
                py: 2,
                borderRadius: 0
              }}
            >
              Reset to Defaults
            </Button>
          </Paper>
          
          {/* Actions */}
          <Box sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{
                py: 1.5,
                fontWeight: 600,
                borderRadius: 8,
                mb: 2
              }}
            >
              Save Preferences
            </Button>
            
            {onClose && (
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={onClose}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 8
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={9}>
          {/* Settings content */}
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
              mb: 3
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                {sections[activeSection].title}
              </Typography>
              
              {sections[activeSection].content}
            </CardContent>
          </Card>
          
          {/* Profile selection */}
          {renderProfiles()}
          
          {/* Preview */}
          {!showPreview && (
            <Button 
              variant="outlined" 
              startIcon={<VisibilityIcon />}
              onClick={() => setShowPreview(true)}
              sx={{ mb: 3 }}
            >
              Show Preview
            </Button>
          )}
          
          {renderPreview()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccessibilitySettings;