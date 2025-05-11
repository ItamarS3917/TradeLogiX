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
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  ReferenceLine
} from 'recharts';

const ProfitabilityByTimeChart = ({ data = [] }) => {
  const [viewMode, setViewMode] = useState('netProfit');
  
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Profitability by Time of Day
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No data available for the selected filters. Try changing your date range or other filters.
        </Typography>
      </Paper>
    );
  }

  // Sort data by time slot
  const sortedData = [...data].sort((a, b) => {
    // Extract hour from time slot (e.g., "9:30-10:00" -> 9)
    const aHour = parseInt(a.timeSlot.split(':')[0]);
    const bHour = parseInt(b.timeSlot.split(':')[0]);
    return aHour - bHour;
  });

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Prepare custom tooltips for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, boxShadow: 2 }}>
          <Typography variant="body2" fontWeight="bold">{label}</Typography>
          {payload.map((entry, index) => (
            <Box key={`tooltip-${index}`} sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Box 
                sx={{ 
                  width: 10, 
                  height: 10, 
                  backgroundColor: entry.color, 
                  mr: 1,
                  borderRadius: '50%'
                }} 
              />
              <Typography variant="body2">
                {entry.name}: {entry.name.includes('Profit') ? `$${entry.value.toFixed(2)}` : entry.name.includes('Rate') ? `${entry.value}%` : entry.value}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Main chart component based on selected view mode
  const renderChart = () => {
    if (viewMode === 'netProfit') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timeSlot" />
            <YAxis label={{ value: 'Net Profit ($)', angle: -90, position: 'insideLeft' }} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#000" />
            <Bar 
              dataKey="netProfit" 
              name="Net Profit" 
              fill="#2196f3" 
              stroke="#1769aa"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (viewMode === 'winRate') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timeSlot" />
            <YAxis label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft' }} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={50} stroke="#ff9800" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="winRate" 
              name="Win Rate" 
              stroke="#4caf50" 
              strokeWidth={2}
              dot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (viewMode === 'tradeCount') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timeSlot" />
            <YAxis label={{ value: 'Trade Count', angle: -90, position: 'insideLeft' }} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="tradeCount" 
              name="Trade Count" 
              fill="#9c27b0" 
              isAnimationActive={false}
            />
            <Bar 
              dataKey="winCount" 
              name="Win Count" 
              fill="#4caf50" 
              isAnimationActive={false}
            />
            <Bar 
              dataKey="lossCount" 
              name="Loss Count" 
              fill="#f44336" 
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timeSlot" />
            <YAxis label={{ value: 'Average Profit ($)', angle: -90, position: 'insideLeft' }} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#000" />
            <Bar 
              dataKey="averageProfit" 
              name="Average Profit" 
              fill="#ff9800" 
              stroke="#c77700"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  // Find the most profitable time slots
  const mostProfitableTime = [...sortedData].sort((a, b) => b.netProfit - a.netProfit)[0];
  const highestWinRateTime = [...sortedData].sort((a, b) => b.winRate - a.winRate)[0];
  const mostActiveTime = [...sortedData].sort((a, b) => b.tradeCount - a.tradeCount)[0];
  
  // Find the least profitable time slots
  const leastProfitableTime = [...sortedData].sort((a, b) => a.netProfit - b.netProfit)[0];
  const lowestWinRateTime = [...sortedData].filter(t => t.tradeCount > 0).sort((a, b) => a.winRate - b.winRate)[0];

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Profitability by Time of Day
        </Typography>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="netProfit">Net Profit</ToggleButton>
          <ToggleButton value="winRate">Win Rate</ToggleButton>
          <ToggleButton value="avgProfit">Avg Profit</ToggleButton>
          <ToggleButton value="tradeCount">Trade Count</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ height: 400 }}>
            {renderChart()}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(76, 175, 80, 0.08)' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Best Trading Times
            </Typography>
            
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Most Profitable Time
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {mostProfitableTime.timeSlot} (${mostProfitableTime.netProfit.toFixed(2)})
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Highest Win Rate
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {highestWinRateTime.timeSlot} ({highestWinRateTime.winRate}%)
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Most Active Time
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {mostActiveTime.timeSlot} ({mostActiveTime.tradeCount} trades)
              </Typography>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 2, backgroundColor: 'rgba(244, 67, 54, 0.08)' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Avoid Trading Times
            </Typography>
            
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Least Profitable Time
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {leastProfitableTime.timeSlot} (${leastProfitableTime.netProfit.toFixed(2)})
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Lowest Win Rate
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {lowestWinRateTime?.timeSlot} ({lowestWinRateTime?.winRate}%)
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Time Performance
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Time Slot</TableCell>
                <TableCell align="right">Trades</TableCell>
                <TableCell align="right">Win Rate</TableCell>
                <TableCell align="right">Win Count</TableCell>
                <TableCell align="right">Loss Count</TableCell>
                <TableCell align="right">Net Profit</TableCell>
                <TableCell align="right">Avg Profit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((timeSlot) => (
                <TableRow 
                  key={timeSlot.timeSlot}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    backgroundColor: timeSlot.netProfit >= 0 ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)'
                  }}
                >
                  <TableCell component="th" scope="row">
                    {timeSlot.timeSlot}
                  </TableCell>
                  <TableCell align="right">{timeSlot.tradeCount}</TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      fontWeight: 'bold',
                      color: timeSlot.winRate >= 50 ? 'success.main' : 'error.main'
                    }}
                  >
                    {timeSlot.winRate}%
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>
                    {timeSlot.winCount}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    {timeSlot.lossCount}
                  </TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: timeSlot.netProfit >= 0 ? 'success.main' : 'error.main' 
                    }}
                  >
                    ${timeSlot.netProfit.toFixed(2)}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ color: timeSlot.averageProfit >= 0 ? 'success.main' : 'error.main' }}
                  >
                    ${timeSlot.averageProfit.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
};

export default ProfitabilityByTimeChart;