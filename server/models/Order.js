const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_number: {
    type: DataTypes.STRING(50),
    unique: true
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null for cases where customer is not selected (e.g., walk-in)
    references: {
      model: 'customers', // This is the table name
      key: 'id'
    }
  },
  customer_name: {
    type: DataTypes.STRING(255),
    defaultValue: 'Khách hàng'
  },
  customer_phone: {
    type: DataTypes.STRING(20)
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // Default to admin user
    references: {
      model: 'users',
      key: 'id'
    }
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'branches',
      key: 'id'
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'completed'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Order; 