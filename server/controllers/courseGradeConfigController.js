const CourseGradeConfig = require('../models/CourseGradeConfig');
const Course = require('../models/Course');
const Specialty = require('../models/Specialty');

// GET /api/admin/course-grade-config
// الحصول على جميع إعدادات الدرجات مع معلومات المواد
// FIX: Now fetches ALL courses (with or without custom config) and shows default values for courses without config
exports.getAllConfigs = async (req, res) => {
  try {
    const { specialty_id, academic_year_id, semester_id } = req.query;
    
    // بناء شروط البحث للمواد - تطبيقها مباشرة على جدول Course
    const courseWhere = {};
    if (specialty_id) courseWhere.specialty_id = specialty_id;
    if (academic_year_id) courseWhere.academic_year_id = academic_year_id;
    if (semester_id) courseWhere.semester_id = semester_id;
    
    // القيم الافتراضية للكورسات بدون config
    const DEFAULT_CONFIG = {
      ass1_percentage: 15.00,
      ass2_percentage: 15.00,
      final_percentage: 70.00,
      ass1_max: 30.00,
      ass2_max: 30.00,
      final_max: 150.00,
      p_value: 30.00,
      m_value: 21.00,
      d_value: 15.00
    };
    
    // FIX: Start from Course table with LEFT JOIN to CourseGradeConfig
    const courses = await Course.findAll({
      where: courseWhere,
      include: [
        {
          model: CourseGradeConfig,
          as: 'CourseGradeConfig',
          required: false  // LEFT JOIN - include courses without config
        },
        {
          model: Specialty,
          as: 'Specialty',
          attributes: ['id', 'name', 'arabic_name', 'code']
        }
      ],
      order: [['id', 'ASC']]
    });
    
    // تنسيق البيانات - استخدام القيم المخصصة أو الافتراضية
    const formattedConfigs = courses.map(course => {
      const config = course.CourseGradeConfig;
      
      return {
        id: config ? config.id : null,  // null for courses without custom config
        course_id: course.id,
        course_code: course.course_code,
        course_name: course.course_name,
        arabic_name: course.arabic_name,
        specialty_name: course.Specialty?.arabic_name || course.Specialty?.name,
        // Use custom config values if exists, otherwise use defaults
        ass1_percentage: config ? parseFloat(config.ass1_percentage) : DEFAULT_CONFIG.ass1_percentage,
        ass2_percentage: config ? parseFloat(config.ass2_percentage) : DEFAULT_CONFIG.ass2_percentage,
        final_percentage: config ? parseFloat(config.final_percentage) : DEFAULT_CONFIG.final_percentage,
        ass1_max: config ? parseFloat(config.ass1_max) : DEFAULT_CONFIG.ass1_max,
        ass2_max: config ? parseFloat(config.ass2_max) : DEFAULT_CONFIG.ass2_max,
        final_max: config ? parseFloat(config.final_max) : DEFAULT_CONFIG.final_max,
        p_value: config ? parseFloat(config.p_value) : DEFAULT_CONFIG.p_value,
        m_value: config ? parseFloat(config.m_value) : DEFAULT_CONFIG.m_value,
        d_value: config ? parseFloat(config.d_value) : DEFAULT_CONFIG.d_value,
        created_at: config ? config.created_at : null,
        updated_at: config ? config.updated_at : null
      };
    });
    
    res.json({
      success: true,
      data: formattedConfigs,
      count: formattedConfigs.length
    });
  } catch (error) {
    console.error('getAllConfigs error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحميل إعدادات الدرجات',
      error: error.message
    });
  }
};

// GET /api/admin/course-grade-config/:courseId
// الحصول على إعدادات مادة محددة
exports.getConfigByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const config = await CourseGradeConfig.findOne({
      where: { course_id: courseId }
    });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على إعدادات لهذه المادة، سيتم استخدام القيم الافتراضية'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: config.id,
        course_id: config.course_id,
        ass1_percentage: parseFloat(config.ass1_percentage),
        ass2_percentage: parseFloat(config.ass2_percentage),
        final_percentage: parseFloat(config.final_percentage),
        ass1_max: parseFloat(config.ass1_max),
        ass2_max: parseFloat(config.ass2_max),
        final_max: parseFloat(config.final_max),
        p_value: parseFloat(config.p_value),
        m_value: parseFloat(config.m_value),
        d_value: parseFloat(config.d_value)
      }
    });
  } catch (error) {
    console.error('getConfigByCourse error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في تحميل إعدادات المادة',
      error: error.message
    });
  }
};

// POST /api/admin/course-grade-config
// إنشاء إعدادات جديدة
exports.createConfig = async (req, res) => {
  try {
    const {
      course_id,
      ass1_percentage,
      ass2_percentage,
      final_percentage,
      ass1_max,
      ass2_max,
      final_max,
      p_value,
      m_value,
      d_value
    } = req.body;
    
    // التحقق من وجود المادة
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'المادة غير موجودة'
      });
    }
    
    // التحقق من عدم وجود إعدادات مسبقة
    const existingConfig = await CourseGradeConfig.findOne({
      where: { course_id }
    });
    
    if (existingConfig) {
      return res.status(400).json({
        success: false,
        message: 'توجد إعدادات مسبقة لهذه المادة، استخدم التحديث بدلاً من الإنشاء'
      });
    }
    
    // إنشاء الإعدادات
    const config = await CourseGradeConfig.create({
      course_id,
      ass1_percentage: ass1_percentage || 15.00,
      ass2_percentage: ass2_percentage || 15.00,
      final_percentage: final_percentage || 70.00,
      ass1_max: ass1_max || 30.00,
      ass2_max: ass2_max || 30.00,
      final_max: final_max || 150.00,
      p_value: p_value || 30.00,
      m_value: m_value || 21.00,
      d_value: d_value || 15.00
    });
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء الإعدادات بنجاح',
      data: config
    });
  } catch (error) {
    console.error('createConfig error:', error);
    
    if (error.message.includes('مجموع النسب المئوية')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء الإعدادات',
      error: error.message
    });
  }
};

// PUT /api/admin/course-grade-config/:courseId
// تحديث إعدادات موجودة أو إنشاء جديدة (upsert)
exports.updateConfig = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updateData = req.body;

    // التحقق من وجود المادة
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'المادة غير موجودة'
      });
    }

    // upsert: تحديث إن وجد، إنشاء إن لم يوجد
    const [config, created] = await CourseGradeConfig.findOrCreate({
      where: { course_id: courseId },
      defaults: {
        course_id: courseId,
        ass1_percentage: updateData.ass1_percentage ?? 15.00,
        ass2_percentage: updateData.ass2_percentage ?? 15.00,
        final_percentage: updateData.final_percentage ?? 70.00,
        ass1_max: updateData.ass1_max ?? 30.00,
        ass2_max: updateData.ass2_max ?? 30.00,
        final_max: updateData.final_max ?? 150.00,
        p_value: updateData.p_value ?? 30.00,
        m_value: updateData.m_value ?? 21.00,
        d_value: updateData.d_value ?? 15.00
      }
    });

    if (!created) {
      // سجل موجود - قم بتحديثه
      await config.update(updateData);
    }

    res.json({
      success: true,
      message: created ? 'تم إنشاء الإعدادات بنجاح' : 'تم تحديث الإعدادات بنجاح',
      data: config
    });
  } catch (error) {
    console.error('updateConfig error:', error);

    if (error.message.includes('مجموع النسب المئوية')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'فشل في تحديث الإعدادات',
      error: error.message
    });
  }
};

// DELETE /api/admin/course-grade-config/:courseId
// حذف إعدادات (العودة للقيم الافتراضية)
exports.deleteConfig = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const config = await CourseGradeConfig.findOne({
      where: { course_id: courseId }
    });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على إعدادات لهذه المادة'
      });
    }
    
    await config.destroy();
    
    res.json({
      success: true,
      message: 'تم حذف الإعدادات، سيتم استخدام القيم الافتراضية'
    });
  } catch (error) {
    console.error('deleteConfig error:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في حذف الإعدادات',
      error: error.message
    });
  }
};


// POST /api/admin/course-grade-config/import
// استيراد إعدادات من JSON
exports.importConfigs = async (req, res) => {
  try {
    const { parseGradeConfigs } = require('../utils/gradeConfigParser');
    const jsonData = req.body;

    // Parse and validate
    const parseResult = parseGradeConfigs(jsonData);
    
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'فشل تحليل البيانات',
        errors: parseResult.errors
      });
    }

    const imported = [];
    const failed = [];

    // Import each config
    for (const configData of parseResult.data) {
      try {
        // Check if config already exists
        const existing = await CourseGradeConfig.findOne({
          where: { course_id: configData.course_id }
        });

        if (existing) {
          // Update existing
          await existing.update(configData);
          imported.push({
            course_id: configData.course_id,
            action: 'updated'
          });
        } else {
          // Create new
          await CourseGradeConfig.create(configData);
          imported.push({
            course_id: configData.course_id,
            action: 'created'
          });
        }
      } catch (error) {
        failed.push({
          course_id: configData.course_id,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `تم استيراد ${imported.length} إعداد بنجاح`,
      data: {
        imported_count: imported.length,
        failed_count: failed.length,
        imported,
        failed
      }
    });

  } catch (error) {
    console.error('Import configs error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء الاستيراد',
      error: error.message
    });
  }
};

// GET /api/admin/course-grade-config/export
// تصدير جميع الإعدادات
exports.exportConfigs = async (req, res) => {
  try {
    const { prettyPrintConfigs } = require('../utils/gradeConfigParser');
    
    const configs = await CourseGradeConfig.findAll({
      include: [{
        model: Course,
        as: 'Course',
        attributes: ['course_code', 'course_name', 'arabic_name']
      }],
      order: [['course_id', 'ASC']]
    });

    // Format configs for export
    const exportData = configs.map(config => ({
      course_id: config.course_id,
      course_code: config.Course?.course_code,
      course_name: config.Course?.course_name,
      ass1_percentage: parseFloat(config.ass1_percentage),
      ass2_percentage: parseFloat(config.ass2_percentage),
      final_percentage: parseFloat(config.final_percentage),
      ass1_max: parseFloat(config.ass1_max),
      ass2_max: parseFloat(config.ass2_max),
      final_max: parseFloat(config.final_max),
      p_value: parseFloat(config.p_value),
      m_value: parseFloat(config.m_value),
      d_value: parseFloat(config.d_value)
    }));

    // Pretty print
    const jsonOutput = prettyPrintConfigs(exportData, {
      indent: 2,
      includeMetadata: true
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="grade-configs-${Date.now()}.json"`);
    
    res.send(jsonOutput);

  } catch (error) {
    console.error('Export configs error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التصدير',
      error: error.message
    });
  }
};
