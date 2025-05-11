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
  IconButton,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  ListItem,
  List,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { 
  DatePicker, 
  LocalizationProvider 
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Add as AddIcon, 
  Close as CloseIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';

// Validation schema
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
  'Slightly Bullish',
  'Slightly Bearish',
  'Volatile',
  'Consolidating',
  'Uncertain'
];

// Mental state options
const mentalStateOptions = [
  'Focused',
  'Distracted',
  'Calm',
  'Anxious',
  'Confident',
  'Doubtful',
  'Motivated',
  'Tired',
  'Frustrated',
  'Patient',
  'Impatient',
  'Other'
];

const DailyPlanForm = ({ initialData = null, onSubmit, isLoading }) => {
  const { showSnackbar } = useSnackbar();
  
  // State for key levels
  const [keyLevels, setKeyLevels] = useState(
    initialData?.key_levels ? Object.entries(initialData.key_levels).map(([type, value]) => ({ type, value })) : []
  );
  const [newLevelType, setNewLevelType] = useState('Support');
  const [newLevelValue, setNewLevelValue] = useState('');
  
  // State for goals
  const [goals, setGoals] = useState(initialData?.goals || []);
  const [newGoal, setNewGoal] = useState('');
  
  // State for risk parameters
  const [riskParams, setRiskParams] = useState(
    initialData?.risk_parameters ? Object.entries(initialData.risk_parameters).map(([name, value]) => ({ name, value })) : []
  );
  const [newRiskName, setNewRiskName] = useState('');
  const [newRiskValue, setNewRiskValue] = useState('');
  
  // Initialize react-hook-form
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: initialData || {
      date: new Date(),
      market_bias: '',
      mental_state: '',
      notes: ''
    }
  });
  
  // Handle form submission
  const handleFormSubmit = (data) => {
    // Convert key levels array to object
    const keyLevelsObj = keyLevels.reduce((acc, level) => {
      acc[level.type] = level.value;
      return acc;
    }, {});
    
    // Convert risk parameters array to object
    const riskParamsObj = riskParams.reduce((acc, param) => {
      acc[param.name] = param.value;
      return acc;
    }, {});
    
    // Prepare final data
    const finalData = {
      ...data,
      key_levels: keyLevelsObj,
      goals: goals,
      risk_parameters: riskParamsObj
    };
    
    onSubmit(finalData);
  };
  
  // Handle adding a new key level
  const handleAddKeyLevel = () => {
    if (newLevelType && newLevelValue) {
      // Check if level type already exists
      const existingIndex = keyLevels.findIndex(level => level.type === newLevelType);
      
      if (existingIndex >= 0) {
        // Update existing level
        const updatedLevels = [...keyLevels];
        updatedLevels[existingIndex] = { type: newLevelType, value: newLevelValue };
        setKeyLevels(updatedLevels);
      } else {
        // Add new level
        setKeyLevels([...keyLevels, { type: newLevelType, value: newLevelValue }]);
      }
      
      // Reset inputs
      setNewLevelValue('');
    }
  };
  
  // Handle removing a key level
  const handleRemoveKeyLevel = (index) => {
    const updatedLevels = [...keyLevels];
    updatedLevels.splice(index, 1);
    setKeyLevels(updatedLevels);
  };
  
  // Handle adding a new goal
  const handleAddGoal = () => {
    if (newGoal.trim() && !goals.includes(newGoal.trim())) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };
  
  // Handle removing a goal
  const handleRemoveGoal = (index) => {
    const updatedGoals = [...goals];
    updatedGoals.splice(index, 1);
    setGoals(updatedGoals);
  };
  
  // Handle adding a new risk parameter
  const handleAddRiskParam = () => {
    if (newRiskName.trim() && newRiskValue.trim()) {
      // Check if parameter name already exists
      const existingIndex = riskParams.findIndex(param => param.name === newRiskName.trim());
      
      if (existingIndex >= 0) {
        // Update existing parameter
        const updatedParams = [...riskParams];
        updatedParams[existingIndex] = { name: newRiskName.trim(), value: newRiskValue.trim() };
        setRiskParams(updatedParams);
      } else {
        // Add new parameter
        setRiskParams([...riskParams, { name: newRiskName.trim(), value: newRiskValue.trim() }]);
      }
      
      // Reset inputs
      setNewRiskName('');
      setNewRiskValue('');
    }
  };
  
  // Handle removing a risk parameter
  const handleRemoveRiskParam = (index) => {
    const updatedParams = [...riskParams];
    updatedParams.splice(index, 1);
    setRiskParams(updatedParams);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? 'Edit Daily Plan' : 'Create Daily Trading Plan'}
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
                    {marketBiasOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.market_bias && (
                    <Typography variant="caption" color="error">
                      {errors.market_bias.message}
                    </Typography>
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
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Key Levels
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Level Type</InputLabel>
                    <Select
                      value={newLevelType}
                      onChange={(e) => setNewLevelType(e.target.value)}
                      label="Level Type"
                    >
                      <MenuItem value="Support">Support</MenuItem>
                      <MenuItem value="Resistance">Resistance</MenuItem>
                      <MenuItem value="Pivot">Pivot Point</MenuItem>
                      <MenuItem value="Daily High">Daily High</MenuItem>
                      <MenuItem value="Daily Low">Daily Low</MenuItem>
                      <MenuItem value="Weekly High">Weekly High</MenuItem>
                      <MenuItem value="Weekly Low">Weekly Low</MenuItem>
                      <MenuItem value="Monthly High">Monthly High</MenuItem>
                      <MenuItem value="Monthly Low">Monthly Low</MenuItem>
                      <MenuItem value="Fair Value Gap">Fair Value Gap</MenuItem>
                      <MenuItem value="Liquidity Level">Liquidity Level</MenuItem>
                      <MenuItem value="Order Block">Order Block</MenuItem>
                      <MenuItem value="Fibonacci">Fibonacci Level</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Level Value"
                    variant="outlined"
                    size="small"
                    value={newLevelValue}
                    onChange={(e) => setNewLevelValue(e.target.value)}
                    placeholder="e.g. 4850.75"
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    variant="contained"
                    onClick={handleAddKeyLevel}
                    fullWidth
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            {/* Key Levels List */}
            {keyLevels.length > 0 ? (
              <List>
                {keyLevels.map((level, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={level.type}
                      secondary={level.value}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveKeyLevel(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No key levels added yet. Add some key levels to track important price points.
              </Typography>
            )}
          </Grid>
          
          {/* Goals */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Daily Goals
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={10}>
                  <TextField
                    fullWidth
                    label="Add Goal"
                    variant="outlined"
                    size="small"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="e.g. Trade only designated setups"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGoal();
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    variant="contained"
                    onClick={handleAddGoal}
                    fullWidth
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            {/* Goals List */}
            {goals.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {goals.map((goal, index) => (
                  <Chip
                    key={index}
                    label={goal}
                    onDelete={() => handleRemoveGoal(index)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No goals added yet. Set specific goals for your trading day.
              </Typography>
            )}
          </Grid>
          
          {/* Risk Parameters */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Risk Management Parameters
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Parameter Name"
                    variant="outlined"
                    size="small"
                    value={newRiskName}
                    onChange={(e) => setNewRiskName(e.target.value)}
                    placeholder="e.g. Max Loss Per Trade"
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Parameter Value"
                    variant="outlined"
                    size="small"
                    value={newRiskValue}
                    onChange={(e) => setNewRiskValue(e.target.value)}
                    placeholder="e.g. 1% of account"
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    variant="contained"
                    onClick={handleAddRiskParam}
                    fullWidth
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>
            
            {/* Risk Parameters List */}
            {riskParams.length > 0 ? (
              <List>
                {riskParams.map((param, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={param.name}
                      secondary={param.value}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveRiskParam(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No risk parameters added yet. Define your risk management rules for the day.
              </Typography>
            )}
          </Grid>
          
          {/* Notes */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Notes
            </Typography>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Trading Notes"
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Additional notes, observations, or strategy for the day..."
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
              size="large"
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : initialData ? (
                'Update Plan'
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

export default DailyPlanForm;