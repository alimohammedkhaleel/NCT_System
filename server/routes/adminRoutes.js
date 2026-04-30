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
  updateUserStatus,
  // Student Promotion & Results Publishing
  publishResults,
  promoteToNextSemester,
  promoteToNextYear,
  getGradeStats,
  getCoursesWithStats,
  // Bulk Promotion System
  bulkPromoteStudents,
  promoteSummerPassed,
  // Registration Links
  createRegistrationLink,
  getRegistrationLinks,
  getRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest,
  // New: Bulk Student Management
  approveAllRegistrationRequests,
  deleteRegistrationRequest,
  getPendingRequestsBulk
} = require('../controllers/adminController');

const { getAllStudents, createStudent, updateStudent, promoteStudent, deleteStudent } = require('../controllers/studentController');

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
// Note: Course routes are handled by extendedAdminRoutes.js
// Courses are available at /api/admin/courses via extendedAdminRoutes

// ==================== COURSE GRADE CONFIG ROUTES ====================
const courseGradeConfigRoutes = require('./courseGradeConfigRoutes');
router.use('/course-grade-config', courseGradeConfigRoutes);

// ==================== PROFESSOR ROUTES ====================
// Note: Professor routes are handled by extendedAdminRoutes.js
// Professors are available at /api/admin/professors via extendedAdminRoutes

// ==================== USER MANAGEMENT ROUTES ====================
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

// ==================== STUDENT ROUTES ====================
router.get('/students', getAllStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.post('/students/:id/promote', promoteStudent);

// ==================== STUDENT PROMOTION & RESULTS PUBLISHING ====================
router.get('/publish-results/courses', getCoursesWithStats);
router.post('/publish-results', publishResults);
router.post('/promote-semester', promoteToNextSemester);
router.post('/promote-year', promoteToNextYear);
router.get('/grades/stats', getGradeStats);

// ==================== BULK PROMOTION & SUMMER COURSE ====================
router.post('/bulk-promote', bulkPromoteStudents);
router.post('/promote-summer-passed', promoteSummerPassed);

// ==================== REGISTRATION LINK ROUTES ====================
router.post('/registration-links', createRegistrationLink);
router.get('/registration-links', getRegistrationLinks);
router.get('/registration-requests', getRegistrationRequests);
router.get('/registration-requests/pending-bulk', getPendingRequestsBulk);
router.post('/registration-requests/approve-all', approveAllRegistrationRequests);
router.post('/registration-requests/:id/approve', approveRegistrationRequest);
router.post('/registration-requests/:id/reject', rejectRegistrationRequest);
router.delete('/registration-requests/:id', deleteRegistrationRequest);

// ==================== SPECIALTY FEES ROUTES (Admin) ====================
const SpecialtyFee = require('../models/SpecialtyFee');
const Specialty = require('../models/Specialty');

router.get('/specialty-fees', async (req, res) => {
  try {
    const specialties = await Specialty.findAll({
      where: { is_active: true },
      include: [{ model: SpecialtyFee, attributes: ['year_number', 'fee_amount', 'summer_fee', 'course_fail_fee'] }],
      order: [['code', 'ASC']]
    });
    const data = specialties.map(sp => {
      const feeMap = {};
      (sp.SpecialtyFees || []).forEach(f => {
        feeMap[`year${f.year_number}_fee`] = parseFloat(f.fee_amount);
        // summer_fee and course_fail_fee are the same for all rows of a specialty — take the max (last non-zero wins)
        const sf = parseFloat(f.summer_fee || 0);
        const cf = parseFloat(f.course_fail_fee || 0);
        if (sf > 0 || !('summer_fee' in feeMap)) feeMap.summer_fee = sf;
        if (cf > 0 || !('course_fail_fee' in feeMap)) feeMap.course_fail_fee = cf;
      });
      return {
        ...sp.toJSON(),
        _year1_fee: feeMap.year1_fee ?? 0,
        _year2_fee: feeMap.year2_fee ?? 0,
        _year3_fee: feeMap.year3_fee ?? 0,
        _year4_fee: feeMap.year4_fee ?? 0,
        _summer_fee: feeMap.summer_fee ?? 0,
        _course_fail_fee: feeMap.course_fail_fee ?? 0,
      };
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/specialty-fees/:specialty_id', async (req, res) => {
  try {
    const { specialty_id } = req.params;
    const { year1_fee, year2_fee, year3_fee, year4_fee, summer_fee, course_fail_fee } = req.body;
    const fees = [
      { year_number: 1, fee_amount: year1_fee || 0 },
      { year_number: 2, fee_amount: year2_fee || 0 },
      { year_number: 3, fee_amount: year3_fee || 0 },
      { year_number: 4, fee_amount: year4_fee || 0 }
    ];
    for (const fee of fees) {
      await SpecialtyFee.upsert({
        specialty_id: parseInt(specialty_id),
        ...fee,
        summer_fee: summer_fee || 0,
        course_fail_fee: course_fail_fee || 0
      });
    }
    res.json({ success: true, message: 'تم تحديث الرسوم بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
