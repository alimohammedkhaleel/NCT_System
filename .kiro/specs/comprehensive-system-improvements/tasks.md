# مهام تحسينات النظام الشاملة

## Phase 1: Database & Backend Setup

### Task 1.1: Create Professor Registration Database Schema
**Priority:** High  
**Estimated Time:** 2 hours

**Description:**
إنشاء جدول professor_registration_requests وإضافة الـ indexes المطلوبة.

**Steps:**
1. إنشاء migration file جديد
2. إضافة schema للجدول
3. إضافة indexes للأداء
4. تشغيل migration
5. التحقق من إنشاء الجدول

**Files to Create/Modify:**
- `server/migrations/YYYYMMDDHHMMSS-create-professor-registration-requests.js`

**Acceptance Criteria:**
- [ ] الجدول تم إنشاؤه بنجاح
- [ ] جميع الـ columns موجودة
- [ ] الـ indexes تم إضافتها
- [ ] الـ foreign keys تعمل بشكل صحيح

---

### Task 1.2: Create Professor Registration Model
**Priority:** High  
**Estimated Time:** 1 hour

**Description:**
إنشاء Sequelize model لجدول professor_registration_requests.

**Steps:**
1. إنشاء ملف Model جديد
2. تعريف جميع الـ fields
3. إضافة الـ associations
4. إضافة الـ validations
5. إضافة helper methods

**Files to Create/Modify:**
- `server/models/ProfessorRegistrationRequest.js`

**Acceptance Criteria:**
- [ ] Model يعمل بشكل صحيح
- [ ] الـ validations تعمل
- [ ] الـ associations مع Specialty و User تعمل

---

### Task 1.3: Create Professor Registration Routes
**Priority:** High  
**Estimated Time:** 3 hours

**Description:**
إنشاء جميع الـ API endpoints لنظام تسجيل الدكاترة.

**Endpoints to Create:**
1. `POST /api/professor-registration/register` - تسجيل دكتور جديد
2. `GET /api/admin/professor-requests` - عرض جميع الطلبات
3. `GET /api/admin/professor-requests/:id` - عرض تفاصيل طلب
4. `POST /api/admin/professor-requests/:id/approve` - قبول طلب
5. `POST /api/admin/professor-requests/:id/reject` - رفض طلب
6. `DELETE /api/admin/professor-requests/:id` - حذف طلب

**Files to Create/Modify:**
- `server/routes/professorRegistrationRoutes.js`
- `server/controllers/professorRegistrationController.js`
- `server/index.js` (add route)

**Acceptance Criteria:**
- [ ] جميع الـ endpoints تعمل
- [ ] الـ validation تعمل على جميع المدخلات
- [ ] الـ authorization تعمل (admin only للـ admin endpoints)
- [ ] الـ error handling يعمل بشكل صحيح

---

### Task 1.4: Implement Professor Approval Logic
**Priority:** High  
**Estimated Time:** 2 hours

**Description:**
تنفيذ منطق قبول طلب الدكتور وإنشاء حساب له.

**Steps:**
1. التحقق من عدم وجود user بنفس البريد أو الرقم القومي
2. إنشاء user جديد في جدول users
3. إنشاء professor record في جدول professors
4. توليد professor_code
5. تحديث حالة الطلب إلى approved
6. إرسال email للدكتور بالبيانات

**Files to Modify:**
- `server/controllers/professorRegistrationController.js`
- `server/services/emailService.js` (if needed)

**Acceptance Criteria:**
- [ ] يتم إنشاء user و professor بنجاح
- [ ] professor_code يتم توليده بشكل صحيح
- [ ] الطلب يتم تحديثه إلى approved
- [ ] لا يمكن قبول طلب مرتين

---

## Phase 2: Student Management Improvements

### Task 2.1: Create Bulk Student Approval Endpoint
**Priority:** High  
**Estimated Time:** 2 hours

**Description:**
إنشاء endpoint لقبول جميع الطلاب المعلقين دفعة واحدة.

**Steps:**
1. إنشاء endpoint جديد
2. جلب جميع الطلاب المعلقين
3. معالجة كل طلب (مع error handling)
4. إرجاع نتيجة العملية

**Files to Create/Modify:**
- `server/routes/adminRoutes.js`
- `server/controllers/adminController.js`

**Acceptance Criteria:**
- [ ] يمكن قبول جميع الطلاب دفعة واحدة
- [ ] يتم معالجة الأخطاء بشكل صحيح
- [ ] يتم إرجاع تقرير بالنتائج

---

### Task 2.2: Add Delete Registration Request Endpoint
**Priority:** Medium  
**Estimated Time:** 1 hour

**Description:**
إضافة endpoint لحذف طلب تسجيل طالب نهائياً.

**Steps:**
1. إضافة DELETE endpoint
2. التحقق من الصلاحيات
3. حذف الطلب من قاعدة البيانات
4. إرجاع رسالة نجاح

**Files to Modify:**
- `server/routes/adminRoutes.js`
- `server/controllers/adminController.js`

**Acceptance Criteria:**
- [ ] يمكن حذف الطلب بنجاح
- [ ] لا يمكن حذف طلب مقبول
- [ ] الـ authorization تعمل

---

### Task 2.3: Create Bulk Pending Requests View Endpoint
**Priority:** Medium  
**Estimated Time:** 1 hour

**Description:**
إنشاء endpoint لعرض جميع الطلبات المعلقة في view واحد.

**Steps:**
1. إنشاء endpoint جديد
2. جلب جميع الطلبات المعلقة مع البيانات الكاملة
3. إضافة فلاتر (تخصص، تاريخ، مجموع)
4. إرجاع البيانات

**Files to Modify:**
- `server/routes/adminRoutes.js`
- `server/controllers/adminController.js`

**Acceptance Criteria:**
- [ ] يتم عرض جميع الطلبات المعلقة
- [ ] الفلاتر تعمل بشكل صحيح
- [ ] البيانات كاملة ومنظمة

---

## Phase 3: Results Management System

### Task 3.1: Create All Results View Endpoint
**Priority:** Medium  
**Estimated Time:** 3 hours

**Description:**
إنشاء endpoint لعرض جميع نتائج الطلاب مع فلاتر شاملة.

**Steps:**
1. إنشاء endpoint جديد
2. جلب جميع النتائج مع الـ joins المطلوبة
3. إضافة فلاتر (تخصص، سنة، فصل، حالة)
4. حساب الإحصائيات
5. إرجاع البيانات

**Files to Create/Modify:**
- `server/routes/adminRoutes.js`
- `server/controllers/resultsController.js`

**Acceptance Criteria:**
- [ ] يتم عرض جميع النتائج
- [ ] الفلاتر تعمل بشكل صحيح
- [ ] الإحصائيات دقيقة
- [ ] الأداء جيد (pagination)

---

### Task 3.2: Create Pending Results View Endpoint
**Priority:** Medium  
**Estimated Time:** 2 hours

**Description:**
إنشاء endpoint لعرض جميع النتائج المعلقة (غير المعتمدة).

**Steps:**
1. إنشاء endpoint جديد
2. جلب جميع الدرجات بحالة pending
3. إضافة معلومات الطالب والمادة والدكتور
4. إضافة فلاتر
5. إرجاع البيانات

**Files to Modify:**
- `server/routes/adminRoutes.js`
- `server/controllers/resultsController.js`

**Acceptance Criteria:**
- [ ] يتم عرض جميع النتائج المعلقة
- [ ] البيانات كاملة (طالب، مادة، دكتور)
- [ ] الفلاتر تعمل

---

### Task 3.3: Create Results Export Endpoint
**Priority:** Low  
**Estimated Time:** 2 hours

**Description:**
إنشاء endpoint لتصدير النتائج كملف CSV أو Excel.

**Steps:**
1. إنشاء endpoint جديد
2. جلب البيانات المطلوبة
3. تحويلها إلى CSV/Excel
4. إرجاع الملف للتحميل

**Files to Create/Modify:**
- `server/routes/adminRoutes.js`
- `server/controllers/resultsController.js`
- `server/utils/exportHelper.js`

**Dependencies:**
- Install: `npm install xlsx csv-writer`

**Acceptance Criteria:**
- [ ] يمكن تصدير النتائج كـ CSV
- [ ] يمكن تصدير النتائج كـ Excel
- [ ] الملف يحتوي على جميع البيانات المطلوبة

---

## Phase 4: Frontend - Professor Registration

### Task 4.1: Create Professor Registration Form Component
**Priority:** High  
**Estimated Time:** 3 hours

**Description:**
إنشاء صفحة تسجيل الدكاترة مع form validation.

**Steps:**
1. إنشاء component جديد
2. إضافة جميع الحقول المطلوبة
3. إضافة validation
4. ربط الـ form بالـ API
5. إضافة success/error messages

**Files to Create:**
- `client/frontend/src/pages/ProfessorRegistration/ProfessorRegistrationForm.jsx`
- `client/frontend/src/pages/ProfessorRegistration/ProfessorRegistrationForm.module.css`

**Acceptance Criteria:**
- [ ] الـ form يعمل بشكل صحيح
- [ ] الـ validation تعمل على جميع الحقول
- [ ] رسائل الخطأ واضحة
- [ ] التصميم متسق مع باقي النظام

---

### Task 4.2: Create Professor Requests Admin Page
**Priority:** High  
**Estimated Time:** 4 hours

**Description:**
إنشاء صفحة للأدمن لعرض وإدارة طلبات تسجيل الدكاترة.

**Steps:**
1. إنشاء component جديد
2. عرض جميع الطلبات في جدول
3. إضافة فلاتر (حالة، تخصص، بحث)
4. إضافة أزرار (عرض، قبول، رفض، حذف)
5. إضافة modal لعرض التفاصيل
6. ربط بالـ API

**Files to Create:**
- `client/frontend/src/pages/Admin/ProfessorRequests.jsx`
- `client/frontend/src/pages/Admin/ProfessorRequests.module.css`

**Acceptance Criteria:**
- [ ] يتم عرض جميع الطلبات
- [ ] الفلاتر تعمل
- [ ] يمكن قبول/رفض/حذف الطلبات
- [ ] Modal يعرض جميع التفاصيل

---

### Task 4.3: Add Professor Registration Link to Admin Dashboard
**Priority:** Medium  
**Estimated Time:** 30 minutes

**Description:**
إضافة بطاقة في Admin Dashboard للوصول لصفحة طلبات الدكاترة.

**Steps:**
1. إضافة card جديد في managementCards
2. إضافة badge لعدد الطلبات المعلقة
3. إضافة route في App.jsx

**Files to Modify:**
- `client/frontend/src/pages/Admin/AdminDashboard.jsx`
- `client/frontend/src/App.jsx`

**Acceptance Criteria:**
- [ ] البطاقة تظهر في Dashboard
- [ ] Badge يعرض العدد الصحيح
- [ ] الرابط يعمل

---

## Phase 5: Frontend - Student Management Improvements

### Task 5.1: Create Bulk Student Approval Modal
**Priority:** High  
**Estimated Time:** 3 hours

**Description:**
إنشاء modal لقبول جميع الطلاب المعلقين دفعة واحدة.

**Steps:**
1. إنشاء component جديد
2. عرض جميع الطلاب المعلقين
3. إضافة checkboxes للاختيار
4. إضافة زر "قبول الكل"
5. عرض progress bar أثناء المعالجة
6. عرض النتائج

**Files to Create:**
- `client/frontend/src/components/admin/BulkStudentApproval.jsx`
- `client/frontend/src/components/admin/BulkStudentApproval.module.css`

**Acceptance Criteria:**
- [ ] يتم عرض جميع الطلاب المعلقين
- [ ] يمكن اختيار طلاب محددين
- [ ] يمكن قبول الكل دفعة واحدة
- [ ] يتم عرض progress bar
- [ ] يتم عرض النتائج (نجح/فشل)

---

### Task 5.2: Add Delete Button to Registration Requests
**Priority:** Medium  
**Estimated Time:** 1 hour

**Description:**
إضافة زر حذف في صفحة طلبات التسجيل.

**Steps:**
1. إضافة زر "حذف" في الجدول
2. إضافة confirmation dialog
3. ربط بالـ API
4. تحديث القائمة بعد الحذف

**Files to Modify:**
- `client/frontend/src/pages/Admin/RegistrationRequests.jsx`

**Acceptance Criteria:**
- [ ] زر الحذف يظهر للطلبات المعلقة والمرفوضة
- [ ] يظهر confirmation dialog
- [ ] يتم حذف الطلب بنجاح
- [ ] القائمة تتحدث تلقائياً

---

### Task 5.3: Add Bulk Approve Button to Registration Requests
**Priority:** High  
**Estimated Time:** 2 hours

**Description:**
إضافة زر "قبول الكل" في صفحة طلبات التسجيل.

**Steps:**
1. إضافة زر في header
2. فتح BulkStudentApproval modal عند الضغط
3. تحديث القائمة بعد القبول

**Files to Modify:**
- `client/frontend/src/pages/Admin/RegistrationRequests.jsx`

**Acceptance Criteria:**
- [ ] الزر يظهر في الـ header
- [ ] يفتح الـ modal عند الضغط
- [ ] القائمة تتحدث بعد القبول

---

## Phase 6: Frontend - Results Management

### Task 6.1: Create All Results View Page
**Priority:** Medium  
**Estimated Time:** 4 hours

**Description:**
إنشاء صفحة لعرض جميع نتائج الطلاب مع فلاتر وإحصائيات.

**Steps:**
1. إنشاء component جديد
2. عرض النتائج في جدول
3. إضافة فلاتر (تخصص، سنة، فصل، حالة)
4. عرض إحصائيات (إجمالي، ناجح، راسب، GPA)
5. إضافة زر تصدير
6. إضافة pagination

**Files to Create:**
- `client/frontend/src/pages/Admin/AllResultsView.jsx`
- `client/frontend/src/pages/Admin/AllResultsView.module.css`

**Acceptance Criteria:**
- [ ] يتم عرض جميع النتائج
- [ ] الفلاتر تعمل بشكل صحيح
- [ ] الإحصائيات دقيقة
- [ ] يمكن تصدير النتائج
- [ ] Pagination يعمل

---

### Task 6.2: Create Pending Results View Page
**Priority:** Medium  
**Estimated Time:** 3 hours

**Description:**
إنشاء صفحة لعرض جميع النتائج المعلقة (غير المعتمدة).

**Steps:**
1. إنشاء component جديد
2. عرض النتائج المعلقة في جدول
3. إضافة معلومات الطالب والمادة والدكتور
4. إضافة فلاتر
5. إضافة زر للانتقال لصفحة الاعتماد

**Files to Create:**
- `client/frontend/src/pages/Admin/PendingResultsView.jsx`
- `client/frontend/src/pages/Admin/PendingResultsView.module.css`

**Acceptance Criteria:**
- [ ] يتم عرض جميع النتائج المعلقة
- [ ] البيانات كاملة ومنظمة
- [ ] الفلاتر تعمل
- [ ] يمكن الانتقال لصفحة الاعتماد

---

### Task 6.3: Add Results Buttons to Admin Dashboard
**Priority:** Medium  
**Estimated Time:** 30 minutes

**Description:**
إضافة بطاقات في Admin Dashboard للوصول لصفحات النتائج.

**Steps:**
1. إضافة card "عرض جميع النتائج"
2. إضافة card "عرض النتائج المعلقة"
3. إضافة routes في App.jsx

**Files to Modify:**
- `client/frontend/src/pages/Admin/AdminDashboard.jsx`
- `client/frontend/src/App.jsx`

**Acceptance Criteria:**
- [ ] البطاقات تظهر في Dashboard
- [ ] الروابط تعمل
- [ ] التصميم متسق

---

## Phase 7: Testing with Postman Power

### Task 7.1: Install and Configure Postman Power
**Priority:** High  
**Estimated Time:** 30 minutes

**Description:**
تثبيت وتفعيل Postman Power للاختبار.

**Steps:**
1. تفعيل Postman Power
2. إنشاء workspace جديد
3. إنشاء environment للـ API
4. إضافة base URL و token

**Acceptance Criteria:**
- [ ] Postman Power مفعّل
- [ ] Workspace تم إنشاؤه
- [ ] Environment تم إعداده

---

### Task 7.2: Create Professor Registration Test Collection
**Priority:** High  
**Estimated Time:** 2 hours

**Description:**
إنشاء collection في Postman لاختبار جميع endpoints تسجيل الدكاترة.

**Tests to Create:**
1. Register new professor (success)
2. Register with duplicate email (fail)
3. Register with invalid data (fail)
4. Get all professor requests (admin)
5. Approve professor request (admin)
6. Reject professor request (admin)
7. Delete professor request (admin)

**Acceptance Criteria:**
- [ ] جميع الـ tests تعمل
- [ ] الـ assertions صحيحة
- [ ] الـ error cases مغطاة

---

### Task 7.3: Create Student Management Test Collection
**Priority:** High  
**Estimated Time:** 2 hours

**Description:**
إنشاء collection لاختبار endpoints إدارة الطلاب.

**Tests to Create:**
1. Register new student
2. Get all registration requests
3. Approve single request
4. Approve all pending requests
5. Reject request
6. Delete request

**Acceptance Criteria:**
- [ ] جميع الـ tests تعمل
- [ ] Bulk operations تعمل بشكل صحيح
- [ ] الـ error handling يعمل

---

### Task 7.4: Create Student Promotion Test Collection
**Priority:** High  
**Estimated Time:** 4 hours

**Description:**
إنشاء collection شامل لاختبار جميع سيناريوهات انتقال الطلاب.

**Test Scenarios:**
1. **Semester Promotion (Success)**
   - Setup: Student in Year 1, Semester 1, all courses passed
   - Action: Promote to Semester 2
   - Expected: Student moved to Semester 2, status = active

2. **Year Promotion (Success)**
   - Setup: Student in Year 1, Semester 2, all courses passed
   - Action: Bulk promote
   - Expected: Student moved to Year 2, Semester 1

3. **Failed One Course**
   - Setup: Student with 1 failed course
   - Action: Bulk promote
   - Expected: Student stays in same year, status = repeat_year

4. **Summer Study Required**
   - Setup: Student with 2 failed courses
   - Action: Bulk promote
   - Expected: Student marked for summer study

5. **Repeat Year**
   - Setup: Student with 3+ failed courses
   - Action: Bulk promote
   - Expected: Student repeats year

6. **Graduation**
   - Setup: Year 4 student, all courses passed, 144 credits
   - Action: Bulk promote
   - Expected: Student graduated, status = graduated

**Acceptance Criteria:**
- [ ] جميع السيناريوهات تعمل بشكل صحيح
- [ ] البيانات متسقة في قاعدة البيانات
- [ ] لا توجد أخطاء في الـ logs
- [ ] الـ edge cases مغطاة

---

### Task 7.5: Create Results Management Test Collection
**Priority:** Medium  
**Estimated Time:** 2 hours

**Description:**
إنشاء collection لاختبار endpoints إدارة النتائج.

**Tests to Create:**
1. Get all results (with filters)
2. Get pending results
3. Export results (CSV)
4. Export results (Excel)
5. Publish results
6. Approve pending grades

**Acceptance Criteria:**
- [ ] جميع الـ endpoints تعمل
- [ ] الفلاتر تعمل بشكل صحيح
- [ ] التصدير يعمل
- [ ] البيانات دقيقة

---

## Phase 8: Documentation & Deployment

### Task 8.1: Update API Documentation
**Priority:** Medium  
**Estimated Time:** 2 hours

**Description:**
تحديث ملف API documentation بجميع الـ endpoints الجديدة.

**Files to Create/Modify:**
- `API_DOCUMENTATION.md`

**Acceptance Criteria:**
- [ ] جميع الـ endpoints موثقة
- [ ] الأمثلة واضحة
- [ ] الـ error responses موثقة

---

### Task 8.2: Create User Guide for Admin
**Priority:** Low  
**Estimated Time:** 2 hours

**Description:**
إنشاء دليل مستخدم للأدمن لشرح الميزات الجديدة.

**Files to Create:**
- `ADMIN_USER_GUIDE.md`

**Content:**
- كيفية إدارة طلبات تسجيل الدكاترة
- كيفية قبول الطلاب دفعة واحدة
- كيفية عرض وتصدير النتائج
- كيفية إدارة انتقال الطلاب

**Acceptance Criteria:**
- [ ] الدليل شامل وواضح
- [ ] يحتوي على screenshots
- [ ] يغطي جميع الميزات الجديدة

---

### Task 8.3: Run Database Migration in Production
**Priority:** High  
**Estimated Time:** 30 minutes

**Description:**
تشغيل migration في production لإنشاء الجداول الجديدة.

**Steps:**
1. Backup قاعدة البيانات
2. تشغيل migration
3. التحقق من إنشاء الجداول
4. التحقق من الـ indexes

**Acceptance Criteria:**
- [ ] Migration تم بنجاح
- [ ] الجداول موجودة
- [ ] الـ indexes موجودة
- [ ] لا توجد أخطاء

---

### Task 8.4: Deploy Backend Changes
**Priority:** High  
**Estimated Time:** 1 hour

**Description:**
نشر التغييرات في الـ backend على الـ production server.

**Steps:**
1. Push code to repository
2. Pull على الـ server
3. Install dependencies
4. Restart server
5. Test endpoints

**Acceptance Criteria:**
- [ ] الكود تم نشره
- [ ] الـ server يعمل
- [ ] جميع الـ endpoints تعمل
- [ ] لا توجد أخطاء في الـ logs

---

### Task 8.5: Deploy Frontend Changes
**Priority:** High  
**Estimated Time:** 1 hour

**Description:**
نشر التغييرات في الـ frontend على الـ production server.

**Steps:**
1. Build frontend
2. Upload build files
3. Clear cache
4. Test all pages

**Acceptance Criteria:**
- [ ] الـ build نجح
- [ ] الملفات تم رفعها
- [ ] جميع الصفحات تعمل
- [ ] التصميم صحيح

---

## Phase 9: Monitoring & Optimization

### Task 9.1: Monitor Error Logs
**Priority:** High  
**Estimated Time:** Ongoing

**Description:**
مراقبة الـ error logs للتأكد من عدم وجود مشاكل.

**Steps:**
1. فحص الـ logs يومياً
2. معالجة أي أخطاء
3. تحسين الأداء إذا لزم الأمر

**Acceptance Criteria:**
- [ ] لا توجد أخطاء critical
- [ ] الأداء جيد
- [ ] المستخدمون راضون

---

### Task 9.2: Optimize Database Queries
**Priority:** Medium  
**Estimated Time:** 2 hours

**Description:**
تحسين الاستعلامات البطيئة وإضافة indexes إضافية إذا لزم الأمر.

**Steps:**
1. تحليل slow queries
2. إضافة indexes
3. تحسين الـ joins
4. قياس التحسن

**Acceptance Criteria:**
- [ ] جميع الاستعلامات سريعة (< 1s)
- [ ] الـ indexes محسّنة
- [ ] الأداء تحسّن

---

### Task 9.3: Add Analytics Tracking
**Priority:** Low  
**Estimated Time:** 2 hours

**Description:**
إضافة tracking للميزات الجديدة لمعرفة الاستخدام.

**Metrics to Track:**
- عدد طلبات تسجيل الدكاترة
- عدد الطلاب المقبولين دفعة واحدة
- عدد مرات عرض النتائج
- عدد مرات التصدير

**Acceptance Criteria:**
- [ ] الـ analytics تعمل
- [ ] البيانات دقيقة
- [ ] يمكن عرض التقارير

---

## Summary

**Total Tasks:** 39  
**Estimated Total Time:** 60-70 hours

**Priority Breakdown:**
- High Priority: 20 tasks
- Medium Priority: 14 tasks
- Low Priority: 5 tasks

**Phase Breakdown:**
1. Database & Backend Setup: 4 tasks (8 hours)
2. Student Management Improvements: 3 tasks (5 hours)
3. Results Management System: 3 tasks (7 hours)
4. Frontend - Professor Registration: 3 tasks (7.5 hours)
5. Frontend - Student Management: 3 tasks (6 hours)
6. Frontend - Results Management: 3 tasks (7.5 hours)
7. Testing with Postman: 5 tasks (10.5 hours)
8. Documentation & Deployment: 5 tasks (6.5 hours)
9. Monitoring & Optimization: 3 tasks (4+ hours)

**Recommended Order:**
1. Start with Phase 1 (Database & Backend)
2. Then Phase 2 & 3 (Backend improvements)
3. Then Phase 4, 5, 6 (Frontend)
4. Then Phase 7 (Testing)
5. Finally Phase 8 & 9 (Deployment & Monitoring)
