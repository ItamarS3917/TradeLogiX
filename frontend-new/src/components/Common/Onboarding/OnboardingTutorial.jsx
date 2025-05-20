import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  LibraryBooks as JournalIcon,
  EventNote as PlanningIcon,
  Assessment as StatsIcon,
  Psychology as AIIcon,
  CheckCircleOutline as CompleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Define the tutorial steps
const tutorialSteps = [
  {
    label: 'Welcome',
    description: 'Welcome to your Trading Journal! This tutorial will guide you through the main features to help you get started quickly.',
    icon: null,
    image: null,
    actions: []
  },
  {
    label: 'Dashboard',
    description: 'The Dashboard provides an overview of your trading performance. View key metrics, recent trades, and streaks at a glance.',
    icon: <DashboardIcon fontSize="large" color="primary" />,
    image: '/assets/onboarding/dashboard-preview.png',
    actions: [
      { label: 'Go to Dashboard', route: '/dashboard' }
    ]
  },
  {
    label: 'Trade Journal',
    description: 'The Trade Journal lets you log your trades with detailed information such as entry/exit prices, setup types, screenshots, and emotions.',
    icon: <JournalIcon fontSize="large" color="primary" />,
    image: '/assets/onboarding/journal-preview.png',
    actions: [
      { label: 'Go to Journal', route: '/trades' },
      { label: 'Add First Trade', route: '/trades/new' }
    ]
  },
  {
    label: 'Daily Planning',
    description: 'Use the Daily Planning feature to set your market bias, identify key levels, and define your goals before market open.',
    icon: <PlanningIcon fontSize="large" color="primary" />,
    image: '/assets/onboarding/planning-preview.png',
    actions: [
      { label: 'Go to Planning', route: '/planning' },
      { label: 'Create First Plan', route: '/planning/new' }
    ]
  },
  {
    label: 'Statistics',
    description: 'The Statistics page provides detailed analysis of your trading performance with interactive charts and filters.',
    icon: <StatsIcon fontSize="large" color="primary" />,
    image: '/assets/onboarding/stats-preview.png',
    actions: [
      { label: 'Go to Statistics', route: '/statistics' }
    ]
  },
  {
    label: 'TradeSage AI',
    description: 'The TradeSage AI assistant provides personalized insights, pattern recognition, and trading advice based on your journal data.',
    icon: <AIIcon fontSize="large" color="primary" />,
    image: '/assets/onboarding/tradesage-preview.png',
    actions: [
      { label: 'Go to TradeSage AI', route: '/tradesage' }
    ]
  },
  {
    label: 'Complete',
    description: 'You\'re all set! Would you like to add some sample data to see how the journal works?',
    icon: <CompleteIcon fontSize="large" color="success" />,
    image: null,
    actions: [
      { label: 'Add Sample Data', action: 'addSampleData' },
      { label: 'Start Fresh', action: 'startFresh' }
    ]
  }
];

const OnboardingTutorial = ({ open, onClose, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // Reset to first step when dialog opens
  useEffect(() => {
    if (open) {
      setActiveStep(0);
    }
  }, [open]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleActionClick = (action) => {
    if (action.route) {
      navigate(action.route);
      onClose();
    } else if (action.action === 'addSampleData') {
      // This would call the function to add sample data
      onComplete(true); // true = add sample data
      onClose();
    } else if (action.action === 'startFresh') {
      onComplete(false); // false = don't add sample data
      onClose();
    }
  };

  const currentStep = tutorialSteps[activeStep];
  const isLastStep = activeStep === tutorialSteps.length - 1;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          bgcolor: 'background.paper'
        }
      }}
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Typography variant="h5" align="center" fontWeight="bold">
          Trading Journal Tutorial
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {tutorialSteps.map((step, index) => (
            <Step key={step.label} completed={index < activeStep}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 3,
            mb: 4
          }}
        >
          {/* Icon area */}
          {currentStep.icon && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
                width: isMobile ? '100%' : 80,
                height: isMobile ? 80 : '100%'
              }}
            >
              {currentStep.icon}
            </Box>
          )}

          {/* Description area */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {currentStep.label}
            </Typography>
            <Typography variant="body1">
              {currentStep.description}
            </Typography>
          </Box>
        </Box>

        {/* Image or screenshot area */}
        {currentStep.image && (
          <Paper
            elevation={2}
            sx={{
              mb: 4,
              overflow: 'hidden',
              borderRadius: 2,
              height: 300,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'background.default'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Screenshot placeholder: {currentStep.image}
            </Typography>
          </Paper>
        )}

        {/* Action buttons for the current step */}
        {currentStep.actions.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center',
              mt: 2
            }}
          >
            {currentStep.actions.map((action, index) => (
              <Button
                key={index}
                variant="contained"
                color="primary"
                onClick={() => handleActionClick(action)}
                sx={{ minWidth: 150 }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Skip Tutorial
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        {!isLastStep && (
          <Button
            variant="contained"
            onClick={handleNext}
            color="primary"
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OnboardingTutorial;
