import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, Package, ShoppingCart, DollarSign, 
  AlertCircle, Users, Calendar, BarChart3,
  ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/services/api';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

// Custom hooks for data fetching
const useDashboardData = (dateRange) => {
  return useQuery({
    queryKey: ['dashboard', dateRange],
    queryFn: async () => {
      const [stats, products, orders] = await Promise.all([
        api.get('/orders/stats/summary', { params: { dateRange } }),
        api.get('/products', { params: { limit: 10, sort: 'sales' } }),
        api.get('/orders', { params: { limit: 10, dateRange } })
      ]);
      return {
        stats: stats.data,
        topProducts: products.data,
        recentOrders: orders.data
      };
    },
    refetchInterval: 30000, // Auto refresh every 30s
    staleTime: 10000
  });
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, color, loading }) => {
  const isPositive = trend > 0;
  
  return (
    <motion.div variants={itemVariants}>
      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-bold">{value}</h2>
                  {trend !== undefined && (
                    <Badge 
                      variant={isPositive ? "success" : "destructive"}
                      className="flex items-center gap-1"
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(trend)}%
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center",
              `bg-${color}-100 dark:bg-${color}-900/20`
            )}>
              <Icon className={cn("h-6 w-6", `text-${color}-600 dark:text-${color}-400`)} />
            </div>
          </div>
        </CardContent>
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 h-1",
            `bg-${color}-500`
          )} 
        />
      </Card>
    </motion.div>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState('7days');
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const { data, isLoading, error } = useDashboardData(dateRange);
  
  // Chart colors based on theme
  const chartColors = {
    primary: theme === 'dark' ? '#3b82f6' : '#2563eb',
    secondary: theme === 'dark' ? '#10b981' : '#059669',
    tertiary: theme === 'dark' ? '#f59e0b' : '#d97706',
    danger: theme === 'dark' ? '#ef4444' : '#dc2626'
  };
  
  // Prepare chart data
  const revenueData = data?.stats?.revenueByDay?.map(item => ({
    date: format(new Date(item.date), 'dd/MM', { locale: vi }),
    revenue: item.revenue,
    orders: item.orders
  })) || [];
  
  const categoryData = data?.stats?.salesByCategory || [];
  
  const COLORS = [
    chartColors.primary,
    chartColors.secondary,
    chartColors.tertiary,
    chartColors.danger,
    '#8b5cf6',
    '#ec4899'
  ];
  
  return (
    <motion.div
      className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Tổng quan hoạt động kinh doanh
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="7days">7 ngày qua</SelectItem>
              <SelectItem value="30days">30 ngày qua</SelectItem>
              <SelectItem value="90days">90 ngày qua</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Stats Cards */}
      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
        variants={containerVariants}
      >
        <StatCard
          title="Doanh thu"
          value={data?.stats?.totalRevenue?.toLocaleString('vi-VN') + 'đ' || '0đ'}
          icon={DollarSign}
          trend={data?.stats?.revenueTrend}
          color="blue"
          loading={isLoading}
        />
        <StatCard
          title="Đơn hàng"
          value={data?.stats?.totalOrders || 0}
          icon={ShoppingCart}
          trend={data?.stats?.ordersTrend}
          color="green"
          loading={isLoading}
        />
        <StatCard
          title="Sản phẩm"
          value={data?.stats?.totalProducts || 0}
          icon={Package}
          trend={data?.stats?.productsTrend}
          color="amber"
          loading={isLoading}
        />
        <StatCard
          title="Khách hàng"
          value={data?.stats?.totalCustomers || 0}
          icon={Users}
          trend={data?.stats?.customersTrend}
          color="purple"
          loading={isLoading}
        />
      </motion.div>
      
      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="products">Sản phẩm</TabsTrigger>
          <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
        </TabsList>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="overview" className="space-y-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Doanh thu theo ngày
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          className="text-xs"
                          tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b' }}
                        />
                        <YAxis 
                          className="text-xs"
                          tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b' }}
                          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                          formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke={chartColors.primary}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Category Chart */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Doanh số theo danh mục
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}đ`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Low Stock Alert */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      Cảnh báo tồn kho
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data?.stats?.lowStockProducts?.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              SKU: {product.sku}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-600">
                              {product.stock}
                            </p>
                            <p className="text-xs text-muted-foreground">còn lại</p>
                          </div>
                        </motion.div>
                      ))}
                      {(!data?.stats?.lowStockProducts || data.stats.lowStockProducts.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">
                          Không có sản phẩm nào sắp hết hàng
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top sản phẩm bán chạy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.topProducts?.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.category} • SKU: {product.sku}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{product.soldCount} đã bán</p>
                          <p className="text-sm text-green-600">
                            {(product.revenue || 0).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Đơn hàng gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.recentOrders?.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-all"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">#{order.id.slice(-6)}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {order.total.toLocaleString('vi-VN')}đ
                          </p>
                          <Badge variant={
                            order.status === 'completed' ? 'success' :
                            order.status === 'pending' ? 'warning' : 'secondary'
                          }>
                            {order.status === 'completed' ? 'Hoàn thành' :
                             order.status === 'pending' ? 'Đang xử lý' : 'Đã hủy'}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}