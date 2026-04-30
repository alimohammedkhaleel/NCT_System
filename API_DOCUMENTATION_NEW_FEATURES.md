# 📚 API Documentation - New Features

## نظرة عامة

هذا الملف يوثق جميع الـ API Endpoints الجديدة المضافة لنظام NCTU ERP.

**Base URL:** `http://localhost:5000/api`

---

## 🔐 Authentication

جميع الـ endpoints التي تحتوي على `(Admin)` تتطلب:
- JWT Token في الـ header
- Role = 'admin'

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 1. Professor Registration System

### 1.1 Register New Professor (Public)

تسجيل دكتور جديد في النظام.

**Endpoint:** `POST /professor-registration/register`  
**Auth:** لا يتطلب authentication  
**Role:** Public

**Request Body:**
```json
{
  "full_name": "د. أحمد محمد علي",
  "national_id": "12345678901234",
  "email": "ahmed.mohamed@example.com",
  "phone": "01234567890",
  "specialty_id": 1,
  "qualification": "دكتوراه في علوم الحاسب",
  "years_of_experience": 10,
  "password": "SecurePassword123"
}
```

**Validation Rules:**
- `full_name`: مطلوب، 3-255 حرف
- `national_id`: مطلوب، 14 رقم بالضبط، فريد
- `email`: مطلوب، email صحيح، فريد
- `phone`: اختياري، أرقام فقط
- `specialty_id`: اختياري، يجب أن يكون موجود في جدول specialties
- `qualification`: اختياري، نص
- `years_of_experience`: اختياري، رقم بين 0-50
- `password`: مطلوب، 8 أحرف على الأقل

**Success Response (201):**
```json
{
  "success": true,
  "message": "تم إرسال طلب التسجيل بنجاح. سيتم مراجعته من قبل الإدارة.",
  "data": {
    "request_id": 1,
    "full_name": "د. أحمد محمد علي",
    "email": "ahmed.mohamed@example.com",
    "status": "pending"
  }
}
```

**Error Responses:**

```json
// 400 - Missing required fields
{
  "success": false,
  "message": "يرجى ملء جميع الحقول المطلوبة"
}

// 400 - Invalid national ID
{
  "success": false,
  "message": "الرقم القومي يجب أن يكون 14 رقم"
}

// 400 - Invalid email
{
  "success": false,
  "message": "البريد الإلكتروني غير صحيح"
}

// 400 - Weak password
{
  "success": false,
  "message": "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
}

// 400 - Duplicate email
{
  "success": false,
  "message": "البريد الإلكتروني مستخدم بالفعل"
}

// 400 - Duplicate national ID
{
  "success": false,
  "message": "الرقم القومي مستخدم بالفعل"
}

// 400 - Invalid specialty
{
  "success": false,
  "message": "التخصص غير موجود"
}
```

---

### 1.2 Get All Professor Requests (Admin)

عرض جميع طلبات تسجيل الدكاترة مع فلاتر وpagination.

**Endpoint:** `GET /professor-registration/admin/requests`  
**Auth:** Required  
**Role:** Admin

**Query Parameters:**
- `status` (optional): `pending` | `approved` | `rejected` | `all`
- `specialty_id` (optional): رقم التخصص
- `search` (optional): بحث بالاسم أو البريد أو الرقم القومي
- `page` (optional): رقم الصفحة (default: 1)
- `limit` (optional): عدد النتائج في الصفحة (default: 20)

**Example Request:**
```http
GET /professor-registration/admin/requests?status=pending&specialty_id=1&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "full_name": "د. أحمد محمد علي",
      "national_id": "12345678901234",
      "email": "ahmed.mohamed@example.com",
      "phone": "01234567890",
      "specialty_id": 1,
      "qualification": "دكتوراه في علوم الحاسب",
      "years_of_experience": 10,
      "status": "pending",
      "created_at": "2024-04-24T10:30:00.000Z",
      "Specialty": {
        "id": 1,
        "code": "ICT",
        "name": "Information and Communication Technology",
        "arabic_name": "تكنولوجيا المعلومات والاتصالات"
      },
      "ProcessedBy": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 1.3 Get Single Professor Request (Admin)

عرض تفاصيل طلب تسجيل دكتور واحد.

**Endpoint:** `GET /professor-registration/admin/requests/:id`  
**Auth:** Required  
**Role:** Admin

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "full_name": "د. أحمد محمد علي",
    "national_id": "12345678901234",
    "email": "ahmed.mohamed@example.com",
    "phone": "01234567890",
    "specialty_id": 1,
    "qualification": "دكتوراه في علوم الحاسب",
    "years_of_experience": 10,
    "status": "pending",
    "rejection_reason": null,
    "processed_at": null,
    "processed_by": null,
    "created_user_id": null,
    "created_professor_id": null,
    "created_at": "2024-04-24T10:30:00.000Z",
    "updated_at": "2024-04-24T10:30:00.000Z",
    "Specialty": {
      "id": 1,
      "code": "ICT",
      "name": "Information and Communication Technology",
      "arabic_name": "تكنولوجيا المعلومات والاتصالات"
    },
    "ProcessedBy": null,
    "CreatedUser": null,
    "CreatedProfessor": null
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "الطلب غير موجود"
}
```

---

### 1.4 Approve Professor Request (Admin)

قبول طلب تسجيل دكتور وإنشاء حساب له.

**Endpoint:** `POST /professor-registration/admin/requests/:id/approve`  
**Auth:** Required  
**Role:** Admin

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم قبول الطلب وإنشاء حساب الدكتور بنجاح",
  "data": {
    "user_id": 123,
    "professor_id": 45,
    "professor_code": "PROF-2024-045"
  }
}
```

**Error Responses:**

```json
// 404 - Request not found
{
  "success": false,
  "message": "الطلب غير موجود"
}

// 400 - Already processed
{
  "success": false,
  "message": "هذا الطلب تمت معالجته بالفعل"
}

// 400 - Duplicate user
{
  "success": false,
  "message": "البريد الإلكتروني أو الرقم القومي مستخدم بالفعل"
}
```

**Side Effects:**
- إنشاء user جديد في جدول `users`
- إنشاء professor جديد في جدول `professors`
- توليد `professor_code` تلقائياً (PROF-YYYY-XXX)
- تحديث حالة الطلب إلى `approved`
- تسجيل activity log

---

### 1.5 Reject Professor Request (Admin)

رفض طلب تسجيل دكتور.

**Endpoint:** `POST /professor-registration/admin/requests/:id/reject`  
**Auth:** Required  
**Role:** Admin

**Request Body:**
```json
{
  "rejection_reason": "المؤهل العلمي غير كافي"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم رفض الطلب"
}
```

**Error Responses:**

```json
// 404 - Request not found
{
  "success": false,
  "message": "الطلب غير موجود"
}

// 400 - Already processed
{
  "success": false,
  "message": "هذا الطلب تمت معالجته بالفعل"
}
```

---

### 1.6 Delete Professor Request (Admin)

حذف طلب تسجيل دكتور نهائياً.

**Endpoint:** `DELETE /professor-registration/admin/requests/:id`  
**Auth:** Required  
**Role:** Admin

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم حذف الطلب نهائياً"
}
```

**Error Responses:**

```json
// 404 - Request not found
{
  "success": false,
  "message": "الطلب غير موجود"
}

// 400 - Cannot delete approved request
{
  "success": false,
  "message": "لا يمكن حذف طلب مقبول"
}
```

---

## 2. Student Management Improvements

### 2.1 Approve All Registration Requests (Admin)

قبول جميع طلبات تسجيل الطلاب المعلقة دفعة واحدة.

**Endpoint:** `POST /admin/registration-requests/approve-all`  
**Auth:** Required  
**Role:** Admin

**Request Body:**
```json
{
  "specialty_id": 1,
  "filters": {
    "high_school_grade_min": 70,
    "created_before": "2024-04-24T23:59:59.000Z"
  }
}
```

**Parameters:**
- `specialty_id` (optional): قبول طلاب تخصص معين فقط
- `filters.high_school_grade_min` (optional): الحد الأدنى لمجموع الثانوية
- `filters.created_before` (optional): قبول الطلبات المقدمة قبل تاريخ معين

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم قبول 25 طالب بنجاح",
  "data": {
    "approved_count": 25,
    "failed_count": 2,
    "failed_requests": [
      {
        "id": 10,
        "full_name": "محمد أحمد علي",
        "reason": "البريد الإلكتروني مستخدم بالفعل"
      },
      {
        "id": 15,
        "full_name": "أحمد محمود حسن",
        "reason": "الرقم القومي مستخدم بالفعل"
      }
    ],
    "student_codes": [
      "12345678",
      "23456789",
      "34567890",
      ...
    ]
  }
}
```

**Side Effects:**
- إنشاء user و student لكل طلب ناجح
- توليد student_code لكل طالب
- تحديث حالة الطلبات إلى `approved`
- تسجيل activity logs

---

### 2.2 Delete Registration Request (Admin)

حذف طلب تسجيل طالب نهائياً.

**Endpoint:** `DELETE /admin/registration-requests/:id`  
**Auth:** Required  
**Role:** Admin

**Success Response (200):**
```json
{
  "success": true,
  "message": "تم حذف طلب التسجيل نهائياً"
}
```

**Error Responses:**

```json
// 404 - Request not found
{
  "success": false,
  "message": "طلب التسجيل غير موجود"
}

// 400 - Cannot delete approved request
{
  "success": false,
  "message": "لا يمكن حذف طلب مقبول"
}
```

---

### 2.3 Get Pending Requests Bulk (Admin)

عرض جميع طلبات التسجيل المعلقة في view واحد.

**Endpoint:** `GET /admin/registration-requests/pending-bulk`  
**Auth:** Required  
**Role:** Admin

**Query Parameters:**
- `specialty_id` (optional): فلترة حسب التخصص
- `high_school_grade_min` (optional): الحد الأدنى لمجموع الثانوية

**Example Request:**
```http
GET /admin/registration-requests/pending-bulk?specialty_id=1&high_school_grade_min=70
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "full_name": "محمد أحمد علي",
      "national_id": "12345678901234",
      "email": "mohamed@example.com",
      "specialty_id": 1,
      "high_school_grade": 85.5,
      "status": "pending",
      "created_at": "2024-04-24T10:30:00.000Z",
      "Specialty": {
        "id": 1,
        "code": "ICT",
        "name": "Information and Communication Technology",
        "arabic_name": "تكنولوجيا المعلومات والاتصالات"
      }
    }
  ],
  "count": 25
}
```

---

## 3. Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 4. Rate Limiting

- **Development:** 1000 requests per 15 minutes
- **Production:** 100 requests per 15 minutes

---

## 5. Testing with cURL

### Register Professor
```bash
curl -X POST http://localhost:5000/api/professor-registration/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "د. أحمد محمد",
    "national_id": "12345678901234",
    "email": "ahmed@example.com",
    "password": "Test@1234",
    "specialty_id": 1
  }'
```

### Get Professor Requests (Admin)
```bash
curl -X GET http://localhost:5000/api/professor-registration/admin/requests \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Approve Professor Request (Admin)
```bash
curl -X POST http://localhost:5000/api/professor-registration/admin/requests/1/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Approve All Students (Admin)
```bash
curl -X POST http://localhost:5000/api/admin/registration-requests/approve-all \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "specialty_id": 1,
    "filters": {
      "high_school_grade_min": 70
    }
  }'
```

### Delete Registration Request (Admin)
```bash
curl -X DELETE http://localhost:5000/api/admin/registration-requests/5 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 6. Testing with Postman

### Setup Environment

1. Create new environment: `NCTU ERP - Local`
2. Add variables:
   - `base_url`: `http://localhost:5000/api`
   - `admin_token`: `YOUR_ADMIN_JWT_TOKEN`

### Import Collection

```json
{
  "info": {
    "name": "NCTU ERP - New Features",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Professor Registration",
      "item": [
        {
          "name": "Register Professor",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"full_name\": \"د. أحمد محمد\",\n  \"national_id\": \"12345678901234\",\n  \"email\": \"ahmed@example.com\",\n  \"password\": \"Test@1234\",\n  \"specialty_id\": 1\n}"
            },
            "url": {
              "raw": "{{base_url}}/professor-registration/register",
              "host": ["{{base_url}}"],
              "path": ["professor-registration", "register"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## 7. Database Schema

### professor_registration_requests

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT |
| full_name | VARCHAR(255) | NOT NULL |
| national_id | VARCHAR(14) | NOT NULL, UNIQUE |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| phone | VARCHAR(20) | NULL |
| specialty_id | INT | NULL, FK → specialties(id) |
| qualification | VARCHAR(255) | NULL |
| years_of_experience | INT | NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| status | ENUM | 'pending', 'approved', 'rejected' |
| rejection_reason | TEXT | NULL |
| processed_at | DATETIME | NULL |
| processed_by | INT | NULL, FK → users(id) |
| created_user_id | INT | NULL, FK → users(id) |
| created_professor_id | INT | NULL, FK → professors(id) |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

**Indexes:**
- `idx_status` on `status`
- `idx_email` on `email`
- `idx_national_id` on `national_id`
- `idx_created_at` on `created_at`
- `idx_specialty_id` on `specialty_id`

---

## 8. Security Considerations

### Password Hashing
- Algorithm: bcrypt
- Salt rounds: 10
- Never return password_hash in API responses

### Input Validation
- All inputs are validated on the server side
- SQL injection prevention via Sequelize ORM
- XSS prevention via input sanitization

### Authorization
- JWT tokens expire after 24 hours
- Admin-only endpoints check user role
- Activity logging for all sensitive operations

---

## 9. Performance

### Pagination
- Default: 20 items per page
- Maximum: 100 items per page
- Use `page` and `limit` query parameters

### Caching
- Specialty list cached for 1 hour
- Stats cached for 5 minutes

### Database Optimization
- Indexes on frequently queried columns
- Eager loading for associations
- Query optimization with Sequelize

---

## 10. Changelog

### Version 1.0.0 (2024-04-24)

**Added:**
- Professor registration system (6 endpoints)
- Bulk student approval (1 endpoint)
- Delete registration request (1 endpoint)
- Pending requests bulk view (1 endpoint)

**Total:** 9 new endpoints

---

**Last Updated:** 24 أبريل 2026  
**Version:** 1.0.0  
**Status:** Production Ready (Backend)
