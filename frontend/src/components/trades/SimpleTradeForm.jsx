import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Grid, 
  TextField, 
  MenuItem, 
  Typography, 
  Alert,
  Chip,
  Stack,
  IconButton
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';

// Setup types
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
 * Simple Trade Form Component that doesn't use react-hook-form
 */
const SimpleTradeForm = () => {
  // Form state
  const [formData, setFormData] = useState({
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

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

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

  // Validate the form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.entryTime) newErrors.entryTime = 'Entry time is required';
    if (!formData.exitTime) newErrors.exitTime = 'Exit time is required';
    if (!formData.symbol) newErrors.symbol = 'Symbol is required';
    if (!formData.setupType) newErrors.setupType = 'Setup type is required';
    if (!formData.entryPrice) newErrors.entryPrice = 'Entry price is required';
    if (!formData.exitPrice) newErrors.exitPrice = 'Exit price is required';
    if (!formData.positionSize) newErrors.positionSize = 'Position size is required';
    if (!formData.outcome) newErrors.outcome = 'Outcome is required';
    if (!formData.plannedRiskReward) newErrors.plannedRiskReward = 'Planned risk/reward is required';
    if (!formData.actualRiskReward) newErrors.actualRiskReward = 'Actual risk/reward is required';
    if (!formData.profitLoss) newErrors.profitLoss = 'Profit/Loss is required';
    
    // Number validations
    if (formData.positionSize && formData.positionSize <= 0) {
      newErrors.positionSize = 'Position size must be positive';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create form data to include screenshots
      const formDataObj = new FormData();
      
      // Append trade data
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });
      
      // Append tags as comma-separated string
      formDataObj.append('tags', tags.join(','));
      
      // Append screenshots
      screenshots.forEach((file, index) => {
        formDataObj.append(`screenshot_${index}`, file);
      });

      // Submit to API
      const response = await axios.post('/api/trades', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Handle successful submission
      setSuccess(true);
      
      // Reset form with defaults
      setFormData({
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
      
      console.log('Trade saved successfully:', response.data);
    } catch (err) {
      console.error('Error saving trade:', err);
      setError(err.response?.data?.detail || 'An error occurred while saving the trade');
    } finally {
      setLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setFormData({
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
    setScreenshots([]);
    setTags([]);
    setErrors({});
    setError(null);
    setSuccess(false);
  };

  return (
    <Card>
      <CardHeader 
        title="Log New Trade" 
        subheader="Record details about your trade" 
      />
      <Divider />
      <CardContent>
        <form onSubmit={handleSubmit}>
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
                name="date"
                value={formData.date}
                onChange={handleChange}
                error={!!errors.date}
                helperText={errors.date}
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
                name="entryTime"
                value={formData.entryTime}
                onChange={handleChange}
                error={!!errors.entryTime}
                helperText={errors.entryTime}
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
                name="exitTime"
                value={formData.exitTime}
                onChange={handleChange}
                error={!!errors.exitTime}
                helperText={errors.exitTime}
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
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                error={!!errors.symbol}
                helperText={errors.symbol}
              />
            </Grid>
            
            {/* Setup Type */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Setup Type"
                name="setupType"
                select
                value={formData.setupType}
                onChange={handleChange}
                error={!!errors.setupType}
                helperText={errors.setupType}
              >
                {setupTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            {/* Outcome */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Outcome"
                name="outcome"
                select
                value={formData.outcome}
                onChange={handleChange}
                error={!!errors.outcome}
                helperText={errors.outcome}
              >
                {outcomeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            {/* Entry Price */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Entry Price"
                type="number"
                name="entryPrice"
                value={formData.entryPrice}
                onChange={handleChange}
                error={!!errors.entryPrice}
                helperText={errors.entryPrice}
                inputProps={{ step: "0.01" }}
              />
            </Grid>
            
            {/* Exit Price */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Exit Price"
                type="number"
                name="exitPrice"
                value={formData.exitPrice}
                onChange={handleChange}
                error={!!errors.exitPrice}
                helperText={errors.exitPrice}
                inputProps={{ step: "0.01" }}
              />
            </Grid>
            
            {/* Position Size */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Position Size"
                type="number"
                name="positionSize"
                value={formData.positionSize}
                onChange={handleChange}
                error={!!errors.positionSize}
                helperText={errors.positionSize}
                inputProps={{ min: "1", step: "1" }}
              />
            </Grid>
            
            {/* Planned Risk/Reward */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Planned Risk/Reward"
                name="plannedRiskReward"
                select
                value={formData.plannedRiskReward}
                onChange={handleChange}
                error={!!errors.plannedRiskReward}
                helperText={errors.plannedRiskReward}
              >
                {riskRewardOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            {/* Actual Risk/Reward */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Actual Risk/Reward"
                name="actualRiskReward"
                select
                value={formData.actualRiskReward}
                onChange={handleChange}
                error={!!errors.actualRiskReward}
                helperText={errors.actualRiskReward}
              >
                {riskRewardOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            {/* Profit/Loss */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Profit/Loss"
                type="number"
                name="profitLoss"
                value={formData.profitLoss}
                onChange={handleChange}
                error={!!errors.profitLoss}
                helperText={errors.profitLoss}
                InputProps={{
                  startAdornment: '$',
                }}
                inputProps={{ step: "0.01" }}
              />
            </Grid>
            
            {/* Emotional State */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emotional State (1-10)"
                type="number"
                name="emotionalState"
                value={formData.emotionalState}
                onChange={handleChange}
                error={!!errors.emotionalState}
                helperText={errors.emotionalState || "How did you feel during this trade?"}
                inputProps={{ min: "1", max: "10", step: "1" }}
              />
            </Grid>
            
            {/* Plan Adherence */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Plan Adherence (1-10)"
                type="number"
                name="planAdherence"
                value={formData.planAdherence}
                onChange={handleChange}
                error={!!errors.planAdherence}
                helperText={errors.planAdherence || "How well did you follow your plan?"}
                inputProps={{ min: "1", max: "10", step: "1" }}
              />
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
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                error={!!errors.notes}
                helperText={errors.notes}
                placeholder="What went well? What could be improved? What did you learn?"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outlined"
              sx={{ mr: 1 }}
              onClick={handleReset}
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

export default SimpleTradeForm;
