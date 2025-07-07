import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import {
  Card,
  Table,
  Button,
  Modal,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Tabs,
  InputNumber,
  Alert,
  Badge,
  Typography,
  Form,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  ShopOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { customersAPI, suppliersAPI, financialAPI } from '../services/api';
import dayjs from 'dayjs';
import DebtPaymentModal from '../components/DebtPaymentModal';
import { toast } from 'sonner';

const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

const DebtPage = () => {
  const [customerDebts, setCustomerDebts] = useState([]);
  const [supplierDebts, setSupplierDebts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('customers');
  const [modalType, setModalType] = useState('payment'); // 'payment' or 'debt'
  const [submitting, setSubmitting] = useState(false);
  const [debtStats, setDebtStats] = useState({
    totalCustomerDebt: 0,
    totalSupplierDebt: 0,
    overduCustomerDebt: 0,
    overdueSupplierDebt: 0,
  });
  const [supplierTransactions, setSupplierTransactions] = useState([]);
  const [customerTransactions, setCustomerTransactions] = useState([]);

  // 🆕 Ant Design Form instance
  const [form] = Form.useForm();

  const paymentMethods = [
    { value: 'cash', label: 'Tiền mặt', icon: <DollarOutlined /> },
    { value: 'card', label: 'Thẻ', icon: <CreditCardOutlined /> },
    { value: 'transfer', label: 'Chuyển khoản', icon: <WalletOutlined /> },
    { value: 'ewallet', label: 'Ví điện tử', icon: <WalletOutlined /> },
  ];

  useEffect(() => {
    console.log('🚀 DebtPage mounted, fetching data...');
    fetchData();
  }, []);

  useEffect(() => {
    console.log('🔄 Customers state updated:', customers);
  }, [customers]);

  useEffect(() => {
    console.log('🔄 Suppliers state updated:', suppliers);
  }, [suppliers]);

  // Process debts when customers/suppliers data changes
  useEffect(() => {
    if (customers.length > 0) {
      fetchCustomerDebts();
    }
  }, [customers]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (suppliers.length > 0) {
      fetchSupplierDebts();
    }
  }, [suppliers]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch supplier transactions for history
  useEffect(() => {
    if (activeTab === 'suppliers') {
      fetchSupplierTransactions();
    }
  }, [activeTab]);

  // Fetch customer transactions for history
  useEffect(() => {
    if (activeTab === 'customers') {
      fetchCustomerTransactions();
    }
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // First fetch all customers and suppliers
      await Promise.all([
        fetchCustomers(),
        fetchSuppliers(),
      ]);
      
      // Then process debts (this will be done in useEffect when customers/suppliers change)
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDebts = async () => {
    try {
      // Use customers data that's already fetched and enhanced
      const customersWithDebt = customers.filter(c => (c.current_debt || 0) > 0);
      setCustomerDebts(customersWithDebt);
      
      // Calculate debt stats
      const totalDebt = customersWithDebt.reduce((sum, c) => sum + (c.current_debt || 0), 0);
      setDebtStats(prev => ({ ...prev, totalCustomerDebt: totalDebt }));
    } catch (error) {
      console.error('Error processing customer debts:', error);
      setCustomerDebts([]);
    }
  };

  const fetchSupplierDebts = async () => {
    try {
      // Use suppliers data that's already fetched and enhanced
      const suppliersWithDebt = suppliers.filter(s => (s.current_debt || 0) > 0);
      setSupplierDebts(suppliersWithDebt);
      
      // Calculate debt stats
      const totalDebt = suppliersWithDebt.reduce((sum, s) => sum + (s.current_debt || 0), 0);
      setDebtStats(prev => ({ ...prev, totalSupplierDebt: totalDebt }));
    } catch (error) {
      console.error('Error processing supplier debts:', error);
      setSupplierDebts([]);
    }
  };

  const fetchSupplierTransactions = async () => {
    try {
      const response = await financialAPI.getTransactions({ type: 'expense', category: 'Trả nợ nhà cung cấp', limit: 10 });
      if (response.data.success) {
        setSupplierTransactions(response.data.data || []);
      } else {
        setSupplierTransactions([]);
      }
    } catch (error) {
      setSupplierTransactions([]);
    }
  };

  const fetchCustomerTransactions = async () => {
    try {
      const response = await financialAPI.getTransactions({ type: 'income', category: 'Thu nợ khách hàng', limit: 10 });
      if (response.data.success) {
        setCustomerTransactions(response.data.data || []);
      } else {
        setCustomerTransactions([]);
      }
    } catch (error) {
      setCustomerTransactions([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      console.log('👥 Raw customers response:', response.data);
      
      if (response.data.success) {
        // Không còn mock, chỉ lấy số nợ thật từ API
        const customersWithDebt = response.data.data.map(customer => ({
          ...customer,
          current_debt: customer.current_debt || 0,
          total_spent: customer.total_spent || 0
        }));
        
        console.log('💰 Customers with debt:', customersWithDebt);
        console.log('📊 Total customers for dropdown:', customersWithDebt.length);
        setCustomers(customersWithDebt);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Fallback: Set empty array to avoid crashes
      setCustomers([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      console.log('🏭 Raw suppliers response:', response.data);
      
      if (response.data.success) {
        // Không còn mock, chỉ lấy số nợ thật từ API
        const suppliersWithDebt = response.data.data.map(supplier => ({
          ...supplier,
          current_debt: supplier.current_debt || 0,
          total_purchases: supplier.total_purchases || 0
        }));
        
        console.log('💰 Suppliers with debt:', suppliersWithDebt);
        console.log('📊 Total suppliers for dropdown:', suppliersWithDebt.length);
        setSuppliers(suppliersWithDebt);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      // Fallback: Set empty array to avoid crashes
      setSuppliers([]);
    }
  };

  // 🆕 Enhanced form submission with proper error handling
  const handlePayDebt = async (values) => {
    try {
      setSubmitting(true);
      console.log('💰 Submitting payment data:', values);
      
      const transactionData = {
        type: activeTab === 'customers' ? 'income' : 'expense',
        category: activeTab === 'customers' ? 'Thu nợ khách hàng' : 'Trả nợ nhà cung cấp',
        amount: values.amount,
        description: values.description || `Thanh toán nợ ${activeTab === 'customers' ? 'khách hàng' : 'nhà cung cấp'}`,
        customer_id: activeTab === 'customers' ? values.entity_id : null,
        supplier_id: activeTab === 'suppliers' ? values.entity_id : null,
        payment_method: values.payment_method,
        transaction_date: values.transaction_date?.toISOString() || new Date().toISOString(),
        user_id: 1,
      };

      console.log('📤 Transaction data to send:', transactionData);

      const response = await financialAPI.create(transactionData);
      if (response.data.success) {
        toast.success('Ghi nhận thanh toán thành công!');
        setModalVisible(false);
        form.resetFields();
        fetchData();
      } else {
        throw new Error(response.data.message || 'Lỗi không xác định');
      }
    } catch (error) {
      console.error('❌ Payment submission error:', error);
      toast.error(error.message || 'Lỗi khi ghi nhận thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  // 🆕 Enhanced modal close handler
  const handleModalClose = () => {
    setModalVisible(false);
    form.resetFields();
    setSubmitting(false);
  };

  const customerColumns = [
    {
      title: 'Mã KH',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          {record.phone && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.phone}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Loại KH',
      dataIndex: 'customer_type',
      key: 'customer_type',
      render: (type) => {
        const colors = {
          regular: 'default',
          vip: 'gold',
          wholesale: 'blue',
        };
        const labels = {
          regular: 'Thường',
          vip: 'VIP',
          wholesale: 'Sỉ',
        };
        return <Tag color={colors[type]}>{labels[type]}</Tag>;
      },
    },
    {
      title: 'Số nợ',
      dataIndex: 'current_debt',
      key: 'current_debt',
      render: (debt) => (
        <Text strong style={{ color: debt > 0 ? '#ff4d4f' : '#52c41a' }}>
          {debt.toLocaleString('vi-VN')} ₫
        </Text>
      ),
      sorter: (a, b) => a.current_debt - b.current_debt,
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'total_spent',
      key: 'total_spent',
      render: (spent) => (
        <Text type="secondary">
          {spent ? spent.toLocaleString('vi-VN') : 0} ₫
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const debt = record.current_debt || 0;
        if (debt === 0) {
          return <Badge status="success" text="Đã thanh toán" />;
        } else if (debt > 1000000) {
          return <Badge status="error" text="Nợ lớn" />;
        } else {
          return <Badge status="warning" text="Có nợ" />;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<DollarOutlined />}
            onClick={() => {
              setModalType('payment');
              setActiveTab('customers');
              setModalVisible(true);
              // 🆕 Set form values với Ant Design Form
              form.setFieldsValue({
                entity_id: record.id,
                payment_method: 'cash',
                transaction_date: dayjs(),
                amount: record.current_debt || 0,
                description: `Thanh toán nợ khách hàng ${record.name}`
              });
            }}
          >
            Thanh toán
          </Button>
        </Space>
      ),
    },
  ];

  const supplierColumns = [
    {
      title: 'Mã NCC',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          {record.phone && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.phone}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Số nợ',
      dataIndex: 'current_debt',
      key: 'current_debt',
      render: (debt) => (
        <Text strong style={{ color: debt > 0 ? '#ff4d4f' : '#52c41a' }}>
          {(debt || 0).toLocaleString('vi-VN')} ₫
        </Text>
      ),
      sorter: (a, b) => (a.current_debt || 0) - (b.current_debt || 0),
    },
    {
      title: 'Tổng mua hàng',
      dataIndex: 'total_purchases',
      key: 'total_purchases',
      render: (purchases) => (
        <Text type="secondary">
          {(purchases || 0).toLocaleString('vi-VN')} ₫
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const debt = record.current_debt || 0;
        if (debt === 0) {
          return <Badge status="success" text="Đã thanh toán" />;
        } else if (debt > 1000000) {
          return <Badge status="error" text="Nợ lớn" />;
        } else {
          return <Badge status="warning" text="Có nợ" />;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<DollarOutlined />}
            onClick={() => {
              setModalType('payment');
              setActiveTab('suppliers');
              setModalVisible(true);
              form.setFieldsValue({
                entity_id: record.id,
                payment_method: 'cash',
                transaction_date: dayjs(),
                amount: record.current_debt || 0,
                description: `Thanh toán nợ nhà cung cấp ${record.name}`
              });
            }}
          >
            Thanh toán
          </Button>
        </Space>
      ),
    },
  ];

  const supplierHistoryColumns = [
    {
      title: 'Ngày',
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      width: 100,
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
      render: (name) => name || 'Không xác định',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <span style={{ color: '#cf1322', fontWeight: 500 }}>- {(amount || 0).toLocaleString('vi-VN')} ₫</span>,
      width: 120,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (desc) => desc || 'Trả nợ nhà cung cấp',
    },
  ];

  const customerHistoryColumns = [
    {
      title: 'Ngày',
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      width: 100,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: (name) => name || 'Không xác định',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <span style={{ color: '#52c41a', fontWeight: 500 }}>+ {(amount || 0).toLocaleString('vi-VN')} ₫</span>,
      width: 120,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (desc) => desc || 'Thu nợ khách hàng',
    },
  ];

  const renderDebtSummary = () => {
    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng nợ"
              value={customerDebts.length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng nợ nhà cung cấp"
              value={debtStats.totalSupplierDebt}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ShopOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng nợ phải thu"
              value={debtStats.totalCustomerDebt + debtStats.totalSupplierDebt}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      {renderDebtSummary()}

      <Alert
        message="Quản lý nợ"
        description="Theo dõi và quản lý các khoản nợ của khách hàng và nhà cung cấp. Hệ thống sẽ tự động cập nhật số dư nợ khi có giao dịch thanh toán."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <UserOutlined />
              Khách hàng nợ ({customerDebts.length})
            </span>
          }
          key="customers"
        >
          <Row gutter={24}>
            <Col span={15}>
              <Card
                title="Danh sách khách hàng có nợ"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setModalType('payment');
                      setActiveTab('customers');
                      setModalVisible(true);
                      // 🆕 Reset form với values mặc định
                      form.setFieldsValue({
                        payment_method: 'cash',
                        transaction_date: dayjs(),
                        entity_id: undefined,
                        amount: undefined,
                        description: ''
                      });
                    }}
                  >
                    Ghi nhận thanh toán
                  </Button>
                }
              >
                <Table
                  columns={customerColumns}
                  dataSource={customerDebts}
                  loading={loading}
                  rowKey="id"
                  pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} của ${total} khách hàng`,
                  }}
                />
              </Card>
            </Col>
            <Col span={9}>
              <Card
                title="Lịch sử thu nợ khách hàng"
                bordered={true}
                style={{ minHeight: 400 }}
              >
                <Table
                  columns={customerHistoryColumns}
                  dataSource={customerTransactions}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 8 }}
                  locale={{ emptyText: 'Chưa có giao dịch' }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane
          tab={
            <span>
              <ShopOutlined />
              Nợ nhà cung cấp ({supplierDebts.length})
            </span>
          }
          key="suppliers"
        >
          <Row gutter={24}>
            <Col span={15}>
              <Card
                title="Danh sách nhà cung cấp có nợ"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setModalType('payment');
                      setActiveTab('suppliers');
                      setModalVisible(true);
                      // 🆕 Reset form với values mặc định
                      form.setFieldsValue({
                        payment_method: 'cash',
                        transaction_date: dayjs(),
                        entity_id: undefined,
                        amount: undefined,
                        description: ''
                      });
                    }}
                  >
                    Ghi nhận thanh toán
                  </Button>
                }
              >
                <Table
                  columns={supplierColumns}
                  dataSource={supplierDebts}
                  loading={loading}
                  rowKey="id"
                  pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} của ${total} nhà cung cấp`,
                  }}
                />
              </Card>
            </Col>
            <Col span={9}>
              <Card
                title="Lịch sử thanh toán nợ nhà cung cấp"
                bordered={true}
                style={{ minHeight: 400 }}
              >
                <Table
                  columns={supplierHistoryColumns}
                  dataSource={supplierTransactions}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 8 }}
                  locale={{ emptyText: 'Chưa có giao dịch' }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* 🆕 Enhanced Modal with Ant Design Form */}
      <DebtPaymentModal
        open={modalVisible}
        onClose={handleModalClose}
        onSubmit={handlePayDebt}
        activeTab={activeTab}
        modalType={modalType}
        form={form}
        customers={customers}
        suppliers={suppliers}
        submitting={submitting}
      />
    </div>
  );
};

export default DebtPage; 