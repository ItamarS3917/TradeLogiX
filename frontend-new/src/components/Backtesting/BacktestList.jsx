// File: frontend-new/src/components/Backtesting/BacktestList.jsx
// Purpose: Enhanced backtest list component using Material-UI for consistency

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  LinearProgress,
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
import BacktestResultsModal from './BacktestResultsModal';

const BacktestCard = ({ backtest, onViewResults, onAction, compact = false }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [progress, setProgress] = useState(backtest.progress_percent || 0);

  // Simulate progress updates for running backtests
  useEffect(() => {
    if (backtest.status === 'Running') {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + Math.random() * 2, 95));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [backtest.status]);

  const getStatusConfig = (status) => {
    const configs = {
      'Completed': {
        color: 'success',
        bgColor: alpha(theme.palette.success.main, 0.1),
        label: 'Completed'
      },
      'Running': {
        color: 'primary',
        bgColor: alpha(theme.palette.primary.main, 0.1),
        label: 'Running'
      },
      'Failed': {
        color: 'error',
        bgColor: alpha(theme.palette.error.main, 0.1),
        label: 'Failed'
      },
      'Cancelled': {
        color: 'warning',
        bgColor: alpha(theme.palette.warning.main, 0.1),
        label: 'Cancelled'
      },
      'Pending': {
        color: 'default',
        bgColor: alpha(theme.palette.grey[500], 0.1),
        label: 'Pending'
      }
    };
    return configs[status] || configs['Pending'];
  };

  const statusConfig = getStatusConfig(backtest.status);

  const formatReturn = (returnPercent) => {
    if (returnPercent === null || returnPercent === undefined) return { value: 'N/A', isPositive: null };
    const isPositive = returnPercent >= 0;
    return {
      value: `${returnPercent.toFixed(2)}%`,
      isPositive,
      color: isPositive ? theme.palette.success.main : theme.palette.error.main
    };
  };

  const returnData = formatReturn(backtest.total_return_percent);

  const getPerformanceGrade = () => {
    if (backtest.status !== 'Completed') return null;
    
    const winRate = (backtest.win_rate || 0) * 100;
    const returnPercent = backtest.total_return_percent || 0;
    const drawdown = backtest.max_drawdown_percent || 0;
    
    let score = 0;
    if (winRate >= 70) score += 30;
    else if (winRate >= 60) score += 20;
    else if (winRate >= 50) score += 10;
    
    if (returnPercent >= 20) score += 30;
    else if (returnPercent >= 10) score += 20;
    else if (returnPercent >= 5) score += 10;
    
    if (drawdown <= 5) score += 40;
    else if (drawdown <= 10) score += 30;
    else if (drawdown <= 15) score += 20;
    else if (drawdown <= 20) score += 10;
    
    if (score >= 80) return { grade: 'A', color: theme.palette.success.main };
    if (score >= 65) return { grade: 'B', color: theme.palette.primary.main };
    if (score >= 50) return { grade: 'C', color: theme.palette.warning.main };
    if (score >= 35) return { grade: 'D', color: theme.palette.orange?.main || theme.palette.warning.main };
    return { grade: 'F', color: theme.palette.error.main };
  };

  const grade = getPerformanceGrade();

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
          borderLeft: `6px solid ${theme.palette[statusConfig.color]?.main || theme.palette.grey[500]}`,
          background: statusConfig.bgColor,
          '&:hover': {
            elevation: 8,
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 28px ${alpha(theme.palette[statusConfig.color]?.main || theme.palette.grey[500], 0.2)}`
          }
        }}
      >
        <CardContent sx={{ p: compact ? 2 : 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette[statusConfig.color]?.main || theme.palette.grey[500],
                    width: compact ? 32 : 40,
                    height: compact ? 32 : 40
                  }}
                >
                  {statusConfig.label.charAt(0)}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant={compact ? "subtitle1" : "h6"} fontWeight={700} color="text.primary">
                      {backtest.name}
                    </Typography>
                    
                    <Chip
                      label={statusConfig.label}
                      color={statusConfig.color}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    
                    {grade && (
                      <Chip
                        label={`Grade: ${grade.grade}`}
                        size="small"
                        sx={{ 
                          color: grade.color,
                          bgcolor: alpha(grade.color, 0.1),
                          fontWeight: 700
                        }}
                      />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {backtest.symbol}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {formatDate(backtest.start_date)} - {formatDate(backtest.end_date)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      ${backtest.initial_capital?.toLocaleString() || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {backtest.status === 'Completed' && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onViewResults(backtest)}
                  sx={{ 
                    fontWeight: 600,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  {compact ? 'View' : 'View Results'}
                </Button>
              )}
              
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
                    {backtest.status === 'Completed' && [
                      <MenuItem key="view" onClick={() => { onViewResults(backtest); handleMenuClose(); }}>
                        <VisibilityIcon sx={{ mr: 2 }} />
                        View Detailed Results
                      </MenuItem>,
                      <MenuItem key="download" onClick={() => { onAction('download', backtest); handleMenuClose(); }}>
                        <DownloadIcon sx={{ mr: 2 }} />
                        Export Results
                      </MenuItem>,
                      <MenuItem key="analyze" onClick={() => { onAction('analyze', backtest); handleMenuClose(); }}>
                        <PsychologyIcon sx={{ mr: 2 }} />
                        AI Analysis
                      </MenuItem>
                    ]}
                    
                    {backtest.status === 'Running' && (
                      <MenuItem onClick={() => { onAction('stop', backtest); handleMenuClose(); }} sx={{ color: 'error.main' }}>
                        <PauseIcon sx={{ mr: 2 }} />
                        Stop Backtest
                      </MenuItem>
                    )}
                    
                    {(backtest.status === 'Failed' || backtest.status === 'Cancelled') && (
                      <MenuItem onClick={() => { onAction('retry', backtest); handleMenuClose(); }}>
                        <RefreshIcon sx={{ mr: 2 }} />
                        Retry Backtest
                      </MenuItem>
                    )}
                    
                    <MenuItem onClick={() => { onAction('delete', backtest); handleMenuClose(); }} sx={{ color: 'error.main' }}>
                      <CancelIcon sx={{ mr: 2 }} />
                      Delete Backtest
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Box>

          {/* Progress Bar for Running Backtests */}
          {backtest.status === 'Running' && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                mb: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight={600} color="primary">
                  Backtest in Progress
                </Typography>
                <Typography variant="body2" fontWeight={700} color="primary">
                  {progress.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress}
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4
                  }
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <TimerIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                <Typography variant="caption" color="primary">
                  Estimated time remaining: {Math.max(1, Math.floor((100 - progress) / 5))} minutes
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Performance Metrics */}
          {backtest.status === 'Completed' && !compact && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {[
                {
                  label: 'Total Return',
                  value: returnData.value,
                  color: returnData.color,
                  icon: returnData.isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />
                },
                {
                  label: 'Win Rate',
                  value: backtest.win_rate ? `${(backtest.win_rate * 100).toFixed(1)}%` : 'N/A',
                  color: theme.palette.primary.main,
                  icon: <BarChartIcon />
                },
                {
                  label: 'Total Trades',
                  value: backtest.total_trades || 'N/A',
                  color: theme.palette.secondary.main,
                  icon: <ActivityIcon />
                },
                {
                  label: 'Max Drawdown',
                  value: backtest.max_drawdown_percent ? `${backtest.max_drawdown_percent.toFixed(2)}%` : 'N/A',
                  color: theme.palette.error.main,
                  icon: <TrendingDownIcon />
                }
              ].map((metric, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor: alpha(metric.color, 0.05),
                      border: `1px solid ${alpha(metric.color, 0.2)}`,
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: metric.color, width: 24, height: 24 }}>
                        {metric.icon}
                      </Avatar>
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: metric.color }}>
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

          {/* Error Message */}
          {backtest.status === 'Failed' && backtest.error_message && (
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                mb: 2,
                bgcolor: alpha(theme.palette.error.main, 0.05),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <ErrorIcon sx={{ color: 'error.main', mt: 0.5, fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600} color="error.main">
                    Backtest Failed
                  </Typography>
                  <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
                    {backtest.error_message}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Compact Metrics */}
          {compact && backtest.status === 'Completed' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: returnData.color }}>
                Return: {returnData.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Win Rate: {backtest.win_rate ? `${(backtest.win_rate * 100).toFixed(1)}%` : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trades: {backtest.total_trades || 'N/A'}
              </Typography>
            </Box>
          )}

          {/* Timestamps */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon sx={{ fontSize: 12 }} />
              Created {formatDate(backtest.created_at)}
            </Typography>
            {backtest.completed_at && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 12 }} />
                Completed {formatDate(backtest.completed_at)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Paper>
    </Grow>
  );
};

const BacktestList = ({ backtests, onRefresh, compact = false }) => {
  const theme = useTheme();
  const [selectedBacktest, setSelectedBacktest] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  const handleViewResults = (backtest) => {
    setSelectedBacktest(backtest);
    setShowResultsModal(true);
  };

  const handleAction = (action, backtest) => {
    console.log(`Action: ${action}`, backtest);
    // Handle different actions here
  };

  // Filter and sort backtests
  const filteredBacktests = backtests
    .filter(backtest => {
      const matchesSearch = backtest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           backtest.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || backtest.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'return':
          return (b.total_return_percent || 0) - (a.total_return_percent || 0);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  if (backtests.length === 0) {
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
            <PlayIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            No backtests yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Run your first backtest to validate your trading strategies and analyze performance
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayIcon />}
            sx={{
              fontWeight: 700,
              borderRadius: 3,
              px: 4,
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            Run Your First Backtest
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
                placeholder="Search backtests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status Filter"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  startAdornment={<FilterIcon sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Running">Running</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
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
                  startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="created_at">Created Date</MenuItem>
                  <MenuItem value="return">Total Return</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {(searchTerm || statusFilter !== 'all') && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredBacktests.length} of {backtests.length} backtests
              </Typography>
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear filters
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Backtest Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: compact ? 400 : 'none', overflow: compact ? 'auto' : 'visible' }}>
        {filteredBacktests.map((backtest) => (
          <BacktestCard
            key={backtest.id}
            backtest={backtest}
            onViewResults={handleViewResults}
            onAction={handleAction}
            compact={compact}
          />
        ))}
        
        {filteredBacktests.length === 0 && (searchTerm || statusFilter !== 'all') && (
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
                <SearchIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                No backtests found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Paper>
          </Fade>
        )}
      </Box>

      {/* Results Modal */}
      {showResultsModal && selectedBacktest && (
        <BacktestResultsModal
          backtest={selectedBacktest}
          onClose={() => {
            setShowResultsModal(false);
            setSelectedBacktest(null);
          }}
        />
      )}
    </Box>
  );
};

export default BacktestList;