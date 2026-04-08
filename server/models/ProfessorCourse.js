const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Professor Course Model ====================
const ProfessorCourse = sequelize.define('ProfessorCourse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  professor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'professors',
      key: 'id'
    }
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
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
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'هل هذا الأستاذ الأساسي للمادة؟'
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
  tableName: 'professor_courses',
  timestamps: false,
  indexes: [
    { fields: ['professor_id', 'course_id', 'academic_year_id', 'semester_id'], unique: true, name: 'prof_course_unique_idx' },
    { fields: ['professor_id'], name: 'prof_id_idx' },
    { fields: ['course_id'], name: 'course_id_idx' }
  ]
});

module.exports = ProfessorCourse;