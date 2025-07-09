import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Button, 
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Add as AddIcon,
  AttachMoney as MoneyIcon,
  AccountBalance as AccountBalanceIcon,
  AutoGraph as AutoGraphIcon,
  PsychologyAlt as PsychologyIcon,
  LibraryBooks as LibraryBooksIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
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
          mb: { xs: 3, sm: 4 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800, 
              mb: 0.5,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            Welcome Back, Trader
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontWeight: 500, textAlign: { xs: 'center', sm: 'left' } }}
          >
            {stats.totalTrades > 0 
              ? `You have ${stats.totalTrades} real trades logged`
              : 'Ready to start tracking your real trading performance'
            }
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTrade}
            sx={{ 
              fontWeight: 700, 
              borderRadius: 2.5,
              px: 2.5,
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}`
            }}
          >
            Add Trade
          </Button>
          
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ 
              fontWeight: 700, 
              borderRadius: 2.5,
              px: 2.5,
              borderWidth: '1.5px'
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
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Real Performance Summary Cards - NO MOCK DATA */}
          <Grid item xs={12} sm={6} lg={3}>
            <EnhancedPerformanceCard 
              title="Win Rate" 
              value={stats.totalTrades > 0 ? `${stats.winRate}%` : "0%"}
              trend={null}
              previousValue={null}
              icon={<SpeedIcon />}
              color="primary"
              tooltipText={stats.totalTrades > 0 
                ? `Based on ${stats.totalTrades} real trades` 
                : "Add trades to see your real win rate"
              }
              sparklineData={null} // NO FAKE SPARKLINE DATA
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <EnhancedPerformanceCard 
              title="Today's P&L" 
              value={`$${stats.todayPnL.toFixed(2)}`}
              trend={null}
              previousValue={null}
              icon={<ShowChartIcon />}
              color={stats.todayPnL >= 0 ? "success" : "error"}
              tooltipText="Real profit/loss from today's trading"
              sparklineData={null} // NO FAKE SPARKLINE DATA
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <EnhancedPerformanceCard 
              title="Weekly P&L" 
              value={`$${stats.weeklyPnL.toFixed(2)}`}
              trend={null}
              previousValue={null}
              icon={<BarChartIcon />}
              color={stats.weeklyPnL >= 0 ? "success" : "error"}
              tooltipText="Real profit/loss for this week"
              sparklineData={null} // NO FAKE SPARKLINE DATA
            />
          </Grid>
          
          <Grid item xs={12} sm={6} lg={3}>
            <EnhancedPerformanceCard 
              title="Monthly P&L" 
              value={`$${stats.monthlyPnL.toFixed(2)}`}
              trend={null}
              previousValue={null}
              icon={<TimelineIcon />}
              color={stats.monthlyPnL >= 0 ? "success" : "error"}
              tooltipText="Real profit/loss for this month"
              sparklineData={null} // NO FAKE SPARKLINE DATA
            />
          </Grid>
          
          {/* Real Trades Section */}
          <Grid item xs={12} md={8}>
            <PremiumCard
              title="Recent Real Trades"
              icon={<LibraryBooksIcon />}
              sx={{ height: '100%' }}
              variant="default"
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                  variant="text" 
                  component={RouterLink} 
                  to="/trades"
                  endIcon={<ArrowForwardIcon />}
                  size="small"
                  sx={{ fontWeight: 700 }}
                >
                  View All Trades
                </Button>
              </Box>
              
              {stats.recentTrades.length > 0 ? (
                <Box>
                  {stats.recentTrades.map((trade, index) => (
                    <Box 
                      key={trade.id}
                      sx={{ 
                        p: 2, 
                        mb: 1,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                        bgcolor: alpha(theme.palette.background.paper, 0.5)
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {trade.symbol} - {trade.setup_type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {trade.date}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography 
                            variant="h6" 
                            color={trade.pnl >= 0 ? 'success.main' : 'error.main'}
                            fontWeight={700}
                          >
                            ${trade.pnl.toFixed(2)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {trade.outcome}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: alpha(theme.palette.text.primary, 0.02),
                  borderRadius: 3,
                  border: `1px dashed ${alpha(theme.palette.text.primary, 0.1)}`
                }}>
                  <Avatar 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mb: 2
                    }}
                  >
                    <LibraryBooksIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="h6" color="text.primary" gutterBottom fontWeight={700}>
                    No real trades yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3, maxWidth: 400 }}>
                    Start logging your actual trades to track real performance and improve your trading strategy.
                  </Typography>
                  <Button 
                    variant="contained" 
                    component={RouterLink} 
                    to="/trades"
                    startIcon={<AddIcon />}
                    sx={{ 
                      mt: 1, 
                      fontWeight: 700,
                      borderRadius: 2.5,
                      px: 3,
                      py: 1.5,
                      boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}`
                    }}
                  >
                    Add Your First Real Trade
                  </Button>
                </Box>
              )}
            </PremiumCard>
          </Grid>
          
          {/* Real Actions Only */}
          <Grid item xs={12} md={4}>
            <PremiumCard
              title="Real Trading Actions"
              icon={<TrendingUpIcon />}
              variant="primary"
              sx={{ height: '100%' }}
            >
              <Box sx={{ p: 1, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  startIcon={<AddIcon />}
                  component={RouterLink}
                  to="/trades"
                  sx={{ 
                    fontWeight: 700,
                    py: 1.5,
                    borderRadius: 2.5,
                    borderWidth: '1.5px',
                    justifyContent: 'flex-start'
                  }}
                >
                  Log Real Trade
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  startIcon={<CalendarIcon />}
                  component={RouterLink}
                  to="/planning"
                  sx={{ 
                    fontWeight: 700,
                    py: 1.5,
                    borderRadius: 2.5,
                    borderWidth: '1.5px',
                    justifyContent: 'flex-start'
                  }}
                >
                  Create Trading Plan
                </Button>
                
                <Button
                  variant="outlined"
                  color="info"
                  size="large"
                  startIcon={<BarChartIcon />}
                  component={RouterLink}
                  to="/statistics"
                  sx={{ 
                    fontWeight: 700,
                    py: 1.5,
                    borderRadius: 2.5,
                    borderWidth: '1.5px',
                    justifyContent: 'flex-start'
                  }}
                >
                  View Real Statistics
                </Button>
                
                {stats.totalTrades >= 5 && (
                  <Button
                    variant="outlined"
                    color="success"
                    size="large"
                    startIcon={<PsychologyIcon />}
                    component={RouterLink}
                    to="/tradesage"
                    sx={{ 
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: 2.5,
                      borderWidth: '1.5px',
                      justifyContent: 'flex-start'
                    }}
                  >
                    Get AI Insights
                  </Button>
                )}
                
                {stats.totalTrades < 5 && (
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Add {5 - stats.totalTrades} more real trades to unlock AI insights
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