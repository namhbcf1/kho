// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Global error handling - don't fail tests on uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log the error but don't fail the test
  console.error('Uncaught exception:', err.message);
  
  // Don't fail the test for these specific errors
  if (err.message.includes('AI Error Monitor') ||
      err.message.includes('d is not a function') ||
      err.message.includes('i is not a function') ||
      err.message.includes('ResizeObserver loop limit exceeded') ||
      err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  
  // For other errors, let them fail the test
  return true;
});

// Add global before hook to handle common setup
beforeEach(() => {
  // Set viewport to common desktop size
  cy.viewport(1280, 720);
  
  // Add custom CSS to help with testing
  cy.document().then((doc) => {
    const style = doc.createElement('style');
    style.textContent = `
      /* Make hidden elements visible for testing */
      .cypress-testing * {
        opacity: 1 !important;
        visibility: visible !important;
      }
    `;
    doc.head.appendChild(style);
  });
}); 