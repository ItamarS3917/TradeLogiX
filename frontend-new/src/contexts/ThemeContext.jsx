// File: src/contexts/ThemeContext.jsx
// Purpose: Context for theme customization with premium trading-focused design

import React, { createContext, useState, useEffect, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, alpha } from '@mui/material';
import { useAuth } from './AuthContext';
import { useFirebase } from './FirebaseContext'; // Import Firebase context

// Premium trading-specific color palettes
const tradingPalettes = {
  // Professional Trading Themes
  procharts: {
    name: 'ProCharts Trading',
    mode: 'dark',
    primary: '#2E71F0', // Vibrant blue for main actions
    secondary: '#7B61FF', // Purple accent for complementary actions
    accent: '#FFB017', // Gold for focus elements
    success: '#00C853', // Vibrant green for wins
    error: '#FF3B30', // Bright red for losses
    warning: '#FF9500', // Amber for alerts
    info: '#32ADE6', // Sky blue for info
    background: '#0A0F16', // Rich dark blue-black
    paper: '#111922', // Dark blue surface
    text: '#FFFFFF',
    chartLines: '#244065', // Deep blue lines for charts
    chartGrid: '#1A2435', // Darker blue for chart grids
    gains: '#00C853', // Vibrant green for gains
    losses: '#FF3B30', // Bright red for losses
    neutral: '#8E99A8', // Blue-gray neutral text
    highlight: '#1E3054', // Selection highlight
    cardGlow: 'rgba(37, 89, 193, 0.12)'
  },
  tradingview: {
    name: 'TradingView',
    mode: 'dark',
    primary: '#2962FF', // TradingView blue
    secondary: '#787B86', // Gray accent
    accent: '#F7525F', // Red accent
    success: '#089981', // TradingView green
    error: '#F23645', // TradingView red
    warning: '#FF9800', // Amber
    info: '#2962FF', // Blue
    background: '#131722', // TradingView dark background
    paper: '#1E222D', // TradingView card background
    text: '#D1D4DC',
    chartLines: '#363A45', // Chart lines
    chartGrid: '#2A2E39', // Chart grid
    gains: '#089981', // Green for gains
    losses: '#F23645', // Red for losses
    neutral: '#787B86', // Neutral gray
    highlight: '#2A2E39', // Selection highlight
    cardGlow: 'rgba(41, 98, 255, 0.08)'
  },
  bloomberg: {
    name: 'Bloomberg Terminal',
    mode: 'dark',
    primary: '#FF9900', // Bloomberg orange
    secondary: '#29B6F6', // Light blue accent
    accent: '#F8C200', // Yellow gold for focus
    success: '#27AE60', // Bloomberg green
    error: '#E53935', // Bloomberg red
    warning: '#FF9900', // Orange
    info: '#29B6F6', // Light blue
    background: '#0C1019', // Very dark blue
    paper: '#14192B', // Navy blue
    text: '#EAECEF',
    chartLines: '#2D3446', // Deep blue-gray for chart lines
    chartGrid: '#1A1F2D', // Darker blue-gray for grid
    gains: '#27AE60', // Green
    losses: '#E53935', // Red
    neutral: '#A0AEC0', // Cool gray
    highlight: '#1F2A46', // Selection highlight
    cardGlow: 'rgba(255, 153, 0, 0.08)'
  },
  blackedge: {
    name: 'Black Edge',
    mode: 'dark',
    primary: '#00C9FF', // Cyan blue
    secondary: '#5A5A5A', // Dark gray
    accent: '#FF4D6A', // Coral accent
    success: '#5CFF99', // Bright mint green
    error: '#FF4D6A', // Coral red
    warning: '#FFB24D', // Light orange
    info: '#00C9FF', // Cyan
    background: '#000000', // Pure black
    paper: '#101010', // Very dark gray
    text: '#FFFFFF',
    chartLines: '#333333', // Dark gray lines
    chartGrid: '#1A1A1A', // Slightly lighter grid
    gains: '#5CFF99', // Bright green
    losses: '#FF4D6A', // Coral red
    neutral: '#999999', // Medium gray
    highlight: '#202020', // Highlight
    cardGlow: 'rgba(0, 201, 255, 0.08)'
  },
  dayTrader: {
    name: 'Day Trader Pro',
    mode: 'dark',
    primary: '#00BCD4', // Cyan primary
    secondary: '#FF4081', // Pink accent
    accent: '#FFAB00', // Amber for focus
    success: '#00E676', // Bright green for wins
    error: '#FF1744', // Bright red for losses
    warning: '#FFAB00', // Amber for warnings
    info: '#00B0FF', // Light blue for info
    background: '#121212', // Almost black
    paper: '#1E1E1E', // Dark gray
    text: '#FFFFFF',
    chartLines: '#424242', // Medium gray for chart lines
    chartGrid: '#2C2C2C', // Darker gray for grid
    gains: '#00E676', // Strong green
    losses: '#FF1744', // Strong red
    neutral: '#9E9E9E', // Medium gray
    highlight: '#2D2D2D', // Selection highlight
    cardGlow: 'rgba(0, 188, 212, 0.08)'
  },
  light: {
    name: 'Light Pro',
    mode: 'light',
    primary: '#0B69FF', // Strong blue
    secondary: '#6E56CF', // Purple
    accent: '#FF8A00', // Orange accent
    success: '#05A660', // Green
    error: '#E5484D', // Red
    warning: '#F76808', // Orange
    info: '#0090FF', // Blue
    background: '#F8FAFC', // Off-white
    paper: '#FFFFFF', // White
    text: '#0F172A', // Near black
    chartLines: '#E2E8F0', // Light gray for chart lines
    chartGrid: '#F1F5F9', // Very light gray for grid
    gains: '#05A660', // Green
    losses: '#E5484D', // Red
    neutral: '#64748B', // Slate
    highlight: '#F1F5F9', // Very light gray
    cardGlow: 'rgba(11, 105, 255, 0.05)'
  },
  goldstrike: {
    name: 'Gold Strike',
    mode: 'dark',
    primary: '#FFD700', // Gold
    secondary: '#B39700', // Darker gold
    accent: '#FF6B00', // Orange accent
    success: '#4CAF50', // Green
    error: '#FF5252', // Red
    warning: '#FFC107', // Amber
    info: '#2196F3', // Blue
    background: '#1A1A1A', // Near black
    paper: '#252525', // Dark gray
    text: '#FFFFFF',
    chartLines: '#424242', // Medium gray for chart lines
    chartGrid: '#303030', // Darker gray for grid
    gains: '#4CAF50', // Green
    losses: '#FF5252', // Red
    neutral: '#9E9E9E', // Medium gray
    highlight: '#333333', // Highlight
    cardGlow: 'rgba(255, 215, 0, 0.15)'
  }
};

// Create context
export const ThemeContext = createContext();

// Create provider component
export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const firebase = useFirebase(); // Get Firebase context
  const [activeTheme, setActiveTheme] = useState('procharts');
  const [theme, setTheme] = useState(tradingPalettes.procharts);
  const [isLoading, setIsLoading] = useState(true);
  const [customTheme, setCustomTheme] = useState(null);

  // Load user theme
  useEffect(() => {
    const loadUserTheme = async () => {
      if (user?.id) {
        try {
          setIsLoading(true);
          // Get theme from Firestore
          const userThemeData = await getUserThemeFromFirestore(user.id);
          if (userThemeData) {
            // If the user has a saved theme name, use it from our presets
            if (userThemeData.themeName && tradingPalettes[userThemeData.themeName]) {
              setActiveTheme(userThemeData.themeName);
              setTheme(tradingPalettes[userThemeData.themeName]);
            } 
            // If they have a custom theme, use that instead
            else if (userThemeData.customTheme) {
              setCustomTheme(userThemeData.customTheme);
              setTheme(userThemeData.customTheme);
            }
            // Fallback to their previous theme format if it exists
            else if (userThemeData.mode) {
              const themeKey = userThemeData.mode === 'dark' ? 'procharts' : 'light';
              setActiveTheme(themeKey);
              setTheme(tradingPalettes[themeKey]);
            }
          }
        } catch (error) {
          console.error("Error loading user theme from Firestore:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadUserTheme();
  }, [user?.id]);
  
  // Function to get user theme from Firestore
  const getUserThemeFromFirestore = async (userId) => {
    try {
      if (!firebase?.db) return null;
      
      // Query the 'user_preferences' collection for the current user
      const { db, doc, getDoc } = firebase;
      const userPrefsRef = doc(db, 'user_preferences', userId);
      const docSnap = await getDoc(userPrefsRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.theme || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting user theme from Firestore:', error);
      return null;
    }
  };

  // Update theme with a preset
  const updateThemeWithPreset = async (presetName) => {
    try {
      if (!tradingPalettes[presetName]) {
        console.error(`Theme preset "${presetName}" not found`);
        return;
      }
      
      setActiveTheme(presetName);
      setTheme(tradingPalettes[presetName]);
      setCustomTheme(null);
      
      if (user?.id) {
        // Save to Firestore
        await saveUserThemeToFirestore(user.id, {
          themeName: presetName,
          customTheme: null
        });
      }
    } catch (error) {
      console.error("Error updating theme in Firestore:", error);
    }
  };
  
  // Update theme with custom values
  const updateCustomTheme = async (newThemeValues) => {
    try {
      const updatedCustomTheme = {
        ...theme,
        ...newThemeValues,
        name: 'Custom'
      };
      
      setActiveTheme('custom');
      setTheme(updatedCustomTheme);
      setCustomTheme(updatedCustomTheme);
      
      if (user?.id) {
        // Save to Firestore
        await saveUserThemeToFirestore(user.id, {
          themeName: 'custom',
          customTheme: updatedCustomTheme
        });
      }
    } catch (error) {
      console.error("Error updating custom theme in Firestore:", error);
    }
  };
  
  // Function to save user theme to Firestore
  const saveUserThemeToFirestore = async (userId, themeData) => {
    try {
      if (!firebase?.db) return;
      
      // Save to the 'user_preferences' collection
      const { db, doc, setDoc, getDoc } = firebase;
      const userPrefsRef = doc(db, 'user_preferences', userId);
      
      // Check if the document exists first
      const docSnap = await getDoc(userPrefsRef);
      
      if (docSnap.exists()) {
        // Update only the theme field
        await firebase.updateDoc(userPrefsRef, { theme: themeData });
      } else {
        // Create new document with theme data
        await setDoc(userPrefsRef, { 
          user_id: userId,
          theme: themeData,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    } catch (error) {
      console.error('Error saving user theme to Firestore:', error);
    }
  };

  // Toggle between light and dark mode
  const toggleMode = async () => {
    const newMode = theme.mode === 'light' ? 'dark' : 'light';
    const newPreset = newMode === 'light' ? 'light' : 'procharts';
    
    await updateThemeWithPreset(newPreset);
  };

  // Get all available theme presets
  const getThemePresets = () => {
    return Object.keys(tradingPalettes).map(key => ({
      id: key,
      name: tradingPalettes[key].name,
      mode: tradingPalettes[key].mode,
      primary: tradingPalettes[key].primary,
    }));
  };

  // Create MUI theme with premium trading-specific components
  const muiTheme = createTheme({
    palette: {
      mode: theme.mode,
      primary: {
        main: theme.primary,
        light: alpha(theme.primary, 0.8),
        dark: alpha(theme.primary, 1.2),
        contrastText: '#FFFFFF'
      },
      secondary: {
        main: theme.secondary,
        light: alpha(theme.secondary, 0.8),
        dark: alpha(theme.secondary, 1.2),
        contrastText: '#FFFFFF'
      },
      success: {
        main: theme.success || '#4CAF50',
        contrastText: '#FFFFFF'
      },
      error: {
        main: theme.error || '#F44336',
        contrastText: '#FFFFFF'
      },
      warning: {
        main: theme.warning || '#FF9800',
        contrastText: '#FFFFFF'
      },
      info: {
        main: theme.info || '#2196F3',
        contrastText: '#FFFFFF'
      },
      background: {
        default: theme.background,
        paper: theme.paper || (theme.mode === 'dark' ? '#1E1E1E' : '#FFFFFF'),
      },
      text: {
        primary: theme.text,
        secondary: alpha(theme.text, 0.7),
        disabled: alpha(theme.text, 0.5),
      },
      // Custom trading colors
      trading: {
        positive: theme.gains || '#4CAF50',
        negative: theme.losses || '#F44336',
        neutral: theme.neutral || '#9E9E9E',
        chartLine: theme.chartLines || '#424242',
        chartGrid: theme.chartGrid || '#303030',
        highlight: theme.highlight || '#333333',
        accent: theme.accent || '#FFB74D',
        cardGlow: theme.cardGlow || 'rgba(0, 0, 0, 0.1)'
      },
      divider: alpha(theme.text, 0.12),
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.0125em',
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.0125em',
      },
      h5: {
        fontWeight: 600,
        letterSpacing: '-0.0125em',
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.0125em',
      },
      subtitle1: {
        fontWeight: 500,
        letterSpacing: '-0.0125em',
      },
      subtitle2: {
        fontWeight: 500,
        letterSpacing: '-0.0125em',
      },
      body1: {
        lineHeight: 1.6,
        letterSpacing: '-0.01em',
      },
      body2: {
        lineHeight: 1.5,
        letterSpacing: '-0.01em',
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '-0.01em',
      },
      caption: {
        letterSpacing: '-0.01em',
      },
      overline: {
        letterSpacing: '0.05em',
      }
    },
    shape: {
      borderRadius: 10,
    },
    shadows: [
      'none', // 0
      '0px 2px 4px rgba(0,0,0,0.04), 0px 1px 2px rgba(0,0,0,0.08)', // 1
      '0px 4px 8px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.08)', // 2
      '0px 6px 12px rgba(0,0,0,0.1), 0px 3px 6px rgba(0,0,0,0.08)', // 3
      '0px 8px 16px rgba(0,0,0,0.12), 0px 4px 8px rgba(0,0,0,0.08)', // 4
      '0px 10px 20px rgba(0,0,0,0.12), 0px 5px 10px rgba(0,0,0,0.1)', // 5
      '0px 12px 24px rgba(0,0,0,0.12), 0px 6px 12px rgba(0,0,0,0.1)', // 6
      '0px 14px 28px rgba(0,0,0,0.14), 0px 7px 14px rgba(0,0,0,0.1)', // 7
      '0px 16px 32px rgba(0,0,0,0.14), 0px 8px 16px rgba(0,0,0,0.1)', // 8
      '0px 18px 36px rgba(0,0,0,0.14), 0px 9px 18px rgba(0,0,0,0.1)', // 9
      '0px 20px 40px rgba(0,0,0,0.14), 0px 10px 20px rgba(0,0,0,0.1)', // 10
      '0px 22px 44px rgba(0,0,0,0.14), 0px 11px 22px rgba(0,0,0,0.1)', // 11
      '0px 24px 48px rgba(0,0,0,0.14), 0px 12px 24px rgba(0,0,0,0.1)', // 12
      '0px 26px 52px rgba(0,0,0,0.14), 0px 13px 26px rgba(0,0,0,0.1)', // 13
      '0px 28px 56px rgba(0,0,0,0.14), 0px 14px 28px rgba(0,0,0,0.1)', // 14
      '0px 30px 60px rgba(0,0,0,0.14), 0px 15px 30px rgba(0,0,0,0.1)', // 15
      '0px 32px 64px rgba(0,0,0,0.14), 0px 16px 32px rgba(0,0,0,0.1)', // 16
      '0px 34px 68px rgba(0,0,0,0.14), 0px 17px 34px rgba(0,0,0,0.1)', // 17
      '0px 36px 72px rgba(0,0,0,0.14), 0px 18px 36px rgba(0,0,0,0.1)', // 18
      '0px 38px 76px rgba(0,0,0,0.14), 0px 19px 38px rgba(0,0,0,0.1)', // 19
      '0px 40px 80px rgba(0,0,0,0.14), 0px 20px 40px rgba(0,0,0,0.1)', // 20
      '0px 42px 84px rgba(0,0,0,0.14), 0px 21px 42px rgba(0,0,0,0.1)', // 21
      '0px 44px 88px rgba(0,0,0,0.14), 0px 22px 44px rgba(0,0,0,0.1)', // 22
      '0px 46px 92px rgba(0,0,0,0.14), 0px 23px 46px rgba(0,0,0,0.1)', // 23
      '0px 48px 96px rgba(0,0,0,0.14), 0px 24px 48px rgba(0,0,0,0.1)', // 24
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: theme.background,
            color: theme.text,
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(theme.text, 0.2)} transparent`,
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.text, 0.15),
              borderRadius: '6px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: alpha(theme.text, 0.25),
            },
          },
          '::selection': {
            backgroundColor: alpha(theme.primary, 0.3),
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            backgroundImage: 'none',
            backgroundColor: theme.mode === 'dark' 
              ? alpha(theme.paper, 0.8)
              : alpha(theme.paper, 0.9),
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${alpha(theme.text, 0.08)}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: theme.paper,
            backgroundImage: 'none',
            borderRight: `1px solid ${alpha(theme.text, 0.08)}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            '&[elevation="1"]': {
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: '8px',
            textTransform: 'none',
            padding: '10px 20px',
            transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
          },
          contained: {
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
            '&:hover': {
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.08)',
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            borderWidth: '1.5px',
            '&:hover': {
              borderWidth: '1.5px',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)',
              transform: 'translateY(-1px)',
            },
          },
          text: {
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
          sizeSmall: {
            padding: '6px 16px',
            fontSize: '0.875rem',
          },
          sizeMedium: {
            padding: '10px 20px',
          },
          sizeLarge: {
            padding: '12px 24px',
            fontSize: '1rem',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            margin: '4px 8px',
            transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            '&.Mui-selected': {
              backgroundColor: alpha(theme.primary, theme.mode === 'dark' ? 0.15 : 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.primary, theme.mode === 'dark' ? 0.2 : 0.15),
              },
            },
            '&:hover': {
              transform: 'translateX(2px)',
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: '36px',
            color: theme.mode === 'dark' ? alpha(theme.text, 0.7) : alpha(theme.text, 0.6),
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
              '& fieldset': {
                borderColor: alpha(theme.text, 0.2),
                borderWidth: '1.5px',
              },
              '&:hover fieldset': {
                borderColor: alpha(theme.text, 0.3),
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.primary,
                borderWidth: '1.5px',
              },
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${alpha(theme.primary, 0.15)}`,
              },
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.9rem',
            },
            '& .MuiInputBase-input': {
              padding: '14px 16px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: theme.mode === 'dark'
              ? '0px 4px 24px rgba(0, 0, 0, 0.3), 0px 2px 6px rgba(0, 0, 0, 0.2)'
              : '0px 4px 20px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${alpha(theme.text, theme.mode === 'dark' ? 0.08 : 0.05)}`,
            overflow: 'hidden',
            transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: theme.mode === 'dark'
                ? '0px 10px 30px rgba(0, 0, 0, 0.35), 0px 6px 10px rgba(0, 0, 0, 0.25)'
                : '0px 10px 30px rgba(0, 0, 0, 0.1), 0px 6px 10px rgba(0, 0, 0, 0.06)',
            },
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: '16px 20px',
          },
          title: {
            fontSize: '1rem',
            fontWeight: 600,
          },
          subheader: {
            fontSize: '0.875rem',
            color: alpha(theme.text, 0.7),
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '16px 20px',
            '&:last-child': {
              paddingBottom: '20px',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: '6px',
            '&.MuiChip-colorPrimary': {
              backgroundColor: alpha(theme.primary, 0.15),
            },
            '&.MuiChip-colorSecondary': {
              backgroundColor: alpha(theme.secondary, 0.15),
            },
            '&.MuiChip-colorSuccess': {
              backgroundColor: alpha(theme.success, 0.15),
            },
            '&.MuiChip-colorError': {
              backgroundColor: alpha(theme.error, 0.15),
            },
            '&.MuiChip-colorWarning': {
              backgroundColor: alpha(theme.warning, 0.15),
            },
            '&.MuiChip-colorInfo': {
              backgroundColor: alpha(theme.info, 0.15),
            },
          },
          label: {
            paddingLeft: '10px',
            paddingRight: '10px',
          },
          sizeSmall: {
            height: '24px',
            fontSize: '0.75rem',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            padding: '12px 16px',
            borderBottom: `1px solid ${alpha(theme.text, 0.08)}`,
          },
          head: {
            fontWeight: 600,
            fontSize: '0.75rem',
            color: alpha(theme.text, 0.7),
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            backgroundColor: alpha(theme.text, 0.03),
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${alpha(theme.text, 0.08)}`,
          },
          indicator: {
            height: '3px',
            borderRadius: '3px 3px 0 0',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.875rem',
            minHeight: '48px',
            padding: '12px 16px',
            '&.Mui-selected': {
              color: theme.primary,
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            height: 6,
            backgroundColor: alpha(theme.text, 0.1),
          },
          bar: {
            borderRadius: 4,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: alpha(theme.text, 0.08),
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: theme.mode === 'dark' 
              ? alpha('#000000', 0.85)
              : alpha('#1C2024', 0.9),
            color: '#FFFFFF',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
            fontSize: '0.75rem',
            fontWeight: 500,
            padding: '8px 12px',
            borderRadius: '6px',
            border: `1px solid ${alpha(theme.text, 0.1)}`,
            backdropFilter: 'blur(4px)',
          },
          arrow: {
            color: theme.mode === 'dark' 
              ? alpha('#000000', 0.85)
              : alpha('#1C2024', 0.9),
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              backgroundColor: alpha(theme.text, 0.05),
            },
          },
          sizeSmall: {
            padding: 8,
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontSize: '0.65rem',
            fontWeight: 600,
            minWidth: '18px',
            height: '18px',
            padding: '0 5px',
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(theme.background, 0.7),
            backdropFilter: 'blur(5px)',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          circle: {
            strokeLinecap: 'round',
          },
        },
      },
    },
  });

  const contextValue = {
    theme,
    activeTheme,
    updateThemeWithPreset,
    updateCustomTheme,
    toggleMode,
    getThemePresets,
    isLoading,
    availableThemes: tradingPalettes
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