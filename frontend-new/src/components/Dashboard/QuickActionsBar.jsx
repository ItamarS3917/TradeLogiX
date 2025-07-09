import React, { useState } from 'react';
import { 
  Box, 
  Paper,
  Button, 
  Menu, 
  MenuItem, 
  Divider, 
  Typography, 
  Chip,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Settings as SettingsIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  Timer as TimerIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * QuickActionsBar Component
 * 
 * Provides quick access to common actions and displays important information.
 * 
 * @param {Object} props Component properties
 * @param {Object} props.marketStatus Current market status
 * @param {Object} props.todayPlan Information about today's trading plan
 * @param {Array} props.upcomingEvents List of upcoming market events
 * @param {Function} props.onAddTrade Function called when adding a trade
 */
const QuickActionsBar = ({ 
  marketStatus = { isOpen: false, message: 'Market Closed' },
  todayPlan = null,
  upcomingEvents = [],
  onAddTrade
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Handle quick add menu
  const handleAddTradeClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleAddTradeClose = () => {
    setAnchorEl(null);
  };
  
  // Handle specific trade type selection
  const handleTradeTypeSelect = (type) => {
    handleAddTradeClose();
    if (onAddTrade) {
      onAddTrade(type);
    }
  };
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: 3,
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 8px 32px ${alpha(theme.palette.text.primary, 0.04)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.primary.main} 100%)`,
          opacity: 0.6
        }
      }}
    >
      {/* Left side - Quick actions */}
      <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTradeClick}
          color="primary"
          size="large"
          sx={{ 
            fontWeight: 700, 
            borderRadius: 3,
            px: 3,
            py: 1.5,
            fontSize: '1rem',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          Quick Add Trade
        </Button>
        
        {/* Quick Add Trade dropdown menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleAddTradeClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1,
              borderRadius: 2,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
              minWidth: 200
            }
          }}
        >
          <MenuItem 
            onClick={() => handleTradeTypeSelect('long')}
            sx={{ py: 1.5 }}
          >
            <TrendingUpIcon sx={{ mr: 1.5, color: theme.palette.success.main }} /> 
            <Typography fontWeight={500}>Long Position</Typography>
          </MenuItem>
          
          <MenuItem 
            onClick={() => handleTradeTypeSelect('short')}
            sx={{ py: 1.5 }}
          >
            <TrendingDownIcon sx={{ mr: 1.5, color: theme.palette.error.main }} /> 
            <Typography fontWeight={500}>Short Position</Typography>
          </MenuItem>
          
          <Divider sx={{ my: 1 }} />
          
          <MenuItem 
            onClick={() => handleTradeTypeSelect('custom')}
            sx={{ py: 1.5 }}
          >
            <SettingsIcon sx={{ mr: 1.5, color: theme.palette.text.secondary }} /> 
            <Typography fontWeight={500}>Custom Entry...</Typography>
          </MenuItem>
        </Menu>
        
        {/* Today's Plan button */}
        {todayPlan ? (
          <Button
            variant="outlined"
            startIcon={<CalendarIcon />}
            component={RouterLink}
            to="/planning"
            color="secondary"
            size="large"
            sx={{ 
              fontWeight: 700, 
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontSize: '1rem',
              borderWidth: '2px',
              background: alpha(theme.palette.secondary.main, 0.05),
              '&:hover': {
                borderWidth: '2px',
                background: alpha(theme.palette.secondary.main, 0.1),
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 16px ${alpha(theme.palette.secondary.main, 0.2)}`
              },
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          >
            Today's Plan
          </Button>
        ) : (
          <Button
            variant="outlined"
            startIcon={<CalendarIcon />}
            component={RouterLink}
            to="/planning/new"
            color="info"
            size="large"
            sx={{ 
              fontWeight: 700, 
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontSize: '1rem',
              borderWidth: '2px',
              background: alpha(theme.palette.info.main, 0.05),
              '&:hover': {
                borderWidth: '2px',
                background: alpha(theme.palette.info.main, 0.1),
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 16px ${alpha(theme.palette.info.main, 0.2)}`
              },
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          >
            Create Plan
          </Button>
        )}
      </Box>
      
      {/* Right side - Status and events */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 2, md: 3 },
          flexWrap: 'wrap'
        }}
      >
        {/* Market status indicator */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          p: 1.5,
          borderRadius: 3,
          background: marketStatus.isOpen 
            ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(marketStatus.isOpen ? theme.palette.success.main : theme.palette.error.main, 0.2)}`,
          backdropFilter: 'blur(8px)'
        }}>
          <TimerIcon sx={{ 
            mr: 1.5, 
            color: marketStatus.isOpen ? theme.palette.success.main : theme.palette.error.main,
            fontSize: '1.2rem'
          }} />
          <Typography sx={{ 
            fontWeight: 700,
            fontSize: '0.9rem',
            color: marketStatus.isOpen ? theme.palette.success.main : theme.palette.error.main
          }}>
            {marketStatus.message}
          </Typography>
        </Box>
        
        {/* Upcoming events */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            p: 1.5,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 16px ${alpha(theme.palette.warning.main, 0.2)}`
            }
          }}>
            <EventIcon sx={{ 
              mr: 1.5, 
              color: theme.palette.warning.main,
              fontSize: '1.2rem'
            }} />
            <Typography sx={{ 
              fontWeight: 700,
              fontSize: '0.9rem',
              color: theme.palette.warning.main
            }}>
              {upcomingEvents[0].title}
            </Typography>
            
            {/* More events indicator */}
            {upcomingEvents.length > 1 && (
              <Box sx={{ 
                ml: 1.5,
                px: 1,
                py: 0.5,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.warning.main, 0.2),
                color: theme.palette.warning.dark,
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                +{upcomingEvents.length - 1}
              </Box>
            )}
          </Box>
        )}
        
        {/* View all events button */}
        <IconButton 
          size="medium" 
          component={RouterLink} 
          to="/calendar"
          color="primary"
          sx={{ 
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 2.5,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
            },
            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default QuickActionsBar;