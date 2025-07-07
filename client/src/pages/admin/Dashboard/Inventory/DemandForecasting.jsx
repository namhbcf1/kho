// =====================================================
// 📦 TRANG DỰ BÁO NHU CẦU & TỐI ƯU KHO
// =====================================================

// pages/admin/Inventory/DemandForecasting.jsx - Trang dự báo AI
import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Select, Button, Table, Tag, Progress, Alert, 
  Statistic, Tabs, DatePicker, Space, Modal, message, Tooltip 
} from 'antd';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  RobotOutlined,
  TrendingUpOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAI } from '../../../utils/hooks/useAI';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const DemandForecasting = () => {
  const { demandService } = useAI();
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState(['all']);
  const [forecastPeriod, setForecastPeriod] = useState(30);
  const [modelType, setModelType] = useState('prophet');
  const [forecastData, setForecastData] = useState(null);
  const [configModalVisible, setConfigModalVisible] = useState(false);

  // Mock products data
  const [products] = useState([
    { id: 1, name: 'iPhone 15 Pro Max', category: 'Electronics', currentStock: 25, avgDemand: 8 },
    { id: 2, name: 'MacBook Air M3', category: 'Electronics', currentStock: 12, avgDemand: 3 },
    { id: 3, name: 'AirPods Pro 2', category: 'Accessories', currentStock: 45, avgDemand: 12 },
    { id: 4, name: 'iPad Air', category: 'Electronics', currentStock: 18, avgDemand: 5 },
    { id: 5, name: 'Apple Watch Ultra 2', category: 'Wearables', currentStock: 8, avgDemand: 4 }
  ]);

  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalProducts: 156,
      outOfStock: 8,
      lowStock: 23,
      overStock: 12,
      forecastAccuracy: 87.3
    },
    alerts: [
      {
        type: 'critical',
        productName: 'iPhone 15 Pro Max',
        message: 'Sắp hết hàng - còn 2 ngày',
        suggestedAction: 'Nhập 50 chiếc ngay',
        priority: 'high'
      },
      {
        type: 'warning',
        productName: 'iPad Pro 11"',
        message: 'Tồn kho thấp - còn 5 ngày',
        suggestedAction: 'Nhập 25 chiếc trong tuần',
        priority: 'medium'
      },
      {
        type: 'info',
        productName: 'MacBook Pro 14"',
        message: 'Nhu cầu tăng 25% so với tuần trước',
        suggestedAction: 'Xem xét tăng giá 3%',
        priority: 'low'
      }
    ],
    recommendations: [
      {
        type: 'reorder',
        productId: 1,
        productName: 'iPhone 15 Pro Max',
        currentStock: 25,
        suggestedOrder: 50,
        confidence: 94,
        reasoning: 'Dựa trên xu hướng mua sắm cuối năm và lịch sử bán hàng'
      },
      {
        type: 'reduce',
        productId: 3,
        productName: 'Magic Keyboard',
        currentStock: 45,
        suggestedReduction: 15,
        confidence: 78,
        reasoning: 'Nhu cầu giảm 20% trong 2 tháng tới'
      }
    ]
  });

  useEffect(() => {
    loadForecastData();
  }, [selectedProducts, forecastPeriod, modelType]);

  const loadForecastData = async () => {
    setLoading(true);
    try {
      if (selectedProducts.includes('all')) {
        // Load forecast cho tất cả sản phẩm
        const forecasts = await demandService.forecastMultipleProducts(
          products.map(p => p.id),
          { timeframe: forecastPeriod, model: modelType }
        );
        
        // Aggregate data
        const aggregatedForecast = aggregateForecasts(forecasts);
        setForecastData(aggregatedForecast);
      } else {
        // Load forecast cho sản phẩm cụ thể
        const productForecasts = await Promise.all(
          selectedProducts.map(id => 
            demandService.forecastProductDemand(id, { 
              timeframe: forecastPeriod, 
              model: modelType 
            })
          )
        );
        setForecastData(productForecasts);
      }
    } catch (error) {
      message.error('Lỗi khi tải dự báo');
    }
    setLoading(false);
  };

  const aggregateForecasts = (forecasts) => {
    // Mock aggregation logic
    const dates = [];
    const currentDate = new Date();
    
    for (let i = 1; i <= forecastPeriod; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      
      dates.push({
        date: date.toISOString().split('T')[0],
        predicted: Math.floor(Math.random() * 50) + 20,
        lower: Math.floor(Math.random() * 30) + 10,
        upper: Math.floor(Math.random() * 70) + 40,
        confidence: 0.85
      });
    }

    return {
      success: true,
      forecast: dates,
      metrics: {
        mape: 15.2,
        rmse: 8.7,
        mae: 6.3,
        r2: 0.87
      },
      recommendations: [
        'Tăng cường nhập hàng trong 2 tuần tới',
        'Xem xét chương trình khuyến mãi cho sản phẩm tồn kho cao'
      ]
    };
  };

  const getAlertColor = (type) => {
    switch(type) {
      case 'critical': return 'red';
      case 'warning': return 'orange';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'high': return <WarningOutlined className="text-red-500" />;
      case 'medium': return <InfoCircleOutlined className="text-orange-500" />;
      case 'low': return <CheckCircleOutlined className="text-blue-500" />;
      default: return null;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const inventoryColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-gray-500">{record.category}</div>
        </div>
      )
    },
    {
      title: 'Tồn kho hiện tại',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock, record) => {
        const daysLeft = Math.floor(stock / record.avgDemand);
        const color = daysLeft <= 3 ? 'red' : daysLeft <= 7 ? 'orange' : 'green';
        
        return (
          <div>
            <div className="font-semibold">{stock} cái</div>
            <Tag color={color} size="small">
              Còn {daysLeft} ngày
            </Tag>
          </div>
        );
      }
    },
    {
      title: 'Nhu cầu TB/ngày',
      dataIndex: 'avgDemand',
      key: 'avgDemand',
      render: (demand) => `${demand} cái/ngày`
    },
    {
      title: 'Dự báo 7 ngày',
      key: 'forecast7d',
      render: (_, record) => {
        const forecast = record.avgDemand * 7;
        const trend = Math.floor(Math.random() * 20) - 10; // Random trend
        
        return (
          <div>
            <div className="font-semibold">{forecast} cái</div>
            <div className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend}% so với tuần trước
            </div>
          </div>
        );
      }
    },
    {
      title: 'Gợi ý',
      key: 'suggestion',
      render: (_, record) => {
        const daysLeft = Math.floor(record.currentStock / record.avgDemand);
        
        if (daysLeft <= 3) {
          return <Tag color="red">Nhập gấp</Tag>;
        } else if (daysLeft <= 7) {
          return <Tag color="orange">Cần nhập</Tag>;
        } else if (daysLeft > 30) {
          return <Tag color="blue">Tồn kho cao</Tag>;
        } else {
          return <Tag color="green">Ổn định</Tag>;
        }
      }
    }
  ];

  return (
    <div className="demand-forecasting space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white m-0">
              <RobotOutlined className="mr-2" />
              🤖 Dự báo Nhu cầu AI
            </h1>
            <p className="text-blue-100 m-0">
              Tối ưu tồn kho và dự báo nhu cầu bằng Machine Learning
            </p>
          </div>
          
          <Space>
            <Button 
              icon={<SettingOutlined />}
              onClick={() => setConfigModalVisible(true)}
            >
              Cấu hình
            </Button>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={loadForecastData}
            >
              Làm mới dự báo
            </Button>
          </Space>
        </div>
      </Card>

      {/* Quick Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={dashboardData.overview.totalProducts}
              prefix={<ShoppingCartOutlined className="text-blue-600" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Sắp hết hàng"
              value={dashboardData.overview.outOfStock}
              valueStyle={{ color: '#f5222d' }}
              prefix={<WarningOutlined className="text-red-600" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tồn kho thấp"
              value={dashboardData.overview.lowStock}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<InfoCircleOutlined className="text-orange-600" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Độ chính xác AI"
              value={dashboardData.overview.forecastAccuracy}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<TrendingUpOutlined className="text-green-600" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card title="🎛️ Điều khiển dự báo">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sản phẩm:</label>
              <Select
                mode="multiple"
                value={selectedProducts}
                onChange={setSelectedProducts}
                style={{ width: '100%' }}
                placeholder="Chọn sản phẩm"
              >
                <Select.Option value="all">Tất cả sản phẩm</Select.Option>
                {products.map(product => (
                  <Select.Option key={product.id} value={product.id}>
                    {product.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={8} md={4}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Thời gian dự báo:</label>
              <Select value={forecastPeriod} onChange={setForecastPeriod} style={{ width: '100%' }}>
                <Select.Option value={7}>7 ngày</Select.Option>
                <Select.Option value={14}>14 ngày</Select.Option>
                <Select.Option value={30}>30 ngày</Select.Option>
                <Select.Option value={60}>60 ngày</Select.Option>
                <Select.Option value={90}>90 ngày</Select.Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={8} md={4}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mô hình AI:</label>
              <Select value={modelType} onChange={setModelType} style={{ width: '100%' }}>
                <Select.Option value="prophet">Prophet (Khuyến nghị)</Select.Option>
                <Select.Option value="arima">ARIMA (Chính xác cao)</Select.Option>
                <Select.Option value="lstm">LSTM (Deep Learning)</Select.Option>
                <Select.Option value="ensemble">Ensemble (Tổng hợp)</Select.Option>
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={24} md={6}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Khoảng thời gian:</label>
              <RangePicker style={{ width: '100%' }} />
            </div>
          </Col>
          
          <Col xs={24} sm={24} md={4}>
            <div className="space-y-2">
              <label className="text-sm font-medium invisible">Action:</label>
              <div className="flex space-x-2">
                <Button type="primary" loading={loading} onClick={loadForecastData}>
                  Dự báo
                </Button>
                <Button icon={<DownloadOutlined />}>
                  Xuất
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Alerts & Recommendations */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="🚨 Cảnh báo tồn kho" className="h-96" bodyStyle={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
            <div className="space-y-3">
              {dashboardData.alerts.map((alert, index) => (
                <Alert
                  key={index}
                  type={alert.type}
                  showIcon
                  icon={getPriorityIcon(alert.priority)}
                  message={
                    <div>
                      <div className="font-semibold">{alert.productName}</div>
                      <div className="text-sm">{alert.message}</div>
                    </div>
                  }
                  description={
                    <div className="mt-2">
                      <div className="text-sm text-gray-600 mb-2">
                        Gợi ý: {alert.suggestedAction}
                      </div>
                      <Button size="small" type="primary">
                        Thực hiện
                      </Button>
                    </div>
                  }
                  className="border-l-4"
                  style={{ borderLeftColor: getAlertColor(alert.type) === 'red' ? '#f5222d' : getAlertColor(alert.type) === 'orange' ? '#fa8c16' : '#1890ff' }}
                />
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="💡 Gợi ý tối ưu" className="h-96" bodyStyle={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
            <div className="space-y-4">
              {dashboardData.recommendations.map((rec, index) => (
                <Card key={index} size="small" className="border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold m-0">{rec.productName}</h4>
                        <Tag color={rec.type === 'reorder' ? 'green' : 'orange'}>
                          {rec.type === 'reorder' ? 'Nhập hàng' : 'Giảm tồn kho'}
                        </Tag>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Độ tin cậy</div>
                        <div className="font-bold text-blue-600">{rec.confidence}%</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Tồn kho hiện tại:</div>
                        <div className="font-semibold">{rec.currentStock} cái</div>
                      </div>
                      <div>
                        <div className="text-gray-500">
                          {rec.type === 'reorder' ? 'Nên nhập:' : 'Nên giảm:'}
                        </div>
                        <div className="font-semibold text-green-600">
                          {rec.suggestedOrder || rec.suggestedReduction} cái
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-2 rounded text-xs text-gray-600">
                      💭 {rec.reasoning}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="small" type="primary">
                        Chấp nhận
                      </Button>
                      <Button size="small">
                        Tùy chỉnh
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts & Analytics */}
      <Tabs defaultActiveKey="forecast" size="large">
        <TabPane tab="📈 Biểu đồ Dự báo" key="forecast">
          <Card>
            {forecastData && forecastData.forecast ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold m-0">
                    Dự báo nhu cầu {forecastPeriod} ngày tới
                  </h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <div>
                      <span className="text-gray-500">Mô hình: </span>
                      <Tag color="blue">{modelType.toUpperCase()}</Tag>
                    </div>
                    <div>
                      <span className="text-gray-500">Độ chính xác: </span>
                      <span className="font-semibold text-green-600">
                        {(forecastData.metrics.r2 * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={forecastData.forecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <RechartsTooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString('vi-VN')}
                      formatter={(value, name) => [
                        `${value} cái`,
                        name === 'predicted' ? 'Dự báo' : 
                        name === 'upper' ? 'Cao nhất' : 'Thấp nhất'
                      ]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stackId="1"
                      stroke="#91d5ff"
                      fill="#91d5ff"
                      fillOpacity={0.3}
                      name="Khoảng tin cậy"
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stackId="1"
                      stroke="#91d5ff"
                      fill="#ffffff"
                      fillOpacity={1}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#1890ff"
                      strokeWidth={3}
                      dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                      name="Dự báo"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                
                {/* Metrics */}
                <Row gutter={[16, 16]} className="mt-4">
                  <Col xs={12} sm={6}>
                    <Card size="small" className="text-center">
                      <Statistic
                        title="MAPE"
                        value={forecastData.metrics.mape}
                        suffix="%"
                        valueStyle={{ color: forecastData.metrics.mape < 20 ? '#52c41a' : '#fa8c16' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Card size="small" className="text-center">
                      <Statistic
                        title="R²"
                        value={(forecastData.metrics.r2 * 100).toFixed(1)}
                        suffix="%"
                        valueStyle={{ color: forecastData.metrics.r2 > 0.8 ? '#52c41a' : '#fa8c16' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Card size="small" className="text-center">
                      <Statistic
                        title="MAE"
                        value={forecastData.metrics.mae}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Card size="small" className="text-center">
                      <Statistic
                        title="RMSE"
                        value={forecastData.metrics.rmse}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </div>
            ) : (
              <div className="text-center py-8">
                <RobotOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <div className="mt-4 text-gray-500">
                  Chọn sản phẩm và nhấn "Dự báo" để xem kết quả
                </div>
              </div>
            )}
          </Card>
        </TabPane>

        <TabPane tab="📊 Phân tích Tồn kho" key="inventory">
          <Card>
            <Table
              dataSource={products}
              columns={inventoryColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
              className="inventory-table"
            />
          </Card>
        </TabPane>

        <TabPane tab="🎯 Tối ưu hóa" key="optimization">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="📦 Phân bố tồn kho">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Ổn định', value: 60, color: '#52c41a' },
                        { name: 'Tồn kho thấp', value: 25, color: '#fa8c16' },
                        { name: 'Sắp hết hàng', value: 10, color: '#f5222d' },
                        { name: 'Tồn kho cao', value: 5, color: '#1890ff' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {[
                        { color: '#52c41a' },
                        { color: '#fa8c16' },
                        { color: '#f5222d' },
                        { color: '#1890ff' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="📈 Xu hướng nhập hàng">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { week: 'Tuần 1', planned: 45, actual: 42, optimal: 48 },
                    { week: 'Tuần 2', planned: 52, actual: 55, optimal: 50 },
                    { week: 'Tuần 3', planned: 38, actual: 35, optimal: 40 },
                    { week: 'Tuần 4', planned: 61, actual: 58, optimal: 60 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="planned" fill="#1890ff" name="Kế hoạch" />
                    <Bar dataKey="actual" fill="#52c41a" name="Thực tế" />
                    <Bar dataKey="optimal" fill="#fa8c16" name="AI gợi ý" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Card title="🎯 Tối ưu hóa thông minh" className="mt-4">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card size="small" className="text-center bg-blue-50">
                  <div className="space-y-2">
                    <div className="text-2xl">💰</div>
                    <div className="font-semibold">Tiết kiệm vốn</div>
                    <div className="text-2xl font-bold text-blue-600">2.3 tỷ</div>
                    <div className="text-sm text-gray-600">
                      Bằng cách tối ưu tồn kho
                    </div>
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card size="small" className="text-center bg-green-50">
                  <div className="space-y-2">
                    <div className="text-2xl">📈</div>
                    <div className="font-semibold">Tăng doanh thu</div>
                    <div className="text-2xl font-bold text-green-600">15%</div>
                    <div className="text-sm text-gray-600">
                      Nhờ giảm hết hàng
                    </div>
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card size="small" className="text-center bg-orange-50">
                  <div className="space-y-2">
                    <div className="text-2xl">⚡</div>
                    <div className="font-semibold">Cải thiện hiệu suất</div>
                    <div className="text-2xl font-bold text-orange-600">87%</div>
                    <div className="text-sm text-gray-600">
                      Độ chính xác dự báo
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* Configuration Modal */}
      <Modal
        title="⚙️ Cấu hình dự báo AI"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfigModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="save" type="primary">
            Lưu cấu hình
          </Button>
        ]}
        width={600}
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Cài đặt mô hình AI</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ngưỡng cảnh báo tồn kho thấp:
                </label>
                <Select defaultValue={7} style={{ width: '100%' }}>
                  <Select.Option value={3}>3 ngày</Select.Option>
                  <Select.Option value={5}>5 ngày</Select.Option>
                  <Select.Option value={7}>7 ngày</Select.Option>
                  <Select.Option value={10}>10 ngày</Select.Option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ngưỡng cảnh báo tồn kho cao:
                </label>
                <Select defaultValue={60} style={{ width: '100%' }}>
                  <Select.Option value={30}>30 ngày</Select.Option>
                  <Select.Option value={45}>45 ngày</Select.Option>
                  <Select.Option value={60}>60 ngày</Select.Option>
                  <Select.Option value={90}>90 ngày</Select.Option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Độ tin cậy tối thiểu cho gợi ý:
                </label>
                <Select defaultValue={75} style={{ width: '100%' }}>
                  <Select.Option value={50}>50%</Select.Option>
                  <Select.Option value={65}>65%</Select.Option>
                  <Select.Option value={75}>75%</Select.Option>
                  <Select.Option value={85}>85%</Select.Option>
                </Select>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Tự động hóa</h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                Tự động gửi email cảnh báo
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                Tự động tạo đơn nhập hàng khi tin cậy > 90%
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Tự động điều chỉnh giá theo gợi ý AI
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DemandForecasting;