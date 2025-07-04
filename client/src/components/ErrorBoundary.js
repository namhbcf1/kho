import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error if needed
    // console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ padding: 48, textAlign: 'center', color: 'red' }}><h2>Đã xảy ra lỗi. Vui lòng tải lại trang.</h2></div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 