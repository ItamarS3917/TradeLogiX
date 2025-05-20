import React from 'react';
import { Box, Typography, useTheme, alpha, CircularProgress } from '@mui/material';

/**
 * PremiumChartContainer - Enhanced chart wrapper with premium styling
 * 
 * @param {Object} props
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Optional subtitle
 * @param {number} props.height - Container height in pixels
 * @param {React.ReactNode} props.children - Chart content
 * @param {React.ReactNode} props.tools - Optional toolbar controls
 * @param {boolean} props.loading - Loading state
 */
const PremiumChartContainer = ({ 
  title, 
  subtitle, 
  height = 400, 
  children, 
  tools,
  loading = false
}) => {
  const theme = useTheme();
  
  return (
    <Box
      className="animate-fade-in"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        overflow: 'hidden',
        background: theme.palette.background.paper,
        position: 'relative',
        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.05)}, 0 4px 8px ${alpha(theme.palette.common.black, 0.05)}`,
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.08)}, 0 4px 12px ${alpha(theme.palette.common.black, 0.07)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.text.primary, 0.05)}, transparent)`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.text.primary, 0.05)}, transparent)`,
        }
      }}
    >
      {/* Chart Header */}
      {(title || subtitle) && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
            background: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box>
            {title && (
              <Typography variant="subtitle1" fontWeight={600}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          
          {tools && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {tools}
            </Box>
          )}
        </Box>
      )}
      
      {/* Chart Content */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          minHeight: height, 
          position: 'relative',
          background: theme.palette.mode === 'dark' 
            ? `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.background.paper, 0.5)} 0%, ${theme.palette.background.paper} 100%)`
            : theme.palette.background.paper
        }}
      >
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%' 
          }}>
            <CircularProgress size={40} color="primary" sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading chart data...
            </Typography>
          </Box>
        ) : children}
      </Box>
    </Box>
  );
};

export default PremiumChartContainer;