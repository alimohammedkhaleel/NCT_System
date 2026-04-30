# ملخص API Endpoints - NCTU ERP System

## 📊 إحصائيات

- **إجمالي Endpoints**: 25+
- **Authentication Endpoints**: 3
- **Admin Endpoints**: 15+
- **Student Endpoints**: 3
- **Professor Endpoints**: 4
- **Accountant Endpoints**: 4

---

## 🔐 Authentication Endpoints

### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 2. Student Login
```http
POST /api/auth/student-login
Content-Type: application/json

{
  "student_code": "20241557",
  "national_id": "12345678901234"
}
```

### 3. Validate Registration Link
```http
GET /api/auth/register-link/:token
```

---

## 👨‍💼 Admin Endpoints

### Course Grade Config Management

#### Get All Configs
```http
GET /api/admin/course-grade-config
Authorization: Bearer {token}
```

#### Get Config by Course
```http
GET /api/admin/course-grade-config/:courseId
Authorization: Bearer {token}
```

#### Create Config
```http
POST /api/admin/course-grade-config
Authorization: Bearer {token}
Content-Type: application/json

{
  "course_id": 1,
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

#### Update Config
```http
PUT /api/admin/course-grade-config/:courseId
Authorization: Bearer {token}
Content-Type: application/json

{
  "ass1_percentage": 25.00,
  "ass2_percentage": 25.00,
  "final_percentage": 50.00
}
```

#### Delete Config
```http
DELETE /api/admin/course-grade-config/:courseId
Authorization: Bearer {token}
```

#### Export Configs
```http
GET /api/admin/course-grade-config/export
Authorization: Bearer {token}
```

#### Import Configs
```http
POST /api/admin/course-grade-config/import
Authorization: Bearer {token}
Content-Type: application/json

[
  {
    "course_id": 1,
    "ass1_percentage": 15.00,
    ...
  }
]
```

### Registration Links Management

#### Create Registration Link
```http
POST /api/admin/registration-links
Authorization: Bearer {token}
Content-Type: application/json

{
  "expires_in_days": 7
}
```

#### Get All Registration Links
```http
GET /api/admin/registration-links
Authorization: Bearer {token}
```

#### Get Registration Requests
```http
GET /api/admin/registration-requests
Authorization: Bearer {token}

# With filter
GET /api/admin/registration-requests?status=pending
```

#### Approve Registration Request
```http
POST /api/admin/registration-requests/:id/approve
Authorization: Bearer {token}
```

#### Reject Registration Request
```http
POST /api/admin/registration-requests/:id/reject
Authorization: Bearer {token}
```

### Student Promotion

#### Publish Results
```http
POST /api/admin/publish-results
Authorization: Bearer {token}
Content-Type: application/json

{
  "semester_id": 1,
  "academic_year_id": 1,
  "specialty_id": 1
}
```

#### Promote to Next Semester
```http
POST /api/admin/promote-semester
Authorization: Bearer {token}
Content-Type: application/json

{
  "semester_id": 1,
  "academic_year_id": 1,
  "specialty_id": 1,
  "student_ids": []
}
```

#### Promote to Next Year
```http
POST /api/admin/promote-year
Authorization: Bearer {token}
Content-Type: application/json

{
  "academic_year_id": 1,
  "specialty_id": 1,
  "student_ids": []
}
```

### Other Admin Endpoints

#### Get All Courses
```http
GET /api/admin/courses
Authorization: Bearer {token}
```

#### Get All Students
```http
GET /api/admin/students
Authorization: Bearer {token}
```

#### Get All Professors
```http
GET /api/admin/professors
Authorization: Bearer {token}
```

---

## 🎓 Student Endpoints

### Get Payment Status
```http
GET /api/student/payment-status
Authorization: Bearer {student_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "all_paid": true,
    "total_due": 0,
    "total_invoiced": 5000,
    "total_paid": 5000,
    "pending_invoices": [],
    "overdue_invoices": []
  }
}
```

### Get Student Grades
```http
GET /api/grades/student/grades
Authorization: Bearer {student_token}
```

**Note:** يتطلب أن يكون `all_paid = true`

**Response (if paid):**
```json
{
  "success": true,
  "data": [
    {
      "course_code": "CS101",
      "course_name": "Introduction to Programming",
      "ass1": "P",
      "ass2": "M",
      "final_exam_score": 120,
      "total_score": 171,
      "total_percentage": 81.43,
      "grade": "B",
      "grade_point": 3.0,
      "final_result": "Pass"
    }
  ],
  "gpa": 3.5
}
```

**Response (if not paid):**
```json
{
  "success": false,
  "message": "يرجى سداد المصاريف الدراسية لعرض النتائج",
  "data": {
    "total_due": 2500,
    "pending_invoices": [...]
  }
}
```

### Get Student Portal Data
```http
GET /api/student/portal
Authorization: Bearer {student_token}
```

---

## 👨‍🏫 Professor Endpoints

### Get Professor Students
```http
GET /api/grades/professor/students?course_id=1
Authorization: Bearer {professor_token}
```

### Create Grade
```http
POST /api/grades
Authorization: Bearer {professor_token}
Content-Type: application/json

{
  "student_id": 1,
  "course_id": 1,
  "ass1": "P",
  "ass2": "M",
  "final_exam_score": 120
}
```

### Update Grade
```http
PUT /api/grades/:id
Authorization: Bearer {professor_token}
Content-Type: application/json

{
  "ass1": "P",
  "ass2": "D",
  "final_exam_score": 130
}
```

### Delete Grade
```http
DELETE /api/grades/:id
Authorization: Bearer {professor_token}
```

---

## 💰 Accountant Endpoints

### Get Summary
```http
GET /api/accountant/summary
Authorization: Bearer {accountant_token}
```

### Search Students
```http
GET /api/accountant/students/search?query=ahmed
Authorization: Bearer {accountant_token}
```

### Create Invoice
```http
POST /api/accountant/invoices
Authorization: Bearer {accountant_token}
Content-Type: application/json

{
  "student_id": 1,
  "academic_year_id": 1,
  "semester_id": 1,
  "amount": 5000,
  "due_date": "2024-12-31"
}
```

### Record Payment
```http
POST /api/accountant/payments
Authorization: Bearer {accountant_token}
Content-Type: application/json

{
  "invoice_id": 1,
  "amount": 5000,
  "payment_method": "cash"
}
```

---

## 🌐 Public Endpoints

### Get All Specialties
```http
GET /api/specialties
```

### Health Check
```http
GET /api/health
```

---

## 📝 Request/Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## 🔒 Authorization

معظم endpoints تتطلب Authorization header:

```http
Authorization: Bearer {token}
```

### Roles:
- **admin**: وصول كامل لجميع endpoints
- **student**: وصول محدود (grades, payment status, portal)
- **professor**: إدارة الدرجات فقط
- **accountant**: إدارة المدفوعات والفواتير

---

## ⚠️ Important Notes

1. **Percentage Validation**: مجموع النسب المئوية يجب أن يساوي 100%
2. **Payment Conditional Access**: الطلاب يجب أن يدفعوا لعرض الدرجات
3. **Grade Calculation**: يتم حساب الدرجات تلقائياً بناءً على إعدادات المادة
4. **Token Expiration**: Tokens تنتهي بعد 24 ساعة
5. **Role-Based Access**: كل دور له صلاحيات محددة

---

## 🧪 Testing

استخدم Postman collection المرفق (`.postman.json`) لاختبار جميع endpoints.

```bash
# تشغيل الخادم
cd server
npm start

# في نافذة أخرى - تشغيل seed data
node seed-data.js
```

---

## 📚 Related Documentation

- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - دليل الاختبار الشامل
- [.postman.json](./.postman.json) - Postman collection
- [.postman-config.json](./.postman-config.json) - Postman configuration
