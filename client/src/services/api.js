// Enhanced API Service with fixed authentication
class APIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'https://pos-backend.bangachieu2.workers.dev/api';
    this.token = localStorage.getItem('auth_token');
    this.tokenExpiry = localStorage.getItem('token_expiry');
  }

  setToken(token, expiresIn = '24h') {
    this.token = token;
    // Set expiry time - 24 hours from now
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
    this.tokenExpiry = expiryTime.toString();
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token_expiry', this.tokenExpiry);
  }

  clearToken() {
    this.token = null;
    this.tokenExpiry = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('auth_user');
  }

  getAuthHeader() {
    // Ensure token is valid and not undefined
    if (!this.token || this.token === 'undefined' || this.token === 'null') {
      return null;
    }
    return `Bearer ${this.token}`;
  }

  isTokenValid() {
    if (!this.token || !this.tokenExpiry) return false;
    
    // Check if token is not undefined/null strings
    if (this.token === 'undefined' || this.token === 'null') {
      this.clearToken();
      return false;
    }
    
    const now = Date.now();
    const expiry = parseInt(this.tokenExpiry);
    
    // Check if token expires in next 5 minutes
    if (expiry <= (now + 5 * 60 * 1000)) {
      this.clearToken();
      return false;
    }
    
    return true;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add auth header if available and valid (but not for login endpoint)
    if (endpoint !== '/auth/login' && this.isTokenValid()) {
      const authHeader = this.getAuthHeader();
      if (authHeader) {
        config.headers.Authorization = authHeader;
      }
    }

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { success: false, message: 'Invalid response format' };
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token and redirect to login
          this.clearToken();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          throw new Error('Session expired');
        }
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server');
      }
      
      throw error;
    }
  }

  async login(username, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      if (response.success) {
        this.setToken(response.data.token, response.data.expiresIn);
        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
        return response;
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      if (this.isTokenValid()) {
        await this.request('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  async getProductSerialNumbers(productId) {
    return this.request(`/products/${productId}/serial-numbers`);
  }

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/orders${query ? `?${query}` : ''}`);
  }

  async getCustomers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/customers${query ? `?${query}` : ''}`);
  }

  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users${query ? `?${query}` : ''}`);
  }

  async getStats() {
    return this.request('/orders/stats/summary');
  }

  // Utility methods
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('auth_user');
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  isAuthenticated() {
    return this.isTokenValid() && this.getCurrentUser() !== null;
  }
}

export const api = new APIService();
export default api;

// Export utility functions
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(new Date(date));
};

export const downloadReport = async (reportType, params = {}) => {
  try {
    const response = await api.get(`/reports/${reportType}/download`, {
      params,
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
};

// Export individual functions that are commonly used
export const getDashboardStats = () => api.get('/orders/stats/summary');
export const getBestSelling = (params = {}) => api.get('/reports/best-selling', { params });
export const getProfitReport = (params = {}) => api.get('/reports/profit-loss', { params });
export const getSalesReport = (params = {}) => api.get('/reports/sales', { params });
export const getCategoryStats = (params = {}) => api.get('/reports/category-stats', { params });
export const getCustomerStats = (params = {}) => api.get('/reports/customer-stats', { params }); 

export const reportsAPI = {
  getSalesReport: (params = {}) => api.get('/reports/sales', { params }),
  getBestSellingProducts: (params = {}) => api.get('/reports/best-selling', { params }),
  getFinancialSummary: (params = {}) => api.get('/reports/financial-summary', { params }),
  getCategoryStats: (params = {}) => api.get('/reports/category-stats', { params }),
  getCustomerStats: (params = {}) => api.get('/reports/customer-stats', { params }),
  getProfitLoss: (params = {}) => api.get('/reports/profit-loss', { params }),
  getDashboardStats: () => api.get('/orders/stats/summary'),
  getBestSelling: (params = {}) => api.get('/reports/best-selling', { params }),
  getProfitReport: (params = {}) => api.get('/reports/profit-loss', { params })
};

export const customersAPI = {
  getAll: (params = {}) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`)
};

export const suppliersAPI = {
  getAll: (params = {}) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`)
}; 

export const financialAPI = {
  getTransactions: (params = {}) => api.get('/financial/transactions', { params }),
  create: (data) => api.post('/financial/transactions', data),
  createTransaction: (data) => api.post('/financial/transactions', data)
};

export const categoriesAPI = {
  getAll: (params = {}) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getSerials: (id, params = {}) => api.get(`/products/${id}/serials`, { params }),
  addSerials: (id, data) => api.post(`/products/${id}/serials`, data),
  updateSerial: (serialId, data) => api.put(`/serials/${serialId}`, data),
  deleteSerial: (serialId) => api.delete(`/serials/${serialId}`),
  searchSerials: (params = {}) => api.get('/serials/search', { params }),
  getWarrantyInfo: (serialNumber) => api.get(`/serials/${serialNumber}/warranty`),
  sellSerials: (data) => api.post('/serials/sell', data),
  getSoldSerials: (params = {}) => api.get('/serials/sold', { params })
};

export const inventoryAPI = {
  getTransactions: (params = {}) => api.get('/inventory/transactions', { params }),
  createAdjustment: (data) => api.post('/inventory/adjustment', data)
};

export const ordersAPI = {
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  getStats: () => api.get('/orders/stats/summary')
};

export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  login: (credentials) => api.post('/auth/login', credentials)
};

export const warrantyAPI = {
  getClaims: (params = {}) => api.get('/warranty/claims', { params }),
  getClaimById: (id) => api.get(`/warranty/claims/${id}`),
  createClaim: (data) => api.post('/warranty/claims', data),
  updateClaim: (id, data) => api.put(`/warranty/claims/${id}`, data),
  getStats: () => api.get('/warranty/stats'),
  searchBySerial: (serialNumber) => api.get(`/warranty/search/${serialNumber}`)
};

export const serialsAPI = {
  search: (query, params = {}) => api.get('/serials/search', { params: { q: query, ...params } }),
  getList: (params = {}) => api.get('/serials/list', { params }),
  getByProduct: (productId, params = {}) => api.get(`/products/${productId}/serials`, { params }),
  getWarrantyInfo: (serialNumber) => api.get(`/serials/${serialNumber}/warranty`),
  addSerials: (productId, serialsData) => api.post(`/products/${productId}/serials`, { serials: serialsData }),
  updateSerial: (id, data) => api.put(`/serials/${id}`, data),
  deleteSerial: (id) => api.delete(`/serials/${id}`),
  sellSerials: (data) => api.post('/serials/sell', data),
  getSoldHistory: (params = {}) => api.get('/serials/sold', { params }),
  warrantySearch: (query) => api.get('/serials/search', { params: { q: query, status: 'all', limit: 100 } })
};