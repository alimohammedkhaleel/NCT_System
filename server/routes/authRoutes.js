const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const {
  login,
  studentLogin,
  register,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshAccessToken,
  verifyToken,
  retrieveStudentCode,
  verifyQRCode
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Rate limiter specifically for login endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 100 attempts in dev, 10 in production
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.VERCEL ? '/tmp/uploads/avatars' : 'uploads/avatars';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// Public routes
router.post('/login', loginLimiter, login);
router.post('/student-login', loginLimiter, studentLogin);
router.post('/retrieve-student-code', retrieveStudentCode);
router.post('/register', register);
router.post('/refresh-token', refreshAccessToken);
router.post('/verify-qr', verifyQRCode);

// GET /api/auth/register-link/:token — validate link and return specialties
router.get('/register-link/:token', async (req, res) => {
  try {
    const RegistrationLink = require('../models/RegistrationLink');
    const Specialty = require('../models/Specialty');
    const link = await RegistrationLink.findOne({ where: { token: req.params.token } });
    if (!link) return res.status(404).json({ success: false, message: 'رابط غير صالح' });
    if (new Date(link.expires_at) < new Date()) return res.status(400).json({ success: false, message: 'انتهت صلاحية الرابط' });
    const specialties = await Specialty.findAll({ where: { is_active: true }, attributes: ['id', 'code', 'name', 'arabic_name'] });
    res.json({ success: true, data: { valid: true, expires_at: link.expires_at, specialties } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/register-link/:token — submit registration request
router.post('/register-link/:token', async (req, res) => {
  try {
    const RegistrationLink = require('../models/RegistrationLink');
    const RegistrationRequest = require('../models/RegistrationRequest');
    const link = await RegistrationLink.findOne({ where: { token: req.params.token } });
    if (!link || new Date(link.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'الرابط غير صالح أو منتهي الصلاحية' });
    }
    const {
      full_name, national_id, email, phone, specialty_id,
      birth_date, gender, address,
      high_school_certificate, high_school_grade,
      guardian_name, guardian_phone, guardian_relation,
      current_year, branch
    } = req.body;

    if (!full_name || !national_id || !email || !specialty_id || !birth_date || !gender || !phone) {
      return res.status(400).json({ success: false, message: 'يرجى ملء جميع الحقول المطلوبة (الاسم، الرقم القومي، البريد، الهاتف، التخصص، تاريخ الميلاد، النوع)' });
    }

    // Branch validation: required for ICT students in year 3 or 4
    const Specialty = require('../models/Specialty');
    const specialty = await Specialty.findByPk(specialty_id);
    const isICT = specialty && (specialty.code === 'ICT' || specialty.name.toLowerCase().includes('information'));
    const requiresBranch = isICT && parseInt(current_year) >= 3;

    if (requiresBranch && !branch) {
      console.error('[BRANCH_VALIDATION_FAILURE]', JSON.stringify({
        operation: 'registration',
        specialty_id,
        current_year,
        branch_provided: branch || null,
        error: 'missing_branch',
        timestamp: new Date().toISOString()
      }));
      return res.status(400).json({
        success: false,
        message: 'اختيار الفرع مطلوب لطلاب تكنولوجيا المعلومات في السنة الثالثة والرابعة',
        message_en: 'Branch selection is required for ICT 3rd and 4th year students'
      });
    }

    if (branch && !['Software', 'Network'].includes(branch)) {
      return res.status(400).json({
        success: false,
        message: 'قيمة الفرع غير صالحة. يجب أن تكون Software أو Network',
        message_en: 'Invalid branch value. Must be Software or Network'
      });
    }

    // Check duplicate national_id
    const existing = await RegistrationRequest.findOne({ where: { national_id } });
    if (existing) return res.status(400).json({ success: false, message: 'يوجد طلب مسبق بهذا الرقم القومي' });

    await RegistrationRequest.create({
      full_name,
      national_id,
      birth_date,
      gender,
      email,
      phone: phone || null,
      address: address || null,
      specialty_id,
      current_year: current_year || 1,
      branch: branch || null,
      high_school_certificate: high_school_certificate || null,
      high_school_grade: high_school_grade || null,
      guardian_name: guardian_name || null,
      guardian_phone: guardian_phone || null,
      guardian_relation: guardian_relation || null
    });
    res.json({ success: true, message: 'تم إرسال طلبك بنجاح، انتظر موافقة الإدارة' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/create-accountant — creates accountant user if not exists
router.post('/create-accountant', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const User = require('../models/User');
    const existing = await User.findOne({ where: { username: 'accountant' } });
    if (existing) {
      return res.json({ success: true, message: 'Accountant already exists', data: { username: 'accountant' } });
    }
    const hash = await bcrypt.hash('accountant123', 12);
    await User.create({
      username: 'accountant',
      email: 'accountant@nctu.edu',
      password_hash: hash,
      full_name: 'Accountant User',
      phone: '+20-2-11111111',
      role: 'accountant',
      is_active: true
    });
    res.json({ success: true, message: 'Accountant created', data: { username: 'accountant', password: 'accountant123' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/seed-specialties — creates the 6 NCTU specialties if not exist
router.post('/seed-specialties', async (req, res) => {
  try {
    const Specialty = require('../models/Specialty');
    const AcademicYear = require('../models/AcademicYear');
    const Semester = require('../models/Semester');
    const specialtyData = [
      { code: 'MCT', name: 'Mechatronics Technology', arabic_name: 'تكنولوجيا الميكاترونكس', duration_years: 4, total_credits: 132, annual_fee: 15000.00, is_active: true },
      { code: 'AUT', name: 'Autotronics Technology', arabic_name: 'تكنولوجيا الأوتوترونكس', duration_years: 4, total_credits: 132, annual_fee: 14000.00, is_active: true },
      { code: 'ICT', name: 'Information Technology', arabic_name: 'تكنولوجيا المعلومات', duration_years: 4, total_credits: 132, annual_fee: 12000.00, is_active: true },
      { code: 'PRO', name: 'Prosthetics Technology', arabic_name: 'تكنولوجيا الأطراف الصناعية', duration_years: 4, total_credits: 132, annual_fee: 16000.00, is_active: true },
      { code: 'OIL', name: 'Oil Production Technology', arabic_name: 'تكنولوجيا إنتاج البترول', duration_years: 4, total_credits: 132, annual_fee: 18000.00, is_active: true },
      { code: 'REN', name: 'Renewable Energy Technology', arabic_name: 'تكنولوجيا الطاقة المتجددة', duration_years: 4, total_credits: 132, annual_fee: 17000.00, is_active: true },
    ];
    const results = [];
    for (const spec of specialtyData) {
      const [instance, created] = await Specialty.findOrCreate({ where: { code: spec.code }, defaults: spec });
      results.push({ code: spec.code, created });

      // Create academic years 1-4 for each specialty if not exist
      for (let yearNum = 1; yearNum <= 4; yearNum++) {
        const [academicYear, yearCreated] = await AcademicYear.findOrCreate({
          where: { specialty_id: instance.id, year_number: yearNum },
          defaults: { specialty_id: instance.id, year_number: yearNum, is_active: true }
        });
        // Create 2 semesters per academic year if not exist
        await Semester.findOrCreate({
          where: { academic_year_id: academicYear.id, semester_name: 'الفصل الأول' },
          defaults: { academic_year_id: academicYear.id, semester_name: 'الفصل الأول', is_active: true }
        });
        await Semester.findOrCreate({
          where: { academic_year_id: academicYear.id, semester_name: 'الفصل الثاني' },
          defaults: { academic_year_id: academicYear.id, semester_name: 'الفصل الثاني', is_active: true }
        });
      }
    }
    res.json({ success: true, message: 'Specialties, academic years, and semesters seeded', data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Protected routes (require authentication)
router.use(authenticateToken); // All routes below require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.get('/verify', verifyToken);
router.post('/logout', logout);

// POST /api/auth/upload-avatar
router.post('/upload-avatar', avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const User = require('../models/User');
    const user = await User.findByPk(req.user.id);

    // Delete old avatar file if exists
    if (user.profile_image) {
      // Handle both formats: with and without leading slash
      const oldPath = user.profile_image.startsWith('/') 
        ? user.profile_image.slice(1) 
        : user.profile_image;
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Always store with leading slash for correct URL construction
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await user.update({ profile_image: avatarUrl });
    res.json({ success: true, data: { avatar_url: avatarUrl }, message: 'تم رفع الصورة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/auth/avatar
router.delete('/avatar', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findByPk(req.user.id);
    if (user.profile_image) {
      const oldPath = user.profile_image.startsWith('/') 
        ? user.profile_image.slice(1) 
        : user.profile_image;
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await user.update({ profile_image: null });
    res.json({ success: true, message: 'تم حذف الصورة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;