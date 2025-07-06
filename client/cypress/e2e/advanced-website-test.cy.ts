/// <reference types="cypress" />


/**
 * Advanced Comprehensive Website Test Suite
 * Tests the entire POS website with detailed error tracking and interaction testing
 */

interface TestError {
  type: 'console' | 'javascript' | 'network' | 'interaction' | 'api';
  severity: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  url?: string;
  stack?: string;
  element?: string;
}

interface TestResults {
  errors: TestError[];
  interactions: Array<{
    type: string;
    element: string;
    action: string;
    success: boolean;
    timestamp: string;
    details?: any;
  }>;
  apiCalls: Array<{
    url: string;
    method: string;
    status: number;
    duration: number;
    timestamp: string;
  }>;
  pageMetrics: {
    loadTime: number;
    elementsFound: {
      buttons: number;
      links: number;
      forms: number;
      inputs: number;
    };
  };
}

describe('🔍 Advanced POS Website - Comprehensive Test Suite', () => {
  let testResults: TestResults;
  let startTime: number;
  
  const TARGET_URL = 'https://pos-frontend-e1q.pages.dev';
  
  beforeEach(() => {
    startTime = Date.now();
    
    // Initialize test results
    testResults = {
      errors: [],
      interactions: [],
      apiCalls: [],
      pageMetrics: {
        loadTime: 0,
        elementsFound: {
          buttons: 0,
          links: 0,
          forms: 0,
          inputs: 0
        }
      }
    };

    // Setup comprehensive error tracking
    cy.window().then((win) => {
      // Store original console methods
      const originalError = win.console.error;
      const originalWarn = win.console.warn;
      const originalInfo = win.console.info;

      // Override console methods to capture all messages
      win.console.error = (...args: any[]) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        testResults.errors.push({
          type: 'console',
          severity: 'error',
          message,
          timestamp: new Date().toISOString(),
          url: win.location.href
        });
        
        cy.log(`❌ Console Error: ${message}`);
        originalError.apply(win.console, args);
      };

      win.console.warn = (...args: any[]) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        testResults.errors.push({
          type: 'console',
          severity: 'warning',
          message,
          timestamp: new Date().toISOString(),
          url: win.location.href
        });
        
        cy.log(`⚠️ Console Warning: ${message}`);
        originalWarn.apply(win.console, args);
      };

      // Track JavaScript errors
      win.addEventListener('error', (event) => {
        testResults.errors.push({
          type: 'javascript',
          severity: 'error',
          message: event.message,
          timestamp: new Date().toISOString(),
          url: win.location.href,
          stack: event.error?.stack
        });
        
        cy.log(`💥 JavaScript Error: ${event.message}`);
      });

      // Track unhandled promise rejections
      win.addEventListener('unhandledrejection', (event) => {
        testResults.errors.push({
          type: 'javascript',
          severity: 'error',
          message: `Unhandled Promise Rejection: ${event.reason}`,
          timestamp: new Date().toISOString(),
          url: win.location.href
        });
        
        cy.log(`🚫 Promise Rejection: ${event.reason}`);
      });
    });

    // Setup API monitoring with detailed tracking
    cy.intercept('**/*', (req) => {
      const startTime = Date.now();
      
      req.continue((res) => {
        const duration = Date.now() - startTime;
        
        testResults.apiCalls.push({
          url: req.url,
          method: req.method,
          status: res.statusCode || 0,
          duration,
          timestamp: new Date().toISOString()
        });

        // Log API errors
        if (res.statusCode && res.statusCode >= 400) {
          testResults.errors.push({
            type: 'api',
            severity: res.statusCode >= 500 ? 'error' : 'warning',
            message: `API ${req.method} ${req.url} failed with status ${res.statusCode}`,
            timestamp: new Date().toISOString(),
            url: req.url
          });
          
          cy.log(`🌐 API Error: ${req.method} ${req.url} - ${res.statusCode}`);
        }
      });
    }).as('apiRequests');

    // Visit the website with comprehensive error handling
    cy.visit(TARGET_URL, { 
      timeout: 60000,
      failOnStatusCode: false,
      onBeforeLoad: (win) => {
        // Additional setup before page load
        console.log('🚀 Loading page...');
      },
      onLoad: (win) => {
        testResults.pageMetrics.loadTime = Date.now() - startTime;
        console.log(`⏱️ Page loaded in ${testResults.pageMetrics.loadTime}ms`);
      }
    });

    // Wait for page to be fully loaded
    cy.get('body').should('be.visible');
    cy.wait(3000); // Allow time for dynamic content
  });

  afterEach(() => {
    // Generate comprehensive test report
    cy.then(() => {
      const summary = {
        totalErrors: testResults.errors.length,
        errorsByType: testResults.errors.reduce((acc, error) => {
          acc[error.type] = (acc[error.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        totalInteractions: testResults.interactions.length,
        successfulInteractions: testResults.interactions.filter(i => i.success).length,
        totalApiCalls: testResults.apiCalls.length,
        failedApiCalls: testResults.apiCalls.filter(api => api.status >= 400).length,
        pageMetrics: testResults.pageMetrics
      };

      cy.log('📊 Test Summary:', JSON.stringify(summary, null, 2));
      
      // Save detailed results
      cy.writeFile('cypress/results/advanced-test-results.json', {
        summary,
        details: testResults,
        timestamp: new Date().toISOString()
      });
    });
  });

  it('🏠 1. Kiểm tra tải trang và thu thập thông tin cơ bản', () => {
    cy.log('📋 Analyzing page structure and basic information');
    
    // Check page title and basic meta information
    cy.title().should('not.be.empty').then((title) => {
      cy.log(`📄 Page Title: ${title}`);
    });

    // Count and catalog all major elements
    cy.get('button').then(($buttons) => {
      testResults.pageMetrics.elementsFound.buttons = $buttons.length;
      cy.log(`🔘 Found ${$buttons.length} buttons`);
    });

    cy.get('a[href]').then(($links) => {
      testResults.pageMetrics.elementsFound.links = $links.length;
      cy.log(`🔗 Found ${$links.length} links`);
    });

    cy.get('form').then(($forms) => {
      testResults.pageMetrics.elementsFound.forms = $forms.length;
      cy.log(`📝 Found ${$forms.length} forms`);
    });

    cy.get('input, select, textarea').then(($inputs) => {
      testResults.pageMetrics.elementsFound.inputs = $inputs.length;
      cy.log(`📋 Found ${$inputs.length} input elements`);
    });

    // Check for critical page elements
    const criticalSelectors = [
      'header', 'nav', 'main', 'footer',
      '.ant-layout', '.ant-menu', '.ant-content'
    ];

    criticalSelectors.forEach(selector => {
      cy.get('body').then(($body) => {
        const exists = $body.find(selector).length > 0;
        cy.log(`${exists ? '✅' : '❌'} ${selector}: ${exists ? 'Found' : 'Not found'}`);
      });
    });
  });

  it('🔗 2. Kiểm tra tất cả các liên kết (Navigation & Links)', () => {
    cy.log('📋 Testing all navigation links and href elements');
    
    // Test internal navigation links first
    cy.get('a[href]').each(($link, index) => {
      const href = $link.attr('href');
      const text = $link.text().trim() || $link.attr('aria-label') || 'No text';
      
      cy.log(`🔗 Testing link ${index + 1}: "${text}" (${href})`);
      
      // Skip external links, javascript, mailto, tel
      if (href && 
          !href.startsWith('http') && 
          !href.startsWith('javascript:') && 
          !href.startsWith('mailto:') && 
          !href.startsWith('tel:')) {
        
        cy.wrap($link).then(($el) => {
          if ($el.is(':visible') && !$el.hasClass('disabled')) {
            const startTime = Date.now();
            
            cy.wrap($el)
              .click({ force: true })
              .then(() => {
                const duration = Date.now() - startTime;
                
                testResults.interactions.push({
                  type: 'link',
                  element: text,
                  action: 'click',
                  success: true,
                  timestamp: new Date().toISOString(),
                  details: { href, duration }
                });
                
                cy.log(`✅ Link clicked successfully: ${text}`);
                
                // Wait for page to load and check for errors
                cy.wait(1000);
                
                // Navigate back to continue testing
                if (href.startsWith('/') && href !== '/') {
                  cy.go('back');
                  cy.wait(500);
                }
              });
          }
        });
      }
    });
  });

  it('🖱️ 3. Kiểm tra tất cả các nút bấm (Buttons)', () => {
    cy.log('📋 Testing all interactive buttons');
    
    // Get all clickable buttons
    cy.get('button:visible, [role="button"]:visible, input[type="button"]:visible, input[type="submit"]:visible')
      .not('[disabled]')
      .not('.ant-btn-loading')
      .not('.ant-pagination-item') // Skip pagination buttons
      .then(($buttons) => {
        cy.log(`🔍 Found ${$buttons.length} interactive buttons to test`);
        
        cy.wrap($buttons).each(($button, index) => {
          const text = $button.text().trim() || 
                      $button.attr('aria-label') || 
                      $button.attr('title') || 
                      $button.attr('data-testid') || 
                      `Button ${index + 1}`;
          
          cy.log(`🖱️ Testing button ${index + 1}/${$buttons.length}: "${text}"`);
          
          cy.wrap($button).then(($el) => {
            if ($el.is(':visible') && !$el.prop('disabled')) {
              const startTime = Date.now();
              
              cy.wrap($el)
                .click({ force: true })
                .then(() => {
                  const duration = Date.now() - startTime;
                  
                  testResults.interactions.push({
                    type: 'button',
                    element: text,
                    action: 'click',
                    success: true,
                    timestamp: new Date().toISOString(),
                    details: { duration }
                  });
                  
                  cy.log(`✅ Button clicked successfully: ${text}`);
                  
                  // Wait for any response (modal, navigation, etc.)
                  cy.wait(500);
                  
                  // Close any modals or drawers that might have opened
                  cy.get('body').then(($body) => {
                    const modalSelectors = [
                      '.ant-modal-close',
                      '.ant-drawer-close',
                      '[aria-label="Close"]',
                      '.ant-modal-mask',
                      'button:contains("Cancel")',
                      'button:contains("Close")',
                      'button:contains("×")'
                    ];
                    
                    modalSelectors.forEach(selector => {
                      if ($body.find(selector).length > 0) {
                        cy.get(selector).first().click({ force: true });
                      }
                    });
                  });
                                  });
            }
          });
        });
      });
  });

  it('📝 4. Kiểm tra tất cả các form và input elements', () => {
    cy.log('📋 Testing all forms and input elements');
    
    // Test all input fields
    cy.get('input:visible, select:visible, textarea:visible')
      .not('[type="hidden"]')
      .not('[readonly]')
      .not('[disabled]')
      .then(($inputs) => {
        cy.log(`🔍 Found ${$inputs.length} input elements to test`);
        
        cy.wrap($inputs).each(($input, index) => {
          const tagName = $input.prop('tagName').toLowerCase();
          const type = $input.attr('type') || 'text';
          const placeholder = $input.attr('placeholder') || '';
          const name = $input.attr('name') || '';
          const id = $input.attr('id') || '';
          
          const identifier = name || id || placeholder || `${tagName}-${index + 1}`;
          
          cy.log(`📝 Testing ${tagName} ${index + 1}/${$inputs.length}: ${type} (${identifier})`);
          
          cy.wrap($input).then(($el) => {
            try {
              const startTime = Date.now();
              
              if (tagName === 'select') {
                // Handle select elements
                cy.wrap($el).then(($select) => {
                  const options = $select.find('option');
                  if (options.length > 1) {
                    cy.wrap($select).select(options.eq(1).val() as string, { force: true });
                  }
                });
              } else if (tagName === 'textarea') {
                // Handle textarea elements
                cy.wrap($el)
                  .clear({ force: true })
                  .type('Test textarea content for automated testing', { force: true });
              } else {
                // Handle input elements based on type
                switch (type.toLowerCase()) {
                  case 'text':
                  case 'search':
                  case 'url':
                    cy.wrap($el).clear({ force: true }).type('Test Input Value', { force: true });
                    break;
                  case 'email':
                    cy.wrap($el).clear({ force: true }).type('test@example.com', { force: true });
                    break;
                  case 'password':
                    cy.wrap($el).clear({ force: true }).type('TestPassword123', { force: true });
                    break;
                  case 'number':
                    cy.wrap($el).clear({ force: true }).type('123', { force: true });
                    break;
                  case 'tel':
                    cy.wrap($el).clear({ force: true }).type('0123456789', { force: true });
                    break;
                  case 'date':
                    cy.wrap($el).type('2024-01-15', { force: true });
                    break;
                  case 'time':
                    cy.wrap($el).type('14:30', { force: true });
                    break;
                  case 'checkbox':
                    cy.wrap($el).check({ force: true });
                    break;
                  case 'radio':
                    cy.wrap($el).check({ force: true });
                    break;
                  case 'range':
                    cy.wrap($el).invoke('val', 50).trigger('input');
                    break;
                  default:
                    cy.wrap($el).clear({ force: true }).type('Test Value', { force: true });
                }
              }
              
              const duration = Date.now() - startTime;
              
              testResults.interactions.push({
                type: 'input',
                element: identifier,
                action: 'input',
                success: true,
                timestamp: new Date().toISOString(),
                details: { tagName, type, duration }
              });
              
              cy.log(`✅ Input tested successfully: ${identifier}`);
              
            } catch (error) {
              testResults.errors.push({
                type: 'interaction',
                severity: 'error',
                message: `Failed to interact with input: ${identifier} - ${error}`,
                timestamp: new Date().toISOString(),
                element: identifier
              });
              
              testResults.interactions.push({
                type: 'input',
                element: identifier,
                action: 'input',
                success: false,
                timestamp: new Date().toISOString(),
                details: { tagName, type, error: String(error) }
              });
            }
          });
        });
      });

    // Test form submissions
    cy.get('form').then(($forms) => {
      if ($forms.length > 0) {
        cy.log(`📋 Found ${$forms.length} forms to test submission`);
        
        cy.wrap($forms).each(($form, index) => {
          cy.log(`📤 Testing form ${index + 1} submission`);
          
          cy.wrap($form).within(() => {
            // Look for submit buttons
            cy.get('button[type="submit"], input[type="submit"], button:contains("Submit"), button:contains("Save")')
              .first()
              .then(($submitBtn) => {
                if ($submitBtn.length > 0 && $submitBtn.is(':visible') && !$submitBtn.prop('disabled')) {
                  cy.wrap($submitBtn).click({ force: true });
                  
                  testResults.interactions.push({
                    type: 'form',
                    element: `Form ${index + 1}`,
                    action: 'submit',
                    success: true,
                    timestamp: new Date().toISOString()
                  });
                  
                  cy.log(`✅ Form ${index + 1} submitted successfully`);
                  
                  // Wait for response and close any resulting modals
                  cy.wait(1000);
                  cy.get('body').then(($body) => {
                    if ($body.find('.ant-modal-close').length > 0) {
                      cy.get('.ant-modal-close').click({ force: true });
                    }
                  });
                }
              })
              .catch(() => {
                cy.log(`ℹ️ Form ${index + 1} has no submit button or cannot be submitted`);
              });
          });
        });
      }
    });
  });

  it('🌐 5. Kiểm tra và phân tích API calls', () => {
    cy.log('📋 Analyzing API requests and responses');
    
    // Wait for any pending API calls
    cy.wait(2000);
    
    // Analyze API call patterns
    cy.get('@apiRequests.all').then((interceptions: any[]) => {
      cy.log(`📡 Captured ${interceptions.length} API requests`);
      
      if (interceptions.length > 0) {
        const apiSummary = {
          total: interceptions.length,
          successful: 0,
          failed: 0,
          byMethod: {} as Record<string, number>,
          byStatus: {} as Record<string, number>,
          slowRequests: [] as any[]
        };
        
        interceptions.forEach((interception) => {
          const { request, response } = interception;
          const status = response?.statusCode || 0;
          
          // Count by method
          apiSummary.byMethod[request.method] = (apiSummary.byMethod[request.method] || 0) + 1;
          
          // Count by status
          apiSummary.byStatus[status] = (apiSummary.byStatus[status] || 0) + 1;
          
          // Track success/failure
          if (status >= 200 && status < 400) {
            apiSummary.successful++;
          } else if (status >= 400) {
            apiSummary.failed++;
          }
          
          // Find slow requests (>3 seconds)
          const apiCall = testResults.apiCalls.find(call => 
            call.url === request.url && call.method === request.method
          );
          
          if (apiCall && apiCall.duration > 3000) {
            apiSummary.slowRequests.push({
              url: request.url,
              method: request.method,
              duration: apiCall.duration
            });
          }
          
          // Log individual API calls
          const statusIcon = status >= 200 && status < 400 ? '✅' : 
                           status >= 400 ? '❌' : '⚠️';
          
          cy.log(`${statusIcon} ${request.method} ${request.url} - ${status}`);
        });
        
        cy.log('📊 API Summary:', JSON.stringify(apiSummary, null, 2));
        
        // Report slow requests
        if (apiSummary.slowRequests.length > 0) {
          cy.log(`🐌 Found ${apiSummary.slowRequests.length} slow API requests (>3s)`);
          apiSummary.slowRequests.forEach(req => {
            cy.log(`⏱️ ${req.method} ${req.url} took ${req.duration}ms`);
          });
        }
        
        // Report failed requests
        if (apiSummary.failed > 0) {
          cy.log(`🚨 Found ${apiSummary.failed} failed API requests`);
        }
      }
    });
  });

  it('🔍 6. Kiểm tra trang POS cụ thể và các trang quan trọng', () => {
    cy.log('📋 Testing specific important pages');
    
    const importantPages = [
      { path: '/pos', name: 'POS Page' },
      { path: '/inventory', name: 'Inventory Page' },
      { path: '/orders', name: 'Orders Page' },
      { path: '/customers', name: 'Customers Page' },
      { path: '/products', name: 'Products Page' }
    ];
    
    importantPages.forEach(page => {
      cy.log(`🔍 Testing ${page.name} (${page.path})`);
      
      cy.visit(`${TARGET_URL}${page.path}`, { failOnStatusCode: false });
      cy.wait(2000);
      
      // Check if page loads without white screen
      cy.get('body').should('be.visible');
      
      // Check for page-specific content
      cy.get('body').then(($body) => {
        const bodyText = $body.text().trim();
        const hasContent = bodyText.length > 100;
        
        cy.log(`${hasContent ? '✅' : '❌'} ${page.name} content: ${hasContent ? 'Loaded' : 'Empty/Error'}`);
        
        if (!hasContent) {
          testResults.errors.push({
            type: 'interaction',
            severity: 'error',
            message: `${page.name} appears to be empty or not loading properly`,
            timestamp: new Date().toISOString(),
            url: `${TARGET_URL}${page.path}`
          });
        }
        
        // Check for common error indicators
        const errorIndicators = [
          'white screen',
          'something went wrong',
          'error occurred',
          'page not found',
          'loading failed'
        ];
        
        errorIndicators.forEach(indicator => {
          if (bodyText.toLowerCase().includes(indicator)) {
            testResults.errors.push({
              type: 'interaction',
              severity: 'error',
              message: `${page.name} shows error indicator: ${indicator}`,
              timestamp: new Date().toISOString(),
              url: `${TARGET_URL}${page.path}`
            });
          }
        });
      });
    });
    
    // Return to main page
    cy.visit(TARGET_URL);
    cy.wait(1000);
  });

  it('📊 7. Tổng kết và báo cáo chi tiết', () => {
    cy.log('📋 Generating comprehensive final report');
    
    cy.then(() => {
      // Calculate final metrics
      const totalTestTime = Date.now() - startTime;
      const criticalErrors = testResults.errors.filter(e => 
        e.severity === 'error' && (
          e.type === 'javascript' || 
          e.message.includes('Minified React error') ||
          e.message.includes('AI Error Monitor') ||
          e.message.includes('is not a function')
        )
      );
      
      const summary = {
        testDuration: totalTestTime,
        pageMetrics: testResults.pageMetrics,
        errorSummary: {
          total: testResults.errors.length,
          critical: criticalErrors.length,
          byType: testResults.errors.reduce((acc, error) => {
            acc[error.type] = (acc[error.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          bySeverity: testResults.errors.reduce((acc, error) => {
            acc[error.severity] = (acc[error.severity] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        interactionSummary: {
          total: testResults.interactions.length,
          successful: testResults.interactions.filter(i => i.success).length,
          failed: testResults.interactions.filter(i => !i.success).length,
          byType: testResults.interactions.reduce((acc, interaction) => {
            acc[interaction.type] = (acc[interaction.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        apiSummary: {
          total: testResults.apiCalls.length,
          successful: testResults.apiCalls.filter(api => api.status >= 200 && api.status < 400).length,
          failed: testResults.apiCalls.filter(api => api.status >= 400).length,
          averageResponseTime: testResults.apiCalls.length > 0 ? 
            testResults.apiCalls.reduce((sum, api) => sum + api.duration, 0) / testResults.apiCalls.length : 0
        }
      };

      // Log comprehensive summary
      cy.log('📊 FINAL TEST SUMMARY');
      cy.log('===================');
      cy.log(`⏱️ Total test time: ${totalTestTime}ms`);
      cy.log(`📄 Page load time: ${testResults.pageMetrics.loadTime}ms`);
      cy.log(`🔘 Elements found: ${JSON.stringify(testResults.pageMetrics.elementsFound)}`);
      cy.log(`❌ Total errors: ${summary.errorSummary.total}`);
      cy.log(`🚨 Critical errors: ${summary.errorSummary.critical}`);
      cy.log(`🖱️ Total interactions: ${summary.interactionSummary.total}`);
      cy.log(`✅ Successful interactions: ${summary.interactionSummary.successful}`);
      cy.log(`📡 API calls: ${summary.apiSummary.total}`);
      cy.log(`🌐 Failed API calls: ${summary.apiSummary.failed}`);
      
      // Log critical errors in detail
      if (criticalErrors.length > 0) {
        cy.log('🚨 CRITICAL ERRORS FOUND:');
        criticalErrors.forEach((error, index) => {
          cy.log(`${index + 1}. [${error.type}] ${error.message}`);
        });
      }
      
      // Save comprehensive results
      cy.writeFile('cypress/results/comprehensive-test-report.json', {
        summary,
        fullResults: testResults,
        timestamp: new Date().toISOString(),
        testConfig: {
          targetUrl: TARGET_URL,
          testDuration: totalTestTime,
          cypressVersion: Cypress.version
        }
      });
      
      // Performance assertions
      expect(testResults.pageMetrics.loadTime, 'Page load time should be reasonable').to.be.lessThan(10000);
      expect(summary.errorSummary.critical, 'Critical errors should be minimal').to.be.lessThan(5);
      expect(summary.interactionSummary.successful, 'Most interactions should succeed').to.be.greaterThan(summary.interactionSummary.failed);
      
      // Final success message
      cy.log('🎉 Comprehensive website test completed successfully!');
      cy.log(`📊 Results saved to: cypress/results/comprehensive-test-report.json`);
    });
  });
}); 