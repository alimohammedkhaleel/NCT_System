const { Op } = require('sequelize');
const { sequelize, User, Student, Specialty } = require('../config/models');
const bcrypt = require('bcryptjs');

// @desc    Get all students with optional filters
// @route   GET /api/admin/students
// @access  Admin
const getAllStudents = async (req, res) => {
  try {
    const { search, specialty_id, current_year, academic_status, branch } = req.query;

    const where = {};
    const userWhere = {};

    // Build student-level filters
    if (specialty_id) where.specialty_id = specialty_id;
    if (current_year) where.current_year = current_year;
    if (academic_status) where.academic_status = academic_status;
    if (branch) where.branch = branch;

    // Build search condition across student_code, national_id, and full_name
    let searchCondition = null;
    if (search) {
      searchCondition = {
        [Op.or]: [
          { student_code: { [Op.like]: `%${search}%` } },
          { national_id: { [Op.like]: `%${search}%` } },
          { '$User.full_name$': { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const finalWhere = searchCondition ? { ...where, ...searchCondition } : where;

    const students = await Student.findAll({
      where: finalWhere,
      include: [
        {
          model: User,
          attributes: ['full_name', 'email', 'phone'],
          required: true
        },
        {
          model: Specialty,
          attributes: ['id', 'name', 'arabic_name', 'code'],
          required: false
        }
      ],
      order: [['id', 'DESC']]
    });

    return res.json({
      success: true,
      data: students,
      count: students.length
    });
  } catch (error) {
    console.error('getAllStudents error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// @desc    Create a new student (User + Student atomically)
// @route   POST /api/admin/students
// @access  Admin
const createStudent = async (req, res) => {
  try {
    const { full_name, email, password, national_id, phone, specialty_id, current_year, branch } = req.body;

    if (!full_name || !email || !password || !national_id || !specialty_id) {
      return res.status(400).json({
        success: false,
        message: 'الحقول المطلوبة: full_name, email, password, national_id, specialty_id'
      });
    }

    // Check for duplicate email
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مسجّل مسبقاً'
      });
    }

    // Check for duplicate national_id
    const existingNationalId = await Student.findOne({ where: { national_id } });
    if (existingNationalId) {
      return res.status(400).json({
        success: false,
        message: 'الرقم القومي مسجّل مسبقاً'
      });
    }

    // Generate student_code: YYYYXXXX (8 digits)
    const year = new Date().getFullYear();
    const random = Math.floor(10000000 + Math.random() * 90000000); // 8 digits
    const student_code = `${year}${random}`.slice(0, 8); // e.g., 20241557

    // Create User + Student in a single transaction
    const result = await sequelize.transaction(async (t) => {
      const username = email.split('@')[0].toLowerCase() + '_' + Date.now().toString().slice(-6);

      const user = await User.create({
        username,
        email,
        full_name,
        phone: phone || null,
        password_hash: password, // hashed by beforeCreate hook
        role: 'student',
        is_active: true
      }, { transaction: t });

      const student = await Student.create({
        user_id: user.id,
        student_code,
        national_id,
        specialty_id,
        current_year: current_year || 1,
        branch: branch || null,
        academic_status: 'active',
        enrollment_date: new Date()
      }, { transaction: t });

      return { user, student };
    });

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          full_name: result.user.full_name,
          role: result.user.role
        },
        student: {
          id: result.student.id,
          student_code: result.student.student_code,
          national_id: result.student.national_id,
          specialty_id: result.student.specialty_id,
          current_year: result.student.current_year,
          academic_status: result.student.academic_status
        }
      },
      message: 'تم إنشاء الطالب بنجاح'
    });
  } catch (error) {
    console.error('createStudent error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// @desc    Update student and linked user record
// @route   PUT /api/admin/students/:id
// @access  Admin
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, national_id, specialty_id, current_year, academic_status, branch } = req.body;

    const student = await Student.findByPk(id, {
      include: [{ model: User }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'الطالب غير موجود'
      });
    }

    // Check email uniqueness if changing
    if (email && email !== student.User.email) {
      const existingEmail = await User.findOne({
        where: { email, id: { [Op.ne]: student.user_id } }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني مسجّل مسبقاً'
        });
      }
    }

    // Check national_id uniqueness if changing
    if (national_id && national_id !== student.national_id) {
      const existingNationalId = await Student.findOne({
        where: { national_id, id: { [Op.ne]: id } }
      });
      if (existingNationalId) {
        return res.status(400).json({
          success: false,
          message: 'الرقم القومي مسجّل مسبقاً'
        });
      }
    }

    // Update User fields
    const userUpdates = {};
    if (full_name) userUpdates.full_name = full_name;
    if (email) userUpdates.email = email;
    if (phone !== undefined) userUpdates.phone = phone;

    if (Object.keys(userUpdates).length > 0) {
      await User.update(userUpdates, { where: { id: student.user_id } });
    }

    // Update Student fields
    const studentUpdates = {};
    if (national_id) studentUpdates.national_id = national_id;
    if (specialty_id) studentUpdates.specialty_id = specialty_id;
    if (current_year) studentUpdates.current_year = current_year;
    if (academic_status) studentUpdates.academic_status = academic_status;
    if (branch !== undefined) studentUpdates.branch = branch;

    if (Object.keys(studentUpdates).length > 0) {
      await student.update(studentUpdates);
    }

    // Reload with associations
    await student.reload({
      include: [
        { model: User, attributes: ['full_name', 'email', 'phone'] },
        { model: Specialty, attributes: ['id', 'name', 'arabic_name'] }
      ]
    });

    return res.json({
      success: true,
      data: student,
      message: 'تم تحديث بيانات الطالب بنجاح'
    });
  } catch (error) {
    console.error('updateStudent error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// @desc    Promote a student (semester / year / graduate)
// @route   POST /api/admin/students/:id/promote
// @access  Admin
const promoteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { promotion_type, academic_year_id } = req.body;

    if (!['semester', 'year', 'summer', 'graduate'].includes(promotion_type)) {
      return res.status(400).json({
        success: false,
        message: 'نوع الترقية غير صالح. القيم المقبولة: semester, year, summer, graduate'
      });
    }

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'الطالب غير موجود'
      });
    }

    // Reject promotion for suspended or dropped students
    if (['suspended', 'dropped'].includes(student.academic_status)) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن ترقية طالب موقوف أو منسحب'
      });
    }

    let message = '';
    const updates = {};

    if (promotion_type === 'semester') {
      // Semester tracking is handled in enrollments; just acknowledge
      message = 'تم الانتقال إلى الفصل الدراسي التالي بنجاح';

    } else if (promotion_type === 'year') {
      if (student.current_year >= 4) {
        return res.status(400).json({
          success: false,
          message: 'الطالب في السنة النهائية، استخدم خيار التخريج'
        });
      }

      // ── Graduation-year check (year 2 and year 4 require passing ALL courses) ──
      // year 2 → must pass all to move to year 3
      // year 4 → handled via 'graduate' type
      // year 1 and 3 → can carry up to 3 failed courses (go to summer first)
      const isGraduationYear = student.current_year === 2;

      if (academic_year_id) {
        const Grade = require('../models/Grade');
        const CourseGradeConfig = require('../models/CourseGradeConfig');

        const grades = await Grade.findAll({
          where: { student_id: student.id, academic_year_id, status: 'approved' },
          include: [{ model: require('../models/Course'), attributes: ['id', 'course_code', 'course_name', 'arabic_name'] }]
        });

        const failedCourses = [];
        for (const grade of grades) {
          const config = await CourseGradeConfig.findOne({ where: { course_id: grade.course_id } });
          const finalMax = config?.final_max || 150;
          const finalExamPct = (parseFloat(grade.final_exam_score || 0) / finalMax) * 100;
          const passed = parseFloat(grade.total_percentage || 0) >= 60 && finalExamPct >= 50;
          if (!passed) {
            failedCourses.push({
              course_code: grade.Course?.course_code,
              course_name: grade.Course?.arabic_name || grade.Course?.course_name
            });
          }
        }

        if (isGraduationYear && failedCourses.length > 0) {
          // Year 2: must pass ALL — send to summer course
          updates.academic_status = 'summer_course';
          message = `الطالب رسب في ${failedCourses.length} مادة — تم نقله إلى الدراسة الصيفية`;
          await student.update(updates);
          return res.json({
            success: true,
            outcome: 'summer_course',
            failed_courses: failedCourses,
            data: { current_year: student.current_year, academic_status: 'summer_course' },
            message
          });
        }

        if (!isGraduationYear && failedCourses.length > 0) {
          // Year 1 or 3: up to 3 failed → summer; more than 3 → repeat year
          if (failedCourses.length <= 3) {
            updates.academic_status = 'summer_course';
            message = `الطالب رسب في ${failedCourses.length} مادة — تم نقله إلى الدراسة الصيفية`;
            await student.update(updates);
            return res.json({
              success: true,
              outcome: 'summer_course',
              failed_courses: failedCourses,
              data: { current_year: student.current_year, academic_status: 'summer_course' },
              message
            });
          } else {
            // More than 3 failed → repeat the year (stay at same year, reset to active)
            message = `الطالب رسب في ${failedCourses.length} مادة (أكثر من 3) — يجب إعادة السنة`;
            return res.json({
              success: false,
              outcome: 'repeat_year',
              failed_courses: failedCourses,
              data: { current_year: student.current_year, academic_status: student.academic_status },
              message
            });
          }
        }
      }

      // All passed (or no grades check requested) → promote to next year
      updates.current_year = student.current_year + 1;
      updates.academic_status = 'active';
      message = `تم ترقية الطالب إلى السنة ${student.current_year + 1} بنجاح`;

    } else if (promotion_type === 'summer') {
      // Manually move student to summer course
      updates.academic_status = 'summer_course';
      message = 'تم نقل الطالب إلى الدراسة الصيفية';

    } else if (promotion_type === 'graduate') {
      // Year 4 graduation: must pass ALL courses
      if (academic_year_id) {
        const Grade = require('../models/Grade');
        const CourseGradeConfig = require('../models/CourseGradeConfig');

        const grades = await Grade.findAll({
          where: { student_id: student.id, academic_year_id, status: 'approved' },
          include: [{ model: require('../models/Course'), attributes: ['id', 'course_code', 'course_name', 'arabic_name'] }]
        });

        const failedCourses = [];
        for (const grade of grades) {
          const config = await CourseGradeConfig.findOne({ where: { course_id: grade.course_id } });
          const finalMax = config?.final_max || 150;
          const finalExamPct = (parseFloat(grade.final_exam_score || 0) / finalMax) * 100;
          const passed = parseFloat(grade.total_percentage || 0) >= 60 && finalExamPct >= 50;
          if (!passed) {
            failedCourses.push({
              course_code: grade.Course?.course_code,
              course_name: grade.Course?.arabic_name || grade.Course?.course_name
            });
          }
        }

        if (failedCourses.length > 0) {
          // Year 4: must pass ALL — send to summer course
          updates.academic_status = 'summer_course';
          await student.update(updates);
          return res.json({
            success: true,
            outcome: 'summer_course',
            failed_courses: failedCourses,
            data: { current_year: student.current_year, academic_status: 'summer_course' },
            message: `الطالب رسب في ${failedCourses.length} مادة — تم نقله إلى الدراسة الصيفية (السنة الرابعة تتطلب النجاح في جميع المواد)`
          });
        }
      }

      updates.academic_status = 'graduated';
      updates.graduation_date = new Date();
      message = 'تم تخريج الطالب بنجاح';
    }

    if (Object.keys(updates).length > 0) {
      await student.update(updates);
    }

    return res.json({
      success: true,
      outcome: 'promoted',
      data: {
        current_year: student.current_year,
        academic_status: student.academic_status
      },
      message
    });
  } catch (error) {
    console.error('promoteStudent error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// @desc    Get student data (payment status, result status)
// @route   GET /api/student/data
// @access  Student
const getStudentData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find student by user_id
    const student = await Student.findOne({
      where: { user_id: userId },
      include: [{ model: User, attributes: ['full_name', 'email'] }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'بيانات الطالب غير موجودة'
      });
    }

    // Get FeeInvoice model
    const FeeInvoice = require('../models/FeeInvoice');
    const Grade = require('../models/Grade');

    // Calculate payment status from FeeInvoices
    const invoices = await FeeInvoice.findAll({
      where: { student_id: student.id }
    });

    let total_invoiced = 0;
    let total_paid = 0;

    invoices.forEach(invoice => {
      total_invoiced += parseFloat(invoice.total_amount || 0);
      total_paid += parseFloat(invoice.paid_amount || 0);
    });

    const total_due = total_invoiced - total_paid;

    // Determine payment status
    let payment_status = 'unpaid';
    if (total_due <= 0.01) {
      payment_status = 'paid';
    } else if (total_paid > 0) {
      payment_status = 'partial';
    }

    // Get published grades count
    const gradesCount = await Grade.count({
      where: {
        student_id: student.id,
        status: 'approved',
        admin_approved_by: { [Op.ne]: null }
      }
    });

    // Determine result status
    const result_status = gradesCount > 0 ? 'published' : 'not_published';

    return res.json({
      success: true,
      data: {
        payment_status,
        total_invoiced,
        total_paid,
        total_due,
        result_status,
        grades_count: gradesCount,
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('getStudentData error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// @desc    Update student branch (for ICT year 3-4 students)
// @route   PUT /api/student/branch
// @access  Student
const updateStudentBranch = async (req, res) => {
  try {
    const { branch } = req.body;
    const userId = req.user.id;

    // Validate branch value
    if (!branch || !['Software', 'Network'].includes(branch)) {
      return res.status(400).json({
        success: false,
        message: 'قيمة الفرع غير صالحة. يجب أن تكون Software أو Network',
        message_en: 'Invalid branch value. Must be Software or Network'
      });
    }

    // Get student with specialty
    const student = await Student.findOne({
      where: { user_id: userId },
      include: [{ model: Specialty, attributes: ['id', 'code', 'name'] }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'بيانات الطالب غير موجودة',
        message_en: 'Student record not found'
      });
    }

    // Check if student is ICT and year >= 3
    const isICT = student.Specialty && (
      student.Specialty.code === 'ICT' ||
      student.Specialty.name.toLowerCase().includes('information')
    );
    const requiresBranch = isICT && student.current_year >= 3;

    if (!requiresBranch) {
      return res.status(400).json({
        success: false,
        message: 'اختيار الفرع غير مطلوب لهذا الطالب',
        message_en: 'Branch selection is not applicable for this student'
      });
    }

    // Update branch
    await student.update({ branch });

    return res.json({
      success: true,
      message: 'تم تحديث الفرع بنجاح',
      message_en: 'Branch updated successfully',
      data: {
        student_id: student.id,
        branch: student.branch
      }
    });

  } catch (error) {
    console.error('updateStudentBranch error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
      message_en: 'Server error'
    });
  }
};

// @desc    Delete a student and their linked user account
// @route   DELETE /api/admin/students/:id
// @access  Admin
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      include: [{ model: User }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'الطالب غير موجود'
      });
    }

    const userId = student.user_id;
    const studentId = student.id;

    // Delete all related records first to avoid FK constraint errors,
    // then delete the student and user records — all in one transaction
    await sequelize.transaction(async (t) => {
      // Dynamically require models to avoid circular dependency issues
      const Grade = require('../models/Grade');
      const StudentEnrollment = require('../models/StudentEnrollment');
      const Payment = require('../models/Payment');
      const FeeInvoice = require('../models/FeeInvoice');
      const StudentQRCode = require('../models/StudentQRCode');
      const ActivityLog = require('../models/ActivityLog');
      const RegistrationRequest = require('../models/RegistrationRequest');

      // Delete child records in dependency order
      await Grade.destroy({ where: { student_id: studentId }, transaction: t });
      await StudentEnrollment.destroy({ where: { student_id: studentId }, transaction: t });
      await Payment.destroy({ where: { student_id: studentId }, transaction: t });
      await FeeInvoice.destroy({ where: { student_id: studentId }, transaction: t });
      await StudentQRCode.destroy({ where: { student_id: studentId }, transaction: t });
      // Delete registration requests where this user was the admin who created the record
      await RegistrationRequest.destroy({ where: { created_user_id: userId }, transaction: t });
      await ActivityLog.destroy({ where: { user_id: userId }, transaction: t });

      // Now safe to delete the student and user
      await student.destroy({ transaction: t });
      await User.destroy({ where: { id: userId }, transaction: t });
    });

    return res.json({
      success: true,
      message: 'تم حذف الطالب بنجاح'
    });
  } catch (error) {
    console.error('deleteStudent error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

module.exports = {
  getAllStudents,
  createStudent,
  updateStudent,
  promoteStudent,
  deleteStudent,
  getStudentData,
  updateStudentBranch
};
