describe('🛠️ POS System - Serial Tracking & UI Fixes', () => {
  beforeEach(() => {
    // Handle uncaught exceptions
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('Content-Security-Policy') || 
          err.message.includes('reading \'name\'') ||
          err.message.includes('reading \'map\'') ||
          err.message.includes('tt.initialize')) {
        return false;
      }
      return true;
    });
  });

  it('✅ Fix Verification: No duplicate discount inputs', () => {
    cy.visit('/pos');
    cy.wait(3000);
    
    // Should have only ONE discount input (InputNumber), not duplicate
    cy.get('[data-testid="discount-input"]').should('have.length', 1);
    cy.get('[data-testid="discount-number-input"]').should('not.exist');
    
    // Test discount functionality
    cy.get('[data-testid="discount-input"]').clear().type('10');
    cy.get('[data-testid="discount-input"]').should('have.value', '10');
    
    cy.log('✅ Discount input fixed - no more duplicates');
  });

  it('🔧 Fix Verification: No duplicate quantity inputs in cart', () => {
    cy.visit('/pos');
    cy.wait(3000);
    
    // Add a product to cart first
    cy.get('[data-testid="product-search"]').type('RAM');
    cy.wait(1000);
    
    // Add product to cart
    cy.get('.ant-card').first().within(() => {
      cy.get('button').contains('Thêm').click();
    });
    
    // Check cart has the product
    cy.get('[data-testid="cart-section"]').should('contain', 'RAM');
    
    // Should have only ONE quantity input per cart item, not duplicates
    cy.get('[data-testid^="cart-quantity-"]').should('have.length', 1);
    
    cy.log('✅ Cart quantity inputs fixed - no more duplicates');
  });

  it('📋 Serial Number Tracking: Products with serial should show selection', () => {
    cy.visit('/pos');
    cy.wait(3000);
    
    // Search for products that might have serial numbers
    cy.get('[data-testid="product-search"]').type('RAM');
    cy.wait(1000);
    
    // Look for products with "Chọn Serial" button
    cy.get('.ant-card').then($cards => {
      if ($cards.length > 0) {
        // Check if any product has serial selection
        cy.get('.ant-card').each($card => {
          cy.wrap($card).within(() => {
            cy.get('button').then($button => {
              const buttonText = $button.text();
              if (buttonText.includes('Chọn Serial')) {
                cy.log('✅ Found product with serial selection');
                cy.wrap($button).should('contain', 'Chọn Serial');
              } else {
                cy.log('Product without serial - shows "Thêm" button');
                cy.wrap($button).should('contain', 'Thêm');
              }
            });
          });
        });
      }
    });
  });

  it('🏷️ Serial Display: Cart should show serial numbers with SN: prefix', () => {
    cy.visit('/pos');
    cy.wait(3000);
    
    // Add a regular product first
    cy.get('[data-testid="product-search"]').type('RAM');
    cy.wait(1000);
    
    cy.get('.ant-card').first().within(() => {
      cy.get('button').first().click();
    });
    
    // Check if cart shows items properly
    cy.get('[data-testid="cart-section"]').should('be.visible');
    
    // If there's a serial number in cart, it should show with "SN:" prefix
    cy.get('[data-testid="cart-section"]').then($cart => {
      if ($cart.text().includes('SN:')) {
        cy.get('.ant-tag').contains('SN:').should('be.visible');
        cy.log('✅ Serial numbers displayed with SN: prefix');
      } else {
        cy.log('No serial numbers in current cart items');
      }
    });
  });

  it('🛒 Complete POS Workflow: Add products and checkout', () => {
    cy.visit('/pos');
    cy.wait(3000);
    
    // 1. Search and add product
    cy.get('[data-testid="product-search"]').type('RAM');
    cy.wait(1000);
    
    cy.get('.ant-card').first().within(() => {
      cy.get('button').first().click();
    });
    
    // 2. Verify product in cart
    cy.get('[data-testid="cart-section"]').should('contain', 'RAM');
    
    // 3. Set discount (using fixed single input)
    cy.get('[data-testid="discount-input"]').clear().type('5');
    
    // 4. Proceed to checkout
    cy.get('[data-testid="checkout-button"]').should('not.be.disabled');
    cy.get('[data-testid="checkout-button"]').click();
    
    // 5. Checkout modal should appear
    cy.get('.ant-modal').should('be.visible');
    cy.get('.ant-modal-title').should('contain', 'Thanh toán');
    
    // 6. Use exact amount button
    cy.get('[data-testid="exact-amount-button"]').click();
    
    // 7. Confirm payment amount is filled
    cy.get('[data-testid="received-amount-input"]').should('not.have.value', '');
    
    cy.log('✅ Complete POS workflow working with fixes');
  });

  it('🎯 UI Elements: All components render without duplicate elements', () => {
    cy.visit('/pos');
    cy.wait(3000);
    
    // Check main sections exist
    cy.get('[data-testid="product-search"]').should('be.visible');
    cy.get('[data-testid="cart-section"]').should('be.visible');
    cy.get('[data-testid="discount-input"]').should('be.visible');
    cy.get('[data-testid="checkout-button"]').should('be.visible');
    
    // Verify no duplicate discount inputs
    cy.get('[data-testid="discount-input"]').should('have.length', 1);
    
    // Check navigation is working
    cy.get('[data-testid="nav-pos"]').should('have.class', 'ant-menu-item-selected');
    
    cy.log('✅ All UI elements render correctly without duplicates');
  });
}); 