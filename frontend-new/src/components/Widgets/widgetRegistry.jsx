import React from 'react';
import {
  ShowChart as ChartIcon,
  Timeline as TimelineIcon,
  DonutSmall as DonutIcon,
  BarChart as BarChartIcon,
  AccessTime as TimeIcon,
  CalendarMonth as HeatmapIcon,
  ScatterPlot as ScatterIcon,
  TrendingDown as DrawdownIcon,
  Notes as NotesIcon,
  MonetizationOn as MoneyIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  List as ListIcon,
  Notifications as AlertIcon,
  PlayArrow as QuickIcon,
  Public as MarketIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material';

// Import widget components (we'll create these)
import PerformanceMetricsWidget from './PerformanceMetricsWidget';
import RecentTradesWidget from './RecentTradesWidget';
import TradeSageInsightsWidget from './TradeSageInsightsWidget';
import PerformanceChartWidget from './PerformanceChartWidget';
import WinLossDistributionWidget from './WinLossDistributionWidget';
import SetupPerformanceWidget from './SetupPerformanceWidget';
import TimeOfDayWidget from './TimeOfDayWidget';
import CalendarHeatmapWidget from './CalendarHeatmapWidget';
import CorrelationMatrixWidget from './CorrelationMatrixWidget';
import DrawdownWidget from './DrawdownWidget';
import TradingNotesWidget from './TradingNotesWidget';
import MarketStatusWidget from './MarketStatusWidget';
import QuickActionsWidget from './QuickActionsWidget';

/**
 * Widget Registry - Central configuration for all available dashboard widgets
 */

// Widget categories for organization
export const WIDGET_CATEGORIES = {
  PERFORMANCE: 'performance',
  CHARTS: 'charts',
  ANALYSIS: 'analysis',
  UTILITIES: 'utilities',
  AI_INSIGHTS: 'ai-insights'
};

// Widget priority levels
export const WIDGET_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Widget size presets
export const WIDGET_SIZES = {
  SMALL: { w: 3, h: 3, minW: 2, minH: 2, maxW: 6, maxH: 6 },
  MEDIUM: { w: 6, h: 4, minW: 3, minH: 3, maxW: 12, maxH: 8 },
  LARGE: { w: 12, h: 6, minW: 6, minH: 4, maxW: 12, maxH: 12 },
  WIDE: { w: 8, h: 3, minW: 4, minH: 2, maxW: 12, maxH: 6 },
  TALL: { w: 4, h: 8, minW: 3, minH: 6, maxW: 6, maxH: 12 }
};

/**
 * Widget Registry - All available widgets for the dashboard
 */
const widgetRegistry = {
  // Performance Metrics Widgets
  'performance-overview': {
    id: 'performance-overview',
    title: 'Performance Overview',
    description: 'Key performance metrics including win rate, P&L, and statistics',
    category: WIDGET_CATEGORIES.PERFORMANCE,
    priority: WIDGET_PRIORITIES.HIGH,
    icon: <SpeedIcon />,
    iconColor: '#1976d2',
    component: PerformanceMetricsWidget,
    defaultSize: WIDGET_SIZES.LARGE,
    refreshable: true,
    configurable: true,
    tags: ['metrics', 'performance', 'overview'],
    settings: {
      showSparklines: true,
      timeframe: '1M',
      metrics: ['winRate', 'totalPnL', 'todayPnL', 'weeklyPnL']
    },
    settingsSchema: [
      {
        key: 'showSparklines',
        type: 'boolean',
        label: 'Show Sparkline Charts',
        description: 'Display mini trend charts in metric cards'
      },
      {
        key: 'timeframe',
        type: 'select',
        label: 'Default Timeframe',
        options: ['1D', '1W', '1M', '3M', '1Y'],
        description: 'Default time period for metrics calculation'
      }
    ]
  },

  'recent-trades': {
    id: 'recent-trades',
    title: 'Recent Trades',
    description: 'List of most recent trading activities with quick actions',
    category: WIDGET_CATEGORIES.PERFORMANCE,
    priority: WIDGET_PRIORITIES.HIGH,
    icon: <ListIcon />,
    iconColor: '#2e7d32',
    component: RecentTradesWidget,
    defaultSize: WIDGET_SIZES.MEDIUM,
    refreshable: true,
    configurable: true,
    tags: ['trades', 'recent', 'activity'],
    settings: {
      maxTrades: 5,
      showPnL: true,
      showScreenshots: true
    },
    settingsSchema: [
      {
        key: 'maxTrades',
        type: 'number',
        label: 'Maximum Trades to Show',
        min: 3,
        max: 20,
        description: 'Number of recent trades to display'
      },
      {
        key: 'showPnL',
        type: 'boolean',
        label: 'Show P&L in List',
        description: 'Display profit/loss for each trade'
      }
    ]
  },

  'tradesage-insights': {
    id: 'tradesage-insights',
    title: 'TradeSage AI Insights',
    description: 'AI-powered insights and recommendations for your trading',
    category: WIDGET_CATEGORIES.AI_INSIGHTS,
    priority: WIDGET_PRIORITIES.HIGH,
    icon: <PsychologyIcon />,
    iconColor: '#7c4dff',
    component: TradeSageInsightsWidget,
    defaultSize: WIDGET_SIZES.MEDIUM,
    refreshable: true,
    configurable: true,
    tags: ['ai', 'insights', 'recommendations'],
    settings: {
      maxInsights: 3,
      autoRefresh: true,
      refreshInterval: 300000,
      showConfidence: true
    },
    settingsSchema: [
      {
        key: 'maxInsights',
        type: 'number',
        label: 'Maximum Insights',
        min: 1,
        max: 10,
        description: 'Number of insights to display'
      },
      {
        key: 'autoRefresh',
        type: 'boolean',
        label: 'Auto Refresh',
        description: 'Automatically refresh insights periodically'
      }
    ]
  },

  'performance-chart': {
    id: 'performance-chart',
    title: 'Performance Chart',
    description: 'Interactive chart showing trading performance over time',
    category: WIDGET_CATEGORIES.CHARTS,
    priority: WIDGET_PRIORITIES.HIGH,
    icon: <ChartIcon />,
    iconColor: '#1976d2',
    component: PerformanceChartWidget,
    defaultSize: WIDGET_SIZES.LARGE,
    refreshable: true,
    configurable: true,
    tags: ['chart', 'performance', 'trends'],
    settings: {
      chartType: 'area',
      timeframe: '1M',
      showMovingAverage: false,
      metric: 'cumulativePnL'
    },
    settingsSchema: [
      {
        key: 'chartType',
        type: 'select',
        label: 'Chart Type',
        options: ['area', 'line', 'bar', 'candlestick'],
        description: 'Visual style for the chart'
      },
      {
        key: 'showMovingAverage',
        type: 'boolean',
        label: 'Show Moving Average',
        description: 'Display moving average line on chart'
      }
    ]
  },

  'win-loss-distribution': {
    id: 'win-loss-distribution',
    title: 'Win/Loss Distribution',
    description: 'Pie chart showing the distribution of winning vs losing trades',
    category: WIDGET_CATEGORIES.ANALYSIS,
    priority: WIDGET_PRIORITIES.MEDIUM,
    icon: <DonutIcon />,
    iconColor: '#f57c00',
    component: WinLossDistributionWidget,
    defaultSize: WIDGET_SIZES.SMALL,
    refreshable: true,
    configurable: false,
    tags: ['distribution', 'wins', 'losses', 'pie-chart']
  },

  'setup-performance': {
    id: 'setup-performance',
    title: 'Setup Performance',
    description: 'Performance breakdown by trading setup type',
    category: WIDGET_CATEGORIES.ANALYSIS,
    priority: WIDGET_PRIORITIES.MEDIUM,
    icon: <BarChartIcon />,
    iconColor: '#388e3c',
    component: SetupPerformanceWidget,
    defaultSize: WIDGET_SIZES.MEDIUM,
    refreshable: true,
    configurable: true,
    tags: ['setups', 'performance', 'analysis'],
    settings: {
      showWinRate: true,
      showAvgPnL: true,
      maxSetups: 10
    }
  },

  'time-of-day': {
    id: 'time-of-day',
    title: 'Time of Day Performance',
    description: 'Trading performance analyzed by time of day',
    category: WIDGET_CATEGORIES.ANALYSIS,
    priority: WIDGET_PRIORITIES.MEDIUM,
    icon: <TimeIcon />,
    iconColor: '#1976d2',
    component: TimeOfDayWidget,
    defaultSize: WIDGET_SIZES.MEDIUM,
    refreshable: true,
    configurable: false,
    tags: ['time', 'hourly', 'performance']
  },

  'calendar-heatmap': {
    id: 'calendar-heatmap',
    title: 'Performance Calendar',
    description: 'Calendar heatmap showing daily trading performance',
    category: WIDGET_CATEGORIES.CHARTS,
    priority: WIDGET_PRIORITIES.MEDIUM,
    icon: <HeatmapIcon />,
    iconColor: '#e91e63',
    component: CalendarHeatmapWidget,
    defaultSize: WIDGET_SIZES.LARGE,
    refreshable: true,
    configurable: true,
    tags: ['calendar', 'heatmap', 'daily'],
    settings: {
      months: 3,
      colorScheme: 'blue'
    }
  },

  'correlation-matrix': {
    id: 'correlation-matrix',
    title: 'Correlation Matrix',
    description: 'Correlation analysis between different trading metrics',
    category: WIDGET_CATEGORIES.ANALYSIS,
    priority: WIDGET_PRIORITIES.LOW,
    icon: <ScatterIcon />,
    iconColor: '#7b1fa2',
    component: CorrelationMatrixWidget,
    defaultSize: WIDGET_SIZES.MEDIUM,
    refreshable: true,
    configurable: false,
    tags: ['correlation', 'matrix', 'analysis']
  },

  'drawdown-analysis': {
    id: 'drawdown-analysis',
    title: 'Drawdown Analysis',
    description: 'Detailed drawdown analysis and risk metrics',
    category: WIDGET_CATEGORIES.ANALYSIS,
    priority: WIDGET_PRIORITIES.MEDIUM,
    icon: <DrawdownIcon />,
    iconColor: '#d32f2f',
    component: DrawdownWidget,
    defaultSize: WIDGET_SIZES.MEDIUM,
    refreshable: true,
    configurable: false,
    tags: ['drawdown', 'risk', 'analysis']
  },

  'trading-notes': {
    id: 'trading-notes',
    title: 'Trading Notes',
    description: 'Quick notes and journal entries for today',
    category: WIDGET_CATEGORIES.UTILITIES,
    priority: WIDGET_PRIORITIES.LOW,
    icon: <NotesIcon />,
    iconColor: '#795548',
    component: TradingNotesWidget,
    defaultSize: WIDGET_SIZES.SMALL,
    refreshable: false,
    configurable: true,
    tags: ['notes', 'journal', 'text'],
    settings: {
      showDate: true,
      autoSave: true
    }
  },

  'market-status': {
    id: 'market-status',
    title: 'Market Status',
    description: 'Current market status and upcoming economic events',
    category: WIDGET_CATEGORIES.UTILITIES,
    priority: WIDGET_PRIORITIES.MEDIUM,
    icon: <MarketIcon />,
    iconColor: '#ff9800',
    component: MarketStatusWidget,
    defaultSize: WIDGET_SIZES.SMALL,
    refreshable: true,
    configurable: false,
    tags: ['market', 'status', 'news']
  },

  'quick-actions': {
    id: 'quick-actions',
    title: 'Quick Actions',
    description: 'Quick access to common trading actions',
    category: WIDGET_CATEGORIES.UTILITIES,
    priority: WIDGET_PRIORITIES.HIGH,
    icon: <QuickIcon />,
    iconColor: '#4caf50',
    component: QuickActionsWidget,
    defaultSize: WIDGET_SIZES.WIDE,
    refreshable: false,
    configurable: true,
    tags: ['actions', 'shortcuts', 'utilities'],
    settings: {
      showAddTrade: true,
      showTodayPlan: true,
      showMarketStatus: true
    }
  }
};

/**
 * Get all available widgets
 */
export const getAvailableWidgets = () => {
  return Object.values(widgetRegistry);
};

/**
 * Get widgets by category
 */
export const getWidgetsByCategory = (category) => {
  return Object.values(widgetRegistry).filter(widget => widget.category === category);
};

/**
 * Get widget by ID
 */
export const getWidget = (widgetId) => {
  return widgetRegistry[widgetId];
};

/**
 * Create a widget instance with default settings
 */
export const createWidgetInstance = (widgetId, overrideSettings = {}) => {
  const widgetConfig = getWidget(widgetId);
  if (!widgetConfig) {
    throw new Error(`Widget with ID '${widgetId}' not found`);
  }

  return {
    ...widgetConfig,
    settings: {
      ...widgetConfig.settings,
      ...overrideSettings
    }
  };
};

/**
 * Get default dashboard layout
 */
export const getDefaultDashboardLayout = () => {
  const defaultWidgets = [
    'performance-overview',
    'performance-chart',
    'recent-trades',
    'tradesage-insights'
  ];

  const layouts = {
    lg: [],
    md: [],
    sm: [],
    xs: []
  };

  let x = 0;
  let y = 0;

  defaultWidgets.forEach((widgetId, index) => {
    const widget = getWidget(widgetId);
    if (!widget) return;

    const size = widget.defaultSize;
    
    // Check if widget fits in current row
    if (x + size.w > 12) {
      x = 0;
      y += size.h;
    }

    // Create layout item
    const layoutItem = {
      i: widgetId,
      x: x,
      y: y,
      w: size.w,
      h: size.h,
      minW: size.minW,
      minH: size.minH,
      maxW: size.maxW,
      maxH: size.maxH
    };

    layouts.lg.push(layoutItem);
    layouts.md.push({...layoutItem});
    layouts.sm.push({...layoutItem, x: 0, w: Math.min(size.w, 6)});
    layouts.xs.push({...layoutItem, x: 0, w: Math.min(size.w, 4)});

    x += size.w;
  });

  return layouts;
};

/**
 * Widget configuration validator
 */
export const validateWidgetConfig = (widgetConfig) => {
  const required = ['id', 'title', 'description', 'category', 'component', 'defaultSize'];
  const missing = required.filter(field => !widgetConfig[field]);
  
  if (missing.length > 0) {
    throw new Error(`Widget config missing required fields: ${missing.join(', ')}`);
  }
  
  return true;
};

export default widgetRegistry;
