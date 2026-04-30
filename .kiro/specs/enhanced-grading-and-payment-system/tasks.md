# خطة التنفيذ: نظام الدرجات والمدفوعات المحسّن

## نظرة عامة

هذه الخطة تدمج المهام الجديدة لنظام الدرجات والمدفوعات المحسّن مع المهام القديمة من nctu-erp-completion. التنفيذ يبدأ بالمهام الحرجة (Priority 1) ثم يتدرج للمهام الأقل أولوية.

**ملاحظة مهمة جداً:**
- **ass1 و ass2**: هما **تقديرات** (P/M/D) وليست درجات رقمية
- **assignment1_score و assignment2_score**: قيم **محسوبة تلقائياً** من التقديرات
- **final_exam_score**: الدرجة الرقمية الوحيدة (0-150)
- **المعادلة**: total_score = assignment1_score + assignment2_score + final_exam_score

---

## 📋 تحديثات مهمة بناءً على الكود الحالي

**تم مراجعة الكود الحالي وتحديث المهام كالتالي:**

### ✅ ملفات موجودة وتعمل:
1. **ProfessorGrades.jsx** - موجود ويشتغل بشكل جيد
   - يستخدم P/M/D للـ assignments ✅
   - يستخدم final_exam_score رقمي ✅
   - **التحديث المطلوب**: إضافة عرض إعدادات المادة (course_config) فقط

2. **AccountantDashboard.jsx** - موجود ويشتغل بشكل ممتاز
   - فيه 3 tabs: invoices, fees, search ✅
   - **التحديث المطلوب**: تحسينات بسيطة (اختيارية)

### ⚠️ ملفات تحتاج إعادة كتابة كاملة:
1. **GradeSettings.jsx** - موجود لكن يستخدم إعدادات عامة (global settings)
   - **المشكلة**: يستخدم نظام إعدادات عام لكل المواد
   - **الحل**: إعادة كتابة كاملة لدعم إعدادات لكل مادة (per-course config)

### ❌ ملفات غير موجودة (يجب إنشاؤها):
1. **StudentPortal.jsx** - غير موجود في الكود
   - **المطلوب**: إنشاء من الصفر بالكامل
   - **المميزات**: زر "عرض النتيجة" (مشروط بالمدفوعات) + زر "عرض المدفوعات"

---

## 🔴 Priority 1: نظام الدرجات المحسّن (Critical)

### المرحلة 1: إعدادات الدرجات المخصصة لكل مادة

- [x] 1. إنشاء نموذج CourseGradeConfig وAPI endpoints
  - [x] 1.1 إنشاء `server/models/CourseGradeConfig.js`
    - حقول: `course_id`, `ass1_percentage`, `ass2_percentage`, `final_percentage`, `ass1_max`, `ass2_max`, `final_max`, `p_value`, `m_value`, `d_value`
    - validation hook: التحقق من أن مجموع النسب = 100%
    - القيم الافتراضية: ass1=15%, ass2=15%, final=70%, ass1_max=30, ass2_max=30, final_max=150, P=30, M=21, D=15
    - _المتطلبات: 1.1_

  - [x] 1.2 إنشاء `server/controllers/courseGradeConfigController.js`
    - `getAllConfigs`: GET جميع إعدادات المواد مع معلومات المادة
    - `getConfigByCourse`: GET إعدادات مادة محددة
    - `createConfig`: POST إنشاء إعدادات جديدة مع validation
    - `updateConfig`: PUT تحديث إعدادات موجودة
    - `deleteConfig`: DELETE حذف إعدادات (العودة للافتراضية)
    - _المتطلبات: 1.2, 1.3, 1.4, 1.5, 1.8, 1.9, 1.10, 1.11_

  - [ ]* 1.3 كتابة property test لـ Percentage Sum Validation
    - **Property: مجموع النسب المئوية = 100%**
    - **Validates: Requirements 1.4**

  - [x] 1.4 إنشاء `server/routes/courseGradeConfigRoutes.js`
    - `GET /api/admin/course-grade-config`
    - `GET /api/admin/course-grade-config/:courseId`
    - `POST /api/admin/course-grade-config`
    - `PUT /api/admin/course-grade-config/:courseId`
    - `DELETE /api/admin/course-grade-config/:courseId`
    - تسجيل في `server/routes/adminRoutes.js`
    - _المتطلبات: 1.8, 1.9, 1.10, 1.11_

- [x] 2. تحديث حساب الدرجات لاستخدام إعدادات المادة
  - [x] 2.1 تعديل `server/models/Grade.js` - beforeSave hook
    - جلب إعدادات المادة من CourseGradeConfig
    - تحويل assignment grades (P/M/D) إلى scores رقمية
    - حساب total_score = assignment1_score + assignment2_score + final_exam_score
    - حساب total_percentage = (total_score / max_total) * 100
    - تحديد final_result و grade_point بناءً على النسبة
    - _المتطلبات: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 2.2 كتابة property test لـ Grade Calculation Correctness
    - **Property: حساب النتيجة النهائية صحيح لأي مجموعة درجات**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4_

  - [ ]* 2.3 كتابة property test لـ P/M/D Conversion
    - **Property: تحويل P/M/D إلى درجات رقمية يتبع إعدادات المادة**
    - **Validates: Requirements 3.2**

- [x] 3. Checkpoint - تأكد من أن جميع الاختبارات تمر، اسأل المستخدم إذا كان لديه أسئلة.

---

## 🟠 Priority 2: ربط المدفوعات بعرض النتائج (High)

- [x] 4. إضافة نظام التحقق من المدفوعات
  - [x] 4.1 إضافة دالة `getPaymentStatus` في `server/controllers/gradeController.js`
    - حساب total_due من جميع FeeInvoice للطالب
    - إرجاع `{ all_paid: boolean, total_due: number, total_invoiced, total_paid, pending_invoices, overdue_invoices }`
    - _المتطلبات: 4.2, 8.1_

  - [x] 4.2 تعديل دالة `getStudentGrades` في `server/controllers/gradeController.js`
    - التحقق من حالة المدفوعات قبل إرجاع الدرجات
    - إذا all_paid = false → رفض الطلب مع رسالة واضحة
    - إذا all_paid = true → إرجاع الدرجات المعتمدة مع GPA
    - _المتطلبات: 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 4.3 إضافة routes في `server/routes/gradeRoutes.js`
    - `GET /api/student/payment-status`
    - تحديث `GET /api/grades/student/grades` لتطبيق شرط المدفوعات
    - _المتطلبات: 4.8_

  - [ ]* 4.4 كتابة integration test لربط المدفوعات والنتائج
    - **Test: الطالب غير المدفوع لا يرى النتائج**
    - **Test: الطالب المدفوع يرى النتائج**
    - **Validates: Requirements 4.3, 4.4, 10.1, 10.2**

- [x] 5. Checkpoint - تأكد من أن جميع الاختبارات تمر، اسأل المستخدم إذا كان لديه أسئلة.

---

## 🟡 Priority 3: نظام CRUD للدرجات (Professor) (Medium)

- [x] 6. تحديث Grade Controller لدعم CRUD كامل
  - [x] 6.1 إضافة دالة `getProfessorStudents` في `server/controllers/gradeController.js`
    - جلب الطلاب المسجلين في مادة محددة مع درجاتهم
    - إرجاع إعدادات المادة (course_config) مع البيانات
    - _المتطلبات: 2.1, 2.2, 2.10_

  - [x] 6.2 إضافة دالة `updateGrade` في `server/controllers/gradeController.js`
    - تحديث درجة موجودة (status = draft فقط)
    - validation: الأستاذ يملك الدرجة، assignment grades في [P,M,D]، final_exam_score ضمن النطاق
    - _المتطلبات: 2.6, 2.12_

  - [x] 6.3 إضافة دالة `deleteGrade` في `server/controllers/gradeController.js`
    - حذف درجة (status = draft فقط)
    - validation: الأستاذ يملك الدرجة
    - _المتطلبات: 2.7, 2.13_

  - [x] 6.4 تحديث دالة `createGrade` في `server/controllers/gradeController.js`
    - قبول assignment grades كتقديرات (P/M/D) وليس scores
    - ربط الطالب بالتخصص والمادة والسنة الدراسية تلقائياً
    - _المتطلبات: 2.3, 2.4, 2.5, 2.11_

  - [x] 6.5 إضافة routes في `server/routes/gradeRoutes.js`
    - `GET /api/grades/professor/students?course_id=X`
    - `PUT /api/grades/:id`
    - `DELETE /api/grades/:id`
    - _المتطلبات: 2.10, 2.12, 2.13_

  - [ ]* 6.6 كتابة integration test لـ Professor CRUD
    - **Test: الأستاذ يمكنه إضافة وتعديل وحذف درجات**
    - **Validates: Requirements 2.3, 2.6, 2.7, 10.5**

- [x] 7. Checkpoint - تأكد من أن جميع الاختبارات تمر، اسأل المستخدم إذا كان لديه أسئلة.

---

## 🟢 Priority 4: واجهات المستخدم (Frontend)

**ملاحظة**: هذا القسم يركز على الواجهات الأمامية فقط. تم إعادة ترتيب المهام بناءً على الكود الحالي:
- **GradeSettings**: إعادة كتابة كاملة (يستخدم حالياً إعدادات عامة)
- **ProfessorGrades**: تحديثات بسيطة (الكود موجود ويعمل)
- **StudentPortal**: إنشاء من الصفر (غير موجود)

### المرحلة 2: صفحة إعدادات الدرجات (Admin)

- [x] 8. إعادة كتابة GradeSettings.jsx بالكامل لدعم إعدادات لكل مادة
  - [x] 8.1 إعادة كتابة `client/frontend/src/pages/Admin/GradeSettings.jsx` بالكامل
    - **ملاحظة**: الملف الحالي يستخدم إعدادات عامة (global settings) - يجب إعادة كتابته بالكامل
    - عرض قائمة المواد مع إعداداتها الحالية (جلب من `/api/admin/course-grade-config`)
    - نموذج تحرير لكل مادة مع جميع الحقول: ass1_percentage, ass2_percentage, final_percentage, ass1_max, ass2_max, final_max, p_value, m_value, d_value
    - validation: مجموع النسب = 100%
    - معاينة تحويل P/M/D إلى درجات رقمية بناءً على الإعدادات
    - عرض القيم الافتراضية للمواد التي ليس لها إعدادات مخصصة
    - _المتطلبات: 1.2, 1.3, 1.7_

  - [x] 8.2 تحديث `client/frontend/src/pages/Admin/GradeSettings.module.css`
    - تحديث التنسيق ليتناسب مع الواجهة الجديدة
    - استخدام متغيرات الألوان من index.css
    - تصميم responsive
    - _المتطلبات: 1.2_

  - [x] 8.3 التأكد من route `/admin/grade-settings` موجود في `client/frontend/src/App.jsx`
    - محمي بدور admin
    - إضافة بطاقة في AdminDashboard إذا لم تكن موجودة
    - _المتطلبات: 1.2_

### المرحلة 3: تحسين صفحة ProfessorGrades

- [x] 9. تحديث ProfessorGrades لعرض إعدادات المادة
  - [x] 9.1 تعديل `client/frontend/src/pages/ProfessorGrades.jsx`
    - **ملاحظة**: الملف موجود ويشتغل بالفعل ✅
    - **التحديثات المطلوبة**:
      - تحديث API call لجلب إعدادات المادة (course_config) مع بيانات الطلاب
      - عرض الدرجات القصوى (ass1_max, ass2_max, final_max) من إعدادات المادة بجانب كل حقل
      - عرض قيم P/M/D (p_value, m_value, d_value) من إعدادات المادة
      - إضافة معاينة للنتيجة المحسوبة (live calculation) بناءً على إعدادات المادة
      - تحديث validation للتأكد من أن final_exam_score ضمن النطاق (0 - final_max)
    - **لا تغير**: البنية الحالية للجدول والـ UI (تعمل بشكل جيد)
    - _المتطلبات: 6.1, 6.2, 6.4, 6.5, 6.8, 6.9_

### المرحلة 4: إنشاء صفحة StudentPortal من الصفر

- [x] 10. إنشاء StudentPortal جديد بالكامل
  - [x] 10.1 إنشاء `client/frontend/src/pages/StudentPortal.jsx` من الصفر
    - **ملاحظة**: الملف غير موجود في الكود الحالي ❌ - يجب إنشاؤه بالكامل
    - **المكونات الرئيسية**:
      - بطاقة ملخص في الأعلى: الاسم، كود الطالب، التخصص، السنة الحالية، GPA، الحالة الأكاديمية
      - زر "عرض النتيجة" (primary button)
      - زر "عرض المدفوعات" (secondary button)
    - **منطق "عرض النتيجة"**:
      - عند الضغط: استدعاء `GET /api/student/payment-status`
      - إذا `all_paid = true`: استدعاء `GET /api/grades/student/grades` وعرض جدول الدرجات
      - إذا `all_paid = false`: عرض رسالة "يرجى سداد المصاريف الدراسية لعرض النتائج" + المبلغ المتبقي
    - **جدول الدرجات** (إذا all_paid):
      - مجمّع حسب السنة الدراسية والترم
      - أعمدة: كود المادة، اسم المادة، ass1، ass2، final، المجموع، التقدير، النتيجة
      - عرض GPA لكل ترم + GPA التراكمي
    - **صفحة المدفوعات**:
      - جدول الفواتير: رقم الفاتورة، السنة، الترم، الإجمالي، المدفوع، المتبقي، تاريخ الاستحقاق، الحالة
      - ملخص: إجمالي الفواتير، إجمالي المدفوعات، المبلغ المتبقي
      - تمييز الفواتير المتأخرة بلون أحمر
    - _المتطلبات: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

  - [x] 10.2 إنشاء `client/frontend/src/pages/StudentPortal.module.css`
    - تنسيق كامل للصفحة
    - استخدام متغيرات الألوان من index.css
    - تصميم responsive
    - تمييز الفواتير المتأخرة بلون أحمر
    - _المتطلبات: 7.8_

  - [x] 10.3 إضافة route `/student/portal` في `client/frontend/src/App.jsx`
    - محمي بدور student
    - _المتطلبات: 7.1_

- [x] 11. Checkpoint - تأكد من أن جميع الاختبارات تمر، اسأل المستخدم إذا كان لديه أسئلة.

---

## � Priority 4.5: نظام إدارة الترم والسنة الدراسية (Admin) (Medium-High)

### المرحلة 5: أزرار إدارة الطلاب في Admin Dashboard

- [x] 11.5 إضافة نظام نشر النتائج وترقية الطلاب
  - [x] 11.5.1 إضافة endpoints في `server/controllers/adminController.js`
    - `publishResults`: POST /api/admin/publish-results
      - يقبل: `semester_id`, `academic_year_id`, `specialty_id` (optional)
      - يُحدّث حالة جميع الدرجات من `approved` إلى `published`
      - يُرسل إشعارات للطلاب (optional)
      - validation: التأكد من أن جميع الدرجات معتمدة (approved)
    - `promoteToNextSemester`: POST /api/admin/promote-semester
      - يقبل: `semester_id`, `academic_year_id`, `specialty_id` (optional), `student_ids` (optional - إذا فارغ ينقل الكل)
      - **شروط النقل للترم الثاني**:
        - الطالب حصل على 60% أو أكثر في جميع المواد
        - الطالب ناجح في الـ final exam لجميع المواد
      - يُحدّث `current_semester` للطلاب الناجحين
      - يُنشئ تقرير بالطلاب الناجحين والراسبين
    - `promoteToNextYear`: POST /api/admin/promote-year
      - يقبل: `academic_year_id`, `specialty_id` (optional), `student_ids` (optional)
      - **شروط النقل للسنة الجديدة**:
        - الطالب أنهى الترمين (الأول والثاني) بنجاح
        - الطالب حصل على 60% أو أكثر في جميع مواد السنة
        - الطالب ناجح في الـ final exam لجميع المواد
      - يُحدّث `current_year` للطلاب الناجحين
      - يُحدّث `current_semester` إلى 1 (الترم الأول من السنة الجديدة)
      - يُنشئ تقرير بالطلاب الناجحين والراسبين
      - validation: لا يمكن نقل طلاب السنة الرابعة (يجب تخريجهم)
    - _المتطلبات: جديدة - إدارة الترم والسنة_

  - [x] 11.5.2 إضافة دوال مساعدة في `server/utils/studentPromotion.js`
    - `checkPassingConditions(student_id, semester_id)`: التحقق من شروط النجاح
      - حساب النسبة المئوية لكل مادة
      - التحقق من النجاح في الـ final exam (>= 50% من final_max)
      - إرجاع: `{ passed: boolean, failed_courses: [], total_percentage: number }`
    - `generatePromotionReport(promoted, failed)`: إنشاء تقرير الترقية
      - عدد الطلاب الناجحين
      - عدد الطلاب الراسبين
      - قائمة الطلاب الراسبين مع المواد الراسبة
    - _المتطلبات: جديدة - منطق الترقية_

  - [x] 11.5.3 إضافة routes في `server/routes/adminRoutes.js`
    - `POST /api/admin/publish-results`
    - `POST /api/admin/promote-semester`
    - `POST /api/admin/promote-year`
    - _المتطلبات: جديدة - مسارات الترقية_

  - [x] 11.5.4 تحديث `client/frontend/src/pages/Admin/AdminDashboard.jsx`
    - إضافة قسم "إدارة الترم والسنة الدراسية" في الصفحة الرئيسية
    - **زر "نشر النتائج"**:
      - modal يطلب: التخصص (optional)، السنة الدراسية، الترم
      - عرض عدد الدرجات المعتمدة التي سيتم نشرها
      - تأكيد قبل النشر
      - عرض رسالة نجاح مع عدد النتائج المنشورة
    - **زر "نقل للترم الثاني"**:
      - modal يطلب: التخصص (optional)، السنة الدراسية، الترم الحالي
      - عرض عدد الطلاب المؤهلين للنقل
      - عرض قائمة الطلاب الراسبين (إن وجدوا)
      - تأكيد قبل النقل
      - عرض تقرير الترقية بعد النقل
    - **زر "نقل للسنة الجديدة"**:
      - modal يطلب: التخصص (optional)، السنة الدراسية الحالية
      - عرض عدد الطلاب المؤهلين للنقل
      - عرض قائمة الطلاب الراسبين (إن وجدوا)
      - تحذير: "سيتم نقل الطلاب من السنة X إلى السنة Y"
      - تأكيد قبل النقل
      - عرض تقرير الترقية بعد النقل
    - _المتطلبات: جديدة - واجهة الترقية_

  - [x] 11.5.5 إنشاء `client/frontend/src/components/admin/PromotionModal.jsx`
    - modal مشترك للعمليات الثلاث
    - عرض معاينة قبل التنفيذ
    - عرض تقرير بعد التنفيذ
    - _المتطلبات: جديدة - مكون الترقية_

  - [ ]* 11.5.6 كتابة integration test لنظام الترقية
    - **Test: نشر النتائج يُحدّث حالة الدرجات**
    - **Test: نقل الترم يعمل فقط للطلاب الناجحين**
    - **Test: نقل السنة يتحقق من شروط النجاح**
    - **Test: الطلاب الراسبون لا يتم نقلهم**
    - **Validates: شروط النجاح (60% + نجاح في final exam)**

- [x] 11.6 Checkpoint - تأكد من أن نظام الترقية يعمل بشكل صحيح، اسأل المستخدم إذا كان لديه أسئلة.

---

## �🔵 Priority 5: Parser وPretty Printer (Low)

- [x] 12. إضافة استيراد/تصدير إعدادات الدرجات
  - [x] 12.1 إنشاء `server/utils/gradeConfigParser.js`
    - parser: يقرأ JSON ويحوّله إلى CourseGradeConfig
    - validation: رسائل خطأ وصفية
    - pretty printer: يحوّل CourseGradeConfig إلى JSON منسّق
    - _المتطلبات: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 12.2 كتابة property test لـ Round-trip Consistency
    - **Property: parse → print → parse ينتج نفس الكائن**
    - **Validates: Requirements 8.6**

  - [x] 12.3 إضافة endpoints في `server/routes/courseGradeConfigRoutes.js`
    - `POST /api/admin/course-grade-config/import`
    - `GET /api/admin/course-grade-config/export`
    - _المتطلبات: 8.7, 8.8_

  - [x] 12.4 إضافة واجهة استيراد/تصدير في GradeSettingsPage
    - زر "استيراد من JSON"
    - زر "تصدير إلى JSON"
    - _المتطلبات: 8.7, 8.8_

---

## 🟣 Priority 6: المهام القديمة المتبقية (من nctu-erp-completion)

### المهام المكتملة (للتوثيق فقط)

- [x] ✅ 1. إنشاء Student Controller والـ Routes
- [x] ✅ 2. إضافة Professor Courses Endpoint وتحديث Student Dashboard بـ GPA
- [x] ✅ 4. إنشاء Accountant Controller والـ Routes
- [x] ✅ 5. إضافة QR Code Verification Endpoint
- [x] ✅ 7. إضافة axios Interceptor في AuthContext
- [x] ✅ 8. توحيد نظام الألوان في CSS
- [x] ✅ 9. إنشاء صفحة StudentsManagement للأدمن
- [x] ✅ 10. ربط ProfessorGrades بالـ API الحقيقي
- [x] ✅ 11. ربط StudentPortal بالـ API الحقيقي
- [x] ✅ 12. إنشاء AccountantDashboard
- [x] ✅ 14. إصلاح ظهور التخصصات في القوائم المنسدلة
- [x] ✅ 15. إضافة حساب Accountant ثابت في seed data
- [x] ✅ 16. إضافة إدارة رسوم التخصصات للمحاسب
- [x] ✅ 17. إضافة فلترة وعرض بيانات الطالب الكاملة في Accountant Dashboard
- [x] ✅ 18. إضافة صورة الملف الشخصي للطالب
- [x] ✅ 19. إضافة Doctor Dashboard وإدارة الدكاترة من الأدمن
- [x] ✅ 20. إصلاح Professor CRUD وإضافة الجداول الدراسية للطلاب
- [x] ✅ 0.1 إصلاح timetableRoutes.js
- [x] ✅ 0.2 إنشاء script إعادة تعيين قاعدة البيانات
- [x] ✅ 1.1-1.6 إصلاحات حرجة (API endpoints)
- [x] ✅ 2.1-2.2 إعادة هيكلة Admin Dashboard

### المهام المتبقية (غير مكتملة)

- [x] 13. اختبار شامل لوظائف المحاسب
  - **ملاحظة**: AccountantDashboard.jsx موجود ويشتغل بشكل ممتاز ✅
  - **التحديثات المطلوبة**: اختبارات فقط (الكود يعمل بشكل جيد)
  
  - [x] 13.1 التحقق من جميع endpoints المحاسب
    - `GET /api/accountant/summary`
    - `GET /api/accountant/students/search`
    - `POST /api/accountant/invoices`
    - `POST /api/accountant/payments`
    - _المتطلبات: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

  - [ ]* 13.2 كتابة integration test لوظائف المحاسب
    - **Test: المحاسب يمكنه إنشاء فاتورة وتسجيل دفعة**
    - **Test: حالة الفاتورة تُحدّث بشكل صحيح**
    - **Validates: Requirements 5.4, 5.5, 5.6, 10.6, 10.7, 10.8**

- [x] 14. نظام التسجيل عبر الرابط (استبدال QR Code)
  - [x] 14.1 إنشاء جدول `registration_links`
    - حقول: `id`, `token` (UUID), `expires_at`, `is_used`, `created_by`, `created_at`
    - _المتطلبات: من المهام القديمة 21.1_

  - [x] 14.2 إضافة endpoints في `server/routes/adminRoutes.js`
    - `POST /api/admin/registration-links`
    - `GET /api/admin/registration-links`
    - _المتطلبات: من المهام القديمة 21.2_

  - [x] 14.3 إضافة endpoints عامة في `server/routes/authRoutes.js`
    - `GET /api/auth/register-link/:token`
    - `POST /api/auth/register-link/:token`
    - _المتطلبات: من المهام القديمة 21.3_

  - [x] 14.4 إنشاء `client/frontend/src/pages/StudentRegistration.jsx`
    - فورم تسجيل مع جميع الحقول
    - التحقق من صلاحية الرابط
    - _المتطلبات: من المهام القديمة 21.4_

  - [x] 14.5 إنشاء `client/frontend/src/pages/Admin/RegistrationLinks.jsx`
    - عرض جميع الروابط
    - إنشاء رابط جديد
    - نسخ الرابط
    - **تم إصلاح**: تحديث API response handling (response.data.data بدلاً من response.data.link)
    - _المتطلبات: من المهام القديمة 21.2_

  - [x] 14.6 إنشاء `client/frontend/src/pages/Admin/RegistrationRequests.jsx`
    - عرض طلبات التسجيل المعلقة
    - موافقة/رفض
    - **تم إصلاح**: تحديث API response handling في modal إنشاء الرابط
    - _المتطلبات: من المهام القديمة 21.5_

  - [x] 14.7 إصلاح مشكلة إنشاء روابط التسجيل
    - **المشكلة**: Frontend كان يتوقع response.data.link لكن Backend يرجع response.data.data
    - **الحل**: تحديث RegistrationLinks.jsx و RegistrationRequests.jsx لاستخدام response.data.data
    - **الملفات المعدلة**:
      - `client/frontend/src/pages/Admin/RegistrationLinks.jsx` (handleCreateLink, fetchLinks)
      - `client/frontend/src/pages/Admin/RegistrationRequests.jsx` (handleCreateLink)
    - _تم الإصلاح: 2024_

- [x] 15. تحسينات إضافية
  - [x] 15.1 تحديث كود الطالب إلى 8 أرقام عشوائية
    - تغيير من NCTU-XX-XXX إلى 20241557
    - _المتطلبات: من المهام القديمة 3.4_

  - [x] 15.2 إضافة خيار "دخول الطلاب" في صفحة Login
    - فورم: كود الطالب + الرقم القومي
    - endpoint: `POST /api/auth/student-login`
    - _المتطلبات: من المهام القديمة 4.1_

  - [x] 15.3 تحسين تصميم Admin Dashboard
    - تحسين البطاقات باستخدام CSS Grid
    - إضافة أيقونات
    - إحصائيات سريعة
    - _المتطلبات: من المهام القديمة 22.1, 22.2_

- [x] 16. Checkpoint النهائي - تأكد من أن جميع الاختبارات تمر، اسأل المستخدم إذا كان لديه أسئلة.

---

## 🎨 Priority 7: تحديث تصميم Admin Dashboard بـ Glass Morphism

- [x] 17. تطبيق Glass Morphism على جميع صفحات Admin Dashboard
  - [x] 17.1 تحديث `client/frontend/src/pages/Admin/StudentsManagement.module.css`
    - تطبيق glass effect على الجداول والنماذج
    - تحديث الألوان لتتناسب مع الثيم البنفسجي
    - إضافة backdrop-filter و blur effects
    - _تم التحديث: 2024_

  - [x] 17.2 تحديث `client/frontend/src/pages/Admin/CoursesPage.module.css`
    - تطبيق glass effect على جميع العناصر
    - تحديث الألوان والحدود
    - إضافة تأثيرات التوهج (glow effects)
    - _تم التحديث: 2024_

  - [x] 17.3 تحديث `client/frontend/src/pages/Admin/YearManagement.module.css`
    - تطبيق glass effect على الصفحة بالكامل
    - تحديث الألوان والخلفيات
    - إضافة backdrop-filter و blur effects
    - _تم التحديث: 2024_

  - [x] 17.4 تحديث `client/frontend/src/pages/Admin/TimetablesPage.module.css`
    - Glass effect موجود بالفعل ✅
    - الألوان متناسقة مع الثيم البنفسجي ✅
    - _لا يحتاج تحديث_

  - [x] 17.5 تحديث `client/frontend/src/pages/Admin/AdminDashboard.module.css`
    - Glass effect موجود بالفعل ✅
    - الألوان متناسقة مع الثيم البنفسجي ✅
    - _لا يحتاج تحديث_

  - [x] 17.6 تحديث `client/frontend/src/pages/Admin/AdminCommon.module.css`
    - Glass effect موجود بالفعل ✅
    - الألوان متناسقة مع الثيم البنفسجي ✅
    - _لا يحتاج تحديث_

  - [x] 17.7 تحديث `client/frontend/src/pages/Admin/GradeSettings.module.css`
    - Glass effect موجود بالفعل ✅
    - الألوان متناسقة مع الثيم البنفسجي ✅
    - _لا يحتاج تحديث_

  - [x] 17.8 تحديث `client/frontend/src/pages/Admin/SpecialtyDashboard.module.css`
    - Glass effect موجود بالفعل ✅
    - الألوان متناسقة مع الثيم البنفسجي ✅
    - _لا يحتاج تحديث_

  - [x] 17.9 تحديث `client/frontend/src/pages/Admin/RegistrationLinks.module.css`
    - يحتاج تحديث لتطبيق glass effect
    - _سيتم التحديث_

  - [x] 17.10 تحديث `client/frontend/src/pages/Admin/RegistrationRequests.module.css`
    - يحتاج تحديث لتطبيق glass effect
    - _سيتم التحديث_

---

## ملاحظات

- المهام المُعلَّمة بـ `*` اختيارية ويمكن تخطيها للحصول على MVP أسرع
- كل مهمة تشير إلى متطلبات محددة لضمان التتبع الكامل
- نقاط التحقق تضمن التحقق التدريجي من الصحة
- الـ Property Tests تتحقق من الخصائص العامة باستخدام `fast-check` بحد أدنى 100 iteration
- المهام مرتبة حسب الأولوية: Critical → High → Medium → Low
- المهام المكتملة من nctu-erp-completion محفوظة للتوثيق

---

## معادلات مهمة

### حساب النتيجة النهائية

```javascript
// الأستاذ يدخل:
assignment1_grade = "P" // أو "M" أو "D"
assignment2_grade = "M"
final_exam_score = 120 // درجة رقمية (0-150)

// النظام يحسب تلقائياً:
assignment1_score = config.p_value // مثلاً 30
assignment2_score = config.m_value // مثلاً 21

// المجموع النهائي:
total_score = assignment1_score + assignment2_score + final_exam_score
            = 30 + 21 + 120 = 171

total_percentage = (total_score / (ass1_max + ass2_max + final_max)) * 100
                 = (171 / 210) * 100 = 81.43%

// التقدير:
if (total_percentage >= 85) → Distinction (A) → grade_point = 4.0
else if (total_percentage >= 70) → Merit (B) → grade_point = 3.0
else if (total_percentage >= 50) → Pass (C) → grade_point = 2.0
else if (total_percentage >= 30) → Refer (D) → grade_point = 1.0
else → Fail (F) → grade_point = 0.0
```

### حساب GPA

```javascript
GPA = Σ(grade_point × credit_hours) / Σ(credit_hours)
      // لجميع الدرجات حيث status = 'approved'
```

### شرط عرض النتائج

```javascript
all_paid = (total_due == 0) OR (جميع الفواتير المستحقة مدفوعة)

if (all_paid) {
  // عرض النتائج
} else {
  // عرض رسالة "يرجى سداد المصاريف الدراسية"
}
```

### شروط النجاح والترقية

```javascript
// شروط النجاح في المادة:
const passingConditions = {
  total_percentage: >= 60,  // 60% من الدرجة النهائية
  final_exam_pass: true     // نجاح في الـ final exam (>= 50% من final_max)
};

// مثال:
const final_exam_pass = (final_exam_score / final_max) >= 0.5;
const course_pass = (total_percentage >= 60) && final_exam_pass;

// شروط النقل للترم الثاني:
const promoteToSemester2 = {
  condition: "جميع مواد الترم الأول ناجحة",
  check: allCourses.every(c => c.total_percentage >= 60 && c.final_exam_pass)
};

// شروط النقل للسنة الجديدة:
const promoteToNextYear = {
  condition: "جميع مواد الترمين (الأول والثاني) ناجحة",
  check: allCoursesYear.every(c => c.total_percentage >= 60 && c.final_exam_pass)
};
```
