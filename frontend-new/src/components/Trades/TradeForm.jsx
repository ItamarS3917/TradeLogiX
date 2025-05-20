import React, { useState, useEffect } from 'react';
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
  Rating,
  Chip,
  Stack,
  FormHelperText,
  CircularProgress,
  Slider,
  Divider
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth to get the current user
import ImageUploader from './ImageUploader';

// Import enums for trade form
import { PLAN_ADHERENCE, EMOTIONAL_STATE, TRADE_OUTCOME, numericToPlanAdherence, numericToEmotionalState } from '../../constants/tradeEnums';

// Define validation schema using yup
const validationSchema = yup.object().shape({
  symbol: yup.string().required('Symbol is required'),
  setup_type: yup.string().required('Setup type is required'),
  entry_price: yup.number().required('Entry price is required').positive('Must be a positive number'),
  exit_price: yup.number().required('Exit price is required').positive('Must be a positive number'),
  position_size: yup.number().required('Position size is required').positive('Must be a positive number'),
  entry_time: yup.date().required('Entry time is required'),
  exit_time: yup.date().required('Exit time is required'),
  planned_risk_reward: yup.number().positive('Must be a positive number').nullable(),
  actual_risk_reward: yup.number().positive('Must be a positive number').nullable(),
  outcome: yup.string().required('Outcome is required'),
  profit_loss: yup.number().required('Profit/Loss is required'),
  emotional_state: yup.string().nullable(),
  plan_adherence: yup.number().min(1).max(10).nullable(),
  notes: yup.string().nullable(),
  tags: yup.array().of(yup.string()).nullable()
});

// Define setup types based on MMXM/ICT concepts
const setupTypes = [
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

// Define emotional states
const emotionalStates = [
  'Calm',
  'Confident',
  'Excited',
  'Anxious',
  'Fearful',
  'Greedy',
  'Impatient',
  'Focused',
  'Distracted',
  'Frustrated',
  'Other'
];

const TradeForm = ({ initialData = null, onSubmit, isLoading }) => {
  const { showSnackbar } = useSnackbar();
  const firebase = useFirebase();
  const { user } = useAuth(); // Get the authenticated user
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(initialData?.tags || []);
  const [screenshots, setScreenshots] = useState(initialData?.screenshots || []);
  
  // Initialize react-hook-form
  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: initialData || {
      symbol: 'NQ',
      setup_type: '',
      entry_price: '',
      exit_price: '',
      position_size: '',
      entry_time: new Date(),
      exit_time: new Date(),
      planned_risk_reward: '',
      actual_risk_reward: '',
      outcome: '',
      profit_loss: '',
      emotional_state: '',
      plan_adherence: 5,
      notes: '',
      tags: []
    }
  });

  // Calculate profit/loss when relevant fields change
  const entryPrice = watch('entry_price');
  const exitPrice = watch('exit_price');
  const positionSize = watch('position_size');

  React.useEffect(() => {
    if (entryPrice && exitPrice && positionSize) {
      const pnl = (exitPrice - entryPrice) * positionSize;
      setValue('profit_loss', pnl.toFixed(2));
    }
  }, [entryPrice, exitPrice, positionSize, setValue]);

  // Handle form submission
  const handleFormSubmit = (data) => {
    data.tags = tags;
    data.screenshots = screenshots;
    
    // Use the authenticated user's ID from Firebase
    data.user_id = user?.id || 'anonymous';
    
    console.log('Adding trade for user ID:', data.user_id);
    
    // Convert numeric plan_adherence to enum string if needed
    if (data.plan_adherence && typeof data.plan_adherence === 'number') {
      data.plan_adherence = numericToPlanAdherence[data.plan_adherence] || "FOLLOWED";
    }
    
    // Convert numeric emotional_state to enum string if needed
    if (data.emotional_state && typeof data.emotional_state === 'number') {
      data.emotional_state = numericToEmotionalState[data.emotional_state] || "CALM";
    }
    
    // Validate numbers
    data.entry_price = parseFloat(data.entry_price);
    data.exit_price = parseFloat(data.exit_price);
    data.position_size = parseFloat(data.position_size);
    data.profit_loss = parseFloat(data.profit_loss);
    
    if (data.planned_risk_reward) {
      data.planned_risk_reward = parseFloat(data.planned_risk_reward);
    }
    
    if (data.actual_risk_reward) {
      data.actual_risk_reward = parseFloat(data.actual_risk_reward);
    }
    
    console.log('Submitting trade with data:', data);
    onSubmit(data);
  };
  
  // Handle screenshot uploads
  const handleScreenshotsUpdate = (newScreenshots) => {
    setScreenshots(newScreenshots);
    setValue('screenshots', newScreenshots);
  };

  // Handle adding tags
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  // Handle removing tags
  const handleDeleteTag = (tagToDelete) => {
    const newTags = tags.filter(tag => tag !== tagToDelete);
    setTags(newTags);
    setValue('tags', newTags);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? 'Edit Trade' : 'Add New Trade'}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Grid container spacing={3}>
          {/* Basic Trade Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Grid>

          {/* Symbol */}
          <Grid item xs={12} sm={4}>
            <Controller
              name="symbol"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Symbol"
                  fullWidth
                  error={!!errors.symbol}
                  helperText={errors.symbol?.message}
                />
              )}
            />
          </Grid>

          {/* Setup Type */}
          <Grid item xs={12} sm={4}>
            <Controller
              name="setup_type"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.setup_type}>
                  <InputLabel>Setup Type</InputLabel>
                  <Select
                    {...field}
                    label="Setup Type"
                  >
                    {setupTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.setup_type && (
                    <FormHelperText>{errors.setup_type.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Outcome */}
          <Grid item xs={12} sm={4}>
            <Controller
              name="outcome"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.outcome}>
                  <InputLabel>Outcome</InputLabel>
                  <Select
                    {...field}
                    label="Outcome"
                  >
                    <MenuItem value="Win">Win</MenuItem>
                    <MenuItem value="Loss">Loss</MenuItem>
                    <MenuItem value="Breakeven">Breakeven</MenuItem>
                  </Select>
                  {errors.outcome && (
                    <FormHelperText>{errors.outcome.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Entry and Exit Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Entry & Exit Details
            </Typography>
          </Grid>

          {/* Entry Price */}
          <Grid item xs={12} sm={4}>
            <Controller
              name="entry_price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Entry Price"
                  type="number"
                  fullWidth
                  error={!!errors.entry_price}
                  helperText={errors.entry_price?.message}
                />
              )}
            />
          </Grid>

          {/* Exit Price */}
          <Grid item xs={12} sm={4}>
            <Controller
              name="exit_price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Exit Price"
                  type="number"
                  fullWidth
                  error={!!errors.exit_price}
                  helperText={errors.exit_price?.message}
                />
              )}
            />
          </Grid>

          {/* Position Size */}
          <Grid item xs={12} sm={4}>
            <Controller
              name="position_size"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Position Size"
                  type="number"
                  fullWidth
                  error={!!errors.position_size}
                  helperText={errors.position_size?.message}
                />
              )}
            />
          </Grid>

          {/* Entry Time */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                name="entry_time"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    label="Entry Time"
                    value={field.value}
                    onChange={field.onChange}
                    slots={{
                      textField: (params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!errors.entry_time}
                          helperText={errors.entry_time?.message}
                        />
                      )
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>

          {/* Exit Time */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                name="exit_time"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    label="Exit Time"
                    value={field.value}
                    onChange={field.onChange}
                    slots={{
                      textField: (params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!errors.exit_time}
                          helperText={errors.exit_time?.message}
                        />
                      )
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>

          {/* Risk Management Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Risk Management
            </Typography>
          </Grid>

          {/* Planned Risk Reward */}
          <Grid item xs={12} sm={4}>
            <Controller
              name="planned_risk_reward"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Planned Risk:Reward"
                  type="number"
                  fullWidth
                  error={!!errors.planned_risk_reward}
                  helperText={errors.planned_risk_reward?.message}
                />
              )}
            />
          </Grid>

          {/* Actual Risk Reward */}
          <Grid item xs={12} sm={4}>
            <Controller
              name="actual_risk_reward"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Actual Risk:Reward"
                  type="number"
                  fullWidth
                  error={!!errors.actual_risk_reward}
                  helperText={errors.actual_risk_reward?.message}
                />
              )}
            />
          </Grid>

          {/* Profit/Loss */}
          <Grid item xs={12} sm={4}>
            <Controller
              name="profit_loss"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Profit/Loss"
                  type="number"
                  fullWidth
                  error={!!errors.profit_loss}
                  helperText={errors.profit_loss?.message || "Calculated automatically"}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              )}
            />
          </Grid>

          {/* Trade Psychology Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Trade Psychology
            </Typography>
          </Grid>

          {/* Emotional State */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="emotional_state"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.emotional_state}>
                  <InputLabel>Emotional State</InputLabel>
                  <Select
                    {...field}
                    label="Emotional State"
                  >
                    {emotionalStates.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.emotional_state && (
                    <FormHelperText>{errors.emotional_state.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Plan Adherence */}
          <Grid item xs={12} sm={6}>
            <Typography id="plan-adherence-slider" gutterBottom>
              Plan Adherence
            </Typography>
            <Controller
              name="plan_adherence"
              control={control}
              render={({ field }) => (
                <Box sx={{ px: 2 }}>
                  <Slider
                    {...field}
                    aria-labelledby="plan-adherence-slider"
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={1}
                    max={10}
                    onChange={(_, value) => field.onChange(value)}
                  />
                  {errors.plan_adherence && (
                    <FormHelperText error>{errors.plan_adherence.message}</FormHelperText>
                  )}
                </Box>
              )}
            />
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notes & Lessons Learned"
                  multiline
                  rows={4}
                  fullWidth
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                />
              )}
            />
          </Grid>

          {/* Tags */}
          <Grid item xs={12}>
            <Typography gutterBottom>Tags</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                label="Add Tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                size="small"
                sx={{ mr: 1 }}
              />
              <Button 
                variant="outlined" 
                onClick={handleAddTag}
                size="medium"
              >
                Add
              </Button>
            </Box>
            
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Grid>
          
          {/* Screenshots */}
          <Grid item xs={12}>
            <ImageUploader 
              onUploadComplete={handleScreenshotsUpdate} 
              initialImages={screenshots}
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
                'Update Trade'
              ) : (
                'Save Trade'
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TradeForm;