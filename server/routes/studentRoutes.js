const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getAllStudents, createStudent, updateStudent, promoteStudent, deleteStudent, getStudentData, updateStudentBranch } = require('../controllers/studentController');

// Student data endpoint - requires student role
router.get('/data', authenticateToken, authorizeRoles('student'), getStudentData);

// Student branch update - requires student role
router.put('/branch', authenticateToken, authorizeRoles('student'), updateStudentBranch);

// All other student routes require authentication and admin role
router.use(authenticateToken, authorizeRoles('admin'));

router.get('/', getAllStudents);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);
router.post('/:id/promote', promoteStudent);

module.exports = router;
