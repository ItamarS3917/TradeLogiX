import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

// Create the context
const MobileContext = createContext({
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  screenSize: 'desktop'
});

// Create provider component
export const MobileProvider = ({ children }) => {
  const theme = useTheme();
  const isMobileSize = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTabletSize = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600px - 900px
  const isDesktopSize = useMediaQuery(theme.breakpoints.up('md')); // > 900px

  // Determine screen size label
  const getScreenSize = () => {
    if (isMobileSize) return 'mobile';
    if (isTabletSize) return 'tablet';
    return 'desktop';
  };

  // Setup state
  const [state, setState] = useState({
    isMobile: isMobileSize,
    isTablet: isTabletSize,
    isDesktop: isDesktopSize,
    screenSize: getScreenSize()
  });

  // Update state when media queries change
  useEffect(() => {
    setState({
      isMobile: isMobileSize,
      isTablet: isTabletSize,
      isDesktop: isDesktopSize,
      screenSize: getScreenSize()
    });
  }, [isMobileSize, isTabletSize, isDesktopSize]);

  return (
    <MobileContext.Provider value={state}>
      {children}
    </MobileContext.Provider>
  );
};

// Custom hook for using the Mobile context
export const useMobile = () => {
  const context = useContext(MobileContext);
  if (context === undefined) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  return context;
};

export default MobileContext;
