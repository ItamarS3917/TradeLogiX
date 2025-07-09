import React from 'react';
import { Box, Paper, Typography, useTheme, alpha } from '@mui/material';

/**
 * PremiumCard - Enhanced card component with premium visual styling
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Optional subtitle text
 * @param {React.ReactNode} props.icon - Optional icon to display
 * @param {React.ReactNode} props.children - Card content
 * @param {number} props.elevation - MUI elevation value (0-24)
 * @param {boolean} props.highlight - Whether to apply highlight styling
 * @param {'default'|'success'|'error'|'warning'|'info'} props.variant - Color variant
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.glowColor - Optional custom glow color (CSS color)
 * @param {Function} props.onClick - Click handler
 * @param {Object} props.sx - Additional MUI sx props
 */
const PremiumCard = ({
  title,
  subtitle,
  icon,
  children,
  elevation = 0,
  highlight = false,
  variant = 'default',
  className = '',
  glowColor,
  onClick,
  sx = {}
}) => {
  const theme = useTheme();
  
  // Determine glow color
  const getGlowColor = () => {
    if (glowColor) return glowColor;
    if (variant === 'success') return theme.palette.success.main;
    if (variant === 'error') return theme.palette.error.main;
    if (variant === 'warning') return theme.palette.warning.main;
    if (variant === 'info') return theme.palette.info.main;
    return theme.palette.primary.main;
  };
  
  return (
    <Paper
      elevation={elevation}
      onClick={onClick}
      className={`premium-card ${highlight ? 'premium-card-highlight' : ''} ${className}`}
      sx={{
        borderRadius: 4,
        border: `1px solid ${
          highlight 
            ? alpha(getGlowColor(), 0.15)
            : alpha(theme.palette.text.primary, 0.06)
        }`,
        backgroundColor: theme.palette.background.paper,
        backgroundImage: highlight 
          ? `linear-gradient(135deg, ${alpha(getGlowColor(), 0.03)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.3)} 100%)`,
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        boxShadow: highlight 
          ? `0 16px 40px ${alpha(getGlowColor(), 0.12)}, 0 8px 16px ${alpha(getGlowColor(), 0.08)}`
          : elevation ? undefined : `0 8px 32px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02)`,
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(8px)',
        '&:hover': onClick ? {
          transform: 'translateY(-6px) scale(1.02)',
          boxShadow: `0 20px 48px ${alpha(getGlowColor(), 0.18)}, 0 12px 24px ${alpha(getGlowColor(), 0.12)}`,
          borderColor: alpha(getGlowColor(), 0.25)
        } : {},
        '&::before': highlight ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: getGlowColor(),
          borderRadius: '4px 4px 0 0',
          boxShadow: `0 4px 12px ${alpha(getGlowColor(), 0.3)}`
        } : {},
        ...sx
      }}
    >
      {/* Gradient glow effect */}
      {highlight && (
        <Box
          className="card-glow"
          sx={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(getGlowColor(), 0.4)} 0%, transparent 70%)`,
            opacity: 0.5,
            transition: 'opacity 0.3s ease',
            filter: 'blur(20px)',
            zIndex: 0
          }}
        />
      )}
      
      {/* Card content container with proper z-index */}
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        {(title || icon) && (
          <Box 
            sx={{ 
              p: 3, 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.default, 0.2)} 100%)`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {icon && (
                <Box 
                  sx={{ 
                    mr: 2,
                    p: 1.5,
                    borderRadius: 3,
                    backgroundColor: alpha(
                      variant !== 'default' 
                        ? theme.palette[variant].main 
                        : theme.palette.primary.main,
                      0.1
                    ),
                    color: variant !== 'default' 
                      ? theme.palette[variant].main 
                      : theme.palette.primary.main,
                    boxShadow: `0 4px 12px ${alpha(
                      variant !== 'default' 
                        ? theme.palette[variant].main 
                        : theme.palette.primary.main,
                      0.2
                    )}`
                  }}
                >
                  {icon}
                </Box>
              )}
              <Box>
                {title && (
                  <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.01em' }}>
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Content */}
        <Box sx={{ p: 3, flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </Paper>
  );
};

export default PremiumCard;