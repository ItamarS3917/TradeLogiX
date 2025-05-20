import React from 'react';
import { 
  Box, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  useTheme, 
  alpha 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * PremiumNavItem - Enhanced navigation item with sophisticated styling
 * 
 * @param {Object} props
 * @param {string} props.path - Destination path
 * @param {string} props.text - Menu item text
 * @param {React.ReactNode} props.icon - Menu item icon
 * @param {boolean} props.dense - Whether to use compact styling
 * @param {Object} props.sx - Additional styling props
 */
const PremiumNavItem = ({ 
  path, 
  text, 
  icon, 
  dense = false,
  sx = {} 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path;
  
  const handleClick = () => {
    navigate(path);
  };
  
  return (
    <ListItem 
      disablePadding 
      sx={{ 
        mb: 0.75,
        ...sx 
      }}
    >
      <ListItemButton 
        onClick={handleClick}
        selected={isActive}
        sx={{ 
          py: dense ? 1 : 1.5,
          px: dense ? 1.5 : 2,
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
          background: isActive ? 
            alpha(theme.palette.primary.main, 0.08) : 
            'transparent',
          '&:hover': {
            background: isActive ? 
              alpha(theme.palette.primary.main, 0.12) : 
              alpha(theme.palette.text.primary, 0.04),
            transform: 'translateX(4px)',
            '& .nav-item-icon': {
              transform: 'scale(1.1)',
              color: isActive ? 
                theme.palette.primary.main : 
                alpha(theme.palette.text.primary, 0.9),
            }
          },
          '&::before': isActive ? {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 4,
            height: '65%',
            borderRadius: '0 4px 4px 0',
            background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.7)} 100%)`,
            boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`,
          } : {},
        }}
      >
        {icon && (
          <ListItemIcon 
            className="nav-item-icon"
            sx={{ 
              minWidth: dense ? 32 : 40, 
              color: isActive ? 
                theme.palette.primary.main : 
                alpha(theme.palette.text.primary, 0.7),
              transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            {icon}
          </ListItemIcon>
        )}
        
        <ListItemText 
          primary={text} 
          primaryTypographyProps={{ 
            fontWeight: isActive ? 700 : 500,
            fontSize: dense ? '0.9rem' : '0.95rem',
          }} 
        />
        
        {isActive && (
          <Box 
            sx={{ 
              width: 6, 
              height: 6, 
              borderRadius: '50%',
              backgroundColor: theme.palette.primary.main,
              ml: 1,
              boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.8)}`
            }} 
          />
        )}
      </ListItemButton>
    </ListItem>
  );
};

export default PremiumNavItem;