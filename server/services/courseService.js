const { Op } = require('sequelize');
const Course = require('../models/Course');
const Specialty = require('../models/Specialty');
const AcademicYear = require('../models/AcademicYear');
const Semester = require('../models/Semester');
const StudentEnrollment = require('../models/StudentEnrollment');
const ActivityLog = require('../models/ActivityLog');

// ==================== Course Management Service ====================

/**
 * Create a new course
 * @param {object} courseData - Course data
 * @param {number} userId - User ID (for activity logging)
 * @returns {Promise<object>} Created course
 */
const createCourse = async (courseData, userId) => {
  try {
    // Verify specialty exists
    const specialty = await Specialty.findByPk(courseData.specialty_id);
    if (!specialty) {
      throw new Error('Specialty not found');
    }
    
    // Verify academic year exists
    const academicYear = await AcademicYear.findByPk(courseData.academic_year_id);
    if (!academicYear) {
      throw new Error('Academic year not found');
    }
    
    // Verify semester exists
    const semester = await Semester.findByPk(courseData.semester_id);
    if (!semester) {
      throw new Error('Semester not found');
    }
    
    const course = await Course.create(courseData);
    
    // Log activity
    await ActivityLog.create({
      user_id: userId,
      action: 'create',
      entity_type: 'Course',
      entity_id: course.id,
      description: `Created course ${course.course_code}`
    });
    
    return course;
  } catch (error) {
    console.error('Create course error:', error);
    throw error;
  }
};

/**
 * Update course
 * @param {number} courseId - Course ID
 * @param {object} updateData - Update data
 * @param {number} userId - User ID (for activity logging)
 * @returns {Promise<object>} Updated course
 */
const updateCourse = async (courseId, updateData, userId) => {
  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    await course.update(updateData);
    
    // Log activity
    await ActivityLog.create({
      user_id: userId,
      action: 'update',
      entity_type: 'Course',
      entity_id: course.id,
      description: `Updated course ${course.course_code}`
    });
    
    return course;
  } catch (error) {
    console.error('Update course error:', error);
    throw error;
  }
};

/**
 * Soft delete course (mark as inactive)
 * @param {number} courseId - Course ID
 * @param {number} userId - User ID (for activity logging)
 * @returns {Promise<object>} Deleted course
 */
const softDeleteCourse = async (courseId, userId) => {
  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Check if course has active enrollments
    const activeEnrollments = await StudentEnrollment.count({
      where: {
        course_id: courseId,
        status: 'active'
      }
    });
    
    if (activeEnrollments > 0) {
      throw new Error('Cannot delete course with active student enrollments');
    }
    
    await course.update({ is_active: false });
    
    // Log activity
    await ActivityLog.create({
      user_id: userId,
      action: 'delete',
      entity_type: 'Course',
      entity_id: course.id,
      description: `Archived course ${course.course_code}`
    });
    
    return course;
  } catch (error) {
    console.error('Soft delete course error:', error);
    throw error;
  }
};

/**
 * Get courses with filters
 * @param {object} filters - Filter criteria (specialty_id, academic_year_id, semester_id, is_active)
 * @returns {Promise<array>} Filtered courses
 */
const getCourses = async (filters = {}) => {
  try {
    const whereClause = {};
    
    if (filters.specialty_id) {
      whereClause.specialty_id = filters.specialty_id;
    }
    
    if (filters.academic_year_id) {
      whereClause.academic_year_id = filters.academic_year_id;
    }
    
    if (filters.semester_id) {
      whereClause.semester_id = filters.semester_id;
    }
    
    if (filters.is_active !== undefined) {
      whereClause.is_active = filters.is_active;
    } else {
      // By default, show only active courses
      whereClause.is_active = true;
    }
    
    const courses = await Course.findAll({
      where: whereClause,
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name', 'arabic_name', 'code']
        },
        {
          model: AcademicYear,
          attributes: ['id', 'year_number', 'academic_season']
        },
        {
          model: Semester,
          attributes: ['id', 'semester_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    return courses;
  } catch (error) {
    console.error('Get courses error:', error);
    throw error;
  }
};

/**
 * Get single course with related data
 * @param {number} courseId - Course ID
 * @returns {Promise<object>} Course with associations
 */
const getCourseById = async (courseId) => {
  try {
    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: Specialty,
          attributes: ['id', 'name', 'arabic_name', 'code']
        },
        {
          model: AcademicYear,
          attributes: ['id', 'year_number', 'academic_season']
        },
        {
          model: Semester,
          attributes: ['id', 'semester_name']
        }
      ]
    });
    
    if (!course) {
      throw new Error('Course not found');
    }
    
    return course;
  } catch (error) {
    console.error('Get course error:', error);
    throw error;
  }
};

module.exports = {
  createCourse,
  updateCourse,
  softDeleteCourse,
  getCourses,
  getCourseById
};
