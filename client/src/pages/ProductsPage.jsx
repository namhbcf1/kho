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
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';

import { productsAPI, suppliersAPI, categoriesAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';

const { Search } = Input;
const { Option } = Select;

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadProducts();
    loadSuppliers();
    loadCategories();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      if (response.data.success) {
        setSuppliers(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      setSuppliers([]);
    }
  };
  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      if (response.data.success) {
        setCategories(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      setCategories([]);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Show modal
  const showModal = () => {
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      if (editingProduct) {
        // Cập nhật sản phẩm
        const response = await productsAPI.update(editingProduct.id, values);
        if (response.data.success) {
          message.success('Cập nhật sản phẩm thành công');
        }
      } else {
        // Tạo sản phẩm mới
        const response = await productsAPI.create(values);
        if (response.data.success) {
          message.success('Tạo sản phẩm thành công');
        }
      }
      
      handleCancel();
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

  const getCategories = () => {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return categories;
  };

  const getStats = () => {
    const totalProducts = products.length;
    const inStock = products.filter(p => p.quantity > 0).length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    
    return { totalProducts, inStock, outOfStock, totalValue };
  };

  const stats = getStats();

  const columns = [
    {
      title: 'Mã sản phẩm',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      render: (sku) => sku || '-'
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_id',
      key: 'category',
      width: 120,
      render: (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'Chưa phân loại';
      }
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => formatCurrency(price),
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity) => (
        <Tag color={quantity > 0 ? 'green' : 'red'}>
          {quantity}
        </Tag>
      ),
      sorter: (a, b) => a.quantity - b.quantity
    },
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 120,
      render: (barcode) => barcode || '-'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
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
            onClick={() => {
              setEditingProduct(record);
              setModalVisible(true);
              form.setFieldsValue(record);
            }}
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
              title="Tổng sản phẩm"
              value={stats.totalProducts}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Còn hàng"
              value={stats.inStock}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hết hàng"
              value={stats.outOfStock}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={6}>
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

      {/* Bảng sản phẩm */}
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={16} md={18}>
            <Search
              placeholder="Tìm kiếm sản phẩm..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: '100%' }}
              data-testid="search-products"
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showModal}
              block
              data-testid="add-product-btn"
            >
              Thêm sản phẩm
            </Button>
          </Col>
        </Row>

        <Table
          dataSource={filteredProducts}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal thêm/sửa sản phẩm */}
      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
              >
                <Input placeholder="VD: iPhone 15 Pro Max" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Mã sản phẩm (SKU)"
                name="sku"
              >
                <Input placeholder="VD: IP15PM-256GB" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
              >
                <InputNumber
                  placeholder="Số lượng"
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Danh mục"
                name="category_id"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select placeholder="Chọn danh mục" allowClear>
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Barcode"
                name="barcode"
              >
                <Input placeholder="VD: 8934588123456" />
              </Form.Item>
            </Col>
          </Row>
          <Divider orientation="left">Thông tin bổ sung</Divider>
          <Row gutter={16}>
            <Col span={12}>
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
            <Col span={12}>
              <Form.Item
                label="Nhà cung cấp"
                name="supplier_id"
              >
                <Select placeholder="Chọn nhà cung cấp" allowClear>
                  {suppliers.map(sup => (
                    <Option key={sup.id} value={sup.id}>{sup.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Đơn vị" name="unit" initialValue="cái">
                <Select>
                  <Option value="cái">Cái</Option>
                  <Option value="hộp">Hộp</Option>
                  <Option value="bộ">Bộ</Option>
                  <Option value="thùng">Thùng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Tồn kho tối thiểu" name="min_stock" initialValue={10}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Tồn kho tối đa" name="max_stock" initialValue={1000}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Mô tả sản phẩm" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết về sản phẩm, thông số kỹ thuật..." />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingProduct ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ProductsPage; 