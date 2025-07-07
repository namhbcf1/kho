import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Store, TrendingUp, Package, ShoppingCart, DollarSign,
  ArrowUpRight, ArrowDownRight, RefreshCw, Download,
  BarChart3, PieChart, Globe, Smartphone, Users,
  AlertCircle, CheckCircle, Clock, Truck, XCircle
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { commerceService } from '@/services/commerce';
import { cn } from '@/lib/utils';

const CHANNEL_COLORS = {
  pos: '#3b82f6',
  shopee: '#ee4d2d',
  lazada: '#0f146d',
  tiki: '#1a94ff',
  website: '#10b981',
  facebook: '#1877f2'
};

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#10b981',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#059669',
  cancelled: '#ef4444',
  returned: '#f97316'
};

const CommerceDashboard = () => {
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [dateRange, setDateRange] = useState('7days');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch channel performance data
  const { data: performanceData, isLoading: performanceLoading, refetch: refetchPerformance } = useQuery({
    queryKey: ['channel-performance', dateRange, refreshKey],
    queryFn: () => commerceService.getChannelPerformance({ range: dateRange }),
    staleTime: 5 * 60 * 1000
  });

  // Fetch all channel orders
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['channel-orders', dateRange, refreshKey],
    queryFn: () => commerceService.fetchAllChannelOrders({ range: dateRange }),
    staleTime: 2 * 60 * 1000
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchPerformance();
    refetchOrders();
  };

  const getChannelIcon = (channel) => {
    const icons = {
      pos: Store,
      shopee: ShoppingCart,
      lazada: Package,
      tiki: Truck,
      website: Globe,
      facebook: Smartphone
    };
    return icons[channel] || Store;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: RefreshCw,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
      returned: AlertCircle
    };
    return icons[status] || Clock;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const channelPerformanceData = performanceData?.success ? 
    Object.entries(performanceData.performance).map(([channel, data]) => ({
      channel,
      name: commerceService.getChannelDisplayName(channel),
      ...data
    })) : [];

  const revenueChartData = channelPerformanceData.map(item => ({
    name: item.name,
    revenue: item.revenue,
    orders: item.orders,
    fill: CHANNEL_COLORS[item.channel]
  }));

  const filteredOrders = ordersData?.success ? 
    (selectedChannel === 'all' ? 
      ordersData.orders : 
      ordersData.orders.filter(order => order.channel === selectedChannel)
    ) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Commerce Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý đa kênh bán hàng tập trung
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 ngày qua</SelectItem>
              <SelectItem value="30days">30 ngày qua</SelectItem>
              <SelectItem value="90days">90 ngày qua</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng doanh thu</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(performanceData?.totalRevenue || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  +12.5% so với kỳ trước
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng đơn hàng</p>
                <p className="text-2xl font-bold">
                  {performanceData?.totalOrders || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  +8.2% so với kỳ trước
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kênh hoạt động</p>
                <p className="text-2xl font-bold">
                  {Object.keys(performanceData?.performance || {}).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Đa kênh bán hàng
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tỷ lệ chuyển đổi</p>
                <p className="text-2xl font-bold">15.8%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Trung bình tất cả kênh
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="channels">Kênh bán hàng</TabsTrigger>
          <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
          <TabsTrigger value="inventory">Tồn kho</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo kênh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                      />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Channel Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bố đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={revenueChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="orders"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {revenueChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất kênh bán hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kênh</TableHead>
                    <TableHead>Đơn hàng</TableHead>
                    <TableHead>Doanh thu</TableHead>
                    <TableHead>Giá trị TB</TableHead>
                    <TableHead>Tỷ lệ chuyển đổi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channelPerformanceData.map((channel) => {
                    const IconComponent = getChannelIcon(channel.channel);
                    return (
                      <TableRow key={channel.channel}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <span className="font-medium">{channel.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{channel.orders}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(channel.revenue)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(channel.avgOrderValue)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={channel.conversionRate * 100} 
                              className="w-16 h-2"
                            />
                            <span className="text-sm">
                              {(channel.conversionRate * 100).toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">Hoạt động</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Đơn hàng đa kênh</h3>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả kênh</SelectItem>
                <SelectItem value="pos">Điểm bán hàng</SelectItem>
                <SelectItem value="shopee">Shopee</SelectItem>
                <SelectItem value="lazada">Lazada</SelectItem>
                <SelectItem value="tiki">Tiki</SelectItem>
                <SelectItem value="website">Website</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn hàng</TableHead>
                    <TableHead>Kênh</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.slice(0, 10).map((order) => {
                    const IconComponent = getChannelIcon(order.channel);
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            <span>{commerceService.getChannelDisplayName(order.channel)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customer?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer?.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className="flex items-center gap-1 w-fit"
                            style={{ 
                              borderColor: STATUS_COLORS[order.status],
                              color: STATUS_COLORS[order.status]
                            }}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {commerceService.getStatusDisplayName(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Đồng bộ tồn kho đa kênh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tính năng đang phát triển</h3>
                <p className="text-muted-foreground">
                  Quản lý tồn kho đa kênh sẽ được cập nhật trong phiên bản tiếp theo
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommerceDashboard; 