# خطة التنفيذ: تحسينات لوحات التحكم وواجهة المستخدم لنظام NCTU ERP

## نظرة عامة

تهدف هذه الخطة إلى تنفيذ تحسينات شاملة على نظام NCTU ERP من خلال توحيد نظام الألوان البنفسجي عبر جميع المكونات، إضافة ميزات جديدة لتحسين تجربة المستخدم، وتحسين منطق عرض الدرجات للطلاب. التنفيذ يتم بشكل تدريجي مع التركيز على تعديل المكونات الموجودة بدلاً من إنشاء مكونات جديدة.

## المهام

- [x] 1. إعداد نظام الألوان الموحد
  - تحديث ملف `client/frontend/src/index.css` بإضافة CSS Variables للنظام البنفسجي
  - إضافة المتغيرات: `--purple-primary`, `--purple-dark`, `--purple-light`, `--purple-deep`, `--purple-very-dark`
  - إضافة متغيرات Gradients: `--gradient-primary`, `--gradient-background`
  - إضافة متغيرات Glass Effect: `--glass-bg`, `--glass-border`, `--glass-shadow`
  - _المتطلبات: 2.1, 2.4, 2.5, 2.6, 2.7, 2.9_

- [x] 2. توحيد ألوان الجداول عبر النظام
  - [x] 2.1 تحديث جدول إدارة الطلاب في لوحة الإدارة
    - تعديل ملف `client/frontend/src/pages/Admin/StudentsManagement.module.css`
    - تطبيق نظام الألوان الموحد على الجدول
    - استخدام `--purple-primary` للـ header و `--glass-bg` للخلفية
    - إضافة Glass Effect و hover effects
    - _المتطلبات: 2.1, 2.2, 2.3, 2.8_
  
  - [x] 2.2 تحديث جدول الدرجات في لوحة الأستاذ
    - تعديل ملف `client/frontend/src/pages/Professor/Grades.module.css`
    - تطبيق نفس نظام الألوان المستخدم في جدول الطلاب
    - _المتطلبات: 2.2_
  
  - [x] 2.3 تحديث جدول تسجيل الطلاب
    - تعديل ملف `client/frontend/src/pages/Student/Registration.module.css`
    - تطبيق نفس نظام الألوان الموحد
    - _المتطلبات: 2.2, 2.3_

- [x] 3. توحيد ألوان صفحة تسجيل الدخول ولوحة الإدارة
  - [x] 3.1 تحديث صفحة تسجيل الدخول
    - تعديل ملف `client/frontend/src/pages/Login/Login.module.css`
    - تطبيق `--gradient-background` كخلفية
    - تطبيق `--gradient-primary` على عناصر النموذج
    - _المتطلبات: 3.1, 3.2_
  
  - [x] 3.2 تحديث لوحة الإدارة (AdminDashboard)
    - تعديل ملف `client/frontend/src/pages/Admin/AdminDashboard.module.css`
    - تطبيق نفس `--gradient-background` المستخدم في Login
    - تحديث ألوان البطاقات لاستخدام `--glass-bg` و `--glass-border`
    - _المتطلبات: 3.2, 3.3, 3.4, 3.5_

- [x] 4. إضافة ميزة استرجاع كود الطالب
  - [x] 4.1 إنشاء مكون ForgotCodeModal
    - إنشاء ملف `client/frontend/src/components/ForgotCodeModal/ForgotCodeModal.jsx`
    - إنشاء ملف `client/frontend/src/components/ForgotCodeModal/ForgotCodeModal.module.css`
    - تطبيق نظام الألوان الموحد على المكون
    - إضافة validation للرقم القومي (14 رقم بالضبط)
    - _المتطلبات: 4.2, 4.3, 4.5, 4.7_
  
  - [x] 4.2 إضافة API endpoint لاسترجاع كود الطالب
    - إضافة route في `server/routes/authRoutes.js`: `POST /api/auth/retrieve-student-code`
    - إنشاء controller function في `server/controllers/authController.js`
    - البحث عن الطالب باستخدام `national_id`
    - إرجاع `student_code` إذا وجد، أو خطأ 404 إذا لم يوجد
    - تسجيل محاولات الاسترجاع في سجل النظام
    - _المتطلبات: 4.3, 4.4, 4.6_
  
  - [x] 4.3 دمج ForgotCodeModal في صفحة تسجيل الدخول
    - تعديل `client/frontend/src/pages/Login/Login.jsx`
    - إضافة رابط "نسيت كود الطالب؟" أسفل حقول تسجيل الدخول
    - ربط الرابط بفتح ForgotCodeModal
    - _المتطلبات: 4.1, 4.2_

- [x] 5. Checkpoint - التحقق من نظام الألوان الموحد
  - التأكد من تطبيق النظام البنفسجي على جميع الصفحات
  - اختبار ميزة استرجاع كود الطالب
  - التأكد من عدم وجود أخطاء في console

- [x] 6. إضافة صفحة بيانات الطالب
  - [ ] 6.1 إنشاء صفحة StudentDataPage
    - إنشاء ملف `client/frontend/src/pages/Student/StudentDataPage.jsx`
    - إنشاء ملف `client/frontend/src/pages/Student/StudentDataPage.module.css`
    - عرض Payment_Status (مدفوع/غير مدفوع) مع status badges
    - عرض Result_Status (ظهرت النتيجة/لم تظهر)
    - عرض تاريخ آخر تحديث
    - تطبيق نظام الألوان الموحد
    - _المتطلبات: 5.2, 5.3, 5.4, 5.7, 5.8_
  
  - [ ] 6.2 إضافة API endpoint لبيانات الطالب
    - إضافة route في `server/routes/studentRoutes.js`: `GET /api/student/data`
    - إنشاء controller function في `server/controllers/studentController.js`
    - جلب بيانات الدفع من FeeInvoice model
    - حساب `total_due` و `payment_status`
    - جلب عدد الدرجات المنشورة
    - تحديد `result_status` بناءً على وجود درجات منشورة
    - _المتطلبات: 5.2, 5.3, 5.4, 5.6_
  
  - [ ] 6.3 تحديث Navbar لإضافة رابط "بياناتي"
    - تعديل `client/frontend/src/components/navComponent/Navbar.jsx`
    - إضافة رابط "بياناتي" للطلاب فقط (`user?.role === 'student'`)
    - إخفاء الرابط للمستخدمين غير المسجلين
    - إضافة route في `client/frontend/src/App.jsx` للصفحة الجديدة
    - _المتطلبات: 5.1, 5.2, 5.5_

- [ ] 7. تحسين منطق عرض الدرجات للطلاب
  - [x] 7.1 إضافة حقول النشر إلى Grade Model
    - إنشاء migration file في `server/migrations/`
    - إضافة حقل `is_published` (BOOLEAN, default: false)
    - إضافة حقل `published_at` (DATE, nullable)
    - إضافة حقل `published_by` (INTEGER, foreign key to users)
    - تحديث `server/models/Grade.js` بالحقول الجديدة
    - _المتطلبات: 5.3, 5.4_
  
  - [x] 7.2 تحديث API endpoint لجلب درجات الطالب
    - تعديل `server/controllers/gradeController.js` في function `getStudentGradesConditional`
    - إضافة شرط `is_published: true` في الـ query
    - إضافة شرط `admin_approved_by: { [Op.ne]: null }`
    - التأكد من التحقق من حالة الدفع قبل إرجاع الدرجات
    - _المتطلبات: 5.3, 5.4, 5.6_

- [x] 8. التحقق من مسارات بطاقات التخصصات
  - [x] 8.1 مراجعة بطاقات التخصصات في AdminDashboard
    - فتح ملف `client/frontend/src/pages/Admin/AdminDashboard.jsx`
    - التحقق من وجود 6 بطاقات تخصص: MCT, AUT, ICT, PRO, OIL, REN
    - التحقق من صحة المسارات (paths) لكل بطاقة
    - _المتطلبات: 6.1, 6.2_
  
  - [x] 8.2 التحقق من صفحات التخصصات
    - التأكد من عرض 4 سنوات دراسية لكل تخصص
    - التحقق من عرض مسارين في السنة الثالثة لتخصص ICT (Network و Software)
    - _المتطلبات: 6.3, 6.4_
  
  - [x] 8.3 تطبيق نظام الألوان الموحد على بطاقات التخصصات
    - تحديث `client/frontend/src/pages/Admin/AdminDashboard.module.css`
    - تطبيق `--glass-bg` و `--glass-border` على البطاقات
    - إضافة hover effect بلون `--purple-light`
    - _المتطلبات: 6.5, 6.7, 6.8_

- [x] 9. إضافة بطاقة عرض النتائج في لوحة الإدارة
  - [x] 9.1 إضافة بطاقة Results Display في AdminDashboard
    - تعديل `client/frontend/src/pages/Admin/AdminDashboard.jsx`
    - إضافة بطاقة جديدة في `managementCards` array
    - استخدام أيقونة 📊 أو 📈
    - إضافة badge لعرض عدد النتائج المعلقة
    - تطبيق نظام الألوان الموحد
    - _المتطلبات: 7.1, 7.2, 7.6, 7.7_
  
  - [x] 9.2 إنشاء صفحة Results Display
    - إنشاء ملف `client/frontend/src/pages/Admin/ResultsDisplay.jsx`
    - إنشاء ملف `client/frontend/src/pages/Admin/ResultsDisplay.module.css`
    - إضافة خيارات لنشر النتائج حسب الفصل الدراسي
    - إضافة خيارات لنشر النتائج حسب السنة الدراسية
    - تطبيق نظام الألوان الموحد
    - _المتطلبات: 7.3, 7.4, 7.5_
  
  - [x] 9.3 إضافة API endpoints لنشر النتائج
    - إضافة route في `server/routes/adminRoutes.js`: `POST /api/admin/publish-results`
    - إنشاء controller function في `server/controllers/adminController.js`
    - تحديث حقل `is_published` للدرجات المحددة
    - تسجيل `published_by` و `published_at`
    - إرسال إشعارات للطلاب عند نشر النتائج
    - _المتطلبات: 7.3, 7.4, 7.5, 7.8_

- [x] 10. اختبار وظائف لوحة المحاسب
  - [x] 10.1 اختبار صفحة إدارة الطلاب
    - فتح `http://localhost:5173/admin/students` كمحاسب
    - التحقق من عرض قائمة الطلاب بشكل صحيح
    - اختبار وظيفة البحث عن طالب (يجب أن تعمل خلال 2 ثانية)
    - _المتطلبات: 1.1, 1.4_
  
  - [x] 10.2 اختبار وظائف لوحة المحاسب
    - اختبار جميع الوظائف في Accountant Dashboard
    - التحقق من عرض الإحصائيات المالية بشكل صحيح
    - التحقق من حفظ التغييرات في قاعدة البيانات
    - _المتطلبات: 1.2, 1.3, 1.5_

- [x] 11. Checkpoint النهائي - اختبار شامل
  - اختبار جميع الصفحات للتأكد من تطبيق نظام الألوان الموحد
  - اختبار ميزة استرجاع كود الطالب بأرقام قومية مختلفة
  - اختبار صفحة بيانات الطالب مع حالات دفع مختلفة
  - اختبار مسارات بطاقات التخصصات
  - اختبار نشر النتائج والتحقق من ظهورها للطلاب
  - التأكد من عدم وجود أخطاء في console
  - سؤال المستخدم إذا كانت هناك أي استفسارات

## ملاحظات

- جميع المهام تركز على تعديل المكونات الموجودة وليس إنشاء مكونات جديدة (ما عدا المكونات الجديدة المحددة)
- نظام الألوان الموحد يجب أن يطبق بشكل متسق عبر جميع المكونات
- يجب الحفاظ على البنية الحالية للنظام مع إضافة تحسينات تدريجية
- التخصصات الستة: MCT, AUT, ICT, PRO, OIL, REN
- تخصص ICT له مساران في السنة الثالثة: Network و Software
- منطق عرض الدرجات: المصروفات مدفوعة + الدرجة معتمدة + الدرجة منشورة
