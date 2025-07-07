import { api } from './api';

// Unified Commerce Service
export class CommerceService {
  constructor() {
    this.channels = {
      POS: 'pos',
      SHOPEE: 'shopee',
      LAZADA: 'lazada',
      TIKI: 'tiki',
      WEBSITE: 'website',
      FACEBOOK: 'facebook'
    };
    
    this.orderStatuses = {
      PENDING: 'pending',
      CONFIRMED: 'confirmed',
      PROCESSING: 'processing',
      SHIPPED: 'shipped',
      DELIVERED: 'delivered',
      CANCELLED: 'cancelled',
      RETURNED: 'returned'
    };
  }

  // ======================
  // INVENTORY MANAGEMENT
  // ======================

  async syncInventoryAcrossChannels(productId, quantity) {
    try {
      const channels = Object.values(this.channels);
      const syncPromises = channels.map(channel => 
        this.updateChannelInventory(channel, productId, quantity)
      );
      
      const results = await Promise.allSettled(syncPromises);
      
      return {
        success: true,
        results: results.map((result, index) => ({
          channel: channels[index],
          status: result.status,
          data: result.value,
          error: result.reason
        }))
      };
    } catch (error) {
      console.error('Inventory sync error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateChannelInventory(channel, productId, quantity) {
    switch (channel) {
      case this.channels.POS:
        return this.updatePOSInventory(productId, quantity);
      case this.channels.SHOPEE:
        return this.updateShopeeInventory(productId, quantity);
      case this.channels.LAZADA:
        return this.updateLazadaInventory(productId, quantity);
      case this.channels.TIKI:
        return this.updateTikiInventory(productId, quantity);
      default:
        return this.updateWebsiteInventory(productId, quantity);
    }
  }

  async updatePOSInventory(productId, quantity) {
    return api.put(`/products/${productId}/inventory`, { quantity });
  }

  async updateShopeeInventory(productId, quantity) {
    // Shopee API integration
    return {
      channel: 'shopee',
      productId,
      quantity,
      updated: true,
      timestamp: new Date().toISOString()
    };
  }

  async updateLazadaInventory(productId, quantity) {
    // Lazada API integration
    return {
      channel: 'lazada',
      productId,
      quantity,
      updated: true,
      timestamp: new Date().toISOString()
    };
  }

  async updateTikiInventory(productId, quantity) {
    // Tiki API integration
    return {
      channel: 'tiki',
      productId,
      quantity,
      updated: true,
      timestamp: new Date().toISOString()
    };
  }

  async updateWebsiteInventory(productId, quantity) {
    // Website inventory update
    return api.put(`/website/products/${productId}/inventory`, { quantity });
  }

  // ======================
  // ORDER MANAGEMENT
  // ======================

  async createUnifiedOrder(orderData) {
    const order = {
      id: this.generateOrderId(),
      channel: orderData.channel,
      customer: orderData.customer,
      items: orderData.items,
      total: orderData.total,
      status: this.orderStatuses.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        source: orderData.channel,
        platform: orderData.platform || 'internal',
        externalId: orderData.externalId
      }
    };

    try {
      // Create order in central system
      const centralOrder = await api.post('/orders', order);
      
      // Update inventory across all channels
      await this.processOrderInventory(order.items, 'subtract');
      
      // Sync to other platforms if needed
      await this.syncOrderToChannels(centralOrder.data);
      
      return {
        success: true,
        order: centralOrder.data,
        inventoryUpdated: true
      };
    } catch (error) {
      console.error('Order creation error:', error);
      return { success: false, error: error.message };
    }
  }

  async processOrderInventory(items, operation = 'subtract') {
    const promises = items.map(item => {
      const newQuantity = operation === 'subtract' 
        ? item.currentStock - item.quantity 
        : item.currentStock + item.quantity;
      
      return this.syncInventoryAcrossChannels(item.productId, newQuantity);
    });

    return Promise.allSettled(promises);
  }

  async syncOrderToChannels(order) {
    const promises = Object.values(this.channels)
      .filter(channel => channel !== order.channel)
      .map(channel => this.notifyChannelOfOrder(channel, order));

    return Promise.allSettled(promises);
  }

  async notifyChannelOfOrder(channel, order) {
    // Notify other channels about the order for inventory sync
    return {
      channel,
      orderId: order.id,
      notified: true,
      timestamp: new Date().toISOString()
    };
  }

  // ======================
  // CHANNEL INTEGRATION
  // ======================

  async fetchShopeeOrders(dateRange = {}) {
    // Mock Shopee API integration
    return {
      orders: [
        {
          id: 'SP001',
          channel: this.channels.SHOPEE,
          customer: { name: 'Nguyễn Văn A', phone: '0901234567' },
          items: [
            { productId: 'P001', name: 'Sản phẩm A', quantity: 2, price: 100000 }
          ],
          total: 200000,
          status: this.orderStatuses.CONFIRMED,
          createdAt: new Date().toISOString()
        }
      ],
      total: 1,
      hasMore: false
    };
  }

  async fetchLazadaOrders(dateRange = {}) {
    // Mock Lazada API integration
    return {
      orders: [
        {
          id: 'LZ001',
          channel: this.channels.LAZADA,
          customer: { name: 'Trần Thị B', phone: '0912345678' },
          items: [
            { productId: 'P002', name: 'Sản phẩm B', quantity: 1, price: 150000 }
          ],
          total: 150000,
          status: this.orderStatuses.PROCESSING,
          createdAt: new Date().toISOString()
        }
      ],
      total: 1,
      hasMore: false
    };
  }

  async fetchTikiOrders(dateRange = {}) {
    // Mock Tiki API integration
    return {
      orders: [
        {
          id: 'TK001',
          channel: this.channels.TIKI,
          customer: { name: 'Lê Văn C', phone: '0923456789' },
          items: [
            { productId: 'P003', name: 'Sản phẩm C', quantity: 3, price: 80000 }
          ],
          total: 240000,
          status: this.orderStatuses.SHIPPED,
          createdAt: new Date().toISOString()
        }
      ],
      total: 1,
      hasMore: false
    };
  }

  async fetchAllChannelOrders(dateRange = {}) {
    try {
      const [shopeeOrders, lazadaOrders, tikiOrders, posOrders] = await Promise.allSettled([
        this.fetchShopeeOrders(dateRange),
        this.fetchLazadaOrders(dateRange),
        this.fetchTikiOrders(dateRange),
        api.get('/orders', { params: dateRange })
      ]);

      const allOrders = [];
      
      if (shopeeOrders.status === 'fulfilled') {
        allOrders.push(...shopeeOrders.value.orders);
      }
      
      if (lazadaOrders.status === 'fulfilled') {
        allOrders.push(...lazadaOrders.value.orders);
      }
      
      if (tikiOrders.status === 'fulfilled') {
        allOrders.push(...tikiOrders.value.orders);
      }
      
      if (posOrders.status === 'fulfilled') {
        allOrders.push(...posOrders.value.data.map(order => ({
          ...order,
          channel: this.channels.POS
        })));
      }

      return {
        success: true,
        orders: allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        totalOrders: allOrders.length,
        channels: {
          shopee: shopeeOrders.status === 'fulfilled' ? shopeeOrders.value.orders.length : 0,
          lazada: lazadaOrders.status === 'fulfilled' ? lazadaOrders.value.orders.length : 0,
          tiki: tikiOrders.status === 'fulfilled' ? tikiOrders.value.orders.length : 0,
          pos: posOrders.status === 'fulfilled' ? posOrders.value.data.length : 0
        }
      };
    } catch (error) {
      console.error('Error fetching channel orders:', error);
      return { success: false, error: error.message };
    }
  }

  // ======================
  // PRODUCT SYNC
  // ======================

  async syncProductToChannels(product) {
    const channels = Object.values(this.channels);
    const syncPromises = channels.map(channel => 
      this.syncProductToChannel(channel, product)
    );

    const results = await Promise.allSettled(syncPromises);
    
    return {
      success: true,
      results: results.map((result, index) => ({
        channel: channels[index],
        status: result.status,
        data: result.value,
        error: result.reason
      }))
    };
  }

  async syncProductToChannel(channel, product) {
    switch (channel) {
      case this.channels.SHOPEE:
        return this.syncToShopee(product);
      case this.channels.LAZADA:
        return this.syncToLazada(product);
      case this.channels.TIKI:
        return this.syncToTiki(product);
      case this.channels.WEBSITE:
        return this.syncToWebsite(product);
      default:
        return { channel, synced: true };
    }
  }

  async syncToShopee(product) {
    // Shopee product sync
    return {
      channel: 'shopee',
      productId: product.id,
      externalId: `SP_${product.id}`,
      synced: true,
      url: `https://shopee.vn/product/${product.id}`,
      timestamp: new Date().toISOString()
    };
  }

  async syncToLazada(product) {
    // Lazada product sync
    return {
      channel: 'lazada',
      productId: product.id,
      externalId: `LZ_${product.id}`,
      synced: true,
      url: `https://lazada.vn/products/${product.id}`,
      timestamp: new Date().toISOString()
    };
  }

  async syncToTiki(product) {
    // Tiki product sync
    return {
      channel: 'tiki',
      productId: product.id,
      externalId: `TK_${product.id}`,
      synced: true,
      url: `https://tiki.vn/product/${product.id}`,
      timestamp: new Date().toISOString()
    };
  }

  async syncToWebsite(product) {
    // Website product sync
    return api.post('/website/products', product);
  }

  // ======================
  // ANALYTICS & REPORTING
  // ======================

  async getChannelPerformance(dateRange = {}) {
    try {
      const orders = await this.fetchAllChannelOrders(dateRange);
      
      if (!orders.success) {
        throw new Error(orders.error);
      }

      const channelStats = {};
      
      Object.values(this.channels).forEach(channel => {
        const channelOrders = orders.orders.filter(order => order.channel === channel);
        const revenue = channelOrders.reduce((sum, order) => sum + order.total, 0);
        const avgOrderValue = channelOrders.length > 0 ? revenue / channelOrders.length : 0;
        
        channelStats[channel] = {
          orders: channelOrders.length,
          revenue,
          avgOrderValue,
          conversionRate: this.calculateConversionRate(channel, channelOrders.length),
          topProducts: this.getTopProductsByChannel(channelOrders)
        };
      });

      return {
        success: true,
        performance: channelStats,
        totalRevenue: Object.values(channelStats).reduce((sum, stats) => sum + stats.revenue, 0),
        totalOrders: Object.values(channelStats).reduce((sum, stats) => sum + stats.orders, 0)
      };
    } catch (error) {
      console.error('Channel performance error:', error);
      return { success: false, error: error.message };
    }
  }

  calculateConversionRate(channel, orders) {
    // Mock conversion rate calculation
    const baseRates = {
      [this.channels.POS]: 0.95,
      [this.channels.SHOPEE]: 0.15,
      [this.channels.LAZADA]: 0.12,
      [this.channels.TIKI]: 0.18,
      [this.channels.WEBSITE]: 0.25,
      [this.channels.FACEBOOK]: 0.08
    };
    
    return baseRates[channel] || 0.1;
  }

  getTopProductsByChannel(orders) {
    const productStats = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            id: item.productId,
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        
        productStats[item.productId].quantity += item.quantity;
        productStats[item.productId].revenue += item.price * item.quantity;
      });
    });

    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  // ======================
  // UTILITY METHODS
  // ======================

  generateOrderId() {
    return `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getChannelDisplayName(channel) {
    const displayNames = {
      [this.channels.POS]: 'Điểm bán hàng',
      [this.channels.SHOPEE]: 'Shopee',
      [this.channels.LAZADA]: 'Lazada',
      [this.channels.TIKI]: 'Tiki',
      [this.channels.WEBSITE]: 'Website',
      [this.channels.FACEBOOK]: 'Facebook'
    };
    
    return displayNames[channel] || channel;
  }

  getChannelIcon(channel) {
    const icons = {
      [this.channels.POS]: '🏪',
      [this.channels.SHOPEE]: '🛒',
      [this.channels.LAZADA]: '🛍️',
      [this.channels.TIKI]: '📦',
      [this.channels.WEBSITE]: '🌐',
      [this.channels.FACEBOOK]: '📘'
    };
    
    return icons[channel] || '📱';
  }

  getStatusDisplayName(status) {
    const displayNames = {
      [this.orderStatuses.PENDING]: 'Chờ xử lý',
      [this.orderStatuses.CONFIRMED]: 'Đã xác nhận',
      [this.orderStatuses.PROCESSING]: 'Đang xử lý',
      [this.orderStatuses.SHIPPED]: 'Đã gửi hàng',
      [this.orderStatuses.DELIVERED]: 'Đã giao hàng',
      [this.orderStatuses.CANCELLED]: 'Đã hủy',
      [this.orderStatuses.RETURNED]: 'Đã trả hàng'
    };
    
    return displayNames[status] || status;
  }
}

// Create singleton instance
export const commerceService = new CommerceService();

// Export individual methods for convenience
export const {
  syncInventoryAcrossChannels,
  createUnifiedOrder,
  fetchAllChannelOrders,
  syncProductToChannels,
  getChannelPerformance
} = commerceService; 