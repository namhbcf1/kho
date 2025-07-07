import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import axios from 'axios';

// Configure API URL - Using working simple worker for now
const API_URL = 'https://pos-test-simple.bangachieu2.workers.dev';
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

// Add axios interceptor for better error handling
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Add request interceptor for debugging
axios.interceptors.request.use(
  config => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    if (token && token !== 'undefined' && token !== 'null') {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!token || token === 'undefined' || token === 'null') {
        setLoading(false);
        return;
      }

      // Set authorization header for check
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get('/api/auth/me');
      
      // Check if response and response.data exist
      if (response && response.data && response.data.user) {
        const userData = response.data.user;
        
        // Map field names
        const mappedUserData = {
          id: userData.id,
          username: userData.email,
          fullName: userData.name || userData.fullName,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions
        };
        
        setUser(mappedUserData);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Use direct axios call for better control
      const response = await axios.post('/api/auth/login', {
        email: credentials.email || credentials.username,
        password: credentials.password
      });
      
      // Check if response exists and has data
      if (response && response.data && response.data.success) {
        const { token: newToken, user: userData, data: responseData } = response.data;
        
        // Handle both formats: {user: ...} or {data: {token, user}}
        const finalUserData = userData || responseData?.user;
        const finalToken = newToken || responseData?.token;
        
        if (!finalUserData) {
          throw new Error('User data not found in response');
        }
        
        // Map field names (backend uses name, frontend expects fullName)
        const mappedUserData = {
          id: finalUserData.id,
          username: finalUserData.email,
          fullName: finalUserData.name || finalUserData.fullName,
          email: finalUserData.email,
          role: finalUserData.role,
          permissions: finalUserData.permissions
        };
        
        // Store token if provided
        if (finalToken) {
          localStorage.setItem('token', finalToken);
          setToken(finalToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${finalToken}`;
        }
        
        // Set user data
        setUser(mappedUserData);
        
        message.success(`Chào mừng ${mappedUserData.fullName || mappedUserData.username}!`);
        return { success: true };
      } else {
        const errorMsg = response?.data?.error || response?.data?.message || 'Login failed';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Đăng nhập thất bại';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API if token exists
      if (token && token !== 'undefined' && token !== 'null') {
        await axios.post('/api/auth/logout').catch(() => {
          // Ignore logout API errors
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      message.success('Đã đăng xuất thành công');
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', userData);
      
      if (response && response.data && response.data.success) {
        message.success('Tạo tài khoản thành công!');
        return { success: true };
      } else {
        throw new Error(response?.data?.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Tạo tài khoản thất bại';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/change-password', passwordData);
      
      if (response && response.data && response.data.success) {
        message.success('Đổi mật khẩu thành công!');
        return { success: true };
      } else {
        throw new Error(response?.data?.error || 'Change password failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Đổi mật khẩu thất bại';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await axios.put('/api/auth/profile', profileData);
      
      if (response && response.data && response.data.success) {
        // Update user data locally
        setUser(prev => ({ ...prev, ...profileData }));
        message.success('Cập nhật thông tin thành công!');
        return { success: true };
      } else {
        throw new Error(response?.data?.error || 'Update profile failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Cập nhật thông tin thất bại';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Role checking utilities
  const hasRole = (roles) => {
    if (!user || !user.role) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  };

  const isAdmin = () => hasRole('admin');
  const isManager = () => hasRole(['admin', 'manager']);
  const isCashier = () => hasRole(['admin', 'manager', 'cashier']);

  // Permission checking
  const canManageUsers = () => isAdmin();
  const canManageProducts = () => isManager();
  const canViewReports = () => isManager();
  const canProcessOrders = () => isCashier();

  const value = {
    user,
    loading,
    token,
    login,
    logout,
    register,
    changePassword,
    updateProfile,
    checkAuth,
    hasRole,
    isAdmin,
    isManager,
    isCashier,
    canManageUsers,
    canManageProducts,
    canViewReports,
    canProcessOrders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// HOC for protected routes
export const withAuth = (WrappedComponent, requiredRoles = null) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, hasRole, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <div>Please login to access this page</div>;
    }

    if (requiredRoles && !hasRole(requiredRoles)) {
      return <div>You don't have permission to access this page</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default AuthContext; 