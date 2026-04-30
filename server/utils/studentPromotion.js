const Grade = require('../models/Grade');
const CourseGradeConfig = require('../models/CourseGradeConfig');
const Course = require('../models/Course');

/**
 * Check if a student passes all courses in a semester
 * @param {number} student_id - Student ID
 * @param {number} semester_id - Semester ID
 * @param {number} academic_year_id - Academic Year ID (optional, for filtering)
 * @returns {Promise<{passed: boolean, failed_courses: Array, total_percentage: number}>}
 */
const checkPassingConditions = async (student_id, semester_id, academic_year_id = null) => {
  try {
    // Build where clause
    const where = {
      student_id,
      semester_id,
      status: 'approved'
    };
    
    if (academic_year_id) {
      where.academic_year_id = academic_year_id;
    }

    // Get all approved grades for this student in the semester
    const grades = await Grade.findAll({
      where,
      include: [{
        model: Course,
        attributes: ['id', 'course_code', 'course_name', 'arabic_name']
      }]
    });

    if (grades.length === 0) {
      return {
        passed: false,
        failed_courses: [],
        total_percentage: 0,
        message: 'لا توجد درجات معتمدة'
      };
    }

    const failed_courses = [];
    let totalPercentageSum = 0;

    // Check each course
    for (const grade of grades) {
      const totalPercentage = parseFloat(grade.total_percentage);
      totalPercentageSum += totalPercentage;

      // Get course config to check final exam passing condition
      const config = await CourseGradeConfig.findOne({
        where: { course_id: grade.course_id }
      });
      
      const finalMax = config?.final_max || 150;
      const finalExamScore = parseFloat(grade.final_exam_score);
      const finalExamPercentage = (finalExamScore / finalMax) * 100;

      // Passing conditions:
      // 1. Total percentage >= 60%
      // 2. Final exam score >= 50% of final_max
      const passedFinalExam = finalExamPercentage >= 50;
      const passedCourse = totalPercentage >= 60 && passedFinalExam;

      if (!passedCourse) {
        failed_courses.push({
          course_id: grade.course_id,
          course_code: grade.Course?.course_code || 'N/A',
          course_name: grade.Course?.course_name || 'N/A',
          arabic_name: grade.Course?.arabic_name || 'N/A',
          total_percentage: totalPercentage,
          final_exam_score: finalExamScore,
          final_exam_percentage: finalExamPercentage,
          final_max: finalMax,
          reason: !passedFinalExam 
            ? 'رسب في الامتحان النهائي (أقل من 50%)' 
            : 'النسبة الإجمالية أقل من 60%'
        });
      }
    }

    const avgPercentage = totalPercentageSum / grades.length;

    return {
      passed: failed_courses.length === 0,
      failed_courses,
      total_percentage: avgPercentage,
      courses_count: grades.length
    };

  } catch (error) {
    console.error('Error checking passing conditions:', error);
    throw error;
  }
};

/**
 * Generate a promotion report
 * @param {Array} promoted - Array of promoted students
 * @param {Array} failed - Array of failed students
 * @returns {Object} Report object
 */
const generatePromotionReport = (promoted, failed) => {
  const report = {
    summary: {
      total_students: promoted.length + failed.length,
      promoted_count: promoted.length,
      failed_count: failed.length,
      promotion_rate: promoted.length > 0 
        ? ((promoted.length / (promoted.length + failed.length)) * 100).toFixed(2) + '%'
        : '0%'
    },
    promoted_students: promoted.map(s => ({
      student_id: s.student_id,
      student_code: s.student_code,
      from_year: s.from_year,
      to_year: s.to_year,
      note: s.note
    })),
    failed_students: failed.map(s => ({
      student_id: s.student_id,
      student_code: s.student_code,
      reason: s.reason,
      failed_courses: s.failed_courses || []
    })),
    generated_at: new Date().toISOString()
  };

  return report;
};

module.exports = {
  checkPassingConditions,
  generatePromotionReport
};
