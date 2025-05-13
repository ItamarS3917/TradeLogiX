import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useMobile } from '../../../contexts/MobileContext';

/**
 * ResponsiveGrid component that creates a responsive grid layout
 * 
 * Props:
 * - mobileColumns: number of columns in mobile view
 * - tabletColumns: number of columns in tablet view
 * - desktopColumns: number of columns in desktop view
 * - spacing: spacing between grid items
 * - children: child components
 * - sx: additional sx props for the Box component
 */
const ResponsiveGrid = ({ 
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  spacing = 2,
  children,
  sx = {},
  ...otherProps
}) => {
  const { isMobile, isTablet } = useMobile();

  // Determine current columns based on screen type
  const columns = isMobile 
    ? mobileColumns 
    : isTablet 
      ? tabletColumns 
      : desktopColumns;

  // Clone children and wrap them in grid cells
  const gridItems = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return null;
    
    return (
      <Box 
        sx={{ 
          width: `calc(${100 / columns}% - ${spacing * 2}px)`,
          padding: spacing,
          boxSizing: 'border-box'
        }}
        key={index}
      >
        {child}
      </Box>
    );
  });

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexWrap: 'wrap',
        margin: -spacing,
        ...sx
      }}
      {...otherProps}
    >
      {gridItems}
    </Box>
  );
};

ResponsiveGrid.propTypes = {
  mobileColumns: PropTypes.number,
  tabletColumns: PropTypes.number,
  desktopColumns: PropTypes.number,
  spacing: PropTypes.number,
  children: PropTypes.node,
  sx: PropTypes.object
};

export default ResponsiveGrid;