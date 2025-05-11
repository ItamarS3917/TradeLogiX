import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Typography, 
  Divider,
  Box,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const PerformanceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [setupPerformance, setSetupPerformance] = useState([]);
  const [profitByDay, setProfitByDay] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch overall stats
        const statsResponse = await axios.get('/api/statistics');
        
        // Fetch setup performance
        const setupResponse = await axios.get('/api/statistics/win-rate-by-setup');
        
        // Fetch profit by day
        const profitResponse = await axios.get('/api/statistics/profitability-by-time');
        
        setStats(statsResponse.data);
        setSetupPerformance(setupResponse.data.setups || []);
        setProfitByDay(profitResponse.data.time_slots || []);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Placeholder data if API data isn't available yet
  const placeholderStats = {
    win_rate: 0.65,
    profit_factor: 1.8,
    avg_win: 150.25,
    avg_loss: 75.50,
    total_trades: 42,
    total_profit: 2850.75,
    largest_win: 450.25,
    largest_loss: 225.50,
    consecutive_wins: 5,
    consecutive_losses: 2,
  };

  const placeholderSetups = [
    { name: 'MMXM_STANDARD', win_rate: 0.70, trades: 20, profit: 1250.50 },
    { name: 'ICT_BPR', win_rate: 0.60, trades: 15, profit: 950.25 },
    { name: 'LIQUIDITY_GRAB', win_rate: 0.55, trades: 7, profit: 650.00 },
  ];

  const placeholderProfitByDay = [
    { day: 'Monday', profit: 450.75 },
    { day: 'Tuesday', profit: 320.25 },
    { day: 'Wednesday', profit: 150.50 },
    { day: 'Thursday', profit: -120.50 },
    { day: 'Friday', profit: 550.25 },
  ];

  // Use real or placeholder data based on loading state
  const displayStats = Object.keys(stats).length > 0 ? stats : placeholderStats;
  const displaySetups = setupPerformance.length > 0 ? setupPerformance : placeholderSetups;
  const displayProfitByDay = profitByDay.length > 0 ? profitByDay : placeholderProfitByDay;

  // Colors for charts
  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'];
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      {/* Performance Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Win Rate</Typography>
              <Typography variant="h4" color={displayStats.win_rate >= 0.5 ? 'success.main' : 'error.main'}>
                {formatPercentage(displayStats.win_rate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Based on {displayStats.total_trades} trades
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Profit Factor</Typography>
              <Typography variant="h4" color={displayStats.profit_factor >= 1.5 ? 'success.main' : 'text.primary'}>
                {displayStats.profit_factor.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gross profit / gross loss
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Average Win</Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(displayStats.avg_win)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                vs. {formatCurrency(displayStats.avg_loss)} avg. loss
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Profit</Typography>
              <Typography variant="h4" color={displayStats.total_profit >= 0 ? 'success.main' : 'error.main'}>
                {formatCurrency(displayStats.total_profit)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(displayStats.largest_win)} largest win
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Setup Performance */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Setup Performance</Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={displaySetups}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="win_rate" name="Win Rate" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="profit" name="Profit" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Profit by Day */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Profit by Day</Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={displayProfitByDay}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#4CAF50" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Win/Loss Distribution */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Win/Loss Distribution</Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Wins', value: displayStats.win_rate * displayStats.total_trades },
                    { name: 'Losses', value: (1 - displayStats.win_rate) * displayStats.total_trades }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#4CAF50" />
                  <Cell fill="#F44336" />
                </Pie>
                <Tooltip formatter={(value) => Math.round(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Trading Streak */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Performance</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ p: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Current Streak:</strong> {displayStats.consecutive_wins > 0 ? 
                  `${displayStats.consecutive_wins} wins` : 
                  `${displayStats.consecutive_losses} losses`}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Best Streak:</strong> {displayStats.consecutive_wins} wins
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Longest Drawdown:</strong> {displayStats.consecutive_losses} losses
              </Typography>
              <Typography variant="body1">
                <strong>Risk:Reward Ratio:</strong> 1:{(displayStats.avg_win / displayStats.avg_loss).toFixed(1)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceDashboard;
