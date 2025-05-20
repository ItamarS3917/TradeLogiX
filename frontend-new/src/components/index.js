/**
 * Enhanced Trading Journal App - Components Index
 * This file exports all common components for easy imports
 */

// Responsive Components
export * from './Common/Responsive';
export { default as ResponsiveContainer } from './Common/Responsive';
export { default as ResponsiveTouchContainer } from './Common/Responsive/ResponsiveTouchContainer';

// Performance Cards
export { default as EnhancedResponsivePerformanceCard } from './Common/EnhancedResponsivePerformanceCard';
export { default as ResponsivePerformanceCard } from './Common/ResponsivePerformanceCard';

// Chart Components
export { default as AdvancedChart } from './Common/AdvancedChart';
export { default as AdvancedTradingChart } from './Common/AdvancedTradingChart';

// Form Components  
export { default as ColorPicker } from './Common/ColorPicker';

// Layout Components
export { default as MainLayout } from './Layout/MainLayout';

// Keyboard Shortcuts
export * from './Common/KeyboardShortcuts';

// Notification Components
export { default as NotificationSettings } from './Common/NotificationSettings';
export { default as SimpleNotificationSettings } from './Common/SimpleNotificationSettings';
export { default as ScheduledNotificationManager } from './Common/ScheduledNotificationManager';
export { default as SimpleScheduledNotificationManager } from './Common/SimpleScheduledNotificationManager';

// Trade Components
export * from './Trades';

// Planning Components
export * from './Planning';

// Onboarding Components
export * from './Common/Onboarding';

// Mobile Navigation
export { default as MobileNavigation } from './MobileContext/MobileNavigation';

// TradingView Components
export * from './TradingView';
