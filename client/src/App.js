import React, { useState, useEffect, memo, useMemo, lazy, Suspense, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, Spin, Typography, Space, Tooltip } from 'antd';
import smartMonitoring from './utils/smartMonitoring';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthWrapper from './components/AuthWrapper';
import {
  ShoppingCartOutlined,
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SearchOutlined,
  HomeOutlined,
  InboxOutlined,
  DollarOutlined,
  FileTextOutlined,
  ToolOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  StarOutlined,
  FireOutlined
} from '@ant-design/icons';

// Lazy load pages for better performance with preload hints
const POSPage = lazy(() => import(/* webpackChunkName: "pos" */ './pages/POSPage'));
const CustomersPage = lazy(() => import(/* webpackChunkName: "customers" */ './pages/CustomersPage'));
const ProductsPage = lazy(() => import(/* webpackChunkName: "products" */ './pages/ProductsPage'));
const OrdersPage = lazy(() => import(/* webpackChunkName: "orders" */ './pages/OrdersPage'));
const InventoryPage = lazy(() => import(/* webpackChunkName: "inventory" */ './pages/InventoryPage'));
const SuppliersPage = lazy(() => import(/* webpackChunkName: "suppliers" */ './pages/SuppliersPage'));
const FinancialPage = lazy(() => import(/* webpackChunkName: "financial" */ './pages/FinancialPage'));
const DebtPage = lazy(() => import(/* webpackChunkName: "debt" */ './pages/DebtPage'));
const ReportsPage = lazy(() => import(/* webpackChunkName: "reports" */ './pages/ReportsPage'));
const UsersPage = lazy(() => import(/* webpackChunkName: "users" */ './pages/UsersPage'));
const WarrantyPage = lazy(() => import(/* webpackChunkName: "warranty" */ './pages/WarrantyPage'));

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// Smart Navigation Component with memo for performance
const SmartNavigation = memo(({ collapsed, onToggle, currentPath }) => {
  const [activeKey, setActiveKey] = useState('pos');

  // Memoize menu items to prevent unnecessary re-renders - FLAT MENU (NO DROPDOWNS)
  const menuItems = useMemo(() => [
    {
      key: 'pos',
      icon: <ShoppingCartOutlined style={{ fontSize: '16px' }} />,
      label: 'Điểm Bán Hàng',
      path: '/pos',
      badge: 'HOT',
      color: '#ff4d4f'
    },
    {
      key: 'orders',
      icon: <FileTextOutlined style={{ fontSize: '16px' }} />,
      label: 'Đơn Hàng',
      path: '/orders'
    },
    {
      key: 'customers',
      icon: <TeamOutlined style={{ fontSize: '16px' }} />,
      label: 'Khách Hàng',
      path: '/customers'
    },
    {
      key: 'products',
      icon: <ShopOutlined style={{ fontSize: '16px' }} />,
      label: 'Sản Phẩm',
      path: '/products'
    },
    {
      key: 'stock',
      icon: <InboxOutlined style={{ fontSize: '16px' }} />,
      label: 'Tồn Kho',
      path: '/inventory'
    },
    {
      key: 'suppliers',
      icon: <UserOutlined style={{ fontSize: '16px' }} />,
      label: 'Nhà Cung Cấp',
      path: '/suppliers'
    },
    {
      key: 'financial',
      icon: <DollarOutlined style={{ fontSize: '16px' }} />,
      label: 'Thu Chi',
      path: '/financial'
    },
    {
      key: 'debt',
      icon: <FileTextOutlined style={{ fontSize: '16px' }} />,
      label: 'Công Nợ',
      path: '/debt'
    },
    {
      key: 'reports',
      icon: <BarChartOutlined style={{ fontSize: '16px' }} />,
      label: 'Báo Cáo',
      path: '/reports',
      badge: 'AI',
      color: '#1890ff'
    },
    {
      key: 'warranty',
      icon: <SafetyOutlined style={{ fontSize: '16px' }} />,
      label: 'Bảo Hành',
      path: '/warranty',
      badge: 'NEW',
      color: '#52c41a'
    },
    {
      key: 'users',
      icon: <UserOutlined style={{ fontSize: '16px' }} />,
      label: 'Người Dùng',
      path: '/users'
    }
  ], []);

  // Memoize path mapping
  const pathMap = useMemo(() => ({
    '/pos': 'pos',
    '/orders': 'orders',
    '/customers': 'customers',
    '/products': 'products',
    '/inventory': 'stock',
    '/suppliers': 'suppliers',
    '/financial': 'financial',
    '/debt': 'debt',
    '/reports': 'reports',
    '/warranty': 'warranty',
    '/users': 'users',
    '/settings': 'settings'
  }), []);

  // Memoize reverse path mapping for navigation
  const reversePathMap = useMemo(() => ({
    'pos': '/pos',
    'orders': '/orders',
    'customers': '/customers',
    'products': '/products',
    'stock': '/inventory',
    'suppliers': '/suppliers',
    'financial': '/financial',
    'debt': '/debt',
    'reports': '/reports',
    'warranty': '/warranty',
    'users': '/users',
    'settings': '/settings'
  }), []);

  // Update active key based on current path
  useEffect(() => {
    const key = pathMap[currentPath] || 'pos';
    setActiveKey(key);
  }, [currentPath, pathMap]);

  // Render menu item with smart features - SIMPLIFIED FOR FLAT MENU
  const renderMenuItem = (item) => {
    const label = (
      <div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
        data-testid={`nav-${item.key}`}
      >
        <Space>
          {item.icon}
          {!collapsed && <span>{item.label}</span>}
        </Space>
        {!collapsed && item.badge && (
          <Badge 
            count={item.badge} 
            style={{ 
              backgroundColor: item.color,
              fontSize: '10px',
              height: '16px',
              lineHeight: '16px',
              minWidth: '16px'
            }} 
          />
        )}
      </div>
    );

    return {
      key: item.key,
      icon: item.icon,
      label
    };
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      width={280}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        borderRadius: collapsed ? '0 16px 16px 0' : '0 20px 20px 0',
        overflow: 'hidden'
      }}
      data-testid="navigation-sidebar"
    >
      {/* Logo Section */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '0' : '0 24px',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {collapsed ? (
          <RobotOutlined style={{ fontSize: '24px', color: 'white' }} />
        ) : (
          <Space>
            <RobotOutlined style={{ fontSize: '28px', color: 'white' }} />
            <div>
              <Title level={4} style={{ color: 'white', margin: 0, fontSize: '18px' }}>
                Smart POS
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
                AI-Powered System
              </Text>
            </div>
          </Space>
        )}
      </div>

      {/* Menu Toggle Button */}
      <div style={{ 
        padding: '16px', 
        display: 'flex', 
        justifyContent: collapsed ? 'center' : 'flex-end' 
      }}>
        <Tooltip title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'} placement="right">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggle}
            style={{
              fontSize: '16px',
              width: '40px',
              height: '40px',
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            data-testid="menu-toggle"
          />
        </Tooltip>
      </div>

      {/* Smart Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activeKey]}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: '14px'
        }}
        items={menuItems.map(renderMenuItem)}
        onClick={({ key }) => {
          // Handle menu click navigation
          const path = reversePathMap[key];
          if (path) {
            window.location.href = path;
          }
        }}
        data-testid="nav-menu"
      />

      {/* Smart Status Indicator */}
      {!collapsed && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '12px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: '12px' }}>Hệ thống</Text>
              <Badge status="processing" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
                <ThunderboltOutlined /> AI Enhanced
              </Text>
              <Text style={{ color: '#52c41a', fontSize: '11px' }}>Online</Text>
            </div>
          </Space>
        </div>
      )}
    </Sider>
  );
});

// Smart Header Component with memo for performance
const SmartHeader = memo(({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Đơn hàng mới', message: 'Có 3 đơn hàng mới cần xử lý', time: '2 phút trước', type: 'info' },
    { id: 2, title: 'Sản phẩm sắp hết', message: 'iPhone 15 Pro chỉ còn 2 chiếc', time: '5 phút trước', type: 'warning' },
    { id: 3, title: 'Thanh toán thành công', message: 'Đơn hàng #12345 đã được thanh toán', time: '10 phút trước', type: 'success' }
  ]);

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true
    }
  ];

  const notificationMenuItems = notifications.map(notif => ({
    key: notif.id,
    label: (
      <div style={{ width: '300px', padding: '8px 0' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{notif.title}</div>
        <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>{notif.message}</div>
        <div style={{ color: '#999', fontSize: '11px' }}>{notif.time}</div>
      </div>
    )
  }));

  return (
            <Header style={{
              padding: '0 24px',
      background: 'linear-gradient(90deg, #ffffff 0%, #f8f9fa 100%)',
      borderBottom: '1px solid #e8e8e8',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
      height: '64px'
            }}>
      {/* Left Section */}
      <Space size="large">
                <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{
            fontSize: '16px',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: '#f5f5f5'
          }}
          data-testid="header-menu-toggle"
        />
        
        <div>
          <Text type="secondary" style={{ fontSize: '14px', color: '#666' }}>
            Hệ thống bán hàng thông minh
          </Text>
        </div>
              </Space>

      {/* Right Section */}
      <Space size="large">
        {/* Search */}
        <Tooltip title="Tìm kiếm nhanh">
          <Button
            type="text"
            icon={<SearchOutlined />}
            style={{
              fontSize: '16px',
              width: '40px',
              height: '40px',
              borderRadius: '8px'
            }}
          />
        </Tooltip>

        {/* Notifications */}
                <Dropdown
          menu={{ items: notificationMenuItems }}
          trigger={['click']}
                  placement="bottomRight"
        >
          <Badge count={notifications.length} size="small">
                  <Button 
                    type="text" 
                    icon={<BellOutlined />} 
                      style={{
                fontSize: '16px',
                        width: '40px',
                        height: '40px',
                borderRadius: '8px'
                      }}
                  />
                </Badge>
                </Dropdown>

        {/* User Menu */}
                <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          trigger={['click']}
                  placement="bottomRight"
        >
          <Space style={{ cursor: 'pointer' }}>
                      <Avatar 
              size="large" 
                        icon={<UserOutlined />} 
                          style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Text strong>{user?.fullName || user?.username || 'User'}</Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                <StarOutlined /> {user?.role === 'admin' ? 'Super Admin' : user?.role === 'manager' ? 'Manager' : 'Cashier'}
              </Text>
                      </div>
                    </Space>
                </Dropdown>
              </Space>
            </Header>
  );
});

// Main App Component
function App() {
  return (
    <AuthProvider>
      <AuthWrapper>
        <MainApp />
      </AuthWrapper>
    </AuthProvider>
  );
}

function MainApp() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize app
  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize smart monitoring
  useEffect(() => {
    // Smart monitoring auto-initializes, no need to call initialize()
    console.log('Smart monitoring is ready');
    // No destroy method needed as it's handled in the constructor
  }, []);

  // Smart route mapping
  const routes = [
    { path: '/pos', component: POSPage, exact: true },
    { path: '/customers', component: CustomersPage },
    { path: '/products', component: ProductsPage },
    { path: '/orders', component: OrdersPage },
    { path: '/inventory', component: InventoryPage },
    { path: '/suppliers', component: SuppliersPage },
    { path: '/financial', component: FinancialPage },
    { path: '/debt', component: DebtPage },
    { path: '/reports', component: ReportsPage },
    { path: '/users', component: UsersPage },
    { path: '/warranty', component: WarrantyPage }
  ];

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <Spin size="large" style={{ color: 'white' }} />
          <div style={{ marginTop: '20px' }}>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              <RobotOutlined /> Smart POS
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
              Đang khởi tạo hệ thống thông minh...
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Routes>
          <Route path="/*" element={
            <Layout>
              <SmartNavigation 
                collapsed={collapsed} 
                onToggle={() => setCollapsed(!collapsed)}
                currentPath={window.location.pathname}
              />
              <Layout>
                <SmartHeader 
                  collapsed={collapsed} 
                  onToggle={() => setCollapsed(!collapsed)} 
                />
            <Content style={{
                  margin: '24px',
                  padding: '24px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  minHeight: 'calc(100vh - 112px)',
                  overflow: 'auto'
                }}>
                  <Suspense fallback={
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      <Spin size="large" />
                      <div style={{ marginTop: '20px' }}>Đang tải...</div>
                    </div>
                  }>
              <Routes>
                <Route path="/" element={<Navigate to="/pos" replace />} />
                      {routes.map(route => (
                        <Route 
                          key={route.path}
                          path={route.path} 
                          element={<route.component />} 
                        />
                      ))}
              </Routes>
                  </Suspense>
            </Content>
          </Layout>
        </Layout>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 