const Student = require('../models/Student');
const Course = require('../models/Course');
const StudentEnrollment = require('../models/StudentEnrollment');
const AcademicYear = require('../models/AcademicYear');

/**
 * Student Enrollment Service
 * Handles automatic enrollment of students in courses based on their specialty and year
 */
class StudentEnrollmentService {
  /**
   * Enroll student in all courses for their specialty and year
   * @param {number} studentId - Student database ID
   * @returns {Promise<{success: boolean, enrolled: number, errors: Array}>}
   */
  async enrollStudentInCourses(studentId) {
    try {
      // Find student with specialty information
      const student = await Student.findByPk(studentId);
      
      if (!student) {
        throw new Error(`Student with ID ${studentId} not found`);
      }

      console.log(`Enrolling student ${studentId} (specialty: ${student.specialty_id}, year: ${student.current_year})`);

      // Find academic year record for this specialty and year
      const academicYear = await AcademicYear.findOne({
        where: {
          specialty_id: student.specialty_id,
          year_number: student.current_year,
          is_active: true
        }
      });

      if (!academicYear) {
        console.warn(`No active academic year found for specialty ${student.specialty_id}, year ${student.current_year}`);
        return { success: true, enrolled: 0, errors: [] };
      }

      // Find all active courses for this academic year
      const courses = await Course.findAll({
        where: {
          academic_year_id: academicYear.id,
          is_active: true
        }
      });

      if (courses.length === 0) {
        console.warn(`No active courses found for academic year ${academicYear.id} (specialty ${student.specialty_id}, year ${student.current_year})`);
        return { success: true, enrolled: 0, errors: [] };
      }

      console.log(`Found ${courses.length} courses to enroll student in`);

      const enrollments = [];
      const errors = [];

      // Enroll student in each course
      for (const course of courses) {
        try {
          // Check for existing enrollment
          const existing = await StudentEnrollment.findOne({
            where: {
              student_id: studentId,
              course_id: course.id
            }
          });

          if (existing) {
            console.log(`Student ${studentId} already enrolled in course ${course.id} (${course.course_code})`);
            continue;
          }

          // Create enrollment
          await StudentEnrollment.create({
            student_id: studentId,
            course_id: course.id,
            academic_year_id: course.academic_year_id,
            semester_id: course.semester_id,
            enrollment_date: new Date(),
            status: 'enrolled'
          });

          enrollments.push(course.id);
          console.log(`Successfully enrolled student ${studentId} in course ${course.id} (${course.course_code})`);
        } catch (error) {
          console.error(`Failed to enroll student ${studentId} in course ${course.id}:`, error.message);
          errors.push({
            course_id: course.id,
            course_code: course.course_code,
            course_name: course.course_name,
            error: error.message
          });
        }
      }

      console.log(`Enrollment complete: ${enrollments.length} successful, ${errors.length} failed`);

      return {
        success: true,
        enrolled: enrollments.length,
        errors
      };
    } catch (error) {
      console.error('Error in enrollStudentInCourses:', error);
      throw error;
    }
  }

  /**
   * Re-enroll student when year is updated
   * @param {number} studentId - Student database ID
   * @param {number} newYear - New year number (1-4)
   * @returns {Promise<{success: boolean, enrolled: number, errors: Array}>}
   */
  async updateStudentYear(studentId, newYear) {
    try {
      // Validate year
      if (newYear < 1 || newYear > 4) {
        throw new Error(`Invalid year number: ${newYear}. Must be between 1 and 4.`);
      }

      // Find and update student
      const student = await Student.findByPk(studentId);
      
      if (!student) {
        throw new Error(`Student with ID ${studentId} not found`);
      }

      console.log(`Updating student ${studentId} from year ${student.current_year} to year ${newYear}`);

      // Update year
      await student.update({ current_year: newYear });

      // Enroll in new year's courses
      return await this.enrollStudentInCourses(studentId);
    } catch (error) {
      console.error('Error in updateStudentYear:', error);
      throw error;
    }
  }
}

module.exports = new StudentEnrollmentService();
