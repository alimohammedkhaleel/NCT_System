const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Academic Year Model ====================
const AcademicYear = sequelize.define('AcademicYear', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  specialty_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'specialties',
      key: 'id'
    }
  },
  year_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '1-4 سنة دراسية',
    validate: {
      min: 1,
      max: 4
    }
  },
  academic_season: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'السنة الدراسية (مثل 2024-2025)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'academic_years',
  timestamps: false,
  indexes: [
    { fields: ['specialty_id', 'year_number'] },
    { fields: ['is_active'] }
  ]
});

module.exports = AcademicYear;
