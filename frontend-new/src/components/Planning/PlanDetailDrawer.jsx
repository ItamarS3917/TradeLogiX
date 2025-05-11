import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Grid,
  Chip,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SwapHoriz as NeutralIcon,
  Flag as GoalIcon,
  Psychology as MentalStateIcon,
  ShowChart as KeyLevelIcon,
  Warning as RiskIcon,
} from '@mui/icons-material';
import { format, isToday } from 'date-fns';

// Market bias chips colors
const getBiasColor = (bias) => {
  switch (bias) {
    case 'Bullish':
      return 'success';
    case 'Bearish':
      return 'error';
    case 'Neutral':
      return 'default';
    case 'Bullish Bias with Bearish Features':
      return 'warning';
    case 'Bearish Bias with Bullish Features':
      return 'warning';
    default:
      return 'default';
  }
};

// Get bias icon based on market bias
const getBiasIcon = (bias) => {
  if (bias.includes('Bullish')) return <TrendingUpIcon color="success" />;
  if (bias.includes('Bearish')) return <TrendingDownIcon color="error" />;
  return <NeutralIcon />;
};

const PlanDetailDrawer = ({ plan, open, onClose, onEdit, onDelete }) => {
  if (!plan) return null;

  const handleEdit = () => {
    onEdit(plan);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      onDelete(plan.id);
      onClose();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 500 },
          boxSizing: 'border-box',
          padding: 2,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Daily Plan Details</Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={2}>
        {/* Header Information */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" gutterBottom>
                {format(new Date(plan.date), 'MMMM dd, yyyy')}
                {isToday(new Date(plan.date)) && (
                  <Chip 
                    label="Today" 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1 }} 
                  />
                )}
              </Typography>
              <Chip 
                label={plan.market_bias} 
                color={getBiasColor(plan.market_bias)}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getBiasIcon(plan.market_bias)}
              <Typography variant="body2" sx={{ ml: 1 }}>
                {plan.market_bias}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Key Levels */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Key Price Levels
          </Typography>
          {Object.entries(plan.key_levels).length > 0 ? (
            <List dense>
              {Object.entries(plan.key_levels).map(([type, values], index) => (
                <ListItem
                  key={index}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <ListItemIcon>
                    <KeyLevelIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={type}
                    secondary={
                      Array.isArray(values) 
                        ? values.join(', ')
                        : values
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No key levels defined for this plan.
            </Typography>
          )}
        </Grid>

        {/* Goals */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
            Trading Goals
          </Typography>
          {plan.goals && plan.goals.length > 0 ? (
            <List dense>
              {plan.goals.map((goal, index) => (
                <ListItem
                  key={index}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <ListItemIcon>
                    <GoalIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={goal}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No goals defined for this plan.
            </Typography>
          )}
        </Grid>

        {/* Risk Parameters */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
            Risk Management
          </Typography>
          {plan.risk_parameters && Object.keys(plan.risk_parameters).length > 0 ? (
            <Grid container spacing={2}>
              {Object.entries(plan.risk_parameters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <Grid item xs={12} md={4} key={key}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Typography>
                      <Typography variant="h6">{value}</Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No risk parameters defined for this plan.
            </Typography>
          )}
        </Grid>

        {/* Mental State */}
        {plan.mental_state && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
              Mental State
            </Typography>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MentalStateIcon sx={{ mr: 1 }} />
                <Typography variant="body1">{plan.mental_state}</Typography>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Notes */}
        {plan.notes && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
              Notes
            </Typography>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="body1">
                {plan.notes}
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Created/Updated Info */}
        <Grid item xs={12}>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="caption" display="block" color="text.secondary">
              Created: {format(new Date(plan.created_at), 'MMM dd, yyyy HH:mm')}
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Last Updated: {format(new Date(plan.updated_at), 'MMM dd, yyyy HH:mm')}
            </Typography>
          </Box>
        </Grid>

        {/* Actions */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              fullWidth
            >
              Edit Plan
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              fullWidth
            >
              Delete
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Drawer>
  );
};

export default PlanDetailDrawer;