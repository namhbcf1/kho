import React, { useEffect } from 'react'
import { Form, Input, Button, Card, Typography, Space, Row, Col } from 'antd'
import { UserOutlined, LockOutlined, ShopOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

export default function LoginForm() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { user, login, loading } = useAuth()

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const onFinish = async (values) => {
    const result = await login(values.email, values.password)
    if (result.success) navigate('/dashboard', { replace: true })
  }

  const fillDemo = (type) => {
    form.setFieldsValue({
      email: type === 'admin' ? 'admin@pos.com' : 'cashier@pos.com',
      password: type === 'admin' ? 'admin123' : 'cashier123'
    })
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card style={{ 
        width: '100%',
        maxWidth: 450, 
        borderRadius: '20px',
        border: 'none',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 32px',
          textAlign: 'center',
          color: 'white',
          margin: '-24px -24px 24px -24px'
        }}>
          <ShopOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <Title level={2} style={{ margin: 0, color: 'white' }}>
            POS System
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
            Hệ thống quản lý bán hàng
          </Text>
        </div>

        {/* Form */}
        <Form form={form} onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder="Nhập email"
              style={{ borderRadius: '10px', height: '48px' }}
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              style={{ borderRadius: '10px', height: '48px' }}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              style={{
                height: '48px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Form.Item>
        </Form>

        {/* Demo Accounts */}
        <div style={{ marginTop: '24px' }}>
          <Text type="secondary">Tài khoản demo:</Text>
          <Row gutter={12} style={{ marginTop: '12px' }}>
            <Col span={12}>
              <Button
                onClick={() => fillDemo('admin')}
                style={{ 
                  width: '100%', 
                  height: '60px',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text strong style={{ fontSize: '12px' }}>Admin</Text>
                <Text type="secondary" style={{ fontSize: '10px' }}>admin@pos.com</Text>
              </Button>
            </Col>
            <Col span={12}>
              <Button
                onClick={() => fillDemo('cashier')}
                style={{ 
                  width: '100%', 
                  height: '60px',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text strong style={{ fontSize: '12px' }}>Cashier</Text>
                <Text type="secondary" style={{ fontSize: '10px' }}>cashier@pos.com</Text>
              </Button>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  )
} 