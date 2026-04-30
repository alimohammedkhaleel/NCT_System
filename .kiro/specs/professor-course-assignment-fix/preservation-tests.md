# Preservation Property Tests - Professor Course Assignment Fix

## Test Execution Date
${new Date().toISOString()}

## Property 2: Preservation - Other API Endpoints Unchanged

### Baseline Behavior (UNFIXED Code)

These tests document the current behavior of all other API endpoints that MUST remain unchanged after the fix.

### Test Suite 1: Other professorsAPI Methods

#### Test 1.1: getAll()
**Current Behavior:**
- Method: GET
- Endpoint: `/admin/professors`
- Query params: None (or optional filters)
- Expected: Returns list of all professors
- Status: ✅ WORKING

#### Test 1.2: getById(id)
**Current Behavior:**
- Method: GET
- Endpoint: `/admin/professors/${id}`
- Expected: Returns professor details with assigned courses
- Status: ✅ WORKING

#### Test 1.3: create(data)
**Current Behavior:**
- Method: POST
- Endpoint: `/admin/professors`
- Body: `{ username, email, password, full_name, phone, department, specialization }`
- Expected: Creates new professor
- Status: ✅ WORKING

#### Test 1.4: update(id, data)
**Current Behavior:**
- Method: PUT
- Endpoint: `/admin/professors/${id}`
- Body: `{ department, specialization, is_active }`
- Expected: Updates professor details
- Status: ✅ WORKING

#### Test 1.5: delete(id)
**Current Behavior:**
- Method: DELETE
- Endpoint: `/admin/professors/${id}`
- Expected: Soft deletes professor (marks inactive)
- Status: ✅ WORKING

#### Test 1.6: getAssignedCourses(professorId)
**Current Behavior:**
- Method: GET
- Endpoint: `/admin/professors/${professorId}/courses`
- Expected: Returns list of assigned courses
- Status: ✅ WORKING

### Test Suite 2: Other API Modules

#### Test 2.1: coursesAPI
**Current Behavior:**
- All methods (getAll, getById, create, update, delete) use `/admin/courses` endpoints
- Status: ✅ WORKING
- Must remain unchanged

#### Test 2.2: gradesAPI
**Current Behavior:**
- All methods use `/grades/*` and `/admin/grades/*` endpoints
- Status: ✅ WORKING
- Must remain unchanged

#### Test 2.3: gradeSettingsAPI
**Current Behavior:**
- All methods use `/admin/grade-settings` endpoints
- Status: ✅ WORKING
- Must remain unchanged

#### Test 2.4: qrCodeAPI
**Current Behavior:**
- All methods use `/admin/qr-codes/*` endpoints
- Status: ✅ WORKING
- Must remain unchanged

#### Test 2.5: studentAPI
**Current Behavior:**
- All methods use `/auth/register` and `/student/*` endpoints
- Status: ✅ WORKING
- Must remain unchanged

#### Test 2.6: timetablesAPI
**Current Behavior:**
- All methods use `/admin/timetables` endpoints
- Status: ✅ WORKING
- Must remain unchanged

#### Test 2.7: specialtiesAPI
**Current Behavior:**
- All methods use `/specialties` endpoints
- Status: ✅ WORKING
- Must remain unchanged

#### Test 2.8: academicYearsAPI
**Current Behavior:**
- All methods use `/admin/academic-years` endpoints
- Status: ✅ WORKING
- Must remain unchanged

#### Test 2.9: semestersAPI
**Current Behavior:**
- All methods use `/admin/semesters` endpoints
- Status: ✅ WORKING
- Must remain unchanged

### Test Suite 3: Request Interceptors

#### Test 3.1: Authentication Interceptor
**Current Behavior:**
- Adds `Authorization: Bearer ${token}` header to all requests
- Status: ✅ WORKING
- Must remain unchanged

#### Test 3.2: Logging Interceptor
**Current Behavior:**
- Logs all API requests and responses to console
- Status: ✅ WORKING
- Must remain unchanged

#### Test 3.3: Error Handling Interceptor
**Current Behavior:**
- Handles 401 errors by clearing token and redirecting to login
- Logs all API errors
- Status: ✅ WORKING
- Must remain unchanged

### Test Suite 4: adminService.js (Alternative Service)

#### Test 4.1: professorAPI.assignCourse()
**Current Behavior:**
- Method: POST
- Endpoint: `/professors/${professorId}/courses` (note: relative to `/api/admin`)
- Body: courseAssignment object
- Status: ✅ WORKING (This one is CORRECT!)
- Must remain unchanged

**Note:** The `adminService.js` file has the CORRECT implementation. The bug is only in `apiService.js`.

## Preservation Requirements

After implementing the fix in `apiService.js`:

1. ✅ All other professorsAPI methods must send requests to the same endpoints
2. ✅ All other API modules must remain completely unchanged
3. ✅ Request interceptors must continue to work for all requests
4. ✅ The correct implementation in `adminService.js` must remain unchanged
5. ✅ Only the `professorsAPI.assignCourses` method in `apiService.js` should change

## Verification Checklist

- [ ] Verify all professorsAPI methods (except assignCourses) unchanged
- [ ] Verify all other API modules unchanged
- [ ] Verify request interceptors still work
- [ ] Verify adminService.js unchanged
- [ ] Verify only assignCourses in apiService.js changed
