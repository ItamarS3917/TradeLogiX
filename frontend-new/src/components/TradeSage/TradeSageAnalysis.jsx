import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Divider, 
  Grid,
  Chip,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BatchPredictionIcon from '@mui/icons-material/BatchPrediction';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BiotechIcon from '@mui/icons-material/Biotech';

import PatternVisualizer from './PatternVisualizer';
import { tradeSageService } from '../../services/tradeSageService';

/**
 * TradeSage AI Analysis component
 */
const TradeSageAnalysis = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [improvementPlan, setImprovementPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Fetch initial analysis
  useEffect(() => {
    if (userId) {
      fetchTradingAnalysis();
    }
  }, [userId]);

  // Fetch trading analysis data
  const fetchTradingAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tradeSageService.analyzePatterns(userId);
      setAnalysis(response);
    } catch (err) {
      console.error('Error fetching trading analysis:', err);
      setError('Failed to fetch trading analysis. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch improvement plan
  const fetchImprovementPlan = async () => {
    if (improvementPlan) return; // Already loaded

    try {
      setLoadingPlan(true);
      setError(null);
      
      const response = await tradeSageService.getImprovementPlan(userId);
      setImprovementPlan(response);
    } catch (err) {
      console.error('Error fetching improvement plan:', err);
      setError('Failed to fetch improvement plan. Please try again later.');
    } finally {
      setLoadingPlan(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 2 && !improvementPlan) {
      fetchImprovementPlan();
    }
  };

  // If loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Analyzing your trading data...
        </Typography>
      </Box>
    );
  }

  // If error
  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          <Button color="inherit" size="small" onClick={fetchTradingAnalysis}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  // If no analysis data
  if (!analysis) {
    return (
      <Alert 
        severity="info" 
        sx={{ mb: 2 }}
        action={
          <Button color="inherit" size="small" onClick={fetchTradingAnalysis}>
            Analyze Now
          </Button>
        }
      >
        No trading analysis available. Click "Analyze Now" to analyze your trading data.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PsychologyIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5">TradeSage Analysis</Typography>
          {analysis.mcp_enhanced && (
            <Chip 
              label="MCP Enhanced" 
              size="small" 
              color="primary" 
              sx={{ ml: 2 }} 
              icon={<BiotechIcon />}
            />
          )}
        </Box>
        <Tooltip title="Refresh Analysis">
          <IconButton onClick={fetchTradingAnalysis} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <SummarizeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Analysis Summary
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {analysis.summary}
          </Typography>
          
          {/* Recommendation highlights */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LightbulbIcon sx={{ mr: 1, color: 'warning.main' }} />
                  Key Recommendations
                </Typography>
                <List dense>
                  {analysis.recommendations.slice(0, 3).map((recommendation, index) => (
                    <ListItem key={`rec-${index}`} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <TipsAndUpdatesIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={recommendation} />
                    </ListItem>
                  ))}
                </List>
                {analysis.recommendations.length > 3 && (
                  <Button 
                    size="small" 
                    sx={{ mt: 1 }}
                    onClick={() => setActiveTab(1)}
                  >
                    View All ({analysis.recommendations.length}) Recommendations
                  </Button>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabs for detailed analysis */}
      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab 
            icon={<AnalyticsIcon />} 
            label="Pattern Analysis" 
            iconPosition="start"
          />
          <Tab 
            icon={<TipsAndUpdatesIcon />} 
            label="Recommendations" 
            iconPosition="start"
          />
          <Tab 
            icon={<TrendingUpIcon />} 
            label="Improvement Plan" 
            iconPosition="start"
          />
          <Tab 
            icon={<BatchPredictionIcon />} 
            label="Insights" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ p: 1 }}>
        {/* Pattern Analysis Tab */}
        {activeTab === 0 && (
          <Box>
            {/* Complex patterns from MCP */}
            {analysis.complex_patterns && analysis.complex_patterns.length > 0 && (
              <PatternVisualizer 
                patterns={analysis.complex_patterns} 
                title="Advanced Trading Patterns (MCP Enhanced)"
              />
            )}
            
            {/* Standard patterns */}
            {analysis.patterns && analysis.patterns.length > 0 && (
              <PatternVisualizer 
                patterns={analysis.patterns} 
                title="Standard Trading Patterns"
              />
            )}
            
            {(!analysis.patterns || analysis.patterns.length === 0) && 
             (!analysis.complex_patterns || analysis.complex_patterns.length === 0) && (
              <Alert severity="info">
                No significant patterns detected in your trading data. Continue adding more trades for enhanced analysis.
              </Alert>
            )}
          </Box>
        )}

        {/* Recommendations Tab */}
        {activeTab === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LightbulbIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'warning.main' }} />
                Trading Recommendations
              </Typography>
              {analysis.recommendations && analysis.recommendations.length > 0 ? (
                <List>
                  {analysis.recommendations.map((recommendation, index) => (
                    <ListItem key={`full-rec-${index}`} divider={index < analysis.recommendations.length - 1}>
                      <ListItemIcon>
                        <TipsAndUpdatesIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={recommendation} 
                        secondary={`Recommendation #${index + 1}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  No specific recommendations available. Add more trading data for personalized recommendations.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Improvement Plan Tab */}
        {activeTab === 2 && (
          <Box>
            {loadingPlan ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : improvementPlan ? (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    Trading Improvement Plan
                    {improvementPlan.mcp_enhanced && (
                      <Chip 
                        label="MCP Enhanced" 
                        size="small" 
                        color="primary" 
                        sx={{ ml: 2 }} 
                        icon={<BiotechIcon />}
                      />
                    )}
                  </Typography>
                  
                  {/* Strengths & Weaknesses */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                        <Typography variant="subtitle1" color="success.main" gutterBottom>
                          Your Trading Strengths
                        </Typography>
                        <List dense>
                          {improvementPlan.strengths.map((strength, index) => (
                            <ListItem key={`strength-${index}`} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <TrendingUpIcon fontSize="small" color="success" />
                              </ListItemIcon>
                              <ListItemText primary={strength} />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                        <Typography variant="subtitle1" color="error.main" gutterBottom>
                          Areas for Improvement
                        </Typography>
                        <List dense>
                          {improvementPlan.weaknesses.map((weakness, index) => (
                            <ListItem key={`weakness-${index}`} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <TrendingUpIcon fontSize="small" color="error" />
                              </ListItemIcon>
                              <ListItemText primary={weakness} />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  {/* Improvement Plan */}
                  <Typography variant="subtitle1" gutterBottom>
                    Implementation Plan
                  </Typography>
                  
                  {/* Short Term */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Short Term Actions (Next 2 Weeks)
                    </Typography>
                    <List dense>
                      {improvementPlan.plan.shortTerm && improvementPlan.plan.shortTerm.map((item, index) => (
                        <ListItem key={`short-${index}`} sx={{ py: 0.5 }}>
                          <ListItemText 
                            primary={item.action}
                            secondary={`Timeframe: ${item.timeframe} | Measurable: ${item.measurable}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                  
                  {/* Medium Term */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Medium Term Actions (1-3 Months)
                    </Typography>
                    <List dense>
                      {improvementPlan.plan.mediumTerm && improvementPlan.plan.mediumTerm.map((item, index) => (
                        <ListItem key={`medium-${index}`} sx={{ py: 0.5 }}>
                          <ListItemText 
                            primary={item.action}
                            secondary={`Timeframe: ${item.timeframe} | Measurable: ${item.measurable}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                  
                  {/* Long Term */}
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Long Term Actions (3+ Months)
                    </Typography>
                    <List dense>
                      {improvementPlan.plan.longTerm && improvementPlan.plan.longTerm.map((item, index) => (
                        <ListItem key={`long-${index}`} sx={{ py: 0.5 }}>
                          <ListItemText 
                            primary={item.action}
                            secondary={`Timeframe: ${item.timeframe} | Measurable: ${item.measurable}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                  
                  {/* Timeline */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      {improvementPlan.timeline}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Alert severity="info">
                Failed to load improvement plan. Please try again later.
              </Alert>
            )}
          </Box>
        )}

        {/* Insights Tab */}
        {activeTab === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BatchPredictionIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Trading Insights
              </Typography>
              
              {analysis.insights && analysis.insights.length > 0 ? (
                <Grid container spacing={2}>
                  {analysis.insights.map((insight, index) => (
                    <Grid item xs={12} sm={6} md={4} key={`insight-${index}`}>
                      <Paper
                        variant="outlined"
                        sx={{ 
                          p: 2, 
                          height: '100%',
                          position: 'relative',
                          '&:hover': { boxShadow: 1 }
                        }}
                      >
                        {insight.confidence && (
                          <Chip 
                            label={`${Math.round(insight.confidence * 100)}%`}
                            size="small"
                            color={insight.confidence > 0.7 ? "success" : "primary"}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                          />
                        )}
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          {insight.name || `Insight #${index + 1}`}
                        </Typography>
                        <Typography variant="body2">
                          {insight.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  No specific insights available. Add more trading data for personalized insights.
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default TradeSageAnalysis;
