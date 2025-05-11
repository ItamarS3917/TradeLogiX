import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { format } from 'date-fns';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
  Alert,
  Chip,
  Paper,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';

// Schema for form validation
const schema = yup.object({
  date: yup.date().required('Date is required'),
  marketBias: yup.string().required('Market bias is required'),
  mentalState: yup.number().required('Mental state assessment is required').min(1).max(10),
  dailyGoal: yup.string().required('Daily goal is required'),
  riskPerTrade: yup.number().required('Risk per trade is required').positive('Must be positive'),
  maxDailyLoss: yup.number().required('Maximum daily loss is required').positive('Must be positive'),
  tradingPlan: yup.string().required('Trading plan is required'),
});

// Market bias options
const marketBiasOptions = [
  { value: 'BULLISH', label: 'Bullish' },
  { value: 'BEARISH', label: 'Bearish' },
  { value: 'NEUTRAL', label: 'Neutral' },
  { value: 'VOLATILE', label: 'Volatile' },
  { value: 'WAIT_AND_SEE', label: 'Wait and See' },
];

// Market structure options for key levels
const levelTypeOptions = [
  { value: 'SUPPORT', label: 'Support' },
  { value: 'RESISTANCE', label: 'Resistance' },
  { value: 'SUPPLY_ZONE', label: 'Supply Zone' },
  { value: 'DEMAND_ZONE', label: 'Demand Zone' },
  { value: 'FVG', label: 'Fair Value Gap' },
  { value: 'OB', label: 'Order Block' },
  { value: 'LIQUIDITY', label: 'Liquidity Level' },
  { value: 'POI', label: 'Point of Interest' },
  { value: 'BPR', label: 'Breaker/P&R' },
];

/**
 * Daily Plan Form Component
 * For pre-market planning and setting up the trading day
 */
const DailyPlanForm = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [keyLevels, setKeyLevels] = useState([]);
  const [newLevel, setNewLevel] = useState({ price: '', type: 'SUPPORT', description: '' });
  const [marketConditions, setMarketConditions] = useState([]);
  const [newCondition, setNewCondition] = useState('');
  const [marketData, setMarketData] = useState(null);
  
  // Initialize React Hook Form
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      marketBias: '',
      mentalState: 7, // Default to a reasonably positive state
      dailyGoal: '',
      riskPerTrade: 1.0, // Default to 1% risk per trade
      maxDailyLoss: 3.0, // Default to 3% max daily loss
      tradingPlan: '',
    }
  });

  // Fetch market data for the selected date (if available)
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // This would connect to your MCP market data service
        const response = await axios.get('/api/market-data/daily-overview');
        setMarketData(response.data);
      } catch (err) {
        console.error('Error fetching market data:', err);
        // Not setting an error state since this is supplementary information
      }
    };

    fetchMarketData();
  }, []);

  // Add a new key level
  const handleAddLevel = () => {
    if (newLevel.price && newLevel.type) {
      setKeyLevels([...keyLevels, { ...newLevel }]);
      setNewLevel({ price: '', type: 'SUPPORT', description: '' });
    }
  };

  // Remove a key level
  const handleRemoveLevel = (index) => {
    setKeyLevels(keyLevels.filter((_, i) => i !== index));
  };

  // Add a new market condition
  const handleAddCondition = () => {
    if (newCondition && !marketConditions.includes(newCondition)) {
      setMarketConditions([...marketConditions, newCondition]);
      setNewCondition('');
    }
  };

  // Remove a market condition
  const handleRemoveCondition = (conditionToRemove) => {
    setMarketConditions(marketConditions.filter(condition => condition !== conditionToRemove));
  };

  // Get icon for market bias
  const getBiasIcon = (bias) => {
    switch (bias) {
      case 'BULLISH':
        return <TrendingUpIcon color="success" />;
      case 'BEARISH':
        return <TrendingDownIcon color="error" />;
      case 'NEUTRAL':
        return <TrendingFlatIcon color="action" />;
      case 'VOLATILE':
        return <SpeedIcon color="warning" />;
      default:
        return <ErrorIcon color="disabled" />;
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Add key levels and market conditions to data
    const planData = {
      ...data,
      keyLevels: keyLevels,
      marketConditions: marketConditions
    };

    try {
      // Submit to API
      const response = await axios.post('/api/plans', planData);

      // Handle successful submission
      setSuccess(true);
      
      // Reset form with some defaults preserved
      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        marketBias: '',
        mentalState: 7,
        dailyGoal: '',
        riskPerTrade: 1.0,
        maxDailyLoss: 3.0,
        tradingPlan: '',
      });
      
      // Clear key levels and market conditions
      setKeyLevels([]);
      setMarketConditions([]);
      
      console.log('Daily plan saved successfully:', response.data);
    } catch (err) {
      console.error('Error saving daily plan:', err);
      setError(err.response?.data?.detail || 'An error occurred while saving the daily plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader 
        title="Log Your Day" 
        subheader="Pre-market planning for trading success" 
        avatar={<SpeedIcon color="primary" />}
      />
      <Divider />
      
      {marketData && (
        <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
          <Typography variant="subtitle1" gutterBottom>
            Market Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  NQ Futures
                </Typography>
                <Typography variant="h6">
                  {marketData.nq.price} ({marketData.nq.change > 0 ? '+' : ''}{marketData.nq.change}%)
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Market Volatility (VIX)
                </Typography>
                <Typography variant="h6">
                  {marketData.vix}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Economic Events
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {marketData.events.map((event, index) => (
                    <Chip 
                      key={index} 
                      label={event.name} 
                      size="small" 
                      color={event.impact === 'high' ? 'error' : 'default'}
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Daily plan successfully logged!
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Plan Date"
                type="date"
                {...register('date')}
                error={!!errors.date}
                helperText={errors.date?.message}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            {/* Market Bias */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.marketBias}>
                <InputLabel>Market Bias</InputLabel>
                <Controller
                  name="marketBias"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Market Bias"
                      startAdornment={
                        field.value ? (
                          <Box sx={{ mr: 1 }}>
                            {getBiasIcon(field.value)}
                          </Box>
                        ) : null
                      }
                    >
                      {marketBiasOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.marketBias && (
                  <FormHelperText>{errors.marketBias.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Mental State */}
            <Grid item xs={12}>
              <Typography id="mental-state-slider" gutterBottom>
                Mental State (1-10)
              </Typography>
              <Controller
                name="mentalState"
                control={control}
                render={({ field }) => (
                  <Box>
                    <Slider
                      {...field}
                      aria-labelledby="mental-state-slider"
                      valueLabelDisplay="auto"
                      step={1}
                      marks={[
                        { value: 1, label: 'Poor' },
                        { value: 5, label: 'Neutral' },
                        { value: 10, label: 'Excellent' }
                      ]}
                      min={1}
                      max={10}
                      onChange={(_, value) => field.onChange(value)}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {field.value <= 3 && "Consider taking a small size or not trading today."}
                      {field.value > 3 && field.value <= 6 && "Be cautious and stick to your plan today."}
                      {field.value > 6 && "You're in a good state of mind for trading."}
                    </Typography>
                  </Box>
                )}
              />
              {errors.mentalState && (
                <FormHelperText error>{errors.mentalState.message}</FormHelperText>
              )}
            </Grid>
            
            {/* Key Levels */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Key Market Levels
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  label="Price"
                  value={newLevel.price}
                  onChange={(e) => setNewLevel({ ...newLevel, price: e.target.value })}
                  sx={{ width: '25%' }}
                />
                <FormControl size="small" sx={{ width: '25%' }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newLevel.type}
                    onChange={(e) => setNewLevel({ ...newLevel, type: e.target.value })}
                    label="Type"
                  >
                    {levelTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="Description (optional)"
                  value={newLevel.description}
                  onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
                  sx={{ width: '40%' }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddLevel}
                  disabled={!newLevel.price || !newLevel.type}
                >
                  Add
                </Button>
              </Box>
              {keyLevels.length > 0 ? (
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {keyLevels.map((level, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {level.price} - {levelTypeOptions.find(opt => opt.value === level.type)?.label || level.type}
                          </Typography>
                          {level.description && (
                            <Typography variant="caption" display="block">
                              {level.description}
                            </Typography>
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveLevel(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No key levels added yet. Add important support/resistance levels.
                </Typography>
              )}
            </Grid>
            
            {/* Market Conditions */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Market Conditions
              </Typography>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <TextField
                  size="small"
                  label="Add market condition"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  sx={{ mr: 1, flex: 1 }}
                  placeholder="e.g., Trending, Range-bound, News-driven, etc."
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddCondition}
                  disabled={!newCondition}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {marketConditions.map((condition) => (
                  <Chip
                    key={condition}
                    label={condition}
                    onDelete={() => handleRemoveCondition(condition)}
                    color="primary"
                  />
                ))}
                {marketConditions.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No market conditions added yet. Describe today's market environment.
                  </Typography>
                )}
              </Box>
            </Grid>
            
            {/* Daily Goal */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Daily Goal"
                {...register('dailyGoal')}
                error={!!errors.dailyGoal}
                helperText={errors.dailyGoal?.message || "Set a specific, measurable goal for today"}
                placeholder="e.g., Take 2 valid setups with proper risk management"
              />
            </Grid>
            
            {/* Risk Management */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Risk Per Trade (%)"
                type="number"
                {...register('riskPerTrade')}
                error={!!errors.riskPerTrade}
                helperText={errors.riskPerTrade?.message}
                InputProps={{
                  inputProps: { step: "0.1", min: "0.1", max: "5" }
                }}
              />
            </Grid>
            
            {/* Max Daily Loss */}
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Max Daily Loss (%)"
                type="number"
                {...register('maxDailyLoss')}
                error={!!errors.maxDailyLoss}
                helperText={errors.maxDailyLoss?.message}
                InputProps={{
                  inputProps: { step: "0.5", min: "1", max: "10" }
                }}
              />
            </Grid>
            
            {/* Trading Plan */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Trading Plan"
                multiline
                rows={4}
                {...register('tradingPlan')}
                error={!!errors.tradingPlan}
                helperText={errors.tradingPlan?.message || "Detail your specific plan for the day - setups to look for, conditions to trade, etc."}
                placeholder="Describe your specific trading plan for today..."
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outlined"
              sx={{ mr: 1 }}
              onClick={() => {
                reset();
                setKeyLevels([]);
                setMarketConditions([]);
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SendIcon />}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Plan'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default DailyPlanForm;
