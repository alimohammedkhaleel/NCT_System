# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Course Assignment Endpoint Mismatch
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the endpoint path mismatch
  - **Scoped PBT Approach**: Scope the property to concrete failing cases - valid professorId and courseAssignment object
  - Test that `professorsAPI.assignCourses(professorId, courseAssignment)` sends POST request to `/admin/professors/${professorId}/courses` (not `/assign-courses`)
  - Test that request body contains `{ course_id, academic_year_id, semester_id, is_primary }` format (not `{ course_ids: [...] }`)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS with 404 error (this is correct - it proves the bug exists)
  - Document counterexamples found: requests go to wrong endpoint `/assign-courses` with wrong body format
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Other API Endpoints Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for all other API operations
  - Test that `professorsAPI.getAll()` sends GET to `/admin/professors`
  - Test that `professorsAPI.getById(id)` sends GET to `/admin/professors/${id}`
  - Test that `professorsAPI.create(data)` sends POST to `/admin/professors`
  - Test that `professorsAPI.update(id, data)` sends PUT to `/admin/professors/${id}`
  - Test that `professorsAPI.delete(id)` sends DELETE to `/admin/professors/${id}`
  - Test that `professorsAPI.getAssignedCourses(id)` sends GET to `/admin/professors/${id}/courses`
  - Test that other API modules (coursesAPI, gradesAPI, etc.) remain unchanged
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix professor course assignment endpoint mismatch

  - [x] 3.1 Update endpoint path in apiService.js
    - Change POST request path from `/admin/professors/${professorId}/assign-courses` to `/admin/professors/${professorId}/courses`
    - Update line 77 in `client/frontend/src/services/apiService.js`
    - _Bug_Condition: isBugCondition(input) where requestPath = `/admin/professors/${input.professorId}/assign-courses` AND backendRoute = `/admin/professors/:id/courses` AND requestPath != backendRoute_
    - _Expected_Behavior: POST request reaches `/admin/professors/${professorId}/courses` without 404 error_
    - _Preservation: All other professorsAPI methods and other API modules remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.2 Update request body format to match backend expectations
    - Change function signature from `assignCourses: (professorId, courseIds)` to `assignCourses: (professorId, courseAssignment)`
    - Change request body from `{ course_ids: courseIds }` to pass `courseAssignment` object directly
    - Backend expects: `{ course_id, academic_year_id, semester_id, is_primary }`
    - Update line 76-77 in `client/frontend/src/services/apiService.js`
    - _Bug_Condition: Request body format mismatch prevents backend validation_
    - _Expected_Behavior: Request body matches backend schema with required fields_
    - _Preservation: Other API request formats remain unchanged_
    - _Requirements: 2.2, 2.3_

  - [x] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Course Assignment Reaches Backend
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify POST requests go to correct endpoint `/admin/professors/:id/courses`
    - Verify request body has correct format `{ course_id, academic_year_id, semester_id, is_primary }`
    - Verify no 404 errors occur
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Other API Endpoints Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all other professorsAPI methods unchanged
    - Confirm all other API modules (coursesAPI, gradesAPI, etc.) unchanged
    - Confirm request interceptors (auth, logging) still work correctly

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
