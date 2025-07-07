import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShoppingCart, Search, Filter, Calendar, Download,
  Eye, Printer, CheckCircle, XCircle, Clock,
  Package, Truck, DollarSign, User, Phone,
  MapPin, FileText, TrendingUp, TrendingDown,
  ChevronRight, ChevronDown, RefreshCw
} from 'lucide-react';
import { format, parseISO, startOfDay, endOfDay, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { useMediaQuery } from '@/hooks/use-media-query';
import { api } from '@/services/api';
import ReceiptPrinter from '@/components/ReceiptPrinter';
import { exportToExcel } from '@/utils/export';

// Custom hooks
const useOrders = (filters) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/orders?${params}`);
      return response.data;
    },
    refetchInterval: 30000 // Auto refresh every 30s
  });
};

const useOrderStats = (dateRange) => {
  return useQuery({
    queryKey: ['order-stats', dateRange],
    queryFn: async () => {
      const response = await api.get('/orders/stats', { params: { dateRange } });
      return response.data;
    }
  });
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: 'Chờ xử lý',
      variant: 'warning',
      icon: Clock
    },
    processing: {
      label: 'Đang xử lý',
      variant: 'secondary',
      icon: Package
    },
    shipping: {
      label: 'Đang giao',
      variant: 'info',
      icon: Truck
    },
    completed: {
      label: 'Hoàn thành',
      variant: 'success',
      icon: CheckCircle
    },
    cancelled: {
      label: 'Đã hủy',
      variant: 'destructive',
      icon: XCircle
    }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

// Order Stats Card
const OrderStatCard = ({ title, value, change, icon: Icon, color, loading }) => {
  const isPositive = change > 0;
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{value}</h3>
                {change !== undefined && (
                  <div className={cn(
                    "flex items-center gap-1 text-sm",
                    isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{Math.abs(change)}%</span>
                  </div>
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
    </Card>
  );
};

// Order Row Component
const OrderRow = ({ order, onView, onPrint, onUpdateStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-medium text-sm">#{order.id.slice(-6)}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer?.name || 'Khách lẻ'}</span>
              </div>
              {order.customer?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.phone}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-primary">
                {order.total.toLocaleString('vi-VN')}đ
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <Separator className="my-3" />
                  
                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-medium">Chi tiết đơn hàng:</p>
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.product_name} x{item.quantity}</span>
                        <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onView(order)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Chi tiết
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onPrint(order)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      In
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
  
  return (
    <TableRow>
      <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
      <TableCell>
        {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{order.customer?.name || 'Khách lẻ'}</p>
          {order.customer?.phone && (
            <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
          )}
        </div>
      </TableCell>
      <TableCell>{order.items?.length || 0} sản phẩm</TableCell>
      <TableCell className="font-bold">
        {order.total.toLocaleString('vi-VN')}đ
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {order.payment_method === 'cash' ? 'Tiền mặt' :
           order.payment_method === 'card' ? 'Thẻ' : 'QR Code'}
        </Badge>
      </TableCell>
      <TableCell>
        <StatusBadge status={order.status} />
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(order)}>
              <Eye className="h-4 w-4 mr-2" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPrint(order)}>
              <Printer className="h-4 w-4 mr-2" />
              In hóa đơn
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Cập nhật trạng thái</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'processing')}>
              Đang xử lý
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'shipping')}>
              Đang giao
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'completed')}>
              Hoàn thành
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onUpdateStatus(order.id, 'cancelled')}
              className="text-destructive"
            >
              Hủy đơn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

// Main Orders Component
export default function Orders() {
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const receiptRef = useRef();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [dateRange, setDateRange] = useState('today');
  const [customDateRange, setCustomDateRange] = useState({
    from: new Date(),
    to: new Date()
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    payment_method: '',
    date_from: format(new Date(), 'yyyy-MM-dd'),
    date_to: format(new Date(), 'yyyy-MM-dd'),
    page: 1,
    limit: 20
  });
  
  const { data: orders, isLoading, error, refetch } = useOrders(filters);
  const { data: stats, isLoading: statsLoading } = useOrderStats(dateRange);
  
  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await api.patch(`/orders/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công!');
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order-stats']);
    },
    onError: (error) => {
      toast.error('Lỗi khi cập nhật trạng thái: ' + error.message);
    }
  });
  
  // Handlers
  const handleView = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };
  
  const handlePrint = (order) => {
    setSelectedOrder(order);
    setTimeout(() => {
      if (receiptRef.current) {
        receiptRef.current.print();
      }
    }, 100);
  };
  
  const handleUpdateStatus = (orderId, status) => {
    updateStatusMutation.mutate({ id: orderId, status });
  };
  
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    let from, to;
    
    switch (range) {
      case 'today':
        from = to = format(new Date(), 'yyyy-MM-dd');
        break;
      case '7days':
        from = format(subDays(new Date(), 7), 'yyyy-MM-dd');
        to = format(new Date(), 'yyyy-MM-dd');
        break;
      case '30days':
        from = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        to = format(new Date(), 'yyyy-MM-dd');
        break;
      case 'custom':
        from = format(customDateRange.from, 'yyyy-MM-dd');
        to = format(customDateRange.to, 'yyyy-MM-dd');
        break;
      default:
        from = to = format(new Date(), 'yyyy-MM-dd');
    }
    
    setFilters({ ...filters, date_from: from, date_to: to, page: 1 });
  };
  
  const handleExport = () => {
    const data = orders?.data?.map(order => ({
      'Mã đơn': order.id.slice(-6),
      'Ngày tạo': format(new Date(order.created_at), 'dd/MM/yyyy HH:mm'),
      'Khách hàng': order.customer?.name || 'Khách lẻ',
      'Số điện thoại': order.customer?.phone || '',
      'Số lượng SP': order.items?.length || 0,
      'Tổng tiền': order.total,
      'Phương thức TT': order.payment_method === 'cash' ? 'Tiền mặt' :
                       order.payment_method === 'card' ? 'Thẻ' : 'QR Code',
      'Trạng thái': order.status
    }));
    
    exportToExcel(data, `orders_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    toast.success('Xuất file Excel thành công!');
  };
  
  return (
    <motion.div
      className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Quản lý đơn hàng
          </h1>
          <p className="text-muted-foreground mt-1">
            Tổng cộng: {orders?.total || 0} đơn hàng
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
            onClick={handleExport}
            disabled={!orders?.data?.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <OrderStatCard
          title="Tổng đơn hàng"
          value={stats?.totalOrders || 0}
          change={stats?.ordersChange}
          icon={ShoppingCart}
          color="blue"
          loading={statsLoading}
        />
        <OrderStatCard
          title="Doanh thu"
          value={`${(stats?.totalRevenue || 0).toLocaleString('vi-VN')}đ`}
          change={stats?.revenueChange}
          icon={DollarSign}
          color="green"
          loading={statsLoading}
        />
        <OrderStatCard
          title="Đơn thành công"
          value={stats?.completedOrders || 0}
          change={stats?.completedChange}
          icon={CheckCircle}
          color="emerald"
          loading={statsLoading}
        />
        <OrderStatCard
          title="Đơn hủy"
          value={stats?.cancelledOrders || 0}
          change={stats?.cancelledChange}
          icon={XCircle}
          color="red"
          loading={statsLoading}
        />
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm đơn hàng..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="shipping">Đang giao</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filters.payment_method}
                onValueChange={(value) => setFilters({ ...filters, payment_method: value, page: 1 })}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  <SelectItem value="cash">Tiền mặt</SelectItem>
                  <SelectItem value="card">Thẻ</SelectItem>
                  <SelectItem value="qr">QR Code</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[180px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    {dateRange === 'today' && 'Hôm nay'}
                    {dateRange === '7days' && '7 ngày qua'}
                    {dateRange === '30days' && '30 ngày qua'}
                    {dateRange === 'custom' && 'Tùy chỉnh'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-4 space-y-2">
                    <Button
                      variant={dateRange === 'today' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleDateRangeChange('today')}
                    >
                      Hôm nay
                    </Button>
                    <Button
                      variant={dateRange === '7days' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleDateRangeChange('7days')}
                    >
                      7 ngày qua
                    </Button>
                    <Button
                      variant={dateRange === '30days' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleDateRangeChange('30days')}
                    >
                      30 ngày qua
                    </Button>
                    <Separator />
                    <CalendarComponent
                      mode="range"
                      selected={customDateRange}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setCustomDateRange(range);
                          setDateRange('custom');
                          handleDateRangeChange('custom');
                        }
                      }}
                      numberOfMonths={isMobile ? 1 : 2}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Status Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" onClick={() => setFilters({ ...filters, status: '', page: 1 })}>
                  Tất cả
                </TabsTrigger>
                <TabsTrigger value="pending" onClick={() => setFilters({ ...filters, status: 'pending', page: 1 })}>
                  Chờ xử lý ({stats?.pendingOrders || 0})
                </TabsTrigger>
                <TabsTrigger value="processing" onClick={() => setFilters({ ...filters, status: 'processing', page: 1 })}>
                  Đang xử lý
                </TabsTrigger>
                <TabsTrigger value="completed" onClick={() => setFilters({ ...filters, status: 'completed', page: 1 })}>
                  Hoàn thành
                </TabsTrigger>
                <TabsTrigger value="cancelled" onClick={() => setFilters({ ...filters, status: 'cancelled', page: 1 })}>
                  Đã hủy
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Có lỗi xảy ra</p>
            <p className="text-muted-foreground">{error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Thử lại
            </Button>
          </CardContent>
        </Card>
      ) : orders?.data?.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Không tìm thấy đơn hàng</p>
            <p className="text-muted-foreground">Thử thay đổi bộ lọc để xem kết quả khác</p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="space-y-4">
          <AnimatePresence>
            {orders?.data?.map(order => (
              <OrderRow
                key={order.id}
                order={order}
                onView={handleView}
                onPrint={handlePrint}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {orders?.data?.map(order => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onView={handleView}
                    onPrint={handlePrint}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </Card>
      )}
      
      {/* Order Detail Dialog */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.id.slice(-6)}</DialogTitle>
            <DialogDescription>
              Tạo lúc: {selectedOrder && format(new Date(selectedOrder.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phương thức thanh toán</p>
                  <Badge variant="outline">
                    {selectedOrder.payment_method === 'cash' ? 'Tiền mặt' :
                     selectedOrder.payment_method === 'card' ? 'Thẻ' : 'QR Code'}
                  </Badge>
                </div>
              </div>
              
              {/* Customer Info */}
              {selectedOrder.customer && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông tin khách hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.customer.name}</span>
                    </div>
                    {selectedOrder.customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedOrder.customer.phone}</span>
                      </div>
                    )}
                    {selectedOrder.customer.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedOrder.customer.address}</span>
                      </div>
                    )}
                    {selectedOrder.customer.note && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{selectedOrder.customer.note}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chi tiết sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.price.toLocaleString('vi-VN')}đ x {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center pt-2">
                      <p className="text-lg font-medium">Tổng cộng</p>
                      <p className="text-xl font-bold text-primary">
                        {selectedOrder.total.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handlePrint(selectedOrder)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  In hóa đơn
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setShowOrderDetail(false)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Receipt Printer (hidden) */}
      <div className="hidden">
        <ReceiptPrinter
          ref={receiptRef}
          order={selectedOrder}
        />
      </div>
    </motion.div>
  );
}