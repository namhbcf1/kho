const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BranchInventory = sequelize.define('BranchInventory', {
    branch_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'branches',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    min_stock_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'branch_inventory',
    timestamps: false,
    indexes: [
      { fields: ['branch_id'] },
      { fields: ['product_id'] }
    ]
  });

  return BranchInventory;
}; 