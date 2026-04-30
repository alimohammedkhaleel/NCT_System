const express = require('express');
const router = express.Router();
const {
  registerProfessor,
  registerProfessorViaLink,
  validateProfessorLink,
  getProfessorRequests,
  getProfessorRequest,
  approveProfessorRequest,
  approveBulkProfessorRequests,
  rejectProfessorRequest,
  deleteProfessorRequest,
  createProfessorRegistrationLink,
  getProfessorRegistrationLinks
} = require('../controllers/professorRegistrationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes - Professor registration
router.post('/register', registerProfessor);
router.get('/register-link/:token', validateProfessorLink);
router.post('/register-link/:token', registerProfessorViaLink);

// Admin routes - Require authentication and admin role
router.get('/admin/requests', authenticateToken, authorizeRoles('admin'), getProfessorRequests);
router.get('/admin/requests/:id', authenticateToken, authorizeRoles('admin'), getProfessorRequest);
router.post('/admin/requests/approve-all', authenticateToken, authorizeRoles('admin'), approveBulkProfessorRequests);
router.post('/admin/requests/:id/approve', authenticateToken, authorizeRoles('admin'), approveProfessorRequest);
router.post('/admin/requests/:id/reject', authenticateToken, authorizeRoles('admin'), rejectProfessorRequest);
router.delete('/admin/requests/:id', authenticateToken, authorizeRoles('admin'), deleteProfessorRequest);

// Admin routes - Registration links
router.post('/admin/links', authenticateToken, authorizeRoles('admin'), createProfessorRegistrationLink);
router.get('/admin/links', authenticateToken, authorizeRoles('admin'), getProfessorRegistrationLinks);

module.exports = router;
