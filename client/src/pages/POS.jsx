import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, 
  CreditCard, Banknote, QrCode, Printer,
  Package, Grid3X3, List, ScanLine, X,
  User, Phone, MapPin, Calculator
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMediaQuery } from '@/hooks/use-media-query';
import { api } from '@/services/api';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { NumberPad } from '@/components/NumberPad';
import { ReceiptPrinter } from '@/components/ReceiptPrinter';

// Schema validation
const customerSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên khách hàng'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  address: z.string().optional(),
  note: z.string().optional()
});

// Custom hooks
const useProducts = (search, category) => {
  return useQuery({
    queryKey: ['products', search, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      const response = await api.get(`/products?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Product Card Component
const ProductCard = ({ product, onAdd, viewMode }) => {
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAdd = async () => {
    setIsAdding(true);
    await onAdd(product);
    setTimeout(() => setIsAdding(false), 300);
  };
  
  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex items-center justify-between p-4 bg-card rounded-lg border hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Package className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-muted-foreground">
              SKU: {product.sku} • Tồn: {product.stock}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-lg font-bold">
            {product.price.toLocaleString('vi-VN')}đ
          </p>
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={cn(
              "transition-all",
              isAdding && "scale-95"
            )}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="group cursor-pointer"
    >
      <Card 
        className={cn(
          "h-full hover:shadow-lg transition-all duration-300",
          product.stock === 0 && "opacity-60"
        )}
        onClick={handleAdd}
      >
        <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-500 to-purple-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-16 w-16 text-white opacity-50" />
          </div>
          {product.stock < 5 && product.stock > 0 && (
            <Badge className="absolute top-2 right-2" variant="warning">
              Sắp hết
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="absolute top-2 right-2" variant="destructive">
              Hết hàng
            </Badge>
          )}
          <motion.div
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            animate={isAdding ? { scale: [1, 1.2, 1] } : {}}
          >
            <Plus className="h-12 w-12 text-white" />
          </motion.div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium truncate">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {product.category} • Tồn: {product.stock}
          </p>
          <p className="text-lg font-bold text-primary">
            {product.price.toLocaleString('vi-VN')}đ
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Cart Item Component
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [quantity, setQuantity] = useState(item.quantity);
  
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 0 && newQuantity <= item.product.stock) {
      setQuantity(newQuantity);
      onUpdateQuantity(item.product.id, newQuantity);
    }
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.product.name}</p>
        <p className="text-sm text-muted-foreground">
          {item.product.price.toLocaleString('vi-VN')}đ
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
          className="w-12 h-8 text-center"
        />
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={quantity >= item.product.stock}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive"
          onClick={() => onRemove(item.product.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );
};

// Main POS Component
export default function POS() {
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerInfo, setCustomerInfo] = useState(null);
  const receiptRef = useRef();
  
  const { data: products, isLoading: productsLoading } = useProducts(search, selectedCategory);
  const { data: categories } = useCategories();
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      note: ''
    }
  });
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await api.post('/orders', orderData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Tạo đơn hàng thành công!');
      setCart([]);
      setShowCheckout(false);
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['orders']);
      
      // Print receipt
      if (receiptRef.current) {
        receiptRef.current.print();
      }
    },
    onError: (error) => {
      toast.error('Lỗi khi tạo đơn hàng: ' + error.message);
    }
  });
  
  // Cart calculations
  const cartTotal = cart.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0
  );
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);
  
  // Add to cart
  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`);
  }, []);
  
  // Update quantity
  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, []);
  
  // Remove from cart
  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    toast.info('Đã xóa sản phẩm khỏi giỏ hàng');
  }, []);
  
  // Handle barcode scan
  const handleBarcodeScan = useCallback(async (barcode) => {
    try {
      const response = await api.get(`/products/barcode/${barcode}`);
      if (response.data) {
        addToCart(response.data);
        setShowScanner(false);
      } else {
        toast.error('Không tìm thấy sản phẩm với mã vạch này');
      }
    } catch (error) {
      toast.error('Lỗi khi quét mã vạch');
    }
  }, [addToCart]);
  
  // Handle checkout
  const handleCheckout = async (data) => {
    const orderData = {
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      })),
      total: cartTotal,
      payment_method: paymentMethod,
      customer: data,
      status: 'completed'
    };
    
    createOrderMutation.mutate(orderData);
  };
  
  const CheckoutDialog = isMobile ? Drawer : Dialog;
  const CheckoutContent = isMobile ? DrawerContent : DialogContent;
  const CheckoutHeader = isMobile ? DrawerHeader : DialogHeader;
  const CheckoutTitle = isMobile ? DrawerTitle : DialogTitle;
  const CheckoutFooter = isMobile ? DrawerFooter : DialogFooter;
  
  return (
    <div className="flex h-screen bg-background">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowScanner(true)}
              >
                <ScanLine className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Categories */}
          <ScrollArea className="w-full mt-4">
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
              >
                Tất cả
              </Button>
              {categories?.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        {/* Products Grid/List */}
        <ScrollArea className="flex-1 p-4">
          <AnimatePresence mode="wait">
            {productsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <motion.div
                className={cn(
                  viewMode === 'grid' 
                    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                    : "space-y-3"
                )}
              >
                {products?.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={addToCart}
                    viewMode={viewMode}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>
      
      {/* Cart Section */}
      <div className={cn(
        "w-full md:w-96 border-l bg-card flex flex-col",
        isMobile && "fixed bottom-0 left-0 right-0 h-20 border-t border-l-0"
      )}>
        {!isMobile && (
          <>
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Giỏ hàng ({cartItemsCount})
              </h2>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <AnimatePresence>
                {cart.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-muted-foreground py-12"
                  >
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Giỏ hàng trống</p>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {cart.map(item => (
                      <CartItem
                        key={item.product.id}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
            
            <div className="p-4 border-t space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính</span>
                  <span>{cartTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{cartTotal.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              
              <Button
                className="w-full"
                size="lg"
                disabled={cart.length === 0}
                onClick={() => setShowCheckout(true)}
              >
                Thanh toán
              </Button>
            </div>
          </>
        )}
        
        {isMobile && (
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    {cartItemsCount}
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng cộng</p>
                <p className="font-bold">{cartTotal.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
            <Button
              disabled={cart.length === 0}
              onClick={() => setShowCheckout(true)}
            >
              Thanh toán
            </Button>
          </div>
        )}
      </div>
      
      {/* Checkout Dialog/Drawer */}
      <CheckoutDialog open={showCheckout} onOpenChange={setShowCheckout}>
        <CheckoutContent className="max-w-2xl">
          <CheckoutHeader>
            <CheckoutTitle>Thanh toán đơn hàng</CheckoutTitle>
          </CheckoutHeader>
          
          <form onSubmit={handleSubmit(handleCheckout)} className="space-y-6">
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer">Thông tin khách hàng</TabsTrigger>
                <TabsTrigger value="payment">Phương thức thanh toán</TabsTrigger>
              </TabsList>
              
              <TabsContent value="customer" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Tên khách hàng *</Label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="name"
                          placeholder="Nhập tên khách hàng"
                          className={errors.name && "border-destructive"}
                        />
                      )}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="phone"
                          placeholder="Nhập số điện thoại"
                          className={errors.phone && "border-destructive"}
                        />
                      )}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="address"
                          placeholder="Nhập địa chỉ (tùy chọn)"
                        />
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="note">Ghi chú</Label>
                    <Controller
                      name="note"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="note"
                          placeholder="Ghi chú đơn hàng (tùy chọn)"
                          rows={3}
                        />
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="payment" className="space-y-4 mt-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Banknote className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Tiền mặt</p>
                          <p className="text-sm text-muted-foreground">
                            Thanh toán bằng tiền mặt tại quầy
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Thẻ ngân hàng</p>
                          <p className="text-sm text-muted-foreground">
                            Thanh toán qua thẻ ATM/Visa/Master
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="qr" id="qr" />
                    <Label htmlFor="qr" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <QrCode className="h-5 w-5" />
                        <div>
                          <p className="font-medium">QR Code</p>
                          <p className="text-sm text-muted-foreground">
                            Quét mã QR để thanh toán
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Chi tiết đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span>{item.product.name} x{item.quantity}</span>
                        <span>{(item.product.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{cartTotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <CheckoutFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCheckout(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4 mr-2" />
                    Xác nhận & In hóa đơn
                  </>
                )}
              </Button>
            </CheckoutFooter>
          </form>
        </CheckoutContent>
      </CheckoutDialog>
      
      {/* Barcode Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quét mã vạch sản phẩm</DialogTitle>
            <DialogDescription>
              Đưa mã vạch vào khung hình để quét
            </DialogDescription>
          </DialogHeader>
          <BarcodeScanner onScan={handleBarcodeScan} />
        </DialogContent>
      </Dialog>
      
      {/* Receipt Printer (hidden) */}
      <div className="hidden">
        <ReceiptPrinter
          ref={receiptRef}
          order={{
            id: Date.now().toString(),
            items: cart,
            total: cartTotal,
            customer: customerInfo,
            payment_method: paymentMethod,
            created_at: new Date()
          }}
        />
      </div>
    </div>
  );
}