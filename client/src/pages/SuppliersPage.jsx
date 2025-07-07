import React, { useState, useEffect } from 'react'
import {
  Card, Table, Button, Space, Input, Select, Modal, Form, Row, Col,
  message, Tooltip, Typography, Tag, Popconfirm
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  BankOutlined, PhoneOutlined, MailOutlined
} from '@ant-design/icons'
import api from '../services/api'

const { Title, Text } = Typography
const { TextArea } = Input

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [searchText, setSearchText] = useState('')

  const [form] = Form.useForm()

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const data = await api.getSuppliers({ search: searchText })
      setSuppliers(data)
    } catch (error) {
      message.error('Lỗi tải nhà cung cấp: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingSupplier(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier)
    form.setFieldsValue(supplier)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteSupplier(id)
      message.success('Xóa nhà cung cấp thành công')
      fetchSuppliers()
    } catch (error) {
      message.error('Lỗi xóa nhà cung cấp: ' + error.message)
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, values)
        message.success('Cập nhật nhà cung cấp thành công')
      } else {
        await api.createSupplier(values)
        message.success('Tạo nhà cung cấp thành công')
      }
      setModalVisible(false)
      fetchSuppliers()
    } catch (error) {
      message.error('Lỗi lưu nhà cung cấp: ' + error.message)
    }
  }

  const columns = [
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Mã: <Text code>{record.code}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.contact_person}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <PhoneOutlined /> {record.phone}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <MailOutlined /> {record.email}
          </div>
        </div>
      )
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Ngưng hợp tác'}
        </Tag>
      )
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
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc muốn xóa nhà cung cấp này?"
            onConfirm={() => handleDelete(record.id)}
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

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Quản lý Nhà cung cấp</Title>
        
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Input
                placeholder="Tìm kiếm nhà cung cấp..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={fetchSuppliers}
                allowClear
              />
            </Col>
            <Col span={16}>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                  Thêm nhà cung cấp
                </Button>
                <Button onClick={fetchSuppliers}>
                  Tìm kiếm
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={suppliers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhà cung cấp`
          }}
        />
      </Card>

      <Modal
        title={editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
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
                name="name"
                label="Tên nhà cung cấp"
                rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}
              >
                <Input placeholder="Nhập tên nhà cung cấp" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã nhà cung cấp"
                rules={[{ required: true, message: 'Vui lòng nhập mã nhà cung cấp' }]}
              >
                <Input placeholder="Nhập mã nhà cung cấp" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contact_person"
                label="Người liên hệ"
              >
                <Input placeholder="Nhập tên người liên hệ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
              >
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="active">Hoạt động</Select.Option>
                  <Select.Option value="inactive">Ngưng hợp tác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <TextArea rows={3} placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={3} placeholder="Nhập ghi chú" />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingSupplier ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default SuppliersPage 