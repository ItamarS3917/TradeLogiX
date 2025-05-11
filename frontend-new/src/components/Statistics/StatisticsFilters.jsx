import React, { useState } from 'react';
import {
  Paper,
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Setup types
const setupTypes = [
  'All',
  'FVG Fill',
  'BPR',
  'OTE',
  'PD Level',
  'Liquidity Grab',
  'Order Block',
  'Smart Money Concept',
  'Double Top/Bottom',
  'Fibonacci Retracement',
  'EQH/EQL',
  'Other'
];

// Symbol options
const symbols = ['All', 'NQ', 'ES', 'CL', 'GC', 'EURUSD', 'GBPUSD', 'Other'];

// Date range presets
const dateRangePresets = [
  { label: 'Last 7 Days', value: 'last7days' },
  { label: 'Last 30 Days', value: 'last30days' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'Last 3 Months', value: 'last3months' },
  { label: 'Year to Date', value: 'ytd' },
  { label: 'Custom', value: 'custom' }
];

const StatisticsFilters = ({ onApplyFilters, initialFilters = {} }) => {
  const [expanded, setExpanded] = useState(false);
  const [dateRangeType, setDateRangeType] = useState('last30days');
  
  // Initialize filters with default values
  const [filters, setFilters] = useState({
    startDate: subMonths(new Date(), 1),
    endDate: new Date(),
    symbol: 'All',
    setupType: 'All',
    ...initialFilters
  });
  
  // Toggle expand/collapse filters
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  // Handle change for filters
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };
  
  // Handle date range preset selection
  const handleDateRangePreset = (presetValue) => {
    setDateRangeType(presetValue);
    
    const today = new Date();
    let start = new Date();
    let end = new Date();
    
    switch (presetValue) {
      case 'last7days':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        end = today;
        break;
      
      case 'last30days':
        start = new Date(today);
        start.setDate(today.getDate() - 30);
        end = today;
        break;
      
      case 'thisMonth':
        start = startOfMonth(today);
        end = today;
        break;
      
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      
      case 'last3months':
        start = new Date(today);
        start.setMonth(today.getMonth() - 3);
        end = today;
        break;
      
      case 'ytd':
        start = new Date(today.getFullYear(), 0, 1); // January 1 of current year
        end = today;
        break;
      
      case 'custom':
        // Don't change dates for custom
        return;
      
      default:
        start = subMonths(today, 1);
        end = today;
    }
    
    setFilters({
      ...filters,
      startDate: start,
      endDate: end
    });
  };
  
  // Handle applying filters
  const handleApplyFilters = () => {
    // Format dates for API
    const formattedFilters = {
      ...filters,
      startDate: format(filters.startDate, 'yyyy-MM-dd'),
      endDate: format(filters.endDate, 'yyyy-MM-dd')
    };
    
    // If 'All' is selected, don't include that filter
    if (formattedFilters.symbol === 'All') {
      delete formattedFilters.symbol;
    }
    
    if (formattedFilters.setupType === 'All') {
      delete formattedFilters.setupType;
    }
    
    onApplyFilters(formattedFilters);
  };
  
  // Handle resetting filters
  const handleResetFilters = () => {
    const defaultFilters = {
      startDate: subMonths(new Date(), 1),
      endDate: new Date(),
      symbol: 'All',
      setupType: 'All'
    };
    
    setFilters(defaultFilters);
    setDateRangeType('last30days');
    onApplyFilters({
      startDate: format(defaultFilters.startDate, 'yyyy-MM-dd'),
      endDate: format(defaultFilters.endDate, 'yyyy-MM-dd')
    });
  };
  
  return (
    <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden' }}>
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer' 
        }}
        onClick={toggleExpand}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Filters
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            {expanded ? 'Click to collapse' : 'Click to expand'}
          </Typography>
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Date Range Presets */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Date Range
              </Typography>
              <Grid container spacing={1}>
                {dateRangePresets.map((preset) => (
                  <Grid item key={preset.value}>
                    <Button
                      variant={dateRangeType === preset.value ? "contained" : "outlined"}
                      size="small"
                      onClick={() => handleDateRangePreset(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            
            {/* Date Pickers */}
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(newValue) => handleFilterChange('startDate', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(newValue) => handleFilterChange('endDate', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </LocalizationProvider>
            </Grid>
            
            {/* Symbol & Setup Type Filters */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Symbol</InputLabel>
                <Select
                  value={filters.symbol}
                  label="Symbol"
                  onChange={(e) => handleFilterChange('symbol', e.target.value)}
                >
                  {symbols.map((symbol) => (
                    <MenuItem key={symbol} value={symbol}>
                      {symbol}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Setup Type</InputLabel>
                <Select
                  value={filters.setupType}
                  label="Setup Type"
                  onChange={(e) => handleFilterChange('setupType', e.target.value)}
                >
                  {setupTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetFilters}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default StatisticsFilters;