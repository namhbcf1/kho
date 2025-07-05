#!/bin/bash

# POS System Cloudflare Deployment Script
# This script automates the deployment of the POS system to Cloudflare

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="pos-system"
FRONTEND_PROJECT="pos-frontend"
BACKEND_PROJECT="pos-backend"
DATABASE_NAME="pos-database"

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
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    if ! command_exists wrangler; then
        print_error "Wrangler CLI is not installed. Please install it with: npm install -g wrangler"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "All prerequisites are met"
}

# Function to authenticate with Cloudflare
authenticate_cloudflare() {
    print_status "Authenticating with Cloudflare..."
    
    if ! wrangler whoami >/dev/null 2>&1; then
        print_warning "Not authenticated with Cloudflare. Please run: wrangler login"
        read -p "Press Enter after you've logged in with wrangler login..."
    fi
    
    print_success "Cloudflare authentication verified"
}

# Function to setup Cloudflare resources
setup_cloudflare_resources() {
    print_status "Setting up Cloudflare resources..."
    
    # Create D1 database if it doesn't exist
    if ! wrangler d1 list | grep -q "$DATABASE_NAME"; then
        print_status "Creating D1 database: $DATABASE_NAME"
        wrangler d1 create "$DATABASE_NAME"
        print_warning "Please update wrangler.toml with the database_id from the output above"
        read -p "Press Enter after updating wrangler.toml..."
    else
        print_success "D1 database already exists"
    fi
    
    # Create KV namespace if it doesn't exist
    if ! wrangler kv:namespace list | grep -q "CACHE"; then
        print_status "Creating KV namespace: CACHE"
        wrangler kv:namespace create CACHE
        print_warning "Please update wrangler.toml with the KV namespace IDs from the output above"
        read -p "Press Enter after updating wrangler.toml..."
    else
        print_success "KV namespace already exists"
    fi
    
    # Create R2 bucket if it doesn't exist
    if ! wrangler r2 bucket list | grep -q "pos-storage"; then
        print_status "Creating R2 bucket: pos-storage"
        wrangler r2 bucket create pos-storage
    else
        print_success "R2 bucket already exists"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install frontend dependencies
    cd client
    npm install
    cd ..
    
    # Install backend dependencies
    cd server
    npm install
    cd ..
    
    print_success "All dependencies installed"
}

# Function to setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Check if secrets are already set
    if ! wrangler secret list | grep -q "JWT_SECRET"; then
        print_status "Setting JWT_SECRET..."
        echo "Enter JWT secret (or press Enter for default):"
        read -s JWT_SECRET
        if [ -z "$JWT_SECRET" ]; then
            JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
        fi
        echo "$JWT_SECRET" | wrangler secret put JWT_SECRET
    fi
    
    if ! wrangler secret list | grep -q "ADMIN_PASSWORD"; then
        print_status "Setting ADMIN_PASSWORD..."
        echo "Enter admin password (or press Enter for default):"
        read -s ADMIN_PASSWORD
        if [ -z "$ADMIN_PASSWORD" ]; then
            ADMIN_PASSWORD="admin123"
        fi
        echo "$ADMIN_PASSWORD" | wrangler secret put ADMIN_PASSWORD
    fi
    
    print_success "Environment variables configured"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    cd server
    
    # Apply migrations
    wrangler d1 migrations apply "$DATABASE_NAME"
    
    # Seed data if seed file exists
    if [ -f "./migrations/seed.sql" ]; then
        print_status "Seeding database..."
        wrangler d1 execute "$DATABASE_NAME" --file=./migrations/seed.sql
    fi
    
    cd ..
    
    print_success "Database setup completed"
}

# Function to build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd client
    
    # Create production environment file if it doesn't exist
    if [ ! -f ".env.production" ]; then
        cat > .env.production << EOF
REACT_APP_API_URL=https://pos-backend.your-subdomain.workers.dev
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
EOF
        print_warning "Created .env.production file. Please update the API URL."
        read -p "Press Enter after updating .env.production..."
    fi
    
    # Build the application
    npm run build
    
    cd ..
    
    print_success "Frontend built successfully"
}

# Function to deploy backend
deploy_backend() {
    print_status "Deploying backend to Cloudflare Workers..."
    
    cd server
    
    # Deploy to production
    wrangler deploy
    
    cd ..
    
    print_success "Backend deployed successfully"
}

# Function to deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to Cloudflare Pages..."
    
    cd client
    
    # Deploy to Pages
    wrangler pages deploy build --project-name="$FRONTEND_PROJECT"
    
    cd ..
    
    print_success "Frontend deployed successfully"
}

# Function to test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Get the backend URL from wrangler.toml or use default
    BACKEND_URL=$(grep -o 'https://[^"]*\.workers\.dev' wrangler.toml 2>/dev/null || echo "https://pos-backend.your-subdomain.workers.dev")
    
    # Test health endpoint
    if command_exists curl; then
        print_status "Testing backend health endpoint..."
        if curl -s "$BACKEND_URL/api/health" >/dev/null; then
            print_success "Backend health check passed"
        else
            print_warning "Backend health check failed. Please verify the URL: $BACKEND_URL"
        fi
    fi
    
    print_success "Deployment testing completed"
}

# Function to show deployment info
show_deployment_info() {
    print_status "Deployment Information:"
    echo ""
    echo "Frontend URL: https://$FRONTEND_PROJECT.pages.dev"
    echo "Backend URL: $BACKEND_URL"
    echo "Database: $DATABASE_NAME"
    echo ""
    print_warning "Please update the frontend API URL to point to your backend URL"
    echo ""
    print_success "Deployment completed successfully!"
}

# Main deployment function
main() {
    echo "=========================================="
    echo "  POS System Cloudflare Deployment"
    echo "=========================================="
    echo ""
    
    # Check if running in the correct directory
    if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Run deployment steps
    check_prerequisites
    authenticate_cloudflare
    setup_cloudflare_resources
    install_dependencies
    setup_environment
    run_migrations
    build_frontend
    deploy_backend
    deploy_frontend
    test_deployment
    show_deployment_info
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -s, --setup    Only setup Cloudflare resources"
    echo "  -b, --build    Only build the application"
    echo "  -d, --deploy   Only deploy (skip setup and build)"
    echo "  -t, --test     Only test the deployment"
    echo ""
    echo "Examples:"
    echo "  $0              # Full deployment"
    echo "  $0 --setup      # Only setup resources"
    echo "  $0 --deploy     # Only deploy (assumes setup is done)"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -s|--setup)
        check_prerequisites
        authenticate_cloudflare
        setup_cloudflare_resources
        setup_environment
        exit 0
        ;;
    -b|--build)
        install_dependencies
        build_frontend
        exit 0
        ;;
    -d|--deploy)
        deploy_backend
        deploy_frontend
        test_deployment
        show_deployment_info
        exit 0
        ;;
    -t|--test)
        test_deployment
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac 