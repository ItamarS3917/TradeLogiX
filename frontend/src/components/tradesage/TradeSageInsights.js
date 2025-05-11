import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Button,
  Chip,
  Alert
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useAuth } from '../../context/AuthContext';
import TradeSageService from '../../services/tradesage_service';
import TradeService from '../../services/trade_service';

/**
 * TradeSage Insights component - AI-powered analysis of trading performance
 */
const TradeSageInsights = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [tradeComparison, setTradeComparison] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 90 days
    endDate: new Date().toISOString().split('T')[0]
  });

  // Load insights and data on component mount
  useEffect(() => {
    loadInsights();
    loadTradeComparison();
    loadRecentTrades();
  }, [user]);

  // Load insights from TradeSage
  const loadInsights = async () => {
    try {
      setLoading(true);
      const insightsData = await TradeSageService.getInsights(user?.id || 1);
      setInsights(insightsData);
      setError(null);
    } catch (err) {
      console.error('Error loading insights:', err);
      setError('Failed to load insights. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Load trade comparison data
  const loadTradeComparison = async () => {
    try {
      const comparisonData = await TradeSageService.compareWinningAndLosingTrades(
        user?.id || 1, 
        dateRange
      );
      setTradeComparison(comparisonData);
    } catch (err) {
      console.error('Error loading trade comparison:', err);
      // Don't set general error since this is secondary data
    }
  };

  // Load recent trades
  const loadRecentTrades = async () => {
    try {
      const trades = await TradeService.getRecentTrades(5);
      setRecentTrades(trades);
    } catch (err) {
      console.error('Error loading recent trades:', err);
      // Don't set general error since this is secondary data
    }
  };

  // Format performance metric as percentage or currency
  const formatMetric = (value, type = 'number') => {
    if (value === undefined || value === null) return 'N/A';
    
    switch (type) {
      case 'percentage':
        return `${parseFloat(value).toFixed(1)}%`;
      case 'currency':
        return `$${parseFloat(value).toFixed(2)}`;
      default:
        return parseFloat(value).toFixed(2);
    }
  };

  // Determine color based on value (positive/negative)
  const getMetricColor = (value, inverse = false) => {
    if (value === undefined || value === null) return 'text.secondary';
    
    const isPositive = parseFloat(value) > 0;
    return (inverse ? !isPositive : isPositive) ? 'success.main' : 'error.main';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={loadInsights}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        TradeSage Insights
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        AI-powered analysis of your trading performance to help you identify strengths, weaknesses, and opportunities for improvement.
      </Typography>

      {/* Performance Overview */}
      <Grid container spacing={3}>
        {insights && insights.overall && (
          <>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Win Rate</Typography>
                  <Typography 
                    variant="h4" 
                    color={insights.overall.winRate >= 50 ? 'success.main' : 'error.main'}
                  >
                    {insights.overall.winRate}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Based on {insights.overall.totalTrades} trades
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Total Profit</Typography>
                  <Typography 
                    variant="h4" 
                    color={getMetricColor(insights.overall.totalProfit)}
                  >
                    {formatMetric(insights.overall.totalProfit, 'currency')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg: {formatMetric(insights.overall.profitPerTrade, 'currency')}/trade
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Best Setup</Typography>
                  {tradeComparison && tradeComparison.bySetupType && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h5">
                          {Object.keys(tradeComparison.bySetupType.winning)[0]}
                        </Typography>
                        <Chip 
                          icon={<TrendingUpIcon />} 
                          label={`Win Rate: ${formatMetric(
                            Object.values(tradeComparison.bySetupType.winning)[0] / 
                            (Object.values(tradeComparison.bySetupType.winning)[0] + 
                              (Object.values(tradeComparison.bySetupType.losing)[0] || 0)) * 100,
                            'percentage'
                          )}`} 
                          color="success" 
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Focus on this setup for optimal results.
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Main Insights Grid */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Strengths & Weaknesses */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LightbulbIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Strengths & Weaknesses</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {insights && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Strengths
                  </Typography>
                  <List dense>
                    {insights.strengths?.map((strength, index) => (
                      <ListItem key={index}>
                        <ListItemIcon sx={{ minWidth: '30px' }}>
                          <TrendingUpIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Weaknesses
                  </Typography>
                  <List dense>
                    {insights.weaknesses?.map((weakness, index) => (
                      <ListItem key={index}>
                        <ListItemIcon sx={{ minWidth: '30px' }}>
                          <TrendingDownIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText primary={weakness} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PsychologyIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Recommendations</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {insights && insights.recommendations && (
              <List>
                {insights.recommendations.map((recommendation, index) => (
                  <ListItem key={index} sx={{ py: 1 }}>
                    <ListItemIcon>
                      <ShowChartIcon />
                    </ListItemIcon>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Pattern Analysis */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BarChartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Trading Pattern Analysis</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {tradeComparison && tradeComparison.insights && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Key Patterns Identified:
                </Typography>
                <List>
                  {tradeComparison.insights.map((insight, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <LightbulbIcon />
                      </ListItemIcon>
                      <ListItemText primary={insight} />
                    </ListItem>
                  ))}
                </List>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Emotional Impact on Trading:
                  </Typography>
                  
                  {tradeComparison.byEmotionalState && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardHeader 
                            title="Best Emotional States" 
                            titleTypographyProps={{ variant: 'subtitle2' }}
                            sx={{ bgcolor: 'success.light', color: 'success.contrastText', py: 1 }}
                          />
                          <CardContent>
                            <List dense>
                              {Object.entries(tradeComparison.byEmotionalState.winning)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([emotion, count], index) => (
                                  <ListItem key={index}>
                                    <ListItemText 
                                      primary={`${emotion}: ${count} winning trades`}
                                    />
                                  </ListItem>
                                ))
                              }
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardHeader 
                            title="Challenging Emotional States" 
                            titleTypographyProps={{ variant: 'subtitle2' }}
                            sx={{ bgcolor: 'error.light', color: 'error.contrastText', py: 1 }}
                          />
                          <CardContent>
                            <List dense>
                              {Object.entries(tradeComparison.byEmotionalState.losing)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([emotion, count], index) => (
                                  <ListItem key={index}>
                                    <ListItemText 
                                      primary={`${emotion}: ${count} losing trades`}
                                    />
                                  </ListItem>
                                ))
                              }
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </>
            )}
            
            {!tradeComparison && (
              <Typography color="text.secondary">
                Not enough trading data to perform pattern analysis. Add more trades to get insights.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Generate Improvement Plan Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary"
          size="large"
          onClick={() => window.location.href = '/tradesage/chat'}
          startIcon={<PsychologyIcon />}
        >
          Talk to TradeSage
        </Button>
      </Box>
    </Box>
  );
};

export default TradeSageInsights;
