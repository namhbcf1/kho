import { useAuth } from './useAuth';
import { PERMISSIONS } from '../constants/permissions';

export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    
    const userPermissions = PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission) || userPermissions.includes('*');
  };
  
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission));
  };
  
  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(permission));
  };
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole: user?.role,
    userPermissions: user?.role ? PERMISSIONS[user.role] || [] : []
  };
};
