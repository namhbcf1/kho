import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Tag, Input, Select, message, Popconfirm, Card, Row, Col, Statistic, Modal, Form, InputNumber, Upload, Tabs } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, BarcodeOutlined, UploadOutlined } from '@ant-design/icons'
import api from '../services/api'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form] = Form.useForm()
  const [imageList, setImageList] = useState([])
  const [filters, setFilters] = useState({
    search: '',
    category: null,
    brand: null,
    status: null
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBrands()
  }, [filters])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await api.getProducts(filters)
      setProducts(data)
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const data = await api.getBrands()
      setBrands(data)
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteProduct(id)
      message.success('Đã xóa sản phẩm')
      fetchProducts()
    } catch (error) {
      message.error('Không thể xóa sản phẩm')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    form.setFieldsValue({
      ...product,
      specifications: product.specifications || {}
    })
    if (product.images) {
      setImageList(product.images.map((url, index) => ({
        uid: `-${index}`,
        name: `image${index}.png`,
        status: 'done',
        url
      })))
    }
    setModalVisible(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    form.resetFields()
    setImageList([])
    setModalVisible(true)
  }

  const handleSave = async (values) => {
    try {
      const images = imageList.map(img => img.url || img.response?.url).filter(Boolean)
      const data = {
        ...values,
        images,
        specifications: values.specifications || {}
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, data)
        message.success('Đã cập nhật sản phẩm')
      } else {
        await api.createProduct(data)
        message.success('Đã thêm sản phẩm mới')
      }
      
      setModalVisible(false)
      fetchProducts()
    } catch (error) {
      message.error('Có lỗi xảy ra')
    }
  }

  const uploadProps = {
    listType: 'picture-card',
    fileList: imageList,
    onChange: ({ fileList }) => setImageList(fileList),
    customRequest: ({ file, onSuccess }) => {
      // In real implementation, upload to cloud storage
      setTimeout(() => {
        onSuccess({ url: URL.createObjectURL(file) })
      }, 0)
    }
  }

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (images) => (
        <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {images && images.length > 0 ? (
            <img src={images[0]} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
          ) : (
            <BarcodeOutlined style={{ fontSize: 24, color: '#ccc' }} />
          )}
        </div>
      )
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.category_name} - {record.brand_name}</div>
        </div>
      )
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price, record) => (
        <div>
          {record.sale_price ? (
            <>
              <div style={{ textDecoration: 'line-through', color: '#999', fontSize: 12 }}>
                {formatCurrency(price)}
              </div>
              <div style={{ color: '#f5222d', fontWeight: 'bold' }}>
                {formatCurrency(record.sale_price)}
              </div>
            </>
          ) : (
            <div style={{ fontWeight: 'bold' }}>
              {formatCurrency(price)}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? 'Đang bán' : 'Ngừng bán'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Calculate statistics
  const totalProducts = products.length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const lowStockCount = products.filter(p => p.stock <= 5 && p.stock > 0).length
  const outOfStockCount = products.filter(p => p.stock === 0).length

  return (
    <div>
      <Card>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic title="Tổng sản phẩm" value={totalProducts} />
          </Col>
          <Col span={6}>
            <Statistic title="Tổng tồn kho" value={totalStock} />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Sắp hết hàng" 
              value={lowStockCount} 
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Hết hàng" 
              value={outOfStockCount} 
              valueStyle={{ color: '#cf1322' }}
            />
          </Col>
        </Row>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Search
              placeholder="Tìm kiếm sản phẩm, SKU, barcode..."
              onSearch={(value) => setFilters({ ...filters, search: value })}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="Danh mục"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, category: value })}
            >
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
            <Select
              placeholder="Thương hiệu"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, brand: value })}
            >
              {brands.map(brand => (
                <Option key={brand.id} value={brand.id}>{brand.name}</Option>
              ))}
            </Select>
            <Select
              placeholder="Trạng thái"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="active">Đang bán</Option>
              <Option value="inactive">Ngừng bán</Option>
            </Select>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm sản phẩm
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} sản phẩm`
          }}
        />
      </Card>

      {/* Product Form Modal */}
      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            status: 'active',
            warranty_months: 12
          }}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Thông tin cơ bản" key="1">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="sku"
                    label="SKU"
                    rules={[{ required: true, message: 'Vui lòng nhập SKU' }]}
                  >
                    <Input placeholder="VD: LAP-DELL-001" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="barcode" label="Barcode">
                    <Input placeholder="Mã vạch sản phẩm" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="status" label="Trạng thái">
                    <Select>
                      <Option value="active">Đang bán</Option>
                      <Option value="inactive">Ngừng bán</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
              >
                <Input placeholder="VD: Laptop Dell Inspiron 15 3520" />
              </Form.Item>

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

              <Form.Item name="description" label="Mô tả">
                <TextArea rows={4} placeholder="Mô tả chi tiết về sản phẩm" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    name="cost"
                    label="Giá nhập"
                    rules={[{ required: true, message: 'Vui lòng nhập giá nhập' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
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
                <Col span={6}>
                  <Form.Item name="sale_price" label="Giá khuyến mãi">
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="stock"
                    label="Số lượng"
                    rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                  >
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="warranty_months" label="Bảo hành (tháng)">
                <InputNumber min={0} style={{ width: 200 }} />
              </Form.Item>

              <Form.Item label="Hình ảnh">
                <Upload {...uploadProps}>
                  {imageList.length < 8 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </TabPane>

            <TabPane tab="Thông số kỹ thuật" key="2">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={['specifications', 'cpu']} label="CPU">
                    <Input placeholder="VD: Intel Core i5-1235U" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={['specifications', 'ram']} label="RAM">
                    <Input placeholder="VD: 8GB DDR4 3200MHz" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={['specifications', 'storage']} label="Ổ cứng">
                    <Input placeholder="VD: 512GB SSD NVMe" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={['specifications', 'display']} label="Màn hình">
                    <Input placeholder="VD: 15.6 inch FHD (1920x1080)" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={['specifications', 'graphics']} label="Card đồ họa">
                    <Input placeholder="VD: Intel UHD Graphics" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={['specifications', 'os']} label="Hệ điều hành">
                    <Input placeholder="VD: Windows 11 Home" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={['specifications', 'weight']} label="Trọng lượng">
                    <Input placeholder="VD: 1.65 kg" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={['specifications', 'battery']} label="Pin">
                    <Input placeholder="VD: 3 Cell 41Whr" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name={['specifications', 'ports']} label="Cổng kết nối">
                <TextArea rows={3} placeholder="VD: 2x USB 3.2, 1x USB Type-C, 1x HDMI 1.4, 1x Audio jack" />
              </Form.Item>

              <Form.Item name={['specifications', 'other']} label="Khác">
                <TextArea rows={3} placeholder="Các thông số khác..." />
              </Form.Item>
            </TabPane>
          </Tabs>

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingProduct ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProductsPage 