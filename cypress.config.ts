import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'https://pos-frontend-e1q.pages.dev',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    
    // Test files
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Support files
    supportFile: 'cypress/support/e2e.ts',
    
    // Setup node events
    setupNodeEvents(on, config) {
      // implement node event listeners here
      
      // Task to log messages
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        
        // Task to save test results
        saveResults(results) {
          const fs = require('fs')
          const path = require('path')
          
          const resultsDir = path.join(__dirname, 'cypress', 'results')
          if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true })
          }
          
          const filename = `test-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
          const filepath = path.join(resultsDir, filename)
          
          fs.writeFileSync(filepath, JSON.stringify(results, null, 2))
          console.log(`Test results saved to: ${filepath}`)
          
          return null
        }
      })
      
      return config
    },
  },
  
  // Component testing (optional)
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },
}) 