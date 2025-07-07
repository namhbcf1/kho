const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://pos-computer-store-backend.bangachieu2.workers.dev/api'

class API {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    }

    // Handle FormData (for file uploads)
    if (config.body instanceof FormData) {
      delete config.headers['Content-Type']; // Let browser set it
    } else if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // HTTP method helpers
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`${endpoint}${queryString ? `?${queryString}` : ''}`);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials
    })
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats')
  }

  async getAdvancedDashboardStats() {
    return this.request('/dashboard/advanced-stats')
  }

  // Categories
  async getCategories() {
    return this.request('/categories')
  }

  async createCategory(data) {
    return this.request('/categories', {
      method: 'POST',
      body: data
    })
  }

  // Brands
  async getBrands() {
    return this.request('/brands')
  }

  async createBrand(data) {
    return this.request('/brands', {
      method: 'POST',
      body: data
    })
  }

  // Suppliers
  async getSuppliers(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/suppliers${queryString ? `?${queryString}` : ''}`)
  }

  async createSupplier(data) {
    return this.request('/suppliers', {
      method: 'POST',
      body: data
    })
  }

  async updateSupplier(id, data) {
    return this.request(`/suppliers/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  async deleteSupplier(id) {
    return this.request(`/suppliers/${id}`, {
      method: 'DELETE'
    })
  }

  // Inventory Locations
  async getInventoryLocations(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/inventory-locations${queryString ? `?${queryString}` : ''}`)
  }

  async createInventoryLocation(data) {
    return this.request('/inventory-locations', {
      method: 'POST',
      body: data
    })
  }

  // Serial Numbers
  async getSerialNumbers(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/serial-numbers${queryString ? `?${queryString}` : ''}`)
  }

  async createSerialNumber(data) {
    return this.request('/serial-numbers', {
      method: 'POST',
      body: data
    })
  }

  async updateSerialNumber(id, data) {
    return this.request(`/serial-numbers/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  async deleteSerialNumber(id) {
    return this.request(`/serial-numbers/${id}`, {
      method: 'DELETE'
    })
  }

  // Warranty Claims
  async getWarrantyClaims(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/warranty-claims${queryString ? `?${queryString}` : ''}`)
  }

  async createWarrantyClaim(data) {
    return this.request('/warranty-claims', {
      method: 'POST',
      body: data
    })
  }

  async updateWarrantyClaim(id, data) {
    return this.request(`/warranty-claims/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  // Products
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/products${queryString ? `?${queryString}` : ''}`)
  }

  async createProduct(data) {
    return this.request('/products', {
      method: 'POST',
      body: data
    })
  }

  async updateProduct(id, data) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    })
  }

  // Customers
  async getCustomers(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/customers${queryString ? `?${queryString}` : ''}`)
  }

  async createCustomer(data) {
    return this.request('/customers', {
      method: 'POST',
      body: data
    })
  }

  async updateCustomer(id, data) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  async deleteCustomer(id) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE'
    })
  }

  // Orders
  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/orders${queryString ? `?${queryString}` : ''}`)
  }

  async createOrder(data) {
    return this.request('/orders', {
      method: 'POST',
      body: data
    })
  }

  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: { status }
    })
  }

  async deleteOrder(id) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE'
    })
  }

  // Stock movements
  async getStockMovements(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/stock-movements${queryString ? `?${queryString}` : ''}`)
  }

  async createStockMovement(data) {
    return this.request('/stock-movements', {
      method: 'POST',
      body: data
    })
  }

  // Users
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/users${queryString ? `?${queryString}` : ''}`)
  }

  async createUser(data) {
    return this.request('/users', {
      method: 'POST',
      body: data
    })
  }

  async updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  async resetUserPassword(id, newPassword) {
    return this.request(`/users/${id}/reset-password`, {
      method: 'POST',
      body: { password: newPassword }
    })
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    })
  }
}

const api = new API()
export { api }
export default api 