import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Progress, Space, Typography, List, Avatar, Divider } from 'antd'
import { 
  ShoppingCartOutlined, 
  DollarOutlined, 
  UserOutlined, 
  ShopOutlined,
  RiseOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import api from '../services/api'

const { Title, Text } = Typography

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    monthOrders: 0,
    monthRevenue: 0,
    lowStockCount: 0,
    totalProducts: 0,
    totalCustomers: 0,
    topProducts: []
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [salesData, setSalesData] = useState([])
  const [categoryData, setCategoryData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [dashboardStats, orders, products] = await Promise.all([
        api.getDashboardStats(),
        api.getOrders({ limit: 10 }),
        api.getProducts({ status: 'active' })
      ])

      setStats({
        ...dashboardStats,
        totalProducts: products.length,
        lowStockCount: products.filter(p => p.stock <= 5).length
      })
      setRecentOrders(orders.slice(0, 5))
      
      // Filter low stock products
      const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0)
      setLowStockProducts(lowStock.slice(0, 5))

      // Generate sample sales data for charts
      const salesChart = generateSalesData()
      setSalesData(salesChart)

      // Generate category data
      const categoryStats = generateCategoryData(products)
      setCategoryData(categoryStats)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSalesData = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        orders: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 50000000) + 10000000
      })
    }
    return days
  }

  const generateCategoryData = (products) => {
    const categories = {}
    products.forEach(product => {
      const category = product.category_name || 'Khác'
      if (!categories[category]) {
        categories[category] = 0
      }
      categories[category]++
    })

    return Object.entries(categories).map(([name, value]) => ({
      type: name,
      value
    }))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const orderColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (amount) => formatCurrency(amount)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status === 'completed' ? 'Hoàn thành' : status === 'pending' ? 'Đang xử lý' : 'Đã hủy'}
        </Tag>
      )
    }
  ]

  // Simple chart rendering component
  const SimpleBarChart = ({ data, title }) => (
    <div>
      <h4 style={{ marginBottom: 16 }}>{title}</h4>
      <div style={{ display: 'flex', alignItems: 'end', height: 150, gap: 8 }}>
        {data.map((item, index) => (
          <div key={index} style={{ flex: 1, textAlign: 'center' }}>
            <div
              style={{
                height: `${(item.revenue / Math.max(...data.map(d => d.revenue))) * 120}px`,
                backgroundColor: '#1890ff',
                borderRadius: '4px 4px 0 0',
                marginBottom: 8,
                minHeight: 10
              }}
            />
            <div style={{ fontSize: 12, color: '#666' }}>{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const SimplePieChart = ({ data, title }) => (
    <div>
      <h4 style={{ marginBottom: 16 }}>{title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((item, index) => {
          const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: colors[index % colors.length],
                  borderRadius: '50%'
                }}
              />
              <span style={{ fontSize: 14 }}>{item.type}: {item.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Dashboard</Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đơn hàng hôm nay"
              value={stats.todayOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Doanh thu hôm nay"
              value={stats.todayRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đơn hàng tháng này"
              value={stats.monthOrders}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Doanh thu tháng này"
              value={stats.monthRevenue}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={stats.totalProducts}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Sắp hết hàng"
              value={stats.lowStockCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={stats.totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#f759ab' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu 7 ngày qua" extra={<LineChartOutlined />}>
            <SimpleBarChart data={salesData} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân bố sản phẩm theo danh mục" extra={<BarChartOutlined />}>
            <SimplePieChart data={categoryData} />
          </Card>
        </Col>
      </Row>

      {/* Data Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Đơn hàng gần đây" extra={<CheckCircleOutlined />}>
            {recentOrders.length > 0 ? (
              <Table
                dataSource={recentOrders}
                columns={orderColumns}
                pagination={false}
                size="small"
                loading={loading}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                <ShoppingCartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>Chưa có đơn hàng nào</div>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sản phẩm sắp hết hàng" extra={<WarningOutlined />}>
            {lowStockProducts.length > 0 ? (
              <List
                dataSource={lowStockProducts}
                renderItem={product => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        product.images && product.images.length > 0 ? (
                          <Avatar src={product.images[0]} shape="square" />
                        ) : (
                          <Avatar icon={<ShopOutlined />} shape="square" />
                        )
                      }
                      title={product.name}
                      description={
                        <Space>
                          <Text type="secondary">{product.sku}</Text>
                          <Tag color="orange">Còn {product.stock}</Tag>
                        </Space>
                      }
                    />
                    <div>
                      <Progress
                        percent={(product.stock / 10) * 100}
                        size="small"
                        status={product.stock <= 2 ? 'exception' : 'active'}
                        showInfo={false}
                      />
                      <Text type="danger" style={{ fontSize: 12 }}>
                        Cần nhập thêm
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                <CheckCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>Tất cả sản phẩm đều đủ hàng</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Top Products */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Sản phẩm bán chạy" extra={<RiseOutlined />}>
            {stats.topProducts && stats.topProducts.length > 0 ? (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
                dataSource={stats.topProducts}
                renderItem={product => (
                  <List.Item>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                          />
                        ) : (
                          <div style={{ 
                            width: 60, 
                            height: 60, 
                            background: '#f0f0f0', 
                            borderRadius: 4, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            margin: '0 auto'
                          }}>
                            <ShopOutlined style={{ fontSize: 24, color: '#ccc' }} />
                          </div>
                        )}
                        <div style={{ marginTop: 8 }}>
                          <Text strong style={{ fontSize: 12 }}>{product.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            Đã bán: {product.soldCount || 0}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <BarChartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>Chưa có dữ liệu bán hàng</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard 