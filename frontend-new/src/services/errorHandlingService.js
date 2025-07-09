/**
 * Enhanced Error Handling Service
 * 
 * Provides secure error handling, logging, and user-friendly error messages
 * while preventing information leakage in production environments.
 */

/**
 * Error types and codes
 */
export const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  NETWORK: 'NETWORK_ERROR',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  FILE_UPLOAD: 'FILE_UPLOAD_ERROR',
  DATABASE: 'DATABASE_ERROR',
  EXTERNAL_API: 'EXTERNAL_API_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * User-friendly error messages that don't leak sensitive information
 */
const USER_FRIENDLY_MESSAGES = {
  [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
  [ERROR_TYPES.AUTHENTICATION]: 'Please check your login credentials and try again.',
  [ERROR_TYPES.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
  [ERROR_TYPES.NOT_FOUND]: 'The requested resource could not be found.',
  [ERROR_TYPES.NETWORK]: 'Network error. Please check your connection and try again.',
  [ERROR_TYPES.SERVER]: 'Server error. Please try again later.',
  [ERROR_TYPES.CLIENT]: 'Invalid request. Please refresh the page and try again.',
  [ERROR_TYPES.RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
  [ERROR_TYPES.FILE_UPLOAD]: 'File upload failed. Please check the file and try again.',
  [ERROR_TYPES.DATABASE]: 'Data operation failed. Please try again later.',
  [ERROR_TYPES.EXTERNAL_API]: 'External service is temporarily unavailable.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again later.'
};

/**
 * Enhanced Error class with additional context
 */
export class EnhancedError extends Error {
  constructor({
    message,
    type = ERROR_TYPES.UNKNOWN,
    code = null,
    severity = ERROR_SEVERITY.MEDIUM,
    context = {},
    userMessage = null,
    originalError = null,
    retryable = false,
    statusCode = 500
  }) {
    super(message);
    
    this.name = 'EnhancedError';
    this.type = type;
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.userMessage = userMessage || USER_FRIENDLY_MESSAGES[type] || message;
    this.originalError = originalError;
    this.retryable = retryable;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.errorId = this.generateErrorId();
    
    // Capture stack trace if available
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EnhancedError);
    }
  }
  
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  toJSON() {
    return {
      errorId: this.errorId,
      message: this.message,
      type: this.type,
      code: this.code,
      severity: this.severity,
      userMessage: this.userMessage,
      retryable: this.retryable,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      context: this.sanitizeContext(this.context)
    };
  }
  
  sanitizeContext(context) {
    // Remove sensitive information from context before logging
    const sanitized = { ...context };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}

/**
 * Error Handler class for centralized error management
 */
class ErrorHandler {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.errorQueue = [];
    this.maxQueueSize = 100;
    this.listeners = [];
  }
  
  /**
   * Handle different types of errors
   */
  handleError(error, context = {}) {
    const enhancedError = this.enhanceError(error, context);
    
    // Log the error
    this.logError(enhancedError);
    
    // Add to error queue for monitoring
    this.addToQueue(enhancedError);
    
    // Notify listeners
    this.notifyListeners(enhancedError);
    
    return enhancedError;
  }
  
  /**
   * Convert regular errors to EnhancedError instances
   */
  enhanceError(error, context = {}) {
    if (error instanceof EnhancedError) {
      return error;
    }
    
    // Determine error type based on error properties
    let type = ERROR_TYPES.UNKNOWN;
    let severity = ERROR_SEVERITY.MEDIUM;
    let retryable = false;
    let statusCode = 500;
    
    if (error.name === 'ValidationError' || error.message.includes('validation')) {
      type = ERROR_TYPES.VALIDATION;
      severity = ERROR_SEVERITY.LOW;
      statusCode = 400;
    } else if (error.name === 'UnauthorizedError' || error.message.includes('unauthorized')) {
      type = ERROR_TYPES.AUTHENTICATION;
      severity = ERROR_SEVERITY.MEDIUM;
      statusCode = 401;
    } else if (error.name === 'ForbiddenError' || error.message.includes('forbidden')) {
      type = ERROR_TYPES.AUTHORIZATION;
      severity = ERROR_SEVERITY.MEDIUM;
      statusCode = 403;
    } else if (error.name === 'NotFoundError' || error.message.includes('not found')) {
      type = ERROR_TYPES.NOT_FOUND;
      severity = ERROR_SEVERITY.LOW;
      statusCode = 404;
    } else if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      type = ERROR_TYPES.NETWORK;
      severity = ERROR_SEVERITY.MEDIUM;
      retryable = true;
      statusCode = 503;
    } else if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
      type = ERROR_TYPES.NETWORK;
      severity = ERROR_SEVERITY.MEDIUM;
      retryable = true;
      statusCode = 408;
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      type = ERROR_TYPES.NETWORK;
      severity = ERROR_SEVERITY.HIGH;
      retryable = true;
      statusCode = 503;
    }
    
    return new EnhancedError({
      message: error.message,
      type,
      severity,
      context: { ...context, originalErrorName: error.name },
      originalError: error,
      retryable,
      statusCode
    });
  }
  
  /**
   * Log errors with appropriate level and format
   */
  logError(error) {
    const logEntry = {
      errorId: error.errorId,
      timestamp: error.timestamp,
      type: error.type,
      severity: error.severity,
      message: error.message,
      context: error.context,
      stack: this.isDevelopment ? error.stack : undefined
    };
    
    // Use appropriate console method based on severity
    switch (error.severity) {
      case ERROR_SEVERITY.CRITICAL:
      case ERROR_SEVERITY.HIGH:
        console.error('🚨 [ERROR]', logEntry);
        break;
      case ERROR_SEVERITY.MEDIUM:
        console.warn('⚠️ [WARN]', logEntry);
        break;
      case ERROR_SEVERITY.LOW:
      default:
        console.info('ℹ️ [INFO]', logEntry);
        break;
    }
    
    // In production, you might want to send logs to external service
    if (!this.isDevelopment) {
      this.sendToLoggingService(logEntry);
    }
  }
  
  /**
   * Add error to internal queue for monitoring
   */
  addToQueue(error) {
    this.errorQueue.push(error);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }
  
  /**
   * Add error listener for real-time monitoring
   */
  addListener(callback) {
    this.listeners.push(callback);
  }
  
  /**
   * Remove error listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  /**
   * Notify all listeners of new errors
   */
  notifyListeners(error) {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }
  
  /**
   * Get recent errors for monitoring dashboard
   */
  getRecentErrors(limit = 50) {
    return this.errorQueue
      .slice(-limit)
      .map(error => ({
        errorId: error.errorId,
        timestamp: error.timestamp,
        type: error.type,
        severity: error.severity,
        userMessage: error.userMessage,
        retryable: error.retryable
      }));
  }
  
  /**
   * Get error statistics
   */
  getErrorStats() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const recentErrors = this.errorQueue.filter(error => 
      new Date(error.timestamp).getTime() > oneHourAgo
    );
    
    const dailyErrors = this.errorQueue.filter(error => 
      new Date(error.timestamp).getTime() > oneDayAgo
    );
    
    const errorsByType = {};
    const errorsBySeverity = {};
    
    dailyErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
    });
    
    return {
      total: this.errorQueue.length,
      lastHour: recentErrors.length,
      lastDay: dailyErrors.length,
      byType: errorsByType,
      bySeverity: errorsBySeverity
    };
  }
  
  /**
   * Send logs to external logging service (implement based on your needs)
   */
  sendToLoggingService(logEntry) {
    // Implement based on your logging service (e.g., Sentry, LogRocket, etc.)
    // This is a placeholder for external logging integration
    if (window && window.gtag) {
      // Example: Send to Google Analytics
      window.gtag('event', 'exception', {
        description: logEntry.message,
        fatal: logEntry.severity === ERROR_SEVERITY.CRITICAL
      });
    }
  }
  
  /**
   * Create error for specific scenarios
   */
  createValidationError(field, message, context = {}) {
    return new EnhancedError({
      message: `Validation error for ${field}: ${message}`,
      type: ERROR_TYPES.VALIDATION,
      severity: ERROR_SEVERITY.LOW,
      context: { field, ...context },
      userMessage: `Please check the ${field} field: ${message}`,
      statusCode: 400
    });
  }
  
  createNetworkError(message, context = {}) {
    return new EnhancedError({
      message,
      type: ERROR_TYPES.NETWORK,
      severity: ERROR_SEVERITY.MEDIUM,
      context,
      retryable: true,
      statusCode: 503
    });
  }
  
  createAuthenticationError(message = 'Authentication failed', context = {}) {
    return new EnhancedError({
      message,
      type: ERROR_TYPES.AUTHENTICATION,
      severity: ERROR_SEVERITY.MEDIUM,
      context,
      statusCode: 401
    });
  }
  
  createRateLimitError(context = {}) {
    return new EnhancedError({
      message: 'Rate limit exceeded',
      type: ERROR_TYPES.RATE_LIMIT,
      severity: ERROR_SEVERITY.LOW,
      context,
      retryable: true,
      statusCode: 429
    });
  }
}

// Create global error handler instance
const errorHandler = new ErrorHandler();

/**
 * React Error Boundary Hook
 */
export const useErrorHandler = () => {
  const handleError = (error, context = {}) => {
    return errorHandler.handleError(error, context);
  };
  
  const createError = (type, message, context = {}) => {
    const errorMethods = {
      validation: errorHandler.createValidationError,
      network: errorHandler.createNetworkError,
      auth: errorHandler.createAuthenticationError,
      rateLimit: errorHandler.createRateLimitError
    };
    
    const method = errorMethods[type];
    if (method) {
      return method(message, context);
    }
    
    return new EnhancedError({
      message,
      type: ERROR_TYPES.UNKNOWN,
      context
    });
  };
  
  return {
    handleError,
    createError,
    getRecentErrors: () => errorHandler.getRecentErrors(),
    getErrorStats: () => errorHandler.getErrorStats(),
    addListener: (callback) => errorHandler.addListener(callback),
    removeListener: (callback) => errorHandler.removeListener(callback)
  };
};

/**
 * Express.js error handling middleware (for backend)
 */
export const errorMiddleware = (err, req, res, next) => {
  const enhancedError = errorHandler.handleError(err, {
    url: req.url,
    method: req.method,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });
  
  // Don't expose internal error details in production
  const response = {
    errorId: enhancedError.errorId,
    message: enhancedError.userMessage,
    type: enhancedError.type,
    retryable: enhancedError.retryable,
    timestamp: enhancedError.timestamp
  };
  
  // Add details in development
  if (errorHandler.isDevelopment) {
    response.details = enhancedError.message;
    response.stack = enhancedError.stack;
  }
  
  res.status(enhancedError.statusCode).json(response);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handlers for unhandled errors
 */
if (typeof window !== 'undefined') {
  // Browser environment
  window.addEventListener('error', (event) => {
    errorHandler.handleError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(event.reason, {
      type: 'unhandledPromiseRejection'
    });
  });
} else if (typeof process !== 'undefined') {
  // Node.js environment
  process.on('uncaughtException', (error) => {
    const enhancedError = errorHandler.handleError(error, {
      type: 'uncaughtException'
    });
    console.error('Uncaught Exception:', enhancedError);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    errorHandler.handleError(reason, {
      type: 'unhandledPromiseRejection',
      promise: promise.toString()
    });
  });
}

export { errorHandler, EnhancedError };
export default errorHandler;
