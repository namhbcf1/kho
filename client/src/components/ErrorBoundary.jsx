import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and external service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Send error to monitoring service
    this.logErrorToService(error, errorInfo, errorId);
  }

  logErrorToService = (error, errorInfo, errorId) => {
    try {
      // In production, this would send to a service like Sentry, LogRocket, etc.
      const errorData = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.props.userId || 'anonymous'
      };

      // Mock API call - replace with actual error reporting service
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      }).catch(err => {
        console.error('Failed to log error to service:', err);
      });

      // Store in localStorage as backup
      const storedErrors = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      storedErrors.push(errorData);
      // Keep only last 10 errors
      if (storedErrors.length > 10) {
        storedErrors.shift();
      }
      localStorage.setItem('errorLogs', JSON.stringify(storedErrors));
    } catch (logError) {
      console.error('Error logging failed:', logError);
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">
                Oops! Có lỗi xảy ra
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Ứng dụng đã gặp phải lỗi không mong muốn. Chúng tôi đã ghi nhận sự cố này.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error ID */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mã lỗi:</span>
                  <Badge variant="outline" className="font-mono">
                    {this.state.errorId}
                  </Badge>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Thử lại
                </Button>
                <Button onClick={this.handleReload} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tải lại trang
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Về trang chủ
                </Button>
              </div>

              {/* Development error details */}
              {isDevelopment && this.state.error && (
                <details className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium text-red-600 mb-2">
                    <Bug className="w-4 h-4 inline mr-2" />
                    Chi tiết lỗi (Development)
                  </summary>
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <strong>Error:</strong>
                      <pre className="bg-red-100 dark:bg-red-900/40 p-2 rounded mt-1 whitespace-pre-wrap">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    <div>
                      <strong>Stack trace:</strong>
                      <pre className="bg-red-100 dark:bg-red-900/40 p-2 rounded mt-1 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component stack:</strong>
                        <pre className="bg-red-100 dark:bg-red-900/40 p-2 rounded mt-1 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Support info */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Nếu lỗi tiếp tục xảy ra, vui lòng liên hệ hỗ trợ với mã lỗi{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">
                    {this.state.errorId}
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 