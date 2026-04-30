const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getSummary,
  getStudentInvoices,
  createInvoice,
  createPayment,
  createPaymentByStudent,
  getSpecialtyFees,
  updateSpecialtyFees,
  searchStudent,
  getAllStudentsWithPayments,
  autoGenerateInvoices,
  generateSummerInvoices,
  generateCourseFailInvoices,
  applyDiscountByStudent
} = require('../controllers/accountantController');

const { getAllAcademicYears } = require('../controllers/adminController');

router.use(authenticateToken, authorizeRoles('accountant'));

router.get('/summary', getSummary);
router.get('/students', getAllStudentsWithPayments);
router.get('/students/search', searchStudent);
router.get('/students/:id/invoices', getStudentInvoices);
router.post('/invoices', createInvoice);
router.post('/invoices/auto-generate', autoGenerateInvoices);
router.post('/invoices/summer', generateSummerInvoices);
router.post('/invoices/course-fail', generateCourseFailInvoices);
router.post('/payments', createPayment);
router.post('/payments/by-student', createPaymentByStudent);
router.post('/invoices/discount-by-student', applyDiscountByStudent);
router.get('/specialty-fees', getSpecialtyFees);
router.put('/specialty-fees/:specialty_id', updateSpecialtyFees);

// Academic years — needed for course-fail invoice modal
router.get('/academic-years', getAllAcademicYears);

module.exports = router;
