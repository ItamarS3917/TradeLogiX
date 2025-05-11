import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  ToggleButtonGroup, 
  ToggleButton
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Cell
} from 'recharts';

const WinRateBySetupChart = ({ data = [] }) => {
  const [viewMode, setViewMode] = useState('winRate');
  
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Win Rate by Setup Type
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No data available for the selected filters. Try changing your date range or other filters.
        </Typography>
      </Paper>
    );
  }

  // Sort data by the selected metric (default: win rate)
  const sortedData = [...data].sort((a, b) => {
    if (viewMode === 'winRate') return b.winRate - a.winRate;
    if (viewMode === 'profitFactor') return b.profitFactor - a.profitFactor;
    if (viewMode === 'netProfit') return b.netProfit - a.netProfit;
    if (viewMode === 'tradeCount') return b.tradeCount - a.tradeCount;
    return 0;
  });

  // Create color scale based on win rate
  const getBarColor = (winRate) => {
    if (winRate >= 70) return '#4caf50'; // Green
    if (winRate >= 50) return '#8bc34a'; // Light green
    if (winRate >= 40) return '#ffc107'; // Amber
    return '#f44336'; // Red
  };

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Prepare chart data based on view mode
  const chartData = sortedData.map(setup => {
    let value = 0;
    let label = '';
    
    if (viewMode === 'winRate') {
      value = setup.winRate;
      label = 'Win Rate (%)';
    } else if (viewMode === 'profitFactor') {
      value = setup.profitFactor;
      label = 'Profit Factor';
    } else if (viewMode === 'netProfit') {
      value = setup.netProfit;
      label = 'Net Profit ($)';
    } else if (viewMode === 'tradeCount') {
      value = setup.tradeCount;
      label = 'Trade Count';
    }
    
    return {
      setupType: setup.setupType,
      [label]: value,
      winRate: setup.winRate // Keep win rate for coloring
    };
  });
  
  // Get the correct y-axis label
  const getYAxisLabel = () => {
    if (viewMode === 'winRate') return 'Win Rate (%)';
    if (viewMode === 'profitFactor') return 'Profit Factor';
    if (viewMode === 'netProfit') return 'Net Profit ($)';
    if (viewMode === 'tradeCount') return 'Trade Count';
    return '';
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Win Rate & Performance by Setup Type
        </Typography>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="winRate">Win Rate</ToggleButton>
          <ToggleButton value="profitFactor">Profit Factor</ToggleButton>
          <ToggleButton value="netProfit">Net Profit</ToggleButton>
          <ToggleButton value="tradeCount">Trade Count</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="setupType" />
                <YAxis label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }} />
                <RechartsTooltip />
                <Legend />
                <Bar 
                  dataKey={getYAxisLabel()} 
                  name={getYAxisLabel()}
                  isAnimationActive={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.winRate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Setup Type</TableCell>
                  <TableCell align="right">Win Rate</TableCell>
                  <TableCell align="right">Trades</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((setup) => (
                  <TableRow 
                    key={setup.setupType}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: setup.winRate >= 50 ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)'
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {setup.setupType}
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        fontWeight: 'bold',
                        color: setup.winRate >= 50 ? 'success.main' : 'error.main'
                      }}
                    >
                      {setup.winRate}%
                    </TableCell>
                    <TableCell align="right">{setup.tradeCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Setup Performance
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Setup Type</TableCell>
                <TableCell align="right">Trades</TableCell>
                <TableCell align="right">Win Rate</TableCell>
                <TableCell align="right">Win/Loss</TableCell>
                <TableCell align="right">Net Profit</TableCell>
                <TableCell align="right">Avg Win</TableCell>
                <TableCell align="right">Avg Loss</TableCell>
                <TableCell align="right">Profit Factor</TableCell>
                <TableCell align="right">Avg R:R</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((setup) => (
                <TableRow 
                  key={setup.setupType}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    backgroundColor: setup.winRate >= 50 ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)'
                  }}
                >
                  <TableCell component="th" scope="row">
                    {setup.setupType}
                  </TableCell>
                  <TableCell align="right">{setup.tradeCount}</TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      fontWeight: 'bold',
                      color: setup.winRate >= 50 ? 'success.main' : 'error.main'
                    }}
                  >
                    {setup.winRate}%
                  </TableCell>
                  <TableCell align="right">{setup.winCount}/{setup.lossCount}</TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ color: setup.netProfit >= 0 ? 'success.main' : 'error.main' }}
                  >
                    ${setup.netProfit.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>
                    ${setup.averageWin.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    ${Math.abs(setup.averageLoss).toFixed(2)}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      fontWeight: 'bold',
                      color: setup.profitFactor >= 1.5 ? 'success.main' : setup.profitFactor >= 1 ? 'warning.main' : 'error.main'
                    }}
                  >
                    {setup.profitFactor.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">{setup.averageRR.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default WinRateBySetupChart;