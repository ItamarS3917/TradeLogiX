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
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
  Alert,
  Stack,
  Chip,
} from '@mui/material';
import { 
  AttachFile as AttachFileIcon, 
  Send as SendIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

// Schema for form validation
const schema = yup.object({
  date: yup.date().required('Trade date is required'),
  entryTime: yup.string().required('Entry time is required'),
  exitTime: yup.string().required('Exit time is required'),
  symbol: yup.string().required('Symbol is required'),
  setupType: yup.string().required('Setup type is required'),
  entryPrice: yup.number().required('Entry price is required'),
  exitPrice: yup.number().required('Exit price is required'),
  positionSize: yup.number().required('Position size is required').positive('Must be positive'),
  outcome: yup.string().required('Outcome is required'),
  plannedRiskReward: yup.string().required('Planned risk/reward is required'),
  actualRiskReward: yup.string().required('Actual risk/reward is required'),
  profitLoss: yup.number().required('Profit/loss is required'),
  emotionalState: yup.number().required('Emotional state is required').min(1).max(10),
  planAdherence: yup.number().required('Plan adherence is required').min(1).max(10),
  notes: yup.string(),
});

// Define setup types based on MMXM and ICT concepts
const setupTypes = [
  { value: 'MMXM_STANDARD', label: 'MMXM Standard' },
  { value: 'MMXM_ADVANCED', label: 'MMXM Advanced' },
  { value: 'ICT_BPR', label: 'ICT Breaker/P&R' },
  { value: 'ICT_OTE', label: 'ICT OTE' },
  { value: 'ICT_HOD_LOD', label: 'ICT High/Low of Day' },
  { value: 'LIQUIDITY_GRAB', label: 'Liquidity Grab' },
  { value: 'FVFA', label: 'Fair Value/Fair Auction' },
  { value: 'OTHER', label: 'Other' },
];

// Outcome options
const outcomeOptions = [
  { value: 'WIN', label: 'Win' },
  { value: 'LOSS', label: 'Loss' },
  { value: 'BREAKEVEN', label: 'Breakeven' },
];

// Risk/Reward ratio options
const riskRewardOptions = [
  { value: '1:1', label: '1:1' },
  { value: '1:2', label: '1:2' },
  { value: '1:3', label: '1:3' },
  { value: '1:4', label: '1:4' },
  { value: '2:1', label: '2:1' },
  { value: '3:1', label: '3:1' },
  { value: 'OTHER', label: 'Other' },
];

/**
 * Trade Entry Form Component
 * Comprehensive form for entering trade details
 */
const TradeEntryForm = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [dailyPlans, setDailyPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');

  // Initialize React Hook Form
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      entryTime: '',
      exitTime: '',
      symbol: 'NQ', // Default to NQ futures
      setupType: '',
      entryPrice: '',
      exitPrice: '',
      positionSize: 1,
      outcome: '',
      plannedRiskReward: '',
      actualRiskReward: '',
      profitLoss: '',
      emotionalState: 5,
      planAdherence: 5,
      notes: '',
    }
  });

  // Fetch daily plans for the selected date
  useEffect(() => {
    const fetchDailyPlans = async () => {
      try {
        const response = await axios.get('/api/plans');
        setDailyPlans(response.data);
      } catch (err) {
        console.error('Error fetching daily plans:', err);
      }
    };

    fetchDailyPlans();
  }, []);

  // Handle file selection for screenshots
  const handleFileSelect = (event) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setScreenshots((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  // Remove a screenshot from the list
  const handleRemoveScreenshot = (index) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  // Add a new tag
  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  // Remove a tag
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create form data to include screenshots
      const formData = new FormData();
      
      // Append trade data
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      
      // Append tags as comma-separated string
      formData.append('tags', tags.join(','));
      
      // Append related plan ID if selected
      if (selectedPlan) {
        formData.append('relatedPlanId', selectedPlan);
      }
      
      // Append screenshots
      screenshots.forEach((file, index) => {
        formData.append(`screenshot_${index}`, file);
      });

      // Submit to API
      const response = await axios.post('/api/trades', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Handle successful submission
      setSuccess(true);
      
      // Reset form with defaults
      reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        entryTime: '',
        exitTime: '',
        symbol: 'NQ',
        setupType: '',
        entryPrice: '',
        exitPrice: '',
        positionSize: 1,
        outcome: '',
        plannedRiskReward: '',
        actualRiskReward: '',
        profitLoss: '',
        emotionalState: 5,
        planAdherence: 5,
        notes: '',
      });
      
      // Clear screenshots and tags
      setScreenshots([]);
      setTags([]);
      setSelectedPlan('');
      
      console.log('Trade saved successfully:', response.data);
    } catch (err) {
      console.error('Error saving trade:', err);
      setError(err.response?.data?.detail || 'An error occurred while saving the trade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader 
        title="Log New Trade" 
        subheader="Record details about your trade" 
      />
      <Divider />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Trade successfully logged!
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* Trade Date */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Trade Date"
                type="date"
                {...register('date')}
                error={!!errors.date}
                helperText={errors.date?.message}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            {/* Entry Time */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Entry Time"
                type="time"
                {...register('entryTime')}
                error={!!errors.entryTime}
                helperText={errors.entryTime?.message}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            {/* Exit Time */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Exit Time"
                type="time"
                {...register('exitTime')}
                error={!!errors.exitTime}
                helperText={errors.exitTime?.message}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            {/* Symbol */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Symbol"
                {...register('symbol')}
                error={!!errors.symbol}
                helperText={errors.symbol?.message}
              />
            </Grid>
            
            {/* Setup Type */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!errors.setupType}>
                <InputLabel>Setup Type</InputLabel>
                <Controller
                  name="setupType"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Setup Type">
                      {setupTypes.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.setupType && (
                  <FormHelperText>{errors.setupType.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Outcome */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!errors.outcome}>
                <InputLabel>Outcome</InputLabel>
                <Controller
                  name="outcome"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Outcome">
                      {outcomeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.outcome && (
                  <FormHelperText>{errors.outcome.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Entry Price */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Entry Price"
                type="number"
                {...register('entryPrice')}
                error={!!errors.entryPrice}
                helperText={errors.entryPrice?.message}
                InputProps={{
                  inputProps: { step: "0.01" }
                }}
              />
            </Grid>
            
            {/* Exit Price */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Exit Price"
                type="number"
                {...register('exitPrice')}
                error={!!errors.exitPrice}
                helperText={errors.exitPrice?.message}
                InputProps={{
                  inputProps: { step: "0.01" }
                }}
              />
            </Grid>
            
            {/* Position Size */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Position Size"
                type="number"
                {...register('positionSize')}
                error={!!errors.positionSize}
                helperText={errors.positionSize?.message}
                InputProps={{
                  inputProps: { min: "1", step: "1" }
                }}
              />
            </Grid>
            
            {/* Planned Risk/Reward */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.plannedRiskReward}>
                <InputLabel>Planned Risk/Reward</InputLabel>
                <Controller
                  name="plannedRiskReward"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Planned Risk/Reward">
                      {riskRewardOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.plannedRiskReward && (
                  <FormHelperText>{errors.plannedRiskReward.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Actual Risk/Reward */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.actualRiskReward}>
                <InputLabel>Actual Risk/Reward</InputLabel>
                <Controller
                  name="actualRiskReward"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Actual Risk/Reward">
                      {riskRewardOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.actualRiskReward && (
                  <FormHelperText>{errors.actualRiskReward.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Profit/Loss */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Profit/Loss"
                type="number"
                {...register('profitLoss')}
                error={!!errors.profitLoss}
                helperText={errors.profitLoss?.message}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { step: "0.01" }
                }}
              />
            </Grid>
            
            {/* Related Plan */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Related Daily Plan</InputLabel>
                <Select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  label="Related Daily Plan"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {dailyPlans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {format(new Date(plan.date), 'yyyy-MM-dd')} - {plan.marketBias}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Emotional State */}
            <Grid item xs={12} md={6}>
              <Typography id="emotional-state-slider" gutterBottom>
                Emotional State (1-10)
              </Typography>
              <Controller
                name="emotionalState"
                control={control}
                render={({ field }) => (
                  <Slider
                    {...field}
                    aria-labelledby="emotional-state-slider"
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={1}
                    max={10}
                    onChange={(_, value) => field.onChange(value)}
                  />
                )}
              />
              {errors.emotionalState && (
                <FormHelperText error>{errors.emotionalState.message}</FormHelperText>
              )}
            </Grid>
            
            {/* Plan Adherence */}
            <Grid item xs={12} md={6}>
              <Typography id="plan-adherence-slider" gutterBottom>
                Plan Adherence (1-10)
              </Typography>
              <Controller
                name="planAdherence"
                control={control}
                render={({ field }) => (
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
                )}
              />
              {errors.planAdherence && (
                <FormHelperText error>{errors.planAdherence.message}</FormHelperText>
              )}
            </Grid>
            
            {/* Trade Tags */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Trade Tags
              </Typography>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <TextField
                  size="small"
                  label="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddTag}
                  disabled={!newTag}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
            
            {/* Trade Screenshots */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Trade Screenshots
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                sx={{ mb: 2 }}
              >
                Upload Screenshots
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </Button>
              {screenshots.length > 0 && (
                <Stack spacing={1}>
                  {screenshots.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {file.name}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleRemoveScreenshot(index)}
                        color="error"
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Stack>
              )}
            </Grid>
            
            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Trade Notes"
                multiline
                rows={4}
                {...register('notes')}
                error={!!errors.notes}
                helperText={errors.notes?.message}
                placeholder="What went well? What could be improved? What did you learn?"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outlined"
              sx={{ mr: 1 }}
              onClick={() => reset()}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SendIcon />}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Trade'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default TradeEntryForm;
