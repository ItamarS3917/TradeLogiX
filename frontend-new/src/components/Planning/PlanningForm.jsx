import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Chip,
  IconButton,
  Stack,
  FormHelperText,
  ListItem,
  List,
  ListItemText,
  Slider,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Define validation schema
const validationSchema = yup.object().shape({
  date: yup.date().required('Date is required'),
  market_bias: yup.string().required('Market bias is required'),
  mental_state: yup.string().nullable(),
  notes: yup.string().nullable(),
  key_levels: yup.object().nullable(),
  risk_parameters: yup.object().nullable(),
  goals: yup.array().of(yup.string()).nullable()
});

// Define market bias options
const marketBiasOptions = [
  'Bullish',
  'Bearish',
  'Neutral',
  'Undecided',
  'Ranging'
];

// Define mental state options
const mentalStateOptions = [
  'Focused',
  'Distracted',
  'Confident',
  'Anxious',
  'Calm',
  'Stressed',
  'Motivated',
  'Tired',
  'Other'
];

const PlanningForm = ({ initialData = null, onSubmit, isLoading }) => {
  const [newKeyLevel, setNewKeyLevel] = useState({ price: '', description: '' });
  const [newGoal, setNewGoal] = useState('');
  
  // Initialize hook form
  const { control, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: initialData || {
      date: new Date(),
      market_bias: '',
      mental_state: '',
      notes: '',
      key_levels: {
        support: [],
        resistance: [],
        other: []
      },
      risk_parameters: {
        max_daily_loss: 0,
        max_trade_risk: 0,
        target_profit: 0
      },
      goals: []
    }
  });
  
  // Create field array for goals
  const { fields: goalFields, append: appendGoal, remove: removeGoal } = useFieldArray({
    control,
    name: 'goals'
  });
  
  // Watch key levels
  const keyLevels = watch('key_levels');
  
  // Handle adding a new key level
  const handleAddKeyLevel = (type) => {
    if (!newKeyLevel.price || !newKeyLevel.description) return;
    
    const updatedKeyLevels = { ...getValues('key_levels') };
    
    if (!updatedKeyLevels[type]) {
      updatedKeyLevels[type] = [];
    }
    
    updatedKeyLevels[type].push({
      price: parseFloat(newKeyLevel.price),
      description: newKeyLevel.description
    });
    
    setValue('key_levels', updatedKeyLevels);
    setNewKeyLevel({ price: '', description: '' });
  };
  
  // Handle removing a key level
  const handleRemoveKeyLevel = (type, index) => {
    const updatedKeyLevels = { ...getValues('key_levels') };
    updatedKeyLevels[type].splice(index, 1);
    setValue('key_levels', updatedKeyLevels);
  };
  
  // Handle adding a new goal
  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    appendGoal(newGoal);
    setNewGoal('');
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? 'Edit Trading Plan' : 'Create New Trading Plan'}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Grid>
          
          {/* Date */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Plan Date"
                    value={field.value}
                    onChange={field.onChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.date}
                        helperText={errors.date?.message}
                      />
                    )}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          
          {/* Market Bias */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="market_bias"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.market_bias}>
                  <InputLabel>Market Bias</InputLabel>
                  <Select
                    {...field}
                    label="Market Bias"
                  >
                    {marketBiasOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.market_bias && (
                    <FormHelperText>{errors.market_bias.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>
          
          {/* Mental State */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="mental_state"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Mental State</InputLabel>
                  <Select
                    {...field}
                    label="Mental State"
                  >
                    {mentalStateOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          
          {/* Key Levels */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Key Levels
            </Typography>
            
            {/* Add New Key Level */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Add New Key Level
              </Typography>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Price"
                    type="number"
                    value={newKeyLevel.price}
                    onChange={(e) => setNewKeyLevel(prev => ({ ...prev, price: e.target.value }))}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Description"
                    value={newKeyLevel.description}
                    onChange={(e) => setNewKeyLevel(prev => ({ ...prev, description: e.target.value }))}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleAddKeyLevel('support')}
                      startIcon={<AddIcon />}
                      size="small"
                    >
                      Support
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleAddKeyLevel('resistance')}
                      startIcon={<AddIcon />}
                      size="small"
                    >
                      Resistance
                    </Button>
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={() => handleAddKeyLevel('other')}
                      startIcon={<AddIcon />}
                      size="small"
                    >
                      Other
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
            
            {/* Display Key Levels */}
            <Grid container spacing={2}>
              {/* Support Levels */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Support Levels
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, minHeight: 150 }}>
                  {keyLevels?.support?.length > 0 ? (
                    <List dense>
                      {keyLevels.support.map((level, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              size="small"
                              onClick={() => handleRemoveKeyLevel('support', index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={level.price}
                            secondary={level.description}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No support levels added yet
                    </Typography>
                  )}
                </Paper>
              </Grid>
              
              {/* Resistance Levels */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" color="error" gutterBottom>
                  Resistance Levels
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, minHeight: 150 }}>
                  {keyLevels?.resistance?.length > 0 ? (
                    <List dense>
                      {keyLevels.resistance.map((level, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              size="small"
                              onClick={() => handleRemoveKeyLevel('resistance', index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={level.price}
                            secondary={level.description}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No resistance levels added yet
                    </Typography>
                  )}
                </Paper>
              </Grid>
              
              {/* Other Levels */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" color="info.main" gutterBottom>
                  Other Levels
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, minHeight: 150 }}>
                  {keyLevels?.other?.length > 0 ? (
                    <List dense>
                      {keyLevels.other.map((level, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              size="small"
                              onClick={() => handleRemoveKeyLevel('other', index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={level.price}
                            secondary={level.description}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No other levels added yet
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Risk Parameters */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Risk Management
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="risk_parameters.max_daily_loss"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Max Daily Loss"
                      type="number"
                      fullWidth
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="risk_parameters.max_trade_risk"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Max Risk Per Trade"
                      type="number"
                      fullWidth
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="risk_parameters.target_profit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Target Daily Profit"
                      type="number"
                      fullWidth
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
          
          {/* Goals */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Daily Goals
            </Typography>
            
            {/* Add New Goal */}
            <Box sx={{ display: 'flex', mb: 2 }}>
              <TextField
                label="Add Goal"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGoal();
                  }
                }}
                fullWidth
                size="small"
                sx={{ mr: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddGoal}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
            
            {/* Display Goals */}
            <Paper variant="outlined" sx={{ p: 2, minHeight: 100, mb: 3 }}>
              {goalFields.length > 0 ? (
                <List>
                  {goalFields.map((goal, index) => (
                    <ListItem
                      key={goal.id}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => removeGoal(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={goal.value} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No goals added yet. Add some goals to track your daily progress.
                </Typography>
              )}
            </Paper>
          </Grid>
          
          {/* Notes */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Notes & Observations
            </Typography>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notes"
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Add any notes, observations, or special considerations for today's trading..."
                />
              )}
            />
          </Grid>
          
          {/* Submit Button */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              size="large"
              sx={{ py: 1.5 }}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : initialData ? (
                'Update Trading Plan'
              ) : (
                'Save Trading Plan'
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default PlanningForm;