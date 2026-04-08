const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Course Model ====================
const Course = sequelize.define('Course', {
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
    allowNull: false,
    references: {
      model: 'semesters',
      key: 'id'
    }
  },
  course_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'كود المادة الفريد'
  },
  course_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  arabic_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  credit_hours: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    comment: 'عدد الساعات المعتمدة'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'courses',
  timestamps: false,
  indexes: [
    { fields: ['course_code'] },
    { fields: ['specialty_id', 'academic_year_id', 'semester_id'] },
    { fields: ['is_active'] }
  ]
});

module.exports = Course;