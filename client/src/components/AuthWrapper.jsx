import React from 'react';
import { Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';

const AuthWrapper = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return children;
};

export default AuthWrapper; 