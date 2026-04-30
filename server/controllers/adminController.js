const { Op } = require('sequelize');
const User = require('../models/User');
const Specialty = require('../models/Specialty');
const AcademicYear = require('../models/AcademicYear');
const Semester = require('../models/Semester');
const Course = require('../models/Course');
const Professor = require('../models/Professor');
const ProfessorCourse = require('../models/ProfessorCourse');
const Student = require('../models/Student');
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

    console.log('getAllAcademicYears: Fetching with filters:', where);

    const academicYears = await AcademicYear.findAll({
      where,
      include: [{
        model: Specialty,
        attributes: ['id', 'code', 'name', 'arabic_name'],
        required: false // Make it optional to avoid errors if specialty is missing
      }],
      order: [['year_number', 'ASC']]
    });

    console.log(`getAllAcademicYears: Found ${academicYears.length} academic years`);

    // Add Arabic label for each year
    const yearLabels = { 
      1: 'السنة الأولى', 
      2: 'السنة الثانية', 
      3: 'السنة الثالثة', 
      4: 'السنة الرابعة' 
    };
    
    const data = academicYears.map(y => {
      const yearData = y.toJSON();
      return {
        ...yearData,
        year_label: yearLabels[yearData.year_number] || `السنة ${yearData.year_number}`
      };
    });

    console.log('getAllAcademicYears: Successfully returning data');
    res.json({
      success: true,
      data,
      count: data.length
    });

  } catch (error) {
    console.error('getAllAcademicYears: Error occurred:', error.message);
    console.error('getAllAcademicYears: Error stack:', error.stack);
    console.error('getAllAcademicYears: Error details:', {
      name: error.name,
      message: error.message,
      sql: error.sql || 'N/A'
    });
    res.status(500).json({
      success: false,
      message: 'Server error while fetching academic years',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// ==================== STUDENT PROMOTION & RESULTS PUBLISHING ====================

// @desc    Publish approved grades
// @route   POST /api/admin/publish-results
// @access  Admin Only
const publishResults = async (req, res) => {
  const sequelize = require('../config/database');
  const transaction = await sequelize.transaction();

  try {
    const { course_ids, filters, semester_id, academic_year_id, specialty_id, branch } = req.body;
    const Grade = require('../models/Grade');
    const Student = require('../models/Student');

    // Validate input: need either course_ids or filters (new format) or direct fields (old format)
    const hasCourseIds = course_ids && Array.isArray(course_ids) && course_ids.length > 0;
    const hasFilters = filters && (filters.specialty_id || filters.academic_year_id || filters.semester_id || filters.branch);
    const hasDirectFields = semester_id || academic_year_id || specialty_id || branch; // Backward compatibility

    if (!hasCourseIds && !hasFilters && !hasDirectFields) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'يرجى تحديد المواد أو معايير التصفية',
        message_en: 'Please specify courses or filter criteria'
      });
    }

    // Build where clause
    const where = {
      status: 'approved',
      is_published: false
    };

    if (hasCourseIds) {
      where.course_id = { [Op.in]: course_ids };
    } else {
      // Use filters (new format) or direct fields (old format for backward compatibility)
      const filterData = hasFilters ? filters : { semester_id, academic_year_id, specialty_id };
      
      if (filterData.semester_id) where.semester_id = filterData.semester_id;
      if (filterData.academic_year_id) where.academic_year_id = filterData.academic_year_id;

      if (filterData.specialty_id || filterData.branch) {
        const studentWhere = {};
        if (filterData.specialty_id) studentWhere.specialty_id = filterData.specialty_id;
        if (filterData.branch && filterData.branch !== 'Both') studentWhere.branch = filterData.branch;

        const students = await Student.findAll({
          where: studentWhere,
          attributes: ['id'],
          transaction
        });
        const studentIds = students.map(s => s.id);

        if (studentIds.length === 0) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message: 'لا يوجد طلاب يطابقون هذه المعايير'
          });
        }
        where.student_id = { [Op.in]: studentIds };
      }
    }

    // Get grades to publish with Course and Student includes
    const gradesToPublish = await Grade.findAll({
      where,
      include: [
        { model: Course, attributes: ['id', 'course_name', 'arabic_name'] },
        { model: Student, attributes: ['id', 'student_code'] }
      ],
      transaction
    });

    if (gradesToPublish.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'لا توجد درجات معتمدة للنشر',
        message_en: 'No approved grades available for publishing'
      });
    }

    // Update grades in transaction
    const publishedAt = new Date();
    await Grade.update(
      {
        is_published: true,
        published_at: publishedAt,
        published_by: req.user.id
      },
      { where, transaction }
    );

    // Get unique student IDs
    const uniqueStudentIds = [...new Set(gradesToPublish.map(g => g.student_id))];

    // Group results by course for response
    const courseStats = {};
    gradesToPublish.forEach(grade => {
      const courseId = grade.course_id;
      if (!courseStats[courseId]) {
        courseStats[courseId] = {
          course_id: courseId,
          course_name: grade.Course?.course_name || 'Unknown',
          arabic_name: grade.Course?.arabic_name || '',
          grades_published: 0
        };
      }
      courseStats[courseId].grades_published++;
    });

    await transaction.commit();

    // Log activity
    await logActivity(req.user.id, 'publish', 'Grades', null, {
      course_ids: hasCourseIds ? course_ids : null,
      filters: hasFilters ? filters : (hasDirectFields ? { semester_id, academic_year_id, specialty_id } : null),
      count: gradesToPublish.length,
      student_count: uniqueStudentIds.length,
      published_at: publishedAt.toISOString()
    });

    res.json({
      success: true,
      message: `تم نشر ${gradesToPublish.length} درجة بنجاح`,
      data: {
        published_count: gradesToPublish.length,
        students_notified: uniqueStudentIds.length,
        published_at: publishedAt,
        courses: Object.values(courseStats)
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Publish results error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء نشر النتائج',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Promote students to next semester
// @route   POST /api/admin/promote-semester
// @access  Admin Only
//
// Semester promotion rules:
//   System automatically checks ALL active students across all years/semesters
//   Year 2 & 4 (graduation years): Must pass ALL courses → summer_course if any fail
//   Year 1 & 3: ≤3 failed courses → summer_course, >3 failed → repeat_year
const promoteToNextSemester = async (req, res) => {
  try {
    const { specialty_id, student_ids } = req.body;

    const Student = require('../models/Student');
    const Grade = require('../models/Grade');
    const CourseGradeConfig = require('../models/CourseGradeConfig');

    // Build student filter - check ALL active students
    const studentWhere = { academic_status: 'active' };
    if (specialty_id) studentWhere.specialty_id = specialty_id;
    if (student_ids && student_ids.length > 0) {
      studentWhere.id = { [Op.in]: student_ids };
    }

    const students = await Student.findAll({ where: studentWhere });

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد طلاب للنقل'
      });
    }

    const promoted = [];
    const toSummer = [];
    const repeatYear = [];
    const noGrades = [];

    for (const student of students) {
      const yearNumber = student.current_year;
      // Graduation years (2 and 4) require ALL courses passed
      const isGraduationYear = yearNumber === 2 || yearNumber === 4;

      // Get all approved grades for this student (across all semesters in current year)
      const grades = await Grade.findAll({
        where: { 
          student_id: student.id, 
          status: 'approved'
        },
        include: [{ 
          model: require('../models/Course'), 
          attributes: ['id', 'course_code', 'course_name', 'arabic_name'] 
        }]
      });

      if (grades.length === 0) {
        noGrades.push({ student_id: student.id, student_code: student.student_code });
        continue;
      }

      // Evaluate each course, preferring passing grades if multiple attempts exist
      const courseResults = {}; // course_id -> { passed, details }
      for (const grade of grades) {
        const config = await CourseGradeConfig.findOne({ where: { course_id: grade.course_id } });
        const finalMax = config?.final_max || 150;
        const finalExamPct = (parseFloat(grade.final_exam_score || 0) / finalMax) * 100;
        const passedCourse = parseFloat(grade.total_percentage || 0) >= 60 && finalExamPct >= 50;
        
        // Use PASS if available, otherwise store failure details
        if (!courseResults[grade.course_id] || passedCourse) {
          courseResults[grade.course_id] = {
            passed: passedCourse,
            details: {
              course_code: grade.Course?.course_code || 'N/A',
              course_name: grade.Course?.arabic_name || grade.Course?.course_name || 'N/A',
              total_percentage: parseFloat(grade.total_percentage || 0),
              final_exam_percentage: parseFloat(finalExamPct.toFixed(1)),
              reason: finalExamPct < 50 ? 'رسب في الامتحان النهائي' : 'أقل من 60%'
            }
          };
        }
      }

      const failedCourses = Object.values(courseResults)
        .filter(r => !r.passed)
        .map(r => r.details);

      if (failedCourses.length === 0) {
        // All passed → promote to semester 2
        await student.update({ current_semester: 2 });
        promoted.push({
          student_id: student.id,
          student_code: student.student_code,
          year: yearNumber,
          note: 'تم النقل إلى الترم الثاني'
        });

      } else if (isGraduationYear) {
        // Year 2 or 4: any failure → summer course
        await student.update({ academic_status: 'summer_course' });
        toSummer.push({
          student_id: student.id,
          student_code: student.student_code,
          year: yearNumber,
          failed_count: failedCourses.length,
          failed_courses: failedCourses,
          reason: 'سنة تخرج — يجب النجاح في جميع المواد'
        });

      } else {
        // Year 1 or 3: up to 3 → summer; more than 3 → repeat year
        if (failedCourses.length <= 3) {
          await student.update({ academic_status: 'summer_course' });
          toSummer.push({
            student_id: student.id,
            student_code: student.student_code,
            year: yearNumber,
            failed_count: failedCourses.length,
            failed_courses: failedCourses,
            reason: `رسب في ${failedCourses.length} مادة — دراسة صيفية`
          });
        } else {
          // Keep active, stays in same year
          repeatYear.push({
            student_id: student.id,
            student_code: student.student_code,
            year: yearNumber,
            failed_count: failedCourses.length,
            failed_courses: failedCourses,
            reason: `رسب في ${failedCourses.length} مادة (أكثر من 3) — إعادة السنة`
          });
        }
      }
    }

    await logActivity(req.user.id, 'promote_semester', 'Students', null, {
      specialty_id,
      promoted_count: promoted.length,
      summer_count: toSummer.length,
      repeat_count: repeatYear.length
    });

    res.json({
      success: true,
      message: `تمت المعالجة: ${promoted.length} مؤهل للترم الثاني، ${toSummer.length} دراسة صيفية، ${repeatYear.length} إعادة سنة`,
      data: {
        promoted_count: promoted.length,
        summer_count: toSummer.length,
        repeat_count: repeatYear.length,
        no_grades_count: noGrades.length,
        promoted_students: promoted,
        summer_students: toSummer,
        repeat_students: repeatYear,
        no_grades_students: noGrades
      }
    });

  } catch (error) {
    console.error('Promote to next semester error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء نقل الطلاب'
    });
  }
};

// @desc    Promote students to next year (bulk)
// @route   POST /api/admin/promote-year
// @access  Admin Only
//
// Promotion rules:
//   Year 2 (graduation year) → must pass ALL courses → summer_course if any fail
//   Year 4 (graduation year) → must pass ALL courses → summer_course if any fail
//   Year 1 & 3              → up to 3 failed courses → summer_course
//                           → more than 3 failed     → repeat_year (stay, status stays active)
const promoteToNextYear = async (req, res) => {
  try {
    const { academic_year_id, specialty_id, student_ids } = req.body;

    if (!academic_year_id) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تحديد السنة الدراسية'
      });
    }

    const Student = require('../models/Student');
    const Grade = require('../models/Grade');
    const CourseGradeConfig = require('../models/CourseGradeConfig');
    const AcademicYear = require('../models/AcademicYear');

    const academicYear = await AcademicYear.findByPk(academic_year_id);
    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'السنة الدراسية غير موجودة'
      });
    }

    const yearNumber = academicYear.year_number;

    // Year 4 bulk promotion → use graduate endpoint instead
    if (yearNumber === 4) {
      return res.status(400).json({
        success: false,
        message: 'لنقل طلاب السنة الرابعة استخدم عملية التخريج'
      });
    }

    // Graduation years: year 2 and year 4 require ALL courses passed
    const isGraduationYear = yearNumber === 2;

    // Build student filter — include summer_course students too (re-check after summer)
    const studentWhere = {
      academic_status: { [Op.in]: ['active', 'summer_course'] },
      current_year: yearNumber
    };
    if (specialty_id) studentWhere.specialty_id = specialty_id;
    if (student_ids && student_ids.length > 0) {
      studentWhere.id = { [Op.in]: student_ids };
    }

    const students = await Student.findAll({ where: studentWhere });

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد طلاب للنقل'
      });
    }

    const promoted = [];
    const toSummer = [];
    const repeatYear = [];
    const noGrades = [];

    for (const student of students) {
      const grades = await Grade.findAll({
        where: { student_id: student.id, academic_year_id, status: 'approved' },
        include: [{ model: require('../models/Course'), attributes: ['id', 'course_code', 'course_name', 'arabic_name'] }]
      });

      if (grades.length === 0) {
        noGrades.push({ student_id: student.id, student_code: student.student_code });
        continue;
      }

      // Evaluate each course, preferring passing grades if multiple attempts exist
      const courseResults = {}; // course_id -> { passed, details }
      for (const grade of grades) {
        const config = await CourseGradeConfig.findOne({ where: { course_id: grade.course_id } });
        const finalMax = config?.final_max || 150;
        const finalExamPct = (parseFloat(grade.final_exam_score || 0) / finalMax) * 100;
        const passedCourse = parseFloat(grade.total_percentage || 0) >= 60 && finalExamPct >= 50;
        
        // Use PASS if available, otherwise store failure details
        if (!courseResults[grade.course_id] || passedCourse) {
          courseResults[grade.course_id] = {
            passed: passedCourse,
            details: {
              course_code: grade.Course?.course_code || 'N/A',
              course_name: grade.Course?.arabic_name || grade.Course?.course_name || 'N/A',
              total_percentage: parseFloat(grade.total_percentage || 0),
              final_exam_percentage: parseFloat(finalExamPct.toFixed(1)),
              reason: finalExamPct < 50 ? 'رسب في الامتحان النهائي' : 'أقل من 60%'
            }
          };
        }
      }

      const failedCourses = Object.values(courseResults)
        .filter(r => !r.passed)
        .map(r => r.details);

      if (failedCourses.length === 0) {
        // All passed → promote to next year
        await student.update({ current_year: yearNumber + 1, academic_status: 'active' });
        promoted.push({
          student_id: student.id,
          student_code: student.student_code,
          from_year: yearNumber,
          to_year: yearNumber + 1
        });

      } else if (isGraduationYear) {
        // Year 2: any failure → summer course (must pass ALL)
        await student.update({ academic_status: 'summer_course' });
        toSummer.push({
          student_id: student.id,
          student_code: student.student_code,
          failed_count: failedCourses.length,
          failed_courses: failedCourses,
          reason: 'سنة تخرج — يجب النجاح في جميع المواد'
        });

      } else {
        // Year 1 or 3: up to 3 failed → summer; more than 3 → repeat year
        if (failedCourses.length <= 3) {
          await student.update({ academic_status: 'summer_course' });
          toSummer.push({
            student_id: student.id,
            student_code: student.student_code,
            failed_count: failedCourses.length,
            failed_courses: failedCourses,
            reason: `رسب في ${failedCourses.length} مادة — دراسة صيفية`
          });
        } else {
          // More than 3 → repeat year (keep current_year, reset to active)
          await student.update({ academic_status: 'active' });
          repeatYear.push({
            student_id: student.id,
            student_code: student.student_code,
            failed_count: failedCourses.length,
            failed_courses: failedCourses,
            reason: `رسب في ${failedCourses.length} مادة (أكثر من 3) — إعادة السنة`
          });
        }
      }
    }

    await logActivity(req.user.id, 'promote_year', 'Students', null, {
      academic_year_id,
      specialty_id,
      year_number: yearNumber,
      promoted_count: promoted.length,
      summer_count: toSummer.length,
      repeat_count: repeatYear.length
    });

    res.json({
      success: true,
      message: `تمت المعالجة: ${promoted.length} منقول، ${toSummer.length} دراسة صيفية، ${repeatYear.length} إعادة سنة`,
      data: {
        year_number: yearNumber,
        is_graduation_year: isGraduationYear,
        promoted_count: promoted.length,
        summer_count: toSummer.length,
        repeat_count: repeatYear.length,
        no_grades_count: noGrades.length,
        promoted_students: promoted,
        summer_students: toSummer,
        repeat_students: repeatYear,
        no_grades_students: noGrades
      }
    });

  } catch (error) {
    console.error('Promote to next year error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء نقل الطلاب'
    });
  }
};

// ==================== REGISTRATION LINK MANAGEMENT ====================

// @desc    Create registration link
// @route   POST /api/admin/registration-links
// @access  Admin Only
const createRegistrationLink = async (req, res) => {
  try {
    const { expires_in_days = 7 } = req.body;
    const { RegistrationLink } = require('../config/models');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);

    const link = await RegistrationLink.create({
      created_by: req.user.id,
      expires_at: expiresAt
    });

    await logActivity(req.user.id, 'create', 'registration_link', link.id, { expires_at: expiresAt });

    res.status(201).json({
      success: true,
      data: {
        id: link.id,
        token: link.token,
        expires_at: link.expires_at,
        registration_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register/${link.token}`
      },
      message: 'تم إنشاء رابط التسجيل بنجاح'
    });
  } catch (error) {
    console.error('createRegistrationLink error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all registration links
// @route   GET /api/admin/registration-links
// @access  Admin Only
const getRegistrationLinks = async (req, res) => {
  try {
    const { RegistrationLink } = require('../config/models');

    const links = await RegistrationLink.findAll({
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: links.map(link => ({
        id: link.id,
        token: link.token,
        expires_at: link.expires_at,
        is_used: link.is_used,
        used_at: link.used_at,
        created_by: link.createdByAdmin?.full_name,
        created_at: link.created_at,
        registration_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register/${link.token}`,
        is_expired: new Date() > new Date(link.expires_at),
        is_active: !link.is_used && new Date() <= new Date(link.expires_at)
      }))
    });
  } catch (error) {
    console.error('getRegistrationLinks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all registration requests
// @route   GET /api/admin/registration-requests
// @access  Admin Only
const getRegistrationRequests = async (req, res) => {
  try {
    const { RegistrationRequest, Specialty: SpecialtyModel } = require('../config/models');
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const requests = await RegistrationRequest.findAll({
      where,
      include: [
        { model: SpecialtyModel, attributes: ['id', 'name', 'arabic_name', 'code'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('getRegistrationRequests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Approve registration request
// @route   POST /api/admin/registration-requests/:id/approve
// @access  Admin Only
const approveRegistrationRequest = async (req, res) => {
  try {
    const { RegistrationRequest, Student } = require('../config/models');
    const bcrypt = require('bcryptjs');
    const requestId = req.params.id;

    const request = await RegistrationRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'طلب التسجيل غير موجود' });
    }

    if (request.status === 'approved') {
      return res.status(400).json({ success: false, message: 'تم قبول هذا الطلب مسبقاً' });
    }

    // If previously rejected, reset rejection reason to allow re-approval
    if (request.status === 'rejected') {
      await request.update({ status: 'pending', rejection_reason: null });
    }

    // Generate student code (8 random digits)
    const studentCode = String(Math.floor(10000000 + Math.random() * 90000000));

    // Generate username from national_id
    const username = `student_${request.national_id}`;

    // Create user account
    const hashedPassword = await bcrypt.hash(request.national_id, 12);
    const user = await User.create({
      username,
      email: request.email,
      password_hash: hashedPassword,
      full_name: request.full_name,
      phone: request.phone,
      role: 'student',
      is_active: true
    });

    // Create student record
    const student = await Student.create({
      user_id: user.id,
      student_code: studentCode,
      national_id: request.national_id,
      specialty_id: request.specialty_id,
      birth_date: request.birth_date,
      gender: request.gender,
      address: request.address,
      guardian_name: request.guardian_name,
      guardian_phone: request.guardian_phone,
      guardian_relation: request.guardian_relation,
      enrollment_date: new Date(),
      current_year: request.current_year || 1,
      branch: request.branch || null,
      academic_status: 'active'
    });

    // Update request status
    await request.update({
      status: 'approved',
      reviewed_by: req.user.id,
      reviewed_at: new Date(),
      created_user_id: user.id
    });

    await logActivity(req.user.id, 'approve', 'registration_request', requestId, { student_id: student.id });

    res.json({
      success: true,
      data: {
        student_code: studentCode,
        username,
        default_password: request.national_id,
        full_name: request.full_name
      },
      message: 'تم قبول الطلب وإنشاء حساب الطالب بنجاح'
    });
  } catch (error) {
    console.error('approveRegistrationRequest error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reject registration request
// @route   POST /api/admin/registration-requests/:id/reject
// @access  Admin Only
const rejectRegistrationRequest = async (req, res) => {
  try {
    const { RegistrationRequest } = require('../config/models');
    const requestId = req.params.id;
    const { rejection_reason } = req.body;

    const request = await RegistrationRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'طلب التسجيل غير موجود' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'تم معالجة هذا الطلب مسبقاً' });
    }

    await request.update({
      status: 'rejected',
      rejection_reason: rejection_reason || 'لم يتم تحديد سبب',
      reviewed_by: req.user.id,
      reviewed_at: new Date()
    });

    await logActivity(req.user.id, 'reject', 'registration_request', requestId, { reason: rejection_reason });

    res.json({
      success: true,
      message: 'تم رفض الطلب'
    });
  } catch (error) {
    console.error('rejectRegistrationRequest error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get grade statistics
// @route   GET /api/admin/grades/stats
// @access  Admin Only
const getGradeStats = async (req, res) => {
  try {
    const { semester_id, academic_year_id, specialty_id } = req.query;
    const Grade = require('../models/Grade');
    const Student = require('../models/Student');

    // Build base where clause
    const where = {};
    if (semester_id) where.semester_id = semester_id;
    if (academic_year_id) where.academic_year_id = academic_year_id;

    // If specialty_id is provided, filter by students in that specialty
    if (specialty_id) {
      const students = await Student.findAll({
        where: { specialty_id },
        attributes: ['id']
      });
      const studentIds = students.map(s => s.id);
      
      if (studentIds.length > 0) {
        where.student_id = { [Op.in]: studentIds };
      }
    }

    // Get total grades count
    const totalGrades = await Grade.count({ where });

    // Get published grades count
    const publishedGrades = await Grade.count({
      where: { ...where, is_published: true }
    });

    // Get unpublished but approved grades count
    const unpublishedGrades = await Grade.count({
      where: { 
        ...where, 
        is_published: false,
        status: 'approved'
      }
    });

    // Get pending approval grades count
    const pendingApproval = await Grade.count({
      where: { 
        ...where, 
        status: 'pending_admin_approval'
      }
    });

    // Get draft grades count
    const draftGrades = await Grade.count({
      where: { 
        ...where, 
        status: 'draft'
      }
    });

    res.json({
      success: true,
      data: {
        total: totalGrades,
        published: publishedGrades,
        unpublished: unpublishedGrades,
        pending_approval: pendingApproval,
        draft: draftGrades,
        filters: {
          semester_id: semester_id || null,
          academic_year_id: academic_year_id || null,
          specialty_id: specialty_id || null
        }
      }
    });

  } catch (error) {
    console.error('Get grade stats error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب إحصائيات الدرجات'
    });
  }
};

// @desc    Get courses with grade statistics for results publishing
// @route   GET /api/admin/courses/with-stats
// @access  Admin
const getCoursesWithStats = async (req, res) => {
  try {
    const Grade = require('../models/Grade');
    const { specialty_id, academic_year_id, semester_id, branch } = req.query;
    const { Op } = require('sequelize');

    const where = { is_active: true };
    if (specialty_id) where.specialty_id = specialty_id;
    if (academic_year_id) where.academic_year_id = academic_year_id;
    if (semester_id) where.semester_id = semester_id;
    
    // Add branch filtering if provided
    if (branch && branch !== 'Both') {
      where.branch = { [Op.or]: [branch, 'Both'] };
    }

    const courses = await Course.findAll({
      where,
      include: [
        { model: Specialty, attributes: ['id', 'name', 'arabic_name', 'code'] },
        { model: AcademicYear, attributes: ['id', 'year_number'] },
        { model: Semester, attributes: ['id', 'semester_name'] }
      ],
      order: [
        ['specialty_id', 'ASC'],
        ['academic_year_id', 'ASC'],
        ['semester_id', 'ASC'],
        ['course_code', 'ASC']
      ]
    });

    // Get grade stats for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const courseData = course.toJSON();
        
        // Define grade filter - if course is "Both", but admin filtered by branch,
        // we only count grades of students in that specific branch.
        const gradeWhere = { course_id: course.id };
        
        if (branch && branch !== 'Both') {
          const students = await Student.findAll({
            where: { branch },
            attributes: ['id']
          });
          const studentIds = students.map(s => s.id);
          gradeWhere.student_id = { [Op.in]: studentIds };
        }

        const [total, approved, published, unpublishedApproved] = await Promise.all([
          Grade.count({ where: gradeWhere }),
          Grade.count({ where: { ...gradeWhere, status: 'approved' } }),
          Grade.count({ where: { ...gradeWhere, is_published: true } }),
          Grade.count({ where: { ...gradeWhere, status: 'approved', is_published: false } })
        ]);

        return {
          ...courseData,
          grade_stats: {
            total,
            approved,
            published,
            unpublished_approved: unpublishedApproved
          }
        };
      })
    );

    res.json({
      success: true,
      data: coursesWithStats,
      count: coursesWithStats.length
    });

  } catch (error) {
    console.error('Get courses with stats error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحميل بيانات المواد'
    });
  }
};

// ==================== BULK STUDENT PROMOTION SYSTEM ====================
// Rules:
// - Year 2 & 4 (graduation years): Must pass ALL subjects → any fail = summer course
// - Year 1 & 3: Up to 3 failed subjects → summer course, more than 3 → repeat year
// - Summer course students who pass advance normally
// - On failure (summer): 1000 EGP per failed subject added as invoice
// - On total failure (repeat year): Full year fees set by admin added as invoice

// @desc    Bulk promote students with automatic rule verification
// @route   POST /api/admin/bulk-promote
// @access  Admin Only
const bulkPromoteStudents = async (req, res) => {
  try {
    const { academic_year_id, specialty_id } = req.body;

    if (!academic_year_id || !specialty_id) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تحديد السنة الدراسية والتخصص'
      });
    }

    const Grade = require('../models/Grade');
    const CourseGradeConfig = require('../models/CourseGradeConfig');
    const FeeInvoice = require('../models/FeeInvoice');
    const SpecialtyFee = require('../models/SpecialtyFee');

    // Get academic year to check year_number
    const academicYear = await AcademicYear.findByPk(academic_year_id);
    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: 'السنة الدراسية غير موجودة'
      });
    }

    const yearNumber = academicYear.year_number;
    const isGraduationYear = (yearNumber === 2 || yearNumber === 4);

    // Get all active students in this specialty and year
    const students = await Student.findAll({
      where: {
        specialty_id,
        current_year: yearNumber,
        academic_status: 'active'
      },
      include: [
        { model: User, attributes: ['full_name'] }
      ]
    });

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد طلاب نشطون في هذا التخصص والسنة'
      });
    }

    // Get specialty fee for this year (for repeat year fees)
    const specialtyFee = await SpecialtyFee.findOne({
      where: { specialty_id, year_number: yearNumber }
    });
    const fullYearFee = specialtyFee ? parseFloat(specialtyFee.fee_amount) : 0;
    const summerCourseFeePerSubject = 1000; // 1000 EGP per failed subject

    const results = {
      promoted: [],
      summer_course: [],
      repeat_year: [],
      no_grades: []
    };

    for (const student of students) {
      // Get all approved grades for this student in this academic year
      const grades = await Grade.findAll({
        where: {
          student_id: student.id,
          academic_year_id,
          status: 'approved'
        },
        include: [{
          model: require('../models/Course'),
          attributes: ['id', 'course_code', 'course_name', 'arabic_name', 'credit_hours']
        }]
      });

      if (grades.length === 0) {
        results.no_grades.push({
          student_id: student.id,
          student_code: student.student_code,
          full_name: student.User?.full_name || '—',
          reason: 'لا توجد درجات معتمدة'
        });
        continue;
      }

      // Evaluate each course, preferring passing grades if multiple attempts exist (e.g. Summer)
      const courseResults = {}; // course_id -> { passed, details }
      for (const grade of grades) {
        const config = await CourseGradeConfig.findOne({
          where: { course_id: grade.course_id }
        });
        const finalMax = config?.final_max || 150;

        const finalExamPercentage = (parseFloat(grade.final_exam_score || 0) / finalMax) * 100;
        const passedFinalExam = finalExamPercentage >= 50;
        const passedCourse = parseFloat(grade.total_percentage || 0) >= 60 && passedFinalExam;

        // If we haven't seen this course yet, or if this attempt is a PASS, store it.
        // This ensures a Summer PASS replaces a previous FAIL.
        if (!courseResults[grade.course_id] || passedCourse) {
          courseResults[grade.course_id] = {
            passed: passedCourse,
            details: {
              course_id: grade.course_id,
              course_code: grade.Course?.course_code || 'N/A',
              course_name: grade.Course?.arabic_name || grade.Course?.course_name || 'N/A',
              total_percentage: parseFloat(grade.total_percentage || 0),
              final_exam_percentage: finalExamPercentage.toFixed(1),
              reason: !passedFinalExam ? 'رسب في الامتحان النهائي' : 'أقل من 60%'
            }
          };
        }
      }

      const failedCourses = Object.values(courseResults)
        .filter(r => !r.passed)
        .map(r => r.details);

      if (failedCourses.length === 0) {
        // ✅ All passed → Promote to next year
        if (yearNumber < 4) {
          await student.update({ current_year: yearNumber + 1 });
        }
        results.promoted.push({
          student_id: student.id,
          student_code: student.student_code,
          full_name: student.User?.full_name || '—',
          from_year: yearNumber,
          to_year: Math.min(yearNumber + 1, 4),
          total_courses: grades.length
        });
      } else if (isGraduationYear || failedCourses.length <= 3) {
        // ☀️ Summer course (graduation years: any fail, other years: up to 3)
        const summerFee = failedCourses.length * summerCourseFeePerSubject;

        // Create summer course fee invoice
        const invoiceNumber = `SMRF-${Date.now()}-${student.id}`;
        await FeeInvoice.create({
          invoice_number: invoiceNumber,
          student_id: student.id,
          academic_year_id,
          total_amount: summerFee,
          paid_amount: 0,
          status: 'pending',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          issued_by: req.user.id,
          notes: `رسوم دراسة صيفية - ${failedCourses.length} مادة × ${summerCourseFeePerSubject} ج.م`
        });

        // Update student status
        await student.update({ academic_status: 'summer_course' });

        results.summer_course.push({
          student_id: student.id,
          student_code: student.student_code,
          full_name: student.User?.full_name || '—',
          failed_count: failedCourses.length,
          failed_courses: failedCourses,
          summer_fee: summerFee,
          invoice_number: invoiceNumber
        });
      } else {
        // 🔁 More than 3 failed → Repeat the year
        // Create full year fee invoice for repeat
        const invoiceNumber = `RPTF-${Date.now()}-${student.id}`;
        if (fullYearFee > 0) {
          await FeeInvoice.create({
            invoice_number: invoiceNumber,
            student_id: student.id,
            academic_year_id,
            total_amount: fullYearFee,
            paid_amount: 0,
            status: 'pending',
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            issued_by: req.user.id,
            notes: `رسوم إعادة السنة الدراسية ${yearNumber} - رسوب في ${failedCourses.length} مادة`
          });
        }

        // Update student status to repeat
        await student.update({ academic_status: 'repeat_year' });

        results.repeat_year.push({
          student_id: student.id,
          student_code: student.student_code,
          full_name: student.User?.full_name || '—',
          failed_count: failedCourses.length,
          failed_courses: failedCourses,
          repeat_fee: fullYearFee,
          invoice_number: fullYearFee > 0 ? invoiceNumber : null
        });
      }
    }

    // Log activity
    await logActivity(req.user.id, 'bulk_promote', 'Students', null, {
      academic_year_id,
      specialty_id,
      year_number: yearNumber,
      is_graduation_year: isGraduationYear,
      promoted_count: results.promoted.length,
      summer_count: results.summer_course.length,
      repeat_count: results.repeat_year.length,
      no_grades_count: results.no_grades.length
    });

    res.json({
      success: true,
      message: `تم معالجة ${students.length} طالب: ${results.promoted.length} ناجح، ${results.summer_course.length} دراسة صيفية، ${results.repeat_year.length} إعادة سنة`,
      data: {
        year_number: yearNumber,
        is_graduation_year: isGraduationYear,
        total_students: students.length,
        rules_applied: isGraduationYear
          ? 'سنة تخرج: أي رسوب = دراسة صيفية'
          : 'حتى 3 مواد راسب = دراسة صيفية، أكثر من 3 = إعادة سنة',
        summer_course_fee_per_subject: summerCourseFeePerSubject,
        full_year_repeat_fee: fullYearFee,
        ...results
      }
    });

  } catch (error) {
    console.error('Bulk promote students error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء النقل الجماعي للطلاب'
    });
  }
};

// @desc    Promote summer course students who passed
// @route   POST /api/admin/promote-summer-passed
// @access  Admin Only
const promoteSummerPassed = async (req, res) => {
  try {
    const { specialty_id } = req.body;

    // Find all students with academic_status 'summer_course'
    const where = { academic_status: 'summer_course' };
    if (specialty_id) where.specialty_id = specialty_id;

    const students = await Student.findAll({
      where,
      include: [{ model: User, attributes: ['full_name'] }]
    });

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'لا يوجد طلاب في الدراسة الصيفية'
      });
    }

    const promoted = [];
    const stillFailing = [];

    for (const student of students) {
      const isGraduationYear = student.current_year === 2 || student.current_year === 4;

      if (isGraduationYear) {
        // ── سنة 2 و 4: يجب النجاح في جميع المواد ──────────────────────────
        const grades = await Grade.findAll({
          where: { student_id: student.id, status: 'approved' }
        });

        // Build best result per course
        const courseResults = {};
        for (const grade of grades) {
          const passed = grade.final_result === 'Pass' ||
                         grade.final_result === 'Merit' ||
                         grade.final_result === 'Distinction';
          if (!(grade.course_id in courseResults) || passed) {
            courseResults[grade.course_id] = passed;
          }
        }

        const failedCount = Object.values(courseResults).filter(p => !p).length;

        if (failedCount === 0) {
          // ✅ كل المواد ناجح → ينتقل للسنة الجديدة
          const newYear = Math.min(student.current_year + 1, 4);
          await student.update({ current_year: newYear, academic_status: 'active' });
          promoted.push({
            student_id: student.id,
            student_code: student.student_code,
            full_name: student.User?.full_name || '—',
            from_year: student.current_year,
            to_year: newYear,
            note: 'سنة تخرج — نجح في جميع المواد'
          });
        } else {
          // ❌ لا يزال راسب → يبقى في الصيفي
          stillFailing.push({
            student_id: student.id,
            student_code: student.student_code,
            full_name: student.User?.full_name || '—',
            reason: `سنة تخرج — لا يزال راسب في ${failedCount} مادة`
          });
        }
      } else {
        // ── سنة 1 و 3: ينتقل دائماً بعد انتهاء الصيفي (مع مواده) ──────────
        // الصيفي انتهى → ينتقل للسنة الجديدة بغض النظر عن المواد الراسبة
        const newYear = Math.min(student.current_year + 1, 4);
        await student.update({ current_year: newYear, academic_status: 'active' });
        promoted.push({
          student_id: student.id,
          student_code: student.student_code,
          full_name: student.User?.full_name || '—',
          from_year: student.current_year,
          to_year: newYear,
          note: 'ينتقل مع مواده للسنة الجديدة'
        });
      }
    }

    await logActivity(req.user.id, 'promote_summer', 'Students', null, {
      specialty_id,
      promoted_count: promoted.length,
      still_failing_count: stillFailing.length
    });

    res.json({
      success: true,
      message: `تم نقل ${promoted.length} طالب من الدراسة الصيفية${stillFailing.length > 0 ? ` — ${stillFailing.length} طالب لا يزال في الصيفي (سنة تخرج)` : ''}`,
      data: { promoted, still_failing: stillFailing }
    });

  } catch (error) {
    console.error('Promote summer passed error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء نقل طلاب الدراسة الصيفية'
    });
  }
};

// @desc    Approve all pending registration requests (bulk)
// @route   POST /api/admin/registration-requests/approve-all
// @access  Admin Only
const approveAllRegistrationRequests = async (req, res) => {
  try {
    const { RegistrationRequest, Student } = require('../config/models');
    const bcrypt = require('bcryptjs');
    const { specialty_id, filters } = req.body;

    // Build where clause
    const where = { status: 'pending' };
    if (specialty_id) {
      where.specialty_id = specialty_id;
    }
    if (filters?.high_school_grade_min) {
      where.high_school_grade = { [Op.gte]: filters.high_school_grade_min };
    }
    if (filters?.created_before) {
      where.created_at = { [Op.lte]: new Date(filters.created_before) };
    }

    // Get all pending requests
    const requests = await RegistrationRequest.findAll({ where });

    if (requests.length === 0) {
      return res.json({
        success: true,
        message: 'لا توجد طلبات معلقة',
        data: {
          approved_count: 0,
          failed_count: 0,
          failed_requests: [],
          student_codes: []
        }
      });
    }

    const results = {
      approved_count: 0,
      failed_count: 0,
      failed_requests: [],
      student_codes: []
    };

    // Process each request
    for (const request of requests) {
      try {
        // Generate student code
        const studentCode = String(Math.floor(10000000 + Math.random() * 90000000));
        const username = `student_${request.national_id}`;

        // Check if email or national_id already exists
        const existingUser = await User.findOne({
          where: {
            [Op.or]: [
              { email: request.email },
              { national_id: request.national_id }
            ]
          }
        });

        if (existingUser) {
          results.failed_count++;
          results.failed_requests.push({
            id: request.id,
            full_name: request.full_name,
            reason: 'البريد الإلكتروني أو الرقم القومي مستخدم بالفعل'
          });
          continue;
        }

        // Create user account
        const hashedPassword = await bcrypt.hash(request.national_id, 12);
        const user = await User.create({
          username,
          email: request.email,
          password_hash: hashedPassword,
          full_name: request.full_name,
          phone: request.phone,
          role: 'student',
          is_active: true
        });

        // Create student record
        const student = await Student.create({
          user_id: user.id,
          student_code: studentCode,
          national_id: request.national_id,
          specialty_id: request.specialty_id,
          birth_date: request.birth_date,
          gender: request.gender,
          address: request.address,
          guardian_name: request.guardian_name,
          guardian_phone: request.guardian_phone,
          guardian_relation: request.guardian_relation,
          enrollment_date: new Date(),
          current_year: request.current_year || 1,
          branch: request.branch || null,
          academic_status: 'active'
        });

        // Update request status
        await request.update({
          status: 'approved',
          reviewed_by: req.user.id,
          reviewed_at: new Date(),
          created_user_id: user.id
        });

        results.approved_count++;
        results.student_codes.push(studentCode);

        await logActivity(req.user.id, 'approve_bulk', 'registration_request', request.id, { student_id: student.id });

      } catch (error) {
        console.error(`Error approving request ${request.id}:`, error);
        results.failed_count++;
        results.failed_requests.push({
          id: request.id,
          full_name: request.full_name,
          reason: error.message || 'خطأ غير معروف'
        });
      }
    }

    res.json({
      success: true,
      message: `تم قبول ${results.approved_count} طالب بنجاح`,
      data: {
        approved: results.approved_count,
        failed: results.failed_count,
        failedRequests: results.failed_requests.map(r => ({
          email: r.full_name,
          reason: r.reason
        })),
        student_codes: results.student_codes
      }
    });

  } catch (error) {
    console.error('approveAllRegistrationRequests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete registration request
// @route   DELETE /api/admin/registration-requests/:id
// @access  Admin Only
const deleteRegistrationRequest = async (req, res) => {
  try {
    const { RegistrationRequest } = require('../config/models');
    const requestId = req.params.id;

    const request = await RegistrationRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'طلب التسجيل غير موجود' });
    }

    // Don't allow deleting approved requests
    if (request.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف طلب مقبول'
      });
    }

    await logActivity(req.user.id, 'delete', 'registration_request', requestId, {
      full_name: request.full_name,
      email: request.email
    });

    await request.destroy();

    res.json({
      success: true,
      message: 'تم حذف طلب التسجيل نهائياً'
    });

  } catch (error) {
    console.error('deleteRegistrationRequest error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all pending requests in bulk view
// @route   GET /api/admin/registration-requests/pending-bulk
// @access  Admin Only
const getPendingRequestsBulk = async (req, res) => {
  try {
    const { RegistrationRequest } = require('../config/models');
    const { specialty_id, high_school_grade_min } = req.query;

    const where = { status: 'pending' };
    if (specialty_id) {
      where.specialty_id = specialty_id;
    }
    if (high_school_grade_min) {
      where.high_school_grade = { [Op.gte]: parseFloat(high_school_grade_min) };
    }

    const requests = await RegistrationRequest.findAll({
      where,
      include: [
        {
          model: Specialty,
          attributes: ['id', 'code', 'name', 'arabic_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: requests,
      count: requests.length
    });

  } catch (error) {
    console.error('getPendingRequestsBulk error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
  updateUserStatus,
  // Student Promotion & Results Publishing
  publishResults,
  promoteToNextSemester,
  promoteToNextYear,
  getGradeStats,
  getCoursesWithStats,
  // Bulk Promotion System
  bulkPromoteStudents,
  promoteSummerPassed,
  // Registration Links
  createRegistrationLink,
  getRegistrationLinks,
  getRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest,
  // New: Bulk Student Management
  approveAllRegistrationRequests,
  deleteRegistrationRequest,
  getPendingRequestsBulk
};

