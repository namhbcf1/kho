# 🚀 Smart POS System 2025

**Hệ thống bán hàng thông minh với AI tích hợp**

[![Deploy Status](https://img.shields.io/badge/Deploy-Success-brightgreen)](https://0ba925c1.pos-system-production-2025.pages.dev)
[![Version](https://img.shields.io/badge/Version-2025.1-blue)](https://github.com/bangachieu2/kho2)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🌟 Tính năng chính

### 💼 Quản lý bán hàng
- **Điểm bán hàng (POS)** - Giao diện bán hàng hiện đại
- **Quản lý đơn hàng** - Theo dõi và xử lý đơn hàng
- **Quản lý khách hàng** - CRM tích hợp
- **Quản lý sản phẩm** - Catalog sản phẩm đầy đủ

### 📦 Quản lý kho
- **Quản lý tồn kho** - Theo dõi số lượng real-time
- **Quản lý serial** - Tracking serial number chi tiết
- **Quản lý nhà cung cấp** - Hệ thống supplier management
- **Báo cáo kho** - Analytics và insights

### 💰 Quản lý tài chính
- **Quản lý công nợ** - Debt management system
- **Báo cáo tài chính** - Financial reporting
- **Quản lý giao dịch** - Transaction tracking
- **Phân tích lợi nhuận** - Profit analysis

### 🛠️ Tính năng nâng cao
- **Quản lý bảo hành** - Warranty claim system
- **Quản lý người dùng** - User management với phân quyền
- **AI Logic Engine** - Hệ thống thông minh tự động
- **Smart Monitoring** - Giám sát hệ thống real-time

## 🎯 Demo trực tuyến

**🌐 Live Demo:** [https://0ba925c1.pos-system-production-2025.pages.dev](https://0ba925c1.pos-system-production-2025.pages.dev)

## 🏗️ Kiến trúc hệ thống

```
kho2/
├── client/                 # Frontend React App
│   ├── src/
│   │   ├── components/    # React Components
│   │   ├── pages/         # Page Components
│   │   ├── services/      # API Services
│   │   └── utils/         # Utility Functions
│   └── cypress/           # E2E Testing
├── server/                # Backend API
│   ├── routes/           # API Routes
│   ├── models/           # Database Models
│   ├── modules/          # Business Logic
│   └── migrations/       # Database Migrations
└── database/             # Database Schema
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+ 
- npm hoặc yarn
- PostgreSQL (cho production)

### Cài đặt

```bash
# Clone repository
git clone https://github.com/bangachieu2/kho2.git
cd kho2

# Cài đặt dependencies
npm install

# Cài đặt client dependencies
cd client
npm install

# Cài đặt server dependencies
cd ../server
npm install
```

### Chạy development

```bash
# Chạy client (Frontend)
cd client
npm start

# Chạy server (Backend)
cd server
npm run dev
```

### Chạy production

```bash
# Build client
cd client
npm run build

# Deploy với Cloudflare Pages
npx wrangler pages deploy build --project-name pos-system-production-2025
```

## 🧪 Testing

### Cypress E2E Testing

```bash
# Chạy Cypress tests
cd client
npx cypress open

# Chạy tests headless
npx cypress run
```

### Test Coverage
- ✅ POS System functionality
- ✅ Serial number management
- ✅ Customer management
- ✅ Product inventory
- ✅ Financial transactions
- ✅ Error handling
- ✅ Performance testing

## 🔧 Công nghệ sử dụng

### Frontend
- **React 18** - UI Framework
- **Ant Design** - Component Library
- **Axios** - HTTP Client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **PostgreSQL** - Database
- **Cloudflare Workers** - Serverless

### DevOps & Testing
- **Cypress** - E2E Testing
- **Cloudflare Pages** - Deployment
- **GitHub Actions** - CI/CD
- **ESLint** - Code Quality

## 📊 Tính năng đã sửa

### ✅ Các lỗi đã khắc phục
- **CSP Camera Error** - Hoàn toàn resolved
- **Serial API Error** - getByProduct function fixed
- **Duplicate Logo** - UI optimization
- **White Screen Issues** - Error boundary improved
- **Financial Form Errors** - Undefined handling fixed

### 🚀 Cải tiến hiệu suất
- **Smart Monitoring** - Real-time system monitoring
- **AI Logic Engine** - Intelligent automation
- **Error Tracking** - Comprehensive error handling
- **Performance Optimization** - Fast loading times

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 Changelog

### Version 2025.1 (Latest)
- ✅ Fixed all critical errors
- 🚀 Enhanced serial number management
- 💡 AI-powered features integration
- 🔧 Performance optimizations
- 📱 Mobile responsive improvements

## 📞 Hỗ trợ

- **Issues:** [GitHub Issues](https://github.com/bangachieu2/kho2/issues)
- **Discussions:** [GitHub Discussions](https://github.com/bangachieu2/kho2/discussions)
- **Email:** bangachieu2@gmail.com

## 📄 License

Dự án này được phân phối dưới giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

---

**🎉 Cảm ơn bạn đã sử dụng Smart POS System 2025!**

*Được phát triển với ❤️ bởi BangAChieu2* 