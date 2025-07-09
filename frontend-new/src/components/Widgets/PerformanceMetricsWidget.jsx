import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Skeleton,
  Alert
} from '@mui/material';
import Widget from './Widget';
import EnhancedPerformanceCard from '../Dashboard/EnhancedPerformanceCard';
import {
  Speed as SpeedIcon,
  ShowChart as ShowChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  MonetizationOn as MoneyIcon
} from '@mui/icons-material';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Performance Metrics Widget - Displays key performance metrics in an organized grid
 */
const PerformanceMetricsWidget = ({ 
  settings = {},
  onRefresh,
  onConfigure,
  onRemove,
  ...props 
}) => {
  const { user } = useAuth();
  const firebase = useFirebase();
  
  // Widget settings with defaults
  const {
    showSparklines = true,
    timeframe = '1M',
    metrics = ['winRate', 'totalPnL', 'todayPnL', 'weeklyPnL'],
    compactMode = false
  } = settings;
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    winRate: 0,
    totalPnL: 0,
    todayPnL: 0,
    weeklyPnL: 0,
    monthlyPnL: 0,
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    avgWin: 0,
    avgLoss: 0,
    profitFactor: 0,
    maxDrawdown: 0
  });
  
  // Sparkline data for each metric
  const [sparklineData, setSparklineData] = useState({
    winRate: [],
    totalPnL: [],
    todayPnL: [],
    weeklyPnL: [],
    monthlyPnL: []
  });
  
  // Fetch performance data
  const fetchPerformanceData = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get date ranges
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);
      
      // Fetch all trades
      const trades = await firebase.getAllTrades();
      
      if (!trades || trades.length === 0) {
        setData({
          winRate: 0,
          totalPnL: 0,
          todayPnL: 0,
          weeklyPnL: 0,
          monthlyPnL: 0,
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          avgWin: 0,
          avgLoss: 0,
          profitFactor: 0,
          maxDrawdown: 0
        });
        return;
      }
      
      // Calculate basic metrics
      const totalTrades = trades.length;
      const winningTrades = trades.filter(trade => trade.outcome === 'Win').length;
      const losingTrades = trades.filter(trade => trade.outcome === 'Loss').length;
      const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
      
      // Calculate P&L metrics
      const totalPnL = trades.reduce((sum, trade) => sum + (parseFloat(trade.profit_loss) || 0), 0);
      
      // Filter trades by time periods
      const todayTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.entry_time);
        return tradeDate >= todayStart && tradeDate <= todayEnd;
      });
      
      const weekTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.entry_time);
        return tradeDate >= weekStart && tradeDate <= weekEnd;
      });
      
      const monthTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.entry_time);
        return tradeDate >= monthStart && tradeDate <= monthEnd;
      });
      
      const todayPnL = todayTrades.reduce((sum, trade) => sum + (parseFloat(trade.profit_loss) || 0), 0);
      const weeklyPnL = weekTrades.reduce((sum, trade) => sum + (parseFloat(trade.profit_loss) || 0), 0);
      const monthlyPnL = monthTrades.reduce((sum, trade) => sum + (parseFloat(trade.profit_loss) || 0), 0);
      
      // Calculate additional metrics
      const winningTradesList = trades.filter(trade => trade.outcome === 'Win');
      const losingTradesList = trades.filter(trade => trade.outcome === 'Loss');
      
      const avgWin = winningTradesList.length > 0 
        ? winningTradesList.reduce((sum, trade) => sum + parseFloat(trade.profit_loss), 0) / winningTradesList.length
        : 0;
        
      const avgLoss = losingTradesList.length > 0 
        ? Math.abs(losingTradesList.reduce((sum, trade) => sum + parseFloat(trade.profit_loss), 0) / losingTradesList.length)
        : 0;
        
      const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
      
      // Calculate max drawdown
      let peak = 0;
      let maxDrawdown = 0;
      let runningPnL = 0;
      
      const sortedTrades = [...trades].sort((a, b) => new Date(a.entry_time) - new Date(b.entry_time));
      
      sortedTrades.forEach(trade => {
        runningPnL += parseFloat(trade.profit_loss) || 0;
        if (runningPnL > peak) {
          peak = runningPnL;
        }
        const drawdown = peak - runningPnL;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      });
      
      // Generate sparkline data if enabled
      if (showSparklines) {
        const sparklines = generateSparklineData(trades);
        setSparklineData(sparklines);
      }
      
      setData({
        winRate,
        totalPnL,
        todayPnL,
        weeklyPnL,
        monthlyPnL,
        totalTrades,
        winningTrades,
        losingTrades,
        avgWin,
        avgLoss,
        profitFactor,
        maxDrawdown
      });
      
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError('Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate sparkline data for the last 10 periods
  const generateSparklineData = (trades) => {
    const periods = 10;
    const sparklines = {
      winRate: [],
      totalPnL: [],
      todayPnL: [],
      weeklyPnL: [],
      monthlyPnL: []
    };
    
    // Sort trades by date
    const sortedTrades = [...trades].sort((a, b) => new Date(a.entry_time) - new Date(b.entry_time));
    
    // Generate cumulative P&L sparkline
    let cumulativePnL = 0;
    const step = Math.max(1, Math.floor(sortedTrades.length / periods));
    
    for (let i = 0; i < periods; i++) {
      const endIndex = Math.min((i + 1) * step, sortedTrades.length);
      const periodTrades = sortedTrades.slice(i * step, endIndex);
      
      if (periodTrades.length > 0) {
        // Calculate period P&L
        const periodPnL = periodTrades.reduce((sum, trade) => sum + (parseFloat(trade.profit_loss) || 0), 0);
        cumulativePnL += periodPnL;
        
        // Calculate period win rate
        const periodWins = periodTrades.filter(trade => trade.outcome === 'Win').length;
        const periodWinRate = periodTrades.length > 0 ? (periodWins / periodTrades.length) * 100 : 0;
        
        sparklines.totalPnL.push({ value: cumulativePnL });
        sparklines.winRate.push({ value: periodWinRate });
      }
    }
    
    // Generate other sparkline data (simplified for demo)
    for (let i = 0; i < periods; i++) {
      sparklines.todayPnL.push({ value: Math.random() * 200 - 100 });
      sparklines.weeklyPnL.push({ value: Math.random() * 500 - 250 });
      sparklines.monthlyPnL.push({ value: Math.random() * 1000 - 500 });
    }
    
    return sparklines;
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchPerformanceData();
    if (onRefresh) onRefresh();
  };
  
  // Handle metric card click
  const handleCardClick = (metricId) => {
    // Could navigate to detailed view or show modal
    console.log(`Clicked metric: ${metricId}`);
  };
  
  // Load data on mount
  useEffect(() => {
    fetchPerformanceData();
  }, [user?.uid, timeframe]);
  
  // Metric configurations
  const metricConfigs = {
    winRate: {
      title: 'Win Rate',
      value: `${data.winRate}%`,
      icon: <SpeedIcon />,
      color: 'primary',
      trend: 5, // Could calculate actual trend
      tooltipText: `${data.winningTrades} wins out of ${data.totalTrades} total trades`,
      sparklineData: sparklineData.winRate
    },
    totalPnL: {
      title: 'Total P&L',
      value: data.totalPnL.toFixed(2),
      icon: <MoneyIcon />,
      color: data.totalPnL >= 0 ? 'success' : 'error',
      trend: null,
      tooltipText: `Total profit/loss across all ${data.totalTrades} trades`,
      sparklineData: sparklineData.totalPnL
    },
    todayPnL: {
      title: "Today's P&L",
      value: data.todayPnL.toFixed(2),
      icon: <ShowChartIcon />,
      color: data.todayPnL >= 0 ? 'success' : 'error',
      trend: null,
      tooltipText: 'Profit/loss from today\'s trading activity',
      sparklineData: sparklineData.todayPnL
    },
    weeklyPnL: {
      title: 'Weekly P&L',
      value: data.weeklyPnL.toFixed(2),
      icon: <BarChartIcon />,
      color: data.weeklyPnL >= 0 ? 'success' : 'error',
      trend: 12, // Could calculate actual trend
      tooltipText: 'Profit/loss for the current week',
      sparklineData: sparklineData.weeklyPnL
    },
    monthlyPnL: {
      title: 'Monthly P&L',
      value: data.monthlyPnL.toFixed(2),
      icon: <TimelineIcon />,
      color: data.monthlyPnL >= 0 ? 'success' : 'error',
      trend: -3, // Could calculate actual trend
      tooltipText: 'Profit/loss for the current month',
      sparklineData: sparklineData.monthlyPnL
    },
    profitFactor: {
      title: 'Profit Factor',
      value: data.profitFactor.toFixed(2),
      icon: <SpeedIcon />,
      color: data.profitFactor >= 1 ? 'success' : 'error',
      trend: null,
      tooltipText: `Ratio of average win (${data.avgWin.toFixed(2)}) to average loss (${data.avgLoss.toFixed(2)})`,
      sparklineData: []
    },
    maxDrawdown: {
      title: 'Max Drawdown',
      value: data.maxDrawdown.toFixed(2),
      icon: <TimelineIcon />,
      color: 'error',
      trend: null,
      tooltipText: 'Maximum peak-to-trough decline in account value',
      sparklineData: []
    }
  };
  
  // Get visible metrics based on settings
  const visibleMetrics = metrics.filter(metric => metricConfigs[metric]);
  
  // Render loading state
  if (isLoading) {
    return (
      <Widget
        title="Performance Metrics"
        icon={<SpeedIcon />}
        onRefresh={handleRefresh}
        onConfigure={onConfigure}
        onRemove={onRemove}
        isLoading={true}
        {...props}
      >
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} key={item}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Widget>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Widget
        title="Performance Metrics"
        icon={<SpeedIcon />}
        onRefresh={handleRefresh}
        onConfigure={onConfigure}
        onRemove={onRemove}
        error={error}
        {...props}
      >
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Widget>
    );
  }
  
  return (
    <Widget
      title="Performance Metrics"
      icon={<SpeedIcon />}
      onRefresh={handleRefresh}
      onConfigure={onConfigure}
      onRemove={onRemove}
      {...props}
    >
      <Grid container spacing={compactMode ? 1 : 2}>
        {visibleMetrics.map((metricKey) => {
          const config = metricConfigs[metricKey];
          return (
            <Grid 
              item 
              xs={12} 
              sm={compactMode ? 12 : 6} 
              md={compactMode ? 6 : 6}
              lg={visibleMetrics.length > 4 ? 4 : 6}
              key={metricKey}
            >
              <EnhancedPerformanceCard
                title={config.title}
                value={config.value}
                trend={config.trend}
                icon={config.icon}
                color={config.color}
                tooltipText={config.tooltipText}
                sparklineData={showSparklines ? config.sparklineData : undefined}
                onClick={() => handleCardClick(metricKey)}
                sx={{ height: '100%' }}
              />
            </Grid>
          );
        })}
      </Grid>
      
      {visibleMetrics.length === 0 && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 200,
          flexDirection: 'column'
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Metrics Selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure this widget to display performance metrics.
          </Typography>
        </Box>
      )}
    </Widget>
  );
};

export default PerformanceMetricsWidget;
