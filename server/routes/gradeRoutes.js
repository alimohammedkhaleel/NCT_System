const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/gradeController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// ============ PROFESSOR ROUTES ============
// GET professor's submitted grades (with status filter)
router.get('/professor', authorizeRoles('professor'), getProfessorGrades);

// POST submit grades for a student (status: draft)
router.post('/', authorizeRoles('professor'), submitGrades);

// POST submit draft grades for admin approval
router.post('/:id/submit-for-approval', authorizeRoles('professor'), submitForApproval);

// ============ ADMIN ROUTES ============
// GET pending grades awaiting admin approval
router.get('/admin/pending', authorizeRoles('admin'), getPendingGrades);

// PUT approve a pending grade
router.put('/:id/approve', authorizeRoles('admin'), approveGrade);

// PUT reject (revert) a pending grade
router.put('/:id/reject', authorizeRoles('admin'), rejectGrade);

// ============ STUDENT ROUTES ============
// GET student's approved grades only
router.get('/student/grades', authorizeRoles('student'), getStudentGrades);

// GET student's invoices and payment summary
router.get('/student/invoices', authorizeRoles('student'), getStudentInvoices);

// GET student's QR code for registration
router.get('/student/qr-code', authorizeRoles('student'), getStudentQRCode);

// GET student dashboard with summary
router.get('/student/dashboard', authorizeRoles('student'), getStudentDashboard);

module.exports = router;