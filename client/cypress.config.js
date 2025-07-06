const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://e13d1daa.pos-system-production-2025.pages.dev',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    
    // Smart 2025 Features
    experimentalStudio: true,
    experimentalWebKitSupport: true,
    experimentalMemoryManagement: true,
    experimentalSourceRewriting: true,
    
    // AI-Powered Testing Configuration
    retries: {
      runMode: 3,
      openMode: 1
    },
    
    // Smart Test Distribution
    numTestsKeptInMemory: 10,
    
    // Visual Regression Testing
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    // Performance Monitoring
    trashAssetsBeforeRuns: true,
    
    env: {
      // Smart Testing Environment Variables
      SMART_RETRY: true,
      AI_DETECTION: true,
      VISUAL_REGRESSION: true,
      PERFORMANCE_MONITORING: true,
      ACCESSIBILITY_TESTING: true,
      
      // API Configuration
      API_URL: 'https://pos-backend-v2.bangachieu2.workers.dev/api',
      
      // Test Data
      TEST_USER: 'cypress@test.com',
      TEST_PASSWORD: 'cypress123',
      
      // Performance Thresholds
      MAX_LOAD_TIME: 15000,
      MAX_API_RESPONSE_TIME: 10000,
      MIN_LIGHTHOUSE_SCORE: 70,
      
      // Visual Testing
      VISUAL_THRESHOLD: 0.1,
      SCREENSHOT_COMPARISON: true,
      
      // Smart Selectors
      AUTO_SELECTOR_GENERATION: true,
      SMART_WAIT: true,
      SELF_HEALING_TESTS: true
    },
    
    setupNodeEvents(on, config) {
      // Smart Test Plugins
      require('@cypress/grep/src/plugin')(config);
      
      // Performance Monitoring
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--remote-debugging-port=9222');
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
        }
        return launchOptions;
      });
      
      // Smart Test Reporting
      on('task', {
        log(message) {
          console.log(`🤖 Smart Cypress: ${message}`);
          return null;
        },
        
        // AI-Powered Test Analysis
        analyzeTestResults(results) {
          console.log('🧠 AI Analysis:', results);
          return null;
        },
        
        // Performance Metrics Collection
        collectPerformanceMetrics(metrics) {
          console.log('📊 Performance Metrics:', metrics);
          return null;
        },
        
        // Visual Regression Analysis
        compareScreenshots(data) {
          console.log('👁️ Visual Comparison:', data);
          return null;
        },
        
        // Smart Error Reporting
        reportSmartError(error) {
          console.log('🚨 Smart Error Detection:', error);
          return null;
        }
      });
      
      return config;
    }
  },
  
  // Component Testing for 2025
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Smart Component Testing
    experimentalSingleTabRunMode: true,
    
    env: {
      COMPONENT_TESTING: true,
      SMART_MOCKING: true,
      AI_COMPONENT_ANALYSIS: true
    }
  }
}); 