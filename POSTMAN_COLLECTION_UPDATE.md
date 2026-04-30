# Postman Collection Update - New Endpoint Added

## Summary

The `.postman.json` file has been updated to include comprehensive tests for the newly added `getStudentsByCourse` endpoint.

## New Endpoint Details

**Endpoint:** `GET /api/grades/professor/students-by-course`

**Purpose:** Get students enrolled in a course based on specialty, academic year, and semester (instead of relying on StudentEnrollment table)

**Authentication:** Required (Professor role only)

**Query Parameters:**
- `course_id` (required): The ID of the course

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "student_id": 10,
      "student_code": "2024001",
      "full_name": "أحمد محمد",
      "specialty_name": "تكنولوجيا المعلومات",
      "current_year": 2,
      "grade": {
        "id": 50,
        "assignment1_grade": "P",
        "assignment1_score": 30.00,
        "assignment2_grade": "M",
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
    "course_code": "CS101",
    "course_name": "Introduction to Programming",
    "arabic_name": "مقدمة في البرمجة",
    "specialty_name": "تكنولوجيا المعلومات",
    "academic_year": 2,
    "semester_name": "الفصل الأول"
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

## Tests Added to Postman Collection

### Section 6: Professor - Get Students by Course

1. **Login as Professor**
   - Authenticates as professor user
   - Saves professor token to environment
   - Tests: Login successful (200 status)

2. **Get Students by Course (NEW)**
   - Tests the new endpoint with valid course_id
   - Validates response structure:
     - ✓ Status code is 200
     - ✓ Response has students data array
     - ✓ Response has course_info with course details
     - ✓ Response has course_config with grade settings
     - ✓ Students have correct structure (student_id, student_code, full_name, specialty_name, current_year, grade)
     - ✓ Grade object has correct fields (assignment grades, scores, final_exam_score, total_score, status)

3. **Test Missing course_id Parameter**
   - Tests error handling when course_id is not provided
   - Validates:
     - ✓ Status code is 400
     - ✓ Error message mentions course_id

4. **Test Non-Professor Access**
   - Tests authorization by attempting access with admin token
   - Validates:
     - ✓ Status code is 403
     - ✓ Error message in Arabic

## How to Run the Tests

### Option 1: Using Newman (Postman CLI)

```bash
# Install Newman if not already installed
npm install -g newman

# Run the entire collection
newman run .postman.json --environment postman-environment.json

# Run only the new professor tests
newman run .postman.json --folder "6. Professor - Get Students by Course"
```

### Option 2: Import to Postman Desktop

1. Open Postman Desktop
2. Click "Import" → "File" → Select `.postman.json`
3. Create an environment with:
   - `base_url`: `http://localhost:5000`
4. Run the collection or individual requests

### Option 3: Using Postman Power (Requires API Key)

```javascript
// After configuring POSTMAN_API_KEY
mcp_postman_runCollection({
  "collectionId": "your-collection-id",
  "environmentId": "your-environment-id"
})
```

## Key Features of the New Endpoint

1. **Specialty-Based Filtering**: Gets students based on course's specialty_id and academic_year_id
2. **No StudentEnrollment Dependency**: Works even if students aren't explicitly enrolled via StudentEnrollment table
3. **Grade Integration**: Returns existing grades for students who have them
4. **Course Config**: Includes grade configuration (P/M/D values, max scores) for the course
5. **Course Info**: Provides complete course details including specialty, year, and semester

## Error Handling

The endpoint handles the following error cases:

- **403 Forbidden**: Non-professor users attempting access
- **400 Bad Request**: Missing course_id parameter
- **403 Forbidden**: Professor attempting to access a course they don't teach
- **404 Not Found**: Course doesn't exist
- **500 Internal Server Error**: Database or server errors

## Next Steps

1. **Start the server** (if not running):
   ```bash
   cd server
   npm start
   ```

2. **Run the tests**:
   ```bash
   newman run .postman.json
   ```

3. **Review results**: Check for any failing tests and fix issues

4. **Integrate with CI/CD**: Add Newman to your CI pipeline to run tests automatically

## Notes

- The server must be running on `http://localhost:5000` for tests to work
- Professor user credentials: `username: professor1`, `password: prof123`
- Admin user credentials: `username: admin`, `password: admin123`
- Student user credentials: `username: student1`, `password: student123`
- All test data is seeded from `server/seed-data.js`

## Collection Structure

```
NCTU ERP - Complete API Testing
├── 1. Authentication
├── 2. Get Specialties & Courses
├── 3. CourseGradeConfig - CRUD Operations
├── 4. Student Payment & Grades
├── 5. Registration Links Management
├── 6. Professor - Get Students by Course (NEW)
│   ├── Login as Professor
│   ├── Get Students by Course (NEW)
│   ├── Test Missing course_id Parameter
│   └── Test Non-Professor Access
└── 7. Import/Export Grade Configs
```

## Validation Checklist

- [x] Endpoint added to gradeController.js
- [x] Endpoint exported from gradeController.js
- [x] Route registered in gradeRoutes.js
- [x] Authorization middleware applied (professor role)
- [x] Postman tests created for success case
- [x] Postman tests created for error cases
- [x] Response structure validated
- [x] Documentation updated

## Expected Test Results

When running the collection, you should see:

```
→ 6. Professor - Get Students by Course
  ↳ Login as Professor
    ✓ Professor login successful
  ↳ Get Students by Course (NEW)
    ✓ Status code is 200
    ✓ Response has students data
    ✓ Response has course_info
    ✓ Response has course_config
    ✓ Students have correct structure
  ↳ Test Missing course_id Parameter
    ✓ Status code is 400
    ✓ Error message mentions course_id
  ↳ Test Non-Professor Access
    ✓ Status code is 403
    ✓ Error message in Arabic
```

All tests should pass if the implementation is correct.
