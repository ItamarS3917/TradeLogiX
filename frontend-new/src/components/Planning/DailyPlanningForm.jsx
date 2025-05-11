import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Paper,
  Chip,
  Stack,
  Rating,
  Slider,
  FormHelperText,
  IconButton,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSnackbar } from '../../contexts/SnackbarContext';

// Define validation schema using yup
const validationSchema = yup.object().shape({
  date: yup.date().required('Date is required'),
  market_bias: yup.string().required('Market bias is required'),
  mental_state: yup.string().nullable(),
  notes: yup.string().nullable()
});

// Market bias options
const marketBiasOptions = [
  'Bullish',
  'Bearish',
  'Neutral',
  'Range-Bound',
  'Volatile',
  'Cautious'
];

// Mental state options
const mentalStateOptions = [
  'Focused',
  'Calm',
  'Confident',
  'Anxious',
  'Distracted',
  'Tired',
  'Excited',
  'Patient',
  'Impatient'
];

// Key level types
const keyLevelTypes = [
  'Support',
  'Resistance',
  'Daily High',
  'Daily Low',
  'Weekly High',
  'Weekly Low',
  'Monthly High',
  'Monthly Low',
  'FVG',
  'Order Block',
  'Liquidity Level',
  'Other'
];

const DailyPlanningForm = ({ initialData = null, onSubmit, isLoading }) => {
  const { showSnackbar } = useSnackbar();
  const [keyLevels, setKeyLevels] = useState(initialData?.key_levels || {});
  const [goals, setGoals] = useState(initialData?.goals || []);
  const [goalInput, setGoalInput] = useState('');
  const [newLevel, setNewLevel] = useState({ type: 'Support', price: '', description: '' });

  // Initialize form with react-hook-form
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: initialData || {
      date: new Date(),
      market_bias: '',
      mental_state: '',
      notes: '',
    }
  });

  // Add a key level
  const handleAddKeyLevel = () => {
    if (!newLevel.price || isNaN(parseFloat(newLevel.price))) {
      showSnackbar('Please enter a valid price level', 'error');
      return;
    }

    // Create a unique ID for the level
    const levelId = `level_${Date.now()}`;
    
    // Add the level to the state
    setKeyLevels({
      ...keyLevels,
      [levelId]: {
        type: newLevel.type,
        price: parseFloat(newLevel.price),
        description: newLevel.description || ''
      }
    });

    // Reset the new level form
    setNewLevel({ type: 'Support', price: '', description: '' });
  };

  // Remove a key level
  const handleRemoveKeyLevel = (levelId) => {
    const updatedLevels = { ...keyLevels };
    delete updatedLevels[levelId];
    setKeyLevels(updatedLevels);
  };

  // Add a goal
  const handleAddGoal = () => {
    if (goalInput.trim() && !goals.includes(goalInput.trim())) {
      setGoals([...goals, goalInput.trim()]);
      setGoalInput('');
    }
  };

  // Remove a goal
  const handleRemoveGoal = (goal) => {
    setGoals(goals.filter(g => g !== goal));
  };

  // Handle form submission
  const handleFormSubmit = (data) => {
    const formData = {
      ...data,
      key_levels: keyLevels,
      goals: goals,
      risk_parameters: {
        max_daily_loss: 0,
        max_trade_risk: 0,
        // Add any other risk parameters here
      }
    };

    onSubmit(formData);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? 'Edit Daily Plan' : 'Create Daily Plan'}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
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
                    label="Date"
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
                    {marketBiasOptions.map((bias) => (
                      <MenuItem key={bias} value={bias}>
                        {bias}
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
                <FormControl fullWidth error={!!errors.mental_state}>
                  <InputLabel>Mental State</InputLabel>
                  <Select
                    {...field}
                    label="Mental State"
                  >
                    <MenuItem value="">None</MenuItem>
                    {mentalStateOptions.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.mental_state && (
                    <FormHelperText>{errors.mental_state.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Key Levels Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Key Levels
            </Typography>

            {/* Add New Level Form */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Level Type</InputLabel>
                  <Select
                    value={newLevel.type}
                    onChange={(e) => setNewLevel({ ...newLevel, type: e.target.value })}
                    label="Level Type"
                  >
                    {keyLevelTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Price"
                  value={newLevel.price}
                  onChange={(e) => setNewLevel({ ...newLevel, price: e.target.value })}
                  fullWidth
                  size="small"
                  type="number"
                  step="0.01"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Description (Optional)"
                  value={newLevel.description}
                  onChange={(e) => setNewLevel({ ...newLevel, description: e.target.value })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddKeyLevel}
                  fullWidth
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Grid>
            </Grid>

            {/* Key Levels List */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              {Object.keys(keyLevels).length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center">
                  No key levels added yet
                </Typography>
              ) : (
                <List dense>
                  {Object.entries(keyLevels).map(([id, level]) => (
                    <ListItem key={id} divider>
                      <ListItemText
                        primary={`${level.type}: ${level.price}`}
                        secondary={level.description}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveKeyLevel(id)}
                          size="small"
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Daily Goals */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Daily Goals
            </Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs>
                <TextField
                  label="Add Goal"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  fullWidth
                  size="small"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddGoal();
                    }
                  }}
                />
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddGoal}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Grid>
            </Grid>

            {/* Goals List */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              {goals.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center">
                  No goals added yet
                </Typography>
              ) : (
                <List dense>
                  {goals.map((goal, index) => (
                    <ListItem key={index} divider>
                      <ListItemText primary={goal} />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveGoal(goal)}
                          size="small"
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Notes
            </Typography>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Trading Notes for the Day"
                  multiline
                  rows={4}
                  fullWidth
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                  placeholder="Add any additional notes, observations, or thoughts for today's trading session..."
                />
              )}
            />
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{ py: 1.5 }}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : initialData ? (
                'Update Daily Plan'
              ) : (
                'Save Daily Plan'
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default DailyPlanningForm;