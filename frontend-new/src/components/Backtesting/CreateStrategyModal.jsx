// File: frontend-new/src/components/Backtesting/CreateStrategyModal.jsx
// Purpose: Modal for creating new trading strategies using Material-UI

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Grid,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  alpha,
  useTheme,
  CircularProgress,
  Fade
} from '@mui/material';
import {
  Close as CloseIcon,
  GpsFixed as TargetIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Warning as WarningIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  AutoGraph as AutoGraphIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { backtestService } from '../../services/backtestService';
import tradeService from '../../services/tradeService';

const CreateStrategyModal = ({ open = true, onClose, onStrategyCreated }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [strategyType, setStrategyType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    strategy_type: 'CUSTOM_SETUP',
    entry_conditions: {},
    exit_conditions: {},
    risk_management: {
      max_risk_per_trade: 0.02,
      position_sizing: 'fixed_percent',
      max_concurrent_trades: 1
    },
    filters: {},
    setup_types: [],
    timeframes: ['5m', '15m']
  });
  const [tradeSelection, setTradeSelection] = useState({
    trades: [],
    selectedTradeIds: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (strategyType === 'from-trades') {
      loadUserTrades();
    }
  }, [strategyType]);

  const loadUserTrades = async () => {
    try {
      const trades = await tradeService.getAllTrades();
      // Only include completed trades with outcomes
      const validTrades = trades.filter(trade => 
        trade.outcome && trade.outcome !== 'Breakeven' && trade.profit_loss !== null
      );
      setTradeSelection(prev => ({ ...prev, trades: validTrades }));
    } catch (error) {
      console.error('Error loading trades:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayInputChange = (field, values) => {
    setFormData(prev => ({
      ...prev,
      [field]: values
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Strategy name is required';
    }

    if (!formData.strategy_type) {
      newErrors.strategy_type = 'Strategy type is required';
    }

    if (strategyType === 'from-trades' && tradeSelection.selectedTradeIds.length === 0) {
      newErrors.trades = 'Please select at least one trade';
    }

    if (strategyType === 'custom') {
      if (!formData.entry_conditions.min_risk_reward) {
        newErrors.entry_conditions = 'Minimum risk-reward ratio is required';
      }
      if (!formData.exit_conditions.take_profit_ratio) {
        newErrors.exit_conditions = 'Take profit ratio is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let newStrategy;

      if (strategyType === 'from-trades') {
        newStrategy = await backtestService.createStrategyFromTrades({
          trade_ids: tradeSelection.selectedTradeIds,
          strategy_name: formData.name,
          description: formData.description
        });
      } else {
        newStrategy = await backtestService.createCustomStrategy(formData);
      }

      onStrategyCreated(newStrategy);
    } catch (error) {
      console.error('Error creating strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStrategyTypeOptions = () => backtestService.getStrategyTypeOptions();
  const getTimeframeOptions = () => backtestService.getTimeframeOptions();

  const renderTypeSelection = () => (
    <Fade in timeout={600}>
      <Box sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            How would you like to create your strategy?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Choose the method that best fits your needs
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={strategyType === 'from-trades' ? 8 : 2}
              onClick={() => setStrategyType('from-trades')}
              sx={{
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: strategyType === 'from-trades' 
                  ? `2px solid ${theme.palette.primary.main}` 
                  : '2px solid transparent',
                bgcolor: strategyType === 'from-trades' 
                  ? alpha(theme.palette.primary.main, 0.1) 
                  : 'background.paper',
                '&:hover': {
                  elevation: 6,
                  transform: 'translateY(-4px)',
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 3,
                  bgcolor: theme.palette.primary.main
                }}
              >
                <TargetIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                From Your Trades
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Analyze your actual trades to automatically create a strategy based on your successful patterns
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={strategyType === 'custom' ? 8 : 2}
              onClick={() => setStrategyType('custom')}
              sx={{
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: strategyType === 'custom' 
                  ? `2px solid ${theme.palette.success.main}` 
                  : '2px solid transparent',
                bgcolor: strategyType === 'custom' 
                  ? alpha(theme.palette.success.main, 0.1) 
                  : 'background.paper',
                '&:hover': {
                  elevation: 6,
                  transform: 'translateY(-4px)',
                  bgcolor: alpha(theme.palette.success.main, 0.05)
                }
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 3,
                  bgcolor: theme.palette.success.main
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Custom Strategy
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Build a strategy from scratch with your own entry/exit conditions and risk management rules
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );

  const renderFromTradesForm = () => (
    <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <TextField
        label="Strategy Name"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        fullWidth
        required
        error={!!errors.name}
        helperText={errors.name}
        placeholder="Enter strategy name"
      />

      <TextField
        label="Description"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        fullWidth
        multiline
        rows={3}
        placeholder="Describe your strategy (optional)"
      />

      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="primary" />
          Select Trades to Analyze *
        </Typography>
        <Paper 
          variant="outlined" 
          sx={{ 
            maxHeight: 300, 
            overflow: 'auto',
            bgcolor: alpha(theme.palette.background.paper, 0.8)
          }}
        >
          {tradeSelection.trades.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: alpha(theme.palette.grey[500], 0.1) }}>
                <WarningIcon sx={{ fontSize: 32, color: 'warning.main' }} />
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                No suitable trades found. You need completed trades with outcomes to create a strategy.
              </Typography>
            </Box>
          ) : (
            <List dense>
              {tradeSelection.trades.map((trade, index) => (
                <React.Fragment key={trade.id}>
                  <ListItem
                    button
                    onClick={() => {
                      const isSelected = tradeSelection.selectedTradeIds.includes(trade.id);
                      if (isSelected) {
                        setTradeSelection(prev => ({
                          ...prev,
                          selectedTradeIds: prev.selectedTradeIds.filter(id => id !== trade.id)
                        }));
                      } else {
                        setTradeSelection(prev => ({
                          ...prev,
                          selectedTradeIds: [...prev.selectedTradeIds, trade.id]
                        }));
                      }
                    }}
                    sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        checked={tradeSelection.selectedTradeIds.includes(trade.id)}
                        edge="start"
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {trade.symbol} - {trade.setup_type}
                          </Typography>
                          <Chip
                            label={`${trade.outcome} ($${trade.profit_loss?.toFixed(2)})`}
                            size="small"
                            color={trade.outcome === 'Win' ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={new Date(trade.entry_time).toLocaleDateString()}
                    />
                  </ListItem>
                  {index < tradeSelection.trades.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
        {errors.trades && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errors.trades}
          </Alert>
        )}
      </Box>
    </Box>
  );

  const renderCustomForm = () => (
    <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Basic Info */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Strategy Name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name}
            placeholder="Enter strategy name"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Strategy Type</InputLabel>
            <Select
              value={formData.strategy_type}
              label="Strategy Type"
              onChange={(e) => handleInputChange('strategy_type', e.target.value)}
            >
              {getStrategyTypeOptions().map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TextField
        label="Description"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        fullWidth
        multiline
        rows={3}
        placeholder="Describe your strategy"
      />

      {/* Entry Conditions */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TargetIcon color="primary" />
          Entry Conditions
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Minimum Risk:Reward Ratio"
              type="number"
              inputProps={{ step: 0.1, min: 0.1 }}
              value={formData.entry_conditions.min_risk_reward || ''}
              onChange={(e) => handleNestedInputChange('entry_conditions', 'min_risk_reward', parseFloat(e.target.value))}
              fullWidth
              required
              error={!!errors.entry_conditions}
              helperText={errors.entry_conditions || "Minimum acceptable risk to reward ratio"}
              placeholder="1.5"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Timeframes
              </Typography>
              <FormGroup row>
                {getTimeframeOptions().map(tf => (
                  <FormControlLabel
                    key={tf.value}
                    control={
                      <Checkbox
                        checked={formData.timeframes.includes(tf.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleArrayInputChange('timeframes', [...formData.timeframes, tf.value]);
                          } else {
                            handleArrayInputChange('timeframes', formData.timeframes.filter(t => t !== tf.value));
                          }
                        }}
                        size="small"
                      />
                    }
                    label={tf.label}
                  />
                ))}
              </FormGroup>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Exit Conditions */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="success" />
          Exit Conditions
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Take Profit Ratio"
              type="number"
              inputProps={{ step: 0.1, min: 0.1 }}
              value={formData.exit_conditions.take_profit_ratio || ''}
              onChange={(e) => handleNestedInputChange('exit_conditions', 'take_profit_ratio', parseFloat(e.target.value))}
              fullWidth
              required
              error={!!errors.exit_conditions}
              helperText={errors.exit_conditions || "Target profit multiplier"}
              placeholder="2.0"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Stop Loss Ratio"
              type="number"
              inputProps={{ step: 0.1, min: 0.1 }}
              value={formData.exit_conditions.stop_loss_ratio || 1.0}
              onChange={(e) => handleNestedInputChange('exit_conditions', 'stop_loss_ratio', parseFloat(e.target.value))}
              fullWidth
              helperText="Maximum loss multiplier"
              placeholder="1.0"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Max Hold Time (hours)"
              type="number"
              inputProps={{ min: 1 }}
              value={formData.exit_conditions.max_hold_time || 24}
              onChange={(e) => handleNestedInputChange('exit_conditions', 'max_hold_time', parseInt(e.target.value))}
              fullWidth
              helperText="Maximum time to hold position"
              placeholder="24"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Risk Management */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="error" />
          Risk Management
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Max Risk Per Trade (%)"
              type="number"
              inputProps={{ step: 0.1, min: 0.1, max: 10 }}
              value={(formData.risk_management.max_risk_per_trade * 100) || 2}
              onChange={(e) => handleNestedInputChange('risk_management', 'max_risk_per_trade', parseFloat(e.target.value) / 100)}
              fullWidth
              helperText="Percentage of account to risk per trade"
              placeholder="2"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Position Sizing</InputLabel>
              <Select
                value={formData.risk_management.position_sizing}
                label="Position Sizing"
                onChange={(e) => handleNestedInputChange('risk_management', 'position_sizing', e.target.value)}
              >
                <MenuItem value="fixed_percent">Fixed Percentage</MenuItem>
                <MenuItem value="fixed_amount">Fixed Amount</MenuItem>
                <MenuItem value="kelly_criterion">Kelly Criterion</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Max Concurrent Trades"
              type="number"
              inputProps={{ min: 1, max: 10 }}
              value={formData.risk_management.max_concurrent_trades}
              onChange={(e) => handleNestedInputChange('risk_management', 'max_concurrent_trades', parseInt(e.target.value))}
              fullWidth
              helperText="Maximum number of open positions"
              placeholder="1"
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  const tabs = [
    { label: 'Strategy Type', icon: <TargetIcon /> },
    { label: 'Configuration', icon: <SettingsIcon /> }
  ];

  const canProceed = () => {
    if (activeTab === 0) return strategyType !== null;
    return true;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          minHeight: '70vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Create New Strategy
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              disabled={index === 1 && !strategyType}
              sx={{ 
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 64
              }}
            />
          ))}
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 1, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
          {activeTab === 0 && renderTypeSelection()}
          {activeTab === 1 && strategyType === 'from-trades' && renderFromTradesForm()}
          {activeTab === 1 && strategyType === 'custom' && renderCustomForm()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {Object.keys(errors).length > 0 && (
              <Alert severity="error" sx={{ py: 0 }}>
                <Typography variant="body2">
                  Please fix the errors above
                </Typography>
              </Alert>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            {activeTab === 0 && (
              <Button 
                variant="contained"
                onClick={() => setActiveTab(1)}
                disabled={!canProceed()}
              >
                Next
              </Button>
            )}
            {activeTab === 1 && (
              <>
                <Button 
                  variant="outlined"
                  onClick={() => setActiveTab(0)}
                >
                  Back
                </Button>
                <Button 
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
                  sx={{ minWidth: 140 }}
                >
                  {loading ? 'Creating...' : 'Create Strategy'}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CreateStrategyModal;