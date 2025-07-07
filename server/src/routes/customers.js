import { Hono } from 'hono'
import { z } from 'zod'
import { validateInput, NotFoundError, ValidationError } from '../middleware/errorHandler.js'
import { requireRole } from '../middleware/auth.js'
import { userRateLimiter } from '../middleware/rateLimiter.js'

const customers = new Hono()

// ================================
// VALIDATION SCHEMAS
// ================================
const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(255),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().max(500).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  notes: z.string().max(1000).optional(),
  isActive: z.boolean().default(true)
})

const updateCustomerSchema = customerSchema.partial()

// ================================
// CUSTOMERS CRUD OPERATIONS
// ================================

// Get all customers with search and pagination
customers.get('/', 
  userRateLimiter({ max: 500 }),
  async (c) => {
    try {
      const query = c.req.query()
      const page = parseInt(query.page) || 1
      const limit = Math.min(parseInt(query.limit) || 20, 100)
      const search = query.search
      const sortBy = query.sortBy || 'name'
      const sortOrder = query.sortOrder || 'asc'

      // Build SQL query
      let sql = `
        SELECT 
          id, name, phone, email, address, date_of_birth, gender, notes, is_active,
          created_at, updated_at
        FROM customers 
        WHERE 1=1
      `
      const sqlParams = []

      // Add search filter
      if (search) {
        sql += ` AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)`
        const searchTerm = `%${search}%`
        sqlParams.push(searchTerm, searchTerm, searchTerm)
      }

      // Add sorting
      const allowedSortFields = ['name', 'phone', 'created_at']
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name'
      const validSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder.toUpperCase() : 'ASC'
      
      sql += ` ORDER BY ${validSortBy} ${validSortOrder}`

      // Add pagination
      const offset = (page - 1) * limit
      sql += ` LIMIT ? OFFSET ?`
      sqlParams.push(limit, offset)

      // Execute query
      const result = await c.env.DB.prepare(sql).bind(...sqlParams).all()
      
      // Get total count
      let countSql = `SELECT COUNT(*) as total FROM customers WHERE 1=1`
      const countParams = []
      
      if (search) {
        countSql += ` AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)`
        const searchTerm = `%${search}%`
        countParams.push(searchTerm, searchTerm, searchTerm)
      }

      const countResult = await c.env.DB.prepare(countSql).bind(...countParams).first()
      const total = countResult?.total || 0

      // Process results
      const customers = (result.results || []).map(customer => ({
        ...customer,
        isActive: Boolean(customer.is_active)
      }))

      return c.json({
        success: true,
        data: {
          customers,
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
      console.error('Get customers error:', error)
      throw new Error('Failed to fetch customers')
    }
  }
)

// Get single customer by ID
customers.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const customer = await c.env.DB.prepare(`
      SELECT 
        id, name, phone, email, address, date_of_birth, gender, notes, is_active,
        created_at, updated_at
      FROM customers 
      WHERE id = ?
    `).bind(id).first()

    if (!customer) {
      throw new NotFoundError('Customer not found')
    }

    // Get customer's order history
    const ordersResult = await c.env.DB.prepare(`
      SELECT 
        id, total, status, created_at
      FROM orders 
      WHERE customer_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).bind(id).all()

    const processedCustomer = {
      ...customer,
      isActive: Boolean(customer.is_active),
      recentOrders: ordersResult.results || []
    }

    return c.json({
      success: true,
      data: { customer: processedCustomer }
    })

  } catch (error) {
    console.error('Get customer error:', error)
    
    if (error instanceof NotFoundError) {
      throw error
    }
    
    throw new Error('Failed to fetch customer')
  }
})

// Create new customer
customers.post('/',
  validateInput(customerSchema),
  async (c) => {
    try {
      const customerData = c.get('validatedInput')
      const user = c.get('user')
      
      // Check if phone already exists
      const existingCustomer = await c.env.DB.prepare(`
        SELECT id FROM customers WHERE phone = ?
      `).bind(customerData.phone).first()
      
      if (existingCustomer) {
        throw new ValidationError('Phone number already exists')
      }
      
      // Check if email already exists (if provided)
      if (customerData.email) {
        const existingEmail = await c.env.DB.prepare(`
          SELECT id FROM customers WHERE email = ?
        `).bind(customerData.email).first()
        
        if (existingEmail) {
          throw new ValidationError('Email already exists')
        }
      }
      
      // Generate customer ID
      const customerId = crypto.randomUUID()
      
      // Insert customer
      const result = await c.env.DB.prepare(`
        INSERT INTO customers (
          id, name, phone, email, address, date_of_birth, gender, notes, is_active,
          created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `).bind(
        customerId,
        customerData.name,
        customerData.phone,
        customerData.email || null,
        customerData.address || null,
        customerData.dateOfBirth || null,
        customerData.gender || null,
        customerData.notes || null,
        customerData.isActive ? 1 : 0,
        user.id
      ).first()

      const newCustomer = {
        ...result,
        isActive: Boolean(result.is_active)
      }

      return c.json({
        success: true,
        message: 'Customer created successfully',
        data: { customer: newCustomer }
      }, 201)

    } catch (error) {
      console.error('Create customer error:', error)
      
      if (error instanceof ValidationError) {
        throw error
      }
      
      throw new Error('Failed to create customer')
    }
  }
)

// Update customer
customers.put('/:id',
  validateInput(updateCustomerSchema),
  async (c) => {
    try {
      const id = c.req.param('id')
      const updateData = c.get('validatedInput')
      const user = c.get('user')
      
      // Check if customer exists
      const existingCustomer = await c.env.DB.prepare(`
        SELECT id FROM customers WHERE id = ?
      `).bind(id).first()
      
      if (!existingCustomer) {
        throw new NotFoundError('Customer not found')
      }
      
      // Check phone uniqueness if updating phone
      if (updateData.phone) {
        const phoneCheck = await c.env.DB.prepare(`
          SELECT id FROM customers WHERE phone = ? AND id != ?
        `).bind(updateData.phone, id).first()
        
        if (phoneCheck) {
          throw new ValidationError('Phone number already exists')
        }
      }
      
      // Check email uniqueness if updating email
      if (updateData.email) {
        const emailCheck = await c.env.DB.prepare(`
          SELECT id FROM customers WHERE email = ? AND id != ?
        `).bind(updateData.email, id).first()
        
        if (emailCheck) {
          throw new ValidationError('Email already exists')
        }
      }
      
      // Build update query
      const updateFields = []
      const updateParams = []
      
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbKey = key === 'isActive' ? 'is_active' : 
                       key === 'dateOfBirth' ? 'date_of_birth' : key
          
          updateFields.push(`${dbKey} = ?`)
          
          if (key === 'isActive') {
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
        UPDATE customers 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `).bind(...updateParams).run()
      
      // Fetch updated customer
      const updatedCustomer = await c.env.DB.prepare(`
        SELECT 
          id, name, phone, email, address, date_of_birth, gender, notes, is_active,
          created_at, updated_at
        FROM customers 
        WHERE id = ?
      `).bind(id).first()
      
      const processedCustomer = {
        ...updatedCustomer,
        isActive: Boolean(updatedCustomer.is_active)
      }

      return c.json({
        success: true,
        message: 'Customer updated successfully',
        data: { customer: processedCustomer }
      })

    } catch (error) {
      console.error('Update customer error:', error)
      
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        throw error
      }
      
      throw new Error('Failed to update customer')
    }
  }
)

// Delete customer
customers.delete('/:id',
  requireRole('manager'),
  async (c) => {
    try {
      const id = c.req.param('id')
      
      // Check if customer exists
      const existingCustomer = await c.env.DB.prepare(`
        SELECT id, name FROM customers WHERE id = ?
      `).bind(id).first()
      
      if (!existingCustomer) {
        throw new NotFoundError('Customer not found')
      }
      
      // Check if customer has orders
      const orderCheck = await c.env.DB.prepare(`
        SELECT COUNT(*) as count FROM orders WHERE customer_id = ?
      `).bind(id).first()
      
      if (orderCheck?.count > 0) {
        // Soft delete - just mark as inactive
        await c.env.DB.prepare(`
          UPDATE customers 
          SET is_active = 0, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(id).run()
        
        return c.json({
          success: true,
          message: 'Customer deactivated (has order history)',
          data: { deactivated: true }
        })
      } else {
        // Hard delete if no order history
        await c.env.DB.prepare(`DELETE FROM customers WHERE id = ?`).bind(id).run()
        
        return c.json({
          success: true,
          message: 'Customer deleted successfully',
          data: { deleted: true }
        })
      }

    } catch (error) {
      console.error('Delete customer error:', error)
      
      if (error instanceof NotFoundError) {
        throw error
      }
      
      throw new Error('Failed to delete customer')
    }
  }
)

export default customers 