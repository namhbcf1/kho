// Error tracking utility for POS System
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.init();
  }

  init() {
    // Track window errors
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        reason: event.reason,
        timestamp: new Date().toISOString()
      });
    });

    // Track React errors (will be called manually)
    window.posErrorTracker = this;
    
    // Initialize error storage
    if (!window.posSystemErrors) {
      window.posSystemErrors = [];
    }
  }

  logError(error) {
    const errorEntry = {
      id: Date.now() + Math.random(),
      ...error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: error.timestamp || new Date().toISOString()
    };

    this.errors.push(errorEntry);
    window.posSystemErrors.push(errorEntry);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    if (window.posSystemErrors.length > this.maxErrors) {
      window.posSystemErrors = window.posSystemErrors.slice(-this.maxErrors);
    }

    // Log to console for debugging
    console.error('🚨 POS Error Tracked:', errorEntry);

    // Save to localStorage for persistence
    try {
      localStorage.setItem('pos_errors', JSON.stringify(window.posSystemErrors.slice(-50)));
    } catch (e) {
      console.warn('Could not save errors to localStorage:', e);
    }
  }

  logReactError(error, errorInfo) {
    this.logError({
      type: 'react',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
    window.posSystemErrors = [];
    try {
      localStorage.removeItem('pos_errors');
    } catch (e) {
      console.warn('Could not clear errors from localStorage:', e);
    }
  }

  getErrorSummary() {
    const typeCount = {};
    const recent = this.errors.filter(e => 
      Date.now() - new Date(e.timestamp).getTime() < 60000 * 5 // Last 5 minutes
    );

    this.errors.forEach(error => {
      typeCount[error.type] = (typeCount[error.type] || 0) + 1;
    });

    return {
      total: this.errors.length,
      recent: recent.length,
      byType: typeCount,
      latestError: this.errors[this.errors.length - 1]
    };
  }
}

// Create global instance
const errorTracker = new ErrorTracker();

// Load persisted errors
try {
  const savedErrors = localStorage.getItem('pos_errors');
  if (savedErrors) {
    const parsed = JSON.parse(savedErrors);
    window.posSystemErrors = parsed;
    errorTracker.errors = parsed;
  }
} catch (e) {
  console.warn('Could not load saved errors:', e);
}

export default errorTracker; 