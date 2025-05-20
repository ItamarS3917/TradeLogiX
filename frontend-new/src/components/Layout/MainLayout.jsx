import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
  Collapse,
  Avatar,
  Chip,
  Badge,
  Tooltip,
  alpha,
  Menu,
  MenuItem,
  Button
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
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Cloud as CloudIcon,
  IntegrationInstructions as IntegrationIcon,
  SyncAlt as SyncAltIcon,
  Api as ApiIcon,
  Notifications as NotificationsIcon,
  KeyboardCommandKey as CommandIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  WbSunny as LightModeIcon,
  DarkMode as DarkModeIcon,
  AccountCircle as AccountIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  KeyboardArrowRight as ArrowRightIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { OnboardingController } from '../Common/Onboarding';
import { KeyboardShortcutsModal, CommandPalette } from '../Common/KeyboardShortcuts';
import DataSourceWarning from '../Common/DataSourceWarning';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useKeyboardShortcuts } from '../../contexts/KeyboardShortcutsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { format } from 'date-fns';

// Drawer width
const drawerWidth = 280;

const MainLayout = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [developerOpen, setDeveloperOpen] = useState(false);
  const [notificationMenu, setNotificationMenu] = useState(null);
  const [userMenu, setUserMenu] = useState(null);
  const { logout, user } = useAuth();
  const { isFirstTimeUser } = useOnboarding();
  const { showShortcutsModal } = useKeyboardShortcuts();
  const { theme, toggleMode, activeTheme, updateThemeWithPreset } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const navigateTo = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  const handleLogout = () => {
    setUserMenu(null);
    logout();
    navigate('/login');
  };
  
  const toggleIntegrations = () => {
    setIntegrationsOpen(!integrationsOpen);
  };
  
  const toggleDeveloper = () => {
    setDeveloperOpen(!developerOpen);
  };
  
  const handleNotificationMenuOpen = (event) => {
    setNotificationMenu(event.currentTarget);
  };
  
  const handleNotificationMenuClose = () => {
    setNotificationMenu(null);
  };
  
  const handleUserMenuOpen = (event) => {
    setUserMenu(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenu(null);
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
  
  // Settings and tools items
  const settingsItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Data Migration', icon: <SyncAltIcon />, path: '/migration' },
  ];
  
  // Developer tools (only visible in development)
  const developerItems = [
    { text: 'API Bridge Test', icon: <ApiIcon />, path: '/api-bridge-test' },
    { text: 'Firebase Test', icon: <CloudIcon />, path: '/firebase-test' },
    { text: 'Trade Service Test', icon: <CloudIcon />, path: '/trade-service-test' },
    { text: 'Firestore Direct Test', icon: <CloudIcon />, path: '/firestore-direct-test' },
    { text: 'Analytics Example', icon: <CloudIcon />, path: '/analytics-example' },
  ];

  // Sample notifications (replace with real data in production)
  const notifications = [
    { id: 1, title: 'New Trading Plan', message: 'Time to create your daily trading plan', time: '5 minutes ago', read: false },
    { id: 2, title: 'Market Open', message: 'US markets are now open for trading', time: '2 hours ago', read: true },
    { id: 3, title: 'AI Insight', message: 'TradeSage found a pattern in your trades', time: 'Yesterday', read: true },
  ];
  
  // Determine if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Market Status chip (demo)
  const MarketStatusChip = () => {
    // This would be fetched from an API in a real app
    const isMarketOpen = new Date().getHours() >= 9 && new Date().getHours() < 16;
    
    return (
      <Chip 
        icon={isMarketOpen ? <TrendingUpIcon /> : <TrendingDownIcon />}
        label={isMarketOpen ? "Market Open" : "Market Closed"}
        size="small"
        color={isMarketOpen ? "success" : "default"}
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
  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* App Logo & Title */}
      <Box 
        sx={{ 
          p: 2.5, 
          display: 'flex', 
          alignItems: 'center',
          borderBottom: `1px solid ${alpha(muiTheme.palette.text.primary, 0.08)}`
        }}
      >
        <Box 
          sx={{ 
            width: 42, 
            height: 42, 
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
            color: '#fff',
            mr: 1.5,
            fontWeight: 800,
            fontSize: '20px',
            boxShadow: `0 4px 12px ${alpha(muiTheme.palette.primary.main, 0.3)}`
          }}
        >
          MR
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
            TradeMR
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <MarketStatusChip />
          </Box>
        </Box>
      </Box>
      
      {/* Date & Search */}
      <Box sx={{ 
        p: 2.5, 
        pb: 1.5, 
        borderBottom: `1px solid ${alpha(muiTheme.palette.text.primary, 0.08)}`
      }}>
        <Typography variant="caption" sx={{ 
          color: alpha(muiTheme.palette.text.primary, 0.6),
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.05em',
          fontSize: '0.7rem'
        }}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Typography>
        
        <Box sx={{ 
          mt: 1.5, 
          display: 'flex', 
          alignItems: 'center',
          p: 1,
          borderRadius: 2,
          bgcolor: alpha(muiTheme.palette.text.primary, 0.04),
          border: `1px solid ${alpha(muiTheme.palette.text.primary, 0.08)}`,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: alpha(muiTheme.palette.text.primary, 0.06),
          }
        }}>
          <SearchIcon sx={{ color: alpha(muiTheme.palette.text.primary, 0.4), mr: 1, fontSize: '1.2rem' }} />
          <Typography sx={{ 
            color: alpha(muiTheme.palette.text.primary, 0.5),
            fontWeight: 500,
            fontSize: '0.875rem'
          }}>
            Search...
          </Typography>
          <Box sx={{ 
            ml: 'auto', 
            bgcolor: alpha(muiTheme.palette.text.primary, 0.08),
            borderRadius: 1,
            px: 0.7,
            fontSize: '0.65rem',
            fontWeight: 600,
            color: alpha(muiTheme.palette.text.primary, 0.7),
          }}>
            ⌘K
          </Box>
        </Box>
      </Box>
      
      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', pt: 1.5 }}>
        <Typography variant="caption" sx={{ 
          px: 3, 
          py: 1.5, 
          display: 'block',
          color: alpha(muiTheme.palette.text.primary, 0.6),
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
                onClick={() => navigateTo(item.path)}
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
                    bgcolor: muiTheme.palette.primary.main,
                    borderRadius: '0 4px 4px 0'
                  }} />
                )}
                <ListItemIcon sx={{ 
                  minWidth: 40, 
                  color: location.pathname === item.path 
                    ? muiTheme.palette.primary.main 
                    : alpha(muiTheme.palette.text.primary, 0.7)
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
                    bgcolor: muiTheme.palette.primary.main
                  }} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
          
          <Divider sx={{ my: 2, mx: 1 }} />
          
          <Typography variant="caption" sx={{ 
            px: 1.5, 
            py: 1, 
            display: 'block',
            color: alpha(muiTheme.palette.text.primary, 0.6),
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: '0.05em',
            fontSize: '0.7rem'
          }}>
            Integrations
          </Typography>
          
          {/* Integrations section */}
          {integrationItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => navigateTo(item.path)}
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
                    bgcolor: muiTheme.palette.primary.main,
                    borderRadius: '0 4px 4px 0'
                  }} />
                )}
                <ListItemIcon sx={{ 
                  minWidth: 40, 
                  color: location.pathname === item.path 
                    ? muiTheme.palette.primary.main 
                    : alpha(muiTheme.palette.text.primary, 0.7)
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
              </ListItemButton>
            </ListItem>
          ))}
          
          <Divider sx={{ my: 2, mx: 1 }} />
          
          <Typography variant="caption" sx={{ 
            px: 1.5, 
            py: 1, 
            display: 'block',
            color: alpha(muiTheme.palette.text.primary, 0.6),
            textTransform: 'uppercase',
            fontWeight: 600,
            letterSpacing: '0.05em',
            fontSize: '0.7rem'
          }}>
            Settings
          </Typography>
          
          {/* Settings and tools */}
          {settingsItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                onClick={() => navigateTo(item.path)}
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
                    bgcolor: muiTheme.palette.primary.main,
                    borderRadius: '0 4px 4px 0'
                  }} />
                )}
                <ListItemIcon sx={{ 
                  minWidth: 40, 
                  color: location.pathname === item.path 
                    ? muiTheme.palette.primary.main 
                    : alpha(muiTheme.palette.text.primary, 0.7)
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
              </ListItemButton>
            </ListItem>
          ))}
          
          {/* Developer tools (only in development) */}
          {isDevelopment && (
            <>
              <Divider sx={{ my: 2, mx: 1 }} />
              
              <Typography variant="caption" sx={{ 
                px: 1.5, 
                py: 1, 
                display: 'block',
                color: alpha(muiTheme.palette.text.primary, 0.6),
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.05em',
                fontSize: '0.7rem'
              }}>
                Developer
              </Typography>
              
              {developerItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton 
                    onClick={() => navigateTo(item.path)}
                    selected={location.pathname === item.path}
                    sx={{ 
                      py: 1,
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
                        bgcolor: muiTheme.palette.primary.main,
                        borderRadius: '0 4px 4px 0'
                      }} />
                    )}
                    <ListItemIcon sx={{ 
                      minWidth: 40, 
                      color: location.pathname === item.path 
                        ? muiTheme.palette.primary.main 
                        : alpha(muiTheme.palette.text.primary, 0.7),
                      fontSize: '1.2rem'
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
            </>
          )}
        </List>
      </Box>
      
      {/* User section */}
      <Box 
        sx={{ 
          p: 2, 
          borderTop: `1px solid ${alpha(muiTheme.palette.text.primary, 0.08)}`,
          backgroundColor: alpha(muiTheme.palette.background.paper, 0.6),
          backdropFilter: 'blur(8px)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Avatar 
            sx={{ 
              width: 44, 
              height: 44, 
              mr: 1.5,
              bgcolor: muiTheme.palette.primary.main,
              boxShadow: `0 4px 14px ${alpha(muiTheme.palette.primary.main, 0.3)}`
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
          <IconButton 
            size="small" 
            onClick={handleUserMenuOpen}
            sx={{ ml: 1 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          
          <Menu
            anchorEl={userMenu}
            open={Boolean(userMenu)}
            onClose={handleUserMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 2,
              sx: {
                mt: 1.5,
                borderRadius: 2,
                minWidth: 180,
                boxShadow: '0 8px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)',
                border: `1px solid ${alpha(muiTheme.palette.text.primary, 0.08)}`
              }
            }}
          >
            <MenuItem onClick={() => {
              handleUserMenuClose();
              navigateTo('/settings');
            }}>
              Profile Settings
            </MenuItem>
            <MenuItem onClick={() => {
              handleUserMenuClose();
            }}>
              Account Preferences
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Typography color="error" sx={{ fontWeight: 600 }}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Tooltip title="Toggle light/dark mode">
            <IconButton 
              size="small" 
              onClick={toggleMode}
              className="theme-toggle-icon"
              sx={{ 
                borderRadius: 1.5,
                backgroundColor: alpha(muiTheme.palette.text.primary, 0.04),
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.text.primary, 0.08)
                }
              }}
            >
              {muiTheme.palette.mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Keyboard shortcuts">
            <IconButton 
              size="small" 
              onClick={() => showShortcutsModal(true)}
              sx={{ 
                borderRadius: 1.5,
                backgroundColor: alpha(muiTheme.palette.text.primary, 0.04),
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.text.primary, 0.08)
                }
              }}
            >
              <CommandIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <IconButton 
              size="small" 
              onClick={handleNotificationMenuOpen}
              sx={{ 
                borderRadius: 1.5,
                backgroundColor: alpha(muiTheme.palette.text.primary, 0.04),
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.text.primary, 0.08)
                }
              }}
            >
              <Badge 
                badgeContent={notifications.filter(n => !n.read).length} 
                color="error"
                sx={{ '& .MuiBadge-badge': { height: 16, minWidth: 16, fontSize: 10 } }}
              >
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={notificationMenu}
            open={Boolean(notificationMenu)}
            onClose={handleNotificationMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 2,
              sx: {
                mt: 1.5,
                borderRadius: 2,
                minWidth: 320,
                maxWidth: 360,
                padding: 0,
                boxShadow: '0 8px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)',
                border: `1px solid ${alpha(muiTheme.palette.text.primary, 0.08)}`
              }
            }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(muiTheme.palette.text.primary, 0.08)}` }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notifications</Typography>
            </Box>
            {notifications.map((notification) => (
              <MenuItem 
                key={notification.id} 
                onClick={handleNotificationMenuClose}
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  borderLeft: notification.read ? 'none' : `3px solid ${muiTheme.palette.primary.main}`,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {notification.time}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
            <Box sx={{ p: 1.5, borderTop: `1px solid ${alpha(muiTheme.palette.text.primary, 0.08)}` }}>
              <Button 
                fullWidth 
                variant="text" 
                size="small"
                endIcon={<ArrowRightIcon />}
              >
                View All Notifications
              </Button>
            </Box>
          </Menu>
          
          <Tooltip title="Logout">
            <IconButton 
              size="small" 
              onClick={handleLogout}
              sx={{ 
                borderRadius: 1.5,
                backgroundColor: alpha(muiTheme.palette.text.primary, 0.04),
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.text.primary, 0.08)
                }
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
  
  // Set up keyboard shortcuts
  useEffect(() => {
    // Make navigate available to shortcuts
    window.navigate = navigate;
    
    // Make shortcuts modal setter available
    window.setShowShortcutsModal = (val) => {
      if (typeof val === 'boolean') {
        useKeyboardShortcuts().setShowShortcutsModal(val);
      }
    };
  }, [navigate]);
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: alpha(muiTheme.palette.background.paper, 0.85),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${alpha(muiTheme.palette.text.primary, 0.08)}`
        }}
      >
        <Toolbar sx={{ 
          justifyContent: 'space-between',
          height: 70
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700,
                  display: { xs: 'none', sm: 'block' },
                  background: `linear-gradient(90deg, ${muiTheme.palette.text.primary} 0%, ${alpha(muiTheme.palette.text.primary, 0.7)} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {getCurrentPageTitle(location.pathname)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MarketStatusChip />
            
            {/* Quick Action Button */}
            <Button 
              variant="contained" 
              color="primary"
              size="small"
              sx={{ 
                height: 36,
                px: 2,
                borderRadius: 2,
                fontWeight: 600,
                boxShadow: `0 4px 14px ${alpha(muiTheme.palette.primary.main, 0.3)}`,
                display: { xs: 'none', md: 'flex' }
              }}
              onClick={() => navigateTo('/trades')}
            >
              + Add Trade
            </Button>
            
            {/* Mobile user menu */}
            {isMobile && (
              <IconButton 
                color="inherit" 
                edge="end"
                onClick={handleUserMenuOpen}
              >
                <AccountIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar / Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              boxShadow: '0 0 25px rgba(0,0,0,0.15)' 
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${alpha(muiTheme.palette.text.primary, 0.08)}`
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        className="animate-fade-in"
        sx={{ 
          flexGrow: 1, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '70px', // Height of the AppBar
          maxWidth: '100%', // Ensure content doesn't overflow on mobile
          overflowX: 'hidden', // Prevent horizontal scrolling
          minHeight: 'calc(100vh - 70px)',
          backgroundColor: muiTheme.palette.background.default
        }}
      >
        {/* Data Source Warning Banner */}
        <DataSourceWarning />
        
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Outlet /> {/* Render child routes here */}
        </Box>
      </Box>
      
      {/* Onboarding Controller */}
      <OnboardingController />
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal />
      
      {/* Command Palette */}
      <CommandPalette />
    </Box>
  );
};

// Helper function to get current page title
const getCurrentPageTitle = (pathname) => {
  const pathMap = {
    '/dashboard': 'Dashboard',
    '/trades': 'Trade Journal',
    '/planning': 'Daily Planning',
    '/statistics': 'Trading Statistics',
    '/tradesage': 'TradeSage AI Assistant',
    '/cloud-sync': 'Cloud Synchronization',
    '/tradingview': 'TradingView Integration',
    '/settings': 'Settings',
    '/migration': 'Data Migration',
  };
  
  return pathMap[pathname] || 'TradeMR';
};

export default MainLayout;