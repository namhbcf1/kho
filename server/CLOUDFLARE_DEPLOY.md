# 🚀 Deploy lên Cloudflare Pages + Workers + D1

## 📋 Yêu cầu
- Tài khoản Cloudflare (miễn phí)
- Node.js 18+
- Git

## 🔧 Setup Backend (Cloudflare Workers + D1)

### 1. Cài đặt Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### 2. Tạo D1 Database
```bash
cd server
npm install

# Tạo D1 database
wrangler d1 create pos-db
```

### 3. Cập nhật wrangler.toml
Sau khi tạo database, copy `database_id` từ output và cập nhật file `wrangler.toml`:
```toml
[[ d1_databases ]]
binding = "DB"
database_name = "pos-db"
database_id = "paste-your-database-id-here"
```

### 4. Chạy Migrations
```bash
# Tạo bảng
wrangler d1 migrations apply pos-db --local

# Thêm dữ liệu mẫu
wrangler d1 execute pos-db --local --file=./migrations/0002_seed_data.sql

# Deploy migrations lên production
wrangler d1 migrations apply pos-db
wrangler d1 execute pos-db --file=./migrations/0002_seed_data.sql
```

### 5. Deploy Backend
```bash
# Test local
npm run dev

# Deploy lên Cloudflare Workers
npm run deploy
```

## 🌐 Setup Frontend (Cloudflare Pages)

### Option 1: GitHub Integration (Đề xuất)

1. **Push code lên GitHub**
```bash
git add .
git commit -m "POS System with Cloudflare"
git push origin main
```

2. **Kết nối với Cloudflare Pages**
- Vào [Cloudflare Dashboard](https://dash.cloudflare.com)
- Pages > Create project > Connect to Git
- Chọn repository GitHub
- Cấu hình build:
  - **Framework preset**: Create React App
  - **Build command**: `cd client && npm install && npm run build`
  - **Build output directory**: `client/build`

3. **Cấu hình Environment Variables**
- Trong Pages settings > Environment variables
- Thêm: `REACT_APP_API_URL` = `https://your-worker.your-subdomain.workers.dev/api`

### Option 2: Direct Upload

```bash
cd client
npm install
npm run build

# Deploy trực tiếp
npx wrangler pages publish build --project-name pos-frontend
```

## 🔗 Cấu hình Custom Domain (Tùy chọn)

### Backend Worker
```bash
wrangler publish --name pos-backend
# Hoặc thêm custom domain trong Cloudflare Dashboard
```

### Frontend Pages
- Vào Pages > Custom domains
- Thêm domain của bạn
- Cập nhật DNS records

## ✅ Kiểm tra hoạt động

1. **Test Backend API**: 
   - `https://your-worker.workers.dev/api/health`

2. **Test Frontend**: 
   - `https://your-pages.pages.dev`

3. **Test tính năng**:
   - Thêm sản phẩm
   - Tạo đơn hàng
   - Xem báo cáo

## 🔧 Development Workflow

```bash
# Local development backend
cd server
npm run dev

# Local development frontend
cd client  
npm start
```

## 💰 Chi phí (FREE)

- **Cloudflare Workers**: 100K requests/day miễn phí
- **D1 Database**: 5GB storage miễn phí
- **Pages**: Unlimited static hosting miễn phí
- **Custom Domain**: Miễn phí nếu dùng Cloudflare DNS

## 🚨 Lưu ý

1. **Database ID**: Nhớ cập nhật `database_id` trong `wrangler.toml`
2. **API URL**: Cập nhật `REACT_APP_API_URL` sau khi deploy worker
3. **CORS**: Đã cấu hình sẵn cho *.pages.dev
4. **Migrations**: Chạy migrations trước khi deploy

## 🆘 Troubleshooting

- **Database không connect**: Kiểm tra `database_id` trong wrangler.toml
- **CORS error**: Thêm domain frontend vào CORS config trong worker
- **API 404**: Kiểm tra routes trong worker và API URL trong frontend 