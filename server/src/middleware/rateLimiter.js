// ================================
// RATE LIMITING MIDDLEWARE
// ================================

const rateLimitStore = new Map()

export function rateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests',
    standardHeaders = true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders = false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests = false, // Don't count successful requests
    skipFailedRequests = false, // Don't count failed requests
    keyGenerator = (c) => {
      // Get client IP from Cloudflare headers
      return c.req.header('CF-Connecting-IP') || 
             c.req.header('X-Forwarded-For') || 
             c.req.header('X-Real-IP') || 
             'unknown'
    }
  } = options

  return async (c, next) => {
    const key = keyGenerator(c)
    const now = Date.now()
    
    // Get or create rate limit data for this key
    let rateLimitData = rateLimitStore.get(key)
    
    if (!rateLimitData || now - rateLimitData.resetTime > windowMs) {
      // Reset the rate limit data
      rateLimitData = {
        count: 0,
        resetTime: now + windowMs,
        firstRequest: now
      }
    }
    
    // Increment the request count
    rateLimitData.count++
    rateLimitStore.set(key, rateLimitData)
    
    // Calculate remaining requests and time until reset
    const remaining = Math.max(0, max - rateLimitData.count)
    const resetTime = Math.ceil(rateLimitData.resetTime / 1000) // Convert to seconds
    
    // Add rate limit headers
    if (standardHeaders) {
      c.header('RateLimit-Limit', max.toString())
      c.header('RateLimit-Remaining', remaining.toString())
      c.header('RateLimit-Reset', resetTime.toString())
      c.header('RateLimit-Policy', `${max};w=${Math.floor(windowMs / 1000)}`)
    }
    
    if (legacyHeaders) {
      c.header('X-RateLimit-Limit', max.toString())
      c.header('X-RateLimit-Remaining', remaining.toString())
      c.header('X-RateLimit-Reset', resetTime.toString())
    }
    
    // Check if rate limit exceeded
    if (rateLimitData.count > max) {
      const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000)
      c.header('Retry-After', retryAfter.toString())
      
      return c.json({
        error: 'Rate Limit Exceeded',
        message: typeof message === 'string' ? message : message.message || 'Too many requests',
        retryAfter,
        limit: max,
        remaining: 0,
        reset: resetTime
      }, 429)
    }
    
    // Cleanup old entries periodically
    if (rateLimitStore.size > 10000) {
      cleanupExpiredEntries()
    }
    
    await next()
    
    // Check if we should count this request
    const shouldSkip = (
      (skipSuccessfulRequests && c.res.status < 400) ||
      (skipFailedRequests && c.res.status >= 400)
    )
    
    if (shouldSkip) {
      // Decrement the count if we're skipping this request
      rateLimitData.count--
      rateLimitStore.set(key, rateLimitData)
    }
  }
}

// ================================
// CLEANUP UTILITIES
// ================================
function cleanupExpiredEntries() {
  const now = Date.now()
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// ================================
// SPECIALIZED RATE LIMITERS
// ================================

// Strict rate limiter for auth endpoints
export function authRateLimiter() {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per 15 minutes
    message: {
      error: 'Too many authentication attempts',
      message: 'Please wait before trying to login again',
      code: 'AUTH_RATE_LIMIT'
    },
    skipSuccessfulRequests: true // Don't count successful logins
  })
}

// Lenient rate limiter for public endpoints
export function publicRateLimiter() {
  return rateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: 'Rate limit exceeded for public endpoints'
  })
}

// Strict rate limiter for sensitive operations
export function sensitiveRateLimiter() {
  return rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
    message: {
      error: 'Rate limit exceeded',
      message: 'This operation is rate limited. Please try again later.',
      code: 'SENSITIVE_RATE_LIMIT'
    }
  })
}

// ================================
// RATE LIMIT BY USER ID
// ================================
export function userRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000,
    max = 1000,
    message = 'User rate limit exceeded'
  } = options

  return rateLimiter({
    ...options,
    windowMs,
    max,
    message,
    keyGenerator: (c) => {
      const user = c.get('user')
      return user ? `user:${user.id}` : `ip:${c.req.header('CF-Connecting-IP') || 'unknown'}`
    }
  })
}

// ================================
// EXPORTS
// ================================
export {
  cleanupExpiredEntries,
  rateLimitStore
} 