import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Collapse
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Today as TodayIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isToday, startOfMonth, endOfMonth } from 'date-fns';
import planningService from '../../services/planningService';
import { useSnackbar } from '../../contexts/SnackbarContext';

// Market bias chips colors
const getBiasColor = (bias) => {
  switch (bias) {
    case 'Bullish':
      return 'success';
    case 'Bearish':
      return 'error';
    case 'Neutral':
      return 'default';
    case 'Bullish Bias with Bearish Features':
      return 'warning';
    case 'Bearish Bias with Bullish Features':
      return 'warning';
    default:
      return 'default';
  }
};

const PlanningList = ({ onEdit, onView, onAdd, refreshTrigger }) => {
  const { showSnackbar } = useSnackbar();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    marketBias: 'All'
  });

  useEffect(() => {
    fetchPlans();
  }, [refreshTrigger]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      // Prepare API parameters
      const params = {};
      if (filters.startDate) params.start_date = format(filters.startDate, 'yyyy-MM-dd');
      if (filters.endDate) params.end_date = format(filters.endDate, 'yyyy-MM-dd');
      
      const data = await planningService.getAllDailyPlans(params);
      
      // Filter by market bias if needed
      let filteredData = data;
      if (filters.marketBias !== 'All') {
        filteredData = data.filter(plan => plan.market_bias === filters.marketBias);
      }
      
      setPlans(filteredData);
    } catch (error) {
      console.error('Error fetching plans:', error);
      showSnackbar('Failed to load plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      try {
        await planningService.deleteDailyPlan(id);
        setPlans(plans.filter(plan => plan.id !== id));
        showSnackbar('Plan deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting plan:', error);
        showSnackbar('Failed to delete plan', 'error');
      }
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    fetchPlans();
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
      marketBias: 'All'
    });
    // Fetch with reset filters
    fetchPlans();
  };

  const handleCreateTodaysPlan = () => {
    // Check if today's plan already exists
    const todayPlan = plans.find(plan => 
      isToday(new Date(plan.date))
    );
    
    if (todayPlan) {
      showSnackbar('A plan for today already exists. You can edit it instead.', 'info');
      onEdit(todayPlan);
    } else {
      onAdd();
    }
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Daily Planning
        </Typography>
        <Box>
          <Button 
            startIcon={<FilterIcon />} 
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 1 }}
          >
            Filters
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateTodaysPlan}
            startIcon={<TodayIcon />}
            sx={{ mr: 1 }}
          >
            Today's Plan
          </Button>
          <Button 
            variant="outlined" 
            onClick={onAdd}
            startIcon={<AddIcon />}
          >
            New Plan
          </Button>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Filters Section */}
      <Collapse in={showFilters}>
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From Date"
                  value={filters.startDate}
                  onChange={(newValue) => handleFilterChange('startDate', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="To Date"
                  value={filters.endDate}
                  onChange={(newValue) => handleFilterChange('endDate', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Market Bias</InputLabel>
                <Select
                  value={filters.marketBias}
                  onChange={(e) => handleFilterChange('marketBias', e.target.value)}
                  label="Market Bias"
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Bullish">Bullish</MenuItem>
                  <MenuItem value="Bearish">Bearish</MenuItem>
                  <MenuItem value="Neutral">Neutral</MenuItem>
                  <MenuItem value="Bullish Bias with Bearish Features">Bullish with Bearish Features</MenuItem>
                  <MenuItem value="Bearish Bias with Bullish Features">Bearish with Bullish Features</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="contained" 
                  onClick={handleApplyFilters}
                  size="small"
                >
                  Apply
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleResetFilters}
                  size="small"
                  startIcon={<RefreshIcon />}
                >
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        <Divider />
      </Collapse>
      
      {/* Plans Grid */}
      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : plans.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No plans found. Try adjusting your filters or create a new plan.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {plans.map((plan) => (
              <Grid item xs={12} sm={6} md={4} key={plan.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    border: isToday(new Date(plan.date)) ? '2px solid' : 'none',
                    borderColor: isToday(new Date(plan.date)) ? 'primary.main' : 'transparent'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {format(new Date(plan.date), 'MMM dd, yyyy')}
                        {isToday(new Date(plan.date)) && (
                          <Chip 
                            label="Today" 
                            size="small" 
                            color="primary" 
                            sx={{ ml: 1 }} 
                          />
                        )}
                      </Typography>
                      <Chip 
                        label={plan.market_bias} 
                        color={getBiasColor(plan.market_bias)}
                        size="small" 
                      />
                    </Box>
                    
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Key Levels:
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      {Object.entries(plan.key_levels).length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {Object.entries(plan.key_levels).slice(0, 3).map(([type, values], idx) => (
                            <Chip 
                              key={idx} 
                              label={`${type}: ${Array.isArray(values) ? values[0] : values}`} 
                              size="small" 
                              variant="outlined"
                              sx={{ mb: 0.5 }}
                            />
                          ))}
                          {Object.entries(plan.key_levels).length > 3 && (
                            <Chip 
                              label={`+${Object.entries(plan.key_levels).length - 3} more`} 
                              size="small" 
                              variant="outlined" 
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No key levels defined
                        </Typography>
                      )}
                    </Box>
                    
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Goals:
                    </Typography>
                    {plan.goals && plan.goals.length > 0 ? (
                      <Box>
                        {plan.goals.slice(0, 2).map((goal, idx) => (
                          <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                            • {goal}
                          </Typography>
                        ))}
                        {plan.goals.length > 2 && (
                          <Typography variant="body2" color="text.secondary">
                            +{plan.goals.length - 2} more goals
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No goals defined
                      </Typography>
                    )}
                    
                    {plan.mental_state && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Mental State:
                        </Typography>
                        <Typography variant="body2">{plan.mental_state}</Typography>
                      </Box>
                    )}
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<ViewIcon />}
                      onClick={() => onView(plan)}
                    >
                      View
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => onEdit(plan)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Paper>
  );
};

export default PlanningList;