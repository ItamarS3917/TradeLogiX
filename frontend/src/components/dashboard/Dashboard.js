import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardActions,
  Button, 
  Divider,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  useTheme,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon,
  Note as NoteIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Psychology as PsychologyIcon,
  CalendarToday as CalendarTodayIcon,
  ShowChart as ShowChartIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import TradeService from '../../services/trade_service';
import PlanService from '../../services/plan_service';
import JournalService from '../../services/journal_service';
import TradeSageService from '../../services/tradesage_service';
import WinRateWidget from './WinRateWidget';
import RecentTradesWidget from './RecentTradesWidget';
import TradingStreak from './TradingStreak';

/**
 * Main Dashboard Component for Trading Journal
 */
const Dashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [recentTrades, setRecentTrades] = useState([]);
  const [dailyPnL, setDailyPnL] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [recentJournal, setRecentJournal] = useState(null);
  const [insights, setInsights] = useState(null);
  const [streakData, setStreakData] = useState(null);
  
  // Format numbers as currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Format numbers as percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all data in parallel
      const [
        statisticsResponse,
        tradesResponse,
        planResponse,
        journalResponse,
        insightsResponse
      ] = await Promise.all([
        TradeService.getStatistics(user?.id || 1),
        TradeService.getRecentTrades(5),
        PlanService.getCurrentPlan(),
        JournalService.getMostRecentJournal(user?.id || 1),
        TradeSageService.getInsights(user?.id || 1)
      ]);
      
      // Set data states
      setStats(statisticsResponse);
      setRecentTrades(tradesResponse);
      setCurrentPlan(planResponse);
      setRecentJournal(journalResponse);
      setInsights(insightsResponse);
      
      // Extract specific data
      if (statisticsResponse.dailyPnL) {
        setDailyPnL(statisticsResponse.dailyPnL);
      }
      
      if (statisticsResponse.streakData) {
        setStreakData(statisticsResponse.streakData);
      }
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to create trade form
  const handleCreateTrade = () => {
    navigate('/trades/new');
  };
  
  // Navigate to create journal entry form
  const handleCreateJournal = () => {
    navigate('/journal/new');
  };
  
  // Navigate to create daily plan form
  const handleCreatePlan = () => {
    navigate('/plans/new');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Trading Dashboard</Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleCreateTrade}
            sx={{ mr: 1 }}
          >
            Log Trade
          </Button>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<NoteIcon />}
            onClick={handleCreateJournal}
            sx={{ mr: 1 }}
          >
            Journal
          </Button>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<CalendarTodayIcon />}
            onClick={handleCreatePlan}
          >
            Daily Plan
          </Button>
        </Box>
      </Box>
      
      {/* Performance Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Win Rate</Typography>
              <Typography variant="h4" color={stats.winRate >= 50 ? 'success.main' : 'error.main'}>
                {stats.winRate ? formatPercentage(stats.winRate) : '0.0%'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.profitableTradeCount || 0} winning / {stats.totalTrades || 0} total trades
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/statistics')}>
                View Details
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Net P&L</Typography>
              <Typography variant="h4" color={stats.netProfit >= 0 ? 'success.main' : 'error.main'}>
                {stats.netProfit ? formatCurrency(stats.netProfit) : '$0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Win: {stats.averageWin ? formatCurrency(stats.averageWin) : '$0.00'} | 
                Avg Loss: {stats.averageLoss ? formatCurrency(stats.averageLoss) : '$0.00'}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/statistics')}>
                View Details
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Profit Factor</Typography>
              <Typography variant="h4" color={stats.profitFactor >= 1.5 ? 'success.main' : 'text.primary'}>
                {stats.profitFactor ? stats.profitFactor.toFixed(2) : '0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gross Win / Gross Loss
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/statistics')}>
                View Details
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Current Streak</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" color={streakData?.currentStreakType === 'win' ? 'success.main' : 'error.main'}>
                  {streakData?.currentStreak || 0}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                  {streakData?.currentStreakType?.toUpperCase() || 'NONE'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Best: {streakData?.longestWinStreak || 0} wins | Worst: {streakData?.longestLossStreak || 0} losses
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/statistics/streaks')}>
                View Details
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main Dashboard Widgets */}
      <Grid container spacing={3}>
        {/* Trade Performance Chart */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Performance History
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyPnL}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${formatCurrency(value)}`, 'P&L']}
                    labelFormatter={(value) => `Date: ${value}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="pnl" 
                    name="Daily P&L" 
                    stroke={theme.palette.primary.main} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Trading Streak */}
        <Grid item xs={12} md={4}>
          {streakData ? (
            <TradingStreak streakData={streakData} />
          ) : (
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Trading Streak
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography color="text.secondary">
                No streak data available yet. Add more trades to see your patterns.
              </Typography>
            </Paper>
          )}
        </Grid>
        
        {/* Recent Trades */}
        <Grid item xs={12} md={8}>
          <RecentTradesWidget 
            trades={recentTrades} 
            onAddTrade={handleCreateTrade}
            onViewAllTrades={() => navigate('/trades')}
          />
        </Grid>
        
        {/* Trade Distribution */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Win/Loss Distribution
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {stats.totalTrades ? (
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Winners', value: stats.profitableTradeCount || 0 },
                      { name: 'Losers', value: stats.unprofitableTradeCount || 0 }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="value" 
                      name="Number of Trades" 
                      fill={(data) => data.name === 'Winners' ? theme.palette.success.main : theme.palette.error.main}
                      barSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No trade data available yet.
              </Typography>
            )}
            
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                <strong>Win Rate:</strong> {stats.winRate ? formatPercentage(stats.winRate) : '0.0%'}
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/statistics')}
              >
                More Stats
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Today's Plan */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">
                Today's Trading Plan
              </Typography>
              <Button 
                size="small" 
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleCreatePlan}
                variant="outlined"
              >
                {currentPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {currentPlan ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1">
                    <strong>Market Bias:</strong>
                  </Typography>
                  <Chip 
                    label={currentPlan.market_bias} 
                    color={
                      currentPlan.market_bias === 'BULLISH' ? 'success' : 
                      currentPlan.market_bias === 'BEARISH' ? 'error' : 'default'
                    }
                    size="small"
                  />
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Key Levels:</strong>
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {currentPlan.key_levels && Object.entries(currentPlan.key_levels).map(([level, value]) => (
                    <Chip 
                      key={level}
                      label={`${level}: ${value}`}
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Today's Goals:</strong>
                </Typography>
                <Typography variant="body2" paragraph>
                  {currentPlan.goals || 'No goals specified'}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="subtitle2">
                    <strong>Mental State:</strong> {currentPlan.mental_state || 'Not specified'}
                  </Typography>
                  <Link href={`/plans/${currentPlan.id}`} color="primary">
                    View Full Plan
                  </Link>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                <Typography color="text.secondary" paragraph>
                  You haven't created a trading plan for today yet.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleCreatePlan}
                  startIcon={<CalendarTodayIcon />}
                >
                  Create Today's Plan
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* TradeSage Insights */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">
                TradeSage Insights
              </Typography>
              <Button 
                size="small" 
                startIcon={<PsychologyIcon />}
                onClick={() => navigate('/tradesage')}
                variant="outlined"
              >
                Full Analysis
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {insights && insights.strengths ? (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Trading Strengths:</strong>
                </Typography>
                <List dense disablePadding>
                  {insights.strengths.slice(0, 2).map((strength, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemText 
                        primary={strength}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  <strong>Areas to Improve:</strong>
                </Typography>
                <List dense disablePadding>
                  {insights.weaknesses?.slice(0, 2).map((weakness, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemText 
                        primary={weakness}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    color="primary" 
                    onClick={() => navigate('/tradesage/chat')}
                    endIcon={<PsychologyIcon />}
                  >
                    Talk to TradeSage
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                <Typography color="text.secondary" paragraph>
                  No AI insights available yet. Add more trades for TradeSage to analyze.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/tradesage')}
                  startIcon={<PsychologyIcon />}
                >
                  Get AI Insights
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Journal Entry */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">
                Recent Journal Entry
              </Typography>
              <Box>
                <Button 
                  size="small" 
                  startIcon={<NoteIcon />}
                  onClick={handleCreateJournal}
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  New Entry
                </Button>
                <Button 
                  size="small"
                  onClick={() => navigate('/journal')}
                >
                  View All
                </Button>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {recentJournal ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1">
                    <strong>{recentJournal.title || new Date(recentJournal.date).toLocaleDateString()}</strong>
                  </Typography>
                  <Box>
                    <Chip 
                      label={`Mood: ${recentJournal.mood_rating}/5`}
                      size="small"
                      color={recentJournal.mood_rating >= 4 ? 'success' : 
                             recentJournal.mood_rating <= 2 ? 'error' : 'default'}
                      sx={{ mr: 1 }}
                    />
                    {recentJournal.tags?.slice(0, 3).map((tag, index) => (
                      <Chip 
                        key={index}
                        label={tag}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    ))}
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2, maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {recentJournal.content.slice(0, 300)}
                  {recentJournal.content.length > 300 && '...'}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    color="primary" 
                    onClick={() => navigate(`/journal/${recentJournal.id}`)}
                  >
                    Read Full Entry
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                <Typography color="text.secondary" paragraph>
                  No journal entries found. Start journaling to track your trading thoughts and reflections.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleCreateJournal}
                  startIcon={<NoteIcon />}
                >
                  Create Journal Entry
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
