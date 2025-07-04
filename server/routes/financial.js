const express = require('express');
const { FinancialTransaction, User, Customer, Supplier } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// GET /api/financial/transactions - Get all financial transactions
router.get('/transactions', async (req, res) => {
  try {
    const { 
      type, 
      category, 
      start_date, 
      end_date, 
      page = 1, 
      limit = 50,
      payment_method 
    } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    
    // Filter by type (income/expense)
    if (type) {
      whereClause.type = type;
    }
    
    // Filter by category
    if (category) {
      whereClause.category = { [Op.like]: `%${category}%` };
    }
    
    // Filter by payment method
    if (payment_method) {
      whereClause.payment_method = payment_method;
    }
    
    // Filter by date range
    if (start_date || end_date) {
      whereClause.transaction_date = {};
      if (start_date) {
        whereClause.transaction_date[Op.gte] = new Date(start_date);
      }
      if (end_date) {
        whereClause.transaction_date[Op.lte] = new Date(end_date);
      }
    }

    const transactions = await FinancialTransaction.findAndCountAll({
      where: whereClause,
      order: [['transaction_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name']
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    res.json({
      success: true,
      data: transactions.rows,
      pagination: {
        total: transactions.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(transactions.count / limit)
      },
      message: 'Financial transactions retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching financial transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/financial/transactions - Create new financial transaction
router.post('/transactions', async (req, res) => {
  try {
    const { 
      type, 
      category, 
      amount, 
      description, 
      payment_method, 
      transaction_date,
      customer_id,
      supplier_id,
      user_id = 1 // Default to current user
    } = req.body;

    // Validate required fields
    if (!type || !category || !amount || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Type, category, amount, and payment method are required'
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "income" or "expense"'
      });
    }

    // Create transaction
    const transaction = await FinancialTransaction.create({
      type,
      category,
      amount,
      description,
      payment_method,
      transaction_date: transaction_date || new Date(),
      customer_id,
      supplier_id,
      user_id
    });

    // Fetch the created transaction with related data
    const createdTransaction = await FinancialTransaction.findByPk(transaction.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name']
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdTransaction,
      message: 'Financial transaction created successfully'
    });
  } catch (error) {
    console.error('Error creating financial transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// PUT /api/financial/transactions/:id - Update financial transaction
router.put('/transactions/:id', async (req, res) => {
  try {
    const { 
      type, 
      category, 
      amount, 
      description, 
      payment_method, 
      transaction_date,
      customer_id,
      supplier_id
    } = req.body;
    const transactionId = req.params.id;

    // Find transaction
    const transaction = await FinancialTransaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Financial transaction not found'
      });
    }

    // Prepare update data
    const updateData = {
      type: type || transaction.type,
      category: category || transaction.category,
      amount: amount || transaction.amount,
      description: description || transaction.description,
      payment_method: payment_method || transaction.payment_method,
      transaction_date: transaction_date || transaction.transaction_date,
      customer_id: customer_id !== undefined ? customer_id : transaction.customer_id,
      supplier_id: supplier_id !== undefined ? supplier_id : transaction.supplier_id
    };

    // Validate amount
    if (amount && amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Update transaction
    await transaction.update(updateData);

    // Fetch the updated transaction with related data
    const updatedTransaction = await FinancialTransaction.findByPk(transactionId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'full_name']
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedTransaction,
      message: 'Financial transaction updated successfully'
    });
  } catch (error) {
    console.error('Error updating financial transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/financial/transactions/:id - Delete financial transaction
router.delete('/transactions/:id', async (req, res) => {
  try {
    const transaction = await FinancialTransaction.findByPk(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Financial transaction not found'
      });
    }

    await transaction.destroy();

    res.json({
      success: true,
      message: 'Financial transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting financial transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/financial/summary - Get financial summary
router.get('/summary', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let whereClause = {};
    
    // Filter by date range
    if (start_date || end_date) {
      whereClause.transaction_date = {};
      if (start_date) {
        whereClause.transaction_date[Op.gte] = new Date(start_date);
      }
      if (end_date) {
        whereClause.transaction_date[Op.lte] = new Date(end_date);
      }
    }

    // Get all transactions for the period
    const transactions = await FinancialTransaction.findAll({
      where: whereClause,
      order: [['transaction_date', 'ASC']]
    });

    // Calculate summary statistics
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = totalIncome - totalExpense;

    // Calculate today's statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return transactionDate >= today && transactionDate < tomorrow;
    });

    const todayIncome = todayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const todayExpense = todayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate monthly statistics
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return transactionDate >= currentMonth;
    });

    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryBreakdown = {};
    transactions.forEach(transaction => {
      if (!categoryBreakdown[transaction.category]) {
        categoryBreakdown[transaction.category] = { income: 0, expense: 0 };
      }
      if (transaction.type === 'income') {
        categoryBreakdown[transaction.category].income += transaction.amount;
      } else {
        categoryBreakdown[transaction.category].expense += transaction.amount;
      }
    });

    // Payment method breakdown
    const paymentMethodBreakdown = {};
    transactions.forEach(transaction => {
      if (!paymentMethodBreakdown[transaction.payment_method]) {
        paymentMethodBreakdown[transaction.payment_method] = { income: 0, expense: 0 };
      }
      if (transaction.type === 'income') {
        paymentMethodBreakdown[transaction.payment_method].income += transaction.amount;
      } else {
        paymentMethodBreakdown[transaction.payment_method].expense += transaction.amount;
      }
    });

    const summary = {
      total_income: totalIncome,
      total_expense: totalExpense,
      net_profit: netProfit,
      today_income: todayIncome,
      today_expense: todayExpense,
      today_profit: todayIncome - todayExpense,
      month_income: monthIncome,
      month_expense: monthExpense,
      month_profit: monthIncome - monthExpense,
      category_breakdown: categoryBreakdown,
      payment_method_breakdown: paymentMethodBreakdown,
      transaction_count: transactions.length
    };

    res.json({
      success: true,
      data: summary,
      message: 'Financial summary retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 