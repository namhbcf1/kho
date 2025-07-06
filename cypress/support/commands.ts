/// <reference types="cypress" />

// Custom command for safe clicking
Cypress.Commands.add('safeClick', (selector: string, options?: any) => {
  cy.get(selector).then(($el) => {
    if ($el.is(':visible') && !$el.prop('disabled')) {
      cy.wrap($el).click({ force: true, ...options });
    }
  });
});

// Custom command for safe typing
Cypress.Commands.add('safeType', (selector: string, text: string, options?: any) => {
  cy.get(selector).then(($el) => {
    if ($el.is(':visible') && !$el.prop('readonly') && !$el.prop('disabled')) {
      cy.wrap($el).clear().type(text, { force: true, ...options });
    }
  });
});

// Custom command for waiting with timeout
Cypress.Commands.add('waitForLoad', (timeout: number = 3000) => {
  cy.get('body').should('be.visible');
  cy.wait(timeout);
});

// Custom command for checking if element exists
Cypress.Commands.add('elementExists', (selector: string) => {
  cy.get('body').then(($body) => {
    return $body.find(selector).length > 0;
  });
});

// Extend Cypress namespace with custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      safeClick(selector: string, options?: any): Chainable<Element>;
      safeType(selector: string, text: string, options?: any): Chainable<Element>;
      waitForLoad(timeout?: number): Chainable<Element>;
      elementExists(selector: string): Chainable<boolean>;
    }
  }
} 