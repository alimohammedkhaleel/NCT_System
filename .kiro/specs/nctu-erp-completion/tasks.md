# خطة التنفيذ: إكمال نظام NCTU ERP

## نظرة عامة

تنفيذ تدريجي يبدأ بـ Backend (controllers + routes) ثم Frontend (ربط API + صفحات جديدة + توحيد الألوان). كل مهمة تبني على السابقة وتنتهي بتوصيل جميع المكونات معاً.

---

## 🎨 المهام ذات الأولوية العالية (HIGH PRIORITY)

### ⭐ 0. توحيد نظام الألوان البنفسجية وإضافة Animations إبداعية

**الأولوية:** 🔴 عالية جداً (HIGH)  
**الحالة:** [ ] لم يبدأ

#### 0.1 توحيد نظام الألوان في المشروع بالكامل

**الهدف:** تطبيق نظام ألوان بنفسجي موحد على جميع صفحات المشروع

**نظام الألوان الإلزامي (لا تغيير فيه):**
```css
:root {
  --purple-primary: #b36eff;           /* اللون الرئيسي */
  --purple-dark: #9448b5;              /* البنفسجي الغامق */
  --purple-light: #b388ff;             /* البنفسجي الفاتح */
  --purple-deep: #7e39b6;              /* البنفسجي العميق */
  --purple-very-dark: #110117;         /* خلفية داكنة جداً */
  --white: #ffffff;                     /* النصوص البيضاء */
  --white-dim: rgba(255,255,255,0.8);  /* نص أبيض شفاف */
  --purple-transparent: rgba(179,110,255,0.1); /* خلفية شفافة */
  --glow-purple: rgba(179,110,255,0.6); /* توهج */
  --border-purple: #b36eff;            /* الحدود */
}
```

**المهام الفرعية:**

- [ ] 0.1.1 تحديث `client/frontend/src/index.css` بنظام الألوان الجديد
  - إضافة جميع متغيرات الألوان في `:root`
  - استبدال المتغيرات القديمة (`--primary-color`, `--secondary-color`) بالجديدة
  - تطبيق `--purple-very-dark` كخلفية رئيسية للـ body

- [ ] 0.1.2 تحديث جميع ملفات CSS في المشروع
  - استبدال أي ألوان مضمّنة (hex codes) بالمتغيرات الجديدة
  - الملفات المستهدفة:
    - `client/frontend/src/App.css`
    - `client/frontend/src/pages/**/*.css`
    - `client/frontend/src/pages/**/*.module.css`
    - `client/frontend/src/components/**/*.css`
    - `client/frontend/src/components/**/*.module.css`

- [ ] 0.1.3 تحديث الألوان في JSX inline styles
  - البحث عن `style={{` في جميع ملفات `.jsx`
  - استبدال الألوان المضمّنة بالمتغيرات CSS
  - استخدام `var(--purple-primary)` بدلاً من القيم المباشرة

#### 0.2 إضافة Animations إبداعية لجميع الصفحات

**الهدف:** تطبيق animations متقدمة باستخدام Framer Motion و GSAP لتحسين تجربة المستخدم

**المكتبات المطلوبة:**
```bash
npm install framer-motion gsap
```

**المهام الفرعية:**

- [ ] 0.2.1 إنشاء مكونات Animation قابلة لإعادة الاستخدام
  - إنشاء مجلد `client/frontend/src/components/animations/`
  - إنشاء المكونات التالية:
    - `ClickSpark.jsx` - شرر بنفسجي عند النقر
    - `TrueFocus.jsx` - إطار متحرك حول النص
    - `ScrollVelocity.jsx` - نص يتحرك أفقياً
    - `BounceCards.jsx` - بطاقات بتأثير elastic bounce
    - `FallingText.jsx` - كلمات تتساقط بفيزياء
    - `GooeyNav.jsx` - شريط تنقل بتأثير gooey
    - `SplashCursor.jsx` - تأثير سائل خلف الماوس
    - `InfiniteMenu.jsx` - قائمة كروية ثلاثية الأبعاد

- [ ] 0.2.2 تطبيق Animations على Admin Dashboard
  - `client/frontend/src/pages/Admin/AdminDashboard.jsx`:
    - إضافة `ClickSpark` كطبقة overlay
    - تطبيق `BounceCards` على بطاقات التخصصات الستة
    - إضافة `ScrollVelocity` في الـ footer
    - تأثير fade-in متتابع للبطاقات عند التحميل

- [ ] 0.2.3 تطبيق Animations على Student Portal
  - `client/frontend/src/pages/StudentPortal.jsx`:
    - إضافة `SplashCursor` كخلفية تفاعلية
    - تطبيق `TrueFocus` على اسم الطالب
    - تأثير slide-in للتبويبات
    - تأثير hover متقدم على البطاقات

- [ ] 0.2.4 تطبيق Animations على Professor Grades
  - `client/frontend/src/pages/ProfessorGrades.jsx`:
    - إضافة `ClickSpark` على الجدول
    - تأثير scale-up عند hover على الصفوف
    - تأثير glow على الأزرار
    - animation للنماذج عند الفتح/الإغلاق

- [ ] 0.2.5 تطبيق Animations على Accountant Dashboard
  - `client/frontend/src/pages/AccountantDashboard.jsx`:
    - إضافة `BounceCards` على بطاقات الإحصائيات
    - تأثير slide-in للنماذج
    - تأثير pulse على الفواتير المتأخرة
    - animation للجداول عند التحميل

- [ ] 0.2.6 استبدال Navbar بـ GooeyNav
  - `client/frontend/src/components/navComponent/Navbar.jsx`:
    - استبدال الـ navbar الحالي بـ `GooeyNav`
    - إضافة جسيمات بنفسجية عند التبديل بين الصفحات
    - تأثير gooey على الروابط
    - دعم React Router

- [ ] 0.2.7 إضافة خلفية تفاعلية عامة
  - تطبيق `SplashCursor` كخلفية عامة في `App.jsx`
  - `z-index` منخفض لعدم التداخل مع المحتوى
  - `pointer-events: none` للسماح بالنقر على العناصر

#### 0.3 إنشاء MotionProvider مركزي

**الهدف:** توحيد إعدادات الحركة وإعادة استخدام المتغيرات

- [ ] 0.3.1 إنشاء `client/frontend/src/context/MotionContext.jsx`
  - تعريف `springTransition` موحد
  - تعريف `staggerContainer` للحركات المتتابعة
  - تعريف `fadeInUp`, `fadeInLeft`, `fadeInRight`
  - تصدير جميع المتغيرات للاستخدام في المكونات

- [ ] 0.3.2 لف التطبيق بـ MotionProvider
  - تحديث `client/frontend/src/App.jsx`
  - إضافة `<MotionConfig>` من Framer Motion
  - تطبيق الإعدادات العامة

#### 0.4 اختبار وتحسين الأداء

- [ ] 0.4.1 اختبار جميع الـ animations على الأجهزة المختلفة
  - Desktop (Chrome, Firefox, Edge)
  - Mobile (iOS Safari, Android Chrome)
  - Tablet

- [ ] 0.4.2 تحسين الأداء
  - استخدام `will-change` للعناصر المتحركة
  - تطبيق `transform` و `opacity` فقط للحركات
  - تجنب `layout` animations الثقيلة
  - استخدام `useReducedMotion` لدعم accessibility

- [ ] 0.4.3 التأكد من عدم التعارض بين المكتبات
  - Framer Motion + GSAP يعملان معاً
  - لا توجد memory leaks
  - cleanup functions في useEffect

#### 0.5 التوثيق

- [ ] 0.5.1 إنشاء `ANIMATIONS_GUIDE.md`
  - شرح كل animation component
  - أمثلة على الاستخدام
  - best practices
  - troubleshooting

- [ ] 0.5.2 إنشاء `COLOR_SYSTEM.md`
  - شرح نظام الألوان
  - متى تستخدم كل لون
  - أمثلة على التدرجات
  - accessibility guidelines

**المتطلبات:**
- جميع الألوان يجب أن تكون من نظام الألوان البنفسجي المحدد
- جميع الـ animations يجب أن تعمل بسلاسة (60fps)
- دعم كامل للـ responsive design
- دعم accessibility (reduced motion)
- لا تعارضات بين Framer Motion و GSAP
- الحفاظ على الوظائف الحالية للمكونات

**ملاحظات:**
- هذه المهمة ذات أولوية عالية لتحسين تجربة المستخدم
- يجب إكمالها قبل إطلاق النسخة النهائية
- التركيز على الجودة والأداء
- الاختبار الشامل مطلوب

---

## المهام

- [x] 1. إنشاء Student Controller والـ Routes
  - [x] 1.1 إنشاء `server/controllers/studentController.js` مع الدوال: `getAllStudents`, `createStudent`, `updateStudent`, `promoteStudent`
    - `getAllStudents`: يدعم query params `search` (يبحث في student_code و national_id و full_name)، `specialty_id`، `current_year`، `academic_status` — يُعيد بيانات الطالب مع User و Specialty
    - `createStudent`: transaction يُنشئ User بدور `student` ثم Student مرتبط به — يرفض إذا كان national_id أو email مكرراً
    - `updateStudent`: يُحدّث حقول الطالب و User المرتبط به
    - `promoteStudent`: يقبل `promotion_type: 'semester' | 'year' | 'graduate'` — يرفض إذا كان `academic_status` هو `suspended` أو `dropped` — يرفض `year` إذا كان `current_year >= 4`
    - _المتطلبات: 2.7، 2.8، 2.9، 3.7، 3.8، 9.1، 9.2، 9.3، 9.4_

  - [ ] 1.2 كتابة property test لـ Student Creation Atomicity
    - **Property 6: Student Creation Atomicity**
    - **Validates: Requirements 2.8، 9.2**

  - [ ] 1.3 كتابة property test لـ Student Promotion State Machine
    - **Property 3: Student Promotion State Machine**
    - **Validates: Requirements 3.7، 3.8**

  - [x] 1.4 إنشاء `server/routes/studentRoutes.js` وتسجيل المسارات:
    - `GET /api/admin/students`
    - `POST /api/admin/students`
    - `PUT /api/admin/students/:id`
    - `POST /api/admin/students/:id/promote`
    - تسجيل الـ router في `server/routes/adminRoutes.js` (أو `server/server.js`)
    - _المتطلبات: 2.7، 2.8، 2.9، 3.8، 9.1–9.4_

- [x] 2. إضافة Professor Courses Endpoint وتحديث Student Dashboard بـ GPA
  - [x] 2.1 إضافة دالة `getProfessorCourses` في `server/controllers/gradeController.js`
    - تجد `ProfessorCourse` حيث `professor_id = req.professor.id` مع join لـ Course و AcademicYear و Specialty
    - تدعم query param اختياري `specialty_id`
    - _المتطلبات: 4.7، 9.5_

  - [ ] 2.2 كتابة property test لـ Professor Course Isolation
    - **Property 4: Professor Course Isolation**
    - **Validates: Requirements 4.7، 9.5**

  - [x] 2.3 تحديث دالة `getStudentDashboard` في `server/controllers/gradeController.js` لحساب GPA
    - جلب الدرجات المعتمدة مع `Course.credit_hours`
    - حساب `GPA = Σ(grade_point × credit_hours) / Σ(credit_hours)` — إذا لم توجد درجات معتمدة → `gpa: 0.0`
    - إضافة `specialty_name` و `academic_status` في `student_info`
    - _المتطلبات: 5.1، 5.2، 6.1، 6.2، 6.5، 6.6_

  - [ ] 2.4 كتابة property test لـ GPA Formula Correctness
    - **Property 1: GPA Formula Correctness**
    - **Validates: Requirements 6.1، 6.2، 6.3**

  - [ ] 2.5 كتابة property test لـ Approved Grades Only in Student View
    - **Property 8: Approved Grades Only in Student View**
    - **Validates: Requirements 5.3، 5.4، 6.1**

  - [x] 2.6 إضافة route `GET /api/grades/professor/courses` في `server/routes/gradeRoutes.js`
    - _المتطلبات: 4.7، 9.5_

- [ ] 3. Checkpoint — تأكد من أن جميع الاختبارات تمر، اسأل المستخدم إذا كان لديه أسئلة.

- [x] 4. إنشاء Accountant Controller والـ Routes
  - [x] 4.1 إنشاء `server/controllers/accountantController.js` مع الدوال:
    - `getSummary`: يحسب `total_invoiced`، `total_paid`، `total_due`، `overdue_count` من جميع FeeInvoice
    - `getStudentInvoices`: يجلب فواتير طالب محدد مع Payments و AcademicYear و Semester
    - `createInvoice`: يُنشئ FeeInvoice مع توليد `invoice_number` بصيغة `INV-YYYY-NNNN`
    - `createPayment`: يُنشئ Payment ويُحدّث `FeeInvoice.paid_amount` و `status`
    - _المتطلبات: 8.3، 8.4، 8.5، 8.6، 8.8، 9.6، 9.7، 9.8_

  - [ ] 4.2 كتابة property test لـ Accountant Role Authorization
    - **Property 5: Accountant Role Authorization**
    - **Validates: Requirements 8.8، 9.6، 9.7، 9.8**

  - [x] 4.3 إنشاء `server/routes/accountantRoutes.js` وتسجيل المسارات:
    - `GET /api/accountant/summary`
    - `GET /api/accountant/students/:id/invoices`
    - `POST /api/accountant/invoices`
    - `POST /api/accountant/payments`
    - تسجيل الـ router في `server/server.js`: `app.use('/api/accountant', accountantRoutes)`
    - _المتطلبات: 8.8، 9.6، 9.7، 9.8_

- [x] 5. إضافة QR Code Verification Endpoint
  - [x] 5.1 إضافة دالة `verifyQRCode` في `server/controllers/authController.js`
    - تقبل `{ qr_secret }` في الـ body
    - تجد `StudentQRCode` بالـ `qr_secret`، تتحقق من `is_active`
    - تزيد `scan_count` وتُحدّث `scanned_at`
    - تُعيد `{ student_code, full_name, is_active }`
    - _المتطلبات: 7.2، 7.3_

  - [x] 5.2 إضافة route `POST /api/auth/verify-qr` في `server/routes/authRoutes.js`
    - _المتطلبات: 7.2_

- [ ] 6. Checkpoint — تأكد من أن جميع الاختبارات تمر، اسأل المستخدم إذا كان لديه أسئلة.

- [x] 7. إضافة axios Interceptor في AuthContext
  - [x] 7.1 تعديل `client/frontend/src/context/AuthContext.jsx` لإضافة `axios.interceptors.response` داخل `AuthProvider`
    - عند HTTP 401: حذف token من localStorage، مسح Authorization header، تعيين `user=null` و `isAuthenticated=false`، إعادة توجيه إلى `/login?expired=true`
    - _المتطلبات: 10.4_

  - [ ] 7.2 كتابة property test لـ JWT Expiry Redirect
    - **Property 7: JWT Expiry Redirect**
    - **Validates: Requirements 10.4**

- [x] 8. توحيد نظام الألوان في CSS
  - [x] 8.1 تعديل `client/frontend/src/pages/Admin/AdminDashboard.jsx` لإزالة الألوان المضمّنة في JSX style props
    - إنشاء `AdminDashboard.module.css` واستخدام متغيرات `--primary-color`، `--secondary-color`، `--shadow-md` بدلاً من القيم المضمّنة
    - _المتطلبات: 1.2، 1.3، 1.4، 1.5_

  - [x] 8.2 مراجعة وتحديث `client/frontend/src/pages/ProfessorGrades.css` و `client/frontend/src/pages/StudentPortal.css`
    - استبدال أي قيم ألوان مضمّنة بالمتغيرات المقابلة من `index.css`
    - _المتطلبات: 1.2، 1.3، 1.5_

- [x] 9. إنشاء صفحة StudentsManagement للأدمن
  - [x] 9.1 إنشاء `client/frontend/src/pages/Admin/StudentsManagement.jsx`
    - عند التحميل: جلب الطلاب من `GET /api/admin/students` وعرضهم في جدول (student_code، الاسم، national_id، التخصص، السنة، الحالة)
    - حقل بحث يفلتر في الوقت الفعلي بالكود أو الرقم القومي أو الاسم
    - زر "إضافة طالب" يفتح نموذجاً ويرسل `POST /api/admin/students`
    - زر "تعديل" لكل طالب يفتح نموذجاً مملوءاً ويرسل `PUT /api/admin/students/:id`
    - أزرار الترقية: "نقل للترم الثاني" أو "نقل للسنة الجديدة" أو "تخريج" حسب حالة الطالب — مع نافذة تأكيد لنقل السنة والتخريج
    - عرض رسائل خطأ واضحة عند الفشل (رقم قومي مكرر، طالب موقوف، إلخ)
    - _المتطلبات: 2.1، 2.2، 2.3، 2.4، 2.5، 2.6، 3.1، 3.2، 3.3، 3.4، 3.5، 3.6، 3.7_

  - [ ] 9.2 كتابة property test لـ Student Search Filter Correctness
    - **Property 2: Student Search Filter Correctness**
    - **Validates: Requirements 2.3، 2.7، 9.1**

  - [x] 9.3 إضافة route `/admin/students` في `client/frontend/src/App.jsx` داخل كتلة Admin Routes
    - إضافة بطاقة "Students Management" في `AdminDashboard.jsx` تشير إلى `/admin/students`
    - _المتطلبات: 2.1_

- [x] 10. ربط ProfessorGrades بالـ API الحقيقي
  - [x] 10.1 تعديل `client/frontend/src/pages/ProfessorGrades.jsx` لاستبدال Mock Data بـ API calls حقيقية
    - عند التحميل: جلب التخصصات من `GET /api/admin/specialties` وعرضها في قائمة منسدلة
    - عند اختيار تخصص: جلب المواد من `GET /api/grades/professor/courses?specialty_id=X`
    - عند اختيار مادة: جلب الطلاب والدرجات من `GET /api/grades/professor?course_id=X`
    - حفظ درجة: `POST /api/grades` بالبيانات الحقيقية
    - إرسال للمراجعة: `POST /api/grades/:id/submit-for-approval` لكل درجة بحالة `draft`
    - عرض loading spinner أثناء كل استدعاء، ورسالة خطأ مع زر "إعادة المحاولة" عند الفشل
    - _المتطلبات: 4.1، 4.2، 4.3، 4.4، 4.5، 4.6، 10.1، 10.2، 10.3_

- [x] 11. ربط StudentPortal بالـ API الحقيقي
  - [x] 11.1 إعادة كتابة `client/frontend/src/pages/StudentPortal.jsx` للاتصال بالـ API الحقيقي
    - عند التحميل: جلب بيانات الطالب تلقائياً من `GET /api/grades/student/dashboard` (بدون إدخال ID يدوي)
    - عرض: الاسم الكامل، كود الطالب، التخصص، السنة، الحالة الأكاديمية، GPA مع تصنيفه (Distinction/Merit/Pass/Fail)
    - تبويب "درجاتي": جلب من `GET /api/grades/student/grades` وعرضها مجمّعة حسب السنة والترم — رسالة "لا توجد درجات معتمدة حتى الآن" إذا كانت القائمة فارغة
    - تبويب "فواتيري": جلب من `GET /api/grades/student/invoices` وعرض ملخص المبالغ
    - توجيه غير المصادق إلى `/login`
    - _المتطلبات: 5.1، 5.2، 5.3، 5.4، 5.5، 5.6، 5.7، 6.3، 10.1، 10.2، 10.6_

- [x] 12. إنشاء AccountantDashboard
  - [x] 12.1 إنشاء `client/frontend/src/pages/AccountantDashboard.jsx`
    - عند التحميل: جلب الملخص المالي من `GET /api/accountant/summary` وعرض: إجمالي الفواتير، المدفوعات، المتأخرات، عدد الفواتير المتأخرة
    - بحث عن طالب: جلب فواتيره من `GET /api/accountant/students/:id/invoices` — الفواتير المتأخرة مميّزة بلون مختلف
    - زر "تسجيل دفعة": نموذج يرسل `POST /api/accountant/payments`
    - زر "إنشاء فاتورة": نموذج يرسل `POST /api/accountant/invoices`
    - دعم كامل للغة العربية واتجاه RTL
    - _المتطلبات: 8.2، 8.3، 8.4، 8.5، 8.6، 8.7، 10.1، 10.2، 10.5_

  - [x] 12.2 إضافة route `/accountant` في `client/frontend/src/App.jsx` محمية بدور `accountant`
    - _المتطلبات: 8.2_

- [x] 13. Checkpoint النهائي — تأكد من أن جميع الاختبارات تمر، اسأل المستخدم إذا كان لديه أسئلة.

---

## المهام الجديدة — المرحلة الثانية

### 🔴 الجزء الأول: إصلاحات حرجة (Critical Fixes)

- [x] 0. إصلاح timetableRoutes.js - إزالة الكود المكرر
- [-] 1. إصلاح GET /api/auth/profile (يعطي 500)
- [-] 2. إصلاح GET /api/admin/academic-years (يعطي 500)
- [-] 3. إصلاح POST /api/admin/professors (يعطي 400 "Username already exists")
- [-] 4. التحقق من API base URL (Vite proxy موجود)
- [-] 5. إصلاح ظهور المواد والكورسات بعد إضافتها
- [-] 6. إصلاح ظهور التخصصات الستة في Dropdown

### المشكلة الجذرية: التخصصات لا تظهر في القوائم المنسدلة

**السبب:** endpoint `GET /api/admin/specialties` محمي بدور `admin` فقط، لكن الأستاذ والمحاسب يحتاجانه أيضاً. الحل: إنشاء endpoint عام للتخصصات أو السماح لأدوار إضافية.

- [x] 14. إصلاح ظهور التخصصات في القوائم المنسدلة (✅ موجود في server.js كـ public endpoint)
  - [x] 14.1 إضافة endpoint عام `GET /api/specialties` في `server/routes/adminRoutes.js` (أو ملف route جديد) يسمح لجميع الأدوار المصادق عليها (admin, professor, accountant, student) بجلب التخصصات النشطة
    - يُعيد فقط التخصصات حيث `is_active = true`
    - لا يحتاج `authorizeRoles` — يكفي `authenticateToken` فقط
    - _السبب: `GET /api/admin/specialties` محمي بـ admin فقط، فالأستاذ يحصل على 403_
  - [x] 14.2 تعديل `client/frontend/src/pages/ProfessorGrades.jsx` لاستخدام `/specialties` بدلاً من `/admin/specialties`
    - تغيير `axios.get('/admin/specialties')` إلى `axios.get('/specialties')`
  - [x] 14.3 تعديل أي صفحة أخرى تستخدم `/admin/specialties` من خارج سياق الأدمن (AccountantDashboard, StudentPortal إن وُجد)

- [x] 15. إضافة حساب Accountant ثابت في seed data
  - [x] 15.1 تعديل `server/seed-data.js` لإضافة مستخدم accountant ثابت:
    - `username: 'accountant'`, `password: 'accountant123'`, `role: 'accountant'`
    - التحقق من عدم وجوده قبل الإنشاء (مثل باقي المستخدمين)
  - [x] 15.2 إضافة script أو endpoint مؤقت `POST /api/auth/seed-accountant` لإنشاء الحساب في قاعدة البيانات الحالية دون إعادة تشغيل كاملة للـ seed
    - أو توثيق أمر SQL مباشر لإدراج المستخدم يدوياً

- [x] 16. إضافة إدارة رسوم التخصصات للمحاسب (سعر كل سنة لكل تخصص)
  - [x] 16.1 إنشاء جدول `specialty_fees` في قاعدة البيانات (أو استخدام حقل `annual_fee` الموجود في `specialties`):
    - إذا كان المطلوب سعر مختلف لكل سنة: إنشاء model `SpecialtyFee` بحقول: `specialty_id`, `year_number` (1-4), `fee_amount`
    - إذا كان سعر موحد للتخصص: تحديث `annual_fee` في جدول `specialties` مباشرة
  - [x] 16.2 إضافة endpoints في `server/routes/accountantRoutes.js`:
    - `GET /api/accountant/specialty-fees` — يجلب رسوم جميع التخصصات مع السنوات الأربع
    - `PUT /api/accountant/specialty-fees/:specialty_id` — يُحدّث رسوم تخصص معين (body: `{ year1_fee, year2_fee, year3_fee, year4_fee }`)
  - [x] 16.3 إضافة قسم "إدارة الرسوم الدراسية" في `client/frontend/src/pages/AccountantDashboard.jsx`:
    - جدول يعرض كل تخصص مع رسوم السنوات الأربع قابلة للتعديل
    - زر "حفظ" لكل صف يرسل `PUT /api/accountant/specialty-fees/:id`
    - عرض التخصصات الستة: MCT, AUT, ICT, PRO, OIL, REN

- [x] 17. إضافة فلترة وعرض بيانات الطالب الكاملة في Accountant Dashboard
  - [x] 17.1 إضافة فورم بحث في `client/frontend/src/pages/AccountantDashboard.jsx` يدعم:
    - البحث بالرقم القومي (`national_id`)
    - البحث بكود الطالب (`student_code`)
    - عرض بيانات الطالب الكاملة: الاسم، التخصص، السنة، الحالة، الرقم القومي، الدرجات، الفواتير
  - [x] 17.2 إضافة endpoint `GET /api/accountant/students/search` في `server/routes/accountantRoutes.js`:
    - يقبل query params: `national_id` أو `student_code`
    - يُعيد بيانات الطالب الكاملة مع الدرجات المعتمدة والفواتير

- [x] 18. إضافة صورة الملف الشخصي للطالب
  - [x] 18.1 إضافة حقل `profile_image` (VARCHAR) في جدول `users` أو `students` إذا لم يكن موجوداً
    - تشغيل migration أو تعديل model مباشرة
  - [x] 18.2 إضافة endpoint في `server/routes/authRoutes.js` أو route جديد:
    - `POST /api/auth/upload-avatar` — يقبل `multipart/form-data` مع صورة، يحفظها في `uploads/avatars/` ويُحدّث `profile_image` في قاعدة البيانات
    - `DELETE /api/auth/avatar` — يحذف الصورة الحالية ويُعيد `profile_image` إلى null
    - استخدام `multer` لمعالجة رفع الملفات
  - [x] 18.3 إضافة قسم "صورة الملف الشخصي" في `client/frontend/src/pages/StudentPortal.jsx`:
    - عرض الصورة الحالية أو placeholder افتراضي
    - زر "تغيير الصورة" يفتح file picker ويرسل `POST /api/auth/upload-avatar`
    - زر "حذف الصورة" يرسل `DELETE /api/auth/avatar`

- [x] 19. إضافة Doctor Dashboard وإدارة الدكاترة من الأدمن
  - [x] 19.1 تعديل `client/frontend/src/pages/Admin/ProfessorsPage.jsx` (أو `ProfessorsManagement.jsx`) لإضافة:
    - فورم "إضافة دكتور جديد" يقبل: الاسم الكامل، البريد الإلكتروني، `username`، `password`، التخصص، المواد المخصصة
    - يرسل `POST /api/admin/professors` لإنشاء User بدور `professor` وسجل Professor مرتبط
    - عرض قائمة الدكاترة الحاليين مع إمكانية التعديل والحذف
  - [x] 19.2 إضافة endpoint `POST /api/admin/professors` في `server/routes/adminRoutes.js`:
    - ينشئ User بدور `professor` وسجل Professor في نفس الـ transaction
    - يقبل: `full_name`, `email`, `username`, `password`, `specialty_id`, `employee_id`
  - [x] 19.3 تعديل `client/frontend/src/pages/ProfessorGrades.jsx` ليكون Doctor Dashboard كامل:
    - إضافة اختيار السنة الدراسية (السنة الأولى / الثانية / الثالثة / الرابعة) بدلاً من `academic_year` الحالي
    - تسلسل الاختيار: التخصص → السنة الدراسية → المادة → Grade Settings → إدخال الدرجات
    - حقول الدرجات: `ass1`, `ass2`, `final` مع حساب النتيجة تلقائياً بناءً على Grade Settings الخاصة بالمادة
  - [x] 19.4 تعديل `server/routes/gradeRoutes.js` لإضافة:
    - `GET /api/grades/professor/courses?specialty_id=X&year_number=Y` — يدعم فلترة بالسنة الدراسية (1-4) بالإضافة للتخصص
  - [x] 19.5 إضافة route `/grades` في `client/frontend/src/App.jsx` يسمح لدور `professor` فقط (موجود بالفعل — التحقق فقط)

- [x] 20. إصلاح Professor CRUD وإضافة الجداول الدراسية للطلاب
  - [x] 20.1 مراجعة وإصلاح `client/frontend/src/pages/Admin/ProfessorsPage.jsx`:
    - إصلاح مشاكل إضافة/تعديل/حذف الدكاترة
    - إصلاح مشاكل تعيين المواد للدكاترة (Professor-Course assignment)
    - التأكد من عرض قائمة الدكاترة بشكل صحيح مع مواد كل دكتور
  - [x] 20.2 إصلاح `client/frontend/src/pages/Admin/TimetablesPage.jsx`:
    - إصلاح مشاكل إضافة الجداول الدراسية
    - التأكد من ربط الجدول بالتخصص والسنة الدراسية والترم
  - [x] 20.3 إضافة عرض الجدول الدراسي في `client/frontend/src/pages/StudentPortal.jsx`:
    - استبدال أو إضافة تبويب "جدولي الدراسي" يجلب الجدول من `GET /api/timetables/student` بناءً على تخصص الطالب وسنته
    - عرض الجدول في شكل جدول أسبوعي (الأيام × الحصص)
  - [x] 20.4 إضافة endpoint `GET /api/timetables/student` في `server/routes/timetableRoutes.js`:
    - يجلب الجدول بناءً على `specialty_id` و `current_year` للطالب المسجّل حالياً

- [ ] 21. استبدال QR Code بنظام رابط تسجيل مؤقت (24 ساعة)
  - [ ] 21.1 إنشاء جدول `registration_links` في قاعدة البيانات:
    - حقول: `id`, `token` (UUID), `expires_at` (24 ساعة من الإنشاء), `is_used`, `created_by` (admin_id), `created_at`
  - [ ] 21.2 إضافة endpoints في `server/routes/adminRoutes.js`:
    - `POST /api/admin/registration-links` — ينشئ رابط تسجيل جديد صالح 24 ساعة، يُعيد `{ token, expires_at, url }`
    - `GET /api/admin/registration-links` — يجلب جميع الروابط مع حالتها (نشط/منتهي/مستخدم)
  - [ ] 21.3 إضافة endpoint عام (بدون auth) في `server/routes/authRoutes.js`:
    - `GET /api/auth/register-link/:token` — يتحقق من صلاحية الرابط ويُعيد بيانات التخصصات للفورم
    - `POST /api/auth/register-link/:token` — يقبل بيانات الطالب (الاسم، الرقم القومي، التخصص، إلخ) وينشئ طلب تسجيل `pending`
  - [ ] 21.4 إنشاء صفحة `client/frontend/src/pages/StudentRegistration.jsx`:
    - فورم تسجيل يظهر عند فتح الرابط `/register/:token`
    - حقول: الاسم الكامل، الرقم القومي، التخصص (dropdown)، رقم الهاتف، البريد الإلكتروني
    - عرض رسالة "انتهت صلاحية الرابط" إذا كان منتهياً
    - عرض رسالة "تم إرسال طلبك، انتظر موافقة الأدمن" بعد الإرسال
  - [ ] 21.5 إضافة صفحة "طلبات التسجيل" في لوحة الأدمن `client/frontend/src/pages/Admin/RegistrationRequests.jsx`:
    - عرض جميع طلبات التسجيل المعلقة مع بيانات كل طالب
    - زر "موافقة" ينشئ حساب الطالب الكامل (User + Student) ويرسل إشعار
    - زر "رفض" يحذف الطلب
  - [ ] 21.6 إضافة route `/admin/registration-requests` في `client/frontend/src/App.jsx` وبطاقة في `AdminDashboard.jsx`

- [ ] 22. تحسين تصميم Admin Dashboard
  - [ ] 22.1 تحديث `client/frontend/src/pages/Admin/AdminDashboard.jsx`:
    - تحسين تصميم البطاقات (cards) باستخدام CSS Grid متجاوب
    - إضافة أيقونات واضحة لكل قسم
    - إضافة إحصائيات سريعة في أعلى الصفحة: عدد الطلاب، الدكاترة، التخصصات، الفواتير المعلقة
    - استخدام متغيرات الألوان `--primary-color` و`--secondary-color` بشكل متسق
  - [ ] 22.2 تحديث `client/frontend/src/components/admin/AdminLayout.jsx`:
    - تحسين الـ sidebar مع أيقونات وتسميات واضحة
    - إضافة قسم "طلبات التسجيل" في القائمة الجانبية
    - تحسين الـ responsive design للشاشات الصغيرة

---

## ملاحظات

- المهام المُعلَّمة بـ `*` اختيارية ويمكن تخطيها للحصول على MVP أسرع
- كل مهمة تشير إلى متطلبات محددة لضمان التتبع الكامل
- نقاط التحقق تضمن التحقق التدريجي من الصحة
- الـ Property Tests تتحقق من الخصائص العامة باستخدام `fast-check` بحد أدنى 100 iteration
- الـ Unit Tests تتحقق من الحالات الحدية والأمثلة المحددة


---

## 🚀 المهام الجديدة الشاملة - خطة التنفيذ الكاملة

### 🔴 الجزء الأول: إصلاحات حرجة (Critical Fixes) - الأولوية القصوى

- [x] 0.1 إصلاح timetableRoutes.js - إزالة الكود المكرر
- [x] 0.2 إنشاء script إعادة تعيين قاعدة البيانات (reset-database.js)
- [x] 1.1 إصلاح GET /api/auth/profile (يعطي 500)
  - التحقق من middleware JWT
  - إصلاح controller
  - اختبار الـ endpoint
- [x] 1.2 إصلاح GET /api/admin/academic-years (يعطي 500)
  - إصلاح SQL query
  - ربط academic_years مع specialties
  - إرجاع السنوات بالعربي
- [x] 1.3 إصلاح POST /api/admin/professors (يعطي 400)
  - إصلاح التحقق من username مكرر
  - استخدام transaction
  - اختبار الإضافة
- [x] 1.4 التحقق من API base URL
  - Vite proxy موجود ✅
  - اختبار الاتصال
  - تحديث جميع ملفات API لاستخدام `/api` بدلاً من `http://localhost:5000/api`
- [x] 1.5 إصلاح ظهور المواد والكورسات
  - التأكد من GET /api/courses
  - إضافة فلترة
  - إصلاح adminRoutes.js لإزالة استيراد courseController غير الموجود
- [x] 1.6 تشغيل reset-database.js
  - تنفيذ: `node server/reset-database.js`
  - التحقق من البيانات
  - ✅ تم بنجاح: 2 مستخدمين + 6 تخصصات + 24 سنة دراسية + 48 فصل دراسي

### 🟡 الجزء الثاني: إعادة هيكلة Admin Dashboard

- [x] 2.1 إعادة تصميم AdminDashboard الرئيسية
  - إنشاء 6 Cards للتخصصات
  - كل Card يحتوي على: الاسم بالعربي والإنجليزي، الأيقونة، عدد الطلاب
  - عند الضغط → الانتقال إلى `/admin/specialty/:code`
  
- [x] 2.2 إنشاء صفحة SpecialtyDashboard
  - `client/frontend/src/pages/Admin/SpecialtyDashboard.jsx`
  - عرض معلومات التخصص
  - 4 Cards للسنوات الدراسية (أولى، ثانية، ثالثة، رابعة)
  - لتخصص ICT فقط: في سنة 3 و 4 → عرض مسارين (Networks, Software)
  
- [ ] 2.3 إنشاء صفحة YearManagement
  - `client/frontend/src/pages/Admin/YearManagement.jsx`
  - 3 أقسام: المواد، الأساتذة، الطلاب
  - إضافة/تعديل/حذف المواد للسنة المحددة
  - تعيين أساتذة للمواد
  - عرض طلاب السنة

- [ ] 2.4 تحديث App.jsx
  - إضافة route: `/admin/specialty/:code`
  - إضافة route: `/admin/specialty/:code/year/:yearNum`

### 🟢 الجزء الثالث: نظام التسجيل عبر الرابط

- [ ] 3.1 إنشاء صفحة StudentRegistration
  - `client/frontend/src/pages/StudentRegistration.jsx`
  - فورم التسجيل يحتوي على:
    - الاسم الرباعي (full_name) → يصبح username
    - الرقم القومي (national_id)
    - رقم التليفون (phone)
    - البريد الإلكتروني (email)
    - كلمة المرور + تأكيد
    - اختيار التخصص (dropdown من 6 تخصصات)
    - اختيار السنة (1,2,3,4)
    - (لطلاب ICT فقط في سنة 3 أو 4): اختيار المسار (Networks/Software)
  - التحقق من صلاحية الرابط
  - إرسال الطلب إلى POST /api/auth/register-link/:token
  
- [ ] 3.2 إنشاء صفحة RegistrationLinks في Admin
  - `client/frontend/src/pages/Admin/RegistrationLinks.jsx`
  - عرض جميع الروابط (نشط/منتهي/مستخدم)
  - زر "إنشاء رابط جديد"
  - نسخ الرابط
  
- [ ] 3.3 تحديث RegistrationRequests
  - عرض جميع الطلبات المعلقة
  - زر "موافقة" → ينشئ حساب الطالب
  - زر "رفض" → يحذف الطلب
  - عرض بيانات الطالب الكاملة

- [ ] 3.4 تحديث كود الطالب
  - تغيير من NCTU-XX-XXX إلى 8 أرقام عشوائية
  - مثال: 20241557, 20240001
  - التأكد من عدم التكرار

### 🔵 الجزء الرابع: تحسين Student Portal

- [ ] 4.1 تحديث صفحة Login
  - إضافة خيار "دخول الطلاب"
  - فورم: كود الطالب + الرقم القومي
  - endpoint: POST /api/auth/student-login
  
- [ ] 4.2 تحسين StudentPortal
  - تبويب "البيانات الشخصية":
    - الاسم، الكود، الرقم القومي، التخصص، السنة، المسار (إن وجد)
    - الصورة الشخصية (إضافة/تعديل/حذف) ✅ موجودة
  - تبويب "الدرجات":
    - جدول بجميع المواد
    - التقدير النهائي لكل مادة
    - المعدل التراكمي (GPA)
  - تبويب "المدفوعات":
    - الفواتير المستحقة
    - الفواتير المدفوعة
    - الرصيد المتبقي
  - تبويب "الجدول الدراسي":
    - عرض الجدول الأسبوعي

### 🟣 الجزء الخامس: نظام الدرجات المحسّن

- [ ] 5.1 إنشاء CourseGradeSettings
  - `client/frontend/src/pages/Admin/CourseGradeSettings.jsx`
  - لكل مادة على حدة:
    - assignment1_max (مثال: 30)
    - assignment2_max (مثال: 30)
    - final_exam_max (مثال: 150)
  - تحويل (P, M, D) إلى درجات رقمية
  
- [ ] 5.2 تحديث حساب التقديرات
  - تطبيق المعادلة:
    - 90-100% → امتياز مع مرتبة الشرف الأولى
    - 80-89% → جيد جداً
    - 70-79% → جيد
    - 60-69% → مقبول
    - 50-59% → ضعيف
    - أقل من 50% → ساقط
  - تحديث في gradeController.js
  - عرض في StudentPortal

### 🎨 الجزء السادس: تحسينات CSS

- [ ] 6.1 تحديث index.css
  - إضافة متغيرات الألوان الجديدة:
    ```css
    --primary-color: #7a5af8;
    --primary-dark: #540874;
    --secondary-color: #b388ff;
    --background: #110117;
    ```
  - إضافة `padding-top: 80px` للحاويات الرئيسية
  
- [ ] 6.2 تحديث جميع ملفات CSS
  - استبدال الألوان القديمة بالمتغيرات الجديدة
  - تطبيق التدرج البنفسجي في الخلفيات

### 💰 الجزء السابع: نظام المحاسب المحسّن

- [ ] 7.1 إضافة إدارة رسوم التخصصات
  - في AccountantDashboard
  - جدول يعرض كل تخصص مع رسوم السنوات الأربع
  - قابل للتعديل
  - زر "حفظ" لكل صف
  
- [ ] 7.2 إضافة بحث متقدم
  - البحث بالرقم القومي
  - البحث بكود الطالب
  - عرض بيانات الطالب الكاملة + الدرجات + الفواتير

---

## 📊 ملخص الحالة

### ✅ مكتمل:
- إصلاح timetableRoutes.js
- إنشاء reset-database.js
- endpoint /api/specialties (public)
- endpoints التسجيل (Backend)
- endpoints الصورة الشخصية (Backend)

### ⏳ قيد التنفيذ:
- إصلاحات الـ API endpoints

### 🔜 التالي:
- تشغيل reset-database.js
- إعادة هيكلة Admin Dashboard
- نظام التسجيل (Frontend)
- تحسين Student Portal

---

---

## 🌈 Rainbow Arc Animation — تحسين وإصلاح

- [x] ARC.1 رفع z-index لقسم Rainbow Arc Animation فوق جميع العناصر
  - [x] ARC.1.1 تحديث `client/frontend/src/pages/Home/Home.css`:
    - إضافة `position: relative; z-index: 99990;` على `.arc-section`
    - رفع `.arc-animation` إلى `z-index: 99991`
    - رفع `.img-card` إلى `z-index: 99992`
    - التأكد من أن `.arc-container` يرث الـ z-index بشكل صحيح
  - [x] ARC.1.2 التأكد من أن `SplashCursor` و `ClickSpark` لا تتداخل مع الـ arc section
    - تعيين `z-index` منخفض على مكونات الخلفية التفاعلية

- [x] ARC.2 التحقق من عمل التأثير بشكل صحيح في `Home.jsx`
  - التأكد من أن `<RainbowArcSection />` موضوعة بعد `<Navbar />` وقبل `<main>`
  - التأكد من أن الصور السبع من assets تظهر بشكل صحيح
  - التأكد من أن الأبعاد responsive: `160×200px` على desktop، `130×165px` على tablet، `100×130px` على mobile

---

## 🎯 ترتيب التنفيذ الموصى به

1. **تشغيل reset-database.js** لإعادة تعيين قاعدة البيانات
2. **إصلاح الـ API endpoints** الحرجة
3. **إعادة هيكلة Admin Dashboard** (التخصصات → السنوات → المواد)
4. **نظام التسجيل** (Frontend)
5. **تحسين Student Portal**
6. **نظام الدرجات المحسّن**
7. **تحسينات CSS**
8. **نظام المحاسب المحسّن**

---

**آخر تحديث:** الآن
**الحالة:** قيد التنفيذ النشط


---

## 🚨 المهام الحرجة الجديدة - فحص شامل للـ Admin Dashboard

### المشاكل المكتشفة:

- [x] CRITICAL-1: رابط التسجيل (24 ساعة) - الـ Backend جاهز ✅
  - ✅ Endpoints موجودة في `server/routes/authRoutes.js`:
    - `GET /api/auth/register-link/:token` - للتحقق من صلاحية الرابط
    - `POST /api/auth/register-link/:token` - لإرسال طلب التسجيل
  - ✅ Admin endpoints موجودة في `server/controllers/adminController.js`:
    - `createRegistrationLink` - إنشاء رابط جديد
    - `getRegistrationLinks` - عرض جميع الروابط
    - `getRegistrationRequests` - عرض طلبات التسجيل
    - `approveRegistrationRequest` - الموافقة على الطلب
    - `rejectRegistrationRequest` - رفض الطلب
  - ⚠️ المشكلة: Frontend فقط - `StudentRegistration.jsx` قد يحتاج تحديث
  - 🔧 الحل: التحقق من `client/frontend/src/pages/StudentRegistration.jsx` وإصلاحه

- [x] CRITICAL-2: عرض الجدول الدراسي - الـ Backend جاهز ✅
  - ✅ Endpoints موجودة في `server/routes/timetableRoutes.js`:
    - `GET /api/timetables` - عرض جميع الجداول (admin)
    - `POST /api/timetables` - رفع جدول جديد (admin)
    - `PUT /api/timetables/:id` - تعديل جدول (admin)
    - `DELETE /api/timetables/:id` - حذف جدول (admin)
    - `GET /api/timetables/student` - عرض جدول الطالب (student)
  - ✅ Controller موجود في `server/controllers/timetableController.js`
  - ✅ Frontend موجود في `client/frontend/src/pages/Admin/TimetablesPage.jsx`
  - ⚠️ المشكلة المحتملة: مسار الـ API أو عرض البيانات
  - 🔧 الحل: التحقق من الاتصال بين Frontend و Backend

- [ ] CRITICAL-3: صفحة Grade Settings فارغة
  - المشكلة: عند الدخول على `/admin/grade-settings` تظهر صفحة فارغة
  - التحقق من: `client/frontend/src/pages/Admin/GradeSettings.jsx`
  - التحقق من: `server/routes/courseGradeConfigRoutes.js`
  - التحقق من: `server/controllers/courseGradeConfigController.js`
  - الحل المطلوب: إصلاح الصفحة والتأكد من عرض إعدادات الدرجات

- [ ] STYLE-1: تطبيق نمط الألوان البنفسجي على جميع صفحات الأدمن
  - تطبيق التدرج البنفسجي على العناوين:
    ```css
    background: linear-gradient(135deg, #7a5af8, #fe29ba);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
    ```
  - الملفات المستهدفة:
    - `client/frontend/src/pages/Admin/TimetablesPage.module.css`
    - `client/frontend/src/pages/Admin/GradeSettings.module.css`
    - `client/frontend/src/pages/Admin/RegistrationLinks.module.css`
    - `client/frontend/src/pages/Admin/RegistrationRequests.module.css`
    - `client/frontend/src/pages/Admin/AdminDashboard.module.css`
    - `client/frontend/src/components/navComponent/Navbar.css`
  - تطبيق نظام الألوان من `index.css` و `About.css`

- [ ] STYLE-2: إزالة الـ Sidebar الإنجليزي نهائياً
  - حذف أو إخفاء الـ sidebar من `client/frontend/src/components/admin/AdminLayout.jsx`
  - الاعتماد على الـ Navbar فقط للتنقل
  - التأكد من عدم وجود أي أثر للـ sidebar في الكود

### خطة الفحص الشامل:

- [ ] CHECK-1: فحص جميع endpoints في adminRoutes.js
  - التحقق من وجود جميع الـ controllers
  - التحقق من صحة الـ middleware
  - اختبار كل endpoint على حدة

- [ ] CHECK-2: فحص جميع صفحات الأدمن
  - AdminDashboard
  - SpecialtyDashboard
  - YearManagement
  - CoursesPage
  - ProfessorsPage
  - StudentsManagement
  - GradeSettings
  - TimetablesPage
  - RegistrationLinks
  - RegistrationRequests

- [ ] CHECK-3: فحص نظام التسجيل الكامل
  - إنشاء رابط تسجيل
  - فتح الرابط في متصفح جديد
  - ملء فورم التسجيل
  - إرسال الطلب
  - الموافقة/الرفض من لوحة الأدمن

- [ ] CHECK-4: فحص نظام الجداول الدراسية
  - رفع جدول PDF
  - عرض الجدول في القائمة
  - فتح الجدول في نافذة جديدة
  - تعديل الجدول
  - حذف الجدول

- [ ] CHECK-5: فحص نظام إعدادات الدرجات
  - عرض جميع المواد
  - تعديل إعدادات مادة
  - حفظ التغييرات
  - إعادة تعيين للقيم الافتراضية
  - تصدير/استيراد JSON

---

**الأولوية:** 🔴 عالية جداً (CRITICAL)
**الحالة:** [ ] لم يبدأ
**المسؤول:** Kiro AI
**التاريخ:** الآن

