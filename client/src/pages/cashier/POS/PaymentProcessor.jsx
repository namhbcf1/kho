// =====================================================
// 💳 PAYMENT PROCESSOR & CUSTOMER LOOKUP
// =====================================================

// pages/cashier/POS/PaymentProcessor.jsx - Xử lý thanh toán
import React, { useState, useEffect } from 'react';
import { Modal, Card, Button, InputNumber, Radio, Space, Typography, Divider, message, Row, Col } from 'antd';
import {
  CreditCardOutlined,
  DollarOutlined,
  QrcodeOutlined,
  BankOutlined,
  PrinterOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const PaymentProcessor = ({ 
  visible, 
  onCancel, 
  onPaymentComplete, 
  cart, 
  customer, 
  total 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState(total);
  const [processing, setProcessing] = useState(false);
  const [splitPayments, setSplitPayments] = useState([]);
  const [isSplitPayment, setIsSplitPayment] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Reset state khi modal mở
  useEffect(() => {
    if (visible) {
      setCashReceived(total);
      setPaymentMethod('cash');
      setSplitPayments([]);
      setIsSplitPayment(false);
      setProcessing(false);
    }
  }, [visible, total]);

  // Tính tiền thừa
  const calculateChange = () => {
    if (paymentMethod === 'cash') {
      return Math.max(0, cashReceived - total);
    }
    return 0;
  };

  // Gợi ý mệnh giá tiền
  const suggestedAmounts = [
    total,
    Math.ceil(total / 100000) * 100000,
    Math.ceil(total / 500000) * 500000,
    Math.ceil(total / 1000000) * 1000000
  ].filter((value, index, self) => self.indexOf(value) === index);

  // Xử lý thanh toán đơn giản
  const handleSimplePayment = async () => {
    setProcessing(true);
    
    try {
      // Validation
      if (paymentMethod === 'cash' && cashReceived < total) {
        message.error('Số tiền nhận không đủ!');
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentData = {
        method: paymentMethod,
        amount: total,
        received: paymentMethod === 'cash' ? cashReceived : total,
        change: calculateChange(),
        timestamp: new Date().toISOString(),
        reference: `PAY-${Date.now()}`
      };

      onPaymentComplete(paymentData);
    } catch (error) {
      message.error('Lỗi xử lý thanh toán!');
    } finally {
      setProcessing(false);
    }
  };

  // Thêm phương thức thanh toán cho split payment
  const addSplitPayment = () => {
    const remaining = total - splitPayments.reduce((sum, p) => sum + p.amount, 0);
    if (remaining > 0) {
      setSplitPayments([
        ...splitPayments,
        {
          id: Date.now(),
          method: 'cash',
          amount: remaining
        }
      ]);
    }
  };

  // Cập nhật split payment
  const updateSplitPayment = (id, field, value) => {
    setSplitPayments(prev => 
      prev.map(payment => 
        payment.id === id ? { ...payment, [field]: value } : payment
      )
    );
  };

  // Xóa split payment
  const removeSplitPayment = (id) => {
    setSplitPayments(prev => prev.filter(p => p.id !== id));
  };

  const renderPaymentMethods = () => (
    <Radio.Group 
      value={paymentMethod} 
      onChange={(e) => setPaymentMethod(e.target.value)}
      className="w-full"
    >
      <Space direction="vertical" className="w-full">
        <Radio value="cash" className="w-full">
          <div className="flex items-center">
            <DollarOutlined className="mr-2 text-green-600" />
            <span>Tiền mặt</span>
          </div>
        </Radio>
        
        <Radio value="card" className="w-full">
          <div className="flex items-center">
            <CreditCardOutlined className="mr-2 text-blue-600" />
            <span>Thẻ ngân hàng</span>
          </div>
        </Radio>
        
        <Radio value="qr" className="w-full">
          <div className="flex items-center">
            <QrcodeOutlined className="mr-2 text-purple-600" />
            <span>QR Code (MoMo, ZaloPay, VNPay)</span>
          </div>
        </Radio>
        
        <Radio value="transfer" className="w-full">
          <div className="flex items-center">
            <BankOutlined className="mr-2 text-orange-600" />
            <span>Chuyển khoản</span>
          </div>
        </Radio>
      </Space>
    </Radio.Group>
  );

  const renderCashPayment = () => (
    <div className="space-y-4">
      <div>
        <Text strong>Số tiền khách đưa:</Text>
        <InputNumber
          value={cashReceived}
          onChange={setCashReceived}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          className="w-full mt-2"
          size="large"
          min={0}
        />
      </div>
      
      <div>
        <Text strong>Gợi ý mệnh giá:</Text>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {suggestedAmounts.map(amount => (
            <Button
              key={amount}
              onClick={() => setCashReceived(amount)}
              className={cashReceived === amount ? 'border-blue-500 bg-blue-50' : ''}
            >
              {formatCurrency(amount)}
            </Button>
          ))}
        </div>
      </div>
      
      <Card className="bg-gray-50">
        <div className="flex justify-between items-center">
          <Text>Tiền thừa:</Text>
          <Title level={4} className={`m-0 ${calculateChange() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(calculateChange())}
          </Title>
        </div>
      </Card>
    </div>
  );

  return (
    <Modal
      title="Thanh toán"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Order Summary */}
        <Card title="Thông tin đơn hàng" size="small">
          <div className="space-y-2">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            
            <Divider className="my-2" />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng:</span>
              <span className="text-green-600">{formatCurrency(total)}</span>
            </div>
            
            {customer && (
              <>
                <Divider className="my-2" />
                <div className="text-sm text-gray-600">
                  Khách hàng: <span className="font-semibold">{customer.name}</span>
                  {customer.phone && <span> - {customer.phone}</span>}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Split Payment Toggle */}
        <div className="flex items-center justify-between">
          <Title level={5} className="m-0">Phương thức thanh toán</Title>
          <Button
            type="link"
            onClick={() => setIsSplitPayment(!isSplitPayment)}
          >
            {isSplitPayment ? 'Thanh toán đơn giản' : 'Thanh toán kết hợp'}
          </Button>
        </div>

        {!isSplitPayment ? (
          // Simple Payment
          <div className="space-y-4">
            {renderPaymentMethods()}
            
            {paymentMethod === 'cash' && renderCashPayment()}
            
            {paymentMethod === 'qr' && (
              <Card className="text-center">
                <QrcodeOutlined style={{ fontSize: '80px', color: '#1890ff' }} />
                <div className="mt-4">
                  <Text>Quét mã QR để thanh toán</Text>
                  <div className="text-lg font-bold mt-2">{formatCurrency(total)}</div>
                </div>
              </Card>
            )}
            
            {(paymentMethod === 'card' || paymentMethod === 'transfer') && (
              <Card className="text-center">
                <CreditCardOutlined style={{ fontSize: '80px', color: '#52c41a' }} />
                <div className="mt-4">
                  <Text>
                    {paymentMethod === 'card' 
                      ? 'Vui lòng quẹt/cắm thẻ vào máy POS' 
                      : 'Vui lòng chuyển khoản theo thông tin'}
                  </Text>
                  <div className="text-lg font-bold mt-2">{formatCurrency(total)}</div>
                </div>
              </Card>
            )}
          </div>
        ) : (
          // Split Payment
          <div className="space-y-4">
            <Card title="Thanh toán kết hợp" size="small">
              {splitPayments.map((payment, index) => (
                <div key={payment.id} className="mb-4 p-3 border rounded">
                  <Row gutter={16} align="middle">
                    <Col span={8}>
                      <Radio.Group
                        value={payment.method}
                        onChange={(e) => updateSplitPayment(payment.id, 'method', e.target.value)}
                        size="small"
                      >
                        <Radio.Button value="cash">Tiền mặt</Radio.Button>
                        <Radio.Button value="card">Thẻ</Radio.Button>
                      </Radio.Group>
                    </Col>
                    <Col span={10}>
                      <InputNumber
                        value={payment.amount}
                        onChange={(value) => updateSplitPayment(payment.id, 'amount', value)}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        className="w-full"
                        min={0}
                        max={total}
                      />
                    </Col>
                    <Col span={6}>
                      <Button 
                        danger 
                        onClick={() => removeSplitPayment(payment.id)}
                        disabled={splitPayments.length === 1}
                      >
                        Xóa
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
              
              <Button 
                type="dashed" 
                onClick={addSplitPayment}
                disabled={splitPayments.reduce((sum, p) => sum + p.amount, 0) >= total}
                block
              >
                Thêm phương thức thanh toán
              </Button>
              
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="flex justify-between">
                  <span>Đã thanh toán:</span>
                  <span className="font-bold">
                    {formatCurrency(splitPayments.reduce((sum, p) => sum + p.amount, 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Còn lại:</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(total - splitPayments.reduce((sum, p) => sum + p.amount, 0))}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Payment Actions */}
        <div className="flex justify-end space-x-3">
          <Button onClick={onCancel} disabled={processing}>
            Hủy
          </Button>
          
          <Button
            type="primary"
            onClick={handleSimplePayment}
            loading={processing}
            disabled={
              (!isSplitPayment && paymentMethod === 'cash' && cashReceived < total) ||
              (isSplitPayment && splitPayments.reduce((sum, p) => sum + p.amount, 0) !== total)
            }
            icon={processing ? null : <CheckCircleOutlined />}
            size="large"
          >
            {processing ? 'Đang xử lý...' : 'Hoàn thành thanh toán'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentProcessor;

// pages/cashier/Customers/CustomerLookup.jsx - Tra cứu khách hàng
import React, { useState } from 'react';
import { Input, Button, Modal, Table, Tag, Space, Avatar, Card } from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  PhoneOutlined,
  MailOutlined,
  StarOutlined
} from '@ant-design/icons';

const CustomerLookup = ({ selectedCustomer, onCustomerSelect }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customers] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn An',
      phone: '0901234567',
      email: 'nguyenvanan@email.com',
      loyaltyPoints: 1250,
      membershipLevel: 'Gold',
      totalSpent: 25000000,
      lastVisit: '2024-12-15'
    },
    {
      id: 2,
      name: 'Trần Thị Bình',
      phone: '0912345678',
      email: 'tranthibinh@email.com',
      loyaltyPoints: 850,
      membershipLevel: 'Silver',
      totalSpent: 15000000,
      lastVisit: '2024-12-10'
    },
    {
      id: 3,
      name: 'Lê Minh Cường',
      phone: '0923456789',
      email: 'leminhcuong@email.com',
      loyaltyPoints: 2100,
      membershipLevel: 'Platinum',
      totalSpent: 45000000,
      lastVisit: '2024-12-14'
    }
  ]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCustomerSelect = (customer) => {
    onCustomerSelect(customer);
    setIsModalVisible(false);
    setSearchQuery('');
  };

  const getMembershipColor = (level) => {
    switch (level) {
      case 'Platinum': return 'purple';
      case 'Gold': return 'gold';
      case 'Silver': return 'silver';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, customer) => (
        <div className="flex items-center space-x-3">
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-semibold">{customer.name}</div>
            <div className="text-sm text-gray-500">
              <PhoneOutlined className="mr-1" />
              {customer.phone}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Hạng thành viên',
      dataIndex: 'membershipLevel',
      key: 'membershipLevel',
      render: (level) => (
        <Tag color={getMembershipColor(level)} icon={<StarOutlined />}>
          {level}
        </Tag>
      )
    },
    {
      title: 'Điểm tích lũy',
      dataIndex: 'loyaltyPoints',
      key: 'loyaltyPoints',
      render: (points) => (
        <span className="font-semibold text-orange-600">
          {points.toLocaleString()} điểm
        </span>
      )
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: (amount) => (
        <span className="font-semibold text-green-600">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(amount)}
        </span>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, customer) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleCustomerSelect(customer)}
        >
          Chọn
        </Button>
      )
    }
  ];

  return (
    <>
      <div className="customer-lookup">
        <div className="flex items-center space-x-2">
          <UserOutlined className="text-gray-500" />
          <span className="text-sm font-medium">Khách hàng:</span>
          
          {selectedCustomer ? (
            <div className="flex items-center space-x-2 flex-1">
              <Tag 
                color={getMembershipColor(selectedCustomer.membershipLevel)}
                className="m-0"
              >
                {selectedCustomer.name}
              </Tag>
              <span className="text-sm text-gray-500">
                {selectedCustomer.loyaltyPoints} điểm
              </span>
              <Button
                type="link"
                size="small"
                onClick={() => onCustomerSelect(null)}
                className="p-0 h-auto"
              >
                Xóa
              </Button>
            </div>
          ) : (
            <Button
              type="dashed"
              size="small"
              icon={<SearchOutlined />}
              onClick={() => setIsModalVisible(true)}
              className="flex-1"
            >
              Tìm kiếm khách hàng
            </Button>
          )}
        </div>
      </div>

      <Modal
        title="Tìm kiếm khách hàng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Tìm theo tên, số điện thoại hoặc email..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="large"
              className="flex-1"
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="large"
            >
              Khách hàng mới
            </Button>
          </div>

          <Table
            dataSource={filteredCustomers}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ y: 400 }}
          />

          {filteredCustomers.length === 0 && searchQuery && (
            <div className="text-center py-8 text-gray-500">
              <UserOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div>Không tìm thấy khách hàng</div>
              <Button type="link" icon={<PlusOutlined />}>
                Tạo khách hàng mới với từ khóa "{searchQuery}"
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default CustomerLookup;