# 🏪 POS System - Hệ thống quản lý bán hàng

Hệ thống POS (Point of Sale) đơn giản được xây dựng với React + Cloudflare Workers + D1, hoàn toàn miễn phí và không cần server.

## ✨ Tính năng chính

- 🛒 **Bán hàng (POS)**: Giao diện bán hàng trực quan, hỗ trợ barcode
- 📦 **Quản lý sản phẩm**: Thêm/sửa/xóa sản phẩm, quản lý tồn kho
- 📋 **Quản lý đơn hàng**: Theo dõi đơn hàng, in hóa đơn
- 📊 **Báo cáo**: Thống kê doanh thu, tồn kho, sản phẩm bán chạy
- 🖨️ **In hóa đơn**: Hỗ trợ in hóa đơn trực tiếp từ browser
- 📱 **Responsive**: Hoạt động tốt trên mọi thiết bị
- 🌐 **100% Cloudflare**: Miễn phí, tốc độ cao, không cần server

## 🛠️ Công nghệ sử dụng

### Backend
- Cloudflare Workers (Serverless)
- Cloudflare D1 (SQLite Database)
- Hono Framework (Fast Web Framework)

### Frontend
- React 18
- Ant Design UI
- Cloudflare Pages (Static Hosting)

## 📁 Cấu trúc project

```
kho/
├── server/                    # Cloudflare Workers
│   ├── src/index.js          # Main worker file
│   ├── migrations/           # D1 database migrations
│   ├── wrangler.toml         # Cloudflare config
│   └── package.json
├── client/                    # React Frontend
│   ├── src/
│   │   ├── pages/            # Main pages
│   │   ├── services/         # API services
│   │   └── utils/            # Utilities
│   └── package.json
├── deploy.sh                  # Auto deploy script
└── README.md
```

## 🚀 Quick Start (Cloudflare)

### 📋 Yêu cầu
- Tài khoản Cloudflare (miễn phí)
- Node.js 18+
- Git

### 1. Cài đặt Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### 2. Setup Backend
```bash
cd server
npm install

# Tạo D1 database
wrangler d1 create pos-db
```

### 3. Cập nhật Database ID
Sau khi tạo database, copy `database_id` và cập nhật trong `server/wrangler.toml`:
```toml
database_id = "paste-your-database-id-here"
```

### 4. Deploy Database & Backend
```bash
# Chạy migrations
wrangler d1 migrations apply pos-db
wrangler d1 execute pos-db --file=./migrations/0002_seed_data.sql

# Deploy worker
npm run deploy
```

### 5. Deploy Frontend
```bash
cd ../client
npm install
npm run build
npx wrangler pages publish build --project-name pos-frontend
```

### 6. Cấu hình API URL
Trong Cloudflare Pages dashboard:
- Vào Settings > Environment variables
- Thêm: `REACT_APP_API_URL` = `https://your-worker.workers.dev/api`

## 🔧 Local Development

### Backend (Workers)
```bash
cd server
npm run dev
# Chạy tại: http://localhost:8787
```

### Frontend (React)
```bash
cd client
npm start
# Chạy tại: http://localhost:3000
```

## 💰 Chi phí (100% MIỄN PHÍ)

- **Cloudflare Workers**: 100K requests/day
- **D1 Database**: 5GB storage + 5M reads/day
- **Pages**: Unlimited static hosting
- **Bandwidth**: 100GB/month
- **Custom Domain**: Miễn phí với Cloudflare DNS

## 🌐 Production URLs

Sau khi deploy, bạn sẽ có:
- **Backend API**: `https://your-worker.workers.dev`
- **Frontend**: `https://your-pages.pages.dev`

## 📚 API Endpoints

```
GET    /api/health              # Health check
GET    /api/products            # Lấy danh sách sản phẩm
POST   /api/products            # Tạo sản phẩm mới
PUT    /api/products/:id        # Cập nhật sản phẩm
DELETE /api/products/:id        # Xóa sản phẩm
GET    /api/orders              # Lấy danh sách đơn hàng
POST   /api/orders              # Tạo đơn hàng mới
GET    /api/orders/:id          # Chi tiết đơn hàng
GET    /api/orders/stats/summary # Thống kê
```

## 🚀 Auto Deploy Script

Chạy script tự động deploy cả frontend và backend:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔗 Liên kết nhanh

- [📖 Hướng dẫn deploy chi tiết](server/CLOUDFLARE_DEPLOY.md)
- [🌐 Cloudflare Dashboard](https://dash.cloudflare.com)
- [📚 Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [🗄️ D1 Database Docs](https://developers.cloudflare.com/d1/)

## ✅ Tính năng hoàn thành

- ✅ **Không cần đăng nhập** - ai có link là dùng được
- ✅ **Database thật** - Cloudflare D1 (SQLite)
- ✅ **API RESTful** - đầy đủ endpoints
- ✅ **Responsive** - hoạt động tốt trên mobile
- ✅ **Tiếng Việt** - giao diện hoàn toàn tiếng Việt
- ✅ **In hóa đơn** - hỗ trợ print qua browser
- ✅ **Tự động cập nhật tồn kho** - khi tạo đơn hàng
- ✅ **Edge Computing** - tốc độ nhanh toàn cầu

## 🔧 Tùy chỉnh

### Thêm Custom Domain
1. Vào Cloudflare Dashboard
2. Workers & Pages > your-worker > Triggers
3. Thêm Custom Domain

### Cấu hình CORS
Chỉnh sửa CORS trong `server/src/index.js`:
```javascript
origin: ['http://localhost:3000', 'https://yourdomain.com']
```

## 🆘 Hỗ trợ

**Gặp vấn đề?**
1. Kiểm tra `database_id` trong `wrangler.toml`
2. Đảm bảo đã chạy migrations: `wrangler d1 migrations apply pos-db`
3. Kiểm tra CORS settings nếu có lỗi API
4. Tạo issue với logs chi tiết

## 📸 Demo

### Trang bán hàng (POS)
- Grid sản phẩm với tìm kiếm barcode
- Giỏ hàng real-time
- Thanh toán và in hóa đơn

### Quản lý sản phẩm
- CRUD đầy đủ với validation
- Thống kê tồn kho real-time
- Search và filter nâng cao

### Báo cáo
- Dashboard với KPIs
- Top sản phẩm bán chạy
- Cảnh báo sắp hết hàng

---

⭐ **Ưu điểm Cloudflare:**
- 🚀 Tốc độ nhanh (Edge Computing)  
- 💰 100% miễn phí
- 🛡️ Bảo mật cao
- 🌍 Phủ sóng toàn cầu
- 🔧 Không cần quản lý server

**Perfect cho:** Cửa hàng nhỏ, startup, test ideas, sharing qua link! 