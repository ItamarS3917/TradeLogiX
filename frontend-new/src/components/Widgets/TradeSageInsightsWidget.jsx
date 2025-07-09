import React from 'react';
import Widget from './Widget';
import TradeSageInsightsPanel from '../Dashboard/TradeSageInsightsPanel';
import { Psychology as PsychologyIcon } from '@mui/icons-material';

/**
 * TradeSage Insights Widget - AI-powered insights for the customizable dashboard
 */
const TradeSageInsightsWidget = ({ 
  settings = {},
  onRefresh,
  onConfigure,
  onRemove,
  ...props 
}) => {
  // Widget settings with defaults
  const {
    maxInsights = 3,
    autoRefresh = true,
    refreshInterval = 300000, // 5 minutes
    showConfidence = true,
    compact = false,
    enableAutoRefresh = true
  } = settings;
  
  // Handle insight click
  const handleInsightClick = (insight) => {
    // Could navigate to detailed view or show modal
    console.log('Insight clicked:', insight);
    // For now, we'll just expand/collapse the insight
  };
  
  return (
    <Widget
      title="TradeSage AI Insights"
      icon={<PsychologyIcon />}
      iconColor="#7c4dff"
      onRefresh={onRefresh}
      onConfigure={onConfigure}
      onRemove={onRemove}
      hasSettings={true}
      refreshable={true}
      {...props}
    >
      <TradeSageInsightsPanel
        maxInsights={maxInsights}
        refreshInterval={autoRefresh ? refreshInterval : null}
        enableAutoRefresh={enableAutoRefresh && autoRefresh}
        onInsightClick={handleInsightClick}
        compact={compact}
        showActions={false} // Hide actions since they're in the widget header
      />
    </Widget>
  );
};

export default TradeSageInsightsWidget;
