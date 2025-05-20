import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  useTheme, 
  alpha,
  LinearProgress,
  IconButton,
  ButtonBase
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * ResponsivePerformanceCard - An enhanced performance card with responsive design
 * 
 * Features:
 * - Optimized layout for mobile, tablet, and desktop
 * - Interactive hover effects with mouse position tracking
 * - Smooth animations and transitions
 * - Accessibility improvements
 * - Touch-friendly design for mobile
 */
const ResponsivePerformanceCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  isLoading = false, 
  color = 'primary', 
  onClick,
  description,
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const theme = useTheme();
  const isPositive = typeof trend === 'number' ? trend >= 0 : null;
  const isMobile = size === 'small';
  
  // Handle info tooltip toggle
  const [showInfo, setShowInfo] = React.useState(false);
  const handleInfoClick = (e) => {
    e.stopPropagation();
    setShowInfo(!showInfo);
  };
  
  // Scale padding based on size prop
  const getPadding = () => {
    switch(size) {
      case 'small': return { p: 2 };
      case 'large': return { p: 4 };
      default: return { p: 3 };
    }
  };
  
  // Core card component
  const card = (
    <ButtonBase
      component="div"
      onClick={onClick}
      disabled={!onClick}
      sx={{ 
        display: 'block',
        width: '100%',
        textAlign: 'left',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        backgroundColor: alpha(theme.palette[color].main, theme.palette.mode === 'dark' ? 0.07 : 0.03),
        border: `1px solid ${alpha(theme.palette[color].main, theme.palette.mode === 'dark' ? 0.15 : 0.1)}`,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(theme.palette[color].main, 0.15)}`,
          '&::after': {
            opacity: 1
          }
        } : {},
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${alpha(theme.palette[color].main, 0.1)}, transparent 40%)`,
          opacity: 0,
          transition: 'opacity 0.3s',
          zIndex: 0
        },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette[color].main}`,
          outlineOffset: 2
        }
      }}
      onMouseMove={(e) => {
        if (!onClick) return;
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }}
      aria-label={`${title}: ${value}${trend ? `, ${trend > 0 ? 'up' : 'down'} ${Math.abs(trend)}%` : ''}`}
    >
      {/* Loading indicator */}
      {isLoading && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%',
            height: '3px',
            borderTopLeftRadius: theme.shape.borderRadius,
            borderTopRightRadius: theme.shape.borderRadius,
            zIndex: 2
          }} 
          color={color}
        />
      )}
      
      {/* Card Content */}
      <Box sx={{ 
        ...getPadding(), 
        height: '100%', 
        position: 'relative', 
        zIndex: 1,
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        alignItems: isMobile ? 'center' : 'flex-start',
        justifyContent: isMobile ? 'space-between' : 'flex-start',
      }}>
        {/* Card Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: isMobile ? 'auto' : '100%',
          mb: isMobile ? 0 : 2,
          flexShrink: 0
        }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              fontSize: '0.7rem', 
              letterSpacing: '0.05em',
              color: alpha(theme.palette.text.primary, 0.6),
              mr: isMobile ? 1.5 : 0
            }}
          >
            {title}
          </Typography>
          
          {!isMobile && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: 36, 
                height: 36, 
                borderRadius: '50%', 
                background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.12)} 0%, ${alpha(theme.palette[color].main, 0.2)} 100%)`,
                color: theme.palette[color].main,
                boxShadow: `0 4px 12px ${alpha(theme.palette[color].main, 0.2)}`
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
        
        {/* Card Value */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isMobile ? 'center' : 'flex-start' 
        }}>
          <Typography 
            variant={isMobile ? "h6" : "h3"}
            sx={{ 
              mb: 0.5, 
              fontWeight: 800, 
              color: theme.palette.text.primary,
              fontSize: isMobile ? '1.1rem' : '2rem',
              display: 'flex',
              alignItems: isMobile ? 'center' : 'flex-end',
              gap: 1,
              lineHeight: 1.2
            }}
          >
            <span className={`currency ${isMobile ? 'currency-sm' : ''}`}>
              {value}
            </span>
            
            {trend !== null && !isMobile && (
              <Chip
                size="small"
                icon={isPositive ? <TrendingUpIcon style={{ fontSize: '14px' }} /> : <TrendingDownIcon style={{ fontSize: '14px' }} />}
                label={`${isPositive ? '+' : ''}${trend}%`}
                color={isPositive ? 'success' : 'error'}
                sx={{ 
                  height: '22px', 
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  mb: 0.5,
                  '& .MuiChip-label': { px: 0.7 },
                  boxShadow: `0 2px 8px ${alpha(isPositive ? theme.palette.success.main : theme.palette.error.main, 0.25)}`
                }}
              />
            )}
          </Typography>
          
          {subtitle && !isMobile && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.85rem', 
                fontWeight: 500, 
                mt: 0.5,
                opacity: 0.8
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {/* Mobile trend indicator */}
        {trend !== null && isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            <Chip
              size="small"
              icon={isPositive ? <TrendingUpIcon style={{ fontSize: '12px' }} /> : <TrendingDownIcon style={{ fontSize: '12px' }} />}
              label={`${isPositive ? '+' : ''}${trend}%`}
              color={isPositive ? 'success' : 'error'}
              sx={{ 
                height: '20px', 
                fontSize: '0.65rem',
                fontWeight: 700,
                '& .MuiChip-label': { px: 0.7 },
                boxShadow: `0 2px 8px ${alpha(isPositive ? theme.palette.success.main : theme.palette.error.main, 0.25)}`
              }}
            />
          </Box>
        )}
        
        {/* Info Button (conditionally rendered) */}
        {description && (
          <IconButton 
            size="small" 
            color="inherit"
            onClick={handleInfoClick}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: alpha(theme.palette.text.primary, 0.4),
              zIndex: 2,
              '&:hover': {
                color: theme.palette[color].main,
                backgroundColor: alpha(theme.palette[color].main, 0.1)
              }
            }}
            aria-label="Show more information"
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        )}
        
        {/* Info Tooltip/Popup */}
        {showInfo && description && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(4px)',
              zIndex: 3,
              p: 2.5,
              borderRadius: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              animation: 'fadeIn 0.2s ease-out',
              '@keyframes fadeIn': {
                from: { opacity: 0 },
                to: { opacity: 1 }
              }
            }}
            onClick={handleInfoClick}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="body2">
              {description}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 'auto', 
                pt: 1, 
                textAlign: 'center',
                color: theme.palette.text.secondary
              }}
            >
              Tap to close
            </Typography>
          </Box>
        )}
      </Box>
    </ButtonBase>
  );
  
  return card;
};

export default ResponsivePerformanceCard;
