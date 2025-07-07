import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, Package, ShoppingCart, DollarSign,
  Calendar, Download, Filter, BarChart3,
  PieChart as PieChartIcon, LineChart as LineChartIcon,
  ArrowUpRight, ArrowDownRight, Users, AlertCircle,
  FileSpreadsheet, Printer, RefreshCw, Grid3X3
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/services/api';
import { exportToExcel, exportToPDF } from '@/utils/export';

// Custom hooks
const useReportData = (type, dateRange) => {
  return useQuery({
    queryKey: ['reports', type, dateRange],
    queryFn: async () => {
      const response = await api.get(`/reports/${type}`, { params: dateRange });
      return response.data;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

// KPI Card Component
const KPICard = ({ title, value, change, subtitle, icon: Icon, color, loading }) => {
  const isPositive = change > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className={cn(
          "absolute inset-0 opacity-10",
          `bg-gradient-to-br from-${color}-500 to-${color}-600`
        )} />
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {loading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-bold">{value}</h2>
                    {change !== undefined && (
                      <Badge 
                        variant={isPositive ? "success" : "destructive"}
                        className="flex items-center gap-1"
                      >
                        {isPositive ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {Math.abs(change)}%
                      </Badge>
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                  )}
                </>
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
      </Card>
    </motion.div>
  );
};

// Chart Card Component
const ChartCard = ({ title, description, children, actions }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {actions}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString('vi-VN')}
            {entry.name.includes('tiền') || entry.name.includes('thu') ? 'đ' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Main Reports Component
export default function ReportsPage() {
  const { theme } = useTheme();
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('7days');
  const [customDateRange, setCustomDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const [compareMode, setCompareMode] = useState(false);
  
  // Calculate date range
  const getDateRange = () => {
    let from, to;
    switch (dateRange) {
      case 'today':
        from = to = new Date();
        break;
      case '7days':
        from = subDays(new Date(), 7);
        to = new Date();
        break;
      case '30days':
        from = subDays(new Date(), 30);
        to = new Date();
        break;
      case 'thisMonth':
        from = startOfMonth(new Date());
        to = endOfMonth(new Date());
        break;
      case 'custom':
        from = customDateRange.from;
        to = customDateRange.to;
        break;
      default:
        from = subDays(new Date(), 7);
        to = new Date();
    }
    return {
      from: format(from, 'yyyy-MM-dd'),
      to: format(to, 'yyyy-MM-dd')
    };
  };
  
  const { data, isLoading, refetch } = useReportData(reportType, getDateRange());
  
  // Chart colors
  const chartColors = {
    primary: theme === 'dark' ? '#3b82f6' : '#2563eb',
    secondary: theme === 'dark' ? '#10b981' : '#059669',
    tertiary: theme === 'dark' ? '#f59e0b' : '#d97706',
    quaternary: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
    danger: theme === 'dark' ? '#ef4444' : '#dc2626'
  };
  
  const COLORS = [
    chartColors.primary,
    chartColors.secondary,
    chartColors.tertiary,
    chartColors.quaternary,
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#06b6d4'
  ];
  
  // Export handlers
  const handleExportExcel = () => {
    if (!data) return;
    
    const exportData = {
      summary: data.summary,
      revenue: data.revenueData,
      products: data.topProducts,
      categories: data.categoryData
    };
    
    exportToExcel(exportData, `report_${reportType}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    toast.success('Xuất báo cáo Excel thành công!');
  };
  
  const handleExportPDF = () => {
    if (!data) return;
    
    // Implement PDF export
    toast.info('Tính năng xuất PDF đang được phát triển');
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <motion.div
      className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Báo cáo & Thống kê
          </h1>
          <p className="text-muted-foreground mt-1">
            Phân tích hiệu suất kinh doanh của bạn
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            In
          </Button>
          <Button
            variant="outline"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Tổng quan</SelectItem>
                <SelectItem value="revenue">Doanh thu</SelectItem>
                <SelectItem value="products">Sản phẩm</SelectItem>
                <SelectItem value="customers">Khách hàng</SelectItem>
                <SelectItem value="inventory">Tồn kho</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[200px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateRange === 'today' && 'Hôm nay'}
                  {dateRange === '7days' && '7 ngày qua'}
                  {dateRange === '30days' && '30 ngày qua'}
                  {dateRange === 'thisMonth' && 'Tháng này'}
                  {dateRange === 'custom' && 'Tùy chỉnh'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4 space-y-2">
                  <Button
                    variant={dateRange === 'today' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setDateRange('today')}
                  >
                    Hôm nay
                  </Button>
                  <Button
                    variant={dateRange === '7days' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setDateRange('7days')}
                  >
                    7 ngày qua
                  </Button>
                  <Button
                    variant={dateRange === '30days' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setDateRange('30days')}
                  >
                    30 ngày qua
                  </Button>
                  <Button
                    variant={dateRange === 'thisMonth' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setDateRange('thisMonth')}
                  >
                    Tháng này
                  </Button>
                  <Separator className="my-2" />
                  <CalendarComponent
                    mode="range"
                    selected={customDateRange}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setCustomDateRange(range);
                        setDateRange('custom');
                      }
                    }}
                    numberOfMonths={2}
                  />
                </div>
              </PopoverContent>
            </Popover>
            
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm font-medium">So sánh</label>
              <input
                type="checkbox"
                checked={compareMode}
                onChange={(e) => setCompareMode(e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Content */}
      <AnimatePresence mode="wait">
        {reportType === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Tổng doanh thu"
                value={`${(data?.summary?.totalRevenue || 0).toLocaleString('vi-VN')}đ`}
                change={data?.summary?.revenueChange}
                subtitle="So với kỳ trước"
                icon={DollarSign}
                color="green"
                loading={isLoading}
              />
              <KPICard
                title="Số đơn hàng"
                value={data?.summary?.totalOrders || 0}
                change={data?.summary?.ordersChange}
                subtitle={`TB: ${(data?.summary?.avgOrderValue || 0).toLocaleString('vi-VN')}đ`}
                icon={ShoppingCart}
                color="blue"
                loading={isLoading}
              />
              <KPICard
                title="Sản phẩm bán"
                value={data?.summary?.totalProductsSold || 0}
                change={data?.summary?.productsSoldChange}
                subtitle="Tổng số lượng"
                icon={Package}
                color="purple"
                loading={isLoading}
              />
              <KPICard
                title="Khách hàng mới"
                value={data?.summary?.newCustomers || 0}
                change={data?.summary?.customersChange}
                subtitle="Trong kỳ"
                icon={Users}
                color="amber"
                loading={isLoading}
              />
            </div>
            
            {/* Revenue Chart */}
            <ChartCard
              title="Biểu đồ doanh thu"
              description="Theo dõi xu hướng doanh thu theo thời gian"
              actions={
                <Select defaultValue="area">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="area">Biểu đồ vùng</SelectItem>
                    <SelectItem value="line">Biểu đồ đường</SelectItem>
                    <SelectItem value="bar">Biểu đồ cột</SelectItem>
                  </SelectContent>
                </Select>
              }
            >
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.revenueData || []}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0.1}/>
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
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Doanh thu"
                      stroke={chartColors.primary}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                    {compareMode && (
                      <Area
                        type="monotone"
                        dataKey="lastPeriodRevenue"
                        name="Kỳ trước"
                        stroke={chartColors.secondary}
                        fillOpacity={1}
                        fill="url(#colorOrders)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            
            {/* Category & Products */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Category Distribution */}
              <ChartCard
                title="Phân bố theo danh mục"
                description="Tỷ lệ doanh thu theo từng danh mục"
              >
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.categoryData || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data?.categoryData?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
              
              {/* Top Products */}
              <ChartCard
                title="Top sản phẩm bán chạy"
                description="Sản phẩm có doanh số cao nhất"
              >
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {data?.topProducts?.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white",
                            index === 0 && "bg-gradient-to-br from-yellow-500 to-orange-600",
                            index === 1 && "bg-gradient-to-br from-gray-400 to-gray-600",
                            index === 2 && "bg-gradient-to-br from-orange-600 to-red-700",
                            index > 2 && "bg-gradient-to-br from-blue-500 to-purple-600"
                          )}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.soldCount} đã bán • {product.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {product.revenue.toLocaleString('vi-VN')}đ
                          </p>
                          <Progress 
                            value={product.percentage} 
                            className="w-20 h-2 mt-1"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </ChartCard>
            </div>
            
            {/* Performance Metrics */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Sales by Hour */}
              <ChartCard
                title="Doanh số theo giờ"
                description="Giờ cao điểm bán hàng"
              >
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.hourlyData || []}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="sales" 
                        fill={chartColors.primary}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
              
              {/* Payment Methods */}
              <ChartCard
                title="Phương thức thanh toán"
                description="Tỷ lệ sử dụng các hình thức"
              >
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.paymentMethods || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data?.paymentMethods?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {data?.paymentMethods?.map((method, index) => (
                      <div key={method.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{method.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
              
              {/* Customer Retention */}
              <ChartCard
                title="Khách hàng quay lại"
                description="Tỷ lệ khách hàng mua lại"
              >
                <div className="h-[250px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative inline-flex">
                      <svg className="w-32 h-32">
                        <circle
                          className="text-muted-foreground/20"
                          strokeWidth="10"
                          stroke="currentColor"
                          fill="transparent"
                          r="50"
                          cx="64"
                          cy="64"
                        />
                        <circle
                          className="text-primary"
                          strokeWidth="10"
                          strokeDasharray={314}
                          strokeDashoffset={314 - (314 * (data?.summary?.returnRate || 0)) / 100}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="50"
                          cx="64"
                          cy="64"
                          transform="rotate(-90 64 64)"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
                        {data?.summary?.returnRate || 0}%
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      {data?.summary?.returningCustomers || 0} / {data?.summary?.totalCustomers || 0} khách
                    </p>
                  </div>
                </div>
              </ChartCard>
            </div>
          </motion.div>
        )}
        
        {reportType === 'revenue' && (
          <motion.div
            key="revenue"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Revenue Analysis */}
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="daily">Theo ngày</TabsTrigger>
                <TabsTrigger value="weekly">Theo tuần</TabsTrigger>
                <TabsTrigger value="monthly">Theo tháng</TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily" className="space-y-6">
                <ChartCard
                  title="Doanh thu theo ngày"
                  description="Chi tiết doanh thu và lợi nhuận từng ngày"
                >
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={data?.dailyRevenue || []}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                          className="text-xs"
                        />
                        <YAxis yAxisId="left" className="text-xs" />
                        <YAxis yAxisId="right" orientation="right" className="text-xs" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          yAxisId="left"
                          dataKey="revenue" 
                          name="Doanh thu"
                          fill={chartColors.primary}
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar 
                          yAxisId="left"
                          dataKey="profit" 
                          name="Lợi nhuận"
                          fill={chartColors.secondary}
                          radius={[8, 8, 0, 0]}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="orders" 
                          name="Số đơn"
                          stroke={chartColors.tertiary}
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </TabsContent>
              
              <TabsContent value="weekly" className="space-y-6">
                <ChartCard
                  title="Doanh thu theo tuần"
                  description="So sánh doanh thu giữa các tuần"
                >
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data?.weeklyRevenue || []}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="week" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          name="Doanh thu"
                          stroke={chartColors.primary}
                          strokeWidth={3}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="avgOrderValue" 
                          name="Giá trị TB/đơn"
                          stroke={chartColors.secondary}
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </TabsContent>
              
              <TabsContent value="monthly" className="space-y-6">
                <ChartCard
                  title="Doanh thu theo tháng"
                  description="Xu hướng doanh thu dài hạn"
                >
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data?.monthlyRevenue || []}>
                        <defs>
                          <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke={chartColors.primary}
                          fillOpacity={1}
                          fill="url(#colorMonthly)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </TabsContent>
            </Tabs>
            
            {/* Revenue Breakdown */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard
                title="Phân tích lợi nhuận"
                description="Tỷ lệ lợi nhuận trên doanh thu"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tổng doanh thu</span>
                    <span className="text-xl font-bold">
                      {(data?.summary?.totalRevenue || 0).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tổng chi phí</span>
                    <span className="text-xl">
                      {(data?.summary?.totalCost || 0).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Lợi nhuận gộp</span>
                    <span className="text-xl font-bold text-green-600">
                      {(data?.summary?.grossProfit || 0).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <Progress 
                    value={data?.summary?.profitMargin || 0} 
                    className="h-3"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Tỷ lệ lợi nhuận: {data?.summary?.profitMargin || 0}%
                  </p>
                </div>
              </ChartCard>
              
              <ChartCard
                title="Top nguồn doanh thu"
                description="Phân tích nguồn tạo doanh thu"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nguồn</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead className="text-right">Doanh thu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.revenueBySource?.map((source) => (
                      <TableRow key={source.name}>
                        <TableCell className="font-medium">{source.name}</TableCell>
                        <TableCell>{source.count}</TableCell>
                        <TableCell className="text-right font-bold">
                          {source.revenue.toLocaleString('vi-VN')}đ
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ChartCard>
            </div>
          </motion.div>
        )}
        
        {reportType === 'products' && (
          <motion.div
            key="products"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Product Performance */}
            <ChartCard
              title="Hiệu suất sản phẩm"
              description="Phân tích chi tiết từng sản phẩm"
            >
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="soldCount" 
                      name="Số lượng bán"
                      className="text-xs"
                    />
                    <YAxis 
                      dataKey="revenue" 
                      name="Doanh thu"
                      className="text-xs"
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm">Đã bán: {data.soldCount}</p>
                              <p className="text-sm">Doanh thu: {data.revenue.toLocaleString('vi-VN')}đ</p>
                              <p className="text-sm">Lợi nhuận: {data.profit.toLocaleString('vi-VN')}đ</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      name="Sản phẩm" 
                      data={data?.productPerformance || []} 
                      fill={chartColors.primary}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            
            {/* Product Tables */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard
                title="Sản phẩm bán chạy nhất"
                description="Top 10 sản phẩm có doanh số cao"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>SL bán</TableHead>
                      <TableHead className="text-right">Doanh thu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.topSellingProducts?.slice(0, 10).map((product, index) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{product.soldCount}</TableCell>
                        <TableCell className="text-right font-bold">
                          {product.revenue.toLocaleString('vi-VN')}đ
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ChartCard>
              
              <ChartCard
                title="Sản phẩm cần nhập hàng"
                description="Sản phẩm có tồn kho thấp"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Tồn kho</TableHead>
                      <TableHead>Cảnh báo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.lowStockProducts?.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              SKU: {product.sku}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-600">
                              {product.stock}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              / {product.minStock}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="warning" className="flex items-center gap-1 w-fit">
                            <AlertCircle className="h-3 w-3" />
                            Sắp hết
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ChartCard>
            </div>
            
            {/* Category Analysis */}
            <ChartCard
              title="Phân tích theo danh mục"
              description="So sánh hiệu suất giữa các danh mục"
            >
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data?.categoryPerformance || []}>
                    <PolarGrid strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="category" className="text-xs" />
                    <PolarRadiusAxis className="text-xs" />
                    <Radar 
                      name="Doanh thu" 
                      dataKey="revenue" 
                      stroke={chartColors.primary}
                      fill={chartColors.primary}
                      fillOpacity={0.6}
                    />
                    <Radar 
                      name="Số lượng" 
                      dataKey="quantity" 
                      stroke={chartColors.secondary}
                      fill={chartColors.secondary} 
                      fillOpacity={0.6}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </motion.div>
        )}
        
        {reportType === 'inventory' && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Inventory Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Tổng giá trị tồn kho"
                value={`${(data?.inventoryValue || 0).toLocaleString('vi-VN')}đ`}
                subtitle="Giá trị hàng tồn"
                icon={Package}
                color="blue"
                loading={isLoading}
              />
              <KPICard
                title="Số lượng SKU"
                value={data?.totalSKUs || 0}
                subtitle="Mã sản phẩm khác nhau"
                icon={Grid3X3}
                color="purple"
                loading={isLoading}
              />
              <KPICard
                title="Sản phẩm sắp hết"
                value={data?.lowStockCount || 0}
                subtitle="Cần nhập hàng"
                icon={AlertCircle}
                color="amber"
                loading={isLoading}
              />
              <KPICard
                title="Vòng quay hàng tồn"
                value={`${data?.turnoverRate || 0}x`}
                subtitle="Trong kỳ"
                icon={RefreshCw}
                color="green"
                loading={isLoading}
              />
            </div>
            
            {/* Inventory Movement */}
            <ChartCard
              title="Biến động tồn kho"
              description="Theo dõi nhập xuất hàng hóa"
            >
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.inventoryMovement || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="stockIn" 
                      name="Nhập kho"
                      fill={chartColors.secondary}
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar 
                      dataKey="stockOut" 
                      name="Xuất kho"
                      fill={chartColors.danger}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}