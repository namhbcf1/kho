import React, { useState, useEffect } from 'react'
import { Card, Row, Col, DatePicker, Select, Button, Table, Statistic, Space, Typography } from 'antd'
import { 
  BarChartOutlined, 
  LineChartOutlined, 
  PieChartOutlined, 
  DownloadOutlined,
  PrinterOutlined,
  ReloadOutlined
} from '@ant-design/icons'
// Removed problematic @ant-design/charts import
import api from '../services/api'

const { RangePicker } = DatePicker
const { Option } = Select
const { Title, Text } = Typography

const ReportsPage = () => {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState([])
  const [reportType, setReportType] = useState('sales')
  const [reportData, setReportData] = useState({
    sales: [],
    products: [],
    customers: [],
    categories: [],
    summary: {}
  })

  useEffect(() => {
    fetchReportData()
  }, [dateRange, reportType])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // Simulate API calls - in real app, these would be actual API endpoints
      const [salesData, productsData, customersData] = await Promise.all([
        generateSalesReport(),
        generateProductsReport(),
        generateCustomersReport()
      ])

      setReportData({
        sales: salesData,
        products: productsData,
        customers: customersData,
        categories: generateCategoryReport(),
        summary: generateSummaryReport()
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSalesReport = () => {
    const days = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toISOString().split('T')[0],
        dateFormatted: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: Math.floor(Math.random() * 100000000) + 20000000,
        orders: Math.floor(Math.random() * 50) + 10,
        customers: Math.floor(Math.random() * 30) + 5
      })
    }
    return days
  }

  const generateProductsReport = () => {
    const products = [
      { name: 'Laptop Dell Inspiron 15', sold: 45, revenue: 675000000, category: 'Laptop' },
      { name: 'PC Gaming MSI', sold: 32, revenue: 960000000, category: 'PC Gaming' },
      { name: 'Laptop HP Pavilion', sold: 38, revenue: 570000000, category: 'Laptop' },
      { name: 'MacBook Air M2', sold: 28, revenue: 840000000, category: 'Laptop' },
      { name: 'PC Văn phòng Dell', sold: 25, revenue: 375000000, category: 'PC Văn phòng' },
      { name: 'Chuột Gaming Logitech', sold: 120, revenue: 36000000, category: 'Phụ kiện' },
      { name: 'Bàn phím cơ Corsair', sold: 85, revenue: 127500000, category: 'Phụ kiện' },
      { name: 'Màn hình ASUS 24 inch', sold: 42, revenue: 252000000, category: 'Phụ kiện' }
    ]
    return products.sort((a, b) => b.revenue - a.revenue)
  }

  const generateCustomersReport = () => {
    const customers = [
      { name: 'Nguyễn Văn A', orders: 8, spent: 45000000, lastOrder: '2024-01-15' },
      { name: 'Trần Thị B', orders: 6, spent: 38000000, lastOrder: '2024-01-14' },
      { name: 'Lê Văn C', orders: 5, spent: 32000000, lastOrder: '2024-01-13' },
      { name: 'Phạm Thị D', orders: 4, spent: 28000000, lastOrder: '2024-01-12' },
      { name: 'Hoàng Văn E', orders: 7, spent: 42000000, lastOrder: '2024-01-11' }
    ]
    return customers.sort((a, b) => b.spent - a.spent)
  }

  const generateCategoryReport = () => {
    return [
      { type: 'Laptop Gaming', value: 35, revenue: 1050000000 },
      { type: 'Laptop Văn phòng', value: 28, revenue: 840000000 },
      { type: 'PC Gaming', value: 22, revenue: 1320000000 },
      { type: 'PC Văn phòng', value: 18, revenue: 540000000 },
      { type: 'Phụ kiện', value: 45, revenue: 450000000 }
    ]
  }

  const generateSummaryReport = () => {
    return {
      totalRevenue: 4200000000,
      totalOrders: 148,
      totalCustomers: 89,
      avgOrderValue: 28378378,
      topCategory: 'PC Gaming',
      topProduct: 'PC Gaming MSI',
      growthRate: 12.5
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Simple chart components to replace problematic @ant-design/charts
  const SimpleLineChart = ({ data, title }) => (
    <div>
      <h4 style={{ marginBottom: 16 }}>{title}</h4>
      <div style={{ display: 'flex', alignItems: 'end', height: 200, gap: 2 }}>
        {data.slice(-15).map((item, index) => (
          <div key={index} style={{ flex: 1, textAlign: 'center' }}>
            <div
              style={{
                height: `${(item.revenue / Math.max(...data.map(d => d.revenue))) * 160}px`,
                backgroundColor: '#1890ff',
                borderRadius: '2px 2px 0 0',
                marginBottom: 8,
                minHeight: 5
              }}
            />
            <div style={{ fontSize: 10, color: '#666', transform: 'rotate(-45deg)' }}>
              {item.dateFormatted}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const SimpleColumnChart = ({ data, title }) => (
    <div>
      <h4 style={{ marginBottom: 16 }}>{title}</h4>
      <div style={{ display: 'flex', alignItems: 'end', height: 200, gap: 4 }}>
        {data.slice(-15).map((item, index) => (
          <div key={index} style={{ flex: 1, textAlign: 'center' }}>
            <div
              style={{
                height: `${(item.orders / Math.max(...data.map(d => d.orders))) * 160}px`,
                backgroundColor: '#52c41a',
                borderRadius: '2px 2px 0 0',
                marginBottom: 8,
                minHeight: 5
              }}
            />
            <div style={{ fontSize: 10, color: '#666', transform: 'rotate(-45deg)' }}>
              {item.dateFormatted}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const SimplePieChart = ({ data, title }) => (
    <div>
      <h4 style={{ marginBottom: 16 }}>{title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map((item, index) => {
          const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']
          const total = data.reduce((sum, d) => sum + d.value, 0)
          const percentage = ((item.value / total) * 100).toFixed(1)
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: colors[index % colors.length],
                  borderRadius: '50%'
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 'bold' }}>{item.type}</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  {item.value} sản phẩm ({percentage}%)
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const productsTableColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Đã bán',
      dataIndex: 'sold',
      key: 'sold',
      render: (value) => <Text strong>{value}</Text>
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value) => <Text strong style={{ color: '#52c41a' }}>{formatCurrency(value)}</Text>
    }
  ]

  const customersTableColumns = [
    {
      title: 'Khách hàng',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Số đơn hàng',
      dataIndex: 'orders',
      key: 'orders',
      render: (value) => <Text strong>{value}</Text>
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'spent',
      key: 'spent',
      render: (value) => <Text strong style={{ color: '#52c41a' }}>{formatCurrency(value)}</Text>
    },
    {
      title: 'Đơn hàng cuối',
      dataIndex: 'lastOrder',
      key: 'lastOrder',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    }
  ]

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting report...')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Báo cáo</Title>
        <Space>
          <RangePicker
            onChange={setDateRange}
            placeholder={['Từ ngày', 'Đến ngày']}
          />
          <Select
            value={reportType}
            onChange={setReportType}
            style={{ width: 150 }}
          >
            <Option value="sales">Doanh thu</Option>
            <Option value="products">Sản phẩm</Option>
            <Option value="customers">Khách hàng</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchReportData}>
            Làm mới
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            Xuất Excel
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrint}>
            In báo cáo
          </Button>
        </Space>
      </div>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={reportData.summary.totalRevenue}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={reportData.summary.totalOrders}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={reportData.summary.totalCustomers}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Giá trị đơn hàng TB"
              value={reportData.summary.avgOrderValue}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu theo ngày" extra={<BarChartOutlined />}>
            <SimpleLineChart data={reportData.sales} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân bố theo danh mục" extra={<PieChartOutlined />}>
            <SimplePieChart data={reportData.categories} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Số đơn hàng theo ngày" extra={<LineChartOutlined />}>
            <SimpleColumnChart data={reportData.sales} />
          </Card>
        </Col>
      </Row>

      {/* Data Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Top sản phẩm bán chạy">
            <Table
              dataSource={reportData.products}
              columns={productsTableColumns}
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top khách hàng VIP">
            <Table
              dataSource={reportData.customers}
              columns={customersTableColumns}
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Category Performance */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Hiệu suất theo danh mục">
            <Row gutter={[16, 16]}>
              {reportData.categories.map((category, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <Card size="small">
                    <Statistic
                      title={category.type}
                      value={category.value}
                      suffix="sản phẩm"
                      valueStyle={{ color: '#1890ff' }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Doanh thu: </Text>
                      <Text strong>{formatCurrency(category.revenue)}</Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Growth Indicators */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Chỉ số tăng trưởng">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Tăng trưởng doanh thu"
                  value={reportData.summary.growthRate}
                  suffix="%"
                  valueStyle={{ color: reportData.summary.growthRate > 0 ? '#52c41a' : '#f5222d' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Danh mục bán chạy nhất"
                  value={reportData.summary.topCategory}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Sản phẩm bán chạy nhất"
                  value={reportData.summary.topProduct}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ReportsPage 