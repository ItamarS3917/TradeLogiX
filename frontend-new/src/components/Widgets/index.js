// Widget exports
export { default as Widget } from './Widget';

// Specific widget components
export { default as PerformanceMetricsWidget } from './PerformanceMetricsWidget';
export { default as RecentTradesWidget } from './RecentTradesWidget';
export { default as TradeSageInsightsWidget } from './TradeSageInsightsWidget';
export { default as PerformanceChartWidget } from './PerformanceChartWidget';
export { default as WinLossDistributionWidget } from './WinLossDistributionWidget';
export { default as SetupPerformanceWidget } from './SetupPerformanceWidget';
export { default as TimeOfDayWidget } from './TimeOfDayWidget';
export { default as CalendarHeatmapWidget } from './CalendarHeatmapWidget';
export { default as CorrelationMatrixWidget } from './CorrelationMatrixWidget';
export { default as DrawdownWidget } from './DrawdownWidget';
export { default as TradingNotesWidget } from './TradingNotesWidget';
export { default as MarketStatusWidget } from './MarketStatusWidget';
export { default as QuickActionsWidget } from './QuickActionsWidget';

// Widget configuration
export { default as widgetRegistry } from './widgetRegistry';
export { getAvailableWidgets, createWidgetInstance } from './widgetRegistry';
