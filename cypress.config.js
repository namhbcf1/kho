const { defineConfig } = require('cypress')

module.exports = defineConfig({
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
    supportFile: 'cypress/support/e2e.js',
    
    // Folder structure
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    downloadsFolder: 'cypress/downloads',
    
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
          console.log(`✅ Test results saved to: ${filepath}`)
          
          return null
        },
        
        // Task to clear results
        clearResults() {
          const fs = require('fs')
          const path = require('path')
          
          const resultsDir = path.join(__dirname, 'cypress', 'results')
          if (fs.existsSync(resultsDir)) {
            const files = fs.readdirSync(resultsDir)
            files.forEach(file => {
              fs.unlinkSync(path.join(resultsDir, file))
            })
            console.log('🧹 Previous test results cleared')
          }
          
          return null
        }
      })
      
      return config
    },
    
    // Environment variables
    env: {
      // Add any environment variables here
      baseUrl: 'https://pos-frontend-e1q.pages.dev',
      apiUrl: 'https://pos-backend.bangachieu2.workers.dev'
    }
  }
}) 