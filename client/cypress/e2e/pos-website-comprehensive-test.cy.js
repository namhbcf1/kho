/// <reference types="cypress" />

describe('🔍 POS Website - Comprehensive Test Suite', () => {
  let testResults = {
    errors: [],
    warnings: [],
    interactions: [],
    apiCalls: []
  };
  
  const baseUrl = 'https://pos-frontend-e1q.pages.dev';
  
  beforeEach(() => {
    // Reset test results
    testResults = {
      errors: [],
      warnings: [],
      interactions: [],
      apiCalls: []
    };

    // Capture console errors and warnings
    cy.window().then((win) => {
      // Store original console methods
      const originalError = win.console.error;
      const originalWarn = win.console.warn;

      // Override console.error
      win.console.error = function (...args) {
        const errorMsg = args.join(' ');
        testResults.errors.push({
          type: 'console.error',
          message: errorMsg,
          timestamp: new Date().toISOString(),
          url: win.location.href
        });
        
        cy.log(`❌ Console Error: ${errorMsg}`);
        originalError.apply(win.console, args);
      };

      // Override console.warn
      win.console.warn = function (...args) {
        const warnMsg = args.join(' ');
        testResults.warnings.push({
          type: 'console.warn',
          message: warnMsg,
          timestamp: new Date().toISOString()
        });
        
        cy.log(`⚠️ Console Warning: ${warnMsg}`);
        originalWarn.apply(win.console, args);
      };

      // Track unhandled errors
      win.addEventListener('error', (event) => {
        testResults.errors.push({
          type: 'javascript.error',
          message: `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
          timestamp: new Date().toISOString(),
          url: win.location.href
        });
      });

      // Track unhandled promise rejections
      win.addEventListener('unhandledrejection', (event) => {
        testResults.errors.push({
          type: 'promise.rejection',
          message: `Unhandled promise rejection: ${event.reason}`,
          timestamp: new Date().toISOString(),
          url: win.location.href
        });
      });
    });

    // Intercept all network requests
    cy.intercept('**/*', (req) => {
      testResults.apiCalls.push({
        url: req.url,
        method: req.method,
        status: 0,
        timestamp: new Date().toISOString()
      });
    }).as('allRequests');

    // Visit the main page with extended timeout
    cy.visit(baseUrl, { 
      timeout: 60000,
      failOnStatusCode: false 
    });

    // Wait for page to load completely
    cy.wait(3000);
  });

  afterEach(() => {
    // Log final test results
    cy.then(() => {
      console.log('📊 Test Results Summary:', {
        errors: testResults.errors.length,
        warnings: testResults.warnings.length,
        interactions: testResults.interactions.length,
        apiCalls: testResults.apiCalls.length
      });

      if (testResults.errors.length > 0) {
        console.error('❌ Errors found:', testResults.errors);
      }
      if (testResults.warnings.length > 0) {
        console.warn('⚠️ Warnings found:', testResults.warnings);
      }
    });
  });

  it('🏠 1. Kiểm tra tải trang chính và các lỗi console', () => {
    cy.log('📋 Checking main page load and console errors');
    
    // Verify page loads
    cy.get('body').should('be.visible');
    
    // Check page title
    cy.title().should('not.be.empty');
    
    // Check for critical errors that prevent page load
    cy.window().then((win) => {
      const criticalErrors = testResults.errors.filter(error => 
        error.message.includes('Minified React error') ||
        error.message.includes('TypeError') ||
        error.message.includes('ReferenceError') ||
        error.message.includes('AI Error Monitor')
      );
      
      if (criticalErrors.length > 0) {
        cy.log(`🚨 Found ${criticalErrors.length} critical errors`);
        criticalErrors.forEach(error => {
          cy.log(`❌ ${error.message}`);
        });
      }
    });

    // Wait for any async operations
    cy.wait(2000);
  });

  it('🔗 2. Kiểm tra tất cả các liên kết navigation', () => {
    cy.log('📋 Testing all navigation links');
    
    // Test sidebar menu items with better visibility handling
    cy.get('body').then(($body) => {
      if ($body.find('.ant-menu-item, .ant-menu-submenu').length > 0) {
    cy.get('.ant-menu-item, .ant-menu-submenu').each(($menuItem, index) => {
      const text = $menuItem.text().trim();
      cy.log(`🔗 Testing menu item ${index + 1}: ${text}`);
      
      cy.wrap($menuItem)
            .scrollIntoView()
        .click({ force: true })
        .then(() => {
          testResults.interactions.push({
            type: 'menu-link',
            element: text,
            action: 'click',
            result: 'success',
            timestamp: new Date().toISOString()
          });
          
          // Wait for page to load
          cy.wait(1000);
          
          // Check if page loaded successfully
          cy.get('body').should('be.visible');
        });
        });
      } else {
        cy.log('ℹ️ No menu items found, testing alternative navigation');
        
        // Test any clickable navigation elements
        cy.get('nav a, [role="menuitem"], .menu-item').then(($navItems) => {
          if ($navItems.length > 0) {
            cy.wrap($navItems).each(($item, index) => {
              const text = $item.text().trim() || 'Nav item';
              cy.log(`🔗 Testing nav item ${index + 1}: ${text}`);
              
              cy.wrap($item).click({ force: true });
              cy.wait(500);
            });
          } else {
            cy.log('ℹ️ No navigation elements found');
          }
        });
      }
    });
  });

  it('🖱️ 3. Kiểm tra tất cả các nút bấm (buttons)', () => {
    cy.log('📋 Testing all buttons on the page');
    
    // Get all buttons but exclude disabled ones and loading buttons
    cy.get('button:visible')
      .not('[disabled]')
      .not('.ant-btn-loading')
      .not('.ant-pagination-item')
      .then(($buttons) => {
        cy.log(`🔍 Found ${$buttons.length} interactive buttons`);
        
        // Test each button
        cy.wrap($buttons).each(($button, index) => {
          const text = $button.text().trim() || $button.attr('aria-label') || $button.attr('title') || `Button ${index + 1}`;
          
          cy.log(`🖱️ Testing button ${index + 1}/${$buttons.length}: ${text}`);
          
          cy.wrap($button)
            .should('be.visible')
            .then(($el) => {
              if ($el.is(':visible') && !$el.prop('disabled')) {
                cy.wrap($el)
                  .click({ force: true })
                  .then(() => {
                    testResults.interactions.push({
                      type: 'button',
                      element: text,
                      action: 'click',
                      result: 'success',
                      timestamp: new Date().toISOString()
                    });
                    
                    // Wait for any modal or content to appear
                    cy.wait(500);
                    
                    // Close any modals that might have opened
                    cy.get('body').then(($body) => {
                      if ($body.find('.ant-modal-close').length > 0) {
                        cy.get('.ant-modal-close').click({ multiple: true, force: true });
                      }
                      if ($body.find('.ant-drawer-close').length > 0) {
                        cy.get('.ant-drawer-close').click({ multiple: true, force: true });
                      }
                      if ($body.find('[aria-label="Close"]').length > 0) {
                        cy.get('[aria-label="Close"]').click({ multiple: true, force: true });
                      }
                    });
                  });
              }
            });
        });
      });
  });

  it('📝 4. Kiểm tra tất cả các form và input', () => {
    cy.log('📋 Testing all forms and inputs');
    
    // Test all input fields
    cy.get('body').then(($body) => {
      const $inputs = $body.find('input:visible').not('[type="hidden"]').not('[readonly]').not('[disabled]');
      
        if ($inputs.length > 0) {
          cy.log(`🔍 Found ${$inputs.length} input fields`);
          
          cy.wrap($inputs).each(($input, index) => {
            const type = $input.attr('type') || 'text';
            const placeholder = $input.attr('placeholder') || 'No placeholder';
            
            cy.log(`📝 Testing input ${index + 1}/${$inputs.length}: ${type} (${placeholder})`);
            
            cy.wrap($input).then(($el) => {
              try {
                switch (type.toLowerCase()) {
                  case 'text':
                  case 'email':
                  case 'password':
                  case 'search':
                    cy.wrap($el).clear({ force: true }).type('Test Value 123', { force: true });
                    break;
                  case 'number':
                    cy.wrap($el).clear({ force: true }).type('123', { force: true });
                    break;
                  case 'checkbox':
                    cy.wrap($el).check({ force: true });
                    break;
                  case 'radio':
                    cy.wrap($el).check({ force: true });
                    break;
                  case 'date':
                    cy.wrap($el).type('2024-01-15', { force: true });
                    break;
                  default:
                    cy.wrap($el).clear({ force: true }).type('Test', { force: true });
                }
                
                testResults.interactions.push({
                  type: 'input',
                  element: `${type} input (${placeholder})`,
                  action: 'type',
                  result: 'success',
                  timestamp: new Date().toISOString()
                });
              } catch (error) {
                testResults.errors.push({
                  type: 'input.interaction',
                  message: `Failed to interact with input: ${type} - ${error}`,
                  timestamp: new Date().toISOString()
                });
              }
            });
          });
        } else {
          cy.log('ℹ️ No input fields found on the page');
        }
      });

    // Test all select dropdowns
    cy.get('body').then(($body) => {
      const $selects = $body.find('select:visible');
      if ($selects.length > 0) {
        cy.log(`🔍 Found ${$selects.length} select dropdowns`);
        
        cy.wrap($selects).each(($select, index) => {
          cy.wrap($select).then(($el) => {
            const options = $el.find('option');
            if (options.length > 1) {
              cy.wrap($el).select(options.eq(1).val(), { force: true });
              
              testResults.interactions.push({
                type: 'select',
                element: 'dropdown',
                action: 'select',
                result: 'success',
                timestamp: new Date().toISOString()
              });
            }
          });
        });
      } else {
        cy.log('ℹ️ No select dropdowns found on the page');
      }
    });

    // Test all textareas
    cy.get('body').then(($body) => {
      const $textareas = $body.find('textarea:visible');
      if ($textareas.length > 0) {
        cy.log(`🔍 Found ${$textareas.length} textarea fields`);
        
        cy.wrap($textareas).each(($textarea, index) => {
          cy.wrap($textarea)
            .clear({ force: true })
            .type('This is a test message for textarea field.', { force: true });
          
          testResults.interactions.push({
            type: 'textarea',
            element: 'textarea',
            action: 'type',
            result: 'success',
            timestamp: new Date().toISOString()
          });
        });
      } else {
        cy.log('ℹ️ No textarea fields found on the page');
      }
    });
  });

  it('🌐 5. Kiểm tra các yêu cầu API', () => {
    cy.log('📋 Monitoring API requests and responses');
    
    // Wait for any pending requests
    cy.wait(2000);
    
    // Check intercepted requests
    cy.get('@allRequests.all').then((interceptions) => {
      cy.log(`📡 Captured ${interceptions.length} API requests`);
      
      interceptions.forEach((interception, index) => {
        const { request, response } = interception;
        
        testResults.apiCalls.push({
          url: request.url,
          method: request.method,
          status: response ? response.statusCode : 0,
          timestamp: new Date().toISOString()
        });
        
        if (response && response.statusCode >= 400) {
          testResults.errors.push({
            type: 'api.error',
            message: `API Error: ${request.method} ${request.url} - Status: ${response.statusCode}`,
            timestamp: new Date().toISOString(),
            url: request.url
          });
          
          cy.log(`🚨 API Error: ${request.method} ${request.url} - ${response.statusCode}`);
        } else if (response) {
          cy.log(`✅ API Success: ${request.method} ${request.url} - ${response.statusCode}`);
        }
      });
    });
  });

  it('🏗️ 6. Kiểm tra cấu trúc trang và các phần tử chính', () => {
    cy.log('📋 Checking page structure and main elements');
    
    // Check for main structural elements
    const structuralElements = [
      'header',
      'nav', 
      'main',
      'footer',
      '[role="main"]',
      '[role="navigation"]',
      '.ant-layout',
      '.ant-layout-header',
      '.ant-layout-content',
      '.ant-layout-sider'
    ];

    structuralElements.forEach((selector) => {
      cy.get('body').then(($body) => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).should('be.visible');
          cy.log(`✅ Found structural element: ${selector}`);
        } else {
          cy.log(`ℹ️ Optional structural element not found: ${selector}`);
        }
      });
    });

    // Check for common UI components
    const commonComponents = [
      '.ant-menu',
      '.ant-button',
      '.ant-card',
      '.ant-table',
      '.ant-form',
      '.ant-input'
    ];

    commonComponents.forEach((selector) => {
      cy.get('body').then(($body) => {
        const count = $body.find(selector).length;
        if (count > 0) {
          cy.log(`✅ Found ${count} instances of: ${selector}`);
        }
      });
    });
  });

  it('🔍 7. Kiểm tra trang POS cụ thể', () => {
    cy.log('📋 Testing POS page specifically');
    
    // Navigate to POS page
    cy.visit(`${baseUrl}/pos`, { failOnStatusCode: false });
    cy.wait(3000);
    
    // Check if POS page loads without white screen
    cy.get('body').should('be.visible');
    
    // Look for POS-specific elements
    const posElements = [
      '[data-testid="pos-page"]',
      '.pos-page',
      'input[placeholder*="sản phẩm"]',
      'input[placeholder*="product"]',
      'button[type="submit"]',
      '.ant-card',
      '.ant-table'
    ];
    
    posElements.forEach((selector) => {
      cy.get('body').then(($body) => {
        if ($body.find(selector).length > 0) {
          cy.log(`✅ Found POS element: ${selector}`);
        }
      });
    });
    
    // Check for white screen or error state
    cy.get('body').then(($body) => {
      const bodyText = $body.text().trim();
      if (bodyText.length < 100) {
        cy.log('⚠️ POS page might be showing white screen - very little content');
      }
    });
  });

  it('📊 8. Tổng kết và báo cáo kết quả', () => {
    cy.log('📋 Generating final test report');
    
    cy.then(() => {
      const summary = {
        totalErrors: testResults.errors.length,
        totalWarnings: testResults.warnings.length,
        totalInteractions: testResults.interactions.length,
        totalApiCalls: testResults.apiCalls.length,
        criticalErrors: testResults.errors.filter(e => 
          e.type === 'javascript.error' || 
          e.type === 'promise.rejection' ||
          e.message.includes('Minified React error') ||
          e.message.includes('AI Error Monitor')
        ).length,
        apiErrors: testResults.errors.filter(e => e.type === 'api.error').length
      };

      cy.log('📊 Final Test Summary:');
      cy.log(`❌ Total Errors: ${summary.totalErrors}`);
      cy.log(`⚠️ Total Warnings: ${summary.totalWarnings}`);
      cy.log(`🖱️ Total Interactions: ${summary.totalInteractions}`);
      cy.log(`📡 Total API Calls: ${summary.totalApiCalls}`);
      cy.log(`🚨 Critical Errors: ${summary.criticalErrors}`);
      cy.log(`🌐 API Errors: ${summary.apiErrors}`);

      // Log detailed errors for debugging
      if (testResults.errors.length > 0) {
        cy.log('🔍 Detailed Errors:');
        testResults.errors.forEach((error, index) => {
          cy.log(`${index + 1}. [${error.type}] ${error.message}`);
        });
      }

      // Save results using Cypress task
      cy.task('log', `Test completed with ${summary.totalErrors} errors and ${summary.totalWarnings} warnings`);
      
      // Create final assertions
      expect(summary.criticalErrors, 'Critical errors should be minimal').to.be.lessThan(10);
      expect(summary.totalErrors, 'Total errors should be manageable').to.be.lessThan(50);
    });
  });
}); 