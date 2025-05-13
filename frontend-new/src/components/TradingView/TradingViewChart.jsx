import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography, Button, IconButton } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SaveIcon from '@mui/icons-material/Save';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { tradingViewService } from '../../services/tradingview/tradingview.service';

const TradingViewChart = ({
  symbol = 'NASDAQ:NQ',
  interval = 'D',
  width = '100%',
  height = '600px',
  theme = 'dark',
  studies = [],
  onScreenshot,
  onSave,
  containerStyle,
  showToolbar = true,
  autoSizeContent = true,
}) => {
  const containerRef = useRef(null);
  const [widget, setWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartId, setChartId] = useState(`chart_${Math.random().toString(36).substring(2, 9)}`);

  // Load TradingView widget library if not present
  useEffect(() => {
    if (!window.TradingView) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => initializeWidget();
      script.onerror = () => setError('Failed to load TradingView library');
      document.head.appendChild(script);
      return () => {
        document.head.removeChild(script);
      };
    } else {
      initializeWidget();
    }
  }, []);

  // Initialize widget when dependencies change
  useEffect(() => {
    if (window.TradingView && containerRef.current && !widget) {
      initializeWidget();
    }
  }, [symbol, interval, theme, containerRef.current]);

  // Handle widget cleanup
  useEffect(() => {
    return () => {
      if (widget) {
        // TradingView widgets don't have a proper destroy method
        // This is a workaround to clean up
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      }
    };
  }, [widget]);

  const initializeWidget = () => {
    if (!containerRef.current || !window.TradingView) return;
    
    setLoading(true);
    setError(null);
    
    // Clear previous widget
    containerRef.current.innerHTML = '';
    
    try {
      // Create unique ID for the container
      containerRef.current.id = chartId;
      
      // Create widget options
      const widgetOptions = {
        symbol,
        interval,
        container_id: chartId,
        library_path: 'https://s3.tradingview.com/tv.js/',
        locale: 'en',
        theme,
        style: '1',
        toolbar_bg: theme === 'dark' ? '#1E1E1E' : '#F5F5F5',
        enable_publishing: false,
        allow_symbol_change: true,
        hide_top_toolbar: !showToolbar,
        hide_side_toolbar: !showToolbar,
        autosize: autoSizeContent,
        studies_overrides: {},
        width,
        height,
      };
      
      // Add studies if provided
      if (studies && studies.length > 0) {
        widgetOptions.studies = studies;
      }
      
      // Create widget
      const tvWidget = tradingViewService.createWidget(chartId, widgetOptions);
      
      // Set widget and loading state
      tvWidget.onChartReady(() => {
        setWidget(tvWidget);
        setLoading(false);
      });
    } catch (err) {
      console.error('Error initializing TradingView widget:', err);
      setError('Failed to initialize chart');
      setLoading(false);
    }
  };

  const handleScreenshot = async () => {
    if (!widget) return;
    
    try {
      const screenshot = await tradingViewService.takeScreenshot(chartId);
      if (onScreenshot) {
        onScreenshot(screenshot);
      }
    } catch (err) {
      console.error('Error taking screenshot:', err);
      setError('Failed to take screenshot');
    }
  };

  const handleSave = async () => {
    if (!widget) return;
    
    try {
      // This is a placeholder for what would be a real implementation
      // In a production app, you would get the chart's state from the widget
      const chartData = {
        symbol,
        interval,
        studies,
        layout: 'layout_data_would_go_here',
      };
      
      const result = await tradingViewService.saveChart(chartId, chartData);
      if (onSave) {
        onSave(result);
      }
    } catch (err) {
      console.error('Error saving chart:', err);
      setError('Failed to save chart');
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: width,
        height: height,
        ...containerStyle,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Chart toolbar */}
      {showToolbar && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '8px',
            gap: '8px',
            backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F5F5F5',
            borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
          }}
        >
          <IconButton size="small" onClick={handleScreenshot} title="Take Screenshot">
            <CameraAltIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleSave} title="Save Chart">
            <SaveIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      
      {/* Chart container */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          minHeight: '200px',
          backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F5F5F5',
        }}
      >
        {/* Loading overlay */}
        {loading && (
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
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 10,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        
        {/* Error message */}
        {error && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F5F5F5',
              padding: '16px',
              zIndex: 5,
            }}
          >
            <ErrorOutlineIcon color="error" sx={{ fontSize: 48, marginBottom: 2 }} />
            <Typography variant="h6" color="error" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={initializeWidget}
              sx={{ marginTop: 2 }}
            >
              Retry
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

TradingViewChart.propTypes = {
  symbol: PropTypes.string,
  interval: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  theme: PropTypes.oneOf(['light', 'dark']),
  studies: PropTypes.array,
  onScreenshot: PropTypes.func,
  onSave: PropTypes.func,
  containerStyle: PropTypes.object,
  showToolbar: PropTypes.bool,
  autoSizeContent: PropTypes.bool,
};

export default TradingViewChart;
