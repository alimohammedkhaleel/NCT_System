const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/gradeController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// ============ PROFESSOR ROUTES ============
// GET professor dashboard with statistics
router.get('/professor/dashboard', authorizeRoles('professor', 'admin'), getProfessorDashboard);

// GET courses assigned to the logged-in professor
router.get('/professor/courses', authorizeRoles('professor', 'admin'), getProfessorCourses);

// GET students by course (based on specialty, year, semester) - NEW
router.get('/professor/students-by-course', authorizeRoles('professor', 'admin'), getStudentsByCourse);

// GET students enrolled in a course with their grades (OLD - kept for backward compatibility)
router.get('/professor/students', authorizeRoles('professor', 'admin'), getProfessorStudents);

// GET professor's submitted grades (with status filter)
router.get('/professor', authorizeRoles('professor', 'admin'), getProfessorGrades);

// POST submit grades for a student (status: draft)
router.post('/', authorizeRoles('professor', 'admin'), submitGrades);

// PUT update a draft grade
router.put('/:id', authorizeRoles('professor', 'admin'), updateGrade);

// DELETE a draft grade
router.delete('/:id', authorizeRoles('professor', 'admin'), deleteGrade);

// POST submit draft grades for admin approval
router.post('/:id/submit-for-approval', authorizeRoles('professor', 'admin'), submitForApproval);

// ============ ADMIN ROUTES ============
// GET pending grades awaiting admin approval
router.get('/admin/pending', authorizeRoles('admin'), getPendingGrades);

// GET all grades for admin (all statuses, with filters)
router.get('/admin/all', authorizeRoles('admin'), getAllGradesForAdmin);

// PUT bulk approve all pending grades — MUST be before /:id/approve to avoid route conflict
router.put('/admin/approve-all', authorizeRoles('admin'), approveAllGrades);

// PUT approve a pending grade
router.put('/:id/approve', authorizeRoles('admin'), approveGrade);

// PUT reject (revert) a pending grade
router.put('/:id/reject', authorizeRoles('admin'), rejectGrade);

// ============ STUDENT ROUTES ============
// GET student payment status
router.get('/student/payment-status', authorizeRoles('student'), getPaymentStatus);

// GET student's approved grades (conditional on payment)
router.get('/student/grades', authorizeRoles('student'), getStudentGradesConditional);

// GET available courses for student with branch filtering
router.get('/student/courses', authorizeRoles('student'), getStudentCourses);

// GET student's invoices and payment summary
router.get('/student/invoices', authorizeRoles('student'), getStudentInvoices);

// GET student's QR code for registration
router.get('/student/qr-code', authorizeRoles('student'), getStudentQRCode);

// GET student's payment history (detailed, same as accountant view)
router.get('/student/payments', authorizeRoles('student'), getStudentPayments);

// GET student dashboard with summary
router.get('/student/dashboard', authorizeRoles('student'), getStudentDashboard);

module.exports = router;