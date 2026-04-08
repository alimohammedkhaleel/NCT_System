const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Payment Model ====================
const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  receipt_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'رقم الإيصال الفريد'
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  invoice_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'fee_invoices',
      key: 'id'
    },
    comment: 'الفاتورة المرتبطة (اختيارية)'
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'مبلغ الدفع'
  },
  payment_method: {
    type: DataTypes.ENUM('نقدي', 'تحويل بنكي', 'شيك', 'بطاقة ائتمان'),
    allowNull: false,
    defaultValue: 'نقدي',
    comment: 'طريقة الدفع'
  },
  transaction_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'معرف التحويل البنكي'
  },
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'اسم البنك'
  },
  check_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'رقم الشيك'
  },
  payment_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'تاريخ الدفع'
  },
  collected_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'الموظف الذي سجل الدفع'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'payments',
  timestamps: false,
  indexes: [
    { fields: ['receipt_number'] },
    { fields: ['student_id'] },
    { fields: ['invoice_id'] },
    { fields: ['payment_date'] }
  ]
});

module.exports = Payment;
