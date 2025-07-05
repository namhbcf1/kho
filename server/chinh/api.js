import axios from 'axios';

const api = axios.create({
  baseURL: "https://pos-backend-v2.bangachieu2.workers.dev/api",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

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
  getWarrantyInfo: (serialNumber) => api.get(`/serials/${serialNumber}/warranty`),
  addSerials: (productId, serialsData) => api.post(`/products/${productId}/serials`, { serials: serialsData }),
  updateSerial: (id, data) => api.put(`/serials/${id}`, data),
  deleteSerial: (id) => api.delete(`/serials/${id}`),
  sellSerials: (data) => api.post('/serials/sell', data),
  getSoldHistory: (params = {}) => api.get('/serials/sold', { params }),
  warrantySearch: (query) => api.get('/serials/search', { params: { q: query, status: 'all', limit: 100 } })
};