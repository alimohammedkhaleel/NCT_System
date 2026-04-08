const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Grade Settings Model ====================
const GradeSettings = sequelize.define('GradeSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  setting_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'اسم الإعداد (مثل: pass_grade_value, merit_grade_value, etc)'
  },
  setting_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'قيمة الإعداد'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'وصف الإعداد'
  },
  setting_type: {
    type: DataTypes.ENUM('grade_value', 'max_score', 'other'),
    defaultValue: 'other',
    comment: 'نوع الإعداد'
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'الأدمن الذي عدّل الإعداد'
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
  tableName: 'grade_settings',
  timestamps: false,
  indexes: [
    { fields: ['setting_name'] },
    { fields: ['setting_type'] }
  ]
});

module.exports = GradeSettings;
