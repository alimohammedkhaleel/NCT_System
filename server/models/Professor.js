const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Professor Model ====================
const Professor = sequelize.define('Professor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  professor_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'كود الأستاذ الفريد'
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'القسم/الإدارة'
  },
  hire_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'تاريخ التعيين'
  },
  specialization: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'التخصص العلمي'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  specialty_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'specialties',
      key: 'id'
    },
    comment: 'التخصص المرتبط به (اختياري)'
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
  tableName: 'professors',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['professor_code'] },
    { fields: ['is_active'] }
  ]
});

module.exports = Professor;
