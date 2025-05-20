import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  MobileStepper,
  Paper,
  Backdrop,
  Fade,
  useTheme,
  alpha,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Checkbox,
  FormControlLabel,
  Zoom,
  Slide,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  KeyboardArrowLeft as PrevIcon,
  KeyboardArrowRight as NextIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  School as LearningIcon,
  DoNotDisturb as DismissIcon,
  ArrowCircleRight as GoIcon,
  Lightbulb as TipIcon
} from '@mui/icons-material';

/**
 * OnboardingTour Component - Interactive guided tour for new users
 * 
 * Features:
 * - Step-by-step guided tour of application features
 * - Tooltips and highlights for specific elements
 * - Interactive instructions
 * - Progress tracking
 * - Dismissible and resumable
 * - Mobile responsive
 */
const OnboardingTour = ({
  steps = [],
  isOpen = false,
  onComplete,
  onDismiss,
  onPause,
  disableAutoStart = false,
  initialStep = 0,
  showProgressIndicator = true,
  lastCompletedStep = null
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State management
  const [activeStep, setActiveStep] = useState(initialStep);
  const [skipTutorial, setSkipTutorial] = useState(false);
  const [visible, setVisible] = useState(isOpen);
  const [targetElement, setTargetElement] = useState(null);
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Refs
  const tooltipRef = useRef(null);
  const highlightLayerRef = useRef(null);
  
  // Handle open/close
  useEffect(() => {
    setVisible(isOpen);
    
    if (isOpen && !hasStarted) {
      setHasStarted(true);
    }
  }, [isOpen]);
  
  // Find target element and calculate positions
  useEffect(() => {
    if (!visible || activeStep >= steps.length) return;
    
    const currentStep = steps[activeStep];
    
    // Try to find the target element
    let element = null;
    if (currentStep.targetSelector) {
      element = document.querySelector(currentStep.targetSelector);
    } else if (currentStep.targetId) {
      element = document.getElementById(currentStep.targetId);
    }
    
    setTargetElement(element);
    
    if (element) {
      // Calculate element position
      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom + window.scrollY,
        right: rect.right + window.scrollX
      });
      
      // Scroll element into view if needed
      if (currentStep.scrollIntoView !== false) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: currentStep.scrollBlock || 'center'
        });
      }
      
      // Calculate tooltip position based on placement
      calculateTooltipPosition(rect, currentStep.placement || 'bottom');
    } else {
      // Reset if element not found
      setTargetRect(null);
      
      // For floating tips with no target, center on screen
      if (currentStep.isFloating) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        setTooltipPosition({
          top: viewportHeight * 0.5,
          left: viewportWidth * 0.5,
          transform: 'translate(-50%, -50%)'
        });
      }
    }
  }, [visible, activeStep, steps]);
  
  // Calculate tooltip position based on target and placement
  const calculateTooltipPosition = (rect, placement) => {
    const margin = 12; // Gap between target and tooltip
    const screenPadding = 10; // Minimum padding from screen edges
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Default: centered horizontally on element, below it
    let position = {
      top: rect.bottom + window.scrollY + margin,
      left: rect.left + window.scrollX + (rect.width / 2),
      transform: 'translateX(-50%)',
      placement
    };
    
    if (placement === 'top') {
      // Above element
      position = {
        top: rect.top + window.scrollY - margin,
        left: rect.left + window.scrollX + (rect.width / 2),
        transform: 'translate(-50%, -100%)',
        placement
      };
    } else if (placement === 'left') {
      // Left of element
      position = {
        top: rect.top + window.scrollY + (rect.height / 2),
        left: rect.left + window.scrollX - margin,
        transform: 'translate(-100%, -50%)',
        placement
      };
    } else if (placement === 'right') {
      // Right of element
      position = {
        top: rect.top + window.scrollY + (rect.height / 2),
        left: rect.right + window.scrollX + margin,
        transform: 'translate(0, -50%)',
        placement
      };
    }
    
    // Adjust for tooltip size to keep it on screen (approximate)
    // These would normally be calculated from the actual tooltip size
    const tooltipWidth = 320;
    const tooltipHeight = 180;
    
    // Adjust horizontal position if needed
    if (position.placement === 'top' || position.placement === 'bottom') {
      if (position.left - (tooltipWidth / 2) < screenPadding) {
        position.left = screenPadding + (tooltipWidth / 2);
      } else if (position.left + (tooltipWidth / 2) > screenWidth - screenPadding) {
        position.left = screenWidth - screenPadding - (tooltipWidth / 2);
      }
    }
    
    // Adjust vertical position if needed
    if (position.placement === 'left' || position.placement === 'right') {
      if (position.top - (tooltipHeight / 2) < screenPadding) {
        position.top = screenPadding + (tooltipHeight / 2);
      } else if (position.top + (tooltipHeight / 2) > screenHeight - screenPadding) {
        position.top = screenHeight - screenPadding - (tooltipHeight / 2);
      }
    }
    
    setTooltipPosition(position);
  };
  
  // Handle step navigation
  const handleNext = () => {
    const nextStep = activeStep + 1;
    
    if (nextStep >= steps.length) {
      handleComplete();
      return;
    }
    
    setActiveStep(nextStep);
  };
  
  const handlePrev = () => {
    setActiveStep((prevStep) => Math.max(0, prevStep - 1));
  };
  
  // Handle completion
  const handleComplete = () => {
    setVisible(false);
    
    // Small delay to allow fade-out animation
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 300);
  };
  
  // Handle dismissal
  const handleDismiss = () => {
    if (hasStarted) {
      setDismissDialogOpen(true);
    } else {
      executeDismiss();
    }
  };
  
  const executeDismiss = () => {
    setVisible(false);
    setDismissDialogOpen(false);
    
    // Small delay to allow fade-out animation
    setTimeout(() => {
      if (onDismiss) {
        onDismiss(activeStep, skipTutorial);
      }
    }, 300);
  };
  
  // Handle pause
  const handlePause = () => {
    setVisible(false);
    
    // Small delay to allow fade-out animation
    setTimeout(() => {
      if (onPause) {
        onPause(activeStep);
      }
    }, 300);
  };
  
  // Current step data
  const currentStep = steps[activeStep] || {};
  
  // Draw highlight around target element
  const renderHighlight = () => {
    if (!targetRect) return null;
    
    const highlightStyles = {
      position: 'absolute',
      top: targetRect.top,
      left: targetRect.left,
      width: targetRect.width,
      height: targetRect.height,
      boxShadow: `0 0 0 9999px ${alpha(theme.palette.common.black, 0.5)}`,
      borderRadius: currentStep.highlightBorderRadius || 4,
      zIndex: 1499,
      pointerEvents: 'none',
      transition: 'all 0.3s ease-in-out'
    };
    
    if (currentStep.highlightPadding) {
      highlightStyles.top -= currentStep.highlightPadding;
      highlightStyles.left -= currentStep.highlightPadding;
      highlightStyles.width += currentStep.highlightPadding * 2;
      highlightStyles.height += currentStep.highlightPadding * 2;
    }
    
    if (currentStep.highlightBorderColor) {
      highlightStyles.border = `2px solid ${currentStep.highlightBorderColor}`;
    }
    
    return (
      <Box
        ref={highlightLayerRef}
        sx={highlightStyles}
      />
    );
  };
  
  // Render tooltip content
  const renderTooltipContent = () => {
    return (
      <Box sx={{ position: 'relative' }}>
        {/* Step title */}
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          {currentStep.icon ? (
            <Box 
              component="span" 
              sx={{ 
                mr: 1.5,
                color: currentStep.iconColor || theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {currentStep.icon}
            </Box>
          ) : (
            <TipIcon 
              sx={{ 
                mr: 1.5,
                color: theme.palette.primary.main
              }} 
            />
          )}
          <Typography variant="subtitle1" fontWeight={600}>
            {currentStep.title || `Step ${activeStep + 1}`}
          </Typography>
        </Box>
        
        {/* Step content */}
        <Typography variant="body2" sx={{ mb: 2 }}>
          {currentStep.content}
        </Typography>
        
        {/* Action button if provided */}
        {currentStep.actionLabel && (
          <Button
            variant="outlined"
            size="small"
            color={currentStep.actionColor || "primary"}
            onClick={currentStep.onAction}
            sx={{ 
              mb: 2,
              fontWeight: 600,
              borderRadius: 6
            }}
          >
            {currentStep.actionLabel}
          </Button>
        )}
        
        {/* Navigation */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 1.5
        }}>
          {/* Left side: Back button or spacer */}
          <Box>
            {activeStep > 0 ? (
              <Button
                size="small"
                startIcon={<PrevIcon />}
                onClick={handlePrev}
                sx={{ fontWeight: 600 }}
              >
                Back
              </Button>
            ) : (
              <Button
                size="small"
                color="inherit"
                onClick={handleDismiss}
                sx={{ fontWeight: 600 }}
              >
                Skip
              </Button>
            )}
          </Box>
          
          {/* Center: Progress indicator */}
          {showProgressIndicator && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              px: 1
            }}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ fontWeight: 600 }}
              >
                {activeStep + 1} / {steps.length}
              </Typography>
            </Box>
          )}
          
          {/* Right side: Next/Finish button */}
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                size="small"
                endIcon={<CheckCircleIcon />}
                onClick={handleComplete}
                sx={{ fontWeight: 600 }}
              >
                Finish
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                endIcon={<NextIcon />}
                onClick={handleNext}
                sx={{ fontWeight: 600 }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    );
  };
  
  // Render tooltip component
  const renderTooltip = () => {
    if (!tooltipPosition) return null;

    const tooltipStyles = {
      position: 'absolute',
      top: tooltipPosition.top,
      left: tooltipPosition.left,
      transform: tooltipPosition.transform,
      zIndex: 1500,
      maxWidth: isMobile ? '85vw' : 360,
      width: isMobile ? '85vw' : 'auto',
      p: 2.5,
      borderRadius: 3,
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[6],
      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      transition: 'all 0.3s ease-in-out'
    };
    
    // Add a pointing arrow based on placement
    if (tooltipPosition.placement && targetRect) {
      const arrowSize = 8;
      const arrowStyles = {
        position: 'absolute',
        width: 0,
        height: 0,
        border: `${arrowSize}px solid transparent`,
      };
      
      if (tooltipPosition.placement === 'bottom') {
        tooltipStyles['&:before'] = {
          ...arrowStyles,
          top: -arrowSize * 2,
          left: '50%',
          marginLeft: -arrowSize,
          borderBottomColor: theme.palette.background.paper,
          borderTopWidth: 0,
        };
      } else if (tooltipPosition.placement === 'top') {
        tooltipStyles['&:before'] = {
          ...arrowStyles,
          bottom: -arrowSize * 2,
          left: '50%',
          marginLeft: -arrowSize,
          borderTopColor: theme.palette.background.paper,
          borderBottomWidth: 0,
        };
      } else if (tooltipPosition.placement === 'left') {
        tooltipStyles['&:before'] = {
          ...arrowStyles,
          right: -arrowSize * 2,
          top: '50%',
          marginTop: -arrowSize,
          borderLeftColor: theme.palette.background.paper,
          borderRightWidth: 0,
        };
      } else if (tooltipPosition.placement === 'right') {
        tooltipStyles['&:before'] = {
          ...arrowStyles,
          left: -arrowSize * 2,
          top: '50%',
          marginTop: -arrowSize,
          borderRightColor: theme.palette.background.paper,
          borderLeftWidth: 0,
        };
      }
    }
    
    // For mobile, position at bottom of screen if not floating
    if (isMobile && !currentStep.isFloating) {
      tooltipStyles.position = 'fixed';
      tooltipStyles.bottom = 16;
      tooltipStyles.left = '50%';
      tooltipStyles.top = 'auto';
      tooltipStyles.transform = 'translateX(-50%)';
      tooltipStyles.maxWidth = '92vw';
      tooltipStyles.width = '92vw';
      delete tooltipStyles['&:before']; // Remove arrow for mobile fixed position
    }
    
    // For centered floating tooltips
    if (currentStep.isFloating) {
      if (isMobile) {
        tooltipStyles.top = '50%';
        tooltipStyles.left = '50%';
        tooltipStyles.transform = 'translate(-50%, -50%)';
        tooltipStyles.maxWidth = '85vw';
      } else {
        tooltipStyles.top = tooltipPosition.top;
        tooltipStyles.left = tooltipPosition.left;
        tooltipStyles.transform = tooltipPosition.transform;
      }
    }
    
    return (
      <Box
        ref={tooltipRef}
        sx={tooltipStyles}
      >
        {/* Close button */}
        <IconButton
          size="small"
          onClick={handleDismiss}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: alpha(theme.palette.text.primary, 0.6)
          }}
          aria-label="Close tour"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        
        {renderTooltipContent()}
      </Box>
    );
  };
  
  // Render dismiss confirmation dialog
  const renderDismissDialog = () => {
    return (
      <Dialog
        open={dismissDialogOpen}
        onClose={() => setDismissDialogOpen(false)}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 3,
            maxWidth: 400,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Skip Onboarding Tour?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Are you sure you want to skip the onboarding tour? You can restart it later from the Help menu.
          </Typography>
          <FormControlLabel
            control={
              <Checkbox 
                checked={skipTutorial}
                onChange={(e) => setSkipTutorial(e.target.checked)}
              />
            }
            label="Don't show this tour again"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={() => setDismissDialogOpen(false)}
            sx={{ fontWeight: 600, borderRadius: 6 }}
          >
            Continue Tour
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={executeDismiss}
            sx={{ fontWeight: 600, borderRadius: 6 }}
          >
            Skip Tour
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render the backdrop when tour is visible
  const renderBackdrop = () => {
    if (!visible) return null;
    
    return (
      <Backdrop
        open={visible}
        sx={{ 
          color: '#fff', 
          zIndex: 1400,
          backgroundColor: 'transparent',
          backdropFilter: 'blur(0px)'
        }}
        onClick={currentStep.closeOnBackdropClick ? handleDismiss : undefined}
      />
    );
  };
  
  // Render welcome screen for first step (optional)
  const renderWelcomeScreen = () => {
    if (!visible || activeStep !== 0 || !currentStep.showWelcomeScreen) return null;
    
    return (
      <Dialog
        open={true}
        maxWidth="sm"
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center', pb: 1 }}>
          Welcome to Trading Journal App!
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 4, pt: 2 }}>
          <LearningIcon 
            sx={{ 
              fontSize: 60, 
              color: theme.palette.primary.main,
              mb: 2
            }} 
          />
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Let's Get Started
          </Typography>
          <Typography variant="body1" paragraph>
            We'll give you a quick tour of the main features to help you get the most out of your trading journal.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This tour will take about 2 minutes to complete.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleDismiss}
            sx={{ fontWeight: 600, borderRadius: 8, px: 3 }}
          >
            Skip for Now
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            endIcon={<GoIcon />}
            sx={{ fontWeight: 600, borderRadius: 8, px: 3 }}
          >
            Start Tour
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  return (
    <>
      <Fade in={visible}>
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1400, pointerEvents: 'none' }}>
          {renderBackdrop()}
          {renderHighlight()}
          {renderTooltip()}
          {renderWelcomeScreen()}
        </Box>
      </Fade>
      {renderDismissDialog()}
    </>
  );
};

// Sample onboarding steps
const defaultOnboardingSteps = [
  {
    title: "Welcome to Trading Journal",
    content: "Let's take a quick tour of the key features to help you get started.",
    showWelcomeScreen: true,
    isFloating: true,
    icon: <LearningIcon />
  },
  {
    title: "Your Dashboard",
    content: "This is your personal dashboard where you can see your trading performance at a glance.",
    targetSelector: ".dashboard-header", // Replace with actual selector
    placement: "bottom",
    scrollIntoView: true,
    icon: <DashboardIcon />
  },
  {
    title: "Add Your First Trade",
    content: "Click here to log a new trade. You can record entry/exit prices, screenshots, and notes.",
    targetSelector: ".add-trade-button", // Replace with actual selector
    placement: "bottom",
    highlightPadding: 4,
    highlightBorderColor: theme.palette.primary.main,
    icon: <AddIcon />
  },
  {
    title: "Track Your Performance",
    content: "The statistics page shows detailed analytics about your trading performance over time.",
    targetSelector: ".stats-nav-link", // Replace with actual selector
    placement: "right",
    icon: <BarChartIcon />
  },
  {
    title: "AI Trading Assistant",
    content: "TradeSage AI analyzes your trades to provide personalized insights and improvement recommendations.",
    targetSelector: ".tradesage-section", // Replace with actual selector
    placement: "left",
    icon: <PsychologyIcon />
  },
  {
    title: "You're All Set!",
    content: "That's it! You're ready to start using Trading Journal App to improve your trading performance.",
    isFloating: true,
    icon: <CheckCircleIcon color="success" />
  }
];

/**
 * OnboardingController - Manages onboarding state and persistence
 */
const OnboardingController = ({ 
  steps = defaultOnboardingSteps,
  storageKey = 'tradingJournal_onboardingComplete',
  disableAutoStart = false
}) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [lastCompletedStep, setLastCompletedStep] = useState(null);
  
  // Check local storage for onboarding status
  useEffect(() => {
    const onboardingStatus = localStorage.getItem(storageKey);
    const shouldShowOnboarding = !onboardingStatus && !disableAutoStart;
    
    // Only auto-show on first load
    if (shouldShowOnboarding) {
      // Small delay to let the app render first
      setTimeout(() => {
        setShowOnboarding(true);
        setHasCompletedOnboarding(false);
      }, 1000);
    } else {
      setHasCompletedOnboarding(!!onboardingStatus);
    }
    
    // Load last completed step if available
    const savedStep = localStorage.getItem(`${storageKey}_lastStep`);
    if (savedStep) {
      setLastCompletedStep(parseInt(savedStep, 10));
    }
  }, [storageKey, disableAutoStart]);
  
  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    localStorage.setItem(storageKey, 'true');
    localStorage.removeItem(`${storageKey}_lastStep`);
    setShowOnboarding(false);
    setHasCompletedOnboarding(true);
  };
  
  // Handle onboarding dismissal
  const handleOnboardingDismiss = (step, dontShowAgain) => {
    if (dontShowAgain) {
      localStorage.setItem(storageKey, 'true');
    }
    
    // Save last step for potential resuming
    localStorage.setItem(`${storageKey}_lastStep`, step.toString());
    setLastCompletedStep(step);
    setShowOnboarding(false);
  };
  
  // Handle onboarding pause (same as dismiss but without don't show again option)
  const handleOnboardingPause = (step) => {
    localStorage.setItem(`${storageKey}_lastStep`, step.toString());
    setLastCompletedStep(step);
    setShowOnboarding(false);
  };
  
  // Start or resume onboarding
  const startOnboarding = () => {
    setShowOnboarding(true);
  };
  
  // Reset onboarding (for testing)
  const resetOnboarding = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_lastStep`);
    setHasCompletedOnboarding(false);
    setLastCompletedStep(null);
    setShowOnboarding(true);
  };
  
  // Add to window for access in development
  if (process.env.NODE_ENV === 'development') {
    window.startOnboarding = startOnboarding;
    window.resetOnboarding = resetOnboarding;
  }
  
  return (
    <>
      <OnboardingTour
        steps={steps}
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onDismiss={handleOnboardingDismiss}
        onPause={handleOnboardingPause}
        initialStep={lastCompletedStep || 0}
        lastCompletedStep={lastCompletedStep}
      />
      
      {/* Help button to restart onboarding */}
      {hasCompletedOnboarding && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
          }}
        >
          <Tooltip title="Restart onboarding tour" placement="left">
            <Zoom in={true}>
              <Box
                component="button"
                onClick={startOnboarding}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.primary.main, 0.9),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: theme.shadows[3],
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    transform: 'scale(1.05)',
                    boxShadow: theme.shadows[5]
                  }
                }}
              >
                <InfoIcon />
              </Box>
            </Zoom>
          </Tooltip>
        </Box>
      )}
    </>
  );
};

export default OnboardingController;