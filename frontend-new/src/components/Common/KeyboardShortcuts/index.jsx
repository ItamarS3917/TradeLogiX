import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  IconButton,
  Divider,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  Fade,
  InputBase,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ButtonBase,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Keyboard as KeyboardIcon,
  Dashboard as DashboardIcon,
  LibraryBooks as LibraryBooksIcon,
  EventNote as EventNoteIcon,
  AssessmentIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Fullscreen as FullscreenIcon,
  Help as HelpIcon,
  KeyboardCommandKey as CommandIcon,
  KeyboardTab as TabIcon,
  ArrowRightAlt as ArrowRightIcon,
  Psychology as PsychologyIcon,
  Bolt as LightningIcon,
  CheckCircleOutline as CheckIcon,
  KeyboardReturn as EnterIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Keyboard Shortcuts System - Comprehensive keyboard navigation support
 * 
 * Features:
 * - Global keyboard shortcuts
 * - Command palette for quick actions
 * - Keyboard shortcuts help modal
 * - Focus management for keyboard navigation
 * - Shortcut customization
 */

// Keyboard shortcut context
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const KeyboardShortcutsContext = createContext();

/**
 * KeyboardShortcutsProvider - Provider for keyboard shortcuts functionality
 */
export const KeyboardShortcutsProvider = ({ children }) => {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [registeredShortcuts, setRegisteredShortcuts] = useState([]);
  const [activeShortcuts, setActiveShortcuts] = useState({});
  
  // Register a keyboard shortcut
  const registerShortcut = (id, keys, callback, description, category = 'General') => {
    // Check if shortcut already exists
    const existingIndex = registeredShortcuts.findIndex(s => s.id === id);
    
    if (existingIndex >= 0) {
      // Update existing shortcut
      const updatedShortcuts = [...registeredShortcuts];
      updatedShortcuts[existingIndex] = { 
        id, 
        keys, 
        callback, 
        description, 
        category,
        isActive: true
      };
      setRegisteredShortcuts(updatedShortcuts);
    } else {
      // Add new shortcut
      setRegisteredShortcuts(prev => [
        ...prev,
        { id, keys, callback, description, category, isActive: true }
      ]);
    }
    
    // Add to active shortcuts
    setActiveShortcuts(prev => ({
      ...prev,
      [id]: { keys, callback }
    }));
  };
  
  // Unregister a keyboard shortcut
  const unregisterShortcut = (id) => {
    setRegisteredShortcuts(prev => prev.filter(shortcut => shortcut.id !== id));
    
    // Remove from active shortcuts
    const updatedActiveShortcuts = { ...activeShortcuts };
    delete updatedActiveShortcuts[id];
    setActiveShortcuts(updatedActiveShortcuts);
  };
  
  // Enable/disable shortcut
  const toggleShortcut = (id, isActive) => {
    setRegisteredShortcuts(prev => 
      prev.map(shortcut => 
        shortcut.id === id 
          ? { ...shortcut, isActive } 
          : shortcut
      )
    );
    
    // Update active shortcuts
    if (isActive) {
      const shortcut = registeredShortcuts.find(s => s.id === id);
      if (shortcut) {
        setActiveShortcuts(prev => ({
          ...prev,
          [id]: { keys: shortcut.keys, callback: shortcut.callback }
        }));
      }
    } else {
      const updatedActiveShortcuts = { ...activeShortcuts };
      delete updatedActiveShortcuts[id];
      setActiveShortcuts(updatedActiveShortcuts);
    }
  };
  
  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || 
          e.target.tagName === 'TEXTAREA' || 
          e.target.isContentEditable) {
        return;
      }
      
      // Command Palette: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
        return;
      }
      
      // Shortcuts Help: Cmd/Ctrl + /
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }
      
      // Check all registered shortcuts
      for (const id in activeShortcuts) {
        const { keys, callback } = activeShortcuts[id];
        
        // Parse key combination
        const keyCombo = parseKeyCombo(keys);
        
        // Check if the key combination matches
        if (matchesKeyCombo(e, keyCombo)) {
          e.preventDefault();
          callback();
          return;
        }
      }
    };
    
    // Parse key combination string into parts
    function parseKeyCombo(keysStr) {
      const parts = keysStr.split('+').map(part => part.trim().toLowerCase());
      
      return {
        alt: parts.includes('alt'),
        ctrl: parts.includes('ctrl'),
        shift: parts.includes('shift'),
        meta: parts.includes('cmd') || parts.includes('meta'),
        key: parts.filter(part => 
          !['alt', 'ctrl', 'shift', 'cmd', 'meta'].includes(part)
        )[0]
      };
    }
    
    // Check if an event matches a key combination
    function matchesKeyCombo(event, combo) {
      return event.altKey === combo.alt &&
             event.ctrlKey === combo.ctrl &&
             event.shiftKey === combo.shift &&
             event.metaKey === combo.meta &&
             event.key.toLowerCase() === combo.key;
    }
    
    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeShortcuts]);
  
  // Register default shortcuts
  useEffect(() => {
    // These would typically be registered by individual components
    // This is here for demonstration purposes
    registerShortcut(
      'dashboard',
      'g+d',
      () => window.navigate && window.navigate('/dashboard'),
      'Go to Dashboard',
      'Navigation'
    );
    
    registerShortcut(
      'trades',
      'g+t',
      () => window.navigate && window.navigate('/trades'),
      'Go to Trades',
      'Navigation'
    );
    
    registerShortcut(
      'planning',
      'g+p',
      () => window.navigate && window.navigate('/planning'),
      'Go to Planning',
      'Navigation'
    );
    
    registerShortcut(
      'statistics',
      'g+s',
      () => window.navigate && window.navigate('/statistics'),
      'Go to Statistics',
      'Navigation'
    );
    
    registerShortcut(
      'new-trade',
      'n',
      () => window.navigate && window.navigate('/trades/new'),
      'New Trade',
      'Actions'
    );
    
    registerShortcut(
      'refresh',
      'r',
      () => window.location.reload(),
      'Refresh Page',
      'General'
    );
    
    registerShortcut(
      'search',
      '/',
      () => document.querySelector('#search-input')?.focus(),
      'Focus Search',
      'General'
    );
    
    registerShortcut(
      'settings',
      'g+o',
      () => window.navigate && window.navigate('/settings'),
      'Open Settings',
      'Navigation'
    );
    
    registerShortcut(
      'help',
      '?',
      () => setShowShortcutsModal(true),
      'Show Keyboard Shortcuts',
      'Help'
    );
  }, []);
  
  // Context value
  const contextValue = {
    showShortcutsModal,
    setShowShortcutsModal,
    showCommandPalette,
    setShowCommandPalette,
    registeredShortcuts,
    registerShortcut,
    unregisterShortcut,
    toggleShortcut
  };
  
  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}
      <KeyboardShortcutsModal 
        open={showShortcutsModal} 
        onClose={() => setShowShortcutsModal(false)}
        shortcuts={registeredShortcuts}
        onToggleShortcut={toggleShortcut}
      />
      <CommandPalette
        open={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        shortcuts={registeredShortcuts}
      />
    </KeyboardShortcutsContext.Provider>
  );
};

// Custom hook for using the keyboard shortcuts context
export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error(
      'useKeyboardShortcuts must be used within a KeyboardShortcutsProvider'
    );
  }
  return context;
};

/**
 * KeyboardShortcutsModal - Displays all available keyboard shortcuts
 */
export const KeyboardShortcutsModal = ({ 
  open, 
  onClose,
  shortcuts = [],
  onToggleShortcut
}) => {
  const theme = useTheme();
  
  // Group shortcuts by category
  const groupedShortcuts = {};
  shortcuts.forEach(shortcut => {
    if (!groupedShortcuts[shortcut.category]) {
      groupedShortcuts[shortcut.category] = [];
    }
    groupedShortcuts[shortcut.category].push(shortcut);
  });
  
  // Render key combination
  const renderKeyCombo = (keysStr) => {
    const keys = keysStr.split('+').map(key => key.trim());
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 32,
                height: 24,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.text.primary, 0.08),
                border: `1px solid ${alpha(theme.palette.text.primary, 0.15)}`,
                color: theme.palette.text.primary,
                fontSize: '0.75rem',
                fontWeight: 700,
                px: 1,
                fontFamily: 'monospace'
              }}
            >
              {key.toUpperCase() === 'CMD' ? '⌘' : 
               key.toUpperCase() === 'SHIFT' ? '⇧' : 
               key.toUpperCase() === 'ALT' ? '⌥' : 
               key.toUpperCase() === 'CTRL' ? 'CTRL' : 
               key.toUpperCase()}
            </Box>
            {index < keys.length - 1 && (
              <Box 
                component="span" 
                sx={{ 
                  mx: 0.5, 
                  color: alpha(theme.palette.text.primary, 0.5) 
                }}
              >
                +
              </Box>
            )}
          </React.Fragment>
        ))}
      </Box>
    );
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <KeyboardIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Keyboard Shortcuts
          </Typography>
        </Box>
        <IconButton edge="end" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" paragraph>
            Use these keyboard shortcuts to navigate quickly and efficiently through the application.
          </Typography>
          
          {Object.keys(groupedShortcuts).length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No keyboard shortcuts available
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <Grid item xs={12} md={6} key={category}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        pb: 1,
                        borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`
                      }}
                    >
                      {category}
                    </Typography>
                    
                    <Box component="ul" sx={{ 
                      listStyle: 'none', 
                      p: 0, 
                      m: 0
                    }}>
                      {categoryShortcuts.map(shortcut => (
                        <Box 
                          component="li" 
                          key={shortcut.id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 1.5,
                            borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
                            '&:last-child': {
                              borderBottom: 'none'
                            }
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {shortcut.description}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {renderKeyCombo(shortcut.keys)}
                            
                            {onToggleShortcut && (
                              <Tooltip title={shortcut.isActive ? 'Disable shortcut' : 'Enable shortcut'}>
                                <Chip
                                  label={shortcut.isActive ? 'Active' : 'Disabled'}
                                  size="small"
                                  color={shortcut.isActive ? 'success' : 'default'}
                                  onClick={() => onToggleShortcut(shortcut.id, !shortcut.isActive)}
                                  sx={{ ml: 1.5, height: 24 }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 8, fontWeight: 600 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * CommandPalette - Fast action launcher similar to Spotlight/VS Code Palette
 */
export const CommandPalette = ({ 
  open, 
  onClose,
  shortcuts = [] 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCommands, setFilteredCommands] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  
  // Default commands (could be extended with dynamic commands)
  const defaultCommands = [
    {
      id: 'goto-dashboard',
      title: 'Go to Dashboard',
      keywords: ['dashboard', 'home', 'overview'],
      icon: <DashboardIcon />,
      action: () => {
        navigate('/dashboard');
        onClose();
      }
    },
    {
      id: 'goto-trades',
      title: 'Go to Trades',
      keywords: ['trades', 'journal', 'history'],
      icon: <LibraryBooksIcon />,
      action: () => {
        navigate('/trades');
        onClose();
      }
    },
    {
      id: 'goto-planning',
      title: 'Go to Planning',
      keywords: ['planning', 'plan', 'prepare'],
      icon: <EventNoteIcon />,
      action: () => {
        navigate('/planning');
        onClose();
      }
    },
    {
      id: 'goto-statistics',
      title: 'Go to Statistics',
      keywords: ['statistics', 'stats', 'analytics', 'charts'],
      icon: <AssessmentIcon />,
      action: () => {
        navigate('/statistics');
        onClose();
      }
    },
    {
      id: 'goto-tradesage',
      title: 'Go to TradeSage AI',
      keywords: ['ai', 'assistant', 'help', 'insights'],
      icon: <PsychologyIcon />,
      action: () => {
        navigate('/tradesage');
        onClose();
      }
    },
    {
      id: 'new-trade',
      title: 'Create New Trade',
      keywords: ['new', 'create', 'add', 'trade', 'entry'],
      icon: <AddIcon />,
      action: () => {
        navigate('/trades/new');
        onClose();
      }
    },
    {
      id: 'refresh-page',
      title: 'Refresh Page',
      keywords: ['refresh', 'reload', 'update'],
      icon: <RefreshIcon />,
      action: () => {
        window.location.reload();
        onClose();
      }
    },
    {
      id: 'goto-settings',
      title: 'Open Settings',
      keywords: ['settings', 'preferences', 'options', 'config'],
      icon: <SettingsIcon />,
      action: () => {
        navigate('/settings');
        onClose();
      }
    }
  ];
  
  // Convert shortcuts to commands
  const shortcutCommands = shortcuts.map(shortcut => ({
    id: shortcut.id,
    title: shortcut.description,
    keywords: [shortcut.description.toLowerCase()],
    icon: getIconForCategory(shortcut.category),
    keys: shortcut.keys,
    action: shortcut.callback,
    category: shortcut.category
  }));
  
  // Combine all commands
  const allCommands = [...defaultCommands, ...shortcutCommands];
  
  // Get icon for category
  function getIconForCategory(category) {
    switch (category) {
      case 'Navigation':
        return <ArrowRightIcon />;
      case 'Actions':
        return <LightningIcon />;
      case 'General':
        return <CheckIcon />;
      case 'Help':
        return <HelpIcon />;
      default:
        return <CommandIcon />;
    }
  }
  
  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCommands(allCommands);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = allCommands.filter(command => {
      return (
        command.title.toLowerCase().includes(query) ||
        command.keywords.some(keyword => keyword.includes(query))
      );
    });
    
    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [searchQuery, allCommands]);
  
  // Focus input on open
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [open]);
  
  // Handle key navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      default:
        break;
    }
  };
  
  // Handle command execution
  const executeCommand = (command) => {
    command.action();
  };
  
  // Render key combo hint
  const renderKeyCombo = (keysStr) => {
    if (!keysStr) return null;
    
    const keys = keysStr.split('+').map(key => key.trim());
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 24,
                height: 20,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.text.primary, 0.08),
                border: `1px solid ${alpha(theme.palette.text.primary, 0.15)}`,
                color: theme.palette.text.primary,
                fontSize: '0.7rem',
                fontWeight: 700,
                px: 0.5,
                fontFamily: 'monospace'
              }}
            >
              {key.toUpperCase() === 'CMD' ? '⌘' : 
               key.toUpperCase() === 'SHIFT' ? '⇧' : 
               key.toUpperCase() === 'ALT' ? '⌥' : 
               key.toUpperCase() === 'CTRL' ? 'CTRL' : 
               key.toUpperCase()}
            </Box>
            {index < keys.length - 1 && (
              <Box 
                component="span" 
                sx={{ 
                  mx: 0.5, 
                  color: alpha(theme.palette.text.primary, 0.5),
                  fontSize: '0.7rem'
                }}
              >
                +
              </Box>
            )}
          </React.Fragment>
        ))}
      </Box>
    );
  };
  
  return (
    <Fade in={open}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(4px)',
          zIndex: 1400,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: { xs: 4, sm: 8, md: 10 },
          px: 2
        }}
        onClick={onClose}
      >
        <Paper
          elevation={6}
          sx={{
            width: '100%',
            maxWidth: 600,
            maxHeight: '70vh',
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              p: 1.5,
              borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`
            }}
          >
            <SearchIcon 
              sx={{ 
                ml: 1, 
                mr: 1.5,
                color: alpha(theme.palette.text.primary, 0.5)
              }} 
            />
            <InputBase
              placeholder="Search commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
              autoFocus
              fullWidth
              sx={{ 
                fontSize: '1rem',
                fontWeight: 500
              }}
            />
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                ml: 1,
                mr: 0.5
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 22,
                  borderRadius: 1,
                  backgroundColor: alpha(theme.palette.text.primary, 0.08),
                  color: alpha(theme.palette.text.primary, 0.6),
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  px: 0.75
                }}
              >
                ESC
              </Box>
            </Box>
          </Box>
          
          {/* Results */}
          <Box
            sx={{
              overflow: 'auto',
              maxHeight: { xs: '50vh', sm: '60vh' }
            }}
          >
            {filteredCommands.length === 0 ? (
              <Box 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  color: alpha(theme.palette.text.primary, 0.6)
                }}
              >
                <Typography variant="body2">
                  No commands found
                </Typography>
              </Box>
            ) : (
              <List sx={{ py: 0 }}>
                {filteredCommands.map((command, index) => (
                  <ListItem
                    key={command.id}
                    component={ButtonBase}
                    onClick={() => executeCommand(command)}
                    selected={index === selectedIndex}
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
                      transition: 'all 0.15s',
                      backgroundColor: index === selectedIndex 
                        ? alpha(theme.palette.primary.main, 0.1) 
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05)
                      },
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                      display: 'flex',
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        minWidth: 40,
                        color: index === selectedIndex 
                          ? theme.palette.primary.main 
                          : alpha(theme.palette.text.primary, 0.6)
                      }}
                    >
                      {command.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={command.title}
                      primaryTypographyProps={{
                        fontWeight: index === selectedIndex ? 600 : 500
                      }}
                    />
                    
                    {command.keys && (
                      <Box sx={{ ml: 2 }}>
                        {renderKeyCombo(command.keys)}
                      </Box>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
          
          {/* Footer */}
          <Box 
            sx={{ 
              p: 1.5, 
              borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: alpha(theme.palette.background.paper, 0.5)
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <ArrowRightIcon 
                  sx={{ 
                    fontSize: 16,
                    transform: 'rotate(90deg)',
                    mr: 0.5,
                    color: alpha(theme.palette.text.primary, 0.5)
                  }} 
                />
                <ArrowRightIcon 
                  sx={{ 
                    fontSize: 16,
                    transform: 'rotate(-90deg)',
                    mr: 0.5,
                    color: alpha(theme.palette.text.primary, 0.5)
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  to navigate
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EnterIcon 
                  sx={{ 
                    fontSize: 16,
                    mr: 0.5,
                    color: alpha(theme.palette.text.primary, 0.5)
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  to select
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {filteredCommands.length} commands
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
};

// Main export for the Keyboard Shortcuts system
export default {
  KeyboardShortcutsProvider,
  useKeyboardShortcuts,
  KeyboardShortcutsModal,
  CommandPalette
};