import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Modal, Form, Input, message, Popconfirm, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import api from '../services/api'

const { Search } = Input
const { TextArea } = Input

const CustomersPage = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const data = await api.getCustomers({ search: searchText })
      setCustomers(data)
    } catch (error) {
      message.error('Không thể tải danh sách khách hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchText(value)
    fetchCustomers()
  }

  const handleAdd = () => {
    setEditingCustomer(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    form.setFieldsValue(customer)
    setModalVisible(true)
  }

  const handleSave = async (values) => {
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, values)
        message.success('Đã cập nhật khách hàng')
      } else {
        await api.createCustomer(values)
        message.success('Đã thêm khách hàng mới')
      }
      
      setModalVisible(false)
      fetchCustomers()
    } catch (error) {
      message.error('Có lỗi xảy ra')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteCustomer(id)
      message.success('Đã xóa khách hàng')
      fetchCustomers()
    } catch (error) {
      message.error('Không thể xóa khách hàng')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const columns = [
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.phone}</div>
        </div>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || '-'
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (address) => address || '-'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Tổng đơn hàng',
      dataIndex: 'total_orders',
      key: 'total_orders',
      render: (count) => (
        <Tag color="blue">{count || 0} đơn</Tag>
      )
    },
    {
      title: 'Tổng chi tiêu',
      dataIndex: 'total_spent',
      key: 'total_spent',
      render: (amount) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          {formatCurrency(amount || 0)}
        </span>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa khách hàng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Quản lý khách hàng</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm khách hàng
          </Button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Tìm kiếm tên, số điện thoại, email..."
            onSearch={handleSearch}
            style={{ width: 400 }}
            prefix={<SearchOutlined />}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} khách hàng`
          }}
        />
      </Card>

      {/* Customer Form Modal */}
      <Modal
        title={editingCustomer ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập email (tùy chọn)" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <TextArea 
              rows={3} 
              placeholder="Nhập địa chỉ (tùy chọn)" 
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea 
              rows={2} 
              placeholder="Ghi chú về khách hàng (tùy chọn)" 
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCustomer ? 'Cập nhật' : 'Thêm mới'}
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

export default CustomersPage 