import { Hono } from 'hono'
import { requireRole } from '../middleware/auth.js'
import { userRateLimiter } from '../middleware/rateLimiter.js'

const dashboard = new Hono()

// ================================
// DASHBOARD ANALYTICS
// ================================

// Get dashboard overview
dashboard.get('/overview', 
  userRateLimiter({ max: 100 }),
  async (c) => {
    try {
      const { period = 'today' } = c.req.query()
      
      // Date filters
      let dateFilter = ''
      let dateParams = []
      
      if (period === 'today') {
        dateFilter = `AND DATE(created_at) = DATE('now')`
      } else if (period === 'week') {
        dateFilter = `AND DATE(created_at) >= DATE('now', '-7 days')`
      } else if (period === 'month') {
        dateFilter = `AND DATE(created_at) >= DATE('now', '-30 days')`
      } else if (period === 'year') {
        dateFilter = `AND DATE(created_at) >= DATE('now', '-365 days')`
      }
      
      // Get sales summary
      const salesSummary = await c.env.DB.prepare(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) as total_revenue,
          AVG(CASE WHEN status = 'completed' THEN total ELSE NULL END) as avg_order_value,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
        FROM orders 
        WHERE 1=1 ${dateFilter}
      `).first()
      
      // Get product summary
      const productSummary = await c.env.DB.prepare(`
        SELECT 
          COUNT(*) as total_products,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_products,
          COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock,
          COUNT(CASE WHEN quantity > 0 AND quantity <= COALESCE(min_quantity, 5) THEN 1 END) as low_stock
        FROM products
      `).first()
      
      // Get customer summary
      const customerSummary = await c.env.DB.prepare(`
        SELECT 
          COUNT(*) as total_customers,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_customers
        FROM customers
      `).first()
      
      // Get recent orders
      const recentOrders = await c.env.DB.prepare(`
        SELECT 
          o.id, o.customer_name, o.total, o.status, o.created_at,
          u.name as cashier_name
        FROM orders o
        LEFT JOIN users u ON o.cashier_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 10
      `).all()
      
      // Get top products
      const topProducts = await c.env.DB.prepare(`
        SELECT 
          p.name, p.sku,
          SUM(oi.quantity) as total_sold,
          SUM(oi.subtotal) as total_revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE o.status = 'completed' ${dateFilter.replace('created_at', 'o.created_at')}
        GROUP BY p.id, p.name, p.sku
        ORDER BY total_sold DESC
        LIMIT 5
      `).all()
      
      // Get sales trend (last 7 days)
      const salesTrend = await c.env.DB.prepare(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as orders,
          SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) as revenue
        FROM orders
        WHERE DATE(created_at) >= DATE('now', '-7 days')
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `).all()

      return c.json({
        success: true,
        data: {
          summary: {
            sales: {
              totalOrders: salesSummary?.total_orders || 0,
              totalRevenue: salesSummary?.total_revenue || 0,
              avgOrderValue: salesSummary?.avg_order_value || 0,
              completedOrders: salesSummary?.completed_orders || 0,
              pendingOrders: salesSummary?.pending_orders || 0,
              cancelledOrders: salesSummary?.cancelled_orders || 0
            },
            products: {
              totalProducts: productSummary?.total_products || 0,
              activeProducts: productSummary?.active_products || 0,
              outOfStock: productSummary?.out_of_stock || 0,
              lowStock: productSummary?.low_stock || 0
            },
            customers: {
              totalCustomers: customerSummary?.total_customers || 0,
              activeCustomers: customerSummary?.active_customers || 0
            }
          },
          recentOrders: recentOrders.results || [],
          topProducts: topProducts.results || [],
          salesTrend: salesTrend.results || [],
          period
        }
      })

    } catch (error) {
      console.error('Dashboard overview error:', error)
      throw new Error('Failed to fetch dashboard data')
    }
  }
)

// Get sales analytics
dashboard.get('/sales-analytics', 
  requireRole('manager'),
  async (c) => {
    try {
      const { period = 'month', groupBy = 'day' } = c.req.query()
      
      // Date filters
      let dateFilter = ''
      let dateFormat = ''
      
      if (period === 'week') {
        dateFilter = `AND DATE(created_at) >= DATE('now', '-7 days')`
        dateFormat = `DATE(created_at)`
      } else if (period === 'month') {
        dateFilter = `AND DATE(created_at) >= DATE('now', '-30 days')`
        dateFormat = groupBy === 'week' ? `strftime('%Y-W%W', created_at)` : `DATE(created_at)`
      } else if (period === 'year') {
        dateFilter = `AND DATE(created_at) >= DATE('now', '-365 days')`
        dateFormat = groupBy === 'month' ? `strftime('%Y-%m', created_at)` : `DATE(created_at)`
      }
      
      // Sales by period
      const salesByPeriod = await c.env.DB.prepare(`
        SELECT 
          ${dateFormat} as period,
          COUNT(*) as orders,
          SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) as revenue,
          AVG(CASE WHEN status = 'completed' THEN total ELSE NULL END) as avg_order_value
        FROM orders
        WHERE 1=1 ${dateFilter}
        GROUP BY ${dateFormat}
        ORDER BY period ASC
      `).all()
      
      // Sales by payment method
      const salesByPayment = await c.env.DB.prepare(`
        SELECT 
          payment_method,
          COUNT(*) as orders,
          SUM(total) as revenue,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM orders WHERE status = 'completed' ${dateFilter}), 2) as percentage
        FROM orders
        WHERE status = 'completed' ${dateFilter}
        GROUP BY payment_method
        ORDER BY revenue DESC
      `).all()
      
      // Sales by hour (for today)
      const salesByHour = await c.env.DB.prepare(`
        SELECT 
          strftime('%H', created_at) as hour,
          COUNT(*) as orders,
          SUM(total) as revenue
        FROM orders
        WHERE status = 'completed' AND DATE(created_at) = DATE('now')
        GROUP BY strftime('%H', created_at)
        ORDER BY hour ASC
      `).all()
      
      // Top customers by revenue
      const topCustomers = await c.env.DB.prepare(`
        SELECT 
          customer_name,
          customer_phone,
          COUNT(*) as total_orders,
          SUM(total) as total_spent,
          AVG(total) as avg_order_value
        FROM orders
        WHERE status = 'completed' ${dateFilter}
        GROUP BY customer_name, customer_phone
        ORDER BY total_spent DESC
        LIMIT 10
      `).all()

      return c.json({
        success: true,
        data: {
          salesByPeriod: salesByPeriod.results || [],
          salesByPayment: salesByPayment.results || [],
          salesByHour: salesByHour.results || [],
          topCustomers: topCustomers.results || [],
          period,
          groupBy
        }
      })

    } catch (error) {
      console.error('Sales analytics error:', error)
      throw new Error('Failed to fetch sales analytics')
    }
  }
)

// Get inventory analytics
dashboard.get('/inventory-analytics', 
  requireRole('manager'),
  async (c) => {
    try {
      // Low stock products
      const lowStockProducts = await c.env.DB.prepare(`
        SELECT 
          name, sku, quantity, min_quantity, category,
          CASE 
            WHEN quantity = 0 THEN 'out_of_stock'
            WHEN quantity <= COALESCE(min_quantity, 5) THEN 'low_stock'
            ELSE 'in_stock'
          END as stock_status
        FROM products
        WHERE is_active = 1 AND (quantity = 0 OR quantity <= COALESCE(min_quantity, 5))
        ORDER BY quantity ASC
      `).all()
      
      // Stock value by category
      const stockByCategory = await c.env.DB.prepare(`
        SELECT 
          category,
          COUNT(*) as product_count,
          SUM(quantity) as total_quantity,
          SUM(quantity * COALESCE(cost, price)) as total_value
        FROM products
        WHERE is_active = 1
        GROUP BY category
        ORDER BY total_value DESC
      `).all()
      
      // Fast moving products (last 30 days)
      const fastMovingProducts = await c.env.DB.prepare(`
        SELECT 
          p.name, p.sku, p.category,
          SUM(oi.quantity) as total_sold,
          ROUND(SUM(oi.quantity) / 30.0, 2) as daily_avg_sold,
          p.quantity as current_stock
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE o.status = 'completed' AND DATE(o.created_at) >= DATE('now', '-30 days')
        GROUP BY p.id, p.name, p.sku, p.category, p.quantity
        ORDER BY total_sold DESC
        LIMIT 10
      `).all()
      
      // Slow moving products (last 90 days)
      const slowMovingProducts = await c.env.DB.prepare(`
        SELECT 
          p.name, p.sku, p.category, p.quantity,
          COALESCE(SUM(oi.quantity), 0) as total_sold,
          p.created_at
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'completed' AND DATE(o.created_at) >= DATE('now', '-90 days')
        WHERE p.is_active = 1 AND p.quantity > 0
        GROUP BY p.id, p.name, p.sku, p.category, p.quantity, p.created_at
        HAVING total_sold <= 1
        ORDER BY total_sold ASC, p.created_at ASC
        LIMIT 10
      `).all()

      return c.json({
        success: true,
        data: {
          lowStockProducts: lowStockProducts.results || [],
          stockByCategory: stockByCategory.results || [],
          fastMovingProducts: fastMovingProducts.results || [],
          slowMovingProducts: slowMovingProducts.results || []
        }
      })

    } catch (error) {
      console.error('Inventory analytics error:', error)
      throw new Error('Failed to fetch inventory analytics')
    }
  }
)

// Get financial summary
dashboard.get('/financial-summary', 
  requireRole('admin'),
  async (c) => {
    try {
      const { period = 'month' } = c.req.query()
      
      let dateFilter = ''
      if (period === 'today') {
        dateFilter = `AND DATE(created_at) = DATE('now')`
      } else if (period === 'week') {
        dateFilter = `AND DATE(created_at) >= DATE('now', '-7 days')`
      } else if (period === 'month') {
        dateFilter = `AND DATE(created_at) >= DATE('now', '-30 days')`
      } else if (period === 'year') {
        dateFilter = `AND DATE(created_at) >= DATE('now', '-365 days')`
      }
      
      // Revenue and profit analysis
      const financialSummary = await c.env.DB.prepare(`
        SELECT 
          SUM(CASE WHEN o.status = 'completed' THEN o.total ELSE 0 END) as total_revenue,
          SUM(CASE WHEN o.status = 'completed' THEN o.subtotal ELSE 0 END) as gross_revenue,
          SUM(CASE WHEN o.status = 'completed' THEN o.discount_amount ELSE 0 END) as total_discounts,
          SUM(CASE WHEN o.status = 'completed' THEN o.tax_amount ELSE 0 END) as total_taxes,
          COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders
        FROM orders o
        WHERE 1=1 ${dateFilter}
      `).first()
      
      // Calculate estimated cost and profit
      const profitAnalysis = await c.env.DB.prepare(`
        SELECT 
          SUM(oi.quantity * COALESCE(p.cost, p.price * 0.6)) as estimated_cost,
          SUM(oi.subtotal) as total_sales
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE o.status = 'completed' ${dateFilter.replace('created_at', 'o.created_at')}
      `).first()
      
      // Payment method breakdown
      const paymentBreakdown = await c.env.DB.prepare(`
        SELECT 
          payment_method,
          COUNT(*) as transaction_count,
          SUM(total) as total_amount,
          ROUND(AVG(total), 2) as avg_transaction
        FROM orders
        WHERE status = 'completed' ${dateFilter}
        GROUP BY payment_method
        ORDER BY total_amount DESC
      `).all()
      
      // Daily revenue trend
      const revenueTrend = await c.env.DB.prepare(`
        SELECT 
          DATE(created_at) as date,
          SUM(total) as revenue,
          COUNT(*) as orders
        FROM orders
        WHERE status = 'completed' ${dateFilter}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `).all()
      
      // Calculate profit margin
      const estimatedCost = profitAnalysis?.estimated_cost || 0
      const totalSales = profitAnalysis?.total_sales || 0
      const estimatedProfit = totalSales - estimatedCost
      const profitMargin = totalSales > 0 ? (estimatedProfit / totalSales) * 100 : 0

      return c.json({
        success: true,
        data: {
          summary: {
            totalRevenue: financialSummary?.total_revenue || 0,
            grossRevenue: financialSummary?.gross_revenue || 0,
            totalDiscounts: financialSummary?.total_discounts || 0,
            totalTaxes: financialSummary?.total_taxes || 0,
            completedOrders: financialSummary?.completed_orders || 0,
            estimatedCost: estimatedCost,
            estimatedProfit: estimatedProfit,
            profitMargin: Math.round(profitMargin * 100) / 100
          },
          paymentBreakdown: paymentBreakdown.results || [],
          revenueTrend: revenueTrend.results || [],
          period
        }
      })

    } catch (error) {
      console.error('Financial summary error:', error)
      throw new Error('Failed to fetch financial summary')
    }
  }
)

// Get user activity
dashboard.get('/user-activity', 
  requireRole('admin'),
  async (c) => {
    try {
      // Active users (users who made orders in last 30 days)
      const activeUsers = await c.env.DB.prepare(`
        SELECT 
          u.id, u.name, u.email, u.role,
          COUNT(o.id) as orders_count,
          SUM(o.total) as total_sales,
          MAX(o.created_at) as last_order_date
        FROM users u
        LEFT JOIN orders o ON u.id = o.cashier_id AND o.created_at >= DATE('now', '-30 days')
        GROUP BY u.id, u.name, u.email, u.role
        ORDER BY orders_count DESC
      `).all()
      
      // Login activity (if we had login tracking)
      const loginActivity = await c.env.DB.prepare(`
        SELECT 
          u.name, u.email, u.last_login_at
        FROM users u
        WHERE u.last_login_at IS NOT NULL
        ORDER BY u.last_login_at DESC
        LIMIT 10
      `).all()

      return c.json({
        success: true,
        data: {
          activeUsers: activeUsers.results || [],
          loginActivity: loginActivity.results || []
        }
      })

    } catch (error) {
      console.error('User activity error:', error)
      throw new Error('Failed to fetch user activity')
    }
  }
)

export default dashboard 