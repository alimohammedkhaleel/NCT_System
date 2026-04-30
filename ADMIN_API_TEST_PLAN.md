# 🧪 Admin Dashboard API - Complete Test Plan

## 📊 API Endpoints Summary

### Base URL: `http://localhost:5000`

---

## ✅ 1. Authentication Endpoints

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Expected Response: 200 OK
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": { "id": 1, "username": "admin", "role": "admin", ... }
  }
}
```

---

## ✅ 2. Specialties Endpoints

### Get All Specialties (Public - All Authenticated Users)
```http
GET /api/specialties
Authorization: Bearer {token}

Expected Response: 200 OK
{
  "success": true,
  "data": [...],
  "count": 6
}
```

### Get Specialty by ID
```http
GET /api/specialties/:id
Authorization: Bearer {token}

Expected Response: 200 OK
{
  "success": true,
  "data": { "id": 1, "code": "ICT", ... }
}
```

### Create Specialty (Admin Only)
```http
POST /api/admin/specialties
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "code": "NEW",
  "name": "New Specialty",
  "arabic_name": "تخصص جديد",
  "duration_years": 4,
  "annual_fee": 5000
}

Expected Response: 201 Created
```

### Update Specialty
```http
PUT /api/admin/specialties/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Updated Name",
  "annual_fee": 6000
}

Expected Response: 200 OK
```

### Delete Specialty
```http
DELETE /api/admin/specialties/:id
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

---

## ✅ 3. Courses Endpoints

### Get All Courses
```http
GET /api/admin/courses
GET /api/admin/courses?specialty_id=1
GET /api/admin/courses?academic_year_id=1&semester_id=1
Authorization: Bearer {admin_token}

Expected Response: 200 OK
{
  "success": true,
  "data": [...],
  "count": 10
}
```

### Get Course by ID
```http
GET /api/admin/courses/:id
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

### Create Course
```http
POST /api/admin/courses
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "specialty_id": 1,
  "academic_year_id": 1,
  "semester_id": 1,
  "course_code": "CS101",
  "course_name": "Introduction to Programming",
  "arabic_name": "مقدمة في البرمجة",
  "credit_hours": 3
}

Expected Response: 201 Created
```

### Update Course
```http
PUT /api/admin/courses/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "course_name": "Updated Course Name",
  "credit_hours": 4
}

Expected Response: 200 OK
```

### Delete Course (Soft Delete)
```http
DELETE /api/admin/courses/:id
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

---

## ✅ 4. Professors Endpoints

### Get All Professors
```http
GET /api/admin/professors
GET /api/admin/professors?is_active=true
GET /api/admin/professors?department=Engineering
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

### Get Professor by ID
```http
GET /api/admin/professors/:id
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

### Create Professor
```http
POST /api/admin/professors
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "username": "prof_new",
  "email": "prof@example.com",
  "password": "password123",
  "full_name": "Dr. John Doe",
  "phone": "1234567890",
  "department": "Computer Science",
  "specialization": "AI"
}

Expected Response: 201 Created
```

### Update Professor
```http
PUT /api/admin/professors/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "department": "Updated Department",
  "specialization": "Updated Specialization"
}

Expected Response: 200 OK
```

### Delete Professor (Soft Delete)
```http
DELETE /api/admin/professors/:id
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

### Assign Course to Professor
```http
POST /api/admin/professors/:id/courses
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "course_id": 1,
  "academic_year_id": 1,
  "semester_id": 1,
  "is_primary": true
}

Expected Response: 201 Created
```

### Remove Course from Professor
```http
DELETE /api/admin/professor-courses/:assignmentId
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

---

## ✅ 5. Students Endpoints

### Get All Students
```http
GET /api/admin/students
GET /api/admin/students?specialty_id=1
GET /api/admin/students?academic_year_id=1&semester_id=1
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

### Create Student
```http
POST /api/admin/students
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "username": "student_new",
  "email": "student@example.com",
  "password": "password123",
  "full_name": "Ahmed Ali",
  "phone": "1234567890",
  "specialty_id": 1,
  "academic_year_id": 1,
  "semester_id": 1
}

Expected Response: 201 Created
```

### Update Student
```http
PUT /api/admin/students/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "full_name": "Updated Name",
  "phone": "0987654321"
}

Expected Response: 200 OK
```

### Promote Student
```http
POST /api/admin/students/:id/promote
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "target_semester_id": 2
}

Expected Response: 200 OK
```

---

## ✅ 6. Grade Settings (CourseGradeConfig) Endpoints

### Get All Grade Configs
```http
GET /api/admin/course-grade-config
GET /api/admin/course-grade-config?specialty_id=1
Authorization: Bearer {admin_token}

Expected Response: 200 OK
{
  "success": true,
  "data": [...],
  "count": 5
}
```

### Get Config by Course ID
```http
GET /api/admin/course-grade-config/:courseId
Authorization: Bearer {admin_token}

Expected Response: 200 OK or 404 Not Found
```

### Create Grade Config
```http
POST /api/admin/course-grade-config
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "course_id": 5,
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

Expected Response: 201 Created
```

### Update Grade Config
```http
PUT /api/admin/course-grade-config/:courseId
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "ass1_percentage": 25.00,
  "ass2_percentage": 25.00,
  "final_percentage": 50.00
}

Expected Response: 200 OK
```

### Delete Grade Config
```http
DELETE /api/admin/course-grade-config/:courseId
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

### Export Grade Configs
```http
GET /api/admin/course-grade-config/export
Authorization: Bearer {admin_token}

Expected Response: 200 OK (JSON file download)
```

### Import Grade Configs
```http
POST /api/admin/course-grade-config/import
Authorization: Bearer {admin_token}
Content-Type: application/json

[
  {
    "course_id": 1,
    "ass1_percentage": 15.00,
    ...
  }
]

Expected Response: 200 OK
```

---

## ✅ 7. Pending Grades Endpoints

### Get Pending Grades
```http
GET /api/grades/admin/pending
GET /api/grades/admin/pending?course_id=1
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

### Approve Grade
```http
PUT /api/grades/:id/approve
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

### Reject Grade
```http
PUT /api/grades/:id/reject
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "rejection_reason": "Incorrect data"
}

Expected Response: 200 OK
```

---

## ✅ 8. Registration Links Endpoints

### Get All Registration Links
```http
GET /api/admin/registration-links
Authorization: Bearer {admin_token}

Expected Response: 200 OK
{
  "success": true,
  "data": [...]
}
```

### Create Registration Link
```http
POST /api/admin/registration-links
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "expires_in_days": 7
}

Expected Response: 201 Created
{
  "success": true,
  "data": {
    "token": "uuid",
    "expires_at": "2026-04-20",
    "registration_url": "http://localhost:5173/register/uuid"
  }
}
```

---

## ✅ 9. Registration Requests Endpoints

### Get All Registration Requests
```http
GET /api/admin/registration-requests
GET /api/admin/registration-requests?status=pending
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

### Approve Registration Request
```http
POST /api/admin/registration-requests/:id/approve
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

### Reject Registration Request
```http
POST /api/admin/registration-requests/:id/reject
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "rejection_reason": "Incomplete information"
}

Expected Response: 200 OK
```

---

## ✅ 10. Timetables Endpoints

### Get All Timetables
```http
GET /api/admin/timetables
GET /api/admin/timetables?specialty_code=ICT
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

### Create Timetable (Upload PDF)
```http
POST /api/admin/timetables
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

{
  "specialty_code": "ICT",
  "academic_year_id": 1,
  "semester_id": 1,
  "title": "ICT Year 1 Semester 1 Timetable",
  "file": <PDF file>
}

Expected Response: 201 Created
```

### Delete Timetable
```http
DELETE /api/admin/timetables/:id
Authorization: Bearer {admin_token}

Expected Response: 200 OK
```

---

## ✅ 11. Student Promotion Endpoints

### Publish Results
```http
POST /api/admin/publish-results
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "academic_year_id": 1,
  "semester_id": 1
}

Expected Response: 200 OK
```

### Promote to Next Semester
```http
POST /api/admin/promote-semester
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "academic_year_id": 1,
  "current_semester_id": 1,
  "target_semester_id": 2
}

Expected Response: 200 OK
```

### Promote to Next Year
```http
POST /api/admin/promote-year
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "current_year_id": 1,
  "target_year_id": 2
}

Expected Response: 200 OK
```

---

## 🧪 Testing Strategy

### 1. Manual Testing with Postman/Newman
- Use existing `.postman.json` collection
- Add missing endpoints to collection
- Run full test suite

### 2. Automated Testing
```bash
# Run Newman tests
newman run .postman.json --env-var "base_url=http://localhost:5000"
```

### 3. Frontend Integration Testing
- Test each admin page
- Verify data loading
- Test CRUD operations
- Verify error handling

---

## 🐛 Known Issues to Fix

1. ✅ FIXED: Postman pre-request script error
2. ⚠️ TODO: Test all endpoints systematically
3. ⚠️ TODO: Verify authorization middleware
4. ⚠️ TODO: Test error responses
5. ⚠️ TODO: Verify data validation

---

**Last Updated**: 2026-04-13
**Status**: 🔄 Ready for Testing
