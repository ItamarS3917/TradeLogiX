import React, { useState, useEffect } from 'react';
import { Box, Alert, Skeleton } from '@mui/material';
import Widget from './Widget';
import AdvancedChartVisualizations from '../Dashboard/AdvancedChartVisualizations';
import { ShowChart as ChartIcon } from '@mui/icons-material';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { format, subDays } from 'date-fns';

/**
 * Performance Chart Widget - Interactive performance charts for the dashboard
 */
const PerformanceChartWidget = ({ 
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
    chartType = 'area',
    timeframe = '1M',
    showMovingAverage = false,
    metric = 'cumulativePnL',
    height = 350,
    enableInteraction = true,
    enableAnimation = true
  } = settings;
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  // Fetch chart data
  const fetchChartData = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch trades data
      const trades = await firebase.getAllTrades();
      
      if (!trades || trades.length === 0) {
        // Generate sample data for demo
        setChartData(generateSampleData());
        return;
      }
      
      // Process trades into chart data
      const processedData = processTradesForChart(trades, timeframe);
      setChartData(processedData);
      
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to load chart data');
      // Fallback to sample data
      setChartData(generateSampleData());
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process trades into chart format
  const processTradesForChart = (trades, timeframe) => {
    // Sort trades by date
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.entry_time) - new Date(b.entry_time)
    );
    
    // Group trades by date and calculate metrics
    const dateGroups = {};
    let cumulativePnL = 0;
    
    sortedTrades.forEach(trade => {
      const tradeDate = new Date(trade.entry_time);
      const dateKey = format(tradeDate, 'yyyy-MM-dd');
      
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = {
          date: format(tradeDate, 'MMM dd'),
          fullDate: tradeDate,
          dailyPnL: 0,
          trades: [],
          wins: 0,
          losses: 0
        };
      }
      
      const pnl = parseFloat(trade.profit_loss) || 0;
      dateGroups[dateKey].dailyPnL += pnl;
      dateGroups[dateKey].trades.push(trade);
      
      if (trade.outcome === 'Win') {
        dateGroups[dateKey].wins++;
      } else if (trade.outcome === 'Loss') {
        dateGroups[dateKey].losses++;
      }
    });
    
    // Convert to array and calculate additional metrics
    return Object.values(dateGroups).map(group => {
      cumulativePnL += group.dailyPnL;
      const totalTrades = group.trades.length;
      const winRate = totalTrades > 0 ? (group.wins / totalTrades) * 100 : 0;
      
      return {
        date: group.date,
        fullDate: group.fullDate,
        dailyPnL: parseFloat(group.dailyPnL.toFixed(2)),
        cumulativePnL: parseFloat(cumulativePnL.toFixed(2)),
        winRate: parseFloat(winRate.toFixed(1)),
        volume: totalTrades,
        drawdown: Math.min(0, group.dailyPnL), // Simplified drawdown
        high: cumulativePnL + Math.abs(group.dailyPnL * 0.1),
        low: cumulativePnL - Math.abs(group.dailyPnL * 0.1),
        open: cumulativePnL - group.dailyPnL,
        close: cumulativePnL
      };
    });
  };
  
  // Generate sample data for demo/fallback
  const generateSampleData = () => {
    const days = 30;
    const data = [];
    let cumulativePnL = 1000;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dailyPnL = (Math.random() - 0.45) * 200; // Slight positive bias
      cumulativePnL += dailyPnL;
      
      data.push({
        date: format(date, 'MMM dd'),
        fullDate: date,
        dailyPnL: parseFloat(dailyPnL.toFixed(2)),
        cumulativePnL: parseFloat(cumulativePnL.toFixed(2)),
        winRate: Math.random() * 40 + 50, // 50-90%
        volume: Math.floor(Math.random() * 10) + 1,
        drawdown: Math.random() * -100,
        high: cumulativePnL + Math.random() * 50,
        low: cumulativePnL - Math.random() * 50,
        open: cumulativePnL + (Math.random() - 0.5) * 30,
        close: cumulativePnL
      });
    }
    
    return data;
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchChartData();
    if (onRefresh) onRefresh();
  };
  
  // Handle chart type change
  const handleChartTypeChange = (newType) => {
    // Could update settings if we had a settings callback
    console.log('Chart type changed to:', newType);
  };
  
  // Handle data point click
  const handleDataPointClick = (data, index) => {
    console.log('Data point clicked:', data, index);
    // Could show detailed modal or navigate to specific date view
  };
  
  // Load data on mount
  useEffect(() => {
    fetchChartData();
  }, [user?.uid, timeframe]);
  
  // Render loading state
  if (isLoading) {
    return (
      <Widget
        title="Performance Chart"
        icon={<ChartIcon />}
        onRefresh={handleRefresh}
        onConfigure={onConfigure}
        onRemove={onRemove}
        isLoading={true}
        {...props}
      >
        <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 2 }} />
      </Widget>
    );
  }
  
  return (
    <Widget
      title="Performance Chart"
      icon={<ChartIcon />}
      onRefresh={handleRefresh}
      onConfigure={onConfigure}
      onRemove={onRemove}
      hasSettings={true}
      refreshable={true}
      {...props}
    >
      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          {error} - Showing sample data
        </Alert>
      )}
      
      <Box sx={{ height: height }}>
        <AdvancedChartVisualizations
          data={chartData}
          title=""
          subtitle=""
          height={height}
          enableInteraction={enableInteraction}
          enableAnimation={enableAnimation}
          showControls={true}
          defaultChartType={chartType}
          timeframe={timeframe}
          onChartTypeChange={handleChartTypeChange}
          onDataPointClick={handleDataPointClick}
        />
      </Box>
    </Widget>
  );
};

export default PerformanceChartWidget;
