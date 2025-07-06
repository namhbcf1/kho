import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Input, 
  Space, 
  List, 
  Typography, 
  message, 
  Modal,
  Form,
  InputNumber,
  Select, 
  Tag,
  Badge, 
  Spin,
  Table,
  Radio,
  Divider,
  Empty,
  Alert
} from 'antd';
import { 
  ShoppingCartOutlined, 
  PlusOutlined, 
  MinusOutlined, 
  DeleteOutlined,
  PrinterOutlined,
  SearchOutlined,
  ShoppingOutlined,
  ShopOutlined,
  UserOutlined,
  BarcodeOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

// Import API functions
import { 
  productsAPI, 
  customersAPI, 
  ordersAPI, 
  serialsAPI 
} from '../services/api';

// Import components
import CartList from '../components/CartList';
import CustomerSelectModal from '../components/CustomerSelectModal';
import OrderPrintModal from '../components/OrderPrintModal';
import SerialSelectModal from '../components/SerialSelectModal';
import AllProductsSerialModal from '../components/AllProductsSerialModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

// Validation schemas
const checkoutSchema = z.object({
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
  receivedAmount: z.number().min(0),
  discount: z.number().min(0).max(100),
  note: z.string().optional()
});

const POSPage = () => {
  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [availableSerials, setAvailableSerials] = useState([]);
  const [selectedSerials, setSelectedSerials] = useState([]);
  
  // Modal states
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [serialSelectModalVisible, setSerialSelectModalVisible] = useState(false);
  const [selectedProductForSerial, setSelectedProductForSerial] = useState(null);
  const [allProductsModalVisible, setAllProductsModalVisible] = useState(false);
  
  // Form states
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState('');
  
  // Form hooks
  const [form] = Form.useForm();
  const [checkoutForm] = Form.useForm();
  
  // React Hook Form
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'cash',
      receivedAmount: 0,
      discount: 0,
      note: ''
    }
  });

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  // Load products from API
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({ 
        limit: 50,
        status: 'active' 
      });
      
      if (response.data && response.data.success) {
        const productsData = response.data.data || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
        toast.success(`Đã tải ${productsData.length} sản phẩm`);
    } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      message.error('Không thể tải danh sách sản phẩm');
      // Set empty array on error
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load customers from API
  const loadCustomers = async () => {
    try {
      const response = await customersAPI.getAll({ 
        limit: 100,
        status: 'active' 
      });
      
      if (response.data && response.data.success) {
        const customersData = response.data.data || [];
        setCustomers(customersData);
        setFilteredCustomers(customersData);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      message.error('Không thể tải danh sách khách hàng');
      setCustomers([]);
      setFilteredCustomers([]);
    }
  };

  // Search products
  const handleProductSearch = async (value) => {
    setSearchTerm(value);
    
    if (!value.trim()) {
      setFilteredProducts(products);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await productsAPI.getAll({
        search: value,
        limit: 20,
        status: 'active'
      });
      
      if (response.data && response.data.success) {
        const searchResults = response.data.data || [];
        setFilteredProducts(searchResults);
      } else {
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      message.error('Lỗi tìm kiếm sản phẩm');
      setFilteredProducts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Search by serial number
  const handleSerialSearch = async () => {
    if (!serialNumber.trim()) {
      message.warning('Vui lòng nhập số serial');
      return;
    }

    try {
      setSearchLoading(true);
      const response = await serialsAPI.search(serialNumber, {
        status: 'available' 
      });
      
      if (response.data && response.data.success) {
        const serialData = response.data.data;
        if (serialData && serialData.length > 0) {
          const serial = serialData[0];
          // Add product to cart with specific serial
          addToCartWithSerial(serial);
          setSerialNumber('');
          toast.success(`Đã thêm sản phẩm với serial ${serial.serial_number}`);
        } else {
          message.warning('Không tìm thấy serial hoặc serial đã được bán');
        }
      } else {
        message.error('Không tìm thấy thông tin serial');
      }
    } catch (error) {
      console.error('Error searching serial:', error);
      message.error('Lỗi tìm kiếm serial');
    } finally {
      setSearchLoading(false);
    }
  };

  // Add product to cart with serial
  const addToCartWithSerial = (serialData) => {
    const existingItem = cart.find(item => 
      item.product_id === serialData.product_id && 
      item.serial_number === serialData.serial_number
    );

    if (existingItem) {
      message.warning('Sản phẩm với serial này đã có trong giỏ hàng');
      return;
    }

    const newItem = {
      id: `${serialData.product_id}_${serialData.serial_number}`,
      product_id: serialData.product_id,
      name: serialData.product_name || 'Sản phẩm',
      price: serialData.price || 0,
      quantity: 1,
      serial_number: serialData.serial_number,
      warranty_months: serialData.warranty_months || 0,
      total: serialData.price || 0
    };

    setCart(prev => [...prev, newItem]);
  };

  // Modified addToCart function to show serial selection modal
  const addToCart = async (product) => {
    try {
      if (!product || !product.id) {
        message.error('Sản phẩm không hợp lệ');
        return;
      }

      // Check if product requires serial number
      if (product.has_serial) {
        setSelectedProductForSerial(product);
        setSerialSelectModalVisible(true);
        return;
      }

      // Add product without serial number
      const existingItem = cart.find(item => item.id === product.id && !item.serial_number);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedCart = cart.map(item =>
          item.id === product.id && !item.serial_number
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
        setCart(updatedCart);
        toast.success(`Đã tăng số lượng ${product.name}`);
      } else {
        // Add new item to cart
        const newItem = {
          id: product.id,
          product_id: product.id,  // Add product_id field
          name: product.name,
          price: product.price,
          quantity: 1,
          total: product.price,
          sku: product.sku,
          warranty_months: product.warranty_months || 0,
          serial_number: null
        };
        
        setCart([...cart, newItem]);
        toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      message.error('Lỗi khi thêm sản phẩm vào giỏ hàng');
    }
  };

  // Handle serial selection for product
  const handleSerialSelection = (serialNumbers) => {
    if (!selectedProductForSerial || !serialNumbers.length) {
      return;
    }

    const product = selectedProductForSerial;
    const newItems = serialNumbers.map(serialNumber => ({
      id: `${product.id}_${serialNumber}`, // Unique ID for each serial
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      total: product.price,
      sku: product.sku,
      warranty_months: product.warranty_months || 0,
      serial_number: serialNumber
    }));

    setCart([...cart, ...newItems]);
    setSerialSelectModalVisible(false);
    setSelectedProductForSerial(null);
    
    toast.success(`Đã thêm ${newItems.length} sản phẩm với số serial vào giỏ hàng`);
  };

  // Handle adding product from AllProductsModal
  const handleAddFromAllProducts = (product, serialNumbers) => {
    if (serialNumbers.length === 0) {
      // Add product without serial
      addToCart(product);
    } else {
      // Add product with selected serials
      const newItems = serialNumbers.map(serialNumber => ({
        id: `${product.id}_${serialNumber}`, // Unique ID for each serial
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
        sku: product.sku,
        warranty_months: product.warranty_months || 0,
        serial_number: serialNumber
      }));

      setCart([...cart, ...newItems]);
      toast.success(`Đã thêm ${newItems.length} sản phẩm với số serial vào giỏ hàng`);
    }
  };

  // Update cart quantity
  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
        : item
    ));
  };

  // Remove from cart
  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscount(0);
    setNote('');
    toast.success('Đã xóa toàn bộ giỏ hàng');
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;
    
    return {
      subtotal,
      discountAmount,
      total,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  };

  // Handle checkout
  const handleCheckout = async (formData) => {
    if (cart.length === 0) {
      message.warning('Giỏ hàng trống');
      return;
    }

    const totals = calculateTotals();
    
    if (formData.paymentMethod === 'cash' && formData.receivedAmount < totals.total) {
      message.error('Số tiền nhận không đủ');
      return;
    }

    try {
    setLoading(true);
      
      // Prepare order data
      const orderData = {
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer?.name || 'Khách lẻ',
        customer_phone: selectedCustomer?.phone || '',
        items: cart.map(item => ({
          product_id: item.product_id || item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          serial_number: item.serial_number || null
        })),
        subtotal: totals.subtotal,
        discount_percent: discount,
        discount_amount: totals.discountAmount,
        total: totals.total,
        payment_method: formData.paymentMethod,
        received_amount: formData.receivedAmount,
        change_amount: formData.receivedAmount - totals.total,
        note: formData.note || '',
        status: 'completed'
      };

      // Create order
      const response = await ordersAPI.create(orderData);
      
      if (response.data && response.data.success) {
        const newOrder = response.data.data;
        setCurrentOrder(newOrder);
        setCheckoutModalVisible(false);
        setPrintModalVisible(true);
        clearCart();
        toast.success('Đã tạo đơn hàng thành công!');
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      message.error('Không thể tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Customer selection
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerModalVisible(false);
    toast.success(`Đã chọn khách hàng: ${customer.name}`);
  };

  // Handle customer creation callback
  const handleCustomerCreated = (newCustomer) => {
    // Add new customer to the list
    setCustomers([...customers, newCustomer]);
    setFilteredCustomers([...customers, newCustomer]);
    
    // Reload customers to get updated list
    loadCustomers();
  };

  const totals = calculateTotals();

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '24px', color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}>
        <ShoppingCartOutlined /> Điểm Bán Hàng
      </h1>

      <Row gutter={[24, 24]}>
        {/* Product Search & List */}
        <Col xs={24} lg={14}>
          <Card 
            title={
              <Space>
                <ShoppingOutlined />
                <span>Sản phẩm</span>
                <Badge count={filteredProducts.length} style={{ backgroundColor: '#52c41a' }} />
              </Space>
            }
            style={{ height: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
              <Search
                placeholder="Tìm kiếm sản phẩm theo tên, SKU..."
                allowClear
                loading={searchLoading}
                onSearch={handleProductSearch}
                onChange={(e) => handleProductSearch(e.target.value)}
                style={{ width: '100%' }}
                data-testid="product-search"
              />
              
              <Input.Group compact>
                <Input
                  placeholder="Quét hoặc nhập số serial"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  onPressEnter={handleSerialSearch}
                  style={{ width: 'calc(100% - 100px)' }}
                  prefix={<BarcodeOutlined />}
                />
                <Button 
                  type="primary" 
                  onClick={handleSerialSearch}
                  loading={searchLoading}
                  style={{ width: '100px' }}
                  data-testid="barcode-scan-button"
                >
                  Quét mã vạch
                </Button>
              </Input.Group>
              
              <Button
                type="dashed"
                icon={<ShopOutlined />}
                onClick={() => setAllProductsModalVisible(true)}
                block
                style={{ marginTop: '8px' }}
                data-testid="all-products-button"
              >
                Xem tất cả sản phẩm có Serial
              </Button>
            </Space>

            <Spin spinning={loading}>
              {filteredProducts.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {filteredProducts.map(product => (
                    <Col xs={24} sm={12} md={8} key={product.id}>
                      <Card
                        size="small"
                        hoverable
                        actions={[
                          <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => addToCart(product)}
                            block
                          >
                            {product.has_serial ? 'Chọn Serial' : 'Thêm'}
                          </Button>
                        ]}
                        style={{ height: '100%' }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <Title level={5} ellipsis style={{ marginBottom: '8px' }}>
                            {product.name}
                          </Title>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            SKU: {product.sku}
                          </Text>
                          <div style={{ margin: '8px 0' }}>
                            <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(product.price)}
                            </Text>
                          </div>
                          <Space>
                            <Tag color={product.quantity > 0 ? 'green' : 'red'}>
                              Tồn: {product.quantity || 0}
                            </Tag>
                            {product.has_serial && (
                              <Tag color="blue">
                                Serial
                              </Tag>
                            )}
                          </Space>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty
                  description={searchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            )}
            </Spin>
          </Card>
        </Col>

        {/* Cart & Checkout */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>Giỏ hàng</span>
                <Badge count={totals.itemCount} style={{ backgroundColor: '#1890ff' }} />
              </Space>
            }
            extra={
              <Button
                type="text" 
                danger
                size="small"
                icon={<ClearOutlined />}
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                Xóa tất cả
              </Button>
            }
            style={{ height: '100%' }}
            data-testid="cart-section"
          >
            <CartList
              items={cart}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
            />

            <Divider />

            {/* Customer Selection */}
            <div style={{ marginBottom: '16px' }}>
              <Button
                type={selectedCustomer ? 'default' : 'dashed'}
                icon={<UserOutlined />}
                onClick={() => setCustomerModalVisible(true)}
                block
                style={{ textAlign: 'left' }}
                data-testid="customer-select-button"
              >
                {selectedCustomer ? (
                  <span>
                    <strong>{selectedCustomer.name}</strong>
                    <br />
                    <Text type="secondary">{selectedCustomer.phone}</Text>
                  </span>
                ) : (
                  'Chọn khách hàng'
                )}
              </Button>
            </div>

            {/* Discount */}
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Giảm giá (%)</Text>
              <div style={{ marginTop: '4px' }}>
                <InputNumber
                  min={0}
                  max={100}
                  value={discount}
                  onChange={setDiscount}
                  style={{ width: '100%' }}
                  placeholder="Nhập % giảm giá"
                  data-testid="discount-input"
                />
              </div>
            </div>

            {/* Totals */}
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <Row justify="space-between">
                <Text>Tạm tính:</Text>
                <Text strong>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(totals.subtotal)}
                </Text>
              </Row>
              {discount > 0 && (
                <Row justify="space-between">
                  <Text>Giảm giá ({discount}%):</Text>
                  <Text type="danger">
                    -{new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(totals.discountAmount)}
                  </Text>
                </Row>
              )}
              <Divider style={{ margin: '8px 0' }} />
              <Row justify="space-between">
                <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                <Text strong style={{ fontSize: '18px', color: '#f5222d' }}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(totals.total)}
                </Text>
              </Row>
            </div>

            {/* Checkout Button */}
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={() => setCheckoutModalVisible(true)}
              disabled={cart.length === 0}
              block
              style={{ height: '50px', fontSize: '16px' }}
              data-testid="checkout-button"
            >
              Thanh toán
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Customer Selection Modal */}
      <CustomerSelectModal
        visible={customerModalVisible}
        onClose={() => setCustomerModalVisible(false)}
        onSelect={handleCustomerSelect}
        customers={customers}
        onCustomerCreated={handleCustomerCreated}
      />

      {/* Serial Selection Modal */}
      <SerialSelectModal
        visible={serialSelectModalVisible}
        onClose={() => {
          setSerialSelectModalVisible(false);
          setSelectedProductForSerial(null);
        }}
        onSelect={handleSerialSelection}
        product={selectedProductForSerial}
      />

      {/* Checkout Modal */}
      <Modal
        title="Thanh toán"
        open={checkoutModalVisible}
        onCancel={() => setCheckoutModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={checkoutForm}
          layout="vertical"
          onFinish={handleSubmit(handleCheckout)}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Phương thức thanh toán">
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group {...field} style={{ width: '100%' }}>
                      <Radio.Button value="cash" style={{ width: '100%', textAlign: 'center' }}>
                        Tiền mặt
                      </Radio.Button>
                      <Radio.Button value="card" style={{ width: '100%', textAlign: 'center' }}>
                        Thẻ
                      </Radio.Button>
                      <Radio.Button value="transfer" style={{ width: '100%', textAlign: 'center' }}>
                        Chuyển khoản
                      </Radio.Button>
                    </Radio.Group>
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số tiền nhận">
                <Controller
                  name="receivedAmount"
                  control={control}
                  render={({ field }) => (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <InputNumber
                        {...field}
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="Nhập số tiền nhận"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        data-testid="received-amount-input"
                      />
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => {
                          const totalAmount = totals.total;
                          field.onChange(totalAmount);
                          checkoutForm.setFieldsValue({ receivedAmount: totalAmount });
                        }}
                        data-testid="exact-amount-button"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Vừa đủ
                      </Button>
                    </div>
                  )}
                />
                {errors.receivedAmount && (
                  <Text type="danger">{errors.receivedAmount.message}</Text>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi chú">
            <Controller
              name="note"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  rows={3}
                  placeholder="Ghi chú đơn hàng..."
                />
              )}
            />
          </Form.Item>

          <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <Row justify="space-between">
              <Text>Tổng tiền:</Text>
              <Text strong style={{ fontSize: '18px', color: '#f5222d' }}>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(totals.total)}
              </Text>
            </Row>
            {receivedAmount > totals.total && (
              <Row justify="space-between">
                <Text>Tiền thừa:</Text>
                <Text strong style={{ color: '#52c41a' }}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(receivedAmount - totals.total)}
                </Text>
              </Row>
            )}
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Button onClick={() => setCheckoutModalVisible(false)} block>
                Hủy
              </Button>
            </Col>
            <Col span={12}>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                block
              >
                Xác nhận thanh toán
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* All Products Serial Modal */}
      <AllProductsSerialModal
        visible={allProductsModalVisible}
        onClose={() => setAllProductsModalVisible(false)}
        onAddToCart={handleAddFromAllProducts}
      />

      {/* Print Modal */}
      <OrderPrintModal
        visible={printModalVisible}
        onClose={() => setPrintModalVisible(false)}
        order={currentOrder}
      />
    </div>
  );
};

export default POSPage; 