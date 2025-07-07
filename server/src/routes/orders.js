import { Hono } from 'hono'
import { z } from 'zod'
import { validateInput, NotFoundError, ValidationError } from '../middleware/errorHandler.js'
import { requireRole } from '../middleware/auth.js'
import { userRateLimiter } from '../middleware/rateLimiter.js'

const orders = new Hono()

// ================================
// VALIDATION SCHEMAS
// ================================
const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  serialNumbers: z.array(z.string()).optional()
})

const orderSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  subtotal: z.number().positive(),
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  total: z.number().positive(),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'mixed']).default('cash'),
  receivedAmount: z.number().positive(),
  changeAmount: z.number().min(0).default(0),
  note: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']).default('completed')
})

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled']),
  note: z.string().optional()
})

// ================================
// ORDERS CRUD OPERATIONS
// ================================

// Get all orders with filtering and pagination
orders.get('/', 
  userRateLimiter({ max: 500 }),
  async (c) => {
    try {
      const query = c.req.query()
      const page = parseInt(query.page) || 1
      const limit = Math.min(parseInt(query.limit) || 20, 100)
      const status = query.status
      const customerId = query.customerId
      const fromDate = query.fromDate
      const toDate = query.toDate
      const sortBy = query.sortBy || 'created_at'
      const sortOrder = query.sortOrder || 'desc'

      // Build SQL query
      let sql = `
        SELECT 
          o.id, o.customer_id, o.customer_name, o.customer_phone, o.customer_email,
          o.subtotal, o.discount_percent, o.discount_amount, o.tax_amount, o.total,
          o.payment_method, o.received_amount, o.change_amount, o.note, o.status,
          o.cashier_id, o.created_at, o.updated_at,
          u.name as cashier_name
        FROM orders o
        LEFT JOIN users u ON o.cashier_id = u.id
        WHERE 1=1
      `
      const sqlParams = []

      // Add filters
      if (status) {
        sql += ` AND o.status = ?`
        sqlParams.push(status)
      }

      if (customerId) {
        sql += ` AND o.customer_id = ?`
        sqlParams.push(customerId)
      }

      if (fromDate) {
        sql += ` AND DATE(o.created_at) >= ?`
        sqlParams.push(fromDate)
      }

      if (toDate) {
        sql += ` AND DATE(o.created_at) <= ?`
        sqlParams.push(toDate)
      }

      // Add sorting
      const allowedSortFields = ['created_at', 'total', 'status', 'customer_name']
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at'
      const validSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder.toUpperCase() : 'DESC'
      
      sql += ` ORDER BY o.${validSortBy} ${validSortOrder}`

      // Add pagination
      const offset = (page - 1) * limit
      sql += ` LIMIT ? OFFSET ?`
      sqlParams.push(limit, offset)

      // Execute query
      const result = await c.env.DB.prepare(sql).bind(...sqlParams).all()
      
      // Get total count
      let countSql = `SELECT COUNT(*) as total FROM orders o WHERE 1=1`
      const countParams = []
      
      if (status) {
        countSql += ` AND o.status = ?`
        countParams.push(status)
      }
      
      if (customerId) {
        countSql += ` AND o.customer_id = ?`
        countParams.push(customerId)
      }
      
      if (fromDate) {
        countSql += ` AND DATE(o.created_at) >= ?`
        countParams.push(fromDate)
      }
      
      if (toDate) {
        countSql += ` AND DATE(o.created_at) <= ?`
        countParams.push(toDate)
      }

      const countResult = await c.env.DB.prepare(countSql).bind(...countParams).first()
      const total = countResult?.total || 0

      // Get order items for each order
      const orders = result.results || []
      for (const order of orders) {
        const itemsResult = await c.env.DB.prepare(`
          SELECT 
            oi.product_id, oi.quantity, oi.price, oi.subtotal,
            p.name as product_name, p.sku as product_sku
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `).bind(order.id).all()
        
        order.items = itemsResult.results || []
      }

      return c.json({
        success: true,
        data: {
          orders,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
          }
        }
      })

    } catch (error) {
      console.error('Get orders error:', error)
      throw new Error('Failed to fetch orders')
    }
  }
)

// Get single order by ID
orders.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    // Get order details
    const order = await c.env.DB.prepare(`
      SELECT 
        o.id, o.customer_id, o.customer_name, o.customer_phone, o.customer_email,
        o.subtotal, o.discount_percent, o.discount_amount, o.tax_amount, o.total,
        o.payment_method, o.received_amount, o.change_amount, o.note, o.status,
        o.cashier_id, o.created_at, o.updated_at,
        u.name as cashier_name
      FROM orders o
      LEFT JOIN users u ON o.cashier_id = u.id
      WHERE o.id = ?
    `).bind(id).first()

    if (!order) {
      throw new NotFoundError('Order not found')
    }

    // Get order items
    const itemsResult = await c.env.DB.prepare(`
      SELECT 
        oi.product_id, oi.quantity, oi.price, oi.subtotal,
        p.name as product_name, p.sku as product_sku, p.unit as product_unit
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).bind(id).all()
    
    order.items = itemsResult.results || []

    return c.json({
      success: true,
      data: { order }
    })

  } catch (error) {
    console.error('Get order error:', error)
    
    if (error instanceof NotFoundError) {
      throw error
    }
    
    throw new Error('Failed to fetch order')
  }
})

// Create new order with transaction
orders.post('/',
  validateInput(orderSchema),
  async (c) => {
    try {
      const orderData = c.get('validatedInput')
      const user = c.get('user')
      
      // Start transaction
      await c.env.DB.prepare('BEGIN TRANSACTION').run()
      
      try {
        // Generate order ID
        const orderId = crypto.randomUUID()
        
        // Validate products and check stock
        for (const item of orderData.items) {
          const product = await c.env.DB.prepare(`
            SELECT id, name, quantity, has_serial 
            FROM products 
            WHERE id = ? AND is_active = 1
          `).bind(item.productId).first()
          
          if (!product) {
            throw new ValidationError(`Product ${item.productId} not found or inactive`)
          }
          
          if (product.quantity < item.quantity) {
            throw new ValidationError(`Insufficient stock for ${product.name}. Available: ${product.quantity}, Required: ${item.quantity}`)
          }
          
          // If product has serial numbers, validate them
          if (product.has_serial && item.serialNumbers) {
            if (item.serialNumbers.length !== item.quantity) {
              throw new ValidationError(`Serial numbers count must match quantity for ${product.name}`)
            }
            
            // Check if serial numbers are available
            for (const serialNumber of item.serialNumbers) {
              const serialCheck = await c.env.DB.prepare(`
                SELECT status FROM product_serials 
                WHERE product_id = ? AND serial_number = ?
              `).bind(item.productId, serialNumber).first()
              
              if (!serialCheck || serialCheck.status !== 'available') {
                throw new ValidationError(`Serial number ${serialNumber} is not available`)
              }
            }
          }
        }
        
        // Create order
        await c.env.DB.prepare(`
          INSERT INTO orders (
            id, customer_id, customer_name, customer_phone, customer_email,
            subtotal, discount_percent, discount_amount, tax_amount, total,
            payment_method, received_amount, change_amount, note, status,
            cashier_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(
          orderId,
          orderData.customerId || null,
          orderData.customerName,
          orderData.customerPhone || null,
          orderData.customerEmail || null,
          orderData.subtotal,
          orderData.discountPercent,
          orderData.discountAmount,
          orderData.taxAmount,
          orderData.total,
          orderData.paymentMethod,
          orderData.receivedAmount,
          orderData.changeAmount,
          orderData.note || null,
          orderData.status,
          user.id
        ).run()
        
        // Create order items and update stock
        for (const item of orderData.items) {
          // Create order item
          await c.env.DB.prepare(`
            INSERT INTO order_items (
              order_id, product_id, quantity, price, subtotal, created_at
            ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).bind(
            orderId,
            item.productId,
            item.quantity,
            item.price,
            item.quantity * item.price
          ).run()
          
          // Update product stock
          await c.env.DB.prepare(`
            UPDATE products 
            SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(item.quantity, item.productId).run()
          
          // Handle serial numbers if applicable
          if (item.serialNumbers && item.serialNumbers.length > 0) {
            for (const serialNumber of item.serialNumbers) {
              await c.env.DB.prepare(`
                UPDATE product_serials 
                SET status = 'sold', sold_at = CURRENT_TIMESTAMP, order_id = ?
                WHERE product_id = ? AND serial_number = ?
              `).bind(orderId, item.productId, serialNumber).run()
            }
          }
        }
        
        // Commit transaction
        await c.env.DB.prepare('COMMIT').run()
        
        // Fetch the created order with details
        const createdOrder = await c.env.DB.prepare(`
          SELECT 
            o.id, o.customer_id, o.customer_name, o.customer_phone, o.customer_email,
            o.subtotal, o.discount_percent, o.discount_amount, o.tax_amount, o.total,
            o.payment_method, o.received_amount, o.change_amount, o.note, o.status,
            o.cashier_id, o.created_at, o.updated_at,
            u.name as cashier_name
          FROM orders o
          LEFT JOIN users u ON o.cashier_id = u.id
          WHERE o.id = ?
        `).bind(orderId).first()
        
        // Get order items
        const itemsResult = await c.env.DB.prepare(`
          SELECT 
            oi.product_id, oi.quantity, oi.price, oi.subtotal,
            p.name as product_name, p.sku as product_sku
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `).bind(orderId).all()
        
        createdOrder.items = itemsResult.results || []

        return c.json({
          success: true,
          message: 'Order created successfully',
          data: { order: createdOrder }
        }, 201)
        
      } catch (error) {
        // Rollback on error
        await c.env.DB.prepare('ROLLBACK').run()
        throw error
      }

    } catch (error) {
      console.error('Create order error:', error)
      
      if (error instanceof ValidationError) {
        throw error
      }
      
      throw new Error('Failed to create order')
    }
  }
)

// Update order status
orders.put('/:id',
  requireRole('manager'),
  validateInput(updateOrderSchema),
  async (c) => {
    try {
      const id = c.req.param('id')
      const updateData = c.get('validatedInput')
      const user = c.get('user')
      
      // Check if order exists
      const existingOrder = await c.env.DB.prepare(`
        SELECT id, status FROM orders WHERE id = ?
      `).bind(id).first()
      
      if (!existingOrder) {
        throw new NotFoundError('Order not found')
      }
      
      // Update order
      await c.env.DB.prepare(`
        UPDATE orders 
        SET status = ?, note = COALESCE(?, note), updated_at = CURRENT_TIMESTAMP, updated_by = ?
        WHERE id = ?
      `).bind(updateData.status, updateData.note, user.id, id).run()
      
      // If cancelling order, restore stock
      if (updateData.status === 'cancelled' && existingOrder.status !== 'cancelled') {
        const items = await c.env.DB.prepare(`
          SELECT product_id, quantity FROM order_items WHERE order_id = ?
        `).bind(id).all()
        
        for (const item of items.results || []) {
          await c.env.DB.prepare(`
            UPDATE products 
            SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(item.quantity, item.product_id).run()
        }
        
        // Restore serial numbers
        await c.env.DB.prepare(`
          UPDATE product_serials 
          SET status = 'available', sold_at = NULL, order_id = NULL
          WHERE order_id = ?
        `).bind(id).run()
      }
      
      // Fetch updated order
      const updatedOrder = await c.env.DB.prepare(`
        SELECT 
          o.id, o.customer_id, o.customer_name, o.customer_phone, o.customer_email,
          o.subtotal, o.discount_percent, o.discount_amount, o.tax_amount, o.total,
          o.payment_method, o.received_amount, o.change_amount, o.note, o.status,
          o.cashier_id, o.created_at, o.updated_at,
          u.name as cashier_name
        FROM orders o
        LEFT JOIN users u ON o.cashier_id = u.id
        WHERE o.id = ?
      `).bind(id).first()

      return c.json({
        success: true,
        message: 'Order updated successfully',
        data: { order: updatedOrder }
      })

    } catch (error) {
      console.error('Update order error:', error)
      
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error
      }
      
      throw new Error('Failed to update order')
    }
  }
)

// ================================
// ORDER STATISTICS
// ================================

// Get order statistics
orders.get('/stats/summary', async (c) => {
  try {
    const { period = 'today' } = c.req.query()
    
    let dateFilter = ''
    if (period === 'today') {
      dateFilter = `AND DATE(created_at) = DATE('now')`
    } else if (period === 'week') {
      dateFilter = `AND DATE(created_at) >= DATE('now', '-7 days')`
    } else if (period === 'month') {
      dateFilter = `AND DATE(created_at) >= DATE('now', '-30 days')`
    }
    
    // Get basic stats
    const stats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'completed' THEN total ELSE NULL END) as avg_order_value,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders 
      WHERE 1=1 ${dateFilter}
    `).first()
    
    // Get top products
    const topProducts = await c.env.DB.prepare(`
      SELECT 
        p.name, 
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.status = 'completed' ${dateFilter.replace('created_at', 'o.created_at')}
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `).all()
    
    // Get sales by payment method
    const paymentMethods = await c.env.DB.prepare(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total) as revenue
      FROM orders 
      WHERE status = 'completed' ${dateFilter}
      GROUP BY payment_method
    `).all()

    return c.json({
      success: true,
      data: {
        summary: {
          totalOrders: stats.total_orders || 0,
          totalRevenue: stats.total_revenue || 0,
          avgOrderValue: stats.avg_order_value || 0,
          completedOrders: stats.completed_orders || 0,
          cancelledOrders: stats.cancelled_orders || 0
        },
        topProducts: topProducts.results || [],
        paymentMethods: paymentMethods.results || [],
        period
      }
    })

  } catch (error) {
    console.error('Get order stats error:', error)
    throw new Error('Failed to fetch order statistics')
  }
})

export default orders 