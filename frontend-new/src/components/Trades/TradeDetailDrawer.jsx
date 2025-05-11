import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Grid,
  Chip,
  Stack,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as ProfitIcon,
  TrendingDown as LossIcon,
  Image as ImageIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const TradeDetailDrawer = ({ trade, open, onClose, onEdit, onDelete }) => {
  if (!trade) return null;

  const handleEdit = () => {
    onEdit(trade);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this trade? This action cannot be undone.')) {
      onDelete(trade.id);
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
        <Typography variant="h5">Trade Details</Typography>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {/* Header Information */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              {trade.symbol} - {trade.setup_type}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1">
                {format(new Date(trade.entry_time), 'MMMM dd, yyyy')}
              </Typography>
              <Chip
                label={trade.outcome}
                color={
                  trade.outcome === 'Win'
                    ? 'success'
                    : trade.outcome === 'Loss'
                    ? 'error'
                    : 'warning'
                }
              />
            </Box>
          </Paper>
        </Grid>

        {/* Trade Details */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" gutterBottom>
            Entry Details
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Entry Price" 
                secondary={trade.entry_price} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Entry Time" 
                secondary={format(new Date(trade.entry_time), 'MMM dd, yyyy HH:mm:ss')} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Position Size" 
                secondary={trade.position_size} 
              />
            </ListItem>
          </List>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1" gutterBottom>
            Exit Details
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Exit Price" 
                secondary={trade.exit_price} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Exit Time" 
                secondary={format(new Date(trade.exit_time), 'MMM dd, yyyy HH:mm:ss')} 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Profit/Loss" 
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {trade.profit_loss > 0 ? (
                      <ProfitIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                    ) : trade.profit_loss < 0 ? (
                      <LossIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                    ) : null}
                    <Typography
                      variant="body2"
                      color={
                        trade.profit_loss > 0
                          ? 'success.main'
                          : trade.profit_loss < 0
                          ? 'error.main'
                          : 'text.primary'
                      }
                    >
                      {trade.profit_loss > 0 ? '+' : ''}
                      {trade.profit_loss}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </List>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        {/* Risk Management */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Risk Management
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Planned Risk:Reward
                </Typography>
                <Typography variant="h6">{trade.planned_risk_reward || 'N/A'}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Actual Risk:Reward
                </Typography>
                <Typography variant="h6">{trade.actual_risk_reward || 'N/A'}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        {/* Trade Psychology */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Trade Psychology
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Emotional State
                </Typography>
                <Typography variant="h6">{trade.emotional_state || 'Not specified'}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Plan Adherence
                </Typography>
                <Typography variant="h6">{trade.plan_adherence || 'N/A'}/10</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Notes and Tags */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Notes & Lessons Learned
          </Typography>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="body1">
              {trade.notes || 'No notes for this trade.'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Tags
          </Typography>
          {trade.tags && trade.tags.length > 0 ? (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {trade.tags.map((tag) => (
                <Chip key={tag} label={tag} sx={{ mb: 1 }} />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No tags for this trade.
            </Typography>
          )}
        </Grid>

        {/* Screenshots */}
        {trade.screenshots && trade.screenshots.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Screenshots
            </Typography>
            <Grid container spacing={1}>
              {trade.screenshots.map((screenshot, index) => (
                <Grid item xs={6} sm={4} key={index}>
                  <Box
                    component="img"
                    src={screenshot}
                    alt={`Trade Screenshot ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}

        {/* Actions */}
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              fullWidth
            >
              Edit Trade
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
          </Stack>
        </Grid>
      </Grid>
    </Drawer>
  );
};

export default TradeDetailDrawer;