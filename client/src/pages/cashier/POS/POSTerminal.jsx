// =====================================================
// 💰 POS TERMINAL COMPONENT - GIAO DIỆN THU NGÂN
// =====================================================

// pages/cashier/POS/POSTerminal.jsx - Terminal chính
import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Button, Input, Typography, Divider, message, Modal } from 'antd';
import {
  SearchOutlined,
  ScanOutlined,
  ClearOutlined,
  PrinterOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  GiftOutlined
} from '@ant-design/icons';
import ProductGrid from './ProductSelector';
import CartManager from './CartManager';
import PaymentProcessor from './PaymentProcessor';
import SmartSuggestions from './SmartSuggestions';
import CustomerLookup from '../Customers/CustomerLookup';

const { Title, Text } = Typography;

const POSTerminal = () => {
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const barcodeInputRef = useRef(null);

  // Mock products data
  const [products] = useState([
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      price: 35000000,
      barcode: '123456789',
      category: 'Electronics',
      image: '/api/placeholder/150/150',
      stock: 25
    },
    {
      id: 2,
      name: 'MacBook Air M3',
      price: 28000000,
      barcode: '987654321',
      category: 'Electronics',
      image: '/api/placeholder/150/150',
      stock: 12
    },
    {
      id: 3,
      name: 'AirPods Pro',
      price: 6500000,
      barcode: '456789123',
      category: 'Accessories',
      image: '/api/placeholder/150/150',
      stock: 50
    }
  ]);

  // Focus vào input barcode khi component mount
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Handle barcode scan/manual input
  const handleBarcodeInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Kiểm tra nếu nhấn Enter hoặc đủ độ dài barcode
    if (e.key === 'Enter' || value.length >= 8) {
      handleProductSearch(value);
      setSearchQuery('');
    }
  };

  // Tìm kiếm và thêm sản phẩm
  const handleProductSearch = (query) => {
    const product = products.find(p => 
      p.barcode === query || 
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (product) {
      addToCart(product);
      // Generate smart suggestions sau khi thêm sản phẩm
      generateSmartSuggestions(product);
    } else {
      message.warning(`Không tìm thấy sản phẩm: ${query}`);
    }
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
    
    message.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    Modal.confirm({
      title: 'Xác nhận xóa giỏ hàng',
      content: 'Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?',
      onOk: () => {
        setCart([]);
        setSelectedCustomer(null);
        setCurrentSuggestions([]);
        message.success('Đã xóa giỏ hàng');
      }
    });
  };

  // Generate smart suggestions dựa trên sản phẩm vừa thêm
  const generateSmartSuggestions = (product) => {
    // Mock AI suggestions - trong thực tế sẽ call API
    const suggestions = [];
    
    if (product.category === 'Electronics') {
      if (product.name.includes('iPhone')) {
        suggestions.push(
          products.find(p => p.name.includes('AirPods')),
          { id: 99, name: 'Ốp lưng iPhone 15', price: 250000 }
        );
      } else if (product.name.includes('MacBook')) {
        suggestions.push(
          { id: 98, name: 'Magic Mouse', price: 2500000 },
          { id: 97, name: 'USB-C Hub', price: 800000 }
        );
      }
    }
    
    setCurrentSuggestions(suggestions.filter(Boolean));
  };

  // Tính tổng tiền
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Xử lý thanh toán
  const handleCheckout = () => {
    if (cart.length === 0) {
      message.warning('Giỏ hàng trống!');
      return;
    }
    setIsPaymentModalVisible(true);
  };

  // Hoàn thành thanh toán
  const handlePaymentComplete = (paymentData) => {
    console.log('Payment completed:', paymentData);
    
    // Mock order creation
    const order = {
      id: Date.now(),
      items: cart,
      customer: selectedCustomer,
      total: calculateTotal(),
      payment: paymentData,
      timestamp: new Date()
    };
    
    // Reset state
    setCart([]);
    setSelectedCustomer(null);
    setCurrentSuggestions([]);
    setIsPaymentModalVisible(false);
    
    message.success('Thanh toán thành công!');
    
    // Auto print receipt (optional)
    setTimeout(() => {
      Modal.info({
        title: 'In hóa đơn',
        content: 'Hóa đơn đã được in thành công!',
        icon: <PrinterOutlined />
      });
    }, 1000);
  };

  return (
    <div className="pos-terminal h-full">
      <Row gutter={16} className="h-full">
        {/* Cột trái - Sản phẩm */}
        <Col xs={24} lg={14} className="h-full">
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span>Sản phẩm</span>
                <div className="flex items-center space-x-2">
                  <Input
                    ref={barcodeInputRef}
                    placeholder="Quét barcode hoặc tìm kiếm sản phẩm..."
                    prefix={<ScanOutlined />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onPressEnter={handleBarcodeInput}
                    className="w-80"
                    size="large"
                  />
                </div>
              </div>
            }
            className="h-full"
            bodyStyle={{ height: 'calc(100% - 60px)', overflow: 'auto' }}
          >
            <ProductGrid 
              products={products}
              onProductSelect={addToCart}
              searchQuery={searchQuery}
            />
            
            {/* Smart Suggestions */}
            {currentSuggestions.length > 0 && (
              <div className="mt-4">
                <SmartSuggestions 
                  suggestions={currentSuggestions}
                  onSuggestionSelect={addToCart}
                />
              </div>
            )}
          </Card>
        </Col>

        {/* Cột phải - Giỏ hàng & Thanh toán */}
        <Col xs={24} lg={10} className="h-full">
          <div className="flex flex-col h-full space-y-4">
            {/* Customer Selection */}
            <Card size="small">
              <CustomerLookup 
                selectedCustomer={selectedCustomer}
                onCustomerSelect={setSelectedCustomer}
              />
            </Card>

            {/* Cart */}
            <Card 
              title={
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ShoppingCartOutlined className="mr-2" />
                    Giỏ hàng ({cart.length})
                  </span>
                  <Button 
                    type="text" 
                    icon={<ClearOutlined />}
                    onClick={clearCart}
                    disabled={cart.length === 0}
                  >
                    Xóa tất cả
                  </Button>
                </div>
              }
              className="flex-1"
              bodyStyle={{ height: 'calc(100% - 60px)', overflow: 'auto' }}
            >
              <CartManager
                cart={cart}
                onQuantityChange={updateQuantity}
                onRemoveItem={removeFromCart}
              />
            </Card>

            {/* Payment Summary */}
            <Card className="shadow-lg border-2 border-blue-200">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg">
                  <Text strong>Tổng cộng:</Text>
                  <Title level={3} className="text-green-600