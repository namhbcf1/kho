import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Input, 
  Button, 
  List, 
  Typography, 
  message, 
  Modal,
  Form,
  InputNumber,
  Space,
  Tag,
  Divider,
  Spin,
  Table,
  Radio
} from 'antd';
import { 
  PlusOutlined, 
  MinusOutlined, 
  DeleteOutlined,
  ShoppingCartOutlined,
  PrinterOutlined,
  SearchOutlined,
  ShoppingOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { productsAPI, ordersAPI, customersAPI } from '../services/api';
import { formatCurrency } from '../utils/format';

const { Title, Text } = Typography;
const { Search } = Input;

const orderSchema = z.object({
  customer_id: z.number().int().positive().optional().nullable(),
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
  customer_email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  payment_method: z.enum(['cash', 'card', 'transfer', 'ewallet']).optional(),
  notes: z.string().optional(),
});

function POSPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [serialModalVisible, setSerialModalVisible] = useState(false);
  const [selectedProductForSerial, setSelectedProductForSerial] = useState(null);
  const [availableSerials, setAvailableSerials] = useState([]);
  const [selectedSerials, setSelectedSerials] = useState([]);

  const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_id: null,
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      payment_method: 'cash',
      notes: '',
    }
  });

  const customerPhoneWatch = watch('customer_phone');

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      setValue('customer_id', selectedCustomer.id);
      setValue('customer_name', selectedCustomer.name);
      setValue('customer_phone', selectedCustomer.phone);
      setValue('customer_email', selectedCustomer.email || '');
    } else {
      setValue('customer_id', null);
    }
  }, [selectedCustomer, setValue]);

  const fetchCustomers = async (searchQuery = '') => {
    try {
      const response = await customersAPI.getAll({ phone: searchQuery, name: searchQuery });
      if (
        response.data.success) {
        setCustomers(response.data.data || []);
        setFilteredCustomers(response.data.data || []);
      } else {
        setCustomers([]);
        toast.error('Lỗi khi lấy danh sách khách hàng: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      toast.error('Lỗi kết nối khi lấy danh sách khách hàng.');
    }
  };

  const handleCustomerSearch = (value) => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(value.toLowerCase()) ||
      customer.phone?.includes(value)
    );
    setFilteredCustomers(filtered);
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerModalVisible(false);
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomer(null);
    setValue('customer_id', null);
    setValue('customer_name', '');
    setValue('customer_phone', '');
    setValue('customer_email', '');
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      if (response.data.success) {
        setProducts(response.data.data || []);
        setFilteredProducts(response.data.data || []);
      } else {
        setProducts([]);
        console.error('API returned error:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      // Don't show error message to user, just silently handle it
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(value.toLowerCase()) ||
      product.sku?.toLowerCase().includes(value.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleSerialSearch = async (serialNumber) => {
    if (!serialNumber.trim()) {
      setFilteredProducts(products);
      return;
    }

    try {
      setLoading(true);
      
      // Tìm kiếm serial trong database
              const response = await productsAPI.searchSerials({ 
        q: serialNumber, 
        status: 'available' 
      });
      
      if (response.data.success && response.data.data.length > 0) {
        const serial = response.data.data[0];
        
        // Tìm sản phẩm tương ứng với serial
        const product = products.find(p => p.id === serial.product_id);
        
        if (product) {
          // Hiển thị sản phẩm tìm thấy
          setFilteredProducts([product]);
          
          // Tự động thêm serial vào giỏ hàng
          const existingItem = cart.find(item => 
            item.product.id === product.id && 
            item.serial?.serial_number === serial.serial_number
          );
          
          if (existingItem) {
            message.warning(`Serial ${serial.serial_number} đã có trong giỏ hàng`);
          } else {
            setCart(prev => [...prev, {
              product: product,
              quantity: 1,
              serial: serial,
              price: product.price
            }]);
            message.success(`Đã thêm sản phẩm ${product.name} (Serial: ${serial.serial_number}) vào giỏ hàng`);
          }
        } else {
          message.error('Không tìm thấy sản phẩm tương ứng với serial này');
        }
      } else {
        message.error('Không tìm thấy serial hoặc serial đã được bán');
        setFilteredProducts(products);
      }
    } catch (error) {
      console.error('Error searching serial:', error);
      message.error('Lỗi khi tìm kiếm serial');
      setFilteredProducts(products);
    } finally {
      setLoading(false);
    }
  };

  const showSerialModal = async (product) => {
    try {
      setSelectedProductForSerial(product);
              const response = await productsAPI.getSerials(product.id, { status: 'available' });
      if (response.data.success) {
        setAvailableSerials(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setAvailableSerials([]);
      }
      setSerialModalVisible(true);
    } catch (error) {
      console.error('Error fetching serials:', error);
      setAvailableSerials([]);
      toast.error('Không thể tải danh sách serial của sản phẩm');
    }
  };

  const addToCart = async (product) => {
    try {
      // Thay vì thêm trực tiếp vào giỏ hàng, hiển thị modal chọn serial
      await showSerialModal(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
      message.error('Lỗi khi thêm sản phẩm vào giỏ hàng');
    }
  };

  const addSerialToCart = (selectedSerials) => {
    if (!selectedSerials || selectedSerials.length === 0) {
      message.warning('Vui lòng chọn ít nhất một serial');
      return;
    }

    selectedSerials.forEach(serial => {
      const existingItem = cart.find(item => 
        item.product.id === selectedProductForSerial.id && 
        item.serial?.serial_number === serial.serial_number
      );
      
      if (existingItem) {
        message.warning(`Serial ${serial.serial_number} đã có trong giỏ hàng`);
        return;
      }

      setCart(prev => [...prev, {
        product: selectedProductForSerial,
        quantity: 1,
        serial: serial,
        price: selectedProductForSerial.price
      }]);
    });

    message.success(`Đã thêm ${selectedSerials.length} sản phẩm vào giỏ hàng`);
    setSerialModalVisible(false);
    setSelectedSerials([]);
  };

  const removeFromCart = (productId, serialNumber) => {
    if (serialNumber) {
      // Xóa item có serial cụ thể
      setCart(prev => prev.filter(item => 
        !(item.product.id === productId && item.serial?.serial_number === serialNumber)
      ));
    } else {
      // Xóa tất cả item của sản phẩm này (fallback)
      setCart(prev => prev.filter(item => item.product.id !== productId));
    }
  };

  const updateQuantity = (productId, serialNumber, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, serialNumber);
      return;
    }
    
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.serial?.serial_number === serialNumber) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.warning('Giỏ hàng trống');
      return;
    }
    setOrderModalVisible(true);
  };

  const submitOrder = async (values) => {
    setLoading(true);
    try {
      // Tổng hợp tất cả serial để bán
      const serialsToSell = [];
      cart.forEach(item => {
        if (item.serial && item.serial.serial_number) {
          serialsToSell.push(item.serial.serial_number);
        }
      });

      const orderData = {
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer?.name || values.customer_name || null,
        customer_phone: selectedCustomer?.phone || values.customer_phone || null,
        customer_email: selectedCustomer?.email || values.customer_email || null,
        payment_method: values.payment_method || 'cash',
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.quantity * item.price,
          serial_number: item.serial?.serial_number || null
        })),
        total_amount: getTotalAmount(),
        serials_sold: serialsToSell,
        notes: values.notes || null
      };

      const response = await ordersAPI.create(orderData);
      
      if (response.data.success) {
        // Đánh dấu serial đã bán
        if (serialsToSell.length > 0) {
          await productsAPI.sellSerials({
            serial_numbers: serialsToSell,
            order_id: response.data.data.id,
            customer_id: response.data.data.customer_id || selectedCustomer?.id || null,
            sold_price: getTotalAmount(),
            notes: `Bán qua POS - ${response.data.data.order_number}`
          });
        }

        // Refresh customer list to sync with customers page
        await fetchCustomers();

        toast.success('Tạo đơn hàng thành công!');
        setSelectedCustomer(null);
        clearCart();
        setOrderModalVisible(false);
        reset(); // Reset form
        fetchProducts();
        showPrintModal(response.data.data);
      } else {
        toast.error(response.data.message || 'Lỗi khi tạo đơn hàng');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi kết nối khi tạo đơn hàng.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showPrintModal = (order) => {
    let modalInstance = null;
    let autoCloseTimer = null;
    modalInstance = Modal.info({
      title: 'Hóa đơn bán hàng',
      width: 600,
      content: (
        <div style={{ padding: '20px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Title level={4}>HÓA ĐƠN BÁN HÀNG</Title>
            <Text>Số hóa đơn: {order.order_number}</Text><br/>
            <Text type="secondary">
              {new Date(order.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
            </Text>
          </div>
          <Divider />
          <div style={{ marginBottom: '16px' }}>
            <Text strong>Khách hàng: </Text>
            <Text>{order.customer?.name || order.customer_name}</Text><br/>
            {(order.customer?.phone || order.customer_phone) && (
              <>
                <Text strong>Số điện thoại: </Text>
                <Text>{order.customer?.phone || order.customer_phone}</Text>
              </>
            )}
          </div>
          <Divider />
          <List
            size="small"
            dataSource={order.items}
            renderItem={item => (
              <List.Item style={{ padding: '8px 0' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <Text strong>{item.product_name}</Text><br/>
                      <Text type="secondary">{item.quantity} x {formatCurrency(item.price)}</Text>
                      {item.serials && item.serials.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Serial: {item.serials.join(', ')}
                          </Text>
                        </div>
                      )}
                    </div>
                    <Text strong>{formatCurrency(item.subtotal)}</Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
          <Divider />
          <div style={{ textAlign: 'right' }}>
            <Title level={4} style={{ margin: 0 }}>
              Tổng cộng: {formatCurrency(order.total_amount)}
            </Title>
          </div>
        </div>
      ),
      footer: [
        <Button 
          key="print"
          type="primary" 
          icon={<PrinterOutlined />}
          onClick={() => window.print()}
        >
          In hóa đơn
        </Button>,
        <Button
          key="close"
          onClick={() => { if (modalInstance) modalInstance.destroy(); if (autoCloseTimer) clearTimeout(autoCloseTimer); }}
        >
          Đóng
        </Button>
      ]
    });
    autoCloseTimer = setTimeout(() => {
      if (modalInstance) modalInstance.destroy();
    }, 5000);
  };

  const customerColumns = [
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => selectCustomer(record)}>Chọn</Button>
      ),
    },
  ];

  return (
    <div className="pos-page">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card 
            title="Danh sách sản phẩm"
            extra={
              <Space direction="vertical" size="small">
                <Search
                  placeholder="Tìm sản phẩm..."
                  onSearch={handleSearch}
                  style={{ width: 200 }}
                  loading={loading}
                />
                <Search
                  placeholder="Quét Serial Number..."
                  onSearch={handleSerialSearch}
                  enterButton="Quét"
                  style={{ width: 200 }}
                  loading={loading}
                />
              </Space>
            }
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 5 }}
                dataSource={filteredProducts}
                renderItem={product => (
                  <List.Item>
                    <Card
                      hoverable
                      cover={<img alt={product.name} src={product.image_url || 'https://via.placeholder.com/150'} />}
                      onClick={() => addToCart(product)}
                      style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                      <Card.Meta 
                        title={product.name}
                        description={formatCurrency(product.price)}
                      />
                      <div style={{ marginTop: '10px' }}>
                        <Text type="secondary">Tồn kho: {product.quantity}</Text>
                        {product.quantity <= 10 && product.quantity > 0 && (
                          <Tag color="warning" style={{ marginLeft: '8px' }}>Sắp hết</Tag>
                        )}
                        {product.quantity === 0 && (
                          <Tag color="error" style={{ marginLeft: '8px' }}>Hết hàng</Tag>
                        )}
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="Giỏ hàng"
            actions={[
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Thanh toán ({getTotalItems()})
              </Button>,
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                Xóa giỏ hàng
              </Button>,
            ]}
          >
            <List
              itemLayout="horizontal"
              dataSource={cart}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button 
                      icon={<PlusOutlined />} 
                      onClick={() => updateQuantity(item.product.id, item.serial?.serial_number, item.quantity + 1)}
                      disabled={item.quantity >= 10}
                    />,
                    <InputNumber
                      min={1}
                      max={10}
                      value={item.quantity}
                      onChange={(value) => updateQuantity(item.product.id, item.serial?.serial_number, value)}
                      style={{ width: 60 }}
                    />,
                    <Button 
                      icon={<MinusOutlined />} 
                      onClick={() => updateQuantity(item.product.id, item.serial?.serial_number, item.quantity - 1)}
                    />,
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined style={{ color: 'red' }} />} 
                      onClick={() => removeFromCart(item.product.id, item.serial?.serial_number)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={item.product.name}
                    description={
                      <div>
                        <Text>Giá: {formatCurrency(item.price)}</Text><br/>
                        {item.serial && (
                          <div>
                            <Text type="secondary">Serial: </Text>
                            <Tag color="blue" size="small">
                              {item.serial.serial_number}
                            </Tag>
                          </div>
                        )}
                      </div>
                    }
                  />
                  <div>
                    <Text strong>{formatCurrency(item.price * item.quantity)}</Text>
                  </div>
                </List.Item>
              )}
            />
            <Divider />
            <div style={{ textAlign: 'right' }}>
              <Title level={3}>Tổng cộng: {formatCurrency(getTotalAmount())}</Title>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Tạo đơn hàng"
        visible={orderModalVisible}
        onCancel={() => setOrderModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form layout="vertical" onFinish={handleSubmit(submitOrder)}>
          <Card title="Thông tin khách hàng" size="small" style={{ marginBottom: 16 }}>
            {selectedCustomer ? (
              <div>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Khách hàng đã chọn:</Text>
                    <div style={{ marginTop: 8, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                      <div><Text strong>{selectedCustomer.name}</Text></div>
                      <div><Text type="secondary">SĐT: {selectedCustomer.phone}</Text></div>
                      {selectedCustomer.email && <div><Text type="secondary">Email: {selectedCustomer.email}</Text></div>}
                    </div>
                  </div>
              <Space>
                    <Button size="small" onClick={clearSelectedCustomer}>Đổi khách hàng</Button>
                    <Button 
                      size="small"
                      icon={<UserOutlined />} 
                      onClick={() => setCustomerModalVisible(true)}
                    >
                      Chọn khách khác
                    </Button>
                  </Space>
              </Space>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 16 }}>
              <Button 
                icon={<UserOutlined />} 
                onClick={() => setCustomerModalVisible(true)}
                    style={{ marginRight: 8 }}
              >
                    Chọn khách hàng có sẵn
              </Button>
                  <Text type="secondary">hoặc nhập thông tin khách hàng mới bên dưới</Text>
                </div>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Controller
                      name="customer_name"
                      control={control}
                      render={({ field }) => (
                        <Form.Item label="Tên khách hàng" help={errors.customer_name?.message} validateStatus={errors.customer_name ? 'error' : ''}>
                          <Input {...field} placeholder="Nhập tên khách hàng" />
                        </Form.Item>
                      )}
                    />
                  </Col>
                  <Col span={12}>
            <Controller
              name="customer_phone"
              control={control}
              render={({ field }) => (
                        <Form.Item label="Số điện thoại" help={errors.customer_phone?.message} validateStatus={errors.customer_phone ? 'error' : ''}>
                  <Search
                    {...field}
                            placeholder="Nhập hoặc tìm SĐT khách hàng"
                    onSearch={(value) => {
                      const foundCustomer = customers.find(c => c.phone === value);
                      if (foundCustomer) {
                        selectCustomer(foundCustomer);
                        toast.success(`Đã tìm thấy khách hàng: ${foundCustomer.name}`);
                              } else if (value && !field.value) {
                                setValue('customer_phone', value);
                      }
                    }}
                    enterButton={<SearchOutlined />}
                  />
                </Form.Item>
              )}
            />
                  </Col>
                </Row>

            <Controller
                  name="customer_email"
              control={control}
              render={({ field }) => (
                    <Form.Item label="Email (tùy chọn)" help={errors.customer_email?.message} validateStatus={errors.customer_email ? 'error' : ''}>
                      <Input {...field} placeholder="Nhập email khách hàng" type="email" />
                </Form.Item>
              )}
            />
                
                {(watch('customer_name') || watch('customer_phone')) && (
                  <div style={{ padding: 8, background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 4, marginTop: 8 }}>
                    <Text type="secondary">
                      💡 Nếu khách hàng chưa có trong hệ thống, thông tin sẽ được tự động tạo mới và đồng bộ với trang Khách hàng
                    </Text>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Controller
            name="payment_method"
            control={control}
            defaultValue="cash"
            render={({ field }) => (
              <Form.Item label="Phương thức thanh toán">
                <Radio.Group {...field}>
                  <Radio value="cash">Tiền mặt</Radio>
                  <Radio value="card">Thẻ</Radio>
                  <Radio value="transfer">Chuyển khoản</Radio>
                  <Radio value="ewallet">Ví điện tử</Radio>
                </Radio.Group>
              </Form.Item>
            )}
          />

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <Form.Item label="Ghi chú đơn hàng">
                <Input.TextArea {...field} rows={3} placeholder="Ghi chú về đơn hàng..." />
              </Form.Item>
            )}
          />

          <Divider />

          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Space direction="vertical" align="end">
              <Text>Số lượng: {getTotalItems()} sản phẩm</Text>
              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                Tổng tiền: {formatCurrency(getTotalAmount())}
              </Title>
            </Space>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Hoàn tất đơn hàng
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chọn khách hàng"
        visible={customerModalVisible}
        onCancel={() => setCustomerModalVisible(false)}
        footer={null}
        width={800}
      >
        <Search
          placeholder="Tìm khách hàng theo tên hoặc số điện thoại..."
          onSearch={handleCustomerSearch}
          style={{ marginBottom: 16 }}
        />
        <Table
          dataSource={filteredCustomers}
          columns={customerColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ y: 300 }}
        />
      </Modal>

      <Modal
        title={`Chọn Serial - ${selectedProductForSerial?.name}`}
        visible={serialModalVisible}
        onCancel={() => setSerialModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setSerialModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="add" type="primary" onClick={() => addSerialToCart(selectedSerials)} disabled={selectedSerials.length === 0}>
            Thêm vào giỏ ({selectedSerials.length})
          </Button>
        ]}
        width={800}
      >
        {availableSerials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Text type="secondary">Không có serial khả dụng cho sản phẩm này</Text>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Có {availableSerials.length} serial khả dụng</Text>
            </div>
            <List
              dataSource={availableSerials}
              renderItem={serial => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedSerials.find(s => s.id === serial.id) ? '#e6f7ff' : 'transparent',
                    border: selectedSerials.find(s => s.id === serial.id) ? '1px solid #1890ff' : '1px solid #f0f0f0',
                    marginBottom: 8,
                    padding: 12,
                    borderRadius: 4
                  }}
                  onClick={() => {
                    const isSelected = selectedSerials.find(s => s.id === serial.id);
                    if (isSelected) {
                      setSelectedSerials(selectedSerials.filter(s => s.id !== serial.id));
                    } else {
                      setSelectedSerials([...selectedSerials, serial]);
                    }
                  }}
                >
                  <List.Item.Meta
                    title={<Text code>{serial.serial_number}</Text>}
                    description={
                      <div>
                        <Tag color="green">{serial.status}</Tag>
                        <Tag color="blue">{serial.condition_grade}</Tag>
                        {serial.location && <span>Vị trí: {serial.location}</span>}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default POSPage; 