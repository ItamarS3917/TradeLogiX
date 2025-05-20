import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  Paper,
  ListItemIcon
} from '@mui/material';
import { 
  Search as SearchIcon,
  ArrowForward as ArrowIcon,
  NavigateNext as NavigateIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  LibraryBooks as JournalIcon,
  EventNote as PlanningIcon,
  Assessment as StatisticsIcon,
  Psychology as AIIcon,
  CloudSync as CloudSyncIcon,
  ShowChart as ChartIcon,
  Palette as ThemeIcon,
  Keyboard as KeyboardIcon,
  Notifications as NotificationsIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKeyboardShortcuts } from '../../../contexts/KeyboardShortcutsContext';

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredCommands, setFilteredCommands] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { shortcuts, setShowShortcutsModal } = useKeyboardShortcuts();

  // Convert shortcuts to a command list format
  const commands = Object.entries(shortcuts).map(([shortcut, { description, action }]) => ({
    id: shortcut,
    title: description,
    action: action,
    keywords: description.toLowerCase().split(' ')
  }));

  // Get the current theme
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  // Function to get icon for a command
  const getIconForCommand = useCallback((commandId) => {
    switch (commandId) {
      case 'dashboard':
      case 'g d':
        return <DashboardIcon fontSize="small" color="primary" />;
      case 'trades':
      case 'g t':
      case 'add-trade':
        return <JournalIcon fontSize="small" color="primary" />;
      case 'planning':
      case 'g p':
      case 'add-plan':
        return <PlanningIcon fontSize="small" color="primary" />;
      case 'statistics':
      case 'g s':
      case 'view-stats':
        return <StatisticsIcon fontSize="small" color="primary" />;
      case 'tradesage':
      case 'g a':
      case 'chat-ai':
        return <AIIcon fontSize="small" color="primary" />;
      case 'cloud-sync':
      case 'g c':
        return <CloudSyncIcon fontSize="small" color="primary" />;
      case 'tradingview':
      case 'g v':
        return <ChartIcon fontSize="small" color="primary" />;
      case 'settings':
      case 'g x':
        return <SettingsIcon fontSize="small" color="primary" />;
      case 'toggle-theme':
        return <ThemeIcon fontSize="small" color="primary" />;
      case 'keyboard-shortcuts':
      case '?':
        return <KeyboardIcon fontSize="small" color="primary" />;
      case 'notifications':
        return <NotificationsIcon fontSize="small" color="primary" />;
      case 'onboarding':
        return <SchoolIcon fontSize="small" color="primary" />;
      default:
        return <NavigateIcon fontSize="small" color="primary" />;
    }
  }, []);
  
  // Add common commands that might not be in shortcuts
  const allCommands = [
    ...commands,
    { 
      id: 'dashboard',
      title: 'Go to Dashboard', 
      action: () => navigate('/dashboard'),
      keywords: ['dashboard', 'home', 'main', 'overview']
    },
    { 
      id: 'trades',
      title: 'Go to Trade Journal', 
      action: () => navigate('/trades'),
      keywords: ['trades', 'journal', 'view trades', 'trade list', 'log']
    },
    { 
      id: 'add-trade', 
      title: 'Add New Trade', 
      action: () => navigate('/trades/new'),
      keywords: ['trade', 'add', 'new', 'create', 'journal']
    },
    { 
      id: 'planning',
      title: 'Go to Daily Planning', 
      action: () => navigate('/planning'),
      keywords: ['planning', 'plan', 'daily', 'preparation']
    },
    { 
      id: 'add-plan', 
      title: 'Create Daily Plan', 
      action: () => navigate('/planning/new'),
      keywords: ['plan', 'daily', 'add', 'new', 'create']
    },
    { 
      id: 'statistics',
      title: 'View Statistics', 
      action: () => navigate('/statistics'),
      keywords: ['stats', 'statistics', 'performance', 'analytics']
    },
    { 
      id: 'tradesage',
      title: 'Chat with TradeSage AI', 
      action: () => navigate('/tradesage'),
      keywords: ['tradesage', 'ai', 'assistant', 'chat', 'help']
    },
    {
      id: 'toggle-theme',
      title: `Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`,
      action: () => document.querySelector('header button[aria-label="toggle dark mode"]')?.click(),
      keywords: ['theme', 'dark', 'light', 'mode', 'color', 'toggle']
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Show Keyboard Shortcuts',
      action: () => setShowShortcutsModal(true),
      keywords: ['keyboard', 'shortcuts', 'keys', 'commands']
    }
  ];

  // Toggle command palette
  const toggleCommandPalette = () => {
    setOpen(!open);
    setSearch('');
    setSelectedIndex(0);
    
    // Focus input on open
    if (!open) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // Make command palette available globally
  useEffect(() => {
    window.toggleCommandPalette = toggleCommandPalette;
  }, []);

  // Add a global keyboard shortcut for opening the command palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
      
      // Escape to close
      if (e.key === 'Escape' && open) {
        toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Filter commands based on search
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredCommands(allCommands);
      return;
    }

    const searchTerms = search.toLowerCase().split(' ');
    
    const filtered = allCommands.filter(command => {
      // Check if all search terms are found in any of the command's keywords
      return searchTerms.every(term => 
        command.keywords.some(keyword => keyword.includes(term)) || 
        command.title.toLowerCase().includes(term)
      );
    });

    setFilteredCommands(filtered);
    setSelectedIndex(0);
  }, [search]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredCommands.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && filteredCommands.length > 0) {
      e.preventDefault();
      executeCommand(filteredCommands[selectedIndex]);
    }
  };

  // Execute a command and close the palette
  const executeCommand = (command) => {
    toggleCommandPalette();
    command.action();
  };

  // Check if a command points to the current page
  const isCurrentPage = (commandId) => {
    // Remove leading slash if it exists
    const path = commandId.startsWith('/') ? commandId : `/${commandId}`;
    return location.pathname === path;
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={toggleCommandPalette} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '70vh'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
            InputProps={{
              startAdornment: (
                <SearchIcon color="action" sx={{ mr: 1 }} />
              ),
              sx: { 
                borderRadius: 2,
                fontWeight: 'medium'
              }
            }}
            variant="outlined"
          />
        </Box>
        
        <Paper sx={{ 
          maxHeight: '60vh', 
          overflow: 'auto', 
          borderRadius: 0,
          boxShadow: 'none'
        }}>
          {filteredCommands.length > 0 ? (
            <List disablePadding>
              {filteredCommands.map((command, index) => (
                <React.Fragment key={command.id}>
                  <ListItem
                    button
                    selected={index === selectedIndex}
                    onClick={() => executeCommand(command)}
                    sx={{
                      px: 2,
                      py: 1.5
                    }}
                  >
                    <ListItemIcon>
                      {getIconForCommand(command.id)}
                    </ListItemIcon>
                    <ListItemText
                      primary={command.title}
                      secondary={
                        (isCurrentPage(command.id)) ? 'Current page' : null
                      }
                    />
                    <ListItemIcon sx={{ minWidth: 'auto' }}>
                      <ArrowIcon fontSize="small" />
                    </ListItemIcon>
                  </ListItem>
                  {index < filteredCommands.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No commands found for "{search}"
              </Typography>
            </Box>
          )}
        </Paper>
        
        <Box sx={{ 
          p: 1.5,
          backgroundColor: 'background.default',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="caption" color="text.secondary">
            Tip: Press <strong>↑</strong> / <strong>↓</strong> to navigate • <strong>Enter</strong> to select • <strong>Esc</strong> to close
          </Typography>
        </Box>
      </Dialog>
    </>
  );
};

export default CommandPalette;