const express = require('express');
const router = express.Router();
const extendedAdminController = require('../controllers/extendedAdminController');
const authMiddleware = require('../middleware/auth');
const {
  validateCourseCreation,
  validateCourseUpdate,
  validateCourseFilters,
  validateProfessorCreation,
  validateProfessorUpdate,
  validateCoursAssignment,
  validateGradeApproval,
  validateGradeEdit,
  validateGradeRejection,
  validateGradeSettingUpdate
} = require('../middleware/validators');

// ==================== AUTHENTICATION MIDDLEWARE ====================
// All admin routes require authentication
router.use(authMiddleware.authenticateToken);

// Authorization middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

router.use(isAdmin);

// ==================== COURSE ROUTES ====================

/**
 * Create a new course
 * POST /api/admin/courses
 * Body: { specialty_id, academic_year_id, semester_id, course_code, course_name, arabic_name, credit_hours }
 */
router.post(
  '/courses',
  validateCourseCreation,
  extendedAdminController.createCourse.bind(extendedAdminController)
);

/**
 * Get all courses with optional filters
 * GET /api/admin/courses?specialty_id=1&academic_year_id=1&semester_id=1&is_active=true
 */
router.get(
  '/courses',
  validateCourseFilters,
  extendedAdminController.getCourses.bind(extendedAdminController)
);

/**
 * Get single course by ID
 * GET /api/admin/courses/:id
 */
router.get(
  '/courses/:id',
  extendedAdminController.getCourseById.bind(extendedAdminController)
);

/**
 * Update course
 * PUT /api/admin/courses/:id
 * Body: { course_name, arabic_name, credit_hours, is_active }
 */
router.put(
  '/courses/:id',
  validateCourseUpdate,
  extendedAdminController.updateCourse.bind(extendedAdminController)
);

/**
 * Soft delete course (marks as inactive)
 * DELETE /api/admin/courses/:id
 */
router.delete(
  '/courses/:id',
  extendedAdminController.deleteCourse.bind(extendedAdminController)
);

// ==================== PROFESSOR ROUTES ====================

/**
 * Create a new professor (creates User + Professor records atomically)
 * POST /api/admin/professors
 * Body: { username, email, password, full_name, phone, department, specialization }
 */
router.post(
  '/professors',
  validateProfessorCreation,
  extendedAdminController.createProfessor.bind(extendedAdminController)
);

/**
 * Get all professors with optional filters
 * GET /api/admin/professors?is_active=true&department=Engineering
 */
router.get(
  '/professors',
  extendedAdminController.getProfessors.bind(extendedAdminController)
);

/**
 * Get professor by ID with assigned courses
 * GET /api/admin/professors/:id
 */
router.get(
  '/professors/:id',
  extendedAdminController.getProfessorById.bind(extendedAdminController)
);

/**
 * Update professor
 * PUT /api/admin/professors/:id
 * Body: { department, specialization, is_active }
 */
router.put(
  '/professors/:id',
  validateProfessorUpdate,
  extendedAdminController.updateProfessor.bind(extendedAdminController)
);

/**
 * Delete professor (soft delete - marks as inactive)
 * DELETE /api/admin/professors/:id
 */
router.delete(
  '/professors/:id',
  extendedAdminController.deleteProfessor.bind(extendedAdminController)
);

/**
 * Assign course to professor
 * POST /api/admin/professors/:id/courses
 * Body: { course_id, academic_year_id, semester_id, is_primary }
 */
router.post(
  '/professors/:id/courses',
  validateCoursAssignment,
  extendedAdminController.assignCourseToProfessor.bind(extendedAdminController)
);

/**
 * Remove course from professor
 * DELETE /api/admin/professor-courses/:assignmentId
 */
router.delete(
  '/professor-courses/:assignmentId',
  extendedAdminController.removeCourseFomProfessor.bind(extendedAdminController)
);

// ==================== GRADE SETTINGS ROUTES ====================

/**
 * Get all grade settings
 * GET /api/admin/grade-settings
 */
router.get(
  '/grade-settings',
  extendedAdminController.getAllGradeSettings.bind(extendedAdminController)
);

/**
 * Get single grade setting by name
 * GET /api/admin/grade-settings/:name
 * Example: /api/admin/grade-settings/pass_grade_value
 */
router.get(
  '/grade-settings/:name',
  extendedAdminController.getGradeSetting.bind(extendedAdminController)
);

/**
 * Update grade setting
 * PUT /api/admin/grade-settings/:name
 * Body: { setting_value }
 * Example: PUT /api/admin/grade-settings/pass_grade_value with { setting_value: 25 }
 */
router.put(
  '/grade-settings/:name',
  validateGradeSettingUpdate,
  extendedAdminController.updateGradeSetting.bind(extendedAdminController)
);

/**
 * Initialize default grade settings (admin only, one-time setup)
 * POST /api/admin/grade-settings/initialize
 * Sets defaults: pass=20, merit=30, distinction=40, max_final_exam=150, max_total_score=200, grade brackets
 */
router.post(
  '/grade-settings/initialize',
  extendedAdminController.initializeGradeSettings.bind(extendedAdminController)
);

// ==================== GRADE APPROVAL ROUTES ====================

/**
 * Get all pending grades awaiting admin approval
 * GET /api/admin/grades/pending?course_id=1&academic_year_id=1&semester_id=1
 */
router.get(
  '/grades/pending',
  extendedAdminController.getPendingGrades.bind(extendedAdminController)
);

/**
 * Preview what metrics will be calculated when grade is approved
 * GET /api/admin/grades/:id/preview
 * Shows current values + calculated metrics using current grade settings
 */
router.get(
  '/grades/:id/preview',
  validateGradeApproval,
  extendedAdminController.previewGradeMetrics.bind(extendedAdminController)
);

/**
 * Edit grade before approval
 * PUT /api/admin/grades/:id/edit
 * Body: { assignment1_grade, assignment2_grade, final_exam_score, notes }
 * Only allows editing if status is 'pending_admin_approval'
 */
router.put(
  '/grades/:id/edit',
  validateGradeEdit,
  extendedAdminController.editGradeBeforeApproval.bind(extendedAdminController)
);

/**
 * Approve grade with automatic metrics calculation
 * PUT /api/admin/grades/:id/approve
 * Calculates: assignment scores, final exam, total, percentage, grade points, letter grade
 * Sets status to 'approved', admin_approved_by, approved_at
 * Uses Sequelize transaction
 */
router.put(
  '/grades/:id/approve',
  validateGradeApproval,
  extendedAdminController.approveGrade.bind(extendedAdminController)
);

/**
 * Reject grade and revert to draft
 * PUT /api/admin/grades/:id/reject
 * Body: { rejection_reason }
 * Reverts status to 'draft', appends rejection reason to notes with timestamp
 * Uses Sequelize transaction
 */
router.put(
  '/grades/:id/reject',
  validateGradeRejection,
  extendedAdminController.rejectGrade.bind(extendedAdminController)
);

// ==================== QR CODE ROUTES ====================

/**
 * Generate QR code for student registration
 * POST /api/admin/qr-codes/generate/:studentId
 * Body: { expirationHours } (optional, defaults to 24)
 * Returns: qr_secret, qr_data (base64), qr_image (DataURL), expires_at, is_active
 */
router.post(
  '/qr-codes/generate/:studentId',
  extendedAdminController.generateStudentQRCode.bind(extendedAdminController)
);

/**
 * Regenerate QR code for student (deactivates old, creates new)
 * POST /api/admin/qr-codes/regenerate/:studentId
 * Body: { expirationHours } (optional, defaults to 24)
 */
router.post(
  '/qr-codes/regenerate/:studentId',
  extendedAdminController.regenerateStudentQRCode.bind(extendedAdminController)
);

/**
 * Revoke/deactivate QR code for student
 * DELETE /api/admin/qr-codes/:studentId
 * Marks most recent QR code as inactive
 */
router.delete(
  '/qr-codes/:studentId',
  extendedAdminController.revokeStudentQRCode.bind(extendedAdminController)
);

module.exports = router;
