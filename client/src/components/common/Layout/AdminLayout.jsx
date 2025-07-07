// =====================================================
// 🎨 LAYOUT COMPONENTS THEO ROLE
// =====================================================

// components/common/Layout/AdminLayout.jsx - Layout cho Admin
import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/admin/dashboard')
    },
    {
      key: '/admin/products',
      icon: <InboxOutlined />,
      label: 'Quản lý Sản phẩm',
      children: [
        {
          key: '/admin/products/list',
          label: 'Danh sách Sản phẩm',
          onClick: () => navigate('/admin/products/list')
        },
        {
          key: '/admin/products/categories',
          label: 'Danh mục',
          onClick: () => navigate('/admin/products/categories')
        },
        {
          key: '/admin/products/price-optimization',
          label: 'Tối ưu Giá (AI)',
          onClick: () => navigate('/admin/products/price-optimization')
        }
      ]
    },
    {
      key: '/admin/inventory',
      icon: <ShoppingCartOutlined />,
      label: 'Quản lý Kho',
      children: [
        {
          key: '/admin/inventory/dashboard',
          label: 'Dashboard Kho',
          onClick: () => navigate('/admin/inventory/dashboard')
        },
        {
          key: '/admin/inventory/forecasting',
          label: 'Dự báo Nhu cầu (AI)',
          onClick: () => navigate('/admin/inventory/forecasting')
        },
        {
          key: '/admin/inventory/movements',
          label: 'Xuất nhập Kho',
          onClick: () => navigate('/admin/inventory/movements')
        }
      ]
    },
    {
      key: '/admin/orders',
      icon: <ShoppingCartOutlined />,
      label: 'Quản lý Đơn hàng',
      onClick: () => navigate('/admin/orders')
    },
    {
      key: '/admin/staff',
      icon: <TeamOutlined />,
      label: 'Quản lý Nhân viên',
      children: [
        {
          key: '/admin/staff/management',
          label: 'Danh sách Nhân viên',
          onClick: () => navigate('/admin/staff/management')
        },
        {
          key: '/admin/staff/performance',
          label: 'Theo dõi Hiệu suất',
          onClick: () => navigate('/admin/staff/performance')
        },
        {
          key: '/admin/staff/gamification',
          label: 'Cấu hình Game hóa',
          onClick: () => navigate('/admin/staff/gamification')
        }
      ]
    },
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo & BI',
      children: [
        {
          key: '/admin/reports/revenue',
          label: 'Báo cáo Doanh thu',
          onClick: () => navigate('/admin/reports/revenue')
        },
        {
          key: '/admin/reports/omnichannel',
          label: 'Phân tích Đa kênh',
          onClick: () => navigate('/admin/reports/omnichannel')
        },
        {
          key: '/admin/reports/business-intelligence',
          label: 'Business Intelligence',
          onClick: () => navigate('/admin/reports/business-intelligence')
        }
      ]
    },
    {
      key: '/admin/integrations',
      icon: <SettingOutlined />,
      label: 'Tích hợp',
      children: [
        {
          key: '/admin/integrations/ecommerce',
          label: 'Sàn TMĐT',
          onClick: () => navigate('/admin/integrations/ecommerce')
        },
        {
          key: '/admin/integrations/payment',
          label: 'Cổng Thanh toán',
          onClick: () => navigate('/admin/integrations/payment')
        }
      ]
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt Hệ thống',
      onClick: () => navigate('/admin/settings')
    }
  ];

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Hồ sơ cá nhân
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Cài đặt
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="admin-sidebar"
        theme="dark"
      >
        <div className="logo p-4 text-center">
          <h2 className="text-white font-bold">
            {collapsed ? 'POS' : 'Smart POS Admin'}
          </h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      
      <Layout className="site-layout">
        <Header className="site-layout-background bg-white shadow-sm px-4 flex items-center justify-between">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <div className="flex items-center space-x-4">
            <Badge count={5}>
              <BellOutlined style={{ fontSize: '18px' }} />
            </Badge>
            
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="font-medium">{user?.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="mx-6 my-4 p-6 bg-white rounded-lg shadow-sm min-h-[calc(100vh-112px)]">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

// components/common/Layout/CashierLayout.jsx - Layout cho Thu ngân
import React from 'react';
import { Layout, Button, Avatar, Badge, Card } from 'antd';
import {
  ShoppingCartOutlined,
  ClockCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';

const { Header, Content } = Layout;

const CashierLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }} className="cashier-layout">
      <Header className="bg-blue-600 text-white px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ShoppingCartOutlined style={{ fontSize: '24px' }} />
          <h1 className="text-xl font-bold m-0">POS Terminal</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <ClockCircleOutlined />
            <span className="font-mono">
              {currentTime.toLocaleTimeString('vi-VN')}
            </span>
          </div>
          
          <div className="h-8 w-px bg-blue-400"></div>
          
          <div className="flex items-center space-x-2">
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{user?.name}</span>
          </div>
          
          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />}
            onClick={logout}
            size="small"
          >
            Đăng xuất
          </Button>
        </div>
      </Header>
      
      <Content className="p-4 bg-gray-50">
        {/* Quick Actions Bar */}
        <Card className="mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <Button type="primary" icon={<ShoppingCartOutlined />}>
                Đơn hàng mới
              </Button>
              <Button icon={<PrinterOutlined />}>
                In lại hóa đơn
              </Button>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div>Ca làm việc: <span className="font-semibold">08:00 - 17:00</span></div>
              <div>Đơn hàng hôm nay: <span className="font-semibold text-blue-600">23</span></div>
            </div>
          </div>
        </Card>
        
        <div className="min-h-[calc(100vh-200px)]">
          {children}
        </div>
      </Content>
    </Layout>
  );
};

export default CashierLayout;

// components/common/Layout/StaffLayout.jsx - Layout cho Nhân viên (Game hóa)
import React from 'react';
import { Layout, Menu, Card, Progress, Badge, Avatar, Button } from 'antd';
import {
  TrophyOutlined,
  TeamOutlined,
  TargetOutlined,
  GiftOutlined,
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
  StarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const StaffLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mock data cho demo
  const staffStats = {
    todaySales: 15250000,
    monthlyTarget: 50000000,
    commission: 1525000,
    rank: 3,
    points: 2350,
    badges: 8
  };

  const completionPercentage = (staffStats.todaySales / staffStats.monthlyTarget * 100).toFixed(1);

  const menuItems = [
    {
      key: '/staff/dashboard',
      icon: <TrophyOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/staff/dashboard')
    },
    {
      key: '/staff/gamification',
      icon: <StarOutlined />,
      label: 'Game hóa',
      children: [
        {
          key: '/staff/gamification/leaderboard',
          label: 'Bảng xếp hạng',
          onClick: () => navigate('/staff/gamification/leaderboard')
        },
        {
          key: '/staff/gamification/achievements',
          label: 'Thành tích',
          onClick: () => navigate('/staff/gamification/achievements')
        },
        {
          key: '/staff/gamification/challenges',
          label: 'Thử thách',
          onClick: () => navigate('/staff/gamification/challenges')
        },
        {
          key: '/staff/gamification/rewards',
          label: 'Cửa hàng Thưởng',
          onClick: () => navigate('/staff/gamification/rewards')
        }
      ]
    },
    {
      key: '/staff/sales',
      icon: <DollarOutlined />,
      label: 'Bán hàng',
      children: [
        {
          key: '/staff/sales/my-sales',
          label: 'Doanh số của tôi',
          onClick: () => navigate('/staff/sales/my-sales')
        },
        {
          key: '/staff/sales/targets',
          label: 'Mục tiêu',
          onClick: () => navigate('/staff/sales/targets')
        },
        {
          key: '/staff/sales/recommendations',
          label: 'Gợi ý AI',
          onClick: () => navigate('/staff/sales/recommendations')
        }
      ]
    },
    {
      key: '/staff/training',
      icon: <BookOutlined />,
      label: 'Đào tạo',
      onClick: () => navigate('/staff/training')
    },
    {
      key: '/staff/profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ',
      onClick: () => navigate('/staff/profile')
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }} className="staff-layout">
      <Header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <TrophyOutlined style={{ fontSize: '24px' }} />
          <h1 className="text-xl font-bold m-0">Smart POS Staff</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <StarOutlined />
              <span>{staffStats.points} điểm</span>
            </div>
            <div className="flex items-center space-x-1">
              <TargetOutlined />
              <span>#{staffStats.rank}</span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-purple-400"></div>
          
          <div className="flex items-center space-x-2">
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{user?.name}</span>
          </div>
          
          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />}
            onClick={logout}
            size="small"
          >
            Đăng xuất
          </Button>
        </div>
      </Header>
      
      <Layout>
        <Sider theme="light" width={250} className="border-r">
          {/* Stats Widget */}
          <Card className="m-4 mb-2" size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(staffStats.commission)}
              </div>
              <div className="text-xs text-gray-500">Hoa hồng tháng này</div>
            </div>
          </Card>
          
          <Card className="m-4 mt-2" size="small">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mục tiêu tháng</span>
                <span className="font-semibold">{completionPercentage}%</span>
              </div>
              <Progress 
                percent={parseFloat(completionPercentage)} 
                size="small"
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
          </Card>
          
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="border-r-0"
          />
        </Sider>
        
        <Content className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default StaffLayout;

// components/common/Layout/index.js - Export tất cả layouts
export { default as AdminLayout } from './AdminLayout';
export { default as CashierLayout } from './CashierLayout';
export { default as StaffLayout } from './StaffLayout';