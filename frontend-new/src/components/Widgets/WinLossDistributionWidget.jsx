import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import Widget from './Widget';
import { DonutSmall as DonutIcon } from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

/**
 * Win/Loss Distribution Widget - Placeholder component
 */
const WinLossDistributionWidget = ({ 
  settings = {},
  onRefresh,
  onConfigure,
  onRemove,
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <Widget
      title="Win/Loss Distribution"
      icon={<DonutIcon />}
      iconColor="#f57c00"
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      onRemove={onRemove}
      {...props}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 150
      }}>
        <Avatar 
          sx={{ 
            width: 48, 
            height: 48, 
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            color: theme.palette.warning.main,
            mb: 2
          }}
        >
          <DonutIcon />
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Win/Loss Chart
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Pie chart visualization coming soon
        </Typography>
      </Box>
    </Widget>
  );
};

export default WinLossDistributionWidget;
