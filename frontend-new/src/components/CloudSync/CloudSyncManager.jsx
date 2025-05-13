import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SyncIcon from '@mui/icons-material/Sync';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import cloudSyncService from '../../services/cloud/cloud-sync.service';

const CloudSyncManager = () => {
  // States
  const [syncStatus, setSyncStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [config, setConfig] = useState({
    auto_sync_enabled: true,
    sync_interval: 3600,
    conflict_resolution: 'newest',
    provider_type: 'local'
  });
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [newFileData, setNewFileData] = useState({
    local_path: '',
    remote_path: '',
    sync_direction: 'bidirectional'
  });
  const [syncLogs, setSyncLogs] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadSyncData();
    loadConfig();
    loadSyncLogs();

    // Set up auto-refresh
    const interval = setInterval(() => {
      loadSyncData(false);
    }, 30000); // Refresh every 30 seconds
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  // Load sync status data
  const loadSyncData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const response = await cloudSyncService.getSyncStatus();
      if (response.status === 'success') {
        setSyncStatus(response.data);
      } else {
        setError(response.error || 'Failed to load sync status');
      }
    } catch (err) {
      setError(err.message || 'Error loading sync status');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  // Load configuration
  const loadConfig = async () => {
    try {
      const response = await cloudSyncService.getConfig();
      if (response.status === 'success') {
        setConfig(response.config);
      }
    } catch (err) {
      setError(err.message || 'Error loading configuration');
    }
  };

  // Load sync logs
  const loadSyncLogs = async () => {
    try {
      const response = await cloudSyncService.getSyncLogs(20, 0);
      if (response.status === 'success') {
        setSyncLogs(response.data.data);
      }
    } catch (err) {
      setError(err.message || 'Error loading sync logs');
    }
  };

  // Handle file registration
  const handleRegisterFile = async () => {
    try {
      setIsLoading(true);
      const response = await cloudSyncService.registerFile(
        newFileData.local_path,
        newFileData.remote_path || null,
        newFileData.sync_direction
      );
      
      if (response.status === 'success') {
        setSuccess('File registered successfully');
        loadSyncData();
        setIsRegisterDialogOpen(false);
        setNewFileData({
          local_path: '',
          remote_path: '',
          sync_direction: 'bidirectional'
        });
      } else {
        setError(response.error || 'Failed to register file');
      }
    } catch (err) {
      setError(err.message || 'Error registering file');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file unregistration
  const handleUnregisterFile = async (localPath) => {
    if (window.confirm(`Are you sure you want to unregister ${localPath}?`)) {
      try {
        setIsLoading(true);
        const response = await cloudSyncService.unregisterFile(localPath, false);
        
        if (response.status === 'success') {
          setSuccess('File unregistered successfully');
          loadSyncData();
        } else {
          setError(response.error || 'Failed to unregister file');
        }
      } catch (err) {
        setError(err.message || 'Error unregistering file');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle config update
  const handleUpdateConfig = async () => {
    try {
      setIsLoading(true);
      const response = await cloudSyncService.updateConfig(config);
      
      if (response.status === 'success') {
        setSuccess('Configuration updated successfully');
        setIsSettingsDialogOpen(false);
        loadConfig();
      } else {
        setError(response.error || 'Failed to update configuration');
      }
    } catch (err) {
      setError(err.message || 'Error updating configuration');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file sync
  const handleSyncFiles = async (localPath = null) => {
    try {
      setIsSyncing(true);
      const response = await cloudSyncService.syncFiles(localPath);
      
      if (response.status === 'success') {
        setSuccess(localPath ? 'File synced successfully' : 'All files synced successfully');
        loadSyncData();
        loadSyncLogs();
      } else {
        setError(response.error || 'Failed to sync files');
      }
    } catch (err) {
      setError(err.message || 'Error syncing files');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle conflict resolution
  const handleResolveConflict = async (localPath, resolution) => {
    try {
      setIsLoading(true);
      const response = await cloudSyncService.resolveConflict(localPath, resolution);
      
      if (response.status === 'success') {
        setSuccess(`Conflict resolved with ${resolution} version`);
        loadSyncData();
      } else {
        setError(response.error || 'Failed to resolve conflict');
      }
    } catch (err) {
      setError(err.message || 'Error resolving conflict');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear messages
  const handleClearMessage = () => {
    setError(null);
    setSuccess(null);
  };

  // Render file status icon
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'synced':
        return <CheckCircleIcon color="success" />;
      case 'pending':
        return <SyncIcon color="primary" />;
      case 'conflict':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorOutlineIcon color="error" />;
      default:
        return <InfoIcon color="disabled" />;
    }
  };

  // Render conflict resolution actions
  const renderConflictActions = (file) => {
    if (file.status !== 'conflict') return null;
    
    return (
      <Box sx={{ mt: 1 }}>
        <Button 
          size="small" 
          variant="outlined" 
          color="primary" 
          onClick={() => handleResolveConflict(file.local_path, 'local')}
          sx={{ mr: 1 }}
        >
          Use Local
        </Button>
        <Button 
          size="small" 
          variant="outlined" 
          color="secondary"
          onClick={() => handleResolveConflict(file.local_path, 'remote')}
        >
          Use Remote
        </Button>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Cloud Synchronization</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setIsSettingsDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Settings
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={() => setIsRegisterDialogOpen(true)}
          >
            Register File
          </Button>
        </Box>
      </Box>

      {/* Main content */}
      <Grid container spacing={3}>
        {/* Sync status */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Synchronized Files</Typography>
              <Box>
                <Tooltip title="Refresh">
                  <IconButton onClick={() => loadSyncData()} disabled={isLoading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SyncIcon />}
                  onClick={() => handleSyncFiles()}
                  disabled={isSyncing}
                  sx={{ ml: 1 }}
                >
                  {isSyncing ? <CircularProgress size={24} /> : "Sync All"}
                </Button>
              </Box>
            </Box>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : syncStatus.length > 0 ? (
              <List>
                {syncStatus.map((file, index) => (
                  <React.Fragment key={file.local_path}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {renderStatusIcon(file.status)}
                            <Typography variant="subtitle1" sx={{ ml: 1 }}>
                              {file.local_path}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="textSecondary">
                              Remote: {file.remote_path}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Status: {file.status} • Last sync: {file.last_sync ? new Date(file.last_sync).toLocaleString() : 'Never'}
                            </Typography>
                            {renderConflictActions(file)}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Sync">
                          <IconButton edge="end" onClick={() => handleSyncFiles(file.local_path)}>
                            <SyncIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Unregister">
                          <IconButton edge="end" onClick={() => handleUnregisterFile(file.local_path)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="textSecondary">No files registered for synchronization</Typography>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => setIsRegisterDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Register Your First File
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sync logs */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Sync Activity</Typography>
              <Tooltip title="Refresh">
                <IconButton onClick={() => loadSyncLogs()}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            {syncLogs.length > 0 ? (
              <List dense>
                {syncLogs.map((log) => (
                  <ListItem key={log.id}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {log.status === 'success' ? (
                            <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                          ) : log.status === 'error' ? (
                            <ErrorOutlineIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                          ) : (
                            <InfoIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                          )}
                          <Typography variant="body2">
                            {log.action} - {log.status}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                          <Typography variant="caption" display="block" noWrap sx={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {log.local_path}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="textSecondary">No sync activity recorded</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Register file dialog */}
      <Dialog open={isRegisterDialogOpen} onClose={() => setIsRegisterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register File for Synchronization</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Local File Path"
            type="text"
            fullWidth
            value={newFileData.local_path}
            onChange={(e) => setNewFileData({ ...newFileData, local_path: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Remote File Path (Optional)"
            type="text"
            fullWidth
            value={newFileData.remote_path}
            onChange={(e) => setNewFileData({ ...newFileData, remote_path: e.target.value })}
            helperText="Leave empty to use the same name as the local file"
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="Sync Direction"
            fullWidth
            value={newFileData.sync_direction}
            onChange={(e) => setNewFileData({ ...newFileData, sync_direction: e.target.value })}
          >
            <MenuItem value="bidirectional">Bidirectional (Two-way sync)</MenuItem>
            <MenuItem value="upload">Upload Only (Local to Cloud)</MenuItem>
            <MenuItem value="download">Download Only (Cloud to Local)</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRegisterDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRegisterFile} color="primary" disabled={!newFileData.local_path}>
            Register
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings dialog */}
      <Dialog open={isSettingsDialogOpen} onClose={() => setIsSettingsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cloud Sync Settings</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Switch
                checked={config.auto_sync_enabled}
                onChange={(e) => setConfig({ ...config, auto_sync_enabled: e.target.checked })}
                color="primary"
              />
            }
            label="Enable Automatic Synchronization"
            sx={{ mb: 2, display: 'block' }}
          />
          
          <TextField
            type="number"
            label="Sync Interval (seconds)"
            value={config.sync_interval}
            onChange={(e) => setConfig({ ...config, sync_interval: parseInt(e.target.value, 10) })}
            disabled={!config.auto_sync_enabled}
            fullWidth
            sx={{ mb: 2 }}
          />
          
          <TextField
            select
            label="Conflict Resolution Strategy"
            value={config.conflict_resolution}
            onChange={(e) => setConfig({ ...config, conflict_resolution: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="newest">Newest (Use the most recently modified version)</MenuItem>
            <MenuItem value="local">Local (Always prefer local version)</MenuItem>
            <MenuItem value="remote">Remote (Always prefer remote version)</MenuItem>
            <MenuItem value="manual">Manual (Ask for resolution)</MenuItem>
          </TextField>
          
          <Typography variant="subtitle2" gutterBottom>
            Provider: {config.provider_type}
          </Typography>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Provider type cannot be changed after initialization. Contact your administrator to change providers.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSettingsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateConfig} color="primary">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleClearMessage}
      >
        <Alert onClose={handleClearMessage} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleClearMessage}
      >
        <Alert onClose={handleClearMessage} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CloudSyncManager;
