// CacheManager.jsx
// A component for monitoring and managing the cache

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Switch, 
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { 
  isUsingEnhancedApiBridge, 
  setUseEnhancedApiBridge,
  getCacheStats, 
  clearCache,
  getDataSourceMode
} from '../../services/serviceFactory';

const CacheManager = () => {
  const [cacheEnabled, setCacheEnabled] = useState(isUsingEnhancedApiBridge());
  const [cacheStats, setCacheStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get cache statistics when component loads or refreshes
  useEffect(() => {
    const fetchCacheStats = async () => {
      setLoading(true);
      try {
        const stats = getCacheStats();
        setCacheStats(stats);
      } catch (error) {
        console.error('Error fetching cache stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCacheStats();
  }, [refreshKey, cacheEnabled]);
  
  // Handle toggling cache
  const handleToggleCache = (event) => {
    const newValue = event.target.checked;
    setCacheEnabled(newValue);
    setUseEnhancedApiBridge(newValue);
  };
  
  // Handle clearing cache
  const handleClearCache = () => {
    try {
      const clearedEntries = clearCache();
      console.log(`Cleared ${clearedEntries} cache entries`);
      // Refresh cache stats
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };
  
  // Handle refreshing cache stats
  const handleRefreshStats = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // Determine chip color based on data source mode
  const getDataSourceChipColor = () => {
    const mode = getDataSourceMode();
    switch (mode) {
      case 'firebase':
        return 'primary';
      case 'api':
        return 'secondary';
      case 'bridge':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            API Bridge Cache Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              label={`Data Source: ${getDataSourceMode()}`} 
              color={getDataSourceChipColor()} 
              size="small" 
              sx={{ mr: 2 }} 
            />
            <Tooltip title="Refresh Stats">
              <IconButton onClick={handleRefreshStats} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={cacheEnabled}
                  onChange={handleToggleCache}
                  color="primary"
                />
              }
              label="Use Enhanced API Bridge with Caching"
            />
            <Tooltip title="Caching improves performance by storing recently fetched data">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Grid>
          
          {cacheEnabled ? (
            <>
              {loading ? (
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={40} />
                </Grid>
              ) : cacheStats ? (
                <>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" component="h3" gutterBottom>
                          Cache Statistics
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Entries: {cacheStats.size} / {cacheStats.maxSize}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Default TTL: {cacheStats.ttl / 1000} seconds
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<DeleteIcon />}
                          onClick={handleClearCache}
                          sx={{ mt: 1 }}
                          size="small"
                        >
                          Clear Cache
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" component="h3" gutterBottom>
                          Cache Utilization
                        </Typography>
                        <Box
                          sx={{
                            height: 20,
                            width: '100%',
                            bgcolor: 'grey.300',
                            borderRadius: 1,
                            mb: 1
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${(cacheStats.size / cacheStats.maxSize) * 100}%`,
                              bgcolor: 'primary.main',
                              borderRadius: 1
                            }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round((cacheStats.size / cacheStats.maxSize) * 100)}% used
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" component="h3" gutterBottom>
                          Cached Endpoints
                        </Typography>
                        {cacheStats.keys && cacheStats.keys.length > 0 ? (
                          <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                            {cacheStats.keys.map((key, index) => (
                              <ListItem key={index}>
                                <ListItemText
                                  primary={key.split(':')[0]}
                                  secondary={key.split(':')[1] || 'No parameters'}
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No cache entries found
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              ) : (
                <Grid item xs={12}>
                  <Alert severity="error">Failed to load cache statistics</Alert>
                </Grid>
              )}
            </>
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                Enable the enhanced API bridge with caching to improve application performance.
                This will reduce redundant API calls and speed up data loading.
              </Alert>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CacheManager;