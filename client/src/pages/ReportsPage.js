import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  DatePicker,
  Space,
  Button,
  Table,
  Progress
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  TeamOutlined
} from '@ant-design/icons';

import { ordersAPI, productsAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

function ReportsPage() {
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load thống kê tổng quan
      const statsResponse = await ordersAPI.getStats();
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Load sản phẩm để tính tồn kho
      const productsResponse = await productsAPI.getAll();
      if (productsResponse.data.success) {
        setProducts(productsResponse.data.data);
      }

      // Load đơn hàng gần đây
      const ordersResponse = await ordersAPI.getAll({ limit: 20 });
      if (ordersResponse.data.success) {
        setOrders(ordersResponse.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu báo cáo:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductStats = () => {
    const totalProducts = products.length;
    const inStock = products.filter(p => p.quantity > 0).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 10).length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    return { totalProducts, inStock, outOfStock, lowStock, totalStockValue };
  };

  const getTopProducts = () => {
    // Tính toán sản phẩm bán chạy từ order items
    const productSales = {};
    
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          if (productSales[item.product_id]) {
            productSales[item.product_id].quantity += item.quantity;
            productSales[item.product_id].revenue += item.subtotal;
          } else {
            productSales[item.product_id] = {
              name: item.product_name,
              quantity: item.quantity,
              revenue: item.subtotal,
              price: item.price
            };
          }
        });
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  };

  const getLowStockProducts = () => {
    return products
      .filter(p => p.quantity > 0 && p.quantity <= 10)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 10);
  };

  const productStats = getProductStats();
  const topProducts = getTopProducts();
  const lowStockProducts = getLowStockProducts();

  const topProductsColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true
    },
    {
      title: 'Đã bán',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      sorter: (a, b) => a.quantity - b.quantity
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 120,
      render: (revenue) => formatCurrency(revenue),
      sorter: (a, b) => a.revenue - b.revenue
    }
  ];

  const lowStockColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity) => (
        <span style={{ color: quantity <= 5 ? '#ff4d4f' : '#faad14' }}>
          {quantity}
        </span>
      ),
      sorter: (a, b) => a.quantity - b.quantity
    },
    {
      title: 'Mức độ',
      dataIndex: 'quantity',
      key: 'level',
      width: 120,
      render: (quantity) => (
        <Progress 
          percent={Math.min((quantity / 10) * 100, 100)} 
          size="small" 
          status={quantity <= 5 ? 'exception' : 'active'}
          showInfo={false}
        />
      )
    }
  ];

  return (
    <div>
      <Title level={2}>Báo cáo tổng quan</Title>
      
      {/* Thống kê tổng quan */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu hôm nay"
              value={stats.today_revenue || 0}
              precision={0}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <span style={{ fontSize: '14px', color: '#999' }}>
                  <ArrowUpOutlined /> +12.5%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng hôm nay"
              value={stats.today_orders || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={productStats.totalProducts}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats.total_revenue || 0}
              precision={0}
              formatter={(value) => formatCurrency(value)}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê tồn kho */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sản phẩm còn hàng"
              value={productStats.inStock}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${productStats.totalProducts}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sản phẩm hết hàng"
              value={productStats.outOfStock}
              valueStyle={{ color: '#ff4d4f' }}
              suffix={`/ ${productStats.totalProducts}`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sắp hết hàng"
              value={productStats.lowStock}
              valueStyle={{ color: '#faad14' }}
              suffix="sản phẩm"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Giá trị tồn kho"
              value={productStats.totalStockValue}
              precision={0}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng thống kê */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Top sản phẩm bán chạy" loading={loading}>
            <Table
              dataSource={topProducts}
              columns={topProductsColumns}
              rowKey="name"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        
        <Col span={12}>
          <Card 
            title="Sản phẩm sắp hết hàng" 
            loading={loading}
            extra={
              <Text type="secondary">
                {productStats.lowStock} sản phẩm
              </Text>
            }
          >
            <Table
              dataSource={lowStockProducts}
              columns={lowStockColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Thông tin thêm */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Tóm tắt hoạt động">
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                    {((productStats.inStock / productStats.totalProducts) * 100).toFixed(1)}%
                  </Title>
                  <Text type="secondary">Tỷ lệ sản phẩm còn hàng</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                    {stats.today_orders || 0}
                  </Title>
                  <Text type="secondary">Đơn hàng hôm nay</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Title level={3} style={{ color: '#722ed1', margin: 0 }}>
                    {stats.total_orders ? (stats.total_revenue / stats.total_orders).toFixed(0) : 0}
                  </Title>
                  <Text type="secondary">Giá trị đơn hàng trung bình</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ReportsPage; 