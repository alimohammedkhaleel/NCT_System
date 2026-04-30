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
 * @param {object} professorData - Professor data { username, email, password, full_name, phone, national_id, department, specialization, specialty_id }
 * @param {number} userId - Admin user ID (for activity logging)
 * @returns {Promise<object>} Created professor with user info
 */
const createProfessor = async (professorData, userId) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Validate required fields
    if (!professorData.username || !professorData.email || !professorData.password || !professorData.full_name) {
      throw new Error('يرجى ملء جميع الحقول المطلوبة (username, email, password, full_name)');
    }

    // Verify username doesn't exist
    const existingUser = await User.findOne({
      where: { 
        [Op.or]: [
          { username: professorData.username },
          { email: professorData.email }
        ]
      }
    });
    
    if (existingUser) {
      if (existingUser.username === professorData.username) {
        throw new Error('اسم المستخدم موجود بالفعل');
      }
      if (existingUser.email === professorData.email) {
        throw new Error('البريد الإلكتروني موجود بالفعل');
      }
    }

    // Verify national_id uniqueness if provided
    if (professorData.national_id) {
      const existingId = await User.findOne({ where: { national_id: professorData.national_id } });
      if (existingId) {
        throw new Error('الرقم القومي موجود بالفعل');
      }
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
      national_id: professorData.national_id || null,
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
      specialty_id: professorData.specialty_id || null,
      is_active: true
    }, { transaction });
    
    // Log activity
    await ActivityLog.create({
      user_id: userId,
      action: 'create',
      entity: 'Professor',
      entity_id: professor.id,
      details: JSON.stringify({ description: `Created professor ${user.full_name} (${professorCode})` }),
      status: 'success'
    }, { transaction });
    
    await transaction.commit();
    
    // Fetch complete professor data with user
    const createdProfessor = await Professor.findByPk(professor.id, {
      include: [{
        model: User,
        attributes: ['id', 'username', 'email', 'full_name', 'phone', 'national_id']
      }]
    });
    
    return createdProfessor;
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
  const transaction = await sequelize.transaction();
  try {
    const professor = await Professor.findByPk(professorId, {
      include: [{ model: User }]
    });
    if (!professor) {
      throw new Error('Professor not found');
    }
    
    // Update linked User record if user fields are provided
    const userUpdateData = {};
    if (updateData.full_name) userUpdateData.full_name = updateData.full_name;
    if (updateData.email) userUpdateData.email = updateData.email;
    if (updateData.phone) userUpdateData.phone = updateData.phone;
    if (updateData.national_id) userUpdateData.national_id = updateData.national_id;
    if (updateData.password) {
      userUpdateData.password_hash = await bcrypt.hash(updateData.password, 12);
    }

    if (Object.keys(userUpdateData).length > 0) {
      await professor.User.update(userUpdateData, { transaction });
    }

    // Update Professor record
    const professorFields = ['department', 'specialization', 'is_active', 'specialty_id'];
    const professorUpdateData = {};
    professorFields.forEach(f => {
      if (updateData[f] !== undefined) professorUpdateData[f] = updateData[f];
    });

    await professor.update(professorUpdateData, { transaction });
    
    // Log activity
    await ActivityLog.create({
      user_id: userId,
      action: 'update',
      entity: 'Professor',
      entity_id: professor.id,
      details: JSON.stringify({ description: `Updated professor ${professor.professor_code}` })
    }, { transaction });
    
    await transaction.commit();
    return professor;
  } catch (error) {
    await transaction.rollback();
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
      entity: 'Professor',
      entity_id: professor.id,
      details: JSON.stringify({ description: `Archived professor ${professor.professor_code}` })
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

    if (filters.specialty_id) {
      whereClause.specialty_id = filters.specialty_id;
    }

    // Handle specialty code filter (from query string)
    if (filters.specialty) {
      const Specialty = require('../models/Specialty');
      const specialty = await Specialty.findOne({ where: { code: filters.specialty } });
      if (specialty) {
        whereClause.specialty_id = specialty.id;
      }
    }
    
    const professors = await Professor.findAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'username', 'email', 'full_name', 'phone', 'national_id', 'last_login']
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
      entity: 'ProfessorCourse',
      entity_id: assignment.id,
      details: JSON.stringify({ description: `Assigned course to professor ${professor.professor_code}` })
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
      entity: 'ProfessorCourse',
      entity_id: assignmentId,
      details: JSON.stringify({ description: `Removed course assignment from professor` })
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
