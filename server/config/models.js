const sequelize = require('./database');

// ==================== Import all models ====================
const User = require('../models/User');
const Specialty = require('../models/Specialty');
const AcademicYear = require('../models/AcademicYear');
const Semester = require('../models/Semester');
const Course = require('../models/Course');
const Professor = require('../models/Professor');
const ProfessorCourse = require('../models/ProfessorCourse');
const Student = require('../models/Student');
const StudentEnrollment = require('../models/StudentEnrollment');
const Grade = require('../models/Grade');
const FeeInvoice = require('../models/FeeInvoice');
const Payment = require('../models/Payment');
const StudentQRCode = require('../models/StudentQRCode');
const ActivityLog = require('../models/ActivityLog');
const GradeSetting = require('../models/GradeSetting');
const Timetable = require('../models/Timetable');
const SpecialtyFee = require('../models/SpecialtyFee');

const RegistrationLink = require('../models/RegistrationLink');
const RegistrationRequest = require('../models/RegistrationRequest');
const CourseGradeConfig = require('../models/CourseGradeConfig');
const ProfessorRegistrationRequest = require('../models/ProfessorRegistrationRequest');
const ProfessorRegistrationLink = require('../models/ProfessorRegistrationLink');

// ==================== Define associations ====================
const defineAssociations = () => {
  // ==================== User Associations ====================
  // User -> Student (one-to-one)
  User.hasOne(Student, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  Student.belongsTo(User, { foreignKey: 'user_id' });

  // User -> Professor (one-to-one)
  User.hasOne(Professor, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  Professor.belongsTo(User, { foreignKey: 'user_id' });

  // ==================== Specialty Associations ====================
  // Specialty -> AcademicYear (one-to-many)
  Specialty.hasMany(AcademicYear, { foreignKey: 'specialty_id', onDelete: 'CASCADE' });
  AcademicYear.belongsTo(Specialty, { foreignKey: 'specialty_id' });

  // Specialty -> Student (one-to-many)
  Specialty.hasMany(Student, { foreignKey: 'specialty_id', onDelete: 'CASCADE' });
  Student.belongsTo(Specialty, { foreignKey: 'specialty_id' });

  // Specialty -> Course (one-to-many)
  Specialty.hasMany(Course, { foreignKey: 'specialty_id', onDelete: 'CASCADE' });
  Course.belongsTo(Specialty, { foreignKey: 'specialty_id' });

  // ==================== AcademicYear Associations ====================
  // AcademicYear -> Semester (one-to-many)
  AcademicYear.hasMany(Semester, { foreignKey: 'academic_year_id', onDelete: 'CASCADE' });
  Semester.belongsTo(AcademicYear, { foreignKey: 'academic_year_id' });

  // ==================== Semester Associations ====================
  // Semester -> Course (one-to-many)
  Semester.hasMany(Course, { foreignKey: 'semester_id', onDelete: 'CASCADE' });
  Course.belongsTo(Semester, { foreignKey: 'semester_id' });

  // Semester -> StudentEnrollment (one-to-many)
  Semester.hasMany(StudentEnrollment, { foreignKey: 'semester_id', onDelete: 'CASCADE' });
  StudentEnrollment.belongsTo(Semester, { foreignKey: 'semester_id' });

  // Semester -> Grade (one-to-many)
  Semester.hasMany(Grade, { foreignKey: 'semester_id', onDelete: 'CASCADE' });
  Grade.belongsTo(Semester, { foreignKey: 'semester_id' });

  // ==================== Course Associations ====================
  // Course -> AcademicYear (many-to-one)
  AcademicYear.hasMany(Course, { foreignKey: 'academic_year_id', onDelete: 'CASCADE' });
  Course.belongsTo(AcademicYear, { foreignKey: 'academic_year_id' });

  // Course -> StudentEnrollment (one-to-many)
  Course.hasMany(StudentEnrollment, { foreignKey: 'course_id', onDelete: 'CASCADE' });
  StudentEnrollment.belongsTo(Course, { foreignKey: 'course_id' });

  // Course -> Grade (one-to-many)
  Course.hasMany(Grade, { foreignKey: 'course_id', onDelete: 'CASCADE' });
  Grade.belongsTo(Course, { foreignKey: 'course_id' });

  // Course -> ProfessorCourse (one-to-many)
  Course.hasMany(ProfessorCourse, { foreignKey: 'course_id', onDelete: 'CASCADE' });
  ProfessorCourse.belongsTo(Course, { foreignKey: 'course_id' });

  // Course -> CourseGradeConfig (one-to-one)
  Course.hasOne(CourseGradeConfig, { foreignKey: 'course_id', onDelete: 'CASCADE' });
  CourseGradeConfig.belongsTo(Course, { foreignKey: 'course_id' });

  // ==================== Professor Associations ====================
  // Professor -> ProfessorCourse (one-to-many)
  Professor.hasMany(ProfessorCourse, { foreignKey: 'professor_id', onDelete: 'CASCADE' });
  ProfessorCourse.belongsTo(Professor, { foreignKey: 'professor_id' });

  // User -> ProfessorCourse (via professor grades)
  User.hasMany(Grade, { foreignKey: 'professor_submitted_by', as: 'gradesSubmitted' });
  Grade.belongsTo(User, { foreignKey: 'professor_submitted_by', as: 'professorSubmitted' });

  // ==================== Student Associations ====================
  // Student -> StudentEnrollment (one-to-many)
  Student.hasMany(StudentEnrollment, { foreignKey: 'student_id', onDelete: 'CASCADE' });
  StudentEnrollment.belongsTo(Student, { foreignKey: 'student_id' });

  // Student -> Grade (one-to-many)
  Student.hasMany(Grade, { foreignKey: 'student_id', onDelete: 'CASCADE' });
  Grade.belongsTo(Student, { foreignKey: 'student_id' });

  // Student -> FeeInvoice (one-to-many)
  Student.hasMany(FeeInvoice, { foreignKey: 'student_id', onDelete: 'CASCADE' });
  FeeInvoice.belongsTo(Student, { foreignKey: 'student_id' });

  // Student -> Payment (one-to-many)
  Student.hasMany(Payment, { foreignKey: 'student_id', onDelete: 'CASCADE' });
  Payment.belongsTo(Student, { foreignKey: 'student_id' });

  // Student -> StudentQRCode (one-to-one)
  Student.hasOne(StudentQRCode, { foreignKey: 'student_id', onDelete: 'CASCADE' });
  StudentQRCode.belongsTo(Student, { foreignKey: 'student_id' });

  // ==================== Grade Associations ====================
  // Grade -> AcademicYear (many-to-one)
  AcademicYear.hasMany(Grade, { foreignKey: 'academic_year_id', onDelete: 'CASCADE' });
  Grade.belongsTo(AcademicYear, { foreignKey: 'academic_year_id' });

  // Grade -> StudentEnrollment (many-to-one)
  StudentEnrollment.hasMany(Grade, { foreignKey: 'enrollment_id', onDelete: 'SET NULL' });
  Grade.belongsTo(StudentEnrollment, { foreignKey: 'enrollment_id', allowNull: true });

  // User -> Grade (Admin approval)
  User.hasMany(Grade, { foreignKey: 'admin_approved_by', as: 'gradesApproved' });
  Grade.belongsTo(User, { foreignKey: 'admin_approved_by', as: 'adminApproval', allowNull: true });

  // ==================== Fee Invoice Associations ====================
  // FeeInvoice -> AcademicYear (many-to-one)
  AcademicYear.hasMany(FeeInvoice, { foreignKey: 'academic_year_id', onDelete: 'CASCADE' });
  FeeInvoice.belongsTo(AcademicYear, { foreignKey: 'academic_year_id' });

  // FeeInvoice -> Semester (many-to-one)
  Semester.hasMany(FeeInvoice, { foreignKey: 'semester_id', onDelete: 'SET NULL' });
  FeeInvoice.belongsTo(Semester, { foreignKey: 'semester_id', allowNull: true });

  // FeeInvoice -> User (issued by)
  User.hasMany(FeeInvoice, { foreignKey: 'issued_by', as: 'invoicesCreated' });
  FeeInvoice.belongsTo(User, { foreignKey: 'issued_by', as: 'createdBy' });

  // ==================== Payment Associations ====================
  // Payment -> FeeInvoice (many-to-one)
  FeeInvoice.hasMany(Payment, { foreignKey: 'invoice_id', onDelete: 'SET NULL' });
  Payment.belongsTo(FeeInvoice, { foreignKey: 'invoice_id', allowNull: true });

  // Payment -> User (collected by)
  User.hasMany(Payment, { foreignKey: 'collected_by', as: 'paymentsCollected' });
  Payment.belongsTo(User, { foreignKey: 'collected_by', as: 'collectedByUser' });

  // ==================== Activity Log Associations ====================
  // User -> ActivityLog (one-to-many)
  User.hasMany(ActivityLog, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  ActivityLog.belongsTo(User, { foreignKey: 'user_id' });

  // ==================== Grade Settings Associations ====================
  // User -> GradeSetting (who updated the setting)
  User.hasMany(GradeSetting, { foreignKey: 'updated_by', as: 'gradeSettingsUpdated' });
  GradeSetting.belongsTo(User, { foreignKey: 'updated_by', as: 'updatedByUser' });

  // ==================== Timetable Associations ====================
  // Specialty -> Timetable (one-to-many)
  Specialty.hasMany(Timetable, { foreignKey: 'specialty_id', onDelete: 'CASCADE' });
  Timetable.belongsTo(Specialty, { foreignKey: 'specialty_id' });

  // User -> Timetable (created by)
  User.hasMany(Timetable, { foreignKey: 'created_by', as: 'timetablesCreated' });
  Timetable.belongsTo(User, { foreignKey: 'created_by', as: 'createdByUser' });

  // ==================== SpecialtyFee Associations ====================
  Specialty.hasMany(SpecialtyFee, { foreignKey: 'specialty_id', onDelete: 'CASCADE' });
  SpecialtyFee.belongsTo(Specialty, { foreignKey: 'specialty_id' });

  // ==================== RegistrationLink Associations ====================
  User.hasMany(RegistrationLink, { foreignKey: 'created_by', as: 'registrationLinks' });
  RegistrationLink.belongsTo(User, { foreignKey: 'created_by', as: 'createdByAdmin' });

  // ==================== RegistrationRequest Associations ====================
  Specialty.hasMany(RegistrationRequest, { foreignKey: 'specialty_id' });
  RegistrationRequest.belongsTo(Specialty, { foreignKey: 'specialty_id' });

  // ==================== ProfessorRegistrationRequest Associations ====================
  Specialty.hasMany(ProfessorRegistrationRequest, { foreignKey: 'specialty_id' });
  ProfessorRegistrationRequest.belongsTo(Specialty, { foreignKey: 'specialty_id' });

  User.hasMany(ProfessorRegistrationRequest, { foreignKey: 'processed_by', as: 'professorRequestsProcessed' });
  ProfessorRegistrationRequest.belongsTo(User, { foreignKey: 'processed_by', as: 'ProcessedBy' });

  User.hasMany(ProfessorRegistrationRequest, { foreignKey: 'created_user_id', as: 'professorRequestsCreated' });
  ProfessorRegistrationRequest.belongsTo(User, { foreignKey: 'created_user_id', as: 'CreatedUser' });

  Professor.hasMany(ProfessorRegistrationRequest, { foreignKey: 'created_professor_id', as: 'professorRequests' });
  ProfessorRegistrationRequest.belongsTo(Professor, { foreignKey: 'created_professor_id', as: 'CreatedProfessor' });

  // ==================== ProfessorRegistrationLink Associations ====================
  User.hasMany(ProfessorRegistrationLink, { foreignKey: 'created_by', as: 'professorRegistrationLinks' });
  ProfessorRegistrationLink.belongsTo(User, { foreignKey: 'created_by', as: 'professorLinkCreatedBy' });

  User.hasMany(ProfessorRegistrationLink, { foreignKey: 'used_by', as: 'professorLinksUsed' });
  ProfessorRegistrationLink.belongsTo(User, { foreignKey: 'used_by', as: 'professorLinkUsedBy' });
};

// ==================== Export ====================
module.exports = {
  sequelize,
  User,
  Specialty,
  AcademicYear,
  Semester,
  Course,
  Professor,
  ProfessorCourse,
  Student,
  StudentEnrollment,
  Grade,
  FeeInvoice,
  Payment,
  StudentQRCode,
  ActivityLog,
  GradeSetting,
  Timetable,
  SpecialtyFee,
  RegistrationLink,
  RegistrationRequest,
  CourseGradeConfig,
  ProfessorRegistrationRequest,
  ProfessorRegistrationLink,
  defineAssociations
};