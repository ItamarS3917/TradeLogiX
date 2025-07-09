// File: frontend-new/src/components/Backtesting/BacktestingDashboard.jsx
// Purpose: Redesigned backtesting dashboard with Material-UI to match app design system

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  LinearProgress,
  Avatar,
  Divider,
  Tooltip,
  alpha,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Tab,
  Tabs,
  Fade,
  Grow
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  GpsFixed as TargetIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pause as PauseIcon,
  Settings as SettingsIcon,
  AutoGraph as AutoGraphIcon,
  TrendingDown as TrendingDownIcon,
  StarBorder as StarIcon,
  School as SchoolIcon,
  Security as SecurityIcon,
  FlashOn as FlashOnIcon,
  Storage as StorageIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';
import StrategyList from './StrategyList';
import BacktestList from './BacktestList';
import CreateStrategyModal from './CreateStrategyModal';
import PerformanceOverview from './PerformanceOverview';
import { backtestService } from '../../services/backtestService';

// Enhanced Stat Card with Material-UI
const StatCard = ({ icon, title, value, subtitle, change, changeType, color = "primary", onClick }) => {
  const theme = useTheme();
  
  return (
    <Grow in timeout={600}>
      <Paper
        elevation={2}
        onClick={onClick}
        sx={{
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)}, ${alpha(theme.palette[color].main, 0.05)})`,
          border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
          transition: 'all 0.3s ease',
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            elevation: 6,
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 28px ${alpha(theme.palette[color].main, 0.2)}`
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: theme.palette[color].main,
                width: 56,
                height: 56,
                boxShadow: `0 8px 16px ${alpha(theme.palette[color].main, 0.3)}`
              }}
            >
              {icon}
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
                {title}
              </Typography>
              <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ lineHeight: 1 }}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          
          {change && (
            <Box sx={{ textAlign: 'right' }}>
              <Chip
                label={change}
                size="small"
                icon={changeType === 'positive' ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
                color={changeType === 'positive' ? 'success' : 'error'}
                sx={{ 
                  fontWeight: 700,
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  }
                }}
              />
            </Box>
          )}
        </Box>
      </Paper>
    </Grow>
  );
};

// Empty State with Material-UI
const EmptyStateCard = ({ icon, title, description, actionText, onAction, gradient = false }) => {
  const theme = useTheme();
  
  return (
    <Fade in timeout={800}>
      <Paper
        elevation={gradient ? 4 : 1}
        sx={{
          p: 8,
          textAlign: 'center',
          borderRadius: 4,
          background: gradient 
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.05)})` 
            : theme.palette.background.paper,
          border: gradient 
            ? `2px solid ${alpha(theme.palette.primary.main, 0.2)}` 
            : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': gradient ? {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
            animation: 'pulse 4s ease-in-out infinite'
          } : {}
        }}
      >
        <Avatar
          sx={{
            width: 100,
            height: 100,
            mx: 'auto',
            mb: 4,
            background: gradient 
              ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              : alpha(theme.palette.primary.main, 0.1),
            color: gradient ? 'white' : theme.palette.primary.main,
            fontSize: 48
          }}
        >
          {icon}
        </Avatar>
        
        <Typography variant="h4" fontWeight={700} gutterBottom color="text.primary">
          {title}
        </Typography>
        
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ mb: 4, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}
        >
          {description}
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={onAction}
          sx={{
            fontWeight: 700,
            borderRadius: 3,
            px: 4,
            py: 2,
            fontSize: '1.1rem',
            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
              transform: 'translateY(-2px)'
            }
          }}
        >
          {actionText}
        </Button>
      </Paper>
    </Fade>
  );
};

// Quick Start Guide with Material-UI
const QuickStartGuide = ({ onCreateStrategy }) => {
  const theme = useTheme();
  
  const steps = [
    { 
      step: 1, 
      title: "Create Your First Strategy", 
      description: "Define entry/exit rules, risk management, and setup types", 
      icon: <TargetIcon />,
      color: theme.palette.primary.main
    },
    { 
      step: 2, 
      title: "Run Historical Backtest", 
      description: "Test your strategy against past market data", 
      icon: <PlayIcon />,
      color: theme.palette.success.main
    },
    { 
      step: 3, 
      title: "Analyze Results", 
      description: "Review performance metrics and optimize your approach", 
      icon: <AssessmentIcon />,
      color: theme.palette.secondary.main
    }
  ];

  return (
    <Grow in timeout={800}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.light, 0.05)})`,
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          overflow: 'hidden'
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: theme.palette.info.main }}>
              <SchoolIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6" fontWeight={700} color="info.main">
              Quick Start Guide
            </Typography>
          }
          sx={{ 
            bgcolor: alpha(theme.palette.info.main, 0.05),
            borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
          }}
        />
        
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            {steps.map((item, index) => (
              <Box key={item.step} sx={{ display: 'flex', alignItems: 'flex-start', mb: 3, '&:last-child': { mb: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 3 }}>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: theme.palette.info.main,
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 700
                    }}
                  >
                    {item.step}
                  </Avatar>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: item.color,
                      color: 'white'
                    }}
                  >
                    {item.icon}
                  </Avatar>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom color="text.primary">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {item.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              sx={{ flex: 1, fontWeight: 600 }}
              startIcon={<InsightsIcon />}
              onClick={() => window.open('https://docs.example.com/backtesting-guide', '_blank')}
            >
              Learn Best Practices
            </Button>
            <Button 
              variant="contained"
              sx={{ flex: 1, fontWeight: 600 }}
              onClick={onCreateStrategy}
            >
              Get Started
            </Button>
          </Box>
        </CardContent>
      </Paper>
    </Grow>
  );
};

// Feature Highlight with Material-UI
const FeatureHighlight = ({ icon, title, description, color = "primary" }) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-4px)',
          borderColor: alpha(theme.palette[color].main, 0.3),
          boxShadow: `0 8px 24px ${alpha(theme.palette[color].main, 0.15)}`
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette[color].main, 0.1),
            color: theme.palette[color].main,
            width: 48,
            height: 48
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom color="text.primary">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {description}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

// Main Material-UI Backtesting Dashboard
const BacktestingDashboard = () => {
  const theme = useTheme();
  const [strategies, setStrategies] = useState([]);
  const [backtests, setBacktests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [strategiesData, backtestsData] = await Promise.all([
        backtestService.getStrategies(),
        backtestService.getBacktests()
      ]);
      setStrategies(strategiesData);
      setBacktests(backtestsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStrategyCreated = (newStrategy) => {
    setStrategies(prev => [newStrategy, ...prev]);
    setShowCreateModal(false);
  };

  const handleRunBacktest = async (strategyId, config) => {
    try {
      await backtestService.runBacktest(strategyId, config);
      loadData();
    } catch (error) {
      console.error('Error running backtest:', error);
    }
  };

  const getOverviewStats = () => {
    const completedBacktests = backtests.filter(bt => bt.status === 'Completed');
    const runningBacktests = backtests.filter(bt => bt.status === 'Running');
    const totalStrategies = strategies.length;
    const avgWinRate = completedBacktests.length > 0 
      ? completedBacktests.reduce((sum, bt) => sum + (bt.win_rate || 0), 0) / completedBacktests.length 
      : 0;

    return {
      totalStrategies,
      totalBacktests: backtests.length,
      runningBacktests: runningBacktests.length,
      avgWinRate: avgWinRate * 100
    };
  };

  const stats = getOverviewStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column">
        <CircularProgress size={64} thickness={4} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3, fontWeight: 500 }}>
          Loading backtesting data...
        </Typography>
      </Box>
    );
  }

  const isEmpty = strategies.length === 0 && backtests.length === 0;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Enhanced Header */}
      <Paper
        elevation={8}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            animation: 'pulse 6s ease-in-out infinite'
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ maxWidth: 600 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
                  <BarChartIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Chip 
                  label="Strategy Testing" 
                  variant="outlined" 
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontWeight: 600
                  }} 
                />
              </Box>
              
              <Typography variant="h3" fontWeight={800} gutterBottom sx={{ lineHeight: 1.1 }}>
                Strategy Backtesting
              </Typography>
              
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 3, lineHeight: 1.5, fontWeight: 400 }}>
                Test and validate your trading strategies with historical data to optimize performance and build confidence
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, opacity: 0.9 }}>
                {[
                  { icon: <AutoGraphIcon />, text: "Real-time Analysis" },
                  { icon: <SecurityIcon />, text: "Risk Management" },
                  { icon: <FlashOnIcon />, text: "AI Insights" }
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.icon}
                    <Typography variant="body2" fontWeight={500}>
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  fontWeight: 600,
                  '&:hover': { 
                    borderColor: 'white', 
                    bgcolor: 'rgba(255,255,255,0.1)' 
                  }
                }}
              >
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  fontWeight: 600,
                  '&:hover': { 
                    borderColor: 'white', 
                    bgcolor: 'rgba(255,255,255,0.1)' 
                  }
                }}
              >
                Settings
              </Button>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateModal(true)}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                  }
                }}
              >
                Create Strategy
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {isEmpty ? (
        /* Empty State */
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <EmptyStateCard
              icon={<TargetIcon sx={{ fontSize: 56 }} />}
              title="Create Your First Strategy"
              description="Start by defining your trading rules, entry/exit conditions, and risk management parameters. Transform your trading ideas into testable strategies."
              actionText="Create Strategy"
              onAction={() => setShowCreateModal(true)}
              gradient={true}
            />
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <QuickStartGuide onCreateStrategy={() => setShowCreateModal(true)} />
          </Grid>
          
          {/* Feature Highlights */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                    <StarIcon />
                  </Avatar>
                }
                title={
                  <Typography variant="h5" fontWeight={700}>
                    Powerful Backtesting Features
                  </Typography>
                }
                sx={{ 
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              />
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FeatureHighlight
                      icon={<BarChartIcon />}
                      title="Advanced Analytics"
                      description="Comprehensive performance metrics including Sharpe ratio, drawdown analysis, and win/loss ratios with detailed visualizations"
                      color="primary"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FeatureHighlight
                      icon={<PsychologyIcon />}
                      title="AI-Powered Insights"
                      description="Get intelligent recommendations for strategy optimization based on historical performance and market patterns"
                      color="secondary"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FeatureHighlight
                      icon={<StorageIcon />}
                      title="Historical Data"
                      description="Access years of high-quality historical market data for comprehensive strategy validation across different market conditions"
                      color="success"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FeatureHighlight
                      icon={<TimelineIcon />}
                      title="Real-time Monitoring"
                      description="Track backtest progress in real-time with detailed execution logs, alerts, and performance streaming"
                      color="warning"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        /* Dashboard Content */
        <Grid container spacing={3}>
          {/* Stats Grid */}
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={<TargetIcon />}
              title="Active Strategies"
              value={stats.totalStrategies}
              subtitle="Ready for backtesting"
              color="primary"
              onClick={() => setActiveTab(1)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={<PlayIcon />}
              title="Total Backtests"
              value={stats.totalBacktests}
              subtitle={`${stats.runningBacktests} currently running`}
              color="secondary"
              onClick={() => setActiveTab(2)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={<TrendingUpIcon />}
              title="Average Win Rate"
              value={`${stats.avgWinRate.toFixed(1)}%`}
              subtitle="Across all strategies"
              change="+2.3%"
              changeType="positive"
              color="success"
              onClick={() => setActiveTab(3)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              icon={<SpeedIcon />}
              title="Performance Grade"
              value="A"
              subtitle="Top performing strategy"
              color="warning"
              onClick={() => setActiveTab(3)}
            />
          </Grid>

          {/* Tabbed Content */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  sx={{
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem'
                    }
                  }}
                >
                  <Tab 
                    label="Overview" 
                    icon={<BarChartIcon />} 
                    iconPosition="start"
                    sx={{ minHeight: 64 }}
                  />
                  <Tab 
                    label={`Strategies (${stats.totalStrategies})`} 
                    icon={<TargetIcon />} 
                    iconPosition="start"
                    sx={{ minHeight: 64 }}
                  />
                  <Tab 
                    label={`Backtests (${stats.totalBacktests})`} 
                    icon={<PlayIcon />} 
                    iconPosition="start"
                    sx={{ minHeight: 64 }}
                  />
                  <Tab 
                    label="Performance" 
                    icon={<TrendingUpIcon />} 
                    iconPosition="start"
                    sx={{ minHeight: 64 }}
                  />
                </Tabs>
              </Box>

              <Box sx={{ p: 4 }}>
                {activeTab === 0 && (
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TargetIcon />
                          Recent Strategies
                        </Typography>
                        <StrategyList 
                          strategies={strategies.slice(0, 5)} 
                          onRunBacktest={handleRunBacktest}
                          compact={true}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PlayIcon />
                          Recent Backtests
                        </Typography>
                        <BacktestList 
                          backtests={backtests.slice(0, 5)} 
                          compact={true}
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                )}

                {activeTab === 1 && (
                  <StrategyList 
                    strategies={strategies} 
                    onRunBacktest={handleRunBacktest}
                    onRefresh={loadData}
                  />
                )}

                {activeTab === 2 && (
                  <BacktestList 
                    backtests={backtests} 
                    onRefresh={loadData}
                  />
                )}

                {activeTab === 3 && (
                  <PerformanceOverview 
                    strategies={strategies} 
                    backtests={backtests}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Create Strategy Modal */}
      {showCreateModal && (
        <CreateStrategyModal
          onClose={() => setShowCreateModal(false)}
          onStrategyCreated={handleStrategyCreated}
        />
      )}
    </Box>
  );
};

export default BacktestingDashboard;