import React from 'react';
import { useAuth } from './AuthContext';

const RoleBasedAccess = ({ 
  roles = [], 
  permissions = [], 
  children, 
  fallback = null,
  requireAll = false 
}) => {
  const { hasRole, hasAnyRole, hasPermission } = useAuth();

  // Check role requirements
  if (roles.length > 0) {
    const hasRequiredRole = requireAll 
      ? roles.every(role => hasRole(role))
      : hasAnyRole(roles);
    
    if (!hasRequiredRole) {
      return fallback;
    }
  }

  // Check permission requirements
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? permissions.every(permission => hasPermission(permission))
      : permissions.some(permission => hasPermission(permission));
    
    if (!hasRequiredPermissions) {
      return fallback;
    }
  }

  return children;
};

export default RoleBasedAccess; 