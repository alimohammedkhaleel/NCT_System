const { Op } = require('sequelize');
const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Semester = require('../models/Semester');
const AcademicYear = require('../models/AcademicYear');
const StudentEnrollment = require('../models/StudentEnrollment');
const ProfessorCourse = require('../models/ProfessorCourse');
const Professor = require('../models/Professor');
const Specialty = require('../models/Specialty');
const User = require('../models/User');
const FeeInvoice = require('../models/FeeInvoice');
const Payment = require('../models/Payment');
const StudentQRCode = require('../models/StudentQRCode');
const ActivityLog = require('../models/ActivityLog');

// Helper: Log activity
const logActivity = async (userId, action, entity, entity_id, description) => {
  try {
    await ActivityLog.create({
      user_id: userId,
      action,
      entity,
      entity_id,
      description,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Activity logging error:', error);
  }
};

// @desc    Submit grades (P/M/D) for a student
// @route   POST /api/grades
// @access  Private (Professor only)
const submitGrades = async (req, res) => {
  try {
    if (req.user.role !== 'professor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only professors and admins can submit grades'
      });
    }

    const {
      student_id,
      course_id,
      academic_year_id,
      semester_id,
      assignment1_grade,
      assignment2_grade,
      final_exam_score,
      notes
    } = req.body;

    // Validate required fields
    if (!student_id || !course_id || !academic_year_id || !semester_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: student_id, course_id, academic_year_id, semester_id'
      });
    }

    // Validate letter grades (P/M/D)
    const validGrades = ['P', 'M', 'D'];
    if (assignment1_grade && !validGrades.includes(assignment1_grade)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment1_grade. Must be P, M, or D'
      });
    }
    if (assignment2_grade && !validGrades.includes(assignment2_grade)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignment2_grade. Must be P, M, or D'
      });
    }

    // Validate final exam score
    if (final_exam_score && (final_exam_score < 0 || final_exam_score > 150)) {
      return res.status(400).json({
        success: false,
        message: 'Final exam score must be between 0 and 150'
      });
    }

    let professorId = null;
    if (req.user.role === 'professor') {
      const professor = await Professor.findOne({
        where: { user_id: req.user.id }
      });

      if (!professor) {
        return res.status(403).json({
          success: false,
          message: 'Professor profile not found'
        });
      }

      // Check if professor teaches this course
      const professorCourse = await ProfessorCourse.findOne({
        where: {
          professor_id: professor.id,
          course_id: parseInt(course_id),
          academic_year_id: parseInt(academic_year_id),
          semester_id: parseInt(semester_id)
        }
      });

      if (!professorCourse) {
        return res.status(403).json({
          success: false,
          message: 'You do not teach this course in this academic year/semester'
        });
      }
      professorId = professor.id; // Store professor record ID, not user ID
    } else {
      // Admin is submitting
      professorId = req.user.id;
    }

    // Validate student eligibility based on specialty and year matching
    // This replaces the old StudentEnrollment requirement
    const student = await Student.findByPk(parseInt(student_id), {
      include: [{ model: Specialty, attributes: ['id', 'name', 'arabic_name'] }]
    });

    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get course with specialty and academic year details
    const course = await Course.findByPk(parseInt(course_id), {
      include: [
        { model: Specialty, attributes: ['id', 'name', 'arabic_name'] },
        { model: AcademicYear, attributes: ['id', 'year_number', 'academic_season'] }
      ]
    });

    if (!course) {
      return res.status(400).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Validate specialty-based eligibility (matches getStudentsByCourse logic)
    if (student.specialty_id !== course.specialty_id) {
      return res.status(400).json({
        success: false,
        message: 'Student specialty does not match course specialty'
      });
    }

    if (student.current_year !== course.AcademicYear.year_number) {
      return res.status(400).json({
        success: false,
        message: 'Student year does not match course academic year'
      });
    }

    // Branch consistency validation: if course has a specific branch, student must match
    if (course.branch && course.branch !== 'Both') {
      if (student.branch !== course.branch) {
        console.error('[BRANCH_VALIDATION_FAILURE]', JSON.stringify({
          user_id: req.user.id,
          student_id: student.id,
          student_branch: student.branch,
          course_id: course.id,
          course_branch: course.branch,
          operation: 'grade_creation',
          timestamp: new Date().toISOString()
        }));
        return res.status(400).json({
          success: false,
          message: `الطالب غير مسجل في فرع هذه المادة. فرع المادة: ${course.branch === 'Software' ? 'البرمجيات' : 'الشبكات'}`,
          message_en: `Student branch does not match course branch. Course branch: ${course.branch}`
        });
      }
    }

    // Optional: Auto-create StudentEnrollment record for database consistency
    let enrollment = await StudentEnrollment.findOne({
      where: {
        student_id: parseInt(student_id),
        course_id: parseInt(course_id),
        academic_year_id: parseInt(academic_year_id),
        semester_id: parseInt(semester_id)
      }
    });

    if (!enrollment) {
      enrollment = await StudentEnrollment.create({
        student_id: parseInt(student_id),
        course_id: parseInt(course_id),
        academic_year_id: parseInt(academic_year_id),
        semester_id: parseInt(semester_id),
        status: 'enrolled',
        enrollment_date: new Date()
      });
    }

    // Find or create grade
    let grade = await Grade.findOne({
      where: {
        student_id: parseInt(student_id),
        course_id: parseInt(course_id),
        academic_year_id: parseInt(academic_year_id),
        semester_id: parseInt(semester_id)
      }
    });

    const gradeData = {
      student_id: parseInt(student_id),
      course_id: parseInt(course_id),
      academic_year_id: parseInt(academic_year_id),
      semester_id: parseInt(semester_id),
      professor_submitted_by: professorId,
      assignment1_grade: assignment1_grade || null,
      assignment2_grade: assignment2_grade || null,
      final_exam_score: final_exam_score ? parseFloat(final_exam_score) : null,
      status: 'draft',
      notes: notes || null
    };

    let message;
    if (grade) {
      await grade.update(gradeData);
      message = 'Grade updated successfully';
    } else {
      grade = await Grade.create(gradeData);
      message = 'Grade created successfully';
    }

    // Log activity
    await logActivity(req.user.id, 'submit', 'Grade', grade.id, `Submitted grades for student ${student_id}`);

    // Fetch updated grade with associations
    const updatedGrade = await Grade.findByPk(grade.id, {
      include: [
        {
          model: Student,
          include: [{
            model: User,
            attributes: ['full_name', 'email']
          }],
          attributes: ['student_code', 'current_year']
        },
        {
          model: Course,
          attributes: ['course_code', 'course_name', 'arabic_name', 'credit_hours']
        }
      ]
    });

    res.json({
      success: true,
      message,
      data: updatedGrade
    });

  } catch (error) {
    console.error('Submit grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting grades'
    });
  }
};

// @desc    Submit grades for approval (draft → pending_admin_approval)
// @route   POST /api/grades/:id/submit-for-approval
// @access  Private (Professor only)
const submitForApproval = async (req, res) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({
        success: false,
        message: 'Only professors can submit for approval'
      });
    }

    const gradeId = req.params.id;

    const grade = await Grade.findByPk(gradeId);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Verify professor owns this grade
    const professor = await Professor.findOne({
      where: { user_id: req.user.id }
    });

    if (grade.professor_submitted_by !== professor.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit your own grades'
      });
    }

    if (grade.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft grades can be submitted for approval'
      });
    }

    // Validate all grade fields are filled
    if (!grade.assignment1_grade || !grade.assignment2_grade || grade.final_exam_score === null) {
      return res.status(400).json({
        success: false,
        message: 'All grade fields must be filled before submission'
      });
    }

    await grade.update({ status: 'pending_admin_approval' });

    // Log activity
    await logActivity(req.user.id, 'submit', 'Grade', grade.id, 'Submitted grade for admin approval');

    res.json({
      success: true,
      message: 'Grades submitted for admin approval'
    });

  } catch (error) {
    console.error('Submit for approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get professor's submitted grades
// @route   GET /api/grades/professor
// @access  Private (Professor only)
const getProfessorGrades = async (req, res) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({
        success: false,
        message: 'Only professors can access this endpoint'
      });
    }

    const { status, course_id } = req.query;

    const professor = await Professor.findOne({
      where: { user_id: req.user.id }
    });

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: 'Professor profile not found'
      });
    }

    let whereClause = { professor_submitted_by: professor.id };

    if (status) {
      whereClause.status = status;
    }

    if (course_id) {
      whereClause.course_id = parseInt(course_id);
    }

    const grades = await Grade.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          include: [{
            model: User,
            attributes: ['full_name', 'email']
          }],
          attributes: ['student_code']
        },
        {
          model: Course,
          attributes: ['course_code', 'course_name', 'arabic_name']
        },
        {
          model: AcademicYear,
          attributes: ['year_number', 'academic_season']
        },
        {
          model: Semester,
          attributes: ['semester_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: grades,
      count: grades.length
    });

  } catch (error) {
    console.error('Get professor grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get pending grades for admin approval
// @route   GET /api/grades/admin/pending
// @access  Private (Admin only)
const getPendingGrades = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access this endpoint'
      });
    }

    const { course_id, academic_year_id, semester_id } = req.query;

    let whereClause = { status: { [Op.in]: ['pending_admin_approval', 'draft'] } };

    if (course_id) whereClause.course_id = parseInt(course_id);
    if (academic_year_id) whereClause.academic_year_id = parseInt(academic_year_id);
    if (semester_id) whereClause.semester_id = parseInt(semester_id);

    const grades = await Grade.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          include: [{
            model: User,
            attributes: ['full_name', 'email']
          }],
          attributes: ['student_code', 'specialty_id', 'current_year']
        },
        {
          model: Course,
          attributes: ['course_code', 'course_name', 'arabic_name']
        },
        {
          model: AcademicYear,
          attributes: ['year_number', 'academic_season']
        },
        {
          model: Semester,
          attributes: ['semester_name']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: grades,
      count: grades.length
    });

  } catch (error) {
    console.error('Get pending grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Approve grade (pending → approved)
// @route   PUT /api/grades/:id/approve
// @access  Private (Admin only)
const approveGrade = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can approve grades'
      });
    }

    const gradeId = req.params.id;

    const grade = await Grade.findByPk(gradeId);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    if (grade.status !== 'pending_admin_approval' && grade.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'يمكن اعتماد الدرجات المعلقة أو المسودة فقط'
      });
    }

    await grade.update({
      status: 'approved',
      admin_approved_by: req.user.id,
      approved_at: new Date()
    });

    // Log activity
    await logActivity(req.user.id, 'approve', 'Grade', grade.id, 'Approved grade submission');

    res.json({
      success: true,
      message: 'Grade approved successfully'
    });

  } catch (error) {
    console.error('Approve grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reject grade (pending → draft with notes)
// @route   PUT /api/grades/:id/reject
// @access  Private (Admin only)
const rejectGrade = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can reject grades'
      });
    }

    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const gradeId = req.params.id;

    const grade = await Grade.findByPk(gradeId);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    if (grade.status !== 'pending_admin_approval' && grade.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'يمكن رفض الدرجات المعلقة أو المسودة فقط'
      });
    }

    const updatedNotes = `${grade.notes || ''}\n[ADMIN REJECTION] ${rejection_reason}`;

    await grade.update({
      status: 'draft',
      notes: updatedNotes.trim()
    });

    // Log activity
    await logActivity(req.user.id, 'reject', 'Grade', grade.id, `Rejected: ${rejection_reason}`);

    res.json({
      success: true,
      message: 'Grade rejected and returned to draft status'
    });

  } catch (error) {
    console.error('Reject grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student's approved grades
// @route   GET /api/student/grades
// @access  Private (Student only)
const getStudentGrades = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can access this endpoint'
      });
    }

    const student = await Student.findOne({
      where: { user_id: req.user.id },
      include: [{ model: Specialty, attributes: ['id', 'code', 'name'] }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Enforce: only published grades for this student (Requirements 8.1, 8.5)
    const grades = await Grade.findAll({
      where: {
        student_id: student.id,
        status: 'approved',
        is_published: true
      },
      include: [
        {
          model: Course,
          attributes: ['course_code', 'course_name', 'arabic_name', 'credit_hours', 'branch']
        },
        {
          model: AcademicYear,
          attributes: ['year_number', 'academic_season']
        },
        {
          model: Semester,
          attributes: ['semester_name']
        }
      ],
      order: [['academic_year_id', 'DESC'], ['semester_id', 'DESC']]
    });

    // Branch verification: filter out grades for branch-specific courses that don't match student branch
    // (Requirements 8.3, 8.5 - verify student branch matches course branch before displaying)
    const visibleGrades = grades.filter(grade => {
      const courseBranch = grade.Course?.branch;
      // If course has no branch restriction, always visible
      if (!courseBranch || courseBranch === 'Both') return true;
      // If course has a specific branch, student must match
      if (student.branch && student.branch === courseBranch) return true;
      // Mismatch - should not be visible (data integrity guard)
      console.warn('[GRADE_VISIBILITY_BRANCH_MISMATCH]', JSON.stringify({
        student_id: student.id,
        student_branch: student.branch,
        course_id: grade.course_id,
        course_branch: courseBranch,
        grade_id: grade.id,
        timestamp: new Date().toISOString()
      }));
      return false;
    });

    if (visibleGrades.length === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'لا توجد نتائج منشورة حالياً'
      });
    }

    res.json({
      success: true,
      data: visibleGrades,
      count: visibleGrades.length
    });

  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student's invoices and payment summary
// @route   GET /api/student/invoices
// @access  Private (Student only)
const getStudentInvoices = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can access this endpoint'
      });
    }

    const student = await Student.findOne({
      where: { user_id: req.user.id }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Get invoices with payments
    const invoices = await FeeInvoice.findAll({
      where: { student_id: student.id },
      include: [
        {
          model: Payment,
          attributes: ['id', 'amount', 'payment_method', 'transaction_id', 'payment_date']
        },
        {
          model: AcademicYear,
          attributes: ['year_number', 'academic_season']
        },
        {
          model: Semester,
          attributes: ['semester_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate summary
    let total_invoiced = 0;
    let total_paid = 0;
    let pending_count = 0;
    let overdue_count = 0;

    const now = new Date();

    invoices.forEach(invoice => {
      total_invoiced += parseFloat(invoice.total_amount) || 0;

      const paid = invoice.Payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;
      total_paid += paid;

      if (paid < parseFloat(invoice.total_amount || 0)) {
        pending_count++;
        if (invoice.due_date && new Date(invoice.due_date) < now) {
          overdue_count++;
        }
      }
    });

    const total_due = total_invoiced - total_paid;

    res.json({
      success: true,
      data: {
        invoices,
        summary: {
          total_invoiced: parseFloat(total_invoiced.toFixed(2)),
          total_paid: parseFloat(total_paid.toFixed(2)),
          total_due: parseFloat(total_due.toFixed(2)),
          pending_count,
          overdue_count
        }
      }
    });

  } catch (error) {
    console.error('Get student invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student's QR code for registration
// @route   GET /api/student/qr-code
// @access  Private (Student only)
const getStudentQRCode = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can access this endpoint'
      });
    }

    const student = await Student.findOne({
      where: { user_id: req.user.id }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    const qrCode = await StudentQRCode.findOne({
      where: { student_id: student.id }
    });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found for this student'
      });
    }

    res.json({
      success: true,
      data: {
        qr_secret: qrCode.qr_secret,
        qr_data: qrCode.qr_data,
        qr_image: qrCode.qr_image,
        is_active: qrCode.is_active,
        scan_count: qrCode.scan_count,
        scanned_at: qrCode.scanned_at
      }
    });

  } catch (error) {
    console.error('Get student QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student dashboard summary
// @route   GET /api/student/dashboard
// @access  Private (Student only)
const getStudentDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can access this endpoint'
      });
    }

    const student = await Student.findOne({
      where: { user_id: req.user.id },
      include: [
        { model: User, attributes: ['full_name', 'email', 'phone', 'profile_image'] },
        { model: Specialty, attributes: ['name', 'arabic_name', 'code'] }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Count enrolled courses
    const enrolled_courses = await StudentEnrollment.count({
      where: { student_id: student.id }
    });

    // Count approved grades
    const approved_grades = await Grade.count({
      where: {
        student_id: student.id,
        status: 'approved'
      }
    });

    // Calculate GPA from approved grades
    const approvedGrades = await Grade.findAll({
      where: { student_id: student.id, status: 'approved' },
      include: [{ model: Course, attributes: ['credit_hours'] }]
    });

    let gpa = 0.0;
    if (approvedGrades.length > 0) {
      const totalWeighted = approvedGrades.reduce((sum, g) => sum + (parseFloat(g.grade_point) * parseInt(g.Course.credit_hours)), 0);
      const totalCredits = approvedGrades.reduce((sum, g) => sum + parseInt(g.Course.credit_hours), 0);
      gpa = totalCredits > 0 ? parseFloat((totalWeighted / totalCredits).toFixed(2)) : 0.0;
    }

    // Calculate total due
    const invoices = await FeeInvoice.findAll({
      where: { student_id: student.id },
      include: [{ model: Payment }]
    });

    let total_due = 0;
    invoices.forEach(invoice => {
      const paid = invoice.Payments?.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0) || 0;
      total_due += parseFloat(invoice.total_amount || 0) - paid;
    });

    res.json({
      success: true,
      data: {
        student_info: {
          student_id: student.id,
          full_name: student.User?.full_name,
          email: student.User?.email,
          phone: student.User?.phone,
          student_code: student.student_code,
          national_id: student.national_id,
          current_year: student.current_year,
          branch: student.branch,
          specialty_name: student.Specialty?.arabic_name || student.Specialty?.name || null,
          specialty_code: student.Specialty?.code || null,
          academic_status: student.academic_status || null,
          // Return profile_image as-is (already stored with leading /)
          avatar_url: student.User?.profile_image || null,
          profile_image: student.User?.profile_image || null
        },
        summary: {
          enrolled_courses,
          approved_grades,
          gpa,
          total_due: parseFloat(Math.max(0, total_due).toFixed(2))
        }
      }
    });

  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get courses assigned to the logged-in professor
// @route   GET /api/grades/professor/courses
// @access  Private (Professor only)
const getProfessorCourses = async (req, res) => {
  try {
    if (req.user.role !== 'professor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only professors and admins can access this endpoint' });
    }

    const { specialty_id, year_number, semester_name } = req.query;

    let whereClause = {};
    if (req.user.role === 'professor') {
      const professor = await Professor.findOne({ where: { user_id: req.user.id } });
      if (!professor) {
        return res.status(404).json({ success: false, message: 'Professor profile not found' });
      }
      whereClause.professor_id = professor.id;
    }

    const courseWhere = {};
    if (specialty_id) courseWhere.specialty_id = parseInt(specialty_id);

    const academicYearWhere = {};
    if (year_number) academicYearWhere.year_number = parseInt(year_number);

    const semesterWhere = {};
    if (semester_name) semesterWhere.semester_name = semester_name;

    const assignments = await ProfessorCourse.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          attributes: ['id', 'course_code', 'course_name', 'arabic_name', 'credit_hours'],
          where: Object.keys(courseWhere).length ? courseWhere : undefined,
          required: true,
          include: [
            { model: Specialty, attributes: ['id', 'name', 'arabic_name', 'code'] },
            {
              model: AcademicYear,
              attributes: ['id', 'year_number', 'academic_season'],
              where: Object.keys(academicYearWhere).length ? academicYearWhere : undefined,
              required: Object.keys(academicYearWhere).length > 0
            },
            { 
              model: Semester, 
              attributes: ['id', 'semester_name'],
              where: Object.keys(semesterWhere).length ? semesterWhere : undefined,
              required: Object.keys(semesterWhere).length > 0
            }
          ]
        }
      ]
    });

    return res.json({
      success: true,
      data: assignments,
      count: assignments.length
    });
  } catch (error) {
    console.error('getProfessorCourses error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get professor dashboard data
// @route   GET /api/grades/professor/dashboard
// @access  Private (Professor only)
const getProfessorDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'professor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only professors and admins can access this endpoint'
      });
    }

    let professorRecord = null;
    let wherePC = {};

    if (req.user.role === 'professor') {
      professorRecord = await Professor.findOne({
        where: { user_id: req.user.id },
        include: [{
          model: User,
          attributes: ['full_name', 'email']
        }]
      });

      if (!professorRecord) {
        return res.status(404).json({
          success: false,
          message: 'لم يتم العثور على بيانات الأستاذ'
        });
      }
      wherePC.professor_id = professorRecord.id;
    }

    // Get assigned courses with enrollment and grade statistics
    const professorCourses = await ProfessorCourse.findAll({
      where: wherePC,
      include: [
        {
          model: Course,
          attributes: ['id', 'course_code', 'course_name', 'arabic_name', 'credit_hours'],
          include: [
            {
              model: Specialty,
              attributes: ['name', 'arabic_name']
            },
            {
              model: AcademicYear,
              attributes: ['year_number', 'academic_season']
            },
            {
              model: Semester,
              attributes: ['semester_name']
            }
          ]
        }
      ]
    });

    // Build courses array with statistics
    const coursesData = [];
    let totalStudents = 0;
    let totalPendingGrades = 0;
    let totalApprovedGrades = 0;

    for (const pc of professorCourses) {
      if (!pc.Course) continue;

      const course = pc.Course;

      // Count enrolled students
      const enrolledCount = await StudentEnrollment.count({
        where: {
          course_id: course.id,
          status: 'enrolled'
        }
      });

      // Count grades by status
      const pendingCount = await Grade.count({
        where: {
          course_id: course.id,
          professor_submitted_by: professorRecord ? professorRecord.id : { [Op.ne]: null },
          status: { [Op.in]: ['draft', 'pending_admin_approval'] }
        }
      });

      const approvedCount = await Grade.count({
        where: {
          course_id: course.id,
          professor_submitted_by: professorRecord ? professorRecord.id : { [Op.ne]: null },
          status: 'approved'
        }
      });

      const totalGrades = await Grade.count({
        where: {
          course_id: course.id,
          professor_submitted_by: professorRecord ? professorRecord.id : { [Op.ne]: null }
        }
      });

      coursesData.push({
        id: course.id,
        course_code: course.course_code,
        course_name: course.course_name,
        arabic_name: course.arabic_name,
        specialty_name: course.Specialty?.arabic_name || course.Specialty?.name || '—',
        year: course.AcademicYear?.year_number || 0,
        semester: course.Semester?.semester_name || '—',
        enrolled_students: enrolledCount,
        submitted_grades: totalGrades,
        pending_grades: pendingCount,
        approved_grades: approvedCount
      });

      totalStudents += enrolledCount;
      totalPendingGrades += pendingCount;
      totalApprovedGrades += approvedCount;
    }

    // Calculate stats
    const stats = {
      total_courses: professorCourses.length,
      total_students: totalStudents,
      pending_grades: totalPendingGrades,
      approved_grades: totalApprovedGrades
    };

    res.json({
      success: true,
      data: {
        professor: {
          full_name: req.user.role === 'admin' ? req.user.full_name : professorRecord.User?.full_name || 'غير متوفر',
          professor_code: req.user.role === 'admin' ? 'ADMIN' : professorRecord.professor_code || '—',
          role: req.user.role
        },
        stats,
        courses: coursesData
      }
    });

  } catch (error) {
    console.error('Get professor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحميل البيانات'
    });
  }
};

// @desc    Get students enrolled in a course with their grades (for professor)
// @route   GET /api/grades/professor/students?course_id=X
// @access  Private (Professor only)
const getProfessorStudents = async (req, res) => {
  try {
    if (req.user.role !== 'professor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'هذه الصفحة مخصصة للأساتذة والمسؤولين فقط'
      });
    }

    const { course_id } = req.query;

    let professorRecord = null;
    if (req.user.role === 'professor') {
      professorRecord = await Professor.findOne({
        where: { user_id: req.user.id }
      });

      if (!professorRecord) {
        return res.status(403).json({
          success: false,
          message: 'لم يتم العثور على بيانات الأستاذ'
        });
      }
    }

    // If no course_id provided, return all students from all courses (or professor's courses)
    if (!course_id) {
      const professorCourses = await ProfessorCourse.findAll({
        where: req.user.role === 'professor' ? { professor_id: professorRecord.id } : {},
        include: [{
          model: Course,
          attributes: ['id', 'course_code', 'course_name', 'arabic_name']
        }]
      });

      const courseIds = professorCourses.map(pc => pc.course_id);

      if (courseIds.length === 0) {
        return res.json({
          success: true,
          data: [],
          message: 'لا توجد مواد مسندة لك'
        });
      }

      // Get all students enrolled in these courses
      const enrollments = await StudentEnrollment.findAll({
        where: { course_id: courseIds },
        include: [{
          model: Student,
          include: [{
            model: User,
            attributes: ['id', 'full_name', 'email']
          }, {
            model: Specialty,
            attributes: ['id', 'name', 'arabic_name']
          }]
        }, {
          model: Course,
          attributes: ['id', 'course_code', 'course_name', 'arabic_name']
        }]
      });

      // Format response
      const studentsData = enrollments.map(enrollment => {
        const student = enrollment.Student;
        return {
          student_id: student.id,
          student_code: student.student_code,
          full_name: student.User?.full_name,
          specialty_name: student.Specialty?.arabic_name || student.Specialty?.name,
          current_year: student.current_year,
          course_code: enrollment.Course?.course_code,
          course_name: enrollment.Course?.course_name
        };
      });

      return res.json({
        success: true,
        data: studentsData,
        courses: professorCourses.map(pc => ({
          id: pc.Course.id,
          code: pc.Course.course_code,
          name: pc.Course.course_name
        }))
      });
    }

    if (req.user.role === 'professor') {
      // If course_id is provided, check if professor teaches this course
      const professorCourse = await ProfessorCourse.findOne({
        where: {
          professor_id: professorRecord.id,
          course_id: course_id
        }
      });

      if (!professorCourse) {
        return res.status(403).json({
          success: false,
          message: 'ليس لديك صلاحية الوصول لهذه المادة'
        });
      }
    }

    // Get course config
    const CourseGradeConfig = require('../models/CourseGradeConfig');
    const config = await CourseGradeConfig.findOne({
      where: { course_id }
    });

    const course_config = config ? {
      ass1_max: parseFloat(config.ass1_max),
      ass2_max: parseFloat(config.ass2_max),
      final_max: parseFloat(config.final_max),
      p_value: parseFloat(config.p_value),
      m_value: parseFloat(config.m_value),
      d_value: parseFloat(config.d_value)
    } : {
      ass1_max: 30.00,
      ass2_max: 30.00,
      final_max: 150.00,
      p_value: 30.00,
      m_value: 21.00,
      d_value: 15.00
    };

    // Get all students enrolled in this course
    const enrollments = await StudentEnrollment.findAll({
      where: { course_id },
      include: [{
        model: Student,
        include: [{
          model: User,
          attributes: ['id', 'full_name', 'email']
        }, {
          model: Specialty,
          attributes: ['id', 'name', 'arabic_name']
        }]
      }]
    });

    // Get grades for these students
    const studentIds = enrollments.map(e => e.student_id);
    const grades = await Grade.findAll({
      where: {
        student_id: studentIds,
        course_id: course_id
      }
    });

    // Map grades to students
    const gradesMap = {};
    grades.forEach(grade => {
      gradesMap[grade.student_id] = grade;
    });

    // Format response
    const studentsData = enrollments.map(enrollment => {
      const student = enrollment.Student;
      const grade = gradesMap[student.id];

      return {
        student_id: student.id,
        student_code: student.student_code,
        full_name: student.User?.full_name,
        specialty_name: student.Specialty?.arabic_name || student.Specialty?.name,
        current_year: student.current_year,
        grade: grade ? {
          id: grade.id,
          assignment1_grade: grade.assignment1_grade,
          assignment1_score: parseFloat(grade.assignment1_score || 0),
          assignment2_grade: grade.assignment2_grade,
          assignment2_score: parseFloat(grade.assignment2_score || 0),
          final_exam_score: parseFloat(grade.final_exam_score || 0),
          total_score: parseFloat(grade.total_score || 0),
          total_percentage: parseFloat(grade.total_percentage || 0),
          final_result: grade.final_result,
          letter_grade: grade.letter_grade,
          grade_point: parseFloat(grade.grade_point || 0),
          status: grade.status
        } : null
      };
    });

    res.json({
      success: true,
      data: studentsData,
      course_config
    });

  } catch (error) {
    console.error('Get professor students error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحميل بيانات الطلاب'
    });
  }
};

// @desc    Update an existing grade
// @route   PUT /api/grades/:id
// @access  Private (Professor only)
const updateGrade = async (req, res) => {
  try {
    if (req.user.role !== 'professor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'هذه الصفحة مخصصة للأساتذة والمسؤولين فقط'
      });
    }

    const { id } = req.params;
    const {
      assignment1_grade,
      assignment2_grade,
      assignment1_score,
      assignment2_score,
      final_exam_score,
      notes
    } = req.body;

    // Get the grade
    const grade = await Grade.findByPk(id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الدرجة'
      });
    }

    if (req.user.role === 'professor') {
      // Get professor record
      const professor = await Professor.findOne({
        where: { user_id: req.user.id }
      });

      if (!professor) {
        return res.status(403).json({
          success: false,
          message: 'لم يتم العثور على بيانات الأستاذ'
        });
      }
    }

    // Check if professor owns this grade (Admins bypass this)
    if (req.user.role === 'professor' && grade.professor_submitted_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية تعديل هذه الدرجة'
      });
    }

    // Check if grade is still draft (professors) or pending (admins can edit pending too)
    if (req.user.role === 'professor' && grade.status !== 'draft') {
      return res.status(403).json({
        success: false,
        message: 'لا يمكن تعديل درجة معتمدة أو قيد المراجعة'
      });
    }
    if (req.user.role === 'admin' && !['draft', 'pending_admin_approval'].includes(grade.status)) {
      return res.status(403).json({
        success: false,
        message: 'لا يمكن تعديل درجة معتمدة أو مرفوضة'
      });
    }

    // Validate assignment grades
    const validGrades = ['P', 'M', 'D'];
    if (assignment1_grade && !validGrades.includes(assignment1_grade)) {
      return res.status(400).json({
        success: false,
        message: 'assignment1_grade يجب أن يكون P أو M أو D'
      });
    }
    if (assignment2_grade && !validGrades.includes(assignment2_grade)) {
      return res.status(400).json({
        success: false,
        message: 'assignment2_grade يجب أن يكون P أو M أو D'
      });
    }

    // Validate final exam score
    const CourseGradeConfig = require('../models/CourseGradeConfig');
    const config = await CourseGradeConfig.findOne({
      where: { course_id: grade.course_id }
    });
    const finalMax = config?.final_max || 150;

    if (final_exam_score !== undefined && (final_exam_score < 0 || final_exam_score > finalMax)) {
      return res.status(400).json({
        success: false,
        message: `final_exam_score يجب أن يكون بين 0 و ${finalMax}`
      });
    }

    // Update grade
    const updateData = {};
    if (assignment1_grade !== undefined) updateData.assignment1_grade = assignment1_grade;
    if (assignment2_grade !== undefined) updateData.assignment2_grade = assignment2_grade;
    if (assignment1_score !== undefined) updateData.assignment1_score = assignment1_score;
    if (assignment2_score !== undefined) updateData.assignment2_score = assignment2_score;
    if (final_exam_score !== undefined) updateData.final_exam_score = final_exam_score;
    if (notes !== undefined) updateData.notes = notes;

    await grade.update(updateData);

    // Log activity
    await logActivity(
      req.user.id,
      'update',
      'grade',
      grade.id,
      `Updated grade for student ${grade.student_id} in course ${grade.course_id}`
    );

    res.json({
      success: true,
      message: 'تم تحديث الدرجة بنجاح',
      data: grade
    });

  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الدرجة'
    });
  }
};

// @desc    Delete a grade
// @route   DELETE /api/grades/:id
// @access  Private (Professor only)
const deleteGrade = async (req, res) => {
  try {
    if (req.user.role !== 'professor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'هذه الصفحة مخصصة للأساتذة والمسؤولين فقط'
      });
    }

    const { id } = req.params;

    // Get the grade
    const grade = await Grade.findByPk(id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على الدرجة'
      });
    }

    if (req.user.role === 'professor') {
      // Get professor record
      const professor = await Professor.findOne({
        where: { user_id: req.user.id }
      });

      if (!professor) {
        return res.status(403).json({
          success: false,
          message: 'لم يتم العثور على بيانات الأستاذ'
        });
      }
    }

    // Check if professor owns this grade (Admins bypass this)
    if (req.user.role === 'professor' && grade.professor_submitted_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية حذف هذه الدرجة'
      });
    }

    // Check if grade is still draft
    if (grade.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف درجة معتمدة أو قيد المراجعة'
      });
    }

    // Delete grade
    await grade.destroy();

    // Log activity
    await logActivity(
      req.user.id,
      'delete',
      'grade',
      id,
      `Deleted grade for student ${grade.student_id} in course ${grade.course_id}`
    );

    res.json({
      success: true,
      message: 'تم حذف الدرجة بنجاح'
    });

  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف الدرجة'
    });
  }
};

// @desc    Get student payment status
// @route   GET /api/student/payment-status
// @access  Private (Student only)
const getPaymentStatus = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'هذه الصفحة مخصصة للطلاب فقط'
      });
    }

    // Get student record
    const student = await Student.findOne({
      where: { user_id: req.user.id }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على بيانات الطالب'
      });
    }

    // Get all invoices for this student
    const invoices = await FeeInvoice.findAll({
      where: { student_id: student.id },
      include: [{
        model: Payment,
        as: 'Payments',
        attributes: ['id', 'amount', 'payment_date']
      }]
    });

    // Calculate totals
    let total_invoiced = 0;
    let total_paid = 0;
    let pending_invoices = 0;
    let overdue_invoices = 0;

    const now = new Date();

    invoices.forEach(invoice => {
      const invoiceAmount = parseFloat(invoice.total_amount || 0);
      const paidAmount = parseFloat(invoice.paid_amount || 0);
      
      total_invoiced += invoiceAmount;
      total_paid += paidAmount;

      if (invoice.status !== 'paid') {
        pending_invoices++;
        
        // Check if overdue
        if (invoice.due_date && new Date(invoice.due_date) < now) {
          overdue_invoices++;
        }
      }
    });

    const total_due = total_invoiced - total_paid;
    const all_paid = total_due <= 0.01; // Allow small rounding errors

    res.json({
      success: true,
      data: {
        all_paid,
        total_due: parseFloat(total_due.toFixed(2)),
        total_invoiced: parseFloat(total_invoiced.toFixed(2)),
        total_paid: parseFloat(total_paid.toFixed(2)),
        pending_invoices,
        overdue_invoices
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من حالة المدفوعات'
    });
  }
};

// @desc    Get student grades (conditional on payment)
// @route   GET /api/grades/student/grades
// @access  Private (Student only)
const getStudentGradesConditional = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'هذه الصفحة مخصصة للطلاب فقط'
      });
    }

    // Get student record
    const student = await Student.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: Specialty,
        attributes: ['id', 'name', 'arabic_name', 'code']
      }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على بيانات الطالب'
      });
    }

    // Check payment status first
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
    // If no invoices at all, treat as unpaid (student must have invoice to see grades)
    const has_invoices = invoices.length > 0;
    const all_paid = has_invoices && total_due <= 0.01;

    // If not paid, return payment required message
    if (!all_paid) {
      return res.status(403).json({
        success: false,
        payment_required: true,
        message: has_invoices
          ? 'يرجى سداد المصاريف الدراسية لعرض النتائج'
          : 'لم يتم إصدار فاتورة مصاريف بعد - يرجى مراجعة قسم المالية',
        data: {
          has_invoices,
          total_invoiced: parseFloat(total_invoiced.toFixed(2)),
          total_paid: parseFloat(total_paid.toFixed(2)),
          total_due: parseFloat(total_due.toFixed(2)),
          overdue_invoices: invoices.filter(inv =>
            inv.status !== 'paid' &&
            inv.due_date &&
            new Date(inv.due_date) < new Date()
          ).length
        }
      });
    }

    // If paid, return grades (only approved and published grades)
    const grades = await Grade.findAll({
      where: {
        student_id: student.id,
        status: 'approved',
        is_published: true,
        admin_approved_by: { [Op.ne]: null }
      },
      include: [{
        model: Course,
        attributes: ['id', 'course_code', 'course_name', 'arabic_name', 'credit_hours', 'branch']
      }, {
        model: AcademicYear,
        attributes: ['id', 'year_number', 'academic_season']
      }, {
        model: Semester,
        attributes: ['id', 'semester_name']
      }],
      order: [
        ['academic_year_id', 'ASC'],
        ['semester_id', 'ASC']
      ]
    });

    // Calculate GPA
    let totalPoints = 0;
    let totalCredits = 0;

    grades.forEach(grade => {
      const credits = parseFloat(grade.Course?.credit_hours || 0);
      const gradePoint = parseFloat(grade.grade_point || 0);
      
      totalPoints += gradePoint * credits;
      totalCredits += credits;
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

    // Format grades data
    const gradesData = grades.map(grade => ({
      id: grade.id,
      course_code: grade.Course?.course_code,
      course_name: grade.Course?.course_name,
      arabic_name: grade.Course?.arabic_name,
      credit_hours: grade.Course?.credit_hours,
      branch: grade.Course?.branch || null,
      branch_display: grade.Course?.branch === 'Software' ? 'البرمجيات (Software)' :
                      grade.Course?.branch === 'Network' ? 'الشبكات (Network)' :
                      grade.Course?.branch === 'Both' ? 'كلا الفرعين (Both)' : null,
      is_branch_specific: !!(grade.Course?.branch && grade.Course?.branch !== 'Both'),
      assignment1_grade: grade.assignment1_grade,
      assignment2_grade: grade.assignment2_grade,
      final_exam_score: parseFloat(grade.final_exam_score || 0),
      total_score: parseFloat(grade.total_score || 0),
      total_percentage: parseFloat(grade.total_percentage || 0),
      final_result: grade.final_result,
      letter_grade: grade.letter_grade,
      grade_point: parseFloat(grade.grade_point || 0),
      academic_year: grade.AcademicYear?.academic_season || `Year ${grade.AcademicYear?.year_number}`,
      semester: grade.Semester?.semester_name
    }));

    res.json({
      success: true,
      data: gradesData,
      gpa: parseFloat(gpa),
      student_branch: student.branch
    });

  } catch (error) {
    console.error('Get student grades conditional error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحميل الدرجات'
    });
  }
};

// @desc    Get students by course (based on specialty, year, and semester)
// @route   GET /api/professor/students-by-course?course_id=X
// @access  Private (Professor only)
// 
// BUGFIX: This endpoint was created to fix the issue where students weren't appearing
// in the professor grades page. The old logic relied on StudentEnrollment table,
// but the correct approach is to fetch ALL students who match:
// - Same specialty_id as the course
// - Same current_year as the course's academic_year_id
// - Regardless of StudentEnrollment records
//
// This ensures professors can see and grade all eligible students for their courses.
const getStudentsByCourse = async (req, res) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({
        success: false,
        message: 'هذه الصفحة مخصصة للأساتذة فقط'
      });
    }

    const { course_id } = req.query;

    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: 'course_id مطلوب'
      });
    }

    // Get professor record
    const professor = await Professor.findOne({
      where: { user_id: req.user.id }
    });

    if (!professor) {
      return res.status(403).json({
        success: false,
        message: 'لم يتم العثور على بيانات الأستاذ'
      });
    }

    // SECURITY: Verify professor is assigned to this course
    const professorCourse = await ProfessorCourse.findOne({
      where: {
        professor_id: professor.id,
        course_id: parseInt(course_id)
      }
    });

    if (!professorCourse) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية الوصول لهذه المادة'
      });
    }

    // Get course details with related data (specialty, academic year, semester)
    // This is needed to determine which students should be included
    const course = await Course.findByPk(course_id, {
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name', 'arabic_name']
        },
        {
          model: AcademicYear,
          attributes: ['id', 'year_number', 'academic_season']
        },
        {
          model: Semester,
          attributes: ['id', 'semester_name']
        }
      ],
      attributes: ['id', 'course_code', 'course_name', 'arabic_name', 'specialty_id', 'academic_year_id', 'branch']
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على المادة'
      });
    }

    // CORE FIX: Fetch students based on specialty_id and current_year
    // This replaces the old logic that relied on StudentEnrollment table
    // All students matching these criteria should appear, regardless of enrollment status
    const studentWhere = {
      specialty_id: course.specialty_id,
      current_year: course.AcademicYear.year_number
    };

    // Add branch filtering if course is branch-specific
    if (course.branch && course.branch !== 'Both') {
      studentWhere.branch = course.branch;
    }

    const students = await Student.findAll({
      where: studentWhere,
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: Specialty,
          attributes: ['id', 'name', 'arabic_name']
        }
      ]
    });

    // Get existing grades for these students (LEFT JOIN behavior)
    // Students without grades will still appear with grade: null
    const studentIds = students.map(s => s.id);
    const grades = await Grade.findAll({
      where: {
        student_id: studentIds,
        course_id: parseInt(course_id)
      }
    });

    // Create a map for efficient grade lookup
    const gradesMap = {};
    grades.forEach(grade => {
      gradesMap[grade.student_id] = grade;
    });

    // Get course grade configuration (or use defaults)
    // This preserves the existing Grade Settings functionality
    const CourseGradeConfig = require('../models/CourseGradeConfig');
    const config = await CourseGradeConfig.findOne({
      where: { course_id: parseInt(course_id) }
    });

    const course_config = config ? {
      ass1_max: parseFloat(config.ass1_max),
      ass2_max: parseFloat(config.ass2_max),
      final_max: parseFloat(config.final_max),
      p_value: parseFloat(config.p_value),
      m_value: parseFloat(config.m_value),
      d_value: parseFloat(config.d_value)
    } : {
      ass1_max: 30.00,
      ass2_max: 30.00,
      final_max: 150.00,
      p_value: 30.00,
      m_value: 21.00,
      d_value: 15.00
    };

    // Format response
    const studentsData = students.map(student => {
      const grade = gradesMap[student.id];

      return {
        student_id: student.id,
        student_code: student.student_code,
        full_name: student.User?.full_name,
        specialty_name: student.Specialty?.arabic_name || student.Specialty?.name,
        current_year: student.current_year,
        grade: grade ? {
          id: grade.id,
          assignment1_grade: grade.assignment1_grade,
          assignment1_score: parseFloat(grade.assignment1_score || 0),
          assignment2_grade: grade.assignment2_grade,
          assignment2_score: parseFloat(grade.assignment2_score || 0),
          final_exam_score: parseFloat(grade.final_exam_score || 0),
          total_score: parseFloat(grade.total_score || 0),
          total_percentage: parseFloat(grade.total_percentage || 0),
          final_result: grade.final_result,
          letter_grade: grade.letter_grade,
          grade_point: parseFloat(grade.grade_point || 0),
          status: grade.status
        } : null
      };
    });

    res.json({
      success: true,
      data: studentsData,
      course_info: {
        course_code: course.course_code,
        course_name: course.course_name,
        arabic_name: course.arabic_name,
        specialty_name: course.Specialty?.arabic_name || course.Specialty?.name,
        academic_year: course.AcademicYear?.year_number,
        semester_name: course.Semester?.semester_name
      },
      course_config
    });

  } catch (error) {
    console.error('Get students by course error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحميل بيانات الطلاب'
    });
  }
};

// @desc    Get available courses for student with branch filtering
// @route   GET /api/grades/student/courses
// @access  Student
const getStudentCourses = async (req, res) => {
  try {
    const { academic_year_id, semester_id } = req.query;

    // Get student with specialty
    const student = await Student.findOne({
      where: { user_id: req.user.id },
      include: [{ model: Specialty, attributes: ['id', 'code', 'name'] }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على بيانات الطالب'
      });
    }

    // Build where clause
    const where = {
      specialty_id: student.specialty_id,
      is_active: true
    };

    if (academic_year_id) where.academic_year_id = academic_year_id;
    if (semester_id) where.semester_id = semester_id;

    // Get all courses for this specialty
    let courses = await Course.findAll({
      where,
      include: [
        { model: AcademicYear, attributes: ['id', 'year_number'] },
        { model: Semester, attributes: ['id', 'semester_name'] }
      ],
      order: [['course_code', 'ASC']]
    });

    // Filter by branch if student has one
    if (student.branch) {
      courses = courses.filter(course => {
        // Include courses with no branch, "Both", or matching student branch
        return !course.branch ||
               course.branch === 'Both' ||
               course.branch === student.branch;
      });
    }

    // Add is_branch_specific flag and branch display info
    const coursesWithFlag = courses.map(course => {
      const courseJson = course.toJSON();
      return {
        ...courseJson,
        is_branch_specific: !!(course.branch && course.branch !== 'Both'),
        branch_display: course.branch === 'Software' ? 'البرمجيات (Software)' :
                        course.branch === 'Network' ? 'الشبكات (Network)' :
                        course.branch === 'Both' ? 'كلا الفرعين (Both)' : null
      };
    });

    res.json({
      success: true,
      data: coursesWithFlag,
      student_branch: student.branch,
      count: coursesWithFlag.length
    });

  } catch (error) {
    console.error('Get student courses error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحميل المواد'
    });
  }
};

// @desc    Get student's payment history (same detail as accountant view)
// @route   GET /api/grades/student/payments
// @access  Private (Student only)
const getStudentPayments = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can access this endpoint'
      });
    }

    const student = await Student.findOne({
      where: { user_id: req.user.id }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    // Get invoices with full payment details (same as accountant view)
    const invoices = await FeeInvoice.findAll({
      where: { student_id: student.id },
      include: [
        {
          model: Payment,
          attributes: ['id', 'receipt_number', 'amount', 'payment_method', 'transaction_id', 'payment_date', 'notes', 'created_at']
        },
        {
          model: AcademicYear,
          attributes: ['year_number', 'academic_season']
        },
        {
          model: Semester,
          attributes: ['semester_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate summary with detailed breakdown
    const invoicesWithCalc = invoices.map(inv => {
      const invData = inv.toJSON();
      const paid = invData.Payments
        ? invData.Payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
        : parseFloat(invData.paid_amount) || 0;
      const remaining = parseFloat(invData.total_amount || 0) - paid;
      return { ...invData, calculated_paid: paid, remaining };
    });

    const total = invoicesWithCalc.reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);
    const paid = invoicesWithCalc.reduce((s, i) => s + i.calculated_paid, 0);
    const due = total - paid;

    // Extract all payments flat list
    const allPayments = [];
    invoicesWithCalc.forEach(inv => {
      if (inv.Payments && inv.Payments.length > 0) {
        inv.Payments.forEach(payment => {
          allPayments.push({
            ...payment,
            invoice_number: inv.invoice_number,
            invoice_total: inv.total_amount,
            academic_year: inv.AcademicYear?.academic_season || `السنة ${inv.AcademicYear?.year_number}`,
            semester: inv.Semester?.semester_name || '—'
          });
        });
      }
    });

    res.json({
      success: true,
      data: {
        payments: allPayments,
        invoices: invoicesWithCalc,
        summary: { total, paid, due }
      }
    });

  } catch (error) {
    console.error('Get student payments error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحميل سجل المدفوعات'
    });
  }
};

// @desc    Get ALL grades for admin (all statuses, with filters)
// @route   GET /api/grades/admin/all
// @access  Admin
const getAllGradesForAdmin = async (req, res) => {
  try {
    const { status, course_id, specialty_id, academic_year_id, semester_id, student_id } = req.query;

    const where = {};
    if (status) where.status = status;
    if (course_id) where.course_id = course_id;
    if (academic_year_id) where.academic_year_id = academic_year_id;
    if (semester_id) where.semester_id = semester_id;
    if (student_id) where.student_id = student_id;

    // Filter by specialty via student join
    let studentWhere = {};
    if (specialty_id) studentWhere.specialty_id = specialty_id;

    const grades = await Grade.findAll({
      where,
      include: [
        {
          model: Student,
          where: Object.keys(studentWhere).length ? studentWhere : undefined,
          required: !!specialty_id,
          attributes: ['id', 'student_code', 'current_year', 'specialty_id'],
          include: [
            { model: User, attributes: ['full_name', 'email'] },
            { model: Specialty, attributes: ['id', 'arabic_name', 'code'] }
          ]
        },
        {
          model: Course,
          attributes: ['id', 'course_code', 'course_name', 'arabic_name']
        },
        {
          model: AcademicYear,
          attributes: ['id', 'year_number'],
          required: false
        },
        {
          model: Semester,
          attributes: ['id', 'semester_name'],
          required: false
        }
      ],
      order: [['updated_at', 'DESC']]
    });

    // Group by status for summary
    const summary = {
      total: grades.length,
      draft: grades.filter(g => g.status === 'draft').length,
      pending_admin_approval: grades.filter(g => g.status === 'pending_admin_approval').length,
      approved: grades.filter(g => g.status === 'approved').length,
      rejected: grades.filter(g => g.status === 'rejected').length
    };

    res.json({
      success: true,
      data: grades,
      summary,
      count: grades.length
    });

  } catch (error) {
    console.error('getAllGradesForAdmin error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

// @desc    Approve ALL pending grades (bulk approval)
// @route   PUT /api/grades/admin/approve-all
// @access  Admin
const approveAllGrades = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'فقط المسؤول يمكنه اعتماد الدرجات'
      });
    }

    const { course_id, specialty_id, academic_year_id, semester_id, grade_ids } = req.body;

    // Build where clause — must be pending_admin_approval or draft
    const where = { status: { [Op.in]: ['pending_admin_approval', 'draft'] } };

    if (grade_ids && Array.isArray(grade_ids) && grade_ids.length > 0) {
      // Approve specific grades by ID
      where.id = { [Op.in]: grade_ids };
    } else {
      // Approve by filters
      if (course_id) where.course_id = course_id;
      if (academic_year_id) where.academic_year_id = academic_year_id;
      if (semester_id) where.semester_id = semester_id;

      if (specialty_id) {
        const students = await Student.findAll({
          where: { specialty_id },
          attributes: ['id']
        });
        const studentIds = students.map(s => s.id);
        if (studentIds.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'لا يوجد طلاب في هذا التخصص'
          });
        }
        where.student_id = { [Op.in]: studentIds };
      }
    }

    // Count before updating
    const pendingCount = await Grade.count({ where });

    if (pendingCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'لا توجد درجات معلقة للاعتماد'
      });
    }

    const approvedAt = new Date();
    const [updatedCount] = await Grade.update(
      {
        status: 'approved',
        admin_approved_by: req.user.id,
        approved_at: approvedAt
      },
      { where }
    );

    // Log activity
    await logActivity(req.user.id, 'approve_all', 'Grade', null, `Bulk approved ${updatedCount} grades`);

    res.json({
      success: true,
      message: `تم اعتماد ${updatedCount} درجة بنجاح`,
      data: {
        approved_count: updatedCount,
        approved_at: approvedAt
      }
    });

  } catch (error) {
    console.error('approveAllGrades error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم'
    });
  }
};

module.exports = {
  submitGrades,
  submitForApproval,
  getProfessorGrades,
  getProfessorCourses,
  getProfessorDashboard,
  getPendingGrades,
  approveGrade,
  approveAllGrades,
  getAllGradesForAdmin,
  rejectGrade,
  getStudentGrades,
  getStudentInvoices,
  getStudentQRCode,
  getStudentDashboard,
  getPaymentStatus,
  getStudentGradesConditional,
  getStudentCourses,
  getProfessorStudents,
  getStudentsByCourse,
  updateGrade,
  deleteGrade,
  getStudentPayments
};
