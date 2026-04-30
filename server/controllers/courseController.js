const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const Course = require('../models/Course');
const Professor = require('../models/Professor');
const ProfessorCourse = require('../models/ProfessorCourse');
const AcademicYear = require('../models/AcademicYear');
const Semester = require('../models/Semester');
const Specialty = require('../models/Specialty');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Helper function to log admin activities
const logActivity = async (userId, action, entity, entityId = null, details = null) => {
  try {
    await ActivityLog.create({
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      details: details ? JSON.stringify(details) : null,
      status: 'success'
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// ==================== COURSE MANAGEMENT ====================

// @desc    Create course
// @route   POST /api/admin/courses
// @access  Admin Only
const createCourse = async (req, res) => {
  try {
    const { specialty_id, academic_year_id, semester_id, course_code, course_name, arabic_name, credit_hours, description } = req.body;

    if (!specialty_id || !academic_year_id || !semester_id || !course_code || !course_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if course code is unique
    const existing = await Course.findOne({ where: { course_code } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists'
      });
    }

    // Verify relations exist
    const [specialty, academicYear, semester] = await Promise.all([
      Specialty.findByPk(specialty_id),
      AcademicYear.findByPk(academic_year_id),
      Semester.findByPk(semester_id)
    ]);

    if (!specialty || !academicYear || !semester) {
      return res.status(404).json({
        success: false,
        message: 'Invalid specialty, academic year, or semester'
      });
    }

    const course = await Course.create({
      specialty_id,
      academic_year_id,
      semester_id,
      course_code,
      course_name,
      arabic_name: arabic_name || null,
      credit_hours: credit_hours || 3,
      description: description || null,
      is_active: true
    });

    // Log activity
    await logActivity(req.user.id, 'create', 'Course', course.id, { course_code, course_name });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Admin Only
const getAllCourses = async (req, res) => {
  try {
    const { specialty_id, academic_year_id, semester_id, is_active } = req.query;
    const where = {};

    if (specialty_id) where.specialty_id = specialty_id;
    if (academic_year_id) where.academic_year_id = academic_year_id;
    if (semester_id) where.semester_id = semester_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const courses = await Course.findAll({
      where,
      include: [
        {
          model: Specialty,
          attributes: ['id', 'code', 'name', 'arabic_name'],
          required: false
        },
        {
          model: AcademicYear,
          attributes: ['id', 'year_number', 'academic_season'],
          required: false
        },
        {
          model: Semester,
          attributes: ['id', 'semester_name', 'arabic_name'],
          required: false
        }
      ],
      order: [['course_code', 'ASC']]
    });

    res.json({
      success: true,
      data: courses,
      count: courses.length
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/admin/courses/:id
// @access  Admin Only
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const { course_name, arabic_name, credit_hours, description, is_active, semester_id } = req.body;

    const updateData = {};
    if (course_name) updateData.course_name = course_name;
    if (arabic_name !== undefined) updateData.arabic_name = arabic_name;
    if (credit_hours) updateData.credit_hours = credit_hours;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (semester_id) {
      // Verify semester exists
      const semester = await Semester.findByPk(semester_id);
      if (!semester) {
        return res.status(404).json({
          success: false,
          message: 'Invalid semester'
        });
      }
      updateData.semester_id = semester_id;
    }

    await course.update(updateData);

    // Log activity
    await logActivity(req.user.id, 'update', 'Course', course.id, updateData);

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== PROFESSOR MANAGEMENT ====================

// @desc    Get all professors
// @route   GET /api/admin/professors
// @access  Admin Only
const getAllProfessors = async (req, res) => {
  try {
    const { is_active } = req.query;
    const where = {};

    if (is_active !== undefined) where.is_active = is_active === 'true';

    const professors = await Professor.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'phone', 'username']
        },
        {
          model: ProfessorCourse,
          include: [{
            model: Course,
            attributes: ['course_code', 'course_name']
          }]
        }
      ],
      order: [['professor_code', 'ASC']]
    });

    res.json({
      success: true,
      data: professors,
      count: professors.length
    });

  } catch (error) {
    console.error('Get professors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update professor profile
// @route   PUT /api/admin/professors/:id
// @access  Admin Only
const updateProfessor = async (req, res) => {
  try {
    const professor = await Professor.findByPk(req.params.id);

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: 'Professor not found'
      });
    }

    const { department, specialization, is_active } = req.body;

    const updateData = {};
    if (department !== undefined) updateData.department = department;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (is_active !== undefined) updateData.is_active = is_active;

    await professor.update(updateData);

    // Log activity
    await logActivity(req.user.id, 'update', 'Professor', professor.id, updateData);

    res.json({
      success: true,
      message: 'Professor updated successfully',
      data: professor
    });

  } catch (error) {
    console.error('Update professor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== PROFESSOR-COURSE ASSIGNMENT ====================

// @desc    Assign professor to course
// @route   POST /api/admin/professor-courses
// @access  Admin Only
const assignProfessorToCourse = async (req, res) => {
  try {
    const { professor_id, course_id, academic_year_id, semester_id, is_primary } = req.body;

    if (!professor_id || !course_id || !academic_year_id || !semester_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide professor_id, course_id, academic_year_id, and semester_id'
      });
    }

    // Verify relations exist
    const [professor, course, academicYear, semester] = await Promise.all([
      Professor.findByPk(professor_id),
      Course.findByPk(course_id),
      AcademicYear.findByPk(academic_year_id),
      Semester.findByPk(semester_id)
    ]);

    if (!professor || !course || !academicYear || !semester) {
      return res.status(404).json({
        success: false,
        message: 'Invalid professor, course, academic year, or semester'
      });
    }

    // Check if assignment already exists
    const existing = await ProfessorCourse.findOne({
      where: { professor_id, course_id, academic_year_id, semester_id }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Professor is already assigned to this course'
      });
    }

    const assignment = await ProfessorCourse.create({
      professor_id,
      course_id,
      academic_year_id,
      semester_id,
      is_primary: is_primary !== false // default true
    });

    // Log activity
    await logActivity(req.user.id, 'create', 'ProfessorCourse', assignment.id);

    res.status(201).json({
      success: true,
      message: 'Professor assigned to course successfully',
      data: assignment
    });

  } catch (error) {
    console.error('Assign professor to course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove professor from course
// @route   DELETE /api/admin/professor-courses/:id
// @access  Admin Only
const removeProfessorFromCourse = async (req, res) => {
  try {
    const assignment = await ProfessorCourse.findByPk(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    await assignment.destroy();

    // Log activity
    await logActivity(req.user.id, 'delete', 'ProfessorCourse', assignment.id);

    res.json({
      success: true,
      message: 'Professor removed from course successfully'
    });

  } catch (error) {
    console.error('Remove professor from course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create professor with user account
// @route   POST /api/admin/professors
// @access  Admin Only
const createProfessor = async (req, res) => {
  const { sequelize } = require('../config/models');
  const t = await sequelize.transaction();
  try {
    const { full_name, email, username, password, phone, department, specialization, employee_id } = req.body;

    console.log('createProfessor: Received request with data:', { full_name, email, username, department, specialization });

    if (!full_name || !email || !username || !password) {
      await t.rollback();
      console.warn('createProfessor: Missing required fields');
      return res.status(400).json({ success: false, message: 'يرجى توفير الاسم والبريد الإلكتروني واسم المستخدم وكلمة المرور' });
    }

    // Check uniqueness - check email and username separately for better error messages
    console.log('createProfessor: Checking for existing email:', email);
    const existingEmail = await User.findOne({ where: { email }, transaction: t });
    if (existingEmail) {
      await t.rollback();
      console.warn(`createProfessor: Email already exists: ${email}`);
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل، يرجى اختيار آخر' });
    }

    console.log('createProfessor: Checking for existing username:', username);
    const existingUsername = await User.findOne({ where: { username }, transaction: t });
    if (existingUsername) {
      await t.rollback();
      console.warn(`createProfessor: Username already exists: ${username}`);
      return res.status(400).json({ success: false, message: 'اسم المستخدم مستخدم بالفعل، يرجى اختيار آخر' });
    }

    console.log('createProfessor: Creating user account');
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      full_name, email, username, password_hash: hash,
      phone: phone || null, role: 'professor', is_active: true
    }, { transaction: t });

    console.log(`createProfessor: User created with ID ${user.id}`);

    // Generate professor code
    const count = await Professor.count({ transaction: t });
    const professor_code = `PROF-${String(count + 1).padStart(3, '0')}`;

    console.log(`createProfessor: Creating professor record with code ${professor_code}`);
    const professor = await Professor.create({
      user_id: user.id,
      professor_code,
      department: department || null,
      specialization: specialization || null,
      is_active: true
    }, { transaction: t });

    await t.commit();
    console.log(`createProfessor: Successfully created professor ${professor_code}`);

    await logActivity(req.user.id, 'create', 'Professor', professor.id, { username, full_name });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء حساب الدكتور بنجاح',
      data: { user: { id: user.id, username, full_name, email, role: 'professor' }, professor }
    });
  } catch (error) {
    await t.rollback();
    console.error('createProfessor: Error occurred:', error.message);
    console.error('createProfessor: Error stack:', error.stack);
    console.error('createProfessor: Error details:', {
      name: error.name,
      message: error.message,
      sql: error.sql || 'N/A'
    });
    res.status(500).json({ success: false, message: 'حدث خطأ في الخادم: ' + error.message });
  }
};

module.exports = {
  // Course
  createCourse,
  getAllCourses,
  updateCourse,
  // Professor
  createProfessor,
  getAllProfessors,
  updateProfessor,
  // Professor-Course Assignment
  assignProfessorToCourse,
  removeProfessorFromCourse
};
