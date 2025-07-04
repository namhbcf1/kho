# Quick Start Guide - Deploy to Cloudflare

## 🚀 Fast Deployment (5 minutes)

### Prerequisites
- Cloudflare account
- Node.js 18+ installed
- Git repository with your code

### Step 1: Install Wrangler CLI
```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare
```bash
wrangler login
```

### Step 3: Run the Deployment Script
```bash
# Make the script executable (Linux/Mac)
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

**For Windows:**
```bash
# Run with bash
bash deploy.sh
```

### Step 4: Follow the Prompts
The script will guide you through:
1. Creating D1 database
2. Creating KV namespace
3. Creating R2 bucket
4. Setting environment variables
5. Running migrations
6. Deploying backend and frontend

### Step 5: Access Your Application
- **Frontend**: `https://pos-frontend.pages.dev`
- **Backend**: `https://pos-backend.your-subdomain.workers.dev`

## 🔧 Manual Deployment

### Backend Deployment
```bash
cd server

# Install dependencies
npm install

# Create D1 database
wrangler d1 create pos-database

# Update wrangler.toml with database_id

# Run migrations
wrangler d1 migrations apply pos-database

# Deploy
wrangler deploy
```

### Frontend Deployment
```bash
cd client

# Install dependencies
npm install

# Build
npm run build

# Deploy
wrangler pages deploy build --project-name=pos-frontend
```

## 📋 Environment Variables

### Required Secrets
```bash
wrangler secret put JWT_SECRET
wrangler secret put ADMIN_PASSWORD
```

### Frontend Environment
Create `client/.env.production`:
```env
REACT_APP_API_URL=https://pos-backend.your-subdomain.workers.dev
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

## 🔍 Troubleshooting

### Common Issues

1. **"Wrangler not found"**
   ```bash
   npm install -g wrangler
   ```

2. **"Not authenticated"**
   ```bash
   wrangler login
   ```

3. **"Database not found"**
   ```bash
   wrangler d1 create pos-database
   ```

4. **"Build failed"**
   ```bash
   cd client && npm install && npm run build
   ```

### Useful Commands
```bash
# Check deployment status
wrangler whoami

# View logs
wrangler tail

# Test locally
wrangler dev

# List resources
wrangler d1 list
wrangler kv:namespace list
wrangler r2 bucket list
```

## 📚 Next Steps

1. **Custom Domain**: Add your domain in Cloudflare Pages
2. **SSL Certificate**: Automatically handled by Cloudflare
3. **Monitoring**: Enable Cloudflare Analytics
4. **Backup**: Set up database backups
5. **CI/CD**: Configure GitHub Actions

## 🆘 Need Help?

- [Cloudflare Documentation](https://developers.cloudflare.com/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Community Forum](https://community.cloudflare.com/)

## 🎯 Quick Commands Reference

```bash
# Full deployment
./deploy.sh

# Setup only
./deploy.sh --setup

# Deploy only
./deploy.sh --deploy

# Test deployment
./deploy.sh --test

# Build only
./deploy.sh --build
``` 