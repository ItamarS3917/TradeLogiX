import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  Button,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
  alpha,
  LinearProgress,
  Fade,
  Zoom,
  Skeleton
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Insights as InsightsIcon,
  AutoAwesome as SparklesIcon,
  LightbulbOutlined as LightbulbIcon,
  ShowChart as ChartIcon,
  Schedule as TimeIcon,
  MonetizationOn as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Favorite as FavoriteIcon,
  EmojiObjects as IdeaIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import tradesageService from '../../services/tradeSageService';

/**
 * TradeSage AI Insights Panel Component
 * 
 * Displays AI-generated trading insights, patterns, and recommendations
 * directly in the dashboard for quick access to actionable intelligence.
 */
const TradeSageInsightsPanel = ({ 
  maxInsights = 5,
  refreshInterval = 300000, // 5 minutes
  enableAutoRefresh = true,
  onInsightClick,
  compact = false,
  showActions = true
}) => {
  const theme = useTheme();
  const { user } = useAuth();
  
  // State management
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedInsights, setExpandedInsights] = useState(new Set());
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch insights from TradeSage
  const fetchInsights = useCallback(async (isRefresh = false) => {
    if (!user?.uid) return;
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      // Get recent trading patterns and performance
      const [patternAnalysis, improvementPlan, tradeComparison] = await Promise.allSettled([
        tradesageService.analyzePatterns({ 
          user_id: user.uid,
          days_back: 30,
          min_trades: 5
        }),
        tradesageService.generateImprovementPlan(user.uid, true),
        tradesageService.compareWinningAndLosingTrades(user.uid)
      ]);
      
      // Process and combine insights
      const processedInsights = [];
      
      // Add pattern analysis insights
      if (patternAnalysis.status === 'fulfilled' && patternAnalysis.value.insights) {
        patternAnalysis.value.insights.forEach((insight, index) => {
          processedInsights.push({
            id: `pattern-${index}`,
            type: 'pattern',
            title: insight.title || 'Pattern Detected',
            content: insight.description || insight.content,
            confidence: insight.confidence || 0.8,
            actionable: insight.actionable || false,
            category: insight.category || 'performance',
            timestamp: new Date(),
            icon: getInsightIcon(insight.category),
            color: getInsightColor(insight.category, insight.confidence),
            priority: insight.priority || 'medium'
          });
        });
      }
      
      // Add improvement plan insights
      if (improvementPlan.status === 'fulfilled' && improvementPlan.value.recommendations) {
        improvementPlan.value.recommendations.slice(0, 3).forEach((rec, index) => {
          processedInsights.push({
            id: `improvement-${index}`,
            type: 'improvement',
            title: rec.title || 'Improvement Opportunity',
            content: rec.description || rec.recommendation,
            confidence: rec.impact_score || 0.7,
            actionable: true,
            category: 'improvement',
            timestamp: new Date(),
            icon: <LightbulbIcon />,
            color: theme.palette.warning.main,
            priority: rec.priority || 'high'
          });
        });
      }
      
      // Add trade comparison insights
      if (tradeComparison.status === 'fulfilled' && tradeComparison.value.key_differences) {
        tradeComparison.value.key_differences.slice(0, 2).forEach((diff, index) => {
          processedInsights.push({
            id: `comparison-${index}`,
            type: 'comparison',
            title: diff.factor || 'Trading Pattern Difference',
            content: diff.insight || diff.description,
            confidence: diff.significance || 0.6,
            actionable: diff.actionable || true,
            category: 'analysis',
            timestamp: new Date(),
            icon: <AnalyticsIcon />,
            color: theme.palette.info.main,
            priority: 'medium'
          });
        });
      }
      
      // Sort by priority and confidence
      const sortedInsights = processedInsights
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority] || 2;
          const bPriority = priorityOrder[b.priority] || 2;
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }
          return b.confidence - a.confidence;
        })
        .slice(0, maxInsights);
      
      setInsights(sortedInsights);
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('Error fetching TradeSage insights:', err);
      setError('Failed to load AI insights. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, maxInsights]);
  
  // Initial load
  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);
  
  // Auto-refresh setup
  useEffect(() => {
    if (!enableAutoRefresh || !refreshInterval) return;
    
    const interval = setInterval(() => {
      fetchInsights(true);
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchInsights, enableAutoRefresh, refreshInterval]);
  
  // Get appropriate icon for insight category
  const getInsightIcon = (category) => {
    const iconMap = {
      performance: <ChartIcon />,
      timing: <TimeIcon />,
      risk: <WarningIcon />,
      psychology: <PsychologyIcon />,
      setup: <TrendingUpIcon />,
      improvement: <LightbulbIcon />,
      analysis: <AnalyticsIcon />,
      pattern: <TimelineIcon />
    };
    return iconMap[category] || <InsightsIcon />;
  };
  
  // Get appropriate color for insight
  const getInsightColor = (category, confidence) => {
    if (confidence >= 0.8) return theme.palette.success.main;
    if (confidence >= 0.6) return theme.palette.warning.main;
    return theme.palette.info.main;
  };
  
  // Toggle insight expansion
  const toggleInsightExpansion = (insightId) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
    }
    setExpandedInsights(newExpanded);
  };
  
  // Handle insight click
  const handleInsightClick = (insight) => {
    if (onInsightClick) {
      onInsightClick(insight);
    } else {
      // Default behavior - expand/collapse
      toggleInsightExpansion(insight.id);
    }
  };
  
  // Refresh button handler
  const handleRefresh = () => {
    fetchInsights(true);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
          background: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(8px)'
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <PsychologyIcon color="primary" />
            </Avatar>
          }
          title="TradeSage AI Insights"
          subheader="Analyzing your trading patterns..."
          action={
            <CircularProgress size={20} thickness={4} />
          }
        />
        <CardContent>
          <Box sx={{ space: 2 }}>
            {[1, 2, 3].map((item) => (
              <Box key={item} sx={{ mb: 2 }}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="rectangular" width="100%" height={40} sx={{ mt: 1, borderRadius: 1 }} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
          background: alpha(theme.palette.error.main, 0.05)
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
              <WarningIcon color="error" />
            </Avatar>
          }
          title="TradeSage AI Insights"
          subheader="Unable to load insights"
          action={
            <IconButton onClick={handleRefresh} color="error">
              <RefreshIcon />
            </IconButton>
          }
        />
        <CardContent>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Render insights
  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        background: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(12px)',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      {/* Refresh indicator */}
      {refreshing && (
        <LinearProgress 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            borderRadius: '12px 12px 0 0'
          }} 
        />
      )}
      
      <CardHeader
        avatar={
          <Avatar 
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            <PsychologyIcon color="primary" />
          </Avatar>
        }
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              TradeSage AI Insights
            </Typography>
            <Chip 
              icon={<SparklesIcon />}
              label="AI"
              size="small"
              color="primary"
              sx={{ 
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 700
              }}
            />
          </Box>
        }
        subheader={
          lastUpdate && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )
        }
        action={
          showActions && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Refresh insights">
                <IconButton 
                  size="small" 
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ pt: 0 }}>
        {insights.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Avatar 
              sx={{ 
                width: 48, 
                height: 48, 
                bgcolor: alpha(theme.palette.text.primary, 0.05),
                mb: 2
              }}
            >
              <IdeaIcon sx={{ fontSize: 24, color: alpha(theme.palette.text.primary, 0.3) }} />
            </Avatar>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              No insights available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add more trades to get AI-powered insights about your trading patterns.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {insights.map((insight, index) => (
              <Fade key={insight.id} in timeout={300 + index * 100}>
                <Box>
                  <ListItem
                    onClick={() => handleInsightClick(insight)}
                    sx={{
                      borderRadius: 2,
                      mb: 1.5,
                      p: 2,
                      cursor: 'pointer',
                      border: `1px solid ${alpha(insight.color, 0.1)}`,
                      background: alpha(insight.color, 0.03),
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: alpha(insight.color, 0.08),
                        borderColor: alpha(insight.color, 0.2),
                        transform: 'translateY(-1px)',
                        boxShadow: `0 4px 12px ${alpha(insight.color, 0.15)}`
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32,
                          bgcolor: alpha(insight.color, 0.1),
                          color: insight.color
                        }}
                      >
                        {insight.icon}
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {insight.title}
                          </Typography>
                          
                          {insight.priority === 'high' && (
                            <Chip 
                              icon={<StarIcon />}
                              label="High Priority"
                              size="small"
                              color="error"
                              sx={{ 
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 700
                              }}
                            />
                          )}
                          
                          {insight.actionable && (
                            <Chip 
                              label="Actionable"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ 
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 600
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: expandedInsights.has(insight.id) ? 'none' : 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 1
                            }}
                          >
                            {insight.content}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Confidence: {Math.round(insight.confidence * 100)}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={insight.confidence * 100}
                                sx={{
                                  width: 40,
                                  height: 4,
                                  borderRadius: 2,
                                  backgroundColor: alpha(theme.palette.text.primary, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: insight.color,
                                    borderRadius: 2
                                  }
                                }}
                              />
                            </Box>
                            
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleInsightExpansion(insight.id);
                              }}
                            >
                              {expandedInsights.has(insight.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                </Box>
              </Fade>
            ))}
          </List>
        )}
        
        {showActions && insights.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AnalyticsIcon />}
              onClick={() => window.location.href = '/tradesage'}
              sx={{ 
                fontWeight: 600,
                borderRadius: 2,
                borderWidth: '1.5px'
              }}
            >
              View Full Analysis
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TradeSageInsightsPanel;
