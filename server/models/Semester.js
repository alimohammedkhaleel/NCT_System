const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Semester Model ====================
const Semester = sequelize.define('Semester', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  academic_year_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'academic_years',
      key: 'id'
    }
  },
  semester_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'اسم الترم: Fall/Spring/Summer أو الفصل الدراسي الأول/الثاني'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'تاريخ بداية الترم'
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'تاريخ نهاية الترم'
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
  tableName: 'semesters',
  timestamps: false,
  indexes: [
    { fields: ['academic_year_id', 'semester_name'] },
    { fields: ['is_active'] }
  ]
});

module.exports = Semester;
