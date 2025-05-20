import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  FormControlLabel,
  Switch,
  Paper,
  Tooltip,
  useTheme,
  alpha,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Snackbar,
  Alert
} from '@mui/material';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  DragIndicator as DragIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  MoreVert as MoreIcon,
  Cached as ResetIcon,
  ViewList as LayoutIcon,
  GridView as GridViewIcon,
  ViewCompact as CompactIcon,
  CastConnected as LoadingIcon
} from '@mui/icons-material';

// React-Grid-Layout with width provider
const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * CustomizableDashboard Component - A flexible dashboard with draggable/resizable widgets
 * 
 * Features:
 * - Drag and drop widgets to rearrange
 * - Resize widgets
 * - Add/remove widgets
 * - Save dashboard layouts
 * - Responsive design
 * - Widget menu and settings
 */
const CustomizableDashboard = ({
  availableWidgets = [],
  onLayoutChange,
  onSettingChange,
  onRefreshWidget,
  savedLayouts = null,
  defaultLayout = {}
}) => {
  const theme = useTheme();
  
  // State management
  const [layouts, setLayouts] = useState(savedLayouts || defaultLayout);
  const [activeWidgets, setActiveWidgets] = useState([]);
  const [widgetMenuAnchor, setWidgetMenuAnchor] = useState(null);
  const [addWidgetDialogOpen, setAddWidgetDialogOpen] = useState(false);
  const [widgetSettingsDialogOpen, setWidgetSettingsDialogOpen] = useState(false);
  const [currentWidgetSettings, setCurrentWidgetSettings] = useState(null);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [isCompact, setIsCompact] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Breakpoint configuration
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 };
  
  // Initialize active widgets from saved layouts
  useEffect(() => {
    if (savedLayouts) {
      // Extract widget ids from layouts
      const widgetIds = [];
      Object.keys(savedLayouts).forEach(breakpoint => {
        savedLayouts[breakpoint].forEach(widget => {
          if (!widgetIds.includes(widget.i)) {
            widgetIds.push(widget.i);
          }
        });
      });
      
      // Map ids to widget objects from available widgets
      const initialWidgets = widgetIds
        .map(id => availableWidgets.find(widget => widget.id === id))
        .filter(Boolean);
      
      setActiveWidgets(initialWidgets);
    } else {
      // Default to first 4 widgets or all if less than 4
      setActiveWidgets(availableWidgets.slice(0, Math.min(4, availableWidgets.length)));
    }
  }, [savedLayouts, availableWidgets]);
  
  // Generate layout from active widgets if no saved layout
  useEffect(() => {
    if (!savedLayouts && activeWidgets.length > 0) {
      generateDefaultLayout();
    }
  }, [activeWidgets]);
  
  // Generate a default layout for current active widgets
  const generateDefaultLayout = () => {
    const newLayouts = {
      lg: [],
      md: [],
      sm: [],
      xs: []
    };
    
    // Default widget dimensions and positions
    const defaultSizes = {
      small: { w: 3, h: 2 },
      medium: { w: 6, h: 4 },
      large: { w: 12, h: 6 }
    };
    
    let column = 0;
    let row = 0;
    
    // Create layout entries for each widget
    activeWidgets.forEach((widget, index) => {
      const size = widget.defaultSize || 'medium';
      const dimensions = defaultSizes[size];
      
      // Calculate position based on size
      if (column + dimensions.w > 12) {
        column = 0;
        row += dimensions.h;
      }
      
      // Create layout item
      const layoutItem = {
        i: widget.id,
        x: column,
        y: row,
        w: dimensions.w,
        h: dimensions.h,
        minW: widget.minWidth || 2,
        minH: widget.minHeight || 2,
        maxW: widget.maxWidth || 12,
        maxH: widget.maxHeight || 12
      };
      
      // Add to layouts
      newLayouts.lg.push(layoutItem);
      newLayouts.md.push({...layoutItem, w: Math.min(dimensions.w, 12)});
      newLayouts.sm.push({...layoutItem, x: 0, w: 6});
      newLayouts.xs.push({...layoutItem, x: 0, w: 4});
      
      // Update column position
      column += dimensions.w;
    });
    
    setLayouts(newLayouts);
  };
  
  // Handle layout changes from grid
  const handleLayoutChange = (currentLayout, allLayouts) => {
    setLayouts(allLayouts);
    
    if (onLayoutChange) {
      onLayoutChange(allLayouts);
    }
  };
  
  // Add a widget to the dashboard
  const handleAddWidget = (widget) => {
    setActiveWidgets(prev => [...prev, widget]);
    setAddWidgetDialogOpen(false);
    
    // Show feedback
    showSnackbar(`Added ${widget.title} widget to dashboard`, 'success');
  };
  
  // Remove a widget from the dashboard
  const handleRemoveWidget = (widgetId) => {
    // Find widget to get its title for the notification
    const widget = activeWidgets.find(w => w.id === widgetId);
    
    setActiveWidgets(prev => prev.filter(w => w.id !== widgetId));
    
    // Show feedback
    if (widget) {
      showSnackbar(`Removed ${widget.title} widget from dashboard`, 'info');
    }
  };
  
  // Open widget settings dialog
  const handleOpenWidgetSettings = (widgetId) => {
    const widget = activeWidgets.find(w => w.id === widgetId);
    if (widget && widget.settings) {
      setCurrentWidgetSettings(widget);
      setWidgetSettingsDialogOpen(true);
    }
  };
  
  // Save widget settings
  const handleSaveWidgetSettings = () => {
    if (currentWidgetSettings && onSettingChange) {
      onSettingChange(currentWidgetSettings.id, currentWidgetSettings.settings);
      setWidgetSettingsDialogOpen(false);
      
      // Show feedback
      showSnackbar(`Updated settings for ${currentWidgetSettings.title} widget`, 'success');
    }
  };
  
  // Handle widget setting change
  const handleWidgetSettingChange = (setting, value) => {
    setCurrentWidgetSettings(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
      }
    }));
  };
  
  // Reset dashboard to default
  const handleResetDashboard = () => {
    setActiveWidgets(availableWidgets.slice(0, Math.min(4, availableWidgets.length)));
    setLayouts(defaultLayout);
    
    if (onLayoutChange) {
      onLayoutChange(defaultLayout);
    }
    
    // Show feedback
    showSnackbar('Dashboard reset to default layout', 'info');
  };
  
  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // Get widget component by widget type
  const getWidgetComponent = (widget) => {
    if (!widget) return null;
    
    // If widget has its own render method, use that
    if (widget.renderWidget) {
      return widget.renderWidget({
        settings: widget.settings,
        onRefresh: () => handleRefreshWidget(widget.id)
      });
    }
    
    // Otherwise render a default container with widget.component
    return (
      <Box sx={{ height: '100%', p: 2 }}>
        {widget.component ? (
          <widget.component settings={widget.settings} />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%'
          }}>
            <LoadingIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.primary, 0.2), mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Widget content unavailable
            </Typography>
          </Box>
        )}
      </Box>
    );
  };
  
  // Refresh a specific widget
  const handleRefreshWidget = (widgetId) => {
    if (onRefreshWidget) {
      onRefreshWidget(widgetId);
    }
    
    // Show feedback
    const widget = activeWidgets.find(w => w.id === widgetId);
    if (widget) {
      showSnackbar(`Refreshed ${widget.title} widget`, 'info');
    }
  };
  
  // Generate the widget header component
  const WidgetHeader = ({ widget }) => {
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    // Open widget menu
    const handleOpenMenu = (event) => {
      event.stopPropagation();
      setMenuAnchorEl(event.currentTarget);
    };
    
    // Close widget menu
    const handleCloseMenu = () => {
      setMenuAnchorEl(null);
    };
    
    // Toggle fullscreen
    const toggleFullscreen = () => {
      setIsFullscreen(!isFullscreen);
      handleCloseMenu();
    };
    
    return (
      <>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            px: 2, 
            py: 1.5,
            borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            backdropFilter: 'blur(8px)',
            cursor: isDragging || editMode ? 'move' : 'default',
            '& .widget-drag-handle': {
              visibility: editMode ? 'visible' : 'hidden',
              opacity: editMode ? 1 : 0,
              transition: 'opacity 0.2s, visibility 0.2s'
            },
            '&:hover .widget-drag-handle': {
              visibility: 'visible',
              opacity: 0.7
            }
          }}
          className="widget-header"
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {editMode && (
              <DragIcon
                className="widget-drag-handle"
                sx={{ 
                  mr: 1, 
                  fontSize: 20, 
                  color: alpha(theme.palette.text.primary, 0.5),
                  cursor: 'move'
                }}
              />
            )}
            {widget.icon && (
              <Box component="span" sx={{ mr: 1.5, color: widget.iconColor || theme.palette.primary.main }}>
                {widget.icon}
              </Box>
            )}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {widget.title}
            </Typography>
          </Box>
          
          <Box>
            {widget.refreshable && (
              <Tooltip title="Refresh widget">
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRefreshWidget(widget.id);
                  }}
                  sx={{ mr: 0.5 }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Widget menu">
              <IconButton 
                size="small" 
                onClick={handleOpenMenu}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
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
              border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
              borderRadius: 2
            }
          }}
        >
          {widget.refreshable && (
            <MenuItem onClick={() => {
              handleRefreshWidget(widget.id);
              handleCloseMenu();
            }}>
              <RefreshIcon fontSize="small" sx={{ mr: 1.5 }} />
              Refresh
            </MenuItem>
          )}
          
          {widget.settings && (
            <MenuItem onClick={() => {
              handleOpenWidgetSettings(widget.id);
              handleCloseMenu();
            }}>
              <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
              Widget Settings
            </MenuItem>
          )}
          
          <MenuItem onClick={toggleFullscreen}>
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
          
          <MenuItem onClick={() => {
            handleRemoveWidget(widget.id);
            handleCloseMenu();
          }} sx={{ color: theme.palette.error.main }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
            Remove Widget
          </MenuItem>
        </Menu>
      </>
    );
  };
  
  // Render the dashboard
  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {/* Dashboard Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DashboardIcon 
            sx={{ 
              fontSize: 28, 
              mr: 1.5, 
              color: theme.palette.primary.main 
            }} 
          />
          <Typography variant="h5" fontWeight={700}>
            Dashboard
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant={editMode ? "contained" : "outlined"}
            size="small"
            onClick={() => setEditMode(!editMode)}
            startIcon={editMode ? <GridViewIcon /> : <LayoutIcon />}
            sx={{ 
              fontWeight: 600,
              borderRadius: 6,
              borderWidth: '1.5px',
              boxShadow: editMode ? 2 : 0
            }}
          >
            {editMode ? 'Done Editing' : 'Edit Layout'}
          </Button>
          
          {editMode && (
            <>
              <Tooltip title="Toggle compact mode">
                <IconButton 
                  size="small" 
                  onClick={() => setIsCompact(!isCompact)}
                  color={isCompact ? "primary" : "default"}
                  sx={{ 
                    border: `1.5px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                    borderRadius: 6
                  }}
                >
                  <CompactIcon />
                </IconButton>
              </Tooltip>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => setAddWidgetDialogOpen(true)}
                startIcon={<AddIcon />}
                sx={{ 
                  fontWeight: 600,
                  borderRadius: 6,
                  borderWidth: '1.5px'
                }}
              >
                Add Widget
              </Button>
              
              <Tooltip title="Reset Dashboard">
                <IconButton 
                  size="small" 
                  onClick={handleResetDashboard}
                  sx={{ 
                    border: `1.5px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                    borderRadius: 6
                  }}
                >
                  <ResetIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
      
      {/* Edit Mode Banner */}
      {editMode && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.info.main, 0.1),
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon 
              sx={{ 
                color: theme.palette.info.main, 
                mr: 1.5 
              }} 
            />
            <Typography variant="body2" color="info.main" fontWeight={500}>
              Edit mode active. Drag widgets to reposition or resize them.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            color="info"
            onClick={() => setEditMode(false)}
            sx={{ borderRadius: 6, fontWeight: 600 }}
          >
            Done
          </Button>
        </Paper>
      )}
      
      {/* Dashboard Grid */}
      <Box
        sx={{
          '& .react-grid-item.react-grid-placeholder': {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            borderRadius: 3,
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.5)}`
          },
          '& .react-grid-item': {
            transition: isDragging ? 'none' : 'all 200ms ease',
            transitionProperty: isDragging ? 'none' : 'left, top, width, height'
          },
          '& .react-resizable-handle': {
            display: editMode ? 'block' : 'none'
          }
        }}
      >
        {activeWidgets.length > 0 ? (
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={breakpoints}
            cols={cols}
            rowHeight={80}
            isDraggable={editMode}
            isResizable={editMode}
            compactType={isCompact ? 'vertical' : null}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            onDragStart={() => setIsDragging(true)}
            onDragStop={() => setIsDragging(false)}
            onLayoutChange={handleLayoutChange}
          >
            {activeWidgets.map(widget => (
              <Box 
                key={widget.id} 
                sx={{ 
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: editMode ? 2 : 0,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  transform: editMode ? 'translateY(-2px)' : 'none',
                  height: '100%',
                  '&:hover': {
                    boxShadow: editMode ? 4 : 1
                  }
                }}
              >
                <WidgetHeader widget={widget} />
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    overflow: 'auto',
                    position: 'relative'
                  }}
                >
                  {getWidgetComponent(widget)}
                </Box>
              </Box>
            ))}
          </ResponsiveGridLayout>
        ) : (
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              textAlign: 'center', 
              borderRadius: 3,
              border: `1px dashed ${alpha(theme.palette.text.primary, 0.2)}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.6)
            }}
          >
            <DashboardIcon 
              sx={{ 
                fontSize: 48, 
                color: alpha(theme.palette.text.primary, 0.2),
                mb: 2
              }} 
            />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              No widgets added
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your dashboard is empty. Add widgets to customize your experience.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setAddWidgetDialogOpen(true)}
              startIcon={<AddIcon />}
              sx={{ 
                mt: 1,
                fontWeight: 600,
                borderRadius: 8,
                px: 3
              }}
            >
              Add Widgets
            </Button>
          </Paper>
        )}
      </Box>
      
      {/* Add Widget Dialog */}
      <Dialog
        open={addWidgetDialogOpen}
        onClose={() => setAddWidgetDialogOpen(false)}
        maxWidth="md"
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AddIcon sx={{ mr: 1 }} />
            Add Widgets
          </Box>
          <IconButton 
            edge="end" 
            onClick={() => setAddWidgetDialogOpen(false)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {availableWidgets
              .filter(widget => !activeWidgets.some(w => w.id === widget.id))
              .map(widget => (
                <Grid item xs={12} sm={6} md={4} key={widget.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                    onClick={() => handleAddWidget(widget)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      {widget.icon && (
                        <Box 
                          sx={{ 
                            mr: 1.5, 
                            p: 1, 
                            borderRadius: '50%',
                            backgroundColor: alpha(widget.iconColor || theme.palette.primary.main, 0.1),
                            color: widget.iconColor || theme.palette.primary.main
                          }}
                        >
                          {widget.icon}
                        </Box>
                      )}
                      <Typography variant="subtitle1" fontWeight={600}>
                        {widget.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 'auto' }}>
                      {widget.description}
                    </Typography>
                    <Button
                      variant="text"
                      startIcon={<AddIcon />}
                      sx={{ mt: 2, alignSelf: 'flex-start', fontWeight: 600 }}
                    >
                      Add to Dashboard
                    </Button>
                  </Paper>
                </Grid>
              ))}
            
            {availableWidgets.filter(widget => !activeWidgets.some(w => w.id === widget.id)).length === 0 && (
              <Grid item xs={12}>
                <Box 
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                    border: `1px dashed ${alpha(theme.palette.text.primary, 0.2)}`
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    All Available Widgets Are Added
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You've already added all available widgets to your dashboard.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setAddWidgetDialogOpen(false)}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Widget Settings Dialog */}
      {currentWidgetSettings && (
        <Dialog
          open={widgetSettingsDialogOpen}
          onClose={() => setWidgetSettingsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            elevation: 0,
            sx: {
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
            }
          }}
        >
          <DialogTitle 
            sx={{ 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SettingsIcon sx={{ mr: 1 }} />
              {currentWidgetSettings.title} Settings
            </Box>
            <IconButton 
              edge="end" 
              onClick={() => setWidgetSettingsDialogOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {/* Render settings based on widget settings schema */}
            {currentWidgetSettings.settingsSchema && (
              <Box sx={{ p: 1 }}>
                {currentWidgetSettings.settingsSchema.map((setting) => {
                  // Render different input types based on setting type
                  switch (setting.type) {
                    case 'boolean':
                      return (
                        <FormControlLabel
                          key={setting.key}
                          control={
                            <Switch 
                              checked={currentWidgetSettings.settings[setting.key] || false} 
                              onChange={(e) => handleWidgetSettingChange(setting.key, e.target.checked)}
                              color="primary"
                            />
                          }
                          label={setting.label}
                          sx={{ mb: 2, display: 'block' }}
                        />
                      );
                    // Add more setting types as needed
                    default:
                      return null;
                  }
                })}
              </Box>
            )}
            
            {!currentWidgetSettings.settingsSchema && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No configurable settings available for this widget.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={() => setWidgetSettingsDialogOpen(false)}
              color="inherit"
              sx={{ fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveWidgetSettings}
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{ fontWeight: 600 }}
            >
              Save Settings
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ 
            width: '100%',
            boxShadow: 3,
            borderRadius: 2
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomizableDashboard;