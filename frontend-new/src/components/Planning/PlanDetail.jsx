import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Insights as InsightsIcon,
  SentimentSatisfiedAlt as SentimentIcon,
  AttachMoney as MoneyIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const PlanDetail = ({ plan, open, onClose, onEdit }) => {
  if (!plan) return null;
  
  const handleEdit = () => {
    onEdit(plan);
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Trading Plan: {format(new Date(plan.date), 'MMMM dd, yyyy')}
          </Typography>
          <IconButton onClick={onClose} size="small">
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
                        {format(new Date(plan.date), 'MMMM dd, yyyy')}
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
                      <Typography variant="body1">
                        <Chip 
                          label={plan.market_bias} 
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
            <Grid container spacing={2}>
              {/* Support Levels */}
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Support Levels
                  </Typography>
                  {plan.key_levels?.support?.length > 0 ? (
                    <List dense>
                      {plan.key_levels.support.map((level, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`Price: ${level.price}`}
                            secondary={level.description}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No support levels specified
                    </Typography>
                  )}
                </Paper>
              </Grid>
              
              {/* Resistance Levels */}
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" color="error" gutterBottom>
                    Resistance Levels
                  </Typography>
                  {plan.key_levels?.resistance?.length > 0 ? (
                    <List dense>
                      {plan.key_levels.resistance.map((level, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`Price: ${level.price}`}
                            secondary={level.description}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No resistance levels specified
                    </Typography>
                  )}
                </Paper>
              </Grid>
              
              {/* Other Levels */}
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" color="info.main" gutterBottom>
                    Other Levels
                  </Typography>
                  {plan.key_levels?.other?.length > 0 ? (
                    <List dense>
                      {plan.key_levels.other.map((level, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`Price: ${level.price}`}
                            secondary={level.description}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No other levels specified
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Risk Management */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Risk Management
            </Typography>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <MoneyIcon color="error" />
                    <Typography variant="body2" color="text.secondary">
                      Max Daily Loss
                    </Typography>
                    <Typography variant="h6">
                      {plan.risk_parameters?.max_daily_loss || 'Not set'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <MoneyIcon color="warning" />
                    <Typography variant="body2" color="text.secondary">
                      Max Risk Per Trade
                    </Typography>
                    <Typography variant="h6">
                      {plan.risk_parameters?.max_trade_risk || 'Not set'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <MoneyIcon color="success" />
                    <Typography variant="body2" color="text.secondary">
                      Target Daily Profit
                    </Typography>
                    <Typography variant="h6">
                      {plan.risk_parameters?.target_profit || 'Not set'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
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
        <Button onClick={onClose}>Close</Button>
        <Button 
          variant="contained" 
          startIcon={<EditIcon />} 
          onClick={handleEdit}
        >
          Edit Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlanDetail;