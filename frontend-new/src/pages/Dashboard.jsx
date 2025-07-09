// Simple Dashboard without icons
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Button, 
  Avatar,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { Link as RouterLink } from 'react-router-dom';

// Import our premium components
import { PremiumCard } from '../components/Common/PremiumComponents';

// Import our enhanced dashboard components
import EnhancedPerformanceCard from '../components/Dashboard/EnhancedPerformanceCard';
import QuickActionsBar from '../components/Dashboard/QuickActionsBar';

// Import Real Data Mode Indicator
import RealDataModeIndicator from '../components/Common/RealDataModeIndicator';

// Helper function to safely convert Firestore timestamps or strings to Date objects
const safelyParseDate = (timeValue) => {
  if (!timeValue) return new Date();
  
  try {
    if (timeValue && typeof timeValue === 'object' && 'seconds' in timeValue && 'nanoseconds' in timeValue) {
      return new Date(timeValue.seconds * 1000 + timeValue.nanoseconds / 1000000);
    }
    return new Date(timeValue);
  } catch (error) {
    console.error('Error parsing date:', timeValue, error);
    return new Date();
  }
};

// Real Data Only Dashboard Component
const Dashboard = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    winRate: 0,
    todayPnL: 0,
    weeklyPnL: 0,
    monthlyPnL: 0,
    totalTrades: 0,
    recentTrades: []
  });
  
  const firebase = useFirebase();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  
  useEffect(() => {
    fetchDashboardData();
  }, [user]);
  
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Fetching real trading data from Firebase...');
      
      // Get today's date range
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);
      
      // Get week date range
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);
      
      // Get month date range
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      
      // Fetch all real trades from Firebase
      const allTradesData = await firebase.getAllTrades();
      console.log('📊 Real trades fetched:', allTradesData.length);
      
      // Process the real data
      const processedStats = processRealTradeData(
        allTradesData, 
        todayStart, 
        todayEnd, 
        weekStart, 
        weekEnd, 
        monthStart, 
        monthEnd
      );
      
      setStats(processedStats);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error fetching real trading data:', error);
      showSnackbar('Failed to load trading data: ' + (error.message || 'Unknown error'), 'error');
      setIsLoading(false);
    }
  };
  
  // Process ONLY real trade data - NO MOCK DATA
  const processRealTradeData = (trades, todayStart, todayEnd, weekStart, weekEnd, monthStart, monthEnd) => {
    console.log('📈 Processing real trade data...');
    
    if (!trades || trades.length === 0) {
      console.log('ℹ️ No real trades found - showing empty state');
      return {
        winRate: 0,
        todayPnL: 0,
        weeklyPnL: 0,
        monthlyPnL: 0,
        totalTrades: 0,
        recentTrades: []
      };
    }
    
    // Calculate real statistics from actual trades
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => trade.outcome === 'Win' || trade.outcome === 'win').length;
    const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
    
    // Calculate real P&L for different time periods
    const todayTrades = trades.filter(trade => {
      const tradeDate = safelyParseDate(trade.entry_time);
      return tradeDate >= todayStart && tradeDate <= todayEnd;
    });
    
    const weekTrades = trades.filter(trade => {
      const tradeDate = safelyParseDate(trade.entry_time);
      return tradeDate >= weekStart && tradeDate <= weekEnd;
    });
    
    const monthTrades = trades.filter(trade => {
      const tradeDate = safelyParseDate(trade.entry_time);
      return tradeDate >= monthStart && tradeDate <= monthEnd;
    });
    
    // Calculate real P&L sums
    const todayPnL = todayTrades.reduce((sum, trade) => sum + (parseFloat(trade.profit_loss) || 0), 0);
    const weeklyPnL = weekTrades.reduce((sum, trade) => sum + (parseFloat(trade.profit_loss) || 0), 0);
    const monthlyPnL = monthTrades.reduce((sum, trade) => sum + (parseFloat(trade.profit_loss) || 0), 0);
    
    // Get recent real trades (up to 5)
    const recentTrades = [...trades]
      .sort((a, b) => safelyParseDate(b.entry_time) - safelyParseDate(a.entry_time))
      .slice(0, 5)
      .map(trade => ({
        id: trade.id,
        date: format(safelyParseDate(trade.entry_time), 'yyyy-MM-dd'),
        symbol: trade.symbol,
        pnl: parseFloat(trade.profit_loss) || 0,
        outcome: trade.outcome.toLowerCase(),
        setup_type: trade.setup_type || 'Unknown'
      }));
    
    console.log('✅ Real data processed:', {
      totalTrades,
      winRate,
      todayPnL,
      weeklyPnL,
      monthlyPnL
    });
    
    return {
      winRate,
      todayPnL,
      weeklyPnL,
      monthlyPnL,
      totalTrades,
      recentTrades
    };
  };
  
  const handleRefresh = () => {
    console.log('🔄 Refreshing real trading data...');
    fetchDashboardData();
  };
  
  const handleAddTrade = () => {
    window.location.href = '/trades';
  };

  return (
    <Box className="animate-fade-in">
      {/* Real Data Mode Indicator */}
      <RealDataModeIndicator />
      
      {/* Dashboard Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: { xs: 4, sm: 5 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 3, sm: 0 },
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          backdropFilter: 'blur(10px)'
        }}
      >
        <Box>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 900, 
              mb: 1,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '2.75rem' },
              textAlign: { xs: 'center', sm: 'left' },
              background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}
          >
            Welcome Back, Trader
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              fontWeight: 500, 
              textAlign: { xs: 'center', sm: 'left' },
              fontSize: '1.1rem',
              opacity: 0.8
            }}
          >
            {stats.totalTrades > 0 
              ? `You have ${stats.totalTrades} real trades logged`
              : 'Ready to start tracking your real trading performance'
            }
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleAddTrade}
            sx={{ 
              fontWeight: 700, 
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontSize: '1rem',
              boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              '&:hover': {
                boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          >
            Add Trade
          </Button>
          
          <Button 
            variant="outlined" 
            color="primary"
            onClick={handleRefresh}
            sx={{ 
              fontWeight: 700, 
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontSize: '1rem',
              borderWidth: '2px',
              background: alpha(theme.palette.primary.main, 0.05),
              '&:hover': {
                borderWidth: '2px',
                background: alpha(theme.palette.primary.main, 0.1),
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Quick Actions Bar - Real Data Only */}
      <QuickActionsBar 
        marketStatus={{ isOpen: false, message: 'Market Closed' }}
        todayPlan={null}
        upcomingEvents={[]}
        onAddTrade={handleAddTrade}
      />
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh" flexDirection="column" gap={2}>
          <CircularProgress size={48} thickness={4} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Loading your real trading data...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 3, sm: 4 }}>
          {/* Real Performance Summary Cards - NO MOCK DATA */}
          <Grid item xs={12} sm={6} lg={3}>
            <Box 
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
                borderRadius: 4,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`
                },
                transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              <EnhancedPerformanceCard 
                title="Win Rate" 
                value={stats.totalTrades > 0 ? `${stats.winRate}%` : "0%"}
                trend={null}
                previousValue={null}
                color="primary"
                tooltipText={stats.totalTrades > 0 
                  ? `Based on ${stats.totalTrades} real trades` 
                  : "Add trades to see your real win rate"
                }
                sparklineData={null} // NO FAKE SPARKLINE DATA
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Box 
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(stats.todayPnL >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.02)} 0%, ${alpha(stats.todayPnL >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.08)} 100%)`,
                borderRadius: 4,
                border: `1px solid ${alpha(stats.todayPnL >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.12)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 20px 40px ${alpha(stats.todayPnL >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.15)}`
                },
                transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              <EnhancedPerformanceCard 
                title="Today's P&L" 
                value={`${stats.todayPnL.toFixed(2)}`}
                trend={null}
                previousValue={null}
                color={stats.todayPnL >= 0 ? "success" : "error"}
                tooltipText="Real profit/loss from today's trading"
                sparklineData={null} // NO FAKE SPARKLINE DATA
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Box 
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(stats.weeklyPnL >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.02)} 0%, ${alpha(stats.weeklyPnL >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.08)} 100%)`,
                borderRadius: 4,
                border: `1px solid ${alpha(stats.weeklyPnL >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.12)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 20px 40px ${alpha(stats.weeklyPnL >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.15)}`
                },
                transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              <EnhancedPerformanceCard 
                title="Weekly P&L" 
                value={`${stats.weeklyPnL.toFixed(2)}`}
                trend={null}
                previousValue={null}
                color={stats.weeklyPnL >= 0 ? "success" : "error"}
                tooltipText="Real profit/loss for this week"
                sparklineData={null} // NO FAKE SPARKLINE DATA
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <Box 
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(stats.monthlyPnL >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.02)} 0%, ${alpha(stats.monthlyPnL >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.08)} 100%)`,
                borderRadius: 4,
                border: `1px solid ${alpha(stats.monthlyPnL >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.12)}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 20px 40px ${alpha(stats.monthlyPnL >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.15)}`
                },
                transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              <EnhancedPerformanceCard 
                title="Monthly P&L" 
                value={`${stats.monthlyPnL.toFixed(2)}`}
                trend={null}
                previousValue={null}
                color={stats.monthlyPnL >= 0 ? "success" : "error"}
                tooltipText="Real profit/loss for this month"
                sparklineData={null} // NO FAKE SPARKLINE DATA
              />
            </Box>
          </Grid>
          
          {/* Real Trades Section */}
          <Grid item xs={12} md={8}>
            <PremiumCard
              title="Recent Real Trades"
              sx={{ height: '100%' }}
              variant="default"
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                  variant="text" 
                  component={RouterLink} 
                  to="/trades"
                  size="small"
                  sx={{ fontWeight: 700 }}
                >
                  View All Trades →
                </Button>
              </Box>
              
              {stats.recentTrades.length > 0 ? (
                <Box>
                  {stats.recentTrades.map((trade, index) => (
                    <Box 
                      key={trade.id}
                      sx={{ 
                        p: 3, 
                        mb: 2,
                        borderRadius: 3,
                        border: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.default, 0.2)} 100%)`,
                        backdropFilter: 'blur(8px)',
                        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 12px 24px ${alpha(theme.palette.text.primary, 0.08)}`,
                          borderColor: alpha(theme.palette.primary.main, 0.2)
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, fontSize: '1.1rem' }}>
                            {trade.symbol} - {trade.setup_type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, opacity: 0.8 }}>
                            {trade.date}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <Typography 
                            variant="h5" 
                            color={trade.pnl >= 0 ? 'success.main' : 'error.main'}
                            fontWeight={900}
                            sx={{ 
                              fontSize: '1.3rem',
                              letterSpacing: '-0.01em',
                              mb: 0.5
                            }}
                          >
                            ${trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                          </Typography>
                          <Chip
                            label={trade.outcome}
                            size="small"
                            color={trade.outcome === 'win' ? 'success' : trade.outcome === 'loss' ? 'error' : 'default'}
                            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
                  borderRadius: 4,
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.15)}`,
                  backdropFilter: 'blur(8px)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Background decoration */}
                  <Box sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                    opacity: 0.5
                  }} />
                  
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      color: theme.palette.primary.main,
                      mb: 3,
                      fontSize: '2rem',
                      fontWeight: 900,
                      boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                      border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                  >
                    📊
                  </Avatar>
                  <Typography variant="h4" color="text.primary" gutterBottom fontWeight={900} sx={{ mb: 2 }}>
                    No trades yet
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4, maxWidth: 480, fontWeight: 500, opacity: 0.8 }}>
                    Start logging your actual trades to track real performance, analyze patterns, and improve your trading strategy with data-driven insights.
                  </Typography>
                  <Button 
                    variant="contained" 
                    component={RouterLink} 
                    to="/trades"
                    size="large"
                    sx={{ 
                      fontWeight: 700,
                      borderRadius: 3,
                      px: 4,
                      py: 2,
                      fontSize: '1.1rem',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        boxShadow: `0 16px 36px ${alpha(theme.palette.primary.main, 0.4)}`,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                  >
                    Add Your First Trade
                  </Button>
                </Box>
              )}
            </PremiumCard>
          </Grid>
          
          {/* Real Actions Only */}
          <Grid item xs={12} md={4}>
            <PremiumCard
              title="Real Trading Actions"
              variant="primary"
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`
                },
                transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              <Box sx={{ p: 1, flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  component={RouterLink}
                  to="/trades"
                  sx={{ 
                    fontWeight: 700,
                    py: 2,
                    borderRadius: 3,
                    fontSize: '1rem',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }}
                >
                  📊 Log Real Trade
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  component={RouterLink}
                  to="/planning"
                  sx={{ 
                    fontWeight: 700,
                    py: 2,
                    borderRadius: 3,
                    borderWidth: '2px',
                    fontSize: '1rem',
                    background: alpha(theme.palette.primary.main, 0.05),
                    '&:hover': {
                      borderWidth: '2px',
                      background: alpha(theme.palette.primary.main, 0.1),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                    },
                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }}
                >
                  📅 Create Trading Plan
                </Button>
                
                <Button
                  variant="outlined"
                  color="info"
                  size="large"
                  component={RouterLink}
                  to="/statistics"
                  sx={{ 
                    fontWeight: 700,
                    py: 2,
                    borderRadius: 3,
                    borderWidth: '2px',
                    fontSize: '1rem',
                    background: alpha(theme.palette.info.main, 0.05),
                    '&:hover': {
                      borderWidth: '2px',
                      background: alpha(theme.palette.info.main, 0.1),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 16px ${alpha(theme.palette.info.main, 0.2)}`
                    },
                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }}
                >
                  📈 View Real Statistics
                </Button>
                
                {stats.totalTrades >= 5 && (
                  <Button
                    variant="outlined"
                    color="success"
                    size="large"
                    component={RouterLink}
                    to="/tradesage"
                    sx={{ 
                      fontWeight: 700,
                      py: 2,
                      borderRadius: 3,
                      borderWidth: '2px',
                      fontSize: '1rem',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`,
                      '&:hover': {
                        borderWidth: '2px',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.15)} 100%)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 16px ${alpha(theme.palette.success.main, 0.25)}`
                      },
                      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                  >
                    🤖 Get AI Insights
                  </Button>
                )}
                
                {stats.totalTrades < 5 && (
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: 3, 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                    textAlign: 'center',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ fontSize: '2rem' }}>🔒</Typography>
                    </Box>
                    <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700, mb: 1 }}>
                      AI Insights Locked
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Add {5 - stats.totalTrades} more real trades to unlock AI-powered insights and personalized recommendations.
                    </Typography>
                  </Box>
                )}
              </Box>
            </PremiumCard>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;