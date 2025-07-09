import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CircularProgress,
  Divider,
  Badge,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Warning,
  CheckCircle,
  Error,
  Info,
  Timeline,
  BarChart,
  PieChart,
  ShowChart,
  Speed,
  Shield,
  Psychology,
  MonetizationOn,
  CalendarToday,
  Schedule,
  Public,
  Whatshot,
  Analytics,
  Compare,
  Refresh,
  Download,
  Settings,
  ZoomIn,
  Insights
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useAuth } from '../../contexts/AuthContext';

const ProfessionalAnalyticsPage = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [marketRegime, setMarketRegime] = useState(null);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [correlationData, setCorrelationData] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);

  // Tab configuration
  const tabs = [
    { label: 'Market Context', icon: <Public />, description: 'Market regime and macro analysis' },
    { label: 'Risk Analytics', icon: <Shield />, description: 'Advanced risk measurements' },
    { label: 'Performance Analytics', icon: <Analytics />, description: 'Detailed performance breakdown' },
    { label: 'Correlation Analysis', icon: <Compare />, description: 'Market and time correlations' },
    { label: 'Predictive Insights', icon: <Insights />, description: 'AI-powered predictions' }
  ];

  // Timeframe options
  const timeframes = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '6m', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'all', label: 'All Time' }
  ];

  // Market options
  const markets = [
    { value: 'all', label: 'All Markets' },
    { value: 'indices', label: 'Stock Indices' },
    { value: 'forex', label: 'Forex' },
    { value: 'commodities', label: 'Commodities' },
    { value: 'crypto', label: 'Cryptocurrency' }
  ];

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeframe, selectedMarket, activeTab]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API calls for different analytics data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate sample data based on current selections
      const mockData = generateMockAnalyticsData();
      setAnalyticsData(mockData.performance);
      setMarketRegime(mockData.marketRegime);
      setRiskMetrics(mockData.risk);
      setCorrelationData(mockData.correlation);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      enqueueSnackbar('Failed to load analytics data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalyticsData = () => {
    // Generate realistic mock data for analytics
    const days = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : 90;
    
    const performanceData = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - i - 1);
      return {
        date: format(date, 'MMM dd'),
        cumulative_pnl: 1000 + Math.random() * 5000 + i * 50,
        daily_pnl: (Math.random() - 0.5) * 500,
        drawdown: Math.random() * 300,
        volume: Math.floor(Math.random() * 10) + 1,
        win_rate: 0.6 + Math.random() * 0.3,
        sharpe_ratio: 1.2 + Math.random() * 0.8
      };
    });

    const marketRegime = {
      current: 'Trending',
      confidence: 0.78,
      duration: '14 days',
      historical_performance: {
        trending: { win_rate: 0.72, avg_rr: 2.1, trades: 89 },
        ranging: { win_rate: 0.58, avg_rr: 1.4, trades: 156 },
        volatile: { win_rate: 0.45, avg_rr: 1.8, trades: 67 }
      },
      regime_changes: [
        { date: '2024-01-15', from: 'Ranging', to: 'Trending', impact: '+12.3%' },
        { date: '2024-01-08', from: 'Volatile', to: 'Ranging', impact: '+5.7%' },
        { date: '2024-01-02', from: 'Trending', to: 'Volatile', impact: '-8.2%' }
      ]
    };

    const riskMetrics = {
      var_95: 245.67,
      var_99: 387.23,
      expected_shortfall: 429.45,
      max_drawdown: 892.15,
      current_drawdown: 123.45,
      sharpe_ratio: 1.67,
      sortino_ratio: 2.34,
      calmar_ratio: 1.89,
      skewness: -0.23,
      kurtosis: 3.45,
      risk_adjusted_return: 0.124,
      kelly_criterion: 0.18,
      risk_concentration: {
        by_market: { indices: 0.6, forex: 0.25, commodities: 0.15 },
        by_timeframe: { '5m': 0.4, '15m': 0.35, '1h': 0.25 },
        by_setup: { 'FVG': 0.3, 'OTE': 0.25, 'BPR': 0.2, 'Other': 0.25 }
      }
    };

    const correlationData = {
      market_correlation: {
        vix: -0.67,
        dxy: 0.34,
        gold: -0.12,
        bitcoin: 0.23,
        crude_oil: 0.45
      },
      time_analysis: {
        sessions: {
          london: { win_rate: 0.68, avg_profit: 125.45 },
          ny_open: { win_rate: 0.73, avg_profit: 198.23 },
          asia: { win_rate: 0.52, avg_profit: 87.12 }
        },
        days_of_week: {
          monday: { trades: 23, win_rate: 0.65 },
          tuesday: { trades: 28, win_rate: 0.71 },
          wednesday: { trades: 31, win_rate: 0.68 },
          thursday: { trades: 27, win_rate: 0.74 },
          friday: { trades: 19, win_rate: 0.58 }
        }
      },
      event_impact: [
        { event: 'FOMC Meeting', date: '2024-01-31', impact: '+2.3%', trades: 5 },
        { event: 'NFP Release', date: '2024-01-26', impact: '-1.2%', trades: 8 },
        { event: 'CPI Data', date: '2024-01-18', impact: '+4.1%', trades: 12 }
      ]
    };

    return {
      performance: performanceData,
      marketRegime,
      risk: riskMetrics,
      correlation: correlationData
    };
  };

  const handleMetricDetail = (metric) => {
    setSelectedMetric(metric);
    setDetailDialogOpen(true);
  };

  const exportAnalytics = () => {
    enqueueSnackbar('Analytics report exported successfully!', { variant: 'success' });
  };

  const getRiskLevelColor = (value, thresholds) => {
    if (value >= thresholds.high) return 'error';
    if (value >= thresholds.medium) return 'warning';
    return 'success';
  };

  const getMarketRegimeColor = (regime) => {
    switch (regime.toLowerCase()) {
      case 'trending': return theme.palette.success.main;
      case 'ranging': return theme.palette.warning.main;
      case 'volatile': return theme.palette.error.main;
      default: return theme.palette.info.main;
    }
  };

  const renderMarketContextTab = () => (
    <Grid container spacing={3}>
      {/* Current Market Regime */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Current Market Regime"
            avatar={<Public color="primary" />}
            action={
              <Chip
                label={marketRegime?.current}
                sx={{
                  bgcolor: alpha(getMarketRegimeColor(marketRegime?.current), 0.1),
                  color: getMarketRegimeColor(marketRegime?.current),
                  fontWeight: 'bold'
                }}
              />
            }
          />
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Confidence Level
              </Typography>
              <LinearProgress
                variant="determinate"
                value={marketRegime?.confidence * 100}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="caption">
                {(marketRegime?.confidence * 100).toFixed(1)}% ({marketRegime?.duration})
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Performance by Regime:
            </Typography>
            
            {marketRegime?.historical_performance && Object.entries(marketRegime.historical_performance).map(([regime, data]) => (
              <Box key={regime} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                    {regime}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="caption">
                      WR: {(data.win_rate * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="caption">
                      R:R: {data.avg_rr}
                    </Typography>
                    <Typography variant="caption">
                      Trades: {data.trades}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={data.win_rate * 100}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
      
      {/* Regime Changes History */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Recent Regime Changes"
            avatar={<Timeline color="primary" />}
          />
          <CardContent>
            <List dense>
              {marketRegime?.regime_changes?.map((change, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <TrendingUp 
                      color={change.impact.startsWith('+') ? 'success' : 'error'}
                      fontSize="small"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${change.from} → ${change.to}`}
                    secondary={format(new Date(change.date), 'MMM dd, yyyy')}
                  />
                  <Chip
                    label={change.impact}
                    color={change.impact.startsWith('+') ? 'success' : 'error'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Market Correlation Heatmap */}
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title="Market Correlation Matrix"
            avatar={<Compare color="primary" />}
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={[
                  { name: 'VIX', correlation: correlationData?.market_correlation?.vix || 0 },
                  { name: 'DXY', correlation: correlationData?.market_correlation?.dxy || 0 },
                  { name: 'Gold', correlation: correlationData?.market_correlation?.gold || 0 },
                  { name: 'Bitcoin', correlation: correlationData?.market_correlation?.bitcoin || 0 },
                  { name: 'Crude Oil', correlation: correlationData?.market_correlation?.crude_oil || 0 }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[-1, 1]} />
                <RechartsTooltip />
                <Bar dataKey="correlation" fill={theme.palette.primary.main} />
                <Line 
                  type="monotone" 
                  dataKey="correlation" 
                  stroke={theme.palette.secondary.main} 
                  strokeWidth={2}
                  dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            <Analytics sx={{ fontSize: 48, mr: 2, verticalAlign: 'middle', color: theme.palette.primary.main }} />
            Professional Analytics
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Institutional-grade analytics and insights for professional traders
          </Typography>
        </Box>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Timeframe</InputLabel>
                <Select
                  value={selectedTimeframe}
                  label="Timeframe"
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                >
                  {timeframes.map((tf) => (
                    <MenuItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Market</InputLabel>
                <Select
                  value={selectedMarket}
                  label="Market"
                  onChange={(e) => setSelectedMarket(e.target.value)}
                >
                  {markets.map((market) => (
                    <MenuItem key={market.value} value={market.value}>
                      {market.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Refresh />}
                onClick={loadAnalyticsData}
                disabled={loading}
              >
                Refresh Data
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Download />}
                onClick={exportAnalytics}
              >
                Export Report
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 80,
                flexDirection: 'column',
                gap: 1
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {tab.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tab.description}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Paper>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Loading Analytics Data...
              </Typography>
            </Box>
          ) : (
            <>
              {activeTab === 0 && renderMarketContextTab()}
              {/* Simplified for demonstration - you would implement other tabs similarly */}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Metric Details</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Detailed explanation and methodology for the selected metric would be displayed here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfessionalAnalyticsPage;