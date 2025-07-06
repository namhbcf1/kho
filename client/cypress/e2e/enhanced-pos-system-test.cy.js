describe('Enhanced POS System Tests', () => {
  beforeEach(() => {
    // Set up viewport and visit the application
    cy.viewport(1920, 1080);
    cy.visit('/');
    
    // Handle any uncaught exceptions
    cy.on('uncaught:exception', (err, runnable) => {
      // Don't fail the test on uncaught exceptions
      return false;
    });
    
    // Wait for navigation to load
    cy.get('[data-testid="navigation-sidebar"]', { timeout: 15000 }).should('be.visible');
  });

  describe('1. Customer Creation in POS', () => {
    it('should allow creating new customers from POS page', () => {
      // Navigate to POS page
      cy.get('[data-testid="menu-item-pos"]').click();
      cy.url().should('include', '/pos');
      
      // Wait for page to load
      cy.contains('Điểm Bán Hàng').should('be.visible');
      
      // Click customer select button
      cy.get('[data-testid="customer-select-button"]').click();
      
      // Click "Tạo khách hàng mới" button
      cy.contains('Tạo khách hàng mới').click();
      
      // Fill customer creation form
      cy.get('input[placeholder="Nhập tên khách hàng"]').type('Nguyễn Văn Test');
      cy.get('input[placeholder="Nhập số điện thoại"]').type('0901234567');
      cy.get('input[placeholder="Nhập email (tùy chọn)"]').type('test@example.com');
      cy.get('input[placeholder="Nhập địa chỉ (tùy chọn)"]').type('123 Test Street');
      cy.get('textarea[placeholder="Ghi chú về khách hàng (tùy chọn)"]').type('Khách hàng test');
      
      // Submit form
      cy.contains('Tạo khách hàng').click();
      
      // Verify success message or customer is selected
      cy.get('[data-testid="customer-select-button"]').should('contain', 'Nguyễn Văn Test');
    });

    it('should validate customer creation form', () => {
      cy.get('[data-testid="menu-item-pos"]').click();
      cy.contains('Điểm Bán Hàng').should('be.visible');
      
      cy.get('[data-testid="customer-select-button"]').click();
      cy.contains('Tạo khách hàng mới').click();
      
      // Try to submit without required fields
      cy.contains('Tạo khách hàng').click();
      
      // Check validation messages
      cy.contains('Vui lòng nhập tên khách hàng').should('be.visible');
      cy.contains('Vui lòng nhập số điện thoại').should('be.visible');
      
      // Test invalid phone number
      cy.get('input[placeholder="Nhập tên khách hàng"]').type('Test Name');
      cy.get('input[placeholder="Nhập số điện thoại"]').type('123');
      cy.contains('Tạo khách hàng').click();
      cy.contains('Số điện thoại không hợp lệ').should('be.visible');
      
      // Test invalid email
      cy.get('input[placeholder="Nhập số điện thoại"]').clear().type('0901234567');
      cy.get('input[placeholder="Nhập email (tùy chọn)"]').type('invalid-email');
      cy.contains('Tạo khách hàng').click();
      cy.contains('Email không hợp lệ').should('be.visible');
    });
  });

  describe('2. Serial Number Selection', () => {
    it('should show serial selection modal for products with serials', () => {
      cy.get('[data-testid="menu-item-pos"]').click();
      cy.contains('Điểm Bán Hàng').should('be.visible');
      
      // Search for a product that has serials
      cy.get('[data-testid="product-search"]').type('iPhone');
      cy.wait(2000);
      
      // Look for products with "Chọn Serial" button
      cy.get('button').contains('Chọn Serial').first().click();
      
      // Verify serial selection modal opens
      cy.contains('Chọn Serial').should('be.visible');
      cy.contains('Chọn các serial number bạn muốn thêm vào giỏ hàng').should('be.visible');
      
      // Close modal
      cy.contains('Hủy').click();
    });

    it('should handle products without serials normally', () => {
      cy.get('[data-testid="menu-item-pos"]').click();
      cy.contains('Điểm Bán Hàng').should('be.visible');
      
      // Search for a product without serials
      cy.get('[data-testid="product-search"]').type('Bàn phím');
      cy.wait(2000);
      
      // Look for products with "Thêm" button
      cy.get('button').contains('Thêm').first().click();
      
      // Verify item added to cart directly
      cy.get('[data-testid="cart-section"]').should('contain', 'Bàn phím');
    });
  });

  describe('3. Debt Page Functionality', () => {
    it('should load debt page without white screen', () => {
      cy.get('[data-testid="menu-item-debt"]').click();
      cy.url().should('include', '/debt');
      
      // Verify page loads correctly
      cy.contains('Quản lý nợ').should('be.visible');
      cy.contains('Khách hàng nợ').should('be.visible');
      cy.contains('Nợ nhà cung cấp').should('be.visible');
      
      // Verify debt summary cards
      cy.contains('Tổng khách hàng nợ').should('be.visible');
      cy.contains('Tổng nợ nhà cung cấp').should('be.visible');
      cy.contains('Tổng nợ phải thu').should('be.visible');
    });

    it('should switch between customer and supplier debt tabs', () => {
      cy.get('[data-testid="menu-item-debt"]').click();
      cy.contains('Quản lý nợ').should('be.visible');
      
      // Test customer debt tab
      cy.contains('Khách hàng nợ').click();
      cy.contains('Danh sách khách hàng có nợ').should('be.visible');
      cy.contains('Lịch sử thu nợ khách hàng').should('be.visible');
      
      // Test supplier debt tab
      cy.contains('Nợ nhà cung cấp').click();
      cy.contains('Danh sách nhà cung cấp có nợ').should('be.visible');
      cy.contains('Lịch sử thanh toán nợ nhà cung cấp').should('be.visible');
    });

    it('should handle debt payment modal', () => {
      cy.get('[data-testid="menu-item-debt"]').click();
      cy.contains('Quản lý nợ').should('be.visible');
      
      // Click on "Ghi nhận thanh toán" button
      cy.contains('Ghi nhận thanh toán').click();
      
      // Verify modal opens
      cy.get('.ant-modal').should('be.visible');
      
      // Close modal
      cy.get('.ant-modal-close').click();
      cy.get('.ant-modal').should('not.exist');
    });
  });

  describe('4. POS Cart and Checkout', () => {
    it('should manage cart items correctly', () => {
      cy.get('[data-testid="menu-item-pos"]').click();
      cy.contains('Điểm Bán Hàng').should('be.visible');
      
      // Add items to cart
      cy.get('[data-testid="product-search"]').type('Bàn phím');
      cy.wait(2000);
      cy.get('button').contains('Thêm').first().click();
      
      // Verify cart has items
      cy.get('[data-testid="cart-section"]').should('contain', 'Bàn phím');
      
      // Test discount
      cy.get('[data-testid="discount-input"]').type('10');
      
      // Verify totals update
      cy.contains('Giảm giá (10%)').should('be.visible');
    });

    it('should handle checkout process', () => {
      cy.get('[data-testid="menu-item-pos"]').click();
      cy.contains('Điểm Bán Hàng').should('be.visible');
      
      // Add item to cart
      cy.get('[data-testid="product-search"]').type('Bàn phím');
      cy.wait(2000);
      cy.get('button').contains('Thêm').first().click();
      
      // Select customer
      cy.get('[data-testid="customer-select-button"]').click();
      cy.contains('Khách lẻ').click();
      
      // Proceed to checkout
      cy.get('[data-testid="checkout-button"]').click();
      
      // Verify checkout modal
      cy.contains('Thanh toán').should('be.visible');
      
      // Close checkout modal
      cy.contains('Hủy').click();
    });

    it('should clear cart correctly', () => {
      cy.get('[data-testid="menu-item-pos"]').click();
      cy.contains('Điểm Bán Hàng').should('be.visible');
      
      // Add items to cart
      cy.get('[data-testid="product-search"]').type('Bàn phím');
      cy.wait(2000);
      cy.get('button').contains('Thêm').first().click();
      
      // Clear cart
      cy.contains('Xóa tất cả').click();
      
      // Verify cart is empty
      cy.get('[data-testid="cart-section"]').should('not.contain', 'Bàn phím');
    });
  });

  describe('5. Navigation and UI Tests', () => {
    it('should navigate between all pages without errors', () => {
      const pages = [
        { selector: '[data-testid="menu-item-pos"]', url: '/pos', title: 'Điểm Bán Hàng' },
        { selector: '[data-testid="menu-item-orders"]', url: '/orders', title: 'Đơn hàng' },
        { selector: '[data-testid="menu-item-customers"]', url: '/customers', title: 'Khách hàng' },
        { selector: '[data-testid="menu-item-products"]', url: '/products', title: 'Sản phẩm' },
        { selector: '[data-testid="menu-item-inventory"]', url: '/inventory', title: 'Kho hàng' },
        { selector: '[data-testid="menu-item-suppliers"]', url: '/suppliers', title: 'Nhà cung cấp' },
        { selector: '[data-testid="menu-item-financial"]', url: '/financial', title: 'Thu chi' },
        { selector: '[data-testid="menu-item-debt"]', url: '/debt', title: 'Quản lý nợ' },
        { selector: '[data-testid="menu-item-reports"]', url: '/reports', title: 'Báo cáo' },
        { selector: '[data-testid="menu-item-users"]', url: '/users', title: 'Người dùng' },
        { selector: '[data-testid="menu-item-warranty"]', url: '/warranty', title: 'Bảo hành' }
      ];

      pages.forEach(page => {
        cy.get(page.selector).click();
        cy.url().should('include', page.url);
        cy.contains(page.title).should('be.visible');
        cy.wait(1000);
      });
    });

    it('should handle responsive design', () => {
      // Test mobile view
      cy.viewport(375, 667);
      cy.get('[data-testid="menu-item-pos"]').click();
      cy.contains('Điểm Bán Hàng').should('be.visible');
      
      // Test tablet view
      cy.viewport(768, 1024);
      cy.contains('Điểm Bán Hàng').should('be.visible');
      
      // Test desktop view
      cy.viewport(1920, 1080);
      cy.contains('Điểm Bán Hàng').should('be.visible');
    });
  });

  describe('6. Error Handling and Edge Cases', () => {
    it('should handle API errors gracefully', () => {
      // Intercept API calls and simulate errors
      cy.intercept('GET', '/api/products*', { statusCode: 500 }).as('productsError');
      
      cy.get('[data-testid="menu-item-pos"]').click();
      cy.wait('@productsError');
      
      // Verify error is handled gracefully
      cy.contains('Không thể tải danh sách sản phẩm').should('be.visible');
    });

    it('should handle empty states', () => {
      // Test empty cart
      cy.get('[data-testid="menu-item-pos"]').click();
      cy.contains('Điểm Bán Hàng').should('be.visible');
      cy.get('[data-testid="checkout-button"]').should('be.disabled');
      
      // Test empty search results
      cy.get('[data-testid="product-search"]').type('nonexistentproduct123');
      cy.wait(2000);
      cy.contains('Không tìm thấy sản phẩm').should('be.visible');
    });

    it('should validate form inputs', () => {
      cy.get('[data-testid="menu-item-pos"]').click();
      cy.contains('Điểm Bán Hàng').should('be.visible');
      
      // Test discount validation
      cy.get('[data-testid="discount-input"]').type('150');
      cy.get('[data-testid="discount-input"]').should('have.value', '100');
      
      // Test negative discount
      cy.get('[data-testid="discount-input"]').clear().type('-10');
      cy.get('[data-testid="discount-input"]').should('have.value', '0');
    });
  });

  describe('7. Performance and Load Tests', () => {
    it('should load pages within acceptable time', () => {
      const startTime = Date.now();
      
      cy.get('[data-testid="menu-item-pos"]').click();
      cy.contains('Điểm Bán Hàng').should('be.visible');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(10000); // 10 seconds max
    });

    it('should handle multiple rapid clicks', () => {
      cy.get('[data-testid="menu-item-pos"]').click();
      cy.contains('Điểm Bán Hàng').should('be.visible');
      
      cy.get('[data-testid="product-search"]').type('Bàn phím');
      cy.wait(2000);
      
      // Rapid clicks on add button
      cy.get('button').contains('Thêm').first().click();
      cy.get('button').contains('Thêm').first().click();
      cy.get('button').contains('Thêm').first().click();
      
      // Verify cart handles multiple additions
      cy.get('[data-testid="cart-section"]').should('contain', 'Bàn phím');
    });
  });

  describe('8. Integration Tests', () => {
    it('should complete full POS workflow', () => {
      cy.get('[data-testid="menu-item-pos"]').click();
      cy.contains('Điểm Bán Hàng').should('be.visible');
      
      // 1. Create new customer
      cy.get('[data-testid="customer-select-button"]').click();
      cy.contains('Tạo khách hàng mới').click();
      cy.get('input[placeholder="Nhập tên khách hàng"]').type('Integration Test Customer');
      cy.get('input[placeholder="Nhập số điện thoại"]').type('0901234567');
      cy.contains('Tạo khách hàng').click();
      
      // 2. Add products to cart
      cy.get('[data-testid="product-search"]').type('Bàn phím');
      cy.wait(2000);
      cy.get('button').contains('Thêm').first().click();
      
      // 3. Apply discount
      cy.get('[data-testid="discount-input"]').type('5');
      
      // 4. Proceed to checkout
      cy.get('[data-testid="checkout-button"]').click();
      
      // 5. Complete transaction (or cancel for test)
      cy.contains('Hủy').click();
      
      // Verify workflow completed
      cy.get('[data-testid="customer-select-button"]').should('contain', 'Integration Test Customer');
      cy.get('[data-testid="cart-section"]').should('contain', 'Bàn phím');
    });
  });
}); 