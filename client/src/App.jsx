import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Avatar, Dropdown, Space, Badge, Typography, theme } from 'antd'
import {
  DashboardOutlined, ShopOutlined, UserOutlined, ShoppingCartOutlined,
  FileTextOutlined, BarChartOutlined, SettingOutlined, LogoutOutlined,
  BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BarcodeOutlined,
  ToolOutlined, InboxOutlined, TeamOutlined, BankOutlined
} from '@ant-design/icons'

// Import pages
import Dashboard from './pages/Dashboard'
import EnhancedProductsPage from './pages/EnhancedProductsPage'
import InventoryManagementPage from './pages/InventoryManagementPage'
import WarrantyManagementPage from './pages/WarrantyManagementPage'
import CustomersPage from './pages/CustomersPage'
import OrdersPage from './pages/OrdersPage'
import POSPage from './pages/POSPage'
import ReportsPage from './pages/ReportsPage'
import SuppliersPage from './pages/SuppliersPage'
import UsersPage from './pages/UsersPage'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

// Main App Layout Component
const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedKey, setSelectedKey] = useState('dashboard')
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  // Update selected key based on current route
  useEffect(() => {
    const path = location.pathname
    const currentItem = menuItems.find(item => item.path === path)
    if (currentItem) {
      setSelectedKey(currentItem.key)
    }
  }, [location.pathname])

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      key: 'pos',
      icon: <ShoppingCartOutlined />,
      label: 'Bán hàng (POS)',
      path: '/pos'
    },
    {
      key: 'products',
      icon: <ShopOutlined />,
      label: 'Sản phẩm',
      path: '/products'
    },
    {
      key: 'inventory',
      icon: <InboxOutlined />,
      label: 'Quản lý tồn kho',
      path: '/inventory'
    },
    {
      key: 'warranty',
      icon: <ToolOutlined />,
      label: 'Bảo hành',
      path: '/warranty'
    },
    {
      key: 'customers',
      icon: <UserOutlined />,
      label: 'Khách hàng',
      path: '/customers'
    },
    {
      key: 'orders',
      icon: <FileTextOutlined />,
      label: 'Đơn hàng',
      path: '/orders'
    },
    {
      key: 'suppliers',
      icon: <BankOutlined />,
      label: 'Nhà cung cấp',
      path: '/suppliers'
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Báo cáo',
      path: '/reports'
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'Người dùng',
      path: '/users'
    }
  ]

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
      label: 'Đăng xuất'
    }
  ]

  const handleMenuClick = (e) => {
    const selectedItem = menuItems.find(item => item.key === e.key)
    if (selectedItem) {
      navigate(selectedItem.path)
    }
  }

  const handleUserMenuClick = (e) => {
    if (e.key === 'logout') {
      // Handle logout
      console.log('Logout')
    }
  }

  const getPageTitle = () => {
    const item = menuItems.find(item => item.key === selectedKey)
    return item ? item.label : 'Computer Store Management'
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          style={{
            background: colorBgContainer,
            boxShadow: '2px 0 6px rgba(0,21,41,.35)'
          }}
        >
          <div style={{ 
            height: 64, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0'
          }}>
            {collapsed ? (
              <ShopOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShopOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                  Computer Store
                </Title>
              </div>
            )}
          </div>
          
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            style={{ border: 'none' }}
            items={menuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.label
            }))}
          />
        </Sider>

        <Layout>
          <Header
            style={{
              padding: '0 24px',
              background: colorBgContainer,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: '16px',
                  width: 64,
                  height: 64,
                }}
              />
              <Title level={3} style={{ margin: 0 }}>
                {getPageTitle()}
              </Title>
            </div>

            <Space size="middle">
              <Badge count={5} size="small">
                <Button type="text" icon={<BellOutlined />} size="large" />
              </Badge>
              
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick
                }}
                placement="bottomRight"
              >
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Text strong>Admin User</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Quản trị viên
                    </Text>
                  </div>
                </Space>
              </Dropdown>
            </Space>
          </Header>

          <Content
            style={{
              margin: 0,
              minHeight: 280,
              background: '#f0f2f5',
              overflow: 'auto'
            }}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pos" element={<POSPage />} />
              <Route path="/products" element={<EnhancedProductsPage />} />
              <Route path="/inventory" element={<InventoryManagementPage />} />
              <Route path="/warranty" element={<WarrantyManagementPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/users" element={<UsersPage />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
  )
}

// Main App Component with Router
const App = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  )
}

export default App 