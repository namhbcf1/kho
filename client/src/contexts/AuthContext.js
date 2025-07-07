import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import api from '../services/api';

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
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/profile');
      if (response.data && (response.data.user || response.data.data)) {
        const userData = response.data.user || response.data.data;
        
        // Map field names
        const mappedUserData = {
          id: userData.id,
          username: userData.username,
          fullName: userData.fullName || userData.full_name,
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
      const response = await api.post('/auth/login', credentials);
      
      if (response.data && response.data.success) {
        const { token: newToken, user: userData, data: userDataAlt } = response.data;
        
        // Handle both formats: {user: ...} or {data: ...}
        const finalUserData = userData || userDataAlt;
        
        // Map field names (backend uses full_name, frontend expects fullName)
        const mappedUserData = {
          id: finalUserData.id,
          username: finalUserData.username,
          fullName: finalUserData.fullName || finalUserData.full_name,
          email: finalUserData.email,
          role: finalUserData.role,
          permissions: finalUserData.permissions
        };
        
        // Store token if provided
        if (newToken) {
          localStorage.setItem('token', newToken);
          setToken(newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        }
        
        // Set user data
        setUser(mappedUserData);
        
        message.success(`Chào mừng ${mappedUserData.fullName || mappedUserData.username}!`);
        return { success: true };
      } else {
        throw new Error(response.data?.error || response.data?.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Đăng nhập thất bại';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API if token exists
      if (token) {
        await api.post('/auth/logout').catch(() => {
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
      delete api.defaults.headers.common['Authorization'];
      message.success('Đã đăng xuất thành công');
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      
      if (response.data && response.data.success) {
        message.success('Tạo tài khoản thành công!');
        return { success: true };
      } else {
        throw new Error(response.data?.error || 'Registration failed');
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
      const response = await api.post('/auth/change-password', passwordData);
      
      if (response.data && response.data.success) {
        message.success('Đổi mật khẩu thành công!');
        return { success: true };
      } else {
        throw new Error(response.data?.error || 'Change password failed');
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
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data && response.data.success) {
        // Update user data locally
        setUser(prev => ({ ...prev, ...profileData }));
        message.success('Cập nhật thông tin thành công!');
        return { success: true };
      } else {
        throw new Error(response.data?.error || 'Update profile failed');
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
    // State
    user,
    loading,
    isAuthenticated: !!user,
    token,
    
    // Actions
    login,
    logout,
    register,
    changePassword,
    updateProfile,
    checkAuth,
    
    // Role utilities
    hasRole,
    isAdmin,
    isManager,
    isCashier,
    
    // Permission utilities
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