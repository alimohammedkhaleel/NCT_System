# دليل اختبار NCTU ERP System باستخدام Postman

## 📋 المحتويات
1. [إعداد البيئة](#إعداد-البيئة)
2. [استيراد المجموعة](#استيراد-المجموعة)
3. [خطوات الاختبار](#خطوات-الاختبار)
4. [السيناريوهات الكاملة](#السيناريوهات-الكاملة)
5. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## إعداد البيئة

### 1. تشغيل السيرفر
```bash
cd server
npm start
```
تأكد من أن السيرفر يعمل على `http://localhost:5000`

### 2. تشغيل قاعدة البيانات
تأكد من أن MySQL يعمل وقاعدة البيانات `nctu_erp` موجودة

### 3. تشغيل seed data (إذا لزم الأمر)
```bash
node server/reset-database.js
```

---

## استيراد المجموعة

### الطريقة 1: استيراد من ملف
1. افتح Postman
2. اضغط على **Import** في الزاوية العلوية اليسرى
3. اختر ملف `NCTU_ERP_Postman_Collection.json`
4. اضغط **Import**

### الطريقة 2: إنشاء Environment
1. اضغط على **Environments** في الشريط الجانبي
2. اضغط **Create Environment**
3. أضف المتغيرات التالية:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: (سيتم ملؤه تلقائياً بعد تسجيل الدخول)
   - `studentToken`: (سيتم ملؤه تلقائياً)
   - `professorToken`: (سيتم ملؤه تلقائياً)
   - `accountantToken`: (سيتم ملؤه تلقائياً)

---

## خطوات الاختبار

### المرحلة 1: اختبار المصادقة (Authentication)

#### 1.1 تسجيل دخول Admin
```
POST {{baseUrl}}/auth/login
Body:
{
  "username": "admin",
  "password": "admin123"
}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على `token`
- Token يُحفظ تلقائياً في المتغير `token`

**اختبار:**
- ✅ تسجيل دخول ناجح
- ✅ Token موجود في الاستجابة
- ✅ User role = "admin"

---

#### 1.2 الحصول على Profile
```
GET {{baseUrl}}/auth/profile
Headers:
  Authorization: Bearer {{token}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على بيانات المستخدم الكاملة

**اختبار:**
- ✅ البيانات الشخصية صحيحة
- ✅ Role = "admin"
- ✅ is_active = true

---

### المرحلة 2: اختبار التخصصات (Specialties)

#### 2.1 الحصول على جميع التخصصات
```
GET {{baseUrl}}/admin/specialties
Headers:
  Authorization: Bearer {{token}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على 6 تخصصات:
  - MCT (الميكاترونيكس)
  - AUT (السيارات)
  - ICT (تكنولوجيا المعلومات)
  - PRO (الإنتاج)
  - OIL (البترول)
  - REN (الطاقة المتجددة)

**اختبار:**
- ✅ عدد التخصصات = 6
- ✅ كل تخصص له code, name, arabic_name
- ✅ is_active = true لجميع التخصصات

---

#### 2.2 الحصول على تخصص محدد
```
GET {{baseUrl}}/admin/specialties/1
Headers:
  Authorization: Bearer {{token}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على تفاصيل التخصص مع السنوات الدراسية

---

#### 2.3 الحصول على التخصصات (Public Endpoint)
```
GET {{baseUrl}}/specialties
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- لا يحتاج إلى token
- يُرجع التخصصات النشطة فقط

**اختبار:**
- ✅ يعمل بدون authentication
- ✅ يُرجع التخصصات النشطة فقط

---

### المرحلة 3: اختبار السنوات الدراسية (Academic Years)

#### 3.1 الحصول على جميع السنوات الدراسية
```
GET {{baseUrl}}/admin/academic-years
Headers:
  Authorization: Bearer {{token}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على 24 سنة دراسية (6 تخصصات × 4 سنوات)
- كل سنة تحتوي على:
  - specialty_id
  - year_number (1-4)
  - year_label (السنة الأولى، الثانية، إلخ)
  - Specialty (معلومات التخصص)

**اختبار:**
- ✅ عدد السنوات = 24
- ✅ كل تخصص له 4 سنوات
- ✅ year_label بالعربية صحيح

---

#### 3.2 الحصول على سنوات تخصص محدد
```
GET {{baseUrl}}/admin/academic-years?specialty_id=1
Headers:
  Authorization: Bearer {{token}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على 4 سنوات للتخصص المحدد

---

#### 3.3 إنشاء سنة دراسية جديدة
```
POST {{baseUrl}}/admin/academic-years
Headers:
  Authorization: Bearer {{token}}
Body:
{
  "specialty_id": 1,
  "year_number": 5,
  "academic_season": "2024-2025"
}
```

**النتيجة المتوقعة:**
- Status: `201 Created`
- Response يحتوي على السنة الجديدة

**اختبار:**
- ✅ السنة تم إنشاؤها بنجاح
- ✅ لا يمكن إنشاء سنة مكررة (نفس specialty_id و year_number)

---

### المرحلة 4: اختبار الطلاب (Students)

#### 4.1 الحصول على جميع الطلاب
```
GET {{baseUrl}}/admin/students
Headers:
  Authorization: Bearer {{token}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على قائمة الطلاب

---

#### 4.2 البحث عن طلاب
```
GET {{baseUrl}}/admin/students?search=ahmed
Headers:
  Authorization: Bearer {{token}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على الطلاب الذين يطابقون البحث

**اختبار:**
- ✅ البحث يعمل في student_code
- ✅ البحث يعمل في national_id
- ✅ البحث يعمل في full_name

---

#### 4.3 إنشاء طالب جديد
```
POST {{baseUrl}}/admin/students
Headers:
  Authorization: Bearer {{token}}
Body:
{
  "full_name": "أحمد محمد علي",
  "email": "ahmed@test.com",
  "national_id": "30012345678901",
  "phone": "01234567890",
  "specialty_id": 1,
  "current_year": 1,
  "password": "password123"
}
```

**النتيجة المتوقعة:**
- Status: `201 Created`
- Response يحتوي على:
  - User (username, email, role="student")
  - Student (student_code, national_id, specialty_id)

**اختبار:**
- ✅ الطالب تم إنشاؤه بنجاح
- ✅ student_code تم توليده تلقائياً
- ✅ User و Student تم إنشاؤهما في transaction واحد
- ✅ لا يمكن إنشاء طالب برقم قومي مكرر

---

#### 4.4 ترقية طالب
```
POST {{baseUrl}}/admin/students/1/promote
Headers:
  Authorization: Bearer {{token}}
Body:
{
  "promotion_type": "semester"
}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- current_semester يزيد بمقدار 1

**اختبار:**
- ✅ ترقية semester تعمل
- ✅ ترقية year تعمل
- ✅ ترقية graduate تعمل
- ✅ لا يمكن ترقية طالب موقوف

---

### المرحلة 5: اختبار المواد (Courses)

#### 5.1 الحصول على جميع المواد
```
GET {{baseUrl}}/admin/courses
Headers:
  Authorization: Bearer {{token}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على قائمة المواد

---

#### 5.2 الحصول على مواد تخصص وسنة محددة
```
GET {{baseUrl}}/admin/courses?specialty_id=1&year_number=1
Headers:
  Authorization: Bearer {{token}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على مواد السنة الأولى للتخصص المحدد

---

#### 5.3 إنشاء مادة جديدة
```
POST {{baseUrl}}/admin/courses
Headers:
  Authorization: Bearer {{token}}
Body:
{
  "code": "CS101",
  "name": "Introduction to Programming",
  "arabic_name": "مقدمة في البرمجة",
  "credit_hours": 3,
  "specialty_id": 1,
  "year_number": 1,
  "semester": 1
}
```

**النتيجة المتوقعة:**
- Status: `201 Created`
- Response يحتوي على المادة الجديدة

**اختبار:**
- ✅ المادة تم إنشاؤها بنجاح
- ✅ لا يمكن إنشاء مادة بكود مكرر

---

### المرحلة 6: اختبار الأساتذة (Professors)

#### 6.1 الحصول على جميع الأساتذة
```
GET {{baseUrl}}/admin/professors
Headers:
  Authorization: Bearer {{token}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على قائمة الأساتذة

---

#### 6.2 إنشاء أستاذ جديد
```
POST {{baseUrl}}/admin/professors
Headers:
  Authorization: Bearer {{token}}
Body:
{
  "full_name": "د. محمد أحمد",
  "email": "prof.mohamed@nctu.edu.eg",
  "username": "prof_mohamed",
  "password": "prof123",
  "specialty_id": 1,
  "employee_id": "EMP001"
}
```

**النتيجة المتوقعة:**
- Status: `201 Created`
- Response يحتوي على:
  - User (role="professor")
  - Professor (professor_code, employee_id)

**اختبار:**
- ✅ الأستاذ تم إنشاؤه بنجاح
- ✅ لا يمكن إنشاء أستاذ بـ username مكرر
- ✅ لا يمكن إنشاء أستاذ بـ email مكرر

---

### المرحلة 7: اختبار روابط التسجيل (Registration Links)

#### 7.1 الحصول على جميع الروابط
```
GET {{baseUrl}}/admin/registration-links
Headers:
  Authorization: Bearer {{token}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على قائمة الروابط مع حالتها (active/expired/used)

---

#### 7.2 إنشاء رابط تسجيل جديد
```
POST {{baseUrl}}/admin/registration-links
Headers:
  Authorization: Bearer {{token}}
Body: {}
```

**النتيجة المتوقعة:**
- Status: `201 Created`
- Response يحتوي على:
  - token (UUID)
  - expires_at (بعد 24 ساعة)
  - url (الرابط الكامل)

**اختبار:**
- ✅ الرابط تم إنشاؤه بنجاح
- ✅ expires_at = الآن + 24 ساعة
- ✅ token فريد

---

### المرحلة 8: اختبار طلبات التسجيل (Registration Requests)

#### 8.1 الحصول على جميع الطلبات
```
GET {{baseUrl}}/admin/registration-requests
Headers:
  Authorization: Bearer {{token}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على قائمة الطلبات

---

#### 8.2 قبول طلب تسجيل
```
POST {{baseUrl}}/admin/registration-requests/1/approve
Headers:
  Authorization: Bearer {{token}}
Body: {}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على username و password للطالب الجديد
- تم إنشاء User و Student

**اختبار:**
- ✅ الطالب تم إنشاؤه بنجاح
- ✅ username = st_{last_6_digits_of_national_id}
- ✅ password = last_8_digits_of_national_id
- ✅ student_code تم توليده تلقائياً

---

#### 8.3 رفض طلب تسجيل
```
POST {{baseUrl}}/admin/registration-requests/1/reject
Headers:
  Authorization: Bearer {{token}}
Body:
{
  "notes": "معلومات غير كاملة"
}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- حالة الطلب تتغير إلى "rejected"

---

### المرحلة 9: اختبار الجداول الدراسية (Timetables)

#### 9.1 الحصول على جميع الجداول
```
GET {{baseUrl}}/admin/timetables
Headers:
  Authorization: Bearer {{token}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على قائمة الجداول

---

#### 9.2 رفع جدول دراسي جديد
```
POST {{baseUrl}}/admin/timetables
Headers:
  Authorization: Bearer {{token}}
Body (form-data):
  - title: "جدول السنة الأولى - الفصل الأول"
  - specialty_id: 1
  - file: [اختر ملف PDF]
```

**النتيجة المتوقعة:**
- Status: `201 Created`
- Response يحتوي على:
  - file_url (مسار الملف)
  - title, specialty_id

**اختبار:**
- ✅ الملف تم رفعه بنجاح
- ✅ file_url صحيح
- ✅ الملف موجود في server/uploads/timetables/

---

### المرحلة 10: اختبار Student Portal

#### 10.1 تسجيل دخول طالب
```
POST {{baseUrl}}/auth/student-login
Body:
{
  "student_code": "20241234",
  "national_id": "12345678901234"
}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على token
- Token يُحفظ في studentToken

---

#### 10.2 الحصول على Dashboard الطالب
```
GET {{baseUrl}}/grades/student/dashboard
Headers:
  Authorization: Bearer {{studentToken}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على:
  - student_info (الاسم، الكود، التخصص، السنة، الحالة)
  - summary (GPA، عدد المواد، الدرجات المعتمدة)

**اختبار:**
- ✅ GPA محسوب بشكل صحيح
- ✅ specialty_name موجود
- ✅ academic_status موجود

---

#### 10.3 الحصول على درجات الطالب
```
GET {{baseUrl}}/grades/student/grades
Headers:
  Authorization: Bearer {{studentToken}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على الدرجات المعتمدة فقط

**اختبار:**
- ✅ فقط الدرجات المعتمدة (status="approved")
- ✅ مجمّعة حسب السنة والفصل

---

#### 10.4 الحصول على فواتير الطالب
```
GET {{baseUrl}}/grades/student/invoices
Headers:
  Authorization: Bearer {{studentToken}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على:
  - total_invoiced
  - total_paid
  - total_due
  - invoices (قائمة الفواتير)

---

#### 10.5 الحصول على جدول الطالب
```
GET {{baseUrl}}/admin/timetables/student
Headers:
  Authorization: Bearer {{studentToken}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على الجداول الخاصة بتخصص وسنة الطالب

---

### المرحلة 11: اختبار Accountant

#### 11.1 الحصول على ملخص المحاسب
```
GET {{baseUrl}}/accountant/summary
Headers:
  Authorization: Bearer {{accountantToken}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على:
  - total_invoiced
  - total_paid
  - total_due
  - overdue_count

---

#### 11.2 الحصول على رسوم التخصصات
```
GET {{baseUrl}}/accountant/specialty-fees
Headers:
  Authorization: Bearer {{accountantToken}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على رسوم جميع التخصصات

---

#### 11.3 البحث عن طالب
```
GET {{baseUrl}}/accountant/students/search?national_id=12345678901234
Headers:
  Authorization: Bearer {{accountantToken}}
```

**النتيجة المتوقعة:**
- Status: `200 OK`
- Response يحتوي على بيانات الطالب الكاملة + الدرجات + الفواتير

---

## السيناريوهات الكاملة

### سيناريو 1: تسجيل طالب جديد عبر الرابط

1. **Admin ينشئ رابط تسجيل**
   ```
   POST /api/admin/registration-links
   ```

2. **الطالب يفتح الرابط ويملأ الفورم**
   ```
   GET /api/auth/register-link/{token}
   POST /api/auth/register-link/{token}
   Body: {full_name, national_id, email, specialty_id, ...}
   ```

3. **Admin يراجع الطلب**
   ```
   GET /api/admin/registration-requests
   ```

4. **Admin يقبل الطلب**
   ```
   POST /api/admin/registration-requests/{id}/approve
   ```

5. **الطالب يسجل دخول**
   ```
   POST /api/auth/student-login
   Body: {student_code, national_id}
   ```

---

### سيناريو 2: إدارة مواد سنة دراسية

1. **Admin يختار تخصص**
   ```
   GET /api/admin/specialties
   ```

2. **Admin يختار سنة دراسية**
   ```
   GET /api/admin/academic-years?specialty_id=1
   ```

3. **Admin يضيف مادة جديدة**
   ```
   POST /api/admin/courses
   Body: {code, name, arabic_name, specialty_id, year_number, semester}
   ```

4. **Admin يعيّن أستاذ للمادة**
   ```
   POST /api/admin/professor-courses
   Body: {professor_id, course_id}
   ```

---

### سيناريو 3: طالب يتحقق من درجاته

1. **الطالب يسجل دخول**
   ```
   POST /api/auth/student-login
   ```

2. **الطالب يفتح Dashboard**
   ```
   GET /api/grades/student/dashboard
   ```

3. **الطالب يشاهد درجاته**
   ```
   GET /api/grades/student/grades
   ```

4. **الطالب يشاهد جدوله**
   ```
   GET /api/admin/timetables/student
   ```

---

## استكشاف الأخطاء

### خطأ 401 Unauthorized
- **السبب**: Token غير صحيح أو منتهي
- **الحل**: سجل دخول مرة أخرى وتأكد من أن Token محفوظ في المتغير

### خطأ 403 Forbidden
- **السبب**: المستخدم ليس لديه صلاحية
- **الحل**: تأكد من أنك تستخدم Token الصحيح (admin/student/professor/accountant)

### خطأ 404 Not Found
- **السبب**: الـ endpoint غير موجود أو الـ ID غير صحيح
- **الحل**: تحقق من الـ URL والـ ID

### خطأ 500 Internal Server Error
- **السبب**: خطأ في السيرفر
- **الحل**: تحقق من logs السيرفر في الـ console

---

## نصائح للاختبار

1. **استخدم Environment Variables**
   - احفظ الـ tokens في متغيرات
   - استخدم `{{baseUrl}}` بدلاً من كتابة الـ URL كاملاً

2. **استخدم Tests Scripts**
   - أضف scripts لحفظ الـ tokens تلقائياً
   - أضف assertions للتحقق من الاستجابات

3. **استخدم Collection Runner**
   - شغّل جميع الـ requests دفعة واحدة
   - راجع النتائج في تقرير واحد

4. **احفظ الأمثلة**
   - احفظ responses ناجحة كأمثلة
   - استخدمها للمقارنة لاحقاً

---

## ملخص الـ Endpoints

| Category | Method | Endpoint | Auth Required |
|----------|--------|----------|---------------|
| Auth | POST | /auth/login | ❌ |
| Auth | POST | /auth/student-login | ❌ |
| Auth | GET | /auth/profile | ✅ |
| Specialties | GET | /specialties | ❌ |
| Admin Specialties | GET | /admin/specialties | ✅ Admin |
| Academic Years | GET | /admin/academic-years | ✅ Admin |
| Students | GET | /admin/students | ✅ Admin |
| Students | POST | /admin/students | ✅ Admin |
| Courses | GET | /admin/courses | ✅ Admin |
| Courses | POST | /admin/courses | ✅ Admin |
| Professors | GET | /admin/professors | ✅ Admin |
| Professors | POST | /admin/professors | ✅ Admin |
| Reg Links | GET | /admin/registration-links | ✅ Admin |
| Reg Links | POST | /admin/registration-links | ✅ Admin |
| Reg Requests | GET | /admin/registration-requests | ✅ Admin |
| Reg Requests | POST | /admin/registration-requests/:id/approve | ✅ Admin |
| Timetables | GET | /admin/timetables | ✅ Admin |
| Timetables | POST | /admin/timetables | ✅ Admin |
| Student Portal | GET | /grades/student/dashboard | ✅ Student |
| Student Portal | GET | /grades/student/grades | ✅ Student |
| Student Portal | GET | /grades/student/invoices | ✅ Student |
| Accountant | GET | /accountant/summary | ✅ Accountant |
| Accountant | GET | /accountant/specialty-fees | ✅ Accountant |

---

**آخر تحديث:** الآن  
**الإصدار:** 1.0  
**الحالة:** جاهز للاختبار ✅
