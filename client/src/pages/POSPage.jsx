import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, ShoppingCart, User, Package, Scan, Receipt, 
  Plus, Minus, Trash2, Edit, Eye, RotateCcw, Calculator,
  CreditCard, DollarSign, Phone, Mail, MapPin,
  AlertCircle, CheckCircle, Clock, X, Settings
} from 'lucide-react';
import { api } from '../services/api';
import { 
  CartItem, 
  CustomerSection, 
  PaymentSection, 
  SerialNumberModal, 
  CustomerModal, 
  SerialNumberManagement 
} from '../components/POSComponents';

// Advanced POS Interface Component
const AdvancedPOSInterface = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('pos'); // 'pos', 'serial', 'customer'
  
  // Payment states
  const [paymentData, setPaymentData] = useState({
    method: 'cash',
    received: '',
    discount: 0,
    tax: 0,
    note: ''
  });

  // Serial number management
  const [serialModal, setSerialModal] = useState({ open: false, product: null });
  const [availableSerials, setAvailableSerials] = useState([]);

  // Customer management
  const [customerModal, setCustomerModal] = useState({ open: false, mode: 'select' });
  const [newCustomer, setNewCustomer] = useState({
    name: '', phone: '', email: '', address: ''
  });

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadCustomers()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.getProducts();
      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await api.getCustomers();
      if (response.success) {
        setCustomers(response.data.customers || []);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add product to cart
  const addToCart = async (product) => {
    if (product.quantity <= 0) {
      alert('Sản phẩm đã hết hàng!');
      return;
    }

    // If product has serial numbers, show serial selection
    if (product.has_serial_numbers) {
      setSerialModal({ open: true, product });
      await loadSerialNumbers(product.id);
      return;
    }

    // Add normal product
    const existingItem = cart.find(item => item.product_id === product.id && !item.serial_number);
    if (existingItem) {
      updateCartQuantity(existingItem.cart_id, existingItem.quantity + 1);
    } else {
      const cartId = Date.now() + Math.random(); // Unique cart ID
      setCart(prev => [...prev, {
        cart_id: cartId,
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
        max_quantity: product.quantity
      }]);
    }
  };

  // Load available serial numbers for a product
  const loadSerialNumbers = async (productId) => {
    try {
      const response = await api.getProductSerialNumbers(productId);
      if (response.success) {
        setAvailableSerials(response.data.serial_numbers || []);
      }
    } catch (error) {
      console.error('Error loading serial numbers:', error);
      setAvailableSerials([]);
    }
  };

  // Add product with serial number
  const addProductWithSerial = (serial) => {
    const { product } = serialModal;
    const cartId = Date.now() + Math.random();
    
    setCart(prev => [...prev, {
      cart_id: cartId,
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
      total: product.price,
      serial_number: serial.serial_number,
      max_quantity: 1 // Serial products are unique
    }]);

    setSerialModal({ open: false, product: null });
    setAvailableSerials([]);
  };

  // Update cart item quantity
  const updateCartQuantity = (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartId);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.cart_id === cartId) {
        const quantity = Math.min(newQuantity, item.max_quantity);
        return {
          ...item,
          quantity,
          total: item.price * quantity
        };
      }
      return item;
    }));
  };

  // Remove item from cart
  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cart_id !== cartId));
  };

  // Calculate totals
  const calculations = {
    subtotal: cart.reduce((sum, item) => sum + item.total, 0),
    get discountAmount() {
      return this.subtotal * (paymentData.discount / 100);
    },
    get taxAmount() {
      return (this.subtotal - this.discountAmount) * (paymentData.tax / 100);
    },
    get total() {
      return this.subtotal - this.discountAmount + this.taxAmount;
    },
    get received() {
      return parseFloat(paymentData.received) || 0;
    },
    get change() {
      return Math.max(0, this.received - this.total);
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    if (paymentData.method === 'cash' && calculations.received < calculations.total) {
      alert('Số tiền nhận không đủ!');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer?.name || newCustomer.name || '',
        customer_phone: selectedCustomer?.phone || newCustomer.phone || '',
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          serial_number: item.serial_number || null
        })),
        subtotal: calculations.subtotal,
        discount_percent: paymentData.discount,
        discount_amount: calculations.discountAmount,
        tax_amount: calculations.taxAmount,
        total: calculations.total,
        payment_method: paymentData.method,
        received_amount: calculations.received,
        change_amount: calculations.change,
        note: paymentData.note,
        status: 'completed'
      };

      const response = await api.createOrder(orderData);
      
      if (response.success) {
        alert('Đơn hàng đã được tạo thành công!');
        
        // Reset form
        setCart([]);
        setSelectedCustomer(null);
        setNewCustomer({ name: '', phone: '', email: '', address: '' });
        setPaymentData({ method: 'cash', received: '', discount: 0, tax: 0, note: '' });
        
        // Reload products to update inventory
        loadProducts();
      } else {
        alert('Lỗi tạo đơn hàng: ' + response.message);
      }

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Lỗi khi tạo đơn hàng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle barcode scan
  const handleBarcodeScan = (barcode) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
    } else {
      alert('Không tìm thấy sản phẩm với mã: ' + barcode);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel - Products */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">POS System</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMode('pos')}
                className={`px-3 py-1 rounded ${mode === 'pos' ? 'bg-blue-800' : 'bg-blue-500'}`}
              >
                Bán hàng
              </button>
              <button
                onClick={() => setMode('serial')}
                className={`px-3 py-1 rounded ${mode === 'serial' ? 'bg-blue-800' : 'bg-blue-500'}`}
              >
                Quản lý SN
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm hoặc quét mã vạch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && searchTerm) {
                  handleBarcodeScan(searchTerm);
                }
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {mode === 'pos' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
          
          {mode === 'serial' && (
            <SerialNumberManagement products={products.filter(p => p.has_serial_numbers)} />
          )}
        </div>
      </div>

      {/* Right Panel - Cart & Checkout */}
      <div className="w-96 bg-white border-l flex flex-col">
        {/* Cart Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Giỏ hàng ({cart.length})</h2>
            <button
              onClick={() => setCart([])}
              className="text-red-600 hover:text-red-800"
              disabled={cart.length === 0}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Section */}
        <div className="p-4 border-b">
          <CustomerSection
            customers={customers}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
            newCustomer={newCustomer}
            onNewCustomerChange={setNewCustomer}
            onOpenModal={() => setCustomerModal({ open: true, mode: 'select' })}
          />
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCart className="w-16 h-16 mb-4" />
              <p>Giỏ hàng trống</p>
              <p className="text-sm">Thêm sản phẩm để bắt đầu</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cart.map(item => (
                <CartItem
                  key={item.cart_id}
                  item={item}
                  onUpdateQuantity={updateCartQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Payment Section */}
        {cart.length > 0 && (
          <div className="border-t bg-gray-50">
            <PaymentSection
              calculations={calculations}
              paymentData={paymentData}
              onPaymentDataChange={setPaymentData}
              loading={loading}
              onCheckout={handleCheckout}
            />
          </div>
        )}
      </div>

      {/* Serial Number Modal */}
      <SerialNumberModal
        isOpen={serialModal.open}
        product={serialModal.product}
        serialNumbers={availableSerials}
        onSelect={addProductWithSerial}
        onClose={() => {
          setSerialModal({ open: false, product: null });
          setAvailableSerials([]);
        }}
      />

      {/* Customer Modal */}
      <CustomerModal
        isOpen={customerModal.open}
        mode={customerModal.mode}
        customers={customers}
        onSelect={setSelectedCustomer}
        onClose={() => setCustomerModal({ open: false, mode: 'select' })}
      />
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToCart }) => {
  const isOutOfStock = product.quantity <= 0;
  const isLowStock = product.quantity <= product.alert_quantity;

  return (
    <div
      className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all hover:shadow-lg ${
        isOutOfStock 
          ? 'border-red-200 opacity-50 cursor-not-allowed' 
          : isLowStock 
          ? 'border-yellow-200 hover:border-yellow-400'
          : 'border-gray-200 hover:border-blue-400'
      }`}
      onClick={() => !isOutOfStock && onAddToCart(product)}
    >
      {/* Stock Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          isOutOfStock 
            ? 'bg-red-100 text-red-800' 
            : isLowStock 
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {isOutOfStock ? 'Hết hàng' : `Còn ${product.quantity}`}
        </span>
        
        {product.has_serial_numbers && (
          <Package className="w-4 h-4 text-blue-500" title="Có Serial Number" />
        )}
      </div>

      {/* Product Image Placeholder */}
      <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
        <Package className="w-8 h-8 text-gray-400" />
      </div>

      {/* Product Info */}
      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-10">
        {product.name}
      </h3>

      {/* Price */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-blue-600">
            {product.price.toLocaleString()}₫
          </span>
          {product.barcode && (
            <p className="text-xs text-gray-500 mt-1">#{product.barcode}</p>
          )}
        </div>
        
        {!isOutOfStock && (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Plus className="w-4 h-4 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
};

// ... (continued in next part due to length limit) 