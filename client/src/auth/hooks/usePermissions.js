import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { permissions, hasPermission, hasRole, hasAnyRole, canAccess } = useAuth();

  const checkPermissions = (requiredPermissions = []) => {
    return requiredPermissions.every(permission => hasPermission(permission));
  };

  const checkAnyPermissions = (requiredPermissions = []) => {
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  const checkResourceAccess = (resource, actions = []) => {
    return actions.every(action => canAccess(resource, action));
  };

  const getPermissionsByResource = (resource) => {
    return permissions.filter(permission => permission.startsWith(`${resource}:`));
  };

  return {
    permissions,
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccess,
    checkPermissions,
    checkAnyPermissions,
    checkResourceAccess,
    getPermissionsByResource
  };
};

export default usePermissions; 