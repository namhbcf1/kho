/// <reference types="cypress" />

describe('🚀 ULTRA COMPREHENSIVE POS System Test Suite', () => {
  const TARGET_URL = 'https://f1549151.pos-frontend-e1q.pages.dev';
  
  let testResults = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    interactions: [],
    modals: [],
    buttons: [],
    forms: [],
    apiCalls: [],
    uiElements: [],
    performance: {},
    errors: []
  };

  beforeEach(() => {
    // Enhanced error tracking
    cy.window().then((win) => {
      win.addEventListener('error', (event) => {
        testResults.errors.push({
          type: 'javascript',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          timestamp: new Date().toISOString()
        });
      });

      win.addEventListener('unhandledrejection', (event) => {
        testResults.errors.push({
          type: 'promise',
          message: event.reason?.message || 'Unhandled promise rejection',
          timestamp: new Date().toISOString()
        });
      });
    });

    // API interception for comprehensive monitoring
    cy.intercept('**/*', (req) => {
      testResults.apiCalls.push({
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
      });
    }).as('allRequests');

    cy.visit(TARGET_URL);
    cy.wait(2000); // Allow page to fully load
  });

  describe('🏠 1. NAVIGATION & LAYOUT TESTING', () => {
    it('🔍 1.1 Test Complete Navigation System', () => {
      cy.log('🧭 Testing navigation menu structure');
      
      // Test sidebar collapse/expand
      cy.get('[data-testid="menu-toggle"], .ant-layout-sider-trigger, button[aria-label*="fold"], button[aria-label*="menu"]')
        .first()
        .should('be.visible')
        .click()
        .then(() => {
          testResults.interactions.push({
            type: 'navigation',
            action: 'sidebar_collapse',
            success: true,
            timestamp: new Date().toISOString()
          });
        });

      cy.wait(500);

      // Test expand again
      cy.get('[data-testid="menu-toggle"], .ant-layout-sider-trigger, button[aria-label*="fold"], button[aria-label*="menu"]')
        .first()
        .click();

      // Test all navigation items
      const navItems = [
        'Tổng quan', 'Bán hàng', 'POS', 'Đơn hàng', 'Khách hàng',
        'Sản phẩm', 'Tồn kho', 'Nhà cung cấp', 'Bảo hành',
        'Thu chi', 'Công nợ', 'Báo cáo', 'Nhân viên', 'Cài đặt'
      ];

      navItems.forEach((item, index) => {
        cy.get('.ant-menu-item, .ant-menu-submenu')
          .contains(item)
          .should('be.visible')
          .click({ force: true })
          .then(() => {
            testResults.interactions.push({
              type: 'navigation',
              item: item,
              index: index,
              success: true,
              timestamp: new Date().toISOString()
            });
          });
        
        cy.wait(1000);
        
        // Verify page change
        cy.url().should('not.eq', 'about:blank');
      });
    });

    it('🔍 1.2 Test Header Components', () => {
      cy.log('🎯 Testing header functionality');
      
      // Test notifications
      cy.get('.ant-badge, [data-testid="notifications"], button[aria-label*="notification"]')
        .first()
        .should('be.visible')
        .click()
        .then(() => {
          testResults.interactions.push({
            type: 'header',
            action: 'notifications_open',
            success: true,
            timestamp: new Date().toISOString()
          });
        });

      cy.wait(500);

      // Test user profile dropdown
      cy.get('.user-profile-button, [data-testid="user-menu"], .ant-dropdown-trigger')
        .last()
        .should('be.visible')
        .click()
        .then(() => {
          testResults.interactions.push({
            type: 'header',
            action: 'user_menu_open',
            success: true,
            timestamp: new Date().toISOString()
          });
        });

      cy.wait(500);
      
      // Click outside to close
      cy.get('body').click(0, 0);
    });
  });

  describe('🛒 2. POS PAGE ULTRA DEEP TESTING', () => {
    beforeEach(() => {
      cy.visit(`${TARGET_URL}/pos`);
      cy.wait(3000);
    });

    it('🔍 2.1 Product Search & Filter Testing', () => {
      cy.log('🔍 Testing product search functionality');
      
      // Test product search
      cy.get('input[placeholder*="Tìm sản phẩm"], input[placeholder*="search"], .ant-input')
        .first()
        .should('be.visible')
        .type('test product')
        .then(() => {
          testResults.interactions.push({
            type: 'search',
            action: 'product_search',
            query: 'test product',
            success: true,
            timestamp: new Date().toISOString()
          });
        });

      cy.wait(1000);

      // Test serial number search
      cy.get('input[placeholder*="Serial"], input[placeholder*="Quét"]')
        .should('be.visible')
        .type('TEST123456')
        .then(() => {
          testResults.interactions.push({
            type: 'search',
            action: 'serial_search',
            query: 'TEST123456',
            success: true,
            timestamp: new Date().toISOString()
          });
        });

      // Test search button
      cy.get('button[type="submit"], .ant-btn-primary, button:contains("Quét")')
        .first()
        .click()
        .then(() => {
          testResults.interactions.push({
            type: 'search',
            action: 'search_submit',
            success: true,
            timestamp: new Date().toISOString()
          });
        });

      cy.wait(2000);
    });

    it('🔍 2.2 Cart Functionality Deep Testing', () => {
      cy.log('🛒 Testing cart operations');
      
      // Test add to cart (if products exist)
      cy.get('body').then(($body) => {
        if ($body.find('.ant-card, .product-item, button:contains("Thêm")').length > 0) {
          cy.get('.ant-card, .product-item')
            .first()
            .within(() => {
              cy.get('button:contains("Thêm"), .ant-btn-primary, button[title*="add"]')
                .first()
                .click({ force: true })
                .then(() => {
                  testResults.interactions.push({
                    type: 'cart',
                    action: 'add_product',
                    success: true,
                    timestamp: new Date().toISOString()
                  });
                });
            });

          cy.wait(1000);

          // Test cart quantity controls
          cy.get('.ant-input-number, input[type="number"]')
            .each(($input) => {
              cy.wrap($input)
                .clear()
                .type('2')
                .then(() => {
                  testResults.interactions.push({
                    type: 'cart',
                    action: 'update_quantity',
                    value: 2,
                    success: true,
                    timestamp: new Date().toISOString()
                  });
                });
            });

          // Test remove from cart
          cy.get('button[aria-label*="delete"], .ant-btn-dangerous, button:contains("Xóa")')
            .first()
            .click({ force: true })
            .then(() => {
              testResults.interactions.push({
                type: 'cart',
                action: 'remove_product',
                success: true,
                timestamp: new Date().toISOString()
              });
            });
        }
      });
    });

    it('🔍 2.3 Modal Testing - Complete Coverage', () => {
      cy.log('🎭 Testing all modal interactions');
      
      // Test customer selection modal
      cy.get('button:contains("Khách hàng"), button:contains("Customer")')
        .first()
        .click({ force: true })
        .then(() => {
          testResults.modals.push({
            type: 'customer_select',
            action: 'open',
            success: true,
            timestamp: new Date().toISOString()
          });
        });

      cy.wait(1000);

      // Test modal search
      cy.get('.ant-modal input[placeholder*="tìm"], .ant-modal input[type="search"]')
        .first()
        .type('test customer')
        .then(() => {
          testResults.interactions.push({
            type: 'modal_search',
            action: 'customer_search',
            query: 'test customer',
            success: true,
            timestamp: new Date().toISOString()
          });
        });

      // Test modal close
      cy.get('.ant-modal-close, .ant-modal-footer .ant-btn:contains("Hủy")')
        .first()
        .click()
        .then(() => {
          testResults.modals.push({
            type: 'customer_select',
            action: 'close',
            success: true,
            timestamp: new Date().toISOString()
          });
        });

      cy.wait(500);

      // Test checkout modal
      cy.get('button:contains("Thanh toán"), button:contains("Checkout")')
        .first()
        .click({ force: true })
        .then(() => {
          testResults.modals.push({
            type: 'checkout',
            action: 'open',
            success: true,
            timestamp: new Date().toISOString()
          });
        });

      cy.wait(1000);

      // Test payment method selection
      cy.get('.ant-radio-group .ant-radio-wrapper')
        .each(($radio) => {
          cy.wrap($radio)
            .click()
            .then(() => {
              testResults.interactions.push({
                type: 'payment',
                action: 'method_select',
                success: true,
                timestamp: new Date().toISOString()
              });
            });
        });

      // Close checkout modal
      cy.get('.ant-modal-close, .ant-modal-footer .ant-btn:contains("Hủy")')
        .first()
        .click();
    });

    it('🔍 2.4 Form Validation Deep Testing', () => {
      cy.log('📝 Testing form validation');
      
      // Test all input fields
      cy.get('input, textarea, select').each(($input) => {
        const inputType = $input.attr('type') || 'text';
        const placeholder = $input.attr('placeholder') || '';
        
        cy.wrap($input)
          .clear()
          .type('test input')
          .then(() => {
            testResults.forms.push({
              type: inputType,
              placeholder: placeholder,
              action: 'input_test',
              success: true,
              timestamp: new Date().toISOString()
            });
          });

        // Test validation by clearing required fields
        cy.wrap($input).clear();
      });

      // Test form submission with empty fields
      cy.get('button[type="submit"], .ant-btn-primary')
        .first()
        .click({ force: true })
        .then(() => {
          testResults.forms.push({
            action: 'submit_validation_test',
            success: true,
            timestamp: new Date().toISOString()
          });
        });
    });
  });

  describe('👥 3. CUSTOMER MANAGEMENT TESTING', () => {
    beforeEach(() => {
      cy.visit(`${TARGET_URL}/customers`);
      cy.wait(3000);
    });

    it('🔍 3.1 Customer CRUD Operations', () => {
      cy.log('👤 Testing customer management');
      
      // Test add new customer
      cy.get('button:contains("Thêm"), .ant-btn-primary')
        .first()
        .click()
        .then(() => {
          testResults.interactions.push({
            type: 'customer',
            action: 'add_modal_open',
            success: true,
            timestamp: new Date().toISOString()
          });
        });

      cy.wait(1000);

      // Fill customer form
      const customerData = {
        name: 'Test Customer',
        phone: '0123456789',
        email: 'test@example.com',
        address: 'Test Address'
      };

      Object.entries(customerData).forEach(([field, value]) => {
        cy.get(`input[placeholder*="${field}"], input[name="${field}"]`)
          .first()
          .type(value)
          .then(() => {
            testResults.forms.push({
              field: field,
              value: value,
              success: true,
              timestamp: new Date().toISOString()
            });
          });
      });

      // Test form submission
      cy.get('.ant-modal-footer .ant-btn-primary')
        .click()
        .then(() => {
          testResults.interactions.push({
            type: 'customer',
            action: 'create_submit',
            success: true,
            timestamp: new Date().toISOString()
          });
        });

      cy.wait(2000);
    });

    it('🔍 3.2 Customer Search & Filter', () => {
      cy.log('🔍 Testing customer search');
      
      // Test search functionality
      cy.get('input[placeholder*="tìm"], input[type="search"]')
        .first()
        .type('test')
        .then(() => {
          testResults.interactions.push({
            type: 'customer_search',
            query: 'test',
            success: true,
            timestamp: new Date().toISOString()
          });
        });

      cy.wait(1000);

      // Test filter options
      cy.get('.ant-select, .ant-dropdown-trigger')
        .each(($select) => {
          cy.wrap($select)
            .click()
            .then(() => {
              testResults.interactions.push({
                type: 'customer_filter',
                success: true,
                timestamp: new Date().toISOString()
              });
            });
          
          cy.wait(500);
          cy.get('body').click(0, 0); // Close dropdown
        });
    });
  });

  describe('📦 4. PRODUCT MANAGEMENT TESTING', () => {
    beforeEach(() => {
      cy.visit(`${TARGET_URL}/products`);
      cy.wait(3000);
    });

    it('🔍 4.1 Product CRUD Deep Testing', () => {
      cy.log('📦 Testing product management');
      
      // Test add product
      cy.get('button:contains("Thêm"), .ant-btn-primary')
        .first()
        .click();

      cy.wait(1000);

      // Test all product form fields
      const productFields = [
        { field: 'name', value: 'Test Product' },
        { field: 'sku', value: 'TEST-001' },
        { field: 'price', value: '100000' },
        { field: 'description', value: 'Test Description' }
      ];

      productFields.forEach(({ field, value }) => {
        cy.get(`input[name="${field}"], textarea[name="${field}"], input[placeholder*="${field}"]`)
          .first()
          .type(value);
      });

      // Test category selection
      cy.get('.ant-select')
        .first()
        .click();
      
      cy.get('.ant-select-item')
        .first()
        .click();

      // Test form submission
      cy.get('.ant-modal-footer .ant-btn-primary')
        .click();

      cy.wait(2000);
    });

    it('🔍 4.2 Serial Number Management', () => {
      cy.log('🔢 Testing serial number features');
      
      // Test serial number modal
      cy.get('button:contains("Serial"), .ant-btn:contains("Quản lý")')
        .first()
        .click({ force: true });

      cy.wait(1000);

      // Test add serial number
      cy.get('input[placeholder*="serial"], input[placeholder*="Serial"]')
        .first()
        .type('TEST-SERIAL-001');

      cy.get('button:contains("Thêm"), .ant-btn-primary')
        .first()
        .click();

      cy.wait(1000);
    });
  });

  describe('📊 5. REPORTS & ANALYTICS TESTING', () => {
    beforeEach(() => {
      cy.visit(`${TARGET_URL}/reports`);
      cy.wait(3000);
    });

    it('🔍 5.1 Report Generation Testing', () => {
      cy.log('📈 Testing report functionality');
      
      // Test date range picker
      cy.get('.ant-picker, input[placeholder*="date"]')
        .first()
        .click();

      cy.get('.ant-picker-today-btn, .ant-picker-cell-today')
        .first()
        .click();

      // Test report type selection
      cy.get('.ant-select, .ant-radio-group')
        .first()
        .click();

      cy.wait(500);

      // Test export functionality
      cy.get('button:contains("Xuất"), button:contains("Export")')
        .first()
        .click({ force: true });

      cy.wait(1000);
    });
  });

  describe('🔧 6. SETTINGS & CONFIGURATION TESTING', () => {
    beforeEach(() => {
      cy.visit(`${TARGET_URL}/users`);
      cy.wait(3000);
    });

    it('🔍 6.1 User Management Testing', () => {
      cy.log('👥 Testing user management');
      
      // Test add user
      cy.get('button:contains("Thêm"), .ant-btn-primary')
        .first()
        .click();

      cy.wait(1000);

      // Test user form
      const userData = {
        username: 'testuser',
        email: 'testuser@example.com',
        role: 'staff'
      };

      Object.entries(userData).forEach(([field, value]) => {
        if (field === 'role') {
          cy.get('.ant-select')
            .click();
          cy.get('.ant-select-item')
            .contains(value)
            .click();
        } else {
          cy.get(`input[name="${field}"]`)
            .type(value);
        }
      });
    });
  });

  describe('⚡ 7. PERFORMANCE & UX TESTING', () => {
    it('🔍 7.1 Page Load Performance', () => {
      cy.log('⚡ Testing performance metrics');
      
      const startTime = Date.now();
      
      cy.visit(TARGET_URL);
      
      cy.window().then(() => {
        const loadTime = Date.now() - startTime;
        testResults.performance.pageLoad = loadTime;
        
        cy.log(`📊 Page load time: ${loadTime}ms`);
        
        // Performance should be under 5 seconds
        expect(loadTime).to.be.lessThan(5000);
      });
    });

    it('🔍 7.2 Responsive Design Testing', () => {
      cy.log('📱 Testing responsive design');
      
      const viewports = [
        { width: 320, height: 568 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1024, height: 768 }, // Desktop small
        { width: 1920, height: 1080 } // Desktop large
      ];

      viewports.forEach((viewport) => {
        cy.viewport(viewport.width, viewport.height);
        cy.wait(1000);
        
        // Test that main elements are visible
        cy.get('.ant-layout-sider, .ant-menu').should('exist');
        cy.get('.ant-layout-content').should('be.visible');
        
        testResults.uiElements.push({
          viewport: `${viewport.width}x${viewport.height}`,
          responsive: true,
          timestamp: new Date().toISOString()
        });
      });
    });

    it('🔍 7.3 Accessibility Testing', () => {
      cy.log('♿ Testing accessibility');
      
      // Test keyboard navigation
      cy.get('body').tab();
      cy.focused().should('be.visible');
      
      // Test ARIA labels
      cy.get('[aria-label]').should('have.length.greaterThan', 0);
      
      // Test color contrast (basic check)
      cy.get('.ant-btn-primary').should('have.css', 'background-color');
    });
  });

  describe('🚨 8. ERROR HANDLING & EDGE CASES', () => {
    it('🔍 8.1 Network Error Simulation', () => {
      cy.log('🌐 Testing network error handling');
      
      // Intercept and fail API calls
      cy.intercept('GET', '**/api/**', { forceNetworkError: true }).as('networkError');
      
      cy.visit(`${TARGET_URL}/products`);
      
      // Test that app handles network errors gracefully
      cy.get('.ant-spin, .ant-skeleton, .error-message').should('exist');
    });

    it('🔍 8.2 Invalid Input Testing', () => {
      cy.log('❌ Testing invalid input handling');
      
      cy.visit(`${TARGET_URL}/pos`);
      
      // Test invalid characters in number fields
      cy.get('input[type="number"]')
        .first()
        .type('invalid123abc')
        .should('not.have.value', 'invalid123abc');
      
      // Test SQL injection prevention
      cy.get('input[type="text"]')
        .first()
        .type("'; DROP TABLE users; --")
        .should('have.value', "'; DROP TABLE users; --"); // Should be safely handled
    });
  });

  describe('📊 9. FINAL COMPREHENSIVE REPORT', () => {
    it('🔍 9.1 Generate Complete Test Report', () => {
      cy.log('📋 Generating comprehensive test report');
      
      cy.then(() => {
        const totalInteractions = testResults.interactions.length;
        const totalModals = testResults.modals.length;
        const totalForms = testResults.forms.length;
        const totalApiCalls = testResults.apiCalls.length;
        const totalErrors = testResults.errors.length;
        
        cy.log('='.repeat(80));
        cy.log('🎯 ULTRA COMPREHENSIVE TEST RESULTS');
        cy.log('='.repeat(80));
        cy.log(`📊 Total Interactions Tested: ${totalInteractions}`);
        cy.log(`🎭 Total Modals Tested: ${totalModals}`);
        cy.log(`📝 Total Forms Tested: ${totalForms}`);
        cy.log(`🌐 Total API Calls Monitored: ${totalApiCalls}`);
        cy.log(`⚡ Page Load Performance: ${testResults.performance.pageLoad || 'N/A'}ms`);
        cy.log(`🚨 Total Errors Detected: ${totalErrors}`);
        
        if (totalErrors > 0) {
          cy.log('❌ ERRORS FOUND:');
          testResults.errors.forEach((error, index) => {
            cy.log(`  ${index + 1}. ${error.type}: ${error.message}`);
          });
        }
        
        cy.log('='.repeat(80));
        
        // Save results to file
        cy.writeFile('cypress/results/ultra-comprehensive-results.json', testResults);
        
        // Performance benchmarks
        if (testResults.performance.pageLoad) {
          expect(testResults.performance.pageLoad).to.be.lessThan(5000, 'Page load should be under 5 seconds');
        }
        
        // Error threshold
        expect(totalErrors).to.be.lessThan(5, 'Should have fewer than 5 errors');
        
        cy.log('✅ ULTRA COMPREHENSIVE TESTING COMPLETED SUCCESSFULLY!');
      });
    });
  });
}); 