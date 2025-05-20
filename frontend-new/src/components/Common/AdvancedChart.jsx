import React, { useState, useRef, useEffect } from 'react';
import { 
  Box,
  Typography,
  Tabs,
  Tab,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  ButtonGroup,
  Button,
  Menu,
  MenuItem,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  DonutLarge as PieChartIcon,
  BubbleChart as ScatterChartIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  AccessTime as TimeIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  Brush,
  ReferenceArea,
  ReferenceLine
} from 'recharts';

/**
 * Advanced Chart Component with multiple visualization options
 * 
 * Features:
 * - Multiple chart types (line, area, bar, pie, scatter)
 * - Interactive controls (zoom, pan, brush)
 * - Time period selection
 * - Fullscreen mode
 * - Downloadable charts
 * - Responsive design
 * - Loading states
 * - Custom tooltips
 */
const AdvancedChart = ({ 
  data = [], 
  title = "Performance Chart",
  height = 400,
  initialChartType = 'area',
  colors = null, // Custom colors array
  xAxisKey = 'date',
  yAxisKey = 'value',
  secondaryYAxisKey = null, // Optional second y-axis
  isLoading = false,
  onRefresh = null, // Callback for refresh button
  timePeriods = ['1D', '1W', '1M', '3M', 'YTD', '1Y', 'All'],
  showControls = true,
  showTimeSelector = true,
  allowFullscreen = true,
  allowDownload = true,
  showLegend = true
}) => {
  const theme = useTheme();
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  
  // States
  const [chartType, setChartType] = useState(initialChartType);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('1M');
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState(null);
  const [timeMenuAnchor, setTimeMenuAnchor] = useState(null);
  const [zoomMode, setZoomMode] = useState(false);
  const [zoomArea, setZoomArea] = useState({ x1: null, x2: null });

  // Define chart colors based on theme
  const chartColors = colors || [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main
  ];
  
  // Handle chart type change
  const handleChartTypeChange = (type) => {
    setChartType(type);
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
          containerRef.current.webkitRequestFullscreen();
        } else if (containerRef.current.msRequestFullscreen) {
          containerRef.current.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }
  };
  
  // Download chart as image
  const downloadChart = () => {
    if (chartRef.current) {
      try {
        const svg = chartRef.current.querySelector('svg');
        if (svg) {
          // Create a canvas and draw the SVG on it
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const svgData = new XMLSerializer().serializeToString(svg);
          const img = new Image();
          
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = theme.palette.background.paper;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            
            // Create download link
            const link = document.createElement('a');
            link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
          };
          
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        }
      } catch (error) {
        console.error('Failed to download chart:', error);
      }
    }
  };
  
  // Handle time period selection
  const handleTimePeriodChange = (period) => {
    setSelectedTimePeriod(period);
    setTimeMenuAnchor(null);
    // In a real app, you would filter data based on period
  };
  
  // Handle settings menu
  const handleSettingsClick = (event) => {
    setSettingsMenuAnchor(event.currentTarget);
  };
  
  const handleSettingsClose = () => {
    setSettingsMenuAnchor(null);
  };
  
  // Handle time menu
  const handleTimeMenuClick = (event) => {
    setTimeMenuAnchor(event.currentTarget);
  };
  
  const handleTimeMenuClose = () => {
    setTimeMenuAnchor(null);
  };
  
  // Setup fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.msFullscreenElement
      );
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle zoom functionality
  const handleMouseDown = (e) => {
    if (!zoomMode) return;
    
    const { activeCoordinate } = e;
    if (activeCoordinate) {
      setZoomArea({ x1: activeCoordinate.x, x2: null });
    }
  };
  
  const handleMouseMove = (e) => {
    if (!zoomMode || zoomArea.x1 === null) return;
    
    const { activeCoordinate } = e;
    if (activeCoordinate) {
      setZoomArea({ ...zoomArea, x2: activeCoordinate.x });
    }
  };
  
  const handleMouseUp = () => {
    if (!zoomMode || zoomArea.x1 === null || zoomArea.x2 === null) return;
    
    // In a real app, you would zoom the chart based on zoomArea
    // Reset zoom area after applying zoom
    setZoomArea({ x1: null, x2: null });
  };
  
  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
            borderRadius: '8px',
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
            padding: '10px 14px',
            fontSize: '12px',
            fontWeight: 600,
            maxWidth: '250px'
          }}
        >
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={`tooltip-item-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: entry.color,
                    mr: 1
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {entry.name}:
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: entry.color }}>
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    
    return null;
  };
  
  // Render appropriate chart based on selected type
  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <AreaChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <defs>
              {Object.keys(data[0] || {}).filter(k => k !== xAxisKey && typeof data[0]?.[k] === 'number').map((key, index) => (
                <linearGradient key={`gradient-${key}`} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.07)} />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fill: theme.palette.text.secondary, fontSize: 11, fontWeight: 500 }} 
              axisLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
              tickLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: theme.palette.text.secondary, fontSize: 11, fontWeight: 500 }} 
              axisLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
              tickLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            {secondaryYAxisKey && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fill: theme.palette.text.secondary, fontSize: 11, fontWeight: 500 }} 
                axisLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
                tickLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
                tickFormatter={(value) => value.toLocaleString()}
              />
            )}
            <RechartsTooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: 12, marginTop: 10 }} />}
            <Brush 
              dataKey={xAxisKey} 
              height={30} 
              stroke={theme.palette.primary.main}
              fill={alpha(theme.palette.background.paper, 0.8)}
              travellerWidth={10}
              y={height - 40}
            />
            
            {Object.keys(data[0] || {}).filter(k => k !== xAxisKey && typeof data[0]?.[k] === 'number').map((key, index) => (
              <Area
                key={`area-${key}`}
                type="monotone"
                dataKey={key}
                yAxisId={key === secondaryYAxisKey ? "right" : "left"}
                name={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                stroke={chartColors[index % chartColors.length]}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#gradient-${key})`}
                dot={{ r: 2 }}
                activeDot={{ 
                  r: 6, 
                  stroke: theme.palette.background.paper, 
                  strokeWidth: 2,
                  fill: chartColors[index % chartColors.length]
                }}
              />
            ))}
            
            {zoomArea.x1 !== null && zoomArea.x2 !== null && (
              <ReferenceArea 
                x1={Math.min(zoomArea.x1, zoomArea.x2)} 
                x2={Math.max(zoomArea.x1, zoomArea.x2)} 
                strokeOpacity={0.3}
                fillOpacity={0.3}
              />
            )}
          </AreaChart>
        );
        
      case 'bar':
        return (
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.07)} vertical={false} />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fill: theme.palette.text.secondary, fontSize: 11, fontWeight: 500 }} 
              axisLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
              tickLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
            />
            <YAxis 
              tick={{ fill: theme.palette.text.secondary, fontSize: 11, fontWeight: 500 }} 
              axisLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
              tickLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: 12, marginTop: 10 }} />}
            
            {Object.keys(data[0] || {}).filter(k => k !== xAxisKey && typeof data[0]?.[k] === 'number').map((key, index) => (
              <Bar
                key={`bar-${key}`}
                dataKey={key}
                name={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                fill={chartColors[index % chartColors.length]}
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            ))}
          </BarChart>
        );
        
      case 'line':
        return (
          <LineChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.07)} />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fill: theme.palette.text.secondary, fontSize: 11, fontWeight: 500 }} 
              axisLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
              tickLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: theme.palette.text.secondary, fontSize: 11, fontWeight: 500 }} 
              axisLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
              tickLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            {secondaryYAxisKey && (
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fill: theme.palette.text.secondary, fontSize: 11, fontWeight: 500 }} 
                axisLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
                tickLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
                tickFormatter={(value) => value.toLocaleString()}
              />
            )}
            <RechartsTooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: 12, marginTop: 10 }} />}
            
            {Object.keys(data[0] || {}).filter(k => k !== xAxisKey && typeof data[0]?.[k] === 'number').map((key, index) => (
              <Line
                key={`line-${key}`}
                type="monotone"
                dataKey={key}
                yAxisId={key === secondaryYAxisKey ? "right" : "left"}
                name={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                stroke={chartColors[index % chartColors.length]}
                strokeWidth={2}
                dot={{ r: 3, fill: chartColors[index % chartColors.length], stroke: theme.palette.background.paper, strokeWidth: 1 }}
                activeDot={{ 
                  r: 6, 
                  stroke: theme.palette.background.paper, 
                  strokeWidth: 2,
                  fill: chartColors[index % chartColors.length]
                }}
              />
            ))}
            
            {/* Add reference line for 0 if any values are negative */}
            {data.some(item => Object.keys(item).some(key => key !== xAxisKey && typeof item[key] === 'number' && item[key] < 0)) && (
              <ReferenceLine y={0} stroke={alpha(theme.palette.text.primary, 0.2)} strokeDasharray="3 3" />
            )}
          </LineChart>
        );
        
      case 'pie':
        return (
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            {Object.keys(data[0] || {}).filter(k => k !== xAxisKey && typeof data[0]?.[k] === 'number').length > 0 && (
              <Pie
                data={data}
                dataKey={Object.keys(data[0] || {}).find(k => k !== xAxisKey && typeof data[0]?.[k] === 'number')}
                nameKey={xAxisKey}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
            )}
            <RechartsTooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: 12, marginTop: 20 }} />}
          </PieChart>
        );
        
      case 'scatter':
        return (
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.07)} />
            <XAxis 
              dataKey={xAxisKey}
              type="number"
              tick={{ fill: theme.palette.text.secondary, fontSize: 11, fontWeight: 500 }} 
              axisLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
              tickLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              dataKey={yAxisKey}
              type="number"
              tick={{ fill: theme.palette.text.secondary, fontSize: 11, fontWeight: 500 }} 
              axisLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
              tickLine={{ stroke: alpha(theme.palette.text.primary, 0.1) }}
              domain={['dataMin', 'dataMax']}
            />
            <ZAxis dataKey="z" range={[50, 500]} />
            <RechartsTooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: 12, marginTop: 10 }} />}
            
            <Scatter
              data={data}
              fill={theme.palette.primary.main}
              shape="circle"
              name={yAxisKey.charAt(0).toUpperCase() + yAxisKey.slice(1).replace(/([A-Z])/g, ' $1')}
            />
          </ScatterChart>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : height,
        backgroundColor: theme.palette.background.paper,
        borderRadius: isFullscreen ? 0 : 3,
        border: isFullscreen ? 'none' : `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        overflow: 'hidden',
        transition: 'all 0.3s',
        '&.fullscreen': {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          width: '100vw',
          height: '100vh'
        }
      }}
      className={isFullscreen ? 'fullscreen' : ''}
    >
      {/* Chart Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Time Period Selector */}
          {showTimeSelector && (
            <Box>
              <Button
                variant="outlined"
                size="small"
                endIcon={<ArrowDropDownIcon />}
                onClick={handleTimeMenuClick}
                sx={{ 
                  fontWeight: 600,
                  borderRadius: 2,
                  height: 36,
                  borderColor: alpha(theme.palette.text.primary, 0.15)
                }}
              >
                <TimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                {selectedTimePeriod}
              </Button>
              
              <Menu
                anchorEl={timeMenuAnchor}
                open={Boolean(timeMenuAnchor)}
                onClose={handleTimeMenuClose}
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
                    borderRadius: 2,
                    mt: 1,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)',
                    border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
                  }
                }}
              >
                {timePeriods.map(period => (
                  <MenuItem 
                    key={period} 
                    onClick={() => handleTimePeriodChange(period)}
                    selected={selectedTimePeriod === period}
                    sx={{ minWidth: 100 }}
                  >
                    {period}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
          
          {/* Action Buttons */}
          {showControls && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {onRefresh && (
                <Tooltip title="Refresh Data">
                  <IconButton 
                    size="small" 
                    onClick={onRefresh}
                    sx={{ 
                      borderRadius: 2, 
                      backgroundColor: alpha(theme.palette.text.primary, 0.04),
                      '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.08) }
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              <Tooltip title="Chart Settings">
                <IconButton 
                  size="small" 
                  onClick={handleSettingsClick}
                  sx={{ 
                    borderRadius: 2, 
                    backgroundColor: alpha(theme.palette.text.primary, 0.04),
                    '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.08) }
                  }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              {allowDownload && (
                <Tooltip title="Download Chart">
                  <IconButton 
                    size="small" 
                    onClick={downloadChart}
                    sx={{ 
                      borderRadius: 2, 
                      backgroundColor: alpha(theme.palette.text.primary, 0.04),
                      '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.08) }
                    }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {allowFullscreen && (
                <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                  <IconButton 
                    size="small" 
                    onClick={toggleFullscreen}
                    sx={{ 
                      borderRadius: 2, 
                      backgroundColor: alpha(theme.palette.text.primary, 0.04),
                      '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.08) }
                    }}
                  >
                    {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              )}
              
              {/* Settings Menu */}
              <Menu
                anchorEl={settingsMenuAnchor}
                open={Boolean(settingsMenuAnchor)}
                onClose={handleSettingsClose}
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
                    borderRadius: 2,
                    mt: 1,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.05)',
                    border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
                  }
                }}
              >
                <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: alpha(theme.palette.text.primary, 0.6) }}>
                  Chart Type
                </Typography>
                
                <MenuItem onClick={() => { handleChartTypeChange('area'); handleSettingsClose(); }}>
                  <AreaChart width={16} height={16} data={[{x: 0, y: 2}, {x: 1, y: 1}, {x: 2, y: 3}]}>
                    <Area type="monotone" dataKey="y" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} />
                  </AreaChart>
                  <Typography sx={{ ml: 2 }}>Area Chart</Typography>
                </MenuItem>
                
                <MenuItem onClick={() => { handleChartTypeChange('line'); handleSettingsClose(); }}>
                  <LineChartIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                  <Typography sx={{ ml: 2 }}>Line Chart</Typography>
                </MenuItem>
                
                <MenuItem onClick={() => { handleChartTypeChange('bar'); handleSettingsClose(); }}>
                  <BarChartIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                  <Typography sx={{ ml: 2 }}>Bar Chart</Typography>
                </MenuItem>
                
                <MenuItem onClick={() => { handleChartTypeChange('pie'); handleSettingsClose(); }}>
                  <PieChartIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                  <Typography sx={{ ml: 2 }}>Pie Chart</Typography>
                </MenuItem>
                
                <MenuItem onClick={() => { handleChartTypeChange('scatter'); handleSettingsClose(); }}>
                  <ScatterChartIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                  <Typography sx={{ ml: 2 }}>Scatter Plot</Typography>
                </MenuItem>
                
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: alpha(theme.palette.text.primary, 0.6) }}>
                  Chart Controls
                </Typography>
                
                <MenuItem onClick={() => { setZoomMode(!zoomMode); handleSettingsClose(); }}>
                  <FilterIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                  <Typography sx={{ ml: 2 }}>
                    {zoomMode ? 'Disable Zoom Mode' : 'Enable Zoom Mode'}
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Chart Type Tabs (for mobile) */}
      {showControls && (
        <Box 
          sx={{ 
            display: { xs: 'flex', md: 'none' }, 
            overflow: 'auto',
            borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
            px: 2,
            pt: 1
          }}
        >
          <ButtonGroup size="small" aria-label="chart type" sx={{ width: '100%', overflow: 'auto' }}>
            <Button 
              onClick={() => handleChartTypeChange('area')} 
              variant={chartType === 'area' ? 'contained' : 'outlined'}
              sx={{ borderRadius: '8px 0 0 8px' }}
            >
              Area
            </Button>
            <Button 
              onClick={() => handleChartTypeChange('line')} 
              variant={chartType === 'line' ? 'contained' : 'outlined'}
            >
              Line
            </Button>
            <Button 
              onClick={() => handleChartTypeChange('bar')} 
              variant={chartType === 'bar' ? 'contained' : 'outlined'}
            >
              Bar
            </Button>
            <Button 
              onClick={() => handleChartTypeChange('pie')} 
              variant={chartType === 'pie' ? 'contained' : 'outlined'}
            >
              Pie
            </Button>
            <Button 
              onClick={() => handleChartTypeChange('scatter')} 
              variant={chartType === 'scatter' ? 'contained' : 'outlined'}
              sx={{ borderRadius: '0 8px 8px 0' }}
            >
              Scatter
            </Button>
          </ButtonGroup>
        </Box>
      )}
      
      {/* Chart Container */}
      <Box 
        ref={chartRef}
        sx={{ 
          width: '100%', 
          height: isFullscreen 
            ? 'calc(100vh - 112px)' // Adjust for header and tabs in fullscreen
            : showControls 
              ? `calc(${height}px - 112px)` // Adjust for header and tabs
              : `calc(${height}px - 64px)`, // Adjust for header only
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
              Loading chart data...
            </Typography>
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box 
              component={BarChartIcon} 
              sx={{ 
                width: 40, 
                height: 40, 
                color: alpha(theme.palette.text.primary, 0.2) 
              }} 
            />
            <Typography variant="body2" color="text.secondary">
              No data available to display
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
};

export default AdvancedChart;