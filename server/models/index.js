const { sequelize } = require('../config/database');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Customer = require('./Customer');
const User = require('./User');
const FinancialTransaction = require('./FinancialTransaction');
const BranchInventory = require('./BranchInventory')(sequelize);
const InventoryTransaction = require('./InventoryTransaction')(sequelize);

// Define all models
const models = {
  Product,
  Order,
  OrderItem,
  Customer,
  User,
  FinancialTransaction,
  BranchInventory,
  InventoryTransaction
};

// Define relationships
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

Order.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });

// User relationships
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(FinancialTransaction, { foreignKey: 'user_id', as: 'financial_transactions' });
FinancialTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Financial transaction relationships
FinancialTransaction.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Customer.hasMany(FinancialTransaction, { foreignKey: 'customer_id', as: 'financial_transactions' });

// Call associate methods if they exist
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
}; 