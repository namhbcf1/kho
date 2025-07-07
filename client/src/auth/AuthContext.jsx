import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../services/api';
import { ROLES, PERMISSIONS } from '../utils/constants/roles';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  permissions: [],
  role: null,
  session: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
        permissions: action.payload.permissions,
        role: action.payload.user.role,
        session: action.payload.session
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
        permissions: [],
        role: null,
        session: null
      };
    case 'LOGOUT':
      return {
        ...initialState,
        loading: false
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'UPDATE_SESSION':
      return {
        ...state,
        session: { ...state.session, ...action.payload }
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
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await api.get('/auth/verify');
          const { user, permissions, session } = response.data;
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, permissions, session }
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        localStorage.removeItem('authToken');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await api.post('/auth/login', credentials);
      const { user, token, permissions, session } = response.data;
      
      localStorage.setItem('authToken', token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, permissions, session }
      });
      
      return { success: true, user };
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.message || 'Login failed'
      });
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const updateSession = (sessionData) => {
    dispatch({ type: 'UPDATE_SESSION', payload: sessionData });
  };

  const hasPermission = (permission) => {
    return state.permissions.includes(permission);
  };

  const hasRole = (role) => {
    return state.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(state.role);
  };

  const canAccess = (resource, action) => {
    const permission = `${resource}:${action}`;
    return hasPermission(permission);
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    updateSession,
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccess
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 