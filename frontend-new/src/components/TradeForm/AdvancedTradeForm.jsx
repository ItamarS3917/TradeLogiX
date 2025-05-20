import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Paper,
  InputAdornment,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Divider,
  Tooltip,
  useTheme,
  alpha,
  Collapse,
  Alert,
  CircularProgress,
  useMediaQuery,
  Card,
  CardContent,
  styled,
  Slider
} from '@mui/material';
import { 
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Publish as SubmitIcon,
  Image as ImageIcon,
  Add as PlusIcon,
  Remove as MinusIcon,
  EmojiEmotions as EmotionIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  AccessTime as TimeIcon,
  MoreVert as MoreIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';

// Custom Styled Components
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: alpha(theme.palette.background.paper, 0.4),
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.6),
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.background.paper, 0.8),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`
    }
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.text.primary, 0.12),
    borderWidth: '1.5px'
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px'
  },
  '.MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.text.primary, 0.12),
    borderWidth: '1.5px'
  },
  '&.MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: alpha(theme.palette.background.paper, 0.4),
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.6),
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.background.paper, 0.8),
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`
    }
  }
}));

// Custom Emotional State Selector
const EmotionalStateSelector = ({ value, onChange }) => {
  const theme = useTheme();
  
  const emotionalStates = [
    { value: 'very_negative', label: 'Very Negative', color: theme.palette.error.main, icon: '😡' },
    { value: 'negative', label: 'Negative', color: theme.palette.error.light, icon: '😕' },
    { value: 'neutral', label: 'Neutral', color: theme.palette.text.secondary, icon: '😐' },
    { value: 'positive', label: 'Positive', color: theme.palette.success.light, icon: '🙂' },
    { value: 'very_positive', label: 'Very Positive', color: theme.palette.success.main, icon: '😁' }
  ];
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Emotional State
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        width: '100%', 
        justifyContent: 'space-between',
        backgroundColor: alpha(theme.palette.background.paper, 0.4),
        borderRadius: 3,
        p: 1,
        border: `1.5px solid ${alpha(theme.palette.text.primary, 0.12)}`
      }}>
        {emotionalStates.map((state) => (
          <Tooltip key={state.value} title={state.label}>
            <Box
              onClick={() => onChange(state.value)}
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.5rem',
                border: state.value === value ? `2px solid ${state.color}` : 'none',
                backgroundColor: state.value === value 
                  ? alpha(state.color, 0.1) 
                  : alpha(theme.palette.background.paper, 0.5),
                boxShadow: state.value === value 
                  ? `0 0 0 4px ${alpha(state.color, 0.2)}` 
                  : 'none',
                transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                '&:hover': {
                  backgroundColor: alpha(state.color, 0.1),
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {state.icon}
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

// Risk/Reward Slider Component
const RiskRewardSlider = ({ value, onChange }) => {
  const theme = useTheme();
  
  const marks = [
    { value: 0.25, label: '1:0.25' },
    { value: 0.5, label: '1:0.5' },
    { value: 1, label: '1:1' },
    { value: 2, label: '1:2' },
    { value: 3, label: '1:3' },
    { value: 4, label: '1:4' },
    { value: 5, label: '1:5' },
  ];
  
  const getColor = (val) => {
    if (val < 1) return theme.palette.error.main;
    if (val < 2) return theme.palette.warning.main;
    return theme.palette.success.main;
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <span>Risk:Reward Ratio</span>
        <Chip 
          label={`1:${value}`} 
          size="small" 
          sx={{ 
            fontWeight: 700, 
            backgroundColor: alpha(getColor(value), 0.1),
            color: getColor(value),
            height: 24,
            minWidth: 60
          }} 
        />
      </Typography>
      <Slider
        value={value}
        min={0.25}
        max={5}
        step={0.25}
        marks={marks}
        onChange={(e, newValue) => onChange(newValue)}
        sx={{
          '& .MuiSlider-thumb': {
            height: 24,
            width: 24,
            backgroundColor: '#fff',
            border: `4px solid ${getColor(value)}`,
            boxShadow: `0 0 0 4px ${alpha(getColor(value), 0.2)}`,
            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
              boxShadow: `0 0 0 8px ${alpha(getColor(value), 0.3)}`,
            }
          },
          '& .MuiSlider-track': {
            height: 6,
            backgroundColor: getColor(value),
            border: 'none'
          },
          '& .MuiSlider-rail': {
            height: 6,
            backgroundColor: alpha(theme.palette.text.primary, 0.1)
          },
          '& .MuiSlider-markLabel': {
            fontSize: '0.7rem',
            fontWeight: 600,
            color: alpha(theme.palette.text.primary, 0.5)
          },
          '& .MuiSlider-mark': {
            backgroundColor: alpha(theme.palette.text.primary, 0.3),
            height: 8,
            width: 2,
            marginTop: -3
          }
        }}
      />
    </Box>
  );
};

// Advanced Trade Form Component
const AdvancedTradeForm = ({ 
  initialValues = null, 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  setupTypes = [], 
  symbols = [], 
  isEdit = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Default values for a new trade
  const defaultValues = {
    symbol: '',
    setup_type: '',
    entry_price: '',
    exit_price: '',
    position_size: '',
    entry_time: new Date(),
    exit_time: new Date(),
    planned_risk_reward: 2,
    actual_risk_reward: null,
    outcome: '',
    profit_loss: '',
    emotional_state: 'neutral',
    plan_adherence: 70,
    notes: '',
    tags: [],
    screenshots: []
  };
  
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState(initialValues || defaultValues);
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [quickEntryMode, setQuickEntryMode] = useState(false);
  
  // Steps for form wizard
  const steps = isMobile 
    ? [
        { label: 'Basic', description: 'Basic information' },
        { label: 'Entry', description: 'Entry details' },
        { label: 'Exit', description: 'Exit details' },
        { label: 'Analysis', description: 'Trade analysis' }
      ]
    : [
        { label: 'Basic Information', description: 'Symbol and setup type' },
        { label: 'Entry Details', description: 'Price, time, and position size' },
        { label: 'Exit Details', description: 'Outcome and exit information' },
        { label: 'Trade Analysis', description: 'Emotional state and notes' }
      ];

  // Handle form changes
  const handleChange = (field) => (event) => {
    const value = event.target?.value !== undefined ? event.target.value : event;
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormTouched(prev => ({ ...prev, [field]: true }));
    
    // Automatic profit/loss calculation
    if (field === 'entry_price' || field === 'exit_price' || field === 'position_size') {
      if (formData.entry_price && formData.exit_price && formData.position_size) {
        const entry = parseFloat(formData.entry_price);
        const exit = parseFloat(formData.exit_price);
        const size = parseFloat(formData.position_size);
        
        if (!isNaN(entry) && !isNaN(exit) && !isNaN(size)) {
          const pnl = (exit - entry) * size;
          setFormData(prev => ({ 
            ...prev, 
            profit_loss: pnl.toFixed(2),
            outcome: pnl > 0 ? 'Win' : pnl < 0 ? 'Loss' : 'Breakeven',
            actual_risk_reward: calculateActualRR(entry, exit, prev.planned_risk_reward)
          }));
        }
      }
    }
    
    // Validate field
    validateField(field, value);
  };
  
  // Calculate actual risk:reward ratio
  const calculateActualRR = (entry, exit, plannedRR) => {
    const riskPerUnit = entry / plannedRR;
    const actualGain = Math.abs(exit - entry);
    return parseFloat((actualGain / riskPerUnit).toFixed(2));
  };
  
  // Handle date time changes
  const handleDateChange = (field) => (date) => {
    setFormData(prev => ({ ...prev, [field]: date }));
    setFormTouched(prev => ({ ...prev, [field]: true }));
  };
  
  // Handle tag management
  const handleAddTag = () => {
    if (tagInput.trim() !== '' && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  
  const handleDeleteTag = (tagToDelete) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };
  
  // Step navigation
  const handleNext = () => {
    // Validate current step
    let isValid = true;
    const fieldsToValidate = getFieldsForStep(activeStep);
    
    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    
    if (isValid) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Validate all fields
    let isValid = true;
    Object.keys(formData).forEach(field => {
      if (field !== 'screenshots' && field !== 'tags') {
        if (!validateField(field, formData[field])) {
          isValid = false;
        }
      }
    });
    
    if (!isValid) {
      setErrorMessage('Please fix the validation errors before submitting.');
      return;
    }
    
    try {
      await onSubmit(formData);
      setSuccessMessage(isEdit ? 'Trade updated successfully!' : 'Trade added successfully!');
      
      // Reset form for a new trade if not editing
      if (!isEdit) {
        setFormData(defaultValues);
        setActiveStep(0);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrorMessage(`Error: ${error.message || 'Something went wrong'}`);
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };
  
  // Toggle quick entry mode
  const toggleQuickEntryMode = () => {
    setQuickEntryMode(!quickEntryMode);
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
      case 'entry_time':
        if (!value) error = 'Entry time is required';
        break;
      case 'exit_time':
        if (!value) error = 'Exit time is required';
        if (value && formData.entry_time && new Date(value) < new Date(formData.entry_time)) {
          error = 'Exit time must be after entry time';
        }
        break;
      case 'outcome':
        if (!value) error = 'Outcome is required';
        break;
      default:
        break;
    }
    
    setFormErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };
  
  // Get form fields for each step
  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ['symbol', 'setup_type'];
      case 1:
        return ['entry_price', 'position_size', 'entry_time', 'planned_risk_reward'];
      case 2:
        return ['exit_price', 'exit_time', 'outcome', 'profit_loss'];
      case 3:
        return ['emotional_state', 'plan_adherence', 'notes'];
      default:
        return [];
    }
  };
  
  // Get color for outcome
  const getOutcomeColor = (outcome) => {
    switch (outcome?.toLowerCase()) {
      case 'win':
        return theme.palette.success.main;
      case 'loss':
        return theme.palette.error.main;
      case 'breakeven':
        return theme.palette.warning.main;
      default:
        return theme.palette.text.secondary;
    }
  };
  
  // Render step content
  const renderStepContent = (step) => {
    if (quickEntryMode) {
      return renderQuickEntryForm();
    }
    
    switch (step) {
      case 0:
        return renderBasicInformation();
      case 1:
        return renderEntryDetails();
      case 2:
        return renderExitDetails();
      case 3:
        return renderTradeAnalysis();
      default:
        return null;
    }
  };
  
  // Render basic information step
  const renderBasicInformation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!formErrors.symbol && formTouched.symbol}>
          <InputLabel id="symbol-label">Symbol</InputLabel>
          <StyledSelect
            labelId="symbol-label"
            id="symbol"
            value={formData.symbol}
            onChange={handleChange('symbol')}
            label="Symbol"
          >
            {symbols.map((symbol) => (
              <MenuItem key={symbol} value={symbol}>
                {symbol}
              </MenuItem>
            ))}
          </StyledSelect>
          {formErrors.symbol && formTouched.symbol && (
            <FormHelperText>{formErrors.symbol}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!formErrors.setup_type && formTouched.setup_type}>
          <InputLabel id="setup-type-label">Setup Type</InputLabel>
          <StyledSelect
            labelId="setup-type-label"
            id="setup-type"
            value={formData.setup_type}
            onChange={handleChange('setup_type')}
            label="Setup Type"
          >
            {setupTypes.map((setup) => (
              <MenuItem key={setup} value={setup}>
                {setup}
              </MenuItem>
            ))}
          </StyledSelect>
          {formErrors.setup_type && formTouched.setup_type && (
            <FormHelperText>{formErrors.setup_type}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <InfoIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
          Select the trading symbol and the type of setup used for this trade. This information will be used for pattern recognition and performance analysis.
        </Typography>
      </Grid>
    </Grid>
  );
  
  // Render entry details step
  const renderEntryDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <StyledTextField
          fullWidth
          label="Entry Price"
          value={formData.entry_price}
          onChange={handleChange('entry_price')}
          error={!!formErrors.entry_price && formTouched.entry_price}
          helperText={formTouched.entry_price ? formErrors.entry_price : ''}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <StyledTextField
          fullWidth
          label="Position Size"
          value={formData.position_size}
          onChange={handleChange('position_size')}
          error={!!formErrors.position_size && formTouched.position_size}
          helperText={formTouched.position_size ? formErrors.position_size : ''}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="Entry Time"
            value={formData.entry_time}
            onChange={handleDateChange('entry_time')}
            renderInput={(params) => (
              <StyledTextField
                {...params}
                fullWidth
                error={!!formErrors.entry_time && formTouched.entry_time}
                helperText={formTouched.entry_time ? formErrors.entry_time : ''}
              />
            )}
          />
        </LocalizationProvider>
      </Grid>
      
      <Grid item xs={12}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mt: 2, 
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.03)
          }}
        >
          <RiskRewardSlider
            value={formData.planned_risk_reward}
            onChange={(value) => handleChange('planned_risk_reward')(value)}
          />
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <InfoIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
            Planned Risk:Reward ratio indicates your expected gain relative to your risk. A ratio of 2.0 means you expect to gain twice what you're risking.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
  
  // Render exit details step
  const renderExitDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <StyledTextField
          fullWidth
          label="Exit Price"
          value={formData.exit_price}
          onChange={handleChange('exit_price')}
          error={!!formErrors.exit_price && formTouched.exit_price}
          helperText={formTouched.exit_price ? formErrors.exit_price : ''}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateTimePicker
            label="Exit Time"
            value={formData.exit_time}
            onChange={handleDateChange('exit_time')}
            renderInput={(params) => (
              <StyledTextField
                {...params}
                fullWidth
                error={!!formErrors.exit_time && formTouched.exit_time}
                helperText={formTouched.exit_time ? formErrors.exit_time : ''}
              />
            )}
          />
        </LocalizationProvider>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!formErrors.outcome && formTouched.outcome}>
          <InputLabel id="outcome-label">Outcome</InputLabel>
          <StyledSelect
            labelId="outcome-label"
            id="outcome"
            value={formData.outcome}
            onChange={handleChange('outcome')}
            label="Outcome"
          >
            <MenuItem value="Win">Win</MenuItem>
            <MenuItem value="Loss">Loss</MenuItem>
            <MenuItem value="Breakeven">Breakeven</MenuItem>
          </StyledSelect>
          {formErrors.outcome && formTouched.outcome && (
            <FormHelperText>{formErrors.outcome}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <StyledTextField
          fullWidth
          label="Profit/Loss"
          value={formData.profit_loss}
          onChange={handleChange('profit_loss')}
          error={!!formErrors.profit_loss && formTouched.profit_loss}
          helperText={formTouched.profit_loss ? formErrors.profit_loss : ''}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            readOnly: true,
          }}
          sx={{
            '& input': {
              color: parseFloat(formData.profit_loss) > 0 
                ? theme.palette.success.main 
                : parseFloat(formData.profit_loss) < 0 
                  ? theme.palette.error.main 
                  : theme.palette.text.primary,
              fontWeight: 700
            }
          }}
        />
      </Grid>
      
      {formData.actual_risk_reward && (
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mt: 2, 
              borderRadius: 3,
              border: `1px solid ${alpha(getOutcomeColor(formData.outcome), 0.2)}`,
              backgroundColor: alpha(getOutcomeColor(formData.outcome), 0.03)
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
              <span>Actual Risk:Reward Ratio</span>
              <Chip 
                label={`1:${formData.actual_risk_reward}`} 
                size="small" 
                sx={{ 
                  fontWeight: 700, 
                  backgroundColor: alpha(getOutcomeColor(formData.outcome), 0.1),
                  color: getOutcomeColor(formData.outcome),
                  height: 24
                }} 
              />
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Planned:</Typography>
                <Chip 
                  label={`1:${formData.planned_risk_reward}`} 
                  size="small" 
                  sx={{ height: 20, fontSize: '0.7rem' }} 
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Actual:</Typography>
                <Chip 
                  label={`1:${formData.actual_risk_reward}`} 
                  size="small" 
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    backgroundColor: alpha(getOutcomeColor(formData.outcome), 0.1),
                    color: getOutcomeColor(formData.outcome) 
                  }} 
                />
              </Box>
              
              <Box sx={{ ml: 'auto' }}>
                {formData.actual_risk_reward > formData.planned_risk_reward ? (
                  <Chip 
                    icon={<ArrowUpIcon fontSize="small" />}
                    label="Exceeded Plan" 
                    size="small" 
                    color="success"
                    sx={{ height: 24, fontWeight: 600 }} 
                  />
                ) : formData.actual_risk_reward < formData.planned_risk_reward ? (
                  <Chip 
                    icon={<ArrowDownIcon fontSize="small" />}
                    label="Below Plan" 
                    size="small" 
                    color="error"
                    sx={{ height: 24, fontWeight: 600 }} 
                  />
                ) : (
                  <Chip 
                    icon={<CheckIcon fontSize="small" />}
                    label="Met Plan" 
                    size="small" 
                    color="primary"
                    sx={{ height: 24, fontWeight: 600 }} 
                  />
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
  
  // Render trade analysis step
  const renderTradeAnalysis = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <EmotionalStateSelector
          value={formData.emotional_state}
          onChange={(value) => handleChange('emotional_state')(value)}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
            <span>Plan Adherence</span>
            <Chip 
              label={`${formData.plan_adherence}%`} 
              size="small" 
              color={formData.plan_adherence >= 80 ? 'success' : formData.plan_adherence >= 50 ? 'warning' : 'error'}
              sx={{ height: 24, fontWeight: 700 }} 
            />
          </Typography>
          <Slider
            value={formData.plan_adherence}
            min={0}
            max={100}
            step={5}
            onChange={(e, value) => handleChange('plan_adherence')(value)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
            sx={{
              '& .MuiSlider-thumb': {
                height: 24,
                width: 24,
                backgroundColor: '#fff',
                border: '4px solid currentColor',
              },
              '& .MuiSlider-track': {
                height: 6
              },
              '& .MuiSlider-rail': {
                height: 6,
                backgroundColor: alpha(theme.palette.text.primary, 0.1)
              }
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            How closely did you follow your trading plan?
          </Typography>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <StyledTextField
          fullWidth
          multiline
          rows={4}
          label="Trade Notes"
          placeholder="Enter your thoughts, observations, and lessons learned from this trade..."
          value={formData.notes}
          onChange={handleChange('notes')}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Tags
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <StyledTextField
            fullWidth
            size="small"
            placeholder="Add a tag..."
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
                    size="small"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {formData.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleDeleteTag(tag)}
              sx={{
                borderRadius: '6px',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 600,
                '& .MuiChip-deleteIcon': {
                  color: theme.palette.primary.main,
                  '&:hover': {
                    color: theme.palette.primary.dark
                  }
                }
              }}
            />
          ))}
          {formData.tags.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No tags added yet
            </Typography>
          )}
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ 
          mt: 2, 
          p: 3, 
          border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ImageIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4), mb: 1 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Add Trade Screenshots
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Upload screenshots of your trade setup, entry, and exit points
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            sx={{ borderRadius: 6, fontWeight: 600 }}
          >
            Upload Screenshots
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
  
  // Render quick entry form
  const renderQuickEntryForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Quick Entry Mode
          </Typography>
          <Typography variant="body2">
            Enter the essential trade details quickly. You can add more information later.
          </Typography>
        </Alert>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!formErrors.symbol && formTouched.symbol}>
          <InputLabel id="symbol-label">Symbol</InputLabel>
          <StyledSelect
            labelId="symbol-label"
            id="symbol"
            value={formData.symbol}
            onChange={handleChange('symbol')}
            label="Symbol"
          >
            {symbols.map((symbol) => (
              <MenuItem key={symbol} value={symbol}>
                {symbol}
              </MenuItem>
            ))}
          </StyledSelect>
          {formErrors.symbol && formTouched.symbol && (
            <FormHelperText>{formErrors.symbol}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!formErrors.setup_type && formTouched.setup_type}>
          <InputLabel id="setup-type-label">Setup Type</InputLabel>
          <StyledSelect
            labelId="setup-type-label"
            id="setup-type"
            value={formData.setup_type}
            onChange={handleChange('setup_type')}
            label="Setup Type"
          >
            {setupTypes.map((setup) => (
              <MenuItem key={setup} value={setup}>
                {setup}
              </MenuItem>
            ))}
          </StyledSelect>
          {formErrors.setup_type && formTouched.setup_type && (
            <FormHelperText>{formErrors.setup_type}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <StyledTextField
          fullWidth
          label="Entry Price"
          value={formData.entry_price}
          onChange={handleChange('entry_price')}
          error={!!formErrors.entry_price && formTouched.entry_price}
          helperText={formTouched.entry_price ? formErrors.entry_price : ''}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <StyledTextField
          fullWidth
          label="Exit Price"
          value={formData.exit_price}
          onChange={handleChange('exit_price')}
          error={!!formErrors.exit_price && formTouched.exit_price}
          helperText={formTouched.exit_price ? formErrors.exit_price : ''}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <StyledTextField
          fullWidth
          label="Position Size"
          value={formData.position_size}
          onChange={handleChange('position_size')}
          error={!!formErrors.position_size && formTouched.position_size}
          helperText={formTouched.position_size ? formErrors.position_size : ''}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!formErrors.outcome && formTouched.outcome}>
          <InputLabel id="outcome-label">Outcome</InputLabel>
          <StyledSelect
            labelId="outcome-label"
            id="outcome"
            value={formData.outcome}
            onChange={handleChange('outcome')}
            label="Outcome"
          >
            <MenuItem value="Win">Win</MenuItem>
            <MenuItem value="Loss">Loss</MenuItem>
            <MenuItem value="Breakeven">Breakeven</MenuItem>
          </StyledSelect>
          {formErrors.outcome && formTouched.outcome && (
            <FormHelperText>{formErrors.outcome}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ 
          p: 2, 
          borderRadius: 2, 
          bgcolor: alpha(theme.palette.background.paper, 0.4),
          border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`
        }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 700, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>Calculated P&L:</span>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 700,
                color: parseFloat(formData.profit_loss) > 0 
                  ? theme.palette.success.main 
                  : parseFloat(formData.profit_loss) < 0 
                    ? theme.palette.error.main 
                    : theme.palette.text.primary,
              }}
            >
              ${parseFloat(formData.profit_loss || 0).toFixed(2)}
            </Typography>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
  
  // Render the form
  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Success/Error Messages */}
      <Collapse in={!!successMessage || !!errorMessage}>
        <Alert 
          severity={successMessage ? "success" : "error"}
          sx={{ mb: 3 }}
          action={
            <IconButton
              size="small"
              onClick={() => successMessage ? setSuccessMessage('') : setErrorMessage('')}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          }
        >
          {successMessage || errorMessage}
        </Alert>
      </Collapse>
      
      {/* Form Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {isEdit ? 'Edit Trade' : 'Add New Trade'}
        </Typography>
        
        {!isEdit && (
          <Button
            color="primary"
            size="small"
            onClick={toggleQuickEntryMode}
            sx={{ 
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 6
            }}
          >
            {quickEntryMode ? 'Switch to Detailed Mode' : 'Switch to Quick Entry'}
          </Button>
        )}
      </Box>
      
      {/* Form Stepper - Only show in wizard mode */}
      {!quickEntryMode && (
        <Box sx={{ mb: 4 }}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel={!isMobile}
            orientation={isMobile ? 'vertical' : 'horizontal'}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  {step.label}
                  {isMobile && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {step.description}
                    </Typography>
                  )}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}
      
      {/* Form Content */}
      <Card 
        elevation={0}
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.4),
          mb: 3
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {renderStepContent(activeStep)}
        </CardContent>
      </Card>
      
      {/* Form Actions */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mt: 3 
      }}>
        <Box>
          {!isEdit && !quickEntryMode && activeStep > 0 && (
            <Button
              onClick={handleBack}
              variant="outlined"
              startIcon={<BackIcon />}
              sx={{ 
                fontWeight: 600,
                borderRadius: 8, 
                borderWidth: '1.5px',
                mr: 1
              }}
            >
              Back
            </Button>
          )}
          
          {onCancel && (
            <Button
              onClick={onCancel}
              color="inherit"
              sx={{ 
                fontWeight: 600,
                borderRadius: 8
              }}
            >
              Cancel
            </Button>
          )}
        </Box>
        
        <Box>
          {!quickEntryMode && activeStep < steps.length - 1 && (
            <Button
              onClick={handleNext}
              variant="contained"
              endIcon={<NextIcon />}
              sx={{ 
                fontWeight: 600,
                borderRadius: 8,
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
              }}
            >
              {isTablet ? 'Next' : 'Continue to Next Step'}
            </Button>
          )}
          
          {(quickEntryMode || activeStep === steps.length - 1) && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : isEdit ? <SaveIcon /> : <SubmitIcon />}
              sx={{ 
                fontWeight: 600,
                borderRadius: 8,
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
              }}
            >
              {isLoading ? 'Processing...' : isEdit ? 'Save Changes' : 'Submit Trade'}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AdvancedTradeForm;