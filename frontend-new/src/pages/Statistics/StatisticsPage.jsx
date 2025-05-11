import React, { useState, useEffect } from 'react';
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
  Tab
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, subDays } from 'date-fns';

import statisticsService from '../../services/statisticsService';
import tradeService from '../../services/tradeService';

// Import statistics components
import OverviewStats from './components/OverviewStats';
import WinRateBySetupChart from './components/WinRateBySetupChart';
import ProfitabilityByTimeChart from './components/ProfitabilityByTimeChart';
import RiskRewardAnalysis from './components/RiskRewardAnalysis';
import PlanAdherenceAnalysis from './components/PlanAdherenceAnalysis';
import EmotionalAnalysis from './components/EmotionalAnalysis';

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
  
  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for tab management
  const [currentTab, setCurrentTab] = useState(0);
  
  // State for statistics data
  const [overallStats, setOverallStats] = useState(null);
  const [winRateBySetup, setWinRateBySetup] = useState([]);
  const [profitabilityByTime, setProfitabilityByTime] = useState([]);
  const [riskRewardAnalysis, setRiskRewardAnalysis] = useState(null);
  const [emotionalAnalysis, setEmotionalAnalysis] = useState(null);
  const [planAdherenceAnalysis, setPlanAdherenceAnalysis] = useState(null);

  // Load setup types and symbols on component mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const setupTypesResponse = await tradeService.getSetupTypes();
        setSetupTypes(setupTypesResponse);
        
        const symbolsResponse = await tradeService.getSymbols();
        setSymbols(symbolsResponse);
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
          setup_type: setupType || undefined
        };
        
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
        
      } catch (err) {
        console.error('Error loading statistics:', err);
        setError('Failed to load statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadStatistics();
  }, [startDate, endDate, symbol, setupType]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleExport = async (format) => {
    try {
      setLoading(true);
      
      const params = {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        symbol: symbol || undefined,
        setup_type: setupType || undefined
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
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
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
          <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
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
          </Grid>
        </Grid>
      </Paper>
      
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
          {overallStats && (
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
                <Tab label="Win Rate by Setup" />
                <Tab label="Profitability by Time" />
                <Tab label="Risk/Reward Analysis" />
                <Tab label="Emotional Analysis" />
                <Tab label="Plan Adherence" />
              </Tabs>
            </Box>
            
            <TabPanel value={currentTab} index={0}>
              <WinRateBySetupChart data={winRateBySetup} />
            </TabPanel>
            
            <TabPanel value={currentTab} index={1}>
              <ProfitabilityByTimeChart data={profitabilityByTime} />
            </TabPanel>
            
            <TabPanel value={currentTab} index={2}>
              <RiskRewardAnalysis data={riskRewardAnalysis} />
            </TabPanel>
            
            <TabPanel value={currentTab} index={3}>
              <EmotionalAnalysis data={emotionalAnalysis} />
            </TabPanel>
            
            <TabPanel value={currentTab} index={4}>
              <PlanAdherenceAnalysis data={planAdherenceAnalysis} />
            </TabPanel>
          </Box>
        </>
      )}
    </Container>
  );
};

export default StatisticsPage;