import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Divider, 
  IconButton,
  useTheme, 
  alpha 
} from '@mui/material';
import {
  TrendingUp as WinIcon,
  TrendingDown as LossIcon,
  AccessTime as TimeIcon,
  BarChart as ChartIcon,
  Notes as NotesIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';

/**
 * PremiumTradeCard - Enhanced trade display component
 * 
 * @param {Object} props
 * @param {Object} props.trade - Trade data object
 * @param {Function} props.onClick - Click handler for the card
 * @param {Function} props.onViewChart - Handler for viewing trade chart
 * @param {Function} props.onViewNotes - Handler for viewing trade notes
 */
const PremiumTradeCard = ({ 
  trade,
  onClick,
  onViewChart,
  onViewNotes
}) => {
  const theme = useTheme();
  
  // Calculate whether this is a winning trade
  const isWinningTrade = trade.profitLoss > 0;
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };
  
  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Box
      onClick={onClick}
      className="animate-fade-in"
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(
          isWinningTrade ? theme.palette.success.main : theme.palette.error.main, 
          isWinningTrade ? 0.1 : 0.1
        )}`,
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 8px 24px ${alpha(
          isWinningTrade ? theme.palette.success.main : theme.palette.error.main,
          0.05
        )}, 0 4px 8px ${alpha(theme.palette.common.black, 0.05)}`,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 28px ${alpha(
            isWinningTrade ? theme.palette.success.main : theme.palette.error.main,
            0.1
          )}, 0 4px 12px ${alpha(theme.palette.common.black, 0.07)}`,
          '& .trade-highlight-bar': {
            opacity: 1,
            transform: 'scaleY(1)'
          }
        } : {},
      }}
    >
      {/* Colored Top Bar */}
      <Box
        className="trade-highlight-bar"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: isWinningTrade ? theme.palette.success.main : theme.palette.error.main,
          opacity: 0.7,
          transform: 'scaleY(0.5)',
          transformOrigin: 'top',
          transition: 'transform 0.3s ease, opacity 0.3s ease',
        }}
      />
      
      {/* Trade Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2.5,
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '12px',
              backgroundColor: alpha(
                isWinningTrade ? theme.palette.success.main : theme.palette.error.main,
                0.1
              ),
              mr: 2,
              color: isWinningTrade ? theme.palette.success.main : theme.palette.error.main
            }}
          >
            {isWinningTrade ? <WinIcon /> : <LossIcon />}
          </Box>
          
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {trade.symbol} {trade.direction === 'long' ? 'Long' : 'Short'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <TimeIcon sx={{ fontSize: 14, mr: 0.5, color: theme.palette.text.secondary }} />
              <Typography variant="caption" color="text.secondary">
                {formatDate(trade.entryTime)} · {formatTime(trade.entryTime)}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ textAlign: 'right' }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 700,
              color: isWinningTrade ? theme.palette.success.main : theme.palette.error.main
            }}
          >
            {formatCurrency(trade.profitLoss)}
          </Typography>
          
          <Chip
            label={isWinningTrade ? 'Win' : 'Loss'}
            size="small"
            sx={{
              backgroundColor: alpha(
                isWinningTrade ? theme.palette.success.main : theme.palette.error.main,
                0.1
              ),
              color: isWinningTrade ? theme.palette.success.main : theme.palette.error.main,
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24,
              mt: 0.5
            }}
          />
        </Box>
      </Box>
      
      <Divider sx={{ mx: 2.5 }} />
      
      {/* Trade Details */}
      <Box sx={{ p: 2.5, pt: 2 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 2,
          mb: 2
        }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Entry Price
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(trade.entryPrice)}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Exit Price
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(trade.exitPrice)}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Position Size
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {trade.positionSize} units
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Return
            </Typography>
            <Typography 
              variant="body2" 
              fontWeight={600}
              sx={{ 
                color: isWinningTrade ? theme.palette.success.main : theme.palette.error.main 
              }}
            >
              {formatPercentage(trade.percentReturn || 0)}
            </Typography>
          </Box>
        </Box>
        
        {/* Trade Setup Type */}
        {trade.setupType && (
          <Chip
            label={trade.setupType}
            size="small"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: '0.75rem',
              mt: 1
            }}
          />
        )}
        
        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          mt: 2
        }}>
          {onViewNotes && (
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onViewNotes(trade);
              }}
              sx={{ mx: 0.5 }}
            >
              <NotesIcon fontSize="small" />
            </IconButton>
          )}
          
          {onViewChart && (
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onViewChart(trade);
              }}
              sx={{ mx: 0.5 }}
            >
              <ChartIcon fontSize="small" />
            </IconButton>
          )}
          
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              // Handle more options click
            }}
            sx={{ mx: 0.5 }}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default PremiumTradeCard;