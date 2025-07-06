// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for safe clicking
Cypress.Commands.add('safeClick', (selector, options = {}) => {
  cy.get(selector).then(($el) => {
    if ($el.is(':visible') && !$el.prop('disabled')) {
      cy.wrap($el).click({ force: true, ...options });
    }
  });
});

// Custom command for safe typing
Cypress.Commands.add('safeType', (selector, text, options = {}) => {
  cy.get(selector).then(($el) => {
    if ($el.is(':visible') && !$el.prop('readonly') && !$el.prop('disabled')) {
      cy.wrap($el).clear({ force: true }).type(text, { force: true, ...options });
    }
  });
});

// Custom command for waiting with timeout
Cypress.Commands.add('waitForLoad', (timeout = 3000) => {
  cy.get('body').should('be.visible');
  cy.wait(timeout);
});

// Custom command for checking if element exists
Cypress.Commands.add('elementExists', (selector) => {
  cy.get('body').then(($body) => {
    return $body.find(selector).length > 0;
  });
});

// Custom command for closing modals
Cypress.Commands.add('closeModals', () => {
  cy.get('body').then(($body) => {
    // Close Ant Design modals
    if ($body.find('.ant-modal-close').length > 0) {
      cy.get('.ant-modal-close').click({ multiple: true, force: true });
    }
    
    // Close Ant Design drawers
    if ($body.find('.ant-drawer-close').length > 0) {
      cy.get('.ant-drawer-close').click({ multiple: true, force: true });
    }
    
    // Close generic close buttons
    if ($body.find('[aria-label="Close"]').length > 0) {
      cy.get('[aria-label="Close"]').click({ multiple: true, force: true });
    }
    
    // Close buttons with close text
    if ($body.find('button:contains("Close")').length > 0) {
      cy.get('button:contains("Close")').click({ multiple: true, force: true });
    }
    
    // Close buttons with X symbol
    if ($body.find('button:contains("×")').length > 0) {
      cy.get('button:contains("×")').click({ multiple: true, force: true });
    }
  });
});

// Custom command for safe navigation
Cypress.Commands.add('safeNavigate', (url) => {
  cy.visit(url, { 
    failOnStatusCode: false,
    timeout: 30000 
  });
  cy.waitForLoad(2000);
});

// Custom command for logging test results
Cypress.Commands.add('logResult', (type, message, data = {}) => {
  const logEntry = {
    type,
    message,
    data,
    timestamp: new Date().toISOString(),
    url: window.location.href
  };
  
  cy.log(`[${type.toUpperCase()}] ${message}`);
  
  // Store in window object for later retrieval
  cy.window().then((win) => {
    if (!win.cypressTestResults) {
      win.cypressTestResults = [];
    }
    win.cypressTestResults.push(logEntry);
  });
});

// Custom command for comprehensive element testing
Cypress.Commands.add('testElement', (selector, elementType = 'element') => {
  cy.get(selector).then(($elements) => {
    if ($elements.length === 0) {
      cy.logResult('warning', `No ${elementType} found with selector: ${selector}`);
      return;
    }
    
    cy.logResult('info', `Found ${$elements.length} ${elementType}(s) with selector: ${selector}`);
    
    $elements.each((index, element) => {
      const $el = Cypress.$(element);
      const isVisible = $el.is(':visible');
      const isEnabled = !$el.prop('disabled');
      const text = $el.text().trim();
      
      cy.logResult('test', `${elementType} ${index + 1}: ${text || 'No text'}`, {
        visible: isVisible,
        enabled: isEnabled,
        tagName: element.tagName.toLowerCase(),
        className: element.className
      });
    });
  });
}); 