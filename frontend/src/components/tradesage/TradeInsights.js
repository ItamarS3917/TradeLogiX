import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Chip, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert as MuiAlert
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Psychology,
  AccessTime,
  ShowChart,
  Insights,
  InfoOutlined,
  ExpandMore,
  ExpandLess,
  StarOutline,
  Star
} from '@mui/icons-material';

// Import services
import { getInsightsForTrade, saveInsight } from '../../services/tradesage_service';

/**
 * Component that displays AI-generated insights for a specific trade
 * or for overall trading patterns
 */
const TradeInsights = ({ tradeId, showGeneral = false }) => {
  // State
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedInsight, setExpandedInsight] = useState(null);
  
  // Fetch insights on component mount or when tradeId changes
  useEffect(() => {
    fetchInsights();
  }, [tradeId, showGeneral]);
  
  // Fetch insights from API
  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedInsights = await getInsightsForTrade(tradeId, showGeneral);
      setInsights(fetchedInsights);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError('Failed to fetch insights. Please try again later.');
      setLoading(false);
    }
  };
  
  // Toggle expanded state for an insight
  const toggleExpand = (insightId) => {
    if (expandedInsight === insightId) {
      setExpandedInsight(null);
    } else {
      setExpandedInsight(insightId);
    }
  };
  
  // Save an insight as favorite
  const toggleFavorite = async (insightId) => {
    try {
      // Find the insight to toggle
      const insightToToggle = insights.find(insight => insight.id === insightId);
      if (!insightToToggle) return;
      
      // Update local state optimistically
      const updatedInsights = insights.map(insight => {
        if (insight.id === insightId) {
          return { ...insight, favorite: !insight.favorite };
        }
        return insight;
      });
      
      setInsights(updatedInsights);
      
      // Send update to server
      await saveInsight(insightId, { favorite: !insightToToggle.favorite });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      
      // Revert the optimistic update if there was an error
      fetchInsights();
    }
  };
  
  // Get icon for insight category
  const getInsightIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'performance':
        return <ShowChart color="primary" />;
      case 'pattern':
        return <TrendingUp color="success" />;
      case 'psychological':
        return <Psychology color="warning" />;
      case 'timing':
        return <AccessTime color="info" />;
      default:
        return <Insights color="secondary" />;
    }
  };
  
  // Get chip color for confidence level
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'info';
    if (confidence >= 40) return 'warning';
    return 'default';
  };
  
  // If loading, show loading indicator
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <MuiAlert severity="error" sx={{ mb: 2 }}>
          {error}
        </MuiAlert>
      </Box>
    );
  }
  
  // If no insights, show message
  if (!insights || insights.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          No insights available yet. TradeSage needs more trading data to generate meaningful insights.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" gutterBottom>
        {showGeneral ? 'Trading Pattern Insights' : 'Trade-Specific Insights'}
      </Typography>
      
      <List sx={{ width: '100%' }}>
        {insights.map((insight) => (
          <Card key={insight.id} sx={{ mb: 2, boxShadow: 2 }}>
            <CardHeader
              avatar={getInsightIcon(insight.category)}
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">{insight.title}</Typography>
                  <Chip 
                    label={`${insight.confidence}% confidence`} 
                    size="small" 
                    color={getConfidenceColor(insight.confidence)}
                    sx={{ height: 20 }}
                  />
                </Box>
              }
              action={
                <Box sx={{ display: 'flex' }}>
                  <Tooltip title={insight.favorite ? 'Remove from favorites' : 'Add to favorites'}>
                    <IconButton onClick={() => toggleFavorite(insight.id)}>
                      {insight.favorite ? <Star color="warning" /> : <StarOutline />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Toggle details">
                    <IconButton onClick={() => toggleExpand(insight.id)}>
                      {expandedInsight === insight.id ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Tooltip>
                </Box>
              }
              subheader={
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip 
                    label={insight.category} 
                    size="small" 
                    sx={{ mr: 1, height: 20 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Generated on {new Date(insight.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              }
              sx={{ pb: 0 }}
            />
            
            {expandedInsight === insight.id && (
              <CardContent sx={{ pt: 0 }}>
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {insight.description}
                </Typography>
                
                {insight.recommendations && insight.recommendations.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Recommendations:
                    </Typography>
                    <List dense disablePadding>
                      {insight.recommendations.map((rec, index) => (
                        <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {rec.impact === 'high' ? (
                              <TrendingUp color="success" fontSize="small" />
                            ) : rec.impact === 'low' ? (
                              <TrendingDown color="error" fontSize="small" />
                            ) : (
                              <InfoOutlined color="info" fontSize="small" />
                            )}
                          </ListItemIcon>
                          <ListItemText primary={rec.text} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                
                {insight.related_data && (
                  <Box sx={{ mt: 2, pt: 1, borderTop: '1px dashed rgba(0, 0, 0, 0.12)' }}>
                    <Typography variant="caption" color="text.secondary">
                      Based on analysis of {insight.related_data.trade_count} trades over {insight.related_data.time_period}.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </List>
    </Box>
  );
};

export default TradeInsights;
