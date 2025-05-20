import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Insights as InsightsIcon,
  SentimentSatisfiedAlt as SentimentIcon,
  AttachMoney as MoneyIcon,
  Flag as FlagIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// Helper function to safely convert Firestore timestamps or strings to Date objects
const safelyParseDate = (timeValue) => {
  if (!timeValue) return new Date(); // Fallback to current date
  
  try {
    // Handle Firestore timestamp objects
    if (timeValue && typeof timeValue === 'object' && 'seconds' in timeValue && 'nanoseconds' in timeValue) {
      return new Date(timeValue.seconds * 1000 + timeValue.nanoseconds / 1000000);
    }
    
    // Handle ISO strings or other date formats
    return new Date(timeValue);
  } catch (error) {
    console.error('Error parsing date:', timeValue, error);
    return new Date(); // Fallback to current date
  }
};

const PlanDetail = ({ plan, loading, onEdit, onDelete }) => {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!plan) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Plan Found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a date to view or create a trading plan.
        </Typography>
      </Paper>
    );
  }
  
  const handleOpenDetailDialog = () => {
    setDetailDialogOpen(true);
  };
  
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };
  
  return (
    <>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Trading Plan
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                {format(safelyParseDate(plan.date), 'MMMM dd, yyyy')}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />} 
              onClick={() => onEdit(plan)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            {plan.id && (
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteIcon />} 
                onClick={() => onDelete(plan.id)}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Basic Information */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {plan.market_bias === 'Bullish' ? (
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                ) : plan.market_bias === 'Bearish' ? (
                  <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                ) : (
                  <InsightsIcon color="action" sx={{ mr: 1 }} />
                )}
                <Typography variant="h6" component="div">
                  Market Bias: {' '}
                  <Chip 
                    label={plan.market_bias || 'Not specified'} 
                    size="small"
                    color={
                      plan.market_bias === 'Bullish' ? 'success' :
                      plan.market_bias === 'Bearish' ? 'error' :
                      'default'
                    }
                  />
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SentimentIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  Mental State: {plan.mental_state || 'Not specified'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Daily Goals
              </Typography>
              {plan.goals && plan.goals.length > 0 ? (
                <List dense>
                  {plan.goals.slice(0, 2).map((goal, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <FlagIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={goal} />
                    </ListItem>
                  ))}
                  {plan.goals.length > 2 && (
                    <Box sx={{ textAlign: 'center', mt: 1 }}>
                      <Button size="small" onClick={handleOpenDetailDialog}>
                        +{plan.goals.length - 2} more goals...
                      </Button>
                    </Box>
                  )}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No goals specified for this day
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Additional Details Button */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={handleOpenDetailDialog}
            fullWidth
          >
            View Full Plan Details
          </Button>
        </Box>
      </Paper>
      
      {/* Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Trading Plan: {format(safelyParseDate(plan.date), 'MMMM dd, yyyy')}
            </Typography>
            <IconButton onClick={handleCloseDetailDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" alignItems="center">
                      <CalendarIcon color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Date
                        </Typography>
                        <Typography variant="body1">
                          {format(safelyParseDate(plan.date), 'MMMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" alignItems="center">
                      {plan.market_bias === 'Bullish' ? (
                        <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                      ) : plan.market_bias === 'Bearish' ? (
                        <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                      ) : (
                        <InsightsIcon color="action" sx={{ mr: 1 }} />
                      )}
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Market Bias
                        </Typography>
                        <Typography variant="body1" component="div">
                          <Chip 
                            label={plan.market_bias || 'Not specified'} 
                            size="small"
                            color={
                              plan.market_bias === 'Bullish' ? 'success' :
                              plan.market_bias === 'Bearish' ? 'error' :
                              'default'
                            }
                          />
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" alignItems="center">
                      <SentimentIcon color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Mental State
                        </Typography>
                        <Typography variant="body1">
                          {plan.mental_state || 'Not specified'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            {/* Key Levels */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Key Levels
              </Typography>
              <Paper elevation={1} sx={{ p: 2 }}>
                {plan.key_levels && Object.keys(plan.key_levels).length > 0 ? (
                  <List>
                    {Object.entries(plan.key_levels).map(([type, value]) => (
                      <ListItem key={type}>
                        <ListItemText
                          primary={type}
                          secondary={value}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No key levels specified
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            {/* Risk Management */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Risk Management
              </Typography>
              <Paper elevation={1} sx={{ p: 2 }}>
                {plan.risk_parameters && Object.keys(plan.risk_parameters).length > 0 ? (
                  <Grid container spacing={3}>
                    {Object.entries(plan.risk_parameters).map(([name, value]) => (
                      <Grid item xs={12} sm={4} key={name}>
                        <Box sx={{ textAlign: 'center' }}>
                          <MoneyIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            {name}
                          </Typography>
                          <Typography variant="h6">
                            {value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No risk parameters specified
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            {/* Goals */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Daily Goals
              </Typography>
              <Paper elevation={1} sx={{ p: 2 }}>
                {plan.goals && plan.goals.length > 0 ? (
                  <List>
                    {plan.goals.map((goal, index) => (
                      <ListItem key={index}>
                        <FlagIcon color="primary" fontSize="small" sx={{ mr: 2 }} />
                        <ListItemText primary={goal} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No goals specified for this day
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            {/* Notes */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Notes & Observations
              </Typography>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="body1">
                  {plan.notes || 'No notes for this plan.'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />} 
            onClick={() => {
              handleCloseDetailDialog();
              onEdit(plan);
            }}
          >
            Edit Plan
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PlanDetail;