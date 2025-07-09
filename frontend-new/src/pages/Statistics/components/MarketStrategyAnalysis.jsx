import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Divider,
  Chip,
  Alert,
  useTheme
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Basic formatter functions to replace the imported ones
const formatCurrency = (value) => {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

const formatPercent = (value) => {
  if (value === undefined || value === null) return '-';
  return `${value.toFixed(2)}%`;
};

const MarketStrategyAnalysis = ({ data, loading }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Loading strategy analysis...</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          Market strategy analysis data is not available. This feature requires the asset analytics module.
        </Alert>
      </Box>
    );
  }

  // Extract data for visualization, use sample data if not provided
  const strategyPerformance = data?.strategyPerformance || [
    {
      market: "Futures",
      strategy: "MMXM_STANDARD",
      tradeCount: 28,
      winRate: 71.4,
      netProfit: 2250,
      expectancy: 80.4
    },
    {
      market: "Futures",
      strategy: "ICT_BPR",
      tradeCount: 22,
      winRate: 63.6,
      netProfit: 1750,
      expectancy: 79.5
    },
    {
      market: "Forex",
      strategy: "MMXM_STANDARD",
      tradeCount: 18,
      winRate: 55.6,
      netProfit: 850,
      expectancy: 47.2
    },
    {
      market: "Forex",
      strategy: "ICT_BPR",
      tradeCount: 15,
      winRate: 60.0,
      netProfit: 950,
      expectancy: 63.3
    },
    {
      market: "Crypto",
      strategy: "MMXM_STANDARD",
      tradeCount: 12,
      winRate: 41.7,
      netProfit: -350,
      expectancy: -29.2
    }
  ];
  
  const topStrategies = data?.topStrategies || [
    {
      market: "Futures",
      strategy: "MMXM_STANDARD",
      winRate: 71.4,
      expectancy: 80.4
    },
    {
      market: "Futures",
      strategy: "ICT_BPR",
      winRate: 63.6,
      expectancy: 79.5
    },
    {
      market: "Forex",
      strategy: "ICT_BPR",
      winRate: 60.0,
      expectancy: 63.3
    }
  ];
  
  const recommendations = data?.strategyRecommendations || [
    {
      market: "Futures",
      recommendedStrategy: "MMXM_STANDARD",
      metrics: {
        winRate: 71.4,
        expectancy: 80.4,
        tradeCount: 28
      },
      recommendation: "For Futures trading, focus on MMXM_STANDARD with a 71.4% win rate."
    },
    {
      market: "Forex",
      recommendedStrategy: "ICT_BPR",
      metrics: {
        winRate: 60.0,
        expectancy: 63.3,
        tradeCount: 15
      },
      recommendation: "For Forex trading, focus on ICT_BPR with a 60.0% win rate.",
      avoidStrategy: "MMXM_STANDARD"
    },
    {
      market: "Crypto",
      recommendedStrategy: "ICT_LIQUIDITY",
      metrics: {
        winRate: 50.0,
        expectancy: 12.5,
        tradeCount: 8
      },
      recommendation: "For Crypto trading, focus on ICT_LIQUIDITY with a 50.0% win rate. Avoid MMXM_STANDARD which showed negative expectancy."
    }
  ];

  // Prepare data for bar chart
  const chartData = topStrategies.map(strategy => ({
    name: `${strategy.market} - ${strategy.strategy}`,
    expectancy: strategy.expectancy
  }));

  return (
    <Box sx={{ width: '100%' }}>
      {/* Recommendations Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Strategy Recommendations
        </Typography>
        <Grid container spacing={2}>
          {recommendations.map((rec, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {rec.market}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip 
                      label={`Recommended: ${rec.recommendedStrategy}`}
                      color="success"
                      size="small"
                    />
                  </Box>
                  {rec.avoidStrategy && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={`Avoid: ${rec.avoidStrategy}`}
                        color="error"
                        size="small"
                      />
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" gutterBottom>
                      Win Rate: {formatPercent(rec.metrics.winRate)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Expectancy: {formatCurrency(rec.metrics.expectancy)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      Trade Count: {rec.metrics.tradeCount}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {rec.recommendation}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Top Strategies Chart */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Top Strategies by Market Type
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 100,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={100}
                  tickMargin={30}
                />
                <YAxis 
                  label={{ value: 'Expectancy ($)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar 
                  dataKey="expectancy" 
                  name="Expectancy"
                  // Use dynamic colors based on value
                  fill={(entry) => entry.expectancy > 0 ? '#4caf50' : '#f44336'}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Box>

      {/* Detailed Performance Table */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Strategy Performance by Market
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Showing detailed performance metrics for all strategies across different market types.
        </Alert>
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Market</TableCell>
                  <TableCell>Strategy</TableCell>
                  <TableCell align="right">Trade Count</TableCell>
                  <TableCell align="right">Win Rate</TableCell>
                  <TableCell align="right">Net Profit</TableCell>
                  <TableCell align="right">Expectancy</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {strategyPerformance.map((strategy, index) => (
                  <TableRow key={`${strategy.market}-${strategy.strategy}-${index}`}>
                    <TableCell>{strategy.market}</TableCell>
                    <TableCell>{strategy.strategy}</TableCell>
                    <TableCell align="right">{strategy.tradeCount}</TableCell>
                    <TableCell align="right">{formatPercent(strategy.winRate)}</TableCell>
                    <TableCell align="right">{formatCurrency(strategy.netProfit)}</TableCell>
                    <TableCell align="right">{formatCurrency(strategy.expectancy)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default MarketStrategyAnalysis;