const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==================== Grade Model ====================
const Grade = sequelize.define('Grade', {
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
  enrollment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'student_enrollments',
      key: 'id'
    }
  },
  // Assignment 1
  assignment1_grade: {
    type: DataTypes.ENUM('P', 'M', 'D'),
    allowNull: true,
    comment: 'رمز الدرجة: P=30, M=21, D=15'
  },
  assignment1_score: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'درجة الواجب الأول (0-30)'
  },
  // Assignment 2
  assignment2_grade: {
    type: DataTypes.ENUM('P', 'M', 'D'),
    allowNull: true,
    comment: 'رمز الدرجة: P=30, M=21, D=15'
  },
  assignment2_score: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'درجة الواجب الثاني (0-30)'
  },
  // Final Exam
  final_exam_score: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'درجة الامتحان النهائي (0-150)'
  },
  // Totals & Calculations
  total_score: {
    type: DataTypes.DECIMAL(6, 2),
    defaultValue: 0,
    comment: 'المجموع = assignment1 + assignment2 + final_exam'
  },
  total_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'النسبة المئوية'
  },
  grade_point: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    comment: 'نقاط GPA'
  },
  final_result: {
    type: DataTypes.ENUM('Distinction', 'Merit', 'Pass', 'Refer', 'Fail'),
    defaultValue: 'Fail',
    comment: 'النتيجة النهائية'
  },
  letter_grade: {
    type: DataTypes.STRING(3),
    allowNull: true,
    comment: 'التقدير بالحرف'
  },
  // Status tracking
  status: {
    type: DataTypes.ENUM('draft', 'pending_admin_approval', 'approved'),
    defaultValue: 'draft',
    comment: 'الحالة: draft (من الأستاذ), pending (انتظار الأدمن), approved (معتمد)'
  },
  // Submitted by professor
  professor_submitted_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'الأستاذ الذي أدخل الدرجات'
  },
  // Approved by admin
  admin_approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'الأدمن الذي اعتمد الدرجات'
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'تاريخ الاعتماد'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'ملاحظات إضافية'
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
  tableName: 'grades',
  timestamps: false,
  indexes: [
    { fields: ['student_id', 'course_id', 'academic_year_id', 'semester_id'], unique: true },
    { fields: ['status'] },
    { fields: ['professor_submitted_by'] },
    { fields: ['admin_approved_by'] }
  ]
});

// Calculate totals and determine grade before save
Grade.beforeSave(async (grade) => {
  // تحويل الرموز إلى درجات
  const assignmentScores = {
    'D': 30,
    'M': 21,
    'P': 15
  };

  // حساب درجات الواجبات
  if (!grade.assignment1_score || grade.assignment1_score === 0) {
    grade.assignment1_score = assignmentScores[grade.assignment1_grade] || 0;
  }

  if (!grade.assignment2_score || grade.assignment2_score === 0) {
    grade.assignment2_score = assignmentScores[grade.assignment2_grade] || 0;
  }

  // حساب المجموع
  grade.total_score = (grade.assignment1_score || 0) + (grade.assignment2_score || 0) + (grade.final_exam_score || 0);

  // حساب النسبة المئوية (من 210)
  if (grade.total_score > 0) {
    grade.total_percentage = (grade.total_score / 210) * 100;
  }

  // تحديد النتيجة و GPA
  const percentage = grade.total_percentage;
  if (percentage >= 85) {
    grade.final_result = 'Distinction';
    grade.grade_point = 4.0;
    grade.letter_grade = 'A';
  } else if (percentage >= 70) {
    grade.final_result = 'Merit';
    grade.grade_point = 3.0;
    grade.letter_grade = 'B';
  } else if (percentage >= 50) {
    grade.final_result = 'Pass';
    grade.grade_point = 2.0;
    grade.letter_grade = 'C';
  } else if (percentage >= 30) {
    grade.final_result = 'Refer';
    grade.grade_point = 1.0;
    grade.letter_grade = 'D';
  } else {
    grade.final_result = 'Fail';
    grade.grade_point = 0.0;
    grade.letter_grade = 'F';
  }
});

module.exports = Grade;