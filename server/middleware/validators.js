const { body, param, query, validationResult } = require('express-validator');

// ==================== Validation Middleware ====================

/**
 * Validation error handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// ==================== Course Validations ====================

const validateCourseCreation = [
  body('specialty_id').isInt().withMessage('specialty_id must be an integer'),
  body('academic_year_id').isInt().withMessage('academic_year_id must be an integer'),
  body('semester_id').isInt().withMessage('semester_id must be an integer'),
  body('course_code').trim().notEmpty().withMessage('course_code is required').isString(),
  body('course_name').trim().notEmpty().withMessage('course_name is required'),
  body('arabic_name').trim().notEmpty().withMessage('arabic_name is required'),
  body('credit_hours').isInt({ min: 1 }).withMessage('credit_hours must be a positive integer'),
  handleValidationErrors
];

const validateCourseUpdate = [
  param('id').isInt().withMessage('id must be an integer'),
  body('course_name').optional().trim().notEmpty(),
  body('arabic_name').optional().trim().notEmpty(),
  body('credit_hours').optional().isInt({ min: 1 }),
  body('is_active').optional().isBoolean(),
  handleValidationErrors
];

const validateCourseFilters = [
  query('specialty_id').optional().isInt(),
  query('academic_year_id').optional().isInt(),
  query('semester_id').optional().isInt(),
  query('is_active').optional().isBoolean(),
  handleValidationErrors
];

// ==================== Professor Validations ====================

const validateProfessorCreation = [
  body('username').trim().notEmpty().withMessage('username is required').isLength({ min: 3 }),
  body('email').isEmail().withMessage('email must be valid'),
  body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
  body('full_name').trim().notEmpty().withMessage('full_name is required'),
  body('phone').optional().isMobilePhone(),
  body('department').optional().trim().notEmpty(),
  body('specialization').optional().trim().notEmpty(),
  handleValidationErrors
];

const validateProfessorUpdate = [
  param('id').isInt().withMessage('id must be an integer'),
  body('department').optional().trim().notEmpty(),
  body('specialization').optional().trim().notEmpty(),
  body('is_active').optional().isBoolean(),
  handleValidationErrors
];

const validateCoursAssignment = [
  param('id').isInt().withMessage('Professor ID must be an integer'),
  body('course_id').isInt().withMessage('course_id must be an integer'),
  body('academic_year_id').isInt().withMessage('academic_year_id must be an integer'),
  body('semester_id').isInt().withMessage('semester_id must be an integer'),
  body('is_primary').optional().isBoolean(),
  handleValidationErrors
];

// ==================== Grade Validations ====================

const validateGradeApproval = [
  param('id').isInt().withMessage('id must be an integer'),
  handleValidationErrors
];

const validateGradeEdit = [
  param('id').isInt().withMessage('id must be an integer'),
  body('assignment1_grade').optional().isIn(['P', 'M', 'D']),
  body('assignment2_grade').optional().isIn(['P', 'M', 'D']),
  body('final_exam_score').optional().isFloat({ min: 0, max: 150 }),
  body('notes').optional().trim(),
  handleValidationErrors
];

const validateGradeRejection = [
  param('id').isInt().withMessage('id must be an integer'),
  body('rejection_reason').trim().notEmpty().withMessage('rejection_reason is required'),
  handleValidationErrors
];

// ==================== Grade Settings Validations ====================

const validateGradeSettingUpdate = [
  body('setting_name').trim().notEmpty().withMessage('setting_name is required'),
  body('setting_value').isFloat().withMessage('setting_value must be a number'),
  body('description').optional().trim(),
  handleValidationErrors
];

// ==================== Timetable Validations ====================

const validateTimetableCreation = [
  body('title').trim().notEmpty().withMessage('title is required').isLength({ min: 3, max: 255 }),
  body('specialty_id').isInt().withMessage('specialty_id must be an integer'),
  (req, res, next) => {
    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ msg: 'PDF file is required' }]
      });
    }
    next();
  },
  handleValidationErrors
];

const validateTimetableUpdate = [
  param('id').isInt().withMessage('id must be an integer'),
  body('title').optional().trim().notEmpty().isLength({ min: 3, max: 255 }),
  (req, res, next) => {
    // If file was uploaded, it's already been validated by multer
    next();
  },
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  // Course
  validateCourseCreation,
  validateCourseUpdate,
  validateCourseFilters,
  // Professor
  validateProfessorCreation,
  validateProfessorUpdate,
  validateCoursAssignment,
  // Grade
  validateGradeApproval,
  validateGradeEdit,
  validateGradeRejection,
  // Settings
  validateGradeSettingUpdate,
  // Timetables
  validateTimetableCreation,
  validateTimetableUpdate
};
