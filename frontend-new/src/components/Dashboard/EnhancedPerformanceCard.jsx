import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Chip, 
  Tooltip,
  alpha,
  useTheme 
} from '@mui/material';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

/**
 * Enhanced Performance Card Component - REAL DATA ONLY
 * 
 * Displays a performance metric with:
 * - Real data values only
 * - Sparkline chart only when real data is available
 * - Interactive tooltip with detailed information
 * - Visual indicators for positive/negative values
 * - Hover effects for better user interaction
 * 
 * @param {Object} props Component properties
 * @param {string} props.title Card title
 * @param {string|number} props.value Main metric value
 * @param {number} props.trend Percentage change (positive or negative)
 * @param {string} props.previousValue Previous value for comparison
 * @param {Array} props.sparklineData Data points for sparkline chart (null = no chart)
 * @param {string} props.tooltipText Detailed explanation for tooltip
 * @param {Function} props.onClick Click handler for the card
 * @param {React.ReactNode} props.icon Optional icon component
 * @param {string} props.color Color theme ('primary', 'success', 'error', or 'auto')
 */
const EnhancedPerformanceCard = ({ 
  title, 
  value, 
  trend, 
  previousValue,
  sparklineData,
  tooltipText,
  onClick,
  icon,
  color = 'primary'
}) => {
  const theme = useTheme();
  
  // Determine color based on value or specific color prop
  const valueColor = color === 'auto' 
    ? (parseFloat(value) >= 0 ? theme.palette.success.main : theme.palette.error.main)
    : theme.palette[color].main;
  
  // Only show sparkline if real data is provided
  const shouldShowSparkline = sparklineData && Array.isArray(sparklineData) && sparklineData.length > 0;
  
  return (
    <Card 
      sx={{ 
        borderRadius: 4, 
        p: 3, 
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px) scale(1.02)',
          boxShadow: `0 25px 50px ${alpha(valueColor, 0.15)}`,
        },
        background: 'transparent',
        border: 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible'
      }}
      onClick={onClick || (() => {})}
      elevation={0}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.02em' }}>
            {title}
          </Typography>
          <Tooltip 
            title={
              <Typography variant="body2">
                {tooltipText || `Information about ${title}`}
              </Typography>
            }
            arrow
          >
            <InfoIcon sx={{ ml: 1, fontSize: 18, color: 'text.secondary', opacity: 0.7 }} />
          </Tooltip>
        </Box>
        {icon && (
          <Box sx={{ 
            color: valueColor,
            backgroundColor: alpha(valueColor, 0.15),
            width: 40,
            height: 40,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 16px ${alpha(valueColor, 0.2)}`
          }}>
            {icon}
          </Box>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 'auto' }}>
        <Box>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 900, 
              color: valueColor,
              lineHeight: 1.1,
              fontSize: { xs: '1.8rem', sm: '2.2rem' },
              letterSpacing: '-0.02em',
              background: `linear-gradient(135deg, ${valueColor} 0%, ${alpha(valueColor, 0.8)} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {value}
          </Typography>
          
          {trend !== null && trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Chip 
                label={`${trend > 0 ? '+' : ''}${trend}%`}
                size="medium"
                color={trend >= 0 ? "success" : "error"}
                sx={{ 
                  height: 28, 
                  fontSize: '0.8rem', 
                  fontWeight: 700,
                  borderRadius: 2,
                  '& .MuiChip-label': {
                    px: 1.5
                  }
                }}
              />
              
              {previousValue && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1.5, fontWeight: 500 }}>
                  vs. {previousValue}
                </Typography>
              )}
            </Box>
          )}
          
          {/* Show message when no real data */}
          {!shouldShowSparkline && (trend === null || trend === undefined) && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: 'block', fontWeight: 500, opacity: 0.7 }}>
              Real data only
            </Typography>
          )}
        </Box>
        
        {/* Sparkline Chart - Only shown when real data is available */}
        {shouldShowSparkline && (
          <Box sx={{ width: 100, height: 50 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={trend >= 0 ? theme.palette.success.main : theme.palette.error.main} 
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
        
        {/* Placeholder when no sparkline data */}
        {!shouldShowSparkline && (
          <Box sx={{ 
            width: 100, 
            height: 50, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.text.primary, 0.03),
            borderRadius: 2,
            border: `2px dashed ${alpha(theme.palette.text.primary, 0.08)}`
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
              No trend data
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default EnhancedPerformanceCard;