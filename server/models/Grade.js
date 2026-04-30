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
  student_branch_at_creation: {
    type: DataTypes.ENUM('Software', 'Network'),
    allowNull: true,
    comment: 'فرع الطالب وقت إنشاء الدرجة (للحفظ التاريخي - لا يتغير حتى لو تغير فرع الطالب)'
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
  // Publishing fields - for controlling when grades are visible to students
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'هل تم نشر الدرجة للطالب'
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'تاريخ النشر'
  },
  published_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'الأدمن الذي نشر الدرجة'
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
    { fields: ['admin_approved_by'] },
    { fields: ['is_published'] },
    { fields: ['student_branch_at_creation'] }
  ]
});

// Calculate totals and determine grade before save
Grade.beforeSave(async (grade) => {
  // جلب إعدادات المادة من CourseGradeConfig
  const CourseGradeConfig = require('./CourseGradeConfig');
  
  let config = null;
  if (grade.course_id) {
    config = await CourseGradeConfig.findOne({
      where: { course_id: grade.course_id }
    });
  }
  
  // استخدام القيم الافتراضية إذا لم توجد إعدادات
  const ass1Max = config?.ass1_max || 30;
  const ass2Max = config?.ass2_max || 30;
  const finalMax = config?.final_max || 150;
  const pValue = config?.p_value || 30;
  const mValue = config?.m_value || 21;
  const dValue = config?.d_value || 15;
  
  // تحويل التقديرات (P/M/D) إلى درجات رقمية (computed values)
  const assignmentScores = {
    'D': parseFloat(dValue),
    'M': parseFloat(mValue),
    'P': parseFloat(pValue)
  };
  
  // حساب assignment scores تلقائياً من التقديرات
  grade.assignment1_score = assignmentScores[grade.assignment1_grade] || 0;
  grade.assignment2_score = assignmentScores[grade.assignment2_grade] || 0;
  
  // حساب المجموع (مجموع مباشر بدون نسب)
  grade.total_score = parseFloat(grade.assignment1_score || 0) + 
                      parseFloat(grade.assignment2_score || 0) + 
                      parseFloat(grade.final_exam_score || 0);
  
  // حساب النسبة المئوية
  const maxTotal = parseFloat(ass1Max) + parseFloat(ass2Max) + parseFloat(finalMax);
  grade.total_percentage = maxTotal > 0 ? (grade.total_score / maxTotal) * 100 : 0;
  
  // تحديد النتيجة والـ GPA
  const percentage = grade.total_percentage;
  const finalExamPct = parseFloat(finalMax) > 0 ? (parseFloat(grade.final_exam_score || 0) / parseFloat(finalMax)) * 100 : 0;
  
  // شرط الرسوب لائحة: الامتحان النهائي أقل من 60% (شرط أساسي للنجاح)
  // يُطبَّق فقط إذا كانت هناك درجات مُدخَلة فعلاً
  const hasAnyGrade = grade.assignment1_grade || grade.assignment2_grade || parseFloat(grade.final_exam_score || 0) > 0;
  const failedFinalExam = hasAnyGrade && finalExamPct < 60;

  if (failedFinalExam) {
    // راسب لائحة - لم يتجاوز 60% في الامتحان النهائي
    grade.final_result = 'Fail';
    grade.grade_point = 0.0;
    grade.letter_grade = 'F';
  } else if (percentage >= 85) {
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
    // Refer: اجتاز شرط النهائي (≥60%) لكن المجموع الكلي بين 30-49%
    grade.final_result = 'Refer';
    grade.grade_point = 1.0;
    grade.letter_grade = 'D';
  } else {
    grade.final_result = 'Fail';
    grade.grade_point = 0.0;
    grade.letter_grade = 'F';
  }

  // Capture student branch at creation time for historical tracking
  // Only set on new records and only if not already set
  if (grade.isNewRecord && grade.student_id && !grade.student_branch_at_creation) {
    try {
      const Student = require('./Student');
      const student = await Student.findByPk(grade.student_id, {
        attributes: ['id', 'branch']
      });
      if (student && student.branch) {
        grade.student_branch_at_creation = student.branch;
      }
    } catch (err) {
      // Non-critical: log but don't fail the save
      console.warn('Could not capture student branch at grade creation:', err.message);
    }
  }
});

module.exports = Grade;
