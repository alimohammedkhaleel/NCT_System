const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Activity Log Model ====================
const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'نوع الإجراء (create, update, delete, view, login, logout)'
  },
  entity: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'نوع الكيان المتأثر (User, Course, Grade, Payment, إلخ)'
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'معرف الكيان'
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'تفاصيل إضافية بصيغة JSON'
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'عنوان IP'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'معلومات الجهاز والمتصفح'
  },
  status: {
    type: DataTypes.ENUM('success', 'failed', 'pending'),
    defaultValue: 'success'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'activity_logs',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['action'] },
    { fields: ['entity'] },
    { fields: ['created_at'] }
  ]
});

module.exports = ActivityLog;
