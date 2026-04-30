# متطلبات تحسينات النظام الشاملة

## نظرة عامة
تحسين شامل لنظام ERP يشمل تسجيل الدكاترة، إدارة الطلاب، نظام القبول، والاختبار الشامل لانتقال الطلاب بين المراحل.

## المتطلبات الوظيفية

### 1. نظام تسجيل الدكاترة (Professor Registration)
**المشكلة الحالية:**
- لا يوجد نظام تسجيل للدكاترة مشابه للطلاب
- الأدمن يضطر لإضافة كل دكتور يدوياً

**المطلوب:**
- إنشاء نظام تسجيل للدكاترة مشابه تماماً لنظام تسجيل الطلاب
- رابط تسجيل دائم (24 ساعة) مع فورم تسجيل
- صفحة طلبات تسجيل الدكاترة للأدمن
- إمكانية قبول/رفض طلبات الدكاترة

**البيانات المطلوبة في فورم التسجيل:**
- الاسم الكامل (full_name)
- الرقم القومي (national_id)
- البريد الإلكتروني (email)
- رقم الهاتف (phone)
- التخصص (specialty_id)
- المؤهل العلمي (qualification)
- سنوات الخبرة (years_of_experience)
- كلمة المرور (password)

### 2. تحسين نظام قبول الطلاب

**المشكلة الحالية:**
- الأدمن يقبل الطلاب واحد واحد
- لا يوجد زر لقبول جميع الطلاب دفعة واحدة
- لا يوجد زر لحذف الطالب عند الرفض

**المطلوب:**
- زر "قبول جميع الطلاب المعلقين" (Approve All Pending)
- زر "حذف الطالب" عند رفض الطلب
- عرض جميع بيانات الطلاب المعلقين في modal واحد
- إمكانية قبول/رفض من داخل الـ modal

### 3. تحسين عرض النتائج

**المطلوب:**
- زر "عرض جميع النتائج" (View All Results)
- زر "عرض النتائج المعلقة" (View Pending Results)
- عرض النتائج في جدول شامل مع فلاتر
- إمكانية تصدير النتائج

### 4. اختبار شامل لنظام انتقال الطلاب

**المطلوب:**
- استخدام Postman Power لاختبار جميع APIs
- اختبار سيناريوهات الانتقال:
  - من الترم الأول للترم الثاني
  - من سنة لسنة أخرى
  - حالات الرسوب
  - حالات الدراسة الصيفية
  - حالات التخرج

**السيناريوهات المطلوب اختبارها:**
1. طالب ناجح في جميع المواد → ينتقل للترم/السنة التالية
2. طالب راسب في مادة واحدة → يبقى في نفس السنة
3. طالب راسب في مادتين → دراسة صيفية
4. طالب راسب في 3+ مواد → يعيد السنة
5. طالب في السنة الرابعة ناجح → يتخرج

## المتطلبات التقنية

### Backend APIs المطلوبة

#### Professor Registration APIs
```
POST /api/professor-registration/register
GET  /api/admin/professor-requests
POST /api/admin/professor-requests/:id/approve
POST /api/admin/professor-requests/:id/reject
DELETE /api/admin/professor-requests/:id
```

#### Student Management APIs
```
POST /api/admin/registration-requests/approve-all
DELETE /api/admin/registration-requests/:id
GET  /api/admin/students/all-results
GET  /api/admin/students/pending-results
```

#### Student Promotion Testing APIs
```
POST /api/admin/students/promote-semester
POST /api/admin/students/promote-year
POST /api/admin/students/bulk-promote
GET  /api/admin/students/:id/promotion-eligibility
```

### Frontend Components المطلوبة

1. **ProfessorRegistrationForm.jsx** - فورم تسجيل الدكاترة
2. **ProfessorRequests.jsx** - صفحة طلبات الدكاترة للأدمن
3. **BulkStudentApproval.jsx** - Modal لقبول جميع الطلاب
4. **AllResultsView.jsx** - صفحة عرض جميع النتائج
5. **PendingResultsView.jsx** - صفحة عرض النتائج المعلقة

### Database Schema Changes

#### جدول جديد: professor_registration_requests
```sql
CREATE TABLE professor_registration_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  national_id VARCHAR(14) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  specialty_id INT,
  qualification VARCHAR(255),
  years_of_experience INT,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  processed_by INT,
  FOREIGN KEY (specialty_id) REFERENCES specialties(id),
  FOREIGN KEY (processed_by) REFERENCES users(id)
);
```

## معايير القبول

### نظام تسجيل الدكاترة
- [ ] يمكن للدكتور التسجيل عبر رابط دائم
- [ ] يتم حفظ البيانات في جدول professor_registration_requests
- [ ] الأدمن يرى جميع طلبات الدكاترة
- [ ] الأدمن يمكنه قبول/رفض/حذف الطلبات
- [ ] عند القبول، يتم إنشاء حساب دكتور في جدول users و professors

### نظام قبول الطلاب المحسّن
- [ ] زر "قبول الكل" يعمل بشكل صحيح
- [ ] زر "حذف" يحذف الطلب من قاعدة البيانات
- [ ] Modal يعرض جميع الطلاب المعلقين
- [ ] يمكن قبول/رفض من داخل الـ modal

### عرض النتائج
- [ ] زر "عرض جميع النتائج" يعرض جميع نتائج الطلاب
- [ ] زر "عرض النتائج المعلقة" يعرض النتائج غير المعتمدة
- [ ] الجداول تحتوي على فلاتر (تخصص، سنة، حالة)
- [ ] يمكن تصدير النتائج كـ CSV/Excel

### الاختبار الشامل
- [ ] جميع APIs تم اختبارها باستخدام Postman
- [ ] جميع سيناريوهات الانتقال تعمل بشكل صحيح
- [ ] لا توجد أخطاء في console
- [ ] البيانات متسقة في قاعدة البيانات

## الأولويات

1. **عالية:** نظام تسجيل الدكاترة
2. **عالية:** تحسين نظام قبول الطلاب
3. **متوسطة:** عرض النتائج الشامل
4. **عالية:** الاختبار الشامل للنظام

## الملاحظات

- يجب أن يكون التصميم متسق مع باقي النظام
- استخدام نفس الـ styling patterns الموجودة
- التأكد من الـ validation على جميع المدخلات
- إضافة رسائل خطأ واضحة للمستخدم
- التأكد من الـ authorization على جميع الـ endpoints
