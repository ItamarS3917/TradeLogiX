import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  FormHelperText,
  Alert,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Keyboard as KeyboardIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useKeyboardShortcuts } from '../../../contexts/KeyboardShortcutsContext';
import { useNotification } from '../../../contexts/NotificationContext';

const KeyboardShortcutsManager = () => {
  const { 
    shortcuts, 
    addCustomShortcut, 
    removeCustomShortcut,
    getAvailableShortcuts,
    powerUserMode,
    togglePowerUserMode
  } = useKeyboardShortcuts();

  const { showSuccess, showError } = useNotification();
  
  const [open, setOpen] = useState(false);
  const [shortcutKey, setShortcutKey] = useState('');
  const [shortcutDescription, setShortcutDescription] = useState('');
  const [shortcutAction, setShortcutAction] = useState('navigate');
  const [shortcutTarget, setShortcutTarget] = useState('/dashboard');
  const [shortcutSequence, setShortcutSequence] = useState([]);
  const [isRecordingKeys, setIsRecordingKeys] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [isConflict, setIsConflict] = useState(false);
  
  // Available routes for navigation shortcuts
  const availableRoutes = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/trades', label: 'Trade Journal' },
    { path: '/trades/new', label: 'Add New Trade' },
    { path: '/planning', label: 'Daily Planning' },
    { path: '/planning/new', label: 'Create New Plan' },
    { path: '/statistics', label: 'Statistics' },
    { path: '/tradesage', label: 'TradeSage AI' },
    { path: '/cloud-sync', label: 'Cloud Sync' },
    { path: '/tradingview', label: 'TradingView' },
    { path: '/settings', label: 'Settings' }
  ];
  
  // Available actions
  const availableActions = [
    { value: 'navigate', label: 'Navigate to Page' },
    { value: 'command', label: 'Execute Command' }
  ];
  
  // Available commands
  const availableCommands = [
    { value: 'toggleTheme', label: 'Toggle Dark/Light Theme' },
    { value: 'openCommandPalette', label: 'Open Command Palette' },
    { value: 'showShortcutsModal', label: 'Show Keyboard Shortcuts' },
    { value: 'refreshData', label: 'Refresh Data' },
    { value: 'toggleSidebar', label: 'Toggle Sidebar' }
  ];
  
  // Reset form
  const resetForm = () => {
    setShortcutKey('');
    setShortcutDescription('');
    setShortcutAction('navigate');
    setShortcutTarget('/dashboard');
    setShortcutSequence([]);
    setIsRecordingKeys(false);
    setIsEditing(false);
    setEditingKey('');
    setIsConflict(false);
  };
  
  // Open dialog to add new shortcut
  const handleOpenAddDialog = () => {
    resetForm();
    setOpen(true);
  };
  
  // Open dialog to edit shortcut
  const handleOpenEditDialog = (key, config) => {
    setShortcutKey(key);
    setShortcutDescription(config.description);
    
    // Determine action type
    if (config.action.toString().includes('navigate')) {
      setShortcutAction('navigate');
      
      // Extract route from the function
      const actionStr = config.action.toString();
      const routeMatch = actionStr.match(/navigate\(['"](.+)['"]\)/);
      if (routeMatch && routeMatch[1]) {
        setShortcutTarget(routeMatch[1]);
      } else {
        setShortcutTarget('/dashboard');
      }
    } else {
      setShortcutAction('command');
      
      // Try to match command
      const actionStr = config.action.toString();
      for (const cmd of availableCommands) {
        if (actionStr.includes(cmd.value)) {
          setShortcutTarget(cmd.value);
          break;
        }
      }
    }
    
    // Set key sequence
    setShortcutSequence(key.split(' '));
    
    setIsEditing(true);
    setEditingKey(key);
    setOpen(true);
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setOpen(false);
    resetForm();
  };
  
  // Start recording key sequence
  const handleStartRecording = () => {
    setIsRecordingKeys(true);
    setShortcutSequence([]);
    setIsConflict(false);
    
    // Add event listener
    document.addEventListener('keydown', recordKey);
    
    return () => {
      document.removeEventListener('keydown', recordKey);
    };
  };
  
  // Stop recording key sequence
  const handleStopRecording = () => {
    setIsRecordingKeys(false);
    document.removeEventListener('keydown', recordKey);
  };
  
  // Record key function
  const recordKey = (e) => {
    e.preventDefault();
    
    // Ignore modifier keys on their own
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) {
      return;
    }
    
    // Get the key to add
    let keyToAdd = e.key.toLowerCase();
    
    // Stop recording if Escape is pressed
    if (keyToAdd === 'escape') {
      handleStopRecording();
      return;
    }
    
    // Add the key to the sequence
    setShortcutSequence(prev => {
      // Limit to 2 keys
      if (prev.length >= 2) {
        handleStopRecording();
        return prev;
      }
      
      return [...prev, keyToAdd];
    });
  };
  
  // Check for shortcut conflicts
  useEffect(() => {
    if (shortcutSequence.length > 0) {
      const potentialShortcut = shortcutSequence.join(' ');
      const existingShortcuts = getAvailableShortcuts();
      
      // Check for conflicts, but ignore the current shortcut if editing
      let conflict = false;
      Object.keys(existingShortcuts).forEach(key => {
        if (key === potentialShortcut && (!isEditing || key !== editingKey)) {
          conflict = true;
        }
      });
      
      setIsConflict(conflict);
    }
  }, [shortcutSequence, isEditing, editingKey]);
  
  // Handle save shortcut
  const handleSaveShortcut = () => {
    if (shortcutSequence.length === 0) {
      showError('Please record a key sequence for your shortcut.');
      return;
    }
    
    if (isConflict) {
      showError('This key sequence is already in use. Please choose a different sequence.');
      return;
    }
    
    if (!shortcutDescription) {
      showError('Please provide a description for your shortcut.');
      return;
    }
    
    // Generate the key sequence string
    const keySequence = shortcutSequence.join(' ');
    
    // Create action function
    let actionFn;
    if (shortcutAction === 'navigate') {
      actionFn = () => window.navigate(shortcutTarget);
    } else {
      // For commands, create appropriate action
      switch (shortcutTarget) {
        case 'toggleTheme':
          actionFn = () => window.toggleTheme();
          break;
        case 'openCommandPalette':
          actionFn = () => window.toggleCommandPalette();
          break;
        case 'showShortcutsModal':
          actionFn = () => window.setShowShortcutsModal(true);
          break;
        case 'refreshData':
          actionFn = () => window.refreshData();
          break;
        case 'toggleSidebar':
          actionFn = () => window.toggleSidebar();
          break;
        default:
          actionFn = () => console.log('Command not implemented');
      }
    }
    
    // If editing, remove old shortcut first
    if (isEditing) {
      removeCustomShortcut(editingKey);
    }
    
    // Add the shortcut
    addCustomShortcut(keySequence, shortcutDescription, actionFn);
    
    // Show success message
    showSuccess(isEditing ? 'Shortcut updated successfully!' : 'Shortcut added successfully!');
    
    // Close dialog and reset
    handleCloseDialog();
  };
  
  // Handle delete shortcut
  const handleDeleteShortcut = (key) => {
    removeCustomShortcut(key);
    showSuccess('Shortcut removed successfully!');
  };
  
  // Group shortcuts by category
  const categories = {
    'Navigation': Object.entries(shortcuts).filter(([key]) => key.startsWith('g')),
    'Actions': Object.entries(shortcuts).filter(([key]) => key.startsWith('n')),
    'Custom': Object.entries(shortcuts).filter(([key]) => !key.startsWith('g') && !key.startsWith('n') && key !== '?'),
    'System': Object.entries(shortcuts).filter(([key]) => key === '?')
  };
  
  return (
    <>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Keyboard Shortcuts</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Add Shortcut
          </Button>
        </Box>
        
        <FormControlLabel
          control={
            <Switch 
              checked={powerUserMode} 
              onChange={togglePowerUserMode} 
              color="primary"
            />
          }
          label="Power User Mode"
        />
        <FormHelperText>
          Enables extended keyboard shortcuts for faster navigation
        </FormHelperText>
        
        {Object.entries(categories).map(([category, shortcutList]) => (
          shortcutList.length > 0 && (
            <Box key={category} mt={3}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                {category}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {shortcutList.map(([key, config]) => (
                  <ListItem key={key} divider>
                    <ListItemText
                      primary={config.description}
                      secondary={
                        <Box display="flex" gap={1} mt={0.5}>
                          {key.split(' ').map((k, i) => (
                            <Chip
                              key={i}
                              size="small"
                              label={k}
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                bgcolor: 'background.default'
                              }}
                            />
                          ))}
                        </Box>
                      }
                    />
                    
                    {/* Only allow editing custom shortcuts */}
                    {category === 'Custom' && (
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleOpenEditDialog(key, config)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteShortcut(key)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          )
        ))}
      </Paper>
      
      {/* Dialog for adding/editing shortcuts */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Edit Keyboard Shortcut' : 'Add Keyboard Shortcut'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box mb={2} mt={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Key Sequence:
                </Typography>
                
                {isRecordingKeys ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    border={1}
                    borderColor="primary.main"
                    borderRadius={1}
                    p={2}
                    mb={2}
                    bgcolor="action.hover"
                  >
                    <Typography fontWeight="medium" color="primary">
                      Press keys now... {shortcutSequence.length > 0 && '(Press Escape to cancel)'}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleStopRecording}
                      startIcon={<CheckIcon />}
                    >
                      Done
                    </Button>
                  </Box>
                ) : (
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box flexGrow={1}>
                        {shortcutSequence.length > 0 ? (
                          <Box display="flex" gap={1}>
                            {shortcutSequence.map((key, i) => (
                              <Chip
                                key={i}
                                size="medium"
                                label={key}
                                color={isConflict ? "error" : "primary"}
                                sx={{
                                  fontFamily: 'monospace',
                                  fontWeight: 'bold'
                                }}
                                onDelete={() => {
                                  setShortcutSequence(prev => prev.filter((_, index) => index !== i));
                                }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography color="text.secondary">
                            No keys recorded yet
                          </Typography>
                        )}
                      </Box>
                      <Button
                        variant="outlined"
                        onClick={handleStartRecording}
                        startIcon={<KeyboardIcon />}
                      >
                        Record Keys
                      </Button>
                    </Box>
                    
                    {isConflict && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        This key sequence is already in use. Please choose a different sequence.
                      </Alert>
                    )}
                    
                    <FormHelperText>
                      Press up to 2 keys in sequence. For example "g" then "d" for "go to dashboard".
                    </FormHelperText>
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={shortcutDescription}
                onChange={(e) => setShortcutDescription(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="e.g., Go to Dashboard"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="shortcut-action-label">Action Type</InputLabel>
                <Select
                  labelId="shortcut-action-label"
                  value={shortcutAction}
                  onChange={(e) => setShortcutAction(e.target.value)}
                  label="Action Type"
                >
                  {availableActions.map((action) => (
                    <MenuItem key={action.value} value={action.value}>
                      {action.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="shortcut-target-label">
                  {shortcutAction === 'navigate' ? 'Navigate To' : 'Command'}
                </InputLabel>
                <Select
                  labelId="shortcut-target-label"
                  value={shortcutTarget}
                  onChange={(e) => setShortcutTarget(e.target.value)}
                  label={shortcutAction === 'navigate' ? 'Navigate To' : 'Command'}
                >
                  {shortcutAction === 'navigate' ? (
                    availableRoutes.map((route) => (
                      <MenuItem key={route.path} value={route.path}>
                        {route.label}
                      </MenuItem>
                    ))
                  ) : (
                    availableCommands.map((command) => (
                      <MenuItem key={command.value} value={command.value}>
                        {command.label}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSaveShortcut}
            color="primary"
            variant="contained"
            disabled={shortcutSequence.length === 0 || !shortcutDescription || isConflict}
          >
            {isEditing ? 'Update' : 'Add'} Shortcut
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KeyboardShortcutsManager;