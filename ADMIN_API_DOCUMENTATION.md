# Extended Admin System API Documentation

## Overview

This document describes the Complete Extended Admin System API endpoints for managing courses, professors, grade settings, QR codes, and grade approvals.

**Base URL**: `http://localhost:5000/api/admin`

**Authentication**: All endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

**Role Requirement**: All endpoints require `admin` role.

---

## Table of Contents

1. [Course Management](#course-management)
2. [Professor Management](#professor-management)
3. [Grade Settings Management](#grade-settings-management)
4. [Grade Approval Workflow](#grade-approval-workflow)
5. [QR Code Management](#qr-code-management)
6. [Request/Response Formats](#requestresponse-formats)
7. [Error Handling](#error-handling)
8. [Testing Guide](#testing-guide)

---

## Course Management

### Create Course

**Endpoint**: `POST /courses`

**Description**: Create a new course with association to specialty, academic year, and semester.

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "specialty_id": 1,
  "academic_year_id": 1,
  "semester_id": 1,
  "course_code": "CS101",
  "course_name": "Introduction to Programming",
  "arabic_name": "مقدمة إلى البرمجة",
  "credit_hours": 3
}
```

**Request Validation**:
- `specialty_id` (required): integer
- `academic_year_id` (required): integer
- `semester_id` (required): integer
- `course_code` (required): string
- `course_name` (required): string
- `arabic_name` (required): string
- `credit_hours` (required): positive integer

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": 1,
    "specialty_id": 1,
    "academic_year_id": 1,
    "semester_id": 1,
    "course_code": "CS101",
    "course_name": "Introduction to Programming",
    "arabic_name": "مقدمة إلى البرمجة",
    "credit_hours": 3,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
- 400 Bad Request: Validation failed or missing required fields
- 404 Not Found: Specialty, AcademicYear, or Semester not found

---

### Get All Courses

**Endpoint**: `GET /courses`

**Description**: Retrieve all courses with optional filtering.

**Query Parameters** (all optional):
```
?specialty_id=1&academic_year_id=1&semester_id=1&is_active=true
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "specialty_id": 1,
      "academic_year_id": 1,
      "semester_id": 1,
      "course_code": "CS101",
      "course_name": "Introduction to Programming",
      "arabic_name": "مقدمة إلى البرمجة",
      "credit_hours": 3,
      "is_active": true,
      "Specialty": {
        "id": 1,
        "specialty_name": "Computer Science"
      },
      "AcademicYear": {
        "id": 1,
        "year_name": "2023-2024"
      },
      "Semester": {
        "id": 1,
        "semester_number": 1
      }
    }
  ],
  "count": 1
}
```

---

### Get Course By ID

**Endpoint**: `GET /courses/:id`

**Description**: Retrieve a specific course with all associations.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "specialty_id": 1,
    "course_code": "CS101",
    "course_name": "Introduction to Programming",
    "arabic_name": "مقدمة إلى البرمجة",
    "credit_hours": 3,
    "is_active": true,
    "Specialty": { /* specialty details */ },
    "AcademicYear": { /* year details */ },
    "Semester": { /* semester details */ }
  }
}
```

---

### Update Course

**Endpoint**: `PUT /courses/:id`

**Description**: Update course details (name, credit hours, etc.).

**Request Body** (all fields optional):
```json
{
  "course_name": "Advanced Programming",
  "arabic_name": "برمجة متقدمة",
  "credit_hours": 4,
  "is_active": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "id": 1,
    "course_name": "Advanced Programming",
    "credit_hours": 4,
    "is_active": true,
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

---

### Delete Course (Soft Delete)

**Endpoint**: `DELETE /courses/:id`

**Description**: Soft delete a course (marks as inactive). Prevents deletion if students are actively enrolled.

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

**Error Cases**:
- 400 Bad Request: Course has active student enrollments

---

## Professor Management

### Create Professor

**Endpoint**: `POST /professors`

**Description**: Create a new professor with User account and Professor profile (atomic transaction).

**Request Body**:
```json
{
  "username": "prof_ahmed",
  "email": "prof.ahmed@university.edu",
  "password": "SecurePass@123",
  "full_name": "Dr. Ahmed Hassan",
  "phone": "+20123456789",
  "department": "Computer Science",
  "specialization": "Artificial Intelligence"
}
```

**Request Validation**:
- `username` (required): min 3 characters, must be unique
- `email` (required): valid email format, must be unique
- `password` (required): min 6 characters
- `full_name` (required): string
- `phone` (optional): valid mobile phone
- `department` (optional): string
- `specialization` (optional): string

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Professor created successfully",
  "data": {
    "id": 5,
    "user_id": 12,
    "professor_code": "PROF-12345678-90",
    "email": "prof.ahmed@university.edu",
    "full_name": "Dr. Ahmed Hassan"
  }
}
```

**Transaction Details**: Creates both `User` (role='professor') and `Professor` records atomically. If any step fails, both records are rolled back.

---

### Get All Professors

**Endpoint**: `GET /professors`

**Description**: Retrieve all professors with optional filters.

**Query Parameters**:
```
?is_active=true&department=Engineering
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "professor_code": "PROF-12345678-90",
      "department": "Computer Science",
      "specialization": "AI",
      "is_active": true,
      "User": {
        "id": 12,
        "username": "prof_ahmed",
        "email": "prof.ahmed@university.edu",
        "full_name": "Dr. Ahmed Hassan"
      }
    }
  ],
  "count": 1
}
```

---

### Get Professor By ID

**Endpoint**: `GET /professors/:id`

**Description**: Retrieve specific professor with assigned courses.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 5,
    "professor_code": "PROF-12345678-90",
    "department": "Computer Science",
    "specialization": "AI",
    "is_active": true,
    "User": { /* user details */ },
    "ProfessorCourses": [
      {
        "id": 1,
        "course_id": 1,
        "academic_year_id": 1,
        "semester_id": 1,
        "is_primary": true,
        "Course": {
          "id": 1,
          "course_code": "CS101",
          "course_name": "Introduction to Programming"
        }
      }
    ]
  }
}
```

---

### Update Professor

**Endpoint**: `PUT /professors/:id`

**Description**: Update professor details.

**Request Body** (all optional):
```json
{
  "department": "Engineering",
  "specialization": "Machine Learning",
  "is_active": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Professor updated successfully",
  "data": {
    "id": 5,
    "department": "Engineering",
    "specialization": "Machine Learning",
    "is_active": true
  }
}
```

---

### Delete Professor (Soft Delete)

**Endpoint**: `DELETE /professors/:id`

**Description**: Soft delete professor (marks as inactive on both User and Professor records).

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Professor deleted successfully"
}
```

**Transaction Details**: Atomically marks both User and Professor records as inactive.

---

### Assign Course to Professor

**Endpoint**: `POST /professors/:id/courses`

**Description**: Assign a course to a professor for a specific academic year and semester.

**Request Body**:
```json
{
  "course_id": 1,
  "academic_year_id": 1,
  "semester_id": 1,
  "is_primary": true
}
```

**Request Validation**:
- `course_id` (required): integer, must exist
- `academic_year_id` (required): integer, must exist
- `semester_id` (required): integer, must exist
- `is_primary` (optional): boolean, defaults to false

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Course assigned to professor successfully",
  "data": {
    "id": 1,
    "professor_id": 5,
    "course_id": 1,
    "academic_year_id": 1,
    "semester_id": 1,
    "is_primary": true
  }
}
```

**Validation Rules**:
- Professor must exist
- Course must exist
- Prevents duplicate assignments

---

### Remove Course from Professor

**Endpoint**: `DELETE /professor-courses/:assignmentId`

**Description**: Remove a course assignment from a professor.

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Course removed from professor successfully"
}
```

---

## Grade Settings Management

### Get All Grade Settings

**Endpoint**: `GET /grade-settings`

**Description**: Retrieve all dynamically configured grade settings.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "pass_grade_value": 20,
    "merit_grade_value": 30,
    "distinction_grade_value": 40,
    "max_final_exam_score": 150,
    "max_total_score": 200,
    "grade_a_percentage": 85,
    "grade_b_percentage": 75,
    "grade_c_percentage": 65,
    "grade_d_percentage": 50
  }
}
```

---

### Get Single Grade Setting

**Endpoint**: `GET /grade-settings/:name`

**Description**: Retrieve a specific grade setting value.

**Example**: `GET /grade-settings/pass_grade_value`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "pass_grade_value": 20
  }
}
```

---

### Update Grade Setting

**Endpoint**: `PUT /grade-settings/:name`

**Description**: Update a grade setting value. Admin can dynamically adjust grading rules.

**Request Body**:
```json
{
  "setting_value": 25
}
```

**Example**: `PUT /grade-settings/pass_grade_value` with `{ "setting_value": 25 }`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Setting updated successfully",
  "data": {
    "setting_name": "pass_grade_value",
    "setting_value": 25,
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

**Important Notes**:
- All grade calculations use these settings dynamically
- Changes apply to all future grade approvals
- Historical approved grades maintain their calculated values

---

### Initialize Grade Settings

**Endpoint**: `POST /grade-settings/initialize`

**Description**: One-time setup to initialize default grade settings. Should be called once during system setup.

**Default Values Initialized**:
- `pass_grade_value: 20`
- `merit_grade_value: 30`
- `distinction_grade_value: 40`
- `max_final_exam_score: 150`
- `max_total_score: 200`
- `grade_a_percentage: 85`
- `grade_b_percentage: 75`
- `grade_c_percentage: 65`
- `grade_d_percentage: 50`

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Grade settings initialized with defaults",
  "data": {
    "pass_grade_value": 20,
    "merit_grade_value": 30,
    // ... other settings
  }
}
```

---

## Grade Approval Workflow

### Get Pending Grades for Approval

**Endpoint**: `GET /grades/pending`

**Description**: Retrieve all grades awaiting admin approval.

**Query Parameters** (all optional):
```
?course_id=1&academic_year_id=1&semester_id=1
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "student_id": 3,
      "course_id": 1,
      "status": "pending_admin_approval",
      "assignment1_grade": "P",
      "assignment2_grade": "M",
      "final_exam_score": 95,
      "Student": {
        "id": 3,
        "student_code": "STU-001",
        "User": {
          "full_name": "Ahmed Hassan",
          "email": "ahmed@university.edu"
        }
      },
      "Course": {
        "id": 1,
        "course_code": "CS101",
        "course_name": "Introduction to Programming"
      },
      "AcademicYear": { /* year details */ },
      "Semester": { /* semester details */ }
    }
  ],
  "count": 1
}
```

---

### Preview Grade Metrics

**Endpoint**: `GET /grades/:id/preview`

**Description**: Preview what metrics will be calculated when the grade is approved, without actually approving it.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "current_values": {
      "assignment1_grade": "P",
      "assignment2_grade": "M",
      "final_exam_score": 95
    },
    "calculated_metrics": {
      "assignment1_score": 20,
      "assignment2_score": 30,
      "final_exam_score": 95,
      "total_score": 145,
      "total_percentage": 72.5,
      "grade_point": 2.9,
      "letter_grade": "B",
      "final_result": "Merit"
    },
    "settings_used": {
      "pass_grade_value": 20,
      "merit_grade_value": 30,
      "distinction_grade_value": 40,
      "max_total_score": 200,
      "grade_a_percentage": 85,
      "grade_b_percentage": 75,
      "grade_c_percentage": 65,
      "grade_d_percentage": 50
    }
  }
}
```

**Use Case**: Admin can review calculated metrics before approving to ensure correctness.

---

### Edit Grade Before Approval

**Endpoint**: `PUT /grades/:id/edit`

**Description**: Edit a grade's components before approval (only allowed if status is 'pending_admin_approval').

**Request Body** (all fields optional):
```json
{
  "assignment1_grade": "M",
  "assignment2_grade": "D",
  "final_exam_score": 110,
  "notes": "Reviewed by admin - adjusted based on student appeal"
}
```

**Validation**:
- `assignment1_grade`: must be 'P', 'M', or 'D'
- `assignment2_grade`: must be 'P', 'M', or 'D'
- `final_exam_score`: must be between 0-150

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Grade edited successfully",
  "data": {
    "id": 5,
    "assignment1_grade": "M",
    "assignment2_grade": "D",
    "final_exam_score": 110,
    "updated_at": "2024-01-15T13:00:00Z"
  }
}
```

---

### Approve Grade

**Endpoint**: `PUT /grades/:id/approve`

**Description**: Approve grade and automatically calculate all metrics using current grade settings.

**Calculation Process** (automatic):
```
1. Convert P/M/D grades to numeric scores using current settings
2. Calculate assignments scores = 1✓ assignment1_score = convertLetterGradeToScore(assignment1_grade, settings)
3. Calculate assignment2_score = convertLetterGradeToScore(assignment2_grade, settings)
4. Validate final_exam_score (0-150)
5. Calculate total_score = assignment1 + assignment2 + final_exam
6. Calculate total_percentage = (total_score / max_total_score) × 100
7. Calculate grade_point = (total_score / max_total_score) × 4.0
8. Calculate letter_grade based on percentage brackets
9. Determine final_result (Pass/Merit/Distinction/Fail)
10. Update grade record with all calculated values
11. Set status = 'approved'
12. Set admin_approved_by = current_user_id
13. Set approved_at = timestamp
14. Log activity with final result
15. Commit transaction (all or nothing)
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Grade approved successfully with calculated metrics",
  "data": {
    "id": 5,
    "student_id": 3,
    "course_id": 1,
    "status": "approved",
    "assignment1_score": 20,
    "assignment2_score": 30,
    "final_exam_score": 95,
    "total_score": 145,
    "total_percentage": 72.5,
    "grade_point": 2.9,
    "letter_grade": "B",
    "final_result": "Merit",
    "admin_approved_by": 1,
    "approved_at": "2024-01-15T13:30:00Z"
  }
}
```

**Important Notes**:
- Uses Sequelize transaction for atomicity
- All calculations are automatic - admin doesn't need to calculate
- If any error occurs, entire operation rolls back
- Activity is logged showing final result

---

### Reject Grade

**Endpoint**: `PUT /grades/:id/reject`

**Description**: Reject a grade and revert it to draft status for professor to resubmit.

**Request Body**:
```json
{
  "rejection_reason": "Final exam score seems incorrect - please verify with department records"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Grade rejected and reverted to draft status",
  "data": {
    "id": 5,
    "status": "draft",
    "notes": "[2024-01-15 13:45:00] Rejected: Final exam score seems incorrect - please verify with department records"
  }
}
```

**Notes Update Format**:
The rejection reason is appended to existing notes with timestamp:
```
[YYYY-MM-DD HH:MM:SS] Rejected: <reason>
```

**Transaction Details**: Uses Sequelize transaction for atomicity.

---

## QR Code Management

### Generate QR Code for Student

**Endpoint**: `POST /qr-codes/generate/:studentId`

**Description**: Generate a secure QR code for student registration with cryptographic token and expiration.

**Request Body** (optional):
```json
{
  "expirationHours": 24
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "student_id": 3,
    "qr_secret": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "qr_data": "eyJzdHVkZW50X2lkIjogMywgInNlY3JldCI6ICJhMWIyYzNkNGU1ZjZnN2g4aTlqMGsxbDJtM24ub...",
    "qr_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASgAAASgAAASgAAASg...",
    "expires_at": "2024-01-16T10:30:00Z",
    "is_active": true
  }
}
```

**Response Fields Explanation**:
- `qr_secret`: 32-byte cryptographic random token
- `qr_data`: Base64-encoded JSON payload with student_id, secret, timestamps, expiration
- `qr_image`: PNG image as DataURL (300x300px, error correction level H)
- `expires_at`: Expiration timestamp (UTC)
- `is_active`: Whether this QR code is currently valid

**Security Features**:
- Cryptographically random secret generation
- Expiration validation
- Base64 encoding for transport
- PNG image at high error correction level (H)

---

### Regenerate QR Code

**Endpoint**: `POST /qr-codes/regenerate/:studentId`

**Description**: Revoke old QR code and generate new one with fresh secret.

**Request Body** (optional):
```json
{
  "expirationHours": 48
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "QR code regenerated successfully",
  "data": {
    "student_id": 3,
    "qr_secret": "new_random_secret_32bytes_long",
    "qr_data": "new_base64_encoded_payload",
    "qr_image": "new_data_url_png_image",
    "expires_at": "2024-01-17T10:30:00Z",
    "is_active": true
  }
}
```

**Process**:
1. Deactivates previous QR code
2. Generates new secret and payload
3. Creates new PNG image
4. Stores in StudentQRCode table

---

### Revoke QR Code

**Endpoint**: `DELETE /qr-codes/:studentId`

**Description**: Deactivate a student's current QR code (marks is_active=false).

**Response** (200 OK):
```json
{
  "success": true,
  "message": "QR code revoked successfully"
}
```

---

## Request/Response Formats

### Authentication Header

All authenticated requests require:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Obtain token from `/api/auth/login` endpoint.

### Standard Success Response

```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    /* response data */
  }
}
```

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

### Validation Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "value": "invalid_value",
      "msg": "course_code must be a valid string",
      "param": "course_code",
      "location": "body"
    }
  ]
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation failed, invalid input |
| 403 | Forbidden | User not admin, insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database error, unexpected exception |

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Validation failed" | Input doesn't match schema | Review request body against validation rules |
| "Access denied. Admin privileges required." | Non-admin user calling admin endpoint | Login with admin account |
| "Record not found" | Resource doesn't exist | Verify ID/resource exists before operation |
| "Duplicate key error" | Unique constraint violated | Change value (e.g., course_code, username) |
| "Active students exist" | Trying to delete course with enrolled students | First delete enrollments or keep course active |

---

## Testing Guide

### 1. Prerequisites

1. Server running on `http://localhost:5000`
2. Grade settings initialized
3. You have admin JWT token

### 2. Initialize System (First Time Setup)

```bash
# Initialize default grade settings
curl -X POST http://localhost:5000/api/admin/grade-settings/initialize \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json"
```

### 3. Create Test Data (In Order)

#### Step 1: Create Course
```bash
curl -X POST http://localhost:5000/api/admin/courses \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "specialty_id": 1,
    "academic_year_id": 1,
    "semester_id": 1,
    "course_code": "CS401",
    "course_name": "Advanced Database Systems",
    "arabic_name": "أنظمة قواعد البيانات المتقدمة",
    "credit_hours": 4
  }'
```

Expected: Course ID (e.g., 7)

#### Step 2: Create Professor
```bash
curl -X POST http://localhost:5000/api/admin/professors \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "prof_database",
    "email": "prof.database@university.edu",
    "password": "ProfPass@123",
    "full_name": "Dr. Database Expert",
    "phone": "+20198765432",
    "department": "Computer Science",
    "specialization": "Database Systems"
  }'
```

Expected: Professor ID (e.g., 6)

#### Step 3: Assign Course to Professor
```bash
curl -X POST http://localhost:5000/api/admin/professors/6/courses \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 7,
    "academic_year_id": 1,
    "semester_id": 1,
    "is_primary": true
  }'
```

### 4. Test Grade Approval Workflow

#### Get Pending Grades
```bash
curl -X GET http://localhost:5000/api/admin/grades/pending \
  -H "Authorization: Bearer <admin_token>"
```

#### Preview Metrics Before Approval
```bash
curl -X GET http://localhost:5000/api/admin/grades/1/preview \
  -H "Authorization: Bearer <admin_token>"
```

#### Edit Grade Before Approval
```bash
curl -X PUT http://localhost:5000/api/admin/grades/1/edit \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignment1_grade": "M",
    "assignment2_grade": "D",
    "final_exam_score": 120,
    "notes": "Reviewed - adjusted based on verification"
  }'
```

#### Approve Grade
```bash
curl -X PUT http://localhost:5000/api/admin/grades/1/approve \
  -H "Authorization: Bearer <admin_token>"
```

Expected response shows all calculated metrics:
- `assignment1_score`, `assignment2_score`, `final_exam_score`
- `total_score`, `total_percentage`, `grade_point`
- `letter_grade`, `final_result` (Pass/Merit/Distinction)
- `admin_approved_by`, `approved_at`

#### Reject Grade
```bash
curl -X PUT http://localhost:5000/api/admin/grades/2/reject \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rejection_reason": "Assignment scores don'\''t match department records - please verify"
  }'
```

### 5. Test QR Code Generation

#### Generate QR Code
```bash
curl -X POST http://localhost:5000/api/admin/qr-codes/generate/1 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "expirationHours": 24
  }'
```

#### Regenerate QR Code
```bash
curl -X POST http://localhost:5000/api/admin/qr-codes/regenerate/1 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json"
```

#### Revoke QR Code
```bash
curl -X DELETE http://localhost:5000/api/admin/qr-codes/1 \
  -H "Authorization: Bearer <admin_token>"
```

### 6. Test Grade Settings

#### Get All Settings
```bash
curl -X GET http://localhost:5000/api/admin/grade-settings \
  -H "Authorization: Bearer <admin_token>"
```

#### Update Settings
```bash
curl -X PUT http://localhost:5000/api/admin/grade-settings/pass_grade_value \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "setting_value": 25
  }'
```

Verify: New approvals use the updated value (20→25), historical approvals unchanged.

---

## Key Features Summary

✅ **Atomic Transactions**: Grade approval, professor creation/deletion use transactions
✅ **Dynamic Settings**: P/M/D values configurable by admin, not hardcoded
✅ **Automatic Calculations**: Grade metrics calculated automatically on approval
✅ **Comprehensive Logging**: All operations logged to ActivityLog table
✅ **Input Validation**: express-validator on all endpoints
✅ **Security**: JWT authentication + role-based authorization (admin only)
✅ **Soft Deletes**: Courses, professors use soft delete (is_active flag)
✅ **QR Code Security**: Cryptographic tokens, expiration, image generation
✅ **Preview Before Approval**: Admin can see calculated metrics before committing
✅ **Edit Before Approval**: Admin can modify grades while pending approval
✅ **Rejection Workflow**: Can reject grades with reasons, revert to draft for resubmission

---

## Implementation Notes

### Services Used
- `courseService.js`: CRUD, soft delete, filtering
- `professorService.js`: Create/update/delete with transactions, course assignment
- `gradeApprovalService.js`: Metrics calculation, approval workflow with transactions
- `gradeSettingsService.js`: Dynamic settings management
- `qrCodeService.js`: Secure QR generation with crypto tokens

### Database Integration
- All services use Sequelize ORM
- Transaction management for multi-step operations
- Proper association definitions in `config/models.js`
- Activity logging on all operations

### Security
- JWT token authentication required
- Admin role verification on all routes
- Input validation with express-validator
- Cryptographic random token generation for QR codes
- Password hashing with bcrypt(12)

---

## Support & Documentation

For additional help:
- Review service files for implementation details
- Check `ActivityLog` table for operation history
- Use `/api/admin/grades/:id/preview` to verify calculations before approval
- Refer to validation error messages for input requirements
