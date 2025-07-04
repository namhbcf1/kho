# POS Backend API

Backend cho hệ thống POS đơn giản sử dụng Node.js + Express + MySQL.

## 📋 Yêu cầu hệ thống

- Node.js 16+ 
- MySQL 5.7+ hoặc MariaDB
- npm hoặc yarn

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Tạo file .env

Tạo file `.env` trong thư mục server với nội dung:

```bash
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pos_db
DB_USER=root
DB_PASSWORD=your_mysql_password
```

### 3. Tạo database

Chạy script SQL trong file `../database/schema.sql`:

```bash
mysql -u root -p < ../database/schema.sql
```

Hoặc import file SQL vào MySQL Workbench/phpMyAdmin.

### 4. Chạy server

```bash
# Development
npm run dev

# Production
npm start
```

Server sẽ chạy tại: http://localhost:3001

## 📚 API Endpoints

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy thông tin sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/orders/stats/summary` - Thống kê tổng quan

### Health Check
- `GET /api/health` - Kiểm tra trạng thái server

## 🔧 Cấu trúc thư mục

```
server/
├── app.js              # Entry point
├── config/
│   └── database.js     # Cấu hình database
├── models/
│   ├── Product.js      # Model sản phẩm
│   ├── Order.js        # Model đơn hàng
│   ├── OrderItem.js    # Model chi tiết đơn hàng
│   └── index.js        # Relationships
├── routes/
│   ├── products.js     # API routes sản phẩm
│   └── orders.js       # API routes đơn hàng
└── package.json
```

## 🧪 Test API

```bash
# Test health check
curl http://localhost:3001/api/health

# Test get products
curl http://localhost:3001/api/products

# Test create product
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":10000,"quantity":50}'
``` 