// Enhanced API service for POS system with production optimizations
import { toast } from 'sonner';

// Configuration
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  mockMode: process.env.REACT_APP_MOCK_MODE === 'true' || process.env.NODE_ENV === 'development'
};

// Enhanced mock data with more realistic entries
const mockProducts = [
  { id: 1, name: 'iPhone 14 Pro', sku: 'IP14P-001', price: 25000000, stock: 15, category: 'Điện tử', barcode: '1234567890123', minStock: 5, cost: 20000000, supplier: 'Apple Store' },
  { id: 2, name: 'Samsung Galaxy S23', sku: 'SGS23-001', price: 22000000, stock: 8, category: 'Điện tử', barcode: '1234567890124', minStock: 5, cost: 18000000, supplier: 'Samsung VN' },
  { id: 3, name: 'MacBook Air M2', sku: 'MBA-M2-001', price: 32000000, stock: 5, category: 'Điện tử', barcode: '1234567890125', minStock: 3, cost: 26000000, supplier: 'Apple Store' },
  { id: 4, name: 'Áo thun Nam', sku: 'ATN-001', price: 350000, stock: 50, category: 'Thời trang', barcode: '1234567890126', minStock: 20, cost: 200000, supplier: 'Fashion Co' },
  { id: 5, name: 'Quần jean Nữ', sku: 'QJN-001', price: 650000, stock: 25, category: 'Thời trang', barcode: '1234567890127', minStock: 15, cost: 400000, supplier: 'Fashion Co' },
  { id: 6, name: 'Nồi cơm điện', sku: 'NCD-001', price: 1200000, stock: 12, category: 'Gia dụng', barcode: '1234567890128', minStock: 8, cost: 800000, supplier: 'Home Appliances' },
  { id: 7, name: 'Máy xay sinh tố', sku: 'MXST-001', price: 800000, stock: 8, category: 'Gia dụng', barcode: '1234567890129', minStock: 5, cost: 500000, supplier: 'Home Appliances' },
  { id: 8, name: 'Bàn làm việc', sku: 'BLV-001', price: 2500000, stock: 3, category: 'Nội thất', barcode: '1234567890130', minStock: 2, cost: 1800000, supplier: 'Furniture Ltd' },
  { id: 9, name: 'Tai nghe AirPods', sku: 'AP-001', price: 4500000, stock: 20, category: 'Điện tử', barcode: '1234567890131', minStock: 10, cost: 3500000, supplier: 'Apple Store' },
  { id: 10, name: 'Đồng hồ thông minh', sku: 'SW-001', price: 3200000, stock: 12, category: 'Điện tử', barcode: '1234567890132', minStock: 8, cost: 2400000, supplier: 'Tech World' },
];

const mockCategories = [
  { id: 1, name: 'Điện tử', slug: 'dien-tu', description: 'Thiết bị điện tử, công nghệ' },
  { id: 2, name: 'Thời trang', slug: 'thoi-trang', description: 'Quần áo, phụ kiện thời trang' },
  { id: 3, name: 'Gia dụng', slug: 'gia-dung', description: 'Đồ gia dụng, nội thất' },
  { id: 4, name: 'Nội thất', slug: 'noi-that', description: 'Bàn ghế, đồ nội thất' },
];

const mockOrders = [];
let orderIdCounter = 1;

// Cache management
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Request queue for rate limiting
const requestQueue = [];
let isProcessingQueue = false;

// Simulate API delay with realistic timing
const delay = (ms = process.env.NODE_ENV === 'production' ? 100 : 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Rate limiter
const rateLimit = async () => {
  if (requestQueue.length > 10) {
    await delay(1000); // Wait if too many requests
  }
  requestQueue.push(Date.now());
  
  // Clean old requests
  const now = Date.now();
  while (requestQueue.length > 0 && now - requestQueue[0] > 60000) {
    requestQueue.shift();
  }
};

// Cache utilities
const getCacheKey = (endpoint, params) => {
  return `${endpoint}${params ? JSON.stringify(params) : ''}`;
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Clean old cache entries
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
};

// Retry mechanism
const retryRequest = async (fn, attempts = API_CONFIG.retryAttempts) => {
  try {
    return await fn();
  } catch (error) {
    if (attempts > 1 && (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR')) {
      await delay(API_CONFIG.retryDelay);
      return retryRequest(fn, attempts - 1);
    }
    throw error;
  }
};

// Enhanced error handling
const handleApiError = (error, endpoint) => {
  const errorInfo = {
    endpoint,
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack
  };

  // Log error for monitoring
  console.error('API Error:', errorInfo);
  
  // Store error in localStorage for debugging
  try {
    const errors = JSON.parse(localStorage.getItem('apiErrors') || '[]');
    errors.push(errorInfo);
    if (errors.length > 50) errors.shift(); // Keep only last 50 errors
    localStorage.setItem('apiErrors', JSON.stringify(errors));
  } catch (e) {
    console.warn('Failed to store error in localStorage:', e);
  }

  // User-friendly error messages
  if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
    toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
  } else if (error.response?.status === 401) {
    toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  } else if (error.response?.status === 403) {
    toast.error('Bạn không có quyền thực hiện thao tác này.');
  } else if (error.response?.status === 404) {
    toast.error('Không tìm thấy dữ liệu yêu cầu.');
  } else if (error.response?.status >= 500) {
    toast.error('Lỗi server. Vui lòng thử lại sau.');
  } else {
    toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
  }

  throw error;
};

// Performance monitoring
const performanceMonitor = {
  requests: new Map(),
  
  start: (endpoint) => {
    const key = `${endpoint}-${Date.now()}`;
    performanceMonitor.requests.set(key, {
      endpoint,
      startTime: performance.now(),
      timestamp: Date.now()
    });
    return key;
  },
  
  end: (key, success = true) => {
    const request = performanceMonitor.requests.get(key);
    if (request) {
      const duration = performance.now() - request.startTime;
      const logData = {
        ...request,
        duration,
        success
      };
      
      // Log slow requests
      if (duration > 2000) {
        console.warn('Slow API request:', logData);
      }
      
      // Store performance data
      try {
        const perfData = JSON.parse(localStorage.getItem('apiPerformance') || '[]');
        perfData.push(logData);
        if (perfData.length > 100) perfData.shift();
        localStorage.setItem('apiPerformance', JSON.stringify(perfData));
      } catch (e) {
        console.warn('Failed to store performance data:', e);
      }
      
      performanceMonitor.requests.delete(key);
    }
  }
};

// Mock API implementation with enhanced features
export const api = {
  // GET requests
  get: async (endpoint, config = {}) => {
    const perfKey = performanceMonitor.start(endpoint);
    
    try {
      await rateLimit();
      
      const { params = {} } = config;
      const cacheKey = getCacheKey(endpoint, params);
      
      // Check cache first for GET requests
      const cachedData = getFromCache(cacheKey);
      if (cachedData && !params.nocache) {
        performanceMonitor.end(perfKey, true);
        return { data: cachedData };
      }
      
      await delay();
      
      let result;
      
      if (endpoint === '/products') {
        result = await handleProductsGet(params);
      } else if (endpoint === '/categories') {
        result = { data: mockCategories };
      } else if (endpoint.startsWith('/products/barcode/')) {
        result = await handleBarcodeGet(endpoint);
      } else if (endpoint === '/orders') {
        result = await handleOrdersGet(params);
      } else if (endpoint === '/orders/stats/summary') {
        result = await handleStatsGet();
      } else if (endpoint.startsWith('/reports/')) {
        result = await handleReportsGet(endpoint, params);
      } else {
        throw new Error(`Endpoint not found: ${endpoint}`);
      }
      
      // Cache the result
      setCache(cacheKey, result.data);
      
      performanceMonitor.end(perfKey, true);
      return result;
      
    } catch (error) {
      performanceMonitor.end(perfKey, false);
      return handleApiError(error, endpoint);
    }
  },

  // POST requests
  post: async (endpoint, data) => {
    const perfKey = performanceMonitor.start(endpoint);
    
    try {
      await rateLimit();
      await delay();
      
      let result;
      
      if (endpoint === '/orders') {
        result = await handleOrderCreate(data);
      } else if (endpoint === '/products') {
        result = await handleProductCreate(data);
      } else if (endpoint === '/auth/login') {
        result = await handleLogin(data);
      } else {
        throw new Error(`Endpoint not found: ${endpoint}`);
      }
      
      // Clear related cache
      clearRelatedCache(endpoint);
      
      performanceMonitor.end(perfKey, true);
      return result;
      
    } catch (error) {
      performanceMonitor.end(perfKey, false);
      return handleApiError(error, endpoint);
    }
  },

  // PUT requests
  put: async (endpoint, data) => {
    const perfKey = performanceMonitor.start(endpoint);
    
    try {
      await rateLimit();
      await delay();
      
      let result;
      
      if (endpoint.startsWith('/products/')) {
        result = await handleProductUpdate(endpoint, data);
      } else {
        throw new Error(`Endpoint not found: ${endpoint}`);
      }
      
      // Clear related cache
      clearRelatedCache(endpoint);
      
      performanceMonitor.end(perfKey, true);
      return result;
      
    } catch (error) {
      performanceMonitor.end(perfKey, false);
      return handleApiError(error, endpoint);
    }
  },

  // DELETE requests
  delete: async (endpoint) => {
    const perfKey = performanceMonitor.start(endpoint);
    
    try {
      await rateLimit();
      await delay();
      
      let result;
      
      if (endpoint.startsWith('/products/')) {
        result = await handleProductDelete(endpoint);
      } else {
        throw new Error(`Endpoint not found: ${endpoint}`);
      }
      
      // Clear related cache
      clearRelatedCache(endpoint);
      
      performanceMonitor.end(perfKey, true);
      return result;
      
    } catch (error) {
      performanceMonitor.end(perfKey, false);
      return handleApiError(error, endpoint);
    }
  }
};

// Helper functions for handling different endpoints
const handleProductsGet = async (params) => {
  let filteredProducts = [...mockProducts];
  
  // Search filter
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm) ||
      product.barcode.includes(searchTerm)
    );
  }
  
  // Category filter
  if (params.category) {
    const categoryName = mockCategories.find(c => c.id.toString() === params.category.toString())?.name;
    if (categoryName) {
      filteredProducts = filteredProducts.filter(product => 
        product.category === categoryName
      );
    }
  }
  
  // Stock filter
  if (params.lowStock === 'true') {
    filteredProducts = filteredProducts.filter(product => 
      product.stock <= product.minStock
    );
  }
  
  // Sorting
  if (params.sortBy) {
    const sortField = params.sortBy;
    const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
    
    filteredProducts.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortOrder;
      if (a[sortField] > b[sortField]) return 1 * sortOrder;
      return 0;
    });
  }
  
  // Pagination
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  return {
    data: {
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit)
      }
    }
  };
};

const handleBarcodeGet = async (endpoint) => {
  const barcode = endpoint.split('/').pop();
  const product = mockProducts.find(p => p.barcode === barcode);
  return { data: product || null };
};

const handleOrdersGet = async (params) => {
  let filteredOrders = [...mockOrders];
  
  // Date range filter
  if (params.dateRange) {
    const now = new Date();
    let startDate;
    
    switch (params.dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }
    
    filteredOrders = filteredOrders.filter(order => 
      new Date(order.created_at) >= startDate
    );
  }
  
  // Status filter
  if (params.status) {
    filteredOrders = filteredOrders.filter(order => order.status === params.status);
  }
  
  // Pagination
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  
  return {
    data: {
      orders: paginatedOrders,
      pagination: {
        page,
        limit,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit)
      }
    }
  };
};

const handleStatsGet = async () => {
  // Generate comprehensive mock stats
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const totalCost = mockOrders.reduce((sum, order) => sum + (order.cost || order.total * 0.7), 0);
  
  const stats = {
    totalRevenue,
    totalOrders: mockOrders.length,
    totalProducts: mockProducts.length,
    totalCustomers: Math.floor(mockOrders.length * 0.7),
    revenueChange: Math.random() * 20 - 10,
    ordersChange: Math.random() * 15 - 5,
    productsChange: Math.random() * 5 - 2,
    customersChange: Math.random() * 25 - 5,
    totalCost,
    grossProfit: totalRevenue - totalCost,
    profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
    avgOrderValue: mockOrders.length > 0 ? totalRevenue / mockOrders.length : 0,
    returnRate: Math.floor(Math.random() * 30) + 60,
    returningCustomers: Math.floor(mockOrders.length * 0.4),
    totalCustomers: Math.floor(mockOrders.length * 0.7),
    revenueByDay: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
      revenue: Math.floor(Math.random() * 10000000) + 5000000,
      orders: Math.floor(Math.random() * 50) + 20,
      profit: Math.floor(Math.random() * 3000000) + 1500000
    })),
    salesByCategory: mockCategories.map(category => ({
      name: category.name,
      value: Math.floor(Math.random() * 20000000) + 5000000,
      percentage: Math.floor(Math.random() * 30) + 10
    })),
    lowStockProducts: mockProducts.filter(p => p.stock <= p.minStock).map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      minStock: p.minStock
    })),
    topProducts: mockProducts
      .sort((a, b) => (b.price * (50 - b.stock)) - (a.price * (50 - a.stock)))
      .slice(0, 10)
      .map((product, index) => ({
        ...product,
        soldCount: 50 - product.stock,
        revenue: product.price * (50 - product.stock),
        percentage: 100 - (index * 10)
      })),
    hourlyData: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      sales: Math.floor(Math.random() * 2000000) + 500000
    })),
    paymentMethods: [
      { name: 'Tiền mặt', value: 45 },
      { name: 'Thẻ tín dụng', value: 30 },
      { name: 'Chuyển khoản', value: 20 },
      { name: 'Ví điện tử', value: 5 }
    ]
  };
  
  return { data: stats };
};

const handleReportsGet = async (endpoint, params) => {
  const reportType = endpoint.split('/').pop();
  
  // Generate mock report data based on type
  const reportData = {
    summary: await handleStatsGet().then(r => r.data),
    revenueData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      revenue: Math.floor(Math.random() * 5000000) + 2000000,
      orders: Math.floor(Math.random() * 30) + 10,
      lastPeriodRevenue: Math.floor(Math.random() * 4000000) + 1500000
    })),
    categoryData: mockCategories.map(cat => ({
      name: cat.name,
      value: Math.floor(Math.random() * 15000000) + 5000000
    })),
    topProducts: mockProducts.slice(0, 5).map(p => ({
      ...p,
      soldCount: Math.floor(Math.random() * 100) + 20,
      revenue: p.price * (Math.floor(Math.random() * 100) + 20),
      percentage: Math.floor(Math.random() * 100)
    }))
  };
  
  return { data: reportData };
};

const handleOrderCreate = async (data) => {
  const newOrder = {
    id: `ORD-${Date.now()}-${orderIdCounter++}`,
    ...data,
    created_at: new Date().toISOString(),
    status: data.status || 'completed',
    total: data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };
  
  mockOrders.push(newOrder);
  
  // Update product stock
  data.items.forEach(item => {
    const product = mockProducts.find(p => p.id === item.product_id);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
    }
  });
  
  return { data: newOrder };
};

const handleProductCreate = async (data) => {
  const newProduct = {
    id: Math.max(...mockProducts.map(p => p.id)) + 1,
    ...data,
    created_at: new Date().toISOString(),
    barcode: data.barcode || apiHelpers.generateBarcode(),
    sku: data.sku || apiHelpers.generateSKU()
  };
  
  mockProducts.push(newProduct);
  return { data: newProduct };
};

const handleProductUpdate = async (endpoint, data) => {
  const productId = parseInt(endpoint.split('/').pop());
  const productIndex = mockProducts.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    throw new Error('Product not found');
  }
  
  mockProducts[productIndex] = {
    ...mockProducts[productIndex],
    ...data,
    updated_at: new Date().toISOString()
  };
  
  return { data: mockProducts[productIndex] };
};

const handleProductDelete = async (endpoint) => {
  const productId = parseInt(endpoint.split('/').pop());
  const productIndex = mockProducts.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    throw new Error('Product not found');
  }
  
  const deletedProduct = mockProducts.splice(productIndex, 1)[0];
  return { data: deletedProduct };
};

const handleLogin = async (data) => {
  // Mock authentication
  const { username, password } = data;
  
  // Simulate authentication logic
  const users = [
    { id: 1, username: 'admin', password: 'admin123', role: 'ADMIN', name: 'Quản trị viên' },
    { id: 2, username: 'cashier', password: 'cashier123', role: 'CASHIER', name: 'Thu ngân' },
    { id: 3, username: 'staff', password: 'staff123', role: 'STAFF', name: 'Nhân viên' }
  ];
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
  }
  
  const token = `token_${user.id}_${Date.now()}`;
  
  return {
    data: {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      token
    }
  };
};

// Clear related cache entries
const clearRelatedCache = (endpoint) => {
  const keysToDelete = [];
  
  for (const key of cache.keys()) {
    if (key.includes('/products') || key.includes('/orders') || key.includes('/stats')) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => cache.delete(key));
};

// Enhanced API helper functions
export const apiHelpers = {
  // Error handler
  handleError: (error) => {
    return handleApiError(error, 'unknown');
  },
  
  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  },
  
  // Format date
  formatDate: (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  },
  
  // Generate barcode
  generateBarcode: () => {
    return Math.floor(Math.random() * 9000000000000) + 1000000000000;
  },
  
  // Generate SKU
  generateSKU: (prefix = 'PRD') => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  },
  
  // Validate data
  validateProduct: (product) => {
    const errors = [];
    
    if (!product.name || product.name.trim().length < 2) {
      errors.push('Tên sản phẩm phải có ít nhất 2 ký tự');
    }
    
    if (!product.price || product.price <= 0) {
      errors.push('Giá sản phẩm phải lớn hơn 0');
    }
    
    if (product.stock < 0) {
      errors.push('Số lượng tồn kho không thể âm');
    }
    
    if (!product.category || product.category.trim().length === 0) {
      errors.push('Danh mục sản phẩm là bắt buộc');
    }
    
    return errors;
  },
  
  // Cache management
  clearCache: () => {
    cache.clear();
    toast.success('Đã xóa cache thành công');
  },
  
  // Get cache stats
  getCacheStats: () => {
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
      totalSize: JSON.stringify(Array.from(cache.entries())).length
    };
  },
  
  // Get performance stats
  getPerformanceStats: () => {
    try {
      const perfData = JSON.parse(localStorage.getItem('apiPerformance') || '[]');
      const errorData = JSON.parse(localStorage.getItem('apiErrors') || '[]');
      
      return {
        totalRequests: perfData.length,
        averageResponseTime: perfData.length > 0 
          ? perfData.reduce((sum, req) => sum + req.duration, 0) / perfData.length 
          : 0,
        errorRate: perfData.length > 0 ? (errorData.length / perfData.length) * 100 : 0,
        slowRequests: perfData.filter(req => req.duration > 2000).length,
        recentErrors: errorData.slice(-10)
      };
    } catch (e) {
      return { error: 'Failed to get performance stats' };
    }
  }
};

// Export default for convenience
export default api; 