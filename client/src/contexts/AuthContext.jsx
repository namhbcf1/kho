import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Role definitions with hierarchical permissions
export const ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier', 
  STAFF: 'staff'
};

// Permission matrix - comprehensive feature access control
export const PERMISSIONS = {
  // Sales Management
  CREATE_ORDER: 'create_order',
  PROCESS_RETURN: 'process_return',
  VIEW_ALL_ORDERS: 'view_all_orders',
  VIEW_OWN_ORDERS: 'view_own_orders',
  VIEW_SHIFT_ORDERS: 'view_shift_orders',
  
  // Product Management
  MANAGE_PRODUCTS: 'manage_products',
  EDIT_PRICES: 'edit_prices',
  VIEW_PRODUCTS: 'view_products',
  
  // Inventory Management
  CREATE_PURCHASE_ORDER: 'create_purchase_order',
  TRANSFER_INVENTORY: 'transfer_inventory',
  VIEW_INVENTORY: 'view_inventory',
  
  // Reports & Analytics
  VIEW_REVENUE_REPORTS: 'view_revenue_reports',
  VIEW_INVENTORY_REPORTS: 'view_inventory_reports',
  VIEW_BI_DASHBOARD: 'view_bi_dashboard',
  VIEW_ALL_ANALYTICS: 'view_all_analytics',
  
  // Gamification System
  VIEW_LEADERBOARD: 'view_leaderboard',
  VIEW_OWN_PERFORMANCE: 'view_own_performance',
  VIEW_ALL_PERFORMANCE: 'view_all_performance',
  CONFIGURE_CHALLENGES: 'configure_challenges',
  
  // System Configuration
  MANAGE_USERS: 'manage_users',
  CONFIGURE_PAYMENTS: 'configure_payments',
  SYSTEM_SETTINGS: 'system_settings',
  
  // Customer Management
  MANAGE_CUSTOMERS: 'manage_customers',
  VIEW_CUSTOMER_DATA: 'view_customer_data',
  
  // Commission & Staff Management
  VIEW_COMMISSION_REPORTS: 'view_commission_reports',
  MANAGE_COMMISSION_RULES: 'manage_commission_rules'
};

// Role-based permission mapping
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Full access to everything
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.PROCESS_RETURN,
    PERMISSIONS.VIEW_ALL_ORDERS,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.EDIT_PRICES,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PURCHASE_ORDER,
    PERMISSIONS.TRANSFER_INVENTORY,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_REVENUE_REPORTS,
    PERMISSIONS.VIEW_INVENTORY_REPORTS,
    PERMISSIONS.VIEW_BI_DASHBOARD,
    PERMISSIONS.VIEW_ALL_ANALYTICS,
    PERMISSIONS.VIEW_LEADERBOARD,
    PERMISSIONS.VIEW_ALL_PERFORMANCE,
    PERMISSIONS.CONFIGURE_CHALLENGES,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.CONFIGURE_PAYMENTS,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.MANAGE_CUSTOMERS,
    PERMISSIONS.VIEW_CUSTOMER_DATA,
    PERMISSIONS.VIEW_COMMISSION_REPORTS,
    PERMISSIONS.MANAGE_COMMISSION_RULES
  ],
  [ROLES.CASHIER]: [
    // Sales and basic operations only
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.PROCESS_RETURN,
    PERMISSIONS.VIEW_SHIFT_ORDERS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_CUSTOMER_DATA
  ],
  [ROLES.STAFF]: [
    // Limited to own performance and basic viewing
    PERMISSIONS.VIEW_OWN_ORDERS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_LEADERBOARD,
    PERMISSIONS.VIEW_OWN_PERFORMANCE,
    PERMISSIONS.VIEW_CUSTOMER_DATA
  ]
};

// Mock user data - In production, this would come from your backend
const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@posystem.com',
    password: 'admin123',
    name: 'Quản trị viên',
    role: ROLES.ADMIN,
    avatar: '/api/placeholder/40/40',
    department: 'Quản lý',
    joinDate: '2023-01-01',
    isActive: true
  },
  {
    id: 2,
    email: 'cashier@posystem.com',
    password: 'cashier123',
    name: 'Thu ngân',
    role: ROLES.CASHIER,
    avatar: '/api/placeholder/40/40',
    department: 'Bán hàng',
    joinDate: '2023-06-01',
    isActive: true
  },
  {
    id: 3,
    email: 'staff@posystem.com',
    password: 'staff123',
    name: 'Nhân viên',
    role: ROLES.STAFF,
    avatar: '/api/placeholder/40/40',
    department: 'Bán hàng',
    joinDate: '2023-08-01',
    isActive: true,
    commissionRate: 0.05,
    targetSales: 50000000 // 50M VND monthly target
  }
];

const AuthContext = createContext(null);

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('pos_user');
        const storedToken = localStorage.getItem('pos_token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted data
        localStorage.removeItem('pos_user');
        localStorage.removeItem('pos_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock data
      const foundUser = MOCK_USERS.find(
        u => u.email === email && u.password === password && u.isActive
      );
      
      if (!foundUser) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }
      
      // Generate mock token
      const token = `token_${foundUser.id}_${Date.now()}`;
      
      // Store user data and token
      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;
      
      localStorage.setItem('pos_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('pos_token', token);
      
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      
      toast.success(`Chào mừng ${foundUser.name}!`);
      
      return { user: userWithoutPassword, token };
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('pos_user');
    localStorage.removeItem('pos_token');
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Đã đăng xuất thành công');
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Check if user has all specified permissions
  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(permission));
  };

  // Get user's role display name
  const getRoleDisplayName = (role) => {
    const roleNames = {
      [ROLES.ADMIN]: 'Quản trị viên',
      [ROLES.CASHIER]: 'Thu ngân',
      [ROLES.STAFF]: 'Nhân viên'
    };
    return roleNames[role] || role;
  };

  // Get user's permissions
  const getUserPermissions = () => {
    if (!user || !user.role) return [];
    return ROLE_PERMISSIONS[user.role] || [];
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...updates };
      
      localStorage.setItem('pos_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Cập nhật thông tin thành công');
      return updatedUser;
    } catch (error) {
      toast.error('Lỗi cập nhật thông tin');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you'd verify the current password with the backend
      toast.success('Đổi mật khẩu thành công');
    } catch (error) {
      toast.error('Lỗi đổi mật khẩu');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get current user's performance data (for staff)
  const getPerformanceData = () => {
    if (!user || user.role !== ROLES.STAFF) return null;
    
    // Mock performance data
    return {
      currentSales: 35000000, // 35M VND
      targetSales: user.targetSales || 50000000,
      commission: 1750000, // 1.75M VND
      rank: 3,
      totalStaff: 15,
      achievements: [
        { id: 1, name: 'Tân binh xuất sắc', icon: '🌟', earnedAt: '2023-08-15' },
        { id: 2, name: 'Chuyên gia Up-sell', icon: '📈', earnedAt: '2023-09-01' }
      ],
      monthlyProgress: 70, // 70% of target
      weeklyRank: 2
    };
  };

  const value = {
    // Auth state
    user,
    loading,
    isAuthenticated,
    
    // Auth actions
    login,
    logout,
    updateProfile,
    changePassword,
    
    // Permission system
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    
    // Helper functions
    getRoleDisplayName,
    getPerformanceData,
    
    // Constants
    ROLES,
    PERMISSIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 