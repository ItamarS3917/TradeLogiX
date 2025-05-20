import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Tooltip as MuiTooltip,
  useTheme,
  alpha,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Menu,
  Divider,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
  Button
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  FilterList as FilterIcon,
  CloudDownload as DownloadIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
  MoreVert as MoreIcon,
  EventNote as DateRangeIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  Percent as PercentIcon,
  SsidChart as ChartIcon,
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { format, parseISO, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

/**
 * TradeHeatmapVisualization Component - Interactive heatmap for trade analysis
 * 
 * Features:
 * - Time/day performance heatmap
 * - Multiple metrics for analysis
 * - Interactive tooltips with detailed information
 * - Color gradient based on performance
 * - Filtering and zoom functionality
 * - Download and share options
 */
const TradeHeatmapVisualization = ({
  trades = [],
  dateRange = { start: null, end: null },
  onDateRangeChange = null,
  onRefresh = null,
  isLoading = false,
  title = 'Trading Performance Heatmap'
}) => {
  const theme = useTheme();
  const containerRef = useRef(null);
  
  // State for configuration
  const [metric, setMetric] = useState('pnl');
  const [timeGrouping, setTimeGrouping] = useState('hour');
  const [dayGrouping, setDayGrouping] = useState('weekday');
  const [colorIntensity, setColorIntensity] = useState(70);
  const [showEmptyCells, setShowEmptyCells] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // List of available metrics
  const metrics = [
    { value: 'pnl', label: 'Profit/Loss ($)', icon: <MoneyIcon /> },
    { value: 'roi', label: 'Return on Investment (%)', icon: <PercentIcon /> },
    { value: 'winRate', label: 'Win Rate (%)', icon: <ChartIcon /> },
    { value: 'volume', label: 'Number of Trades', icon: <TimeIcon /> }
  ];
  
  // Time grouping options
  const timeGroupings = [
    { value: 'hour', label: 'By Hour' },
    { value: '30min', label: 'By 30 Minutes' },
    { value: '15min', label: 'By 15 Minutes' }
  ];
  
  // Day grouping options
  const dayGroupings = [
    { value: 'weekday', label: 'By Weekday' },
    { value: 'date', label: 'By Date' },
    { value: 'month', label: 'By Month' }
  ];
  
  // Generate processed data for heatmap
  const generateHeatmapData = () => {
    if (!trades || trades.length === 0) return { data: [], xLabels: [], yLabels: [] };
    
    // Create grouping buckets based on current settings
    const timeIntervals = getTimeIntervals(timeGrouping);
    const dayIntervals = getDayIntervals(dayGrouping, dateRange);
    
    // Initialize data structure: day x time matrix
    const heatmapData = {};
    dayIntervals.forEach(day => {
      heatmapData[day.value] = {};
      timeIntervals.forEach(time => {
        heatmapData[day.value][time.value] = {
          trades: [],
          value: 0,
          count: 0,
          wins: 0,
          losses: 0
        };
      });
    });
    
    // Process trades into buckets
    trades.forEach(trade => {
      // Skip if entry time is missing
      if (!trade.entry_time) return;
      
      // Parse trade date/time
      const tradeDate = typeof trade.entry_time === 'string' 
        ? parseISO(trade.entry_time) 
        : new Date(trade.entry_time);
      
      // Get day and time buckets
      const dayBucket = getDayBucket(tradeDate, dayGrouping);
      const timeBucket = getTimeBucket(tradeDate, timeGrouping);
      
      // Skip if bucket not found
      if (!dayBucket || !timeBucket) return;
      
      // Initialize bucket if needed
      if (!heatmapData[dayBucket]) {
        heatmapData[dayBucket] = {};
      }
      if (!heatmapData[dayBucket][timeBucket]) {
        heatmapData[dayBucket][timeBucket] = {
          trades: [],
          value: 0,
          count: 0,
          wins: 0,
          losses: 0
        };
      }
      
      // Add trade to bucket
      heatmapData[dayBucket][timeBucket].trades.push(trade);
      heatmapData[dayBucket][timeBucket].count += 1;
      
      // Update win/loss counters
      if (trade.outcome && trade.outcome.toLowerCase() === 'win') {
        heatmapData[dayBucket][timeBucket].wins += 1;
      } else if (trade.outcome && trade.outcome.toLowerCase() === 'loss') {
        heatmapData[dayBucket][timeBucket].losses += 1;
      }
      
      // Update metric value
      if (metric === 'pnl') {
        heatmapData[dayBucket][timeBucket].value += parseFloat(trade.profit_loss || 0);
      } else if (metric === 'roi') {
        // Simple ROI: P&L / Entry Price * Position Size
        const roi = parseFloat(trade.profit_loss || 0) / 
          (parseFloat(trade.entry_price || 1) * parseFloat(trade.position_size || 1)) * 100;
        heatmapData[dayBucket][timeBucket].value += isNaN(roi) ? 0 : roi;
      }
    });
    
    // Calculate winRates for each cell after all trades are processed
    dayIntervals.forEach(day => {
      timeIntervals.forEach(time => {
        const cell = heatmapData[day.value][time.value];
        if (metric === 'winRate') {
          cell.value = cell.count > 0 ? (cell.wins / cell.count * 100) : 0;
        }
      });
    });
    
    // Convert to array format for rendering
    const dataArray = [];
    dayIntervals.forEach((day, dayIndex) => {
      timeIntervals.forEach((time, timeIndex) => {
        const cell = heatmapData[day.value][time.value];
        
        // Skip empty cells if not showing them
        if (!showEmptyCells && cell.count === 0) return;
        
        dataArray.push({
          dayIndex,
          timeIndex,
          dayLabel: day.label,
          timeLabel: time.label,
          dayValue: day.value,
          timeValue: time.value,
          value: cell.value,
          count: cell.count,
          wins: cell.wins,
          losses: cell.losses,
          trades: cell.trades
        });
      });
    });
    
    return {
      data: dataArray,
      xLabels: timeIntervals,
      yLabels: dayIntervals
    };
  };
  
  // Get time intervals based on grouping
  const getTimeIntervals = (grouping) => {
    const intervals = [];
    
    if (grouping === 'hour') {
      // Trading hours: 9:00 to 16:00
      for (let hour = 9; hour <= 16; hour++) {
        const formattedHour = `${hour}:00`;
        intervals.push({
          value: hour,
          label: formattedHour
        });
      }
    } else if (grouping === '30min') {
      // 30-minute intervals from 9:00 to 16:00
      for (let hour = 9; hour <= 16; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const formattedTime = `${hour}:${minute === 0 ? '00' : minute}`;
          intervals.push({
            value: `${hour}_${minute}`,
            label: formattedTime
          });
        }
      }
    } else if (grouping === '15min') {
      // 15-minute intervals from 9:00 to 16:00
      for (let hour = 9; hour <= 16; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          const formattedTime = `${hour}:${minute === 0 ? '00' : minute}`;
          intervals.push({
            value: `${hour}_${minute}`,
            label: formattedTime
          });
        }
      }
    }
    
    return intervals;
  };
  
  // Get day intervals based on grouping and date range
  const getDayIntervals = (grouping, dateRange) => {
    const intervals = [];
    
    if (grouping === 'weekday') {
      // Days of the week
      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      weekdays.forEach((day, index) => {
        intervals.push({
          value: index + 1, // 1 = Monday, 5 = Friday
          label: day
        });
      });
    } else if (grouping === 'date') {
      // Individual dates in range
      if (dateRange.start && dateRange.end) {
        const daysInRange = eachDayOfInterval({
          start: new Date(dateRange.start),
          end: new Date(dateRange.end)
        });
        
        daysInRange.forEach(date => {
          intervals.push({
            value: format(date, 'yyyy-MM-dd'),
            label: format(date, 'MMM d')
          });
        });
      }
    } else if (grouping === 'month') {
      // Months (assuming current year)
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
      months.forEach((month, index) => {
        intervals.push({
          value: index + 1,
          label: month.substring(0, 3) // Abbreviated month name
        });
      });
    }
    
    return intervals;
  };
  
  // Get day bucket for a specific date
  const getDayBucket = (date, grouping) => {
    if (grouping === 'weekday') {
      // getDay() returns 0 for Sunday, 1 for Monday, etc.
      // We want 1 for Monday, 2 for Tuesday, etc.
      const day = date.getDay();
      return day === 0 ? 7 : day; // Convert Sunday (0) to 7
    } else if (grouping === 'date') {
      return format(date, 'yyyy-MM-dd');
    } else if (grouping === 'month') {
      return date.getMonth() + 1; // getMonth() returns 0-11
    }
    return null;
  };
  
  // Get time bucket for a specific time
  const getTimeBucket = (date, grouping) => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    if (grouping === 'hour') {
      return hour;
    } else if (grouping === '30min') {
      // Round to nearest 30 min
      const roundedMinute = Math.floor(minute / 30) * 30;
      return `${hour}_${roundedMinute}`;
    } else if (grouping === '15min') {
      // Round to nearest 15 min
      const roundedMinute = Math.floor(minute / 15) * 15;
      return `${hour}_${roundedMinute}`;
    }
    return null;
  };
  
  // Get cell color based on value
  const getCellColor = (value, count) => {
    if (count === 0 && !showEmptyCells) return 'transparent';
    if (count === 0) return alpha(theme.palette.text.primary, 0.05);
    
    // For P&L and ROI, use red for negative, green for positive
    if (metric === 'pnl' || metric === 'roi') {
      if (value > 0) {
        // Green gradient based on positive value
        const intensity = Math.min(colorIntensity / 100, 1);
        return alpha(theme.palette.success.main, Math.min(0.1 + Math.log10(1 + Math.abs(value)) * 0.2 * intensity, 0.85));
      } else if (value < 0) {
        // Red gradient based on negative value
        const intensity = Math.min(colorIntensity / 100, 1);
        return alpha(theme.palette.error.main, Math.min(0.1 + Math.log10(1 + Math.abs(value)) * 0.2 * intensity, 0.85));
      }
      return alpha(theme.palette.text.primary, 0.1); // Zero value
    }
    
    // For win rate, use gradient from red to green
    if (metric === 'winRate') {
      const intensity = Math.min(colorIntensity / 100, 1);
      
      if (value > 50) {
        // Green gradient for win rates above 50%
        const greenIntensity = (value - 50) / 50; // 0 at 50%, 1 at 100%
        return alpha(theme.palette.success.main, Math.min(0.1 + greenIntensity * 0.75 * intensity, 0.85));
      } else if (value < 50) {
        // Red gradient for win rates below 50%
        const redIntensity = (50 - value) / 50; // 0 at 50%, 1 at 0%
        return alpha(theme.palette.error.main, Math.min(0.1 + redIntensity * 0.75 * intensity, 0.85));
      }
      return alpha(theme.palette.warning.main, 0.3); // Exactly 50%
    }
    
    // For volume (number of trades), use primary color gradient
    if (metric === 'volume') {
      const intensity = Math.min(colorIntensity / 100, 1);
      return alpha(theme.palette.primary.main, Math.min(0.1 + Math.log10(1 + count) * 0.15 * intensity, 0.85));
    }
    
    return alpha(theme.palette.text.primary, 0.1); // Default
  };
  
  // Format cell value for display
  const formatCellValue = (value, count) => {
    if (count === 0) return '-';
    
    if (metric === 'pnl') {
      return `$${value.toFixed(2)}`;
    } else if (metric === 'roi' || metric === 'winRate') {
      return `${value.toFixed(1)}%`;
    } else if (metric === 'volume') {
      return count.toString();
    }
    
    return value.toString();
  };
  
  // Handle cell hover - show tooltip
  const handleCellHover = (event, cell) => {
    setTooltipData(cell);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };
  
  // Handle cell mouse leave - hide tooltip
  const handleCellLeave = () => {
    setTooltipData(null);
  };
  
  // Handle settings menu
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle toggling settings panel
  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
    handleMenuClose();
  };
  
  // Handle metric change
  const handleMetricChange = (event) => {
    setMetric(event.target.value);
  };
  
  // Handle time grouping change
  const handleTimeGroupingChange = (event) => {
    setTimeGrouping(event.target.value);
  };
  
  // Handle day grouping change
  const handleDayGroupingChange = (event) => {
    setDayGrouping(event.target.value);
  };
  
  // Handle color intensity change
  const handleColorIntensityChange = (event, newValue) => {
    setColorIntensity(newValue);
  };
  
  // Handle empty cells toggle
  const handleEmptyCellsToggle = (event, newValue) => {
    if (newValue !== null) {
      setShowEmptyCells(newValue);
    }
  };
  
  // Download heatmap as image
  const handleDownload = () => {
    if (!containerRef.current) return;
    
    // Create a new canvas
    const canvas = document.createElement('canvas');
    const container = containerRef.current;
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas dimensions
    canvas.width = container.offsetWidth * dpr;
    canvas.height = container.offsetHeight * dpr;
    canvas.style.width = container.offsetWidth + 'px';
    canvas.style.height = container.offsetHeight + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    // Use html2canvas or similar library to capture the content
    // This is a simplification
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg></svg>');
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = `heatmap_${metric}_${new Date().toISOString().slice(0, 10)}.png`;
    downloadLink.click();
    
    handleMenuClose();
  };
  
  // Process data for rendering
  const { data, xLabels, yLabels } = generateHeatmapData();
  
  // Calculate statistics for legend
  const calculateStats = () => {
    if (data.length === 0) return { min: 0, max: 0, avg: 0, total: 0 };
    
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let count = 0;
    
    data.forEach(cell => {
      if (cell.count > 0) {
        min = Math.min(min, cell.value);
        max = Math.max(max, cell.value);
        sum += cell.value;
        count += 1;
      }
    });
    
    return {
      min: count > 0 ? min : 0,
      max: count > 0 ? max : 0,
      avg: count > 0 ? sum / count : 0,
      total: sum
    };
  };
  
  const stats = calculateStats();
  
  // Render tooltip content
  const renderTooltip = () => {
    if (!tooltipData) return null;
    
    return (
      <Paper
        sx={{
          position: 'fixed',
          top: tooltipPosition.y + 10,
          left: tooltipPosition.x + 10,
          zIndex: 1500,
          p: 2,
          maxWidth: 300,
          borderRadius: 2,
          boxShadow: theme.shadows[3],
          pointerEvents: 'none'
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          {tooltipData.dayLabel} at {tooltipData.timeLabel}
        </Typography>
        
        <Grid container spacing={1} sx={{ mb: 1 }}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Number of Trades:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" fontWeight={600}>
              {tooltipData.count}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Wins / Losses:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" fontWeight={600}>
              {tooltipData.wins} / {tooltipData.losses}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Win Rate:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" fontWeight={600} color={
              tooltipData.count > 0 
                ? (tooltipData.wins / tooltipData.count > 0.5 ? "success.main" : "error.main")
                : "text.primary"
            }>
              {tooltipData.count > 0 
                ? `${(tooltipData.wins / tooltipData.count * 100).toFixed(1)}%` 
                : "N/A"}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">
              Total P&L:
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography 
              variant="caption" 
              fontWeight={600}
              color={tooltipData.value > 0 
                ? "success.main" 
                : tooltipData.value < 0 
                  ? "error.main" 
                  : "text.primary"}
            >
              {metric === 'pnl' 
                ? `$${tooltipData.value.toFixed(2)}` 
                : metric === 'roi' || metric === 'winRate'
                  ? `${tooltipData.value.toFixed(1)}%`
                  : tooltipData.value.toString()}
            </Typography>
          </Grid>
        </Grid>
        
        {tooltipData.count > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {tooltipData.count === 1 
              ? 'Click to view this trade' 
              : `Click to view all ${tooltipData.count} trades`}
          </Typography>
        )}
      </Paper>
    );
  };
  
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        }
        action={
          <Box>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              aria-label="heatmap options"
            >
              <MoreIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 2,
                sx: {
                  minWidth: 180,
                  borderRadius: 2,
                  mt: 1,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
                }
              }}
            >
              <MenuItem onClick={toggleSettings}>
                <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
                Settings
              </MenuItem>
              {onRefresh && (
                <MenuItem onClick={() => {
                  onRefresh();
                  handleMenuClose();
                }}>
                  <RefreshIcon fontSize="small" sx={{ mr: 1.5 }} />
                  Refresh Data
                </MenuItem>
              )}
              <MenuItem onClick={handleDownload}>
                <DownloadIcon fontSize="small" sx={{ mr: 1.5 }} />
                Download Image
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleMenuClose}>
                <InfoIcon fontSize="small" sx={{ mr: 1.5 }} />
                About Heatmaps
              </MenuItem>
            </Menu>
          </Box>
        }
        sx={{
          pb: 0,
          '& .MuiCardHeader-action': {
            m: 0
          }
        }}
      />
      
      {/* Settings Panel */}
      <Collapse in={settingsOpen}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}` }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="metric-select-label">Metric</InputLabel>
                <Select
                  labelId="metric-select-label"
                  id="metric-select"
                  value={metric}
                  label="Metric"
                  onChange={handleMetricChange}
                >
                  {metrics.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 1, color: theme.palette.primary.main }}>{option.icon}</Box>
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="time-grouping-select-label">Time Grouping</InputLabel>
                <Select
                  labelId="time-grouping-select-label"
                  id="time-grouping-select"
                  value={timeGrouping}
                  label="Time Grouping"
                  onChange={handleTimeGroupingChange}
                >
                  {timeGroupings.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="day-grouping-select-label">Date Grouping</InputLabel>
                <Select
                  labelId="day-grouping-select-label"
                  id="day-grouping-select"
                  value={dayGrouping}
                  label="Date Grouping"
                  onChange={handleDayGroupingChange}
                >
                  {dayGroupings.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom variant="caption" id="color-intensity-slider">
                Color Intensity
              </Typography>
              <Slider
                value={colorIntensity}
                onChange={handleColorIntensityChange}
                aria-labelledby="color-intensity-slider"
                valueLabelDisplay="auto"
                valueLabelFormat={value => `${value}%`}
                min={10}
                max={100}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom variant="caption">
                Empty Cells
              </Typography>
              <ToggleButtonGroup
                value={showEmptyCells}
                exclusive
                onChange={handleEmptyCellsToggle}
                aria-label="empty cells visibility"
                size="small"
                fullWidth
              >
                <ToggleButton value={true} aria-label="show empty cells">
                  Show
                </ToggleButton>
                <ToggleButton value={false} aria-label="hide empty cells">
                  Hide
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
      
      {/* Main Content */}
      <CardContent
        sx={{
          p: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: 300
        }}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: alpha(theme.palette.background.paper, 0.6),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Loading heatmap data...
            </Typography>
          </Box>
        )}
        
        {/* Legend */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography variant="caption" color="text.secondary">
                Selected Metric:
              </Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                {metrics.find(m => m.value === metric)?.label || 'Profit/Loss'}
              </Typography>
            </Grid>
            
            <Grid item>
              <Typography variant="caption" color="text.secondary">
                Range:
              </Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                {metric === 'pnl' 
                  ? `$${stats.min.toFixed(2)} to $${stats.max.toFixed(2)}`
                  : metric === 'roi' || metric === 'winRate'
                    ? `${stats.min.toFixed(1)}% to ${stats.max.toFixed(1)}%`
                    : `${stats.min} to ${stats.max}`}
              </Typography>
            </Grid>
            
            <Grid item>
              <Typography variant="caption" color="text.secondary">
                Total:
              </Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                {metric === 'pnl' 
                  ? `$${stats.total.toFixed(2)}`
                  : metric === 'roi' || metric === 'winRate'
                    ? `${stats.avg.toFixed(1)}% avg.`
                    : stats.total}
              </Typography>
            </Grid>
            
            <Grid item xs>
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', justifyContent: 'flex-end' }}>
                {/* Color Legend */}
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '2px', 
                      backgroundColor: alpha(theme.palette.error.main, 0.7),
                      mr: 0.5
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Negative
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '2px', 
                      backgroundColor: alpha(theme.palette.success.main, 0.7),
                      mr: 0.5
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Positive
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* Heatmap Grid */}
        <Box 
          ref={containerRef}
          sx={{ 
            display: 'flex', 
            flex: 1,
            flexDirection: 'column',
            overflowX: 'auto',
            minHeight: 200
          }}
        >
          {data.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              minHeight: 200,
              border: `1px dashed ${alpha(theme.palette.text.primary, 0.1)}`,
              borderRadius: 2
            }}>
              <Typography variant="body2" color="text.secondary">
                No data available for the selected time period
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 500 }}>
              {/* X-axis labels (time intervals) */}
              <Box sx={{ display: 'flex', ml: 10, mb: 0.5 }}>
                {xLabels.map((timeLabel, index) => (
                  <Box 
                    key={`time-${index}`}
                    sx={{ 
                      flex: 1, 
                      textAlign: 'center',
                      px: 0.5
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: alpha(theme.palette.text.primary, 0.6),
                        textTransform: 'uppercase'
                      }}
                    >
                      {timeLabel.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              {/* Heatmap rows */}
              {yLabels.map((dayLabel, dayIndex) => (
                <Box 
                  key={`day-${dayIndex}`}
                  sx={{ 
                    display: 'flex',
                    alignItems: 'stretch',
                    mb: 1
                  }}
                >
                  {/* Y-axis label (day) */}
                  <Box 
                    sx={{ 
                      width: 80, 
                      pr: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 600,
                        color: alpha(theme.palette.text.primary, 0.7)
                      }}
                    >
                      {dayLabel.label}
                    </Typography>
                  </Box>
                  
                  {/* Heatmap cells for this day */}
                  <Box sx={{ display: 'flex', flex: 1 }}>
                    {xLabels.map((timeLabel, timeIndex) => {
                      // Find cell data
                      const cellData = data.find(
                        cell => cell.dayIndex === dayIndex && cell.timeIndex === timeIndex
                      );
                      
                      // Skip if hiding empty cells
                      if (!showEmptyCells && (!cellData || cellData.count === 0)) {
                        return null;
                      }
                      
                      const count = cellData?.count || 0;
                      const value = cellData?.value || 0;
                      
                      return (
                        <Box 
                          key={`cell-${dayIndex}-${timeIndex}`}
                          sx={{ 
                            flex: 1, 
                            height: 40,
                            backgroundColor: getCellColor(value, count),
                            borderRadius: 1,
                            mx: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: count > 0 ? 'pointer' : 'default',
                            transition: 'all 0.15s ease-in-out',
                            border: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
                            '&:hover': count > 0 ? {
                              transform: 'scale(1.05)',
                              boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}`,
                              zIndex: 1
                            } : {}
                          }}
                          onMouseEnter={(e) => cellData && handleCellHover(e, cellData)}
                          onMouseLeave={handleCellLeave}
                        >
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              fontWeight: 600,
                              color: value !== 0 && count > 0 
                                ? theme.palette.getContrastText(getCellColor(value, count))
                                : alpha(theme.palette.text.primary, 0.6),
                              fontSize: '0.75rem'
                            }}
                          >
                            {formatCellValue(value, count)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        
        {/* Tooltip */}
        {renderTooltip()}
      </CardContent>
    </Card>
  );
};

export default TradeHeatmapVisualization;