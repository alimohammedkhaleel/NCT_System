const express = require('express');
const router = express.Router();
const TimetableController = require('../controllers/timetableController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../config/multer');

/**
 * POST /api/admin/timetables
 * Create a new timetable with PDF upload
 */
router.post('/timetables', authenticateToken, authorizeRoles('admin'), upload.single('file'), TimetableController.createTimetable);

/**
 * GET /api/admin/timetables
 * Get all timetables with optional filtering
 */
router.get('/timetables', authenticateToken, authorizeRoles('admin'), TimetableController.getAllTimetables);

/**
 * GET /api/admin/timetables/:id
 * Get timetable by ID
 */
router.get('/timetables/:id', authenticateToken, TimetableController.getTimetableById);

/**
 * PUT /api/admin/timetables/:id
 * Update timetable (title and/or file)
 */
router.put('/timetables/:id', authenticateToken, authorizeRoles('admin'), upload.single('file'), TimetableController.updateTimetable);

/**
 * DELETE /api/admin/timetables/:id
 * Delete timetable and remove file
 */
router.delete('/timetables/:id', authenticateToken, authorizeRoles('admin'), TimetableController.deleteTimetable);

module.exports = router;
