const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Import User model (assuming you have one)
// const User = require('../models/User');

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: {
    error: 'Too many registration attempts, please try again later'
  }
});

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Validation middleware
const validateLogin = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const validateRegister = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('fullName')
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'cashier'])
    .withMessage('Invalid role')
];

// Temporary in-memory user storage (replace with database)
let users = [
  {
    id: 1,
    username: 'admin',
    password: '$2b$10$TZur.Mrz1cFGKBE4vv0tm.oBR14yIxYGLBHcPSg5oHXMwpfiNfB6C', // admin123
    role: 'admin',
    fullName: 'System Administrator',
    email: 'admin@example.com',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: null
  }
];

// Helper function to hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Helper function to verify password
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
};

// Helper function to log activity (replace with database)
const logActivity = (userId, action, details, ipAddress) => {
  console.log(`[${new Date().toISOString()}] User ${userId}: ${action} - ${details} (IP: ${ipAddress})`);
};

// Routes

// Login
router.post('/login', loginLimiter, validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: errors.array()
      });
    }

    const { username, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    // Find user
    const user = users.find(u => u.username === username && u.isActive);
    if (!user) {
      logActivity(null, 'LOGIN_FAILED', `Failed login attempt for username: ${username}`, clientIP);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      logActivity(user.id, 'LOGIN_FAILED', 'Invalid password', clientIP);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();

    // Generate token
    const token = generateToken(user);

    // Log successful login
    logActivity(user.id, 'LOGIN_SUCCESS', 'User logged in successfully', clientIP);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register (admin only)
router.post('/register', authenticateToken, requireRole(['admin']), registerLimiter, validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: errors.array()
      });
    }

    const { username, password, fullName, email, role = 'cashier' } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    // Check if username already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      role,
      fullName,
      email: email || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    users.push(newUser);

    // Log activity
    logActivity(req.user.id, 'CREATE_USER', `Created user: ${username} with role: ${role}`, clientIP);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: newUser.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id && u.isActive);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('fullName').isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: errors.array()
      });
    }

    const { fullName, email } = req.body;
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user data
    user.fullName = fullName;
    user.email = email || null;
    user.updatedAt = new Date().toISOString();

    // Log activity
    logActivity(req.user.id, 'UPDATE_PROFILE', 'Updated user profile');

    res.json({ success: true, message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      logActivity(req.user.id, 'CHANGE_PASSWORD_FAILED', 'Invalid current password', clientIP);
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedNewPassword;
    user.updatedAt = new Date().toISOString();

    // Log activity
    logActivity(req.user.id, 'CHANGE_PASSWORD_SUCCESS', 'Password changed successfully', clientIP);

    res.json({ success: true, message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Logout
router.post('/logout', authenticateToken, (req, res) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress;

    // Log logout activity
    logActivity(req.user.id, 'LOGOUT', 'User logged out', clientIP);

    res.json({ success: true, message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get all users (admin and manager only)
router.get('/users', authenticateToken, requireRole(['admin', 'manager']), (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    let filteredUsers = users.filter(u => u.isActive);

    // Filter by role
    if (role && ['admin', 'manager', 'cashier'].includes(role)) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.username.toLowerCase().includes(searchLower) ||
        u.fullName.toLowerCase().includes(searchLower) ||
        (u.email && u.email.toLowerCase().includes(searchLower))
      );
    }

    const total = filteredUsers.length;
    const paginatedUsers = filteredUsers
      .slice(offset, offset + parseInt(limit))
      .map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        fullName: u.fullName,
        email: u.email,
        isActive: u.isActive,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin
      }));

    res.json({
      users: paginatedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// Export middleware for use in other routes
module.exports = {
  router,
  authenticateToken,
  requireRole
}; 