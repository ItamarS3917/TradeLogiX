import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, useTheme } from '@mui/material';
import { useMobile } from '../../../contexts/MobileContext';

/**
 * ResponsiveTouchContainer component that implements optimized touch interactions
 * for tablet and mobile devices while maintaining standard interactions for desktop
 * 
 * Props:
 * - children: child components
 * - onSwipeLeft: callback for swipe left gesture
 * - onSwipeRight: callback for swipe right gesture
 * - onSwipeUp: callback for swipe up gesture
 * - onSwipeDown: callback for swipe down gesture
 * - onPinch: callback for pinch gesture (with scale factor)
 * - onDoubleTap: callback for double tap gesture
 * - swipeThreshold: minimum distance to trigger swipe (px)
 * - sx: additional sx props for the Box component
 */
const ResponsiveTouchContainer = ({ 
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onDoubleTap,
  swipeThreshold = 50,
  sx = {},
  ...otherProps
}) => {
  const { isMobile, isTablet, isDesktop } = useMobile();
  const theme = useTheme();
  
  // Only apply touch handlers on mobile and tablet
  const enableTouchHandlers = isMobile || isTablet;
  
  // Touch state
  const [touchState, setTouchState] = useState({
    startX: 0,
    startY: 0,
    startTime: 0,
    lastTapTime: 0,
    initialDistance: 0,
    isSwiping: false,
    isPinching: false
  });
  
  // Handle touch start
  const handleTouchStart = (e) => {
    if (!enableTouchHandlers) return;
    
    if (e.touches.length === 1) {
      // Single touch - potential swipe or double tap
      const touch = e.touches[0];
      const now = Date.now();
      
      setTouchState(prev => ({
        ...prev,
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: now,
        isSwiping: true
      }));
      
      // Check for double tap
      if (onDoubleTap && now - touchState.lastTapTime < 300) {
        onDoubleTap(e);
        setTouchState(prev => ({
          ...prev,
          lastTapTime: 0 // Reset to prevent triple tap
        }));
      } else {
        setTouchState(prev => ({
          ...prev,
          lastTapTime: now
        }));
      }
    } else if (e.touches.length === 2 && onPinch) {
      // Two finger touch - potential pinch
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const initialDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      setTouchState(prev => ({
        ...prev,
        initialDistance,
        isPinching: true,
        isSwiping: false
      }));
    }
  };
  
  // Handle touch move
  const handleTouchMove = (e) => {
    if (!enableTouchHandlers) return;
    
    if (touchState.isSwiping && e.touches.length === 1) {
      // Handle potential swipe
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchState.startX;
      const deltaY = touch.clientY - touchState.startY;
      
      // Prevent page scrolling if handling horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && 
          (onSwipeLeft || onSwipeRight) && 
          Math.abs(deltaX) > 10) {
        e.preventDefault();
      }
    } else if (touchState.isPinching && e.touches.length === 2 && onPinch) {
      // Handle pinch
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scale = currentDistance / touchState.initialDistance;
      onPinch(scale, e);
      
      // Prevent default zoom behavior
      e.preventDefault();
    }
  };
  
  // Handle touch end
  const handleTouchEnd = (e) => {
    if (!enableTouchHandlers || (!touchState.isSwiping && !touchState.isPinching)) return;
    
    if (touchState.isSwiping) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchState.startX;
      const deltaY = touch.clientY - touchState.startY;
      const elapsedTime = Date.now() - touchState.startTime;
      
      // Check if it's a valid swipe (fast enough and long enough)
      if (elapsedTime < 500) {
        if (Math.abs(deltaX) > swipeThreshold) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight(e);
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft(e);
          }
        } else if (Math.abs(deltaY) > swipeThreshold) {
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown(e);
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp(e);
          }
        }
      }
    }
    
    // Reset states
    setTouchState(prev => ({
      ...prev,
      isSwiping: false,
      isPinching: false
    }));
  };
  
  // Touch event handlers
  const touchHandlers = enableTouchHandlers ? {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  } : {};
  
  return (
    <Box 
      sx={{ 
        touchAction: enableTouchHandlers ? 'manipulation' : 'auto',
        userSelect: 'none',
        ...sx
      }}
      {...touchHandlers}
      {...otherProps}
    >
      {children}
    </Box>
  );
};

ResponsiveTouchContainer.propTypes = {
  children: PropTypes.node,
  onSwipeLeft: PropTypes.func,
  onSwipeRight: PropTypes.func,
  onSwipeUp: PropTypes.func,
  onSwipeDown: PropTypes.func,
  onPinch: PropTypes.func,
  onDoubleTap: PropTypes.func,
  swipeThreshold: PropTypes.number,
  sx: PropTypes.object
};

export default ResponsiveTouchContainer;