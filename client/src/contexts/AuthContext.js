import React, { createContext, useState, useContext, useEffect } from 'react';
import { message } from 'antd';

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

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch('https://pos-backend.bangachieu2.workers.dev/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        message.success('Login successful!');
        return { success: true, user: data.user };
      } else {
        message.error(data.message || 'Login failed');
        return { success: false, message: data.message };
      }
    } catch (error) {
      message.error('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('Logged out successfully');
  };

  const register = async (userData) => {
    try {
      const response = await fetch('https://pos-backend.bangachieu2.workers.dev/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Registration successful! Please wait for approval.');
        return { success: true };
      } else {
        message.error(data.message || 'Registration failed');
        return { success: false, message: data.message };
      }
    } catch (error) {
      message.error('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('https://pos-backend.bangachieu2.workers.dev/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        message.success('Profile updated successfully!');
        return { success: true, user: data.user };
      } else {
        message.error(data.message || 'Profile update failed');
        return { success: false, message: data.message };
      }
    } catch (error) {
      message.error('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await fetch('https://pos-backend.bangachieu2.workers.dev/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Password changed successfully!');
        return { success: true };
      } else {
        message.error(data.message || 'Password change failed');
        return { success: false, message: data.message };
      }
    } catch (error) {
      message.error('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions && user.permissions.includes(permission);
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    hasPermission,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 