# دليل اختبار نظام NCTU ERP باستخدام Postman

## 📋 المحتويات
1. [إعداد البيئة](#إعداد-البيئة)
2. [بيانات تسجيل الدخول](#بيانات-تسجيل-الدخول)
3. [اختبار انتقال الطلاب للسنة الجديدة](#اختبار-انتقال-الطلاب)
4. [اختبار لوحة تحكم الدكتور](#اختبار-لوحة-الدكتور)
5. [اختبار لوحة تحكم المحاسب](#اختبار-لوحة-المحاسب)
6. [اختبار لوحة تحكم الطالب](#اختبار-لوحة-الطالب)

---

## إعداد البيئة

### 1. إنشاء Environment في Postman

اسم البيئة: `NCTU ERP - Local`

المتغيرات:
```
base_url: http://localhost:5000
token: (سيتم ملؤه تلقائياً)
student_token: (سيتم ملؤه تلقائياً)
professor_token: (سيتم ملؤه تلقائياً)
accountant_token: (سيتم ملؤه تلقائياً)
```

---

## بيانات تسجيل الدخول

### 👤 Admin (المدير)
```
Username: admin
Password: admin123
```

### 👨‍🏫 Professors (الدكاترة)

**الدكتور 1:**
```
Username: professor
Password: professor123
Email: professor@nctu.edu
Full Name: Prof. Mohamed Ali
```

**الدكتور 2:**
```
Username: professor1
Password: prof123
Email: prof@nctu.edu
Full Name: Prof. Ahmed Hassan
```

### 👨‍🎓 Students (الطلاب)

**طالب موجود:**
```
Student Code: (سيتم إنشاؤه)
National ID: (سيتم إنشاؤه)
Username: student1
Password: student123
```

### 💰 Accountant (المحاسب)
```
Username: accountant
Password: accountant123
```

---

## 🔄 اختبار انتقال الطلاب للسنة الجديدة

### الخطوة 1: تسجيل الدخول كمدير

**Request:**
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set('token', jsonData.data.token);
    pm.test('Admin login successful', () => {
        pm.response.to.have.status(200);
    });
}
```

### الخطوة 2: إنشاء رابط تسجيل للطلاب

**Request:**
```http
POST {{base_url}}/api/admin/registration-links
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "expires_at": "2026-12-31T23:59:59.000Z",
  "max_uses": 100
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "token": "abc123xyz",
    "expires_at": "2026-12-31T23:59:59.000Z"
  }
}
```

**Test Script:**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set('registration_token', jsonData.data.token);
    pm.test('Registration link created', () => {
        pm.response.to.have.status(201);
    });
}
```

### الخطوة 3: تسجيل طالب جديد (عبر رابط التسجيل)

**Request:**
```http
POST {{base_url}}/api/auth/register-link/{{registration_token}}
Content-Type: application/json

{
  "full_name": "أحمد محمد علي",
  "national_id": "30112011234567",
  "email": "ahmed.mohamed@student.nctu.edu",
  "phone": "+20-10-12345678",
  "specialty_id": 3,
  "birth_date": "2001-01-15",
  "gender": "male",
  "address": "القاهرة، مصر",
  "current_year": 1,
  "high_school_certificate": "ثانوية عامة",
  "high_school_grade": 85.5,
  "guardian_name": "محمد علي",
  "guardian_phone": "+20-10-98765432",
  "guardian_relation": "والد"
}
```

**Test Script:**
```javascript
pm.test('Registration request submitted', () => {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});
```

### الخطوة 4: الموافقة على طلب التسجيل

**Request:**
```http
GET {{base_url}}/api/admin/registration-requests
Authorization: Bearer {{token}}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.length > 0) {
        pm.environment.set('request_id', jsonData.data[0].id);
    }
}
```

**Approve Request:**
```http
POST {{base_url}}/api/admin/registration-requests/{{request_id}}/approve
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "student_code": "NCTU-26-002"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set('new_student_code', jsonData.data.student_code);
    pm.environment.set('new_student_national_id', jsonData.data.national_id);
    pm.test('Student approved successfully', () => {
        pm.response.to.have.status(200);
    });
}
```

### الخطوة 5: إنشاء طلاب إضافيين للاختبار

**طالب 2 - السنة الأولى:**
```json
{
  "full_name": "فاطمة أحمد حسن",
  "national_id": "30203011234568",
  "email": "fatma.ahmed@student.nctu.edu",
  "phone": "+20-11-23456789",
  "specialty_id": 3,
  "birth_date": "2002-03-20",
  "gender": "female",
  "current_year": 1
}
```

**طالب 3 - السنة الثانية:**
```json
{
  "full_name": "محمود خالد سعيد",
  "national_id": "29905151234569",
  "email": "mahmoud.khaled@student.nctu.edu",
  "phone": "+20-12-34567890",
  "specialty_id": 3,
  "birth_date": "1999-05-15",
  "gender": "male",
  "current_year": 2
}
```

### الخطوة 6: نقل الطلاب للسنة الجديدة

**Get Academic Years:**
```http
GET {{base_url}}/api/admin/academic-years
Authorization: Bearer {{token}}
```

**Promote Students to Next Year:**
```http
POST {{base_url}}/api/admin/promote-year
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "from_year": 1,
  "to_year": 2,
  "specialty_id": 3,
  "academic_year_id": 2
}
```

**Test Script:**
```javascript
pm.test('Students promoted successfully', () => {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});
```

---

## 👨‍🏫 اختبار لوحة تحكم الدكتور

### الخطوة 1: تسجيل الدخول كدكتور

**Request:**
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "username": "professor",
  "password": "professor123"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set('professor_token', jsonData.data.token);
    pm.test('Professor login successful', () => {
        pm.response.to.have.status(200);
    });
}
```

### الخطوة 2: عرض لوحة التحكم

**Request:**
```http
GET {{base_url}}/api/grades/professor/dashboard
Authorization: Bearer {{professor_token}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total_courses": 5,
    "total_students": 120,
    "pending_grades": 15,
    "submitted_grades": 105,
    "courses": [
      {
        "id": 1,
        "code": "ICT101",
        "name": "Introduction to Programming",
        "arabic_name": "مقدمة في البرمجة",
        "students_count": 30
      }
    ]
  }
}
```

**Test Script:**
```javascript
pm.test('Dashboard loaded successfully', () => {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('total_courses');
    pm.expect(jsonData.data).to.have.property('total_students');
});
```

### الخطوة 3: عرض المقررات المسندة

**Request:**
```http
GET {{base_url}}/api/grades/professor/courses
Authorization: Bearer {{professor_token}}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.length > 0) {
        pm.environment.set('professor_course_id', jsonData.data[0].id);
    }
}
```

### الخطوة 4: عرض الطلاب في مقرر معين

**Request:**
```http
GET {{base_url}}/api/grades/professor/students-by-course?course_id={{professor_course_id}}
Authorization: Bearer {{professor_token}}
```

**Test Script:**
```javascript
pm.test('Students list loaded', () => {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('array');
});
```

### الخطوة 5: إدخال درجات الطلاب

**Request:**
```http
POST {{base_url}}/api/grades
Authorization: Bearer {{professor_token}}
Content-Type: application/json

{
  "student_id": 1,
  "course_id": 1,
  "semester_id": 1,
  "midterm_grade": 25,
  "final_grade": 35,
  "coursework_grade": 18,
  "practical_grade": 9,
  "total_grade": 87,
  "letter_grade": "A",
  "status": "draft"
}
```

**Test Script:**
```javascript
pm.test('Grade submitted successfully', () => {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});
```

### الخطوة 6: إرسال الدرجات للموافقة

**Request:**
```http
POST {{base_url}}/api/grades/{{grade_id}}/submit-for-approval
Authorization: Bearer {{professor_token}}
```

---

## 💰 اختبار لوحة تحكم المحاسب

### الخطوة 1: تسجيل الدخول كمحاسب

**Request:**
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "username": "accountant",
  "password": "accountant123"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set('accountant_token', jsonData.data.token);
}
```

### الخطوة 2: عرض جميع الطلاب

**Request:**
```http
GET {{base_url}}/api/accountant/students
Authorization: Bearer {{accountant_token}}
```

**Test Script:**
```javascript
pm.test('Students list loaded', () => {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('array');
});
```

### الخطوة 3: إنشاء فاتورة لطالب

**Request:**
```http
POST {{base_url}}/api/accountant/invoices
Authorization: Bearer {{accountant_token}}
Content-Type: application/json

{
  "student_id": 1,
  "amount": 12000.00,
  "description": "رسوم السنة الدراسية الأولى",
  "due_date": "2026-09-30"
}
```

**Test Script:**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set('invoice_id', jsonData.data.id);
}
```

### الخطوة 4: تسجيل دفعة مالية

**Request:**
```http
POST {{base_url}}/api/accountant/payments
Authorization: Bearer {{accountant_token}}
Content-Type: application/json

{
  "student_id": 1,
  "amount": 6000.00,
  "payment_method": "cash",
  "reference_number": "PAY-2026-001",
  "notes": "دفعة أولى"
}
```

**Test Script:**
```javascript
pm.test('Payment recorded successfully', () => {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});
```

### الخطوة 5: عرض تقرير المدفوعات

**Request:**
```http
GET {{base_url}}/api/accountant/payments/report?start_date=2026-01-01&end_date=2026-12-31
Authorization: Bearer {{accountant_token}}
```

---

## 👨‍🎓 اختبار لوحة تحكم الطالب

### الخطوة 1: تسجيل الدخول كطالب

**Request:**
```http
POST {{base_url}}/api/auth/student-login
Content-Type: application/json

{
  "student_code": "{{new_student_code}}",
  "national_id": "{{new_student_national_id}}"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set('student_token', jsonData.data.token);
}
```

### الخطوة 2: عرض بيانات الطالب

**Request:**
```http
GET {{base_url}}/api/student/data
Authorization: Bearer {{student_token}}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "payment_status": "partial",
    "total_invoiced": 12000.00,
    "total_paid": 6000.00,
    "total_due": 6000.00,
    "result_status": "not_published",
    "grades_count": 0,
    "last_updated": "2026-04-24T10:30:00.000Z"
  }
}
```

### الخطوة 3: عرض حالة الدفع

**Request:**
```http
GET {{base_url}}/api/grades/student/payment-status
Authorization: Bearer {{student_token}}
```

### الخطوة 4: عرض الفواتير

**Request:**
```http
GET {{base_url}}/api/grades/student/invoices
Authorization: Bearer {{student_token}}
```

### الخطوة 5: عرض الدرجات (إذا تم الدفع)

**Request:**
```http
GET {{base_url}}/api/grades/student/grades
Authorization: Bearer {{student_token}}
```

**Note:** سيتم رفض الطلب إذا لم يتم دفع جميع المستحقات

### الخطوة 6: عرض QR Code للتسجيل

**Request:**
```http
GET {{base_url}}/api/grades/student/qr-code
Authorization: Bearer {{student_token}}
```

---

## 📊 سيناريو اختبار كامل

### السيناريو: دورة حياة طالب كاملة

1. **المدير ينشئ رابط تسجيل**
2. **الطالب يسجل عبر الرابط**
3. **المدير يوافق على الطلب**
4. **المحاسب ينشئ فاتورة للطالب**
5. **الطالب يسجل دخول ويرى الفاتورة**
6. **المحاسب يسجل دفعة مالية**
7. **الدكتور يدخل درجات الطالب**
8. **الدكتور يرسل الدرجات للموافقة**
9. **المدير يوافق على الدرجات**
10. **المدير ينشر النتائج**
11. **الطالب يرى درجاته (بعد الدفع الكامل)**
12. **المدير ينقل الطالب للسنة التالية**

---

## 🔍 نصائح الاختبار

### 1. استخدام Tests في Postman

أضف هذا الكود في تبويب "Tests" لكل request:

```javascript
// حفظ التوكن تلقائياً
if (pm.response.code === 200 && pm.response.json().data && pm.response.json().data.token) {
    pm.environment.set('token', pm.response.json().data.token);
}

// اختبار الاستجابة
pm.test('Status code is 200', () => {
    pm.response.to.have.status(200);
});

pm.test('Response has success field', () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});
```

### 2. استخدام Pre-request Scripts

```javascript
// طباعة المتغيرات للتأكد
console.log('Token:', pm.environment.get('token'));
console.log('Base URL:', pm.variables.get('base_url'));
```

### 3. تشغيل Collection Runner

1. افتح Collection في Postman
2. اضغط على "Run"
3. اختر Environment
4. اضغط "Run NCTU ERP"
5. شاهد النتائج

---

## ✅ قائمة التحقق

- [ ] تسجيل دخول المدير يعمل
- [ ] إنشاء رابط تسجيل يعمل
- [ ] تسجيل طالب جديد يعمل
- [ ] الموافقة على الطلب يعمل
- [ ] تسجيل دخول الدكتور يعمل
- [ ] عرض لوحة تحكم الدكتور يعمل
- [ ] إدخال الدرجات يعمل
- [ ] تسجيل دخول المحاسب يعمل
- [ ] إنشاء فاتورة يعمل
- [ ] تسجيل دفعة يعمل
- [ ] تسجيل دخول الطالب يعمل
- [ ] عرض بيانات الطالب يعمل
- [ ] نقل الطلاب للسنة الجديدة يعمل

---

## 🐛 استكشاف الأخطاء

### خطأ 401 Unauthorized
- تأكد من وجود التوكن في Environment
- تأكد من صحة التوكن (لم ينتهي)
- تأكد من إضافة `Authorization: Bearer {{token}}` في Headers

### خطأ 403 Forbidden
- تأكد من صلاحيات المستخدم
- بعض الـ endpoints تحتاج دور معين (admin, professor, student, accountant)

### خطأ 404 Not Found
- تأكد من صحة الـ URL
- تأكد من تشغيل السيرفر على المنفذ الصحيح

### خطأ 500 Internal Server Error
- تحقق من logs السيرفر
- تأكد من صحة البيانات المرسلة
- تأكد من وجود قاعدة البيانات

---

## 📝 ملاحظات إضافية

1. **تأكد من تشغيل السيرفر قبل الاختبار:**
   ```bash
   cd server
   npm start
   ```

2. **تأكد من وجود البيانات الأولية:**
   ```bash
   npm run seed
   ```

3. **استخدم Postman Console لمشاهدة التفاصيل:**
   - View → Show Postman Console
   - أو اضغط `Ctrl + Alt + C`

4. **احفظ الـ Collection للاستخدام المستقبلي**

---

**تم إنشاء هذا الدليل بواسطة Kiro AI**
**التاريخ: 24 أبريل 2026**
