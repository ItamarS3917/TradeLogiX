import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  alpha, 
  useTheme, 
  Chip,
  CircularProgress
} from '@mui/material';
import { useMobile } from '../../../contexts/MobileContext';
import { ResponsiveTouchContainer } from '../Responsive';

/**
 * Enhanced responsive performance card component optimized for mobile devices
 * 
 * Features:
 * - Responsive sizing for mobile, tablet, and desktop
 * - Touch-optimized gestures for mobile interactions
 * - Optimized visual display for different screen sizes
 * - Premium animation and visual effects
 * - Supports trend indicators and loading states
 * 
 * Props:
 * - title: card title
 * - value: main value to display
 * - subtitle: optional subtitle or additional context
 * - trend: numerical trend value
 * - trendLabel: optional text label for the trend
 * - icon: optional icon component
 * - color: optional color override (uses theme colors by default)
 * - loading: boolean indicating loading state
 * - variant: visual variant ('default', 'compact', 'minimal')
 * - onClick: click handler
 * - onSwipeLeft: handler for swipe left gesture (mobile/tablet only)
 * - onSwipeRight: handler for swipe right gesture (mobile/tablet only)
 */
const EnhancedResponsivePerformanceCard = ({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon: Icon,
  color,
  loading = false,
  variant = 'default',
  onClick,
  onSwipeLeft,
  onSwipeRight,
  ...props
}) => {
  const theme = useTheme();
  const { isMobile, isTablet } = useMobile();
  
  // Determine if compact display is needed
  const isCompact = variant === 'compact' || isMobile;
  const isMinimal = variant === 'minimal';
  
  // Determine color based on trend or provided color
  const cardColor = color || (
    trend > 0 ? theme.palette.trading.positive :
    trend < 0 ? theme.palette.trading.negative :
    theme.palette.primary.main
  );
  
  // Handle both positive and negative trends for display
  const trendDisplay = trend !== undefined ? 
    `${trend >= 0 ? '+' : ''}${trend}${typeof trend === 'number' ? '%' : ''}` : 
    null;
  
  // Box shadow with subtle glow effect based on color
  const boxShadow = `0 4px 20px ${alpha(cardColor, theme.palette.mode === 'dark' ? 0.3 : 0.1)}`;
  
  // Handle click with ripple effect
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };
  
  return (
    <ResponsiveTouchContainer
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default' 
      }}
    >
      <Card 
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
          borderRadius: isCompact ? '12px' : '16px',
          boxShadow,
          border: `1px solid ${alpha(cardColor, theme.palette.mode === 'dark' ? 0.3 : 0.1)}`,
          '&:hover': onClick ? {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 30px ${alpha(cardColor, theme.palette.mode === 'dark' ? 0.4 : 0.15)}`,
          } : {},
          ...(isMinimal && {
            background: 'transparent',
            boxShadow: 'none',
            border: 'none'
          })
        }}
        onClick={handleClick}
        {...props}
      >
        {/* Card glow effect */}
        {!isMinimal && (
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
              opacity: 0.1,
              background: `radial-gradient(circle at 50% 0%, ${cardColor}, transparent 70%)`,
              transition: 'opacity 0.3s ease',
              '&:hover': {
                opacity: 0.15
              }
            }}
          />
        )}
        
        <CardContent sx={{ 
          position: 'relative', 
          zIndex: 1,
          display: 'flex',
          flexDirection: isCompact ? 'row' : 'column',
          alignItems: isCompact ? 'center' : 'flex-start',
          justifyContent: isCompact ? 'space-between' : 'flex-start',
          flex: 1,
          padding: isCompact ? '12px 16px' : '16px 20px',
          '&:last-child': {
            paddingBottom: isCompact ? '12px' : '20px'
          }
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            width: isCompact ? '70%' : '100%'
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: isCompact ? 0.5 : 1 
            }}>
              {Icon && (
                <Box 
                  component="span" 
                  sx={{ 
                    mr: 1, 
                    display: 'flex', 
                    color: alpha(cardColor, 0.9),
                    fontSize: isCompact ? 18 : 22
                  }}
                >
                  <Icon fontSize="inherit" />
                </Box>
              )}
              <Typography 
                variant={isCompact ? "body2" : "subtitle1"}
                color="text.secondary"
                fontWeight={500}
                noWrap
              >
                {title}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'baseline'
            }}>
              {loading ? (
                <CircularProgress 
                  size={isCompact ? 24 : 32} 
                  sx={{ color: cardColor, my: 1 }} 
                />
              ) : (
                <Typography 
                  variant={isCompact ? "h6" : "h4"} 
                  component="div"
                  fontWeight={600}
                  sx={{ 
                    color: theme.palette.text.primary,
                    letterSpacing: '-0.02em'
                  }}
                >
                  {value}
                </Typography>
              )}
              
              {subtitle && !isCompact && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            {subtitle && isCompact && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                noWrap
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          
          {trendDisplay && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: isCompact ? 'flex-end' : 'flex-start',
              mt: isCompact ? 0 : 1
            }}>
              <Chip
                label={trendDisplay}
                size={isCompact ? "small" : "medium"}
                sx={{
                  backgroundColor: alpha(cardColor, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                  color: cardColor,
                  fontWeight: 600,
                  borderRadius: '6px',
                  '.MuiChip-label': {
                    px: 1
                  }
                }}
              />
              
              {trendLabel && (
                <Typography 
                  variant="caption"
                  color="text.secondary"
                  sx={{ 
                    mt: 0.5, 
                    textAlign: isCompact ? 'right' : 'left', 
                    width: '100%' 
                  }}
                >
                  {trendLabel}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </ResponsiveTouchContainer>
  );
};

EnhancedResponsivePerformanceCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subtitle: PropTypes.string,
  trend: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  trendLabel: PropTypes.string,
  icon: PropTypes.elementType,
  color: PropTypes.string,
  loading: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'compact', 'minimal']),
  onClick: PropTypes.func,
  onSwipeLeft: PropTypes.func,
  onSwipeRight: PropTypes.func
};

export default EnhancedResponsivePerformanceCard;