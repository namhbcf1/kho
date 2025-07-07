// =====================================================
// 🔐 HỆ THỐNG XÁC THỰC & PHÂN QUYỀN
// =====================================================

// auth/permissions.js - Ma trận phân quyền chi tiết
export const ROLES = {
    ADMIN: 'admin',
    CASHIER: 'cashier', 
    STAFF: 'staff'
  };
  
  export const PERMISSIONS = {
    // Quản lý Bán hàng
    SALES_CREATE_ORDER: 'sales.create_order',
    SALES_VIEW_ALL_ORDERS: 'sales.view_all_orders',
    SALES_VIEW_OWN_ORDERS: 'sales.view_own_orders', 
    SALES_VIEW_SHIFT_ORDERS: 'sales.view_shift_orders',
    SALES_PROCESS_RETURNS: 'sales.process_returns',
    
    // Quản lý Sản phẩm
    PRODUCTS_MANAGE: 'products.manage',
    PRODUCTS_ADJUST_PRICE: 'products.adjust_price',
    PRODUCTS_VIEW: 'products.view',
    
    // Quản lý Kho
    INVENTORY_CREATE_PURCHASE: 'inventory.create_purchase',
    INVENTORY_TRANSFER: 'inventory.transfer',
    INVENTORY_VIEW: 'inventory.view',
    
    // Báo cáo & Phân tích
    REPORTS_VIEW_REVENUE: 'reports.view_revenue',
    REPORTS_VIEW_INVENTORY: 'reports.view_inventory',
    REPORTS_VIEW_BI: 'reports.view_bi',
    
    // Hệ thống Game hóa
    GAMIFICATION_VIEW_LEADERBOARD: 'gamification.view_leaderboard',
    GAMIFICATION_VIEW_ALL_DASHBOARDS: 'gamification.view_all_dashboards',
    GAMIFICATION_VIEW_OWN_DASHBOARD: 'gamification.view_own_dashboard',
    GAMIFICATION_CONFIG_CHALLENGES: 'gamification.config_challenges',
    
    // Cấu hình Hệ thống
    SYSTEM_MANAGE_USERS: 'system.manage_users',
    SYSTEM_CONFIG_PAYMENT: 'system.config_payment',
    SYSTEM_VIEW_ANALYTICS: 'system.view_analytics'
  };
  
  // Ma trận phân quyền theo role
  export const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: [
      // Toàn quyền tất cả
      PERMISSIONS.SALES_CREATE_ORDER,
      PERMISSIONS.SALES_VIEW_ALL_ORDERS,
      PERMISSIONS.SALES_PROCESS_RETURNS,
      PERMISSIONS.PRODUCTS_MANAGE,
      PERMISSIONS.PRODUCTS_ADJUST_PRICE,
      PERMISSIONS.INVENTORY_CREATE_PURCHASE,
      PERMISSIONS.INVENTORY_TRANSFER,
      PERMISSIONS.REPORTS_VIEW_REVENUE,
      PERMISSIONS.REPORTS_VIEW_INVENTORY,
      PERMISSIONS.REPORTS_VIEW_BI,
      PERMISSIONS.GAMIFICATION_VIEW_LEADERBOARD,
      PERMISSIONS.GAMIFICATION_VIEW_ALL_DASHBOARDS,
      PERMISSIONS.GAMIFICATION_CONFIG_CHALLENGES,
      PERMISSIONS.SYSTEM_MANAGE_USERS,
      PERMISSIONS.SYSTEM_CONFIG_PAYMENT,
      PERMISSIONS.SYSTEM_VIEW_ANALYTICS
    ],
    
    [ROLES.CASHIER]: [
      // Quyền thu ngân
      PERMISSIONS.SALES_CREATE_ORDER,
      PERMISSIONS.SALES_VIEW_SHIFT_ORDERS,
      PERMISSIONS.SALES_PROCESS_RETURNS,
      PERMISSIONS.PRODUCTS_VIEW
    ],
    
    [ROLES.STAFF]: [
      // Quyền nhân viên
      PERMISSIONS.SALES_VIEW_OWN_ORDERS,
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.GAMIFICATION_VIEW_LEADERBOARD,
      PERMISSIONS.GAMIFICATION_VIEW_OWN_DASHBOARD
    ]
  };
  
  // auth/AuthContext.jsx - Context xác thực toàn cục
  import React, { createContext, useContext, useReducer, useEffect } from 'react';
  
  const AuthContext = createContext();
  
  const authReducer = (state, action) => {
    switch (action.type) {
      case 'LOGIN_SUCCESS':
        return {
          ...state,
          user: action.payload.user,
          token: action.payload.token,
          permissions: ROLE_PERMISSIONS[action.payload.user.role] || [],
          isAuthenticated: true,
          loading: false
        };
      
      case 'LOGOUT':
        return {
          ...state,
          user: null,
          token: null,
          permissions: [],
          isAuthenticated: false,
          loading: false
        };
      
      case 'SET_LOADING':
        return {
          ...state,
          loading: action.payload
        };
      
      default:
        return state;
    }
  };
  
  export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
      user: null,
      token: null,
      permissions: [],
      isAuthenticated: false,
      loading: true
    });
  
    useEffect(() => {
      // Kiểm tra token từ localStorage khi app khởi động
      const token = localStorage.getItem('pos_token');
      const userData = localStorage.getItem('pos_user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token }
          });
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }, []);
  
    const login = async (credentials) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // API call để xác thực
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Lưu token và user data
          localStorage.setItem('pos_token', data.token);
          localStorage.setItem('pos_user', JSON.stringify(data.user));
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: data
          });
          
          return { success: true };
        } else {
          return { success: false, message: data.message };
        }
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Lỗi kết nối mạng' };
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
  
    const logout = () => {
      localStorage.removeItem('pos_token');
      localStorage.removeItem('pos_user');
      dispatch({ type: 'LOGOUT' });
    };
  
    const hasPermission = (permission) => {
      return state.permissions.includes(permission);
    };
  
    const hasRole = (role) => {
      return state.user?.role === role;
    };
  
    const value = {
      ...state,
      login,
      logout,
      hasPermission,
      hasRole
    };
  
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
  };
  
  // auth/ProtectedRoute.jsx - Route bảo vệ theo role
  import React from 'react';
  import { Navigate } from 'react-router-dom';
  import { useAuth } from './AuthContext';
  
  const ProtectedRoute = ({ 
    children, 
    requiredRole = null, 
    requiredPermission = null,
    fallbackPath = '/login' 
  }) => {
    const { isAuthenticated, user, hasRole, hasPermission, loading } = useAuth();
  
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      );
    }
  
    if (!isAuthenticated) {
      return <Navigate to={fallbackPath} replace />;
    }
  
    // Kiểm tra role cụ thể
    if (requiredRole && !hasRole(requiredRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  
    // Kiểm tra permission cụ thể
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return <Navigate to="/unauthorized" replace />;
    }
  
    return children;
  };
  
  export default ProtectedRoute;
  
  // auth/RoleBasedAccess.jsx - Component kiểm soát quyền truy cập
  import React from 'react';
  import { useAuth } from './AuthContext';
  
  const RoleBasedAccess = ({ 
    children, 
    roles = [], 
    permissions = [],
    fallback = null,
    mode = 'any' // 'any' hoặc 'all'
  }) => {
    const { hasRole, hasPermission } = useAuth();
  
    // Kiểm tra roles
    const hasRequiredRole = roles.length === 0 || 
      (mode === 'any' ? roles.some(role => hasRole(role)) : roles.every(role => hasRole(role)));
  
    // Kiểm tra permissions
    const hasRequiredPermission = permissions.length === 0 || 
      (mode === 'any' ? permissions.some(perm => hasPermission(perm)) : permissions.every(perm => hasPermission(perm)));
  
    if (hasRequiredRole && hasRequiredPermission) {
      return children;
    }
  
    return fallback;
  };
  
  export default RoleBasedAccess;
  
  // utils/hooks/useAuth.js - Custom hook xác thực
  import { useAuth as useAuthContext } from '../auth/AuthContext';
  
  export const useAuth = () => {
    return useAuthContext();
  };
  
  // utils/hooks/usePermissions.js - Custom hook phân quyền
  import { useAuth } from './useAuth';
  import { PERMISSIONS } from '../auth/permissions';
  
  export const usePermissions = () => {
    const { hasPermission, hasRole, user } = useAuth();
  
    const canManageProducts = () => hasPermission(PERMISSIONS.PRODUCTS_MANAGE);
    const canViewReports = () => hasPermission(PERMISSIONS.REPORTS_VIEW_REVENUE);
    const canManageUsers = () => hasPermission(PERMISSIONS.SYSTEM_MANAGE_USERS);
    const canProcessReturns = () => hasPermission(PERMISSIONS.SALES_PROCESS_RETURNS);
    const canViewGameification = () => hasPermission(PERMISSIONS.GAMIFICATION_VIEW_LEADERBOARD);
  
    const getUserAccessLevel = () => {
      if (hasRole('admin')) return 'full';
      if (hasRole('cashier')) return 'pos';
      if (hasRole('staff')) return 'limited';
      return 'none';
    };
  
    return {
      canManageProducts,
      canViewReports,
      canManageUsers,
      canProcessReturns,
      canViewGameification,
      getUserAccessLevel,
      hasPermission,
      hasRole,
      user
    };
  };
  
  export default usePermissions;