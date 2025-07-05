import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  message,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  DatePicker,
  Popconfirm,
  Drawer,
  Tabs,
  Empty,
  Typography,
  Descriptions,
  Timeline
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CrownOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  EyeOutlined
} from '@ant-design/icons';
import api, { customersAPI, ordersAPI, formatCurrency, formatDate, productsAPI } from '../services/api';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailDrawerVisible, setIsDetailDrawerVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    regular: 0,
    vip: 0,
    wholesale: 0
  });
  const [customerPurchaseHistory, setCustomerPurchaseHistory] = useState([]);
  const [purchaseHistoryLoading, setPurchaseHistoryLoading] = useState(false);
  const [orderSerials, setOrderSerials] = useState({});
  const [form] = Form.useForm();

  const customerTypes = [
    { value: 'regular', label: 'Khách thường', color: 'default' },
    { value: 'vip', label: 'VIP', color: 'gold' },
    { value: 'wholesale', label: 'Bán sỉ', color: 'purple' }
  ];

  useEffect(() => {
    fetchCustomers();
  }, [searchText, filterType]);

  // ✨ AI Error Monitor Integration - Listen for auto-refresh events
  useEffect(() => {
    const handleAIRefreshCustomerList = () => {
      console.log('🤖 AI triggered customer list refresh');
      fetchCustomers();
    };

    // Listen for AI refresh customer list event
    window.addEventListener('ai-refresh-customer-list', handleAIRefreshCustomerList);

    // Cleanup event listener
    return () => {
      window.removeEventListener('ai-refresh-customer-list', handleAIRefreshCustomerList);
    };
  }, []);

  // Fetch serials for all orders in purchase history
  useEffect(() => {
    if (customerPurchaseHistory.length > 0) {
      fetchAllOrderSerials();
    }
  }, [customerPurchaseHistory]);

  const fetchAllOrderSerials = async () => {
    const serialsMap = {};
    for (const order of customerPurchaseHistory) {
      if (!order.items) continue;
      for (const item of order.items) {
        try {
          const response = await productsAPI.getSoldSerials({ product_id: item.product_id, order_id: order.id });
          if (response.data.success) {
            serialsMap[`${order.id}_${item.product_id}`] = response.data.data || [];
          } else {
            serialsMap[`${order.id}_${item.product_id}`] = [];
          }
        } catch (error) {
          serialsMap[`${order.id}_${item.product_id}`] = [];
        }
      }
    }
    setOrderSerials(serialsMap);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getAll({
        search: searchText,
        type: filterType
      });
      
      if (response.data.success) {
        setCustomers(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách khách hàng');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (customerData) => {
    const stats = {
      total: customerData.length,
      regular: customerData.filter(c => c.customer_type === 'regular').length,
      vip: customerData.filter(c => c.customer_type === 'vip').length,
      wholesale: customerData.filter(c => c.customer_type === 'wholesale').length
    };
    setStats(stats);
  };

  const showModal = (customer = null) => {
    setEditingCustomer(customer);
    setIsModalVisible(true);
    if (customer) {
      form.setFieldsValue({
        ...customer,
      });
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCustomer(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      // Remove unwanted fields from values before sending
      const { gender, birthday, city, ...customerData } = values; 

      if (editingCustomer) {
        await customersAPI.update(editingCustomer.id, customerData);
        message.success('Cập nhật khách hàng thành công');
      } else {
        await customersAPI.create(customerData);
        message.success('Tạo khách hàng thành công');
      }
      
      handleCancel();
      fetchCustomers();
    } catch (error) {
      message.error(`Lỗi khi ${editingCustomer ? 'cập nhật' : 'tạo'} khách hàng: ` + (error.response?.data?.message || error.message));
      console.error('Error saving customer:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await customersAPI.delete(id);
      message.success('Xóa khách hàng thành công');
      fetchCustomers();
    } catch (error) {
      message.error('Lỗi khi xóa khách hàng');
      console.error('Error deleting customer:', error);
    }
  };

  const showCustomerDetail = async (customer) => {
    try {
      setSelectedCustomer(customer);
        setIsDetailDrawerVisible(true);
      setPurchaseHistoryLoading(true);
      
      // Fetch customer details
      const customerResponse = await customersAPI.getById(customer.id);
      if (customerResponse.data.success) {
        setSelectedCustomer(customerResponse.data.data);
      }
      
      // 🛒 Fetch customer purchase history
      try {
        const ordersResponse = await api.get('/orders', {
          params: {
            customer_name: customer.name, // Search by customer name since orders don't have customer_id
            limit: 100
          }
        });
        
        if (ordersResponse.data.success) {
          const customerOrders = ordersResponse.data.data.orders || ordersResponse.data.data;
          // Filter orders that match this customer (by name and/or phone)
          const filteredOrders = customerOrders.filter(order => 
            (order.customer_name && order.customer_name.toLowerCase() === customer.name.toLowerCase()) ||
            (order.customer_phone && customer.phone && order.customer_phone === customer.phone)
          );
          setCustomerPurchaseHistory(filteredOrders);
        } else {
          setCustomerPurchaseHistory([]);
        }
      } catch (orderError) {
        console.error('Error fetching purchase history:', orderError);
        setCustomerPurchaseHistory([]);
      }
      
    } catch (error) {
      message.error('Lỗi khi tải thông tin khách hàng');
    } finally {
      setPurchaseHistoryLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã KH',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Thông tin khách hàng',
      key: 'customer_info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            <UserOutlined style={{ marginRight: 8 }} />
            {record.name}
          </div>
          {record.phone && (
            <div style={{ color: '#666', fontSize: '12px' }}>
              <PhoneOutlined style={{ marginRight: 4 }} />
              {record.phone}
            </div>
          )}
          {record.email && (
            <div style={{ color: '#666', fontSize: '12px' }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Loại KH',
      dataIndex: 'customer_type',
      key: 'customer_type',
      width: 120,
      render: (type) => {
        const typeConfig = customerTypes.find(t => t.value === type);
        return (
          <Tag color={typeConfig?.color} icon={type === 'vip' ? <CrownOutlined /> : null}>
            {typeConfig?.label}
          </Tag>
        );
      }
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'total_spent',
      key: 'total_spent',
      width: 120,
      render: (amount) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          {formatCurrency(amount || 0)}
        </span>
      ),
      sorter: (a, b) => (a.total_spent || 0) - (b.total_spent || 0)
    },
    {
      title: 'Số lần mua',
      dataIndex: 'visit_count',
      key: 'visit_count',
      width: 100,
      render: (count) => (
        <span>
          <ShoppingCartOutlined style={{ marginRight: 4 }} />
          {count || 0}
        </span>
      ),
      sorter: (a, b) => (a.visit_count || 0) - (b.visit_count || 0)
    },
    {
      title: 'Chiết khấu',
      dataIndex: 'discount_rate',
      key: 'discount_rate',
      width: 100,
      render: (rate) => (
        <span style={{ color: '#fa8c16' }}>
          {rate || 0}%
        </span>
      )
    },
    {
      title: 'Lần cuối mua',
      dataIndex: 'last_visit',
      key: 'last_visit',
      width: 130,
      render: (date) => date ? formatDate(date) : 'Chưa mua'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => showCustomerDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa khách hàng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button
                type="default"
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header với thống kê */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Khách thường"
              value={stats.regular}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Khách VIP"
              value={stats.vip}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Khách bán sỉ"
              value={stats.wholesale}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card title="Quản lý khách hàng">
        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="Tìm theo tên, SĐT, mã KH..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={fetchCustomers}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Lọc theo loại khách hàng"
              value={filterType}
              onChange={setFilterType}
            >
              <Option value="all">Tất cả</Option>
              {customerTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={10} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              size="large"
            >
              Thêm khách hàng
            </Button>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: customers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} khách hàng`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal thêm/sửa khách hàng */}
      <Modal
        title={editingCustomer ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên khách hàng"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nhập tên khách hàng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
              >
                <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input prefix={<MailOutlined />} placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Địa chỉ"
                name="address"
              >
                <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại khách hàng"
                name="customer_type"
                initialValue="regular"
              >
                <Select>
                  {customerTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Chiết khấu (%)"
                name="discount_rate"
                initialValue={0}
              >
                <Input type="number" min={0} max={100} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Ghi chú"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Nhập ghi chú" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={handleCancel}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingCustomer ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 🆕 Enhanced Customer Details Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserOutlined style={{ color: '#1890ff' }} />
            <span>Thông tin chi tiết khách hàng</span>
            {selectedCustomer && (
              <Tag color={customerTypes.find(t => t.value === selectedCustomer.customer_type)?.color}>
                {customerTypes.find(t => t.value === selectedCustomer.customer_type)?.label}
              </Tag>
            )}
          </div>
        }
        placement="right"
        onClose={() => {
          setIsDetailDrawerVisible(false);
          setCustomerPurchaseHistory([]);
        }}
        visible={isDetailDrawerVisible}
        width={800}
        style={{ zIndex: 1001 }}
      >
        {selectedCustomer && (
          <div>
            {/* 🆕 Enhanced Basic Information with Address */}
            <Card 
              title="📋 Thông tin cơ bản" 
              style={{ marginBottom: 16 }}
              extra={
                <Button 
                  size="small" 
                  icon={<EditOutlined />}
                  onClick={() => {
                    setIsDetailDrawerVisible(false);
                    showModal(selectedCustomer);
                  }}
                >
                  Chỉnh sửa
                </Button>
              }
            >
              <Descriptions size="small" column={2}>
                <Descriptions.Item label="Mã khách hàng" span={1}>
                  <Text strong style={{ color: '#1890ff' }}>{selectedCustomer.code}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tên khách hàng" span={1}>
                  <Text strong>{selectedCustomer.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Điện thoại" span={1}>
                  <Text copyable={!!selectedCustomer.phone}>
                    <PhoneOutlined style={{ marginRight: '4px', color: '#52c41a' }} />
                    {selectedCustomer.phone || 'Chưa có'}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Email" span={1}>
                  <Text copyable={!!selectedCustomer.email}>
                    <MailOutlined style={{ marginRight: '4px', color: '#1890ff' }} />
                    {selectedCustomer.email || 'Chưa có'}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Loại khách hàng" span={1}>
                  <Tag 
                    color={customerTypes.find(t => t.value === selectedCustomer.customer_type)?.color}
                    icon={selectedCustomer.customer_type === 'vip' ? <CrownOutlined /> : null}
                  >
                  {customerTypes.find(t => t.value === selectedCustomer.customer_type)?.label}
                </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Chiết khấu" span={1}>
                  <Text style={{ color: '#fa8c16', fontWeight: 'bold' }}>
                    {selectedCustomer.discount_rate || 0}%
                  </Text>
                </Descriptions.Item>
                
                {/* 🎯 FIX: Address moved into basic info */}
                <Descriptions.Item label="Địa chỉ" span={2}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <HomeOutlined style={{ marginTop: '4px', color: '#666' }} />
                    <Text>{selectedCustomer.address || 'Chưa có địa chỉ'}</Text>
                  </div>
                </Descriptions.Item>
                
                {selectedCustomer.notes && (
                  <Descriptions.Item label="Ghi chú" span={2}>
                    <Text type="secondary">{selectedCustomer.notes}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* 🆕 Enhanced Purchase Statistics & History with Tabs */}
            <Card style={{ marginBottom: 16 }}>
              <Tabs defaultActiveKey="stats" type="card">
                <TabPane 
                  tab={
                    <span>
                      <ShoppingCartOutlined />
                      Thống kê mua hàng
                    </span>
                  } 
                  key="stats"
                >
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Card size="small" style={{ textAlign: 'center', borderLeft: '4px solid #52c41a' }}>
                  <Statistic
                    title="Tổng chi tiêu"
                    value={selectedCustomer.total_spent || 0}
                    formatter={value => formatCurrency(value)}
                          valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                          prefix={<span style={{ fontSize: '14px' }}>💰</span>}
                  />
                      </Card>
                </Col>
                    <Col span={8}>
                      <Card size="small" style={{ textAlign: 'center', borderLeft: '4px solid #1890ff' }}>
                  <Statistic
                    title="Số lần mua"
                    value={selectedCustomer.visit_count || 0}
                    suffix="lần"
                          valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                          prefix={<span style={{ fontSize: '14px' }}>🛒</span>}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" style={{ textAlign: 'center', borderLeft: '4px solid #fa8c16' }}>
                        <Statistic
                          title="Đơn hàng"
                          value={customerPurchaseHistory.length}
                          suffix="đơn"
                          valueStyle={{ color: '#fa8c16', fontSize: '18px' }}
                          prefix={<span style={{ fontSize: '14px' }}>📦</span>}
                        />
                      </Card>
                </Col>
              </Row>
                  <div style={{ marginTop: 16, padding: '12px', background: '#f6f8fa', borderRadius: '6px' }}>
                    <Text strong>Lần cuối mua: </Text>
                    <Text style={{ color: '#52c41a' }}>
                      {selectedCustomer.last_visit ? formatDate(selectedCustomer.last_visit) : 'Chưa mua hàng'}
                    </Text>
                  </div>
                </TabPane>

                <TabPane 
                  tab={
                    <span>
                      <CalendarOutlined />
                      Lịch sử mua hàng
                      <Text style={{ 
                        marginLeft: '4px', 
                        fontSize: '11px', 
                        background: '#1890ff', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '10px' 
                      }}>
                        {customerPurchaseHistory.length}
                      </Text>
                    </span>
                  } 
                  key="history"
                >
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {purchaseHistoryLoading ? (
                      <div style={{ textAlign: 'center', padding: '40px' }}>
                        <span>Đang tải lịch sử mua hàng...</span>
                      </div>
                    ) : customerPurchaseHistory.length > 0 ? (
                      <Timeline>
                        {customerPurchaseHistory.map((order, index) => (
                          <Timeline.Item 
                            key={order.id || index}
                            dot={<ShoppingCartOutlined style={{ color: '#52c41a' }} />}
                            color="green"
                          >
                            <div style={{ padding: '8px 12px', border: '1px solid #e8f4fd', borderRadius: '8px', background: '#f6ffed' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div>
                                  <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>
                                    📦 Đơn hàng #{order.order_number || order.id}
                                  </Text>
                                  <div style={{ fontSize: '11px', color: '#666' }}>
                                    📅 {formatDate(order.created_at)}
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                                    {formatCurrency(order.total_amount)}
                                  </div>
                                  <Tag color={order.status === 'completed' ? 'green' : 'orange'} size="small">
                                    {order.status === 'completed' ? 'Hoàn thành' : order.status}
                                  </Tag>
                                </div>
                              </div>
                              
                              {/* Order Items */}
                              {order.items && order.items.length > 0 && (
                                <div style={{ marginTop: '8px', padding: '8px', background: '#fff', borderRadius: '4px' }}>
                                  <Text strong style={{ fontSize: '12px', color: '#666' }}>📋 Sản phẩm đã mua:</Text>
                                  {order.items.slice(0, 3).map((item, itemIndex) => (
                                    <div key={itemIndex} style={{ fontSize: '11px', color: '#333', marginTop: '4px', paddingLeft: '8px' }}>
                                      • {item.product_name} (x{item.quantity}) - {formatCurrency(item.subtotal)}
                                      {/* Hiển thị serials và bảo hành */}
                                      {orderSerials[`${order.id}_${item.product_id}`] && orderSerials[`${order.id}_${item.product_id}`].length > 0 && (
                                        <div style={{ marginLeft: 16, marginTop: 2 }}>
                                          {orderSerials[`${order.id}_${item.product_id}`]
                                            .slice(0, item.quantity)
                                            .map((serial, snIdx) => {
                                              let daysLeft = '?';
                                              if (serial.warranty_end_date) {
                                                const end = dayjs(serial.warranty_end_date);
                                                const now = dayjs();
                                                daysLeft = end.diff(now, 'day');
                                                if (daysLeft < 0) daysLeft = 'Hết hạn';
                                              }
                                              return (
                                                <div key={snIdx} style={{ fontSize: '11px', color: '#1890ff' }}>
                                                  SN: <b>{serial.serial_number}</b>
                                                  {serial.warranty_start_date && serial.warranty_end_date && (
                                                    <span style={{ color: '#fa8c16', marginLeft: 8 }}>
                                                      | Bảo hành: {formatDate(serial.warranty_start_date)} → {formatDate(serial.warranty_end_date)}
                                                      <span style={{ color: '#52c41a', marginLeft: 4 }}>
                                                        (Còn {daysLeft} ngày)
                                                      </span>
                                                    </span>
                                                  )}
                                                </div>
                                              );
                                            })}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {order.items.length > 3 && (
                                    <div style={{ fontSize: '11px', color: '#1890ff', fontStyle: 'italic', marginTop: '4px', paddingLeft: '8px' }}>
                                      ... và {order.items.length - 3} sản phẩm khác
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {order.notes && (
                                <div style={{ marginTop: '6px', fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                                  💬 {order.notes}
                                </div>
                              )}
                            </div>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <div>
                            <div style={{ fontSize: '16px', marginBottom: '8px' }}>🛒 Chưa có lịch sử mua hàng</div>
                            <Text type="secondary">Khách hàng này chưa thực hiện đơn hàng nào</Text>
                          </div>
                        }
                      />
                    )}
                  </div>
                </TabPane>
              </Tabs>
              </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CustomersPage; 