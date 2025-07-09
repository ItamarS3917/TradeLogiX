import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  ButtonGroup,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  useTheme,
  alpha,
  FormControl,
  Select,
  InputLabel,
  Divider,
  Avatar,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  ShowChart as LineChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ScatterPlot as ScatterIcon,
  TrendingUp as TrendingUpIcon,
  CalendarMonth as HeatmapIcon,
  MoreVert as MoreIcon,
  Fullscreen as FullscreenIcon,
  GetApp as DownloadIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  DonutSmall as DonutIcon,
  Insights as InsightsIcon,
  AutoGraph as AutoGraphIcon
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart,
  ReferenceLine,
  Brush
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

/**
 * Advanced Chart Visualizations Component
 * 
 * Provides sophisticated chart visualizations for trading data with multiple
 * chart types, interactive features, and customization options.
 */
const AdvancedChartVisualizations = ({
  data = [],
  title = "Performance Analytics",
  subtitle = "Advanced trading visualizations",
  height = 400,
  enableInteraction = true,
  enableAnimation = true,
  showControls = true,
  defaultChartType = 'area',
  timeframe = '1M',
  onChartTypeChange,
  onTimeframeChange,
  onDataPointClick
}) => {
  const theme = useTheme();
  
  // State management
  const [chartType, setChartType] = useState(defaultChartType);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('cumulativePnL');
  const [zoomDomain, setZoomDomain] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Chart type configuration
  const chartTypes = [
    { 
      id: 'area', 
      label: 'Area Chart', 
      icon: <AutoGraphIcon />, 
      description: 'Smooth area visualization showing trends over time'
    },
    { 
      id: 'line', 
      label: 'Line Chart', 
      icon: <LineChartIcon />, 
      description: 'Clean line visualization for precise data tracking'
    },
    { 
      id: 'bar', 
      label: 'Bar Chart', 
      icon: <BarChartIcon />, 
      description: 'Discrete bars showing individual performance periods'
    },
    { 
      id: 'candlestick', 
      label: 'Candlestick', 
      icon: <TimelineIcon />, 
      description: 'OHLC-style visualization for detailed period analysis'
    },
    { 
      id: 'heatmap', 
      label: 'Heatmap', 
      icon: <HeatmapIcon />, 
      description: 'Calendar heatmap showing performance by day/time'
    },
    { 
      id: 'scatter', 
      label: 'Scatter Plot', 
      icon: <ScatterIcon />, 
      description: 'Correlation analysis between different metrics'
    },
    { 
      id: 'pie', 
      label: 'Distribution', 
      icon: <DonutIcon />, 
      description: 'Pie chart showing win/loss distribution'
    }
  ];
  
  // Available metrics for visualization
  const metrics = [
    { id: 'cumulativePnL', label: 'Cumulative P&L', color: theme.palette.primary.main },
    { id: 'dailyPnL', label: 'Daily P&L', color: theme.palette.success.main },
    { id: 'winRate', label: 'Win Rate', color: theme.palette.info.main },
    { id: 'volume', label: 'Trade Volume', color: theme.palette.warning.main },
    { id: 'drawdown', label: 'Drawdown', color: theme.palette.error.main }
  ];
  
  // Generate sample data if none provided
  const chartData = useMemo(() => {
    if (data.length > 0) return data;
    
    // Generate sample trading data
    const days = 30;
    const sampleData = [];
    let cumulativePnL = 1000;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dailyPnL = (Math.random() - 0.45) * 200; // Slight positive bias
      cumulativePnL += dailyPnL;
      
      sampleData.push({
        date: format(date, 'MMM dd'),
        fullDate: date,
        dailyPnL: parseFloat(dailyPnL.toFixed(2)),
        cumulativePnL: parseFloat(cumulativePnL.toFixed(2)),
        winRate: Math.random() * 40 + 50, // 50-90%
        volume: Math.floor(Math.random() * 10) + 1,
        drawdown: Math.random() * -100,
        high: cumulativePnL + Math.random() * 50,
        low: cumulativePnL - Math.random() * 50,
        open: cumulativePnL + (Math.random() - 0.5) * 30,
        close: cumulativePnL
      });
    }
    
    return sampleData;
  }, [data]);
  
  // Calculate moving average
  const calculateMovingAverage = (data, window = 7) => {
    return data.map((item, index) => {
      if (index < window - 1) return { ...item, ma: null };
      
      const sum = data
        .slice(index - window + 1, index + 1)
        .reduce((acc, curr) => acc + curr[selectedMetric], 0);
      
      return {
        ...item,
        ma: parseFloat((sum / window).toFixed(2))
      };
    });
  };
  
  // Processed data with moving average
  const processedData = useMemo(() => {
    let processed = [...chartData];
    
    if (showMovingAverage) {
      processed = calculateMovingAverage(processed);
    }
    
    return processed;
  }, [chartData, showMovingAverage, selectedMetric]);
  
  // Generate heatmap data
  const generateHeatmapData = () => {
    const startDate = subDays(new Date(), 90);
    const endDate = new Date();
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(date => ({
      date: format(date, 'yyyy-MM-dd'),
      day: format(date, 'EEE'),
      week: format(startOfWeek(date), 'MMM dd'),
      value: Math.random() * 200 - 100, // Random P&L for demo
      count: Math.floor(Math.random() * 10)
    }));
  };
  
  // Handle chart type change
  const handleChartTypeChange = (newType) => {
    setChartType(newType);
    setMenuAnchor(null);
    if (onChartTypeChange) {
      onChartTypeChange(newType);
    }
  };
  
  // Handle data point click
  const handleDataPointClick = (data, index) => {
    if (onDataPointClick) {
      onDataPointClick(data, index);
    }
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(8px)',
            border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
            borderRadius: 2,
            p: 2,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: entry.color
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {entry.name}: {entry.value}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };
  
  // Render different chart types
  const renderChart = () => {
    const commonProps = {
      data: processedData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };
    
    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metrics.find(m => m.id === selectedMetric)?.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={metrics.find(m => m.id === selectedMetric)?.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={metrics.find(m => m.id === selectedMetric)?.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${selectedMetric})`}
              onClick={handleDataPointClick}
            />
            {showMovingAverage && (
              <Area
                type="monotone"
                dataKey="ma"
                stroke={theme.palette.warning.main}
                strokeWidth={1}
                strokeDasharray="5 5"
                fill="none"
              />
            )}
            {enableInteraction && <Brush dataKey="date" height={30} />}
          </AreaChart>
        );
        
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={metrics.find(m => m.id === selectedMetric)?.color}
              strokeWidth={2}
              dot={{ r: 4, fill: metrics.find(m => m.id === selectedMetric)?.color }}
              activeDot={{ r: 6, fill: metrics.find(m => m.id === selectedMetric)?.color }}
              onClick={handleDataPointClick}
            />
            {showMovingAverage && (
              <Line
                type="monotone"
                dataKey="ma"
                stroke={theme.palette.warning.main}
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        );
        
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={selectedMetric} 
              fill={metrics.find(m => m.id === selectedMetric)?.color}
              radius={[2, 2, 0, 0]}
              onClick={handleDataPointClick}
            />
          </BarChart>
        );
        
      case 'candlestick':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="high" fill={alpha(theme.palette.success.main, 0.3)} />
            <Bar dataKey="low" fill={alpha(theme.palette.error.main, 0.3)} />
            <Line type="monotone" dataKey="close" stroke={theme.palette.primary.main} strokeWidth={2} />
          </ComposedChart>
        );
        
      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
            <XAxis 
              dataKey="winRate" 
              name="Win Rate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis 
              dataKey="dailyPnL" 
              name="Daily P&L"
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Scatter dataKey="dailyPnL" fill={theme.palette.primary.main} />
          </ScatterChart>
        );
        
      case 'pie':
        const pieData = [
          { name: 'Wins', value: 65, color: theme.palette.success.main },
          { name: 'Losses', value: 35, color: theme.palette.error.main }
        ];
        
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        );
        
      default:
        return renderChart();
    }
  };
  
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(12px)',
        height: isFullscreen ? '90vh' : 'auto'
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            <InsightsIcon color="primary" />
          </Avatar>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
            <Chip 
              label={chartTypes.find(ct => ct.id === chartType)?.label || 'Chart'}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
            />
          </Box>
        }
        subheader={subtitle}
        action={
          showControls && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {/* Chart Type Selector */}
              <ButtonGroup size="small" variant="outlined">
                {chartTypes.slice(0, 3).map((type) => (
                  <Tooltip key={type.id} title={type.description}>
                    <Button
                      onClick={() => handleChartTypeChange(type.id)}
                      variant={chartType === type.id ? "contained" : "outlined"}
                      sx={{ 
                        minWidth: 40,
                        fontWeight: 600,
                        borderRadius: 1.5
                      }}
                    >
                      {type.icon}
                    </Button>
                  </Tooltip>
                ))}
              </ButtonGroup>
              
              {/* More Options Menu */}
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ 
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                  borderRadius: 1.5
                }}
              >
                <MoreIcon />
              </IconButton>
            </Box>
          )
        }
      />
      
      <CardContent sx={{ pt: 0 }}>
        {/* Controls Row */}
        {showControls && (
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Metric</InputLabel>
              <Select
                value={selectedMetric}
                label="Metric"
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                {metrics.map((metric) => (
                  <MenuItem key={metric.id} value={metric.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: metric.color
                        }}
                      />
                      {metric.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={showMovingAverage}
                  onChange={(e) => setShowMovingAverage(e.target.checked)}
                  size="small"
                />
              }
              label="Moving Average"
              sx={{ fontSize: '0.875rem' }}
            />
          </Box>
        )}
        
        {/* Chart Container */}
        <Box sx={{ width: '100%', height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </Box>
      </CardContent>
      
      {/* More Options Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
            backdropFilter: 'blur(8px)',
            background: alpha(theme.palette.background.paper, 0.9)
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
          Chart Options
        </Typography>
        <Divider />
        
        {chartTypes.slice(3).map((type) => (
          <MenuItem
            key={type.id}
            onClick={() => handleChartTypeChange(type.id)}
            selected={chartType === type.id}
          >
            <Box sx={{ mr: 2 }}>{type.icon}</Box>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {type.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {type.description}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        
        <Divider sx={{ my: 1 }} />
        
        <MenuItem onClick={() => setIsFullscreen(!isFullscreen)}>
          <FullscreenIcon sx={{ mr: 2 }} />
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </MenuItem>
        
        <MenuItem>
          <DownloadIcon sx={{ mr: 2 }} />
          Export Chart
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default AdvancedChartVisualizations;
