/// <reference types="cypress" />

describe('🔍 Advanced POS Website - Simplified Test Suite', () => {
  const TARGET_URL = 'https://pos-frontend-e1q.pages.dev';
  let testResults: any = {
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

  beforeEach(() => {
    // Reset test results
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

    // Capture console errors
    cy.window().then((win) => {
      const originalError = win.console.error;
      win.console.error = function (...args: any[]) {
        const errorMsg = args.join(' ');
        testResults.errors.push({
          type: 'console',
          severity: 'error',
          message: errorMsg,
          timestamp: new Date().toISOString(),
          url: win.location.href
        });
        originalError.apply(win.console, args);
      };
    });

    // Intercept API requests
    cy.intercept('**/*', (req) => {
      testResults.apiCalls.push({
        url: req.url,
        method: req.method,
        status: 0,
        duration: 0,
        timestamp: new Date().toISOString()
      });
    }).as('apiRequests');

    // Visit the website
    const startTime = Date.now();
    cy.visit(TARGET_URL, { 
      timeout: 60000,
      failOnStatusCode: false
    });

    cy.get('body').should('be.visible');
    cy.wait(3000);
    
    testResults.pageMetrics.loadTime = Date.now() - startTime;
  });

  afterEach(() => {
    // Generate test report
    cy.then(() => {
      const summary = {
        totalErrors: testResults.errors.length,
        totalInteractions: testResults.interactions.length,
        totalApiCalls: testResults.apiCalls.length,
        pageMetrics: testResults.pageMetrics
      };

      cy.log('📊 Test Summary:', JSON.stringify(summary, null, 2));
      cy.task('log', `Test completed: ${summary.totalErrors} errors, ${summary.totalInteractions} interactions`);
    });
  });

  it('🏠 1. Kiểm tra tải trang và thu thập thông tin cơ bản', () => {
    cy.log('📋 Analyzing page structure');
    
    // Check page title
    cy.title().should('not.be.empty').then((title) => {
      cy.log(`📄 Page Title: ${title}`);
    });

    // Count elements
    cy.get('button').then(($buttons) => {
      testResults.pageMetrics.elementsFound.buttons = $buttons.length;
      cy.log(`🔘 Found ${$buttons.length} buttons`);
    });

    cy.get('a[href]').then(($links) => {
      testResults.pageMetrics.elementsFound.links = $links.length;
      cy.log(`🔗 Found ${$links.length} links`);
    });

    cy.get('body').then(($body) => {
      const $forms = $body.find('form');
      testResults.pageMetrics.elementsFound.forms = $forms.length;
      cy.log(`📝 Found ${$forms.length} forms`);
    });

    cy.get('body').then(($body) => {
      const $inputs = $body.find('input, select, textarea');
      testResults.pageMetrics.elementsFound.inputs = $inputs.length;
      cy.log(`📋 Found ${$inputs.length} input elements`);
    });
  });

  it('🔗 2. Kiểm tra các liên kết navigation', () => {
    cy.log('📋 Testing navigation links');
    
    cy.get('body').then(($body) => {
      const $menuItems = $body.find('.ant-menu-item, .ant-menu-submenu');
      
      if ($menuItems.length > 0) {
        cy.get('.ant-menu-item, .ant-menu-submenu').each(($item, index) => {
          const text = $item.text().trim();
          cy.log(`🔗 Testing menu item ${index + 1}: ${text}`);
          
          cy.wrap($item).scrollIntoView().click({ force: true });
          cy.wait(1000);
          
          testResults.interactions.push({
            type: 'menu-link',
            element: text,
            action: 'click',
            success: true,
            timestamp: new Date().toISOString()
          });
        });
      } else {
        cy.log('ℹ️ No menu items found');
      }
    });
  });

  it('🖱️ 3. Kiểm tra các nút bấm', () => {
    cy.log('📋 Testing buttons');
    
    cy.get('body').then(($body) => {
      const $buttons = $body.find('button:visible').not('[disabled]').not('.ant-btn-loading');
      
      if ($buttons.length > 0) {
        cy.log(`🔍 Found ${$buttons.length} interactive buttons`);
        
        cy.wrap($buttons).each(($button, index) => {
          const text = $button.text().trim() || `Button ${index + 1}`;
          cy.log(`🖱️ Testing button ${index + 1}: ${text}`);
          
          cy.wrap($button).click({ force: true });
          cy.wait(500);
          
          // Close any modals
          cy.get('body').then(($body) => {
            if ($body.find('.ant-modal-close').length > 0) {
              cy.get('.ant-modal-close').click({ multiple: true, force: true });
            }
          });
          
          testResults.interactions.push({
            type: 'button',
            element: text,
            action: 'click',
            success: true,
            timestamp: new Date().toISOString()
          });
        });
      } else {
        cy.log('ℹ️ No buttons found');
      }
    });
  });

  it('📝 4. Kiểm tra form và input', () => {
    cy.log('📋 Testing forms and inputs');
    
    cy.get('body').then(($body) => {
      const $inputs = $body.find('input:visible').not('[type="hidden"]').not('[readonly]').not('[disabled]');
      
      if ($inputs.length > 0) {
        cy.log(`🔍 Found ${$inputs.length} input fields`);
        
        cy.wrap($inputs).each(($input, index) => {
          const type = $input.attr('type') || 'text';
          cy.log(`📝 Testing input ${index + 1}: ${type}`);
          
          cy.wrap($input).then(($el) => {
            switch (type.toLowerCase()) {
              case 'text':
              case 'email':
              case 'password':
              case 'search':
                cy.wrap($el).clear({ force: true }).type('Test Value', { force: true });
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
              element: `${type} input`,
              action: 'type',
              success: true,
              timestamp: new Date().toISOString()
            });
          });
        });
      } else {
        cy.log('ℹ️ No input fields found');
      }
    });
  });

  it('🌐 5. Kiểm tra API requests', () => {
    cy.log('📋 Monitoring API requests');
    
    cy.wait(2000);
    
    cy.get('@apiRequests.all').then((interceptions: any) => {
      cy.log(`📡 Captured ${interceptions.length} API requests`);
      
      interceptions.forEach((interception: any, index: number) => {
        const { request, response } = interception;
        cy.log(`API ${index + 1}: ${request.method} ${request.url}`);
        
        if (response) {
          testResults.apiCalls.push({
            url: request.url,
            method: request.method,
            status: response.statusCode,
            duration: response.duration || 0,
            timestamp: new Date().toISOString()
          });
        }
      });
    });
  });

  it('🏗️ 6. Kiểm tra cấu trúc trang', () => {
    cy.log('📋 Checking page structure');
    
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

  it('📊 7. Tổng kết kết quả', () => {
    cy.log('📋 Generating final report');
    
    cy.then(() => {
      const summary = {
        totalErrors: testResults.errors.length,
        totalInteractions: testResults.interactions.length,
        successfulInteractions: testResults.interactions.filter((i: any) => i.success).length,
        totalApiCalls: testResults.apiCalls.length,
        pageLoadTime: testResults.pageMetrics.loadTime,
        elementsFound: testResults.pageMetrics.elementsFound
      };

      cy.log('📊 FINAL REPORT:', JSON.stringify(summary, null, 2));
      
      // Determine test success
      const isSuccess = summary.totalErrors < 5 && 
                       summary.successfulInteractions > 0 && 
                       summary.pageLoadTime < 10000;
      
      cy.log(`🎯 Test Result: ${isSuccess ? '✅ PASS' : '❌ FAIL'}`);
      
      if (isSuccess) {
        cy.log('🎉 All tests completed successfully!');
      } else {
        cy.log('⚠️ Some issues detected, please review the results');
      }
    });
  });
}); 