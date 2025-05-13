import React from 'react';
import PropTypes from 'prop-types';
import { Box, useTheme } from '@mui/material';
import { useMobile } from '../../../contexts/MobileContext';

/**
 * ResponsiveContainer component that adjusts layout based on screen size
 * 
 * Props:
 * - mobileSize: size configuration for mobile view
 * - tabletSize: size configuration for tablet view
 * - desktopSize: size configuration for desktop view
 * - children: child components
 * - sx: additional sx props for the Box component
 */
const ResponsiveContainer = ({ 
  mobileSize = 'full',  // 'full', 'half', '1/3', '2/3', or a specific width
  tabletSize = 'full', 
  desktopSize = 'full',
  children,
  sx = {},
  ...otherProps
}) => {
  const { isMobile, isTablet, isDesktop } = useMobile();
  const theme = useTheme();

  // Calculate width based on size value
  const getWidth = (size) => {
    if (size === 'full') return '100%';
    if (size === 'half') return '50%';
    if (size === '1/3') return '33.333%';
    if (size === '2/3') return '66.667%';
    return size; // If specific width is provided
  };

  // Determine current size based on screen type
  const currentSize = isMobile 
    ? mobileSize 
    : isTablet 
      ? tabletSize 
      : desktopSize;
  
  // Calculate width
  const width = getWidth(currentSize);

  // Additional responsive padding based on screen size
  const paddingBySize = {
    mobile: theme.spacing(1),
    tablet: theme.spacing(2),
    desktop: theme.spacing(3)
  };

  const padding = isMobile 
    ? paddingBySize.mobile 
    : isTablet 
      ? paddingBySize.tablet 
      : paddingBySize.desktop;

  return (
    <Box 
      sx={{ 
        width,
        padding,
        boxSizing: 'border-box',
        ...sx
      }}
      {...otherProps}
    >
      {children}
    </Box>
  );
};

ResponsiveContainer.propTypes = {
  mobileSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tabletSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  desktopSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.node,
  sx: PropTypes.object
};

export default ResponsiveContainer;