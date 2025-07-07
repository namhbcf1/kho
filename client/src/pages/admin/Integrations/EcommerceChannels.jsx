// =====================================================
// 🌐 TÍCH HỢP SÀN TMĐT - UNIFIED COMMERCE LAYER
// =====================================================

// pages/admin/Integrations/EcommerceChannels.jsx - Quản lý tích hợp sàn TMĐT
import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Button, Switch, Badge, Progress, Table, 
  Modal, Form, Input, Select, message, Tabs, Alert, Statistic,
  Tag, Tooltip, Space, Timeline, Divider 
} from 'antd';
import {
  ShopOutlined,
  SyncOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ApiOutlined,
  GlobalOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TrendingUpOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;

const EcommerceChannels = () => {
  const [loading, setLoading] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [syncStatus, setSyncStatus] = useState({});

  // Mock data cho các sàn TMĐT
  const [channels, setChannels] = useState([
    {
      id: 'shopee',
      name: 'Shopee',
      logo: '🛒',
      description: 'Sàn thương mại điện tử hàng đầu Đông Nam Á',
      status: 'connected',
      isActive: true,
      lastSync: '2024-12-15 14:30:00',
      syncInterval: 'realtime',
      stats: {
        totalProducts: 156,
        syncedProducts: 156,
        orders: 89,
        revenue: 450000000,
        ordersPending: 3
      },
      credentials: {
        shopId: '12345678',
        partnerId: 'PARTNER_123',
        secretKey: '***hidden***'
      },
      features: {
        productSync: true,
        orderSync: true,
        inventorySync: true,
        priceSync: true,
        promotionSync: false
      },
      health: 95
    },
    {
      id: 'lazada',
      name: 'Lazada',
      logo: '🦎',
      description: 'Sàn thương mại điện tử của Alibaba tại Đông Nam Á',
      status: 'connected',
      isActive: true,
      lastSync: '2024-12-15 14:28:00',
      syncInterval: '15min',
      stats: {
        totalProducts: 145,
        syncedProducts: 142,
        orders: 67,
        revenue: 320000000,
        ordersPending: 2
      },
      credentials: {
        appKey: 'APP_KEY_123',
        appSecret: '***hidden***',
        accessToken: '***hidden***'
      },
      features: {
        productSync: true,
        orderSync: true,
        inventorySync: true,
        priceSync: true,
        promotionSync: true
      },
      health: 92
    },
    {
      id: 'tiki',
      name: 'Tiki',
      logo: '🎯',
      description: 'Sàn thương mại điện tử hàng đầu Việt Nam',
      status: 'connected',
      isActive: false,
      lastSync: '2024-12-15 10:15:00',
      syncInterval: '30min',
      stats: {
        totalProducts: 134,
        syncedProducts: 128,
        orders: 45,
        revenue: 180000000,
        ordersPending: 1
      },
      credentials: {
        clientId: 'CLIENT_123',
        clientSecret: '***hidden***'
      },
      features: {
        productSync: true,
        orderSync: true,
        inventorySync: false,
        priceSync: true,
        promotionSync: false
      },
      health: 78
    },
    {
      id: 'tiktok_shop',
      name: 'TikTok Shop',
      logo: '🎵',
      description: 'Nền tảng bán hàng trên TikTok',
      status: 'disconnected',
      isActive: false,
      lastSync: null,
      syncInterval: null,
      stats: {
        totalProducts: 0,
        syncedProducts: 0,
        orders: 0,
        revenue: 0,
        ordersPending: 0
      },
      credentials: null,
      features: {
        productSync: false,
        orderSync: false,
        inventorySync: false,
        priceSync: false,
        promotionSync: false
      },
      health: 0
    }
  ]);

  const [unifiedStats, setUnifiedStats] = useState({
    totalRevenue: 950000000,
    totalOrders: 201,
    syncAccuracy: 96.5,
    avgSyncTime: 2.3,
    errorRate: 0.8
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      time: '14:35',
      action: 'Đồng bộ tồn kho',
      channel: 'Shopee',
      status: 'success',
      details: '156 sản phẩm được cập nhật'
    },
    {
      time: '14:32',
      action: 'Đơn hàng mới',
      channel: 'Lazada',
      status: 'success',
      details: 'Đơn #LZ789456 - 2,500,000đ'
    },
    {
      time: '14:28',
      action: 'Cập nhật giá',
      channel: 'Shopee',
      status: 'success',
      details: '23 sản phẩm được điều chỉnh giá'
    },
    {
      time: '14:15',
      action: 'Lỗi đồng bộ',
      channel: 'Tiki',
      status: 'error',
      details: 'API timeout - retry sau 5 phút'
    }
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'connected': return 'green';
      case 'warning': return 'orange';
      case 'disconnected': return 'red';
      default: return 'gray';
    }
  };

  const getHealthColor = (health) => {
    if (health >= 90) return '#52c41a';
    if (health >= 70) return '#faad14';
    return '#f5222d';
  };

  const handleChannelToggle = async (channelId, isActive) => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, isActive, status: isActive ? 'connected' : 'disconnected' }
          : channel
      ));
      
      message.success(`${isActive ? 'Kích hoạt' : 'Tạm dừng'} kênh thành công`);
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
    setLoading(false);
  };

  const handleSyncChannel = async (channelId) => {
    setLoading(true);
    setSyncStatus({ ...syncStatus, [channelId]: 'syncing' });
    
    try {
      // Mock sync process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, lastSync: new Date().toISOString() }
          : channel
      ));
      
      setSyncStatus({ ...syncStatus, [channelId]: 'success' });
      message.success('Đồng bộ thành công');
      
      // Reset sync status after 2 seconds
      setTimeout(() => {
        setSyncStatus({ ...syncStatus, [channelId]: null });
      }, 2000);
      
    } catch (error) {
      setSyncStatus({ ...syncStatus, [channelId]: 'error' });
      message.error('Lỗi đồng bộ');
    }
    setLoading(false);
  };

  const handleConfigChannel = (channel) => {
    setSelectedChannel(channel);
    setConfigModalVisible(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const columns = [
    {
      title: 'Kênh',
      key: 'channel',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{record.logo}</div>
          <div>
            <div className="font-semibold">{record.name}</div>
            <div className="text-sm text-gray-500">{record.description}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <div className="space-y-2">
          <Badge 
            status={getStatusColor(record.status)} 
            text={
              record.status === 'connected' ? 'Đã kết nối' :
              record.status === 'warning' ? 'Cảnh báo' : 'Chưa kết nối'
            }
          />
          <div>
            <Switch
              checked={record.isActive}
              onChange={(checked) => handleChannelToggle(record.id, checked)}
              size="small"
            />
            <span className="ml-2 text-sm">
              {record.isActive ? 'Hoạt động' : 'Tạm dừng'}
            </span>
          </div>
        </div>
      )
    },
    {
      title: 'Sản phẩm',
      key: 'products',
      render: (_, record) => (
        <div className="text-center">
          <div className="text-lg font-bold">
            {record.stats.syncedProducts}/{record.stats.totalProducts}
          </div>
          <Progress
            percent={(record.stats.syncedProducts / record.stats.totalProducts * 100)}
            size="small"
            showInfo={false}
          />
        </div>
      )
    },
    {
      title: 'Doanh thu',
      key: 'revenue',
      render: (_, record) => (
        <div className="text-right">
          <div className="font-bold text-green-600">
            {formatCurrency(record.stats.revenue)}
          </div>
          <div className="text-sm text-gray-500">
            {record.stats.orders} đơn hàng
          </div>
        </div>
      )
    },
    {
      title: 'Sức khỏe',
      key: 'health',
      render: (_, record) => (
        <div className="text-center">
          <Progress
            type="circle"
            percent={record.health}
            width={50}
            strokeColor={getHealthColor(record.health)}
            format={(percent) => `${percent}%`}
          />
        </div>
      )
    },
    {
      title: 'Lần sync cuối',
      key: 'lastSync',
      render: (_, record) => (
        <div className="text-center">
          <div className="text-sm">
            {record.lastSync 
              ? new Date(record.lastSync).toLocaleString('vi-VN')
              : 'Chưa đồng bộ'
            }
          </div>
          <div className="text-xs text-gray-500">
            {record.syncInterval || 'N/A'}
          </div>
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<SyncOutlined />}
            loading={syncStatus[record.id] === 'syncing'}
            onClick={() => handleSyncChannel(record.id)}
            disabled={!record.isActive}
          >
            Đồng bộ
          </Button>
          <Button
            size="small"
            icon={<SettingOutlined />}
            onClick={() => handleConfigChannel(record)}
          >
            Cấu hình
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="ecommerce-channels space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white border-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white m-0">
              <GlobalOutlined className="mr-2" />
              🌐 Tích hợp Sàn TMĐT
            </h1>
            <p className="text-green-100 m-0">
              Unified Commerce - Quản lý tất cả kênh bán hàng từ một nơi
            </p>
          </div>
          
          <Space>
            <Button 
              icon={<PlusOutlined />}
              onClick={() => setConfigModalVisible(true)}
            >
              Thêm kênh mới
            </Button>
            <Button 
              type="primary" 
              icon={<SyncOutlined />}
              onClick={() => {
                channels.forEach(channel => {
                  if (channel.isActive) {
                    handleSyncChannel(channel.id);
                  }
                });
              }}
            >
              Đồng bộ tất cả
            </Button>
          </Space>
        </div>
      </Card>

      {/* Quick Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={unifiedStats.totalRevenue}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined className="text-green-600" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={unifiedStats.totalOrders}
              prefix={<ShoppingCartOutlined className="text-blue-600" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Độ chính xác sync"
              value={unifiedStats.syncAccuracy}
              suffix="%"
              prefix={<CheckCircleOutlined className="text-green-600" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Thời gian sync TB"
              value={unifiedStats.avgSyncTime}
              suffix="s"
              prefix={<ClockCircleOutlined className="text-orange-600" />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Channel Cards */}
        <Col xs={24} lg={16}>
          <Card title="📱 Danh sách kênh bán hàng">
            <Table
              dataSource={channels}
              columns={columns}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1000 }}
            />
          </Card>
        </Col>

        {/* Activity Timeline */}
        <Col xs={24} lg={8}>
          <Card title="⚡ Hoạt động gần đây" className="h-fit">
            <Timeline>
              {recentActivity.map((activity, index) => (
                <Timeline.Item
                  key={index}
                  color={activity.status === 'success' ? 'green' : 'red'}
                  dot={
                    activity.status === 'success' ? 
                    <CheckCircleOutlined /> : 
                    <ExclamationCircleOutlined />
                  }
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{activity.action}</span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                    <div className="text-sm">
                      <Tag size="small">{activity.channel}</Tag>
                      <span className="ml-2">{activity.details}</span>
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* Detailed Analytics */}
      <Tabs defaultActiveKey="overview" size="large">
        <TabPane tab="📊 Tổng quan" key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="💰 Doanh thu theo kênh">
                <div className="space-y-4">
                  {channels.filter(c => c.status === 'connected').map(channel => (
                    <div key={channel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{channel.logo}</span>
                        <div>
                          <div className="font-semibold">{channel.name}</div>
                          <div className="text-sm text-gray-600">
                            {channel.stats.orders} đơn hàng
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {formatCurrency(channel.stats.revenue)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {((channel.stats.revenue / unifiedStats.totalRevenue) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="🔄 Trạng thái đồng bộ">
                <div className="space-y-4">
                  {channels.map(channel => (
                    <div key={channel.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center space-x-2">
                          <span>{channel.logo}</span>
                          <span className="font-semibold">{channel.name}</span>
                        </span>
                        <Badge 
                          status={getStatusColor(channel.status)} 
                          text={`${channel.health}%`}
                        />
                      </div>
                      <Progress 
                        percent={channel.health} 
                        strokeColor={getHealthColor(channel.health)}
                        size="small"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Sản phẩm: {channel.stats.syncedProducts}/{channel.stats.totalProducts}</span>
                        <span>Sync: {channel.syncInterval || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="⚙️ Cấu hình" key="config">
          <Alert
            message="Unified Commerce Layer"
            description="Hệ thống này sử dụng kiến trúc Unified Commerce để đảm bảo dữ liệu đồng bộ theo thời gian thực giữa tất cả các kênh bán hàng."
            type="info"
            showIcon
            className="mb-4"
          />

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="🔧 Cài đặt chung">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Đồng bộ tự động</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cảnh báo lỗi đồng bộ</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Backup dữ liệu</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Ghi log hoạt động</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="📝 API Endpoints">
                <div className="space-y-3 text-sm font-mono">
                  <div className="p-2 bg-gray-100 rounded">
                    <div className="text-blue-600">Shopee API:</div>
                    <div>https://partner.shopeemobile.com/api/v2/</div>
                  </div>
                  <div className="p-2 bg-gray-100 rounded">
                    <div className="text-orange-600">Lazada API:</div>
                    <div>https://api.lazada.vn/rest/</div>
                  </div>
                  <div className="p-2 bg-gray-100 rounded">
                    <div className="text-purple-600">Tiki API:</div>
                    <div>https://api.tiki.vn/integration/v2/</div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="📈 Analytics" key="analytics">
          <Card title="📊 Phân tích hiệu suất kênh">
            <Alert
              message="🤖 AI Insights"
              description="Shopee đang có xu hướng tăng trưởng mạnh (+22% so với tháng trước). Nên tăng cường đầu tư marketing trên kênh này."
              type="success"
              showIcon
              className="mb-4"
            />
            
            <div className="text-center py-8 text-gray-500">
              <TrendingUpOutlined style={{ fontSize: '48px' }} />
              <div className="mt-4">Analytics dashboard sẽ được phát triển ở phiên bản tiếp theo</div>
              <div className="text-sm">Hiện tại có thể xem báo cáo cơ bản ở tab Tổng quan</div>
            </div>
          </Card>
        </TabPane>
      </Tabs>

      {/* Configuration Modal */}
      <Modal
        title={`⚙️ Cấu hình ${selectedChannel?.name || 'kênh mới'}`}
        open={configModalVisible}
        onCancel={() => {
          setConfigModalVisible(false);
          setSelectedChannel(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => setConfigModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="test" type="default">
            Test kết nối
          </Button>,
          <Button key="save" type="primary">
            Lưu cấu hình
          </Button>
        ]}
        width={600}
      >
        {selectedChannel && (
          <Form layout="vertical">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{selectedChannel.logo}</div>
              <h3 className="font-bold">{selectedChannel.name}</h3>
            </div>

            <Divider>Thông tin xác thực</Divider>
            
            {selectedChannel.id === 'shopee' && (
              <>
                <Form.Item label="Shop ID" required>
                  <Input placeholder="Nhập Shop ID" defaultValue={selectedChannel.credentials?.shopId} />
                </Form.Item>
                <Form.Item label="Partner ID" required>
                  <Input placeholder="Nhập Partner ID" defaultValue={selectedChannel.credentials?.partnerId} />
                </Form.Item>
                <Form.Item label="Secret Key" required>
                  <Input.Password placeholder="Nhập Secret Key" />
                </Form.Item>
              </>
            )}

            {selectedChannel.id === 'lazada' && (
              <>
                <Form.Item label="App Key" required>
                  <Input placeholder="Nhập App Key" defaultValue={selectedChannel.credentials?.appKey} />
                </Form.Item>
                <Form.Item label="App Secret" required>
                  <Input.Password placeholder="Nhập App Secret" />
                </Form.Item>
                <Form.Item label="Access Token" required>
                  <Input.Password placeholder="Nhập Access Token" />
                </Form.Item>
              </>
            )}

            <Divider>Cài đặt đồng bộ</Divider>

            <Form.Item label="Tần suất đồng bộ">
              <Select defaultValue={selectedChannel.syncInterval} style={{ width: '100%' }}>
                <Select.Option value="realtime">Thời gian thực</Select.Option>
                <Select.Option value="5min">5 phút</Select.Option>
                <Select.Option value="15min">15 phút</Select.Option>
                <Select.Option value="30min">30 phút</Select.Option>
                <Select.Option value="1hour">1 giờ</Select.Option>
              </Select>
            </Form.Item>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Đồng bộ sản phẩm</span>
                <Switch defaultChecked={selectedChannel.features.productSync} />
              </div>
              <div className="flex justify-between items-center">
                <span>Đồng bộ đơn hàng</span>
                <Switch defaultChecked={selectedChannel.features.orderSync} />
              </div>
              <div className="flex justify-between items-center">
                <span>Đồng bộ tồn kho</span>
                <Switch defaultChecked={selectedChannel.features.inventorySync} />
              </div>
              <div className="flex justify-between items-center">
                <span>Đồng bộ giá bán</span>
                <Switch defaultChecked={selectedChannel.features.priceSync} />
              </div>
              <div className="flex justify-between items-center">
                <span>Đồng bộ khuyến mãi</span>
                <Switch defaultChecked={selectedChannel.features.promotionSync} />
              </div>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default EcommerceChannels;