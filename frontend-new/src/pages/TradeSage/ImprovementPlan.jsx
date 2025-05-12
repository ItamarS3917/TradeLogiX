import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Avatar,
  Grid,
  useTheme
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimerIcon from '@mui/icons-material/Timer';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HourglassFullIcon from '@mui/icons-material/HourglassFull';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import StarIcon from '@mui/icons-material/Star';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`plan-tabpanel-${index}`}
      aria-labelledby={`plan-tab-${index}`}
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

const ImprovementPlan = ({ plan }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  if (!plan) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="subtitle1" color="text.secondary">
          No improvement plan available
        </Typography>
      </Box>
    );
  }
  
  // Extract plan data
  const { strengths, weaknesses, timeline } = plan;
  const shortTerm = plan.plan?.shortTerm || [];
  const mediumTerm = plan.plan?.mediumTerm || [];
  const longTerm = plan.plan?.longTerm || [];
  
  // MCP enhanced indicator
  const isMcpEnhanced = plan.mcp_enhanced || false;
  
  // Function to render actions with timeframe and measurable
  const renderActions = (actions, termType) => {
    const getStepIcon = (termType) => {
      switch (termType) {
        case 'short': return <HourglassEmptyIcon />;
        case 'medium': return <HourglassFullIcon />;
        case 'long': return <CalendarMonthIcon />;
        default: return <AccessTimeIcon />;
      }
    };
    
    return (
      <Stepper orientation="vertical">
        {actions.map((action, index) => (
          <Step key={index} active={true}>
            <StepLabel StepIconComponent={() => getStepIcon(termType)}>
              <Typography variant="subtitle1">{action.action}</Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                {action.timeframe && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="text.secondary">
                      Timeframe: {action.timeframe}
                    </Typography>
                  </Box>
                )}
                
                {action.measurable && (
                  <Box display="flex" alignItems="center">
                    <TrackChangesIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="text.secondary">
                      Success metric: {action.measurable}
                    </Typography>
                  </Box>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    );
  };
  
  return (
    <Box>
      {/* Header with MCP badge if enhanced */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Trading Improvement Plan</Typography>
        {isMcpEnhanced && (
          <Chip 
            label="MCP Enhanced" 
            size="small" 
            color="secondary" 
            icon={<StarIcon fontSize="small" />} 
          />
        )}
      </Box>
      
      {/* Timeline if available */}
      {timeline && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: theme.palette.info.light, color: theme.palette.info.contrastText }}>
          <Typography variant="body2">{timeline}</Typography>
        </Paper>
      )}
      
      {/* Tabs for different sections */}
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Actions" icon={<AccessTimeIcon />} />
        <Tab label="Strengths" icon={<TrendingUpIcon />} />
        <Tab label="Weaknesses" icon={<TrendingDownIcon />} />
      </Tabs>
      
      {/* Actions tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={2}>
          {/* Short-term actions */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <HourglassEmptyIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                  <Typography variant="h6">Short-term</Typography>
                </Box>
                {shortTerm.length > 0 ? (
                  renderActions(shortTerm, 'short')
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No short-term actions
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Medium-term actions */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <HourglassFullIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                  <Typography variant="h6">Medium-term</Typography>
                </Box>
                {mediumTerm.length > 0 ? (
                  renderActions(mediumTerm, 'medium')
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No medium-term actions
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Long-term actions */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarMonthIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                  <Typography variant="h6">Long-term</Typography>
                </Box>
                {longTerm.length > 0 ? (
                  renderActions(longTerm, 'long')
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No long-term actions
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Strengths tab */}
      <TabPanel value={tabValue} index={1}>
        {strengths && strengths.length > 0 ? (
          <List>
            {strengths.map((strength, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                </ListItemIcon>
                <ListItemText primary={strength} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              No strengths identified
            </Typography>
          </Box>
        )}
      </TabPanel>
      
      {/* Weaknesses tab */}
      <TabPanel value={tabValue} index={2}>
        {weaknesses && weaknesses.length > 0 ? (
          <List>
            {weaknesses.map((weakness, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <WarningIcon sx={{ color: theme.palette.warning.main }} />
                </ListItemIcon>
                <ListItemText primary={weakness} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              No weaknesses identified
            </Typography>
          </Box>
        )}
      </TabPanel>
      
      {/* Show patterns from MCP if available */}
      {isMcpEnhanced && plan.patterns && plan.patterns.length > 0 && (
        <Box mt={3}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            AI-Detected Patterns
          </Typography>
          <Grid container spacing={2}>
            {plan.patterns.slice(0, 3).map((pattern, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      {pattern.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {pattern.description}
                    </Typography>
                    {pattern.confidence && (
                      <Chip
                        label={`${Math.round(pattern.confidence * 100)}% confidence`}
                        size="small"
                        sx={{ mt: 1 }}
                        color={
                          pattern.confidence >= 0.8 ? 'success' :
                          pattern.confidence >= 0.5 ? 'warning' :
                          'error'
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ImprovementPlan;
