# Bug Condition Exploration - Professor Course Assignment

## Test Execution Date
${new Date().toISOString()}

## Property 1: Bug Condition - Course Assignment Endpoint Mismatch

### Test Case 1: Single Course Assignment
**Input:**
- professorId: 1
- courseAssignment: { course_id: 5, academic_year_id: 1, semester_id: 1, is_primary: true }

**Expected Behavior (After Fix):**
- POST request to: `/admin/professors/1/courses`
- Request body: `{ course_id: 5, academic_year_id: 1, semester_id: 1, is_primary: true }`
- Response: 200/201 with success message

**Actual Behavior (Before Fix):**
- POST request to: `/admin/professors/1/assign-courses` ❌
- Request body: `{ course_ids: [5] }` ❌
- Response: 404 "endpoint not found" ❌

### Test Case 2: Multiple Course Assignments
**Input:**
- professorId: 3
- courseAssignment: { course_id: 10, academic_year_id: 2, semester_id: 1, is_primary: false }

**Expected Behavior (After Fix):**
- POST request to: `/admin/professors/3/courses`
- Request body: `{ course_id: 10, academic_year_id: 2, semester_id: 1, is_primary: false }`
- Response: 200/201 with success message

**Actual Behavior (Before Fix):**
- POST request to: `/admin/professors/3/assign-courses` ❌
- Request body: `{ course_ids: [10] }` ❌
- Response: 404 "endpoint not found" ❌

## Root Cause Confirmation

### Frontend Code (apiService.js line 73-74)
```javascript
assignCourses: (professorId, courseIds) => 
  api.post(`/admin/professors/${professorId}/assign-courses`, { course_ids: courseIds }),
```

**Issues:**
1. Endpoint path: `/assign-courses` (should be `/courses`)
2. Function parameter: `courseIds` (should be `courseAssignment`)
3. Request body: `{ course_ids: courseIds }` (should be courseAssignment object)

### Backend Code (extendedAdminRoutes.js line 145-148)
```javascript
router.post(
  '/professors/:id/courses',
  validateCoursAssignment,
  extendedAdminController.assignCourseToProfessor.bind(extendedAdminController)
);
```

**Expected:**
- Endpoint: `/professors/:id/courses` ✓
- Request body: `{ course_id, academic_year_id, semester_id, is_primary }` ✓

## Counterexamples Found

1. **Endpoint Mismatch**: Frontend sends to `/assign-courses`, backend expects `/courses`
2. **Body Format Mismatch**: Frontend sends `{ course_ids: array }`, backend expects `{ course_id: number, ... }`
3. **Function Signature Mismatch**: Frontend accepts `courseIds` array, should accept `courseAssignment` object

## Conclusion

✅ Bug condition confirmed: The endpoint path and request body format mismatch causes 404 errors
✅ Root cause identified: Inconsistent naming between frontend and backend
✅ Fix required: Update apiService.js to match backend expectations
