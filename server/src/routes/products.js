import { Hono } from 'hono'
import { z } from 'zod'
import { validateInput, NotFoundError, ValidationError } from '../middleware/errorHandler.js'
import { requireRole } from '../middleware/auth.js'
import { userRateLimiter } from '../middleware/rateLimiter.js'

const products = new Hono()

// ================================
// VALIDATION SCHEMAS
// ================================
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  cost: z.number().positive('Cost must be positive').optional(),
  category: z.string().min(1, 'Category is required'),
  barcode: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  minQuantity: z.number().int().min(0).optional(),
  maxQuantity: z.number().int().min(0).optional(),
  unit: z.string().default('pcs'),
  isActive: z.boolean().default(true),
  hasSerial: z.boolean().default(false),
  tags: z.array(z.string()).optional()
})

const updateProductSchema = productSchema.partial()

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  inStock: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'price', 'quantity', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

// ================================
// PRODUCTS CRUD OPERATIONS
// ================================

// Get all products with filtering and pagination
products.get('/', 
  userRateLimiter({ max: 1000 }),
  async (c) => {
    try {
      // Parse query parameters
      const query = c.req.query()
      const params = searchSchema.parse({
        ...query,
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 20,
        minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
        inStock: query.inStock === 'true' ? true : query.inStock === 'false' ? false : undefined
      })

      // Build SQL query
      let sql = `
        SELECT 
          id, name, description, price, cost, category, barcode, sku,
          quantity, min_quantity, max_quantity, unit, is_active, has_serial,
          tags, created_at, updated_at
        FROM products 
        WHERE 1=1
      `
      const sqlParams = []

      // Add filters
      if (params.q) {
        sql += ` AND (name LIKE ? OR description LIKE ? OR barcode LIKE ? OR sku LIKE ?)`
        const searchTerm = `%${params.q}%`
        sqlParams.push(searchTerm, searchTerm, searchTerm, searchTerm)
      }

      if (params.category) {
        sql += ` AND category = ?`
        sqlParams.push(params.category)
      }

      if (params.minPrice !== undefined) {
        sql += ` AND price >= ?`
        sqlParams.push(params.minPrice)
      }

      if (params.maxPrice !== undefined) {
        sql += ` AND price <= ?`
        sqlParams.push(params.maxPrice)
      }

      if (params.inStock !== undefined) {
        sql += params.inStock ? ` AND quantity > 0` : ` AND quantity = 0`
      }

      // Add sorting
      sql += ` ORDER BY ${params.sortBy} ${params.sortOrder.toUpperCase()}`

      // Add pagination
      const offset = (params.page - 1) * params.limit
      sql += ` LIMIT ? OFFSET ?`
      sqlParams.push(params.limit, offset)

      // Execute query
      const result = await c.env.DB.prepare(sql).bind(...sqlParams).all()
      
      // Get total count for pagination
      let countSql = `SELECT COUNT(*) as total FROM products WHERE 1=1`
      const countParams = []
      
      if (params.q) {
        countSql += ` AND (name LIKE ? OR description LIKE ? OR barcode LIKE ? OR sku LIKE ?)`
        const searchTerm = `%${params.q}%`
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm)
      }
      
      if (params.category) {
        countSql += ` AND category = ?`
        countParams.push(params.category)
      }
      
      if (params.minPrice !== undefined) {
        countSql += ` AND price >= ?`
        countParams.push(params.minPrice)
      }
      
      if (params.maxPrice !== undefined) {
        countSql += ` AND price <= ?`
        countParams.push(params.maxPrice)
      }
      
      if (params.inStock !== undefined) {
        countSql += params.inStock ? ` AND quantity > 0` : ` AND quantity = 0`
      }

      const countResult = await c.env.DB.prepare(countSql).bind(...countParams).first()
      const total = countResult?.total || 0

      // Process results
      const products = (result.results || []).map(product => ({
        ...product,
        tags: product.tags ? JSON.parse(product.tags) : [],
        isActive: Boolean(product.is_active),
        hasSerial: Boolean(product.has_serial)
      }))

      return c.json({
        success: true,
        data: {
          products,
          pagination: {
            page: params.page,
            limit: params.limit,
            total,
            pages: Math.ceil(total / params.limit),
            hasNext: params.page * params.limit < total,
            hasPrev: params.page > 1
          },
          filters: params
        }
      })

    } catch (error) {
      console.error('Get products error:', error)
      
      if (error instanceof ValidationError) {
        throw error
      }
      
      throw new Error('Failed to fetch products')
    }
  }
)

// Get single product by ID
products.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const product = await c.env.DB.prepare(`
      SELECT 
        id, name, description, price, cost, category, barcode, sku,
        quantity, min_quantity, max_quantity, unit, is_active, has_serial,
        tags, created_at, updated_at
      FROM products 
      WHERE id = ?
    `).bind(id).first()

    if (!product) {
      throw new NotFoundError('Product not found')
    }

    // Get serial numbers if product has serials
    let serialNumbers = []
    if (product.has_serial) {
      const serialResult = await c.env.DB.prepare(`
        SELECT serial_number, status, sold_at, warranty_expires_at
        FROM product_serials 
        WHERE product_id = ?
        ORDER BY created_at DESC
      `).bind(id).all()
      
      serialNumbers = serialResult.results || []
    }

    const processedProduct = {
      ...product,
      tags: product.tags ? JSON.parse(product.tags) : [],
      isActive: Boolean(product.is_active),
      hasSerial: Boolean(product.has_serial),
      serialNumbers
    }

    return c.json({
      success: true,
      data: { product: processedProduct }
    })

  } catch (error) {
    console.error('Get product error:', error)
    
    if (error instanceof NotFoundError) {
      throw error
    }
    
    throw new Error('Failed to fetch product')
  }
})

// Create new product
products.post('/',
  requireRole('manager'),
  validateInput(productSchema),
  async (c) => {
    try {
      const productData = c.get('validatedInput')
      const user = c.get('user')
      
      // Check if SKU already exists
      const existingProduct = await c.env.DB.prepare(`
        SELECT id FROM products WHERE sku = ?
      `).bind(productData.sku).first()
      
      if (existingProduct) {
        throw new ValidationError('SKU already exists')
      }
      
      // Generate product ID
      const productId = crypto.randomUUID()
      
      // Insert product
      const result = await c.env.DB.prepare(`
        INSERT INTO products (
          id, name, description, price, cost, category, barcode, sku,
          quantity, min_quantity, max_quantity, unit, is_active, has_serial,
          tags, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `).bind(
        productId,
        productData.name,
        productData.description || null,
        productData.price,
        productData.cost || null,
        productData.category,
        productData.barcode || null,
        productData.sku,
        productData.quantity,
        productData.minQuantity || null,
        productData.maxQuantity || null,
        productData.unit,
        productData.isActive ? 1 : 0,
        productData.hasSerial ? 1 : 0,
        productData.tags ? JSON.stringify(productData.tags) : null,
        user.id
      ).first()

      const newProduct = {
        ...result,
        tags: result.tags ? JSON.parse(result.tags) : [],
        isActive: Boolean(result.is_active),
        hasSerial: Boolean(result.has_serial)
      }

      return c.json({
        success: true,
        message: 'Product created successfully',
        data: { product: newProduct }
      }, 201)

    } catch (error) {
      console.error('Create product error:', error)
      
      if (error instanceof ValidationError) {
        throw error
      }
      
      throw new Error('Failed to create product')
    }
  }
)

// Update product
products.put('/:id',
  requireRole('manager'),
  validateInput(updateProductSchema),
  async (c) => {
    try {
      const id = c.req.param('id')
      const updateData = c.get('validatedInput')
      const user = c.get('user')
      
      // Check if product exists
      const existingProduct = await c.env.DB.prepare(`
        SELECT id FROM products WHERE id = ?
      `).bind(id).first()
      
      if (!existingProduct) {
        throw new NotFoundError('Product not found')
      }
      
      // Check SKU uniqueness if updating SKU
      if (updateData.sku) {
        const skuCheck = await c.env.DB.prepare(`
          SELECT id FROM products WHERE sku = ? AND id != ?
        `).bind(updateData.sku, id).first()
        
        if (skuCheck) {
          throw new ValidationError('SKU already exists')
        }
      }
      
      // Build update query
      const updateFields = []
      const updateParams = []
      
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbKey = key === 'isActive' ? 'is_active' : 
                       key === 'hasSerial' ? 'has_serial' :
                       key === 'minQuantity' ? 'min_quantity' :
                       key === 'maxQuantity' ? 'max_quantity' : key
          
          updateFields.push(`${dbKey} = ?`)
          
          if (key === 'tags') {
            updateParams.push(JSON.stringify(value))
          } else if (key === 'isActive' || key === 'hasSerial') {
            updateParams.push(value ? 1 : 0)
          } else {
            updateParams.push(value)
          }
        }
      })
      
      if (updateFields.length === 0) {
        throw new ValidationError('No valid fields to update')
      }
      
      updateFields.push('updated_at = CURRENT_TIMESTAMP')
      updateFields.push('updated_by = ?')
      updateParams.push(user.id, id)
      
      // Execute update
      await c.env.DB.prepare(`
        UPDATE products 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `).bind(...updateParams).run()
      
      // Fetch updated product
      const updatedProduct = await c.env.DB.prepare(`
        SELECT 
          id, name, description, price, cost, category, barcode, sku,
          quantity, min_quantity, max_quantity, unit, is_active, has_serial,
          tags, created_at, updated_at
        FROM products 
        WHERE id = ?
      `).bind(id).first()
      
      const processedProduct = {
        ...updatedProduct,
        tags: updatedProduct.tags ? JSON.parse(updatedProduct.tags) : [],
        isActive: Boolean(updatedProduct.is_active),
        hasSerial: Boolean(updatedProduct.has_serial)
      }

      return c.json({
        success: true,
        message: 'Product updated successfully',
        data: { product: processedProduct }
      })

    } catch (error) {
      console.error('Update product error:', error)
      
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error
      }
      
      throw new Error('Failed to update product')
    }
  }
)

// Delete product
products.delete('/:id',
  requireRole('admin'),
  async (c) => {
    try {
      const id = c.req.param('id')
      
      // Check if product exists
      const existingProduct = await c.env.DB.prepare(`
        SELECT id, name FROM products WHERE id = ?
      `).bind(id).first()
      
      if (!existingProduct) {
        throw new NotFoundError('Product not found')
      }
      
      // Check if product is used in any orders (soft constraint)
      const orderCheck = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM order_items WHERE product_id = ?
      `).bind(id).first()
      
      if (orderCheck?.count > 0) {
        // Soft delete - just mark as inactive
        await c.env.DB.prepare(`
          UPDATE products 
          SET is_active = 0, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(id).run()
        
        return c.json({
          success: true,
          message: 'Product deactivated (has order history)',
          data: { deactivated: true }
        })
      } else {
        // Hard delete if no order history
        await c.env.DB.prepare(`DELETE FROM products WHERE id = ?`).bind(id).run()
        
        return c.json({
          success: true,
          message: 'Product deleted successfully',
          data: { deleted: true }
        })
      }

    } catch (error) {
      console.error('Delete product error:', error)
      
      if (error instanceof NotFoundError) {
        throw error
      }
      
      throw new Error('Failed to delete product')
    }
  }
)

// ================================
// PRODUCT CATEGORIES
// ================================

// Get all categories
products.get('/categories/list', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT DISTINCT category, COUNT(*) as product_count
      FROM products 
      WHERE is_active = 1
      GROUP BY category
      ORDER BY category
    `).all()

    const categories = (result.results || []).map(row => ({
      name: row.category,
      productCount: row.product_count
    }))

    return c.json({
      success: true,
      data: { categories }
    })

  } catch (error) {
    console.error('Get categories error:', error)
    throw new Error('Failed to fetch categories')
  }
})

// ================================
// PRODUCT SERIAL NUMBERS
// ================================

// Get serial numbers for a product
products.get('/:id/serials', async (c) => {
  try {
    const id = c.req.param('id')
    const { status } = c.req.query()
    
    let sql = `
      SELECT serial_number, status, sold_at, warranty_expires_at, created_at
      FROM product_serials 
      WHERE product_id = ?
    `
    const params = [id]
    
    if (status) {
      sql += ` AND status = ?`
      params.push(status)
    }
    
    sql += ` ORDER BY created_at DESC`
    
    const result = await c.env.DB.prepare(sql).bind(...params).all()

    return c.json({
      success: true,
      data: { 
        serials: result.results || [],
        total: (result.results || []).length
      }
    })

  } catch (error) {
    console.error('Get serials error:', error)
    throw new Error('Failed to fetch serial numbers')
  }
})

export default products 