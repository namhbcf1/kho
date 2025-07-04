import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Switch,
  Tabs,
  Alert,
  Upload,
  Divider,
  Badge,
  Typography,
  Drawer,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BarcodeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  CopyOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';

import { productsAPI, categoriesAPI, suppliersAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

function EnhancedProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');
  const [serialDrawerVisible, setSerialDrawerVisible] = useState(false);
  const [selectedProductSerials, setSelectedProductSerials] = useState([]);
  const [selectedProductForSerial, setSelectedProductForSerial] = useState(null);

  // Computer/Electronics specific product conditions
  const productConditions = [
    { value: 'new', label: 'Hàng mới', color: 'green' },
    { value: 'used_like_new', label: 'Cũ như mới', color: 'blue' },
    { value: 'used_good', label: 'Cũ tốt', color: 'orange' },
    { value: 'used_fair', label: 'Cũ khá', color: 'yellow' },
    { value: 'refurbished', label: 'Tân trang', color: 'purple' },
    { value: 'damaged', label: 'Hư hỏng', color: 'red' },
  ];

  const computerCategories = [
    'CPU', 'GPU', 'RAM', 'Mainboard', 'SSD/HDD', 'PSU', 'Case', 'Cooling',
    'Monitor', 'Keyboard', 'Mouse', 'Laptop', 'Desktop PC', 'Server',
    'Network Equipment', 'Cables', 'Accessories', 'Gaming Gear'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadProducts(),
      loadCategories(),
      loadSuppliers(),
    ]);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      if (response.data.success) {
        setProducts(response.data.data);
        setFilteredProducts(response.data.data);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách sản phẩm');
      // Mock data for demo
      const mockProducts = [
        {
          id: 1,
          name: 'Intel Core i7-12700K',
          sku: 'CPU-I7-12700K',
          barcode: '123456789012',
          price: 8500000,
          cost_price: 7500000,
          quantity: 15,
          min_stock: 5,
          max_stock: 50,
          category_id: 1,
          supplier_id: 1,
          unit: 'cái',
          condition: 'new',
          serial_number: 'IN12700K2024001',
          warranty_period: 36,
          warranty_start: '2024-01-15',
          warranty_end: '2027-01-15',
          description: 'Bộ vi xử lý Intel thế hệ 12, 12 cores 20 threads',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 2,
          name: 'NVIDIA RTX 4070 Ti',
          sku: 'GPU-RTX4070TI',
          barcode: '123456789013',
          price: 18500000,
          cost_price: 16500000,
          quantity: 8,
          min_stock: 3,
          max_stock: 20,
          category_id: 2,
          supplier_id: 2,
          unit: 'cái',
          condition: 'new',
          serial_number: 'NV4070TI2024001',
          warranty_period: 24,
          warranty_start: '2024-01-10',
          warranty_end: '2026-01-10',
          description: 'Card đồ họa NVIDIA RTX 4070 Ti 12GB GDDR6X',
          created_at: '2024-01-10T09:00:00Z',
        },
      ];
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      // Mock categories
      const mockCategories = computerCategories.map((name, index) => ({
        id: index + 1,
        name,
        description: `Danh mục ${name}`,
      }));
      setCategories(mockCategories);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      if (response.data.success) {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      // Mock suppliers
      setSuppliers([
        { id: 1, name: 'Intel Vietnam', code: 'INTEL' },
        { id: 2, name: 'NVIDIA Distributor', code: 'NVIDIA' },
        { id: 3, name: 'AMD Tech', code: 'AMD' },
      ]);
    }
  };

  const handleSearch = (value) => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(value.toLowerCase()) ||
      product.sku?.toLowerCase().includes(value.toLowerCase()) ||
      product.serial_number?.toLowerCase().includes(value.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const showModal = (product = null) => {
    setEditingProduct(product);
    setModalVisible(true);
    setActiveTab('basic');
    
    if (product) {
      form.setFieldsValue({
        ...product,
        warranty_start: product.warranty_start ? moment(product.warranty_start) : null,
        warranty_end: product.warranty_end ? moment(product.warranty_end) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        condition: 'new',
        warranty_period: 12,
        unit: 'cái',
        min_stock: 5,
        max_stock: 100,
      });
    }
  };

  const hideModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const generateSKU = (categoryName, productName) => {
    const categoryCode = categoryName.substring(0, 3).toUpperCase();
    const productCode = productName
      .split(' ')
      .map(word => word.substring(0, 2))
      .join('')
      .toUpperCase()
      .substring(0, 6);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${categoryCode}-${productCode}-${randomNum}`;
  };

  const generateSerialNumber = (sku) => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${sku.replace(/-/g, '')}${year}${randomNum}`;
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Auto-generate SKU and Serial Number if not provided
      if (!values.sku && values.name) {
        const categoryName = categories.find(c => c.id === values.category_id)?.name || 'GEN';
        values.sku = generateSKU(categoryName, values.name);
      }
      
      if (!values.serial_number && values.sku) {
        values.serial_number = generateSerialNumber(values.sku);
      }

      // Calculate warranty end date
      if (values.warranty_start && values.warranty_period) {
        values.warranty_end = moment(values.warranty_start)
          .add(values.warranty_period, 'months')
          .format('YYYY-MM-DD');
      }
      
      if (editingProduct) {
        const response = await productsAPI.update(editingProduct.id, values);
        if (response.data.success) {
          message.success('Cập nhật sản phẩm thành công');
        }
      } else {
        const response = await productsAPI.create(values);
        if (response.data.success) {
          message.success('Tạo sản phẩm thành công');
        }
      }
      
      hideModal();
      loadProducts();
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await productsAPI.delete(id);
      if (response.data.success) {
        message.success('Xóa sản phẩm thành công');
        loadProducts();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const checkWarrantyStatus = (warrantyEnd) => {
    if (!warrantyEnd) return { status: 'unknown', color: 'default', text: 'Chưa xác định' };
    
    const endDate = moment(warrantyEnd);
    const now = moment();
    const daysLeft = endDate.diff(now, 'days');
    
    if (daysLeft < 0) {
      return { status: 'expired', color: 'red', text: 'Hết hạn' };
    } else if (daysLeft <= 30) {
      return { status: 'expiring', color: 'orange', text: `Còn ${daysLeft} ngày` };
    } else {
      return { status: 'valid', color: 'green', text: `Còn ${daysLeft} ngày` };
    }
  };

  const getStats = () => {
    const totalProducts = products.length;
    const inStock = products.filter(p => p.quantity > 0).length;
    const lowStock = products.filter(p => p.quantity <= (p.min_stock || 5)).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const expiredWarranty = products.filter(p => {
      if (!p.warranty_end) return false;
      return moment(p.warranty_end).isBefore(moment());
    }).length;
    
    return { totalProducts, inStock, lowStock, totalValue, expiredWarranty };
  };

  const stats = getStats();

  const showSerialDrawer = async (product) => {
    try {
      setSelectedProductForSerial(product);
              const response = await productsAPI.getSerials(product.id, { status: 'all' });
      if (response.data.success) {
        setSelectedProductSerials(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setSelectedProductSerials([]);
      }
      setSerialDrawerVisible(true);
    } catch (error) {
      console.error('Error fetching serials:', error);
      setSelectedProductSerials([]);
      message.error('Không thể tải danh sách serial');
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product_info',
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            SKU: {record.sku || 'N/A'}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            SN: {record.serial_number || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_id',
      key: 'category',
      width: 120,
      render: (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return <Tag color="blue">{category?.name || 'N/A'}</Tag>;
      },
    },
    {
      title: 'Tình trạng',
      dataIndex: 'condition',
      key: 'condition',
      width: 120,
      render: (condition) => {
        const conditionInfo = productConditions.find(c => c.value === condition);
        return (
          <Tag color={conditionInfo?.color}>
            {conditionInfo?.label || condition}
          </Tag>
        );
      },
    },
    {
      title: 'Giá bán/Giá vốn',
      key: 'pricing',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{formatCurrency(record.price)}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            Vốn: {formatCurrency(record.cost_price || 0)}
          </div>
        </div>
      ),
    },
    {
      title: 'Tồn kho',
      key: 'inventory',
      width: 100,
      render: (_, record) => {
        const isLowStock = record.quantity <= (record.min_stock || 5);
        return (
          <div>
            <Badge
              count={record.quantity}
              style={{
                backgroundColor: isLowStock ? '#f5222d' : '#52c41a',
              }}
            />
            {isLowStock && (
              <div style={{ fontSize: 11, color: '#f5222d', marginTop: 2 }}>
                <WarningOutlined /> Sắp hết
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Bảo hành',
      dataIndex: 'warranty_end',
      key: 'warranty',
      width: 120,
      render: (warrantyEnd) => {
        const warranty = checkWarrantyStatus(warrantyEnd);
        return (
          <Tag color={warranty.color} icon={
            warranty.status === 'expired' ? <ClockCircleOutlined /> :
            warranty.status === 'expiring' ? <WarningOutlined /> :
            <CheckCircleOutlined />
          }>
            {warranty.text}
          </Tag>
        );
      },
    },
    {
      title: 'Serial Numbers',
      key: 'serials',
      width: 150,
      render: (_, record) => (
        <div>
          <Button
            size="small"
            icon={<QrcodeOutlined />}
            onClick={() => showSerialDrawer(record)}
          >
            Xem Serial ({record.quantity})
          </Button>
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={() => {
              const newProduct = { ...record };
              delete newProduct.id;
              delete newProduct.sku;
              delete newProduct.serial_number;
              newProduct.name = `${record.name} (Copy)`;
              showModal(newProduct);
            }}
            title="Nhân bản"
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderBasicTab = () => (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input placeholder="VD: Intel Core i7-12700K" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Mã sản phẩm (SKU)" name="sku">
            <Input placeholder="Tự động tạo nếu để trống" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Danh mục"
            name="category_id"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Nhà cung cấp" name="supplier_id">
            <Select placeholder="Chọn nhà cung cấp" allowClear>
              {suppliers.map(supplier => (
                <Option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Tình trạng"
            name="condition"
            rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}
          >
            <Select>
              {productConditions.map(condition => (
                <Option key={condition.value} value={condition.value}>
                  <Tag color={condition.color}>{condition.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Giá vốn"
            name="cost_price"
            rules={[{ required: true, message: 'Vui lòng nhập giá vốn' }]}
          >
            <InputNumber
              placeholder="Giá nhập"
              style={{ width: '100%' }}
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="Giá bán"
            name="price"
            rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
          >
            <InputNumber
              placeholder="Giá bán"
              style={{ width: '100%' }}
              min={0}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Đơn vị" name="unit">
            <Select>
              <Option value="cái">Cái</Option>
              <Option value="bộ">Bộ</Option>
              <Option value="chiếc">Chiếc</Option>
              <Option value="hộp">Hộp</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Mô tả" name="description">
        <Input.TextArea rows={3} placeholder="Mô tả chi tiết sản phẩm, thông số kỹ thuật..." />
      </Form.Item>
    </div>
  );

  const renderInventoryTab = () => (
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Số lượng hiện tại"
            name="quantity"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber
              placeholder="Số lượng tồn kho"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Tồn kho tối thiểu" name="min_stock">
            <InputNumber
              placeholder="Cảnh báo khi dưới mức này"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Tồn kho tối đa" name="max_stock">
            <InputNumber
              placeholder="Giới hạn tồn kho tối đa"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Barcode" name="barcode">
            <Input
              placeholder="Mã vạch sản phẩm"
              addonAfter={<BarcodeOutlined />}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Serial Number" name="serial_number">
            <Input placeholder="Tự động tạo nếu để trống" />
          </Form.Item>
        </Col>
      </Row>

      <Alert
        message="Quản lý tồn kho thông minh"
        description="Hệ thống sẽ tự động cảnh báo khi sản phẩm sắp hết hàng và đề xuất nhập thêm khi cần thiết."
        type="info"
        showIcon
      />
    </div>
  );

  const renderWarrantyTab = () => (
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="Thời hạn bảo hành (tháng)" name="warranty_period">
            <InputNumber
              placeholder="12"
              style={{ width: '100%' }}
              min={0}
              max={120}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Ngày bắt đầu BH" name="warranty_start">
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Ngày bắt đầu"
              onChange={(date) => {
                const warrantyPeriod = form.getFieldValue('warranty_period');
                if (date && warrantyPeriod) {
                  const endDate = date.clone().add(warrantyPeriod, 'months');
                  form.setFieldsValue({ warranty_end: endDate });
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Ngày kết thúc BH" name="warranty_end">
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Tự động tính"
            />
          </Form.Item>
        </Col>
      </Row>

      <Alert
        message="Thông tin bảo hành"
        description="Hệ thống sẽ tự động theo dõi và nhắc nhở về tình trạng bảo hành của từng sản phẩm. Thông tin này rất quan trọng cho việc hỗ trợ khách hàng."
        type="warning"
        showIcon
      />
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2>Quản lý sản phẩm - Computer & Electronics</h2>
        <p>Quản lý toàn diện sản phẩm máy tính và thiết bị điện tử với theo dõi serial, bảo hành</p>
      </div>

      {/* Enhanced Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={stats.totalProducts}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Còn hàng"
              value={stats.inStock}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Sắp hết hàng"
              value={stats.lowStock}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Hết hạn BH"
              value={stats.expiredWarranty}
              valueStyle={{ color: '#f5222d' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Giá trị tồn kho"
              value={stats.totalValue}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Products Table */}
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Search
            placeholder="Tìm theo tên, SKU, Serial Number, Barcode..."
            allowClear
            style={{ width: 400 }}
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
            onChange={e => handleSearch(e.target.value)}
          />
          
          <Space>
            <Button icon={<UploadOutlined />}>
              Import Excel
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Thêm sản phẩm
            </Button>
          </Space>
        </div>

        <Table
          dataSource={filteredProducts}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Enhanced Modal */}
      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={modalVisible}
        onCancel={hideModal}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Thông tin cơ bản" key="basic">
              {renderBasicTab()}
            </TabPane>
            <TabPane tab="Quản lý kho" key="inventory">
              {renderInventoryTab()}
            </TabPane>
            <TabPane tab="Bảo hành" key="warranty">
              {renderWarrantyTab()}
            </TabPane>
          </Tabs>

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={hideModal}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingProduct ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Serial Drawer */}
      <Drawer
        title={`Serial Numbers - ${selectedProductForSerial?.name}`}
        width={800}
        visible={serialDrawerVisible}
        onClose={() => setSerialDrawerVisible(false)}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                // Chuyển đến trang inventory để thêm serial
                window.open('/inventory', '_blank');
              }}
            >
              Thêm Serial
            </Button>
          </Space>
        }
      >
        {selectedProductForSerial && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Sản phẩm: </Text>{selectedProductForSerial.name}
                </Col>
                <Col span={12}>
                  <Text strong>SKU: </Text>{selectedProductForSerial.sku || 'N/A'}
                </Col>
                <Col span={12}>
                  <Text strong>Tổng tồn kho: </Text>{selectedProductForSerial.quantity} cái
                </Col>
                <Col span={12}>
                  <Text strong>Serial có sẵn: </Text>
                  {Array.isArray(selectedProductSerials) ? selectedProductSerials.filter(s => s.status === 'available').length : 0} cái
                </Col>
              </Row>
            </Card>

            <Table
              columns={[
                {
                  title: 'Serial Number',
                  dataIndex: 'serial_number',
                  key: 'serial_number',
                  render: (serial) => <Text code>{serial}</Text>
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'available' ? 'green' : status === 'sold' ? 'red' : 'orange'}>
                      {status === 'available' ? 'Có sẵn' : status === 'sold' ? 'Đã bán' : 'Khác'}
                    </Tag>
                  )
                },
                {
                  title: 'Tình trạng',
                  dataIndex: 'condition_grade',
                  key: 'condition_grade',
                  render: (grade) => (
                    <Tag color={grade === 'new' ? 'blue' : 'orange'}>
                      {grade === 'new' ? 'Mới' : grade === 'used_like_new' ? 'Cũ như mới' : 'Cũ'}
                    </Tag>
                  )
                },
                {
                  title: 'Vị trí',
                  dataIndex: 'location',
                  key: 'location',
                  render: (location) => location || 'N/A'
                },
                {
                  title: 'Ngày tạo',
                  dataIndex: 'created_at',
                  key: 'created_at',
                  render: (date) => new Date(date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
                }
              ]}
              dataSource={Array.isArray(selectedProductSerials) ? selectedProductSerials : []}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} serial`
              }}
              scroll={{ x: 600 }}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default EnhancedProductsPage; 