const CourseService = require('../services/courseService');
const ProfessorService = require('../services/professorService');
const GradeSettingsService = require('../services/gradeSettingsService');
const GradeApprovalService = require('../services/gradeApprovalService');
const QRCodeService = require('../services/qrCodeService');
const { ActivityLog } = require('../config/models');

class ExtendedAdminController {
  // ==================== COURSE MANAGEMENT ====================

  /**
   * Create a new course
   * POST /api/admin/courses
   */
  async createCourse(req, res) {
    try {
      const { specialty_id, academic_year_id, semester_id, course_code, course_name, arabic_name, credit_hours } = req.body;
      const userId = req.user.id;

      const course = await CourseService.createCourse(
        {
          specialty_id,
          academic_year_id,
          semester_id,
          course_code,
          course_name,
          arabic_name,
          credit_hours
        },
        userId
      );

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course
      });
    } catch (error) {
      console.error('Create course error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create course'
      });
    }
  }

  /**
   * Update course
   * PUT /api/admin/courses/:id
   */
  async updateCourse(req, res) {
    try {
      const courseId = req.params.id;
      const userId = req.user.id;
      const updateData = req.body;

      const updatedCourse = await CourseService.updateCourse(courseId, updateData, userId);

      res.json({
        success: true,
        message: 'Course updated successfully',
        data: updatedCourse
      });
    } catch (error) {
      console.error('Update course error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update course'
      });
    }
  }

  /**
   * Soft delete course
   * DELETE /api/admin/courses/:id
   */
  async deleteCourse(req, res) {
    try {
      const courseId = req.params.id;
      const userId = req.user.id;

      await CourseService.softDeleteCourse(courseId, userId);

      res.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      console.error('Delete course error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete course'
      });
    }
  }

  /**
   * Get all courses (with filters)
   * GET /api/admin/courses
   */
  async getCourses(req, res) {
    try {
      const filters = {
        specialty_id: req.query.specialty_id ? parseInt(req.query.specialty_id) : null,
        academic_year_id: req.query.academic_year_id ? parseInt(req.query.academic_year_id) : null,
        semester_id: req.query.semester_id ? parseInt(req.query.semester_id) : null,
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : true
      };

      const courses = await CourseService.getCourses(filters);

      res.json({
        success: true,
        data: courses,
        count: courses.length
      });
    } catch (error) {
      console.error('Get courses error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch courses'
      });
    }
  }

  /**
   * Get single course by ID
   * GET /api/admin/courses/:id
   */
  async getCourseById(req, res) {
    try {
      const courseId = req.params.id;
      const course = await CourseService.getCourseById(courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      res.json({
        success: true,
        data: course
      });
    } catch (error) {
      console.error('Get course error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch course'
      });
    }
  }

  // ==================== PROFESSOR MANAGEMENT ====================

  /**
   * Create a new professor
   * POST /api/admin/professors
   */
  async createProfessor(req, res) {
    try {
      const { username, email, password, full_name, phone, national_id, department, specialization, specialty_id } = req.body;
      const userId = req.user.id;

      const professor = await ProfessorService.createProfessor(
        {
          username,
          email,
          password,
          full_name,
          phone,
          national_id,
          department,
          specialization,
          specialty_id
        },
        userId
      );

      res.status(201).json({
        success: true,
        message: 'Professor created successfully',
        data: {
          id: professor.id,
          user_id: professor.user_id,
          professor_code: professor.professor_code,
          email: professor.User?.email,
          full_name: professor.User?.full_name
        }
      });
    } catch (error) {
      console.error('Create professor error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create professor'
      });
    }
  }

  /**
   * Update professor
   * PUT /api/admin/professors/:id
   */
  async updateProfessor(req, res) {
    try {
      const professorId = req.params.id;
      const userId = req.user.id;
      const updateData = req.body;

      const updatedProfessor = await ProfessorService.updateProfessor(professorId, updateData, userId);

      res.json({
        success: true,
        message: 'Professor updated successfully',
        data: updatedProfessor
      });
    } catch (error) {
      console.error('Update professor error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update professor'
      });
    }
  }

  /**
   * Delete professor (soft delete)
   * DELETE /api/admin/professors/:id
   */
  async deleteProfessor(req, res) {
    try {
      const professorId = req.params.id;
      const userId = req.user.id;

      await ProfessorService.deleteProfessor(professorId, userId);

      res.json({
        success: true,
        message: 'Professor deleted successfully'
      });
    } catch (error) {
      console.error('Delete professor error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete professor'
      });
    }
  }

  /**
   * Get all professors
   * GET /api/admin/professors
   */
  async getProfessors(req, res) {
    try {
      const filters = {
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : true,
        department: req.query.department || null
      };

      const professors = await ProfessorService.getProfessors(filters);

      res.json({
        success: true,
        data: professors,
        count: professors.length
      });
    } catch (error) {
      console.error('Get professors error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch professors'
      });
    }
  }

  /**
   * Get professor by ID (with assigned courses)
   * GET /api/admin/professors/:id
   */
  async getProfessorById(req, res) {
    try {
      const professorId = req.params.id;
      const professor = await ProfessorService.getProfessorById(professorId);

      if (!professor) {
        return res.status(404).json({
          success: false,
          message: 'Professor not found'
        });
      }

      res.json({
        success: true,
        data: professor
      });
    } catch (error) {
      console.error('Get professor error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch professor'
      });
    }
  }

  /**
   * Assign course to professor
   * POST /api/admin/professors/:id/courses
   */
  async assignCourseToProfessor(req, res) {
    try {
      const professorId = req.params.id;
      const { course_id, academic_year_id, semester_id, is_primary } = req.body;
      const userId = req.user.id;

      const assignment = await ProfessorService.assignCourseToProfessor(
        professorId,
        course_id,
        academic_year_id,
        semester_id,
        is_primary || false,
        userId
      );

      res.status(201).json({
        success: true,
        message: 'Course assigned to professor successfully',
        data: assignment
      });
    } catch (error) {
      console.error('Assign course error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to assign course'
      });
    }
  }

  /**
   * Remove course from professor
   * DELETE /api/admin/professor-courses/:assignmentId
   */
  async removeCourseFomProfessor(req, res) {
    try {
      const assignmentId = req.params.assignmentId;
      const userId = req.user.id;

      await ProfessorService.removeCourseFomProfessor(assignmentId, userId);

      res.json({
        success: true,
        message: 'Course removed from professor successfully'
      });
    } catch (error) {
      console.error('Remove course error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to remove course'
      });
    }
  }

  // ==================== GRADE SETTINGS MANAGEMENT ====================

  /**
   * Get all grade settings
   * GET /api/admin/grade-settings
   */
  async getAllGradeSettings(req, res) {
    try {
      const settings = await GradeSettingsService.getAllSettings();

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch settings'
      });
    }
  }

  /**
   * Get single grade setting
   * GET /api/admin/grade-settings/:name
   */
  async getGradeSetting(req, res) {
    try {
      const settingName = req.params.name;
      const value = await GradeSettingsService.getSetting(settingName);

      if (!value) {
        return res.status(404).json({
          success: false,
          message: 'Setting not found'
        });
      }

      res.json({
        success: true,
        data: { [settingName]: value }
      });
    } catch (error) {
      console.error('Get setting error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch setting'
      });
    }
  }

  /**
   * Update grade setting
   * PUT /api/admin/grade-settings/:name
   */
  async updateGradeSetting(req, res) {
    try {
      const settingName = req.params.name;
      const { setting_value } = req.body;
      const userId = req.user.id;

      const updated = await GradeSettingsService.updateSetting(settingName, setting_value, userId);

      res.json({
        success: true,
        message: 'Setting updated successfully',
        data: updated
      });
    } catch (error) {
      console.error('Update setting error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update setting'
      });
    }
  }

  /**
   * Initialize default grade settings (admin only)
   * POST /api/admin/grade-settings/initialize
   */
  async initializeGradeSettings(req, res) {
    try {
      const userId = req.user.id;
      const settings = await GradeSettingsService.initializeDefaultSettings(userId);

      res.status(201).json({
        success: true,
        message: 'Grade settings initialized with defaults',
        data: settings
      });
    } catch (error) {
      console.error('Initialize settings error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to initialize settings'
      });
    }
  }

  // ==================== GRADE APPROVAL MANAGEMENT ====================

  /**
   * Get pending grades for approval
   * GET /api/admin/grades/pending
   */
  async getPendingGrades(req, res) {
    try {
      const filters = {
        course_id: req.query.course_id ? parseInt(req.query.course_id) : null,
        academic_year_id: req.query.academic_year_id ? parseInt(req.query.academic_year_id) : null,
        semester_id: req.query.semester_id ? parseInt(req.query.semester_id) : null
      };

      const grades = await GradeApprovalService.getPendingGradesForApproval(filters);

      res.json({
        success: true,
        data: grades,
        count: grades.length
      });
    } catch (error) {
      console.error('Get pending grades error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch pending grades'
      });
    }
  }

  /**
   * Preview grade metrics before approval
   * GET /api/admin/grades/:id/preview
   */
  async previewGradeMetrics(req, res) {
    try {
      const gradeId = req.params.id;
      const preview = await GradeApprovalService.previewGradeMetrics(gradeId);

      if (!preview) {
        return res.status(404).json({
          success: false,
          message: 'Grade not found'
        });
      }

      res.json({
        success: true,
        data: preview
      });
    } catch (error) {
      console.error('Preview metrics error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to preview metrics'
      });
    }
  }

  /**
   * Edit grade before approval
   * PUT /api/admin/grades/:id/edit
   */
  async editGradeBeforeApproval(req, res) {
    try {
      const gradeId = req.params.id;
      const userId = req.user.id;
      const updateData = req.body;

      const updatedGrade = await GradeApprovalService.editGradeBeforeApproval(gradeId, updateData, userId);

      res.json({
        success: true,
        message: 'Grade edited successfully',
        data: updatedGrade
      });
    } catch (error) {
      console.error('Edit grade error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to edit grade'
      });
    }
  }

  /**
   * Approve grade with metrics calculation
   * PUT /api/admin/grades/:id/approve
   */
  async approveGrade(req, res) {
    try {
      const gradeId = req.params.id;
      const userId = req.user.id;

      const approvedGrade = await GradeApprovalService.approveGrade(gradeId, userId);

      res.json({
        success: true,
        message: 'Grade approved successfully with calculated metrics',
        data: {
          id: approvedGrade.id,
          student_id: approvedGrade.student_id,
          course_id: approvedGrade.course_id,
          status: approvedGrade.status,
          assignment1_score: approvedGrade.assignment1_score,
          assignment2_score: approvedGrade.assignment2_score,
          final_exam_score: approvedGrade.final_exam_score,
          total_score: approvedGrade.total_score,
          total_percentage: approvedGrade.total_percentage,
          grade_point: approvedGrade.grade_point,
          letter_grade: approvedGrade.letter_grade,
          final_result: approvedGrade.final_result,
          admin_approved_by: approvedGrade.admin_approved_by,
          approved_at: approvedGrade.approved_at
        }
      });
    } catch (error) {
      console.error('Approve grade error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to approve grade'
      });
    }
  }

  /**
   * Reject grade and revert to draft
   * PUT /api/admin/grades/:id/reject
   */
  async rejectGrade(req, res) {
    try {
      const gradeId = req.params.id;
      const { rejection_reason } = req.body;
      const userId = req.user.id;

      const rejectedGrade = await GradeApprovalService.rejectGrade(gradeId, rejection_reason, userId);

      res.json({
        success: true,
        message: 'Grade rejected and reverted to draft status',
        data: {
          id: rejectedGrade.id,
          status: rejectedGrade.status,
          notes: rejectedGrade.notes
        }
      });
    } catch (error) {
      console.error('Reject grade error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to reject grade'
      });
    }
  }

  // ==================== QR CODE MANAGEMENT ====================

  /**
   * Generate QR code for student registration
   * POST /api/admin/qr-codes/generate/:studentId
   */
  async generateStudentQRCode(req, res) {
    try {
      const studentId = req.params.studentId;
      const expirationHours = req.body.expirationHours || 24;

      const qrCode = await QRCodeService.generateStudentQRCode(studentId, expirationHours);

      res.status(201).json({
        success: true,
        message: 'QR code generated successfully',
        data: {
          student_id: studentId,
          qr_secret: qrCode.qr_secret,
          qr_data: qrCode.qr_data,
          qr_image: qrCode.qr_image,
          expires_at: qrCode.expires_at,
          is_active: qrCode.is_active
        }
      });
    } catch (error) {
      console.error('Generate QR code error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to generate QR code'
      });
    }
  }

  /**
   * Regenerate QR code for student
   * POST /api/admin/qr-codes/regenerate/:studentId
   */
  async regenerateStudentQRCode(req, res) {
    try {
      const studentId = req.params.studentId;
      const expirationHours = req.body.expirationHours || 24;

      // Fetch existing QR code first
      const { StudentQRCode } = require('../config/models');
      const oldQRCode = await StudentQRCode.findOne({
        where: { student_id: studentId, is_active: true }
      });

      if (!oldQRCode) {
        return res.status(404).json({
          success: false,
          message: 'No active QR code found for this student'
        });
      }

      const newQRCode = await QRCodeService.regenerateQRCode(oldQRCode, expirationHours);

      res.json({
        success: true,
        message: 'QR code regenerated successfully',
        data: {
          student_id: studentId,
          qr_secret: newQRCode.qr_secret,
          qr_data: newQRCode.qr_data,
          qr_image: newQRCode.qr_image,
          expires_at: newQRCode.expires_at,
          is_active: newQRCode.is_active
        }
      });
    } catch (error) {
      console.error('Regenerate QR code error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to regenerate QR code'
      });
    }
  }

  /**
   * Revoke QR code
   * DELETE /api/admin/qr-codes/:studentId
   */
  async revokeStudentQRCode(req, res) {
    try {
      const studentId = req.params.studentId;
      const { StudentQRCode } = require('../config/models');

      const result = await StudentQRCode.update(
        { is_active: false },
        {
          where: { student_id: studentId, is_active: true }
        }
      );

      if (result[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'No active QR code found for this student'
        });
      }

      res.json({
        success: true,
        message: 'QR code revoked successfully'
      });
    } catch (error) {
      console.error('Revoke QR code error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to revoke QR code'
      });
    }
  }
}

module.exports = new ExtendedAdminController();
