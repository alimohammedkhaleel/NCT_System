const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../models/User');
const Professor = require('../models/Professor');
const ProfessorCourse = require('../models/ProfessorCourse');
const Course = require('../models/Course');
const ActivityLog = require('../models/ActivityLog');
const sequelize = require('../config/database');

// ==================== Professor Management Service ====================

/**
 * Generate unique professor code
 * @returns {Promise<string>} Unique professor code
 */
const generateProfessorCode = async () => {
  try {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const code = `PROF-${timestamp}-${random}`;
    
    // Verify uniqueness
    const exists = await Professor.findOne({ where: { professor_code: code } });
    if (exists) {
      return generateProfessorCode(); // Retry if already exists
    }
    
    return code;
  } catch (error) {
    console.error('Generate professor code error:', error);
    throw error;
  }
};

/**
 * Create new professor (creates User + Professor records)
 * @param {object} professorData - Professor data { username, email, password, full_name, phone, department, specialization }
 * @param {number} userId - Admin user ID (for activity logging)
 * @returns {Promise<object>} Created professor with user info
 */
const createProfessor = async (professorData, userId) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Verify username doesn't exist
    const existingUser = await User.findOne({
      where: { username: professorData.username }
    });
    
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    // Verify email doesn't exist
    const existingEmail = await User.findOne({
      where: { email: professorData.email }
    });
    
    if (existingEmail) {
      throw new Error('Email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(professorData.password, 12);
    
    // Create User record
    const user = await User.create({
      username: professorData.username,
      email: professorData.email,
      password_hash: hashedPassword,
      full_name: professorData.full_name,
      phone: professorData.phone || null,
      role: 'professor',
      is_active: true
    }, { transaction });
    
    // Generate professor code
    const professorCode = await generateProfessorCode();
    
    // Create Professor record
    const professor = await Professor.create({
      user_id: user.id,
      professor_code: professorCode,
      department: professorData.department || null,
      specialization: professorData.specialization || null,
      is_active: true
    }, { transaction });
    
    // Log activity
    await ActivityLog.create({
      user_id: userId,
      action: 'create',
      entity_type: 'Professor',
      entity_id: professor.id,
      description: `Created professor ${user.full_name} (${professorCode})`
    }, { transaction });
    
    await transaction.commit();
    
    return {
      profile: professor,
      user: user
    };
  } catch (error) {
    await transaction.rollback();
    console.error('Create professor error:', error);
    throw error;
  }
};

/**
 * Update professor data
 * @param {number} professorId - Professor ID
 * @param {object} updateData - Update data { department, specialization, is_active }
 * @param {number} userId - Admin user ID
 * @returns {Promise<object>} Updated professor
 */
const updateProfessor = async (professorId, updateData, userId) => {
  try {
    const professor = await Professor.findByPk(professorId);
    if (!professor) {
      throw new Error('Professor not found');
    }
    
    await professor.update(updateData);
    
    // Log activity
    await ActivityLog.create({
      user_id: userId,
      action: 'update',
      entity_type: 'Professor',
      entity_id: professor.id,
      description: `Updated professor ${professor.id}`
    });
    
    return professor;
  } catch (error) {
    console.error('Update professor error:', error);
    throw error;
  }
};

/**
 * Soft delete professor
 * @param {number} professorId - Professor ID
 * @param {number} userId - Admin user ID
 * @returns {Promise<object>} Deleted professor
 */
const deleteProfessor = async (professorId, userId) => {
  const transaction = await sequelize.transaction();
  
  try {
    const professor = await Professor.findByPk(professorId);
    if (!professor) {
      throw new Error('Professor not found');
    }
    
    // Mark professor as inactive
    await professor.update({ is_active: false }, { transaction });
    
    // Mark associated user as inactive
    const user = await User.findByPk(professor.user_id);
    if (user) {
      await user.update({ is_active: false }, { transaction });
    }
    
    // Log activity
    await ActivityLog.create({
      user_id: userId,
      action: 'delete',
      entity_type: 'Professor',
      entity_id: professor.id,
      description: `Archived professor ${professor.professor_code}`
    }, { transaction });
    
    await transaction.commit();
    return professor;
  } catch (error) {
    await transaction.rollback();
    console.error('Delete professor error:', error);
    throw error;
  }
};

/**
 * Get all professors with optional filters
 * @param {object} filters - Filter criteria (is_active, department, specialty)
 * @returns {Promise<array>} Filtered professors
 */
const getProfessors = async (filters = {}) => {
  try {
    const whereClause = {};
    
    if (filters.is_active !== undefined) {
      whereClause.is_active = filters.is_active;
    } else {
      whereClause.is_active = true;
    }
    
    if (filters.department) {
      whereClause.department = filters.department;
    }
    
    const professors = await Professor.findAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'username', 'email', 'full_name', 'phone', 'last_login']
      }],
      order: [['created_at', 'DESC']]
    });
    
    return professors;
  } catch (error) {
    console.error('Get professors error:', error);
    throw error;
  }
};

/**
 * Get professor by ID with courses
 * @param {number} professorId - Professor ID
 * @returns {Promise<object>} Professor with courses
 */
const getProfessorById = async (professorId) => {
  try {
    const professor = await Professor.findByPk(professorId, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'email', 'full_name', 'phone']
      }]
    });
    
    if (!professor) {
      throw new Error('Professor not found');
    }
    
    // Get assigned courses
    const courses = await ProfessorCourse.findAll({
      where: { professor_id: professorId },
      include: [{
        model: Course,
        attributes: ['id', 'course_code', 'course_name', 'arabic_name', 'credit_hours']
      }]
    });
    
    return {
      ...professor.toJSON(),
      courses
    };
  } catch (error) {
    console.error('Get professor error:', error);
    throw error;
  }
};

/**
 * Assign course to professor
 * @param {number} professorId - Professor ID
 * @param {number} courseId - Course ID
 * @param {number} academicYearId - Academic year ID
 * @param {number} semesterId - Semester ID
 * @param {boolean} isPrimary - Is primary instructor
 * @param {number} userId - Admin user ID
 * @returns {Promise<object>} Created assignment
 */
const assignCourseToProfessor = async (
  professorId,
  courseId,
  academicYearId,
  semesterId,
  isPrimary = true,
  userId
) => {
  try {
    // Verify professor exists
    const professor = await Professor.findByPk(professorId);
    if (!professor) {
      throw new Error('Professor not found');
    }
    
    // Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Check if assignment already exists
    const existing = await ProfessorCourse.findOne({
      where: {
        professor_id: professorId,
        course_id: courseId,
        academic_year_id: academicYearId,
        semester_id: semesterId
      }
    });
    
    if (existing) {
      throw new Error('Professor is already assigned to this course in this period');
    }
    
    const assignment = await ProfessorCourse.create({
      professor_id: professorId,
      course_id: courseId,
      academic_year_id: academicYearId,
      semester_id: semesterId,
      is_primary: isPrimary
    });
    
    // Log activity
    await ActivityLog.create({
      user_id: userId,
      action: 'create',
      entity_type: 'ProfessorCourse',
      entity_id: assignment.id,
      description: `Assigned course to professor ${professor.professor_code}`
    });
    
    return assignment;
  } catch (error) {
    console.error('Assign course error:', error);
    throw error;
  }
};

/**
 * Remove course assignment from professor
 * @param {number} assignmentId - ProfessorCourse assignment ID
 * @param {number} userId - Admin user ID
 * @returns {Promise<void>}
 */
const removeCourseFomProfessor = async (assignmentId, userId) => {
  try {
    const assignment = await ProfessorCourse.findByPk(assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    
    // Log before deletion
    await ActivityLog.create({
      user_id: userId,
      action: 'delete',
      entity_type: 'ProfessorCourse',
      entity_id: assignmentId,
      description: `Removed course assignment from professor`
    });
    
    await assignment.destroy();
  } catch (error) {
    console.error('Remove course assignment error:', error);
    throw error;
  }
};

module.exports = {
  createProfessor,
  updateProfessor,
  deleteProfessor,
  getProfessors,
  getProfessorById,
  assignCourseToProfessor,
  removeCourseFomProfessor
};
