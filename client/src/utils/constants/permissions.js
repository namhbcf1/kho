export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  STAFF: 'staff'
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: [
    '*', // All permissions
  ],
  
  [ROLES.MANAGER]: [
    // Dashboard
    'view_dashboard',
    'view_analytics',
    'view_reports',
    
    // Products
    'view_products',
    'create_products',
    'update_products',
    'delete_products',
    'manage_categories',
    'manage_pricing',
    
    // Inventory
    'view_inventory',
    'manage_inventory',
    'view_stock_levels',
    'manage_suppliers',
    'create_purchase_orders',
    
    // Orders
    'view_orders',
    'manage_orders',
    'process_returns',
    'view_order_analytics',
    
    // Customers
    'view_customers',
    'manage_customers',
    'view_customer_analytics',
    
    // Staff
    'view_staff',
    'manage_staff',
    'view_staff_performance',
    'manage_gamification',
    
    // Reports
    'view_financial_reports',
    'view_sales_reports',
    'view_inventory_reports',
    'export_reports',
    
    // Settings
    'view_settings',
    'manage_settings'
  ],
  
  [ROLES.CASHIER]: [
    // POS Operations
    'access_pos',
    'process_sales',
    'handle_payments',
    'print_receipts',
    'manage_cash_drawer',
    
    // Orders
    'view_orders',
    'create_orders',
    'process_returns',
    
    // Customers
    'view_customers',
    'create_customers',
    'update_customer_info',
    
    // Products
    'view_products',
    'check_inventory',
    
    // Session Management
    'start_session',
    'end_session',
    'view_session_reports'
  ],
  
  [ROLES.STAFF]: [
    // Personal Dashboard
    'view_personal_dashboard',
    'view_personal_performance',
    
    // Sales
    'view_personal_sales',
    'view_sales_targets',
    'access_sales_tools',
    
    // Gamification
    'view_gamification',
    'earn_points',
    'unlock_achievements',
    'participate_challenges',
    'redeem_rewards',
    'view_leaderboard',
    
    // Training
    'access_training',
    'view_training_materials',
    'complete_training_modules',
    
    // Products (limited)
    'view_products',
    'check_inventory',
    
    // Customers (limited)
    'view_customers',
    'basic_customer_info',
    
    // Profile
    'view_profile',
    'update_profile'
  ]
};

export const PERMISSION_GROUPS = {
  DASHBOARD: [
    'view_dashboard',
    'view_analytics',
    'view_reports'
  ],
  
  PRODUCTS: [
    'view_products',
    'create_products',
    'update_products',
    'delete_products',
    'manage_categories',
    'manage_pricing'
  ],
  
  INVENTORY: [
    'view_inventory',
    'manage_inventory',
    'view_stock_levels',
    'manage_suppliers',
    'create_purchase_orders'
  ],
  
  ORDERS: [
    'view_orders',
    'create_orders',
    'manage_orders',
    'process_returns',
    'view_order_analytics'
  ],
  
  CUSTOMERS: [
    'view_customers',
    'create_customers',
    'manage_customers',
    'update_customer_info',
    'view_customer_analytics'
  ],
  
  STAFF: [
    'view_staff',
    'manage_staff',
    'view_staff_performance',
    'manage_gamification'
  ],
  
  POS: [
    'access_pos',
    'process_sales',
    'handle_payments',
    'print_receipts',
    'manage_cash_drawer'
  ],
  
  GAMIFICATION: [
    'view_gamification',
    'earn_points',
    'unlock_achievements',
    'participate_challenges',
    'redeem_rewards',
    'view_leaderboard'
  ],
  
  REPORTS: [
    'view_financial_reports',
    'view_sales_reports',
    'view_inventory_reports',
    'export_reports'
  ],
  
  SETTINGS: [
    'view_settings',
    'manage_settings'
  ]
};

export const hasPermission = (userRole, permission) => {
  const userPermissions = PERMISSIONS[userRole] || [];
  return userPermissions.includes(permission) || userPermissions.includes('*');
};

export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};
