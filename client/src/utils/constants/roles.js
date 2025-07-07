// Role definitions
export const ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier', 
  STAFF: 'staff',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor'
};

// Permission definitions
export const PERMISSIONS = {
  // Product permissions
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',
  PRODUCTS_BULK_OPERATIONS: 'products:bulk_operations',
  PRODUCTS_PRICE_OPTIMIZATION: 'products:price_optimization',

  // Order permissions
  ORDERS_VIEW: 'orders:view',
  ORDERS_CREATE: 'orders:create',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_DELETE: 'orders:delete',
  ORDERS_PROCESS: 'orders:process',
  ORDERS_REFUND: 'orders:refund',
  ORDERS_CANCEL: 'orders:cancel',

  // Customer permissions
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_UPDATE: 'customers:update',
  CUSTOMERS_DELETE: 'customers:delete',
  CUSTOMERS_LOYALTY: 'customers:loyalty',
  CUSTOMERS_SEGMENTATION: 'customers:segmentation',

  // Inventory permissions
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_UPDATE: 'inventory:update',
  INVENTORY_FORECAST: 'inventory:forecast',
  INVENTORY_PURCHASE_ORDERS: 'inventory:purchase_orders',
  INVENTORY_STOCK_MOVEMENTS: 'inventory:stock_movements',

  // Reports permissions
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  REPORTS_ANALYTICS: 'reports:analytics',
  REPORTS_BUSINESS_INTELLIGENCE: 'reports:business_intelligence',
  REPORTS_CUSTOM: 'reports:custom',

  // Staff permissions
  STAFF_VIEW: 'staff:view',
  STAFF_CREATE: 'staff:create',
  STAFF_UPDATE: 'staff:update',
  STAFF_DELETE: 'staff:delete',
  STAFF_PERFORMANCE: 'staff:performance',
  STAFF_GAMIFICATION: 'staff:gamification',
  STAFF_TRAINING: 'staff:training',

  // Settings permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_SYSTEM: 'settings:system',
  SETTINGS_SECURITY: 'settings:security',
  SETTINGS_INTEGRATIONS: 'settings:integrations',

  // POS permissions
  POS_ACCESS: 'pos:access',
  POS_PAYMENT: 'pos:payment',
  POS_DISCOUNT: 'pos:discount',
  POS_REFUND: 'pos:refund',
  POS_CASH_MANAGEMENT: 'pos:cash_management',

  // Financial permissions
  FINANCIAL_VIEW: 'financial:view',
  FINANCIAL_TRANSACTIONS: 'financial:transactions',
  FINANCIAL_REPORTS: 'financial:reports',
  FINANCIAL_AUDIT: 'financial:audit'
};

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Full access to all permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.MANAGER]: [
    // Product management
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_BULK_OPERATIONS,
    PERMISSIONS.PRODUCTS_PRICE_OPTIMIZATION,
    
    // Order management
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_PROCESS,
    PERMISSIONS.ORDERS_REFUND,
    PERMISSIONS.ORDERS_CANCEL,
    
    // Customer management
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE,
    PERMISSIONS.CUSTOMERS_LOYALTY,
    PERMISSIONS.CUSTOMERS_SEGMENTATION,
    
    // Inventory management
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.INVENTORY_FORECAST,
    PERMISSIONS.INVENTORY_PURCHASE_ORDERS,
    PERMISSIONS.INVENTORY_STOCK_MOVEMENTS,
    
    // Reports and analytics
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.REPORTS_ANALYTICS,
    PERMISSIONS.REPORTS_BUSINESS_INTELLIGENCE,
    PERMISSIONS.REPORTS_CUSTOM,
    
    // Staff management
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_CREATE,
    PERMISSIONS.STAFF_UPDATE,
    PERMISSIONS.STAFF_PERFORMANCE,
    PERMISSIONS.STAFF_GAMIFICATION,
    PERMISSIONS.STAFF_TRAINING,
    
    // POS access
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.POS_PAYMENT,
    PERMISSIONS.POS_DISCOUNT,
    PERMISSIONS.POS_REFUND,
    PERMISSIONS.POS_CASH_MANAGEMENT,
    
    // Financial
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.FINANCIAL_TRANSACTIONS,
    PERMISSIONS.FINANCIAL_REPORTS
  ],
  
  [ROLES.CASHIER]: [
    // Basic product viewing
    PERMISSIONS.PRODUCTS_VIEW,
    
    // Order processing
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_PROCESS,
    
    // Customer management
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_LOYALTY,
    
    // Basic inventory
    PERMISSIONS.INVENTORY_VIEW,
    
    // POS operations
    PERMISSIONS.POS_ACCESS,
    PERMISSIONS.POS_PAYMENT,
    PERMISSIONS.POS_DISCOUNT,
    PERMISSIONS.POS_CASH_MANAGEMENT,
    
    // Basic reports
    PERMISSIONS.REPORTS_VIEW
  ],
  
  [ROLES.STAFF]: [
    // View-only access to products
    PERMISSIONS.PRODUCTS_VIEW,
    
    // Limited order access
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    
    // Customer interaction
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    
    // Basic inventory viewing
    PERMISSIONS.INVENTORY_VIEW,
    
    // Personal gamification
    PERMISSIONS.STAFF_GAMIFICATION,
    PERMISSIONS.STAFF_TRAINING,
    
    // Basic POS access
    PERMISSIONS.POS_ACCESS,
    
    // Personal reports
    PERMISSIONS.REPORTS_VIEW
  ]
};

// Helper functions
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

export const hasPermission = (userRole, permission) => {
  const rolePermissions = getRolePermissions(userRole);
  return rolePermissions.includes(permission);
};

export const canAccessResource = (userRole, resource, action) => {
  const permission = `${resource}:${action}`;
  return hasPermission(userRole, permission);
};

export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.ADMIN]: 'Quản trị viên',
    [ROLES.MANAGER]: 'Quản lý',
    [ROLES.CASHIER]: 'Thu ngân',
    [ROLES.STAFF]: 'Nhân viên',
    [ROLES.SUPERVISOR]: 'Giám sát'
  };
  return roleNames[role] || role;
};

export const getRoleColor = (role) => {
  const roleColors = {
    [ROLES.ADMIN]: 'red',
    [ROLES.MANAGER]: 'blue',
    [ROLES.CASHIER]: 'green',
    [ROLES.STAFF]: 'purple',
    [ROLES.SUPERVISOR]: 'orange'
  };
  return roleColors[role] || 'gray';
}; 