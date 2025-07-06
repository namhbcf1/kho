/// <reference types="cypress" />

describe('🚨 STRICT Error Detection - Real Error Testing', () => {
  let criticalErrors = [];
  let jsErrors = [];
  let consoleErrors = [];
  
  // Test both URLs
  const urls = [
    'https://f1549151.pos-frontend-e1q.pages.dev/pos',
    'https://pos-frontend-e1q.pages.dev/pos'
  ];

  beforeEach(() => {
    // Reset error arrays
    criticalErrors = [];
    jsErrors = [];
    consoleErrors = [];
  });

  urls.forEach((testUrl, index) => {
    describe(`Testing URL ${index + 1}: ${testUrl}`, () => {
      
      it('🔍 STRICT: Detect JavaScript Errors', () => {
        cy.visit(testUrl, { 
          failOnStatusCode: false,
          timeout: 30000 
        });

        // Capture ALL console errors without filtering
        cy.window().then((win) => {
          const originalError = win.console.error;
          win.console.error = function (...args) {
            const errorMsg = args.join(' ');
            consoleErrors.push(errorMsg);
            cy.log(`🚨 CONSOLE ERROR: ${errorMsg}`);
            originalError.apply(win.console, args);
          };

          // Capture JavaScript errors
          win.addEventListener('error', (event) => {
            const error = {
              message: event.message,
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno,
              error: event.error
            };
            jsErrors.push(error);
            cy.log(`🚨 JS ERROR: ${event.message} at ${event.filename}:${event.lineno}`);
          });

          // Capture unhandled promise rejections
          win.addEventListener('unhandledrejection', (event) => {
            const error = `Unhandled Promise Rejection: ${event.reason}`;
            criticalErrors.push(error);
            cy.log(`🚨 PROMISE REJECTION: ${error}`);
          });
        });

        // Wait for page to load and errors to surface
        cy.wait(5000);

        // Check for critical React errors
        cy.window().then((win) => {
          // Check if page shows error message
          cy.get('body').then(($body) => {
            const bodyText = $body.text();
            
            // Detect error indicators
            const errorIndicators = [
              'Đã xảy ra lỗi',
              'Something went wrong',
              'Error:',
              'TypeError:',
              'ReferenceError:',
              'Minified React error',
              'AI Error Monitor',
              'd is not a function',
              'i is not a function',
              'Cannot read properties',
              'undefined is not a function'
            ];

            const foundErrors = errorIndicators.filter(indicator => 
              bodyText.includes(indicator)
            );

            if (foundErrors.length > 0) {
              criticalErrors.push(...foundErrors);
              cy.log(`🚨 CRITICAL: Found error indicators: ${foundErrors.join(', ')}`);
            }
          });
        });
      });

      it('🔍 STRICT: Check Page Content Load', () => {
        cy.visit(testUrl, { failOnStatusCode: false });
        
        // Wait for content to load
        cy.wait(3000);
        
        // Check if page shows actual content or just error
        cy.get('body').then(($body) => {
          const bodyText = $body.text();
          
          // Check for white screen or error screen
          if (bodyText.includes('Đã xảy ra lỗi') || 
              bodyText.includes('Something went wrong') ||
              bodyText.length < 100) {
            
            criticalErrors.push('Page shows error or blank content');
            cy.log('🚨 CRITICAL: Page is not loading properly');
          }
          
          // Check for specific POS page elements
          const expectedElements = [
            'Bán hàng',
            'Sản phẩm',
            'Khách hàng',
            'Đơn hàng'
          ];
          
          const missingElements = expectedElements.filter(element => 
            !bodyText.includes(element)
          );
          
          if (missingElements.length > 0) {
            criticalErrors.push(`Missing elements: ${missingElements.join(', ')}`);
            cy.log(`🚨 CRITICAL: Missing expected elements: ${missingElements.join(', ')}`);
          }
        });
      });

      it('🔍 STRICT: Check Network Errors', () => {
        // Intercept all requests to catch failures
        cy.intercept('**/*', (req) => {
          req.continue((res) => {
            if (res.statusCode >= 400) {
              criticalErrors.push(`Network error: ${req.method} ${req.url} - ${res.statusCode}`);
              cy.log(`🚨 NETWORK ERROR: ${req.method} ${req.url} - ${res.statusCode}`);
            }
          });
        }).as('allRequests');

        cy.visit(testUrl, { failOnStatusCode: false });
        cy.wait(3000);

        // Check for failed requests
        cy.get('@allRequests.all').then((interceptions) => {
          const failedRequests = interceptions.filter(req => 
            req.response && req.response.statusCode >= 400
          );
          
          if (failedRequests.length > 0) {
            failedRequests.forEach(req => {
              criticalErrors.push(`Failed request: ${req.request.url}`);
            });
          }
        });
      });

      it('📊 STRICT: Final Error Report', () => {
        cy.then(() => {
          const totalErrors = criticalErrors.length + jsErrors.length + consoleErrors.length;
          
          cy.log('='.repeat(60));
          cy.log(`🚨 STRICT ERROR REPORT FOR: ${testUrl}`);
          cy.log('='.repeat(60));
          cy.log(`📊 Total Errors Found: ${totalErrors}`);
          cy.log(`🔥 Critical Errors: ${criticalErrors.length}`);
          cy.log(`⚠️ JavaScript Errors: ${jsErrors.length}`);
          cy.log(`📝 Console Errors: ${consoleErrors.length}`);
          
          if (criticalErrors.length > 0) {
            cy.log('🔥 CRITICAL ERRORS:');
            criticalErrors.forEach((error, index) => {
              cy.log(`  ${index + 1}. ${error}`);
            });
          }
          
          if (jsErrors.length > 0) {
            cy.log('⚠️ JAVASCRIPT ERRORS:');
            jsErrors.forEach((error, index) => {
              cy.log(`  ${index + 1}. ${error.message} at ${error.filename}:${error.lineno}`);
            });
          }
          
          if (consoleErrors.length > 0) {
            cy.log('📝 CONSOLE ERRORS:');
            consoleErrors.forEach((error, index) => {
              cy.log(`  ${index + 1}. ${error}`);
            });
          }
          
          cy.log('='.repeat(60));
          
          // FAIL the test if there are critical errors
          if (criticalErrors.length > 0) {
            throw new Error(`🚨 CRITICAL ERRORS DETECTED: ${criticalErrors.length} errors found. Website is NOT working properly!`);
          }
          
          // FAIL if too many console errors
          if (consoleErrors.length > 5) {
            throw new Error(`🚨 TOO MANY CONSOLE ERRORS: ${consoleErrors.length} errors found. Website has issues!`);
          }
          
          // FAIL if any JavaScript errors
          if (jsErrors.length > 0) {
            throw new Error(`🚨 JAVASCRIPT ERRORS DETECTED: ${jsErrors.length} errors found. Website is broken!`);
          }
          
          cy.log('✅ STRICT TEST PASSED: No critical errors detected');
        });
      });
    });
  });
}); 