# 🏪 POS System - Advanced Point of Sale Solution

A comprehensive, modern Point of Sale (POS) system built with React.js frontend and Cloudflare Workers backend, featuring enterprise-level security, authentication, and business management capabilities.

## 🚀 Live Demo

- **Frontend**: https://0c8058ce.pos-system-production-2025.pages.dev
- **Backend API**: https://pos-backend.bangachieu2.workers.dev
- **Demo Credentials**: `admin` / `admin123`

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with role-based access control
- Secure password hashing with bcrypt
- Rate limiting and input validation
- Activity logging and audit trails
- CSP headers and security middleware
- Protected routes and session management

### 🛍️ Core POS Functionality
- **Point of Sale**: Complete checkout system with cart management
- **Product Management**: Inventory tracking with categories and suppliers
- **Order Management**: Order processing and history tracking
- **Customer Management**: Customer profiles and purchase history
- **Serial Number Tracking**: Advanced serial number management
- **Multi-payment Methods**: Cash, card, and digital payments

### 📊 Business Intelligence
- **Financial Reports**: Revenue, profit, and expense tracking
- **Inventory Reports**: Stock levels and movement analysis
- **Sales Analytics**: Performance metrics and trends
- **Customer Analytics**: Purchase patterns and loyalty tracking
- **Supplier Management**: Vendor relationships and procurement

### 🔧 Advanced Features
- **Debt Management**: Customer credit and payment tracking
- **Warranty System**: Product warranty and service management
- **User Management**: Multi-user system with role permissions
- **Responsive Design**: Mobile-first approach with PWA capabilities
- **Real-time Updates**: Live inventory and sales updates
- **Offline Support**: Works without internet connection

## 🛠️ Technology Stack

### Frontend
- **React.js 18** - Modern UI framework
- **Ant Design** - Professional UI components
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **Context API** - State management
- **PWA** - Progressive Web App capabilities

### Backend
- **Cloudflare Workers** - Serverless edge computing
- **Hono.js** - Lightweight web framework
- **D1 Database** - SQLite at the edge
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **Express.js** - Alternative Node.js server

### Infrastructure
- **Cloudflare Pages** - Frontend hosting
- **Cloudflare Workers** - Backend API
- **GitHub Actions** - CI/CD pipeline
- **SQLite** - Database storage

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │ Cloudflare      │    │   D1 Database   │
│   Frontend      │◄──►│   Workers       │◄──►│   (SQLite)      │
│                 │    │   Backend       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/namhbcf1/kho.git
   cd kho
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd client
   npm install
   
   # Backend
   cd ../server
   npm install
   ```

3. **Start development servers**
   ```bash
   # Frontend (runs on http://localhost:3000)
   cd client
   npm start
   
   # Backend (runs on http://localhost:3001)
   cd server
   npm start
   ```

### Production Deployment

1. **Deploy Backend to Cloudflare Workers**
   ```bash
   cd server
   npx wrangler deploy src/simple-complete.js
   ```

2. **Deploy Frontend to Cloudflare Pages**
   ```bash
   cd client
   npm run build
   npx wrangler pages deploy build --project-name=pos-system-production-2025
   ```

## 📁 Project Structure

```
kho/
├── client/                 # React.js frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── build/              # Production build
├── server/                 # Backend services
│   ├── src/                # Source code
│   │   ├── middleware/     # Authentication middleware
│   │   ├── routes/         # API routes
│   │   └── simple-complete.js # Main worker file
│   ├── routes/             # Express.js routes
│   └── migrations/         # Database migrations
└── README.md
```

## 🔐 Authentication System

### User Roles
- **Admin**: Full system access
- **Manager**: Store management capabilities
- **Cashier**: POS and basic operations

### Security Features
- JWT token-based authentication
- Password hashing with salt
- Rate limiting (5 attempts per 15 minutes)
- Session management
- Activity logging
- CORS protection

## 📊 Database Schema

### Core Tables
- `users` - User accounts and authentication
- `products` - Product catalog and inventory
- `orders` - Sales transactions
- `customers` - Customer management
- `suppliers` - Vendor information
- `activity_logs` - Audit trail

### Advanced Tables
- `order_items` - Order line items
- `serial_numbers` - Product serial tracking
- `inventory_movements` - Stock changes
- `payments` - Payment transactions
- `warranties` - Warranty tracking

## 🔧 Configuration

### Environment Variables
```env
# Backend
JWT_SECRET=your-secret-key
DB_NAME=pos-db
CORS_ORIGIN=https://your-domain.com

# Frontend
REACT_APP_API_URL=https://your-api.workers.dev
```

### CSP Headers
```
Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## 🧪 Testing

### Cypress E2E Tests
```bash
cd client
npm run test:e2e
```

### Test Coverage
- Authentication flows
- POS operations
- Navigation testing
- Responsive design
- Performance testing

## 📈 Performance

### Optimization Features
- Code splitting and lazy loading
- Service worker caching
- CDN delivery via Cloudflare
- Image optimization
- Bundle size optimization

### Metrics
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

## 🛡️ Security

### Security Measures
- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- Input validation
- XSS protection
- CSRF protection
- Secure headers

### Compliance
- GDPR compliant data handling
- PCI DSS considerations
- SOC 2 security practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Ant Design for the UI components
- Cloudflare for the infrastructure
- React.js community for the framework
- Open source contributors

## 📞 Support

For support, email admin@example.com or create an issue in the GitHub repository.

---

**Built with ❤️ by the POS System Team** 