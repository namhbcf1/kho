// =====================================================
// 📊 ADMIN DASHBOARD VỚI BUSINESS INTELLIGENCE
// =====================================================

// pages/admin/Dashboard/AnalyticsDashboard.jsx - Dashboard BI chính
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Select, DatePicker, Button, Space, Tabs, Alert } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  BellOutlined,
  RobotOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState('month');
  const [channelFilter, setChannelFilter] = useState('all');
  const [realTimeData, setRealTimeData] = useState({});

  // Mock data - trong thực tế sẽ fetch từ API
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalRevenue: 2850000000,
      revenueGrowth: 12.5,
      totalOrders: 3847,
      ordersGrowth: 8.3,
      totalCustomers: 1563,
      customersGrowth: 15.2,
      avgOrderValue: 741000,
      aovGrowth: 4.1,
      conversionRate: 3.8,
      conversionGrowth: -0.5
    },
    revenueChart: [
      { date: '01/12', offline: 45000000, online: 28000000, shopee: 15000000, lazada: 8000000 },
      { date: '02/12', offline: 52000000, online: 31000000, shopee: 18000000, lazada: 9000000 },
      { date: '03/12', offline: 48000000, online: 35000000, shopee: 22000000, lazada: 11000000 },
      { date: '04/12', offline: 61000000, online: 38000000, shopee: 25000000, lazada: 12000000 },
      { date: '05/12', offline: 55000000, online: 42000000, shopee: 28000000, lazada: 14000000 },
      { date: '06/12', offline: 68000000, online: 45000000, shopee: 31000000, lazada: 16000000 },
      { date: '07/12', offline: 72000000, online: 48000000, shopee: 33000000, lazada: 18000000 }
    ],
    channelPerformance: [
      { channel: 'Cửa hàng', revenue: 450000000, orders: 1850, growth: 8.5, color: '#1890ff' },
      { channel: 'Website', revenue: 280000000, orders: 950, growth: 15.2, color: '#52c41a' },
      { channel: 'Shopee', revenue: 180000000, orders: 720, growth: 22.1, color: '#fa8c16' },
      { channel: 'Lazada', revenue: 120000000, orders: 327, growth: 18.7, color: '#722ed1' },
      { channel: 'Tiki', revenue: 85000000, orders: 156, growth: 12.3, color: '#eb2f96' }
    ],
    topProducts: [
      { name: 'iPhone 15 Pro Max', revenue: 280000000, quantity: 156, margin: 18.5 },
      { name: 'MacBook Air M3', revenue: 185000000, quantity: 89, margin: 22.3 },
      { name: 'AirPods Pro 2', revenue: 95000000, quantity: 287, margin: 35.8 },
      { name: 'iPad Air', revenue: 78000000, quantity: 124, margin: 19.2 },
      { name: 'Apple Watch Ultra 2', revenue: 65000000, quantity: 95, margin: 28.6 }
    ],
    customerSegments: [
      { name: 'VIP (Platinum)', value: 25, color: '#722ed1', revenue: 850000000 },
      { name: 'Trung thành (Gold)', value: 35, color: '#faad14', revenue: 720000000 },
      { name: 'Thường xuyên (Silver)', value: 25, color: '#8c8c8c', revenue: 480000000 },
      { name: 'Mới (Bronze)', value: 15, color: '#fa8c16', revenue: 280000000 }
    ],
    staffPerformance: [
      { name: 'Nguyễn Văn An', revenue: 98500000, orders: 156, commission: 2850000, efficiency: 94 },
      { name: 'Trần Thị Bình', revenue: 87200000, orders: 142, commission: 2450000, efficiency: 91 },
      { name: 'Lê Minh Cường', revenue: 79800000, orders: 135, commission: 2180000, efficiency: 88 },
      { name: 'Phạm Thị Dung', revenue: 72100000, orders: 128, commission: 1950000, efficiency: 85 },
      { name: 'Hoàng Văn Em', revenue: 68900000, orders: 118, commission: 1820000, efficiency: 83 }
    ],
    aiInsights: [
      {
        type: 'forecast',
        title: 'Dự báo doanh thu',
        message: 'Dự kiến doanh thu tuần tới sẽ tăng 8.5% so với tuần này',
        confidence: 87,
        icon: <RobotOutlined />,
        color: 'blue'
      },
      {
        type: 'inventory',
        title: 'Cảnh báo tồn kho',
        message: 'iPhone 15 Pro Max sắp hết hàng (còn 12 chiếc), nên nhập thêm 50 chiếc',
        confidence: 95,
        icon: <BellOutlined />,
        color: 'orange'
      },
      {
        type: 'pricing',
        title: 'Tối ưu giá bán',
        message: 'Nên giảm giá AirPods Pro 2 xuống 5.8M để tăng 15% doanh số',
        confidence: 78,
        icon: <DollarOutlined />,
        color: 'green'
      }
    ]
  });

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData({
        currentSales: Math.floor(Math.random() * 5000000) + 15000000,
        activeUsers: Math.floor(Math.random() * 50) + 120,
        onlineOrders: Math.floor(Math.random() * 10) + 25,
        lastUpdate: new Date().toLocaleTimeString('vi-VN')
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const renderTrend = (growth) => {
    const isPositive = growth >= 0;
    return (
      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
        {isPositive ? <RiseOutlined /> : <FallOutlined />}
        <span className="ml-1">{Math.abs(growth)}%</span>
      </span>
    );
  };

  return (
    <div className="analytics-dashboard space-y-6">
      {/* Header với filters */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold m-0">📊 Business Intelligence Dashboard</h1>
            <p className="text-gray-600 m-0">Phân tích toàn diện hiệu suất kinh doanh</p>
          </div>
          
          <Space>
            <Select value={channelFilter} onChange={setChannelFilter} style={{ width: 150 }}>
              <Select.Option value="all">Tất cả kênh</Select.Option>
              <Select.Option value="offline">Cửa hàng</Select.Option>
              <Select.Option value="online">Online</Select.Option>
              <Select.Option value="marketplaces">Sàn TMĐT</Select.Option>
            </Select>
            
            <Select value={dateRange} onChange={setDateRange} style={{ width: 120 }}>
              <Select.Option value="week">7 ngày</Select.Option>
              <Select.Option value="month">30 ngày</Select.Option>
              <Select.Option value="quarter">90 ngày</Select.Option>
            </Select>
            
            <Button type="primary" icon={<EyeOutlined />}>
              Xem báo cáo
            </Button>
          </Space>
        </div>

        {/* Real-time stats */}
        {realTimeData.currentSales && (
          <Alert
            message={
              <div className="flex justify-between items-center">
                <span>🔴 LIVE: Doanh thu hôm nay: {formatCurrency(realTimeData.currentSales)}</span>
                <span>👥 {realTimeData.activeUsers} người đang online</span>
                <span>📦 {realTimeData.onlineOrders} đơn hàng mới</span>
                <span className="text-xs text-gray-500">Cập nhật: {realTimeData.lastUpdate}</span>
              </div>
            }
            type="info"
            showIcon={false}
            className="mb-4"
          />
        )}
      </Card>

      {/* KPI Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={dashboardData.overview.totalRevenue}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined className="text-green-600" />}
              suffix={renderTrend(dashboardData.overview.revenueGrowth)}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={dashboardData.overview.totalOrders}
              prefix={<ShoppingCartOutlined className="text-blue-600" />}
              suffix={renderTrend(dashboardData.overview.ordersGrowth)}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách hàng"
              value={dashboardData.overview.totalCustomers}
              prefix={<UserOutlined className="text-purple-600" />}
              suffix={renderTrend(dashboardData.overview.customersGrowth)}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Giá trị đơn TB"
              value={dashboardData.overview.avgOrderValue}
              formatter={(value) => formatCurrency(value)}
              prefix={<TrophyOutlined className="text-orange-600" />}
              suffix={renderTrend(dashboardData.overview.aovGrowth)}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]}>
        {/* Revenue Trend */}
        <Col xs={24} lg={16}>
          <Card title="📈 Xu hướng doanh thu theo kênh" className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${(value/1000000).toFixed(0)}M`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Ngày ${label}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="offline" 
                  stackId="1" 
                  stroke="#1890ff" 
                  fill="#1890ff" 
                  name="Cửa hàng"
                />
                <Area 
                  type="monotone" 
                  dataKey="online" 
                  stackId="1" 
                  stroke="#52c41a" 
                  fill="#52c41a" 
                  name="Website"
                />
                <Area 
                  type="monotone" 
                  dataKey="shopee" 
                  stackId="1" 
                  stroke="#fa8c16" 
                  fill="#fa8c16" 
                  name="Shopee"
                />
                <Area 
                  type="monotone" 
                  dataKey="lazada" 
                  stackId="1" 
                  stroke="#722ed1" 
                  fill="#722ed1" 
                  name="Lazada"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Customer Segments */}
        <Col xs={24} lg={8}>
          <Card title="👥 Phân khúc khách hàng" className="h-96">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={dashboardData.customerSegments}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}%`}
                >
                  {dashboardData.customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center text-sm text-gray-600">
              Phân tích dựa trên RFM Model + AI
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Channel Performance */}
        <Col xs={24} lg={12}>
          <Card title="🌐 Hiệu suất theo kênh bán hàng">
            <div className="space-y-4">
              {dashboardData.channelPerformance.map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: channel.color }}
                    ></div>
                    <div>
                      <div className="font-semibold">{channel.channel}</div>
                      <div className="text-sm text-gray-600">{channel.orders} đơn hàng</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(channel.revenue)}
                    </div>
                    <div className="text-sm">
                      {renderTrend(channel.growth)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Top Products */}
        <Col xs={24} lg={12}>
          <Card title="🏆 Top sản phẩm bán chạy">
            <div className="space-y-3">
              {dashboardData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        {product.quantity} cái • Margin {product.margin}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* AI Insights */}
      <Card title={
        <div className="flex items-center">
          <RobotOutlined className="mr-2 text-blue-600" />
          <span>🤖 Thông tin thông minh từ AI</span>
        </div>
      }>
        <Row gutter={[16, 16]}>
          {dashboardData.aiInsights.map((insight, index) => (
            <Col xs={24} md={8} key={index}>
              <Card 
                size="small" 
                className={`border-l-4 border-l-${insight.color}-500`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`text-${insight.color}-600`}>
                        {insight.icon}
                      </span>
                      <span className="font-semibold">{insight.title}</span>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {insight.confidence}% tin cậy
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 m-0">{insight.message}</p>
                  <Button type="link" size="small" className="p-0">
                    Xem chi tiết →
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Staff Performance */}
      <Card title="👨‍💼 Hiệu suất nhân viên" extra={<Button type="link">Xem chi tiết</Button>}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboardData.staffPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${(value/1000000).toFixed(0)}M`} />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'revenue') return [formatCurrency(value), 'Doanh thu'];
                if (name === 'commission') return [formatCurrency(value), 'Hoa hồng'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#1890ff" name="Doanh thu" />
            <Bar dataKey="commission" fill="#52c41a" name="Hoa hồng" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;