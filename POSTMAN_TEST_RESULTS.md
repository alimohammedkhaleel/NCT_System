# NCTU ERP API - Postman Collection Update

## Summary

The Postman collection has been updated to include comprehensive tests for the newly modified `publishResults` endpoint in `server/controllers/adminController.js`.

## What Was Modified

### Admin Controller - `publishResults` Function

The `publishResults` endpoint now supports three publishing modes:

1. **By Semester & Academic Year**: Publish all approved grades for a specific semester and year
2. **By Specialty**: Filter by specialty in addition to semester/year
3. **By Grade IDs**: Publish specific grades by their IDs (new feature)

### Key Changes

- Added `grade_ids` parameter to allow publishing specific grades
- Changed validation to accept either `semester_id`, `academic_year_id`, OR `grade_ids`
- Now updates `is_published`, `published_at`, and `published_by` fields
- Returns count of published grades and students notified
- Only publishes grades that are `approved` and not already published (`is_published: false`)

## New Test Suite Added

### Section 7: Publish Results (NEW)

The following test cases were added:

1. **Publish Results by Semester & Year**
   - Tests publishing all approved grades for a semester/year combination
   - Validates response structure and Arabic messages
   - Checks for `published_count`, `students_notified`, and `published_at`

2. **Publish Results by Specialty**
   - Tests filtering by specialty in addition to semester/year
   - Handles both success (200) and not found (404) cases
   - Validates specialty-specific filtering

3. **Publish Specific Grades by IDs**
   - Tests the new `grade_ids` parameter
   - Allows selective publishing of specific grades
   - Validates that only specified grades are published

4. **Test Missing Required Fields**
   - Validates that at least one filter is required
   - Checks for proper 400 error response
   - Validates Arabic error message

5. **Test Non-Admin Access**
   - Ensures only admins can publish results
   - Tests authorization with student token
   - Validates 403 Forbidden response

## Running the Tests

### Prerequisites

1. **Start the server**:
   ```bash
   cd server
   npm start
   ```

2. **Ensure database is seeded** with test data:
   - Admin user: `admin` / `admin123`
   - Professor user: `professor` / `professor123`
   - Student user: `student1` / `student123`
   - At least one specialty, course, and approved grade

### Using Postman Desktop

1. **Import the collection**:
   - Open Postman
   - Click "Import" → "File" → Select `.postman.json`

2. **Create an environment** (optional but recommended):
   - Name: `NCTU ERP Local`
   - Variables:
     - `base_url`: `http://localhost:5000`
     - `token`: (will be set automatically)
     - `student_token`: (will be set automatically)
     - `professor_token`: (will be set automatically)

3. **Run the collection**:
   - Click on the collection name
   - Click "Run" button
   - Select all folders or specific test suites
   - Click "Run NCTU ERP - Complete API Testing"

4. **Run specific test suite**:
   - Expand "7. Publish Results (NEW)"
   - Run individual requests or the entire folder

### Using Newman (CLI)

```bash
# Install Newman if not already installed
npm install -g newman

# Run the entire collection
newman run .postman.json

# Run with environment file (if you have one)
newman run .postman.json -e nctu-erp-local.postman_environment.json

# Run with HTML reporter
newman run .postman.json --reporters cli,html --reporter-html-export postman-report.html
```

## Expected Results

### Successful Test Run

All tests should pass if:
- Server is running on `http://localhost:5000`
- Database has seed data
- All endpoints are properly configured

### Common Issues

1. **404 Not Found on publish-results**
   - **Cause**: No approved grades exist in the database
   - **Fix**: Create and approve some grades first, or expect 404 as valid response

2. **403 Forbidden**
   - **Cause**: Token expired or invalid
   - **Fix**: Re-run "Login as Admin" request to get fresh token

3. **400 Bad Request on validation**
   - **Cause**: Missing required fields
   - **Fix**: This is expected for validation tests

## Test Coverage

The updated collection now covers:

✅ Authentication (Admin, Professor, Student)
✅ Student Code Retrieval (NEW - from previous update)
✅ Specialties & Courses
✅ Course Grade Config CRUD
✅ Student Payment Status & Grades
✅ Registration Links Management
✅ Professor - Get Students by Course (NEW - from previous update)
✅ **Publish Results (NEW - this update)**
✅ Import/Export Grade Configs

## API Endpoint Details

### POST /api/admin/publish-results

**Authentication**: Required (Admin only)

**Request Body Options**:

```json
// Option 1: By Semester & Year
{
  "semester_id": 1,
  "academic_year_id": 1
}

// Option 2: By Semester, Year & Specialty
{
  "semester_id": 1,
  "academic_year_id": 1,
  "specialty_id": 2
}

// Option 3: By Grade IDs (NEW)
{
  "grade_ids": [1, 2, 3, 5, 8],
  "semester_id": 1,
  "academic_year_id": 1
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "تم نشر 15 درجة بنجاح",
  "data": {
    "published_count": 15,
    "students_notified": 12,
    "published_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:

- **400**: Missing required fields
  ```json
  {
    "success": false,
    "message": "يرجى تحديد الترم أو السنة الدراسية أو معرفات الدرجات"
  }
  ```

- **404**: No approved grades found
  ```json
  {
    "success": false,
    "message": "لا توجد درجات معتمدة للنشر"
  }
  ```

- **403**: Unauthorized (non-admin)
  ```json
  {
    "success": false,
    "message": "غير مصرح لك بالوصول"
  }
  ```

## Next Steps

1. **Run the tests** to verify the API changes work correctly
2. **Review test results** and fix any failing tests
3. **Update frontend** to use the new `grade_ids` parameter if needed
4. **Document** any additional API changes in the main API documentation

## Notes

- All tests include Arabic language validation for messages
- Tests are designed to be idempotent where possible
- Some tests may fail if database is empty (expected behavior)
- The collection uses environment variables for dynamic data (tokens, IDs)

---

**Last Updated**: 2024-01-15
**Collection Version**: 2.0
**API Version**: 1.0
