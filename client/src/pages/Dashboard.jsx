import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, Package, ShoppingCart, DollarSign, 
  AlertCircle, Users, Calendar, BarChart3,
  ArrowUpRight, ArrowDownRight, Eye, Trophy, Target,
  Star, Award, TrendingDown, Clock, Shield, CreditCard,
  Zap, Activity, Bell, Settings, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAuth, ROLES, PERMISSIONS } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
      // Mock data for demonstration
      const mockData = {
        stats: {
          totalRevenue: 125000000,
          revenueChange: 12.5,
          totalOrders: 1234,
          ordersChange: 8.3,
          totalProducts: 456,
          productsChange: 2.1,
          totalCustomers: 789,
          customersChange: 15.2,
          revenueByDay: Array.from({ length: 7 }, (_, i) => ({
            date: format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'),
            revenue: Math.floor(Math.random() * 20000000) + 10000000,
            orders: Math.floor(Math.random() * 200) + 100
          })),
          salesByCategory: [
            { name: 'Điện tử', value: 45000000, percentage: 36 },
            { name: 'Thời trang', value: 35000000, percentage: 28 },
            { name: 'Gia dụng', value: 25000000, percentage: 20 },
            { name: 'Khác', value: 20000000, percentage: 16 }
          ]
        },
        topProducts: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          name: `Sản phẩm ${i + 1}`,
          sales: Math.floor(Math.random() * 1000) + 100,
          revenue: Math.floor(Math.random() * 10000000) + 1000000
        })),
        recentOrders: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          customer: `Khách hàng ${i + 1}`,
          total: Math.floor(Math.random() * 5000000) + 100000,
          status: ['completed', 'pending', 'processing'][Math.floor(Math.random() * 3)],
          createdAt: subDays(new Date(), i)
        }))
      };
      
      return mockData;
    },
    refetchInterval: 30000,
    staleTime: 10000
  });
};

// Staff Performance Data Hook
const useStaffPerformance = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['staff-performance', user?.id],
    queryFn: async () => {
      // Mock staff performance data
      return {
        currentSales: 35000000,
        targetSales: 50000000,
        commission: 1750000,
        rank: 3,
        totalStaff: 15,
        weeklyRank: 2,
        monthlyProgress: 70,
        achievements: [
          { id: 1, name: 'Tân binh xuất sắc', icon: '🌟', earnedAt: '2023-08-15' },
          { id: 2, name: 'Chuyên gia Up-sell', icon: '📈', earnedAt: '2023-09-01' },
          { id: 3, name: 'Vua chốt đơn', icon: '👑', earnedAt: '2023-09-15' }
        ],
        leaderboard: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          name: `Nhân viên ${i + 1}`,
          sales: Math.floor(Math.random() * 50000000) + 20000000,
          commission: Math.floor(Math.random() * 2500000) + 1000000,
          rank: i + 1,
          isCurrentUser: i === 2 // Current user at rank 3
        }))
      };
    },
    enabled: user?.role === ROLES.STAFF
  });
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, color, loading, subtitle, onClick }) => {
  const isPositive = trend > 0;
  
  return (
    <motion.div variants={itemVariants}>
      <Card 
        className={cn(
          "relative overflow-hidden hover:shadow-lg transition-all duration-300",
          onClick && "cursor-pointer hover:scale-105"
        )}
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="space-y-1">
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
                  {subtitle && (
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
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

// Admin Dashboard Component
const AdminDashboard = ({ data, isLoading, chartColors }) => (
  <div className="space-y-6">
    {/* KPI Cards */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Tổng doanh thu"
        value={`${(data?.stats?.totalRevenue || 0).toLocaleString('vi-VN')}đ`}
        trend={data?.stats?.revenueChange}
        icon={DollarSign}
        color="green"
        loading={isLoading}
        subtitle="So với kỳ trước"
      />
      <StatCard
        title="Đơn hàng"
        value={data?.stats?.totalOrders || 0}
        trend={data?.stats?.ordersChange}
        icon={ShoppingCart}
        color="blue"
        loading={isLoading}
        subtitle="Tổng số đơn"
      />
      <StatCard
        title="Sản phẩm"
        value={data?.stats?.totalProducts || 0}
        trend={data?.stats?.productsChange}
        icon={Package}
        color="purple"
        loading={isLoading}
        subtitle="Trong kho"
      />
      <StatCard
        title="Khách hàng"
        value={data?.stats?.totalCustomers || 0}
        trend={data?.stats?.customersChange}
        icon={Users}
        color="amber"
        loading={isLoading}
        subtitle="Khách hàng mới"
      />
    </div>

    {/* Charts */}
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Biểu đồ doanh thu</CardTitle>
          <CardDescription>Doanh thu 7 ngày qua</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.stats?.revenueByDay || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                  className="text-xs"
                />
                <YAxis 
                  className="text-xs"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                  formatter={(value) => [`${value.toLocaleString('vi-VN')}đ`, 'Doanh thu']}
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
      <Card>
        <CardHeader>
          <CardTitle>Doanh thu theo danh mục</CardTitle>
          <CardDescription>Phân bố doanh thu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.stats?.salesByCategory || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data?.stats?.salesByCategory?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={[chartColors.primary, chartColors.secondary, chartColors.tertiary, chartColors.danger][index % 4]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}đ`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* AI Insights */}
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Thông tin thông minh AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">Dự báo tuần tới</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Doanh thu dự kiến tăng 15% so với tuần này dựa trên xu hướng và mùa vụ.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">Khuyến nghị</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Nên tăng cường marketing cho danh mục "Gia dụng" để cải thiện hiệu suất.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Cashier Dashboard Component
const CashierDashboard = ({ data, isLoading, chartColors }) => (
  <div className="space-y-6">
    {/* Today's Stats */}
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Doanh thu ca"
        value="15,750,000đ"
        trend={8.5}
        icon={DollarSign}
        color="green"
        loading={isLoading}
        subtitle="Ca hiện tại"
      />
      <StatCard
        title="Đơn hàng"
        value="67"
        trend={12.3}
        icon={ShoppingCart}
        color="blue"
        loading={isLoading}
        subtitle="Đã xử lý"
      />
      <StatCard
        title="Trung bình/đơn"
        value="235,000đ"
        trend={-2.1}
        icon={TrendingUp}
        color="purple"
        loading={isLoading}
        subtitle="Giá trị đơn hàng"
      />
    </div>

    {/* Quick Actions */}
    <Card>
      <CardHeader>
        <CardTitle>Thao tác nhanh</CardTitle>
        <CardDescription>Các chức năng thường dùng trong ca làm việc</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button className="h-20 flex-col gap-2" variant="outline">
            <ShoppingCart className="h-6 w-6" />
            <span>Tạo đơn mới</span>
          </Button>
          <Button className="h-20 flex-col gap-2" variant="outline">
            <RefreshCw className="h-6 w-6" />
            <span>Đổi/Trả hàng</span>
          </Button>
          <Button className="h-20 flex-col gap-2" variant="outline">
            <Users className="h-6 w-6" />
            <span>Khách hàng</span>
          </Button>
          <Button className="h-20 flex-col gap-2" variant="outline">
            <Clock className="h-6 w-6" />
            <span>Đóng ca</span>
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Recent Orders */}
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng gần đây</CardTitle>
        <CardDescription>Các đơn hàng trong ca làm việc</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data?.recentOrders?.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">#{order.id} - {order.customer}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.createdAt), 'HH:mm - dd/MM/yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{order.total.toLocaleString('vi-VN')}đ</p>
                <Badge variant={order.status === 'completed' ? 'success' : 'secondary'}>
                  {order.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Staff Dashboard Component
const StaffDashboard = ({ performanceData, isLoading }) => (
  <div className="space-y-6">
    {/* Performance Overview */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Doanh số tháng"
        value={`${(performanceData?.currentSales / 1000000 || 0).toFixed(1)}M`}
        icon={Target}
        color="green"
        loading={isLoading}
        subtitle={`Mục tiêu: ${(performanceData?.targetSales / 1000000 || 0).toFixed(0)}M`}
      />
      <StatCard
        title="Hoa hồng"
        value={`${(performanceData?.commission || 0).toLocaleString('vi-VN')}đ`}
        icon={DollarSign}
        color="blue"
        loading={isLoading}
        subtitle="Tháng này"
      />
      <StatCard
        title="Xếp hạng"
        value={`#${performanceData?.rank || 0}`}
        icon={Trophy}
        color="amber"
        loading={isLoading}
        subtitle={`/${performanceData?.totalStaff || 0} nhân viên`}
      />
      <StatCard
        title="Tiến độ"
        value={`${performanceData?.monthlyProgress || 0}%`}
        icon={TrendingUp}
        color="purple"
        loading={isLoading}
        subtitle="Hoàn thành mục tiêu"
      />
    </div>

    {/* Progress Chart */}
    <Card>
      <CardHeader>
        <CardTitle>Tiến độ mục tiêu</CardTitle>
        <CardDescription>Theo dõi tiến độ hoàn thành mục tiêu tháng</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Hiện tại: {(performanceData?.currentSales / 1000000 || 0).toFixed(1)}M</span>
            <span>Mục tiêu: {(performanceData?.targetSales / 1000000 || 0).toFixed(0)}M</span>
          </div>
          <Progress value={performanceData?.monthlyProgress || 0} className="h-3" />
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {performanceData?.monthlyProgress || 0}%
            </p>
            <p className="text-sm text-muted-foreground">Hoàn thành</p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Achievements */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Thành tích & Huy hiệu
        </CardTitle>
        <CardDescription>Các thành tích đã đạt được</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {performanceData?.achievements?.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800"
            >
              <div className="text-2xl">{achievement.icon}</div>
              <div>
                <p className="font-medium">{achievement.name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(achievement.earnedAt), 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Leaderboard */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Bảng xếp hạng
        </CardTitle>
        <CardDescription>Top nhân viên bán hàng tháng này</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {performanceData?.leaderboard?.slice(0, 5).map((staff) => (
            <div
              key={staff.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                staff.isCurrentUser 
                  ? "bg-primary/10 border border-primary/20" 
                  : "bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-white",
                  staff.rank === 1 && "bg-gradient-to-r from-yellow-400 to-orange-500",
                  staff.rank === 2 && "bg-gradient-to-r from-gray-300 to-gray-500",
                  staff.rank === 3 && "bg-gradient-to-r from-orange-400 to-red-500",
                  staff.rank > 3 && "bg-gradient-to-r from-blue-400 to-purple-500"
                )}>
                  {staff.rank}
                </div>
                <div>
                  <p className={cn("font-medium", staff.isCurrentUser && "text-primary")}>
                    {staff.name} {staff.isCurrentUser && "(Bạn)"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(staff.sales / 1000000).toFixed(1)}M doanh số
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{staff.commission.toLocaleString('vi-VN')}đ</p>
                <p className="text-xs text-muted-foreground">Hoa hồng</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Main Dashboard Component
export default function Dashboard() {
  const { user, hasPermission } = useAuth();
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState('7days');
  
  const { data, isLoading, error } = useDashboardData(dateRange);
  const { data: performanceData, isLoading: perfLoading } = useStaffPerformance();
  
  // Chart colors based on theme
  const chartColors = {
    primary: theme === 'dark' ? '#3b82f6' : '#2563eb',
    secondary: theme === 'dark' ? '#10b981' : '#059669',
    tertiary: theme === 'dark' ? '#f59e0b' : '#d97706',
    danger: theme === 'dark' ? '#ef4444' : '#dc2626'
  };
  
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {user?.role === ROLES.ADMIN && <Shield className="h-8 w-8 text-red-600" />}
            {user?.role === ROLES.CASHIER && <CreditCard className="h-8 w-8 text-blue-600" />}
            {user?.role === ROLES.STAFF && <Users className="h-8 w-8 text-green-600" />}
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === ROLES.ADMIN && 'Tổng quan toàn diện hoạt động kinh doanh'}
            {user?.role === ROLES.CASHIER && 'Thông tin ca làm việc và bán hàng'}
            {user?.role === ROLES.STAFF && 'Theo dõi hiệu suất và thành tích cá nhân'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasPermission(PERMISSIONS.VIEW_BI_DASHBOARD) && (
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
          )}
          
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Role-based Dashboard Content */}
      <AnimatePresence mode="wait">
        {user?.role === ROLES.ADMIN && (
          <motion.div key="admin" variants={containerVariants}>
            <AdminDashboard 
              data={data} 
              isLoading={isLoading} 
              chartColors={chartColors} 
            />
          </motion.div>
        )}
        
        {user?.role === ROLES.CASHIER && (
          <motion.div key="cashier" variants={containerVariants}>
            <CashierDashboard 
              data={data} 
              isLoading={isLoading} 
              chartColors={chartColors} 
            />
          </motion.div>
        )}
        
        {user?.role === ROLES.STAFF && (
          <motion.div key="staff" variants={containerVariants}>
            <StaffDashboard 
              performanceData={performanceData} 
              isLoading={perfLoading} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}