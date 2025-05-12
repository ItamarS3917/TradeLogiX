import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
  useTheme,
  Tab,
  Tabs
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoodIcon from '@mui/icons-material/Mood';
import CategoryIcon from '@mui/icons-material/Category';
import RepeatIcon from '@mui/icons-material/Repeat';
import SpeedIcon from '@mui/icons-material/Speed';
import BalanceIcon from '@mui/icons-material/Balance';
import MoneyIcon from '@mui/icons-material/Money';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import Looks4Icon from '@mui/icons-material/Looks4';
import Looks5Icon from '@mui/icons-material/Looks5';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

// Pattern type icons
const PATTERN_ICONS = {
  time_of_day: <AccessTimeIcon />,
  day_of_week: <CalendarTodayIcon />,
  emotional_impact: <MoodIcon />,
  setup_performance: <CategoryIcon />,
  overtrading: <SpeedIcon />,
  revenge_trading: <RepeatIcon />,
  streak_impact: <ShowChartIcon />,
  risk_reward_correlation: <BalanceIcon />,
  trade_duration_impact: <AccessTimeIcon />,
  plan_adherence_correlation: <AssignmentTurnedInIcon />,
  position_sizing_optimization: <MoneyIcon />,
  session_profitability: <TrendingUpIcon />,
  win_loss_sequence: <RepeatIcon />,
  default: <AutoGraphIcon />
};

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pattern-tabpanel-${index}`}
      aria-labelledby={`pattern-tab-${index}`}
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

const PatternVisualization = ({ patterns, insights, recommendations, summary }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Sort patterns by confidence
  const sortedPatterns = [...(patterns || [])].sort((a, b) => 
    (b.confidence || 0) - (a.confidence || 0)
  );
  
  // Get icon for pattern type
  const getPatternIcon = (type) => {
    return PATTERN_ICONS[type] || PATTERN_ICONS.default;
  };
  
  // Get recommendation number icon
  const getNumberIcon = (index) => {
    switch (index) {
      case 0: return <LooksOneIcon />;
      case 1: return <LooksTwoIcon />;
      case 2: return <Looks3Icon />;
      case 3: return <Looks4Icon />;
      case 4: return <Looks5Icon />;
      default: return <LooksOneIcon />;
    }
  };
  
  // Format confidence as percentage
  const formatConfidence = (confidence) => {
    return `${Math.round((confidence || 0) * 100)}%`;
  };
  
  return (
    <Box>
      {/* Summary section */}
      {summary && (
        <Box mb={3}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <SummarizeIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Summary</Typography>
              </Box>
              <Typography variant="body1">{summary}</Typography>
            </CardContent>
          </Card>
        </Box>
      )}
      
      {/* Tabs for different views */}
      <Box sx={{ width: '100%' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Patterns" icon={<AutoGraphIcon />} />
          <Tab label="Insights" icon={<TipsAndUpdatesIcon />} />
          <Tab label="Recommendations" icon={<TrendingUpIcon />} />
        </Tabs>
        
        {/* Patterns tab */}
        <TabPanel value={tabValue} index={0}>
          {sortedPatterns && sortedPatterns.length > 0 ? (
            <Box>
              {sortedPatterns.map((pattern, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ mr: 1 }}>
                        {getPatternIcon(pattern.type)}
                      </Box>
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        {pattern.name || `Pattern #${index + 1}`}
                      </Typography>
                      <Chip
                        label={formatConfidence(pattern.confidence)}
                        size="small"
                        sx={{ ml: 1 }}
                        color={
                          (pattern.confidence || 0) >= 0.8 ? 'success' :
                          (pattern.confidence || 0) >= 0.5 ? 'warning' :
                          'error'
                        }
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" gutterBottom>
                      {pattern.description}
                    </Typography>
                    
                    {pattern.recommendation && (
                      <Box mt={1} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <TipsAndUpdatesIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                        <Typography variant="body2" color="text.secondary">
                          <strong>Recommendation:</strong> {pattern.recommendation}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Additional pattern details */}
                    {pattern.type === 'time_of_day' && (
                      <Box mt={2}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Card variant="outlined" sx={{ bgcolor: theme.palette.success.light }}>
                              <CardContent>
                                <Typography variant="subtitle2">Best Time</Typography>
                                <Typography variant="h6">
                                  {pattern.best_hour % 12 || 12} {pattern.best_hour < 12 ? 'AM' : 'PM'}
                                </Typography>
                                <Typography variant="body2">
                                  {pattern.best_win_rate?.toFixed(1)}% win rate
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={6}>
                            <Card variant="outlined" sx={{ bgcolor: theme.palette.error.light }}>
                              <CardContent>
                                <Typography variant="subtitle2">Worst Time</Typography>
                                <Typography variant="h6">
                                  {pattern.worst_hour % 12 || 12} {pattern.worst_hour < 12 ? 'AM' : 'PM'}
                                </Typography>
                                <Typography variant="body2">
                                  {pattern.worst_win_rate?.toFixed(1)}% win rate
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                    
                    {pattern.type === 'emotional_impact' && (
                      <Box mt={2}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Card variant="outlined" sx={{ bgcolor: theme.palette.success.light }}>
                              <CardContent>
                                <Typography variant="subtitle2">Best Emotion</Typography>
                                <Typography variant="h6">
                                  {pattern.best_emotion}
                                </Typography>
                                <Typography variant="body2">
                                  {pattern.best_win_rate?.toFixed(1)}% win rate
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                          <Grid item xs={6}>
                            <Card variant="outlined" sx={{ bgcolor: theme.palette.error.light }}>
                              <CardContent>
                                <Typography variant="subtitle2">Worst Emotion</Typography>
                                <Typography variant="h6">
                                  {pattern.worst_emotion}
                                </Typography>
                                <Typography variant="body2">
                                  {pattern.worst_win_rate?.toFixed(1)}% win rate
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="subtitle1" color="text.secondary">
                No patterns detected
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        {/* Insights tab */}
        <TabPanel value={tabValue} index={1}>
          {insights && insights.length > 0 ? (
            <List>
              {insights.map((insight, index) => (
                <ListItem key={index} sx={{ mb: 1 }}>
                  <ListItemIcon>
                    {getPatternIcon(insight.type)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={insight.name || `Insight #${index + 1}`}
                    secondary={insight.description}
                  />
                  {insight.confidence && (
                    <Chip
                      label={formatConfidence(insight.confidence)}
                      size="small"
                      sx={{ ml: 1 }}
                      color={
                        insight.confidence >= 0.8 ? 'success' :
                        insight.confidence >= 0.5 ? 'warning' :
                        'error'
                      }
                    />
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="subtitle1" color="text.secondary">
                No insights available
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        {/* Recommendations tab */}
        <TabPanel value={tabValue} index={2}>
          {recommendations && recommendations.length > 0 ? (
            <List>
              {recommendations.map((recommendation, index) => (
                <ListItem key={index} sx={{ mb: 1 }}>
                  <ListItemIcon>
                    {getNumberIcon(index)}
                  </ListItemIcon>
                  <ListItemText primary={recommendation} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="subtitle1" color="text.secondary">
                No recommendations available
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Box>
    </Box>
  );
};

export default PatternVisualization;
