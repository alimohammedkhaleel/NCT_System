const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  // Specialty
  createSpecialty,
  getAllSpecialties,
  getSpecialtyById,
  updateSpecialty,
  deleteSpecialty,
  // Academic Year
  createAcademicYear,
  getAllAcademicYears,
  updateAcademicYear,
  // Semester
  createSemester,
  getAllSemesters,
  updateSemester,
  // User Management
  getAllUsers,
  updateUserStatus
} = require('../controllers/adminController');

const {
  // Course
  createCourse,
  getAllCourses,
  updateCourse,
  // Professor
  getAllProfessors,
  updateProfessor,
  // Professor-Course Assignment
  assignProfessorToCourse,
  removeProfessorFromCourse
} = require('../controllers/courseController');

// All admin routes require authentication and admin role
router.use(authenticateToken, authorizeRoles('admin'));

// ==================== SPECIALTY ROUTES ====================
router.post('/specialties', createSpecialty);
router.get('/specialties', getAllSpecialties);
router.get('/specialties/:id', getSpecialtyById);
router.put('/specialties/:id', updateSpecialty);
router.delete('/specialties/:id', deleteSpecialty);

// ==================== ACADEMIC YEAR ROUTES ====================
router.post('/academic-years', createAcademicYear);
router.get('/academic-years', getAllAcademicYears);
router.put('/academic-years/:id', updateAcademicYear);

// ==================== SEMESTER ROUTES ====================
router.post('/semesters', createSemester);
router.get('/semesters', getAllSemesters);
router.put('/semesters/:id', updateSemester);

// ==================== COURSE ROUTES ====================
router.post('/courses', createCourse);
router.get('/courses', getAllCourses);
router.put('/courses/:id', updateCourse);

// ==================== PROFESSOR ROUTES ====================
router.get('/professors', getAllProfessors);
router.put('/professors/:id', updateProfessor);

// ==================== PROFESSOR-COURSE ASSIGNMENT ROUTES ====================
router.post('/professor-courses', assignProfessorToCourse);
router.delete('/professor-courses/:id', removeProfessorFromCourse);

// ==================== USER MANAGEMENT ROUTES ====================
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

module.exports = router;
