// Placeholder widgets - these will be expanded in future development

import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import Widget from './Widget';
import { 
  BarChart as BarChartIcon,
  AccessTime as TimeIcon,
  CalendarMonth as HeatmapIcon,
  ScatterPlot as ScatterIcon,
  TrendingDown as DrawdownIcon,
  Notes as NotesIcon,
  Public as MarketIcon,
  PlayArrow as QuickIcon
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

// Setup Performance Widget
export const SetupPerformanceWidget = ({ settings = {}, onRefresh, onConfigure, onRemove, ...props }) => {
  const theme = useTheme();
  
  return (
    <Widget
      title="Setup Performance"
      icon={<BarChartIcon />}
      iconColor="#388e3c"
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      onRemove={onRemove}
      {...props}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 150 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, mb: 2 }}>
          <BarChartIcon />
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Setup Analysis</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">Performance by setup type coming soon</Typography>
      </Box>
    </Widget>
  );
};

// Time of Day Widget
export const TimeOfDayWidget = ({ settings = {}, onRefresh, onConfigure, onRemove, ...props }) => {
  const theme = useTheme();
  
  return (
    <Widget
      title="Time of Day Performance"
      icon={<TimeIcon />}
      iconColor="#1976d2"
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      onRemove={onRemove}
      {...props}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 150 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, mb: 2 }}>
          <TimeIcon />
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Hourly Performance</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">Time-based analysis coming soon</Typography>
      </Box>
    </Widget>
  );
};

// Calendar Heatmap Widget
export const CalendarHeatmapWidget = ({ settings = {}, onRefresh, onConfigure, onRemove, ...props }) => {
  const theme = useTheme();
  
  return (
    <Widget
      title="Performance Calendar"
      icon={<HeatmapIcon />}
      iconColor="#e91e63"
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      onRemove={onRemove}
      {...props}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 150 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main, mb: 2 }}>
          <HeatmapIcon />
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Calendar Heatmap</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">Daily performance heatmap coming soon</Typography>
      </Box>
    </Widget>
  );
};

// Correlation Matrix Widget
export const CorrelationMatrixWidget = ({ settings = {}, onRefresh, onConfigure, onRemove, ...props }) => {
  const theme = useTheme();
  
  return (
    <Widget
      title="Correlation Matrix"
      icon={<ScatterIcon />}
      iconColor="#7b1fa2"
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      onRemove={onRemove}
      {...props}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 150 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: alpha('#7b1fa2', 0.1), color: '#7b1fa2', mb: 2 }}>
          <ScatterIcon />
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Correlation Analysis</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">Metric correlations coming soon</Typography>
      </Box>
    </Widget>
  );
};

// Drawdown Widget
export const DrawdownWidget = ({ settings = {}, onRefresh, onConfigure, onRemove, ...props }) => {
  const theme = useTheme();
  
  return (
    <Widget
      title="Drawdown Analysis"
      icon={<DrawdownIcon />}
      iconColor="#d32f2f"
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      onRemove={onRemove}
      {...props}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 150 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, mb: 2 }}>
          <DrawdownIcon />
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Drawdown Chart</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">Risk analysis coming soon</Typography>
      </Box>
    </Widget>
  );
};

// Trading Notes Widget
export const TradingNotesWidget = ({ settings = {}, onRefresh, onConfigure, onRemove, ...props }) => {
  const theme = useTheme();
  
  return (
    <Widget
      title="Trading Notes"
      icon={<NotesIcon />}
      iconColor="#795548"
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      onRemove={onRemove}
      {...props}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 150 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: alpha('#795548', 0.1), color: '#795548', mb: 2 }}>
          <NotesIcon />
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Quick Notes</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">Journal entries coming soon</Typography>
      </Box>
    </Widget>
  );
};

// Market Status Widget
export const MarketStatusWidget = ({ settings = {}, onRefresh, onConfigure, onRemove, ...props }) => {
  const theme = useTheme();
  
  return (
    <Widget
      title="Market Status"
      icon={<MarketIcon />}
      iconColor="#ff9800"
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      onRemove={onRemove}
      {...props}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 150 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, mb: 2 }}>
          <MarketIcon />
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Market Status</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">Market info coming soon</Typography>
      </Box>
    </Widget>
  );
};

// Quick Actions Widget
export const QuickActionsWidget = ({ settings = {}, onRefresh, onConfigure, onRemove, ...props }) => {
  const theme = useTheme();
  
  return (
    <Widget
      title="Quick Actions"
      icon={<QuickIcon />}
      iconColor="#4caf50"
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      onRemove={onRemove}
      {...props}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 150 }}>
        <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, mb: 2 }}>
          <QuickIcon />
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>Quick Actions</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">Action shortcuts coming soon</Typography>
      </Box>
    </Widget>
  );
};

// Default export for the setup performance widget
export default {
  SetupPerformanceWidget,
  TimeOfDayWidget,
  CalendarHeatmapWidget,
  CorrelationMatrixWidget,
  DrawdownWidget,
  TradingNotesWidget,
  MarketStatusWidget,
  QuickActionsWidget
};
