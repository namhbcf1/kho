# 🏪 Modern POS System

A comprehensive Point of Sale (POS) system built with React and modern web technologies. This system provides a complete solution for retail businesses with inventory management, sales tracking, customer management, and detailed reporting.

## 🌟 Features

### Core Features
- **📊 Dashboard** - Real-time business analytics and KPIs
- **🛒 Point of Sale (POS)** - Intuitive sales interface with barcode scanning
- **📦 Product Management** - Complete inventory control with categories and stock tracking
- **📋 Order Management** - Track and manage all sales transactions
- **📈 Reports & Analytics** - Comprehensive business intelligence and reporting

### Modern UI/UX
- **🌓 Dark/Light Mode** - Automatic theme switching with system preference detection
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **⚡ Real-time Updates** - Live data updates using React Query
- **🎨 Modern Design** - Built with shadcn/ui components and Tailwind CSS
- **🔔 Toast Notifications** - User-friendly feedback system

### Technical Features
- **🔍 Barcode Scanning** - Integrated barcode scanner for products
- **🖨️ Receipt Printing** - Professional receipt generation
- **📤 Data Export** - Export to Excel/PDF formats
- **📊 Interactive Charts** - Beautiful data visualization with Recharts
- **🎯 TypeScript Support** - Type-safe development
- **⚡ Performance Optimized** - Code splitting and lazy loading

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible UI components
- **React Query** - Server state management and caching
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Interactive charts and data visualization
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation
- **Sonner** - Beautiful toast notifications

### Build Tools
- **Vite** - Fast build tool and development server
- **CRACO** - Create React App Configuration Override
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting

### Deployment
- **Cloudflare Pages** - Global CDN and hosting
- **GitHub Actions** - Automated CI/CD pipeline

## 📁 Project Structure

```
kho2/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # shadcn/ui base components
│   │   │   ├── BarcodeScanner.jsx
│   │   │   ├── ReceiptPrinter.jsx
│   │   │   └── ImportExport.jsx
│   │   ├── pages/             # Main application pages
│   │   │   ├── Dashboard.jsx  # Business analytics dashboard
│   │   │   ├── POS.jsx        # Point of sale interface
│   │   │   ├── Products.jsx   # Product management
│   │   │   ├── Orders.jsx     # Order management
│   │   │   └── ReportsPage.jsx # Reports and analytics
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── use-theme.js   # Theme management
│   │   │   └── use-media-query.js
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── services/          # API and external services
│   │   │   └── api.js
│   │   ├── utils/             # Utility functions
│   │   │   └── export.js      # Data export utilities
│   │   └── lib/               # Library configurations
│   │       └── utils.js       # Tailwind utilities
│   ├── public/                # Static assets
│   └── build/                 # Production build output
├── server/                    # Backend API (Node.js/Express)
└── database/                  # Database schemas and migrations
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/namhbcf1/kho.git
   cd kho2
   ```

2. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🌐 Live Demo

The application is deployed and accessible at:
**[https://kho-pos-system.pages.dev](https://kho-pos-system.pages.dev)**

### Demo Features
- Fully functional POS interface
- Sample product catalog
- Interactive dashboard with charts
- Responsive design demonstration
- Dark/light mode switching

## 📖 Usage Guide

### Getting Started
1. **Dashboard** - View business overview and key metrics
2. **POS** - Process sales transactions with barcode scanning
3. **Products** - Manage inventory, add/edit products, track stock
4. **Orders** - View transaction history and order details
5. **Reports** - Analyze business performance with detailed reports

### Key Workflows

#### Making a Sale (POS)
1. Navigate to POS page
2. Search or scan products to add to cart
3. Adjust quantities as needed
4. Enter customer information
5. Select payment method
6. Complete transaction and print receipt

#### Managing Products
1. Go to Products page
2. Add new products with details (name, SKU, price, stock)
3. Organize by categories
4. Set stock alerts for low inventory
5. Generate barcodes for products

#### Viewing Reports
1. Access Reports page
2. Select date range and filters
3. View interactive charts and metrics
4. Export data to Excel/PDF
5. Analyze trends and performance

## 🔧 Configuration

### Theme Customization
The application supports custom theming through CSS variables in `src/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... other theme variables */
}
```

### API Configuration
Update API endpoints in `src/services/api.js`:

```javascript
const API_BASE_URL = 'https://your-api-endpoint.com';
```

## 🚀 Deployment

### Cloudflare Pages (Recommended)
1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `cd client && npm run build`
3. Set build output directory: `client/build`
4. Deploy automatically on git push

### Manual Deployment
1. Build the project: `npm run build`
2. Upload the `client/build` folder to your hosting provider
3. Configure your server to serve the `index.html` for all routes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and commit: `git commit -m "Add new feature"`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the demo at [https://kho-pos-system.pages.dev](https://kho-pos-system.pages.dev)

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced inventory features
- [ ] Multi-store support
- [ ] Advanced reporting dashboard
- [ ] Integration with payment gateways
- [ ] Offline mode support

---

**Built with ❤️ using modern web technologies** 