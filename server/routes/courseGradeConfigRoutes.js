const express = require('express');
const router = express.Router();
const courseGradeConfigController = require('../controllers/courseGradeConfigController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// جميع المسارات محمية بدور admin
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// IMPORTANT: Specific routes MUST come before parameterized routes
// GET /api/admin/course-grade-config/export - تصدير جميع الإعدادات
router.get('/export', courseGradeConfigController.exportConfigs);

// POST /api/admin/course-grade-config/import - استيراد إعدادات من JSON
router.post('/import', courseGradeConfigController.importConfigs);

// GET /api/admin/course-grade-config - الحصول على جميع الإعدادات
router.get('/', courseGradeConfigController.getAllConfigs);

// POST /api/admin/course-grade-config - إنشاء إعدادات جديدة
router.post('/', courseGradeConfigController.createConfig);

// GET /api/admin/course-grade-config/:courseId - الحصول على إعدادات مادة محددة
router.get('/:courseId', courseGradeConfigController.getConfigByCourse);

// PUT /api/admin/course-grade-config/:courseId - تحديث إعدادات موجودة
router.put('/:courseId', courseGradeConfigController.updateConfig);

// DELETE /api/admin/course-grade-config/:courseId - حذف إعدادات
router.delete('/:courseId', courseGradeConfigController.deleteConfig);

module.exports = router;
