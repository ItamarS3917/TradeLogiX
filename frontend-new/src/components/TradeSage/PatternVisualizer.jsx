import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoodIcon from '@mui/icons-material/Mood';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BarChartIcon from '@mui/icons-material/BarChart';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import MoneyIcon from '@mui/icons-material/Money';
import SpeedIcon from '@mui/icons-material/Speed';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

/**
 * Component for visualizing trading patterns detected by MCP
 */
const PatternVisualizer = ({ patterns, title = "Detected Trading Patterns" }) => {
  const [expanded, setExpanded] = useState(false);

  // No patterns
  if (!patterns || patterns.length === 0) {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{title}</Typography>
          <Typography color="textSecondary">
            No significant patterns detected. Continue adding more trades for enhanced analysis.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Sort patterns by confidence
  const sortedPatterns = [...patterns].sort((a, b) => 
    (b.confidence || 0) - (a.confidence || 0)
  );

  // Get icon for pattern type
  const getPatternIcon = (type) => {
    const iconMap = {
      time_of_day: <AccessTimeIcon />,
      day_of_week: <EventNoteIcon />,
      emotional_impact: <MoodIcon />,
      setup_performance: <BarChartIcon />,
      overtrading: <MoneyOffIcon />,
      revenge_trading: <MoneyOffIcon />,
      streak_impact: <TrendingUpIcon />,
      risk_reward_correlation: <MoneyIcon />,
      trade_duration_impact: <AccessTimeIcon />,
      plan_adherence_correlation: <EventNoteIcon />,
      position_sizing_optimization: <MoneyIcon />,
      session_profitability: <AccessTimeIcon />,
      win_loss_sequence: <TrendingUpIcon />,
    };

    return iconMap[type] || <LightbulbIcon />;
  };

  // Get color for confidence level
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.85) return 'success.main';
    if (confidence >= 0.7) return 'info.main';
    if (confidence >= 0.5) return 'warning.main';
    return 'error.main';
  };

  // Format confidence as percentage
  const formatConfidence = (confidence) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <Chip 
            label={`${patterns.length} Patterns`} 
            color="primary" 
            size="small" 
          />
        </Box>

        {/* Top pattern highlight */}
        {sortedPatterns[0] && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Highest Confidence Pattern
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {getPatternIcon(sortedPatterns[0].type)}
              <Typography variant="body1" sx={{ ml: 1, fontWeight: 'medium' }}>
                {sortedPatterns[0].name}
              </Typography>
              <Tooltip title="Confidence Level">
                <Chip 
                  size="small" 
                  label={formatConfidence(sortedPatterns[0].confidence)}
                  sx={{ ml: 'auto', bgcolor: getConfidenceColor(sortedPatterns[0].confidence), color: 'white' }}
                />
              </Tooltip>
            </Box>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {sortedPatterns[0].description}
            </Typography>
            {sortedPatterns[0].recommendation && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'flex-start' }}>
                <LightbulbIcon fontSize="small" sx={{ color: 'warning.main', mr: 1, mt: 0.3 }} />
                <Typography variant="body2" fontStyle="italic">
                  <strong>Recommendation:</strong> {sortedPatterns[0].recommendation}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Pattern list */}
        <Accordion 
          expanded={expanded} 
          onChange={() => setExpanded(!expanded)}
          sx={{ '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              {expanded ? "Hide All Patterns" : "View All Patterns"}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List sx={{ width: '100%', p: 0 }}>
              {sortedPatterns.map((pattern, index) => (
                <React.Fragment key={`pattern-${index}`}>
                  <ListItem alignItems="flex-start" sx={{ py: 2, px: 2 }}>
                    <ListItemIcon>
                      {getPatternIcon(pattern.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">{pattern.name}</Typography>
                          <Tooltip title="Confidence Level">
                            <Chip 
                              size="small" 
                              label={formatConfidence(pattern.confidence)}
                              sx={{ fontSize: '0.75rem', bgcolor: getConfidenceColor(pattern.confidence), color: 'white' }}
                            />
                          </Tooltip>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {pattern.description}
                          </Typography>
                          {pattern.recommendation && (
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'flex-start' }}>
                              <LightbulbIcon fontSize="small" sx={{ color: 'warning.main', mr: 1, mt: 0.3 }} />
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                <strong>Recommendation:</strong> {pattern.recommendation}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Pattern details based on type */}
                          {pattern.type === 'time_of_day' && (
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                              <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: 'success.main' }}>
                                  Best time: {pattern.best_hour}:00 ({pattern.best_win_rate.toFixed(1)}% win rate)
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: 'error.main' }}>
                                  Worst time: {pattern.worst_hour}:00 ({pattern.worst_win_rate.toFixed(1)}% win rate)
                                </Typography>
                              </Grid>
                            </Grid>
                          )}
                          
                          {pattern.type === 'emotional_impact' && (
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                              <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: 'success.main' }}>
                                  Best emotion: "{pattern.best_emotion}" ({pattern.best_win_rate.toFixed(1)}% win rate)
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: 'error.main' }}>
                                  Worst emotion: "{pattern.worst_emotion}" ({pattern.worst_win_rate.toFixed(1)}% win rate)
                                </Typography>
                              </Grid>
                            </Grid>
                          )}
                          
                          {pattern.type === 'setup_performance' && (
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                              <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: 'success.main' }}>
                                  Best setup: "{pattern.best_setup}" ({pattern.best_win_rate.toFixed(1)}% win rate)
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" sx={{ color: 'error.main' }}>
                                  Worst setup: "{pattern.worst_setup}" ({pattern.worst_win_rate.toFixed(1)}% win rate)
                                </Typography>
                              </Grid>
                            </Grid>
                          )}
                          
                          {pattern.type === 'risk_reward_correlation' && pattern.rr_categories && (
                            <Box sx={{ mt: 1.5 }}>
                              <Typography variant="caption" fontWeight="medium">
                                Risk:Reward Analysis:
                              </Typography>
                              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                {pattern.rr_categories.map((category, idx) => (
                                  <Grid item xs={12} sm={4} key={idx}>
                                    <Tooltip title={`Expected value: ${category.expected_value.toFixed(2)}`}>
                                      <Box>
                                        <Typography variant="caption" display="block">
                                          {category.rr_category}: {category.win_rate.toFixed(1)}% win rate
                                        </Typography>
                                        <LinearProgress 
                                          variant="determinate" 
                                          value={category.win_rate} 
                                          sx={{ 
                                            height: 6, 
                                            borderRadius: 1,
                                            bgcolor: 'grey.200',
                                            '& .MuiLinearProgress-bar': {
                                              bgcolor: category.rr_category === pattern.optimal_category 
                                                ? 'success.main' 
                                                : 'primary.main'
                                            }
                                          }}
                                        />
                                      </Box>
                                    </Tooltip>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          )}
                          
                          {pattern.type === 'trade_duration_impact' && pattern.duration_categories && (
                            <Box sx={{ mt: 1.5 }}>
                              <Typography variant="caption" fontWeight="medium">
                                Trade Duration Analysis:
                              </Typography>
                              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                                {pattern.duration_categories.map((category, idx) => (
                                  <Grid item xs={12} sm={6} key={idx}>
                                    <Typography variant="caption" display="block">
                                      {category.duration_category}: ${category.avg_pnl.toFixed(2)} avg. P&L
                                    </Typography>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={Math.min(Math.max(category.avg_pnl * 2, 0), 100)} 
                                      sx={{ 
                                        height: 6, 
                                        borderRadius: 1,
                                        bgcolor: 'grey.200',
                                        '& .MuiLinearProgress-bar': {
                                          bgcolor: category.duration_category === pattern.best_duration_category 
                                            ? 'success.main' 
                                            : category.duration_category === pattern.worst_duration_category
                                              ? 'error.main'
                                              : 'primary.main'
                                        }
                                      }}
                                    />
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < sortedPatterns.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default PatternVisualizer;
