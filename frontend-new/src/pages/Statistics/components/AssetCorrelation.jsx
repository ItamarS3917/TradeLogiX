import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
  useTheme
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter,
  ZAxis
} from 'recharts';

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

const AssetCorrelation = ({ data, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Loading correlation data...</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          Asset correlation data is not available. This feature requires the asset analytics module.
        </Alert>
      </Box>
    );
  }

  // Sample data for visualization (used if real data isn't available)
  const symbolsData = data?.symbols || ['ES', 'NQ', 'GC', 'CL', 'EURUSD'];
  
  const correlationMatrix = data?.correlationMatrix || [
    { symbol: 'ES', correlations: [1.0, 0.85, 0.12, 0.35, -0.22] },
    { symbol: 'NQ', correlations: [0.85, 1.0, 0.08, 0.28, -0.18] },
    { symbol: 'GC', correlations: [0.12, 0.08, 1.0, 0.15, 0.42] },
    { symbol: 'CL', correlations: [0.35, 0.28, 0.15, 1.0, 0.05] },
    { symbol: 'EURUSD', correlations: [-0.22, -0.18, 0.42, 0.05, 1.0] }
  ];
  
  const correlationInsights = data?.correlationInsights || [
    {
      symbols: ['ES', 'NQ'],
      correlation: 0.85,
      direction: 'positive',
      strength: 'strong',
      insight: 'Strong positive correlation between ES and NQ suggesting similar market influences.'
    },
    {
      symbols: ['GC', 'EURUSD'],
      correlation: 0.42,
      direction: 'positive',
      strength: 'moderate',
      insight: 'Moderate positive correlation between Gold and EUR/USD.'
    },
    {
      symbols: ['ES', 'EURUSD'],
      correlation: -0.22,
      direction: 'negative',
      strength: 'weak',
      insight: 'Weak negative correlation between ES and EUR/USD suggesting limited inverse relationship.'
    }
  ];
  
  const strongestPositive = data?.strongestPositiveCorrelation || {
    symbols: ['ES', 'NQ'],
    correlation: 0.85
  };
  
  const strongestNegative = data?.strongestNegativeCorrelation || {
    symbols: ['ES', 'EURUSD'],
    correlation: -0.22
  };

  // Format correlation data for scatter plot
  const scatterData = [];
  symbolsData.forEach((symbol1, i) => {
    symbolsData.forEach((symbol2, j) => {
      if (i !== j) { // Skip self correlations
        scatterData.push({
          x: i,
          y: j,
          z: correlationMatrix[i].correlations[j],
          xLabel: symbol1,
          yLabel: symbol2,
        });
      }
    });
  });
  
  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        {/* Correlation highlights cards */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Strongest Positive Correlation
              </Typography>
              {strongestPositive ? (
                <>
                  <Typography variant="h5">
                    {strongestPositive.correlation.toFixed(2)}
                  </Typography>
                  <Typography color="text.secondary">
                    between {strongestPositive.symbols[0]} and {strongestPositive.symbols[1]}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No significant positive correlation found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Strongest Negative Correlation
              </Typography>
              {strongestNegative ? (
                <>
                  <Typography variant="h5">
                    {strongestNegative.correlation.toFixed(2)}
                  </Typography>
                  <Typography color="text.secondary">
                    between {strongestNegative.symbols[0]} and {strongestNegative.symbols[1]}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No significant negative correlation found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Correlation Visualization (using ScatterChart instead of HeatMap) */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 500 }}>
            <Typography variant="h6" gutterBottom>
              Asset Correlation Matrix
            </Typography>
            <Box sx={{ height: 450 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                  }}
                >
                  <CartesianGrid />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Symbol 1" 
                    tick={false}
                    domain={[0, symbolsData.length - 1]}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Symbol 2" 
                    tick={false}
                    domain={[0, symbolsData.length - 1]}
                  />
                  <ZAxis 
                    type="number" 
                    dataKey="z" 
                    range={[50, 400]} 
                    domain={[-1, 1]}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name, props) => {
                      if (name === 'z') {
                        return [`${parseFloat(value).toFixed(2)}`, 'Correlation'];
                      }
                      return [props.payload.xLabel, 'Symbol 1'];
                    }}
                    labelFormatter={(value, name, props) => {
                      return `${props[0].payload.xLabel} vs ${props[0].payload.yLabel}`;
                    }}
                  />
                  <Scatter 
                    name="Correlation" 
                    data={scatterData} 
                    fill={(entry) => {
                      const value = entry.z;
                      if (value > 0.7) return '#1976d2';  // Strong positive - blue
                      if (value > 0.3) return '#4caf50';  // Moderate positive - green
                      if (value > -0.3) return '#9e9e9e'; // Weak/no correlation - gray
                      if (value > -0.7) return '#ff9800'; // Moderate negative - orange
                      return '#f44336';                   // Strong negative - red
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Correlation Insights */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 500, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Correlation Insights
            </Typography>
            {correlationInsights.length > 0 ? (
              <List>
                {correlationInsights.map((insight, index) => (
                  <ListItem key={index} divider={index < correlationInsights.length - 1}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2">
                            {insight.symbols[0]} & {insight.symbols[1]}
                          </Typography>
                          <Chip 
                            label={insight.correlation.toFixed(2)} 
                            size="small" 
                            color={insight.direction === 'positive' ? 'primary' : 'error'}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={insight.insight}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No significant correlations detected between the selected assets.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssetCorrelation;