# 🏪 Hệ thống POS - Quản lý Bán hàng và Kho

Hệ thống POS (Point of Sale) hoàn chỉnh được xây dựng với React.js frontend và Cloudflare Workers backend, tích hợp AI cho quản lý bảo hành thông minh.

## 🚀 Demo

- **Frontend**: https://b44f1239.pos-frontend-e1q.pages.dev
- **Backend API**: https://pos-backend.bangachieu2.workers.dev

## ✨ Tính năng chính

### 📊 Quản lý Bán hàng
- **POS Interface**: Giao diện bán hàng trực quan
- **Quản lý Đơn hàng**: Tạo, sửa, xóa đơn hàng
- **In hóa đơn**: Tự động tạo và in hóa đơn
- **Quét mã QR**: Tích hợp quét mã QR sản phẩm

### 🏪 Quản lý Kho
- **Quản lý Sản phẩm**: CRUD sản phẩm với thông tin chi tiết
- **Quản lý Tồn kho**: Theo dõi số lượng tồn kho real-time
- **Quản lý Nhà cung cấp**: Quản lý thông tin nhà cung cấp
- **Serial Number Management**: Quản lý số seri sản phẩm

### 🔍 Tìm kiếm Serial thông minh
- **Serial Search Sidebar**: Thanh tìm kiếm serial chuyên dụng
- **Real-time Search**: Tìm kiếm real-time với suggestions
- **Card-based Results**: Hiển thị kết quả dạng card với đầy đủ thông tin

### 🛠️ Quản lý Bảo hành AI
- **AI Auto-fill**: Tự động điền thông tin bảo hành khi nhập serial
- **Smart Suggestions**: Gợi ý thông minh khi tìm kiếm
- **Warranty Claims**: Quản lý yêu cầu bảo hành
- **Customer Integration**: Tích hợp thông tin khách hàng

### 👥 Quản lý Khách hàng
- **Customer Database**: Cơ sở dữ liệu khách hàng
- **Purchase History**: Lịch sử mua hàng
- **Debt Management**: Quản lý công nợ
- **Customer Quick Add**: Thêm khách hàng nhanh

### 💰 Quản lý Tài chính
- **Financial Transactions**: Quản lý giao dịch tài chính
- **Debt Tracking**: Theo dõi công nợ
- **Revenue Reports**: Báo cáo doanh thu
- **Payment Methods**: Đa dạng phương thức thanh toán

### 📈 Báo cáo và Thống kê
- **Sales Reports**: Báo cáo bán hàng
- **Inventory Reports**: Báo cáo tồn kho
- **Financial Reports**: Báo cáo tài chính
- **Real-time Analytics**: Thống kê real-time

## 🛠️ Công nghệ sử dụng

### Frontend
- **React.js 18**: Framework chính
- **Ant Design**: UI Component Library
- **React Router**: Routing
- **Axios**: HTTP Client
- **Moment.js**: Date handling
- **Recharts**: Data visualization
- **Tailwind CSS**: Styling

### Backend
- **Cloudflare Workers**: Serverless platform
- **Cloudflare D1**: SQLite database
- **Node.js**: Runtime environment
- **Express.js**: Web framework

### Deployment
- **Cloudflare Pages**: Frontend hosting
- **Cloudflare Workers**: Backend hosting
- **Cloudflare D1**: Database hosting

## 📦 Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js 18+
- npm hoặc yarn
- Wrangler CLI

### 1. Clone repository
```bash
git clone https://github.com/bangachieu2/kho2.git
cd kho2
```

### 2. Cài đặt dependencies
```bash
# Root dependencies
npm install

# Frontend dependencies
cd client
npm install
cd ..

# Backend dependencies
cd server
npm install
cd ..
```

### 3. Chạy development

#### Frontend
```bash
cd client
npm start
```

#### Backend
```bash
cd server
wrangler dev
```

### 4. Build và Deploy

#### Frontend
```bash
cd client
npm run deploy
```

#### Backend
```bash
cd server
wrangler deploy
```

## 🗄️ Cấu trúc Database

### Bảng chính
- **products**: Sản phẩm
- **customers**: Khách hàng
- **orders**: Đơn hàng
- **order_items**: Chi tiết đơn hàng
- **serials**: Số seri sản phẩm
- **warranty_claims**: Yêu cầu bảo hành
- **financial_transactions**: Giao dịch tài chính
- **suppliers**: Nhà cung cấp
- **users**: Người dùng

## 🔧 Cấu hình

### Environment Variables
```env
# Frontend (.env)
REACT_APP_API_URL=https://pos-backend.bangachieu2.workers.dev

# Backend (Cloudflare Workers)
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=admin123
```

### Wrangler Configuration
```toml
# server/wrangler.toml
name = "pos-backend"
main = "src/index.js"
compatibility_date = "2023-12-01"

[[d1_databases]]
binding = "DB"
database_name = "pos-db"
database_id = "your-database-id"
```

## 🚀 Deployment URLs

- **Frontend**: https://b44f1239.pos-frontend-e1q.pages.dev
- **Backend**: https://pos-backend.bangachieu2.workers.dev

## 📱 Tính năng Mobile

- Responsive design
- Touch-friendly interface
- QR code scanning
- Offline capability (PWA ready)

## 🔒 Bảo mật

- JWT Authentication
- Role-based access control
- Input validation
- SQL injection protection
- XSS protection

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- **Developer**: bangachieu2
- **Email**: your-email@example.com
- **Project Link**: https://github.com/bangachieu2/kho2

## 🙏 Acknowledgments

- [Ant Design](https://ant.design/) - UI Components
- [Cloudflare](https://cloudflare.com/) - Hosting & Infrastructure
- [React.js](https://reactjs.org/) - Frontend Framework
- [Node.js](https://nodejs.org/) - Runtime Environment 