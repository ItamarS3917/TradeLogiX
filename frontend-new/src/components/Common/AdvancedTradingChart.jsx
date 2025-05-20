import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  useTheme, 
  alpha,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { useMobile } from '../../contexts/MobileContext';
import { ResponsiveTouchContainer } from './Responsive';

// Import icons
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

/**
 * AdvancedTradingChart component with advanced visualization options and mobile optimization
 *
 * Features:
 * - Multiple chart types (line, bar, candlestick)
 * - Touch optimized controls for mobile/tablet
 * - Responsive layout based on screen size
 * - Interactive zoom and pan functionality
 * - Indicator overlays with customization
 * - Advanced styling with visual polish
 * 
 * Props:
 * - data: data to visualize
 * - chartType: type of chart to display (line, bar, candlestick)
 * - title: chart title
 * - height: chart height
 * - width: chart width
 * - showControls: whether to show chart controls
 * - allowFullscreen: whether to show fullscreen option
 * - showIndicators: whether to show technical indicator options
 * - indicators: array of indicators to display
 * - onZoom: zoom event handler
 * - onChartTypeChange: chart type change handler
 * - theme: theme override
 */
const AdvancedTradingChart = ({
  data = [],
  chartType: initialChartType = 'candlestick',
  title = 'Trading Chart',
  height = 400,
  width = '100%',
  showControls = true,
  allowFullscreen = true,
  showIndicators = true,
  indicators = [],
  onZoom,
  onChartTypeChange,
  ...props
}) => {
  const theme = useTheme();
  const { isMobile, isTablet } = useMobile();
  const containerRef = useRef(null);
  
  // State for chart
  const [chartType, setChartType] = useState(initialChartType);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState(indicators);
  const [timeframe, setTimeframe] = useState('1D');
  
  // Update chart type when prop changes
  useEffect(() => {
    setChartType(initialChartType);
  }, [initialChartType]);
  
  // Handle fullscreen toggling
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle zoom
  const handleZoom = (zoomIn) => {
    const newZoomLevel = zoomIn 
      ? Math.min(zoomLevel + 0.25, 3) 
      : Math.max(zoomLevel - 0.25, 0.5);
    
    setZoomLevel(newZoomLevel);
    
    if (onZoom) {
      onZoom(newZoomLevel);
    }
  };
  
  // Handle chart type change
  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType) {
      setChartType(newChartType);
      
      if (onChartTypeChange) {
        onChartTypeChange(newChartType);
      }
    }
  };
  
  // Handle indicator change
  const handleIndicatorChange = (event) => {
    const value = event.target.value;
    setActiveIndicators(value);
  };
  
  // Handle timeframe change
  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };
  
  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  // Handle swipe gestures for mobile
  const handleSwipeLeft = () => {
    if (isMobile || isTablet) {
      // Navigate to next period in data
      console.log('Swiped left - show next period');
    }
  };
  
  const handleSwipeRight = () => {
    if (isMobile || isTablet) {
      // Navigate to previous period in data
      console.log('Swiped right - show previous period');
    }
  };
  
  // Handle pinch gesture for mobile zoom
  const handlePinch = (scale) => {
    if (isMobile || isTablet) {
      const newZoomLevel = Math.max(0.5, Math.min(3, zoomLevel * scale));
      setZoomLevel(newZoomLevel);
      
      if (onZoom) {
        onZoom(newZoomLevel);
      }
    }
  };
  
  // Calculate responsive dimensions
  const chartHeight = isFullscreen 
    ? window.innerHeight - 100 
    : isMobile 
      ? 300 
      : height;
  
  const controlsHeight = showControls ? (isMobile ? 50 : 60) : 0;
  
  // Placeholder data for demonstration - remove in production
  const placeholderData = !data.length ? [
    { date: '2025-01-01', open: 100, high: 110, low: 95, close: 105, volume: 1000 },
    { date: '2025-01-02', open: 105, high: 115, low: 100, close: 110, volume: 1200 },
    { date: '2025-01-03', open: 110, high: 120, low: 105, close: 115, volume: 1500 },
    { date: '2025-01-04', open: 115, high: 125, low: 110, close: 120, volume: 1800 },
    { date: '2025-01-05', open: 120, high: 130, low: 115, close: 125, volume: 2000 }
  ] : data;
  
  return (
    <ResponsiveTouchContainer
      ref={containerRef}
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      onPinch={handlePinch}
      sx={{ 
        width: width,
        height: isFullscreen ? '100vh' : 'auto', 
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Card
        sx={{
          height: '100%',
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
          background: theme.palette.background.paper,
          borderRadius: '16px',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0px 8px 24px rgba(0, 0, 0, 0.4)' 
            : '0px 8px 24px rgba(0, 0, 0, 0.08)'
        }}
        {...props}
      >
        {/* Chart Header with Controls */}
        <Box
          sx={{
            p: isMobile ? 1 : 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`
          }}
        >
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            component="h2"
            fontWeight={600}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1 
            }}
          >
            {chartType === 'candlestick' && <CandlestickChartIcon color="primary" />}
            {chartType === 'line' && <ShowChartIcon color="primary" />}
            {chartType === 'bar' && <BarChartIcon color="primary" />}
            {title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Timeframe Selection - Compact for Mobile */}
            {!isMobile && (
              <FormControl 
                variant="outlined" 
                size="small" 
                sx={{ minWidth: 80, mr: 1 }}
              >
                <Select
                  value={timeframe}
                  onChange={handleTimeframeChange}
                  displayEmpty
                  sx={{ 
                    height: 36,
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.text.primary, 0.1)
                    }
                  }}
                >
                  <MenuItem value="1H">1H</MenuItem>
                  <MenuItem value="4H">4H</MenuItem>
                  <MenuItem value="1D">1D</MenuItem>
                  <MenuItem value="1W">1W</MenuItem>
                  <MenuItem value="1M">1M</MenuItem>
                </Select>
              </FormControl>
            )}
            
            {/* Chart Type Selection */}
            {showControls && !isMobile && (
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={handleChartTypeChange}
                aria-label="chart type"
                size="small"
              >
                <ToggleButton value="line" aria-label="line chart">
                  <Tooltip title="Line Chart">
                    <ShowChartIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="bar" aria-label="bar chart">
                  <Tooltip title="Bar Chart">
                    <BarChartIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="candlestick" aria-label="candlestick chart">
                  <Tooltip title="Candlestick Chart">
                    <CandlestickChartIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            )}
            
            {/* Mobile controls are simplified */}
            {isMobile && (
              <Tooltip title="Settings">
                <IconButton 
                  size="small" 
                  onClick={toggleSettings}
                  color={showSettings ? "primary" : "default"}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {/* Zoom controls */}
            {showControls && !isMobile && (
              <>
                <Tooltip title="Zoom Out">
                  <IconButton 
                    size="small" 
                    onClick={() => handleZoom(false)} 
                    disabled={zoomLevel <= 0.5}
                  >
                    <ZoomOutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom In">
                  <IconButton 
                    size="small" 
                    onClick={() => handleZoom(true)} 
                    disabled={zoomLevel >= 3}
                  >
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            {/* Fullscreen toggle */}
            {allowFullscreen && (
              <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <IconButton size="small" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <FullscreenExitIcon fontSize="small" />
                  ) : (
                    <FullscreenIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        
        {/* Mobile settings panel */}
        {showSettings && isMobile && (
          <Box
            sx={{
              p: 1.5,
              borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1
            }}>
              <Typography variant="subtitle2">Chart Settings</Typography>
              <IconButton size="small" onClick={toggleSettings}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" sx={{ minWidth: 80 }}>Timeframe:</Typography>
              <FormControl variant="outlined" size="small" fullWidth>
                <Select
                  value={timeframe}
                  onChange={handleTimeframeChange}
                  displayEmpty
                  sx={{ 
                    height: 36,
                    fontSize: '0.875rem'
                  }}
                >
                  <MenuItem value="1H">1H</MenuItem>
                  <MenuItem value="4H">4H</MenuItem>
                  <MenuItem value="1D">1D</MenuItem>
                  <MenuItem value="1W">1W</MenuItem>
                  <MenuItem value="1M">1M</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" sx={{ minWidth: 80 }}>Chart Type:</Typography>
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={handleChartTypeChange}
                aria-label="chart type"
                size="small"
                fullWidth
              >
                <ToggleButton value="line" aria-label="line chart">
                  <ShowChartIcon fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>Line</Typography>
                </ToggleButton>
                <ToggleButton value="bar" aria-label="bar chart">
                  <BarChartIcon fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>Bar</Typography>
                </ToggleButton>
                <ToggleButton value="candlestick" aria-label="candlestick chart">
                  <CandlestickChartIcon fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>Candle</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            {showIndicators && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ minWidth: 80 }}>Indicators:</Typography>
                <FormControl variant="outlined" size="small" fullWidth>
                  <Select
                    multiple
                    value={activeIndicators}
                    onChange={handleIndicatorChange}
                    renderValue={(selected) => selected.join(', ')}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <MenuItem value="MA">Moving Average</MenuItem>
                    <MenuItem value="EMA">EMA</MenuItem>
                    <MenuItem value="RSI">RSI</MenuItem>
                    <MenuItem value="MACD">MACD</MenuItem>
                    <MenuItem value="BB">Bollinger Bands</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        )}
        
        {/* Chart Content */}
        <CardContent 
          sx={{ 
            p: 0, 
            height: `calc(100% - ${controlsHeight}px)`, 
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Chart placeholder - replace with actual chart implementation */}
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              color: theme.palette.text.secondary,
              fontSize: '0.875rem',
              '& > *': {
                zIndex: 2
              }
            }}
          >
            {/* This is a placeholder - replace with actual chart implementation */}
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              {chartType === 'candlestick' && 'Candlestick Chart'}
              {chartType === 'line' && 'Line Chart'}
              {chartType === 'bar' && 'Bar Chart'}
              {' - '}{placeholderData.length} data points - Zoom: {zoomLevel.toFixed(2)}x
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Use the controls above to change chart settings
              {(isMobile || isTablet) && '. Swipe to navigate, pinch to zoom'}
            </Typography>
            
            {/* Replace the mock visualization with actual chart implementation */}
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: chartType === 'candlestick' 
                  ? `url("data:image/svg+xml,%3Csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30,150 v-50 h30 v50 z M30,120 v-20 M60,120 v-20 M90,100 v-30 h30 v30 z M90,80 v-30 M120,80 v-30 M150,100 v40 h30 v-40 z M150,130 v20 M180,130 v20 M210,90 v-40 h30 v40 z M210,65 v-15 M240,65 v-15 M270,110 v30 h30 v-30 z M270,125 v15 M300,125 v15 M330,80 v-30 h30 v30 z M330,60 v-10 M360,60 v-10' stroke='${chartType === 'candlestick' ? (theme.palette.mode === 'dark' ? '%23808080' : '%23404040') : 'transparent'}' fill='none' stroke-width='2'/%3E%3C/svg%3E")`
                  : chartType === 'line'
                  ? `url("data:image/svg+xml,%3Csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,150 L50,140 L100,120 L150,110 L200,70 L250,90 L300,50 L350,30 L400,10' fill='none' stroke='${theme.palette.mode === 'dark' ? '%234080F0' : '%231E88E5'}' stroke-width='3'/%3E%3C/svg%3E")`
                  : `url("data:image/svg+xml,%3Csvg width='400' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='10' y='120' width='30' height='30' fill='${theme.palette.mode === 'dark' ? '%234CAF50' : '%2343A047'}' /%3E%3Crect x='50' y='100' width='30' height='50' fill='${theme.palette.mode === 'dark' ? '%23F44336' : '%23E53935'}' /%3E%3Crect x='90' y='80' width='30' height='70' fill='${theme.palette.mode === 'dark' ? '%234CAF50' : '%2343A047'}' /%3E%3Crect x='130' y='60' width='30' height='90' fill='${theme.palette.mode === 'dark' ? '%234CAF50' : '%2343A047'}' /%3E%3Crect x='170' y='90' width='30' height='60' fill='${theme.palette.mode === 'dark' ? '%23F44336' : '%23E53935'}' /%3E%3Crect x='210' y='110' width='30' height='40' fill='${theme.palette.mode === 'dark' ? '%234CAF50' : '%2343A047'}' /%3E%3Crect x='250' y='70' width='30' height='80' fill='${theme.palette.mode === 'dark' ? '%234CAF50' : '%2343A047'}' /%3E%3Crect x='290' y='130' width='30' height='20' fill='${theme.palette.mode === 'dark' ? '%23F44336' : '%23E53935'}' /%3E%3Crect x='330' y='90' width='30' height='60' fill='${theme.palette.mode === 'dark' ? '%234CAF50' : '%2343A047'}' /%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: `${100 * zoomLevel}% auto`,
                opacity: 0.7,
                zIndex: 1
              }}
            />
            
            {/* Indicators legend */}
            {showIndicators && activeIndicators.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: isMobile ? 8 : 16,
                  right: isMobile ? 8 : 16,
                  zIndex: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(4px)',
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                  borderRadius: '6px',
                  padding: isMobile ? '4px 8px' : '6px 12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  maxWidth: isMobile ? '120px' : '180px'
                }}
              >
                {activeIndicators.map(indicator => (
                  <Box
                    key={indicator}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: isMobile ? '0.7rem' : '0.75rem'
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor:
                          indicator === 'MA' ? '#1E88E5' :
                          indicator === 'EMA' ? '#7B61FF' :
                          indicator === 'RSI' ? '#FF9500' :
                          indicator === 'MACD' ? '#00C853' :
                          '#F23645'
                      }}
                    />
                    <Typography variant="caption" noWrap>
                      {indicator === 'MA' ? 'Moving Avg (20)' :
                       indicator === 'EMA' ? 'EMA (20)' :
                       indicator === 'RSI' ? 'RSI (14)' :
                       indicator === 'MACD' ? 'MACD' :
                       'Bollinger Bands'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            
            {/* Mobile zoom controls - displayed on touch */}
            {(isMobile || isTablet) && showControls && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  zIndex: 3,
                  display: 'flex',
                  gap: 1,
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: 'blur(4px)',
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                  borderRadius: '8px',
                  padding: '4px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}
              >
                <IconButton 
                  size="small" 
                  onClick={() => handleZoom(false)} 
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleZoom(true)} 
                  disabled={zoomLevel >= 3}
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </ResponsiveTouchContainer>
  );
};

AdvancedTradingChart.propTypes = {
  data: PropTypes.array,
  chartType: PropTypes.oneOf(['line', 'bar', 'candlestick']),
  title: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showControls: PropTypes.bool,
  allowFullscreen: PropTypes.bool,
  showIndicators: PropTypes.bool,
  indicators: PropTypes.array,
  onZoom: PropTypes.func,
  onChartTypeChange: PropTypes.func
};

export default AdvancedTradingChart;