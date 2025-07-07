import React, { useState } from 'react';
import { 
  ShoppingCart, User, Package, Plus, Minus, Trash2, 
  Phone, Mail, X, RotateCcw, Receipt
} from 'lucide-react';

// Cart Item Component
export const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
  <div className="bg-gray-50 rounded-lg p-3 border">
    <div className="flex justify-between items-start mb-2">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 text-sm">{item.product_name}</h4>
        {item.serial_number && (
          <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
            SN: {item.serial_number}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(item.cart_id)}
        className="text-red-500 hover:text-red-700 ml-2"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {!item.serial_number && (
          <>
            <button
              onClick={() => onUpdateQuantity(item.cart_id, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 text-sm"
              disabled={item.quantity <= 1}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.cart_id, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 text-sm"
              disabled={item.quantity >= item.max_quantity}
            >
              <Plus className="w-3 h-3" />
            </button>
          </>
        )}
        {item.serial_number && (
          <span className="text-sm text-gray-600">Qty: 1</span>
        )}
      </div>

      <div className="text-right">
        <p className="text-xs text-gray-600">{item.price.toLocaleString()}₫</p>
        <p className="font-bold text-sm text-gray-900">{item.total.toLocaleString()}₫</p>
      </div>
    </div>
  </div>
);

// Customer Section Component
export const CustomerSection = ({ 
  customers, 
  selectedCustomer, 
  onSelectCustomer, 
  newCustomer, 
  onNewCustomerChange,
  onOpenModal 
}) => {
  const [mode, setMode] = useState('existing'); // 'existing' or 'new'

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Khách hàng</label>
        <div className="flex space-x-2">
          <button
            onClick={() => setMode('existing')}
            className={`text-xs px-2 py-1 rounded ${
              mode === 'existing' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            Có sẵn
          </button>
          <button
            onClick={() => setMode('new')}
            className={`text-xs px-2 py-1 rounded ${
              mode === 'new' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            Mới
          </button>
        </div>
      </div>

      {mode === 'existing' ? (
        <select
          value={selectedCustomer?.id || ''}
          onChange={(e) => {
            const customer = customers.find(c => c.id === parseInt(e.target.value));
            onSelectCustomer(customer || null);
          }}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        >
          <option value="">Chọn khách hàng</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name} - {customer.phone}
            </option>
          ))}
        </select>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Tên khách hàng"
            value={newCustomer.name}
            onChange={(e) => onNewCustomerChange({...newCustomer, name: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          />
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={newCustomer.phone}
            onChange={(e) => onNewCustomerChange({...newCustomer, phone: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          />
        </div>
      )}
    </div>
  );
};

// Payment Section Component
export const PaymentSection = ({ 
  calculations, 
  paymentData, 
  onPaymentDataChange, 
  loading, 
  onCheckout 
}) => (
  <div className="p-4 space-y-4">
    {/* Totals Summary */}
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Tạm tính:</span>
        <span>{calculations.subtotal.toLocaleString()}₫</span>
      </div>
      
      {paymentData.discount > 0 && (
        <div className="flex justify-between text-red-600">
          <span>Giảm giá ({paymentData.discount}%):</span>
          <span>-{calculations.discountAmount.toLocaleString()}₫</span>
        </div>
      )}
      
      {paymentData.tax > 0 && (
        <div className="flex justify-between">
          <span>Thuế ({paymentData.tax}%):</span>
          <span>{calculations.taxAmount.toLocaleString()}₫</span>
        </div>
      )}
      
      <div className="flex justify-between text-lg font-bold border-t pt-2">
        <span>Tổng cộng:</span>
        <span className="text-blue-600">{calculations.total.toLocaleString()}₫</span>
      </div>
    </div>

    {/* Discount & Tax */}
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Giảm giá (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={paymentData.discount}
          onChange={(e) => onPaymentDataChange({
            ...paymentData, 
            discount: parseFloat(e.target.value) || 0
          })}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Thuế (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={paymentData.tax}
          onChange={(e) => onPaymentDataChange({
            ...paymentData, 
            tax: parseFloat(e.target.value) || 0
          })}
          className="w-full p-2 border border-gray-300 rounded text-sm"
        />
      </div>
    </div>

    {/* Payment Method */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Thanh toán</label>
      <select
        value={paymentData.method}
        onChange={(e) => onPaymentDataChange({...paymentData, method: e.target.value})}
        className="w-full p-2 border border-gray-300 rounded text-sm"
      >
        <option value="cash">Tiền mặt</option>
        <option value="card">Thẻ</option>
        <option value="transfer">Chuyển khoản</option>
        <option value="ewallet">Ví điện tử</option>
      </select>
    </div>

    {/* Cash Payment Details */}
    {paymentData.method === 'cash' && (
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiền nhận</label>
          <input
            type="number"
            value={paymentData.received}
            onChange={(e) => onPaymentDataChange({...paymentData, received: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder="Nhập số tiền nhận"
          />
        </div>
        
        {calculations.received > 0 && (
          <div className="flex justify-between text-lg">
            <span>Tiền thừa:</span>
            <span className="font-bold text-green-600">
              {calculations.change.toLocaleString()}₫
            </span>
          </div>
        )}
      </>
    )}

    {/* Note */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
      <textarea
        value={paymentData.note}
        onChange={(e) => onPaymentDataChange({...paymentData, note: e.target.value})}
        className="w-full p-2 border border-gray-300 rounded text-sm"
        rows={2}
        placeholder="Ghi chú đơn hàng..."
      />
    </div>

    {/* Quick Amount Buttons */}
    {paymentData.method === 'cash' && (
      <div className="grid grid-cols-3 gap-2">
        {[
          calculations.total,
          Math.ceil(calculations.total / 100000) * 100000,
          Math.ceil(calculations.total / 500000) * 500000
        ].map((amount, index) => (
          <button
            key={index}
            onClick={() => onPaymentDataChange({
              ...paymentData, 
              received: amount.toString()
            })}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
          >
            {amount.toLocaleString()}₫
          </button>
        ))}
      </div>
    )}

    {/* Checkout Button */}
    <button
      onClick={onCheckout}
      disabled={
        loading || 
        (paymentData.method === 'cash' && calculations.received < calculations.total)
      }
      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {loading ? (
        <RotateCcw className="w-5 h-5 animate-spin mr-2" />
      ) : (
        <Receipt className="w-5 h-5 mr-2" />
      )}
      {loading ? 'Đang xử lý...' : 'Thanh toán'}
    </button>
  </div>
);

// Serial Number Modal Component
export const SerialNumberModal = ({ isOpen, product, serialNumbers, onSelect, onClose }) => {
  const [selectedSerial, setSelectedSerial] = useState('');

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Chọn Serial Number</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">Sản phẩm: <strong>{product.name}</strong></p>
          <p className="text-sm text-gray-500">Chọn một serial number để thêm vào giỏ hàng</p>
        </div>
        
        {serialNumbers.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Không có serial number khả dụng</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
            {serialNumbers.map(serial => (
              <label 
                key={serial.id} 
                className="flex items-center p-3 hover:bg-gray-50 rounded border cursor-pointer"
              >
                <input
                  type="radio"
                  name="serial"
                  value={serial.serial_number}
                  checked={selectedSerial === serial.serial_number}
                  onChange={(e) => setSelectedSerial(e.target.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <span className="font-mono font-medium">{serial.serial_number}</span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    serial.status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {serial.status === 'available' ? 'Có sẵn' : 'Không có sẵn'}
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              const serial = serialNumbers.find(s => s.serial_number === selectedSerial);
              if (serial) onSelect(serial);
            }}
            disabled={!selectedSerial}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Chọn
          </button>
        </div>
      </div>
    </div>
  );
};

// Customer Modal Component  
export const CustomerModal = ({ isOpen, mode, customers, onSelect, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Chọn khách hàng</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {customers.map(customer => (
            <button
              key={customer.id}
              onClick={() => {
                onSelect(customer);
                onClose();
              }}
              className="w-full text-left p-3 hover:bg-gray-50 rounded border"
            >
              <div className="font-medium">{customer.name}</div>
              <div className="text-sm text-gray-600 flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                {customer.phone}
              </div>
              {customer.email && (
                <div className="text-sm text-gray-600 flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  {customer.email}
                </div>
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// Serial Number Management Component
export const SerialNumberManagement = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [serialNumbers, setSerialNumbers] = useState([]);
  const [newSerial, setNewSerial] = useState('');
  const [bulkSerials, setBulkSerials] = useState('');

  const loadSerialNumbers = async (productId) => {
    // Mock data - replace with API call
    const mockSerials = [
      { id: 1, serial_number: 'SN001', status: 'available', created_at: '2024-01-01' },
      { id: 2, serial_number: 'SN002', status: 'sold', created_at: '2024-01-02' },
      { id: 3, serial_number: 'SN003', status: 'available', created_at: '2024-01-03' }
    ];
    setSerialNumbers(mockSerials);
  };

  const addSingleSerial = () => {
    if (!newSerial.trim() || !selectedProduct) return;
    
    // Mock adding
    setSerialNumbers(prev => [...prev, {
      id: Date.now(),
      serial_number: newSerial.trim(),
      status: 'available',
      created_at: new Date().toISOString()
    }]);
    setNewSerial('');
  };

  const addBulkSerials = () => {
    if (!bulkSerials.trim() || !selectedProduct) return;
    
    const serials = bulkSerials.split('\n').filter(s => s.trim());
    const newEntries = serials.map((serial, index) => ({
      id: Date.now() + index,
      serial_number: serial.trim(),
      status: 'available',
      created_at: new Date().toISOString()
    }));
    
    setSerialNumbers(prev => [...prev, ...newEntries]);
    setBulkSerials('');
  };

  return (
    <div className="space-y-6">
      {/* Product Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn sản phẩm có Serial Number
        </label>
        <select
          value={selectedProduct?.id || ''}
          onChange={(e) => {
            const product = products.find(p => p.id === parseInt(e.target.value));
            setSelectedProduct(product || null);
            if (product) loadSerialNumbers(product.id);
          }}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <>
          {/* Add Single Serial */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Thêm Serial Number đơn lẻ</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSerial}
                onChange={(e) => setNewSerial(e.target.value)}
                placeholder="Nhập serial number"
                className="flex-1 p-2 border border-gray-300 rounded"
              />
              <button
                onClick={addSingleSerial}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Add Bulk Serials */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Thêm nhiều Serial Number</h3>
            <textarea
              value={bulkSerials}
              onChange={(e) => setBulkSerials(e.target.value)}
              placeholder="Nhập từng serial number trên một dòng"
              className="w-full p-2 border border-gray-300 rounded h-24 mb-2"
            />
            <button
              onClick={addBulkSerials}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Thêm tất cả
            </button>
          </div>

          {/* Serial Numbers List */}
          <div>
            <h3 className="font-medium mb-3">Danh sách Serial Number ({serialNumbers.length})</h3>
            <div className="bg-white rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Serial Number</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {serialNumbers.map(serial => (
                    <tr key={serial.id}>
                      <td className="px-4 py-2 font-mono text-sm">{serial.serial_number}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          serial.status === 'available' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {serial.status === 'available' ? 'Có sẵn' : 'Đã bán'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {new Date(serial.created_at).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default {
  CartItem,
  CustomerSection,
  PaymentSection,
  SerialNumberModal,
  CustomerModal,
  SerialNumberManagement
}; 