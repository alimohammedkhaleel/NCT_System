# خطة التنفيذ الشاملة - NCTU ERP System

## 📋 نظرة عامة

هذه الوثيقة تحتوي على خطة تنفيذ شاملة لجميع المهام المطلوبة مرتبة حسب الأولوية والترابط.

---

## 🎯 المرحلة الأولى: إصلاحات حرجة (Critical Fixes)

### ✅ المهمة 0: إصلاح timetableRoutes.js
**الحالة:** ✅ مكتملة
**الوصف:** إزالة الكود المكرر من ملف timetableRoutes.js

---

### 🔴 المهمة 1: إصلاح GET /api/auth/profile
**الأولوية:** عالية جداً
**الحالة:** قيد التنفيذ
**المشكلة:** يعطي خطأ 500
**الحل:**
- التحقق من middleware التحقق من JWT
- إصلاح controller ليعيد بيانات المستخدم بشكل صحيح
- إضافة معالجة أخطاء أفضل

**الملفات المتأثرة:**
- `server/controllers/authController.js`
- `server/middleware/auth.js`

---

### 🔴 المهمة 2: إصلاح GET /api/admin/academic-years
**الأولوية:** عالية جداً
**الحالة:** في الانتظار
**المشكلة:** يعطي خطأ 500
**الحل:**
- إصلاح SQL query أو Sequelize model
- ربط academic_years مع specialties بشكل صحيح
- إرجاع السنوات: "السنة الأولى", "السنة الثانية", "السنة الثالثة", "السنة الرابعة"

**الملفات المتأثرة:**
- `server/controllers/adminController.js`
- `server/models/AcademicYear.js`

---

### 🔴 المهمة 3: إصلاح POST /api/admin/professors
**الأولوية:** عالية
**الحالة:** في الانتظار
**المشكلة:** يعطي 400 "Username already exists"
**الحل:**
- إصلاح التحقق من username مكرر
- إنشاء حساب user أولاً ثم ربطه بجدول professors
- استخدام transaction لضمان atomicity

**الملفات المتأثرة:**
- `server/controllers/courseController.js`

---

### 🔴 المهمة 4: إصلاح API base URL
**الأولوية:** عالية جداً
**الحالة:** في الانتظار
**المشكلة:** Frontend يرسل طلبات إلى port 5173
**الحل:**
- ضبط Vite proxy (موجود بالفعل في vite.config.js)
- التأكد من axios baseURL
- اختبار الاتصال

**الملفات المتأثرة:**
- `client/frontend/vite.config.js` ✅ (موجود بالفعل)
- `client/frontend/src/api/*`

---

### 🔴 المهمة 5: إصلاح ظهور المواد والكورسات
**الأولوية:** متوسطة
**الحالة:** في الانتظار
**المشكلة:** المواد لا تظهر بعد إضافتها
**الحل:**
- التأكد من `GET /api/courses` يعيد المواد المضافة
- إضافة فلترة حسب التخصص والسنة

**الملفات المتأثرة:**
- `server/controllers/courseController.js`

---

### 🔴 المهمة 6: إصلاح ظهور التخصصات الستة
**الأولوية:** عالية جداً
**الحالة:** في الانتظار
**المشكلة:** التخصصات لا تظهر في Dropdown
**الحل:**
- التأكد من `GET /api/specialties` يعيد التخصصات الستة
- إضافة seed data للتخصصات الستة

**التخصصات المطلوبة:**
1. تكنولوجيا المعلومات (ICT) - Information Technology
2. تكنولوجيا الميكاترونكس (MCT) - Mechatronics Technology
3. تكنولوجيا الأوتوترونكس (AUT) - Autotronics Technology
4. تكنولوجيا الطاقة الجديدة والمتجددة (REN) - Renewable Energy Technology
5. تكنولوجيا البترول (OIL) - Oil Production Technology
6. تكنولوجيا الأطراف الصناعية (PRO) - Prosthetics Technology

**الملفات المتأثرة:**
- `server/seed-data.js`
- `server/routes/authRoutes.js` (endpoint seed-specialties موجود)

---

## 🎯 المرحلة الثانية: إعادة هيكلة Admin Dashboard

### 🟡 المهمة 7: إعادة هيكلة Admin Dashboard
**الأولوية:** عالية
**الحالة:** في الانتظار
**الوصف:**
- إنشاء صفحة رئيسية للـ Admin تحتوي على 6 Cards (كل تخصص له Card)
- كل Card تحمل اسم التخصص بالعربي والإنجليزي
- عند الضغط على Card التخصص، تفتح صفحة خاصة بذلك التخصص

**الملفات الجديدة:**
- `client/frontend/src/pages/Admin/SpecialtyDashboard.jsx`
- `client/frontend/src/pages/Admin/SpecialtyDashboard.module.css`

**الملفات المعدلة:**
- `client/frontend/src/pages/Admin/AdminDashboard.jsx`
- `client/frontend/src/App.jsx`

---

### 🟡 المهمة 8: صفحات خاصة لكل تخصص
**الأولوية:** عالية
**الحالة:** في الانتظار
**الوصف:**
كل تخصص له الصفحات التالية:
- 📚 إضافة مواد (مع اختيار السنة: أولى/ثانية/ثالثة/رابعة)
- 👨‍🏫 إدارة أساتذة (تعيين أساتذة للمواد)
- 🧑‍🎓 إدارة طلاب (عرض وإدارة الطلاب)

**الملفات الجديدة:**
- `client/frontend/src/pages/Admin/Specialty/CoursesManagement.jsx`
- `client/frontend/src/pages/Admin/Specialty/ProfessorsManagement.jsx`
- `client/frontend/src/pages/Admin/Specialty/StudentsManagement.jsx`

---

### 🟡 المهمة 9: مسارات IT (Networks/Software)
**الأولوية:** متوسطة
**الحالة:** في الانتظار
**الوصف:**
في تخصص تكنولوجيا المعلومات (IT) فقط:
- في السنة الثالثة: Card لمسار الشبكات + Card لمسار البرمجيات
- في السنة الرابعة: Card لمسار الشبكات + Card لمسار البرمجيات
- باقي التخصصات ليس لها مسارات فرعية

**الملفات المتأثرة:**
- `server/models/Course.js` (إضافة حقل track)
- `client/frontend/src/pages/Admin/Specialty/CoursesManagement.jsx`

---

## 🎯 المرحلة الثالثة: نظام التسجيل والطلاب

### 🟢 المهمة 10: نظام رابط التسجيل (24 ساعة)
**الأولوية:** عالية
**الحالة:** ✅ مكتملة جزئياً (Backend موجود)
**الوصف:**
- ✅ Backend: endpoints موجودة في adminRoutes.js و authRoutes.js
- ⏳ Frontend: إنشاء صفحة StudentRegistration.jsx

**الملفات الموجودة:**
- ✅ `server/routes/adminRoutes.js` (POST /api/admin/registration-links)
- ✅ `server/routes/authRoutes.js` (GET/POST /api/auth/register-link/:token)
- ✅ `server/models/RegistrationLink.js`
- ✅ `server/models/RegistrationRequest.js`

**الملفات المطلوبة:**
- ⏳ `client/frontend/src/pages/StudentRegistration.jsx`
- ⏳ `client/frontend/src/pages/Admin/RegistrationLinks.jsx`

---

### 🟢 المهمة 11: كود الطالب العشوائي (8 أرقام)
**الأولوية:** متوسطة
**الحالة:** في الانتظار
**الوصف:**
- توليد كود عشوائي مكون من 8 أرقام (مثال: 20241557)
- لا تستخدم صيغة NCTU-XXX
- مثال: 20240001, 20240002, ... إلخ

**الملفات المتأثرة:**
- `server/controllers/studentController.js`
- `server/routes/adminRoutes.js` (approve registration request)

---

### 🟢 المهمة 12: Student Portal محسّن
**الأولوية:** عالية
**الحالة:** في الانتظار
**الوصف:**
- صفحة دخول للطلاب بـ (كود الطالب + الرقم القومي)
- بعد الدخول، تظهر:
  - 📊 الدرجات (جدول بجميع المواد مع التقدير النهائي)
  - 💰 المدفوعات (الفواتير المستحقة والمدفوعة)
  - 🖼️ الصورة الشخصية (إضافة/تعديل/حذف) ✅ موجودة
  - 📋 البيانات الشخصية

**الملفات المتأثرة:**
- `client/frontend/src/pages/StudentPortal.jsx`
- `client/frontend/src/pages/Login.jsx` (إضافة خيار دخول بكود الطالب)

---

### 🟢 المهمة 13: حساب المحاسب الثابت
**الأولوية:** متوسطة
**الحالة:** ✅ مكتملة جزئياً
**الوصف:**
- ✅ Backend: endpoint موجود في authRoutes.js
- username: accountant, password: accountant123
- صلاحية: إضافة سعر كل تخصص في السنوات الأربع

**الملفات الموجودة:**
- ✅ `server/routes/authRoutes.js` (POST /api/auth/create-accountant)

**المطلوب:**
- إضافة واجهة لإدارة رسوم التخصصات في AccountantDashboard

---

## 🎯 المرحلة الرابعة: التحسينات النهائية

### 🔵 المهمة 14: تحسين CSS
**الأولوية:** متوسطة
**الحالة:** في الانتظار
**الوصف:**
- إضافة `padding-top: 80px` لجميع الحاويات الرئيسية
- استخدام الألوان:
  - اللون الأساسي: #7a5af8 (بنفسجي فاتح)
  - اللون الداكن: #540874 (بنفسجي غامق)
  - اللون الذهبي: #b388ff (ذهبي)
  - الخلفية: #110117 أو تدرج بنفسجي

**الملفات المتأثرة:**
- `client/frontend/src/index.css`
- جميع ملفات CSS في المشروع

---

### 🔵 المهمة 15: Grade Settings لكل مادة
**الأولوية:** عالية
**الحالة:** في الانتظار
**الوصف:**
- إنشاء صفحة CourseGradeSettings لكل مادة
- تحتوي على:
  - assignment1_max (مثال: 30)
  - assignment2_max (مثال: 30)
  - final_exam_max (مثال: 150)
  - تحويل (P, M, D) إلى درجات رقمية

**الملفات الجديدة:**
- `client/frontend/src/pages/Admin/CourseGradeSettings.jsx`

**الملفات المتأثرة:**
- `server/models/GradeSetting.js`
- `server/controllers/gradeController.js`

---

### 🔵 المهمة 16: حساب التقديرات النهائية
**الأولوية:** عالية
**الحالة:** في الانتظار
**الوصف:**
- تطبيق المعادلة:
  - 90-100% → امتياز مع مرتبة الشرف الأولى
  - 80-89% → جيد جداً
  - 70-79% → جيد
  - 60-69% → مقبول
  - 50-59% → ضعيف
  - أقل من 50% → ساقط

**الملفات المتأثرة:**
- `server/controllers/gradeController.js`
- `client/frontend/src/pages/StudentPortal.jsx`

---

### 🔵 المهمة 17: إعادة تعيين قاعدة البيانات
**الأولوية:** عالية جداً
**الحالة:** في الانتظار
**الوصف:**
- مسح كل البيانات القديمة
- إعادة إنشاء الجداول من الصفر
- إضافة الحسابات الثابتة:
  - Admin: username: admin, password: admin123
  - Accountant: username: accountant, password: accountant123
- إضافة التخصصات الستة

**الملفات المتأثرة:**
- `server/seed-data.js`
- `server/server.js`

---

## 📊 ملخص الأولويات

### 🔴 عالية جداً (يجب إنجازها أولاً):
1. ✅ إصلاح timetableRoutes.js
2. ⏳ إصلاح GET /api/auth/profile
3. ⏳ إصلاح GET /api/admin/academic-years
4. ⏳ إصلاح API base URL
5. ⏳ إصلاح ظهور التخصصات الستة
6. ⏳ إعادة تعيين قاعدة البيانات

### 🟡 عالية:
7. ⏳ إصلاح POST /api/admin/professors
8. ⏳ إعادة هيكلة Admin Dashboard
9. ⏳ صفحات خاصة لكل تخصص
10. ⏳ نظام رابط التسجيل (Frontend)
11. ⏳ Student Portal محسّن
12. ⏳ Grade Settings لكل مادة
13. ⏳ حساب التقديرات النهائية

### 🟢 متوسطة:
14. ⏳ إصلاح ظهور المواد والكورسات
15. ⏳ مسارات IT (Networks/Software)
16. ⏳ كود الطالب العشوائي
17. ⏳ حساب المحاسب الثابت (Frontend)
18. ⏳ تحسين CSS

---

## 🚀 ترتيب التنفيذ الموصى به

1. **الجزء الأول (إصلاحات حرجة):** المهام 1-6
2. **الجزء الثاني (قاعدة البيانات):** المهمة 17
3. **الجزء الثالث (Admin Dashboard):** المهام 7-9
4. **الجزء الرابع (نظام التسجيل):** المهام 10-13
5. **الجزء الخامس (التحسينات):** المهام 14-16

---

**آخر تحديث:** الآن
**الحالة العامة:** قيد التنفيذ
