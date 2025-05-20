import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';

/**
 * Base Widget component that provides common functionality for all dashboard widgets
 * 
 * Features:
 * - Widget header with title, icon, and actions
 * - Context menu for widget actions (refresh, settings, fullscreen, remove)
 * - Loading and error states
 * - Standardized styling and layout
 */
const Widget = ({
  title,
  icon,
  iconColor,
  children,
  onRefresh,
  onRemove,
  onConfigure,
  isLoading = false,
  error = null,
  hasSettings = false,
  refreshable = true,
  isDraggable = false,
  className,
  height,
  ...props
}) => {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Handle opening and closing the context menu
  const handleOpenMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };
  
  // Toggle fullscreen state
  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    handleCloseMenu();
  };
  
  // Handle refresh action
  const handleRefresh = (e) => {
    e.stopPropagation();
    if (onRefresh) {
      onRefresh();
    }
    handleCloseMenu();
  };
  
  // Handle configuration action
  const handleConfigure = () => {
    if (onConfigure) {
      onConfigure();
    }
    handleCloseMenu();
  };
  
  // Handle remove action
  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    handleCloseMenu();
  };
  
  return (
    <Box
      className={`widget ${className || ''}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: height || '100%',
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: isHovered ? 1 : 0,
        transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        backgroundColor: theme.palette.background.paper,
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 1300 : 'auto',
        width: isFullscreen ? '100%' : 'auto',
        height: isFullscreen ? '100%' : 'auto',
        ...props.sx
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Widget Header */}
      <Box
        className="widget-header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          backgroundColor: alpha(theme.palette.background.default, 0.5),
          backdropFilter: 'blur(8px)',
          cursor: isDraggable ? 'move' : 'default'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isDraggable && (
            <DragIcon
              sx={{
                mr: 1.5,
                color: alpha(theme.palette.text.primary, 0.5),
                visibility: isHovered || isDraggable ? 'visible' : 'hidden',
                opacity: isHovered || isDraggable ? 0.7 : 0,
                transition: 'opacity 0.2s',
                cursor: 'move'
              }}
            />
          )}
          
          {icon && (
            <Box
              sx={{
                mr: 1.5,
                color: iconColor || theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </Box>
          )}
          
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {title}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {refreshable && (
            <Tooltip title="Refresh">
              <IconButton
                size="small"
                onClick={handleRefresh}
                sx={{ mr: 0.5 }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="More options">
            <IconButton
              size="small"
              onClick={handleOpenMenu}
            >
              <MoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Widget Content */}
      <Box
        className="widget-content"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          position: 'relative',
          p: 2
        }}
      >
        {/* Loading State */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(4px)',
              zIndex: 10
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div className="spinner" />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Loading...
              </Typography>
            </Box>
          </Box>
        )}
        
        {/* Error State */}
        {error && (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 3
            }}
          >
            <Box>
              <Typography
                variant="body1"
                color="error"
                sx={{ mb: 1, fontWeight: 500 }}
              >
                {typeof error === 'string' ? error : 'An error occurred'}
              </Typography>
              
              {refreshable && (
                <Tooltip title="Try again">
                  <IconButton
                    size="small"
                    onClick={handleRefresh}
                    color="primary"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        )}
        
        {/* Widget Content */}
        {!error && children}
      </Box>
      
      {/* Widget Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 2,
          sx: {
            minWidth: 180,
            mt: 1,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 2
          }
        }}
      >
        {refreshable && (
          <MenuItem onClick={handleRefresh}>
            <RefreshIcon fontSize="small" sx={{ mr: 1.5 }} />
            Refresh
          </MenuItem>
        )}
        
        {hasSettings && (
          <MenuItem onClick={handleConfigure}>
            <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
            Settings
          </MenuItem>
        )}
        
        <MenuItem onClick={handleToggleFullscreen}>
          {isFullscreen ? (
            <>
              <FullscreenExitIcon fontSize="small" sx={{ mr: 1.5 }} />
              Exit Fullscreen
            </>
          ) : (
            <>
              <FullscreenIcon fontSize="small" sx={{ mr: 1.5 }} />
              Fullscreen
            </>
          )}
        </MenuItem>
        
        <Divider sx={{ my: 1 }} />
        
        <MenuItem
          onClick={handleRemove}
          sx={{ color: theme.palette.error.main }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
          Remove Widget
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Widget;