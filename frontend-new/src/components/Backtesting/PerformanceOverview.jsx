// File: frontend-new/src/components/Backtesting/PerformanceOverview.jsx
// Purpose: Performance analysis component using Material-UI for consistency

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  LinearProgress,
  Alert,
  AlertTitle,
  Avatar,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardHeader,
  alpha,
  useTheme,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon,
  GpsFixed as TargetIcon,
  Groups as GroupsIcon,
  EmojiEvents as AwardIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Psychology as PsychologyIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import { backtestService } from '../../services/backtestService';

const PerformanceOverview = ({ strategies, backtests }) => {
  const theme = useTheme();
  const [performanceData, setPerformanceData] = useState(null);
  const [comparisons, setComparisons] = useState([]);
  const [selectedStrategies, setSelectedStrategies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, profitable

  useEffect(() => {
    generatePerformanceOverview();
  }, [strategies, backtests, filter]);

  const generatePerformanceOverview = () => {
    if (!strategies.length || !backtests.length) return;

    // Filter backtests based on selected filter
    let filteredBacktests = backtests;
    
    switch (filter) {
      case 'completed':
        filteredBacktests = backtests.filter(bt => bt.status === 'Completed');
        break;
      case 'profitable':
        filteredBacktests = backtests.filter(bt => 
          bt.status === 'Completed' && (bt.total_return_percent || 0) > 0
        );
        break;
      default:
        filteredBacktests = backtests.filter(bt => bt.status === 'Completed');
    }

    // Generate performance metrics for each strategy
    const strategyPerformance = strategies.map(strategy => {
      const strategyBacktests = filteredBacktests.filter(bt => bt.strategy_id === strategy.id);
      
      if (strategyBacktests.length === 0) {
        return {
          strategy,
          metrics: null,
          backtests: []
        };
      }

      const avgReturn = strategyBacktests.reduce((sum, bt) => sum + (bt.total_return_percent || 0), 0) / strategyBacktests.length;
      const avgWinRate = strategyBacktests.reduce((sum, bt) => sum + (bt.win_rate || 0), 0) / strategyBacktests.length;
      const avgDrawdown = strategyBacktests.reduce((sum, bt) => sum + (bt.max_drawdown_percent || 0), 0) / strategyBacktests.length;
      const totalTrades = strategyBacktests.reduce((sum, bt) => sum + (bt.total_trades || 0), 0);
      
      // Calculate consistency (lower variance = higher consistency)
      const returns = strategyBacktests.map(bt => bt.total_return_percent || 0);
      const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
      const consistency = Math.max(0, 100 - Math.sqrt(variance));

      // Risk-adjusted return (simple Calmar ratio)
      const riskAdjustedReturn = avgDrawdown > 0 ? avgReturn / avgDrawdown : avgReturn;

      return {
        strategy,
        metrics: {
          avgReturn,
          avgWinRate: avgWinRate * 100,
          avgDrawdown,
          totalTrades,
          backtestCount: strategyBacktests.length,
          consistency,
          riskAdjustedReturn,
          bestReturn: Math.max(...returns),
          worstReturn: Math.min(...returns)
        },
        backtests: strategyBacktests
      };
    }).filter(item => item.metrics !== null);

    setPerformanceData(strategyPerformance);
  };

  const handleCompareStrategies = async () => {
    if (selectedStrategies.length < 2) {
      return;
    }

    setLoading(true);
    try {
      const comparison = await backtestService.compareStrategies(selectedStrategies);
      setComparisons(comparison.comparisons);
    } catch (error) {
      console.error('Error comparing strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const allRecommendations = [];
      for (const strategy of strategies) {
        try {
          const recs = await backtestService.getStrategyRecommendations(strategy.id);
          allRecommendations.push(...(recs.recommendations || []));
        } catch (error) {
          console.error(`Error getting recommendations for strategy ${strategy.id}:`, error);
        }
      }
      setRecommendations(allRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'success':
        return <AwardIcon sx={{ color: 'success.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'improvement':
        return <TrendingUpIcon sx={{ color: 'primary.main' }} />;
      default:
        return <TargetIcon sx={{ color: 'grey.500' }} />;
    }
  };

  const getRecommendationSeverity = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'improvement':
        return 'info';
      default:
        return 'info';
    }
  };

  if (!performanceData || performanceData.length === 0) {
    return (
      <Fade in timeout={600}>
        <Paper elevation={1} sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
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
            <BarChartIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            No performance data available
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Run some backtests to see performance analysis and comparisons
          </Typography>
        </Paper>
      </Fade>
    );
  }

  // Prepare chart data
  const chartData = performanceData.map(item => ({
    name: item.strategy.name.substring(0, 15) + (item.strategy.name.length > 15 ? '...' : ''),
    return: item.metrics.avgReturn,
    winRate: item.metrics.avgWinRate,
    drawdown: item.metrics.avgDrawdown,
    trades: item.metrics.totalTrades,
    consistency: item.metrics.consistency,
    riskAdjusted: item.metrics.riskAdjustedReturn
  }));

  const scatterData = performanceData.map(item => ({
    x: item.metrics.avgDrawdown,
    y: item.metrics.avgReturn,
    name: item.strategy.name,
    size: item.metrics.totalTrades
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Controls */}
      <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filter}
                label="Filter"
                onChange={(e) => setFilter(e.target.value)}
                startAdornment={<FilterIcon sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="all">All Backtests</MenuItem>
                <MenuItem value="completed">Completed Only</MenuItem>
                <MenuItem value="profitable">Profitable Only</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => generatePerformanceOverview()}
            >
              Refresh
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PsychologyIcon />}
              onClick={loadRecommendations}
              disabled={loading}
            >
              {loading ? <CircularProgress size={16} /> : 'Get Recommendations'}
            </Button>
            
            <Button
              variant="contained"
              startIcon={<GroupsIcon />}
              onClick={handleCompareStrategies}
              disabled={selectedStrategies.length < 2 || loading}
            >
              Compare Selected ({selectedStrategies.length})
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Strategy Performance Table */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TargetIcon />
            Strategy Performance Summary
          </Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                      indeterminate={selectedStrategies.length > 0 && selectedStrategies.length < performanceData.length}
                      checked={selectedStrategies.length === performanceData.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStrategies(performanceData.map(item => item.strategy.id));
                        } else {
                          setSelectedStrategies([]);
                        }
                      }}
                    />
                    <Typography variant="subtitle2" fontWeight={600}>Strategy</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Avg Return</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Win Rate</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Drawdown</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Trades</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Backtests</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Consistency</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Risk-Adj</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performanceData.map((item) => (
                <TableRow 
                  key={item.strategy.id} 
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        checked={selectedStrategies.includes(item.strategy.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStrategies(prev => [...prev, item.strategy.id]);
                          } else {
                            setSelectedStrategies(prev => prev.filter(id => id !== item.strategy.id));
                          }
                        }}
                      />
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {item.strategy.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.strategy.strategy_type}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      fontWeight={600}
                      color={item.metrics.avgReturn >= 0 ? 'success.main' : 'error.main'}
                    >
                      {item.metrics.avgReturn.toFixed(2)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {item.metrics.avgWinRate.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600} color="error.main">
                      {item.metrics.avgDrawdown.toFixed(2)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {item.metrics.totalTrades}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {item.metrics.backtestCount}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, item.metrics.consistency)}
                        sx={{ 
                          width: 60, 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }}
                      />
                      <Typography variant="caption" fontWeight={600}>
                        {item.metrics.consistency.toFixed(0)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {item.metrics.riskAdjustedReturn.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Performance Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, bgcolor: alpha(theme.palette.secondary.main, 0.05), borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon />
                Average Returns by Strategy
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [`${value.toFixed(2)}%`, 'Avg Return']}
                      contentStyle={{ 
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8
                      }}
                    />
                    <Bar dataKey="return" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, bgcolor: alpha(theme.palette.success.main, 0.05), borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssessmentIcon />
                Risk vs Return Analysis
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={scatterData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis 
                      dataKey="x" 
                      name="Drawdown"
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      dataKey="y" 
                      name="Return"
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'y') return [`${value.toFixed(2)}%`, 'Avg Return'];
                        if (name === 'x') return [`${value.toFixed(2)}%`, 'Avg Drawdown'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Strategy: ${label}`}
                      contentStyle={{ 
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8
                      }}
                    />
                    <Scatter dataKey="y" fill={theme.palette.success.main} />
                  </ScatterChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 3, bgcolor: alpha(theme.palette.warning.main, 0.05), borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AwardIcon />
              Performance Recommendations
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recommendations.slice(0, 10).map((rec, index) => (
                <Alert 
                  key={index}
                  severity={getRecommendationSeverity(rec.type)}
                  icon={getRecommendationIcon(rec.type)}
                  sx={{ borderRadius: 2 }}
                >
                  <AlertTitle sx={{ fontWeight: 700 }}>
                    {rec.title}
                  </AlertTitle>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {rec.description}
                  </Typography>
                  {rec.current_value !== undefined && (
                    <Typography variant="caption" color="text.secondary">
                      Current: {rec.current_value.toFixed(2)}
                      {rec.target_value && ` → Target: ${rec.target_value.toFixed(2)}`}
                    </Typography>
                  )}
                </Alert>
              ))}
            </Box>
          </Box>
        </Paper>
      )}

      {/* Strategy Comparison Results */}
      {comparisons.length > 0 && (
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.05), borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupsIcon />
              Strategy Comparison Results
            </Typography>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                  <TableCell><Typography variant="subtitle2" fontWeight={600}>Rank</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2" fontWeight={600}>Strategy</Typography></TableCell>
                  <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Risk-Adj Return</Typography></TableCell>
                  <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Avg Return</Typography></TableCell>
                  <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Win Rate</Typography></TableCell>
                  <TableCell align="right"><Typography variant="subtitle2" fontWeight={600}>Max Drawdown</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisons.map((comp, index) => (
                  <TableRow 
                    key={comp.strategy_id} 
                    hover
                    sx={{ 
                      bgcolor: index === 0 ? alpha(theme.palette.success.main, 0.1) : 'inherit',
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {index === 0 && <AwardIcon sx={{ color: 'warning.main', fontSize: 20 }} />}
                        <Typography variant="body2" fontWeight={600}>
                          #{index + 1}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {comp.strategy_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {comp.strategy_type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {comp.risk_adjusted_return.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color={comp.avg_return_percent >= 0 ? 'success.main' : 'error.main'}
                      >
                        {comp.avg_return_percent.toFixed(2)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {(comp.avg_win_rate * 100).toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="error.main">
                        {comp.avg_max_drawdown.toFixed(2)}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default PerformanceOverview;