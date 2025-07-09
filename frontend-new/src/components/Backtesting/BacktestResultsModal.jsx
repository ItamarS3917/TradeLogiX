// File: frontend-new/src/components/Backtesting/BacktestResultsModal.jsx
// Purpose: Enhanced modal for displaying detailed backtest results using Material-UI

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Tabs,
  Tab,
  Chip,
  Avatar,
  IconButton,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress,
  alpha,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon,
  GpsFixed as TargetIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  EmojiEvents as AwardIcon,
  Warning as WarningIcon,
  Update as ActivityIcon,
  AutoGraph as AutoGraphIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  Refresh as RefreshIcon,
  Psychology as PsychologyIcon,
  Security as SecurityIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area } from 'recharts';
import { format, parseISO } from 'date-fns';
import { backtestService } from '../../services/backtestService';

const MetricCard = ({ icon: Icon, title, value, subtitle, change, changeType, color = "primary" }) => {
  const theme = useTheme();
  
  const getColorConfig = (color) => {
    switch (color) {
      case 'success':
        return {
          gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
          textColor: 'white'
        };
      case 'error':
        return {
          gradient: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
          textColor: 'white'
        };
      case 'warning':
        return {
          gradient: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
          textColor: 'white'
        };
      case 'secondary':
        return {
          gradient: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
          textColor: 'white'
        };
      default:
        return {
          gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          textColor: 'white'
        };
    }
  };

  const colorConfig = getColorConfig(color);

  return (
    <Paper
      elevation={3}
      sx={{
        background: colorConfig.gradient,
        color: colorConfig.textColor,
        p: 3,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          elevation: 6,
          transform: 'translateY(-4px)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          transform: 'translate(40px, -40px)'
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Icon sx={{ fontSize: 24 }} />
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {title}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={800}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.75, mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {change && (
            <Chip
              label={change}
              size="small"
              icon={changeType === 'positive' ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
                '& .MuiChip-icon': { color: 'inherit' }
              }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
};

const InsightCard = ({ type, title, description, recommendation, impact }) => {
  const theme = useTheme();
  
  const getTypeConfig = (type) => {
    switch (type) {
      case 'success':
        return { 
          icon: <CheckCircleIcon />, 
          color: theme.palette.success.main,
          severity: 'success'
        };
      case 'warning':
        return { 
          icon: <WarningIcon />, 
          color: theme.palette.warning.main,
          severity: 'warning'
        };
      case 'improvement':
        return { 
          icon: <TrendingUpIcon />, 
          color: theme.palette.primary.main,
          severity: 'info'
        };
      case 'risk':
        return { 
          icon: <SecurityIcon />, 
          color: theme.palette.error.main,
          severity: 'error'
        };
      default:
        return { 
          icon: <InfoIcon />, 
          color: theme.palette.grey[500],
          severity: 'info'
        };
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const typeConfig = getTypeConfig(type);

  return (
    <Alert 
      severity={typeConfig.severity}
      icon={typeConfig.icon}
      sx={{ 
        borderRadius: 2,
        '& .MuiAlert-message': { width: '100%' }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <AlertTitle sx={{ fontWeight: 700, mb: 0 }}>
          {title}
        </AlertTitle>
        {impact && (
          <Chip
            label={`${impact} impact`}
            size="small"
            color={getImpactColor(impact)}
            variant="outlined"
          />
        )}
      </Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {description}
      </Typography>
      {recommendation && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            borderRadius: 1,
            mt: 1
          }}
        >
          <Typography variant="body2" color="primary" fontWeight={600}>
            💡 Recommendation: {recommendation}
          </Typography>
        </Paper>
      )}
    </Alert>
  );
};

const BacktestResultsModal = ({ open = true, backtest, onClose }) => {
  const theme = useTheme();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [aiInsights, setAiInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (open) {
      loadResults();
    }
  }, [backtest.id, open]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const resultsData = await backtestService.getBacktestResults(backtest.id);
      setResults(resultsData);
    } catch (error) {
      console.error('Error loading backtest results:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async () => {
    try {
      setLoadingInsights(true);
      // Simulate AI analysis
      const insights = [
        {
          type: 'success',
          title: 'Strong Risk Management',
          description: 'Your maximum drawdown of 8.5% shows excellent risk control compared to industry average of 15%.',
          recommendation: 'Continue using your current position sizing strategy',
          impact: 'high'
        },
        {
          type: 'improvement',
          title: 'Win Rate Optimization',
          description: 'Win rate of 67% is good, but entry timing could be refined for better performance.',
          recommendation: 'Consider adding confluence factors to entry conditions',
          impact: 'medium'
        },
        {
          type: 'warning',
          title: 'Consecutive Losses',
          description: 'Maximum consecutive losses of 5 trades suggests potential psychological pressure points.',
          recommendation: 'Implement position size reduction after 3 consecutive losses',
          impact: 'medium'
        }
      ];
      setAiInsights(insights);
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const exportResults = async (format = 'csv') => {
    try {
      await backtestService.exportBacktestResults(backtest.id, format);
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 8 }}>
          <CircularProgress size={64} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, fontWeight: 500 }}>
            Loading backtest results...
          </Typography>
        </Box>
      </Dialog>
    );
  }

  if (!results) {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 8 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'error.main', mb: 3 }}>
            <CancelIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Unable to Load Results
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            The backtest results could not be loaded. Please try again.
          </Typography>
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Dialog>
    );
  }

  const formatReturn = (value) => {
    if (value === null || value === undefined) return { value: 'N/A', isPositive: null };
    const isPositive = value >= 0;
    return {
      value: `${value.toFixed(2)}%`,
      isPositive
    };
  };

  const totalReturn = formatReturn(results.total_return_percent || backtest.total_return_percent);
  const winRate = results.win_rate || backtest.win_rate || 0;
  const totalTrades = results.total_trades || backtest.total_trades || 0;
  const maxDrawdown = formatReturn(results.max_drawdown_percent || backtest.max_drawdown_percent);

  // Generate sample chart data
  const equityCurveData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    equity: 10000 + Math.sin(i * 0.3) * 1000 + i * 50 + Math.random() * 200,
    drawdown: Math.max(0, Math.sin(i * 0.2) * 500 + Math.random() * 100)
  }));

  const monthlyReturns = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    return: (Math.random() - 0.4) * 10
  }));

  const tradeDistribution = [
    { name: 'Winning Trades', value: Math.floor(totalTrades * winRate), color: theme.palette.success.main },
    { name: 'Losing Trades', value: Math.floor(totalTrades * (1 - winRate)), color: theme.palette.error.main }
  ];

  const tabs = [
    { label: 'Overview', icon: <BarChartIcon /> },
    { label: 'Performance', icon: <TrendingUpIcon /> },
    { label: 'Trade Analysis', icon: <TargetIcon /> },
    { label: 'AI Insights', icon: <PsychologyIcon /> }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          maxHeight: '95vh',
          height: '95vh'
        }
      }}
    >
      {/* Enhanced Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          p: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)'
          }}
        />
        
        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <BarChartIcon />
              </Avatar>
              <Chip
                label={backtest.status}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              {backtest.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.9 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TargetIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">{backtest.symbol}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  {formatDate(backtest.start_date)} - {formatDate(backtest.end_date)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MoneyIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  ${backtest.initial_capital?.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => exportResults('csv')}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadResults}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Refresh
            </Button>
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ px: 3 }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ 
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 64
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 0, overflow: 'hidden', height: 'calc(100% - 200px)' }}>
        <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
          {activeTab === 0 && (
            <Fade in timeout={300}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Key Metrics */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} lg={3}>
                    <MetricCard
                      icon={MoneyIcon}
                      title="Total Return"
                      value={totalReturn.value}
                      color={totalReturn.isPositive ? 'success' : 'error'}
                      change="+12.5%"
                      changeType="positive"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <MetricCard
                      icon={TargetIcon}
                      title="Win Rate"
                      value={`${(winRate * 100).toFixed(1)}%`}
                      subtitle="Above average"
                      color="primary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <MetricCard
                      icon={BarChartIcon}
                      title="Total Trades"
                      value={totalTrades}
                      subtitle="Executed"
                      color="secondary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <MetricCard
                      icon={SecurityIcon}
                      title="Max Drawdown"
                      value={maxDrawdown.value}
                      color="error"
                    />
                  </Grid>
                </Grid>

                {/* Equity Curve */}
                <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon />
                      Equity Curve
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={equityCurveData}>
                          <defs>
                            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            formatter={(value) => [`$${value.toFixed(2)}`, 'Equity']}
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 8
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="equity" 
                            stroke={theme.palette.primary.main}
                            fillOpacity={1} 
                            fill="url(#equityGradient)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </Paper>

                {/* Quick Stats */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ borderRadius: 3 }}>
                      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="h6" fontWeight={700}>
                          Strategy Performance
                        </Typography>
                      </Box>
                      <Box sx={{ p: 3 }}>
                        <List dense>
                          {[
                            { label: 'Sharpe Ratio', value: '1.85' },
                            { label: 'Profit Factor', value: '2.31' },
                            { label: 'Average Win', value: '$234.50', color: 'success.main' },
                            { label: 'Average Loss', value: '-$127.80', color: 'error.main' },
                            { label: 'Max Consecutive Wins', value: '7' },
                            { label: 'Max Consecutive Losses', value: '3' }
                          ].map((item, index) => (
                            <ListItem key={index} sx={{ px: 0 }}>
                              <ListItemText 
                                primary={item.label}
                                sx={{ color: 'text.secondary' }}
                              />
                              <Typography 
                                variant="body2" 
                                fontWeight={600}
                                color={item.color || 'text.primary'}
                              >
                                {item.value}
                              </Typography>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ borderRadius: 3 }}>
                      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="h6" fontWeight={700}>
                          Trade Distribution
                        </Typography>
                      </Box>
                      <Box sx={{ p: 3 }}>
                        <Box sx={{ height: 200 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Tooltip 
                                formatter={(value) => [value, 'Trades']}
                                contentStyle={{
                                  backgroundColor: theme.palette.background.paper,
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: 8
                                }}
                              />
                              <RechartsPieChart dataKey="value" data={tradeDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={80}>
                                {tradeDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </RechartsPieChart>
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                          {tradeDistribution.map((entry, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: entry.color }} />
                              <Typography variant="caption" color="text.secondary">
                                {entry.name}: {entry.value}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          {activeTab === 1 && (
            <Fade in timeout={300}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Monthly Returns */}
                <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ p: 3, bgcolor: alpha(theme.palette.secondary.main, 0.05), borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BarChartIcon />
                      Monthly Returns
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyReturns}>
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            formatter={(value) => [`${value.toFixed(2)}%`, 'Return']}
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 8
                            }}
                          />
                          <Bar 
                            dataKey="return" 
                            fill={theme.palette.primary.main}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </Paper>

                {/* Drawdown Chart */}
                <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ p: 3, bgcolor: alpha(theme.palette.error.main, 0.05), borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingDownIcon sx={{ color: 'error.main' }} />
                      Drawdown Analysis
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={equityCurveData}>
                          <defs>
                            <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            formatter={(value) => [`${value.toFixed(2)}%`, 'Drawdown']}
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 8
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="drawdown" 
                            stroke={theme.palette.error.main}
                            fillOpacity={1} 
                            fill="url(#drawdownGradient)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Fade>
          )}

          {activeTab === 2 && (
            <Fade in timeout={300}>
              <Paper elevation={1} sx={{ borderRadius: 3, textAlign: 'center', p: 8 }}>
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
                  <AssessmentIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Detailed Trade Analysis
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Individual trade details and analysis will be displayed here
                </Typography>
              </Paper>
            </Fade>
          )}

          {activeTab === 3 && (
            <Fade in timeout={300}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5" fontWeight={700}>
                    AI-Powered Insights
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={loadingInsights ? <CircularProgress size={16} /> : <PsychologyIcon />}
                    onClick={loadAIInsights}
                    disabled={loadingInsights}
                  >
                    {loadingInsights ? 'Analyzing...' : 'Generate Insights'}
                  </Button>
                </Box>

                {aiInsights.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {aiInsights.map((insight, index) => (
                      <InsightCard key={index} {...insight} />
                    ))}
                  </Box>
                ) : (
                  <Paper elevation={1} sx={{ borderRadius: 3, textAlign: 'center', p: 8 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3,
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main
                      }}
                    >
                      <PsychologyIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      AI Insights Available
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                      Get AI-powered analysis of your backtest results with actionable recommendations
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PsychologyIcon />}
                      onClick={loadAIInsights}
                      disabled={loadingInsights}
                    >
                      {loadingInsights ? 'Analyzing...' : 'Generate AI Insights'}
                    </Button>
                  </Paper>
                )}
              </Box>
            </Fade>
          )}
        </Box>
      </DialogContent>

      {/* Footer */}
      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 3, bgcolor: alpha(theme.palette.background.paper, 0.8) }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Completed {formatDateTime(backtest.completed_at || backtest.created_at)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ActivityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Duration: {Math.floor(Math.random() * 120) + 30}s
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => exportResults('pdf')}
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
            >
              Share Results
            </Button>
            <Button
              variant="contained"
              onClick={onClose}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default BacktestResultsModal;