const express = require('express');
const router = express.Router();
const TimetableController = require('../controllers/timetableController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../config/multer');

/**
 * GET /api/admin/timetables/student
 * Get timetable for the logged-in student based on specialty
 */
router.get('/timetables/student', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const Student = require('../models/Student');
    const Timetable = require('../models/Timetable');
    const Specialty = require('../models/Specialty');

    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const timetables = await Timetable.findAll({
      where: { specialty_id: student.specialty_id },
      include: [{ model: Specialty, attributes: ['name', 'arabic_name', 'code'] }],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: timetables, count: timetables.length });
  } catch (error) {
    console.error('Get student timetable error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/admin/timetables
 * Get all timetables with optional filtering
 */
router.get('/timetables', authenticateToken, authorizeRoles('admin'), TimetableController.getAllTimetables);

/**
 * POST /api/admin/timetables
 * Create a new timetable with PDF upload
 */
router.post('/timetables', authenticateToken, authorizeRoles('admin'), upload.single('file'), TimetableController.createTimetable);

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
