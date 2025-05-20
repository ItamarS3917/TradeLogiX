import React from 'react';
import { 
  Box, 
  Typography, 
  useTheme, 
  alpha,
  Tooltip,
  IconButton
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

/**
 * PerformanceCard - Enhanced metric display card component
 * 
 * @param {Object} props
 * @param {string} props.title - Metric title
 * @param {number|string} props.value - Current value
 * @param {number|string} props.previousValue - Previous value for comparison
 * @param {number} props.percentChange - Percent change (positive or negative)
 * @param {React.ReactNode} props.icon - Optional icon
 * @param {'primary'|'success'|'error'|'warning'|'info'|'auto'} props.color - Card color theme
 * @param {string} props.tooltip - Optional tooltip content
 * @param {Function} props.formatValue - Optional formatter for displayed value
 */
const PerformanceCard = ({
  title,
  value,
  previousValue,
  percentChange,
  icon,
  color = 'primary',
  tooltip,
  formatValue = (val) => val,
}) => {
  const theme = useTheme();
  
  // Calculate change direction
  const isPositive = percentChange > 0;
  const isNegative = percentChange < 0;
  const isNeutral = percentChange === 0 || percentChange === undefined;
  
  // Determine color
  const getColor = () => {
    if (color === 'auto') {
      return isPositive ? theme.palette.success.main :
             isNegative ? theme.palette.error.main :
             theme.palette.primary.main;
    }
    return theme.palette[color].main;
  };
  
  // Format percentage
  const formatPercent = (percent) => {
    if (percent === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(Math.abs(percent) / 100);
  };
  
  return (
    <Box
      className="animate-fade-in"
      sx={{
        p: 2.5,
        borderRadius: 3,
        background: alpha(getColor(), 0.03),
        border: `1px solid ${alpha(getColor(), 0.1)}`,
        boxShadow: `0 8px 24px ${alpha(getColor(), 0.05)}, 0 4px 8px ${alpha(theme.palette.common.black, 0.05)}`,
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 28px ${alpha(getColor(), 0.08)}, 0 4px 12px ${alpha(theme.palette.common.black, 0.07)}`,
          '& .card-glow': {
            opacity: 0.8,
          }
        },
      }}
    >
      {/* Gradient glow effect */}
      <Box
        className="card-glow"
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(getColor(), 0.4)} 0%, transparent 70%)`,
          opacity: 0.5,
          transition: 'opacity 0.3s ease',
          filter: 'blur(20px)',
          zIndex: 0
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {icon && (
              <Box 
                sx={{ 
                  mr: 1.5, 
                  color: getColor(),
                  display: 'flex'
                }}
              >
                {icon}
              </Box>
            )}
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              {title}
            </Typography>
          </Box>
          
          {tooltip && (
            <Tooltip title={tooltip}>
              <IconButton size="small" sx={{ p: 0, color: alpha(theme.palette.text.primary, 0.4) }}>
                <InfoIcon fontSize="small" sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        {/* Value */}
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            fontSize: '1.75rem',
            mb: 0.5,
            letterSpacing: -0.5,
          }}
        >
          {formatValue(value)}
        </Typography>
        
        {/* Change */}
        {!isNeutral && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: alpha(
                  isPositive ? theme.palette.success.main : theme.palette.error.main,
                  0.1
                ),
                color: isPositive ? theme.palette.success.main : theme.palette.error.main,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {isPositive ? '+' : ''}{formatPercent(percentChange)}
            </Box>
            
            {previousValue !== undefined && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                vs. {formatValue(previousValue)}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PerformanceCard;