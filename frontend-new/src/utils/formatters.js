/**
 * Format a number as currency (USD)
 * @param {number} value - The value to format
 * @param {string} currency - The currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD') => {
  if (value === undefined || value === null) return '-';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format a number as percentage
 * @param {number} value - The value to format
 * @param {number} decimalPlaces - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export const formatPercent = (value, decimalPlaces = 2) => {
  if (value === undefined || value === null) return '-';
  
  return `${parseFloat(value).toFixed(decimalPlaces)}%`;
};

/**
 * Format a date to a readable string
 * @param {Date|string} date - The date to format
 * @param {string} format - The format to use (default: 'short')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '-';
  
  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };
  
  return new Intl.DateTimeFormat('en-US', options[format] || options.short).format(dateObj);
};

/**
 * Format a number with thousand separators
 * @param {number} value - The value to format
 * @param {number} decimalPlaces - Number of decimal places (default: 2)
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimalPlaces = 2) => {
  if (value === undefined || value === null) return '-';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(value);
};

/**
 * Format time duration in minutes to a readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (minutes === undefined || minutes === null) return '-';
  
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  }
};

/**
 * Format a trade result (win, loss, breakeven)
 * @param {string} outcome - The trade outcome
 * @returns {string} Formatted outcome with emoji
 */
export const formatTradeOutcome = (outcome) => {
  if (!outcome) return '-';
  
  const normalized = outcome.toUpperCase();
  
  if (normalized === 'WIN') return '✅ Win';
  if (normalized === 'LOSS') return '❌ Loss';
  if (normalized === 'BREAKEVEN') return '⚖️ Breakeven';
  
  return outcome;
};
