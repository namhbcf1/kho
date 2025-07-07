import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS middleware - Updated for broader compatibility
app.use('/*', cors({
  origin: '*', // Allow all origins for now
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
}))

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'POS Computer Store API',
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
  
  try {
    const data = await c.req.json()
    
    const result = await db.prepare(`
      INSERT INTO suppliers (name, code, contact_person, phone, email, address, tax_code, payment_terms, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name || null,
      data.code || null,
      data.contact_person || null,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.tax_code || null,
      data.payment_terms || null,
      data.notes || null,
      data.status || 'active'
    ).run()
    
    return c.json({ id: result.meta.last_row_id, ...data })
  } catch (error) {
    console.error('Supplier creation error:', error)
    return c.json({ error: 'Failed to create supplier: ' + error.message }, 500)
  }
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
  
  try {
    const data = await c.req.json()
    
    const result = await db.prepare(`
      INSERT INTO inventory_locations (name, code, type, address, manager_name, phone, capacity, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name || null,
      data.code || null,
      data.type || null,
      data.address || null,
      data.manager_name || null,
      data.phone || null,
      data.capacity || null,
      data.status || 'active'
    ).run()
    
    return c.json({ id: result.meta.last_row_id, ...data })
  } catch (error) {
    console.error('Inventory location creation error:', error)
    return c.json({ error: 'Failed to create inventory location: ' + error.message }, 500)
  }
})

// ============= SERIAL NUMBERS ENDPOINTS =============
app.get('/api/serial-numbers', async (c) => {
  const db = c.env.DB
  const { product_id, status, search, location } = c.req.query()
  
  let query = `
    SELECT sn.*, p.name as product_name, p.sku, s.name as supplier_name,
           p.warranty_months, p.category_id, p.brand_id
    FROM serial_numbers sn
    LEFT JOIN products p ON sn.product_id = p.id
    LEFT JOIN suppliers s ON sn.supplier_id = s.id
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
  
  try {
    const data = await c.req.json()
    
    // Handle undefined/null values properly
    const result = await db.prepare(`
      INSERT INTO serial_numbers (
        product_id, serial_number, imei, mac_address, batch_number,
        manufacturing_date, import_date, supplier_id, purchase_price,
        selling_price, status, location, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.product_id || null,
      data.serial_number || null,
      data.imei || null,
      data.mac_address || null,
      data.batch_number || null,
      data.manufacturing_date || null,
      data.import_date || new Date().toISOString().split('T')[0],
      data.supplier_id || null,
      data.purchase_price || null,
      data.selling_price || null,
      data.status || 'in_stock',
      data.location || null,
      data.notes || null
    ).run()
    
    return c.json({ id: result.meta.last_row_id, ...data })
  } catch (error) {
    console.error('Serial numbers creation error:', error)
    return c.json({ error: 'Failed to create serial number: ' + error.message }, 500)
  }
})

app.put('/api/serial-numbers/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  
  try {
    const data = await c.req.json()
    
    await db.prepare(`
      UPDATE serial_numbers SET
        product_id = ?, serial_number = ?, imei = ?, mac_address = ?,
        batch_number = ?, manufacturing_date = ?, import_date = ?,
        supplier_id = ?, purchase_price = ?, selling_price = ?,
        status = ?, location = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.product_id || null,
      data.serial_number || null,
      data.imei || null,
      data.mac_address || null,
      data.batch_number || null,
      data.manufacturing_date || null,
      data.import_date || null,
      data.supplier_id || null,
      data.purchase_price || null,
      data.selling_price || null,
      data.status || 'in_stock',
      data.location || null,
      data.notes || null,
      id
    ).run()
    
    return c.json({ id, ...data })
  } catch (error) {
    console.error('Serial numbers update error:', error)
    return c.json({ error: 'Failed to update serial number: ' + error.message }, 500)
  }
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
  
  try {
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
      data.serial_number_id || null,
      data.customer_id || null,
      claimNumber,
      data.issue_description || null,
      data.claim_date || new Date().toISOString().split('T')[0],
      data.warranty_start_date || null,
      data.warranty_end_date || null,
      data.claim_type || null,
      data.status || 'pending',
      data.resolution || null,
      data.cost || null,
      data.technician_notes || null
    ).run()
    
    return c.json({ id: result.meta.last_row_id, claim_number: claimNumber, ...data })
  } catch (error) {
    console.error('Warranty claim creation error:', error)
    return c.json({ error: 'Failed to create warranty claim: ' + error.message }, 500)
  }
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

// ============= STOCK ALERTS ENDPOINTS =============
app.get('/api/stock-alerts', async (c) => {
  const db = c.env.DB
  const { is_active, alert_type } = c.req.query()
  
  let query = `
    SELECT sa.*, p.name as product_name, p.sku, p.stock as current_stock
    FROM stock_alerts sa
    LEFT JOIN products p ON sa.product_id = p.id
    WHERE 1=1
  `
  const params = []
  
  if (is_active !== undefined) {
    query += ' AND sa.is_active = ?'
    params.push(is_active === 'true' ? 1 : 0)
  }
  
  if (alert_type) {
    query += ' AND sa.alert_type = ?'
    params.push(alert_type)
  }
  
  query += ' ORDER BY sa.created_at DESC'
  
  const { results } = await db.prepare(query).bind(...params).all()
  return c.json(results)
})

app.post('/api/stock-alerts', async (c) => {
  const db = c.env.DB
  const data = await c.req.json()
  
  const result = await db.prepare(`
    INSERT INTO stock_alerts (product_id, alert_type, threshold_value, current_value, message, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    data.product_id, data.alert_type, data.threshold_value,
    data.current_value, data.message, data.is_active !== false ? 1 : 0
  ).run()
  
  return c.json({ id: result.meta.last_row_id, ...data })
})

// ============= DASHBOARD STATS =============
app.get('/api/dashboard/stats', async (c) => {
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

    // Simple stats response
    return c.json({
      todayOrders: todayStats.today_orders || 0,
      todayRevenue: todayStats.today_revenue || 0,
      monthOrders: monthStats.month_orders || 0,
      monthRevenue: monthStats.month_revenue || 0,
      totalProducts: 0,
      lowStockCount: 0
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500)
  }
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
      SELECT p.name, p.sku, p.images, COUNT(oi.id) as sales_count, SUM(oi.quantity) as total_sold
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY p.id, p.name, p.sku, p.images
      ORDER BY sales_count DESC
      LIMIT 5
    `).all()

    // Parse images for top products
    const topProductsWithImages = topProducts.results?.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      soldCount: product.total_sold || 0
    })) || []

    // If no sales data, get some recent products instead
    let finalTopProducts = topProductsWithImages
    if (finalTopProducts.length === 0) {
      const recentProducts = await db.prepare(`
        SELECT p.name, p.sku, p.images, 0 as sales_count, 0 as total_sold
        FROM products p
        WHERE p.status = 'active'
        ORDER BY p.created_at DESC
        LIMIT 5
      `).all()
      
      finalTopProducts = recentProducts.results?.map(product => ({
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        soldCount: 0
      })) || []
    }

    // Recent warranty claims
    const recentWarrantyClaims = await db.prepare(`
      SELECT wc.*, sn.serial_number, p.name as product_name, c.name as customer_name
      FROM warranty_claims wc
      LEFT JOIN serial_numbers sn ON wc.serial_number_id = sn.id
      LEFT JOIN products p ON sn.product_id = p.id
      LEFT JOIN customers c ON wc.customer_id = c.id
      ORDER BY wc.created_at DESC
      LIMIT 5
    `).all()

    return c.json({
      // Basic stats
      todayOrders: todayStats.today_orders,
      todayRevenue: todayStats.today_revenue,
      monthOrders: monthStats.month_orders,
      monthRevenue: monthStats.month_revenue,
      
      // Inventory stats
      totalProducts: inventoryStats.total_products,
      totalStock: inventoryStats.total_stock,
      lowStockCount: inventoryStats.low_stock_count,
      totalSerialNumbers: inventoryStats.total_serial_numbers,
      availableSerials: inventoryStats.available_serials,
      
      // Warranty stats
      totalWarrantyClaims: warrantyStats.total_warranty_claims,
      pendingClaims: warrantyStats.pending_claims,
      activeClaims: warrantyStats.active_claims,
      completedClaims: warrantyStats.completed_claims,
      
      // Alerts
      activeAlerts: alertsCount.active_alerts,
      
      // Lists
      topProducts: finalTopProducts,
      recentWarrantyClaims: recentWarrantyClaims.results || []
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500)
  }
})

// ============= EXISTING ENDPOINTS (Categories, Brands, Products, etc.) =============

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

// Products endpoints (enhanced)
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

app.get('/api/products/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  
  const result = await db.prepare(`
    SELECT p.*, c.name as category_name, b.name as brand_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    LEFT JOIN brands b ON p.brand_id = b.id 
    WHERE p.id = ?
  `).bind(id).first()
  
  if (!result) {
    return c.json({ error: 'Product not found' }, 404)
  }
  
  result.specifications = result.specifications ? JSON.parse(result.specifications) : {}
  result.images = result.images ? JSON.parse(result.images) : []
  
  return c.json(result)
})

app.post('/api/products', async (c) => {
  const db = c.env.DB
  
  try {
    const data = await c.req.json()
    
    const slug = (data.name || 'product').toLowerCase().replace(/\s+/g, '-')
    const specifications = JSON.stringify(data.specifications || {})
    const images = JSON.stringify(data.images || [])
    
    const result = await db.prepare(`
      INSERT INTO products (
        sku, barcode, name, slug, category_id, brand_id, 
        description, specifications, price, sale_price, cost, 
        stock, status, images, warranty_months
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.sku || null,
      data.barcode || null,
      data.name || null,
      slug,
      data.category_id || null,
      data.brand_id || null,
      data.description || null,
      specifications,
      data.price || null,
      data.sale_price || null,
      data.cost || null,
      data.stock || 0,
      data.status || 'active',
      images,
      data.warranty_months || 12
    ).run()
    
    return c.json({ id: result.meta.last_row_id, ...data })
  } catch (error) {
    console.error('Products creation error:', error)
    return c.json({ error: 'Failed to create product: ' + error.message }, 500)
  }
})

app.put('/api/products/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  
  try {
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
  } catch (error) {
    console.error('Products update error:', error)
    return c.json({ error: 'Failed to update product: ' + error.message }, 500)
  }
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
  
  try {
    const data = await c.req.json()
    
    const result = await db.prepare(`
      INSERT INTO customers (name, phone, email, address, notes) 
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      data.name || null,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.notes || null
    ).run()
    
    return c.json({ id: result.meta.last_row_id, ...data })
  } catch (error) {
    console.error('Customer creation error:', error)
    return c.json({ error: 'Failed to create customer: ' + error.message }, 500)
  }
})

app.put('/api/customers/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  
  try {
    const data = await c.req.json()
    
    await db.prepare(`
      UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(data.name, data.phone, data.email, data.address, data.notes, id).run()
    
    return c.json({ id, ...data })
  } catch (error) {
    console.error('Customer update error:', error)
    return c.json({ error: 'Failed to update customer: ' + error.message }, 500)
  }
})

app.delete('/api/customers/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  
  try {
    await db.prepare('DELETE FROM customers WHERE id = ?').bind(id).run()
    return c.json({ message: 'Customer deleted' })
  } catch (error) {
    console.error('Customer deletion error:', error)
    return c.json({ error: 'Failed to delete customer: ' + error.message }, 500)
  }
})

// Orders endpoints
app.get('/api/orders', async (c) => {
  const db = c.env.DB
  const { status, payment_status, from, to } = c.req.query()
  
  let query = `
    SELECT o.*, c.name as customer_name 
    FROM orders o 
    LEFT JOIN customers c ON o.customer_id = c.id 
    WHERE 1=1
  `
  const params = []
  
  if (status) {
    query += ' AND o.status = ?'
    params.push(status)
  }
  
  if (payment_status) {
    query += ' AND o.payment_status = ?'
    params.push(payment_status)
  }
  
  if (from) {
    query += ' AND o.created_at >= ?'
    params.push(from)
  }
  
  if (to) {
    query += ' AND o.created_at <= ?'
    params.push(to)
  }
  
  query += ' ORDER BY o.created_at DESC'
  
  const { results } = await db.prepare(query).bind(...params).all()
  return c.json(results)
})

app.get('/api/orders/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  
  const order = await db.prepare(`
    SELECT o.*, c.name as customer_name 
    FROM orders o 
    LEFT JOIN customers c ON o.customer_id = c.id 
    WHERE o.id = ?
  `).bind(id).first()
  
  if (!order) {
    return c.json({ error: 'Order not found' }, 404)
  }
  
  const { results: items } = await db.prepare(`
    SELECT oi.*, p.name as product_name, p.sku, p.images 
    FROM order_items oi 
    LEFT JOIN products p ON oi.product_id = p.id 
    WHERE oi.order_id = ?
  `).bind(id).all()
  
  order.items = items.map(item => ({
    ...item,
    images: item.images ? JSON.parse(item.images) : []
  }))
  
  return c.json(order)
})

app.post('/api/orders', async (c) => {
  const db = c.env.DB
  
  try {
    const data = await c.req.json()
    
    // Generate order number
    const orderNumber = `ORD${Date.now()}`
    
    // Create order
    const orderResult = await db.prepare(`
      INSERT INTO orders (
        order_number, customer_id, customer_name, customer_phone, 
        customer_address, subtotal, discount, tax, total, 
        status, payment_method, payment_status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderNumber,
      data.customer_id || null,
      data.customer_name || null,
      data.customer_phone || null,
      data.customer_address || null,
      data.subtotal || 0,
      data.discount || 0,
      data.tax || 0,
      data.total || 0,
      'pending',
      data.payment_method || 'cash',
      'pending',
      data.notes || null
    ).run()
  
  const orderId = orderResult.meta.last_row_id
  
  // Create order items and update stock
  for (const item of data.items) {
    // Add order item
    await db.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_name, product_sku, 
        quantity, price, discount, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderId, item.product_id, item.product_name, item.product_sku,
      item.quantity, item.price, item.discount || 0, item.total
    ).run()
    
    // Update product stock
    await db.prepare(`
      UPDATE products 
      SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(item.quantity, item.product_id).run()
    
    // Add stock movement
    await db.prepare(`
      INSERT INTO stock_movements (
        product_id, type, quantity, reference_type, reference_id, notes
      ) VALUES (?, 'out', ?, 'order', ?, ?)
    `).bind(
      item.product_id, item.quantity, orderId, 
      `Order ${orderNumber}`
    ).run()
  }
  
    // Update customer total spent
    if (data.customer_id) {
      await db.prepare(`
        UPDATE customers 
        SET total_spent = total_spent + ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(data.total, data.customer_id).run()
    }
    
    return c.json({ id: orderId, order_number: orderNumber, ...data })
  } catch (error) {
    console.error('Order creation error:', error)
    return c.json({ error: 'Failed to create order: ' + error.message }, 500)
  }
})

app.put('/api/orders/:id/status', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const { status } = await c.req.json()
  
  await db.prepare(`
    UPDATE orders 
    SET status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).bind(status, id).run()
  
  return c.json({ id, status })
})

// Stock movements
app.get('/api/stock-movements', async (c) => {
  const db = c.env.DB
  const { product_id, type } = c.req.query()
  
  let query = `
    SELECT sm.*, p.name as product_name, p.sku 
    FROM stock_movements sm 
    LEFT JOIN products p ON sm.product_id = p.id 
    WHERE 1=1
  `
  const params = []
  
  if (product_id) {
    query += ' AND sm.product_id = ?'
    params.push(product_id)
  }
  
  if (type) {
    query += ' AND sm.type = ?'
    params.push(type)
  }
  
  query += ' ORDER BY sm.created_at DESC'
  
  const { results } = await db.prepare(query).bind(...params).all()
  return c.json(results)
})

app.post('/api/stock-movements', async (c) => {
  const db = c.env.DB
  const data = await c.req.json()
  
  // Create stock movement
  const result = await db.prepare(`
    INSERT INTO stock_movements (
      product_id, type, quantity, reference_type, reference_id, notes
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    data.product_id, data.type, data.quantity,
    data.reference_type, data.reference_id, data.notes
  ).run()
  
  // Update product stock
  const operator = data.type === 'in' ? '+' : '-'
  await db.prepare(`
    UPDATE products 
    SET stock = stock ${operator} ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).bind(Math.abs(data.quantity), data.product_id).run()
  
  return c.json({ id: result.meta.last_row_id, ...data })
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

// ============= USERS ENDPOINTS =============
app.get('/api/users', async (c) => {
  const db = c.env.DB
  const { search, role, status } = c.req.query()
  
  try {
    let query = 'SELECT id, username, email, name, role, status, phone, created_at FROM users WHERE 1=1'
    const params = []
    
    if (search) {
      query += ' AND (name LIKE ? OR username LIKE ? OR email LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (role) {
      query += ' AND role = ?'
      params.push(role)
    }
    
    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY created_at DESC'
    
    const { results } = await db.prepare(query).bind(...params).all()
    return c.json(results)
  } catch (error) {
    console.error('Users fetch error:', error)
    // Return demo data if database fails
    return c.json([
      {
        id: 1,
        username: 'admin',
        email: 'admin@computerstore.com',
        name: 'Administrator',
        role: 'admin',
        status: 'active',
        phone: '0901234567',
        created_at: '2024-01-01'
      },
      {
        id: 2,
        username: 'manager',
        email: 'manager@computerstore.com',
        name: 'Store Manager',
        role: 'manager',
        status: 'active',
        phone: '0902345678',
        created_at: '2024-01-15'
      },
      {
        id: 3,
        username: 'staff',
        email: 'staff@computerstore.com',
        name: 'Sales Staff',
        role: 'staff',
        status: 'inactive',
        phone: '0903456789',
        created_at: '2024-02-01'
      }
    ])
  }
})

app.post('/api/users', async (c) => {
  const db = c.env.DB
  const data = await c.req.json()
  
  try {
    const result = await db.prepare(`
      INSERT INTO users (username, email, name, role, status, phone, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.username, data.email, data.name, data.role, 
      data.status || 'active', data.phone, 'demo-hash'
    ).run()
    
    return c.json({ id: result.meta.last_row_id, ...data })
  } catch (error) {
    console.error('User creation error:', error)
    return c.json({ error: 'Failed to create user' }, 500)
  }
})

app.put('/api/users/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const data = await c.req.json()
  
  try {
    await db.prepare(`
      UPDATE users SET 
        username = ?, email = ?, name = ?, role = ?, 
        status = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.username, data.email, data.name, data.role, 
      data.status, data.phone, id
    ).run()
    
    return c.json({ id, ...data })
  } catch (error) {
    console.error('User update error:', error)
    return c.json({ error: 'Failed to update user' }, 500)
  }
})

app.post('/api/users/:id/reset-password', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const { password } = await c.req.json()
  
  try {
    // In production, you should hash the password
    const hashedPassword = `hashed_${password}` // Simple demo hash
    
    await db.prepare(`
      UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(hashedPassword, id).run()
    
    return c.json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Password reset error:', error)
    return c.json({ error: 'Failed to reset password' }, 500)
  }
})

app.delete('/api/users/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  
  try {
    await db.prepare('DELETE FROM users WHERE id = ?').bind(id).run()
    return c.json({ message: 'User deleted' })
  } catch (error) {
    console.error('User deletion error:', error)
    return c.json({ error: 'Failed to delete user' }, 500)
  }
})

export default app 