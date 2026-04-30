# Professor Course Assignment Endpoint Fix - Bugfix Design

## Overview

This bugfix addresses an endpoint path mismatch between the frontend and backend that prevents admins from assigning courses to professors. The frontend sends POST requests to `/admin/professors/:id/assign-courses`, but the backend route is defined as `/admin/professors/:id/courses`. The fix involves updating the frontend API service to use the correct endpoint path that matches the backend implementation.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when an admin attempts to assign courses to a professor via the frontend API
- **Property (P)**: The desired behavior - the POST request should successfully reach the backend endpoint and create the course assignment
- **Preservation**: All other professor management operations (create, read, update, delete, remove course) must continue to work unchanged
- **professorsAPI.assignCourses**: The function in `client/frontend/src/services/apiService.js` that sends the course assignment request
- **extendedAdminRoutes**: The backend route file at `server/routes/extendedAdminRoutes.js` that defines the correct endpoint as `POST /admin/professors/:id/courses`

## Bug Details

### Bug Condition

The bug manifests when an admin calls `professorsAPI.assignCourses(professorId, courseIds)` from the frontend. The function constructs a POST request to `/admin/professors/${professorId}/assign-courses`, but the backend has no route matching this path, resulting in a 404 error.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { professorId: number, courseIds: array }
  OUTPUT: boolean
  
  RETURN input.professorId IS valid integer
         AND input.courseIds IS non-empty array
         AND requestPath = `/admin/professors/${input.professorId}/assign-courses`
         AND backendRoute = `/admin/professors/:id/courses`
         AND requestPath != backendRoute
END FUNCTION
```

### Examples

- **Example 1**: Admin assigns course ID 5 to professor ID 3
  - Frontend sends: `POST /admin/professors/3/assign-courses` with body `{ course_ids: [5] }`
  - Backend expects: `POST /admin/professors/3/courses`
  - Result: 404 "endpoint not found" error

- **Example 2**: Admin assigns multiple courses [1, 2, 3] to professor ID 7
  - Frontend sends: `POST /admin/professors/7/assign-courses` with body `{ course_ids: [1, 2, 3] }`
  - Backend expects: `POST /admin/professors/7/courses`
  - Result: 404 "endpoint not found" error

- **Example 3**: Admin retrieves professor details with assigned courses
  - Frontend sends: `GET /admin/professors/3`
  - Backend expects: `GET /admin/professors/:id`
  - Result: Works correctly (no bug)

- **Edge Case**: Admin attempts to assign empty course array
  - This should be handled by backend validation, but currently fails at routing level due to endpoint mismatch

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- GET requests to `/admin/professors/:id` must continue to return professor details with assigned courses
- DELETE requests to `/admin/professor-courses/:assignmentId` must continue to remove course assignments
- All other professor management operations (create, update, delete, list) must continue to function correctly
- Backend validation middleware `validateCoursAssignment` must continue to enforce validation rules
- All other API endpoints in `apiService.js` must remain unaffected

**Scope:**
All API calls that do NOT involve the `professorsAPI.assignCourses` function should be completely unaffected by this fix. This includes:
- All course management endpoints (`coursesAPI.*`)
- All other professor endpoints (`professorsAPI.getAll`, `getById`, `create`, `update`, `delete`, `getAssignedCourses`)
- All grade settings, grades, QR code, student, timetable, specialty, academic year, and semester endpoints

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is:

1. **Endpoint Path Mismatch**: The frontend developer used the path `/admin/professors/:id/assign-courses` when implementing the `assignCourses` function, but the backend route was defined as `/admin/professors/:id/courses`
   - Backend route: `router.post('/professors/:id/courses', ...)` in `extendedAdminRoutes.js` line 127
   - Frontend call: `api.post(\`/admin/professors/\${professorId}/assign-courses\`, ...)` in `apiService.js` line 77

2. **Inconsistent Naming Convention**: The frontend used a verb-based path (`assign-courses`) while the backend used a resource-based RESTful path (`courses`)

3. **No Integration Testing**: The mismatch was not caught because there were no integration tests validating the frontend-backend contract for this endpoint

## Correctness Properties

Property 1: Bug Condition - Course Assignment Request Reaches Backend

_For any_ API call to `professorsAPI.assignCourses(professorId, courseIds)` where professorId is valid and courseIds is a non-empty array, the fixed function SHALL send a POST request to `/admin/professors/${professorId}/courses` that successfully reaches the backend route handler without a 404 error.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Other API Endpoints Unchanged

_For any_ API call that is NOT `professorsAPI.assignCourses`, the fixed code SHALL produce exactly the same HTTP request as the original code, preserving all existing functionality for other professor operations and all other API endpoints.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

**File**: `client/frontend/src/services/apiService.js`

**Function**: `professorsAPI.assignCourses`

**Specific Changes**:
1. **Update Endpoint Path**: Change the POST request path from `/admin/professors/${professorId}/assign-courses` to `/admin/professors/${professorId}/courses`
   - Line 77: Replace `api.post(\`/admin/professors/\${professorId}/assign-courses\`, { course_ids: courseIds })`
   - With: `api.post(\`/admin/professors/\${professorId}/courses\`, { course_ids: courseIds })`

2. **Verify Request Body Format**: Ensure the request body `{ course_ids: courseIds }` matches what the backend expects
   - Backend expects: `{ course_id, academic_year_id, semester_id, is_primary }` per the `validateCoursAssignment` middleware
   - This reveals a secondary issue: the frontend is sending `course_ids` (plural, array) but the backend expects a single `course_id` with additional metadata
   - The fix must also update the request body structure to match backend expectations

3. **Update Function Signature**: Change the function to accept the full course assignment object instead of just course IDs
   - Current: `assignCourses: (professorId, courseIds) => ...`
   - Fixed: `assignCourses: (professorId, courseAssignment) => ...`
   - Where `courseAssignment` is `{ course_id, academic_year_id, semester_id, is_primary }`

4. **Update Request Body**: Pass the courseAssignment object directly instead of wrapping in `course_ids`
   - Current: `{ course_ids: courseIds }`
   - Fixed: `courseAssignment` (the object itself)

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm the root cause is the endpoint path mismatch.

**Test Plan**: Write integration tests that call `professorsAPI.assignCourses` with valid data and observe the 404 error. Use network inspection tools to verify the request path. Run these tests on the UNFIXED code to confirm the failure.

**Test Cases**:
1. **Single Course Assignment Test**: Call `assignCourses(1, { course_id: 5, academic_year_id: 1, semester_id: 1, is_primary: true })` (will fail with 404 on unfixed code)
2. **Multiple Assignments Test**: Attempt to assign multiple courses sequentially to the same professor (will fail with 404 on unfixed code)
3. **Network Path Verification**: Inspect browser DevTools Network tab to confirm request goes to `/admin/professors/1/assign-courses` (will show 404 on unfixed code)
4. **Backend Route Verification**: Verify backend has route `POST /admin/professors/:id/courses` but not `/admin/professors/:id/assign-courses` (confirms root cause)

**Expected Counterexamples**:
- POST requests to `/admin/professors/:id/assign-courses` return 404 "endpoint not found"
- Backend logs show no matching route for the request path
- Possible causes: typo in frontend path, inconsistent naming convention, missing backend route

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := professorsAPI.assignCourses_fixed(input.professorId, input.courseAssignment)
  ASSERT result.status = 200 OR result.status = 201
  ASSERT result.data.success = true
  ASSERT NO 404 error occurs
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL apiCall WHERE apiCall != professorsAPI.assignCourses DO
  ASSERT apiCall_original(input) = apiCall_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for all other API operations, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Professor CRUD Preservation**: Verify that `getAll`, `getById`, `create`, `update`, `delete` continue to work correctly after fix
2. **Course Removal Preservation**: Verify that removing course assignments via DELETE `/admin/professor-courses/:assignmentId` continues to work
3. **Other API Endpoints Preservation**: Verify that courses, grades, QR codes, timetables, and other endpoints continue to work
4. **Request Format Preservation**: Verify that all other API calls send the same request format (headers, body, params) as before

### Unit Tests

- Test that `assignCourses` constructs the correct URL path `/admin/professors/:id/courses`
- Test that `assignCourses` sends the correct request body format matching backend expectations
- Test that other `professorsAPI` methods are not affected by the change
- Test edge cases: invalid professor ID, missing required fields in courseAssignment object

### Property-Based Tests

- Generate random professor IDs and course assignment objects, verify requests go to correct endpoint
- Generate random API calls across all endpoints, verify only `assignCourses` behavior changes
- Test that request interceptors (auth token, logging) continue to work for all endpoints

### Integration Tests

- Test full flow: admin logs in, navigates to professor management, assigns course to professor
- Test that backend successfully receives and processes the request after fix
- Test that UI displays success message and updates professor's assigned courses list
- Test error handling: backend validation errors are properly displayed to admin
