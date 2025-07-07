import React, { useEffect, useState } from 'react'
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Divider, 
  Row, 
  Col, 
  Alert,
  Spin
} from 'antd'
import { 
  UserOutlined, 
  LockOutlined, 
  ShopOutlined, 
  LoginOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

const { Title, Text, Paragraph } = Typography

export default function LoginForm() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login, loading, initialLoading } = useAuth()
  const [loginError, setLoginError] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (user && !initialLoading) {
      const from = location.state?.from?.pathname || '/dashboard'
      console.log('✅ User already logged in, redirecting to:', from)
      navigate(from, { replace: true })
    }
  }, [user, navigate, location, initialLoading])

  // Clear error when form values change
  useEffect(() => {
    if (loginError) {
      setLoginError('')
    }
  }, [form.getFieldsValue()])

  const onFinish = async (values) => {
    setLoginError('')
    
    try {
      console.log('📝 Form submitted:', { 
        email: values.email,
        hasPassword: !!values.password,
        timestamp: new Date().toISOString()
      })
      
      const result = await login(values.email, values.password)
      
      if (result.success) {
        console.log('🎉 Login successful, redirecting...')
        const from = location.state?.from?.pathname || '/dashboard'
        navigate(from, { replace: true })
      } else {
        console.error('❌ Login failed:', result.error)
        setLoginError(result.error || 'Đăng nhập thất bại')
      }
    } catch (error) {
      console.error('❌ Form submission error:', error)
      setLoginError('Có lỗi xảy ra khi đăng nhập')
    }
  }

  const fillDemoAccount = (accountType) => {
    const accounts = {
      admin: {
        email: 'admin@pos.com',
        password: 'admin123'
      },
      cashier: {
        email: 'cashier@pos.com',
        password: 'cashier123'
      },
      manager: {
        email: 'manager@pos.com',
        password: 'manager123'
      }
    }
    
    const account = accounts[accountType]
    if (account) {
      form.setFieldsValue(account)
      setLoginError('')
      console.log(`📝 Demo account filled: ${accountType}`)
    }
  }

  // Show loading spinner during initial auth check
  if (initialLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Card style={{ padding: '40px', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Đang khởi tạo hệ thống...</Text>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <Card 
        style={{ 
          width: '100%',
          maxWidth: 500, 
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          borderRadius: '24px',
          border: 'none',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)'
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Header Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '48px 40px',
          textAlign: 'center',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            width: 100,
            height: 100,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,255,255,0.3)'
          }}>
            <ShopOutlined style={{ fontSize: 48, color: 'white' }} />
          </div>
          <Title level={1} style={{ 
            margin: '0 0 8px 0', 
            color: 'white',
            fontSize: '32px',
            fontWeight: '700'
          }}>
            POS System
          </Title>
          <Text style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '18px',
            fontWeight: '400'
          }}>
            Hệ thống quản lý bán hàng hiện đại
          </Text>
        </div>

        {/* Login Form Section */}
        <div style={{ padding: '48px 40px' }}>
          {/* Error Alert */}
          {loginError && (
            <Alert
              message="Lỗi đăng nhập"
              description={loginError}
              type="error"
              showIcon
              closable
              onClose={() => setLoginError('')}
              style={{ 
                marginBottom: '24px', 
                borderRadius: '12px',
                border: '1px solid #ff4d4f'
              }}
            />
          )}

          {/* Login Form */}
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
            requiredMark={false}
          >
            <Form.Item
              label={<Text strong style={{ fontSize: '16px' }}>Email</Text>}
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#bfbfbf', fontSize: '18px' }} />}
                placeholder="Nhập email đăng nhập"
                style={{ 
                  borderRadius: '12px', 
                  height: '56px',
                  fontSize: '16px',
                  border: '2px solid #f0f0f0',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.border = '2px solid #667eea'}
                onBlur={(e) => e.target.style.border = '2px solid #f0f0f0'}
              />
            </Form.Item>

            <Form.Item
              label={<Text strong style={{ fontSize: '16px' }}>Mật khẩu</Text>}
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 3, message: 'Mật khẩu phải có ít nhất 3 ký tự!' }
              ]}
              style={{ marginBottom: '32px' }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf', fontSize: '18px' }} />}
                placeholder="Nhập mật khẩu"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                style={{ 
                  borderRadius: '12px', 
                  height: '56px',
                  fontSize: '16px',
                  border: '2px solid #f0f0f0',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.border = '2px solid #667eea'}
                onBlur={(e) => e.target.style.border = '2px solid #f0f0f0'}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '24px' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={!loading && <LoginOutlined />}
                block
                style={{
                  height: '56px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)'
                }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập hệ thống'}
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '32px 0', borderColor: '#e8e8e8' }}>
            <Text type="secondary" style={{ fontSize: '14px', fontWeight: '500' }}>
              Tài khoản demo
            </Text>
          </Divider>

          {/* Demo Accounts */}
          <div style={{ marginBottom: '24px' }}>
            <Row gutter={[12, 12]}>
              <Col span={8}>
                <Card 
                  size="small" 
                  hoverable
                  onClick={() => fillDemoAccount('admin')}
                  style={{ 
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '2px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)'
                  }}
                  bodyStyle={{ padding: '20px 12px' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = '2px solid #667eea'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = '2px solid #f0f0f0'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <UserOutlined style={{ fontSize: '28px', color: '#667eea', marginBottom: '8px' }} />
                  <div>
                    <Text strong style={{ 
                      display: 'block', 
                      fontSize: '13px',
                      marginBottom: '4px'
                    }}>
                      Admin
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      Toàn quyền
                    </Text>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card 
                  size="small" 
                  hoverable
                  onClick={() => fillDemoAccount('cashier')}
                  style={{ 
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '2px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(135deg, #52c41a15 0%, #73d13d15 100%)'
                  }}
                  bodyStyle={{ padding: '20px 12px' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = '2px solid #52c41a'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = '2px solid #f0f0f0'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <ShopOutlined style={{ fontSize: '28px', color: '#52c41a', marginBottom: '8px' }} />
                  <div>
                    <Text strong style={{ 
                      display: 'block', 
                      fontSize: '13px',
                      marginBottom: '4px'
                    }}>
                      Thu ngân
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      Bán hàng
                    </Text>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card 
                  size="small" 
                  hoverable
                  onClick={() => fillDemoAccount('manager')}
                  style={{ 
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '2px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(135deg, #fa8c1615 0%, #faad1415 100%)'
                  }}
                  bodyStyle={{ padding: '20px 12px' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = '2px solid #fa8c16'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = '2px solid #f0f0f0'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <UserOutlined style={{ fontSize: '28px', color: '#fa8c16', marginBottom: '8px' }} />
                  <div>
                    <Text strong style={{ 
                      display: 'block', 
                      fontSize: '13px',
                      marginBottom: '4px'
                    }}>
                      Quản lý
                    </Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      Giám sát
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>

          {/* Instructions */}
          <Card 
            size="small" 
            style={{ 
              background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)', 
              border: '1px solid #e8ecf0',
              borderRadius: '12px',
              textAlign: 'center'
            }}
            bodyStyle={{ padding: '20px' }}
          >
            <Text type="secondary" style={{ fontSize: '14px', lineHeight: '1.6' }}>
              💡 <Text strong>Hướng dẫn:</Text> Nhấp vào tài khoản demo để tự động điền thông tin đăng nhập.
              <br />
              🔐 Tất cả dữ liệu được lưu trữ an toàn trên Cloudflare.
            </Text>
          </Card>
        </div>
      </Card>
    </div>
  )
} 