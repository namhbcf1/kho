import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider, Alert } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, RobotOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const LoginForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { login, loading } = useAuth();
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    setError(null);
    
    const result = await login(values);
    
    if (result.success) {
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setError(result.error);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    
    const demoCredentials = {
      username: 'admin',
      password: 'admin123'
    };
    
    const result = await login(demoCredentials);
    
    if (result.success) {
      if (onSuccess) {
        onSuccess();
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '16px',
          border: 'none'
        }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <RobotOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            Smart POS System
          </Title>
          <Text type="secondary">
            Đăng nhập để sử dụng hệ thống
          </Text>
        </div>

        {error && (
          <Alert
            message="Đăng nhập thất bại"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
              { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<LoginOutlined />}
              block
              style={{ 
                height: '48px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Hoặc
          </Text>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="default"
            onClick={handleDemoLogin}
            loading={loading}
            block
            style={{ 
              height: '40px',
              borderRadius: '8px',
              borderStyle: 'dashed'
            }}
          >
            🚀 Dùng thử với tài khoản Demo
          </Button>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Demo: admin / admin123
            </Text>
          </div>
        </Space>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Smart POS System 2025 - Phiên bản bảo mật
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm; 