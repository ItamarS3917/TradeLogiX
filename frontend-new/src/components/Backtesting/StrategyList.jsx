// File: frontend-new/src/components/Backtesting/StrategyList.jsx
// Purpose: Enhanced strategy list component using Material-UI for consistency

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  alpha,
  useTheme,
  Fade,
  Grow
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import RunBacktestModal from './RunBacktestModal';

const StrategyCard = ({ strategy, onRunBacktest, onAction, compact = false }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const getStrategyTypeConfig = (type) => {
    const configs = {
      'MMXM_SUPPLY_DEMAND': { 
        label: 'MMXM Supply/Demand', 
        color: theme.palette.primary.main,
        bgColor: alpha(theme.palette.primary.main, 0.1)
      },
      'ICT_ORDER_BLOCK': { 
        label: 'ICT Order Block', 
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1)
      },
      'ICT_FAIR_VALUE_GAP': { 
        label: 'ICT Fair Value Gap', 
        color: theme.palette.secondary.main,
        bgColor: alpha(theme.palette.secondary.main, 0.1)
      },
      'ICT_BREAKER': { 
        label: 'ICT Breaker', 
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1)
      },
      'ICT_MITIGATION': { 
        label: 'ICT Mitigation', 
        color: theme.palette.error.main,
        bgColor: alpha(theme.palette.error.main, 0.1)
      },
      'LIQUIDITY_GRAB': { 
        label: 'Liquidity Grab', 
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1)
      },
      'CUSTOM_SETUP': { 
        label: 'Custom Setup', 
        color: theme.palette.grey[600],
        bgColor: alpha(theme.palette.grey[600], 0.1)
      },
      'COMBINED_STRATEGY': { 
        label: 'Combined Strategy', 
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1)
      }
    };
    return configs[strategy.strategy_type] || configs['CUSTOM_SETUP'];
  };

  const typeConfig = getStrategyTypeConfig(strategy.strategy_type);

  const getPerformanceMetrics = () => {
    // This would come from actual backtest results
    return {
      winRate: Math.floor(Math.random() * 30) + 55, // 55-85%
      avgReturn: (Math.random() * 20 - 5).toFixed(1), // -5% to 15%
      totalBacktests: Math.floor(Math.random() * 10) + 1,
      status: Math.random() > 0.3 ? 'active' : 'needs_optimization'
    };
  };

  const metrics = getPerformanceMetrics();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <Grow in timeout={600}>
      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          borderLeft: `6px solid ${typeConfig.color}`,
          background: typeConfig.bgColor,
          position: 'relative',
          '&:hover': {
            elevation: 8,
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 28px ${alpha(typeConfig.color, 0.2)}`
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(typeConfig.color, 0.1)}, transparent)`,
            transform: 'translate(50%, -50%)',
            transition: 'transform 0.3s ease'
          },
          '&:hover::before': {
            transform: 'translate(50%, -50%) scale(1.5)'
          }
        }}
      >
        <CardContent sx={{ p: compact ? 2 : 3, position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: typeConfig.color,
                    width: compact ? 32 : 48,
                    height: compact ? 32 : 48
                  }}
                >
                  T
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                    <Typography variant={compact ? "subtitle1" : "h6"} fontWeight={700} color="text.primary">
                      {strategy.name}
                    </Typography>
                    
                    <Chip
                      label={typeConfig.label}
                      size="small"
                      sx={{ 
                        bgcolor: typeConfig.bgColor,
                        color: typeConfig.color,
                        fontWeight: 600
                      }}
                    />
                    
                    {strategy.created_from_trades && (
                      <Chip
                        label="From Trades"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    
                    {metrics.status === 'active' && (
                      <Chip
                        label="Active"
                        size="small"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>
                  
                  {strategy.description && !compact && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
                      {strategy.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Created {formatDate(strategy.created_at)}
                    </Typography>
                    {strategy.timeframes && strategy.timeframes.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {strategy.timeframes.join(', ')}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Updated {formatDate(strategy.updated_at || strategy.created_at)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => onRunBacktest(strategy)}
                sx={{
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`
                  }
                }}
              >
                {compact ? 'Run' : 'Run Backtest'}
              </Button>
              
              {!compact && (
                <>
                  <IconButton onClick={handleMenuOpen} size="small">
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      sx: { borderRadius: 2, minWidth: 200 }
                    }}
                  >
                    <MenuItem onClick={() => { onAction('edit', strategy); handleMenuClose(); }}>
                      Edit Strategy
                    </MenuItem>
                    <MenuItem onClick={() => { onAction('copy', strategy); handleMenuClose(); }}>
                      Duplicate Strategy
                    </MenuItem>
                    <MenuItem onClick={() => { onAction('performance', strategy); handleMenuClose(); }}>
                      View Performance
                    </MenuItem>
                    <MenuItem onClick={() => { onAction('optimize', strategy); handleMenuClose(); }}>
                      AI Optimization
                    </MenuItem>
                    <MenuItem onClick={() => { onAction('delete', strategy); handleMenuClose(); }} sx={{ color: 'error.main' }}>
                      Delete Strategy
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Box>

          {/* Performance Metrics */}
          {!compact && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {[
                {
                  label: 'Win Rate',
                  value: `${metrics.winRate}%`,
                  color: theme.palette.success.main
                },
                {
                  label: 'Avg Return',
                  value: `${metrics.avgReturn}%`,
                  color: parseFloat(metrics.avgReturn) >= 0 ? theme.palette.success.main : theme.palette.error.main
                },
                {
                  label: 'Backtests',
                  value: metrics.totalBacktests,
                  color: theme.palette.primary.main
                },
                {
                  label: 'Setups',
                  value: strategy.setup_types ? strategy.setup_types.length : 'N/A',
                  color: theme.palette.secondary.main
                }
              ].map((metric, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      bgcolor: alpha(metric.color, 0.05),
                      border: `1px solid ${alpha(metric.color, 0.2)}`,
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} sx={{ color: metric.color, fontSize: '1rem' }}>
                      {metric.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {metric.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Setup Types Tags */}
          {!compact && strategy.setup_types && strategy.setup_types.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {strategy.setup_types.slice(0, 4).map((setup, index) => (
                  <Chip
                    key={index}
                    label={setup}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
                {strategy.setup_types.length > 4 && (
                  <Chip
                    label={`+${strategy.setup_types.length - 4} more`}
                    size="small"
                    color="primary"
                    sx={{ fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Strategy Health Indicator */}
          {!compact && (
            <Box sx={{ pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: metrics.status === 'active' ? 'success.main' : 'warning.main',
                      animation: 'pulse 2s infinite'
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {metrics.status === 'active' ? 'Performing well' : 'Needs optimization'}
                  </Typography>
                </Box>
                
                <Typography variant="caption" color="primary.main" sx={{ cursor: 'pointer' }}>
                  View details →
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Paper>
    </Grow>
  );
};

const StrategyList = ({ strategies, onRunBacktest, onRefresh, compact = false }) => {
  const theme = useTheme();
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [showRunModal, setShowRunModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [filterType, setFilterType] = useState('all');

  const handleRunBacktest = (strategy) => {
    setSelectedStrategy(strategy);
    setShowRunModal(true);
  };

  const handleBacktestSubmit = async (config) => {
    if (selectedStrategy) {
      await onRunBacktest(selectedStrategy.id, config);
      setShowRunModal(false);
      setSelectedStrategy(null);
    }
  };

  const handleAction = (action, strategy) => {
    console.log(`Action: ${action}`, strategy);
    // Handle different actions here
  };

  // Filter and sort strategies
  const filteredStrategies = strategies
    .filter(strategy => {
      const matchesSearch = strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           strategy.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || strategy.strategy_type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'updated_at':
          return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
        default:
          return 0;
      }
    });

  if (strategies.length === 0) {
    return (
      <Fade in timeout={600}>
        <Paper elevation={1} sx={{ textAlign: 'center', p: 8, borderRadius: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main
            }}
          >
            T
          </Avatar>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            No strategies yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Create your first trading strategy to start backtesting and optimize your trading approach
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => window.location.href = '#create'}
            sx={{
              fontWeight: 700,
              borderRadius: 3,
              px: 4,
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            Create Your First Strategy
          </Button>
        </Paper>
      </Fade>
    );
  }

  return (
    <Box>
      {/* Search and Filter Controls */}
      {!compact && (
        <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search strategies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type Filter</InputLabel>
                <Select
                  value={filterType}
                  label="Type Filter"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="MMXM_SUPPLY_DEMAND">MMXM Supply/Demand</MenuItem>
                  <MenuItem value="ICT_ORDER_BLOCK">ICT Order Block</MenuItem>
                  <MenuItem value="ICT_FAIR_VALUE_GAP">ICT Fair Value Gap</MenuItem>
                  <MenuItem value="LIQUIDITY_GRAB">Liquidity Grab</MenuItem>
                  <MenuItem value="CUSTOM_SETUP">Custom Setup</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="created_at">Created Date</MenuItem>
                  <MenuItem value="updated_at">Updated Date</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {(searchTerm || filterType !== 'all') && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredStrategies.length} of {strategies.length} strategies
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
              >
                Clear filters
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Strategy Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: compact ? 400 : 'none', overflow: compact ? 'auto' : 'visible' }}>
        {filteredStrategies.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            onRunBacktest={handleRunBacktest}
            onAction={handleAction}
            compact={compact}
          />
        ))}
        
        {filteredStrategies.length === 0 && (searchTerm || filterType !== 'all') && (
          <Fade in timeout={600}>
            <Paper elevation={1} sx={{ textAlign: 'center', p: 6, borderRadius: 3 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 3,
                  bgcolor: alpha(theme.palette.grey[500], 0.1),
                  color: theme.palette.grey[500]
                }}
              >
                S
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                No strategies found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Paper>
          </Fade>
        )}
      </Box>

      {/* Run Backtest Modal */}
      {showRunModal && selectedStrategy && (
        <RunBacktestModal
          strategy={selectedStrategy}
          onClose={() => {
            setShowRunModal(false);
            setSelectedStrategy(null);
          }}
          onSubmit={handleBacktestSubmit}
        />
      )}
    </Box>
  );
};

export default StrategyList;