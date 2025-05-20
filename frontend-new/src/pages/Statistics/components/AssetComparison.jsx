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
  Tabs,
  Tab,
  useTheme,
  Alert
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`asset-comparison-tabpanel-${index}`}
      aria-labelledby={`asset-comparison-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

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

const AssetComparison = ({ data, loading }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <Typography>Loading asset comparison data...</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          Asset comparison data is not available. This feature requires the asset analytics module.
        </Alert>
      </Box>
    );
  }

  // Mock data for demonstration when real data is not available
  const sampleData = data?.assetComparison || [
    { assetType: "Futures", tradeCount: 45, winRate: 68.5, netProfit: 3250, averageProfit: 72.2, profitFactor: 2.1 },
    { assetType: "Forex", tradeCount: 32, winRate: 59.2, netProfit: 1450, averageProfit: 45.3, profitFactor: 1.7 },
    { assetType: "Crypto", tradeCount: 28, winRate: 42.8, netProfit: -950, averageProfit: -33.9, profitFactor: 0.8 }
  ];

  const topAssets = data?.topPerformingAssets || [
    { symbol: "NQ", assetType: "Futures", tradeCount: 25, winRate: 72, netProfit: 2150, averageProfit: 86 },
    { symbol: "ES", assetType: "Futures", tradeCount: 18, winRate: 66.7, netProfit: 950, averageProfit: 52.8 }
  ];

  const worstAssets = data?.worstPerformingAssets || [
    { symbol: "BTC/USD", assetType: "Crypto", tradeCount: 12, winRate: 33.3, netProfit: -750, averageProfit: -62.5 },
    { symbol: "ETH/USD", assetType: "Crypto", tradeCount: 8, winRate: 37.5, netProfit: -450, averageProfit: -56.3 }
  ];

  const overallPerformance = data?.overallPerformance || {
    totalTrades: 105,
    winRate: 58.1,
    netProfit: 3750,
    averageProfit: 35.7
  };

  // Prepare data for bar chart
  const chartData = sampleData.map(asset => ({
    name: asset.assetType,
    winRate: asset.winRate,
    profitFactor: asset.profitFactor || 0,
    averageProfit: asset.averageProfit || 0
  }));

  return (
    <Box sx={{ width: '100%' }}>
      {/* Overall Performance Summary */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Trades
              </Typography>
              <Typography variant="h4">
                {overallPerformance.totalTrades || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Win Rate
              </Typography>
              <Typography variant="h4">
                {formatPercent(overallPerformance.winRate)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Net Profit
              </Typography>
              <Typography variant="h4">
                {formatCurrency(overallPerformance.netProfit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Average Profit
              </Typography>
              <Typography variant="h4">
                {formatCurrency(overallPerformance.averageProfit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Asset Type Comparison" />
          <Tab label="Top Performing Assets" />
          <Tab label="Worst Performing Assets" />
        </Tabs>
      </Box>

      {/* Asset Type Comparison Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Asset Type</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Win Rate</TableCell>
                    <TableCell align="right">Net Profit</TableCell>
                    <TableCell align="right">Avg Profit</TableCell>
                    <TableCell align="right">Profit Factor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sampleData.map((asset) => (
                    <TableRow key={asset.assetType}>
                      <TableCell>{asset.assetType}</TableCell>
                      <TableCell align="right">{asset.tradeCount}</TableCell>
                      <TableCell align="right">{formatPercent(asset.winRate)}</TableCell>
                      <TableCell align="right">{formatCurrency(asset.netProfit)}</TableCell>
                      <TableCell align="right">{formatCurrency(asset.averageProfit)}</TableCell>
                      <TableCell align="right">{asset.profitFactor?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} md={7}>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'winRate') return `${value.toFixed(2)}%`;
                    if (name === 'profitFactor') return value.toFixed(2);
                    return formatCurrency(value);
                  }} />
                  <Legend />
                  <Bar dataKey="winRate" name="Win Rate (%)" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Top Performing Assets Tab */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell align="right">Type</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Win Rate</TableCell>
                <TableCell align="right">Net Profit</TableCell>
                <TableCell align="right">Avg Profit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topAssets.map((asset, index) => (
                <TableRow key={`${asset.symbol}-${index}`}>
                  <TableCell>{asset.symbol}</TableCell>
                  <TableCell align="right">{asset.assetType}</TableCell>
                  <TableCell align="right">{asset.tradeCount}</TableCell>
                  <TableCell align="right">{formatPercent(asset.winRate)}</TableCell>
                  <TableCell align="right">{formatCurrency(asset.netProfit)}</TableCell>
                  <TableCell align="right">{formatCurrency(asset.averageProfit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Worst Performing Assets Tab */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell align="right">Type</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Win Rate</TableCell>
                <TableCell align="right">Net Profit</TableCell>
                <TableCell align="right">Avg Profit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {worstAssets.map((asset, index) => (
                <TableRow key={`${asset.symbol}-${index}`}>
                  <TableCell>{asset.symbol}</TableCell>
                  <TableCell align="right">{asset.assetType}</TableCell>
                  <TableCell align="right">{asset.tradeCount}</TableCell>
                  <TableCell align="right">{formatPercent(asset.winRate)}</TableCell>
                  <TableCell align="right">{formatCurrency(asset.netProfit)}</TableCell>
                  <TableCell align="right">{formatCurrency(asset.averageProfit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Box>
  );
};

export default AssetComparison;