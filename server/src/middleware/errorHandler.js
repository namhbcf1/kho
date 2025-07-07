// ================================
// ERROR HANDLING MIDDLEWARE
// ================================

export function errorHandler(err, c) {
  console.error('Error caught by error handler:', {
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
    timestamp: new Date().toISOString()
  })

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return c.json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: err.details || err.message,
      code: 'VALIDATION_ERROR'
    }, 400)
  }

  if (err.name === 'UnauthorizedError') {
    return c.json({
      error: 'Unauthorized',
      message: 'Authentication required',
      code: 'UNAUTHORIZED'
    }, 401)
  }

  if (err.name === 'ForbiddenError') {
    return c.json({
      error: 'Forbidden',
      message: 'Insufficient permissions',
      code: 'FORBIDDEN'
    }, 403)
  }

  if (err.name === 'NotFoundError') {
    return c.json({
      error: 'Not Found',
      message: 'Resource not found',
      code: 'NOT_FOUND'
    }, 404)
  }

  if (err.name === 'ConflictError') {
    return c.json({
      error: 'Conflict',
      message: 'Resource conflict',
      details: err.message,
      code: 'CONFLICT'
    }, 409)
  }

  if (err.name === 'DatabaseError') {
    return c.json({
      error: 'Database Error',
      message: 'Database operation failed',
      code: 'DATABASE_ERROR'
    }, 500)
  }

  // Default internal server error
  return c.json({
    error: 'Internal Server Error',
    message: c.env?.ENVIRONMENT === 'production' 
      ? 'Something went wrong' 
      : err.message,
    code: 'INTERNAL_ERROR',
    ...(c.env?.ENVIRONMENT !== 'production' && { stack: err.stack })
  }, 500)
}

// ================================
// CUSTOM ERROR CLASSES
// ================================

export class ValidationError extends Error {
  constructor(message, details = null) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Not Found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  constructor(message = 'Conflict') {
    super(message)
    this.name = 'ConflictError'
  }
}

export class DatabaseError extends Error {
  constructor(message = 'Database Error') {
    super(message)
    this.name = 'DatabaseError'
  }
}

// ================================
// ERROR UTILITIES
// ================================

export function asyncHandler(fn) {
  return async (c, next) => {
    try {
      await fn(c, next)
    } catch (error) {
      errorHandler(error, c)
    }
  }
}

export function validateInput(schema) {
  return async (c, next) => {
    try {
      const body = await c.req.json()
      const validated = schema.parse(body)
      c.set('validatedInput', validated)
      await next()
    } catch (error) {
      if (error.name === 'ZodError') {
        throw new ValidationError('Invalid input data', error.errors)
      }
      throw error
    }
  }
} 