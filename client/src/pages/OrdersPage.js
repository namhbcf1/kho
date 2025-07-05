import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Modal,
  List,
  Typography,
  Space,
  Input,
  DatePicker,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  PrinterOutlined
} from '@ant-design/icons';

import { ordersAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import OrderDetailModal from '../components/OrderDetailModal';
import { toast } from 'sonner';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadOrders();
    loadStats();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll({ limit: 100 });
      if (response.data.success) {
        // Handle both array and object response formats
        const ordersData = response.data.data.orders || response.data.data;
        setOrders(ordersData);
        setFilteredOrders(ordersData);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await ordersAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    }
  };

  const handleSearch = (value) => {
    const filtered = orders.filter(order =>
      order.order_number.toLowerCase().includes(value.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(value.toLowerCase()) ||
      order.customer_phone?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const handleDateFilter = (dates) => {
    if (!dates || dates.length === 0) {
      setFilteredOrders(orders);
      return;
    }

    const [startDate, endDate] = dates;
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= startDate.toDate() && orderDate <= endDate.toDate();
    });
    setFilteredOrders(filtered);
  };

  const showOrderDetail = async (orderId) => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(orderId);
      if (response.data.success) {
        setSelectedOrder(response.data.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const printOrder = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>HÓA ĐƠN BÁN HÀNG</h2>
            <p>Số hóa đơn: ${order.order_number}</p>
            <p>Ngày: ${formatDate(order.created_at)}</p>
          </div>
          
          <div class="info">
            <p><strong>Khách hàng:</strong> ${order.customer_name}</p>
            ${order.customer_phone ? `<p><strong>Số điện thoại:</strong> ${order.customer_phone}</p>` : ''}
            ${order.notes ? `<p><strong>Ghi chú:</strong> ${order.notes}</p>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${formatCurrency(item.subtotal)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p>Tổng cộng: ${formatCurrency(order.total_amount)}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const columns = [
    {
      title: 'Số đơn hàng',
      dataIndex: 'order_number',
      key: 'order_number',
      width: 150,
      sorter: (a, b) => a.order_number.localeCompare(b.order_number)
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer_name',
      key: 'customer_name',
      ellipsis: true,
      sorter: (a, b) => a.customer_name.localeCompare(b.customer_name)
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'customer_phone',
      key: 'customer_phone',
      width: 120,
      render: (phone) => phone || '-'
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 120,
      render: (amount) => formatCurrency(amount),
      sorter: (a, b) => a.total_amount - b.total_amount
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
        </Tag>
      ),
      filters: [
        { text: 'Hoàn thành', value: 'completed' },
        { text: 'Đang xử lý', value: 'processing' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showOrderDetail(record.id)}
          />
          <Button
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => printOrder(record)}
          />
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* Thống kê */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu hôm nay"
              value={stats.today_revenue || 0}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng hôm nay"
              value={stats.today_orders || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.total_revenue || 0}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats.total_orders || 0}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng đơn hàng */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Search
                placeholder="Tìm kiếm đơn hàng..."
                allowClear
                prefix={<SearchOutlined />}
                onSearch={handleSearch}
                onChange={e => handleSearch(e.target.value)}
              />
            </Col>
            <Col span={12}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['Từ ngày', 'Đến ngày']}
                onChange={handleDateFilter}
              />
            </Col>
          </Row>
        </div>

        <Table
          dataSource={filteredOrders}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal chi tiết đơn hàng */}
      <OrderDetailModal
        order={selectedOrder}
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        onPrint={() => printOrder(selectedOrder)}
        onUpdateSuccess={() => {
          loadOrders();
          loadStats();
          toast.success('Đơn hàng đã được cập nhật thành công!');
        }}
        onDeleteSuccess={() => {
          loadOrders();
          loadStats();
          toast.success('Đơn hàng đã được xóa thành công!');
        }}
        onError={(error) => {
          console.error('Lỗi khi cập nhật/xóa đơn hàng:', error);
          toast.error('Đã xảy ra lỗi khi cập nhật/xóa đơn hàng.');
        }}
      />
    </div>
  );
}

export default OrdersPage; 