import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Input, 
  List, 
  Button, 
  Space, 
  Typography, 
  Empty,
  Spin,
  Tag,
  Avatar,
  Divider,
  Form,
  Row,
  Col,
  message
} from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  SearchOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  SaveOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { customersAPI } from '../services/api';

const { Title, Text } = Typography;
const { Search } = Input;

const CustomerSelectModal = ({ 
  visible, 
  onClose, 
  onSelect, 
  customers = [],
  onCustomerCreated
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();

  // Filter customers based on search text
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

  // Reset search when modal opens
  useEffect(() => {
    if (visible) {
      setSearchText('');
      setFilteredCustomers(customers);
      setShowCreateForm(false);
      form.resetFields();
    }
  }, [visible, customers, form]);

  // Handle customer selection
  const handleSelect = (customer) => {
    onSelect(customer);
    setSearchText('');
  };

  // Handle customer creation
  const handleCreateCustomer = async (values) => {
    try {
      setCreateLoading(true);
      const response = await customersAPI.create(values);
      
      if (response.data && response.data.success) {
        const newCustomer = response.data.data;
        message.success('Tạo khách hàng mới thành công!');
        
        // Notify parent component to refresh customers list
        if (onCustomerCreated) {
          onCustomerCreated(newCustomer);
        }
        
        // Select the new customer
        handleSelect(newCustomer);
        
        // Reset form
        form.resetFields();
        setShowCreateForm(false);
      } else {
        throw new Error('Không thể tạo khách hàng mới');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      message.error('Lỗi khi tạo khách hàng mới');
    } finally {
      setCreateLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Handle back to list
  const handleBackToList = () => {
    setShowCreateForm(false);
    form.resetFields();
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          <Title level={4} style={{ margin: 0 }}>
            {showCreateForm ? 'Tạo khách hàng mới' : 'Chọn khách hàng'}
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={
        showCreateForm ? [
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={handleBackToList}>
            Quay lại
          </Button>,
          <Button key="cancel" onClick={onClose}>
            Hủy
          </Button>,
          <Button 
            key="save" 
            type="primary"
            icon={<SaveOutlined />}
            loading={createLoading}
            onClick={() => form.submit()}
          >
            Tạo khách hàng
          </Button>
        ] : [
          <Button key="cancel" onClick={onClose}>
            Hủy
          </Button>,
          <Button 
            key="create" 
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreateForm(true)}
          >
            Tạo khách hàng mới
          </Button>,
          <Button 
            key="guest" 
            type="default"
            onClick={() => handleSelect(null)}
          >
            Khách lẻ
          </Button>
        ]
      }
      width={700}
      style={{ top: 20 }}
    >
      {showCreateForm ? (
        // Customer Creation Form
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCustomer}
          style={{ marginTop: '16px' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên khách hàng"
                name="name"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên khách hàng!' },
                  { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' }
                ]}
              >
                <Input 
                  placeholder="Nhập tên khách hàng"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input 
                  placeholder="Nhập số điện thoại"
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input 
                  placeholder="Nhập email (tùy chọn)"
                  prefix={<MailOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Địa chỉ"
                name="address"
              >
                <Input 
                  placeholder="Nhập địa chỉ (tùy chọn)"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Ghi chú"
            name="notes"
          >
            <Input.TextArea 
              rows={3}
              placeholder="Ghi chú về khách hàng (tùy chọn)"
            />
          </Form.Item>
        </Form>
      ) : (
        // Customer Selection List
        <>
          <div style={{ marginBottom: '16px' }}>
            <Search
              placeholder="Tìm kiếm khách hàng theo tên, số điện thoại, email..."
              allowClear
              size="large"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </div>

          <Spin spinning={loading}>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredCustomers.length > 0 ? (
                <List
                  dataSource={filteredCustomers}
                  renderItem={(customer) => (
                    <List.Item
                      key={customer.id}
                      style={{ 
                        cursor: 'pointer', 
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        border: '1px solid #f0f0f0',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => handleSelect(customer)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                        e.currentTarget.style.borderColor = '#1890ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#f0f0f0';
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar 
                            size="large" 
                            icon={<UserOutlined />} 
                            style={{ 
                              backgroundColor: '#1890ff',
                              color: 'white'
                            }}
                          >
                            {customer.name.charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        title={
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text strong style={{ fontSize: '16px' }}>
                              {customer.name}
                            </Text>
                            {customer.is_vip && (
                              <Tag color="gold" style={{ fontSize: '11px' }}>
                                VIP
                              </Tag>
                            )}
                            {customer.status === 'inactive' && (
                              <Tag color="red" style={{ fontSize: '11px' }}>
                                Ngừng hoạt động
                              </Tag>
                            )}
                          </div>
                        }
                        description={
                          <div style={{ marginTop: '8px' }}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                              <Space>
                                <PhoneOutlined style={{ color: '#52c41a' }} />
                                <Text>{customer.phone}</Text>
                              </Space>
                              {customer.email && (
                                <Space>
                                  <MailOutlined style={{ color: '#722ed1' }} />
                                  <Text>{customer.email}</Text>
                                </Space>
                              )}
                              <Space wrap>
                                {customer.total_orders > 0 && (
                                  <Tag 
                                    icon={<ShoppingCartOutlined />} 
                                    color="blue"
                                    style={{ fontSize: '11px' }}
                                  >
                                    {customer.total_orders} đơn hàng
                                  </Tag>
                                )}
                                {customer.total_spent > 0 && (
                                  <Tag 
                                    icon={<DollarOutlined />} 
                                    color="green"
                                    style={{ fontSize: '11px' }}
                                  >
                                    {formatCurrency(customer.total_spent)}
                                  </Tag>
                                )}
                              </Space>
                            </Space>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  description={
                    searchText 
                      ? 'Không tìm thấy khách hàng nào' 
                      : 'Chưa có khách hàng nào'
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </Spin>
        </>
      )}
    </Modal>
  );
};

export default CustomerSelectModal; 