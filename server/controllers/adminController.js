const { Op } = require('sequelize');
const User = require('../models/User');
const Specialty = require('../models/Specialty');
const AcademicYear = require('../models/AcademicYear');
const Semester = require('../models/Semester');
const Course = require('../models/Course');
const Professor = require('../models/Professor');
const ProfessorCourse = require('../models/ProfessorCourse');
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

// ==================== SPECIALTY MANAGEMENT ====================

// @desc    Create specialty
// @route   POST /api/admin/specialties
// @access  Admin Only
const createSpecialty = async (req, res) => {
  try {
    const { code, name, arabic_name, duration_years, total_credits, annual_fee, description } = req.body;

    // Validate required fields
    if (!code || !name || !arabic_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide code, name, and arabic_name'
      });
    }

    // Check if specialty code already exists
    const existingSpecialty = await Specialty.findOne({ where: { code } });
    if (existingSpecialty) {
      return res.status(400).json({
        success: false,
        message: 'Specialty code already exists'
      });
    }

    const specialty = await Specialty.create({
      code,
      name,
      arabic_name,
      duration_years: duration_years || 4,
      total_credits: total_credits || 120,
      annual_fee: annual_fee || 10000,
      description: description || null,
      is_active: true
    });

    // Log activity
    await logActivity(req.user.id, 'create', 'Specialty', specialty.id, { code, name });

    res.status(201).json({
      success: true,
      message: 'Specialty created successfully',
      data: specialty
    });

  } catch (error) {
    console.error('Create specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all specialties
// @route   GET /api/admin/specialties
// @access  Admin Only
const getAllSpecialties = async (req, res) => {
  try {
    const { is_active } = req.query;
    const where = {};
    
    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const specialties = await Specialty.findAll({
      where,
      include: [{
        model: AcademicYear,
        attributes: ['id', 'year_number', 'academic_season']
      }],
      order: [['code', 'ASC']]
    });

    res.json({
      success: true,
      data: specialties,
      count: specialties.length
    });

  } catch (error) {
    console.error('Get specialties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get specialty by ID
// @route   GET /api/admin/specialties/:id
// @access  Admin Only
const getSpecialtyById = async (req, res) => {
  try {
    const specialty = await Specialty.findByPk(req.params.id, {
      include: [{
        model: AcademicYear,
        include: [{
          model: Semester
        }]
      }]
    });

    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: 'Specialty not found'
      });
    }

    res.json({
      success: true,
      data: specialty
    });

  } catch (error) {
    console.error('Get specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update specialty
// @route   PUT /api/admin/specialties/:id
// @access  Admin Only
const updateSpecialty = async (req, res) => {
  try {
    const specialty = await Specialty.findByPk(req.params.id);

    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: 'Specialty not found'
      });
    }

    const { code, name, arabic_name, duration_years, total_credits, annual_fee, description, is_active } = req.body;

    // Check if new code is unique
    if (code && code !== specialty.code) {
      const existingCode = await Specialty.findOne({
        where: { code, id: { [Op.ne]: specialty.id } }
      });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'Specialty code already exists'
        });
      }
    }

    const updateData = {};
    if (code) updateData.code = code;
    if (name) updateData.name = name;
    if (arabic_name) updateData.arabic_name = arabic_name;
    if (duration_years) updateData.duration_years = duration_years;
    if (total_credits) updateData.total_credits = total_credits;
    if (annual_fee) updateData.annual_fee = annual_fee;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;

    await specialty.update(updateData);

    // Log activity
    await logActivity(req.user.id, 'update', 'Specialty', specialty.id, updateData);

    res.json({
      success: true,
      message: 'Specialty updated successfully',
      data: specialty
    });

  } catch (error) {
    console.error('Update specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete specialty
// @route   DELETE /api/admin/specialties/:id
// @access  Admin Only
const deleteSpecialty = async (req, res) => {
  try {
    const specialty = await Specialty.findByPk(req.params.id);

    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: 'Specialty not found'
      });
    }

    // Check if specialty has academic years
    const academicYearCount = await AcademicYear.count({
      where: { specialty_id: specialty.id }
    });

    if (academicYearCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete specialty with associated academic years'
      });
    }

    await specialty.destroy();

    // Log activity
    await logActivity(req.user.id, 'delete', 'Specialty', specialty.id);

    res.json({
      success: true,
      message: 'Specialty deleted successfully'
    });

  } catch (error) {
    console.error('Delete specialty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== ACADEMIC YEAR MANAGEMENT ====================

// @desc    Create academic year
// @route   POST /api/admin/academic-years
// @access  Admin Only
const createAcademicYear = async (req, res) => {
  try {
    const { specialty_id, year_number, academic_season } = req.body;

    if (!specialty_id || !year_number) {
      return res.status(400).json({
        success: false,
        message: 'Please provide specialty_id and year_number'
      });
    }

    // Check if specialty exists
    const specialty = await Specialty.findByPk(specialty_id);
    if (!specialty) {
      return res.status(404).json({
        success: false,
        message: 'Specialty not found'
      });
    }

    // Check if year already exists for this specialty
    const existing = await AcademicYear.findOne({
      where: { specialty_id, year_number }
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Year already exists for this specialty'
      });
    }

    const academicYear = await AcademicYear.create({
      specialty_id,
      year_number,
      academic_season: academic_season || null,
      is_active: true
    });

    // Log activity
    await logActivity(req.user.id, 'create', 'AcademicYear', academicYear.id);

    res.status(201).json({
      success: true,
      message: 'Academic year created successfully',
      data: academicYear
    });

  } catch (error) {
    console.error('Create academic year error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all academic years
// @route   GET /api/admin/academic-years
// @access  Admin Only
const getAllAcademicYears = async (req, res) => {
  try {
    const { specialty_id, is_active } = req.query;
    const where = {};
    
    if (specialty_id) where.specialty_id = specialty_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const academicYears = await AcademicYear.findAll({
      where,
      include: [{
        model: Semester,
        as: 'semesters',
        attributes: ['id', 'semester_name', 'start_date', 'end_date']
      }],
      order: [['year_number', 'ASC']]
    });

    res.json({
      success: true,
      data: academicYears,
      count: academicYears.length
    });

  } catch (error) {
    console.error('Get academic years error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update academic year
// @route   PUT /api/admin/academic-years/:id
// @access  Admin Only
const updateAcademicYear = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findByPk(req.params.id);

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }

    const { academic_season, is_active } = req.body;

    const updateData = {};
    if (academic_season !== undefined) updateData.academic_season = academic_season;
    if (is_active !== undefined) updateData.is_active = is_active;

    await academicYear.update(updateData);

    // Log activity
    await logActivity(req.user.id, 'update', 'AcademicYear', academicYear.id, updateData);

    res.json({
      success: true,
      message: 'Academic year updated successfully',
      data: academicYear
    });

  } catch (error) {
    console.error('Update academic year error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== SEMESTER MANAGEMENT ====================

// @desc    Create semester
// @route   POST /api/admin/semesters
// @access  Admin Only
const createSemester = async (req, res) => {
  try {
    const { academic_year_id, semester_name, start_date, end_date } = req.body;

    if (!academic_year_id || !semester_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide academic_year_id and semester_name'
      });
    }

    // Check if academic year exists
    const academicYear = await AcademicYear.findByPk(academic_year_id);
    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'Academic year not found'
      });
    }

    // Check if semester already exists
    const existing = await Semester.findOne({
      where: { academic_year_id, semester_name }
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Semester already exists for this academic year'
      });
    }

    const semester = await Semester.create({
      academic_year_id,
      semester_name,
      start_date: start_date || null,
      end_date: end_date || null,
      is_active: true
    });

    // Log activity
    await logActivity(req.user.id, 'create', 'Semester', semester.id);

    res.status(201).json({
      success: true,
      message: 'Semester created successfully',
      data: semester
    });

  } catch (error) {
    console.error('Create semester error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all semesters
// @route   GET /api/admin/semesters
// @access  Admin Only
const getAllSemesters = async (req, res) => {
  try {
    const { academic_year_id, is_active } = req.query;
    const where = {};
    
    if (academic_year_id) where.academic_year_id = academic_year_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const semesters = await Semester.findAll({
      where,
      include: [{
        model: Course,
        attributes: ['id', 'course_code', 'course_name']
      }],
      order: [['semester_name', 'ASC']]
    });

    res.json({
      success: true,
      data: semesters,
      count: semesters.length
    });

  } catch (error) {
    console.error('Get semesters error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update semester
// @route   PUT /api/admin/semesters/:id
// @access  Admin Only
const updateSemester = async (req, res) => {
  try {
    const semester = await Semester.findByPk(req.params.id);

    if (!semester) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found'
      });
    }

    const { start_date, end_date, is_active } = req.body;

    const updateData = {};
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (is_active !== undefined) updateData.is_active = is_active;

    await semester.update(updateData);

    // Log activity
    await logActivity(req.user.id, 'update', 'Semester', semester.id, updateData);

    res.json({
      success: true,
      message: 'Semester updated successfully',
      data: semester
    });

  } catch (error) {
    console.error('Update semester error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin Only
const getAllUsers = async (req, res) => {
  try {
    const { role, is_active } = req.query;
    const where = {};
    
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: users,
      count: users.length
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Disable/Enable user
// @route   PUT /api/admin/users/:id/status
// @access  Admin Only
const updateUserStatus = async (req, res) => {
  try {
    const { is_active } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow disabling the admin user himself
    if (user.id === req.user.id && is_active === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot disable your own account'
      });
    }

    await user.update({ is_active });

    // Log activity
    await logActivity(req.user.id, 'update', 'User', user.id, { is_active });

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: { id: user.id, is_active: user.is_active }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
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
  updateUserStatus
};
