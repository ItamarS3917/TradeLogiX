// File: src/pages/Settings/ThemeSettings.jsx
// Purpose: Page for theme customization settings

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
  Divider
} from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';
import { getAvailableThemes } from '../../services/preferencesService';
import { ColorPicker } from '../../components/Common/ColorPicker';

const ThemeSettings = () => {
  const { theme, updateTheme, toggleMode } = useTheme();
  const [availableThemes, setAvailableThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [customTheme, setCustomTheme] = useState({
    primary: theme.primary,
    secondary: theme.secondary,
    background: theme.background,
    text: theme.text
  });

  // Load available themes
  useEffect(() => {
    const loadThemes = async () => {
      try {
        setIsLoading(true);
        const themes = await getAvailableThemes();
        setAvailableThemes(themes);
      } catch (error) {
        console.error("Error loading themes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemes();
  }, []);

  // Handle theme mode toggle
  const handleModeToggle = () => {
    toggleMode();
  };

  // Handle preset theme selection
  const handleThemeSelect = (themeId) => {
    const selected = availableThemes.find(t => t.id === themeId);
    if (selected) {
      setSelectedTheme(selected);
      updateTheme({
        mode: selected.mode,
        primary: selected.primary,
        secondary: selected.secondary,
        background: selected.background,
        text: selected.text
      });
    }
  };

  // Handle custom color change
  const handleColorChange = (colorType, color) => {
    setCustomTheme({
      ...customTheme,
      [colorType]: color
    });
  };

  // Apply custom theme
  const applyCustomTheme = () => {
    updateTheme({
      ...theme,
      ...customTheme
    });
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
        <Typography variant="h4" gutterBottom>Theme Settings</Typography>
        <Typography variant="body1" paragraph>
          Customize the appearance of your trading journal by changing colors and themes.
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Theme Mode Toggle */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>Theme Mode</Typography>
          <FormControlLabel
            control={
              <Switch 
                checked={theme.mode === 'dark'} 
                onChange={handleModeToggle}
                color="primary"
              />
            }
            label={theme.mode === 'dark' ? "Dark Mode" : "Light Mode"}
          />
        </Box>

        {/* Preset Themes */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>Preset Themes</Typography>
          <Grid container spacing={3}>
            {availableThemes.map((presetTheme) => (
              <Grid item xs={12} sm={6} md={4} key={presetTheme.id}>
                <Card 
                  sx={{ 
                    bgcolor: presetTheme.background,
                    color: presetTheme.text,
                    border: selectedTheme?.id === presetTheme.id ? '2px solid' : 'none',
                    borderColor: 'primary.main'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {presetTheme.name}
                    </Typography>
                    <Box display="flex" mb={1}>
                      <Box width={24} height={24} bgcolor={presetTheme.primary} mr={1} borderRadius="50%" />
                      <Box width={24} height={24} bgcolor={presetTheme.secondary} borderRadius="50%" />
                    </Box>
                    <Typography variant="body2">
                      {presetTheme.mode.charAt(0).toUpperCase() + presetTheme.mode.slice(1)} Mode
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      variant={selectedTheme?.id === presetTheme.id ? "contained" : "outlined"}
                      onClick={() => handleThemeSelect(presetTheme.id)}
                      sx={{ color: presetTheme.text === '#ffffff' ? '#fff' : 'inherit' }}
                    >
                      Select
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Custom Theme */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>Custom Theme</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box mb={2}>
                <Typography variant="subtitle1" gutterBottom>Primary Color</Typography>
                <ColorPicker 
                  color={customTheme.primary} 
                  onChange={(color) => handleColorChange('primary', color)} 
                />
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle1" gutterBottom>Secondary Color</Typography>
                <ColorPicker 
                  color={customTheme.secondary} 
                  onChange={(color) => handleColorChange('secondary', color)} 
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box mb={2}>
                <Typography variant="subtitle1" gutterBottom>Background Color</Typography>
                <ColorPicker 
                  color={customTheme.background} 
                  onChange={(color) => handleColorChange('background', color)} 
                />
              </Box>
              <Box mb={2}>
                <Typography variant="subtitle1" gutterBottom>Text Color</Typography>
                <ColorPicker 
                  color={customTheme.text} 
                  onChange={(color) => handleColorChange('text', color)} 
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={applyCustomTheme}
              >
                Apply Custom Theme
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Preview */}
        <Box>
          <Typography variant="h6" gutterBottom>Theme Preview</Typography>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              bgcolor: customTheme.background,
              color: customTheme.text
            }}
          >
            <Typography variant="h5" sx={{ color: customTheme.primary }} gutterBottom>
              Primary Color Heading
            </Typography>
            <Typography variant="body1" paragraph>
              This is how your text will look with the selected theme. The background and text colors are applied to provide a preview of your customization.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ bgcolor: customTheme.primary, color: '#fff', mr: 2 }}
            >
              Primary Button
            </Button>
            <Button 
              variant="contained" 
              sx={{ bgcolor: customTheme.secondary, color: '#fff' }}
            >
              Secondary Button
            </Button>
          </Paper>
        </Box>
      </Paper>
    </Container>
  );
};

export default ThemeSettings;