// File: frontend-new/src/components/Backtesting/RunBacktestModal.jsx
// Purpose: Modal for configuring and running backtests using Material-UI

import React, { useState } from 'react';
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
  Grid,
  Alert,
  AlertTitle,
  Chip,
  Paper,
  IconButton,
  InputAdornment,
  alpha,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { backtestService } from '../../services/backtestService';

const RunBacktestModal = ({ open = true, strategy, onClose, onSubmit }) => {
  const theme = useTheme();
  const [config, setConfig] = useState({
    name: `${strategy.name} Backtest - ${new Date().toLocaleDateString()}`,
    symbol: 'NQ',
    start_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year ago
    end_date: new Date().toISOString().split('T')[0], // Today
    initial_capital: 10000
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateConfig = async () => {
    const validationErrors = await backtestService.validateBacktestConfig(config);
    setErrors(validationErrors || {});
    return !validationErrors;
  };

  const handleSubmit = async () => {
    const isValid = await validateConfig();
    if (!isValid) return;

    setLoading(true);
    try {
      await onSubmit({
        ...config,
        start_date: new Date(config.start_date).toISOString(),
        end_date: new Date(config.end_date).toISOString()
      });
    } catch (error) {
      console.error('Error submitting backtest:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePeriodDays = () => {
    const start = new Date(config.start_date);
    const end = new Date(config.end_date);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getEstimatedDuration = () => {
    const days = calculatePeriodDays();
    if (days < 30) return '< 1 minute';
    if (days < 365) return '1-5 minutes';
    if (days < 1825) return '5-15 minutes';
    return '15+ minutes';
  };

  const symbolOptions = [
    { value: 'NQ', label: 'NASDAQ-100 E-Mini (NQ)' },
    { value: 'ES', label: 'S&P 500 E-Mini (ES)' },
    { value: 'YM', label: 'Dow Jones E-Mini (YM)' },
    { value: 'RTY', label: 'Russell 2000 E-Mini (RTY)' }
  ];

  const quickPeriods = [
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 },
    { label: '2 Years', days: 730 }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          minHeight: '60vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Run Backtest
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Strategy: {strategy.name}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {/* Backtest Name */}
          <TextField
            label="Backtest Name"
            value={config.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name}
            placeholder="Enter backtest name"
          />

          {/* Symbol Selection */}
          <FormControl fullWidth required>
            <InputLabel>Symbol</InputLabel>
            <Select
              value={config.symbol}
              label="Symbol"
              onChange={(e) => handleInputChange('symbol', e.target.value)}
            >
              {symbolOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date Range */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Start Date"
                type="date"
                value={config.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                fullWidth
                required
                error={!!errors.start_date}
                helperText={errors.start_date}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: config.end_date }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="End Date"
                type="date"
                value={config.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                fullWidth
                required
                error={!!errors.end_date}
                helperText={errors.end_date}
                InputLabelProps={{ shrink: true }}
                inputProps={{ 
                  min: config.start_date,
                  max: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>
          </Grid>

          {/* Initial Capital */}
          <TextField
            label="Initial Capital"
            type="number"
            value={config.initial_capital}
            onChange={(e) => handleInputChange('initial_capital', parseFloat(e.target.value))}
            fullWidth
            required
            error={!!errors.initial_capital}
            helperText={errors.initial_capital || "Starting capital for the backtest"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MoneyIcon />
                </InputAdornment>
              ),
              inputProps: { min: 100, max: 1000000, step: 100 }
            }}
            placeholder="10000"
          />

          {/* Quick Period Selection */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon fontSize="small" />
              Quick Period Selection
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {quickPeriods.map(period => (
                <Chip
                  key={period.label}
                  label={period.label}
                  variant="outlined"
                  clickable
                  onClick={() => {
                    const endDate = new Date();
                    const startDate = new Date(endDate.getTime() - (period.days * 24 * 60 * 60 * 1000));
                    handleInputChange('start_date', startDate.toISOString().split('T')[0]);
                    handleInputChange('end_date', endDate.toISOString().split('T')[0]);
                  }}
                  sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }}
                />
              ))}
            </Box>
          </Box>

          {/* Backtest Summary */}
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="primary" />
              Backtest Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Period
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {calculatePeriodDays()} days
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Est. Duration
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {getEstimatedDuration()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Strategy Type
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {backtestService.formatStrategyType(strategy.strategy_type)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Capital at Risk
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    ${config.initial_capital?.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Warning for long periods */}
          {calculatePeriodDays() > 1000 && (
            <Alert 
              severity="warning" 
              icon={<WarningIcon />}
              sx={{ borderRadius: 2 }}
            >
              <AlertTitle sx={{ fontWeight: 700 }}>
                Long Backtest Period
              </AlertTitle>
              <Typography variant="body2">
                This backtest covers {calculatePeriodDays()} days and may take several minutes to complete.
                Consider using a shorter period for faster results.
              </Typography>
            </Alert>
          )}

          {/* Strategy Preview */}
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.main, 0.02)
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon fontSize="small" color="success" />
              Strategy Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Chip 
                label={`Type: ${backtestService.formatStrategyType(strategy.strategy_type)}`} 
                size="small" 
                variant="outlined" 
              />
              {strategy.timeframes && (
                <Chip 
                  label={`Timeframes: ${strategy.timeframes.join(', ')}`} 
                  size="small" 
                  variant="outlined" 
                />
              )}
              {strategy.risk_management && (
                <Chip 
                  label={`Risk: ${(strategy.risk_management.max_risk_per_trade * 100).toFixed(1)}%`} 
                  size="small" 
                  variant="outlined" 
                />
              )}
            </Box>
          </Paper>
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
            <Button 
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || Object.keys(errors).length > 0}
              startIcon={loading ? <CircularProgress size={16} /> : <PlayIcon />}
              sx={{ minWidth: 140 }}
            >
              {loading ? 'Starting...' : 'Run Backtest'}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default RunBacktestModal;