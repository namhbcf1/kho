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
import CustomerFormModal from '../components/CustomerFormModal';
import { toast } from 'sonner';
import CustomerDetailDrawer from '../components/CustomerDetailDrawer';

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
      toast.error('Lỗi khi tải danh sách khách hàng');
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
        toast.success('Cập nhật khách hàng thành công');
      } else {
        await customersAPI.create(customerData);
        toast.success('Tạo khách hàng thành công');
      }
      
      handleCancel();
      fetchCustomers();
    } catch (error) {
      toast.error(`Lỗi khi ${editingCustomer ? 'cập nhật' : 'tạo'} khách hàng: ` + (error.response?.data?.message || error.message));
      console.error('Error saving customer:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await customersAPI.delete(id);
      toast.success('Xóa khách hàng thành công');
      fetchCustomers();
    } catch (error) {
      toast.error('Lỗi khi xóa khách hàng');
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
      toast.error('Lỗi khi tải thông tin khách hàng');
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
      <CustomerFormModal
        isModalVisible={isModalVisible}
        handleCancel={handleCancel}
        editingCustomer={editingCustomer}
        form={form}
        handleSubmit={handleSubmit}
        customerTypes={customerTypes}
      />

      {/* 🆕 Enhanced Customer Details Drawer */}
      <CustomerDetailDrawer
        isDetailDrawerVisible={isDetailDrawerVisible}
        setIsDetailDrawerVisible={setIsDetailDrawerVisible}
        selectedCustomer={selectedCustomer}
        customerTypes={customerTypes}
        customerPurchaseHistory={customerPurchaseHistory}
        purchaseHistoryLoading={purchaseHistoryLoading}
        orderSerials={orderSerials}
        showModal={showModal}
        handleDelete={handleDelete}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </div>
  );
};

export default CustomersPage; 