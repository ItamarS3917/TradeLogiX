import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  Divider,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
  FormControlLabel,
  Switch,
  Alert,
  Collapse,
  Fade,
  ButtonBase
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import {
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  KeyboardTabRounded as TabIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckCircleIcon,
  Clear as ClearIcon,
  Photo as PhotoIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  ViewCarousel as ViewStepsIcon,
  Timeline as StrategyIcon,
  ShowChart as ChartIcon,
  Compress as SizeIcon,
  AccessTime as TimeIcon,
  ArticleOutlined as NotesIcon,
  Edit as EditIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowRight as ArrowRightIcon,
  TipsAndUpdates as TipsIcon,
  Attachment as AttachmentIcon,
  EmojiEmotions as EmotionIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

/**
 * TradeEntryWizard - Guided step-by-step trade logging wizard
 * 
 * Features:
 * - Progressive disclosure of form fields
 * - Contextual help and tooltips
 * - Validation at each step
 * - Automatic calculations
 * - Real-time feedback
 * - Mobile-friendly design
 */
const TradeEntryWizard = ({
  initialValues = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  availableSymbols = [],
  setupTypes = []
}) => {
  const theme = useTheme();
  
  // Current step state
  const [activeStep, setActiveStep] = useState(0);
  
  // Trade data state
  const [tradeData, setTradeData] = useState({
    // Basic Information
    symbol: initialValues?.symbol || '',
    setup_type: initialValues?.setup_type || '',
    direction: initialValues?.direction || 'long',
    
    // Entry Details
    entry_price: initialValues?.entry_price || '',
    entry_time: initialValues?.entry_time || new Date(),
    position_size: initialValues?.position_size || '',
    planned_risk_reward: initialValues?.planned_risk_reward || 2,
    risk_per_trade: initialValues?.risk_per_trade || '',
    stop_loss: initialValues?.stop_loss || '',
    take_profit: initialValues?.take_profit || '',
    
    // Exit Details
    exit_price: initialValues?.exit_price || '',
    exit_time: initialValues?.exit_time || new Date(),
    outcome: initialValues?.outcome || '',
    profit_loss: initialValues?.profit_loss || '',
    actual_risk_reward: initialValues?.actual_risk_reward || null,
    exit_reason: initialValues?.exit_reason || '',
    
    // Analysis
    emotional_state: initialValues?.emotional_state || 'neutral',
    plan_adherence: initialValues?.plan_adherence || 70,
    notes: initialValues?.notes || '',
    lessons_learned: initialValues?.lessons_learned || '',
    tags: initialValues?.tags || [],
    
    // Media
    screenshots: initialValues?.screenshots || []
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // Additional states
  const [showTips, setShowTips] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Calculate risk, reward, and P&L automatically
  useEffect(() => {
    const calculateDerivedValues = () => {
      const updatedData = { ...tradeData };
      
      // Parse numeric values
      const entryPrice = parseFloat(tradeData.entry_price);
      const exitPrice = parseFloat(tradeData.exit_price);
      const positionSize = parseFloat(tradeData.position_size);
      const stopLoss = parseFloat(tradeData.stop_loss);
      const takeProfit = parseFloat(tradeData.take_profit);
      
      // Calculate P&L if entry, exit and position size are present
      if (!isNaN(entryPrice) && !isNaN(exitPrice) && !isNaN(positionSize)) {
        let pnl = 0;
        
        if (tradeData.direction === 'long') {
          pnl = (exitPrice - entryPrice) * positionSize;
        } else {
          pnl = (entryPrice - exitPrice) * positionSize;
        }
        
        updatedData.profit_loss = pnl.toFixed(2);
        
        // Determine outcome based on P&L
        if (pnl > 0) {
          updatedData.outcome = 'win';
        } else if (pnl < 0) {
          updatedData.outcome = 'loss';
        } else {
          updatedData.outcome = 'breakeven';
        }
        
        // Calculate actual risk:reward if stop loss is also available
        if (!isNaN(stopLoss)) {
          const riskPerUnit = Math.abs(entryPrice - stopLoss);
          const rewardPerUnit = Math.abs(exitPrice - entryPrice);
          
          if (riskPerUnit > 0) {
            updatedData.actual_risk_reward = (rewardPerUnit / riskPerUnit).toFixed(2);
          }
        }
      }
      
      // Calculate risk per trade if entry price, stop loss, and position size are present
      if (!isNaN(entryPrice) && !isNaN(stopLoss) && !isNaN(positionSize)) {
        const riskPerUnit = Math.abs(entryPrice - stopLoss);
        updatedData.risk_per_trade = (riskPerUnit * positionSize).toFixed(2);
      }
      
      // Update state if changes were made
      if (JSON.stringify(updatedData) !== JSON.stringify(tradeData)) {
        setTradeData(updatedData);
      }
    };
    
    calculateDerivedValues();
  }, [
    tradeData.entry_price, 
    tradeData.exit_price, 
    tradeData.position_size, 
    tradeData.stop_loss, 
    tradeData.take_profit,
    tradeData.direction
  ]);
  
  // Handle field change
  const handleChange = (field) => (event) => {
    const value = event.target?.value !== undefined ? event.target.value : event;
    
    setTradeData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field
    validateField(field, value);
  };
  
  // Handle step navigation
  const handleNext = () => {
    // Validate current step
    if (validateStep(activeStep)) {
      if (activeStep === steps.length - 1) {
        // Last step - handle submit
        handleSubmit();
      } else {
        // Move to next step
        setActiveStep((prevStep) => prevStep + 1);
      }
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Final validation of all fields
    if (!validateAllFields()) {
      return;
    }
    
    // Show confetti animation for a successful trade
    setShowConfetti(true);
    
    // Call the submit handler from props
    if (onSubmit) {
      await onSubmit(tradeData);
    }
    
    // Hide confetti after a delay
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };
  
  // Handle tag management
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    if (!tradeData.tags.includes(tagInput.trim())) {
      setTradeData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
    }
    
    setTagInput('');
  };
  
  const handleDeleteTag = (tagToDelete) => {
    setTradeData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };
  
  // Handle media uploads
  const handleScreenshotUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    // Add files to screenshots array
    setTradeData(prev => ({
      ...prev,
      screenshots: [...prev.screenshots, ...files]
    }));
    
    // Reset file input
    event.target.value = null;
  };
  
  const handleDeleteScreenshot = (index) => {
    setTradeData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };
  
  // Field validation
  const validateField = (field, value) => {
    let error = '';
    
    switch (field) {
      case 'symbol':
        if (!value) error = 'Symbol is required';
        break;
      case 'setup_type':
        if (!value) error = 'Setup type is required';
        break;
      case 'entry_price':
        if (!value) error = 'Entry price is required';
        if (value && isNaN(parseFloat(value))) error = 'Must be a number';
        break;
      case 'exit_price':
        if (!value) error = 'Exit price is required';
        if (value && isNaN(parseFloat(value))) error = 'Must be a number';
        break;
      case 'position_size':
        if (!value) error = 'Position size is required';
        if (value && isNaN(parseFloat(value))) error = 'Must be a number';
        break;
      case 'stop_loss':
        if (value && isNaN(parseFloat(value))) error = 'Must be a number';
        break;
      case 'take_profit':
        if (value && isNaN(parseFloat(value))) error = 'Must be a number';
        break;
      case 'entry_time':
        if (!value) error = 'Entry time is required';
        break;
      case 'exit_time':
        if (!value) error = 'Exit time is required';
        if (value && tradeData.entry_time && new Date(value) < new Date(tradeData.entry_time)) {
          error = 'Exit time must be after entry time';
        }
        break;
      default:
        break;
    }
    
    // Update errors state
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return !error;
  };
  
  // Validate all fields in a step
  const validateStep = (step) => {
    // Define required fields for each step
    const stepFields = {
      0: ['symbol', 'setup_type', 'direction'],
      1: ['entry_price', 'entry_time', 'position_size'],
      2: ['exit_price', 'exit_time', 'outcome'],
      3: ['emotional_state', 'plan_adherence']
    };
    
    // Validate each field in the current step
    let isStepValid = true;
    for (const field of stepFields[step]) {
      // Mark field as touched
      setTouched(prev => ({ ...prev, [field]: true }));
      
      // Validate field
      const isFieldValid = validateField(field, tradeData[field]);
      if (!isFieldValid) {
        isStepValid = false;
      }
    }
    
    return isStepValid;
  };
  
  // Validate all fields
  const validateAllFields = () => {
    // Define all required fields
    const requiredFields = [
      'symbol', 'setup_type', 'direction',
      'entry_price', 'entry_time', 'position_size',
      'exit_price', 'exit_time', 'outcome'
    ];
    
    // Validate each required field
    let isFormValid = true;
    for (const field of requiredFields) {
      // Mark field as touched
      setTouched(prev => ({ ...prev, [field]: true }));
      
      // Validate field
      const isFieldValid = validateField(field, tradeData[field]);
      if (!isFieldValid) {
        isFormValid = false;
      }
    }
    
    return isFormValid;
  };
  
  // Get error message for a field
  const getErrorMessage = (field) => {
    return touched[field] && errors[field] ? errors[field] : '';
  };
  
  // Steps configuration
  const steps = [
    {
      label: 'Basic Information',
      description: 'Enter the trade symbol and setup',
      icon: <StrategyIcon />,
      renderContent: () => (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={!!getErrorMessage('symbol')}
                required
              >
                <InputLabel id="symbol-label">Symbol</InputLabel>
                <Select
                  labelId="symbol-label"
                  id="symbol"
                  value={tradeData.symbol}
                  onChange={handleChange('symbol')}
                  label="Symbol"
                >
                  {availableSymbols.map(symbol => (
                    <MenuItem key={symbol} value={symbol}>{symbol}</MenuItem>
                  ))}
                </Select>
                {getErrorMessage('symbol') && (
                  <FormHelperText>{getErrorMessage('symbol')}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={!!getErrorMessage('setup_type')}
                required
              >
                <InputLabel id="setup-type-label">Setup Type</InputLabel>
                <Select
                  labelId="setup-type-label"
                  id="setup-type"
                  value={tradeData.setup_type}
                  onChange={handleChange('setup_type')}
                  label="Setup Type"
                >
                  {setupTypes.map(setup => (
                    <MenuItem key={setup} value={setup}>{setup}</MenuItem>
                  ))}
                </Select>
                {getErrorMessage('setup_type') && (
                  <FormHelperText>{getErrorMessage('setup_type')}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="direction-label">Direction</InputLabel>
                <Select
                  labelId="direction-label"
                  id="direction"
                  value={tradeData.direction}
                  onChange={handleChange('direction')}
                  label="Direction"
                >
                  <MenuItem value="long">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                      Long
                    </Box>
                  </MenuItem>
                  <MenuItem value="short">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingDownIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                      Short
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {showTips && (
            <Alert 
              severity="info" 
              sx={{ mt: 3 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setShowTips(false)}
                >
                  <ClearIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
                Trade Entry Tips
              </Typography>
              <Typography variant="body2">
                Start by selecting the traded instrument and the setup type. This helps categorize and analyze your trades later.
              </Typography>
            </Alert>
          )}
        </Box>
      )
    },
    {
      label: 'Entry Details',
      description: 'Record your entry information',
      icon: <ChartIcon />,
      renderContent: () => (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Entry Price"
                value={tradeData.entry_price}
                onChange={handleChange('entry_price')}
                error={!!getErrorMessage('entry_price')}
                helperText={getErrorMessage('entry_price')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position Size"
                value={tradeData.position_size}
                onChange={handleChange('position_size')}
                error={!!getErrorMessage('position_size')}
                helperText={getErrorMessage('position_size')}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Entry Time"
                  value={tradeData.entry_time}
                  onChange={handleChange('entry_time')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!getErrorMessage('entry_time')}
                      helperText={getErrorMessage('entry_time')}
                      required
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stop Loss"
                value={tradeData.stop_loss}
                onChange={handleChange('stop_loss')}
                error={!!getErrorMessage('stop_loss')}
                helperText={getErrorMessage('stop_loss') || 'Price level for your stop loss'}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Take Profit"
                value={tradeData.take_profit}
                onChange={handleChange('take_profit')}
                error={!!getErrorMessage('take_profit')}
                helperText={getErrorMessage('take_profit') || 'Price level for your take profit'}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Risk Per Trade"
                value={tradeData.risk_per_trade}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  readOnly: true,
                }}
                helperText="Calculated from stop loss and position size"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Planned Risk:Reward Ratio
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <Box sx={{ px: 1 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        mb: 1
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Higher Risk
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Higher Reward
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        px: 1
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleChange('planned_risk_reward')(Math.max(0.5, tradeData.planned_risk_reward - 0.5))}
                        sx={{ mr: 1 }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Box
                        sx={{
                          flex: 1,
                          height: 8,
                          backgroundColor: alpha(theme.palette.text.primary, 0.1),
                          borderRadius: 4,
                          position: 'relative'
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            left: `${Math.min(100, ((tradeData.planned_risk_reward - 0.5) / 4.5) * 100)}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.primary.main,
                            border: `2px solid ${theme.palette.background.paper}`,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleChange('planned_risk_reward')(Math.min(5, tradeData.planned_risk_reward + 0.5))}
                        sx={{ ml: 1 }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1" fontWeight={600}>
                    1:{tradeData.planned_risk_reward}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          {showTips && (
            <Alert 
              severity="info" 
              sx={{ mt: 3 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setShowTips(false)}
                >
                  <ClearIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
                Entry Details Tips
              </Typography>
              <Typography variant="body2">
                Always record your stop loss and take profit levels to track your risk management. This helps calculate your expected risk:reward ratio.
              </Typography>
            </Alert>
          )}
        </Box>
      )
    },
    {
      label: 'Exit Details',
      description: 'Record how the trade ended',
      icon: <TimeIcon />,
      renderContent: () => (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Exit Price"
                value={tradeData.exit_price}
                onChange={handleChange('exit_price')}
                error={!!getErrorMessage('exit_price')}
                helperText={getErrorMessage('exit_price')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Exit Time"
                  value={tradeData.exit_time}
                  onChange={handleChange('exit_time')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!getErrorMessage('exit_time')}
                      helperText={getErrorMessage('exit_time')}
                      required
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="outcome-label">Outcome</InputLabel>
                <Select
                  labelId="outcome-label"
                  id="outcome"
                  value={tradeData.outcome}
                  onChange={handleChange('outcome')}
                  label="Outcome"
                  error={!!getErrorMessage('outcome')}
                >
                  <MenuItem value="win">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                      Win
                    </Box>
                  </MenuItem>
                  <MenuItem value="loss">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ClearIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                      Loss
                    </Box>
                  </MenuItem>
                  <MenuItem value="breakeven">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingFlatIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                      Breakeven
                    </Box>
                  </MenuItem>
                </Select>
                {getErrorMessage('outcome') && (
                  <FormHelperText>{getErrorMessage('outcome')}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Profit/Loss"
                value={tradeData.profit_loss}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  readOnly: true,
                  style: {
                    color: parseFloat(tradeData.profit_loss) > 0 
                      ? theme.palette.success.main 
                      : parseFloat(tradeData.profit_loss) < 0 
                        ? theme.palette.error.main 
                        : theme.palette.text.primary
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="exit-reason-label">Exit Reason</InputLabel>
                <Select
                  labelId="exit-reason-label"
                  id="exit-reason"
                  value={tradeData.exit_reason}
                  onChange={handleChange('exit_reason')}
                  label="Exit Reason"
                >
                  <MenuItem value="target_hit">Take Profit Target Hit</MenuItem>
                  <MenuItem value="stop_hit">Stop Loss Hit</MenuItem>
                  <MenuItem value="manual_profit">Manual Exit in Profit</MenuItem>
                  <MenuItem value="manual_loss">Manual Exit in Loss</MenuItem>
                  <MenuItem value="time_based">Time-Based Exit</MenuItem>
                  <MenuItem value="technical_signal">Technical Signal</MenuItem>
                  <MenuItem value="news_event">News Event</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Actual Risk:Reward"
                value={tradeData.actual_risk_reward ? `1:${tradeData.actual_risk_reward}` : ''}
                InputProps={{
                  readOnly: true,
                }}
                helperText="Calculated from entry, exit, and stop loss"
              />
            </Grid>
          </Grid>
          
          {showTips && (
            <Alert 
              severity="info" 
              sx={{ mt: 3 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setShowTips(false)}
                >
                  <ClearIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
                Exit Details Tips
              </Typography>
              <Typography variant="body2">
                Record why you exited the trade - this helps identify patterns in your trading. The P&L and actual risk:reward are calculated automatically.
              </Typography>
            </Alert>
          )}
        </Box>
      )
    },
    {
      label: 'Analysis & Media',
      description: 'Add notes and screenshots',
      icon: <NotesIcon />,
      renderContent: () => (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Emotional State During Trade
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mb: 1
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Very Negative
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Neutral
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Very Positive
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 3 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    width: '100%',
                    px: 2
                  }}
                >
                  {['very_negative', 'negative', 'neutral', 'positive', 'very_positive'].map((state) => (
                    <ButtonBase
                      key={state}
                      onClick={() => handleChange('emotional_state')(state)}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: tradeData.emotional_state === state
                          ? alpha(getEmotionColor(state), 0.2)
                          : alpha(theme.palette.background.paper, 0.6),
                        border: `2px solid ${tradeData.emotional_state === state
                          ? getEmotionColor(state)
                          : alpha(theme.palette.text.primary, 0.1)}`,
                        boxShadow: tradeData.emotional_state === state
                          ? `0 0 0 4px ${alpha(getEmotionColor(state), 0.2)}`
                          : 'none',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: alpha(getEmotionColor(state), 0.1),
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      <Typography variant="h5">
                        {getEmotionEmoji(state)}
                      </Typography>
                    </ButtonBase>
                  ))}
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Plan Adherence
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mb: 1
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Poor (0%)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Perfect (100%)
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  px: 1,
                  mb: 3
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleChange('plan_adherence')(Math.max(0, tradeData.plan_adherence - 10))}
                  sx={{ mr: 1 }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Box
                  sx={{
                    flex: 1,
                    height: 8,
                    backgroundColor: alpha(theme.palette.text.primary, 0.1),
                    borderRadius: 4,
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${tradeData.plan_adherence}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: getPlanAdherenceColor(),
                      border: `2px solid ${theme.palette.background.paper}`,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      width: `${tradeData.plan_adherence}%`,
                      height: '100%',
                      backgroundColor: getPlanAdherenceColor(),
                      borderRadius: 4
                    }}
                  />
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleChange('plan_adherence')(Math.min(100, tradeData.plan_adherence + 10))}
                  sx={{ ml: 1 }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
                <Typography variant="subtitle1" sx={{ ml: 2, fontWeight: 600, minWidth: 48 }}>
                  {tradeData.plan_adherence}%
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={tradeData.notes}
                onChange={handleChange('notes')}
                multiline
                rows={3}
                placeholder="What was your thesis for this trade? What did you observe during the trade?"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lessons Learned"
                value={tradeData.lessons_learned}
                onChange={handleChange('lessons_learned')}
                multiline
                rows={2}
                placeholder="What would you do differently next time? What did you learn?"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Add a tag..."
                  size="small"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleAddTag}
                          edge="end"
                          disabled={!tagInput.trim()}
                        >
                          <AddIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tradeData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    size="small"
                    sx={{
                      borderRadius: 1.5,
                      height: 28,
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  />
                ))}
                {tradeData.tags.length === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    No tags added yet. Tags help you categorize trades.
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                Trade Screenshots
              </Typography>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="screenshot-upload"
                  type="file"
                  multiple
                  onChange={handleScreenshotUpload}
                />
                <label htmlFor="screenshot-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    sx={{ fontWeight: 600 }}
                  >
                    Upload Screenshots
                  </Button>
                </label>
              </Box>
              
              <Grid container spacing={2}>
                {tradeData.screenshots.map((screenshot, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box
                      sx={{
                        position: 'relative',
                        height: 0,
                        paddingTop: '75%',
                        backgroundColor: alpha(theme.palette.text.primary, 0.05),
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`
                      }}
                    >
                      {/* Screenshot preview */}
                      <Box
                        component="img"
                        src={screenshot.preview || URL.createObjectURL(screenshot)}
                        alt={`Screenshot ${index + 1}`}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      
                      {/* Delete button */}
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteScreenshot(index)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: alpha(theme.palette.background.paper, 0.8),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.95)
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
                
                {tradeData.screenshots.length === 0 && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 4,
                        backgroundColor: alpha(theme.palette.text.primary, 0.03),
                        borderRadius: 2,
                        border: `1px dashed ${alpha(theme.palette.text.primary, 0.1)}`
                      }}
                    >
                      <PhotoIcon 
                        sx={{ 
                          fontSize: 48, 
                          color: alpha(theme.palette.text.primary, 0.2),
                          mb: 2
                        }} 
                      />
                      <Typography variant="body2" color="text.secondary">
                        No screenshots added yet
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )
    }
  ];
  
  // Helper functions for emotional state display
  const getEmotionColor = (emotionalState) => {
    switch (emotionalState) {
      case 'very_negative':
        return theme.palette.error.main;
      case 'negative':
        return theme.palette.error.light;
      case 'neutral':
        return theme.palette.text.secondary;
      case 'positive':
        return theme.palette.success.light;
      case 'very_positive':
        return theme.palette.success.main;
      default:
        return theme.palette.text.secondary;
    }
  };
  
  const getEmotionEmoji = (emotionalState) => {
    switch (emotionalState) {
      case 'very_negative':
        return '😡';
      case 'negative':
        return '😕';
      case 'neutral':
        return '😐';
      case 'positive':
        return '🙂';
      case 'very_positive':
        return '😁';
      default:
        return '😐';
    }
  };
  
  // Helper function for plan adherence color
  const getPlanAdherenceColor = () => {
    if (tradeData.plan_adherence >= 80) {
      return theme.palette.success.main;
    } else if (tradeData.plan_adherence >= 50) {
      return theme.palette.warning.main;
    } else {
      return theme.palette.error.main;
    }
  };
  
  // Render the confirmation dialog
  const renderCancelConfirmation = () => (
    <Dialog
      open={confirmCancel}
      onClose={() => setConfirmCancel(false)}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          boxShadow: 3,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`
        }
      }}
    >
      <DialogTitle>Cancel Trade Entry?</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Are you sure you want to cancel? All entered data will be lost.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={() => setConfirmCancel(false)}
          variant="outlined"
          sx={{ fontWeight: 600 }}
        >
          Continue Editing
        </Button>
        <Button
          onClick={() => {
            setConfirmCancel(false);
            if (onCancel) onCancel();
          }}
          variant="contained"
          color="error"
          sx={{ fontWeight: 600 }}
        >
          Discard Trade
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  // Confetti animation for success
  const renderConfetti = () => (
    <Fade in={showConfetti}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
      >
        {/* This would be replaced with a proper confetti animation library */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}
        >
          <Typography variant="h1" sx={{ color: theme.palette.success.main }}>
            🎉
          </Typography>
          <Typography variant="h4" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
            Trade Logged!
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
  
  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EditIcon 
            sx={{ 
              fontSize: 28, 
              mr: 1.5, 
              color: theme.palette.primary.main 
            }} 
          />
          <Typography variant="h5" fontWeight={700}>
            {initialValues ? 'Edit Trade' : 'Record New Trade'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={showTips}
                onChange={(e) => setShowTips(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TipsIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">Show Tips</Typography>
              </Box>
            }
          />
        </Box>
      </Box>
      
      <Stepper 
        activeStep={activeStep} 
        orientation="horizontal" 
        alternativeLabel
        sx={{ mb: 4 }}
      >
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel 
              StepIconProps={{
                icon: step.icon
              }}
              optional={
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              }
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: 3,
              position: 'relative',
              borderBottom: activeStep < steps.length - 1 
                ? `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
                : 'none'
            }}
          >
            {steps[activeStep].renderContent()}
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              p: 3,
              pt: 2.5,
              backgroundColor: alpha(theme.palette.background.paper, 0.4)
            }}
          >
            <Button
              color="inherit"
              onClick={() => setConfirmCancel(true)}
              sx={{ fontWeight: 600 }}
            >
              Cancel
            </Button>
            
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {activeStep > 0 && (
                <Button
                  onClick={handleBack}
                  startIcon={<ArrowLeftIcon />}
                  sx={{ fontWeight: 600 }}
                >
                  Back
                </Button>
              )}
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                endIcon={activeStep === steps.length - 1 
                  ? isSubmitting 
                    ? <CircularProgress size={16} color="inherit" />
                    : <SaveIcon /> 
                  : <ArrowRightIcon />
                }
                disabled={isSubmitting}
                sx={{ 
                  fontWeight: 600,
                  px: 3,
                  '&:disabled': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.5)
                  }
                }}
              >
                {activeStep === steps.length - 1 
                  ? (isSubmitting ? 'Saving...' : 'Save Trade') 
                  : 'Continue'
                }
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {/* Mobile stepper */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: { xs: 'block', sm: 'none' },
          borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`
        }}
        elevation={3}
      >
        <MobileStepper
          variant="progress"
          steps={steps.length}
          position="static"
          activeStep={activeStep}
          sx={{ 
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)'
          }}
          nextButton={
            <Button 
              size="small" 
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {activeStep === steps.length - 1 ? 'Save' : 'Next'}
              <ArrowRightIcon />
            </Button>
          }
          backButton={
            <Button 
              size="small" 
              onClick={activeStep === 0 ? () => setConfirmCancel(true) : handleBack}
            >
              <ArrowLeftIcon />
              {activeStep === 0 ? 'Cancel' : 'Back'}
            </Button>
          }
        />
      </Paper>
      
      {/* Render dialogs */}
      {renderCancelConfirmation()}
      {renderConfetti()}
    </Box>
  );
};

export default TradeEntryWizard;