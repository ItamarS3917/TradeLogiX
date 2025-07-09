/**
 * Input Validation and Sanitization Service
 * 
 * Provides comprehensive validation and sanitization for all user inputs
 * to prevent injection attacks and ensure data integrity.
 */

/**
 * Validation patterns and rules
 */
const VALIDATION_PATTERNS = {
  // Trading-specific patterns
  symbol: /^[A-Z]{1,10}$/,
  price: /^\d+(\.\d{1,4})?$/,
  quantity: /^\d+(\.\d{1,8})?$/,
  percentage: /^-?\d+(\.\d{1,2})?$/,
  
  // General patterns
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  alphanumeric: /^[a-zA-Z0-9\s]*$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d+)?$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  
  // Security patterns
  noScripts: /^(?!.*<script).*$/i,
  noHtml: /^[^<>]*$/,
  noSql: /^(?!.*(union|select|insert|update|delete|drop|create|alter|exec|execute)).*$/i
};

/**
 * Maximum length limits for different input types
 */
const LENGTH_LIMITS = {
  symbol: 10,
  shortText: 100,
  mediumText: 500,
  longText: 2000,
  notes: 5000,
  username: 20,
  email: 254,
  url: 2048,
  filename: 255
};

/**
 * Allowed values for specific fields
 */
const ALLOWED_VALUES = {
  tradeOutcome: ['Win', 'Loss', 'Breakeven'],
  tradeDirection: ['Long', 'Short'],
  setupTypes: [
    'ICT BPR', 'MMXM Order Block', 'Liquidity Sweep', 'FTMO', 'Orderflow',
    'Break of Structure', 'Fair Value Gap', 'Inducement', 'Displacement',
    'Premium Discount', 'Kill Zone', 'Session High/Low', 'Other'
  ],
  timeframes: ['1m', '5m', '15m', '1h', '4h', '1d', '1w', '1M'],
  marketBias: ['Bullish', 'Bearish', 'Neutral', 'Uncertain'],
  emotionalStates: [
    'Confident', 'Nervous', 'Excited', 'Calm', 'Frustrated', 'Focused',
    'Impatient', 'Disciplined', 'Fearful', 'Greedy', 'Neutral'
  ],
  planAdherence: ['Excellent', 'Good', 'Fair', 'Poor', 'None'],
  riskLevels: ['Very Low', 'Low', 'Medium', 'High', 'Very High']
};

/**
 * Sanitize string input by removing or escaping dangerous characters
 */
const sanitizeString = (input, options = {}) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  let sanitized = input;
  
  // Remove or escape HTML tags
  if (options.removeHtml !== false) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }
  
  // Remove script tags (extra security)
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove potential SQL injection patterns
  if (options.removeSqlPatterns !== false) {
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
      /(--|;|\/\*|\*\/)/g,
      /(\b(or|and)\s+\d+\s*=\s*\d+)/gi
    ];
    
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });
  }
  
  // Remove JavaScript event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length
  if (options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }
  
  return sanitized;
};

/**
 * Validate and sanitize trade data
 */
const validateTradeData = (tradeData) => {
  const errors = [];
  const sanitized = {};
  
  // Required fields validation
  const requiredFields = ['symbol', 'entry_time', 'outcome'];
  requiredFields.forEach(field => {
    if (!tradeData[field] || tradeData[field] === '') {
      errors.push(`${field} is required`);
    }
  });
  
  // Symbol validation
  if (tradeData.symbol) {
    const symbol = sanitizeString(tradeData.symbol, { maxLength: LENGTH_LIMITS.symbol }).toUpperCase();
    if (!VALIDATION_PATTERNS.symbol.test(symbol)) {
      errors.push('Symbol must contain only letters and be 1-10 characters long');
    } else {
      sanitized.symbol = symbol;
    }
  }
  
  // Price validation
  ['entry_price', 'exit_price', 'stop_loss', 'take_profit'].forEach(priceField => {
    if (tradeData[priceField] !== undefined && tradeData[priceField] !== null && tradeData[priceField] !== '') {
      const price = parseFloat(tradeData[priceField]);
      if (isNaN(price) || price < 0) {
        errors.push(`${priceField} must be a valid positive number`);
      } else if (price > 1000000) {
        errors.push(`${priceField} seems unreasonably high`);
      } else {
        sanitized[priceField] = price;
      }
    }
  });
  
  // Quantity validation
  if (tradeData.position_size !== undefined && tradeData.position_size !== null && tradeData.position_size !== '') {
    const quantity = parseFloat(tradeData.position_size);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push('Position size must be a positive number');
    } else if (quantity > 1000000) {
      errors.push('Position size seems unreasonably high');
    } else {
      sanitized.position_size = quantity;
    }
  }
  
  // Outcome validation
  if (tradeData.outcome) {
    const outcome = sanitizeString(tradeData.outcome);
    if (!ALLOWED_VALUES.tradeOutcome.includes(outcome)) {
      errors.push(`Outcome must be one of: ${ALLOWED_VALUES.tradeOutcome.join(', ')}`);
    } else {
      sanitized.outcome = outcome;
    }
  }
  
  // Setup type validation
  if (tradeData.setup_type) {
    const setupType = sanitizeString(tradeData.setup_type, { maxLength: LENGTH_LIMITS.shortText });
    if (setupType.length > 0) {
      sanitized.setup_type = setupType;
    }
  }
  
  // Date validation
  if (tradeData.entry_time) {
    const date = new Date(tradeData.entry_time);
    if (isNaN(date.getTime())) {
      errors.push('Entry time must be a valid date');
    } else if (date > new Date()) {
      errors.push('Entry time cannot be in the future');
    } else {
      sanitized.entry_time = date.toISOString();
    }
  }
  
  // Text fields sanitization
  ['notes', 'tags', 'emotional_state'].forEach(textField => {
    if (tradeData[textField]) {
      const maxLength = textField === 'notes' ? LENGTH_LIMITS.notes : LENGTH_LIMITS.mediumText;
      sanitized[textField] = sanitizeString(tradeData[textField], { maxLength });
    }
  });
  
  // Plan adherence validation
  if (tradeData.plan_adherence) {
    const adherence = sanitizeString(tradeData.plan_adherence);
    if (!ALLOWED_VALUES.planAdherence.includes(adherence)) {
      errors.push(`Plan adherence must be one of: ${ALLOWED_VALUES.planAdherence.join(', ')}`);
    } else {
      sanitized.plan_adherence = adherence;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: sanitized
  };
};

/**
 * Validate and sanitize daily plan data
 */
const validatePlanData = (planData) => {
  const errors = [];
  const sanitized = {};
  
  // Required fields validation
  if (!planData.date) {
    errors.push('Date is required');
  }
  
  // Date validation
  if (planData.date) {
    const date = new Date(planData.date);
    if (isNaN(date.getTime())) {
      errors.push('Date must be a valid date');
    } else {
      sanitized.date = date.toISOString();
    }
  }
  
  // Market bias validation
  if (planData.market_bias) {
    const bias = sanitizeString(planData.market_bias);
    if (!ALLOWED_VALUES.marketBias.includes(bias)) {
      errors.push(`Market bias must be one of: ${ALLOWED_VALUES.marketBias.join(', ')}`);
    } else {
      sanitized.market_bias = bias;
    }
  }
  
  // Text fields sanitization
  ['goals', 'key_levels', 'notes', 'strategy'].forEach(textField => {
    if (planData[textField]) {
      const maxLength = textField === 'notes' ? LENGTH_LIMITS.notes : LENGTH_LIMITS.longText;
      sanitized[textField] = sanitizeString(planData[textField], { maxLength });
    }
  });
  
  // Risk parameters validation
  if (planData.max_risk !== undefined && planData.max_risk !== null) {
    const risk = parseFloat(planData.max_risk);
    if (isNaN(risk) || risk < 0 || risk > 100) {
      errors.push('Max risk must be a percentage between 0 and 100');
    } else {
      sanitized.max_risk = risk;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: sanitized
  };
};

/**
 * Validate and sanitize journal entry data
 */
const validateJournalData = (journalData) => {
  const errors = [];
  const sanitized = {};
  
  // Date validation
  if (journalData.date) {
    const date = new Date(journalData.date);
    if (isNaN(date.getTime())) {
      errors.push('Date must be a valid date');
    } else {
      sanitized.date = date.toISOString();
    }
  }
  
  // Content validation
  if (journalData.content) {
    sanitized.content = sanitizeString(journalData.content, { maxLength: LENGTH_LIMITS.notes });
  }
  
  // Mood rating validation
  if (journalData.mood_rating !== undefined && journalData.mood_rating !== null) {
    const mood = parseInt(journalData.mood_rating);
    if (isNaN(mood) || mood < 1 || mood > 10) {
      errors.push('Mood rating must be a number between 1 and 10');
    } else {
      sanitized.mood_rating = mood;
    }
  }
  
  // Tags validation
  if (journalData.tags) {
    if (Array.isArray(journalData.tags)) {
      sanitized.tags = journalData.tags
        .map(tag => sanitizeString(tag, { maxLength: 50 }))
        .filter(tag => tag.length > 0)
        .slice(0, 20); // Limit to 20 tags
    } else {
      errors.push('Tags must be an array');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: sanitized
  };
};

/**
 * Validate user input for search queries
 */
const validateSearchQuery = (query) => {
  if (typeof query !== 'string') {
    return { isValid: false, error: 'Search query must be a string' };
  }
  
  const sanitized = sanitizeString(query, { maxLength: 200 });
  
  // Prevent empty searches
  if (sanitized.length === 0) {
    return { isValid: false, error: 'Search query cannot be empty' };
  }
  
  // Prevent very short searches that might be too broad
  if (sanitized.length < 2) {
    return { isValid: false, error: 'Search query must be at least 2 characters' };
  }
  
  return {
    isValid: true,
    sanitizedQuery: sanitized
  };
};

/**
 * Validate file upload data
 */
const validateFileUpload = (file, allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }
  
  // File size validation
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
  }
  
  // File type validation
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // Filename validation
  const filename = sanitizeString(file.name, { maxLength: LENGTH_LIMITS.filename });
  if (filename !== file.name) {
    errors.push('Filename contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedFilename: filename
  };
};

/**
 * Validate API request parameters
 */
const validateApiRequest = (params, requiredParams = []) => {
  const errors = [];
  const sanitized = {};
  
  // Check required parameters
  requiredParams.forEach(param => {
    if (params[param] === undefined || params[param] === null || params[param] === '') {
      errors.push(`${param} is required`);
    }
  });
  
  // Validate common parameters
  Object.keys(params).forEach(key => {
    const value = params[key];
    
    switch (key) {
      case 'user_id':
        if (typeof value !== 'string' || value.length === 0) {
          errors.push('user_id must be a non-empty string');
        } else {
          sanitized[key] = sanitizeString(value, { maxLength: 128 });
        }
        break;
        
      case 'limit':
        const limit = parseInt(value);
        if (isNaN(limit) || limit < 1 || limit > 1000) {
          errors.push('limit must be a number between 1 and 1000');
        } else {
          sanitized[key] = limit;
        }
        break;
        
      case 'offset':
        const offset = parseInt(value);
        if (isNaN(offset) || offset < 0) {
          errors.push('offset must be a non-negative number');
        } else {
          sanitized[key] = offset;
        }
        break;
        
      case 'start_date':
      case 'end_date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`${key} must be a valid date`);
        } else {
          sanitized[key] = date.toISOString();
        }
        break;
        
      default:
        // General sanitization for other parameters
        if (typeof value === 'string') {
          sanitized[key] = sanitizeString(value, { maxLength: LENGTH_LIMITS.mediumText });
        } else {
          sanitized[key] = value;
        }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedParams: sanitized
  };
};

/**
 * Rate limiting helper
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.limits = {
      default: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute
      auth: { maxRequests: 5, windowMs: 60000 }, // 5 auth attempts per minute
      upload: { maxRequests: 10, windowMs: 60000 } // 10 uploads per minute
    };
  }
  
  isAllowed(identifier, type = 'default') {
    const limit = this.limits[type] || this.limits.default;
    const now = Date.now();
    const windowStart = now - limit.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= limit.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  getRemainingRequests(identifier, type = 'default') {
    const limit = this.limits[type] || this.limits.default;
    const now = Date.now();
    const windowStart = now - limit.windowMs;
    
    if (!this.requests.has(identifier)) {
      return limit.maxRequests;
    }
    
    const userRequests = this.requests.get(identifier);
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, limit.maxRequests - validRequests.length);
  }
}

// Create global rate limiter instance
const rateLimiter = new RateLimiter();

export {
  sanitizeString,
  validateTradeData,
  validatePlanData,
  validateJournalData,
  validateSearchQuery,
  validateFileUpload,
  validateApiRequest,
  rateLimiter,
  VALIDATION_PATTERNS,
  LENGTH_LIMITS,
  ALLOWED_VALUES
};

export default {
  sanitizeString,
  validateTradeData,
  validatePlanData,
  validateJournalData,
  validateSearchQuery,
  validateFileUpload,
  validateApiRequest,
  rateLimiter,
  VALIDATION_PATTERNS,
  LENGTH_LIMITS,
  ALLOWED_VALUES
};
