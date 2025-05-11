import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  
  useEffect(() => {
    // TODO: Replace with actual API call
    // Simulating data fetch
    setTimeout(() => {
      setUserStats({
        winRate: 62,
        todayPnL: 350,
        weeklyPnL: 1250,
        monthlyPnL: 3600,
        recentTrades: [
          { id: 1, date: '2025-05-10', symbol: 'NQ', pnl: 125, outcome: 'win' },
          { id: 2, date: '2025-05-10', symbol: 'NQ', pnl: -75, outcome: 'loss' },
          { id: 3, date: '2025-05-09', symbol: 'NQ', pnl: 250, outcome: 'win' },
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Welcome to Your Trading Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Performance Summary */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Win Rate</Typography>
            <Typography variant="h3" color="primary">{userStats.winRate}%</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Today's P&L</Typography>
            <Typography 
              variant="h3" 
              color={userStats.todayPnL >= 0 ? 'success.main' : 'error.main'}
            >
              ${userStats.todayPnL}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Weekly P&L</Typography>
            <Typography 
              variant="h3" 
              color={userStats.weeklyPnL >= 0 ? 'success.main' : 'error.main'}
            >
              ${userStats.weeklyPnL}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Monthly P&L</Typography>
            <Typography 
              variant="h3" 
              color={userStats.monthlyPnL >= 0 ? 'success.main' : 'error.main'}
            >
              ${userStats.monthlyPnL}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Recent Trades */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recent Trades</Typography>
            {userStats.recentTrades.length > 0 ? (
              <Box>
                {userStats.recentTrades.map(trade => (
                  <Paper 
                    key={trade.id}
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      mb: 1, 
                      borderLeft: 6, 
                      borderColor: trade.outcome === 'win' ? 'success.main' : 'error.main' 
                    }}
                  >
                    <Grid container alignItems="center">
                      <Grid item xs={3}>
                        <Typography variant="body2" color="textSecondary">
                          {trade.date}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body1" fontWeight="bold">
                          {trade.symbol}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography 
                          variant="body1"
                          color={trade.pnl >= 0 ? 'success.main' : 'error.main'}
                        >
                          ${trade.pnl}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography 
                          variant="body1"
                          color={trade.outcome === 'win' ? 'success.main' : 'error.main'}
                        >
                          {trade.outcome.toUpperCase()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography variant="body1">No recent trades found.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
