const express = require('express');
const { Customer, Order } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// GET /api/customers - Get all customers with optional search
router.get('/', async (req, res) => {
  try {
    const { search, phone, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    
    // Search by phone number
    if (phone) {
      whereClause.phone = { [Op.like]: `%${phone}%` };
    }
    
    // General search
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const customers = await Customer.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'total', 'status', 'created_at'],
          required: false
        }
      ]
    });

    // Calculate customer statistics
    const customersWithStats = customers.rows.map(customer => {
      const customerData = customer.toJSON();
      const totalOrders = customer.orders?.length || 0;
      const totalSpent = customer.orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      
      return {
        ...customerData,
        total_orders: totalOrders,
        total_spent: totalSpent,
        current_debt: customerData.current_debt || 0
      };
    });

    res.json({
      success: true,
      data: customersWithStats,
      pagination: {
        total: customers.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(customers.count / limit)
      },
      message: 'Customers retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/customers/:id - Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'total', 'status', 'created_at', 'payment_method'],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Calculate customer statistics
    const customerData = customer.toJSON();
    const totalOrders = customer.orders?.length || 0;
    const totalSpent = customer.orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const paidOrders = customer.orders?.filter(order => order.status === 'paid').length || 0;
    const pendingOrders = customer.orders?.filter(order => order.status === 'pending').length || 0;

    const customerWithStats = {
      ...customerData,
      total_orders: totalOrders,
      total_spent: totalSpent,
      paid_orders: paidOrders,
      pending_orders: pendingOrders,
      current_debt: customerData.current_debt || 0
    };

    res.json({
      success: true,
      data: customerWithStats,
      message: 'Customer retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/customers - Create new customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address, customer_type = 'regular' } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      });
    }

    // Check if phone already exists
    const existingCustomer = await Customer.findOne({ where: { phone } });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Phone number already exists'
      });
    }

    // Generate customer code
    const customerCount = await Customer.count();
    const customerCode = `KH${String(customerCount + 1).padStart(4, '0')}`;

    // Create customer
    const customer = await Customer.create({
      code: customerCode,
      name,
      phone,
      email,
      address,
      customer_type,
      current_debt: 0
    });

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, address, customer_type, current_debt } = req.body;
    const customerId = req.params.id;

    // Find customer
    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if phone already exists (if changing phone)
    if (phone && phone !== customer.phone) {
      const existingCustomer = await Customer.findOne({ where: { phone } });
      if (existingCustomer) {
        return res.status(409).json({
          success: false,
          message: 'Phone number already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {
      name: name || customer.name,
      phone: phone || customer.phone,
      email: email || customer.email,
      address: address || customer.address,
      customer_type: customer_type || customer.customer_type
    };

    // Update debt if provided
    if (current_debt !== undefined) {
      updateData.current_debt = current_debt;
    }

    // Update customer
    await customer.update(updateData);

    res.json({
      success: true,
      data: customer,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer has orders
    const orderCount = await Order.count({ where: { customer_id: req.params.id } });
    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer with existing orders'
      });
    }

    await customer.destroy();

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/customers/:id/stats - Get customer statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'total', 'status', 'created_at', 'payment_method'],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const orders = customer.orders || [];
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const paidOrders = orders.filter(order => order.status === 'paid').length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Monthly spending for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlySpending = [];
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(sixMonthsAgo);
      monthStart.setMonth(monthStart.getMonth() + i);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= monthStart && orderDate < monthEnd;
      });
      
      const monthTotal = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      monthlySpending.push({
        month: monthStart.toISOString().slice(0, 7),
        total: monthTotal,
        orders: monthOrders.length
      });
    }

    const stats = {
      total_orders: totalOrders,
      total_spent: totalSpent,
      paid_orders: paidOrders,
      pending_orders: pendingOrders,
      average_order_value: averageOrderValue,
      current_debt: customer.current_debt || 0,
      monthly_spending: monthlySpending,
      customer_since: customer.created_at
    };

    res.json({
      success: true,
      data: stats,
      message: 'Customer statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 