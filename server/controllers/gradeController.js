const { Op } = require('sequelize');
const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Semester = require('../models/Semester');
const AcademicYear = require('../models/AcademicYear');
const StudentEnrollment = require('../models/StudentEnrollment');
const ProfessorCourse = require('../models/ProfessorCourse');
const Professor = require('../models/Professor');
const User = require('../models/User');
const FeeInvoice = require('../models/FeeInvoice');
const Payment = require('../models/Payment');
const StudentQRCode = require('../models/StudentQRCode');
const ActivityLog = require('../models/ActivityLog');

// Helper: Log activity
const logActivity = async (userId, action, entity_type, entity_id, description) => {
  try {
    await ActivityLog.create({
      user_id: userId,
      action,
      entity_type,
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
    if (req.user.role !== 'professor') {
      return res.status(403).json({
        success: false,
        message: 'Only professors can submit grades'
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

    // Get professor record
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

    // Check if student is enrolled
    const enrollment = await StudentEnrollment.findOne({
      where: {
        student_id: parseInt(student_id),
        course_id: parseInt(course_id),
        academic_year_id: parseInt(academic_year_id),
        semester_id: parseInt(semester_id)
      }
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this course'
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
      professor_submitted_by: professor.id,
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

    let whereClause = { status: 'pending_admin_approval' };

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

    if (grade.status !== 'pending_admin_approval') {
      return res.status(400).json({
        success: false,
        message: 'Only pending grades can be approved'
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

    if (grade.status !== 'pending_admin_approval') {
      return res.status(400).json({
        success: false,
        message: 'Only pending grades can be rejected'
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
      where: { user_id: req.user.id }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found'
      });
    }

    const grades = await Grade.findAll({
      where: {
        student_id: student.id,
        status: 'approved'
      },
      include: [
        {
          model: Course,
          attributes: ['course_code', 'course_name', 'arabic_name', 'credit_hours']
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

    res.json({
      success: true,
      data: grades,
      count: grades.length
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
        {
          model: User,
          attributes: ['full_name', 'email']
        }
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
          full_name: student.User?.full_name,
          email: student.User?.email,
          student_code: student.student_code,
          current_year: student.current_year
        },
        summary: {
          enrolled_courses,
          approved_grades,
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

module.exports = {
  submitGrades,
  submitForApproval,
  getProfessorGrades,
  getPendingGrades,
  approveGrade,
  rejectGrade,
  getStudentGrades,
  getStudentInvoices,
  getStudentQRCode,
  getStudentDashboard
};
