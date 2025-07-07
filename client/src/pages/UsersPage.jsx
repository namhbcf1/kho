import React, { useState, useEffect } from 'react'
import {
  Card, Table, Button, Space, Input, Select, Modal, Form, Row, Col,
  message, Tooltip, Typography, Tag, Avatar, Switch
} from 'antd'
import {
  PlusOutlined, EditOutlined, SearchOutlined, UserOutlined,
  LockOutlined, UnlockOutlined, MailOutlined, PhoneOutlined
} from '@ant-design/icons'
import api from '../services/api'

const { Title, Text } = Typography
const { Option } = Select

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchText, setSearchText] = useState('')

  const [form] = Form.useForm()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersData = await api.getUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
      message.error('Lỗi tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setModalVisible(true)
  }

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        // Update user
        await api.updateUser(editingUser.id, values)
        message.success('Cập nhật người dùng thành công')
      } else {
        // Create user
        await api.createUser(values)
        message.success('Tạo người dùng thành công')
      }
      setModalVisible(false)
      fetchUsers() // Refresh the list
    } catch (error) {
      message.error('Lỗi lưu người dùng: ' + error.message)
    }
  }

  const handleStatusToggle = async (userId, newStatus) => {
    try {
      const user = users.find(u => u.id === userId)
      await api.updateUser(userId, { ...user, status: newStatus })
      message.success(`${newStatus === 'active' ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản thành công`)
      fetchUsers() // Refresh the list
    } catch (error) {
      message.error('Lỗi cập nhật trạng thái: ' + error.message)
    }
  }

  const handleResetPassword = (user) => {
    Modal.confirm({
      title: 'Đặt lại mật khẩu',
      content: `Bạn có chắc muốn đặt lại mật khẩu cho người dùng "${user.name}"? Mật khẩu mới sẽ là "123456".`,
      onOk: async () => {
        try {
          await api.updateUser(user.id, { ...user, password: '123456' })
          message.success('Đặt lại mật khẩu thành công! Mật khẩu mới: 123456')
        } catch (error) {
          message.error('Lỗi đặt lại mật khẩu: ' + error.message)
        }
      }
    })
  }

  const getRoleColor = (role) => {
    const colors = {
      'admin': 'red',
      'manager': 'blue',
      'staff': 'green'
    }
    return colors[role] || 'default'
  }

  const getRoleText = (role) => {
    const texts = {
      'admin': 'Quản trị viên',
      'manager': 'Quản lý',
      'staff': 'Nhân viên'
    }
    return texts[role] || role
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns = [
    {
      title: 'Người dùng',
      key: 'user_info',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              @{record.username}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '12px', marginBottom: 4 }}>
            <MailOutlined /> {record.email}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <PhoneOutlined /> {record.phone}
          </div>
        </div>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Switch
          checked={status === 'active'}
          onChange={(checked) => handleStatusToggle(record.id, checked ? 'active' : 'inactive')}
          checkedChildren="Hoạt động"
          unCheckedChildren="Khóa"
        />
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Đặt lại mật khẩu">
            <Button
              type="text"
              icon={<LockOutlined />}
              onClick={() => handleResetPassword(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Quản lý Người dùng</Title>
        
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Input
                placeholder="Tìm kiếm người dùng..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={16}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Thêm người dùng
              </Button>
            </Col>
          </Row>
        </Card>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} người dùng`
          }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
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
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
              >
                <Input placeholder="Nhập tên đăng nhập" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Nhập email" />
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
                name="role"
                label="Vai trò"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
              >
                <Select placeholder="Chọn vai trò">
                  <Option value="admin">Quản trị viên</Option>
                  <Option value="manager">Quản lý</Option>
                  <Option value="staff">Nhân viên</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="active">Hoạt động</Option>
                  <Option value="inactive">Khóa</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                >
                  <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Xác nhận mật khẩu" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default UsersPage 