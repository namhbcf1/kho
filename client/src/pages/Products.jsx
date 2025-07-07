import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Package, Search, Plus, Edit, Trash2, Filter,
  Download, Upload, Barcode, Grid3X3, List,
  AlertCircle, CheckCircle, X, ChevronDown,
  FileSpreadsheet, Eye, Archive, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useMediaQuery } from '@/hooks/use-media-query';
import { api } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { BarcodeGenerator } from '@/components/BarcodeGenerator';
import { ImportExport } from '@/components/ImportExport';

// Validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  sku: z.string().min(1, 'Mã SKU không được để trống'),
  barcode: z.string().optional(),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  price: z.number().min(0, 'Giá phải lớn hơn 0'),
  cost: z.number().min(0, 'Giá nhập phải lớn hơn 0'),
  stock: z.number().int().min(0, 'Tồn kho phải lớn hơn hoặc bằng 0'),
  min_stock: z.number().int().min(0, 'Tồn kho tối thiểu phải lớn hơn hoặc bằng 0'),
  description: z.string().optional(),
  unit: z.string().min(1, 'Đơn vị tính không được để trống'),
  supplier: z.string().optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock'])
});

// Custom hooks
const useProducts = (filters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/products?${params}`);
      return response.data;
    }
  });
};

const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    }
  });
};

// Product Card Component
const ProductCard = ({ product, onEdit, onDelete, selected, onSelect }) => {
  const stockPercentage = (product.stock / (product.stock + product.sold_count || 1)) * 100;
  const isLowStock = product.stock <= product.min_stock;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="relative"
    >
      <Card className={cn(
        "hover:shadow-lg transition-all duration-300",
        selected && "ring-2 ring-primary"
      )}>
        <div className="absolute top-4 right-4 z-10">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect(product.id)}
          />
        </div>
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>SKU: {product.sku}</span>
                {product.barcode && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Barcode className="h-3 w-3" />
                      {product.barcode}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
              {product.status === 'active' ? 'Đang bán' : 
               product.status === 'inactive' ? 'Ngừng bán' : 'Hết hàng'}
            </Badge>
            <Badge variant="outline">{product.category}</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Giá bán</p>
              <p className="font-bold text-lg">{product.price.toLocaleString('vi-VN')}đ</p>
            </div>
            <div>
              <p className="text-muted-foreground">Giá nhập</p>
              <p className="font-medium">{product.cost.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tồn kho</span>
              <span className={cn(
                "font-medium",
                isLowStock && "text-amber-600"
              )}>
                {product.stock} / {product.stock + (product.sold_count || 0)}
              </span>
            </div>
            <Progress 
              value={stockPercentage} 
              className={cn(
                "h-2",
                isLowStock && "[&>div]:bg-amber-500"
              )}
            />
            {isLowStock && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Sắp hết hàng (Min: {product.min_stock})
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm">
              <p className="text-muted-foreground">Đã bán</p>
              <p className="font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                {product.sold_count || 0} {product.unit}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(product)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(product)}
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Products Component
export default function Products() {
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [showImportExport, setShowImportExport] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    sort: 'name',
    order: 'asc',
    page: 1,
    limit: 20
  });
  
  const { data: products, isLoading, error } = useProducts(filters);
  const { data: categories } = useCategories();
  
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      barcode: '',
      category: '',
      price: 0,
      cost: 0,
      stock: 0,
      min_stock: 5,
      description: '',
      unit: 'cái',
      supplier: '',
      status: 'active'
    }
  });
  
  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/products', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Thêm sản phẩm thành công!');
      queryClient.invalidateQueries(['products']);
      setShowAddDialog(false);
      reset();
    },
    onError: (error) => {
      toast.error('Lỗi khi thêm sản phẩm: ' + error.message);
    }
  });
  
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Cập nhật sản phẩm thành công!');
      queryClient.invalidateQueries(['products']);
      setEditingProduct(null);
      reset();
    },
    onError: (error) => {
      toast.error('Lỗi khi cập nhật sản phẩm: ' + error.message);
    }
  });
  
  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Xóa sản phẩm thành công!');
      queryClient.invalidateQueries(['products']);
      setShowDeleteDialog(false);
      setDeletingProduct(null);
    },
    onError: (error) => {
      toast.error('Lỗi khi xóa sản phẩm: ' + error.message);
    }
  });
  
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const response = await api.post('/products/bulk-delete', { ids });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Xóa sản phẩm thành công!');
      queryClient.invalidateQueries(['products']);
      setSelectedProducts([]);
    },
    onError: (error) => {
      toast.error('Lỗi khi xóa sản phẩm: ' + error.message);
    }
  });
  
  // Handlers
  const handleAddProduct = (data) => {
    createProductMutation.mutate(data);
  };
  
  const handleUpdateProduct = (data) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    }
  };
  
  const handleEdit = (product) => {
    setEditingProduct(product);
    Object.keys(product).forEach(key => {
      setValue(key, product[key]);
    });
  };
  
  const handleDelete = (product) => {
    setDeletingProduct(product);
    setShowDeleteDialog(true);
  };
  
  const handleBulkDelete = () => {
    if (selectedProducts.length > 0) {
      bulkDeleteMutation.mutate(selectedProducts);
    }
  };
  
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedProducts.length === products?.data?.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products?.data?.map(p => p.id) || []);
    }
  };
  
  const handleGenerateBarcode = () => {
    const barcode = Date.now().toString();
    setValue('barcode', barcode);
  };
  
  const ProductForm = ({ onSubmit, isLoading }) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="pricing">Giá & Tồn kho</TabsTrigger>
          <TabsTrigger value="additional">Thông tin thêm</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên sản phẩm *</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="name"
                    placeholder="Nhập tên sản phẩm"
                    className={errors.name && "border-destructive"}
                  />
                )}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">Mã SKU *</Label>
                <Controller
                  name="sku"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="sku"
                      placeholder="Nhập mã SKU"
                      className={errors.sku && "border-destructive"}
                    />
                  )}
                />
                {errors.sku && (
                  <p className="text-sm text-destructive">{errors.sku.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="barcode">Mã vạch</Label>
                <div className="flex gap-2">
                  <Controller
                    name="barcode"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="barcode"
                        placeholder="Nhập mã vạch"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGenerateBarcode}
                  >
                    <Barcode className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Danh mục *</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className={errors.category && "border-destructive"}>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="unit">Đơn vị tính *</Label>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className={errors.unit && "border-destructive"}>
                        <SelectValue placeholder="Chọn đơn vị" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cái">Cái</SelectItem>
                        <SelectItem value="hộp">Hộp</SelectItem>
                        <SelectItem value="chai">Chai</SelectItem>
                        <SelectItem value="gói">Gói</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="lít">Lít</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="pricing" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Giá bán *</Label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="price"
                      type="number"
                      placeholder="0"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className={errors.price && "border-destructive"}
                    />
                  )}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="cost">Giá nhập *</Label>
                <Controller
                  name="cost"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="cost"
                      type="number"
                      placeholder="0"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className={errors.cost && "border-destructive"}
                    />
                  )}
                />
                {errors.cost && (
                  <p className="text-sm text-destructive">{errors.cost.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stock">Tồn kho *</Label>
                <Controller
                  name="stock"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="stock"
                      type="number"
                      placeholder="0"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className={errors.stock && "border-destructive"}
                    />
                  )}
                />
                {errors.stock && (
                  <p className="text-sm text-destructive">{errors.stock.message}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="min_stock">Tồn kho tối thiểu *</Label>
                <Controller
                  name="min_stock"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="min_stock"
                      type="number"
                      placeholder="5"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className={errors.min_stock && "border-destructive"}
                    />
                  )}
                />
                {errors.min_stock && (
                  <p className="text-sm text-destructive">{errors.min_stock.message}</p>
                )}
              </div>
            </div>
            
            {watch('price') > 0 && watch('cost') > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Lợi nhuận</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(watch('price') - watch('cost')).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tỷ lệ lợi nhuận</p>
                      <p className="text-2xl font-bold text-green-600">
                        {((watch('price') - watch('cost')) / watch('cost') * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="additional" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="supplier">Nhà cung cấp</Label>
              <Controller
                name="supplier"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="supplier"
                    placeholder="Nhập tên nhà cung cấp"
                  />
                )}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="Nhập mô tả sản phẩm"
                    rows={4}
                  />
                )}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang bán</SelectItem>
                      <SelectItem value="inactive">Ngừng bán</SelectItem>
                      <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowAddDialog(false);
            setEditingProduct(null);
            reset();
          }}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang xử lý...
            </>
          ) : editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
        </Button>
      </DialogFooter>
    </form>
  );
  
  const DialogComponent = isMobile ? Sheet : Dialog;
  const DialogContentComponent = isMobile ? SheetContent : DialogContent;
  const DialogHeaderComponent = isMobile ? SheetHeader : DialogHeader;
  const DialogTitleComponent = isMobile ? SheetTitle : DialogTitle;
  
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
            <Package className="h-8 w-8" />
            Quản lý sản phẩm
          </h1>
          <p className="text-muted-foreground mt-1">
            Tổng cộng: {products?.total || 0} sản phẩm
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedProducts.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa ({selectedProducts.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportExport(true)}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import/Export
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="pl-10"
              />
            </div>
            
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value, page: 1 })}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả danh mục</SelectItem>
                {categories?.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                <SelectItem value="active">Đang bán</SelectItem>
                <SelectItem value="inactive">Ngừng bán</SelectItem>
                <SelectItem value="out_of_stock">Hết hàng</SelectItem>
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Sắp xếp theo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilters({ ...filters, sort: 'name', order: 'asc' })}>
                  Tên (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({ ...filters, sort: 'name', order: 'desc' })}>
                  Tên (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({ ...filters, sort: 'price', order: 'asc' })}>
                  Giá (Thấp - Cao)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({ ...filters, sort: 'price', order: 'desc' })}>
                  Giá (Cao - Thấp)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({ ...filters, sort: 'stock', order: 'asc' })}>
                  Tồn kho (Thấp - Cao)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Products Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Có lỗi xảy ra</p>
            <p className="text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            <AnimatePresence mode="popLayout">
              {products?.data?.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  selected={selectedProducts.includes(product.id)}
                  onSelect={handleSelectProduct}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {products?.data?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Không tìm thấy sản phẩm</p>
                <p className="text-muted-foreground">Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedProducts.length === products?.data?.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead>Giá nhập</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Đã bán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.data?.map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => handleSelectProduct(product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {product.sku}
                        {product.barcode && ` • ${product.barcode}`}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="font-medium">
                    {product.price.toLocaleString('vi-VN')}đ
                  </TableCell>
                  <TableCell>
                    {product.cost.toLocaleString('vi-VN')}đ
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.stock}
                      {product.stock <= product.min_stock && (
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{product.sold_count || 0}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                      {product.status === 'active' ? 'Đang bán' : 
                       product.status === 'inactive' ? 'Ngừng bán' : 'Hết hàng'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(product)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      
      {/* Pagination */}
      {products?.totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                  disabled={filters.page === 1}
                />
              </PaginationItem>
              
              {[...Array(Math.min(5, products.totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setFilters({ ...filters, page: pageNum })}
                      isActive={filters.page === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {products.totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setFilters({ ...filters, page: Math.min(products.totalPages, filters.page + 1) })}
                  disabled={filters.page === products.totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      {/* Add/Edit Product Dialog */}
      <DialogComponent 
        open={showAddDialog || !!editingProduct} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingProduct(null);
            reset();
          }
        }}
      >
        <DialogContentComponent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeaderComponent>
            <DialogTitleComponent>
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </DialogTitleComponent>
          </DialogHeaderComponent>
          
          <ProductForm
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
            isLoading={createProductMutation.isPending || updateProductMutation.isPending}
          />
        </DialogContentComponent>
      </DialogComponent>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm "{deletingProduct?.name}"? 
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletingProduct(null);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingProduct) {
                  deleteProductMutation.mutate(deletingProduct.id);
                }
              }}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import/Export Dialog */}
      <ImportExport
        open={showImportExport}
        onOpenChange={setShowImportExport}
        type="products"
      />
    </motion.div>
  );
}