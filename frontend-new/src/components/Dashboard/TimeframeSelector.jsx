import React from 'react';
import { 
  Box, 
  ToggleButtonGroup, 
  ToggleButton,
  Button,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { format, subDays, subWeeks, subMonths, startOfYear } from 'date-fns';

/**
 * TimeframeSelector Component
 * 
 * Provides a toggle button group for selecting chart timeframes with custom date range option.
 * 
 * @param {Object} props Component properties
 * @param {string} props.value Current selected timeframe
 * @param {Function} props.onChange Function called when timeframe changes
 * @param {Object} props.customRange Current custom date range (if applicable)
 * @param {Function} props.onCustomRangeChange Function called when custom range changes
 * @param {Object} props.sx Additional styles to apply
 */
const TimeframeSelector = ({ 
  value = '1M', 
  onChange, 
  customRange = { start: null, end: null }, 
  onCustomRangeChange,
  sx = {}
}) => {
  const theme = useTheme();
  const [customDialogOpen, setCustomDialogOpen] = React.useState(false);
  const [tempCustomRange, setTempCustomRange] = React.useState(customRange);
  
  // Predefined timeframes
  const timeframes = [
    { value: '1D', label: '1D' },
    { value: '1W', label: '1W' },
    { value: '1M', label: '1M' },
    { value: '3M', label: '3M' },
    { value: 'YTD', label: 'YTD' },
    { value: '1Y', label: '1Y' },
    { value: 'custom', label: 'Custom' }
  ];
  
  // Handle timeframe change
  const handleTimeframeChange = (event, newValue) => {
    if (!newValue) return;
    
    if (newValue === 'custom') {
      // Open custom date range dialog
      setCustomDialogOpen(true);
    } else {
      // Handle predefined timeframes
      onChange(newValue);
      
      // Update custom range based on selected timeframe for API calls
      const today = new Date();
      let newCustomRange = { start: null, end: today };
      
      switch (newValue) {
        case '1D':
          newCustomRange.start = subDays(today, 1);
          break;
        case '1W':
          newCustomRange.start = subWeeks(today, 1);
          break;
        case '1M':
          newCustomRange.start = subMonths(today, 1);
          break;
        case '3M':
          newCustomRange.start = subMonths(today, 3);
          break;
        case 'YTD':
          newCustomRange.start = startOfYear(today);
          break;
        case '1Y':
          newCustomRange.start = subMonths(today, 12);
          break;
        default:
          break;
      }
      
      if (onCustomRangeChange) {
        onCustomRangeChange(newCustomRange);
      }
    }
  };
  
  // Handle custom range dialog
  const handleCloseCustomDialog = () => {
    setCustomDialogOpen(false);
    setTempCustomRange(customRange);
  };
  
  const handleSaveCustomRange = () => {
    if (tempCustomRange.start && tempCustomRange.end) {
      onChange('custom');
      if (onCustomRangeChange) {
        onCustomRangeChange(tempCustomRange);
      }
    }
    setCustomDialogOpen(false);
  };
  
  // Format date range for display
  const getCustomRangeLabel = () => {
    if (customRange.start && customRange.end) {
      return `${format(customRange.start, 'MMM d')} - ${format(customRange.end, 'MMM d, yyyy')}`;
    }
    return 'Custom';
  };
  
  return (
    <Box sx={{ mb: 2, ...sx }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleTimeframeChange}
        size="small"
        sx={{ 
          '& .MuiToggleButtonGroup-grouped': {
            border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
            borderRadius: '4px !important',
            mx: 0.5,
            '&:first-of-type': {
              ml: 0,
            },
            '&:last-of-type': {
              mr: 0,
            },
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              borderColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
                borderColor: 'primary.dark',
              },
            },
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          },
        }}
      >
        {timeframes.map((tf) => (
          <ToggleButton 
            key={tf.value} 
            value={tf.value}
            sx={{ 
              fontWeight: 600,
              fontSize: '0.75rem',
              py: 0.5,
              px: 1.5,
              minWidth: tf.value === 'custom' ? 'auto' : 32,
            }}
          >
            {tf.value === 'custom' && value === 'custom' ? getCustomRangeLabel() : tf.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      
      {/* Custom Date Range Dialog */}
      <Dialog open={customDialogOpen} onClose={handleCloseCustomDialog}>
        <DialogTitle>Select Custom Date Range</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, width: 300 }}>
              <DatePicker
                label="Start Date"
                value={tempCustomRange.start}
                onChange={(newValue) => setTempCustomRange({ ...tempCustomRange, start: newValue })}
                renderInput={(params) => <TextField {...params} />}
                maxDate={tempCustomRange.end || new Date()}
              />
              <DatePicker
                label="End Date"
                value={tempCustomRange.end}
                onChange={(newValue) => setTempCustomRange({ ...tempCustomRange, end: newValue })}
                renderInput={(params) => <TextField {...params} />}
                minDate={tempCustomRange.start}
                maxDate={new Date()}
              />
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCustomDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveCustomRange} 
            variant="contained"
            disabled={!tempCustomRange.start || !tempCustomRange.end}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeframeSelector;