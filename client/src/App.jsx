// =====================================================
// 🚀 MAIN APP & ROUTES CONFIGURATION
// =====================================================

// App.jsx - Root component
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import { AdminLayout, CashierLayout, StaffLayout } from './components/common/Layout';
import { ROLES, PERMISSIONS } from './auth/permissions';

// Import pages
import LoginPage from './pages/auth/LoginPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';

// Admin pages
import AnalyticsDashboard from './pages/admin/Dashboard/AnalyticsDashboard';
import ProductManagement from './pages/admin/Products/ProductManagement';
import PriceOptimization from './pages/admin/Products/PriceOptimization';
import InventoryDashboard from './pages/admin/Inventory/InventoryDashboard';
import DemandForecasting from './pages/admin/Inventory/DemandForecasting';
import OrderManagement from './pages/admin/Orders/OrderManagement';
import StaffManagement from './pages/admin/Staff/StaffManagement';
import GamificationConfig from './pages/admin/Staff/GamificationConfig';
import CustomerManagement from './pages/admin/Customers/CustomerManagement';
import EcommerceChannels from './pages/admin/Integrations/EcommerceChannels';
import SystemSettings from './pages/admin/Settings/SystemSettings';

// Cashier pages
import POSTerminal from './pages/cashier/POS/POSTerminal';
import OrderHistory from './pages/cashier/Orders/OrderHistory';
import ShiftStart from './pages/cashier/Session/ShiftStart';

// Staff pages
import PersonalDashboard from './pages/staff/Dashboard/PersonalDashboard';
import Leaderboard from './pages/staff/Gamification/Leaderboard';
import ChallengeHub from './pages/staff/Gamification/ChallengeHub';
import RewardStore from './pages/staff/Gamification/RewardStore';

import './styles/globals.css';

const App = () => {
  return (
    <ConfigProvider locale={viVN}>
      <AuthProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Admin routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN}>
                    <AdminLayout>
                      <Routes>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AnalyticsDashboard />} />
                        
                        {/* Products */}
                        <Route path="products/list" element={<ProductManagement />} />
                        <Route path="products/price-optimization" element={<PriceOptimization />} />
                        
                        {/* Inventory */}
                        <Route path="inventory/dashboard" element={<InventoryDashboard />} />
                        <Route path="inventory/forecasting" element={<DemandForecasting />} />
                        
                        {/* Orders */}
                        <Route path="orders" element={<OrderManagement />} />
                        
                        {/* Staff */}
                        <Route path="staff/management" element={<StaffManagement />} />
                        <Route path="staff/gamification" element={<GamificationConfig />} />
                        
                        {/* Customers */}
                        <Route path="customers" element={<CustomerManagement />} />
                        
                        {/* Integrations */}
                        <Route path="integrations/ecommerce" element={<EcommerceChannels />} />
                        
                        {/* Settings */}
                        <Route path="settings" element={<SystemSettings />} />
                      </Routes>
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Cashier routes */}
              <Route
                path="/cashier/*"
                element={
                  <ProtectedRoute requiredRole={ROLES.CASHIER}>
                    <CashierLayout>
                      <Routes>
                        <Route index element={<Navigate to="pos" replace />} />
                        <Route path="pos" element={<POSTerminal />} />
                        <Route path="orders" element={<OrderHistory />} />
                        <Route path="session/start" element={<ShiftStart />} />
                      </Routes>
                    </CashierLayout>
                  </ProtectedRoute>
                }
              />

              {/* Staff routes */}
              <Route
                path="/staff/*"
                element={
                  <ProtectedRoute requiredRole={ROLES.STAFF}>
                    <StaffLayout>
                      <Routes>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<PersonalDashboard />} />
                        <Route path="gamification/leaderboard" element={<Leaderboard />} />
                        <Route path="gamification/challenges" element={<ChallengeHub />} />
                        <Route path="gamification/rewards" element={<RewardStore />} />
                      </Routes>
                    </StaffLayout>
                  </ProtectedRoute>
                }
              />

              {/* Default redirects */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <RoleBasedRedirect />
                  </ProtectedRoute>
                }
              />
              
              {/* 404 */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

// Component để redirect theo role
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case ROLES.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case ROLES.CASHIER:
      return <Navigate to="/cashier/pos" replace />;
    case ROLES.STAFF:
      return <Navigate to="/staff/dashboard" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

export default App;

// pages/auth/LoginPage.jsx - Trang đăng nhập
import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      const result = await login(values);
      
      if (result.success) {
        message.success('Đăng nhập thành công!');
        // Navigation sẽ được xử lý tự động bởi RoleBasedRedirect
      } else {
        message.error(result.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi đăng nhập');
    }
    
    setLoading(false);
  };

  // Demo accounts
  const demoAccounts = [
    { username: 'admin', password: 'admin123', role: 'admin', name: 'Quản trị viên' },
    { username: 'cashier', password: 'cashier123', role: 'cashier', name: 'Thu ngân' },
    { username: 'staff', password: 'staff123', role: 'staff', name: 'Nhân viên bán hàng' }
  ];

  const fillDemoAccount = (account) => {
    form.setFieldsValue({
      username: account.username,
      password: account.password
    });
  };

  const [form] = Form.useForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <Row gutter={[32, 32]} align="middle">
          {/* Left side - Branding */}
          <Col xs={24} lg={12}>
            <div className="text-center text-white space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold">🚀 Smart POS</h1>
                <h2 className="text-2xl font-light">Hệ thống Bán hàng Thông minh</h2>
                <p className="text-xl text-blue-100">
                  Thế hệ mới với AI, Game hóa & Unified Commerce
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-3xl mb-2">🤖</div>
                  <div className="font-semibold">AI Dự báo</div>
                  <div className="text-sm text-blue-100">Prophet & ARIMA</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-3xl mb-2">🎮</div>
                  <div className="font-semibold">Game hóa</div>
                  <div className="text-sm text-blue-100">Leaderboard & Rewards</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="text-3xl mb-2">🌐</div>
                  <div className="font-semibold">Omnichannel</div>
                  <div className="text-sm text-blue-100">Shopee, Lazada, Tiki</div>
                </div>
              </div>
            </div>
          </Col>

          {/* Right side - Login form */}
          <Col xs={24} lg={12}>
            <Card className="shadow-2xl border-0" style={{ borderRadius: '16px' }}>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800">Đăng nhập</h3>
                <p className="text-gray-600">Chào mừng bạn quay trở lại!</p>
              </div>

              <Form
                form={form}
                name="login"
                onFinish={onFinish}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="username"
                  label="Tên đăng nhập"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên đăng nhập!' }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="Nhập tên đăng nhập"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Nhập mật khẩu"
                  />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    className="w-full" 
                    loading={loading}
                    icon={<LoginOutlined />}
                  >
                    Đăng nhập
                  </Button>
                </Form.Item>
              </Form>

              {/* Demo accounts */}
              <div className="mt-6">
                <div className="text-center text-gray-500 mb-4">
                  <span className="bg-white px-3">Tài khoản demo</span>
                </div>
                
                <div className="space-y-2">
                  {demoAccounts.map((account, index) => (
                    <Button
                      key={index}
                      block
                      size="small"
                      type="default"
                      onClick={() => fillDemoAccount(account)}
                      className="text-left"
                    >
                      <div className="flex justify-between items-center">
                        <span>
                          <strong>{account.name}</strong> - {account.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {account.role}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                <p>🔒 Hệ thống bảo mật PCI DSS</p>
                <p>📱 Hỗ trợ PWA & Offline Mode</p>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default LoginPage;

// pages/auth/UnauthorizedPage.jsx - Trang không có quyền
import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleBackHome = () => {
    if (user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'cashier':
          navigate('/cashier/pos');
          break;
        case 'staff':
          navigate('/staff/dashboard');
          break;
        default:
          navigate('/login');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Result
        status="403"
        title="403"
        subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
        extra={
          <div className="space-x-4">
            <Button type="primary" onClick={handleBackHome}>
              Về trang chủ
            </Button>
            <Button onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        }
      />
    </div>
  );
};

export default UnauthorizedPage;

// index.js - Entry point
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Import useAuth for RoleBasedRedirect
import { useAuth } from './auth/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// styles/globals.css - Global styles
@import '~antd/dist/reset.css';

/* Custom variables */
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #ff4d4f;
  --text-color: #000000d9;
  --text-color-secondary: #00000073;
  --border-color: #d9d9d9;
  --background-color: #ffffff;
}

/* Global styles */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 
               'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5715;
  color: var(--text-color);
  background-color: #f0f2f5;
}

#root {
  height: 100%;
}

.app {
  height: 100%;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Layout specific styles */
.admin-sidebar .ant-menu-item-selected {
  background-color: #1890ff !important;
}

.cashier-layout .ant-layout-header {
  position: fixed;
  z-index: 1000;
  width: 100%;
  top: 0;
}

.cashier-layout .ant-layout-content {
  margin-top: 64px;
}

.staff-layout .ant-layout-sider {
  position: fixed;
  left: 0;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.staff-layout .ant-layout-content {
  margin-left: 250px;
}

/* Component specific styles */
.pos-terminal .product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.inventory-table .ant-table-row:hover {
  background-color: #f5f5f5;
}

.challenge-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.reward-card .ant-card-cover {
  overflow: hidden;
}

.reward-card:hover .ant-card-cover img {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

/* Utility classes */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animation classes */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in-right {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive utilities */
@media (max-width: 768px) {
  .staff-layout .ant-layout-sider {
    position: relative;
    margin-left: 0;
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    flex: none !important;
  }
  
  .staff-layout .ant-layout-content {
    margin-left: 0;
  }
  
  .pos-terminal .ant-col {
    margin-bottom: 16px;
  }
}

/* Dark mode support (future enhancement) */
@media (prefers-color-scheme: dark) {
  /* Will be implemented in future versions */
}

/* Print styles */
@media print {
  .ant-layout-sider,
  .ant-layout-header,
  .ant-btn,
  .ant-pagination {
    display: none !important;
  }
  
  .ant-layout-content {
    margin: 0 !important;
    padding: 0 !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .ant-btn-primary {
    border: 2px solid #000;
  }
  
  .ant-card {
    border: 1px solid #000;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// services/api/index.js - API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8787/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('pos_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem('pos_token');
          localStorage.removeItem('pos_user');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Products endpoints
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products?${queryString}`);
  }

  async createProduct(product) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id, product) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders endpoints
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders?${queryString}`);
  }

  async createOrder(order) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async getOrderById(id) {
    return this.request(`/orders/${id}`);
  }

  // Inventory endpoints
  async getInventory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/inventory?${queryString}`);
  }

  async updateInventory(updates) {
    return this.request('/inventory/update', {
      method: 'POST',
      body: JSON.stringify(updates),
    });
  }

  // Customers endpoints
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/customers?${queryString}`);
  }

  async createCustomer(customer) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  // Staff endpoints
  async getStaff(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/staff?${queryString}`);
  }

  async getStaffPerformance(staffId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/staff/${staffId}/performance?${queryString}`);
  }

  // Analytics endpoints
  async getAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics?${queryString}`);
  }

  async getDashboardData(role, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/analytics/dashboard/${role}?${queryString}`);
  }

  // Gamification endpoints
  async getLeaderboard(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/gamification/leaderboard?${queryString}`);
  }

  async getChallenges(staffId = null) {
    const endpoint = staffId ? `/gamification/challenges/${staffId}` : '/gamification/challenges';
    return this.request(endpoint);
  }

  async joinChallenge(challengeId, staffId) {
    return this.request(`/gamification/challenges/${challengeId}/join`, {
      method: 'POST',
      body: JSON.stringify({ staffId }),
    });
  }

  async getRewards(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/gamification/rewards?${queryString}`);
  }

  async redeemReward(rewardId, staffId) {
    return this.request('/gamification/rewards/redeem', {
      method: 'POST',
      body: JSON.stringify({ rewardId, staffId }),
    });
  }

  // Integration endpoints
  async getIntegrations() {
    return this.request('/integrations');
  }

  async updateIntegration(integrationId, config) {
    return this.request(`/integrations/${integrationId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async syncChannel(channelId) {
    return this.request(`/integrations/${channelId}/sync`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
export default apiService;

// utils/constants/index.js - App constants
export const APP_CONFIG = {
  name: 'Smart POS',
  version: '1.0.0',
  description: 'Hệ thống Bán hàng Thông minh với AI & Game hóa',
  company: 'Smart Retail Solutions',
  supportEmail: 'support@smartpos.vn',
  supportPhone: '1900-xxx-xxx'
};

export const ROUTES = {
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products/list',
  ADMIN_INVENTORY: '/admin/inventory/dashboard',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_STAFF: '/admin/staff/management',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_INTEGRATIONS: '/admin/integrations/ecommerce',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Cashier routes
  CASHIER_POS: '/cashier/pos',
  CASHIER_ORDERS: '/cashier/orders',
  CASHIER_SESSION: '/cashier/session/start',
  
  // Staff routes
  STAFF_DASHBOARD: '/staff/dashboard',
  STAFF_LEADERBOARD: '/staff/gamification/leaderboard',
  STAFF_CHALLENGES: '/staff/gamification/challenges',
  STAFF_REWARDS: '/staff/gamification/rewards'
};

export const CURRENCY = {
  CODE: 'VND',
  SYMBOL: '₫',
  LOCALE: 'vi-VN'
};

export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD/MM/YYYY HH:mm:ss',
  TIME: 'HH:mm:ss'
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100']
};

export const SYNC_INTERVALS = {
  REALTIME: 'realtime',
  FIVE_MIN: '5min',
  FIFTEEN_MIN: '15min',
  THIRTY_MIN: '30min',
  ONE_HOUR: '1hour'
};

export const ECOMMERCE_PLATFORMS = {
  SHOPEE: 'shopee',
  LAZADA: 'lazada',
  TIKI: 'tiki',
  TIKTOK_SHOP: 'tiktok_shop'
};

export default {
  APP_CONFIG,
  ROUTES,
  CURRENCY,
  DATE_FORMATS,
  PAGINATION,
  SYNC_INTERVALS,
  ECOMMERCE_PLATFORMS
};