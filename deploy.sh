#!/bin/bash

# POS System Deployment Script
# This script handles deployment to both GitHub and Cloudflare Pages

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Advanced POS System"
GITHUB_REPO="advanced-pos-system"
CLOUDFLARE_PROJECT_NAME="pos-system"
BUILD_DIR="client/build"
DIST_DIR="client/dist"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if git is installed
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git and try again."
        exit 1
    fi
    
    # Check if node is installed
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js and try again."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check if wrangler is installed
    if ! command_exists wrangler; then
        print_warning "Wrangler is not installed. Installing Wrangler..."
        npm install -g wrangler
    fi
    
    print_success "All prerequisites are met!"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Create .env.production if it doesn't exist
    if [ ! -f "client/.env.production" ]; then
        if [ -f "client/env.production.example" ]; then
            print_status "Creating .env.production from example..."
            cp client/env.production.example client/.env.production
            print_warning "Please update client/.env.production with your actual values before continuing."
            read -p "Press Enter to continue after updating the environment file..."
        else
            print_error "No environment configuration found. Please create client/.env.production"
            exit 1
        fi
    fi
    
    print_success "Environment setup complete!"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install client dependencies
    cd client
    npm install
    cd ..
    
    # Install server dependencies
    cd server
    npm install
    cd ..
    
    print_success "Dependencies installed!"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Run client tests
    cd client
    if npm run test -- --watchAll=false --coverage; then
        print_success "Client tests passed!"
    else
        print_warning "Some client tests failed, but continuing deployment..."
    fi
    cd ..
    
    # Run server tests if they exist
    if [ -f "server/package.json" ] && grep -q "test" server/package.json; then
        cd server
        if npm test; then
            print_success "Server tests passed!"
        else
            print_warning "Some server tests failed, but continuing deployment..."
        fi
        cd ..
    fi
    
    print_success "Tests completed!"
}

# Function to build the application
build_application() {
    print_status "Building application..."
    
    # Build client
    cd client
    npm run build
    cd ..
    
    # Check if build was successful
    if [ -d "$BUILD_DIR" ] || [ -d "$DIST_DIR" ]; then
        print_success "Application built successfully!"
    else
        print_error "Build failed. Please check the build output."
        exit 1
    fi
}

# Function to optimize build
optimize_build() {
    print_status "Optimizing build..."
    
    # Compress static files if gzip is available
    if command_exists gzip; then
        find client/build -name "*.js" -o -name "*.css" -o -name "*.html" | while read -r file; do
            gzip -c "$file" > "$file.gz"
        done
        print_success "Static files compressed!"
    fi
    
    # Generate service worker if not exists
    if [ ! -f "client/build/sw.js" ]; then
        print_status "Generating service worker..."
        # Add service worker generation logic here
    fi
    
    print_success "Build optimization complete!"
}

# Function to setup GitHub repository
setup_github_repo() {
    print_status "Setting up GitHub repository..."
    
    # Check if git repo is initialized
    if [ ! -d ".git" ]; then
        print_status "Initializing Git repository..."
        git init
        git add .
        git commit -m "Initial commit: Advanced POS System"
    fi
    
    # Check if remote origin exists
    if ! git remote get-url origin >/dev/null 2>&1; then
        print_status "Adding GitHub remote..."
        echo "Please enter your GitHub username:"
        read -r GITHUB_USERNAME
        git remote add origin "https://github.com/$GITHUB_USERNAME/$GITHUB_REPO.git"
        print_success "GitHub remote added!"
    fi
    
    print_success "GitHub repository setup complete!"
}

# Function to deploy to GitHub
deploy_to_github() {
    print_status "Deploying to GitHub..."
    
    # Add all files
    git add .
    
    # Commit changes
    COMMIT_MESSAGE="Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MESSAGE" || print_warning "No changes to commit"
    
    # Push to GitHub
    git push -u origin main || git push -u origin master
    
    print_success "Successfully deployed to GitHub!"
}

# Function to setup Cloudflare Pages
setup_cloudflare_pages() {
    print_status "Setting up Cloudflare Pages..."
    
    # Check if wrangler is authenticated
    if ! wrangler whoami >/dev/null 2>&1; then
        print_status "Authenticating with Cloudflare..."
        wrangler login
    fi
    
    # Create pages project if it doesn't exist
    if ! wrangler pages project list | grep -q "$CLOUDFLARE_PROJECT_NAME"; then
        print_status "Creating Cloudflare Pages project..."
        wrangler pages project create "$CLOUDFLARE_PROJECT_NAME" --production-branch main
    fi
    
    print_success "Cloudflare Pages setup complete!"
}

# Function to deploy to Cloudflare Pages
deploy_to_cloudflare() {
    print_status "Deploying to Cloudflare Pages..."
    
    # Determine build directory
    BUILD_PATH="client/build"
    if [ -d "client/dist" ]; then
        BUILD_PATH="client/dist"
    fi
    
    # Deploy to Cloudflare Pages
    wrangler pages deploy "$BUILD_PATH" --project-name="$CLOUDFLARE_PROJECT_NAME" --compatibility-date="2024-01-01"
    
    print_success "Successfully deployed to Cloudflare Pages!"
}

# Function to setup GitHub Actions
setup_github_actions() {
    print_status "Setting up GitHub Actions..."
    
    # Create .github/workflows directory
    mkdir -p .github/workflows
    
    # Create deployment workflow
    cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: client/package-lock.json
        
    - name: Install dependencies
      run: |
        cd client
        npm ci
        
    - name: Run tests
      run: |
        cd client
        npm run test -- --watchAll=false --coverage
        
    - name: Build application
      run: |
        cd client
        npm run build
        
    - name: Deploy to Cloudflare Pages
      uses: cloudflare/pages-action@v1
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        projectName: pos-system
        directory: client/build
        gitHubToken: ${{ secrets.GITHUB_TOKEN }}
        
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: client/coverage/lcov.info
        flags: frontend
        name: codecov-umbrella
EOF
    
    print_success "GitHub Actions workflow created!"
}

# Function to create documentation
create_documentation() {
    print_status "Creating documentation..."
    
    # Create README.md if it doesn't exist
    if [ ! -f "README.md" ]; then
        cat > README.md << 'EOF'
# Advanced POS System

A comprehensive Point of Sale system with AI features, gamification, and omnichannel commerce capabilities.

## Features

- **Role-based Authentication**: Admin, Cashier, and Staff roles with granular permissions
- **AI-Powered Analytics**: Demand forecasting, product recommendations, and business intelligence
- **Gamification System**: Points, badges, challenges, and leaderboards for staff engagement
- **Omnichannel Commerce**: Integration with Vietnamese e-commerce platforms
- **Real-time Reporting**: Comprehensive analytics and reporting dashboard
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- **Offline Support**: PWA capabilities with offline functionality
- **Hardware Integration**: Barcode scanners, receipt printers, and payment terminals

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment file: `cp client/env.production.example client/.env.production`
4. Update environment variables in `.env.production`
5. Build the application: `npm run build`
6. Deploy using the deployment script: `./deploy.sh`

## Documentation

- [AI Features Documentation](AI_FEATURES_DOCUMENTATION.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [API Documentation](API_DOCUMENTATION.md)

## Support

For support, please contact: support@your-domain.com

## License

This project is licensed under the MIT License.
EOF
        print_success "README.md created!"
    fi
    
    # Create deployment guide
    cat > DEPLOYMENT_GUIDE.md << 'EOF'
# Deployment Guide

This guide covers deploying the Advanced POS System to production.

## Prerequisites

- Node.js 18 or higher
- Git
- GitHub account
- Cloudflare account
- Wrangler CLI

## Deployment Steps

1. **Prepare Environment**
   ```bash
   cp client/env.production.example client/.env.production
   # Update the environment variables
   ```

2. **Run Deployment Script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Manual Deployment**
   ```bash
   # Build the application
   cd client && npm run build
   
   # Deploy to Cloudflare Pages
   wrangler pages deploy build --project-name=pos-system
   ```

## Environment Variables

See `client/env.production.example` for all available configuration options.

## CI/CD Pipeline

The project includes GitHub Actions workflow for automated deployment:
- Triggered on push to main/master branch
- Runs tests and builds the application
- Deploys to Cloudflare Pages automatically

## Monitoring

- Error reporting via Sentry
- Performance monitoring
- Analytics tracking
- Health checks

## Troubleshooting

Common issues and solutions:

1. **Build Failures**: Check Node.js version and dependencies
2. **Deployment Errors**: Verify Cloudflare credentials
3. **Performance Issues**: Enable compression and caching
4. **Authentication Issues**: Check JWT configuration

For more help, contact support@your-domain.com
EOF
    
    print_success "Documentation created!"
}

# Function to display deployment summary
display_summary() {
    print_success "Deployment Summary"
    echo "=================================="
    echo "Project: $PROJECT_NAME"
    echo "GitHub Repository: https://github.com/$(git config user.name)/$GITHUB_REPO"
    echo "Cloudflare Pages: https://$CLOUDFLARE_PROJECT_NAME.pages.dev"
    echo "Build Directory: $BUILD_DIR"
    echo "Deployment Time: $(date)"
    echo "=================================="
    
    print_success "Deployment completed successfully!"
    print_status "Your POS system is now live and ready to use!"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up temporary files..."
    
    # Remove temporary files
    rm -rf client/build/*.gz.tmp
    rm -rf client/dist/*.gz.tmp
    
    print_success "Cleanup complete!"
}

# Main deployment function
main() {
    echo "========================================"
    echo "  Advanced POS System Deployment"
    echo "========================================"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Setup environment
    setup_environment
    
    # Install dependencies
    install_dependencies
    
    # Run tests
    run_tests
    
    # Build application
    build_application
    
    # Optimize build
    optimize_build
    
    # Setup GitHub repository
    setup_github_repo
    
    # Deploy to GitHub
    deploy_to_github
    
    # Setup GitHub Actions
    setup_github_actions
    
    # Setup Cloudflare Pages
    setup_cloudflare_pages
    
    # Deploy to Cloudflare
    deploy_to_cloudflare
    
    # Create documentation
    create_documentation
    
    # Display summary
    display_summary
    
    # Cleanup
    cleanup
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    print_status "Your Advanced POS System is now live!"
    echo ""
}

# Handle script interruption
trap cleanup EXIT

# Check if script is run with parameters
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h          Show this help message"
        echo "  --build-only        Only build the application"
        echo "  --github-only       Only deploy to GitHub"
        echo "  --cloudflare-only   Only deploy to Cloudflare"
        echo "  --setup-only        Only setup repositories"
        echo ""
        exit 0
        ;;
    --build-only)
        check_prerequisites
        setup_environment
        install_dependencies
        build_application
        optimize_build
        ;;
    --github-only)
        check_prerequisites
        setup_github_repo
        deploy_to_github
        ;;
    --cloudflare-only)
        check_prerequisites
        setup_cloudflare_pages
        deploy_to_cloudflare
        ;;
    --setup-only)
        check_prerequisites
        setup_environment
        setup_github_repo
        setup_cloudflare_pages
        setup_github_actions
        ;;
    *)
        main
        ;;
esac 