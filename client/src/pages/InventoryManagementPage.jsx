import React, { useState, useEffect } from 'react'
import {
  Card, Table, Button, Space, Input, Select, Tag, Modal, Form, Row, Col,
  Statistic, Tabs, message, Tooltip, Badge, Descriptions, Typography,
  Alert, DatePicker, Divider, Progress, TreeSelect, Transfer, Steps, InputNumber
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  BarcodeOutlined, WarningOutlined, CheckCircleOutlined,
  SwapOutlined, EnvironmentOutlined, ShopOutlined, InboxOutlined,
  ExclamationCircleOutlined, SyncOutlined, PrinterOutlined
} from '@ant-design/icons'
import api from '../services/api'
import moment from 'moment'

const { Title, Text } = Typography
const { TabPane } = Tabs
const { TextArea } = Input
const { Option } = Select
const { Step } = Steps

const InventoryManagementPage = () => {
  const [serialNumbers, setSerialNumbers] = useState([])
  const [products, setProducts] = useState([])
  const [locations, setLocations] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [transferModalVisible, setTransferModalVisible] = useState(false)
  const [editingSerial, setEditingSerial] = useState(null)
  const [selectedSerials, setSelectedSerials] = useState([])
  const [filters, setFilters] = useState({
    search: '',
    product_id: '',
    status: '',
    location: ''
  })
  const [stats, setStats] = useState({
    totalSerials: 0,
    inStock: 0,
    sold: 0,
    reserved: 0,
    damaged: 0
  })

  const [form] = Form.useForm()
  const [transferForm] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchSerialNumbers()
  }, [filters])

  const fetchData = async () => {
    try {
      const [serialsRes, productsRes, locationsRes, suppliersRes] = await Promise.all([
        api.getSerialNumbers(),
        api.getProducts(),
        api.getInventoryLocations(),
        api.getSuppliers()
      ])
      
      setSerialNumbers(serialsRes)
      setProducts(productsRes)
      setLocations(locationsRes)
      setSuppliers(suppliersRes)
      
      // Calculate stats
      const stats = {
        totalSerials: serialsRes.length,
        inStock: serialsRes.filter(s => s.status === 'in_stock').length,
        sold: serialsRes.filter(s => s.status === 'sold').length,
        reserved: serialsRes.filter(s => s.status === 'reserved').length,
        damaged: serialsRes.filter(s => s.status === 'damaged').length
      }
      setStats(stats)
    } catch (error) {
      message.error('Lỗi tải dữ liệu: ' + error.message)
    }
  }

  const fetchSerialNumbers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.search) params.search = filters.search
      if (filters.product_id) params.product_id = filters.product_id
      if (filters.status) params.status = filters.status
      if (filters.location) params.location = filters.location

      const data = await api.getSerialNumbers(params)
      setSerialNumbers(data)
    } catch (error) {
      message.error('Lỗi tải serial numbers: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSerial = () => {
    setEditingSerial(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEditSerial = (serial) => {
    setEditingSerial(serial)
    form.setFieldsValue({
      ...serial,
      manufacturing_date: serial.manufacturing_date ? moment(serial.manufacturing_date) : null,
      import_date: serial.import_date ? moment(serial.import_date) : null
    })
    setModalVisible(true)
  }

  const handleDeleteSerial = async (id) => {
    try {
      await api.deleteSerialNumber(id)
      message.success('Xóa serial number thành công')
      fetchSerialNumbers()
      fetchData()
    } catch (error) {
      message.error('Lỗi xóa serial number: ' + error.message)
    }
  }

  const handleSubmit = async (values) => {
    try {
      const serialData = {
        ...values,
        manufacturing_date: values.manufacturing_date ? values.manufacturing_date.format('YYYY-MM-DD') : null,
        import_date: values.import_date ? values.import_date.format('YYYY-MM-DD') : null
      }

      if (editingSerial) {
        await api.updateSerialNumber(editingSerial.id, serialData)
        message.success('Cập nhật serial number thành công')
      } else {
        await api.createSerialNumber(serialData)
        message.success('Tạo serial number thành công')
      }

      setModalVisible(false)
      fetchSerialNumbers()
      fetchData()
    } catch (error) {
      message.error('Lỗi lưu serial number: ' + error.message)
    }
  }

  const handleBulkTransfer = () => {
    if (selectedSerials.length === 0) {
      message.warning('Vui lòng chọn ít nhất một serial number')
      return
    }
    setTransferModalVisible(true)
  }

  const handleTransferSubmit = async (values) => {
    try {
      // Update location for selected serials
      for (const serialId of selectedSerials) {
        await api.updateSerialNumber(serialId, {
          location: values.to_location,
          notes: values.notes
        })
      }
      
      message.success(`Chuyển kho thành công ${selectedSerials.length} serial numbers`)
      setTransferModalVisible(false)
      setSelectedSerials([])
      fetchSerialNumbers()
      transferForm.resetFields()
    } catch (error) {
      message.error('Lỗi chuyển kho: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'in_stock': 'green',
      'sold': 'blue',
      'reserved': 'orange',
      'damaged': 'red',
      'returned': 'purple',
      'warranty_claim': 'volcano'
    }
    return colors[status] || 'default'
  }

  const getStatusText = (status) => {
    const texts = {
      'in_stock': 'Trong kho',
      'sold': 'Đã bán',
      'reserved': 'Đã đặt',
      'damaged': 'Hỏng',
      'returned': 'Trả lại',
      'warranty_claim': 'Bảo hành'
    }
    return texts[status] || status
  }

  const columns = [
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      render: (text, record) => (
        <div>
          <Text code strong>{text}</Text>
          {record.imei && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              IMEI: <Text code>{record.imei}</Text>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.product_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            SKU: <Text code>{record.sku}</Text>
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.category_name} • {record.brand_name}
          </div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      render: (location) => (
        <Space>
          <EnvironmentOutlined />
          {location || 'Chưa xác định'}
        </Space>
      )
    },
    {
      title: 'Giá trị',
      key: 'pricing',
      render: (_, record) => (
        <div>
          {record.purchase_price && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Mua: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.purchase_price)}
            </div>
          )}
          {record.selling_price && (
            <div style={{ fontSize: '12px', color: '#1890ff' }}>
              Bán: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.selling_price)}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'import_date',
      key: 'import_date',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
      render: (name) => name || '-'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditSerial(record)}
            />
          </Tooltip>
          <Tooltip title="In nhãn">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => message.info('Tính năng in nhãn đang phát triển')}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa',
                  content: 'Bạn có chắc muốn xóa serial number này?',
                  onOk: () => handleDeleteSerial(record.id)
                })
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  const rowSelection = {
    selectedRowKeys: selectedSerials,
    onChange: (selectedRowKeys) => {
      setSelectedSerials(selectedRowKeys)
    },
    getCheckboxProps: (record) => ({
      disabled: record.status === 'sold',
      name: record.serial_number,
    }),
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Quản lý Tồn kho & Serial Number</Title>
        
        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng Serial Numbers"
                value={stats.totalSerials}
                prefix={<BarcodeOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Trong kho"
                value={stats.inStock}
                prefix={<InboxOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <Progress
                percent={Math.round((stats.inStock / stats.totalSerials) * 100)}
                size="small"
                showInfo={false}
                strokeColor="#52c41a"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã bán"
                value={stats.sold}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <Progress
                percent={Math.round((stats.sold / stats.totalSerials) * 100)}
                size="small"
                showInfo={false}
                strokeColor="#1890ff"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Hỏng/Bảo hành"
                value={stats.damaged}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
              <Progress
                percent={Math.round((stats.damaged / stats.totalSerials) * 100)}
                size="small"
                showInfo={false}
                strokeColor="#ff4d4f"
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Input
                placeholder="Tìm kiếm serial number..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                allowClear
              />
            </Col>
            <Col span={5}>
              <Select
                placeholder="Sản phẩm"
                value={filters.product_id}
                onChange={(value) => setFilters({ ...filters, product_id: value })}
                allowClear
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
              >
                {products.map(product => (
                  <Option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </Option>
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
                <Option value="in_stock">Trong kho</Option>
                <Option value="sold">Đã bán</Option>
                <Option value="reserved">Đã đặt</Option>
                <Option value="damaged">Hỏng</Option>
                <Option value="warranty_claim">Bảo hành</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Input
                placeholder="Vị trí"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                allowClear
              />
            </Col>
            <Col span={5}>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateSerial}>
                  Thêm Serial
                </Button>
                <Button 
                  icon={<SwapOutlined />} 
                  onClick={handleBulkTransfer}
                  disabled={selectedSerials.length === 0}
                >
                  Chuyển kho ({selectedSerials.length})
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Serial Numbers Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={serialNumbers}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} serial numbers`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Serial Number Form Modal */}
      <Modal
        title={editingSerial ? 'Chỉnh sửa Serial Number' : 'Thêm Serial Number'}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="product_id"
                label="Sản phẩm"
                rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
              >
                <Select placeholder="Chọn sản phẩm" showSearch optionFilterProp="children">
                  {products.map(product => (
                    <Option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="serial_number"
                label="Serial Number"
                rules={[{ required: true, message: 'Vui lòng nhập serial number' }]}
              >
                <Input placeholder="Nhập serial number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="imei"
                label="IMEI"
              >
                <Input placeholder="Nhập IMEI (nếu có)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mac_address"
                label="MAC Address"
              >
                <Input placeholder="Nhập MAC address (nếu có)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="batch_number"
                label="Số lô"
              >
                <Input placeholder="Nhập số lô sản xuất" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="manufacturing_date"
                label="Ngày sản xuất"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="import_date"
                label="Ngày nhập kho"
                rules={[{ required: true, message: 'Vui lòng chọn ngày nhập kho' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supplier_id"
                label="Nhà cung cấp"
              >
                <Select placeholder="Chọn nhà cung cấp" allowClear>
                  {suppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="purchase_price"
                label="Giá mua"
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
                name="selling_price"
                label="Giá bán"
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
                name="status"
                label="Trạng thái"
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="in_stock">Trong kho</Option>
                  <Option value="reserved">Đã đặt</Option>
                  <Option value="damaged">Hỏng</Option>
                  <Option value="warranty_claim">Bảo hành</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Vị trí lưu trữ"
              >
                <Input placeholder="Nhập vị trí lưu trữ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="notes"
                label="Ghi chú"
              >
                <TextArea rows={3} placeholder="Nhập ghi chú" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingSerial ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        title="Chuyển kho hàng loạt"
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        footer={null}
        width={600}
      >
        <Alert
          message={`Đã chọn ${selectedSerials.length} serial numbers để chuyển kho`}
          type="info"
          style={{ marginBottom: 16 }}
        />
        
        <Form
          form={transferForm}
          layout="vertical"
          onFinish={handleTransferSubmit}
        >
          <Form.Item
            name="to_location"
            label="Chuyển đến vị trí"
            rules={[{ required: true, message: 'Vui lòng nhập vị trí đích' }]}
          >
            <Input placeholder="Nhập vị trí đích" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={3} placeholder="Nhập ghi chú cho việc chuyển kho" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setTransferModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Xác nhận chuyển kho
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default InventoryManagementPage 