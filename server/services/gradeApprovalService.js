const { Op } = require('sequelize');
const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Course = require('../models/Course');
const User = require('../models/User');
const AcademicYear = require('../models/AcademicYear');
const Semester = require('../models/Semester');
const ActivityLog = require('../models/ActivityLog');
const gradeSettingsService = require('./gradeSettingsService');
const sequelize = require('../config/database');

// ==================== Grade Approval Service ====================

/**
 * Convert P/M/D grades to numeric values
 * @param {string} grade - P, M, or D
 * @param {object} settings - Grade settings
 * @returns {number} Numeric value
 */
const convertLetterGradeToScore = (grade, settings) => {
  const gradeMap = {
    'P': parseFloat(settings.pass_grade_value || 20),
    'M': parseFloat(settings.merit_grade_value || 30),
    'D': parseFloat(settings.distinction_grade_value || 40)
  };
  
  return gradeMap[grade] || 0;
};

/**
 * Calculate grade metrics before approval
 * @param {object} grade - Grade object
 * @param {object} settings - Grade settings
 * @returns {object} Calculated metrics
 */
const calculateGradeMetrics = (grade, settings) => {
  // Convert assignment grades to scores
  const assignment1Score = convertLetterGradeToScore(grade.assignment1_grade, settings);
  const assignment2Score = convertLetterGradeToScore(grade.assignment2_grade, settings);
  const finalExamScore = parseFloat(grade.final_exam_score) || 0;
  
  // Calculate totals
  const totalScore = assignment1Score + assignment2Score + finalExamScore;
  const maxScore = parseFloat(settings.max_total_score || 200);
  const totalPercentage = (totalScore / maxScore) * 100;
  const gradePoint = (totalScore / maxScore) * 4;
  
  // Calculate letter grade
  const { letterGrade, finalResult } = gradeSettingsService.calculateLetterGrade(totalScore, settings);
  
  return {
    assignment1_score: assignment1Score,
    assignment2_score: assignment2Score,
    final_exam_score: finalExamScore,
    total_score: totalScore,
    total_percentage: totalPercentage,
    grade_point: gradePoint,
    letter_grade: letterGrade,
    final_result: finalResult
  };
};

/**
 * Get all pending grades for approval
 * @param {object} filters - Filter criteria
 * @returns {Promise<array>} Pending grades
 */
const getPendingGradesForApproval = async (filters = {}) => {
  try {
    const whereClause = { status: 'pending_admin_approval' };
    
    if (filters.course_id) {
      whereClause.course_id = filters.course_id;
    }
    
    if (filters.academic_year_id) {
      whereClause.academic_year_id = filters.academic_year_id;
    }
    
    if (filters.semester_id) {
      whereClause.semester_id = filters.semester_id;
    }
    
    const grades = await Grade.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          include: [{
            model: User,
            attributes: ['full_name', 'email']
          }],
          attributes: ['student_code', 'current_year']
        },
        {
          model: Course,
          attributes: ['course_code', 'course_name', 'arabic_name', 'credit_hours']
        },
        {
          model: AcademicYear,
          attributes: ['year_number', 'academic_season']
        },
        {
          model: Semester,
          attributes: ['semester_name']
        }
      ],
      order: [['created_at', 'ASC']]
    });
    
    return grades;
  } catch (error) {
    console.error('Get pending grades error:', error);
    throw error;
  }
};

/**
 * Edit grade before approval
 * @param {number} gradeId - Grade ID
 * @param {object} updateData - Grade data to update
 * @param {number} userId - Admin user ID
 * @returns {Promise<object>} Updated grade
 */
const editGradeBeforeApproval = async (gradeId, updateData, userId) => {
  try {
    const grade = await Grade.findByPk(gradeId);
    if (!grade) {
      throw new Error('Grade not found');
    }
    
    if (grade.status !== 'pending_admin_approval') {
      throw new Error('Can only edit grades that are pending approval');
    }
    
    // Validate grade fields
    const validGrades = ['P', 'M', 'D'];
    if (updateData.assignment1_grade && !validGrades.includes(updateData.assignment1_grade)) {
      throw new Error('Invalid assignment1_grade. Must be P, M, or D');
    }
    if (updateData.assignment2_grade && !validGrades.includes(updateData.assignment2_grade)) {
      throw new Error('Invalid assignment2_grade. Must be P, M, or D');
    }
    
    await grade.update(updateData);
    
    // Log activity
    await ActivityLog.create({
      user_id: userId,
      action: 'update',
      entity_type: 'Grade',
      entity_id: grade.id,
      description: `Admin edited grade before approval`
    });
    
    return grade;
  } catch (error) {
    console.error('Edit grade error:', error);
    throw error;
  }
};

/**
 * Approve grade with auto-calculation
 * @param {number} gradeId - Grade ID
 * @param {number} userId - Admin user ID
 * @returns {Promise<object>} Approved grade
 */
const approveGrade = async (gradeId, userId) => {
  const transaction = await sequelize.transaction();
  
  try {
    const grade = await Grade.findByPk(gradeId, { transaction });
    if (!grade) {
      throw new Error('Grade not found');
    }
    
    if (grade.status !== 'pending_admin_approval') {
      throw new Error('Only pending grades can be approved');
    }
    
    // Get all grade settings
    const settings = await gradeSettingsService.getAllSettings();
    
    // Calculate grade metrics
    const metrics = calculateGradeMetrics(grade, settings);
    
    // Update grade with calculated values
    await grade.update(
      {
        ...metrics,
        status: 'approved',
        admin_approved_by: userId,
        approved_at: new Date()
      },
      { transaction }
    );
    
    // Log activity
    await ActivityLog.create({
      user_id: userId,
      action: 'approve',
      entity_type: 'Grade',
      entity_id: grade.id,
      description: `Admin approved grade with calculated metrics: ${metrics.final_result}`
    }, { transaction });
    
    await transaction.commit();
    
    return grade;
  } catch (error) {
    await transaction.rollback();
    console.error('Approve grade error:', error);
    throw error;
  }
};

/**
 * Reject grade with reason
 * @param {number} gradeId - Grade ID
 * @param {string} rejectionReason - Reason for rejection
 * @param {number} userId - Admin user ID
 * @returns {Promise<object>} Rejected grade (reverted to draft)
 */
const rejectGrade = async (gradeId, rejectionReason, userId) => {
  const transaction = await sequelize.transaction();
  
  try {
    const grade = await Grade.findByPk(gradeId, { transaction });
    if (!grade) {
      throw new Error('Grade not found');
    }
    
    if (grade.status !== 'pending_admin_approval') {
      throw new Error('Only pending grades can be rejected');
    }
    
    // Append rejection reason to notes
    const updatedNotes = `${grade.notes || ''}\n[ADMIN REJECTION - ${new Date().toISOString()}] ${rejectionReason}`;
    
    await grade.update(
      {
        status: 'draft',
        notes: updatedNotes.trim()
      },
      { transaction }
    );
    
    // Log activity
    await ActivityLog.create({
      user_id: userId,
      action: 'reject',
      entity_type: 'Grade',
      entity_id: grade.id,
      description: `Admin rejected grade: ${rejectionReason}`
    }, { transaction });
    
    await transaction.commit();
    
    return grade;
  } catch (error) {
    await transaction.rollback();
    console.error('Reject grade error:', error);
    throw error;
  }
};

/**
 * Get grade metrics preview before approval
 * @param {number} gradeId - Grade ID
 * @returns {Promise<object>} Calculated metrics
 */
const previewGradeMetrics = async (gradeId) => {
  try {
    const grade = await Grade.findByPk(gradeId);
    if (!grade) {
      throw new Error('Grade not found');
    }
    
    const settings = await gradeSettingsService.getAllSettings();
    const metrics = calculateGradeMetrics(grade, settings);
    
    return {
      gradeId,
      current: {
        assignment1_grade: grade.assignment1_grade,
        assignment2_grade: grade.assignment2_grade,
        final_exam_score: grade.final_exam_score
      },
      calculated: metrics,
      settings: {
        pass_grade_value: settings.pass_grade_value,
        merit_grade_value: settings.merit_grade_value,
        distinction_grade_value: settings.distinction_grade_value,
        max_total_score: settings.max_total_score
      }
    };
  } catch (error) {
    console.error('Preview grade metrics error:', error);
    throw error;
  }
};

module.exports = {
  getPendingGradesForApproval,
  editGradeBeforeApproval,
  approveGrade,
  rejectGrade,
  previewGradeMetrics,
  calculateGradeMetrics,
  convertLetterGradeToScore
};
