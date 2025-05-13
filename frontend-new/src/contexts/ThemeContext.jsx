// File: src/contexts/ThemeContext.jsx
// Purpose: Context for theme customization

import React, { createContext, useState, useEffect, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { useAuth } from './AuthContext';
import { getUserTheme, updateUserTheme } from '../services/preferencesService';

// Create context
export const ThemeContext = createContext();

// Create provider component
export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState({
    mode: 'light',
    primary: '#1976d2',
    secondary: '#dc004e',
    background: '#f5f5f5',
    text: '#333333'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user theme
  useEffect(() => {
    const loadUserTheme = async () => {
      if (user?.id) {
        try {
          setIsLoading(true);
          const userTheme = await getUserTheme(user.id);
          if (userTheme) {
            setTheme(userTheme);
          }
        } catch (error) {
          console.error("Error loading user theme:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadUserTheme();
  }, [user?.id]);

  // Update theme
  const updateTheme = async (newTheme) => {
    try {
      setTheme(newTheme);
      if (user?.id) {
        await updateUserTheme(user.id, newTheme);
      }
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  };

  // Toggle between light and dark mode
  const toggleMode = async () => {
    const newMode = theme.mode === 'light' ? 'dark' : 'light';
    const newTheme = { ...theme, mode: newMode };
    
    // Update background and text colors based on mode
    if (newMode === 'dark') {
      newTheme.background = '#303030';
      newTheme.text = '#ffffff';
    } else {
      newTheme.background = '#f5f5f5';
      newTheme.text = '#333333';
    }
    
    await updateTheme(newTheme);
  };

  // Create MUI theme
  const muiTheme = createTheme({
    palette: {
      mode: theme.mode,
      primary: {
        main: theme.primary,
      },
      secondary: {
        main: theme.secondary,
      },
      background: {
        default: theme.background,
        paper: theme.mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: theme.text,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: theme.background,
            color: theme.text,
          },
        },
      },
    },
  });

  const contextValue = {
    theme,
    updateTheme,
    toggleMode,
    isLoading
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeProvider;