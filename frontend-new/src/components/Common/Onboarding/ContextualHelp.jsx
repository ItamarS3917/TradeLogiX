import React, { useState } from 'react';
import {
  Tooltip,
  IconButton,
  Popper,
  Paper,
  Typography,
  Box,
  Fade,
  Divider,
  Button,
  ClickAwayListener
} from '@mui/material';
import {
  HelpOutline as HelpIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Define help content structure
const helpContents = {
  dashboard: {
    title: 'Dashboard',
    description: 'The dashboard displays your key trading metrics and recent activity.',
    sections: [
      { 
        title: 'Performance Cards', 
        content: 'These cards show your win rate, profit/loss, average win, and average loss.',
        moreUrl: '/help/dashboard-performance'
      },
      { 
        title: 'Recent Trades', 
        content: 'View your most recent trades with quick access to details.',
        moreUrl: '/help/dashboard-trades'
      },
      { 
        title: 'Trading Streak', 
        content: 'Visualizes your current winning or losing streak.',
        moreUrl: '/help/dashboard-streak'
      }
    ]
  },
  tradeJournal: {
    title: 'Trade Journal',
    description: 'Record and track details of all your trades.',
    sections: [
      { 
        title: 'Adding Trades', 
        content: 'Click the "Add Trade" button to log a new trade with entry/exit prices, times, and more.',
        moreUrl: '/help/adding-trades'
      },
      { 
        title: 'Filtering Trades', 
        content: 'Use the filter options to find specific trades by date, symbol, or outcome.',
        moreUrl: '/help/filtering-trades'
      },
      { 
        title: 'Trade Details', 
        content: 'Click on any trade to view full details including charts and notes.',
        moreUrl: '/help/trade-details'
      }
    ]
  },
  planning: {
    title: 'Daily Planning',
    description: 'Create plans before market open for better trading discipline.',
    sections: [
      { 
        title: 'Creating Plans', 
        content: 'Click "New Plan" to set up your daily trading plan with market bias and key levels.',
        moreUrl: '/help/creating-plans'
      },
      { 
        title: 'Plan History', 
        content: 'View past plans to track how well you followed your plan vs. actual results.',
        moreUrl: '/help/plan-history'
      }
    ]
  },
  statistics: {
    title: 'Statistics',
    description: 'Analyze your trading performance with interactive charts and metrics.',
    sections: [
      { 
        title: 'Performance Metrics', 
        content: 'View win rate, profit factor, and other key performance indicators.',
        moreUrl: '/help/performance-metrics'
      },
      { 
        title: 'Chart Analysis', 
        content: 'Interactive charts show performance by setup type, time of day, and more.',
        moreUrl: '/help/chart-analysis'
      },
      { 
        title: 'Date Filtering', 
        content: 'Use date ranges to analyze performance over specific periods.',
        moreUrl: '/help/date-filtering'
      }
    ]
  },
  tradesage: {
    title: 'TradeSage AI',
    description: 'Get AI-powered insights and recommendations based on your trading data.',
    sections: [
      { 
        title: 'Asking Questions', 
        content: 'Ask TradeSage questions about your trading patterns and performance.',
        moreUrl: '/help/ai-questions'
      },
      { 
        title: 'Pattern Recognition', 
        content: 'TradeSage identifies patterns in your profitable and unprofitable trades.',
        moreUrl: '/help/pattern-recognition'
      },
      { 
        title: 'Improvement Suggestions', 
        content: 'Get personalized recommendations to improve your trading performance.',
        moreUrl: '/help/improvement-suggestions'
      }
    ]
  }
};

const ContextualHelp = ({ section, position = 'right' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  
  const helpContent = helpContents[section] || {
    title: 'Help',
    description: 'Help content for this section is coming soon.',
    sections: []
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div>
        <Tooltip title="Help" arrow>
          <IconButton onClick={handleClick} size="small" color="primary">
            <HelpIcon />
          </IconButton>
        </Tooltip>
        
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement={position === 'left' ? 'left-start' : 'right-start'}
          transition
          sx={{ zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper 
                elevation={3}
                sx={{ 
                  width: 320,
                  maxWidth: '100%',
                  p: 0,
                  overflow: 'hidden',
                  borderRadius: 2
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    p: 1.5,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {helpContent.title}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={handleClose}
                    sx={{ color: 'primary.contrastText' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" paragraph>
                    {helpContent.description}
                  </Typography>
                  
                  {helpContent.sections.map((item, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <Divider sx={{ my: 1.5 }} />}
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {item.content}
                        </Typography>
                        {item.moreUrl && (
                          <Button 
                            size="small" 
                            variant="text" 
                            sx={{ px: 0, py: 0 }}
                            onClick={() => {
                              // Navigate to help documentation
                              console.log(`Navigating to ${item.moreUrl}`);
                              handleClose();
                            }}
                          >
                            Learn more
                          </Button>
                        )}
                      </Box>
                    </React.Fragment>
                  ))}
                </Box>
              </Paper>
            </Fade>
          )}
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export default ContextualHelp;