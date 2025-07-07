import React, { useState, useEffect } from 'react'
import {
  Card, Table, Button, Space, Input, Select, Tag, Modal, Form, InputNumber,
  Row, Col, Statistic, Tabs, Upload, message, Tooltip, Badge, Descriptions,
  Popconfirm, Drawer, Typography, Alert, Switch, DatePicker, Divider
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  UploadOutlined, EyeOutlined, BarcodeOutlined, TagsOutlined,
  ShopOutlined, WarningOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, InfoCircleOutlined, SettingOutlined
} from '@ant-design/icons'
import api from '../services/api'
import moment from 'moment'

const { Title, Text } = Typography
const { TabPane } = Tabs
const { TextArea } = Input
const { Option } = Select

const EnhancedProductsPage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [serialNumbers, setSerialNumbers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [serialModalVisible, setSerialModalVisible] = useState(false)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    brand: '',
    status: ''
  })
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    totalSerialNumbers: 0
  })

  const [form] = Form.useForm()
  const [serialForm] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, brandsRes, suppliersRes, statsRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getBrands(),
        api.getSuppliers(),
        api.getAdvancedDashboardStats()
      ])
      
      setProducts(productsRes)
      setCategories(categoriesRes)
      setBrands(brandsRes)
      setSuppliers(suppliersRes)
      setStats({
        totalProducts: statsRes.totalProducts,
        totalStock: statsRes.totalStock,
        lowStockCount: statsRes.lowStockCount,
        totalSerialNumbers: statsRes.totalSerialNumbers
      })
    } catch (error) {
      message.error('Lỗi tải dữ liệu: ' + error.message)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.search) params.search = filters.search
      if (filters.category) params.category = filters.category
      if (filters.brand) params.brand = filters.brand
      if (filters.status) params.status = filters.status

      const data = await api.getProducts(params)
      setProducts(data)
    } catch (error) {
      message.error('Lỗi tải sản phẩm: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSerialNumbers = async (productId) => {
    try {
      const data = await api.getSerialNumbers({ product_id: productId })
      setSerialNumbers(data)
    } catch (error) {
      message.error('Lỗi tải serial numbers: ' + error.message)
    }
  }

  const handleCreateProduct = () => {
    setEditingProduct(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    form.setFieldsValue({
      ...product,
      specifications: product.specifications || {}
    })
    setModalVisible(true)
  }

  const handleDeleteProduct = async (id) => {
    try {
      await api.deleteProduct(id)
      message.success('Xóa sản phẩm thành công')
      fetchProducts()
    } catch (error) {
      message.error('Lỗi xóa sản phẩm: ' + error.message)
    }
  }

  const handleViewDetail = (product) => {
    setSelectedProduct(product)
    fetchSerialNumbers(product.id)
    setDetailDrawerVisible(true)
  }

  const handleSubmit = async (values) => {
    try {
      const productData = {
        ...values,
        specifications: values.specifications || {},
        images: values.images || []
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData)
        message.success('Cập nhật sản phẩm thành công')
      } else {
        await api.createProduct(productData)
        message.success('Tạo sản phẩm thành công')
      }

      setModalVisible(false)
      fetchProducts()
      fetchData() // Refresh stats
    } catch (error) {
      message.error('Lỗi lưu sản phẩm: ' + error.message)
    }
  }

  const handleAddSerialNumber = async (values) => {
    try {
      await api.createSerialNumber({
        ...values,
        product_id: selectedProduct.id
      })
      message.success('Thêm serial number thành công')
      setSerialModalVisible(false)
      fetchSerialNumbers(selectedProduct.id)
      serialForm.resetFields()
    } catch (error) {
      message.error('Lỗi thêm serial number: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'active': 'green',
      'inactive': 'red',
      'draft': 'orange',
      'out_of_stock': 'volcano'
    }
    return colors[status] || 'default'
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'red', text: 'Hết hàng' }
    if (stock <= 5) return { color: 'orange', text: 'Sắp hết' }
    if (stock <= 20) return { color: 'yellow', text: 'Ít hàng' }
    return { color: 'green', text: 'Còn hàng' }
  }

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (images) => (
        <div style={{ width: 60, height: 60, border: '1px solid #d9d9d9', borderRadius: 4, overflow: 'hidden' }}>
          {images && images.length > 0 ? (
            <img src={images[0]} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc' }}>
              <ShopOutlined />
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Thông tin sản phẩm',
      key: 'product_info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{record.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <Text code>{record.sku}</Text>
            {record.barcode && <Text code style={{ marginLeft: 8 }}>{record.barcode}</Text>}
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: 2 }}>
            {record.category_name} • {record.brand_name}
          </div>
        </div>
      )
    },
    {
      title: 'Giá',
      key: 'pricing',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
            {record.sale_price ? (
              <>
                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '12px' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.price)}
                </span>
                <br />
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.sale_price)}
              </>
            ) : (
              new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.price)
            )}
          </div>
          {record.cost && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Vốn: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.cost)}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Tồn kho',
      key: 'inventory',
      render: (_, record) => {
        const stockStatus = getStockStatus(record.stock)
        return (
          <div>
            <Badge
              count={record.stock}
              style={{ backgroundColor: stockStatus.color }}
              showZero
            />
            <div style={{ fontSize: '12px', color: stockStatus.color, marginTop: 2 }}>
              {stockStatus.text}
            </div>
            {record.serial_count > 0 && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                SN: {record.available_serials}/{record.serial_count}
              </div>
            )}
          </div>
        )
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'active' ? 'Hoạt động' : 
           status === 'inactive' ? 'Ngưng bán' :
           status === 'draft' ? 'Nháp' : 'Hết hàng'}
        </Tag>
      )
    },
    {
      title: 'Bảo hành',
      dataIndex: 'warranty_months',
      key: 'warranty',
      render: (months) => (
        <Text>{months} tháng</Text>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditProduct(record)}
            />
          </Tooltip>
          <Tooltip title="Quản lý Serial">
            <Button
              type="text"
              icon={<BarcodeOutlined />}
              onClick={() => {
                setSelectedProduct(record)
                fetchSerialNumbers(record.id)
                setSerialModalVisible(true)
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này?"
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const serialColumns = [
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'IMEI',
      dataIndex: 'imei',
      key: 'imei',
      render: (text) => text ? <Text code>{text}</Text> : '-'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          'in_stock': 'green',
          'sold': 'blue',
          'reserved': 'orange',
          'damaged': 'red',
          'warranty_claim': 'purple'
        }
        const labels = {
          'in_stock': 'Trong kho',
          'sold': 'Đã bán',
          'reserved': 'Đã đặt',
          'damaged': 'Hỏng',
          'warranty_claim': 'Bảo hành'
        }
        return <Tag color={colors[status]}>{labels[status]}</Tag>
      }
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'import_date',
      key: 'import_date',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location'
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Quản lý Sản phẩm Nâng cao</Title>
        
        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng sản phẩm"
                value={stats.totalProducts}
                prefix={<ShopOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng tồn kho"
                value={stats.totalStock}
                prefix={<TagsOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Sản phẩm sắp hết"
                value={stats.lowStockCount}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Serial Numbers"
                value={stats.totalSerialNumbers}
                prefix={<BarcodeOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                allowClear
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Danh mục"
                value={filters.category}
                onChange={(value) => setFilters({ ...filters, category: value })}
                allowClear
                style={{ width: '100%' }}
              >
                {categories.map(cat => (
                  <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Thương hiệu"
                value={filters.brand}
                onChange={(value) => setFilters({ ...filters, brand: value })}
                allowClear
                style={{ width: '100%' }}
              >
                {brands.map(brand => (
                  <Option key={brand.id} value={brand.id}>{brand.name}</Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Trạng thái"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Ngưng bán</Option>
                <Option value="draft">Nháp</Option>
                <Option value="out_of_stock">Hết hàng</Option>
              </Select>
            </Col>
            <Col span={6}>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateProduct}>
                  Thêm sản phẩm
                </Button>
                <Button icon={<SettingOutlined />}>
                  Cài đặt
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`
          }}
        />
      </Card>

      {/* Product Form Modal */}
      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Tabs defaultActiveKey="basic">
            <TabPane tab="Thông tin cơ bản" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Tên sản phẩm"
                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                  >
                    <Input placeholder="Nhập tên sản phẩm" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="sku"
                    label="Mã SKU"
                    rules={[{ required: true, message: 'Vui lòng nhập mã SKU' }]}
                  >
                    <Input placeholder="Nhập mã SKU" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="category_id"
                    label="Danh mục"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                  >
                    <Select placeholder="Chọn danh mục">
                      {categories.map(cat => (
                        <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="brand_id"
                    label="Thương hiệu"
                    rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
                  >
                    <Select placeholder="Chọn thương hiệu">
                      {brands.map(brand => (
                        <Option key={brand.id} value={brand.id}>{brand.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="Mô tả"
              >
                <TextArea rows={3} placeholder="Nhập mô tả sản phẩm" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="price"
                    label="Giá bán"
                    rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="sale_price"
                    label="Giá khuyến mãi"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="cost"
                    label="Giá vốn"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="stock"
                    label="Số lượng tồn kho"
                    rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="warranty_months"
                    label="Bảo hành (tháng)"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      placeholder="12"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="status"
                    label="Trạng thái"
                  >
                    <Select placeholder="Chọn trạng thái">
                      <Option value="active">Hoạt động</Option>
                      <Option value="inactive">Ngưng bán</Option>
                      <Option value="draft">Nháp</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Thông số kỹ thuật" key="specs">
              <Alert
                message="Thông số kỹ thuật"
                description="Nhập các thông số kỹ thuật chi tiết của sản phẩm. Mỗi thông số trên một dòng theo định dạng: Tên = Giá trị"
                type="info"
                style={{ marginBottom: 16 }}
              />
              
              <Form.Item
                name={['specifications', 'processor']}
                label="Vi xử lý"
              >
                <Input placeholder="Intel Core i7-12700H" />
              </Form.Item>

              <Form.Item
                name={['specifications', 'memory']}
                label="RAM"
              >
                <Input placeholder="16GB DDR4" />
              </Form.Item>

              <Form.Item
                name={['specifications', 'storage']}
                label="Ổ cứng"
              >
                <Input placeholder="512GB SSD NVMe" />
              </Form.Item>

              <Form.Item
                name={['specifications', 'display']}
                label="Màn hình"
              >
                <Input placeholder="15.6 inch Full HD IPS" />
              </Form.Item>

              <Form.Item
                name={['specifications', 'graphics']}
                label="Card đồ họa"
              >
                <Input placeholder="NVIDIA GTX 1650 4GB" />
              </Form.Item>

              <Form.Item
                name={['specifications', 'os']}
                label="Hệ điều hành"
              >
                <Input placeholder="Windows 11 Home" />
              </Form.Item>

              <Form.Item
                name={['specifications', 'weight']}
                label="Trọng lượng"
              >
                <Input placeholder="2.1kg" />
              </Form.Item>

              <Form.Item
                name={['specifications', 'dimensions']}
                label="Kích thước"
              >
                <Input placeholder="359 x 236 x 19.9 mm" />
              </Form.Item>
            </TabPane>

            <TabPane tab="Hình ảnh" key="images">
              <Form.Item
                name="images"
                label="Hình ảnh sản phẩm"
              >
                <Upload
                  listType="picture-card"
                  multiple
                  beforeUpload={() => false}
                >
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
            </TabPane>
          </Tabs>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingProduct ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Serial Numbers Modal */}
      <Modal
        title={`Quản lý Serial Number - ${selectedProduct?.name}`}
        open={serialModalVisible}
        onCancel={() => setSerialModalVisible(false)}
        width={1000}
        footer={null}
      >
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              serialForm.resetFields()
              Modal.confirm({
                title: 'Thêm Serial Number',
                content: (
                  <Form form={serialForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item
                      name="serial_number"
                      label="Serial Number"
                      rules={[{ required: true, message: 'Vui lòng nhập serial number' }]}
                    >
                      <Input placeholder="Nhập serial number" />
                    </Form.Item>
                    <Form.Item name="imei" label="IMEI">
                      <Input placeholder="Nhập IMEI (nếu có)" />
                    </Form.Item>
                    <Form.Item name="location" label="Vị trí">
                      <Input placeholder="Vị trí lưu trữ" />
                    </Form.Item>
                    <Form.Item name="import_date" label="Ngày nhập">
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Form>
                ),
                onOk: () => {
                  return serialForm.validateFields().then(values => {
                    handleAddSerialNumber(values)
                  })
                }
              })
            }}
          >
            Thêm Serial Number
          </Button>
        </div>

        <Table
          columns={serialColumns}
          dataSource={serialNumbers}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      {/* Product Detail Drawer */}
      <Drawer
        title="Chi tiết sản phẩm"
        placement="right"
        width={600}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedProduct && (
          <div>
            <Descriptions title="Thông tin cơ bản" column={1}>
              <Descriptions.Item label="Tên sản phẩm">{selectedProduct.name}</Descriptions.Item>
              <Descriptions.Item label="SKU">{selectedProduct.sku}</Descriptions.Item>
              <Descriptions.Item label="Danh mục">{selectedProduct.category_name}</Descriptions.Item>
              <Descriptions.Item label="Thương hiệu">{selectedProduct.brand_name}</Descriptions.Item>
              <Descriptions.Item label="Giá bán">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)}
              </Descriptions.Item>
              <Descriptions.Item label="Tồn kho">{selectedProduct.stock}</Descriptions.Item>
              <Descriptions.Item label="Bảo hành">{selectedProduct.warranty_months} tháng</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>Thông số kỹ thuật</Title>
            {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 ? (
              <Descriptions column={1}>
                {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>{value}</Descriptions.Item>
                ))}
              </Descriptions>
            ) : (
              <Text type="secondary">Chưa có thông số kỹ thuật</Text>
            )}

            <Divider />

            <Title level={4}>Serial Numbers ({serialNumbers.length})</Title>
            <Table
              columns={serialColumns}
              dataSource={serialNumbers}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default EnhancedProductsPage 