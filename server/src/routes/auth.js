import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { 
  UserService, 
  generateTokens, 
  verifyToken,
  setAuthCookies,
  clearAuthCookies,
  loginSchema 
} from '../middleware/auth-simple.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'

const auth = new Hono()

// ================================
// AUTHENTICATION ENDPOINTS
// ================================

// Login endpoint with rate limiting
auth.post('/login', 
  authRateLimiter(),
  async (c) => {
    try {
      console.log('Login endpoint called')
      
      const body = await c.req.json()
      console.log('Request body:', body)
      
      const { email, password } = loginSchema.parse(body)
      console.log('Parsed credentials:', { email, password: '***' })
      
      // Initialize services
      const userService = new UserService(c.env.DB)
      console.log('UserService initialized')
      
      // Find user by email
      const user = await userService.findByEmail(email)
      console.log('User found:', user ? { id: user.id, email: user.email, role: user.role } : 'null')
      
      if (!user) {
        console.log('User not found, returning 401')
        return c.json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }, 401)
      }
      
      // Verify password
      console.log('Verifying password...')
      const isValidPassword = await userService.verifyPassword(password, user.password_hash)
      console.log('Password valid:', isValidPassword)
      
      if (!isValidPassword) {
        console.log('Invalid password, returning 401')
        return c.json({
          error: 'Unauthorized', 
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }, 401)
      }
      
      // Check if user is active
      if (!user.is_active) {
        console.log('User not active, returning 401')
        return c.json({
          error: 'Unauthorized',
          message: 'Account is deactivated',
          code: 'ACCOUNT_DEACTIVATED'
        }, 401)
      }
      
      // Generate JWT tokens
      console.log('Generating JWT tokens...')
      const { accessToken } = await generateTokens({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }, c.env)
      console.log('JWT token generated successfully')
      
      // Update last login
      console.log('Updating last login...')
      await userService.updateLastLogin(user.id)
      console.log('Last login updated')
      
      // Set secure cookies
      console.log('Setting auth cookies...')
      setAuthCookies(c, accessToken)
      console.log('Auth cookies set')
      
      // Return success response
      console.log('Returning success response')
      return c.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            lastLogin: new Date().toISOString()
          },
          token: accessToken,
          expiresIn: 24 * 60 * 60 // 24 hours in seconds
        }
      })
      
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error stack:', error.stack)
      
      if (error.name === 'ZodError') {
        console.log('Validation error detected')
        return c.json({
          error: 'Validation Error',
          message: 'Invalid input data',
          details: error.errors,
          code: 'VALIDATION_ERROR'
        }, 400)
      }
      
      console.log('Internal server error')
      return c.json({
        error: 'Internal Server Error',
        message: 'Login failed',
        code: 'LOGIN_ERROR'
      }, 500)
    }
  }
)

// Logout endpoint
auth.post('/logout', async (c) => {
  try {
    // Clear auth cookies
    clearAuthCookies(c)
    
    return c.json({
      success: true,
      message: 'Logged out successfully'
    })
    
  } catch (error) {
    console.error('Logout error:', error)
    
    // Clear cookies anyway
    clearAuthCookies(c)
    
    return c.json({
      success: true,
      message: 'Logged out successfully'
    })
  }
})

// Get current user profile
auth.get('/me', async (c) => {
  try {
    // Get token from header or cookie
    let token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      token = getCookie(c, 'access_token')
    }
    
    if (!token) {
      return c.json({
        error: 'Unauthorized',
        message: 'No authentication token provided',
        code: 'NO_TOKEN'
      }, 401)
    }
    
    // Verify token
    const payload = await verifyToken(token, c.env)
    
    if (!payload) {
      return c.json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      }, 401)
    }
    
    // Get fresh user data from database
    let userData = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role
    }
    
    if (c.env.DB) {
      const userService = new UserService(c.env.DB)
      const user = await userService.findByEmail(payload.email)
      
      if (user && user.is_active) {
        userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          lastLogin: user.last_login_at,
          createdAt: user.created_at
        }
      }
    }
    
    return c.json({
      success: true,
      data: {
        user: userData
      }
    })
    
  } catch (error) {
    console.error('Get profile error:', error)
    
    return c.json({
      error: 'Internal Server Error',
      message: 'Failed to get user profile',
      code: 'PROFILE_ERROR'
    }, 500)
  }
})

// Check authentication status (public endpoint)
auth.get('/status', async (c) => {
  try {
    let token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      token = getCookie(c, 'access_token')
    }
    
    if (!token) {
      return c.json({
        success: true,
        data: {
          authenticated: false,
          user: null
        }
      })
    }
    
    const payload = await verifyToken(token, c.env)
    
    if (!payload) {
      return c.json({
        success: true,
        data: {
          authenticated: false,
          user: null
        }
      })
    }
    
    return c.json({
      success: true,
      data: {
        authenticated: true,
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role
        }
      }
    })
    
  } catch (error) {
    console.error('Auth status error:', error)
    
    return c.json({
      success: true,
      data: {
        authenticated: false,
        user: null
      }
    })
  }
})

export default auth 