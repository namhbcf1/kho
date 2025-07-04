import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  Radio,
  Form,
  message,
} from 'antd';
import {
  PlusOutlined,
  FilterOutlined,
  DownloadOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { financialAPI, reportsAPI } from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const FinancialPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    todayIncome: 0,
    monthIncome: 0,
  });
  const [activeTab, setActiveTab] = useState('transactions');
  const [chartData, setChartData] = useState([]);
  const [form] = Form.useForm();

  const categories = {
    income: [
      'Bán hàng',
      'Dịch vụ',
      'Thu khác',
      'Lãi ngân hàng',
      'Hoàn tiền',
      'Thu nợ khách hàng',
    ],
    expense: [
      'Nhập hàng',
      'Tiền thuê',
      'Điện nước',
      'Lương nhân viên',
      'Marketing',
      'Vận chuyển',
      'Bảo trì sửa chữa',
      'Chi phí khác',
      'Trả nợ nhà cung cấp',
    ],
  };

  const paymentMethods = [
    { value: 'cash', label: 'Tiền mặt' },
    { value: 'card', label: 'Thẻ' },
    { value: 'transfer', label: 'Chuyển khoản' },
    { value: 'ewallet', label: 'Ví điện tử' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      generateChartData();
    }
  }, [transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await financialAPI.getTransactions();
      if (response.data.success) {
        setTransactions(response.data.data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu thu chi');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reportsAPI.getFinancialSummary();
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setStats({});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({});
    }
  };

  const generateChartData = () => {
    // Monthly data for line chart
    const monthlyData = [];
    const currentMonth = dayjs();
    
    for (let i = 5; i >= 0; i--) {
      const month = currentMonth.subtract(i, 'month');
      const monthTransactions = transactions.filter(t => {
        const transactionDate = dayjs(t.transaction_date);
        return transactionDate.month() === month.month() && 
               transactionDate.year() === month.year();
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      monthlyData.push({
        month: month.format('MM/YYYY'),
        income,
        expense,
        profit: income - expense,
      });
    }
    
    setChartData(monthlyData);
  };

  const handleAddTransaction = async (values) => {
    try {
      console.log('🔄 Submitting transaction data:', values);
      
      const transactionData = {
        ...values,
        transaction_date: values.transaction_date?.toISOString() || new Date().toISOString(),
        user_id: 1, // Current user ID
      };

      console.log('📤 Final transaction data:', transactionData);

      const response = await financialAPI.create(transactionData);
      console.log('✅ API Response:', response);
      
      if (response.data.success) {
        message.success('Thêm giao dịch thành công');
        setModalVisible(false);
        form.resetFields();
        fetchTransactions();
        fetchStats();
      } else {
        message.error(response.data.message || 'Lỗi khi thêm giao dịch');
      }
    } catch (error) {
      console.error('❌ Transaction submission error:', error);
      message.error(`Lỗi khi thêm giao dịch: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleModalOpen = () => {
    setModalVisible(true);
    form.setFieldsValue({
      type: 'income',
      payment_method: 'cash',
      transaction_date: dayjs(),
    });
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.transaction_date).unix() - dayjs(b.transaction_date).unix(),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'income' ? 'green' : 'red'}>
          {type === 'income' ? 'Thu' : 'Chi'}
        </Tag>
      ),
      filters: [
        { text: 'Thu', value: 'income' },
        { text: 'Chi', value: 'expense' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <span style={{ color: record.type === 'income' ? '#52c41a' : '#ff4d4f' }}>
          {record.type === 'income' ? '+' : '-'}{amount.toLocaleString('vi-VN')} ₫
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Phương thức TT',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => {
        const methodMap = {
          cash: 'Tiền mặt',
          card: 'Thẻ',
          transfer: 'Chuyển khoản',
          ewallet: 'Ví điện tử',
        };
        return methodMap[method] || method;
      },
    },
    {
      title: 'Người tạo',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (name) => name || 'Chưa xác định',
    },
  ];

  const renderTransactionsTab = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng thu"
              value={stats.total_income || stats.totalIncome}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<RiseOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng chi"
              value={stats.total_expense || stats.totalExpense}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<FallOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Lợi nhuận"
              value={stats.net_profit || stats.netProfit}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Thu hôm nay"
              value={stats.today_income || stats.todayIncome}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<RiseOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Giao dịch tài chính"
        extra={
          <Space>
            <Button icon={<FilterOutlined />}>
              Lọc
            </Button>
            <Button icon={<DownloadOutlined />}>
              Xuất báo cáo
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleModalOpen}
            >
              Thêm giao dịch
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={transactions}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} giao dịch`,
          }}
        />
      </Card>
    </div>
  );

  const renderChartsTab = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Biểu đồ doanh thu theo tháng" icon={<BarChartOutlined />}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`} />
                <Legend />
                <Bar dataKey="income" fill="#52c41a" name="Thu" />
                <Bar dataKey="expense" fill="#ff4d4f" name="Chi" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Biểu đồ lợi nhuận theo tháng" icon={<LineChart />}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name="Lợi nhuận"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Giao dịch" key="transactions">
          {renderTransactionsTab()}
        </TabPane>
        <TabPane tab="Biểu đồ" key="charts">
          {renderChartsTab()}
        </TabPane>
      </Tabs>

      <Modal
        title="Thêm giao dịch tài chính"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddTransaction}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Loại giao dịch"
                name="type"
                rules={[{ required: true, message: 'Vui lòng chọn loại giao dịch' }]}
              >
                <Radio.Group
                  onChange={(e) => {
                    form.setFieldsValue({ category: undefined });
                  }}
                >
                  <Radio value="income">Thu</Radio>
                  <Radio value="expense">Chi</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select placeholder="Chọn danh mục">
                  {categories[form.getFieldValue('type') || 'income']?.map((category) => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số tiền"
                name="amount"
                rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
              >
                <InputNumber
                  placeholder="Nhập số tiền"
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Phương thức thanh toán"
                name="payment_method"
                rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}
              >
                <Select placeholder="Chọn phương thức">
                  {paymentMethods.map((method) => (
                    <Option key={method.value} value={method.value}>
                      {method.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả giao dịch' }]}
          >
            <Input.TextArea
              placeholder="Nhập mô tả giao dịch"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Ngày giao dịch"
            name="transaction_date"
            rules={[{ required: true, message: 'Vui lòng chọn ngày giao dịch' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
              >
                Thêm giao dịch
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FinancialPage; 