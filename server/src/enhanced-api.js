import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS middleware
app.use('/*', cors({
  origin: ['http://localhost:3000', 'https://470d3c53.computer-store-frontend.pages.dev', 'https://*.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}))

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Advanced Computer Store API',
    version: '2.0.0'
  })
})

// ============= SUPPLIERS ENDPOINTS =============
app.get('/api/suppliers', async (c) => {
  const db = c.env.DB
  const { search, status } = c.req.query()
  
  let query = 'SELECT * FROM suppliers WHERE 1=1'
  const params = []
  
  if (search) {
    query += ' AND (name LIKE ? OR code LIKE ? OR contact_person LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  
  if (status) {
    query += ' AND status = ?'
    params.push(status)
  }
  
  query += ' ORDER BY name'
  
  const { results } = await db.prepare(query).bind(...params).all()
  return c.json(results)
})

app.post('/api/suppliers', async (c) => {
  const db = c.env.DB
  const data = await c.req.json()
  
  const result = await db.prepare(`
    INSERT INTO suppliers (name, code, contact_person, phone, email, address, tax_code, payment_terms, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.name, data.code, data.contact_person, data.phone, data.email,
    data.address, data.tax_code, data.payment_terms, data.notes, data.status || 'active'
  ).run()
  
  return c.json({ id: result.meta.last_row_id, ...data })
})

app.put('/api/suppliers/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const data = await c.req.json()
  
  await db.prepare(`
    UPDATE suppliers SET name = ?, code = ?, contact_person = ?, phone = ?, email = ?,
    address = ?, tax_code = ?, payment_terms = ?, notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    data.name, data.code, data.contact_person, data.phone, data.email,
    data.address, data.tax_code, data.payment_terms, data.notes, data.status, id
  ).run()
  
  return c.json({ id, ...data })
})

app.delete('/api/suppliers/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  
  await db.prepare('DELETE FROM suppliers WHERE id = ?').bind(id).run()
  return c.json({ message: 'Supplier deleted' })
})

// ============= INVENTORY LOCATIONS ENDPOINTS =============
app.get('/api/inventory-locations', async (c) => {
  const db = c.env.DB
  const { type, status } = c.req.query()
  
  let query = 'SELECT * FROM inventory_locations WHERE 1=1'
  const params = []
  
  if (type) {
    query += ' AND type = ?'
    params.push(type)
  }
  
  if (status) {
    query += ' AND status = ?'
    params.push(status)
  }
  
  query += ' ORDER BY name'
  
  const { results } = await db.prepare(query).bind(...params).all()
  return c.json(results)
})

app.post('/api/inventory-locations', async (c) => {
  const db = c.env.DB
  const data = await c.req.json()
  
  const result = await db.prepare(`
    INSERT INTO inventory_locations (name, code, type, address, manager_name, phone, capacity, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.name, data.code, data.type, data.address, data.manager_name,
    data.phone, data.capacity, data.status || 'active'
  ).run()
  
  return c.json({ id: result.meta.last_row_id, ...data })
})

// ============= SERIAL NUMBERS ENDPOINTS =============
app.get('/api/serial-numbers', async (c) => {
  const db = c.env.DB
  const { product_id, status, search, location } = c.req.query()
  
  let query = `
    SELECT sn.*, p.name as product_name, p.sku, s.name as supplier_name,
           p.warranty_months, p.category_id, p.brand_id, c.name as category_name, b.name as brand_name
    FROM serial_numbers sn
    LEFT JOIN products p ON sn.product_id = p.id
    LEFT JOIN suppliers s ON sn.supplier_id = s.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE 1=1
  `
  const params = []
  
  if (product_id) {
    query += ' AND sn.product_id = ?'
    params.push(product_id)
  }
  
  if (status) {
    query += ' AND sn.status = ?'
    params.push(status)
  }
  
  if (location) {
    query += ' AND sn.location LIKE ?'
    params.push(`%${location}%`)
  }
  
  if (search) {
    query += ' AND (sn.serial_number LIKE ? OR sn.imei LIKE ? OR p.name LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  
  query += ' ORDER BY sn.created_at DESC'
  
  const { results } = await db.prepare(query).bind(...params).all()
  return c.json(results)
})

app.post('/api/serial-numbers', async (c) => {
  const db = c.env.DB
  const data = await c.req.json()
  
  const result = await db.prepare(`
    INSERT INTO serial_numbers (
      product_id, serial_number, imei, mac_address, batch_number,
      manufacturing_date, import_date, supplier_id, purchase_price,
      selling_price, status, location, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.product_id, data.serial_number, data.imei, data.mac_address,
    data.batch_number, data.manufacturing_date, data.import_date || new Date().toISOString().split('T')[0],
    data.supplier_id, data.purchase_price, data.selling_price,
    data.status || 'in_stock', data.location, data.notes
  ).run()
  
  return c.json({ id: result.meta.last_row_id, ...data })
})

app.put('/api/serial-numbers/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const data = await c.req.json()
  
  await db.prepare(`
    UPDATE serial_numbers SET
      product_id = ?, serial_number = ?, imei = ?, mac_address = ?,
      batch_number = ?, manufacturing_date = ?, import_date = ?,
      supplier_id = ?, purchase_price = ?, selling_price = ?,
      status = ?, location = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    data.product_id, data.serial_number, data.imei, data.mac_address,
    data.batch_number, data.manufacturing_date, data.import_date,
    data.supplier_id, data.purchase_price, data.selling_price,
    data.status, data.location, data.notes, id
  ).run()
  
  return c.json({ id, ...data })
})

app.delete('/api/serial-numbers/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  
  await db.prepare('DELETE FROM serial_numbers WHERE id = ?').bind(id).run()
  return c.json({ message: 'Serial number deleted' })
})

// ============= WARRANTY CLAIMS ENDPOINTS =============
app.get('/api/warranty-claims', async (c) => {
  const db = c.env.DB
  const { status, customer_id, claim_type } = c.req.query()
  
  let query = `
    SELECT wc.*, sn.serial_number, sn.product_id, p.name as product_name,
           c.name as customer_name, c.phone as customer_phone
    FROM warranty_claims wc
    LEFT JOIN serial_numbers sn ON wc.serial_number_id = sn.id
    LEFT JOIN products p ON sn.product_id = p.id
    LEFT JOIN customers c ON wc.customer_id = c.id
    WHERE 1=1
  `
  const params = []
  
  if (status) {
    query += ' AND wc.status = ?'
    params.push(status)
  }
  
  if (customer_id) {
    query += ' AND wc.customer_id = ?'
    params.push(customer_id)
  }
  
  if (claim_type) {
    query += ' AND wc.claim_type = ?'
    params.push(claim_type)
  }
  
  query += ' ORDER BY wc.claim_date DESC'
  
  const { results } = await db.prepare(query).bind(...params).all()
  return c.json(results)
})

app.post('/api/warranty-claims', async (c) => {
  const db = c.env.DB
  const data = await c.req.json()
  
  // Generate claim number
  const claimNumber = `WC${Date.now()}`
  
  const result = await db.prepare(`
    INSERT INTO warranty_claims (
      serial_number_id, customer_id, claim_number, issue_description,
      claim_date, warranty_start_date, warranty_end_date, claim_type,
      status, resolution, cost, technician_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.serial_number_id, data.customer_id, claimNumber, data.issue_description,
    data.claim_date || new Date().toISOString().split('T')[0],
    data.warranty_start_date, data.warranty_end_date, data.claim_type,
    data.status || 'pending', data.resolution, data.cost, data.technician_notes
  ).run()
  
  return c.json({ id: result.meta.last_row_id, claim_number: claimNumber, ...data })
})

app.put('/api/warranty-claims/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const data = await c.req.json()
  
  await db.prepare(`
    UPDATE warranty_claims SET
      issue_description = ?, claim_type = ?, status = ?, resolution = ?,
      resolution_date = ?, cost = ?, technician_notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    data.issue_description, data.claim_type, data.status, data.resolution,
    data.resolution_date, data.cost, data.technician_notes, id
  ).run()
  
  return c.json({ id, ...data })
})

// ============= ENHANCED DASHBOARD STATS =============
app.get('/api/dashboard/advanced-stats', async (c) => {
  const db = c.env.DB
  
  try {
    // Basic stats
    const todayStats = await db.prepare(`
      SELECT 
        COUNT(*) as today_orders,
        COALESCE(SUM(total), 0) as today_revenue
      FROM orders 
      WHERE DATE(created_at) = DATE('now')
    `).first()

    const monthStats = await db.prepare(`
      SELECT 
        COUNT(*) as month_orders,
        COALESCE(SUM(total), 0) as month_revenue
      FROM orders 
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).first()

    // Inventory stats
    const inventoryStats = await db.prepare(`
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COALESCE(SUM(p.stock), 0) as total_stock,
        COUNT(CASE WHEN p.stock <= 5 THEN 1 END) as low_stock_count,
        COUNT(sn.id) as total_serial_numbers,
        COUNT(CASE WHEN sn.status = 'in_stock' THEN 1 END) as available_serials
      FROM products p
      LEFT JOIN serial_numbers sn ON p.id = sn.product_id
    `).first()

    // Warranty stats
    const warrantyStats = await db.prepare(`
      SELECT 
        COUNT(*) as total_warranty_claims,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_claims,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as active_claims,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_claims
      FROM warranty_claims
    `).first()

    // Active alerts
    const alertsCount = await db.prepare(`
      SELECT COUNT(*) as active_alerts
      FROM stock_alerts 
      WHERE is_active = 1
    `).first()

    // Top products by sales
    const topProducts = await db.prepare(`
      SELECT p.name, p.sku, COUNT(oi.id) as sales_count, SUM(oi.quantity) as total_sold
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY p.id, p.name, p.sku
      ORDER BY sales_count DESC
      LIMIT 5
    `).all()

    return c.json({
      // Basic stats
      todayOrders: todayStats?.today_orders || 0,
      todayRevenue: todayStats?.today_revenue || 0,
      monthOrders: monthStats?.month_orders || 0,
      monthRevenue: monthStats?.month_revenue || 0,
      
      // Inventory stats
      totalProducts: inventoryStats?.total_products || 0,
      totalStock: inventoryStats?.total_stock || 0,
      lowStockCount: inventoryStats?.low_stock_count || 0,
      totalSerialNumbers: inventoryStats?.total_serial_numbers || 0,
      availableSerials: inventoryStats?.available_serials || 0,
      
      // Warranty stats
      totalWarrantyClaims: warrantyStats?.total_warranty_claims || 0,
      pendingClaims: warrantyStats?.pending_claims || 0,
      activeClaims: warrantyStats?.active_claims || 0,
      completedClaims: warrantyStats?.completed_claims || 0,
      
      // Alerts
      activeAlerts: alertsCount?.active_alerts || 0,
      
      // Lists
      topProducts: topProducts?.results || []
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500)
  }
})

// ============= EXISTING ENDPOINTS =============

// Categories endpoints
app.get('/api/categories', async (c) => {
  const db = c.env.DB
  const { results } = await db.prepare('SELECT * FROM categories ORDER BY name').all()
  return c.json(results)
})

app.post('/api/categories', async (c) => {
  const db = c.env.DB
  const { name, description } = await c.req.json()
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  
  const result = await db.prepare(
    'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)'
  ).bind(name, slug, description).run()
  
  return c.json({ id: result.meta.last_row_id, name, slug, description })
})

// Brands endpoints
app.get('/api/brands', async (c) => {
  const db = c.env.DB
  const { results } = await db.prepare('SELECT * FROM brands ORDER BY name').all()
  return c.json(results)
})

app.post('/api/brands', async (c) => {
  const db = c.env.DB
  const { name, logo_url } = await c.req.json()
  const slug = name.toLowerCase().replace(/\s+/g, '-')
  
  const result = await db.prepare(
    'INSERT INTO brands (name, slug, logo_url) VALUES (?, ?, ?)'
  ).bind(name, slug, logo_url).run()
  
  return c.json({ id: result.meta.last_row_id, name, slug, logo_url })
})

// Enhanced Products endpoints
app.get('/api/products', async (c) => {
  const db = c.env.DB
  const { category, brand, status, search } = c.req.query()
  
  let query = `
    SELECT p.*, c.name as category_name, b.name as brand_name,
           COUNT(sn.id) as serial_count,
           COUNT(CASE WHEN sn.status = 'in_stock' THEN 1 END) as available_serials
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    LEFT JOIN brands b ON p.brand_id = b.id 
    LEFT JOIN serial_numbers sn ON p.id = sn.product_id
    WHERE 1=1
  `
  const params = []
  
  if (category) {
    query += ' AND p.category_id = ?'
    params.push(category)
  }
  
  if (brand) {
    query += ' AND p.brand_id = ?'
    params.push(brand)
  }
  
  if (status) {
    query += ' AND p.status = ?'
    params.push(status)
  }
  
  if (search) {
    query += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  
  query += ' GROUP BY p.id ORDER BY p.created_at DESC'
  
  const stmt = db.prepare(query)
  const { results } = await stmt.bind(...params).all()
  
  // Parse JSON fields
  const products = results.map(p => ({
    ...p,
    specifications: p.specifications ? JSON.parse(p.specifications) : {},
    images: p.images ? JSON.parse(p.images) : []
  }))
  
  return c.json(products)
})

app.post('/api/products', async (c) => {
  const db = c.env.DB
  const data = await c.req.json()
  
  const slug = data.name.toLowerCase().replace(/\s+/g, '-')
  const specifications = JSON.stringify(data.specifications || {})
  const images = JSON.stringify(data.images || [])
  
  const result = await db.prepare(`
    INSERT INTO products (
      sku, barcode, name, slug, category_id, brand_id, 
      description, specifications, price, sale_price, cost, 
      stock, status, images, warranty_months
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.sku, data.barcode, data.name, slug, data.category_id, 
    data.brand_id, data.description, specifications, data.price, 
    data.sale_price, data.cost, data.stock, data.status || 'active', 
    images, data.warranty_months || 12
  ).run()
  
  return c.json({ id: result.meta.last_row_id, ...data })
})

app.put('/api/products/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const data = await c.req.json()
  
  const specifications = JSON.stringify(data.specifications || {})
  const images = JSON.stringify(data.images || [])
  
  await db.prepare(`
    UPDATE products SET 
      sku = ?, barcode = ?, name = ?, category_id = ?, brand_id = ?, 
      description = ?, specifications = ?, price = ?, sale_price = ?, 
      cost = ?, stock = ?, status = ?, images = ?, warranty_months = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    data.sku, data.barcode, data.name, data.category_id, data.brand_id,
    data.description, specifications, data.price, data.sale_price,
    data.cost, data.stock, data.status, images, data.warranty_months, id
  ).run()
  
  return c.json({ id, ...data })
})

app.delete('/api/products/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  
  await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run()
  return c.json({ message: 'Product deleted' })
})

// Customers endpoints
app.get('/api/customers', async (c) => {
  const db = c.env.DB
  const { search } = c.req.query()
  
  let query = 'SELECT * FROM customers WHERE 1=1'
  const params = []
  
  if (search) {
    query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  
  query += ' ORDER BY created_at DESC'
  
  const { results } = await db.prepare(query).bind(...params).all()
  return c.json(results)
})

app.post('/api/customers', async (c) => {
  const db = c.env.DB
  const data = await c.req.json()
  
  const result = await db.prepare(`
    INSERT INTO customers (name, phone, email, address, notes)
    VALUES (?, ?, ?, ?, ?)
  `).bind(data.name, data.phone, data.email, data.address, data.notes).run()
  
  return c.json({ id: result.meta.last_row_id, ...data })
})

app.put('/api/customers/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const data = await c.req.json()
  
  await db.prepare(`
    UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(data.name, data.phone, data.email, data.address, data.notes, id).run()
  
  return c.json({ id, ...data })
})

app.delete('/api/customers/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  
  await db.prepare('DELETE FROM customers WHERE id = ?').bind(id).run()
  return c.json({ message: 'Customer deleted' })
})

// Orders endpoints
app.get('/api/orders', async (c) => {
  const db = c.env.DB
  const { status, customer_id, limit } = c.req.query()
  
  let query = `
    SELECT o.*, c.name as customer_name, c.phone as customer_phone
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    WHERE 1=1
  `
  const params = []
  
  if (status) {
    query += ' AND o.status = ?'
    params.push(status)
  }
  
  if (customer_id) {
    query += ' AND o.customer_id = ?'
    params.push(customer_id)
  }
  
  query += ' ORDER BY o.created_at DESC'
  
  if (limit) {
    query += ' LIMIT ?'
    params.push(parseInt(limit))
  }
  
  const { results } = await db.prepare(query).bind(...params).all()
  return c.json(results)
})

app.post('/api/orders', async (c) => {
  const db = c.env.DB
  const data = await c.req.json()
  
  // Generate order number
  const orderNumber = `ORD${Date.now()}`
  
  const result = await db.prepare(`
    INSERT INTO orders (order_number, customer_id, subtotal, tax, total, payment_method, payment_status, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    orderNumber, data.customer_id, data.subtotal, data.tax, data.total,
    data.payment_method, data.payment_status || 'pending', data.status || 'pending', data.notes
  ).run()
  
  const orderId = result.meta.last_row_id
  
  // Insert order items
  if (data.items && data.items.length > 0) {
    for (const item of data.items) {
      await db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?)
      `).bind(orderId, item.product_id, item.quantity, item.unit_price, item.total_price).run()
    }
  }
  
  return c.json({ id: orderId, order_number: orderNumber, ...data })
})

app.put('/api/orders/:id/status', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const { status } = await c.req.json()
  
  await db.prepare(`
    UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(status, id).run()
  
  return c.json({ id, status })
})

// Authentication endpoint
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  
  // Simple demo authentication
  if (email === 'admin@computerstore.com' && password === 'admin123') {
    return c.json({
      success: true,
      user: {
        id: 1,
        email: 'admin@computerstore.com',
        name: 'Admin User',
        role: 'admin'
      },
      token: 'demo-jwt-token'
    })
  }
  
  return c.json({ success: false, message: 'Invalid credentials' }, 401)
})

export default app 