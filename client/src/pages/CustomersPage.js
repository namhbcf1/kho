import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Table, 
  Space,
  Typography, 
  Spin, 
  Form,
  message,
  Popconfirm,
  Tag,
  Statistic,
  Row,
  Col,
  Badge,
  Tooltip,
  Empty
} from 'antd';
import {
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  PlusOutlined
} from '@ant-design/icons';

// Import API functions
import { customersAPI, ordersAPI } from '../services/api';

// Import components
import CustomerFormModal from '../components/CustomerFormModal';
import CustomerDetailDrawer from '../components/CustomerDetailDrawer';

const { Title, Text } = Typography;
const { Search } = Input;

const CustomersPage = () => {
  // State management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  
  // Statistics
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  // Form instance
  const [form] = Form.useForm();

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter customers when search text changes
  useEffect(() => {
    if (searchText) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.phone?.includes(searchText) ||
        customer.email?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCustomers(filtered);
          } else {
      setFilteredCustomers(customers);
          }
  }, [customers, searchText]);

  // Load customers from API
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getAll({
        limit: 100,
        include_stats: true
      });
      
      if (response.data && response.data.success) {
        const customersData = response.data.data || [];
        setCustomers(customersData);
        setFilteredCustomers(customersData);
        calculateStats(customersData);
        message.success(`Đã tải ${customersData.length} khách hàng`);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      message.error('Không thể tải danh sách khách hàng');
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (customerData) => {
    const totalCustomers = customerData.length;
    const activeCustomers = customerData.filter(c => c.status === 'active').length;
    const totalOrders = customerData.reduce((sum, c) => sum + (c.total_orders || 0), 0);
    const totalRevenue = customerData.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    
    setStats({
      totalCustomers,
      activeCustomers,
      totalOrders,
      totalRevenue
      });
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Handle create customer
  const handleCreate = () => {
    setEditingCustomer(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Handle edit customer
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      notes: customer.notes
    });
    setModalVisible(true);
  };

  // Handle delete customer
  const handleDelete = async (customerId) => {
    try {
      setLoading(true);
      const response = await customersAPI.delete(customerId);
      
      if (response.data && response.data.success) {
        message.success('Đã xóa khách hàng thành công');
        loadCustomers(); // Reload list
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      message.error('Không thể xóa khách hàng');
    } finally {
      setLoading(false);
    }
  };

  // Handle view customer details
  const handleViewDetails = async (customer) => {
    try {
      setSelectedCustomer(customer);
      setDetailDrawerVisible(true);
      
      // Load customer purchase history
      const ordersResponse = await ordersAPI.getAll({
        customer_id: customer.id,
        limit: 50
      });
      
      if (ordersResponse.data && ordersResponse.data.success) {
        const customerWithHistory = {
          ...customer,
          purchaseHistory: ordersResponse.data.data || []
        };
        setSelectedCustomer(customerWithHistory);
      }
    } catch (error) {
      console.error('Error loading customer details:', error);
      message.error('Không thể tải thông tin chi tiết khách hàng');
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      let response;
      
      if (editingCustomer) {
        // Update existing customer
        response = await customersAPI.update(editingCustomer.id, values);
      } else {
        // Create new customer
        response = await customersAPI.create(values);
      }
      
      if (response.data && response.data.success) {
        message.success(editingCustomer ? 'Đã cập nhật khách hàng' : 'Đã tạo khách hàng mới');
        setModalVisible(false);
        form.resetFields();
        loadCustomers(); // Reload list
        } else {
        throw new Error('Failed to save customer');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      message.error('Không thể lưu thông tin khách hàng');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Table columns
  const columns = [
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontWeight: 'bold' }}>{text}</span>
          {record.is_vip && <Tag color="gold">VIP</Tag>}
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => (
        <Space>
          <PhoneOutlined style={{ color: '#52c41a' }} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => text ? (
        <Space>
          <MailOutlined style={{ color: '#722ed1' }} />
          <span>{text}</span>
        </Space>
      ) : <Text type="secondary">Chưa có</Text>,
    },
    {
      title: 'Tổng đơn hàng',
      dataIndex: 'total_orders',
      key: 'total_orders',
      render: (value) => (
        <Badge count={value || 0} style={{ backgroundColor: '#1890ff' }} />
      ),
      sorter: (a, b) => (a.total_orders || 0) - (b.total_orders || 0),
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'total_spent',
      key: 'total_spent',
      render: (value) => (
        <Text strong style={{ color: '#f5222d' }}>
          {formatCurrency(value || 0)}
        </Text>
      ),
      sorter: (a, b) => (a.total_spent || 0) - (b.total_spent || 0),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<SearchOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa khách hàng này?"
            onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
          >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
            </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        <TeamOutlined /> Quản lý khách hàng
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={stats.totalCustomers}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Khách hàng hoạt động"
              value={stats.activeCustomers}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.totalRevenue}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={16} md={18}>
            <Search
              placeholder="Tìm kiếm khách hàng..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: '100%' }}
              data-testid="search-customers"
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              block
              data-testid="add-customer-btn"
            >
              Thêm khách hàng
            </Button>
          </Col>
        </Row>

        <Spin spinning={loading}>
          {filteredCustomers.length > 0 ? (
        <Table
          columns={columns}
              dataSource={filteredCustomers}
          rowKey="id"
          pagination={{
                total: filteredCustomers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} khách hàng`,
          }}
              scroll={{ x: 800 }}
        />
          ) : (
            <Empty
              description="Không có khách hàng nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Spin>
      </Card>

      {/* Customer Form Modal */}
      <CustomerFormModal
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onSubmit={handleSubmit}
        form={form}
        editingCustomer={editingCustomer}
        loading={loading}
      />

      {/* Customer Detail Drawer */}
      <CustomerDetailDrawer
        visible={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default CustomersPage; 