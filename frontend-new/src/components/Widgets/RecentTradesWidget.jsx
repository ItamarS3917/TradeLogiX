import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Avatar,
  Skeleton,
  Alert,
  Button,
  Divider
} from '@mui/material';
import {
  List as ListIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as BreakevenIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  ArrowForward as ArrowIcon,
  Add as AddIcon,
  ShowChart as ChartIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import Widget from './Widget';
import { useFirebase } from '../../contexts/FirebaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, alpha } from '@mui/material/styles';

/**
 * Recent Trades Widget - Displays recent trading activities
 */
const RecentTradesWidget = ({ 
  settings = {},
  onRefresh,
  onConfigure,
  onRemove,
  ...props 
}) => {
  const { user } = useAuth();
  const firebase = useFirebase();
  const theme = useTheme();
  
  // Widget settings with defaults
  const {
    maxTrades = 5,
    showPnL = true,
    showScreenshots = false,
    compactMode = false,
    showActions = true
  } = settings;
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trades, setTrades] = useState([]);
  
  // Fetch recent trades
  const fetchRecentTrades = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all trades and get the most recent ones
      const allTrades = await firebase.getAllTrades();
      
      if (!allTrades || allTrades.length === 0) {
        setTrades([]);
        return;
      }
      
      // Sort by entry time (most recent first) and limit
      const recentTrades = allTrades
        .sort((a, b) => new Date(b.entry_time) - new Date(a.entry_time))
        .slice(0, maxTrades)
        .map(trade => ({
          id: trade.id,
          symbol: trade.symbol || 'NQ',
          date: new Date(trade.entry_time),
          outcome: trade.outcome || 'unknown',
          pnl: parseFloat(trade.profit_loss) || 0,
          setupType: trade.setup_type || 'Unknown Setup',
          entryPrice: trade.entry_price || 0,
          exitPrice: trade.exit_price || 0,
          notes: trade.notes || '',
          screenshot: trade.screenshot_url || null
        }));
      
      setTrades(recentTrades);
      
    } catch (err) {
      console.error('Error fetching recent trades:', err);
      setError('Failed to load recent trades');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchRecentTrades();
    if (onRefresh) onRefresh();
  };
  
  // Handle trade click
  const handleTradeClick = (tradeId) => {
    // Navigate to trade details
    window.location.href = `/trades/${tradeId}`;
  };
  
  // Handle view chart
  const handleViewChart = (trade) => {
    console.log('View chart for trade:', trade.id);
    // Could open chart modal or navigate to chart view
  };
  
  // Handle edit trade
  const handleEditTrade = (trade) => {
    // Navigate to edit form
    window.location.href = `/trades/${trade.id}/edit`;
  };
  
  // Handle add new trade
  const handleAddTrade = () => {
    window.location.href = '/trades/new';
  };
  
  // Get outcome icon and color
  const getOutcomeDisplay = (outcome, pnl) => {
    const normalizedOutcome = outcome.toLowerCase();
    
    switch (normalizedOutcome) {
      case 'win':
        return {
          icon: <TrendingUpIcon />,
          color: theme.palette.success.main,
          bgColor: alpha(theme.palette.success.main, 0.1)
        };
      case 'loss':
        return {
          icon: <TrendingDownIcon />,
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.1)
        };
      case 'breakeven':
        return {
          icon: <BreakevenIcon />,
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.1)
        };
      default:
        // Fallback to P&L based determination
        if (pnl > 0) {
          return {
            icon: <TrendingUpIcon />,
            color: theme.palette.success.main,
            bgColor: alpha(theme.palette.success.main, 0.1)
          };
        } else if (pnl < 0) {
          return {
            icon: <TrendingDownIcon />,
            color: theme.palette.error.main,
            bgColor: alpha(theme.palette.error.main, 0.1)
          };
        } else {
          return {
            icon: <BreakevenIcon />,
            color: theme.palette.warning.main,
            bgColor: alpha(theme.palette.warning.main, 0.1)
          };
        }
    }
  };
  
  // Load data on mount
  useEffect(() => {
    fetchRecentTrades();
  }, [user?.uid, maxTrades]);
  
  // Render loading state
  if (isLoading) {
    return (
      <Widget
        title="Recent Trades"
        icon={<ListIcon />}
        onRefresh={handleRefresh}
        onConfigure={onConfigure}
        onRemove={onRemove}
        isLoading={true}
        {...props}
      >
        <List sx={{ p: 0 }}>
          {[1, 2, 3].map((item) => (
            <ListItem key={item} sx={{ px: 0 }}>
              <ListItemIcon>
                <Skeleton variant="circular" width={40} height={40} />
              </ListItemIcon>
              <ListItemText
                primary={<Skeleton variant="text" width="60%" />}
                secondary={<Skeleton variant="text" width="40%" />}
              />
            </ListItem>
          ))}
        </List>
      </Widget>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Widget
        title="Recent Trades"
        icon={<ListIcon />}
        onRefresh={handleRefresh}
        onConfigure={onConfigure}
        onRemove={onRemove}
        error={error}
        {...props}
      >
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Widget>
    );
  }
  
  return (
    <Widget
      title="Recent Trades"
      icon={<ListIcon />}
      onRefresh={handleRefresh}
      onConfigure={onConfigure}
      onRemove={onRemove}
      hasSettings={true}
      refreshable={true}
      {...props}
    >
      {trades.length === 0 ? (
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
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              mb: 2
            }}
          >
            <ListIcon />
          </Avatar>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            No trades found
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Start logging your trades to see them here.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddTrade}
            sx={{ 
              mt: 2,
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            Add Trade
          </Button>
        </Box>
      ) : (
        <>
          <List sx={{ p: 0 }}>
            {trades.map((trade, index) => {
              const outcomeDisplay = getOutcomeDisplay(trade.outcome, trade.pnl);
              
              return (
                <React.Fragment key={trade.id}>
                  <ListItem
                    sx={{
                      px: 0,
                      py: compactMode ? 1 : 1.5,
                      cursor: 'pointer',
                      borderRadius: 2,
                      mb: compactMode ? 0.5 : 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.action.hover, 0.5),
                        transform: 'translateX(4px)'
                      }
                    }}
                    onClick={() => handleTradeClick(trade.id)}
                  >
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <Avatar
                        sx={{
                          width: compactMode ? 32 : 40,
                          height: compactMode ? 32 : 40,
                          bgcolor: outcomeDisplay.bgColor,
                          color: outcomeDisplay.color
                        }}
                      >
                        {outcomeDisplay.icon}
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {trade.symbol}
                          </Typography>
                          <Chip
                            label={trade.setupType}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 500
                            }}
                          />
                          {showPnL && (
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: trade.pnl >= 0 ? theme.palette.success.main : theme.palette.error.main,
                                ml: 'auto'
                              }}
                            >
                              {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            {format(trade.date, 'MMM dd, HH:mm')}
                          </Typography>
                          
                          {showActions && (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewChart(trade);
                                }}
                                sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                              >
                                <ChartIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTrade(trade);
                                }}
                                sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  
                  {index < trades.length - 1 && !compactMode && (
                    <Divider sx={{ my: 0.5 }} />
                  )}
                </React.Fragment>
              );
            })}
          </List>
          
          {showActions && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
              <Button
                size="small"
                onClick={handleAddTrade}
                startIcon={<AddIcon />}
                sx={{ fontWeight: 600 }}
              >
                Add Trade
              </Button>
              
              <Button
                size="small"
                endIcon={<ArrowIcon />}
                onClick={() => window.location.href = '/trades'}
                sx={{ fontWeight: 600 }}
              >
                View All
              </Button>
            </Box>
          )}
        </>
      )}
    </Widget>
  );
};

export default RecentTradesWidget;
