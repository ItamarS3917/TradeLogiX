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
 * Enhanced Performance Card Component
 * 
 * Displays a performance metric with:
 * - Sparkline mini-chart showing trend
 * - Interactive tooltip with detailed information
 * - Visual indicators for positive/negative values
 * - Hover effects for better user interaction
 * 
 * @param {Object} props Component properties
 * @param {string} props.title Card title
 * @param {string|number} props.value Main metric value
 * @param {number} props.trend Percentage change (positive or negative)
 * @param {string} props.previousValue Previous value for comparison
 * @param {Array} props.sparklineData Data points for sparkline chart
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
  
  // Generate sparkline data if not provided
  const chartData = sparklineData || generateMockSparklineData(trend);
  
  return (
    <Card 
      sx={{ 
        borderRadius: 2, 
        p: 2, 
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
        background: `linear-gradient(135deg, ${alpha(valueColor, 0.02)} 0%, ${alpha(valueColor, 0.07)} 100%)`,
        border: `1px solid ${alpha(valueColor, 0.1)}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={onClick || (() => {})}
      elevation={0}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
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
            <InfoIcon sx={{ ml: 0.5, fontSize: 16, color: 'text.secondary' }} />
          </Tooltip>
        </Box>
        {icon && (
          <Box sx={{ 
            color: valueColor,
            backgroundColor: alpha(valueColor, 0.1),
            width: 32,
            height: 32,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 'auto' }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: valueColor,
              lineHeight: 1.2
            }}
          >
            {value}
          </Typography>
          
          {trend !== null && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Chip 
                label={`${trend > 0 ? '+' : ''}${trend}%`}
                size="small"
                color={trend >= 0 ? "success" : "error"}
                sx={{ 
                  height: 20, 
                  fontSize: '0.7rem', 
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
              
              {previousValue && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  vs. {previousValue}
                </Typography>
              )}
            </Box>
          )}
        </Box>
        
        {/* Sparkline Chart */}
        <Box sx={{ width: 80, height: 40 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={trend >= 0 ? theme.palette.success.main : theme.palette.error.main} 
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Card>
  );
};

/**
 * Generate mock data for sparkline chart
 * @param {number} trend - Trend direction and magnitude (percentage)
 * @returns {Array} - Array of data points for the sparkline
 */
const generateMockSparklineData = (trend = 0) => {
  const dataPoints = 10;
  const data = [];
  
  // Generate data with a general trend direction
  let value = 100;
  for (let i = 0; i < dataPoints; i++) {
    // Add some randomness but maintain the general trend direction
    const change = (Math.random() * 10 - 5) + (trend / 10);
    value += change;
    data.push({ value: Math.max(0, value) });
  }
  
  return data;
};

export default EnhancedPerformanceCard;