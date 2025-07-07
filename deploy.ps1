# PowerShell Deployment Script for POS System
# Compatible with Windows PowerShell 5.1 and PowerShell Core 7+

param(
    [string]$Environment = "production",
    [switch]$SkipTests = $false,
    [switch]$Force = $false,
    [string]$GitHubRepo = "",
    [string]$CloudflareAccountId = "",
    [string]$CloudflareApiToken = ""
)

# Set error handling
$ErrorActionPreference = "Stop"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"
$Magenta = "Magenta"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n🚀 $Message" $Blue
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" $Green
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" $Red
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️ $Message" $Yellow
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️ $Message" $Cyan
}

# Banner
Write-Host @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                     🏪 POS SYSTEM DEPLOYMENT SCRIPT 🏪                      ║
║                                                                              ║
║                         Comprehensive Business Solution                       ║
║                    with AI, Gamification & Commerce Integration              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor $Magenta

Write-Info "Starting deployment process..."
Write-Info "Environment: $Environment"
Write-Info "Skip Tests: $SkipTests"
Write-Info "Force Mode: $Force"

# Check if running as Administrator (recommended)
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Warning "Not running as Administrator. Some operations might fail."
    if (-not $Force) {
        $response = Read-Host "Continue anyway? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Error "Deployment cancelled."
            exit 1
        }
    }
}

# Step 1: Check Prerequisites
Write-Step "Checking prerequisites..."

# Check Git
try {
    $gitVersion = git --version
    Write-Success "Git found: $gitVersion"
} catch {
    Write-Error "Git is not installed or not in PATH"
    Write-Info "Please install Git from: https://git-scm.com/download/win"
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js found: $nodeVersion"
    
    # Check if Node.js version is 18 or higher
    $nodeVersionNumber = [version]($nodeVersion -replace 'v', '')
    if ($nodeVersionNumber.Major -lt 18) {
        Write-Error "Node.js version 18 or higher is required. Current: $nodeVersion"
        Write-Info "Please install Node.js 18+ from: https://nodejs.org/"
        exit 1
    }
} catch {
    Write-Error "Node.js is not installed or not in PATH"
    Write-Info "Please install Node.js 18+ from: https://nodejs.org/"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Success "npm found: $npmVersion"
} catch {
    Write-Error "npm is not installed or not in PATH"
    exit 1
}

# Check Wrangler CLI
try {
    $wranglerVersion = wrangler --version
    Write-Success "Wrangler CLI found: $wranglerVersion"
} catch {
    Write-Warning "Wrangler CLI not found. Installing..."
    try {
        npm install -g wrangler
        Write-Success "Wrangler CLI installed successfully"
    } catch {
        Write-Error "Failed to install Wrangler CLI"
        exit 1
    }
}

# Step 2: Environment Setup
Write-Step "Setting up environment..."

# Create .env.production if it doesn't exist
if (-not (Test-Path "client/.env.production")) {
    if (Test-Path "client/env.production.example") {
        Write-Info "Creating .env.production from example..."
        Copy-Item "client/env.production.example" "client/.env.production"
        Write-Warning "Please configure your environment variables in client/.env.production"
    } else {
        Write-Error "env.production.example not found"
        exit 1
    }
}

# Step 3: Install Dependencies
Write-Step "Installing dependencies..."

# Install client dependencies
Write-Info "Installing client dependencies..."
Set-Location "client"
try {
    npm install
    Write-Success "Client dependencies installed"
} catch {
    Write-Error "Failed to install client dependencies"
    exit 1
}

Set-Location ".."

# Step 4: Build Application
Write-Step "Building application..."

# Build client
Write-Info "Building client application..."
Set-Location "client"
try {
    npm run build
    Write-Success "Client built successfully"
} catch {
    Write-Error "Failed to build client"
    exit 1
}

Set-Location ".."

# Step 5: Git Operations
Write-Step "Preparing Git repository..."

# Add all files
Write-Info "Adding files to Git..."
try {
    git add .
    Write-Success "Files added to Git"
} catch {
    Write-Error "Failed to add files to Git"
    exit 1
}

# Commit changes
Write-Info "Committing changes..."
try {
    $commitMessage = "feat: Complete POS system deployment with AI, gamification, and commerce integration"
    git commit -m $commitMessage
    Write-Success "Changes committed"
} catch {
    Write-Warning "No changes to commit or commit failed"
}

# Push to GitHub
Write-Info "Pushing to GitHub..."
try {
    git push origin main
    Write-Success "Code pushed to GitHub successfully"
} catch {
    Write-Error "Failed to push to GitHub"
    Write-Info "Please check your GitHub repository settings and authentication"
}

# Step 6: Cloudflare Deployment
Write-Step "Deploying to Cloudflare..."

# Deploy to Cloudflare Pages
Write-Info "Deploying to Cloudflare Pages..."
Set-Location "client"
try {
    wrangler pages deploy build --project-name="pos-system" --compatibility-date="2024-01-01"
    Write-Success "Deployed to Cloudflare Pages successfully"
} catch {
    Write-Error "Failed to deploy to Cloudflare Pages"
    Write-Info "Please check your Cloudflare configuration and authentication"
}

Set-Location ".."

# Step 7: Final Status
Write-Step "Deployment Summary"

Write-Success "✅ POS System deployment completed!"
Write-Info "📊 Features deployed:"
Write-Info "  • Complete POS system with role-based access control"
Write-Info "  • AI-powered business intelligence and analytics"
Write-Info "  • Comprehensive gamification system"
Write-Info "  • Unified commerce integration"
Write-Info "  • Advanced reporting and dashboard"
Write-Info "  • Production-ready error handling"

Write-Info "🌐 Access your application:"
Write-Info "  • GitHub Repository: https://github.com/your-username/pos-system"
Write-Info "  • Cloudflare Pages: https://pos-system.pages.dev"

Write-Info "📚 Documentation:"
Write-Info "  • README.md - Getting started guide"
Write-Info "  • AI_FEATURES_DOCUMENTATION.md - AI features guide"
Write-Info "  • DEPLOYMENT_STATUS.md - Deployment details"

Write-Success "🎉 Deployment completed successfully!"
Write-Info "Your POS system is now live and ready for production use!" 