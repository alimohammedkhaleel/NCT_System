# Testing Guide - Professor Course Assignment Fix

## Quick Start

### Option 1: Automated Test Script (Recommended)

```bash
# Make sure server is running
cd server
npm start

# In another terminal, run the test
node test-professor-assignment.js
```

This will automatically:
- Login as admin
- Create all required data (specialty, academic year, semester, course, professor)
- Assign the course to the professor
- Verify the assignment

### Option 2: Postman Collection

1. Import `.postman.json` into Postman
2. Set environment variable `base_url` to `http://localhost:5000`
3. Run the collection in order (it will save IDs automatically)

### Option 3: Manual Testing via UI

1. Start the application:
   ```bash
   # Terminal 1: Start backend
   cd server
   npm start

   # Terminal 2: Start frontend
   cd client/frontend
   npm run dev
   ```

2. Login as admin:
   - Username: `admin`
   - Password: `admin123`

3. Navigate to Professors page

4. Click "Assign Courses" for any professor

5. Select courses and click "Save Assignments"

6. Verify success message appears

## Expected Results

### Success Case

**Request:**
```http
POST /api/admin/professors/1/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": 1,
  "academic_year_id": 1,
  "semester_id": 1,
  "is_primary": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Course assigned to professor successfully",
  "data": {
    "id": 1,
    "professor_id": 1,
    "course_id": 1,
    "academic_year_id": 1,
    "semester_id": 1,
    "is_primary": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Cases

#### 1. Missing Required Field

**Request:**
```json
{
  "course_id": 1,
  "academic_year_id": 1
  // Missing semester_id
}
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "semester_id",
      "message": "semester_id must be an integer"
    }
  ]
}
```

#### 2. Invalid Professor ID

**Request:**
```http
POST /api/admin/professors/abc/courses
```

**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "id",
      "message": "Professor ID must be an integer"
    }
  ]
}
```

#### 3. Duplicate Assignment

**Request:** (Assigning same course twice)

**Response (400):**
```json
{
  "success": false,
  "message": "Professor is already assigned to this course in this period"
}
```

#### 4. Professor Not Found

**Request:**
```http
POST /api/admin/professors/9999/courses
```

**Response (404):**
```json
{
  "success": false,
  "message": "Professor not found"
}
```

## Troubleshooting

### Issue: "No specialties found"

**Solution:**
```bash
# Login to database and check
mysql -u root -p nctu_erp
SELECT * FROM specialties;

# If empty, run seed script
cd server
npm start  # This will auto-seed
```

### Issue: "No academic years found"

**Solution:**
```bash
# Create via API
POST /api/admin/academic-years
{
  "specialty_id": 1,
  "year_number": 1,
  "academic_season": "2024-2025",
  "is_active": true
}
```

### Issue: "No semesters found"

**Solution:**
```bash
# Create via API
POST /api/admin/semesters
{
  "academic_year_id": 1,
  "semester_name": "Fall",
  "start_date": "2024-09-01",
  "end_date": "2025-01-31",
  "is_active": true
}
```

### Issue: "Validation failed"

**Check:**
1. All required fields are present
2. All IDs are integers
3. Professor ID is in URL, not body
4. Token is valid and not expired

### Issue: "404 Not Found"

**Check:**
1. Server is running on correct port (5000)
2. Endpoint path is correct: `/api/admin/professors/:id/courses`
3. Professor ID exists in database

## Verification Steps

After successful assignment:

1. **Check Database:**
   ```sql
   SELECT * FROM professor_courses 
   WHERE professor_id = 1 AND course_id = 1;
   ```

2. **Check via API:**
   ```http
   GET /api/admin/professors/1
   ```
   Should show the course in `ProfessorCourses` array

3. **Check in UI:**
   - Go to Professors page
   - View professor details
   - Assigned courses should be visible

## Performance Testing

### Load Test

```bash
# Install artillery if not installed
npm install -g artillery

# Create test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Assign Course"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            username: "admin"
            password: "admin123"
          capture:
            - json: "$.token"
              as: "token"
      - post:
          url: "/api/admin/professors/1/courses"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            course_id: 1
            academic_year_id: 1
            semester_id: 1
            is_primary: true
EOF

# Run load test
artillery run load-test.yml
```

## Success Criteria

✅ All tests pass without errors
✅ Validation works correctly
✅ Duplicate assignments are prevented
✅ Database records are created correctly
✅ UI shows success message
✅ Assigned courses appear in professor details
✅ No console errors in browser
✅ No server errors in logs

## Rollback Plan

If issues occur in production:

1. **Revert validation change:**
   ```javascript
   // In server/middleware/validators.js
   body('professor_id').isInt()  // Revert to old validation
   ```

2. **Revert frontend changes:**
   ```bash
   git revert <commit-hash>
   ```

3. **Clear cache:**
   ```bash
   # Frontend
   cd client/frontend
   rm -rf node_modules/.vite
   npm run dev

   # Backend
   cd server
   pm2 restart all  # or npm start
   ```

## Support

If you encounter issues:

1. Check server logs: `tail -f server/logs/error.log`
2. Check browser console for frontend errors
3. Verify database connection: `mysql -u root -p nctu_erp`
4. Review this guide and COMPLETE_ANALYSIS.md
5. Run the automated test script to isolate the issue

---

**Last Updated:** ${new Date().toISOString()}
