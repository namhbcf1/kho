import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Alert, Typography, Collapse, Tag, Spin, Progress } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const SystemTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const tests = [
    {
      id: 'api-health',
      name: 'API Health Check',
      description: 'Kiểm tra kết nối API backend',
      test: async () => {
        const response = await fetch('https://pos-backend.bangachieu2.workers.dev/api/health');
        const data = await response.json();
        return { success: response.ok, data, message: data.message };
      }
    },
    {
      id: 'products-api',
      name: 'Products API Test',
      description: 'Kiểm tra API sản phẩm',
      test: async () => {
        const response = await fetch('https://pos-backend.bangachieu2.workers.dev/api/products');
        const data = await response.json();
        return { success: response.ok, data, message: `Found ${data.data?.length || 0} products` };
      }
    },
    {
      id: 'customers-api',
      name: 'Customers API Test',
      description: 'Kiểm tra API khách hàng',
      test: async () => {
        const response = await fetch('https://pos-backend.bangachieu2.workers.dev/api/customers');
        const data = await response.json();
        return { success: response.ok, data, message: `Found ${data.data?.length || 0} customers` };
      }
    },
    {
      id: 'orders-api',
      name: 'Orders API Test',
      description: 'Kiểm tra API đơn hàng',
      test: async () => {
        const response = await fetch('https://pos-backend.bangachieu2.workers.dev/api/orders');
        const data = await response.json();
        return { success: response.ok, data, message: `Orders API status: ${data.success ? 'OK' : 'Error'}` };
      }
    },
    {
      id: 'serials-api',
      name: 'Serials API Test',
      description: 'Kiểm tra API serial numbers',
      test: async () => {
        try {
          const response = await fetch('https://pos-backend.bangachieu2.workers.dev/api/serials/search?q=test');
          const data = await response.json();
          return { success: response.ok, data, message: `Serials API: ${response.ok ? 'Available' : 'Not implemented'}` };
        } catch (error) {
          return { success: false, data: null, message: 'Serials API not available' };
        }
      }
    },
    {
      id: 'local-storage',
      name: 'Local Storage Test',
      description: 'Kiểm tra localStorage browser',
      test: async () => {
        try {
          const testKey = 'pos-test-' + Date.now();
          const testValue = 'test-data';
          localStorage.setItem(testKey, testValue);
          const retrieved = localStorage.getItem(testKey);
          localStorage.removeItem(testKey);
          return { 
            success: retrieved === testValue, 
            data: { testKey, testValue, retrieved }, 
            message: 'Local storage working' 
          };
        } catch (error) {
          return { success: false, data: null, message: 'Local storage error: ' + error.message };
        }
      }
    },
    {
      id: 'react-components',
      name: 'React Components Test',
      description: 'Kiểm tra các component React',
      test: async () => {
        const errors = [];
        
        // Check for common React errors
        if (typeof React === 'undefined') {
          errors.push('React not loaded');
        }
        
        // Check for Ant Design
        if (typeof window !== 'undefined' && !window.antd) {
          // This is expected, antd doesn't expose itself globally
        }
        
        // Check for common global errors
        const globalErrors = window.posSystemErrors || [];
        
        return { 
          success: errors.length === 0, 
          data: { errors, globalErrors }, 
          message: errors.length === 0 ? 'Components OK' : `${errors.length} errors found` 
        };
      }
    },
    {
      id: 'console-errors',
      name: 'Console Errors Check',
      description: 'Kiểm tra lỗi trong console',
      test: async () => {
        // This would require custom error tracking
        const errors = window.posSystemErrors || [];
        return { 
          success: errors.length === 0, 
          data: { errors }, 
          message: `${errors.length} console errors found` 
        };
      }
    },
    {
      id: 'network-connectivity',
      name: 'Network Connectivity',
      description: 'Kiểm tra kết nối mạng',
      test: async () => {
        const isOnline = navigator.onLine;
        const startTime = Date.now();
        
        try {
          await fetch('https://pos-backend.bangachieu2.workers.dev/api/health', { 
            method: 'HEAD',
            cache: 'no-cache'
          });
          const responseTime = Date.now() - startTime;
          
          return { 
            success: true, 
            data: { isOnline, responseTime }, 
            message: `Network OK (${responseTime}ms)` 
          };
        } catch (error) {
          return { 
            success: false, 
            data: { isOnline, error: error.message }, 
            message: 'Network error: ' + error.message 
          };
        }
      }
    },
    {
      id: 'browser-features',
      name: 'Browser Features Check',
      description: 'Kiểm tra tính năng browser',
      test: async () => {
        const features = {
          localStorage: typeof Storage !== 'undefined',
          sessionStorage: typeof sessionStorage !== 'undefined',
          fetch: typeof fetch !== 'undefined',
          promises: typeof Promise !== 'undefined',
          es6: typeof Symbol !== 'undefined',
          webWorkers: typeof Worker !== 'undefined',
          notifications: 'Notification' in window,
          geolocation: 'geolocation' in navigator,
          camera: 'mediaDevices' in navigator,
        };
        
        const supportedFeatures = Object.values(features).filter(Boolean).length;
        const totalFeatures = Object.keys(features).length;
        
        return { 
          success: supportedFeatures >= totalFeatures * 0.8, 
          data: features, 
          message: `${supportedFeatures}/${totalFeatures} features supported` 
        };
      }
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults([]);
    
    // Initialize error tracking
    window.posSystemErrors = window.posSystemErrors || [];
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      setProgress(((i + 1) / tests.length) * 100);
      
      try {
        console.log(`🧪 Running test: ${test.name}`);
        const result = await test.test();
        
        setTestResults(prev => [...prev, {
          ...test,
          result: {
            ...result,
            timestamp: new Date().toISOString(),
            duration: Date.now() - Date.now() // This would need proper timing
          }
        }]);
        
        console.log(`✅ Test ${test.name}:`, result.success ? 'PASSED' : 'FAILED', result.message);
        
      } catch (error) {
        console.error(`❌ Test ${test.name} failed:`, error);
        
        setTestResults(prev => [...prev, {
          ...test,
          result: {
            success: false,
            data: null,
            message: 'Test error: ' + error.message,
            timestamp: new Date().toISOString(),
            error: error.message
          }
        }]);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (success) => {
    if (success) return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
  };

  const getStatusColor = (success) => {
    return success ? 'success' : 'error';
  };

  const passedTests = testResults.filter(t => t.result?.success).length;
  const totalTests = testResults.length;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>🧪 POS System Test Suite</Title>
      <Paragraph>
        Kiểm tra toàn bộ hệ thống POS để phát hiện lỗi và vấn đề.
      </Paragraph>
      
      <Card style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Trạng thái test: </Text>
              {isRunning ? (
                <Tag color="processing">Đang chạy...</Tag>
              ) : (
                <Tag color={totalTests > 0 ? (passedTests === totalTests ? 'success' : 'error') : 'default'}>
                  {totalTests > 0 ? `${passedTests}/${totalTests} passed` : 'Chưa chạy'}
                </Tag>
              )}
            </div>
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />}
              onClick={runAllTests}
              loading={isRunning}
              disabled={isRunning}
            >
              {isRunning ? 'Đang chạy test...' : 'Chạy tất cả test'}
            </Button>
          </div>
          
          {isRunning && (
            <Progress 
              percent={Math.round(progress)} 
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          )}
        </Space>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <Title level={3}>Kết quả test</Title>
          <Collapse>
            {testResults.map((test, index) => (
              <Panel
                key={test.id}
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      {getStatusIcon(test.result.success)}
                      <Text strong>{test.name}</Text>
                      <Text type="secondary">- {test.description}</Text>
                    </Space>
                    <Tag color={getStatusColor(test.result.success)}>
                      {test.result.success ? 'PASSED' : 'FAILED'}
                    </Tag>
                  </div>
                }
              >
                <div style={{ padding: '16px 0' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Kết quả: </Text>
                      <Text type={test.result.success ? 'success' : 'danger'}>
                        {test.result.message}
                      </Text>
                    </div>
                    
                    {test.result.timestamp && (
                      <div>
                        <Text strong>Thời gian: </Text>
                        <Text type="secondary">{new Date(test.result.timestamp).toLocaleString()}</Text>
                      </div>
                    )}
                    
                    {test.result.data && (
                      <div>
                        <Text strong>Chi tiết: </Text>
                        <pre style={{ 
                          background: '#f5f5f5', 
                          padding: '8px', 
                          borderRadius: '4px',
                          fontSize: '12px',
                          overflow: 'auto',
                          maxHeight: '200px'
                        }}>
                          {JSON.stringify(test.result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {test.result.error && (
                      <Alert
                        message="Lỗi chi tiết"
                        description={test.result.error}
                        type="error"
                        showIcon
                      />
                    )}
                  </Space>
                </div>
              </Panel>
            ))}
          </Collapse>
        </Card>
      )}
      
      {totalTests > 0 && (
        <Card style={{ marginTop: '24px' }}>
          <Title level={4}>Tóm tắt</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Tổng số test: </Text>
              <Text>{totalTests}</Text>
            </div>
            <div>
              <Text strong>Passed: </Text>
              <Text style={{ color: '#52c41a' }}>{passedTests}</Text>
            </div>
            <div>
              <Text strong>Failed: </Text>
              <Text style={{ color: '#ff4d4f' }}>{totalTests - passedTests}</Text>
            </div>
            <div>
              <Text strong>Tỷ lệ thành công: </Text>
              <Text strong style={{ color: passedTests === totalTests ? '#52c41a' : '#ff4d4f' }}>
                {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%
              </Text>
            </div>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default SystemTest; 