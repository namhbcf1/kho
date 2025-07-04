import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Button, Breadcrumb, Dropdown, Avatar, Space, Badge, List, Typography, Divider, notification } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  ShopOutlined,
  CreditCardOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined,
  WalletOutlined,
  WarningOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  TruckOutlined,
  ToolOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  SunOutlined,
  MoonOutlined,
  GlobalOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';

// Import all pages
import POSPage from './pages/POSPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from './pages/ReportsPage';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage';
import EnhancedInventoryPage from './pages/EnhancedInventoryPage';
import FinancialPage from './pages/FinancialPage';
import DebtPage from './pages/DebtPage';
import UsersPage from './pages/UsersPage';
import EnhancedReportsPage from './pages/EnhancedReportsPage';
import WarrantyPage from './pages/WarrantyPage';
import AIDashboardPage from './pages/AIDashboardPage';
// TODO: Create these pages
// import SettingsPage from './pages/SettingsPage';

import './App.css';

// 🤖 Import AI Error Monitor
import aiErrorMonitor from './services/errorMonitor';
import ErrorBoundary from './components/ErrorBoundary';

const { Header, Sider, Content } = Layout;
const { SubMenu } = Menu;
const { Text } = Typography;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(['dashboard']);
  const [aiMonitoringStatus, setAiMonitoringStatus] = useState('initializing');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Đơn hàng mới',
      message: 'Đơn hàng #DH001 đã được tạo thành công',
      time: '2 phút trước',
      read: false,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    },
    {
      id: 2,
      type: 'warning',
      title: 'Tồn kho thấp',
      message: 'Sản phẩm RAM DDR4 sắp hết hàng (còn 5 sản phẩm)',
      time: '15 phút trước',
      read: false,
      icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />
    },
    {
      id: 3,
      type: 'info',
      title: 'Bảo hành sắp hết hạn',
      message: '3 sản phẩm sẽ hết hạn bảo hành trong 7 ngày tới',
      time: '1 giờ trước',
      read: true,
      icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />
    },
    {
      id: 4,
      type: 'error',
      title: 'Lỗi hệ thống',
      message: 'API backup đã được khôi phục tự động',
      time: '2 giờ trước',
      read: true,
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
    }
  ]);

  // Enhanced user data with more info
  const currentUser = {
    id: 1,
    name: 'Admin User',
    email: 'admin@pos-system.com',
    role: 'admin',
    avatar: null,
    lastLogin: new Date(),
    permissions: ['all'],
    status: 'online'
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // 🤖 Initialize AI Error Monitor
  useEffect(() => {
    console.log('🚀 Khởi động AI Error Monitor...');
    
    // Check if AI Error Monitor is working
    if (aiErrorMonitor && aiErrorMonitor.isMonitoring) {
      setAiMonitoringStatus('active');
      console.log('✅ AI Error Monitor đã sẵn sàng!');
      
      // Test AI monitoring (optional)
      setTimeout(() => {
        console.log('🧪 Test AI Error Monitor...');
        try {
          const report = aiErrorMonitor.generateReport();
          console.log('📊 AI Error Report:', report);
        } catch (error) {
          console.error('❌ AI Error Monitor test failed:', error);
        }
      }, 2000);
    } else {
      setAiMonitoringStatus('error');
      console.error('❌ AI Error Monitor khởi động thất bại');
    }

    // Cleanup function
    return () => {
      console.log('🔴 App unmounting - AI Error Monitor still running in background');
    };
  }, []);

  // 🆕 FLAT MENU - No more dropdowns, all expanded
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
      path: '/'
    },
    {
      key: 'pos',
      icon: <ShoppingCartOutlined />,
      label: 'Bán hàng (POS)',
      path: '/pos'
    },
    // Expanded Sales Management
    {
      key: 'orders',
      icon: <FileTextOutlined />,
          label: 'Đơn hàng',
          path: '/orders'
        },
        {
          key: 'customers',
      icon: <UserOutlined />,
          label: 'Khách hàng',
          path: '/customers'
    },
    // Expanded Inventory Management
    {
      key: 'products',
      icon: <InboxOutlined />,
          label: 'Sản phẩm',
          path: '/products'
        },
        {
          key: 'stock',
      icon: <ShopOutlined />,
          label: 'Tồn kho',
          path: '/inventory'
        },
        {
          key: 'suppliers',
      icon: <TruckOutlined />,
          label: 'Nhà cung cấp',
          path: '/suppliers'
    },
    {
      key: 'warranty',
      icon: <ToolOutlined />,
      label: 'Bảo hành',
      path: '/warranty'
    },
    // Expanded Finance Management
    {
      key: 'financial',
      icon: <WalletOutlined />,
          label: 'Thu chi',
          path: '/financial'
        },
        {
          key: 'debt',
      icon: <CreditCardOutlined />,
          label: 'Công nợ',
          path: '/debt'
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo',
      path: '/reports'
    },
    {
      key: 'ai-dashboard',
      icon: <RobotOutlined />,
      label: 'AI Monitor',
      path: '/ai-dashboard'
    },
    // Expanded System Management
        {
          key: 'users',
      icon: <TeamOutlined />,
          label: 'Nhân viên',
          path: '/users'
        },
        {
          key: 'settings',
      icon: <SettingOutlined />,
          label: 'Cài đặt',
          path: '/settings'
    }
  ];

  const getCurrentPath = () => {
    return window.location.pathname;
  };

  const getCurrentBreadcrumb = () => {
    const path = getCurrentPath();
    const breadcrumbMap = {
      '/': ['Tổng quan'],
      '/pos': ['Bán hàng (POS)'],
      '/orders': ['Quản lý bán hàng', 'Đơn hàng'],
      '/customers': ['Quản lý bán hàng', 'Khách hàng'],
      '/products': ['Quản lý kho', 'Sản phẩm'],
      '/inventory': ['Quản lý kho', 'Tồn kho'],
      '/suppliers': ['Quản lý kho', 'Nhà cung cấp'],
      '/warranty': ['Bảo hành'],
      '/financial': ['Tài chính', 'Thu chi'],
      '/debt': ['Tài chính', 'Công nợ'],
      '/reports': ['Báo cáo'],
      '/ai-dashboard': ['AI Monitor'],
      '/users': ['Hệ thống', 'Nhân viên'],
      '/settings': ['Hệ thống', 'Cài đặt']
    };
    return breadcrumbMap[path] || ['Trang không xác định'];
  };

  // 🆕 Enhanced notification handlers
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // 🆕 Enhanced user menu actions
  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    notification.success({
      message: 'Chế độ giao diện',
      description: `Đã chuyển sang chế độ ${!isDarkMode ? 'tối' : 'sáng'}`,
      placement: 'topRight',
      duration: 2
    });
  };

  const handleLanguageChange = () => {
    notification.info({
      message: 'Ngôn ngữ',
      description: 'Tính năng đa ngôn ngữ sẽ sớm có trong phiên bản tiếp theo',
      placement: 'topRight'
    });
  };

  const handleProfileView = () => {
    notification.info({
      message: 'Thông tin cá nhân',
      description: 'Trang thông tin cá nhân sẽ sớm có',
      placement: 'topRight'
    });
  };

  const handleLogout = () => {
    notification.success({
      message: 'Đăng xuất',
      description: 'Đã đăng xuất thành công. Hẹn gặp lại!',
      placement: 'topRight'
    });
    // TODO: Implement actual logout logic
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // 🆕 Enhanced user menu with more features
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div>
          <div style={{ fontWeight: 'bold' }}>Thông tin cá nhân</div>
          <div style={{ fontSize: '11px', color: '#666' }}>Xem và chỉnh sửa hồ sơ</div>
        </div>
      )
    },
    {
      key: 'theme',
      icon: isDarkMode ? <SunOutlined /> : <MoonOutlined />,
      label: (
        <div>
          <div>Chế độ {isDarkMode ? 'sáng' : 'tối'}</div>
          <div style={{ fontSize: '11px', color: '#666' }}>Thay đổi giao diện</div>
        </div>
      )
    },
    {
      key: 'language',
      icon: <GlobalOutlined />,
      label: (
        <div>
          <div>Ngôn ngữ</div>
          <div style={{ fontSize: '11px', color: '#666' }}>Tiếng Việt</div>
        </div>
      )
    },
    {
      key: 'help',
      icon: <QuestionCircleOutlined />,
      label: 'Trợ giúp & Hướng dẫn'
    },
    {
      type: 'divider'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt hệ thống'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: (
        <div style={{ color: '#ff4d4f' }}>
          <div style={{ fontWeight: 'bold' }}>Đăng xuất</div>
          <div style={{ fontSize: '11px' }}>Kết thúc phiên làm việc</div>
        </div>
      ),
      danger: true
    }
  ];

  const handleUserMenuClick = ({ key }) => {
    switch (key) {
      case 'profile':
        handleProfileView();
        break;
      case 'theme':
        handleThemeToggle();
        break;
      case 'language':
        handleLanguageChange();
        break;
      case 'help':
        notification.info({
          message: 'Trợ giúp',
          description: 'Trang trợ giúp sẽ sớm có. Hiện tại bạn có thể liên hệ admin để được hỗ trợ.',
          placement: 'topRight'
        });
        break;
      case 'settings':
        window.location.href = '/settings';
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  // 🆕 Enhanced notification dropdown content
  const notificationDropdownContent = (
    <div style={{ width: '350px', maxHeight: '400px' }}>
      {/* Header */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <Text strong style={{ fontSize: '16px' }}>🔔 Thông báo</Text>
          {unreadNotifications > 0 && (
            <Badge 
              count={unreadNotifications} 
              size="small" 
              style={{ marginLeft: '8px' }}
            />
          )}
        </div>
        <Space>
          {unreadNotifications > 0 && (
            <Button 
              type="link" 
              size="small"
              onClick={markAllNotificationsAsRead}
              style={{ padding: 0 }}
            >
              Đánh dấu đã đọc
            </Button>
          )}
          <Button 
            type="link" 
            size="small"
            onClick={clearAllNotifications}
            style={{ padding: 0, color: '#ff4d4f' }}
          >
            Xóa tất cả
          </Button>
        </Space>
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {notifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: '12px 16px',
                  background: item.read ? '#fff' : '#f6ffed',
                  borderLeft: item.read ? 'none' : '3px solid #52c41a',
                  cursor: 'pointer'
                }}
                onClick={() => markNotificationAsRead(item.id)}
                actions={[
                  <Button 
                    type="link" 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(item.id);
                    }}
                    style={{ color: '#999' }}
                  >
                    ✕
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={item.icon}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong style={{ fontSize: '13px' }}>{item.title}</Text>
                      <Text type="secondary" style={{ fontSize: '11px' }}>{item.time}</Text>
                    </div>
                  }
                  description={
                    <Text style={{ fontSize: '12px', color: '#666' }}>
                      {item.message}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            color: '#999'
          }}>
            <BellOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
            <div>Không có thông báo nào</div>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div style={{ 
          padding: '8px 16px', 
          borderTop: '1px solid #f0f0f0',
          textAlign: 'center'
        }}>
          <Button type="link" size="small">
            Xem tất cả thông báo
          </Button>
        </div>
      )}
    </div>
  );

  // 🆕 SIMPLE MENU RENDERER - No SubMenu, all flat
  const renderMenuItems = (items) => {
    return items.map(item => (
        <Menu.Item key={item.key} icon={item.icon}>
          <a href={item.path}>{item.label}</a>
        </Menu.Item>
    ));
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          width={250}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div style={{
            height: '64px',
            margin: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? '16px' : '20px',
            fontWeight: 'bold'
          }}>
            {collapsed ? 'POS' : '🏪 POS System'}
          </div>
          
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKeys}
            style={{ borderRight: 0 }}
          >
            {renderMenuItems(menuItems)}
          </Menu>
        </Sider>

        {/* Main Layout */}
        <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s' }}>
          {/* Header */}
          <Header style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            position: 'sticky',
            top: 0,
            zIndex: 1000
          }}>
            <Space>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '16px', width: 64, height: 64 }}
              />
              
              <Breadcrumb>
                {getCurrentBreadcrumb().map((item, index) => (
                  <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
                ))}
              </Breadcrumb>
            </Space>

            {/* 🆕 Enhanced Header Right Section */}
            <Space size="middle">
              {/* AI Monitoring Status - Enhanced */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '12px',
                padding: '6px 10px',
                borderRadius: '6px',
                background: aiMonitoringStatus === 'active' ? '#f6ffed' : 
                           aiMonitoringStatus === 'error' ? '#fff2f0' : '#f0f0f0',
                border: `1px solid ${aiMonitoringStatus === 'active' ? '#b7eb8f' : 
                                    aiMonitoringStatus === 'error' ? '#ffccc7' : '#d9d9d9'}`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onClick={() => window.location.href = '/ai-dashboard'}
              title="Click để xem AI Dashboard"
              >
                <span style={{ 
                  color: aiMonitoringStatus === 'active' ? '#52c41a' : 
                         aiMonitoringStatus === 'error' ? '#ff4d4f' : '#8c8c8c',
                  marginRight: '6px',
                  fontSize: '14px'
                }}>
                  🤖
                </span>
                <span style={{ 
                  color: aiMonitoringStatus === 'active' ? '#52c41a' : 
                         aiMonitoringStatus === 'error' ? '#ff4d4f' : '#8c8c8c',
                  fontWeight: 'bold'
                }}>
                  AI {aiMonitoringStatus === 'active' ? 'ON' : 
                      aiMonitoringStatus === 'error' ? 'ERROR' : 'INIT'}
                </span>
              </div>

              {/* 🆕 Enhanced Notifications with Dropdown */}
              <Dropdown
                dropdownRender={() => notificationDropdownContent}
                placement="bottomRight"
                trigger={['click']}
                arrow={{ pointAtCenter: true }}
              >
                <Badge 
                  count={unreadNotifications} 
                  size="small"
                  style={{ 
                    boxShadow: unreadNotifications > 0 ? '0 0 0 1px #fff' : 'none'
                  }}
                >
                <Button 
                  type="text" 
                  icon={<BellOutlined />} 
                  size="large"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      transition: 'all 0.3s',
                      background: unreadNotifications > 0 ? '#f6ffed' : 'transparent'
                    }}
                    title={`${unreadNotifications} thông báo chưa đọc`}
                />
              </Badge>
              </Dropdown>

              {/* 🆕 Enhanced User Profile Dropdown */}
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick
                }}
                placement="bottomRight"
                arrow={{ pointAtCenter: true }}
                trigger={['click']}
              >
                <Button 
                  type="text" 
                  style={{ 
                    height: 'auto', 
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid #f0f0f0',
                    background: '#fafafa',
                    transition: 'all 0.3s'
                  }}
                  className="user-profile-button"
                >
                  <Space>
                    <div style={{ position: 'relative' }}>
                    <Avatar 
                        size={32} 
                      icon={<UserOutlined />} 
                      src={currentUser.avatar}
                        style={{
                          background: currentUser.status === 'online' ? '#52c41a' : '#d9d9d9'
                        }}
                      />
                      {/* Online Status Indicator */}
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '12px',
                        height: '12px',
                        background: currentUser.status === 'online' ? '#52c41a' : '#d9d9d9',
                        border: '2px solid #fff',
                        borderRadius: '50%'
                      }} />
                    </div>
                    <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {currentUser.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {currentUser.role === 'admin' ? '👑 Quản trị viên' : 
                         currentUser.role === 'manager' ? '👨‍💼 Quản lý' : '👤 Nhân viên'}
                      </div>
                    </div>
                  </Space>
                </Button>
              </Dropdown>
            </Space>
          </Header>

          {/* Content */}
          <Content style={{
            margin: 0,
            minHeight: 'calc(100vh - 64px)',
            background: '#f0f2f5'
          }}>
            <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Navigate to="/pos" replace />} />
              <Route path="/pos" element={<POSPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/reports" element={<EnhancedReportsPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/inventory" element={<EnhancedInventoryPage />} />
                <Route path="/warranty" element={<WarrantyPage />} />
                <Route path="/ai-dashboard" element={<AIDashboardPage />} />
              <Route path="/financial" element={<FinancialPage />} />
              <Route path="/debt" element={<DebtPage />} />
              <Route path="/users" element={<UsersPage />} />
              
              {/* TODO: Add this route when page is created */}
              <Route path="/settings" element={
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <h2>Trang Cài đặt đang được phát triển</h2>
                  <p>Tính năng này sẽ sớm có trong phiên bản tiếp theo</p>
                </div>
              } />
              
              {/* 404 Page */}
              <Route path="*" element={
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <h2>404 - Trang không tìm thấy</h2>
                  <p>Trang bạn tìm kiếm không tồn tại</p>
                  <Button type="primary" href="/pos">
                    Quay về trang chính
                  </Button>
                </div>
              } />
            </Routes>
            </ErrorBoundary>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App; 