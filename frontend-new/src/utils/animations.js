/**
 * Animation Utilities
 * 
 * This module provides standardized animations for the Trading Journal app,
 * optimized for performance and consistency across devices.
 * 
 * Features:
 * - Performance-optimized animations that leverage GPU acceleration
 * - Consistent timing and easing functions
 * - Progressive enhancement based on device capabilities
 * - Reduced motion options for accessibility
 */

import { keyframes } from '@emotion/react';

// Check for reduced motion preference
export const prefersReducedMotion = 
  typeof window !== 'undefined' && 
  window.matchMedia && 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Device capability detection (for progressive enhancement)
export const isMobileDevice = 
  typeof navigator !== 'undefined' && 
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const isLowEndDevice = () => {
  // Attempt to detect low-end devices based on available memory and cores
  if (typeof navigator !== 'undefined') {
    // Check for device memory API
    if (navigator.deviceMemory && navigator.deviceMemory < 4) {
      return true;
    }
    
    // Check for hardware concurrency (CPU cores)
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      return true;
    }
    
    // Check for mobile device as a fallback
    return isMobileDevice;
  }
  
  return false;
};

// Animation durations by device capability
export const durations = {
  shortest: prefersReducedMotion ? 0 : 150,
  shorter: prefersReducedMotion ? 0 : 200,
  short: prefersReducedMotion ? 0 : 250,
  standard: prefersReducedMotion ? 0 : 300,
  complex: prefersReducedMotion ? 0 : 375,
  entering: prefersReducedMotion ? 0 : 225,
  leaving: prefersReducedMotion ? 0 : 195,
  long: prefersReducedMotion ? 0 : 400,
  longer: prefersReducedMotion ? 0 : 500,
};

// Easing functions based on Material Design specifications
export const easing = {
  // Standard easing for most animations
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  // Easing for elements entering the screen
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  // Easing for elements leaving the screen
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  // Premium easing for enhanced smooth feel
  premium: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
};

// Factory function to create animations with the right settings
export const createAnimation = (keyframeDefinition, options = {}) => {
  const { 
    duration = durations.standard,
    easing: easingOption = easing.standard,
    delay = 0,
    iterations = 1,
    direction = 'normal',
    fillMode = 'both'
  } = options;
  
  return {
    animation: `${keyframeDefinition} ${duration}ms ${easingOption} ${delay}ms ${iterations} ${direction} ${fillMode}`,
    transition: `all ${duration}ms ${easingOption} ${delay}ms`
  };
};

// Basic animations
export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

export const slideUpIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const slideDownIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const slideLeftIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const slideRightIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const growIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const shrinkOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
`;

// Trading-specific animations
export const priceFlash = keyframes`
  0% {
    background-color: transparent;
  }
  30% {
    background-color: rgba(76, 175, 80, 0.3);
  }
  100% {
    background-color: transparent;
  }
`;

export const priceFlashNegative = keyframes`
  0% {
    background-color: transparent;
  }
  30% {
    background-color: rgba(244, 67, 54, 0.3);
  }
  100% {
    background-color: transparent;
  }
`;

export const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Card animations
export const cardHoverRise = {
  transform: 'translateY(-4px)',
  boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.13)',
  transition: `all ${durations.standard}ms ${easing.premium}`
};

export const cardHoverScale = {
  transform: 'scale(1.02)',
  boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.13)',
  transition: `all ${durations.standard}ms ${easing.premium}`
};

// Interactive element animations
export const buttonHoverRise = {
  transform: 'translateY(-2px)',
  boxShadow: '0 5px 10px rgba(0,0,0,0.2)',
  transition: `all ${durations.shorter}ms ${easing.premium}`
};

export const buttonActivePress = {
  transform: 'translateY(1px)',
  boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
  transition: `all ${durations.shortest}ms ${easing.accelerate}`
};

// Page transition animations
export const pageEnter = {
  animation: `${slideUpIn} ${durations.entering}ms ${easing.decelerate} forwards`
};

export const pageExit = {
  animation: `${fadeOut} ${durations.leaving}ms ${easing.accelerate} forwards`
};

// Micro-interactions
export const microPulse = {
  animation: `${pulse} ${durations.standard}ms ${easing.premium} 1`
};

export const microBounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
`;

// Conditional animation factory
export const createOptimizedAnimation = (animation, options = {}) => {
  // Skip animations completely for reduced motion preference
  if (prefersReducedMotion) {
    return {};
  }
  
  // Simplify animations for low-end devices
  if (isLowEndDevice()) {
    const simplified = {
      ...options,
      duration: options.duration ? Math.min(options.duration, durations.short) : durations.short
    };
    return createAnimation(animation, simplified);
  }
  
  // Full animations for capable devices
  return createAnimation(animation, options);
};

// Animation presets ready to use
export const animationPresets = {
  fadeIn: createOptimizedAnimation(fadeIn),
  fadeOut: createOptimizedAnimation(fadeOut),
  slideUpIn: createOptimizedAnimation(slideUpIn),
  slideDownIn: createOptimizedAnimation(slideDownIn),
  slideLeftIn: createOptimizedAnimation(slideLeftIn),
  slideRightIn: createOptimizedAnimation(slideRightIn),
  growIn: createOptimizedAnimation(growIn),
  shrinkOut: createOptimizedAnimation(shrinkOut),
  priceFlash: createOptimizedAnimation(priceFlash),
  priceFlashNegative: createOptimizedAnimation(priceFlashNegative),
  pulse: createOptimizedAnimation(pulse),
  microBounce: createOptimizedAnimation(microBounce),
  
  // Premium trading animations
  tradeEntry: createOptimizedAnimation(slideUpIn, { 
    duration: durations.standard, 
    easing: easing.premium 
  }),
  tradeProfitFlash: createOptimizedAnimation(priceFlash, { 
    duration: durations.long, 
    easing: easing.standard 
  }),
  tradeLossFlash: createOptimizedAnimation(priceFlashNegative, { 
    duration: durations.long, 
    easing: easing.standard 
  }),
  chartUpdate: createOptimizedAnimation(fadeIn, { 
    duration: durations.shorter, 
    easing: easing.standard 
  }),
  dashboardCard: createOptimizedAnimation(slideUpIn, { 
    duration: durations.standard, 
    easing: easing.premium,
    delay: (index) => index * 100 // Staggered animation for multiple cards
  }),
  notificationPopup: createOptimizedAnimation(slideDownIn, { 
    duration: durations.short, 
    easing: easing.decelerate 
  }),
};

export default {
  createAnimation,
  createOptimizedAnimation,
  durations,
  easing,
  fadeIn,
  fadeOut,
  slideUpIn,
  slideDownIn,
  slideLeftIn,
  slideRightIn,
  growIn,
  shrinkOut,
  priceFlash,
  priceFlashNegative,
  pulse,
  microBounce,
  cardHoverRise,
  cardHoverScale,
  buttonHoverRise,
  buttonActivePress,
  pageEnter,
  pageExit,
  microPulse,
  animationPresets,
  prefersReducedMotion,
  isLowEndDevice,
};