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
  Notifications as NotificationsIcon,
  KeyboardCommandKey as CommandIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  WbSunny as LightModeIcon,
  DarkMode as DarkModeIcon,
  AccountCircle as AccountIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Leaderboard as LeaderboardIcon,
  TrendingUp as BacktestingIcon,
  Group as GroupIcon
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
    { text: 'Backtesting', icon: <BacktestingIcon />, path: '/backtesting' },
    { text: 'TradeSage AI', icon: <PsychologyIcon />, path: '/tradesage' },
    { text: 'Social Feed', icon: <GroupIcon />, path: '/social' },
    { text: 'Leaderboards', icon: <LeaderboardIcon />, path: '/leaderboards' },
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
  


  // Sample notifications (replace with real data in production)
  const notifications = [
    { id: 1, title: 'New Trading Plan', message: 'Time to create your daily trading plan', time: '5 minutes ago', read: false },
    { id: 2, title: 'Market Open', message: 'US markets are now open for trading', time: '2 hours ago', read: true },
    { id: 3, title: 'AI Insight', message: 'TradeSage found a pattern in your trades', time: 'Yesterday', read: true },
  ];
  

  
  // Market Status chip (demo)
  const MarketStatusChip = () => {
    // This would be fetched from an API in a real app
    const isMarketOpen = new Date().getHours() >= 9 && new Date().getHours() < 16;
    
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1,
        borderRadius: 3,
        background: isMarketOpen 
          ? `linear-gradient(135deg, ${alpha(muiTheme.palette.success.main, 0.1)} 0%, ${alpha(muiTheme.palette.success.main, 0.05)} 100%)`
          : `linear-gradient(135deg, ${alpha(muiTheme.palette.error.main, 0.1)} 0%, ${alpha(muiTheme.palette.error.main, 0.05)} 100%)`,
        border: `1px solid ${alpha(isMarketOpen ? muiTheme.palette.success.main : muiTheme.palette.error.main, 0.2)}`,
        backdropFilter: 'blur(8px)'
      }}>
        {isMarketOpen ? <TrendingUpIcon sx={{ mr: 1, fontSize: '1.1rem' }} /> : <TrendingDownIcon sx={{ mr: 1, fontSize: '1.1rem' }} />}
        <Typography sx={{
          fontWeight: 700,
          fontSize: '0.8rem',
          color: isMarketOpen ? muiTheme.palette.success.main : muiTheme.palette.error.main
        }}>
          {isMarketOpen ? "Market Open" : "Market Closed"}
        </Typography>
      </Box>
    );
  };
  
  // Drawer content
  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* App Logo & Title */}
      <Box 
        sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center',
          borderBottom: `1px solid ${alpha(muiTheme.palette.text.primary, 0.06)}`,
          background: `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.02)} 0%, ${alpha(muiTheme.palette.background.paper, 0.8)} 100%)`,
          backdropFilter: 'blur(8px)'
        }}
      >
        <Box 
          sx={{ 
            width: 48, 
            height: 48, 
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
            color: '#fff',
            mr: 2,
            fontWeight: 900,
            fontSize: '22px',
            letterSpacing: '-0.02em',
            boxShadow: `0 8px 20px ${alpha(muiTheme.palette.primary.main, 0.4)}`,
            border: `2px solid ${alpha('#fff', 0.2)}`
          }}
        >
          MR
        </Box>
        <Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 900, 
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              fontSize: '1.4rem',
              background: `linear-gradient(135deg, ${muiTheme.palette.text.primary} 0%, ${muiTheme.palette.primary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
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
        p: 3, 
        pb: 2, 
        borderBottom: `1px solid ${alpha(muiTheme.palette.text.primary, 0.06)}`,
        background: `linear-gradient(135deg, ${alpha(muiTheme.palette.background.paper, 0.6)} 0%, ${alpha(muiTheme.palette.background.default, 0.2)} 100%)`
      }}>
        <Typography variant="caption" sx={{ 
          color: alpha(muiTheme.palette.text.primary, 0.7),
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.08em',
          fontSize: '0.75rem'
        }}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Typography>
        
        <Box sx={{ 
          mt: 2, 
          display: 'flex', 
          alignItems: 'center',
          p: 1.5,
          borderRadius: 3,
          bgcolor: alpha(muiTheme.palette.text.primary, 0.03),
          border: `1px solid ${alpha(muiTheme.palette.text.primary, 0.06)}`,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          '&:hover': {
            bgcolor: alpha(muiTheme.palette.text.primary, 0.06),
            transform: 'translateY(-1px)',
            boxShadow: `0 8px 16px ${alpha(muiTheme.palette.text.primary, 0.08)}`
          }
        }}>
          <SearchIcon sx={{ color: alpha(muiTheme.palette.text.primary, 0.5), mr: 1.5, fontSize: '1.3rem' }} />
          <Typography sx={{ 
            color: alpha(muiTheme.palette.text.primary, 0.6),
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            Search...
          </Typography>
          <Box sx={{ 
            ml: 'auto', 
            bgcolor: alpha(muiTheme.palette.text.primary, 0.1),
            borderRadius: 1.5,
            px: 1,
            py: 0.3,
            fontSize: '0.7rem',
            fontWeight: 700,
            color: alpha(muiTheme.palette.text.primary, 0.8),
          }}>
            ⌘K
          </Box>
        </Box>
      </Box>
      
      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', pt: 1.5 }}>
        <Typography variant="caption" sx={{ 
          px: 3, 
          py: 2, 
          display: 'block',
          color: alpha(muiTheme.palette.text.primary, 0.7),
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.08em',
          fontSize: '0.75rem'
        }}>
          Main Navigation
        </Typography>
        
        <List component="nav" sx={{ px: 1.5 }}>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => navigateTo(item.path)}
                selected={location.pathname === item.path}
                sx={{ 
                  py: 1.5,
                  px: 2,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  background: location.pathname === item.path 
                    ? `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.08)} 0%, ${alpha(muiTheme.palette.primary.main, 0.12)} 100%)`
                    : 'transparent',
                  border: location.pathname === item.path 
                    ? `1px solid ${alpha(muiTheme.palette.primary.main, 0.2)}`
                    : '1px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  '&:hover': {
                    background: location.pathname === item.path 
                      ? `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.12)} 0%, ${alpha(muiTheme.palette.primary.main, 0.16)} 100%)`
                      : alpha(muiTheme.palette.text.primary, 0.04),
                    transform: 'translateX(4px)'
                  }
                }}
              >
                {location.pathname === item.path && (
                  <Box sx={{ 
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: '60%',
                    bgcolor: muiTheme.palette.primary.main,
                    borderRadius: '0 4px 4px 0',
                    boxShadow: `0 4px 8px ${alpha(muiTheme.palette.primary.main, 0.3)}`
                  }} />
                )}
                <ListItemIcon sx={{ 
                  minWidth: 44, 
                  color: location.pathname === item.path 
                    ? muiTheme.palette.primary.main 
                    : alpha(muiTheme.palette.text.primary, 0.7),
                  '& svg': {
                    fontSize: '1.3rem'
                  }
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname === item.path ? 700 : 600,
                    fontSize: '0.95rem',
                    letterSpacing: '0.01em'
                  }} 
                />
                {location.pathname === item.path && (
                  <Box sx={{ 
                    ml: 'auto', 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%',
                    bgcolor: muiTheme.palette.primary.main,
                    boxShadow: `0 2px 6px ${alpha(muiTheme.palette.primary.main, 0.4)}`
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

        </List>
      </Box>
      
      {/* User section */}
      <Box 
        sx={{ 
          p: 3, 
          borderTop: `1px solid ${alpha(muiTheme.palette.text.primary, 0.06)}`,
          background: `linear-gradient(135deg, ${alpha(muiTheme.palette.primary.main, 0.02)} 0%, ${alpha(muiTheme.palette.background.paper, 0.8)} 100%)`,
          backdropFilter: 'blur(12px)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48, 
              mr: 2,
              bgcolor: muiTheme.palette.primary.main,
              boxShadow: `0 8px 20px ${alpha(muiTheme.palette.primary.main, 0.4)}`,
              border: `2px solid ${alpha('#fff', 0.2)}`,
              fontWeight: 700,
              fontSize: '1.2rem'
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '1rem'
              }}
            >
              {user?.name || 'User'}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.8rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                opacity: 0.8
              }}
            >
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={handleUserMenuOpen}
            sx={{ 
              ml: 1,
              backgroundColor: alpha(muiTheme.palette.text.primary, 0.05),
              '&:hover': {
                backgroundColor: alpha(muiTheme.palette.text.primary, 0.1)
              }
            }}
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
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Tooltip title="Toggle light/dark mode">
            <IconButton 
              size="medium" 
              onClick={toggleMode}
              className="theme-toggle-icon"
              sx={{ 
                borderRadius: 2,
                backgroundColor: alpha(muiTheme.palette.text.primary, 0.06),
                border: `1px solid ${alpha(muiTheme.palette.text.primary, 0.08)}`,
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.text.primary, 0.12),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 8px ${alpha(muiTheme.palette.text.primary, 0.1)}`
                },
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              {muiTheme.palette.mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Keyboard shortcuts">
            <IconButton 
              size="medium" 
              onClick={() => showShortcutsModal(true)}
              sx={{ 
                borderRadius: 2,
                backgroundColor: alpha(muiTheme.palette.text.primary, 0.06),
                border: `1px solid ${alpha(muiTheme.palette.text.primary, 0.08)}`,
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.text.primary, 0.12),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 8px ${alpha(muiTheme.palette.text.primary, 0.1)}`
                },
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              <CommandIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <IconButton 
              size="medium" 
              onClick={handleNotificationMenuOpen}
              sx={{ 
                borderRadius: 2,
                backgroundColor: alpha(muiTheme.palette.text.primary, 0.06),
                border: `1px solid ${alpha(muiTheme.palette.text.primary, 0.08)}`,
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.text.primary, 0.12),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 8px ${alpha(muiTheme.palette.text.primary, 0.1)}`
                },
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
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
              size="medium" 
              onClick={handleLogout}
              sx={{ 
                borderRadius: 2,
                backgroundColor: alpha(muiTheme.palette.error.main, 0.08),
                border: `1px solid ${alpha(muiTheme.palette.error.main, 0.12)}`,
                color: muiTheme.palette.error.main,
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.error.main, 0.16),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 8px ${alpha(muiTheme.palette.error.main, 0.2)}`
                },
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
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
          backgroundColor: alpha(muiTheme.palette.background.paper, 0.9),
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(muiTheme.palette.text.primary, 0.06)}`,
          boxShadow: `0 4px 20px ${alpha(muiTheme.palette.text.primary, 0.03)}`
        }}
      >
        <Toolbar sx={{ 
          justifyContent: 'space-between',
          height: 72,
          px: { xs: 2, sm: 3 }
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
                variant="h5" 
                sx={{ 
                  fontWeight: 800,
                  display: { xs: 'none', sm: 'block' },
                  fontSize: '1.5rem',
                  background: `linear-gradient(135deg, ${muiTheme.palette.text.primary} 0%, ${alpha(muiTheme.palette.primary.main, 0.8)} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.01em'
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
              size="medium"
              sx={{ 
                height: 40,
                px: 3,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '0.9rem',
                background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
                boxShadow: `0 6px 16px ${alpha(muiTheme.palette.primary.main, 0.3)}`,
                display: { xs: 'none', md: 'flex' },
                '&:hover': {
                  boxShadow: `0 8px 20px ${alpha(muiTheme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
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
          marginTop: '72px', // Height of the AppBar
          maxWidth: '100%', // Ensure content doesn't overflow on mobile
          overflowX: 'hidden', // Prevent horizontal scrolling
          minHeight: 'calc(100vh - 72px)',
          backgroundColor: muiTheme.palette.background.default,
          position: 'relative'
        }}
      >
        {/* Background gradient overlay */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: `linear-gradient(180deg, ${alpha(muiTheme.palette.primary.main, 0.01)} 0%, transparent 100%)`,
          pointerEvents: 'none'
        }} />
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
    '/backtesting': 'Strategy Backtesting',
    '/tradesage': 'TradeSage AI Assistant',
    '/leaderboards': 'Trading Leaderboards',
    '/social': 'Social Trading Feed',
    '/analytics': 'Professional Analytics',
    '/cloud-sync': 'Cloud Synchronization',
    '/tradingview': 'TradingView Integration',
    '/settings': 'Settings',
    '/migration': 'Data Migration',
  };
  
  return pathMap[pathname] || 'TradeMR';
};

export default MainLayout;