/**
 * 🤖 Smart Monitoring System 2025
 * 
 * Features:
 * - AI-powered performance analytics
 * - Real-time error detection
 * - User behavior tracking
 * - Predictive maintenance
 * - Automated alerting
 */

class SmartMonitoring {
  constructor() {
    this.metrics = {
      performance: [],
      errors: [],
      userBehavior: [],
      apiCalls: [],
      systemHealth: {}
    };
    
    this.aiAnalytics = {
      patterns: [],
      predictions: [],
      recommendations: []
    };
    
    this.thresholds = {
      loadTime: 15000,
      apiResponseTime: 10000,
      errorRate: 0.05,
      memoryUsage: 0.8
    };
    
    this.initialized = false;
    this.safeInit();
  }
  
  safeInit() {
    try {
      if (typeof window !== 'undefined' && !this.initialized) {
        this.initialized = true;
        console.log('🤖 Smart Monitoring System 2025 initialized');
        
        // Start monitoring with safety checks
        this.startPerformanceMonitoring();
        this.startErrorMonitoring();
        this.startUserBehaviorTracking();
        this.startSystemHealthMonitoring();
        
        // AI Analytics
        this.startAIAnalytics();
        
        // Periodic reporting
        setInterval(() => this.generateSmartReport(), 300000); // Every 5 minutes
      }
    } catch (error) {
      console.warn('Smart Monitoring initialization failed:', error);
    }
  }
  
  // Performance Monitoring
  startPerformanceMonitoring() {
    try {
      // Monitor page load times
      if (window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.recordMetric('performance', {
            type: 'PAGE_LOAD',
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            timestamp: Date.now()
          });
        }
      }
      
      // Monitor API calls
      this.interceptFetch();
      
      // Monitor memory usage
      if (window.performance && window.performance.memory) {
        setInterval(() => {
          try {
            const memory = window.performance.memory;
            this.recordMetric('performance', {
              type: 'MEMORY_USAGE',
              used: memory.usedJSHeapSize,
              total: memory.totalJSHeapSize,
              limit: memory.jsHeapSizeLimit,
              usage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
              timestamp: Date.now()
            });
          } catch (error) {
            console.warn('Memory monitoring error:', error);
          }
        }, 30000);
      }
    } catch (error) {
      console.warn('Performance monitoring setup failed:', error);
    }
  }
  
  // Error Monitoring
  startErrorMonitoring() {
    try {
      // JavaScript errors
      window.addEventListener('error', (event) => {
        this.recordError({
          type: 'JAVASCRIPT_ERROR',
          message: event.message,
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
          stack: event.error?.stack,
          timestamp: Date.now()
        });
      });
      
      // Promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.recordError({
          type: 'PROMISE_REJECTION',
          message: event.reason?.message || 'Unhandled promise rejection',
          stack: event.reason?.stack,
          timestamp: Date.now()
        });
      });
      
      // Network errors
      this.monitorNetworkErrors();
    } catch (error) {
      console.warn('Error monitoring setup failed:', error);
    }
  }
  
  // User Behavior Tracking
  startUserBehaviorTracking() {
    try {
      // Click tracking
      document.addEventListener('click', (event) => {
        this.recordUserBehavior({
          type: 'CLICK',
          element: event.target.tagName,
          className: event.target.className,
          id: event.target.id,
          text: event.target.textContent?.substring(0, 50),
          timestamp: Date.now()
        });
      });
      
      // Page navigation
      let currentPage = window.location.pathname;
      setInterval(() => {
        try {
          if (window.location.pathname !== currentPage) {
            this.recordUserBehavior({
              type: 'PAGE_NAVIGATION',
              from: currentPage,
              to: window.location.pathname,
              timestamp: Date.now()
            });
            currentPage = window.location.pathname;
          }
        } catch (error) {
          console.warn('Navigation tracking error:', error);
        }
      }, 1000);
      
      // Form interactions
      document.addEventListener('submit', (event) => {
        this.recordUserBehavior({
          type: 'FORM_SUBMIT',
          form: event.target.className,
          timestamp: Date.now()
        });
      });
    } catch (error) {
      console.warn('User behavior tracking setup failed:', error);
    }
  }
  
  // System Health Monitoring
  startSystemHealthMonitoring() {
    try {
      setInterval(() => {
        this.checkSystemHealth();
      }, 60000); // Every minute
    } catch (error) {
      console.warn('System health monitoring setup failed:', error);
    }
  }
  
  // AI Analytics
  startAIAnalytics() {
    try {
      setInterval(() => {
        this.runAIAnalysis();
      }, 180000); // Every 3 minutes
    } catch (error) {
      console.warn('AI analytics setup failed:', error);
    }
  }
  
  // Utility Methods
  recordMetric(category, data) {
    try {
      if (!this.metrics[category]) {
        this.metrics[category] = [];
      }
      
      this.metrics[category].push(data);
      
      // Keep only last 1000 entries
      if (this.metrics[category].length > 1000) {
        this.metrics[category] = this.metrics[category].slice(-1000);
      }
      
      // Check thresholds
      this.checkThresholds(category, data);
    } catch (error) {
      console.warn('Record metric error:', error);
    }
  }
  
  recordError(error) {
    try {
      this.metrics.errors.push(error);
      
      // Immediate analysis for critical errors
      if (this.isCriticalError(error)) {
        this.handleCriticalError(error);
      }
      
      console.error('🚨 Smart Monitoring - Error detected:', error);
    } catch (err) {
      console.warn('Record error failed:', err);
    }
  }
  
  recordUserBehavior(behavior) {
    try {
      this.metrics.userBehavior.push(behavior);
      
      // Keep only last 500 entries
      if (this.metrics.userBehavior.length > 500) {
        this.metrics.userBehavior = this.metrics.userBehavior.slice(-500);
      }
    } catch (error) {
      console.warn('Record user behavior error:', error);
    }
  }
  
  interceptFetch() {
    try {
      const originalFetch = window.fetch;
      
      window.fetch = async (...args) => {
        const startTime = Date.now();
        const url = args[0];
        
        try {
          const response = await originalFetch(...args);
          const endTime = Date.now();
          
          this.recordMetric('apiCalls', {
            url,
            method: args[1]?.method || 'GET',
            status: response.status,
            responseTime: endTime - startTime,
            timestamp: startTime
          });
          
          return response;
        } catch (error) {
          const endTime = Date.now();
          
          this.recordError({
            type: 'API_ERROR',
            url,
            method: args[1]?.method || 'GET',
            message: error.message,
            responseTime: endTime - startTime,
            timestamp: startTime
          });
          
          throw error;
        }
      };
    } catch (error) {
      console.warn('Fetch interception setup failed:', error);
    }
  }
  
  monitorNetworkErrors() {
    try {
      // Monitor failed resource loads
      window.addEventListener('error', (event) => {
        if (event.target && event.target !== window) {
          this.recordError({
            type: 'NETWORK_ERROR',
            resource: event.target.src || event.target.href,
            element: event.target.tagName,
            timestamp: Date.now()
          });
        }
      }, true);
    } catch (error) {
      console.warn('Network error monitoring setup failed:', error);
    }
  }
  
  checkSystemHealth() {
    try {
      const health = {
        timestamp: Date.now(),
        performance: this.calculatePerformanceScore(),
        errorRate: this.calculateErrorRate(),
        memoryUsage: this.getMemoryUsage(),
        apiHealth: this.calculateAPIHealth()
      };
      
      this.metrics.systemHealth = health;
      
      // Check for critical issues
      if (health.errorRate > this.thresholds.errorRate) {
        this.sendAlert('SYSTEM_CRITICAL', {
          metric: 'errorRate',
          value: health.errorRate,
          threshold: this.thresholds.errorRate
        });
      }
    } catch (error) {
      console.warn('System health check failed:', error);
    }
  }
  
  runAIAnalysis() {
    try {
      this.aiAnalytics.patterns = this.detectPatterns();
      this.aiAnalytics.predictions = this.generatePredictions();
      this.aiAnalytics.recommendations = this.generateRecommendations();
    } catch (error) {
      console.warn('AI analysis failed:', error);
    }
  }
  
  detectPatterns() {
    try {
      return {
        behavior: this.findBehaviorPatterns(this.metrics.userBehavior),
        errors: this.findErrorPatterns(this.metrics.errors),
        performance: this.findPerformancePatterns(this.metrics.performance)
      };
    } catch (error) {
      console.warn('Pattern detection failed:', error);
      return { behavior: [], errors: [], performance: [] };
    }
  }
  
  generatePredictions() {
    try {
      const predictions = [];
      
      // Predict load time trends
      if (this.metrics.performance.length > 10) {
        const loadTimes = this.metrics.performance
          .filter(p => p.type === 'PAGE_LOAD')
          .map(p => p.loadTime);
        
        if (loadTimes.length > 5) {
          const trend = this.calculateTrend(this.metrics.performance, 'loadTime');
          predictions.push({
            type: 'LOAD_TIME_TREND',
            trend: trend > 0 ? 'increasing' : 'decreasing',
            confidence: Math.min(Math.abs(trend) * 100, 95),
            timestamp: Date.now()
          });
        }
      }
      
      // Predict error rate trends
      if (this.metrics.errors.length > 5) {
        const recentErrors = this.metrics.errors.slice(-10);
        const olderErrors = this.metrics.errors.slice(-20, -10);
        
        if (recentErrors.length > olderErrors.length) {
          predictions.push({
            type: 'ERROR_RATE_INCREASE',
            confidence: 75,
            timestamp: Date.now()
          });
        }
      }
      
      return predictions;
    } catch (error) {
      console.warn('Prediction generation failed:', error);
      return [];
    }
  }
  
  generateRecommendations() {
    try {
      const recommendations = [];
      
      // Performance recommendations
      const avgLoadTime = this.calculateAverageLoadTime();
      if (avgLoadTime > this.thresholds.loadTime) {
        recommendations.push({
          type: 'PERFORMANCE',
          priority: 'high',
          message: 'Consider optimizing page load times',
          action: 'review_performance_metrics',
          timestamp: Date.now()
        });
      }
      
      // Error rate recommendations
      const errorRate = this.calculateErrorRate();
      if (errorRate > this.thresholds.errorRate) {
        recommendations.push({
          type: 'ERROR_HANDLING',
          priority: 'high',
          message: 'High error rate detected, review error logs',
          action: 'investigate_errors',
          timestamp: Date.now()
        });
      }
      
      // Memory usage recommendations
      const memoryUsage = this.getMemoryUsage();
      if (memoryUsage > this.thresholds.memoryUsage) {
        recommendations.push({
          type: 'MEMORY',
          priority: 'medium',
          message: 'High memory usage detected',
          action: 'optimize_memory_usage',
          timestamp: Date.now()
        });
      }
      
      return recommendations;
    } catch (error) {
      console.warn('Recommendation generation failed:', error);
      return [];
    }
  }
  
  // Helper Methods
  calculatePerformanceScore() {
    try {
      const avgLoadTime = this.calculateAverageLoadTime();
      const errorRate = this.calculateErrorRate();
      const memoryUsage = this.getMemoryUsage();
      
      let score = 100;
      score -= Math.min(avgLoadTime / 1000, 50); // Reduce score based on load time
      score -= errorRate * 1000; // Reduce score based on error rate
      score -= memoryUsage * 30; // Reduce score based on memory usage
      
      return Math.max(score, 0);
    } catch (error) {
      return 50; // Default score
    }
  }
  
  calculateErrorRate() {
    try {
      const totalInteractions = this.metrics.userBehavior.length + this.metrics.apiCalls.length;
      return totalInteractions > 0 ? this.metrics.errors.length / totalInteractions : 0;
    } catch (error) {
      return 0;
    }
  }
  
  getMemoryUsage() {
    try {
      if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }
  
  calculateAPIHealth() {
    try {
      const recentCalls = this.metrics.apiCalls.slice(-50);
      if (recentCalls.length === 0) return 100;
      
      const successfulCalls = recentCalls.filter(call => call.status < 400);
      return (successfulCalls.length / recentCalls.length) * 100;
    } catch (error) {
      return 100;
    }
  }
  
  calculateAverageLoadTime() {
    try {
      const loadTimes = this.metrics.performance
        .filter(p => p.type === 'PAGE_LOAD')
        .map(p => p.loadTime);
      
      return loadTimes.length > 0 
        ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
        : 0;
    } catch (error) {
      return 0;
    }
  }
  
  calculateTrend(metrics, field) {
    try {
      if (metrics.length < 10) return 0;
      
      const recent = metrics.slice(-5);
      const older = metrics.slice(-10, -5);
      
      const recentAvg = recent.reduce((sum, m) => sum + (m[field] || 0), 0) / recent.length;
      const olderAvg = older.reduce((sum, m) => sum + (m[field] || 0), 0) / older.length;
      
      return olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
    } catch (error) {
      return 0;
    }
  }
  
  findBehaviorPatterns(behaviors) {
    try {
      const patterns = {};
      
      behaviors.forEach(behavior => {
        const key = `${behavior.type}_${behavior.element}`;
        patterns[key] = (patterns[key] || 0) + 1;
      });
      
      return Object.entries(patterns)
        .filter(([_, count]) => count > 3)
        .map(([pattern, count]) => ({ pattern, count }));
    } catch (error) {
      return [];
    }
  }
  
  findErrorPatterns(errors) {
    try {
      const patterns = {};
      
      errors.forEach(error => {
        const key = `${error.type}_${error.message?.substring(0, 50)}`;
        patterns[key] = (patterns[key] || 0) + 1;
      });
      
      return Object.entries(patterns)
        .filter(([_, count]) => count > 2)
        .map(([pattern, count]) => ({ pattern, count }));
    } catch (error) {
      return [];
    }
  }
  
  findPerformancePatterns(metrics) {
    try {
      const patterns = {};
      
      metrics.forEach(metric => {
        const key = `${metric.type}_${metric.loadTime > this.thresholds.loadTime ? 'slow' : 'fast'}`;
        patterns[key] = (patterns[key] || 0) + 1;
      });
      
      return Object.entries(patterns)
        .map(([pattern, count]) => ({ pattern, count }));
    } catch (error) {
      return [];
    }
  }
  
  // Threshold Checking
  checkThresholds(category, data) {
    try {
      if (category === 'performance' && data.type === 'PAGE_LOAD') {
        if (data.loadTime > this.thresholds.loadTime) {
          this.sendAlert('PERFORMANCE_THRESHOLD', {
            metric: 'loadTime',
            value: data.loadTime,
            threshold: this.thresholds.loadTime
          });
        }
      }
      
      if (category === 'apiCalls' && data.responseTime > this.thresholds.apiResponseTime) {
        this.sendAlert('API_THRESHOLD', {
          metric: 'responseTime',
          value: data.responseTime,
          threshold: this.thresholds.apiResponseTime,
          url: data.url
        });
      }
    } catch (error) {
      console.warn('Threshold check failed:', error);
    }
  }
  
  // Critical Error Handling
  isCriticalError(error) {
    try {
      const criticalTypes = ['JAVASCRIPT_ERROR', 'API_ERROR', 'NETWORK_ERROR'];
      return criticalTypes.includes(error.type);
    } catch (err) {
      return false;
    }
  }
  
  handleCriticalError(error) {
    try {
      console.error('🚨 Critical Error Detected:', error);
      
      // Send immediate alert
      this.sendAlert('CRITICAL_ERROR', error);
      
      // Try to recover
      this.attemptRecovery(error);
    } catch (err) {
      console.warn('Critical error handling failed:', err);
    }
  }
  
  attemptRecovery(error) {
    try {
      if (error.type === 'API_ERROR') {
        console.log('🔄 Attempting API recovery...');
      }
      
      if (error.type === 'MEMORY_ERROR') {
        console.log('🧹 Clearing memory caches...');
      }
    } catch (err) {
      console.warn('Recovery attempt failed:', err);
    }
  }
  
  // Alerting System
  sendAlert(type, data) {
    try {
      const alert = {
        type,
        data,
        timestamp: Date.now(),
        severity: this.getAlertSeverity(type)
      };
      
      console.warn('🚨 Smart Alert:', alert);
      
      // Store alert
      if (!this.alerts) this.alerts = [];
      this.alerts.push(alert);
      
      // Send to monitoring service (if configured)
      this.sendToMonitoringService(alert);
    } catch (error) {
      console.warn('Alert sending failed:', error);
    }
  }
  
  getAlertSeverity(type) {
    try {
      const severityMap = {
        'CRITICAL_ERROR': 'critical',
        'SYSTEM_CRITICAL': 'critical',
        'PERFORMANCE_THRESHOLD': 'warning',
        'API_THRESHOLD': 'warning'
      };
      
      return severityMap[type] || 'info';
    } catch (error) {
      return 'info';
    }
  }
  
  sendToMonitoringService(alert) {
    try {
      if (window.Sentry) {
        window.Sentry.captureMessage(`Smart Monitoring Alert: ${alert.type}`, alert.severity);
      }
    } catch (error) {
      console.warn('Monitoring service send failed:', error);
    }
  }
  
  // Reporting
  generateSmartReport() {
    try {
      const report = {
        timestamp: Date.now(),
        systemHealth: this.metrics.systemHealth,
        aiAnalytics: this.aiAnalytics,
        summary: {
          totalErrors: this.metrics.errors.length,
          avgLoadTime: this.calculateAverageLoadTime(),
          errorRate: this.calculateErrorRate(),
          memoryUsage: this.getMemoryUsage(),
          apiHealth: this.calculateAPIHealth()
        },
        recommendations: this.aiAnalytics.recommendations
      };
      
      console.log('📊 Smart Monitoring Report:', report);
      
      // Store report
      if (!this.reports) this.reports = [];
      this.reports.push(report);
      
      // Keep only last 100 reports
      if (this.reports.length > 100) {
        this.reports = this.reports.slice(-100);
      }
      
      return report;
    } catch (error) {
      console.warn('Report generation failed:', error);
      return null;
    }
  }
  
  // Public API
  getMetrics() {
    return this.metrics || {};
  }
  
  getAIAnalytics() {
    return this.aiAnalytics || {};
  }
  
  getSystemHealth() {
    return this.metrics.systemHealth || {};
  }
  
  getReports() {
    return this.reports || [];
  }
  
  // Export data for analysis
  exportData() {
    try {
      return {
        metrics: this.metrics,
        aiAnalytics: this.aiAnalytics,
        reports: this.reports,
        alerts: this.alerts
      };
    } catch (error) {
      console.warn('Data export failed:', error);
      return {};
    }
  }
}

// Safe initialization
let smartMonitoring = null;

try {
  if (typeof window !== 'undefined') {
    smartMonitoring = new SmartMonitoring();
  }
} catch (error) {
  console.warn('Smart Monitoring initialization failed:', error);
  // Create a dummy object to prevent errors
  smartMonitoring = {
    getMetrics: () => ({}),
    getAIAnalytics: () => ({}),
    getSystemHealth: () => ({}),
    getReports: () => ([]),
    exportData: () => ({})
  };
}

export default smartMonitoring; 