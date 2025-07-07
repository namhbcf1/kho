import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to error tracker if available
    if (window.posErrorTracker) {
      window.posErrorTracker.logReactError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Đã xảy ra lỗi"
          subTitle="Xin lỗi, đã có lỗi xảy ra trong ứng dụng. Vui lòng tải lại trang hoặc liên hệ hỗ trợ."
          extra={[
            <Button 
              type="primary" 
              key="reload"
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </Button>,
            <Button 
              key="home"
              onClick={() => window.location.href = '/'}
            >
              Về trang chủ
            </Button>
          ]}
        >
          {process.env.NODE_ENV === 'development' && (
            <div style={{ textAlign: 'left', marginTop: '20px' }}>
              <details style={{ whiteSpace: 'pre-wrap' }}>
                <summary>Chi tiết lỗi (Development)</summary>
                <p><strong>Error:</strong> {this.state.error && this.state.error.toString()}</p>
                <p><strong>Stack trace:</strong></p>
                <pre>{this.state.error && this.state.error.stack}</pre>
                <p><strong>Component stack:</strong></p>
                <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
              </details>
            </div>
          )}
        </Result>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 