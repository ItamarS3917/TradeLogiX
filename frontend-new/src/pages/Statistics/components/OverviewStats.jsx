import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Divider,
  LinearProgress, 
  Tooltip
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  ShowChart as ShowChartIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const StatCard = ({ title, value, icon, color, suffix = '', prefix = '' }) => (
  <Paper sx={{ p: 2, height: '100%' }}>
    <Box display="flex" alignItems="center" mb={1}>
      <Box sx={{ mr: 1, color }}>
        {icon}
      </Box>
      <Typography variant="h6" component="h3">
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>
      {prefix}{value}{suffix}
    </Typography>
  </Paper>
);

const OverviewStats = ({ stats }) => {
  if (!stats) return null;

  // Prepare data for daily P&L chart
  const dailyPnLData = stats.dailyPnL.map(day => ({
    date: day.date,
    pnl: day.pnl,
    color: day.pnl >= 0 ? '#4caf50' : '#f44336'
  }));

  // Create streak indicator
  const getStreakIndicator = () => {
    const { currentStreak, currentStreakType } = stats.streakData;
    if (currentStreak === 0) return 'No current streak';
    
    const color = currentStreakType === 'win' ? '#4caf50' : '#f44336';
    const icon = currentStreakType === 'win' 
      ? <ArrowUpwardIcon /> 
      : <ArrowDownwardIcon />;
    
    return (
      <Box display="flex" alignItems="center">
        <Box sx={{ color, mr: 1 }}>
          {icon}
        </Box>
        <Typography variant="body1">
          {currentStreak} {currentStreakType === 'win' ? 'winning' : 'losing'} trades in a row
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Performance Overview
      </Typography>
      
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Win Rate" 
            value={stats.winRate} 
            icon={<ShowChartIcon />} 
            color="#4caf50"
            suffix="%" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Net Profit" 
            value={stats.netProfit.toFixed(2)} 
            icon={<AttachMoneyIcon />} 
            color={stats.netProfit >= 0 ? '#4caf50' : '#f44336'}
            prefix="$" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Profit Factor" 
            value={stats.profitFactor.toFixed(2)} 
            icon={<TrendingUpIcon />} 
            color={stats.profitFactor >= 1.5 ? '#4caf50' : stats.profitFactor >= 1 ? '#ff9800' : '#f44336'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Trades" 
            value={stats.totalTrades} 
            icon={<TimelineIcon />} 
            color="#2196f3"
          />
        </Grid>
      </Grid>
      
      {/* Additional Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Trade Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Average Win
                </Typography>
                <Typography variant="body1" color="success.main" fontWeight="bold">
                  ${stats.averageWin.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Average Loss
                </Typography>
                <Typography variant="body1" color="error.main" fontWeight="bold">
                  ${Math.abs(stats.averageLoss).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Largest Win
                </Typography>
                <Typography variant="body1" color="success.main">
                  ${stats.largestWin.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Largest Loss
                </Typography>
                <Typography variant="body1" color="error.main">
                  ${Math.abs(stats.largestLoss).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Average Risk:Reward
                </Typography>
                <Typography variant="body1">
                  {stats.averageRiskReward.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Average Duration
                </Typography>
                <Typography variant="body1">
                  {Math.round(stats.averageTradeDuration)} minutes
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Performance Insights
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="body2">
                  Win Rate
                </Typography>
                <Typography variant="body2">
                  {stats.winRate}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.winRate} 
                color={stats.winRate >= 50 ? "success" : "warning"}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="body2">
                  Win/Loss Ratio
                </Typography>
                <Typography variant="body2">
                  {(stats.profitableTradeCount / (stats.unprofitableTradeCount || 1)).toFixed(2)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={Math.min((stats.profitableTradeCount / (stats.unprofitableTradeCount || 1)) * 50, 100)} 
                color="primary"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="body2">
                  Consistency
                </Typography>
                <Typography variant="body2">
                  {stats.streakData.consistency}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.streakData.consistency} 
                color={stats.streakData.consistency >= 70 ? "success" : "warning"}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Streak
              </Typography>
              {getStreakIndicator()}
            </Box>
            
            <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
              <Tooltip title="Longest consecutive winning trades">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Best Streak
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    {stats.streakData.longestWinStreak} wins
                  </Typography>
                </Box>
              </Tooltip>
              
              <Tooltip title="Longest consecutive losing trades">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Worst Streak
                  </Typography>
                  <Typography variant="body1" color="error.main">
                    {stats.streakData.longestLossStreak} losses
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Daily P&L Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Daily P&L
        </Typography>
        
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyPnLData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip 
                formatter={(value) => [`$${value.toFixed(2)}`, 'P&L']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar 
                dataKey="pnl" 
                name="P&L"
                
                // Use dynamic colors based on P&L value
                isAnimationActive={false}
                fill={(entry) => entry.pnl >= 0 ? '#4caf50' : '#f44336'}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default OverviewStats;