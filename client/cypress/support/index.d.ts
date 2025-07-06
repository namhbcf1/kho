/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Safely click an element (checks if visible and not disabled)
       * @param selector - CSS selector
       * @param options - Click options
       */
      safeClick(selector: string, options?: Partial<Cypress.ClickOptions>): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Safely type in an element (checks if visible, not readonly, not disabled)
       * @param selector - CSS selector
       * @param text - Text to type
       * @param options - Type options
       */
      safeType(selector: string, text: string, options?: Partial<Cypress.TypeOptions>): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Close all open modals and drawers
       */
      closeModals(): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Wait for page to load with custom timeout
       * @param timeout - Timeout in milliseconds
       */
      waitForLoad(timeout?: number): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Check if element exists
       * @param selector - CSS selector
       */
      elementExists(selector: string): Chainable<boolean>;
      
      /**
       * Log test results with structured format
       * @param type - Type of log entry
       * @param message - Log message
       * @param data - Additional data
       */
      logResult(type: string, message: string, data?: any): Chainable<void>;
      
      /**
       * Comprehensive element testing
       * @param selector - CSS selector
       * @param elementType - Type of element for logging
       */
      testElement(selector: string, elementType?: string): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Navigate safely to a URL
       * @param url - URL to navigate to
       */
      safeNavigate(url: string): Chainable<void>;
    }
  }
}

export {}; 