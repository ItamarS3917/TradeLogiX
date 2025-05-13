import React from 'react';
import PropTypes from 'prop-types';
import { Hidden, Box } from '@mui/material';

/**
 * MobileOnly component that shows content only on mobile screens
 */
export const MobileOnly = ({ children, sx = {}, ...props }) => (
  <Hidden smUp implementation="css">
    <Box sx={sx} {...props}>
      {children}
    </Box>
  </Hidden>
);

MobileOnly.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object
};

/**
 * TabletOnly component that shows content only on tablet screens
 */
export const TabletOnly = ({ children, sx = {}, ...props }) => (
  <Hidden mdUp xsDown implementation="css">
    <Box sx={sx} {...props}>
      {children}
    </Box>
  </Hidden>
);

TabletOnly.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object
};

/**
 * DesktopOnly component that shows content only on desktop screens
 */
export const DesktopOnly = ({ children, sx = {}, ...props }) => (
  <Hidden mdDown implementation="css">
    <Box sx={sx} {...props}>
      {children}
    </Box>
  </Hidden>
);

DesktopOnly.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object
};

/**
 * MobileAndTablet component that shows content on mobile and tablet screens
 */
export const MobileAndTablet = ({ children, sx = {}, ...props }) => (
  <Hidden mdUp implementation="css">
    <Box sx={sx} {...props}>
      {children}
    </Box>
  </Hidden>
);

MobileAndTablet.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object
};

/**
 * TabletAndDesktop component that shows content on tablet and desktop screens
 */
export const TabletAndDesktop = ({ children, sx = {}, ...props }) => (
  <Hidden xsOnly implementation="css">
    <Box sx={sx} {...props}>
      {children}
    </Box>
  </Hidden>
);

TabletAndDesktop.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object
};

/**
 * ResponsiveView component that shows different content based on screen size
 */
export const ResponsiveView = ({ 
  mobileContent, 
  tabletContent, 
  desktopContent 
}) => (
  <>
    {mobileContent && <MobileOnly>{mobileContent}</MobileOnly>}
    {tabletContent && <TabletOnly>{tabletContent}</TabletOnly>}
    {desktopContent && <DesktopOnly>{desktopContent}</DesktopOnly>}
  </>
);

ResponsiveView.propTypes = {
  mobileContent: PropTypes.node,
  tabletContent: PropTypes.node,
  desktopContent: PropTypes.node
};
