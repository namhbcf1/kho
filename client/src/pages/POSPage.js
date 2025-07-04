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
  Radio,
  motion,
  Skeleton
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
import { toast } from 'sonner';

import { productsAPI, ordersAPI, customersAPI } from '../services/api';
import { formatCurrency } from '../utils/format';
import CartList from '../components/CartList';
import SerialSelectModal from '../components/SerialSelectModal';
import CustomerSelectModal from '../components/CustomerSelectModal';
import ProductList from '../components/ProductList';
import OrderPrintModal from '../components/OrderPrintModal';
import OrderFormModal from '../components/OrderFormModal';
import CustomerQuickAddModal from '../components/CustomerQuickAddModal';

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
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [printOrder, setPrintOrder] = useState(null);
  const [customerQuickAddVisible, setCustomerQuickAddVisible] = useState(false);
  const [customerQuickAddLoading, setCustomerQuickAddLoading] = useState(false);

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
            toast.warning(`Serial ${serial.serial_number} đã có trong giỏ hàng`);
          } else {
            setCart(prev => [...prev, {
              product: product,
              quantity: 1,
              serial: serial,
              price: product.price
            }]);
            toast.success(`Đã thêm sản phẩm ${product.name} (Serial: ${serial.serial_number}) vào giỏ hàng`);
          }
        } else {
          toast.error('Không tìm thấy sản phẩm tương ứng với serial này');
        }
      } else {
        toast.error('Không tìm thấy serial hoặc serial đã được bán');
        setFilteredProducts(products);
      }
    } catch (error) {
      console.error('Error searching serial:', error);
      toast.error('Lỗi khi tìm kiếm serial');
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
      toast.error('Lỗi khi thêm sản phẩm vào giỏ hàng');
    }
  };

  const addSerialToCart = (selectedSerials) => {
    if (!selectedSerials || selectedSerials.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một serial');
      return;
    }

    selectedSerials.forEach(serial => {
      const existingItem = cart.find(item => 
        item.product.id === selectedProductForSerial.id && 
        item.serial?.serial_number === serial.serial_number
      );
      
      if (existingItem) {
        toast.warning(`Serial ${serial.serial_number} đã có trong giỏ hàng`);
        return;
      }

      setCart(prev => [...prev, {
        product: selectedProductForSerial,
        quantity: 1,
        serial: serial,
        price: selectedProductForSerial.price
      }]);
    });

    toast.success(`Đã thêm ${selectedSerials.length} sản phẩm vào giỏ hàng`);
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
        setPrintOrder(response.data.data);
        setPrintModalVisible(true);
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

  const handleQuickAddCustomer = async (values) => {
    setCustomerQuickAddLoading(true);
    try {
      const response = await customersAPI.create({
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address,
      });
      if (response.data.success) {
        toast.success('Thêm khách hàng thành công!');
        await fetchCustomers(); // Refresh customer list
        setCustomerQuickAddVisible(false);
      } else {
        toast.error(response.data.message || 'Lỗi khi thêm khách hàng');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi kết nối khi thêm khách hàng.';
      toast.error(errorMessage);
    } finally {
      setCustomerQuickAddLoading(false);
    }
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
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : (
              <ProductList products={filteredProducts} loading={loading} onAddToCart={addToCart} onShowSerialModal={showSerialModal} formatCurrency={formatCurrency} />
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
            <CartList cart={cart} onRemove={removeFromCart} onUpdateQuantity={updateQuantity} formatCurrency={formatCurrency} />
            <Divider />
            <div style={{ textAlign: 'right' }}>
              <Title level={3}>Tổng cộng: {formatCurrency(getTotalAmount())}</Title>
            </div>
          </Card>
        </Col>
      </Row>

      <OrderFormModal visible={orderModalVisible} onSubmit={submitOrder} onCancel={() => setOrderModalVisible(false)} control={control} errors={errors} handleSubmit={handleSubmit} loading={loading} selectedCustomer={selectedCustomer} clearSelectedCustomer={clearSelectedCustomer} getTotalAmount={getTotalAmount} getTotalItems={getTotalItems} />
      <CustomerSelectModal visible={customerModalVisible} onOk={selectCustomer} onCancel={() => setCustomerModalVisible(false)} customers={customers} loading={loading} onSearch={handleCustomerSearch} filteredCustomers={filteredCustomers} selectCustomer={selectCustomer} />
      <SerialSelectModal visible={serialModalVisible} onOk={addSerialToCart} onCancel={() => setSerialModalVisible(false)} serials={availableSerials} selectedSerials={selectedSerials} setSelectedSerials={setSelectedSerials} loading={loading} />
      <OrderPrintModal visible={printModalVisible} order={printOrder} onClose={() => setPrintModalVisible(false)} formatCurrency={formatCurrency} />
      <CustomerQuickAddModal visible={customerQuickAddVisible} onOk={handleQuickAddCustomer} onCancel={() => setCustomerQuickAddVisible(false)} loading={customerQuickAddLoading} />
    </div>
  );
}

export default POSPage; 