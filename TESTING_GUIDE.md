# دليل الاختبار - NCTU ERP System

## نظرة عامة
هذا الدليل يوضح كيفية اختبار جميع endpoints في نظام NCTU ERP باستخدام Postman.

## المتطلبات الأساسية

### 1. تشغيل الخادم
```bash
# في مجلد server
cd server
npm install
npm start
```

الخادم يجب أن يعمل على: `http://localhost:5000`

### 2. إعداد قاعدة البيانات
```bash
# تشغيل seed data
node seed-data.js
```

## هيكل الاختبارات

### 1. Authentication (المصادقة)
- **Login as Admin**: تسجيل دخول المسؤول
  - Endpoint: `POST /api/auth/login`
  - Body: `{ "username": "admin", "password": "admin123" }`
  - يحفظ: `token`, `user_id`

- **Login as Student**: تسجيل دخول الطالب
  - Endpoint: `POST /api/auth/login`
  - Body: `{ "username": "student1", "password": "student123" }`
  - يحفظ: `student_token`, `student_id`

### 2. Get Specialties & Courses
- **Get All Specialties**: جلب جميع التخصصات
  - Endpoint: `GET /api/specialties`
  - يحفظ: `specialty_id`

- **Get All Courses**: جلب جميع المواد
  - Endpoint: `GET /api/admin/courses`
  - يحفظ: `course_id`

### 3. CourseGradeConfig - CRUD Operations

#### 3.1 Get All Grade Configs
- Endpoint: `GET /api/admin/course-grade-config`
- Headers: `Authorization: Bearer {{token}}`
- يحفظ: `config_id`

#### 3.2 Create Grade Config
- Endpoint: `POST /api/admin/course-grade-config`
- Headers: `Authorization: Bearer {{token}}`
- Body:
```json
{
  "course_id": {{course_id}},
  "ass1_percentage": 20.00,
  "ass2_percentage": 20.00,
  "final_percentage": 60.00,
  "ass1_max": 30.00,
  "ass2_max": 30.00,
  "final_max": 150.00,
  "p_value": 30.00,
  "m_value": 21.00,
  "d_value": 15.00
}
```
- يحفظ: `new_config_id`

#### 3.3 Get Config by Course ID
- Endpoint: `GET /api/admin/course-grade-config/{{course_id}}`
- Headers: `Authorization: Bearer {{token}}`

#### 3.4 Update Grade Config
- Endpoint: `PUT /api/admin/course-grade-config/{{course_id}}`
- Headers: `Authorization: Bearer {{token}}`
- Body: (نفس البنية مع قيم محدثة)

#### 3.5 Test Validation - Invalid Percentages
- Endpoint: `POST /api/admin/course-grade-config`
- Body: (مجموع النسب ≠ 100%)
- Expected: `400 Bad Request`

#### 3.6 Delete Grade Config
- Endpoint: `DELETE /api/admin/course-grade-config/{{course_id}}`
- Headers: `Authorization: Bearer {{token}}`

### 4. Student Payment & Grades

#### 4.1 Get Student Payment Status
- Endpoint: `GET /api/student/payment-status`
- Headers: `Authorization: Bearer {{student_token}}`
- يحفظ: `all_paid`
- Response:
```json
{
  "success": true,
  "data": {
    "all_paid": true/false,
    "total_due": 0,
    "total_invoiced": 5000,
    "total_paid": 5000,
    "pending_invoices": [],
    "overdue_invoices": []
  }
}
```

#### 4.2 Get Student Grades (Conditional)
- Endpoint: `GET /api/grades/student/grades`
- Headers: `Authorization: Bearer {{student_token}}`
- Behavior:
  - إذا `all_paid = true`: يعرض الدرجات
  - إذا `all_paid = false`: يرفض مع رسالة (403)

#### 4.3 Test Non-Student Access
- Endpoint: `GET /api/student/payment-status`
- Headers: `Authorization: Bearer {{token}}` (admin token)
- Expected: `403 Forbidden`

### 5. Registration Links Management

#### 5.1 Create Registration Link
- Endpoint: `POST /api/admin/registration-links`
- Headers: `Authorization: Bearer {{token}}`
- Body:
```json
{
  "expires_in_days": 7
}
```
- يحفظ: `registration_token`, `registration_link_id`

#### 5.2 Get All Registration Links
- Endpoint: `GET /api/admin/registration-links`
- Headers: `Authorization: Bearer {{token}}`

#### 5.3 Get All Registration Requests
- Endpoint: `GET /api/admin/registration-requests`
- Headers: `Authorization: Bearer {{token}}`
- يحفظ: `registration_request_id` (إذا وجد pending request)

#### 5.4 Get Pending Registration Requests
- Endpoint: `GET /api/admin/registration-requests?status=pending`
- Headers: `Authorization: Bearer {{token}}`

### 6. Import/Export Grade Configs

#### 6.1 Export All Configs
- Endpoint: `GET /api/admin/course-grade-config/export`
- Headers: `Authorization: Bearer {{token}}`
- Response: JSON array of all configs

#### 6.2 Import Configs
- Endpoint: `POST /api/admin/course-grade-config/import`
- Headers: `Authorization: Bearer {{token}}`
- Body: Array of config objects
```json
[
  {
    "course_id": {{course_id}},
    "ass1_percentage": 15.00,
    "ass2_percentage": 15.00,
    "final_percentage": 70.00,
    "ass1_max": 30.00,
    "ass2_max": 30.00,
    "final_max": 150.00,
    "p_value": 30.00,
    "m_value": 21.00,
    "d_value": 15.00
  }
]
```

## متغيرات البيئة (Environment Variables)

يجب إنشاء environment في Postman مع المتغيرات التالية:

| Variable | Initial Value | Description |
|----------|--------------|-------------|
| base_url | http://localhost:5000 | عنوان الخادم |
| token | (empty) | Admin token |
| student_token | (empty) | Student token |
| user_id | (empty) | Admin user ID |
| student_id | (empty) | Student user ID |
| course_id | (empty) | Course ID |
| specialty_id | (empty) | Specialty ID |
| config_id | (empty) | Config ID |
| new_config_id | (empty) | New config ID |
| all_paid | (empty) | Payment status |
| registration_token | (empty) | Registration token |
| registration_link_id | (empty) | Registration link ID |
| registration_request_id | (empty) | Registration request ID |

## ترتيب التنفيذ

يجب تنفيذ الاختبارات بالترتيب التالي:

1. **Authentication** - للحصول على tokens
2. **Get Specialties & Courses** - للحصول على IDs
3. **CourseGradeConfig CRUD** - اختبار العمليات الأساسية
4. **Student Payment & Grades** - اختبار الربط بين المدفوعات والدرجات
5. **Registration Links** - اختبار نظام التسجيل
6. **Import/Export** - اختبار الاستيراد والتصدير

## النتائج المتوقعة

### Successful Tests
- جميع الـ GET requests يجب أن ترجع `200 OK`
- جميع الـ POST requests يجب أن ترجع `201 Created` أو `200 OK`
- جميع الـ PUT requests يجب أن ترجع `200 OK`
- جميع الـ DELETE requests يجب أن ترجع `200 OK`

### Validation Tests
- Invalid percentage sum → `400 Bad Request`
- Non-student accessing payment status → `403 Forbidden`
- Unpaid student accessing grades → `403 Forbidden`

## استكشاف الأخطاء

### Server Not Running
```bash
# تحقق من أن الخادم يعمل
curl http://localhost:5000/api/health
```

### Database Issues
```bash
# إعادة تشغيل seed data
cd server
node seed-data.js
```

### Token Expired
- أعد تشغيل "Login as Admin" أو "Login as Student"

### Missing Environment Variables
- تأكد من أن جميع المتغيرات محفوظة بشكل صحيح في Environment

## ملاحظات مهمة

1. **الترتيب مهم**: بعض الاختبارات تعتمد على نتائج اختبارات سابقة
2. **Tokens**: يجب تسجيل الدخول أولاً للحصول على tokens
3. **IDs**: يتم حفظ IDs تلقائياً في Environment variables
4. **Validation**: اختبارات الـ validation تتوقع فشل الطلب
5. **Payment Status**: حالة الدفع تؤثر على إمكانية عرض الدرجات

## الدعم

للمساعدة أو الإبلاغ عن مشاكل، راجع:
- `server/routes/adminRoutes.js` - Admin endpoints
- `server/routes/gradeRoutes.js` - Grade endpoints
- `server/routes/authRoutes.js` - Auth endpoints
- `server/controllers/` - Business logic
