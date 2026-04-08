const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Student Enrollment Model ====================
const StudentEnrollment = sequelize.define('StudentEnrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
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
  enrollment_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('enrolled', 'dropped', 'completed', 'failed'),
    defaultValue: 'enrolled'
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
  tableName: 'student_enrollments',
  timestamps: false,
  indexes: [
    { fields: ['student_id', 'course_id', 'academic_year_id', 'semester_id'], unique: true, name: 'student_course_unique_idx' },
    { fields: ['student_id'], name: 'student_id_idx' },
    { fields: ['course_id'], name: 'enrollment_course_idx' },
    { fields: ['status'], name: 'status_idx' }
  ]
});

module.exports = StudentEnrollment;