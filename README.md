# 🏪 POS Computer Store System - Hệ thống Quản lý Cửa hàng Máy tính

## 🌟 Tổng quan

Hệ thống POS (Point of Sale) hoàn chỉnh cho cửa hàng máy tính, được xây dựng với React, Node.js và Cloudflare D1. Hệ thống cung cấp đầy đủ các tính năng quản lý bán hàng, kho hàng, khách hàng và báo cáo.

## 🚀 Demo Live

- **Frontend**: https://fb61cf29.computer-store-frontend.pages.dev
- **Backend API**: https://pos-computer-store-backend.bangachieu2.workers.dev
- **API Health**: https://pos-computer-store-backend.bangachieu2.workers.dev/api/health

## ✨ Tính năng chính

### 🎯 Quản lý Bán hàng (POS)
- ✅ Giao diện bán hàng trực quan
- ✅ Tìm kiếm sản phẩm theo tên/SKU/barcode
- ✅ Quản lý giỏ hàng thời gian thực
- ✅ Xử lý thanh toán đa phương thức
- ✅ In hóa đơn tự động
- ✅ Quản lý khách hàng trong giao dịch

### 📦 Quản lý Sản phẩm
- ✅ CRUD sản phẩm đầy đủ
- ✅ Quản lý danh mục và thương hiệu
- ✅ Theo dõi tồn kho thời gian thực
- ✅ Quản lý giá bán và giá khuyến mãi
- ✅ Upload và quản lý hình ảnh
- ✅ Thông số kỹ thuật chi tiết

### 🔢 Quản lý Serial Numbers
- ✅ Theo dõi serial number từng sản phẩm
- ✅ Trạng thái serial (trong kho, đã bán, bảo hành)
- ✅ Import/Export serial numbers
- ✅ Lịch sử di chuyển serial
- ✅ Quản lý vị trí kho

### 👥 Quản lý Khách hàng
- ✅ Thông tin khách hàng chi tiết
- ✅ Lịch sử mua hàng
- ✅ Tích điểm và ưu đãi
- ✅ Tìm kiếm và phân loại
- ✅ Xuất báo cáo khách hàng

### 📋 Quản lý Đơn hàng
- ✅ Theo dõi trạng thái đơn hàng
- ✅ Lịch sử giao dịch
- ✅ In hóa đơn và phiếu giao hàng
- ✅ Quản lý thanh toán
- ✅ Báo cáo doanh thu

### 🛠️ Quản lý Bảo hành
- ✅ Tạo và theo dõi phiếu bảo hành
- ✅ Quản lý quy trình sửa chữa
- ✅ Lịch sử bảo hành sản phẩm
- ✅ Thông báo hết hạn bảo hành
- ✅ Báo cáo chi phí bảo hành

### 🏢 Quản lý Nhà cung cấp
- ✅ Thông tin nhà cung cấp
- ✅ Điều khoản thanh toán
- ✅ Lịch sử nhập hàng
- ✅ Đánh giá nhà cung cấp

### 👤 Quản lý Người dùng
- ✅ Phân quyền người dùng (Admin, Manager, Staff)
- ✅ Đặt lại mật khẩu
- ✅ Quản lý trạng thái tài khoản
- ✅ Lịch sử hoạt động

### 📊 Báo cáo và Thống kê
- ✅ Dashboard tổng quan
- ✅ Báo cáo doanh thu theo thời gian
- ✅ Thống kê sản phẩm bán chạy
- ✅ Báo cáo tồn kho
- ✅ Phân tích khách hàng

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** - UI Framework
- **Ant Design** - Component Library
- **React Router v6** - Routing
- **Fetch API** - HTTP Client

### Backend
- **Hono.js** - Web Framework
- **Cloudflare Workers** - Serverless Runtime
- **Cloudflare D1** - SQLite Database
- **JWT** - Authentication

### Deployment
- **Cloudflare Pages** - Frontend Hosting
- **Cloudflare Workers** - Backend Hosting
- **GitHub** - Version Control

## 📁 Cấu trúc Project

```
kho2/
├── client/                 # Frontend React App
│   ├── src/
│   │   ├── components/     # Reusable Components
│   │   ├── pages/         # Page Components
│   │   ├── services/      # API Services
│   │   ├── contexts/      # React Contexts
│   │   └── utils/         # Utilities
│   ├── public/           # Static Assets
│   └── build/            # Production Build
├── server/               # Backend API
│   ├── src/              # Source Code
│   ├── migrations/       # Database Migrations
│   ├── models/          # Data Models
│   └── routes/          # API Routes
└── database/            # Database Schema
```

## 🚀 Cài đặt và Chạy

### Prerequisites
- Node.js 18+
- npm hoặc yarn
- Cloudflare account (cho deployment)

### 1. Clone Repository
```bash
git clone https://github.com/your-username/pos-computer-store.git
cd pos-computer-store
```

### 2. Cài đặt Dependencies

#### Frontend
```bash
cd client
npm install
```

#### Backend
```bash
cd server
npm install
```

### 3. Cấu hình Environment

#### Client (.env)
```env
REACT_APP_API_URL=http://localhost:8787/api
```

#### Server (wrangler.toml)
```toml
name = "pos-computer-store-backend"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "pos-computer-store"
database_id = "your-database-id"
```

### 4. Chạy Development

#### Backend
```bash
cd server
npm run dev
```

#### Frontend
```bash
cd client
npm start
```

## 🗄️ Database Schema

### Core Tables
- `products` - Sản phẩm
- `categories` - Danh mục
- `brands` - Thương hiệu
- `customers` - Khách hàng
- `orders` - Đơn hàng
- `order_items` - Chi tiết đơn hàng
- `serial_numbers` - Serial numbers
- `suppliers` - Nhà cung cấp
- `users` - Người dùng
- `warranty_claims` - Phiếu bảo hành

### Advanced Tables
- `inventory_locations` - Vị trí kho
- `stock_movements` - Biến động kho
- `stock_alerts` - Cảnh báo tồn kho
- `financial_transactions` - Giao dịch tài chính

## 🔐 Authentication

Hệ thống sử dụng JWT authentication với các role:
- **Admin**: Toàn quyền
- **Manager**: Quản lý cửa hàng
- **Staff**: Nhân viên bán hàng

### Demo Accounts
- Admin: `admin@computerstore.com` / `admin123`
- Manager: `manager@computerstore.com` / `manager123`
- Staff: `staff@computerstore.com` / `staff123`

## 📡 API Endpoints

### Products
- `GET /api/products` - Danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

### Orders
- `GET /api/orders` - Danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái

### Customers
- `GET /api/customers` - Danh sách khách hàng
- `POST /api/customers` - Tạo khách hàng
- `PUT /api/customers/:id` - Cập nhật khách hàng

### Serial Numbers
- `GET /api/serial-numbers` - Danh sách serial
- `POST /api/serial-numbers` - Tạo serial
- `PUT /api/serial-numbers/:id` - Cập nhật serial

### Users
- `GET /api/users` - Danh sách người dùng
- `POST /api/users` - Tạo người dùng
- `POST /api/users/:id/reset-password` - Đặt lại mật khẩu

## 🚀 Deployment

### Frontend (Cloudflare Pages)
```bash
cd client
npm run build
npx wrangler pages deploy build
```

### Backend (Cloudflare Workers)
```bash
cd server
npm run deploy
```

### Database Migration
```bash
npx wrangler d1 execute pos-computer-store --remote --file=migrations/xxx.sql
```

## 🧪 Testing

### API Testing
```bash
# Test all endpoints
node test-api-endpoints.js
```

### Frontend Testing
```bash
cd client
npm test
```

## 📈 Performance

- **Frontend**: ~450KB gzipped
- **Backend**: Sub-100ms response time
- **Database**: SQLite with D1 optimization
- **CDN**: Global edge deployment

## 🔧 Troubleshooting

### Common Issues

1. **API 500 Errors**
   - Check database schema
   - Verify environment variables
   - Check server logs

2. **Frontend Build Errors**
   - Clear node_modules and reinstall
   - Check React version compatibility

3. **Database Connection**
   - Verify D1 database ID
   - Check wrangler.toml configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Ant Design team for the excellent UI components
- Cloudflare for the amazing edge platform
- React team for the robust framework

## 📞 Support

For support, email support@computerstore.com or create an issue on GitHub.

---

**Made with ❤️ by Computer Store Team** 