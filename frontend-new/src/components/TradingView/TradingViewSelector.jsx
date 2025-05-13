import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Grid, Paper, Skeleton, Button, TextField, MenuItem } from '@mui/material';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import TradingViewChart from './TradingViewChart';
import { tradingViewService } from '../../services/tradingview/tradingview.service';

const TradingViewSelector = ({
  onChartSelect,
  onScreenshotCapture,
  defaultSymbol = 'NASDAQ:NQ',
  defaultInterval = 'D',
  theme = 'dark',
}) => {
  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [interval, setInterval] = useState(defaultInterval);

  // Time intervals for the dropdown
  const timeIntervals = [
    { value: '1', label: '1 Minute' },
    { value: '5', label: '5 Minutes' },
    { value: '15', label: '15 Minutes' },
    { value: '30', label: '30 Minutes' },
    { value: '60', label: '1 Hour' },
    { value: '240', label: '4 Hours' },
    { value: 'D', label: 'Daily' },
    { value: 'W', label: 'Weekly' },
    { value: 'M', label: 'Monthly' },
  ];

  // Common futures symbols
  const commonSymbols = [
    { value: 'NASDAQ:NQ', label: 'NASDAQ NQ Futures' },
    { value: 'CME_MINI:ES', label: 'S&P 500 ES Futures' },
    { value: 'CME_MINI:YM', label: 'Dow Jones YM Futures' },
    { value: 'CME:RTY', label: 'Russell 2000 RTY Futures' },
    { value: 'COMEX:GC', label: 'Gold Futures' },
    { value: 'NYMEX:CL', label: 'Crude Oil Futures' },
    { value: 'USDOLLAR', label: 'US Dollar Index' },
  ];

  // Load saved layouts on mount
  useEffect(() => {
    fetchLayouts();
  }, []);

  // Fetch saved chart layouts
  const fetchLayouts = async () => {
    try {
      setLoading(true);
      const layouts = await tradingViewService.getLayouts();
      setLayouts(layouts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching layouts:', err);
      setError('Failed to load saved charts');
      setLoading(false);
    }
  };

  // Handle chart layout selection
  const handleLayoutSelect = (layout) => {
    setSelectedLayout(layout);
    
    // Notify parent component
    if (onChartSelect) {
      onChartSelect(layout);
    }
  };

  // Handle symbol change
  const handleSymbolChange = (event) => {
    setSymbol(event.target.value);
  };

  // Handle interval change
  const handleIntervalChange = (event) => {
    setInterval(event.target.value);
  };

  // Handle screenshot from the chart
  const handleScreenshot = (screenshotData) => {
    if (onScreenshotCapture) {
      onScreenshotCapture(screenshotData);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Chart configuration section */}
        <Grid item xs={12}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F5F5F5',
              color: theme === 'dark' ? '#FFF' : '#333',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Chart Configuration
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Symbol"
                  value={symbol}
                  onChange={handleSymbolChange}
                  variant="outlined"
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme === 'dark' ? '#555' : '#ddd',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme === 'dark' ? '#aaa' : '#666',
                    },
                    '& .MuiSelect-select': {
                      color: theme === 'dark' ? '#fff' : '#333',
                    },
                  }}
                >
                  {commonSymbols.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Time Interval"
                  value={interval}
                  onChange={handleIntervalChange}
                  variant="outlined"
                  margin="normal"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme === 'dark' ? '#555' : '#ddd',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme === 'dark' ? '#aaa' : '#666',
                    },
                    '& .MuiSelect-select': {
                      color: theme === 'dark' ? '#fff' : '#333',
                    },
                  }}
                >
                  {timeIntervals.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* TradingView Chart */}
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 0, 
              overflow: 'hidden',
              borderRadius: '4px', 
              height: '600px',
            }}
          >
            <TradingViewChart
              symbol={symbol}
              interval={interval}
              theme={theme}
              height="100%"
              width="100%"
              showToolbar={true}
              autoSizeContent={true}
              onScreenshot={handleScreenshot}
              studies={['RSI', 'MACD']}
            />
          </Paper>
        </Grid>
        
        {/* Saved layouts section */}
        <Grid item xs={12}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F5F5F5',
              color: theme === 'dark' ? '#FFF' : '#333',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Saved Chart Layouts
            </Typography>
            
            {loading ? (
              <Grid container spacing={2}>
                {[1, 2, 3].map((i) => (
                  <Grid item xs={12} md={4} key={i}>
                    <Skeleton 
                      variant="rectangular" 
                      height={100} 
                      animation="wave"
                      sx={{ backgroundColor: theme === 'dark' ? '#333' : '#ddd' }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : layouts.length > 0 ? (
              <Grid container spacing={2}>
                {layouts.map((layout) => (
                  <Grid item xs={12} md={4} key={layout.id}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        backgroundColor: theme === 'dark' ? '#2A2A2A' : '#FFF',
                        cursor: 'pointer',
                        border: selectedLayout?.id === layout.id 
                          ? `2px solid ${theme === 'dark' ? '#90CAF9' : '#1976D2'}`
                          : `1px solid ${theme === 'dark' ? '#555' : '#DDD'}`,
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: theme === 'dark' ? '#333' : '#F9F9F9',
                        },
                      }}
                      onClick={() => handleLayoutSelect(layout)}
                    >
                      <Typography variant="subtitle1" gutterBottom>
                        {layout.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Last updated: {new Date(layout.updated_at * 1000).toLocaleDateString()}
                      </Typography>
                      <Button
                        startIcon={<SaveAltIcon />}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          mt: 1,
                          borderColor: theme === 'dark' ? '#555' : '#DDD',
                          color: theme === 'dark' ? '#FFF' : '#333',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLayoutSelect(layout);
                        }}
                      >
                        Load Layout
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: theme === 'dark' ? '#2A2A2A' : '#F9F9F9',
                  borderRadius: '4px',
                }}
              >
                <Typography variant="body1">
                  No saved chart layouts found. Save a chart layout to see it here.
                </Typography>
              </Box>
            )}
            
            {error && (
              <Box
                sx={{
                  p: 2, 
                  mt: 2,
                  backgroundColor: theme === 'dark' ? '#442222' : '#FFEBEE',
                  borderRadius: '4px',
                  color: theme === 'dark' ? '#FFCDD2' : '#B71C1C',
                }}
              >
                <Typography variant="body2">{error}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

TradingViewSelector.propTypes = {
  onChartSelect: PropTypes.func,
  onScreenshotCapture: PropTypes.func,
  defaultSymbol: PropTypes.string,
  defaultInterval: PropTypes.string,
  theme: PropTypes.oneOf(['light', 'dark']),
};

export default TradingViewSelector;
