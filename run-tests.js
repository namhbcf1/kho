#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 POS Website Comprehensive Test Runner');
console.log('=========================================');

// Get command line arguments
const args = process.argv.slice(2);
const mode = args[0] || 'help';

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, 'client'),
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function runTests() {
  try {
    console.log('🚀 Starting Cypress tests...');
    console.log('Target URL: https://pos-frontend-e1q.pages.dev');
    console.log('');

    switch (mode) {
      case 'open':
      case 'gui':
        console.log('🖥️  Opening Cypress Test Runner GUI...');
        await runCommand('npx', ['cypress', 'open']);
        break;

      case 'run':
      case 'headless':
        console.log('🏃‍♂️ Running tests in headless mode...');
        await runCommand('npx', ['cypress', 'run']);
        break;

      case 'chrome':
        console.log('🌐 Running tests in Chrome...');
        await runCommand('npx', ['cypress', 'run', '--browser', 'chrome']);
        break;

      case 'firefox':
        console.log('🦊 Running tests in Firefox...');
        await runCommand('npx', ['cypress', 'run', '--browser', 'firefox']);
        break;

      case 'spec':
        console.log('📋 Running comprehensive test file...');
        await runCommand('npx', ['cypress', 'run', '--spec', 'cypress/e2e/pos-website-comprehensive-test.cy.js']);
        break;

      case 'advanced':
        console.log('🚀 Running advanced TypeScript test...');
        await runCommand('npx', ['cypress', 'run', '--spec', 'cypress/e2e/advanced-website-test.cy.ts', '--browser', 'chrome']);
        break;

      case 'help':
      default:
        console.log('📖 Usage:');
        console.log('  node run-tests.js [mode]');
        console.log('');
        console.log('🔧 Available modes:');
        console.log('  open     - Open Cypress Test Runner GUI (recommended)');
        console.log('  run      - Run tests in headless mode');
        console.log('  chrome   - Run tests in Chrome browser');
        console.log('  firefox  - Run tests in Firefox browser');
        console.log('  spec     - Run comprehensive test file');
        console.log('  advanced - Run advanced TypeScript test');
        console.log('  help     - Show this help message');
        console.log('');
        console.log('📝 Examples:');
        console.log('  node run-tests.js open     # Open GUI');
        console.log('  node run-tests.js run      # Run headless');
        console.log('  node run-tests.js chrome   # Run in Chrome');
        console.log('  node run-tests.js advanced # Run advanced TypeScript test');
        console.log('');
        console.log('🌐 Test Target: https://pos-frontend-e1q.pages.dev');
        return;
    }

    console.log('');
    console.log('✅ Tests completed successfully!');
    console.log('📊 Check client/cypress/results/ for detailed results');
    console.log('📸 Check client/cypress/screenshots/ for failure screenshots');
    console.log('🎥 Check client/cypress/videos/ for test recordings');

  } catch (error) {
    console.error('');
    console.error('❌ Test execution failed:');
    console.error(error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('1. Make sure Cypress is installed: cd client && npm install cypress --save-dev');
    console.error('2. Check if the target website is accessible');
    console.error('3. Try running with --verbose flag for more details');
    process.exit(1);
  }
}

// Run the tests
runTests(); 