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
        p: 2, 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left side - Quick actions */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTradeClick}
          color="primary"
          sx={{ 
            fontWeight: 600, 
            borderRadius: 2,
            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
            '&:hover': {
              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
            }
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
            sx={{ 
              fontWeight: 600, 
              borderRadius: 2,
              borderWidth: '1.5px'
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
            sx={{ 
              fontWeight: 600, 
              borderRadius: 2,
              borderWidth: '1.5px'
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
          gap: { xs: 1.5, md: 2 },
          flexWrap: 'wrap'
        }}
      >
        {/* Market status indicator */}
        <Chip 
          icon={<TimerIcon />} 
          label={marketStatus.message} 
          color={marketStatus.isOpen ? "success" : "error"} 
          variant="outlined"
          size="medium"
          sx={{ 
            fontWeight: 600, 
            py: 0.5,
            borderWidth: '1.5px'
          }}
        />
        
        {/* Upcoming events */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <Chip 
            icon={<EventIcon />} 
            label={upcomingEvents[0].title} 
            color="warning" 
            variant="outlined"
            size="medium"
            sx={{ 
              fontWeight: 600, 
              py: 0.5,
              borderWidth: '1.5px'
            }}
            onClick={() => {/* Show all events */}}
          />
        )}
        
        {/* More events indicator */}
        {upcomingEvents && upcomingEvents.length > 1 && (
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600, 
              color: 'text.secondary',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            +{upcomingEvents.length - 1} more
          </Typography>
        )}
        
        {/* View all events button */}
        <IconButton 
          size="small" 
          component={RouterLink} 
          to="/calendar"
          color="primary"
          sx={{ 
            ml: { xs: 0, sm: 1 },
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            }
          }}
        >
          <ArrowForwardIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default QuickActionsBar;