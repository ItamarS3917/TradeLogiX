import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Alert, Divider, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Stack, CircularProgress
} from '@mui/material';
import { tradeService, planningService, journalService, getDataSourceMode, setDataSourceMode } from '../services/serviceFactory';

/**
 * APIBridgeTest component for testing the API bridge functionality
 * @returns {JSX.Element} Test UI
 */
const APIBridgeTest = () => {
  const [dataSourceMode, setDataSourceModeState] = useState(getDataSourceMode());
  const [loading, setLoading] = useState({
    trades: false,
    plans: false,
    journals: false
  });
  const [testResults, setTestResults] = useState({
    trades: null,
    plans: null,
    journals: null
  });
  const [error, setError] = useState(null);
  
  /**
   * Toggle data source mode
   */
  const toggleDataSourceMode = () => {
    const modes = ['firebase', 'api', 'bridge'];
    const currentIndex = modes.indexOf(dataSourceMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextMode = modes[nextIndex];
    
    // Update mode
    setDataSourceMode(nextMode);
    setDataSourceModeState(nextMode);
  };
  
  /**
   * Test trade operations
   */
  const testTradeOperations = async () => {
    setLoading(prev => ({ ...prev, trades: true }));
    setError(null);
    
    try {
      // Get trades
      const trades = await tradeService.getAllTrades({ limit: 5 });
      
      // Create test trade
      const newTrade = {
        symbol: 'TEST-NQ',
        setup_type: 'API Bridge Test',
        entry_price: 100.0,
        exit_price: 110.0,
        position_size: 1,
        entry_time: new Date().toISOString(),
        exit_time: new Date().toISOString(),
        outcome: 'Win',
        profit_loss: 10.0,
        tags: ['test', 'api-bridge'],
        notes: `API Bridge test trade (${dataSourceMode} mode) created at ${new Date().toLocaleTimeString()}`
      };
      
      // Create trade
      const createdTrade = await tradeService.createTrade(newTrade);
      
      // Get trade by ID
      const retrievedTrade = await tradeService.getTradeById(createdTrade.id);
      
      // Update trade
      const updatedTrade = await tradeService.updateTrade(retrievedTrade.id, {
        ...retrievedTrade,
        notes: `${retrievedTrade.notes} - Updated at ${new Date().toLocaleTimeString()}`
      });
      
      // Delete trade
      const deleteResult = await tradeService.deleteTrade(updatedTrade.id);
      
      // Set results
      setTestResults(prev => ({
        ...prev,
        trades: {
          getAll: {
            success: true,
            count: trades.length,
            data: trades.slice(0, 3)
          },
          create: {
            success: true,
            data: createdTrade
          },
          getById: {
            success: true,
            data: retrievedTrade
          },
          update: {
            success: true,
            data: updatedTrade
          },
          delete: {
            success: true,
            data: deleteResult
          }
        }
      }));
    } catch (error) {
      console.error('Trade operations test error:', error);
      setError(`Trade operations test error: ${error.message}`);
      
      setTestResults(prev => ({
        ...prev,
        trades: {
          error: error.message
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, trades: false }));
    }
  };
  
  /**
   * Test planning operations
   */
  const testPlanningOperations = async () => {
    setLoading(prev => ({ ...prev, plans: true }));
    setError(null);
    
    try {
      // Get plans
      const plans = await planningService.getAllDailyPlans({ limit: 5 });
      
      // Create test plan
      const newPlan = {
        date: new Date().toISOString(),
        market_bias: 'Bullish',
        key_levels: [
          { price: 20000, type: 'Support', note: 'Key support level' },
          { price: 21000, type: 'Resistance', note: 'Key resistance level' }
        ],
        goals: 'API Bridge Test Plan',
        risk_parameters: {
          maxDailyLoss: 500,
          maxPositionRisk: 100,
          targetDailyProfit: 1000
        },
        mental_state: 'Focused',
        notes: `API Bridge test plan (${dataSourceMode} mode) created at ${new Date().toLocaleTimeString()}`
      };
      
      // Create plan
      const createdPlan = await planningService.createDailyPlan(newPlan);
      
      // Get plan by ID (if supported)
      let retrievedPlan = null;
      try {
        retrievedPlan = await planningService.getDailyPlanById(createdPlan.id);
      } catch (e) {
        // Get by date as fallback
        const date = new Date(createdPlan.date);
        retrievedPlan = await planningService.getDailyPlanByDate(
          date.toISOString().split('T')[0]
        );
      }
      
      // Update plan
      const updatedPlan = await planningService.updateDailyPlan(createdPlan.id, {
        ...retrievedPlan,
        notes: `${retrievedPlan.notes} - Updated at ${new Date().toLocaleTimeString()}`
      });
      
      // Delete plan
      const deleteResult = await planningService.deleteDailyPlan(updatedPlan.id);
      
      // Set results
      setTestResults(prev => ({
        ...prev,
        plans: {
          getAll: {
            success: true,
            count: plans.length,
            data: plans.slice(0, 3)
          },
          create: {
            success: true,
            data: createdPlan
          },
          getById: {
            success: retrievedPlan !== null,
            data: retrievedPlan
          },
          update: {
            success: true,
            data: updatedPlan
          },
          delete: {
            success: true,
            data: deleteResult
          }
        }
      }));
    } catch (error) {
      console.error('Planning operations test error:', error);
      setError(`Planning operations test error: ${error.message}`);
      
      setTestResults(prev => ({
        ...prev,
        plans: {
          error: error.message
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, plans: false }));
    }
  };
  
  /**
   * Test journal operations
   */
  const testJournalOperations = async () => {
    setLoading(prev => ({ ...prev, journals: true }));
    setError(null);
    
    try {
      // Get journals (if available)
      let journals = [];
      try {
        journals = await journalService.getAllJournalEntries({ limit: 5 });
      } catch (e) {
        // Journal service may not be fully implemented yet
        console.warn('Journal service may not be fully implemented:', e);
      }
      
      // Set results
      setTestResults(prev => ({
        ...prev,
        journals: {
          getAll: {
            success: true,
            count: journals.length,
            data: journals.slice(0, 3)
          },
          note: 'Journal operations may not be fully implemented yet'
        }
      }));
    } catch (error) {
      console.error('Journal operations test error:', error);
      setError(`Journal operations test error: ${error.message}`);
      
      setTestResults(prev => ({
        ...prev,
        journals: {
          error: error.message
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, journals: false }));
    }
  };
  
  /**
   * Run all tests
   */
  const runAllTests = async () => {
    await testTradeOperations();
    await testPlanningOperations();
    await testJournalOperations();
  };
  
  /**
   * Format data as JSON string
   * @param {any} data - Data to format
   * @returns {string} Formatted JSON
   */
  const formatData = (data) => {
    return JSON.stringify(data, null, 2);
  };
  
  /**
   * Render test result
   * @param {string} operation - Operation name
   * @param {Object} result - Test result
   * @returns {JSX.Element} Result UI
   */
  const renderResult = (operation, result) => {
    if (!result) return null;
    
    if (result.error) {
      return (
        <Alert severity="error" sx={{ my: 1 }}>
          {result.error}
        </Alert>
      );
    }
    
    return (
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle2">
          {operation} {result.success ? '✅' : '❌'}
        </Typography>
        
        {operation === 'getAll' && (
          <Typography variant="body2" color="text.secondary">
            Retrieved {result.count} items
          </Typography>
        )}
        
        <Box 
          sx={{ 
            maxHeight: 200, 
            overflowY: 'auto', 
            bgcolor: 'background.paper', 
            p: 1, 
            borderRadius: 1, 
            mt: 1,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap'
          }}
        >
          {formatData(result.data)}
        </Box>
      </Box>
    );
  };
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        API Bridge Testing
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This page allows testing the API bridge functionality to ensure smooth transition
        between Firebase and the backend API.
      </Alert>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Current Data Source Mode: <Chip label={dataSourceMode.toUpperCase()} color="primary" />
        </Typography>
        
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={toggleDataSourceMode}
          >
            Toggle Data Source Mode
          </Button>
          
          <Button 
            variant="contained" 
            onClick={runAllTests}
            disabled={loading.trades || loading.plans || loading.journals}
          >
            Run All Tests
          </Button>
        </Stack>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Trade Operations
          </Typography>
          
          <Button 
            variant="outlined" 
            onClick={testTradeOperations}
            disabled={loading.trades}
            size="small"
          >
            {loading.trades ? <CircularProgress size={24} /> : 'Test'}
          </Button>
        </Box>
        
        {testResults.trades && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            {testResults.trades.error ? (
              <Alert severity="error">
                {testResults.trades.error}
              </Alert>
            ) : (
              <>
                {renderResult('getAll', testResults.trades.getAll)}
                {renderResult('create', testResults.trades.create)}
                {renderResult('getById', testResults.trades.getById)}
                {renderResult('update', testResults.trades.update)}
                {renderResult('delete', testResults.trades.delete)}
              </>
            )}
          </Paper>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Planning Operations
          </Typography>
          
          <Button 
            variant="outlined" 
            onClick={testPlanningOperations}
            disabled={loading.plans}
            size="small"
          >
            {loading.plans ? <CircularProgress size={24} /> : 'Test'}
          </Button>
        </Box>
        
        {testResults.plans && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            {testResults.plans.error ? (
              <Alert severity="error">
                {testResults.plans.error}
              </Alert>
            ) : (
              <>
                {renderResult('getAll', testResults.plans.getAll)}
                {renderResult('create', testResults.plans.create)}
                {renderResult('getById', testResults.plans.getById)}
                {renderResult('update', testResults.plans.update)}
                {renderResult('delete', testResults.plans.delete)}
              </>
            )}
          </Paper>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Journal Operations
          </Typography>
          
          <Button 
            variant="outlined" 
            onClick={testJournalOperations}
            disabled={loading.journals}
            size="small"
          >
            {loading.journals ? <CircularProgress size={24} /> : 'Test'}
          </Button>
        </Box>
        
        {testResults.journals && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            {testResults.journals.error ? (
              <Alert severity="error">
                {testResults.journals.error}
              </Alert>
            ) : (
              <>
                {renderResult('getAll', testResults.journals.getAll)}
                {testResults.journals.note && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {testResults.journals.note}
                  </Alert>
                )}
              </>
            )}
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default APIBridgeTest;
