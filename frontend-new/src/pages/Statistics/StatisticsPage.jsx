import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  TextField, 
  MenuItem, 
  Button, 
  CircularProgress, 
  Alert,
  Tabs,
  Tab,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, subDays } from 'date-fns';

import statisticsService from '../../services/statisticsService';
import tradeService from '../../services/tradeService';
import assetService from '../../services/assetService';

// Import statistics components
import OverviewStats from './components/OverviewStats';
import WinRateBySetupChart from './components/WinRateBySetupChart';
import ProfitabilityByTimeChart from './components/ProfitabilityByTimeChart';
import RiskRewardAnalysis from './components/RiskRewardAnalysis';
import PlanAdherenceAnalysis from './components/PlanAdherenceAnalysis';
import EmotionalAnalysis from './components/EmotionalAnalysis';
import AssetComparison from './components/AssetComparison';
import AssetCorrelation from './components/AssetCorrelation';
import MarketStrategyAnalysis from './components/MarketStrategyAnalysis';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`statistics-tabpanel-${index}`}
      aria-labelledby={`statistics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StatisticsPage = () => {
  // State for date range filter
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  
  // State for setup type filter
  const [setupType, setSetupType] = useState('');
  const [setupTypes, setSetupTypes] = useState([]);
  
  // State for symbol filter
  const [symbol, setSymbol] = useState('');
  const [symbols, setSymbols] = useState([]);
  
  // State for asset filter
  const [assetType, setAssetType] = useState('');
  const [assetTypes, setAssetTypes] = useState([]);
  
  // State for selected symbols for correlation
  const [selectedSymbols, setSelectedSymbols] = useState([]);
  
  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for tab management
  const [currentTab, setCurrentTab] = useState(0);
  
  // State for pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  
  // State for statistics data
  const [overallStats, setOverallStats] = useState(null);
  const [winRateBySetup, setWinRateBySetup] = useState([]);
  const [profitabilityByTime, setProfitabilityByTime] = useState([]);
  const [riskRewardAnalysis, setRiskRewardAnalysis] = useState(null);
  const [emotionalAnalysis, setEmotionalAnalysis] = useState(null);
  const [planAdherenceAnalysis, setPlanAdherenceAnalysis] = useState(null);
  const [assetComparison, setAssetComparison] = useState(null);
  const [assetCorrelation, setAssetCorrelation] = useState(null);
  const [marketStrategy, setMarketStrategy] = useState(null);

  // Load setup types and symbols on component mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const setupTypesResponse = await tradeService.getSetupTypes();
        setSetupTypes(setupTypesResponse);
        
        const symbolsResponse = await tradeService.getSymbols();
        setSymbols(symbolsResponse);
        
        const assetTypesResponse = await assetService.getAssetTypes();
        setAssetTypes(assetTypesResponse);
      } catch (err) {
        console.error('Error loading filters:', err);
        setError('Failed to load filters. Please try again later.');
      }
    };
    
    loadFilters();
  }, []);

  // Load statistics data when filters change
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          symbol: symbol || undefined,
          setup_type: setupType || undefined,
          page: page,
          page_size: pageSize
        };
        
        // Load the statistics based on the current tab to minimize unnecessary API calls
        switch (currentTab) {
          case 0: // Overview
          case 1: // Win Rate by Setup
          case 2: // Profitability by Time
          case 3: // Risk/Reward Analysis
          case 4: // Emotional Analysis
          case 5: // Plan Adherence
            // Load overall statistics
            const overallStatsResponse = await statisticsService.getStatistics(params);
            setOverallStats(overallStatsResponse);
            
            // Load win rate by setup
            const winRateBySetupResponse = await statisticsService.getWinRateBySetup(params);
            setWinRateBySetup(winRateBySetupResponse);
            
            // Load profitability by time
            const profitabilityByTimeResponse = await statisticsService.getProfitabilityByTime(params);
            setProfitabilityByTime(profitabilityByTimeResponse);
            
            // Load risk reward analysis
            const riskRewardResponse = await statisticsService.getRiskRewardAnalysis(params);
            setRiskRewardAnalysis(riskRewardResponse);
            
            // Load emotional analysis
            const emotionalResponse = await statisticsService.getEmotionalAnalysis(params);
            setEmotionalAnalysis(emotionalResponse);
            
            // Load plan adherence analysis
            const planAdherenceResponse = await statisticsService.getPlanAdherenceAnalysis(params);
            setPlanAdherenceAnalysis(planAdherenceResponse);
            break;
          
          case 6: // Asset Comparison
            // Load asset comparison data
            const assetComparisonResponse = await statisticsService.getAssetComparison({
              ...params,
              asset_types: assetType || undefined
            });
            setAssetComparison(assetComparisonResponse);
            break;
          
          case 7: // Asset Correlation
            // Load asset correlation data
            const assetCorrelationResponse = await statisticsService.getAssetCorrelation({
              ...params,
              symbols: selectedSymbols.length > 0 ? selectedSymbols.join(',') : undefined
            });
            setAssetCorrelation(assetCorrelationResponse);
            break;
          
          case 8: // Market Strategy Analysis
            // Load market strategy data
            const marketStrategyResponse = await statisticsService.getMarketStrategyPerformance({
              ...params,
              asset_type: assetType || undefined
            });
            setMarketStrategy(marketStrategyResponse);
            break;
          
          default:
            break;
        }
        
      } catch (err) {
        console.error('Error loading statistics:', err);
        setError('Failed to load statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadStatistics();
  }, [startDate, endDate, symbol, setupType, assetType, selectedSymbols, currentTab, page, pageSize]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPage(1); // Reset pagination when changing tabs
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(event.target.value);
    setPage(1); // Reset to first page when changing page size
  };

  const handleSymbolSelectionChange = (event) => {
    setSelectedSymbols(event.target.value);
  };

  const handleExport = async (format) => {
    try {
      setLoading(true);
      
      const params = {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        symbol: symbol || undefined,
        setup_type: setupType || undefined,
        asset_type: assetType || undefined
      };
      
      const blob = await statisticsService.exportStatistics(format, params);
      
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading-statistics.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
    } catch (err) {
      console.error('Error exporting statistics:', err);
      setError(`Failed to export statistics as ${format.toUpperCase()}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  // Memoize filter UI based on current tab
  const renderFilters = useMemo(() => {
    return (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={currentTab >= 6 ? 2 : 3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slots={{
                  textField: (params) => <TextField {...params} fullWidth />
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={currentTab >= 6 ? 2 : 3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slots={{
                  textField: (params) => <TextField {...params} fullWidth />
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          {/* Conditional filters based on tab */}
          {currentTab <= 5 && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  label="Symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="">All Symbols</MenuItem>
                  {symbols.map((sym) => (
                    <MenuItem key={sym} value={sym}>
                      {sym}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  label="Setup Type"
                  value={setupType}
                  onChange={(e) => setSetupType(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="">All Setups</MenuItem>
                  {setupTypes.map((setup) => (
                    <MenuItem key={setup} value={setup}>
                      {setup}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </>
          )}
          
          {/* Asset comparison filters */}
          {currentTab === 6 && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  label="Asset Type"
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="">All Asset Types</MenuItem>
                  {assetTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  label="Symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="">All Symbols</MenuItem>
                  {symbols.map((sym) => (
                    <MenuItem key={sym} value={sym}>
                      {sym}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </>
          )}
          
          {/* Asset correlation filters */}
          {currentTab === 7 && (
            <Grid item xs={12} sm={12} md={8}>
              <FormControl fullWidth>
                <InputLabel id="symbols-select-label">Select Symbols for Correlation Analysis</InputLabel>
                <Select
                  labelId="symbols-select-label"
                  multiple
                  value={selectedSymbols}
                  onChange={handleSymbolSelectionChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {symbols.map((sym) => (
                    <MenuItem key={sym} value={sym}>
                      {sym}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          {/* Market strategy filters */}
          {currentTab === 8 && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  label="Asset Type"
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="">All Market Types</MenuItem>
                  {assetTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  label="Setup Type"
                  value={setupType}
                  onChange={(e) => setSetupType(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="">All Strategies</MenuItem>
                  {setupTypes.map((setup) => (
                    <MenuItem key={setup} value={setup}>
                      {setup}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </>
          )}
          
          {/* Export buttons and pagination */}
          <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              {/* Pagination controls for large datasets */}
              {totalItems > pageSize && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    Page Size:
                  </Typography>
                  <TextField
                    select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    variant="outlined"
                    size="small"
                    sx={{ width: 80, mr: 2 }}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </TextField>
                  <Pagination 
                    count={Math.ceil(totalItems / pageSize)} 
                    page={page} 
                    onChange={handlePageChange} 
                    color="primary" 
                    size="small"
                  />
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => handleExport('csv')}
                disabled={loading}
              >
                Export as CSV
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => handleExport('pdf')}
                disabled={loading}
              >
                Export as PDF
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  }, [currentTab, startDate, endDate, symbol, setupType, assetType, selectedSymbols, symbols, setupTypes, assetTypes, loading, page, pageSize, totalItems]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trading Statistics
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Analyze your trading performance with detailed statistics and charts.
        </Typography>
      </Box>
      
      {/* Filters */}
      {renderFilters}
      
      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {/* Statistics Content */}
      {!loading && !error && (
        <>
          {/* Overview Statistics */}
          {currentTab <= 5 && overallStats && (
            <OverviewStats stats={overallStats} />
          )}
          
          {/* Tabs for Different Statistics Views */}
          <Box sx={{ width: '100%', mt: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange} 
                variant="scrollable"
                scrollButtons="auto"
                aria-label="statistics tabs"
              >
                <Tab label="Overview" />
                <Tab label="Win Rate by Setup" />
                <Tab label="Profitability by Time" />
                <Tab label="Risk/Reward Analysis" />
                <Tab label="Emotional Analysis" />
                <Tab label="Plan Adherence" />
                <Tab label="Asset Comparison" />
                <Tab label="Asset Correlation" />
                <Tab label="Market Strategy" />
              </Tabs>
            </Box>
            
            <TabPanel value={currentTab} index={0}>
              {/* Overview panel - already shown above */}
              <Typography variant="h6" gutterBottom>
                Overview Performance
              </Typography>
              <Typography variant="body2" paragraph>
                The dashboard above shows your overall trading performance metrics. Select other tabs to see more detailed analysis.
              </Typography>
            </TabPanel>
            
            <TabPanel value={currentTab} index={1}>
              <WinRateBySetupChart data={winRateBySetup} />
            </TabPanel>
            
            <TabPanel value={currentTab} index={2}>
              <ProfitabilityByTimeChart data={profitabilityByTime} />
            </TabPanel>
            
            <TabPanel value={currentTab} index={3}>
              <RiskRewardAnalysis data={riskRewardAnalysis} />
            </TabPanel>
            
            <TabPanel value={currentTab} index={4}>
              <EmotionalAnalysis data={emotionalAnalysis} />
            </TabPanel>
            
            <TabPanel value={currentTab} index={5}>
              <PlanAdherenceAnalysis data={planAdherenceAnalysis} />
            </TabPanel>
            
            <TabPanel value={currentTab} index={6}>
              <AssetComparison data={assetComparison} loading={loading} />
            </TabPanel>
            
            <TabPanel value={currentTab} index={7}>
              <AssetCorrelation data={assetCorrelation} loading={loading} />
            </TabPanel>
            
            <TabPanel value={currentTab} index={8}>
              <MarketStrategyAnalysis data={marketStrategy} loading={loading} />
            </TabPanel>
          </Box>
        </>
      )}
    </Container>
  );
};

export default StatisticsPage;