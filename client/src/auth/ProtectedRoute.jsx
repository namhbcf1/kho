import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LoadingSpinner } from '../components/ui';

const ProtectedRoute = ({ 
  children, 
  roles = [], 
  permissions = [], 
  fallback = null,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, loading, hasRole, hasAnyRole, hasPermission, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirements
  if (roles.length > 0 && !hasAnyRole(roles)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirements
  if (permissions.length > 0) {
    const hasRequiredPermissions = permissions.every(permission => hasPermission(permission));
    if (!hasRequiredPermissions) {
      return fallback || <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute; 