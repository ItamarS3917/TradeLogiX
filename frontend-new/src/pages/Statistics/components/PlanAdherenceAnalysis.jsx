import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip
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
  ReferenceLine,
  Scatter,
  ScatterChart,
  ZAxis
} from 'recharts';

const PlanAdherenceAnalysis = ({ data }) => {
  if (!data) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Plan Adherence Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No data available for the selected filters. Try changing your date range or other filters.
        </Typography>
      </Paper>
    );
  }

  // Format adherence levels data for chart
  const adherenceLevelsData = data.adherenceLevels;
  
  // Format adherence over time data for chart
  const adherenceOverTimeData = data.adherenceOverTime;
  
  // Calculate correlation display value
  const correlationValue = data.correlation;
  const correlationText = 
    correlationValue > 0.7 ? 'Strong Positive' :
    correlationValue > 0.4 ? 'Moderate Positive' :
    correlationValue > 0.1 ? 'Weak Positive' :
    correlationValue > -0.1 ? 'No Correlation' :
    correlationValue > -0.4 ? 'Weak Negative' :
    correlationValue > -0.7 ? 'Moderate Negative' : 'Strong Negative';
  
  const correlationColor = 
    correlationValue > 0.1 ? '#4caf50' :
    correlationValue < -0.1 ? '#f44336' : '#9e9e9e';
  
  // Calculate insights
  const mostProfitableAdherence = [...adherenceLevelsData]
    .filter(level => level.tradeCount > 0)
    .sort((a, b) => b.netProfit - a.netProfit)[0];
  
  const highestWinRateAdherence = [...adherenceLevelsData]
    .filter(level => level.tradeCount > 0)
    .sort((a, b) => b.winRate - a.winRate)[0];
  
  const mostCommonAdherence = [...adherenceLevelsData]
    .filter(level => level.tradeCount > 0)
    .sort((a, b) => b.tradeCount - a.tradeCount)[0];
  
  // Create scatter plot data for win rate vs adherence
  const scatterData = adherenceLevelsData
    .filter(level => level.tradeCount > 0)
    .map(level => ({
      x: level.level,
      y: level.winRate,
      z: level.tradeCount,
      name: `Level ${level.level}`
    }));

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Plan Adherence Analysis
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Plan Adherence Insights
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Correlation with Profitability
              </Typography>
              <Typography variant="h6" fontWeight="medium" sx={{ color: correlationColor }}>
                {correlationText} ({correlationValue.toFixed(2)})
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(correlationValue + 1) * 50} // Scale from -1...1 to 0...100
                sx={{ 
                  height: 8, 
                  borderRadius: 5, 
                  my: 1,
                  backgroundColor: '#f5f5f5',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: correlationColor
                  }
                }}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Most Profitable Adherence Level
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                Level {mostProfitableAdherence?.level} (${mostProfitableAdherence?.netProfit.toFixed(2)})
              </Typography>
            </Box>
            
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Highest Win Rate Adherence Level
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                Level {highestWinRateAdherence?.level} ({highestWinRateAdherence?.winRate}%)
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary">
                Most Common Adherence Level
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                Level {mostCommonAdherence?.level} ({mostCommonAdherence?.tradeCount} trades)
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Win Rate by Adherence Level
            </Typography>
            
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Adherence Level" 
                    domain={[1, 10]}
                    label={{ value: 'Adherence Level', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Win Rate" 
                    domain={[0, 100]}
                    label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <ZAxis 
                    type="number" 
                    dataKey="z" 
                    range={[50, 400]} 
                    name="Trade Count" 
                  />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter 
                    name="Win Rate vs Adherence" 
                    data={scatterData} 
                    fill="#8884d8"
                  />
                  <ReferenceLine y={50} stroke="#ff9800" strokeDasharray="3 3" />
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Profitability by Adherence Level
            </Typography>
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adherenceLevelsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis label={{ value: 'Net Profit ($)', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip />
                  <Legend />
                  <ReferenceLine y={0} stroke="#000" />
                  <Bar 
                    dataKey="netProfit" 
                    name="Net Profit" 
                    fill={(data) => data.netProfit >= 0 ? '#4caf50' : '#f44336'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Adherence Over Time
            </Typography>
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={adherenceOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" domain={[0, 10]}>
                    <Label value="Adherence Level" angle={-90} position="insideLeft" />
                  </YAxis>
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]}>
                    <Label value="Win Rate (%)" angle={90} position="insideRight" />
                  </YAxis>
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="averageAdherence" 
                    name="Avg Adherence" 
                    stroke="#2196f3" 
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="winRate" 
                    name="Win Rate" 
                    stroke="#4caf50" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Detailed Adherence Analysis
        </Typography>
        
        <TableContainer component={Box} sx={{ maxHeight: 350, overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Adherence Level</TableCell>
                <TableCell align="right">Trade Count</TableCell>
                <TableCell align="right">Win Rate</TableCell>
                <TableCell align="right">Avg Profit</TableCell>
                <TableCell align="right">Net Profit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {adherenceLevelsData.map((level) => (
                <TableRow 
                  key={level.level}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    backgroundColor: level.netProfit > 0 ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)'
                  }}
                >
                  <TableCell component="th" scope="row">
                    Level {level.level}
                  </TableCell>
                  <TableCell align="right">{level.tradeCount}</TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      fontWeight: 'bold',
                      color: level.winRate >= 50 ? 'success.main' : 'error.main'
                    }}
                  >
                    {level.winRate}%
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ color: level.averageProfit >= 0 ? 'success.main' : 'error.main' }}
                  >
                    ${level.averageProfit.toFixed(2)}
                  </TableCell>
                  <TableCell 
                    align="right" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: level.netProfit >= 0 ? 'success.main' : 'error.main' 
                    }}
                  >
                    ${level.netProfit.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Key Takeaways
          </Typography>
          
          <Box sx={{ pl: 2 }}>
            {correlationValue > 0.3 && (
              <Typography variant="body2" paragraph color="success.main">
                <strong>Strong Plan Correlation:</strong> There's a significant positive correlation between plan adherence and profitability. Continue following your trading plan strictly to maximize returns.
              </Typography>
            )}
            
            {correlationValue < -0.3 && (
              <Typography variant="body2" paragraph color="error.main">
                <strong>Negative Plan Correlation:</strong> There's a negative correlation between plan adherence and profitability. Your current trading plan may need revision as strict adherence is not leading to better results.
              </Typography>
            )}
            
            {Math.abs(correlationValue) <= 0.3 && (
              <Typography variant="body2" paragraph>
                <strong>Weak Plan Correlation:</strong> There's little correlation between plan adherence and profitability. Your trading plan may need to be more specific or better aligned with your most profitable setups.
              </Typography>
            )}
            
            <Typography variant="body2" paragraph>
              <strong>Optimal Adherence Level:</strong> Based on your data, level {mostProfitableAdherence?.level} adherence has been most profitable, while level {highestWinRateAdherence?.level} has the highest win rate.
            </Typography>
            
            <Typography variant="body2" paragraph>
              <strong>Adherence Trend:</strong> {
                adherenceOverTimeData.length >= 2 && 
                adherenceOverTimeData[adherenceOverTimeData.length - 1].averageAdherence > 
                adherenceOverTimeData[0].averageAdherence
                  ? "Your plan adherence has been improving over time, which is a positive sign of trading discipline."
                  : "Your plan adherence has not improved over time. Consider using pre-trade checklists to ensure better compliance with your trading plan."
              }
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Paper>
  );
};

export default PlanAdherenceAnalysis;