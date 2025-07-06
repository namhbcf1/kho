// Smart Cypress Commands for 2025
import '@cypress/grep';
import 'cypress-real-events/support';
import 'cypress-axe';

// AI-Powered Smart Selectors
Cypress.Commands.add('smartGet', (selector, options = {}) => {
  const smartOptions = {
    timeout: 15000,
    retries: 3,
    ...options
  };
  
  // AI-powered selector fallback
  const fallbackSelectors = [
    selector,
    `[data-testid="${selector}"]`,
    `[data-cy="${selector}"]`,
    `[aria-label*="${selector}"]`,
    `[title*="${selector}"]`,
    `.${selector}`,
    `#${selector}`
  ];
  
  let element = null;
  
  for (const fallbackSelector of fallbackSelectors) {
    try {
      cy.get(fallbackSelector, { timeout: 3000 }).then(($el) => {
        if ($el.length > 0) {
          element = $el;
          cy.task('log', `Smart selector found: ${fallbackSelector}`);
          return;
        }
      });
      if (element) break;
    } catch (e) {
      continue;
    }
  }
  
  if (!element) {
    cy.task('reportSmartError', {
      type: 'SELECTOR_NOT_FOUND',
      selector: selector,
      suggestions: fallbackSelectors
    });
  }
  
  return cy.get(selector, smartOptions);
});

// Smart Wait with AI Detection
Cypress.Commands.add('smartWait', (condition, timeout = 15000) => {
  cy.task('log', `Smart waiting for: ${condition}`);
  
  if (typeof condition === 'string') {
    // Wait for element
    return cy.smartGet(condition, { timeout });
  } else if (typeof condition === 'function') {
    // Wait for custom condition
    return cy.waitUntil(condition, { timeout });
  } else if (typeof condition === 'number') {
    // Smart delay with performance monitoring
    const start = Date.now();
    return cy.wait(condition).then(() => {
      const duration = Date.now() - start;
      cy.task('collectPerformanceMetrics', {
        type: 'WAIT_DURATION',
        duration,
        expected: condition
      });
    });
  }
});

// AI-Powered Page Load Monitoring
Cypress.Commands.add('smartVisit', (url, options = {}) => {
  const start = Date.now();
  
  return cy.visit(url, options).then(() => {
    const loadTime = Date.now() - start;
    
    // Performance monitoring
    cy.task('collectPerformanceMetrics', {
      type: 'PAGE_LOAD',
      url,
      loadTime,
      threshold: Cypress.env('MAX_LOAD_TIME')
    });
    
    // Check for JavaScript errors
    cy.window().then((win) => {
      const errors = [];
      win.addEventListener('error', (e) => {
        errors.push(e.message);
      });
      
      if (errors.length > 0) {
        cy.task('reportSmartError', {
          type: 'JAVASCRIPT_ERRORS',
          url,
          errors
        });
      }
    });
    
    // Accessibility check
    if (Cypress.env('ACCESSIBILITY_TESTING')) {
      cy.injectAxe();
      cy.checkA11y(null, null, (violations) => {
        cy.task('reportSmartError', {
          type: 'ACCESSIBILITY_VIOLATIONS',
          url,
          violations
        });
      });
    }
  });
});

// Smart API Testing
Cypress.Commands.add('smartRequest', (options) => {
  const start = Date.now();
  
  return cy.request({
    failOnStatusCode: false,
    timeout: Cypress.env('MAX_API_RESPONSE_TIME'),
    ...options
  }).then((response) => {
    const responseTime = Date.now() - start;
    
    // Performance monitoring
    cy.task('collectPerformanceMetrics', {
      type: 'API_RESPONSE',
      url: options.url,
      method: options.method || 'GET',
      responseTime,
      statusCode: response.status,
      threshold: Cypress.env('MAX_API_RESPONSE_TIME')
    });
    
    // Smart response validation
    if (response.status >= 400) {
      cy.task('reportSmartError', {
        type: 'API_ERROR',
        url: options.url,
        method: options.method || 'GET',
        statusCode: response.status,
        body: response.body
      });
    }
    
    return response;
  });
});

// Visual Regression Testing
Cypress.Commands.add('smartScreenshot', (name, options = {}) => {
  const screenshotOptions = {
    capture: 'viewport',
    blackout: ['.ant-spin', '.loading-spinner'],
    ...options
  };
  
  return cy.screenshot(name, screenshotOptions).then(() => {
    if (Cypress.env('VISUAL_REGRESSION')) {
      cy.task('compareScreenshots', {
        name,
        threshold: Cypress.env('VISUAL_THRESHOLD')
      });
    }
  });
});

// Smart Form Filling
Cypress.Commands.add('smartFillForm', (formData) => {
  Object.entries(formData).forEach(([field, value]) => {
    const selectors = [
      `[name="${field}"]`,
      `[data-testid="${field}"]`,
      `[placeholder*="${field}"]`,
      `#${field}`,
      `.${field}`,
      `[aria-label*="${field}"]`
    ];
    
    let filled = false;
    
    selectors.forEach((selector) => {
      if (!filled) {
        cy.get('body').then(($body) => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).clear().type(value);
            filled = true;
            cy.task('log', `Smart form fill: ${field} = ${value}`);
          }
        });
      }
    });
    
    if (!filled) {
      cy.task('reportSmartError', {
        type: 'FORM_FIELD_NOT_FOUND',
        field,
        suggestions: selectors
      });
    }
  });
});

// Smart Element Interaction
Cypress.Commands.add('smartClick', (selector, options = {}) => {
  return cy.smartGet(selector).then(($el) => {
    // Check if element is visible and clickable
    if ($el.is(':visible') && !$el.is(':disabled')) {
      // Use real events for more realistic interaction
      cy.wrap($el).realClick(options);
    } else {
      // Try scrolling into view
      cy.wrap($el).scrollIntoView();
      cy.wait(500);
      cy.wrap($el).realClick(options);
    }
  });
});

// Smart Text Verification
Cypress.Commands.add('smartShouldContain', (selector, text, options = {}) => {
  return cy.smartGet(selector, options).should(($el) => {
    const elementText = $el.text().toLowerCase();
    const searchText = text.toLowerCase();
    
    const contains = elementText.includes(searchText);
    
    if (!contains) {
      cy.task('reportSmartError', {
        type: 'TEXT_NOT_FOUND',
        selector,
        expected: text,
        actual: elementText,
        similarity: calculateSimilarity(elementText, searchText)
      });
    }
    
    expect(contains).to.be.true;
  });
});

// Smart Network Monitoring
Cypress.Commands.add('monitorNetworkRequests', () => {
  const requests = [];
  
  cy.intercept('**', (req) => {
    const start = Date.now();
    
    req.continue((res) => {
      const duration = Date.now() - start;
      
      requests.push({
        url: req.url,
        method: req.method,
        statusCode: res.statusCode,
        duration
      });
      
      cy.task('collectPerformanceMetrics', {
        type: 'NETWORK_REQUEST',
        url: req.url,
        method: req.method,
        statusCode: res.statusCode,
        duration
      });
    });
  });
  
  return cy.wrap(requests);
});

// Smart Error Recovery
Cypress.Commands.add('smartRetry', (command, maxRetries = 3) => {
  let attempts = 0;
  
  function attempt() {
    attempts++;
    
    try {
      return command();
    } catch (error) {
      if (attempts < maxRetries) {
        cy.task('log', `Retry attempt ${attempts}/${maxRetries}: ${error.message}`);
        cy.wait(1000 * attempts); // Exponential backoff
        return attempt();
      } else {
        cy.task('reportSmartError', {
          type: 'MAX_RETRIES_EXCEEDED',
          command: command.toString(),
          attempts,
          lastError: error.message
        });
        throw error;
      }
    }
  }
  
  return attempt();
});

// Performance Lighthouse Integration
Cypress.Commands.add('auditPerformance', () => {
  cy.window().then((win) => {
    // Collect performance metrics
    const navigation = win.performance.getEntriesByType('navigation')[0];
    const paint = win.performance.getEntriesByType('paint');
    
    const metrics = {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
    };
    
    cy.task('collectPerformanceMetrics', {
      type: 'LIGHTHOUSE_AUDIT',
      metrics
    });
    
    // Check against thresholds
    if (metrics.loadTime > Cypress.env('MAX_LOAD_TIME')) {
      cy.task('reportSmartError', {
        type: 'PERFORMANCE_THRESHOLD_EXCEEDED',
        metric: 'loadTime',
        value: metrics.loadTime,
        threshold: Cypress.env('MAX_LOAD_TIME')
      });
    }
  });
});

// Helper function for text similarity
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
} 