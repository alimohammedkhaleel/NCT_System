# دليل المهام المتبقية - NCTU ERP Completion

## نظرة عامة

هذا الدليل يوضح المهام المتبقية بالتفصيل مع خطوات التنفيذ والأولويات.

---

## المهام حسب الأولوية

### 🔴 الأولوية القصوى (Critical)

#### المهمة 16: إدارة رسوم التخصصات للمحاسب
**الوصف:** إضافة صفحة لإدارة رسوم كل تخصص لكل سنة دراسية

**الخطوات:**
1. إنشاء جدول `specialty_fees` في قاعدة البيانات (أو استخدام `annual_fee` الموجود)
2. إضافة endpoints في `server/routes/accountantRoutes.js`:
   - `GET /api/accountant/specialty-fees`
   - `PUT /api/accountant/specialty-fees/:specialty_id`
3. إضافة قسم في `AccountantDashboard.jsx`:
   - جدول يعرض التخصصات الستة
   - رسوم السنوات الأربع لكل تخصص
   - قابل للتعديل مع زر "حفظ"

**الملفات المطلوبة:**
- `server/models/SpecialtyFee.js` (إذا كان جدول جديد)
- `server/controllers/accountantController.js` (تحديث)
- `client/frontend/src/pages/AccountantDashboard.jsx` (تحديث)

**API Endpoints:**
```javascript
GET /api/accountant/specialty-fees
Response: {
  success: true,
  data: [
    {
      specialty_id: 1,
      specialty_name: 'MCT',
      year1_fee: 10000,
      year2_fee: 10000,
      year3_fee: 10000,
      year4_fee: 10000
    },
    // ...
  ]
}

PUT /api/accountant/specialty-fees/:specialty_id
Body: {
  year1_fee: 10000,
  year2_fee: 10000,
  year3_fee: 10000,
  year4_fee: 10000
}
```

---

#### المهمة 17: فلترة وعرض بيانات الطالب الكاملة في Accountant Dashboard
**الوصف:** إضافة بحث متقدم للطلاب في لوحة المحاسب

**الخطوات:**
1. إضافة فورم بحث في `AccountantDashboard.jsx`:
   - حقل بحث بالرقم القومي
   - حقل بحث بكود الطالب
2. عرض بيانات الطالب الكاملة:
   - الاسم، التخصص، السنة، الحالة
   - الرقم القومي
   - الدرجات المعتمدة
   - الفواتير والمدفوعات
3. إضافة endpoint في `server/routes/accountantRoutes.js`:
   - `GET /api/accountant/students/search?national_id=X` أو `?student_code=Y`

**الملفات المطلوبة:**
- `server/controllers/accountantController.js` (تحديث)
- `client/frontend/src/pages/AccountantDashboard.jsx` (تحديث)

**API Endpoint:**
```javascript
GET /api/accountant/students/search?national_id=12345678901234
Response: {
  success: true,
  data: {
    student: {
      id: 1,
      student_code: '20241557',
      full_name: 'أحمد محمد',
      national_id: '12345678901234',
      specialty: 'ICT',
      current_year: 2,
      academic_status: 'active'
    },
    grades: [...],
    invoices: [...],
    payments: [...]
  }
}
```

---

#### المهمة 18: صورة الملف الشخصي للطالب
**الوصف:** إضافة إمكانية رفع وحذف صورة الملف الشخصي

**الخطوات:**
1. إضافة حقل `profile_image` في جدول `users` (إذا لم يكن موجوداً)
2. إضافة endpoints في `server/routes/authRoutes.js`:
   - `POST /api/auth/upload-avatar` (multer middleware)
   - `DELETE /api/auth/avatar`
3. إضافة قسم في `StudentPortal.jsx`:
   - عرض الصورة الحالية أو placeholder
   - زر "تغيير الصورة"
   - زر "حذف الصورة"

**الملفات المطلوبة:**
- `server/config/multer.js` (تحديث لإضافة avatars)
- `server/controllers/authController.js` (تحديث)
- `client/frontend/src/pages/StudentPortal.jsx` (تحديث)

**API Endpoints:**
```javascript
POST /api/auth/upload-avatar
Content-Type: multipart/form-data
Body: { avatar: File }
Response: {
  success: true,
  data: {
    profile_image: '/uploads/avatars/user-123-1234567890.jpg'
  }
}

DELETE /api/auth/avatar
Response: {
  success: true,
  message: 'Profile image deleted'
}
```

---

### 🟡 الأولوية المتوسطة (Medium)

#### المهمة 19: Doctor Dashboard وإدارة الدكاترة
**الوصف:** تحسين صفحة إدارة الدكاترة وتحسين ProfessorGrades

**الخطوات:**
1. تحديث `ProfessorsPage.jsx`:
   - فورم إضافة دكتور جديد
   - عرض قائمة الدكاترة
   - تعديل وحذف
2. تحديث `ProfessorGrades.jsx`:
   - إضافة اختيار السنة الدراسية (1-4)
   - تسلسل: التخصص → السنة → المادة → Grade Settings → الدرجات
   - حقول: ass1, ass2, final
   - حساب النتيجة تلقائياً
3. إضافة endpoint:
   - `POST /api/admin/professors`
   - `GET /api/grades/professor/courses?specialty_id=X&year_number=Y`

**الملفات المطلوبة:**
- `client/frontend/src/pages/Admin/ProfessorsPage.jsx` (تحديث)
- `client/frontend/src/pages/ProfessorGrades.jsx` (تحديث)
- `server/controllers/professorController.js` (تحديث)

---

#### المهمة 20: إصلاح Professor CRUD والجداول الدراسية للطلاب
**الوصف:** إصلاح مشاكل CRUD للدكاترة وإضافة عرض الجدول للطلاب

**الخطوات:**
1. مراجعة وإصلاح `ProfessorsPage.jsx`:
   - إصلاح إضافة/تعديل/حذف
   - إصلاح تعيين المواد
2. إصلاح `TimetablesPage.jsx`:
   - إصلاح إضافة الجداول
   - ربط بالتخصص والسنة والترم
3. إضافة تبويب "جدولي الدراسي" في `StudentPortal.jsx`:
   - جلب الجدول من `GET /api/timetables/student`
   - عرض في شكل جدول أسبوعي
4. إضافة endpoint:
   - `GET /api/timetables/student`

**الملفات المطلوبة:**
- `client/frontend/src/pages/Admin/ProfessorsPage.jsx` (إصلاح)
- `client/frontend/src/pages/Admin/TimetablesPage.jsx` (إصلاح)
- `client/frontend/src/pages/StudentPortal.jsx` (تحديث)
- `server/routes/timetableRoutes.js` (تحديث)

---

### 🟢 الأولوية المنخفضة (Low)

#### المهمة 21: نظام رابط التسجيل المؤقت (24 ساعة)
**الوصف:** استبدال QR Code بنظام رابط تسجيل مؤقت

**الخطوات:**
1. إنشاء جدول `registration_links`:
   - `id`, `token` (UUID), `expires_at`, `is_used`, `created_by`, `created_at`
2. إضافة endpoints في `server/routes/adminRoutes.js`:
   - `POST /api/admin/registration-links`
   - `GET /api/admin/registration-links`
3. إضافة endpoints عامة في `server/routes/authRoutes.js`:
   - `GET /api/auth/register-link/:token`
   - `POST /api/auth/register-link/:token`
4. إنشاء `StudentRegistration.jsx`:
   - فورم تسجيل مع الحقول المطلوبة
   - رسالة "انتهت صلاحية الرابط"
5. إنشاء `RegistrationLinks.jsx` في Admin:
   - عرض جميع الروابط
   - زر "إنشاء رابط جديد"
   - نسخ الرابط
6. إنشاء `RegistrationRequests.jsx` في Admin:
   - عرض الطلبات المعلقة
   - زر "موافقة" و "رفض"

**الملفات المطلوبة:**
- `server/models/RegistrationLink.js` (جديد)
- `server/models/RegistrationRequest.js` (جديد)
- `server/controllers/registrationController.js` (جديد)
- `client/frontend/src/pages/StudentRegistration.jsx` (جديد)
- `client/frontend/src/pages/Admin/RegistrationLinks.jsx` (جديد)
- `client/frontend/src/pages/Admin/RegistrationRequests.jsx` (جديد)

---

#### المهمة 22: تحسين تصميم Admin Dashboard
**الوصف:** تحسينات UI/UX للوحة الأدمن

**الخطوات:**
1. تحديث `AdminDashboard.jsx`:
   - تحسين تصميم البطاقات
   - إضافة إحصائيات سريعة
   - أيقونات واضحة
2. تحديث `AdminLayout.jsx`:
   - تحسين الـ sidebar
   - إضافة "طلبات التسجيل"
   - responsive design

**الملفات المطلوبة:**
- `client/frontend/src/pages/Admin/AdminDashboard.jsx` (تحديث)
- `client/frontend/src/components/admin/AdminLayout.jsx` (تحديث)

---

## Property-Based Tests

### نظرة عامة
جميع الـ Property Tests معلقة ويجب كتابتها باستخدام `fast-check` مع حد أدنى 100 iteration.

### القائمة:
1. **Property 1: GPA Formula Correctness** (Task 2.4)
2. **Property 2: Student Search Filter Correctness** (Task 9.2)
3. **Property 3: Student Promotion State Machine** (Task 1.3)
4. **Property 4: Professor Course Isolation** (Task 2.2)
5. **Property 5: Accountant Role Authorization** (Task 4.2)
6. **Property 6: Student Creation Atomicity** (Task 1.2)
7. **Property 7: JWT Expiry Redirect** (Task 7.2)
8. **Property 8: Approved Grades Only in Student View** (Task 2.5)

### مثال على Property Test:
```javascript
// Property 1: GPA Formula
test('GPA formula holds for any set of approved grades', () => {
  fc.assert(fc.property(
    fc.array(fc.record({
      grade_point: fc.float({ min: 0, max: 4 }),
      credit_hours: fc.integer({ min: 1, max: 6 })
    }), { minLength: 1 }),
    (grades) => {
      const gpa = calculateGPA(grades);
      const expected = grades.reduce((sum, g) => sum + g.grade_point * g.credit_hours, 0)
                     / grades.reduce((sum, g) => sum + g.credit_hours, 0);
      expect(gpa).toBeCloseTo(parseFloat(expected.toFixed(2)), 2);
    }
  ), { numRuns: 100 });
});
```

---

## خطة التنفيذ الموصى بها

### الأسبوع 1:
- [ ] المهمة 16: إدارة رسوم التخصصات
- [ ] المهمة 17: بحث متقدم في Accountant Dashboard
- [ ] المهمة 18: صورة الملف الشخصي

### الأسبوع 2:
- [ ] المهمة 19: Doctor Dashboard
- [ ] المهمة 20: إصلاح Professor CRUD والجداول
- [ ] اختبار جميع الميزات

### الأسبوع 3:
- [ ] المهمة 21: نظام رابط التسجيل
- [ ] المهمة 22: تحسين تصميم Admin Dashboard
- [ ] كتابة Property Tests (1-4)

### الأسبوع 4:
- [ ] كتابة Property Tests (5-8)
- [ ] اختبار شامل
- [ ] إصلاح الأخطاء
- [ ] Documentation

---

## الموارد المفيدة

### الوثائق الموجودة:
1. `.kiro/specs/nctu-erp-completion/requirements.md` - المتطلبات الكاملة
2. `.kiro/specs/nctu-erp-completion/design.md` - التصميم التقني
3. `.kiro/specs/nctu-erp-completion/tasks.md` - قائمة المهام
4. `COMPLETED_TASKS_SUMMARY.md` - ملخص المهام المكتملة
5. `TIMETABLE_UPLOAD_FIX.md` - إصلاح رفع الجداول
6. `YEAR_MANAGEMENT_IMPLEMENTATION.md` - وثائق YearManagement

### الملفات المرجعية:
- `client/frontend/src/services/apiService.js` - جميع API calls
- `client/frontend/src/context/AuthContext.jsx` - المصادقة
- `client/frontend/src/index.css` - متغيرات الألوان
- `server/config/models.js` - جميع النماذج
- `server/middleware/auth.js` - المصادقة والتفويض

---

## نصائح مهمة

### 1. استخدام متغيرات الألوان
```css
/* ✅ صحيح */
background: var(--primary-color);
color: var(--secondary-color);

/* ❌ خطأ */
background: #0A2472;
color: #D4AF37;
```

### 2. RTL Support
```css
.container {
  direction: rtl;
  text-align: right;
}
```

### 3. API Calls
```javascript
// ✅ صحيح - استخدم apiService
import { coursesAPI } from '../../services/apiService';
await coursesAPI.getAll();

// ❌ خطأ - لا تستخدم axios مباشرة
import axios from 'axios';
await axios.get('/api/admin/courses');
```

### 4. FormData
```javascript
// ✅ صحيح - دع axios يضع Content-Type تلقائياً
const formData = new FormData();
formData.append('file', file);
await api.post('/upload', formData);

// ❌ خطأ - لا تضع Content-Type يدوياً
await api.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### 5. Error Handling
```javascript
try {
  const res = await api.get('/endpoint');
  setData(res.data.data);
  toast.success('تم بنجاح');
} catch (err) {
  console.error('Error:', err);
  toast.error(err.response?.data?.message || 'حدث خطأ');
}
```

---

## الاتصال والدعم

إذا واجهت أي مشاكل أو كان لديك أسئلة:
1. راجع الوثائق الموجودة
2. تحقق من الملفات المرجعية
3. اطلب المساعدة من Kiro AI Assistant

---

**آخر تحديث:** الآن
**الحالة:** دليل نشط
**المطور:** Kiro AI Assistant
