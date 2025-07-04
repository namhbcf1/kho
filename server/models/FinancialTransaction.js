const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FinancialTransaction = sequelize.define('FinancialTransaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
      validate: {
        isIn: [['income', 'expense']],
      },
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100],
      },
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'card', 'transfer', 'ewallet'),
      allowNull: false,
      defaultValue: 'cash',
    },
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'suppliers',
        key: 'id',
      },
    },
    reference_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Type of reference (order, purchase_order, etc.)',
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the referenced entity',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'financial_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['type'],
      },
      {
        fields: ['category'],
      },
      {
        fields: ['transaction_date'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['customer_id'],
      },
      {
        fields: ['supplier_id'],
      },
      {
        fields: ['payment_method'],
      },
      {
        fields: ['reference_type', 'reference_id'],
      },
    ],
  });

  // Instance methods
  FinancialTransaction.prototype.getFormattedAmount = function() {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(this.amount);
  };

  FinancialTransaction.prototype.getFormattedDate = function() {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(this.transaction_date));
  };

  // Class methods
  FinancialTransaction.getCategories = () => {
    return {
      income: [
        'Bán hàng',
        'Dịch vụ',
        'Thu khác',
        'Lãi ngân hàng',
        'Hoàn tiền',
        'Thu nợ khách hàng',
        'Thu hồi vốn',
      ],
      expense: [
        'Nhập hàng',
        'Tiền thuê',
        'Điện nước',
        'Lương nhân viên',
        'Marketing',
        'Vận chuyển',
        'Bảo trì sửa chữa',
        'Chi phí khác',
        'Trả nợ nhà cung cấp',
        'Thuế',
        'Bảo hiểm',
      ],
    };
  };

  FinancialTransaction.getPaymentMethods = () => {
    return [
      { value: 'cash', label: 'Tiền mặt' },
      { value: 'card', label: 'Thẻ' },
      { value: 'transfer', label: 'Chuyển khoản' },
      { value: 'ewallet', label: 'Ví điện tử' },
    ];
  };

  // Associations
  FinancialTransaction.associate = (models) => {
    // FinancialTransaction belongs to User
    FinancialTransaction.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    // FinancialTransaction belongs to Customer (optional)
    FinancialTransaction.belongsTo(models.Customer, {
      foreignKey: 'customer_id',
      as: 'customer',
    });

    // FinancialTransaction belongs to Supplier (optional)
    FinancialTransaction.belongsTo(models.Supplier, {
      foreignKey: 'supplier_id',
      as: 'supplier',
    });
  };

  return FinancialTransaction;
}; 