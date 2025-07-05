# Cloudflare Deployment Guide

## Overview
This guide will help you deploy the POS system to Cloudflare using:
- **Cloudflare Pages** for the React frontend
- **Cloudflare Workers** for the Node.js backend API
- **Cloudflare D1** for the PostgreSQL database
- **Cloudflare KV** for caching
- **Cloudflare R2** for file storage

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install globally
   ```bash
   npm install -g wrangler
   ```
3. **Git Repository**: Push your code to GitHub/GitLab

## Step 1: Authentication

```bash
# Login to Cloudflare
wrangler login
```

## Step 2: Setup Cloudflare Resources

### 2.1 Create D1 Database
```bash
# Create the database
wrangler d1 create pos-database

# Copy the database_id from the output and update wrangler.toml
```

### 2.2 Create KV Namespace
```bash
# Create KV namespace for caching
wrangler kv:namespace create CACHE

# Copy the id and preview_id from the output and update wrangler.toml
```

### 2.3 Create R2 Bucket
```bash
# Create R2 bucket for file storage
wrangler r2 bucket create pos-storage

# Update wrangler.toml with the bucket names
```

## Step 3: Update Configuration

### 3.1 Update wrangler.toml
Replace the placeholder values in `wrangler.toml`:

```toml
# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "pos-database"
database_id = "YOUR_ACTUAL_DATABASE_ID"

# KV Namespace
[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_ACTUAL_KV_ID"
preview_id = "YOUR_ACTUAL_PREVIEW_KV_ID"

# R2 Storage
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "pos-storage"
preview_bucket_name = "pos-storage-preview"
```

### 3.2 Set Environment Secrets
```bash
# Set JWT secret
wrangler secret put JWT_SECRET

# Set admin password
wrangler secret put ADMIN_PASSWORD

# Set any other sensitive environment variables
wrangler secret put DATABASE_URL
```

## Step 4: Database Setup

### 4.1 Run Migrations
```bash
# Apply all migrations
wrangler d1 migrations apply pos-database

# For staging environment
wrangler d1 migrations apply pos-database --env staging
```

### 4.2 Seed Data
```bash
# Seed initial data
wrangler d1 execute pos-database --file=./migrations/seed.sql

# For staging environment
wrangler d1 execute pos-database --file=./migrations/seed.sql --env staging
```

## Step 5: Deploy Backend (Workers)

### 5.1 Build and Deploy
```bash
# Navigate to server directory
cd server

# Deploy to production
wrangler deploy

# Deploy to staging
wrangler deploy --env staging
```

### 5.2 Verify Deployment
```bash
# Test the health endpoint
curl https://pos-backend.your-subdomain.workers.dev/api/health
```

## Step 6: Deploy Frontend (Pages)

### 6.1 Build Frontend
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Build for production
npm run build
```

### 6.2 Deploy to Pages
```bash
# Deploy to Cloudflare Pages
wrangler pages deploy build --project-name=pos-frontend

# Deploy preview version
wrangler pages deploy build --project-name=pos-frontend --branch=preview
```

### 6.3 Alternative: GitHub Integration
1. Connect your GitHub repository to Cloudflare Pages
2. Set build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
   - **Root directory**: `client`
3. Set environment variables:
   - `REACT_APP_API_URL`: `https://pos-backend.your-subdomain.workers.dev`

## Step 7: Configure Custom Domain (Optional)

### 7.1 Add Custom Domain
1. Go to Cloudflare Dashboard
2. Navigate to Pages > Your Project > Custom Domains
3. Add your domain (e.g., `pos.yourdomain.com`)

### 7.2 Update DNS Records
```bash
# Add CNAME record for frontend
pos.yourdomain.com CNAME pos-frontend.pages.dev

# Add CNAME record for API
api.yourdomain.com CNAME pos-backend.your-subdomain.workers.dev
```

## Step 8: Environment Variables

### 8.1 Frontend Environment Variables
Create `.env.production` in the client directory:

```env
REACT_APP_API_URL=https://pos-backend.your-subdomain.workers.dev
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

### 8.2 Backend Environment Variables
Set via Wrangler:

```bash
wrangler secret put NODE_ENV production
wrangler secret put API_VERSION v1
wrangler secret put CORS_ORIGIN https://pos-frontend.pages.dev
```

## Step 9: Monitoring and Analytics

### 9.1 Enable Analytics
1. Go to Cloudflare Dashboard
2. Navigate to Analytics
3. Enable Web Analytics for your domain

### 9.2 Set up Logging
```bash
# View real-time logs
wrangler tail

# View specific worker logs
wrangler tail --format=pretty
```

## Step 10: CI/CD Pipeline

### 10.1 GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd client && npm ci
        cd ../server && npm ci
    
    - name: Build frontend
      run: cd client && npm run build
    
    - name: Deploy backend
      run: cd server && wrangler deploy
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    
    - name: Deploy frontend
      run: cd client && wrangler pages deploy build --project-name=pos-frontend
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS configuration in backend
   - Verify frontend URL in CORS origins

2. **Database Connection Issues**
   - Verify D1 database ID in wrangler.toml
   - Check database migrations are applied

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

4. **Environment Variables**
   - Ensure all secrets are set via `wrangler secret put`
   - Check environment variable names match code

### Useful Commands

```bash
# Check deployment status
wrangler whoami

# List all deployments
wrangler deployments list

# Rollback to previous deployment
wrangler rollback

# View worker logs
wrangler tail --format=pretty

# Test locally
wrangler dev

# Check D1 database
wrangler d1 execute pos-database --command="SELECT * FROM users LIMIT 5;"
```

## Performance Optimization

### 1. Enable Caching
```javascript
// In your Worker
const cache = caches.default;
const response = await cache.match(request);
```

### 2. Optimize Images
- Use Cloudflare Images for automatic optimization
- Implement lazy loading in React

### 3. Bundle Optimization
```bash
# Analyze bundle size
npm run analyze
```

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **CORS**: Restrict origins to your domain only
3. **Rate Limiting**: Implement rate limiting on API endpoints
4. **Input Validation**: Use Zod for all input validation
5. **HTTPS**: Always use HTTPS in production

## Cost Optimization

1. **D1 Queries**: Optimize database queries
2. **KV Usage**: Use KV sparingly for frequently accessed data
3. **R2 Storage**: Implement lifecycle policies for old files
4. **Worker CPU Time**: Optimize worker execution time

## Support

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

## Deployment Checklist

- [ ] Wrangler CLI installed and authenticated
- [ ] D1 database created and configured
- [ ] KV namespace created and configured
- [ ] R2 bucket created and configured
- [ ] Environment secrets set
- [ ] Database migrations applied
- [ ] Seed data loaded
- [ ] Backend deployed to Workers
- [ ] Frontend built and deployed to Pages
- [ ] Custom domain configured (optional)
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] Health check endpoint working
- [ ] All API endpoints tested
- [ ] Frontend connecting to backend
- [ ] Monitoring and analytics enabled 