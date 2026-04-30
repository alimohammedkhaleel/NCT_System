# API Documentation - Professor Grades Course-Student Linking Fix

## Overview

This document describes the API changes made to fix the professor grades page where students weren't appearing. The fix ensures students are fetched based on specialty_id, academic_year_id (current_year), AND semester_id.

## New Endpoints

### 1. Get Students by Course (Professor)

Fetches all students for a course based on specialty, academic year, and semester matching.

**Endpoint:** `GET /api/professor/students-by-course`

**Authentication:** Required (Professor role)

**Query Parameters:**
- `course_id` (required): The ID of the course

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "student_id": 10,
      "student_code": "2024001",
      "full_name": "أحمد محمد",
      "specialty_name": "Computer Science",
      "current_year": 2,
      "grade": {
        "id": 50,
        "assignment1_grade": "P",
        "assignment2_grade": "M",
        "assignment1_score": 30.00,
        "assignment2_score": 21.00,
        "final_exam_score": 120.00,
        "total_score": 171.00,
        "total_percentage": 81.43,
        "final_result": "Merit",
        "letter_grade": "B",
        "grade_point": 3.0,
        "status": "draft"
      }
    }
  ],
  "course_info": {
    "course_code": "CS201",
    "course_name": "Data Structures",
    "arabic_name": "هياكل البيانات",
    "specialty_name": "Computer Science",
    "academic_year": 2,
    "semester_name": "Fall"
  },
  "course_config": {
    "ass1_max": 30.00,
    "ass2_max": 30.00,
    "final_max": 150.00,
    "p_value": 30.00,
    "m_value": 21.00,
    "d_value": 15.00
  }
}
```

**Logic:**
1. Verifies professor is assigned to the course
2. Fetches course details (specialty_id, academic_year_id, semester_id)
3. Fetches all students WHERE:
   - `specialty_id` = `course.specialty_id`
   - `current_year` = `course.academic_year_id`
4. LEFT JOIN with Grades table to include existing grades
5. Fetches CourseGradeConfig or returns default values

**Error Responses:**
- `403 Forbidden`: Professor not authorized for this course
- `404 Not Found`: Course not found
- `500 Internal Server Error`: Database error

## Modified Endpoints

### 2. Create Course (Admin)

**Endpoint:** `POST /api/admin/courses`

**Changes:**
- `semester_id` is now **required**
- Validates that semester exists and belongs to the specified academic year

**Request Body:**
```json
{
  "course_code": "CS201",
  "course_name": "Data Structures",
  "arabic_name": "هياكل البيانات",
  "specialty_id": 1,
  "academic_year_id": 2,
  "semester_id": 1,
  "credit_hours": 3,
  "is_active": true
}
```

**Validation:**
- `semester_id` must be provided
- `semester_id` must exist in semesters table
- Semester must be linked to the same academic_year_id

### 3. Update Course (Admin)

**Endpoint:** `PUT /api/admin/courses/:id`

**Changes:**
- Same validation as Create Course
- `semester_id` can be updated

### 4. Get All Courses (Admin)

**Endpoint:** `GET /api/admin/courses`

**Changes:**
- Response now includes semester information
- Supports filtering by `semester_id`

**Query Parameters:**
- `specialty_id` (optional): Filter by specialty
- `academic_year_id` (optional): Filter by academic year
- `semester_id` (optional): Filter by semester

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "course_code": "CS201",
      "course_name": "Data Structures",
      "arabic_name": "هياكل البيانات",
      "specialty_name": "Computer Science",
      "academic_year": 2,
      "semester_name": "Fall",
      "semester_id": 1,
      "credit_hours": 3,
      "is_active": true
    }
  ]
}
```

### 5. Get Professor Courses

**Endpoint:** `GET /api/professor/courses`

**Changes:**
- Response now includes semester information
- Supports filtering by `semester_id`

**Query Parameters:**
- `specialty_id` (optional): Filter by specialty
- `academic_year_id` (optional): Filter by academic year
- `semester_id` (optional): Filter by semester

## Data Models

### Course Model

```javascript
{
  id: INTEGER,
  course_code: STRING(20),
  course_name: STRING(100),
  arabic_name: STRING(100),
  specialty_id: INTEGER,
  academic_year_id: INTEGER,
  semester_id: INTEGER,  // NOW REQUIRED
  credit_hours: INTEGER,
  is_active: BOOLEAN
}
```

### Semester Model

```javascript
{
  id: INTEGER,
  academic_year_id: INTEGER,
  semester_name: ENUM('Fall', 'Spring', 'Summer'),
  start_date: DATE,
  end_date: DATE,
  is_active: BOOLEAN
}
```

## Migration Notes

### Database Changes

No schema changes were required as the `semester_id` field already existed in the courses table.

### Data Migration

All existing courses in the database already have `semester_id` assigned. No migration script execution was needed.

To check for courses without semester_id:
```bash
node server/check-courses-semester.js
```

To migrate courses (if needed):
```bash
node server/migrate-courses-semester.js
```

## Testing

### Unit Tests

Located in: `server/__tests__/professor-grades-linking.test.js`

Tests cover:
- Fetching students by course (success case)
- Authorization checks (403 for unauthorized professors)
- Correct student filtering (same specialty and year)
- Exclusion of students from other specialties
- Exclusion of students from other years
- LEFT JOIN behavior (students without grades appear)
- Course config retrieval

### Integration Tests

Located in: `server/__tests__/professor-grades-integration.test.js`

Tests cover:
- Full flow: Add course with semester → verify in Admin Courses
- Full flow: Add course → verify in Professor Grades
- Full flow: Add students → select course → verify students appear
- Full flow: Add grades → verify grade calculation
- Full flow: Use filters → verify correct results

## Breaking Changes

### For Frontend

1. **Course Creation/Update Forms**: Must now include `semester_id` field
2. **Course Listings**: Should display semester information
3. **Professor Grades Page**: Should include semester filter

### For API Consumers

1. `POST /api/admin/courses` now requires `semester_id` in request body
2. `PUT /api/admin/courses/:id` now requires `semester_id` in request body
3. `GET /api/admin/courses` response includes `semester_name` and `semester_id`
4. New endpoint: `GET /api/professor/students-by-course` replaces old student fetching logic

## Backward Compatibility

The changes maintain backward compatibility for:
- Grade calculation logic (CourseGradeConfig)
- Grade submission workflow
- Grade approval process
- Existing filter functionality (specialty, academic_year)

## Security Considerations

1. **Authorization**: Professor can only access students for courses they're assigned to
2. **Data Validation**: All semester_id values are validated against the semesters table
3. **SQL Injection**: All queries use Sequelize ORM with parameterized queries

## Performance Considerations

1. **Indexes**: The courses table has a composite index on (specialty_id, academic_year_id, semester_id)
2. **LEFT JOIN**: Student fetching uses LEFT JOIN to avoid N+1 queries
3. **Eager Loading**: Course info includes related Specialty and Semester data in single query

## Support

For issues or questions, refer to:
- Bugfix document: `.kiro/specs/professor-grades-course-student-linking-fix/bugfix.md`
- Design document: `.kiro/specs/professor-grades-course-student-linking-fix/design.md`
- Tasks document: `.kiro/specs/professor-grades-course-student-linking-fix/tasks.md`
