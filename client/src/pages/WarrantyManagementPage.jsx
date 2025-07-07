import React, { useState, useEffect } from 'react'
import {
  Card, Table, Button, Space, Input, Select, Tag, Modal, Form, Row, Col,
  Statistic, message, Tooltip, Descriptions, Typography, Alert, DatePicker,
  Steps, Timeline, Progress, Badge, Divider, Upload, Image, InputNumber
} from 'antd'
import {
  PlusOutlined, EditOutlined, SearchOutlined, FileTextOutlined,
  CalendarOutlined, WarningOutlined, CheckCircleOutlined,
  ClockCircleOutlined, ToolOutlined, PhoneOutlined, UserOutlined,
  UploadOutlined, PrinterOutlined, ExclamationCircleOutlined
} from '@ant-design/icons'
import api from '../services/api'
import moment from 'moment'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select
const { Step } = Steps

const WarrantyManagementPage = () => {
  const [warrantyClaims, setWarrantyClaims] = useState([])
  const [serialNumbers, setSerialNumbers] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editingClaim, setEditingClaim] = useState(null)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    claim_type: '',
    customer_id: ''
  })
  const [stats, setStats] = useState({
    totalClaims: 0,
    pendingClaims: 0,
    activeClaims: 0,
    completedClaims: 0,
    avgResolutionTime: 0
  })

  const [form] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchWarrantyClaims()
  }, [filters])

  const fetchData = async () => {
    try {
      const [claimsRes, serialsRes, customersRes, statsRes] = await Promise.all([
        api.getWarrantyClaims(),
        api.getSerialNumbers(),
        api.getCustomers(),
        api.getAdvancedDashboardStats()
      ])
      
      setWarrantyClaims(claimsRes)
      setSerialNumbers(serialsRes)
      setCustomers(customersRes)
      
      // Calculate warranty stats
      const stats = {
        totalClaims: claimsRes.length,
        pendingClaims: claimsRes.filter(c => c.status === 'pending').length,
        activeClaims: claimsRes.filter(c => c.status === 'in_progress').length,
        completedClaims: claimsRes.filter(c => c.status === 'completed').length,
        avgResolutionTime: calculateAvgResolutionTime(claimsRes)
      }
      setStats(stats)
    } catch (error) {
      message.error('Lỗi tải dữ liệu: ' + error.message)
    }
  }

  const calculateAvgResolutionTime = (claims) => {
    const completedClaims = claims.filter(c => c.status === 'completed' && c.resolution_date)
    if (completedClaims.length === 0) return 0
    
    const totalDays = completedClaims.reduce((sum, claim) => {
      const claimDate = moment(claim.claim_date)
      const resolutionDate = moment(claim.resolution_date)
      return sum + resolutionDate.diff(claimDate, 'days')
    }, 0)
    
    return Math.round(totalDays / completedClaims.length)
  }

  const fetchWarrantyClaims = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.claim_type) params.claim_type = filters.claim_type
      if (filters.customer_id) params.customer_id = filters.customer_id

      const data = await api.getWarrantyClaims(params)
      
      // Filter by search if provided
      let filteredData = data
      if (filters.search) {
        filteredData = data.filter(claim => 
          claim.claim_number.toLowerCase().includes(filters.search.toLowerCase()) ||
          claim.serial_number.toLowerCase().includes(filters.search.toLowerCase()) ||
          claim.product_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          claim.customer_name.toLowerCase().includes(filters.search.toLowerCase())
        )
      }
      
      setWarrantyClaims(filteredData)
    } catch (error) {
      message.error('Lỗi tải warranty claims: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClaim = () => {
    setEditingClaim(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEditClaim = (claim) => {
    setEditingClaim(claim)
    form.setFieldsValue({
      ...claim,
      claim_date: claim.claim_date ? moment(claim.claim_date) : null,
      warranty_start_date: claim.warranty_start_date ? moment(claim.warranty_start_date) : null,
      warranty_end_date: claim.warranty_end_date ? moment(claim.warranty_end_date) : null,
      resolution_date: claim.resolution_date ? moment(claim.resolution_date) : null
    })
    setModalVisible(true)
  }

  const handleViewDetail = (claim) => {
    setSelectedClaim(claim)
    setDetailModalVisible(true)
  }

  const handleSubmit = async (values) => {
    try {
      const claimData = {
        ...values,
        claim_date: values.claim_date ? values.claim_date.format('YYYY-MM-DD') : null,
        warranty_start_date: values.warranty_start_date ? values.warranty_start_date.format('YYYY-MM-DD') : null,
        warranty_end_date: values.warranty_end_date ? values.warranty_end_date.format('YYYY-MM-DD') : null,
        resolution_date: values.resolution_date ? values.resolution_date.format('YYYY-MM-DD') : null
      }

      if (editingClaim) {
        await api.updateWarrantyClaim(editingClaim.id, claimData)
        message.success('Cập nhật warranty claim thành công')
      } else {
        await api.createWarrantyClaim(claimData)
        message.success('Tạo warranty claim thành công')
      }

      setModalVisible(false)
      fetchWarrantyClaims()
      fetchData()
    } catch (error) {
      message.error('Lỗi lưu warranty claim: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'orange',
      'approved': 'blue',
      'rejected': 'red',
      'in_progress': 'purple',
      'completed': 'green',
      'cancelled': 'default'
    }
    return colors[status] || 'default'
  }

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Chờ xử lý',
      'approved': 'Đã duyệt',
      'rejected': 'Từ chối',
      'in_progress': 'Đang xử lý',
      'completed': 'Hoàn thành',
      'cancelled': 'Hủy bỏ'
    }
    return texts[status] || status
  }

  const getClaimTypeText = (type) => {
    const texts = {
      'hardware': 'Lỗi phần cứng',
      'software': 'Lỗi phần mềm',
      'physical_damage': 'Hư hỏng vật lý',
      'water_damage': 'Hỏng do nước',
      'other': 'Khác'
    }
    return texts[type] || type
  }

  const getWarrantyStatus = (startDate, endDate) => {
    const now = moment()
    const start = moment(startDate)
    const end = moment(endDate)
    
    if (now.isBefore(start)) {
      return { status: 'not_started', text: 'Chưa bắt đầu', color: 'default' }
    } else if (now.isAfter(end)) {
      return { status: 'expired', text: 'Hết hạn', color: 'red' }
    } else {
      const daysLeft = end.diff(now, 'days')
      if (daysLeft <= 30) {
        return { status: 'expiring', text: `Còn ${daysLeft} ngày`, color: 'orange' }
      } else {
        return { status: 'valid', text: `Còn ${daysLeft} ngày`, color: 'green' }
      }
    }
  }

  const columns = [
    {
      title: 'Mã claim',
      dataIndex: 'claim_number',
      key: 'claim_number',
      render: (text) => <Text code strong>{text}</Text>
    },
    {
      title: 'Sản phẩm',
      key: 'product_info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.product_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            SN: <Text code>{record.serial_number}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Khách hàng',
      key: 'customer_info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.customer_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <PhoneOutlined /> {record.customer_phone}
          </div>
        </div>
      )
    },
    {
      title: 'Loại claim',
      dataIndex: 'claim_type',
      key: 'claim_type',
      render: (type) => (
        <Tag>{getClaimTypeText(type)}</Tag>
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
      title: 'Bảo hành',
      key: 'warranty_info',
      render: (_, record) => {
        const warranty = getWarrantyStatus(record.warranty_start_date, record.warranty_end_date)
        return (
          <div>
            <Tag color={warranty.color}>{warranty.text}</Tag>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {moment(record.warranty_start_date).format('DD/MM/YYYY')} - {moment(record.warranty_end_date).format('DD/MM/YYYY')}
            </div>
          </div>
        )
      }
    },
    {
      title: 'Ngày claim',
      dataIndex: 'claim_date',
      key: 'claim_date',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Chi phí',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost) => cost ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cost) : '-'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<FileTextOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditClaim(record)}
            />
          </Tooltip>
          <Tooltip title="In phiếu">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => message.info('Tính năng in phiếu đang phát triển')}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Quản lý Bảo hành</Title>
        
        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng claims"
                value={stats.totalClaims}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Chờ xử lý"
                value={stats.pendingClaims}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đang xử lý"
                value={stats.activeClaims}
                prefix={<ToolOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Thời gian xử lý TB"
                value={stats.avgResolutionTime}
                suffix="ngày"
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Input
                placeholder="Tìm kiếm claim..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                allowClear
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Trạng thái"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="pending">Chờ xử lý</Option>
                <Option value="approved">Đã duyệt</Option>
                <Option value="in_progress">Đang xử lý</Option>
                <Option value="completed">Hoàn thành</Option>
                <Option value="rejected">Từ chối</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Loại claim"
                value={filters.claim_type}
                onChange={(value) => setFilters({ ...filters, claim_type: value })}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="hardware">Lỗi phần cứng</Option>
                <Option value="software">Lỗi phần mềm</Option>
                <Option value="physical_damage">Hư hỏng vật lý</Option>
                <Option value="water_damage">Hỏng do nước</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Col>
            <Col span={5}>
              <Select
                placeholder="Khách hàng"
                value={filters.customer_id}
                onChange={(value) => setFilters({ ...filters, customer_id: value })}
                allowClear
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
              >
                {customers.map(customer => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone})
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={5}>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateClaim}>
                  Tạo claim mới
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Warranty Claims Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={warrantyClaims}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} claims`
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Warranty Claim Form Modal */}
      <Modal
        title={editingClaim ? 'Chỉnh sửa Warranty Claim' : 'Tạo Warranty Claim'}
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
                name="serial_number_id"
                label="Serial Number"
                rules={[{ required: true, message: 'Vui lòng chọn serial number' }]}
              >
                <Select placeholder="Chọn serial number" showSearch optionFilterProp="children">
                  {serialNumbers.map(serial => (
                    <Option key={serial.id} value={serial.id}>
                      {serial.serial_number} - {serial.product_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customer_id"
                label="Khách hàng"
                rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
              >
                <Select placeholder="Chọn khách hàng" showSearch optionFilterProp="children">
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.phone})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="claim_type"
                label="Loại claim"
                rules={[{ required: true, message: 'Vui lòng chọn loại claim' }]}
              >
                <Select placeholder="Chọn loại claim">
                  <Option value="hardware">Lỗi phần cứng</Option>
                  <Option value="software">Lỗi phần mềm</Option>
                  <Option value="physical_damage">Hư hỏng vật lý</Option>
                  <Option value="water_damage">Hỏng do nước</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="pending">Chờ xử lý</Option>
                  <Option value="approved">Đã duyệt</Option>
                  <Option value="in_progress">Đang xử lý</Option>
                  <Option value="completed">Hoàn thành</Option>
                  <Option value="rejected">Từ chối</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="claim_date"
                label="Ngày claim"
                rules={[{ required: true, message: 'Vui lòng chọn ngày claim' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="warranty_start_date"
                label="Ngày bắt đầu BH"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu bảo hành' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="warranty_end_date"
                label="Ngày kết thúc BH"
                rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc bảo hành' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="issue_description"
            label="Mô tả vấn đề"
            rules={[{ required: true, message: 'Vui lòng mô tả vấn đề' }]}
          >
            <TextArea rows={4} placeholder="Mô tả chi tiết vấn đề gặp phải" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cost"
                label="Chi phí sửa chữa"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="resolution_date"
                label="Ngày hoàn thành"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="resolution"
            label="Phương án xử lý"
          >
            <TextArea rows={3} placeholder="Mô tả phương án xử lý" />
          </Form.Item>

          <Form.Item
            name="technician_notes"
            label="Ghi chú kỹ thuật"
          >
            <TextArea rows={3} placeholder="Ghi chú của kỹ thuật viên" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingClaim ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Warranty Claim Detail Modal */}
      <Modal
        title="Chi tiết Warranty Claim"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedClaim && (
          <div>
            <Descriptions title="Thông tin claim" column={2}>
              <Descriptions.Item label="Mã claim">{selectedClaim.claim_number}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedClaim.status)}>
                  {getStatusText(selectedClaim.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Loại claim">
                {getClaimTypeText(selectedClaim.claim_type)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày claim">
                {moment(selectedClaim.claim_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedClaim.customer_name}
              </Descriptions.Item>
              <Descriptions.Item label="Điện thoại">
                {selectedClaim.customer_phone}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Thông tin sản phẩm" column={2}>
              <Descriptions.Item label="Tên sản phẩm">{selectedClaim.product_name}</Descriptions.Item>
              <Descriptions.Item label="Serial Number">{selectedClaim.serial_number}</Descriptions.Item>
              <Descriptions.Item label="Bảo hành từ">
                {moment(selectedClaim.warranty_start_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Bảo hành đến">
                {moment(selectedClaim.warranty_end_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>Mô tả vấn đề</Title>
            <Text>{selectedClaim.issue_description}</Text>

            {selectedClaim.resolution && (
              <>
                <Divider />
                <Title level={4}>Phương án xử lý</Title>
                <Text>{selectedClaim.resolution}</Text>
              </>
            )}

            {selectedClaim.technician_notes && (
              <>
                <Divider />
                <Title level={4}>Ghi chú kỹ thuật</Title>
                <Text>{selectedClaim.technician_notes}</Text>
              </>
            )}

            {selectedClaim.cost && (
              <>
                <Divider />
                <Title level={4}>Chi phí</Title>
                <Text strong style={{ color: '#1890ff' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedClaim.cost)}
                </Text>
              </>
            )}

            <Divider />

            <Timeline>
              <Timeline.Item color="blue">
                <strong>Tạo claim:</strong> {moment(selectedClaim.claim_date).format('DD/MM/YYYY HH:mm')}
              </Timeline.Item>
              {selectedClaim.status === 'approved' && (
                <Timeline.Item color="green">
                  <strong>Đã duyệt:</strong> Claim được phê duyệt
                </Timeline.Item>
              )}
              {selectedClaim.status === 'in_progress' && (
                <Timeline.Item color="orange">
                  <strong>Đang xử lý:</strong> Đang tiến hành sửa chữa
                </Timeline.Item>
              )}
              {selectedClaim.status === 'completed' && selectedClaim.resolution_date && (
                <Timeline.Item color="green">
                  <strong>Hoàn thành:</strong> {moment(selectedClaim.resolution_date).format('DD/MM/YYYY')}
                </Timeline.Item>
              )}
              {selectedClaim.status === 'rejected' && (
                <Timeline.Item color="red">
                  <strong>Từ chối:</strong> Claim không được chấp nhận
                </Timeline.Item>
              )}
            </Timeline>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default WarrantyManagementPage 