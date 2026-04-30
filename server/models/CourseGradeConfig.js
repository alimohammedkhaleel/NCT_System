const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseGradeConfig = sequelize.define('CourseGradeConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'courses',
      key: 'id'
    },
    comment: 'المادة المرتبطة بهذه الإعدادات'
  },
  
  // النسب المئوية (يجب أن يكون المجموع = 100%)
  ass1_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 15.00,
    allowNull: false,
    comment: 'نسبة الواجب الأول من الدرجة النهائية (%)'
  },
  ass2_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 15.00,
    allowNull: false,
    comment: 'نسبة الواجب الثاني من الدرجة النهائية (%)'
  },
  final_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 70.00,
    allowNull: false,
    comment: 'نسبة الامتحان النهائي من الدرجة النهائية (%)'
  },
  
  // الدرجات القصوى
  ass1_max: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 30.00,
    allowNull: false,
    comment: 'الدرجة القصوى للواجب الأول'
  },
  ass2_max: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 30.00,
    allowNull: false,
    comment: 'الدرجة القصوى للواجب الثاني'
  },
  final_max: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 150.00,
    allowNull: false,
    comment: 'الدرجة القصوى للامتحان النهائي'
  },
  
  // قيم P/M/D
  p_value: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 30.00,
    allowNull: false,
    comment: 'قيمة Pass (P)'
  },
  m_value: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 21.00,
    allowNull: false,
    comment: 'قيمة Merit (M)'
  },
  d_value: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 15.00,
    allowNull: false,
    comment: 'قيمة Distinction (D)'
  },
  
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'course_grade_configs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { 
      unique: true,
      fields: ['course_id'],
      name: 'course_grade_configs_course_id_unique'
    }
  ]
});

// Validation hook - التحقق من أن مجموع النسب = 100%
CourseGradeConfig.beforeSave(async (config) => {
  const total = parseFloat(config.ass1_percentage) + 
                parseFloat(config.ass2_percentage) + 
                parseFloat(config.final_percentage);
  
  if (Math.abs(total - 100) > 0.01) {
    throw new Error('مجموع النسب المئوية يجب أن يساوي 100%');
  }
  
  // التحقق من أن جميع القيم موجبة
  const fields = [
    'ass1_percentage', 'ass2_percentage', 'final_percentage',
    'ass1_max', 'ass2_max', 'final_max',
    'p_value', 'm_value', 'd_value'
  ];
  
  for (const field of fields) {
    if (parseFloat(config[field]) <= 0) {
      throw new Error(`${field} يجب أن يكون أكبر من صفر`);
    }
  }
});

module.exports = CourseGradeConfig;
