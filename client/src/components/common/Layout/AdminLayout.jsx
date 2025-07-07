import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { usePermissions } from '../../../utils/hooks/usePermissions';
import { useRealTime } from '../../../utils/hooks/useRealTime';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Filter
} from 'lucide-react';

const AdminLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();
  const { data: realTimeData } = useRealTime();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Load notifications
    setNotifications([
      { id: 1, type: 'warning', message: 'Low stock alert: 5 products', time: '2 min ago' },
      { id: 2, type: 'info', message: 'New order received', time: '5 min ago' },
      { id: 3, type: 'success', message: 'Daily backup completed', time: '1 hour ago' }
    ]);
  }, []);

  const menuItems = [
    { 
      label: 'Dashboard', 
      icon: BarChart3, 
      path: '/admin/dashboard',
      permission: 'view_dashboard'
    },
    { 
      label: 'Products', 
      icon: Package, 
      path: '/admin/products',
      permission: 'manage_products'
    },
    { 
      label: 'Inventory', 
      icon: Package, 
      path: '/admin/inventory',
      permission: 'manage_inventory'
    },
    { 
      label: 'Orders', 
      icon: ShoppingCart, 
      path: '/admin/orders',
      permission: 'manage_orders'
    },
    { 
      label: 'Reports', 
      icon: TrendingUp, 
      path: '/admin/reports',
      permission: 'view_reports'
    },
    { 
      label: 'Staff', 
      icon: Users, 
      path: '/admin/staff',
      permission: 'manage_staff'
    },
    { 
      label: 'Customers', 
      icon: Users, 
      path: '/admin/customers',
      permission: 'manage_customers'
    },
    { 
      label: 'Integrations', 
      icon: Settings, 
      path: '/admin/integrations',
      permission: 'manage_integrations'
    },
    { 
      label: 'Settings', 
      icon: Settings, 
      path: '/admin/settings',
      permission: 'manage_settings'
    }
  ];

  const BusinessIntelligenceWidget = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {realTimeData?.todayRevenue || '₫2,450,000'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500">+12.5%</span>
            <span className="text-gray-500 ml-1">vs yesterday</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Orders</p>
              <p className="text-2xl font-bold text-blue-600">
                {realTimeData?.todayOrders || '156'}
              </p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-blue-500">+8.2%</span>
            <span className="text-gray-500 ml-1">vs yesterday</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Staff</p>
              <p className="text-2xl font-bold text-purple-600">
                {realTimeData?.activeStaff || '12'}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-purple-500">8 online</span>
            <span className="text-gray-500 ml-1">• 4 offline</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">
                {realTimeData?.lowStockItems || '5'}
              </p>
            </div>
            <Package className="h-8 w-8 text-red-600" />
          </div>
          <div className="mt-2">
            <Badge variant="destructive" className="text-xs">
              Needs Attention
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className={`font-bold text-xl text-gray-800 ${!sidebarOpen && 'hidden'}`}>
              Admin Panel
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              if (!hasPermission(item.permission)) return null;
              
              const Icon = item.icon;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {sidebarOpen && <span>{item.label}</span>}
                </a>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              
              <div className="relative">
                <Button variant="ghost" size="sm">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Business Intelligence Widgets */}
        <div className="px-6 py-4">
          <BusinessIntelligenceWidget />
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto px-6 py-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;