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
  TableRow
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
  PieChart,
  Pie,
  Cell,
  Scatter,
  ScatterChart,
  ZAxis,
  Label
} from 'recharts';

const RiskRewardAnalysis = ({ data }) => {
  if (!data) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Risk/Reward Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No data available for the selected filters. Try changing your date range or other filters.
        </Typography>
      </Paper>
    );
  }

  // Colors for pie chart sections
  const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0'];
  
  // Format the R:R distribution data for the bar chart
  const distributionData = data.rrDistribution.map(item => ({
    range: item.range,
    count: item.count,
  }));
  
  // Format R:R by outcome data for table
  const rrByOutcomeData = Object.entries(data.rrByOutcome).map(([outcome, stats]) => ({
    outcome,
    averagePlannedRR: stats.averagePlannedRR,
    averageActualRR: stats.averageActualRR,
    count: stats.count
  }));

  // Calculate correlation display value
  const correlationValue = data.planAdherenceCorrelation;
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

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Risk/Reward Analysis
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              R:R Overview
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Average Planned R:R
                </Typography>
                <Typography variant="h6">
                  {data.averagePlannedRR.toFixed(2)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Average Actual R:R
                </Typography>
                <Typography variant="h6">
                  {data.averageActualRR.toFixed(2)}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Plan Adherence Correlation with R:R
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="medium" sx={{ color: correlationColor }}>
                  {correlationText} ({correlationValue.toFixed(2)})
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              R:R by Outcome
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={rrByOutcomeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="outcome" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar name="Planned R:R" dataKey="averagePlannedRR" fill="#2196f3" />
                    <Bar name="Actual R:R" dataKey="averageActualRR" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TableContainer component={Box}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Outcome</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Planned R:R</TableCell>
                        <TableCell align="right">Actual R:R</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rrByOutcomeData.map((row) => (
                        <TableRow key={row.outcome}>
                          <TableCell component="th" scope="row">
                            {row.outcome}
                          </TableCell>
                          <TableCell align="right">{row.count}</TableCell>
                          <TableCell align="right">{row.averagePlannedRR.toFixed(2)}</TableCell>
                          <TableCell align="right">{row.averageActualRR.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Risk/Reward Distribution
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis>
                    <Label value="Number of Trades" angle={-90} position="insideLeft" />
                  </YAxis>
                  <RechartsTooltip />
                  <Bar dataKey="count" name="Trade Count" fill="#3f51b5" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="range"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Observations & Recommendations
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Average Planned vs. Actual R:R Gap:</strong>{' '}
            {Math.abs(data.averagePlannedRR - data.averageActualRR).toFixed(2)} 
            ({data.averagePlannedRR > data.averageActualRR ? 'Target not met' : 'Exceeding target'})
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            <strong>Most Common R:R Range:</strong>{' '}
            {distributionData.sort((a, b) => b.count - a.count)[0]?.range}
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            <strong>Winning Trades R:R:</strong>{' '}
            {data.rrByOutcome.Win?.averageActualRR.toFixed(2) || '0.00'}
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            <strong>Losing Trades R:R:</strong>{' '}
            {data.rrByOutcome.Loss?.averageActualRR.toFixed(2) || '0.00'}
          </Typography>
          
          <Typography variant="body2" gutterBottom fontWeight="bold" color="primary">
            Trade Management Insight:
          </Typography>
          
          <Typography variant="body2" paragraph>
            {data.averagePlannedRR > data.averageActualRR ? 
              "You're consistently not reaching your planned R:R targets. Consider letting winners run longer or tightening your stop losses to improve R:R ratios." : 
              "You're exceeding your planned R:R targets, which is excellent. To further optimize, analyze which setups have the best R:R and focus on those."}
          </Typography>
          
          {data.planAdherenceCorrelation > 0.3 && (
            <Typography variant="body2" color="success.main">
              There's a positive correlation between plan adherence and R:R. Continue following your trading plan to maintain good R:R ratios.
            </Typography>
          )}
          
          {data.planAdherenceCorrelation < -0.3 && (
            <Typography variant="body2" color="error.main">
              There's a negative correlation between plan adherence and R:R. You may need to revise your trading plan as current guidelines might be limiting your R:R potential.
            </Typography>
          )}
        </Box>
      </Paper>
    </Paper>
  );
};

export default RiskRewardAnalysis;