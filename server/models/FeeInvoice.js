const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Fee Invoice Model ====================
const FeeInvoice = sequelize.define('FeeInvoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoice_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'رقم الفاتورة الفريد (يُولّد تلقائياً)'
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    }
  },
  academic_year_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'academic_years',
      key: 'id'
    }
  },
  semester_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'semesters',
      key: 'id'
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    comment: 'المبلغ الكلي للفاتورة'
  },
  paid_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    comment: 'المبلغ المدفوع'
  },
  status: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue'),
    defaultValue: 'pending',
    comment: 'حالة الفاتورة'
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'تاريخ الاستحقاق'
  },
  issued_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'المستخدم الذي أنشأ الفاتورة'
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
  tableName: 'fee_invoices',
  timestamps: false,
  indexes: [
    { fields: ['invoice_number'] },
    { fields: ['student_id'] },
    { fields: ['status'] },
    { fields: ['due_date'] }
  ]
});

module.exports = FeeInvoice;
