import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { 
  LayoutDashboard, Package, ShoppingCart, FileText, 
  BarChart3, Users, Settings, LogOut, Menu, X,
  Store, Bell, User, ChevronDown, Moon, Sun, Shield,
  CreditCard, Trophy, Target, Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeProvider, useTheme } from '@/hooks/use-theme';
import { AuthProvider, useAuth, ROLES, PERMISSIONS } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Import page components
import Dashboard from '@/pages/Dashboard';
import Orders from '@/pages/Orders';
import POS from '@/pages/POS';
import Products from '@/pages/Products';
import ReportsPage from '@/pages/ReportsPage';
import AIDashboard from '@/components/AIDashboard';
import Login from '@/components/Login';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Role-based navigation configuration
const getNavigationItems = (userRole, hasPermission) => {
  const baseItems = [
    {
      title: 'Tổng quan',
      icon: LayoutDashboard,
      path: '/dashboard',
      permission: null, // All authenticated users can see dashboard
      roles: [ROLES.ADMIN, ROLES.CASHIER, ROLES.STAFF]
    }
  ];

  const adminItems = [
    {
      title: 'Điểm bán hàng',
      icon: ShoppingCart,
      path: '/pos',
      permission: PERMISSIONS.CREATE_ORDER,
      roles: [ROLES.ADMIN, ROLES.CASHIER]
    },
    {
      title: 'Sản phẩm',
      icon: Package,
      path: '/products',
      permission: PERMISSIONS.VIEW_PRODUCTS,
      roles: [ROLES.ADMIN, ROLES.CASHIER, ROLES.STAFF]
    },
    {
      title: 'Đơn hàng',
      icon: FileText,
      path: '/orders',
      permission: PERMISSIONS.VIEW_ALL_ORDERS,
      roles: [ROLES.ADMIN]
    },
    {
      title: 'AI Dashboard',
      icon: Brain,
      path: '/ai-dashboard',
      permission: PERMISSIONS.VIEW_BI_DASHBOARD,
      roles: [ROLES.ADMIN]
    },
    {
      title: 'Báo cáo',
      icon: BarChart3,
      path: '/reports',
      permission: PERMISSIONS.VIEW_BI_DASHBOARD,
      roles: [ROLES.ADMIN]
    },
    {
      title: 'Người dùng',
      icon: Users,
      path: '/users',
      permission: PERMISSIONS.MANAGE_USERS,
      roles: [ROLES.ADMIN]
    }
  ];

  const cashierItems = [
    {
      title: 'Điểm bán hàng',
      icon: ShoppingCart,
      path: '/pos',
      permission: PERMISSIONS.CREATE_ORDER,
      roles: [ROLES.CASHIER]
    },
    {
      title: 'Đơn hàng ca',
      icon: FileText,
      path: '/orders',
      permission: PERMISSIONS.VIEW_SHIFT_ORDERS,
      roles: [ROLES.CASHIER]
    }
  ];

  const staffItems = [
    {
      title: 'Bảng xếp hạng',
      icon: Trophy,
      path: '/leaderboard',
      permission: PERMISSIONS.VIEW_LEADERBOARD,
      roles: [ROLES.STAFF]
    },
    {
      title: 'Hiệu suất',
      icon: Target,
      path: '/performance',
      permission: PERMISSIONS.VIEW_OWN_PERFORMANCE,
      roles: [ROLES.STAFF]
    },
    {
      title: 'Đơn hàng',
      icon: FileText,
      path: '/orders',
      permission: PERMISSIONS.VIEW_OWN_ORDERS,
      roles: [ROLES.STAFF]
    }
  ];

  let items = [...baseItems];

  if (userRole === ROLES.ADMIN) {
    items = [...items, ...adminItems];
  } else if (userRole === ROLES.CASHIER) {
    items = [...items, ...cashierItems];
  } else if (userRole === ROLES.STAFF) {
    items = [...items, ...staffItems];
  }

  // Filter items based on permissions and roles
  return items.filter(item => {
    if (!item.roles.includes(userRole)) return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });
};

// Protected Route Component
const ProtectedRoute = ({ children, permission, roles }) => {
  const { user, hasPermission, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Main Layout Component
const Layout = ({ children }) => {
  const { user, logout, hasPermission, getRoleDisplayName, getPerformanceData } = useAuth();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = getNavigationItems(user?.role, hasPermission);
  const performanceData = getPerformanceData();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return Shield;
      case ROLES.CASHIER:
        return CreditCard;
      case ROLES.STAFF:
        return Users;
      default:
        return User;
    }
  };

  const RoleIcon = getRoleIcon(user?.role);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 h-16 px-6 border-b">
            <Store className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-bold text-lg">POS System</h1>
              <p className="text-xs text-muted-foreground">Thông minh & Hiện đại</p>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  <RoleIcon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name}</p>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {getRoleDisplayName(user?.role)}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Staff Performance Widget */}
            {user?.role === ROLES.STAFF && performanceData && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Tiến độ tháng</span>
                  <span className="text-sm text-muted-foreground">
                    #{performanceData.rank}/{performanceData.totalStaff}
                  </span>
                </div>
                <Progress value={performanceData.monthlyProgress} className="h-2 mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{(performanceData.currentSales / 1000000).toFixed(1)}M</span>
                  <span>{(performanceData.targetSales / 1000000).toFixed(0)}M</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div>
              <h2 className="font-semibold text-lg">
                {navigationItems.find(item => item.path === location.pathname)?.title || 'Dashboard'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>
                      <RoleIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Thông tin cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Cài đặt
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Staff Portal Components (Placeholder)
const StaffLeaderboard = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Bảng xếp hạng</h1>
    <p className="text-muted-foreground">Xếp hạng nhân viên bán hàng xuất sắc</p>
    {/* Implementation will be added later */}
  </div>
);

const StaffPerformance = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold">Hiệu suất cá nhân</h1>
    <p className="text-muted-foreground">Theo dõi thành tích và hoa hồng của bạn</p>
    {/* Implementation will be added later */}
  </div>
);

// Main App Component
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => window.location.reload()} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard - All roles */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* POS - Admin & Cashier only */}
        <Route 
          path="/pos" 
          element={
            <ProtectedRoute 
              permission={PERMISSIONS.CREATE_ORDER}
              roles={[ROLES.ADMIN, ROLES.CASHIER]}
            >
              <POS />
            </ProtectedRoute>
          } 
        />
        
        {/* Products - All roles (different views) */}
        <Route 
          path="/products" 
          element={
            <ProtectedRoute permission={PERMISSIONS.VIEW_PRODUCTS}>
              <Products />
            </ProtectedRoute>
          } 
        />
        
        {/* Orders - Role-based views */}
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } 
        />
        
        {/* AI Dashboard - Admin only */}
        <Route 
          path="/ai-dashboard" 
          element={
            <ProtectedRoute 
              permission={PERMISSIONS.VIEW_BI_DASHBOARD}
              roles={[ROLES.ADMIN]}
            >
              <AIDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Reports - Admin only */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute 
              permission={PERMISSIONS.VIEW_BI_DASHBOARD}
              roles={[ROLES.ADMIN]}
            >
              <ReportsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Staff Portal */}
        <Route 
          path="/leaderboard" 
          element={
            <ProtectedRoute 
              permission={PERMISSIONS.VIEW_LEADERBOARD}
              roles={[ROLES.STAFF]}
            >
              <StaffLeaderboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/performance" 
          element={
            <ProtectedRoute 
              permission={PERMISSIONS.VIEW_OWN_PERFORMANCE}
              roles={[ROLES.STAFF]}
            >
              <StaffPerformance />
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

// Root App Component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <AppContent />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                }}
              />
              <ReactQueryDevtools initialIsOpen={false} />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;