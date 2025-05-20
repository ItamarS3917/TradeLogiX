import React, { useState, useRef, useEffect } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Collapse,
  Typography,
  useMediaQuery,
  useTheme,
  alpha,
  Divider,
  Avatar,
  Chip,
  Fade,
  Paper,
  Badge,
  Button,
  Tooltip,
  Switch
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  EventNote as EventNoteIcon,
  LibraryBooks as LibraryBooksIcon,
  Settings as SettingsIcon,
  Psychology as PsychologyIcon,
  CloudSync as CloudSyncIcon,
  ShowChart as ShowChartIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Cloud as CloudIcon,
  Api as ApiIcon,
  SyncAlt as SyncAltIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  WbSunny as LightModeIcon,
  DarkMode as DarkModeIcon,
  Logout as LogoutIcon,
  KeyboardCommandKey as CommandIcon,
  ArrowBack as BackIcon,
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';

/**
 * MobileNavigation Component - Optimized navigation for mobile devices
 * 
 * Features:
 * - Bottom navigation bar for common actions
 * - Slide-out drawer for full menu
 * - Context-aware navigation
 * - Smooth animations
 * - Touch-optimized interactions
 */
const MobileNavigation = ({
  isOpen,
  onClose,
  user,
  onLogout,
  marketStatus = { isOpen: false, label: 'Market Closed' }
}) => {
  const theme = useTheme();
  const { toggleMode, activeTheme } = useAppTheme();
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [developerOpen, setDeveloperOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef(null);
  
  // Handle swipe to close
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;
    
    let touchStartX = 0;
    
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchMove = (e) => {
      if (!isOpen) return;
      
      const touchEndX = e.touches[0].clientX;
      const deltaX = touchEndX - touchStartX;
      
      // If swiping left, close the drawer
      if (deltaX < -70) {
        onClose();
      }
    };
    
    drawer.addEventListener('touchstart', handleTouchStart);
    drawer.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      drawer.removeEventListener('touchstart', handleTouchStart);
      drawer.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isOpen, onClose]);
  
  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };
  
  // Toggle submenus
  const toggleIntegrations = () => {
    setIntegrationsOpen(!integrationsOpen);
  };
  
  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };
  
  const toggleDeveloper = () => {
    setDeveloperOpen(!developerOpen);
  };
  
  // Navigation items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Trade Journal', icon: <LibraryBooksIcon />, path: '/trades' },
    { text: 'Daily Planning', icon: <EventNoteIcon />, path: '/planning' },
    { text: 'Statistics', icon: <AssessmentIcon />, path: '/statistics' },
    { text: 'TradeSage AI', icon: <PsychologyIcon />, path: '/tradesage' },
  ];
  
  // Integration items
  const integrationItems = [
    { text: 'Cloud Sync', icon: <CloudSyncIcon />, path: '/cloud-sync' },
    { text: 'TradingView', icon: <ShowChartIcon />, path: '/tradingview' },
  ];
  
  // Settings items
  const settingsItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Data Migration', icon: <SyncAltIcon />, path: '/migration' },
  ];
  
  // Developer items (only in development)
  const developerItems = [
    { text: 'API Bridge Test', icon: <ApiIcon />, path: '/api-bridge-test' },
    { text: 'Firebase Test', icon: <CloudIcon />, path: '/firebase-test' },
  ];
  
  // Determine if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Market Status chip
  const MarketStatusChip = () => {
    return (
      <Chip 
        icon={marketStatus.isOpen ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
        label={marketStatus.label}
        size="small"
        color={marketStatus.isOpen ? "success" : "default"}
        sx={{ 
          fontWeight: 600,
          height: '28px',
          '& .MuiChip-label': { px: 1.5 },
          '& .MuiChip-icon': { fontSize: '16px' }
        }}
      />
    );
  };
  
  // Drawer content
  const drawerContent = (
    <Box 
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '85vw', maxWidth: 320 }}
      ref={drawerRef}
    >
      {/* App Logo & Title */}
      <Box 
        sx={{ 
          p: 2.5, 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 42, 
              height: 42, 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: '#fff',
              mr: 1.5,
              fontWeight: 800,
              fontSize: '20px',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            TJ
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 800, 
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
                fontSize: '1.25rem'
              }}
            >
              Trading Journal
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <MarketStatusChip />
            </Box>
          </Box>
        </Box>
        
        <IconButton
          edge="end"
          onClick={onClose}
          sx={{ mr: -1 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      {/* Date Display */}
      <Box sx={{ 
        py: 1.5, 
        px: 3,
        borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
      }}>
        <Typography variant="caption" sx={{ 
          color: alpha(theme.palette.text.primary, 0.6),
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.05em',
          fontSize: '0.7rem'
        }}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Typography>
      </Box>
      
      {/* Main Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Typography variant="caption" sx={{ 
          px: 3, 
          py: 1.5, 
          display: 'block',
          color: alpha(theme.palette.text.primary, 0.6),
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.05em',
          fontSize: '0.7rem'
        }}>
          Main Navigation
        </Typography>
        
        <List component="nav" sx={{ px: 1.5 }}>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{ 
                  py: 1.2,
                  px: 1.5,
                  borderRadius: 2,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {location.pathname === item.path && (
                  <Box sx={{ 
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: '50%',
                    bgcolor: theme.palette.primary.main,
                    borderRadius: '0 4px 4px 0'
                  }} />
                )}
                <ListItemIcon sx={{ 
                  minWidth: 40, 
                  color: location.pathname === item.path 
                    ? theme.palette.primary.main 
                    : alpha(theme.palette.text.primary, 0.7)
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname === item.path ? 700 : 500,
                    fontSize: '0.95rem',
                  }} 
                />
                {location.pathname === item.path && (
                  <Box sx={{ 
                    ml: 'auto', 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main
                  }} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
          
          <Divider sx={{ my: 2, mx: 1 }} />
          
          {/* Integrations Section */}
          <ListItem disablePadding>
            <ListItemButton onClick={toggleIntegrations} sx={{ borderRadius: 2 }}>
              <ListItemText primary="Integrations" />
              {integrationsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={integrationsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {integrationItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ ml: 2 }}>
                  <ListItemButton 
                    onClick={() => handleNavigation(item.path)}
                    selected={location.pathname === item.path}
                    sx={{ 
                      py: 1,
                      px: 1.5,
                      borderRadius: 2
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 36, 
                      color: location.pathname === item.path 
                        ? theme.palette.primary.main 
                        : alpha(theme.palette.text.primary, 0.7)
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: location.pathname === item.path ? 700 : 500,
                        fontSize: '0.9rem',
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
          
          <Divider sx={{ my: 2, mx: 1 }} />
          
          {/* Settings Section */}
          <ListItem disablePadding>
            <ListItemButton onClick={toggleSettings} sx={{ borderRadius: 2 }}>
              <ListItemText primary="Settings" />
              {settingsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {settingsItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ ml: 2 }}>
                  <ListItemButton 
                    onClick={() => handleNavigation(item.path)}
                    selected={location.pathname === item.path}
                    sx={{ 
                      py: 1,
                      px: 1.5,
                      borderRadius: 2
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 36, 
                      color: location.pathname === item.path 
                        ? theme.palette.primary.main 
                        : alpha(theme.palette.text.primary, 0.7)
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: location.pathname === item.path ? 700 : 500,
                        fontSize: '0.9rem',
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
          
          {/* Developer Section - Only in development mode */}
          {isDevelopment && (
            <>
              <Divider sx={{ my: 2, mx: 1 }} />
              
              <ListItem disablePadding>
                <ListItemButton onClick={toggleDeveloper} sx={{ borderRadius: 2 }}>
                  <ListItemText primary="Developer Tools" />
                  {developerOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
              </ListItem>
              
              <Collapse in={developerOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {developerItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ ml: 2 }}>
                      <ListItemButton 
                        onClick={() => handleNavigation(item.path)}
                        selected={location.pathname === item.path}
                        sx={{ 
                          py: 1,
                          px: 1.5,
                          borderRadius: 2
                        }}
                      >
                        <ListItemIcon sx={{ 
                          minWidth: 36, 
                          color: location.pathname === item.path 
                            ? theme.palette.primary.main 
                            : alpha(theme.palette.text.primary, 0.7)
                        }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text} 
                          primaryTypographyProps={{ 
                            fontWeight: location.pathname === item.path ? 700 : 500,
                            fontSize: '0.9rem',
                          }} 
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          )}
        </List>
      </Box>
      
      {/* User Section */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(8px)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48, 
              mr: 1.5,
              bgcolor: theme.palette.primary.main,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user?.name || 'User'}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={theme.palette.mode === 'dark'}
                onChange={toggleMode}
                size="small"
              />
            }
            label={
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                {theme.palette.mode === 'dark' ? (
                  <DarkModeIcon fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <LightModeIcon fontSize="small" sx={{ mr: 0.5 }} />
                )}
                {theme.palette.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Typography>
            }
          />
          
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            sx={{ fontWeight: 600 }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Box>
  );
  
  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={onClose}
        transitionDuration={300}
        SlideProps={{
          easing: {
            enter: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
            exit: 'cubic-bezier(1.0, 0.0, 0.8, 1.0)'
          }
        }}
        PaperProps={{
          sx: {
            width: '85vw',
            maxWidth: 320,
            borderRadius: '0 16px 16px 0',
            borderRight: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
          }
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Bottom Navigation Bar - Fixed at bottom on mobile */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          display: { xs: 'flex', sm: 'none' },
          flexDirection: 'row',
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden',
          height: 64,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
        }}
        elevation={3}
      >
        {navItems.slice(0, 4).map((item) => (
          <Box
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              py: 1,
              color: location.pathname === item.path 
                ? theme.palette.primary.main 
                : alpha(theme.palette.text.primary, 0.7),
              transition: 'all 0.2s',
              '&:active': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
              }
            }}
          >
            <Box sx={{ 
              p: 0.5, 
              borderRadius: '50%',
              backgroundColor: location.pathname === item.path 
                ? alpha(theme.palette.primary.main, 0.1) 
                : 'transparent'
            }}>
              {item.icon}
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.65rem', 
                mt: 0.25,
                fontWeight: location.pathname === item.path ? 600 : 400
              }}
            >
              {item.text}
            </Typography>
          </Box>
        ))}
        
        {/* Menu Button */}
        <Box
          onClick={onClose}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            py: 1,
            color: isOpen 
              ? theme.palette.primary.main 
              : alpha(theme.palette.text.primary, 0.7),
            transition: 'all 0.2s',
            '&:active': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
        >
          <Box sx={{ 
            p: 0.5, 
            borderRadius: '50%',
            backgroundColor: isOpen 
              ? alpha(theme.palette.primary.main, 0.1) 
              : 'transparent'
          }}>
            <MenuIcon />
          </Box>
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.65rem', 
              mt: 0.25,
              fontWeight: isOpen ? 600 : 400
            }}
          >
            Menu
          </Typography>
        </Box>
      </Paper>
      
      {/* Add Trade Floating Button */}
      <Fade in={!isOpen}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 20,
            zIndex: 1100,
            display: { xs: 'block', sm: 'none' }
          }}
        >
          <Tooltip title="Add Trade">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/trades/new')}
              sx={{
                width: 56,
                height: 56,
                minWidth: 0,
                p: 0,
                borderRadius: '50%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              <AddIcon />
            </Button>
          </Tooltip>
        </Box>
      </Fade>
    </>
  );
};

export default MobileNavigation;