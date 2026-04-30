# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Grade Save Fails for Students Without StudentEnrollment Records
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to students who match course specialty/year but lack StudentEnrollment records
  - Test that submitGrades fails with "student is not enrolled in this course" for students where:
    - student.specialty_id matches course.specialty_id
    - student.current_year matches course.academic_year_id
    - StudentEnrollment record does NOT exist
    - Student appears in getStudentsByCourse response
  - The test assertions should verify that after the fix, grades save successfully for these students
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS with 400 error "student is not enrolled in this course" (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.3, 1.5, 2.1, 2.3, 2.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Enrollment Validation Continues to Work
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for students WITH StudentEnrollment records
  - Write property-based tests capturing observed behavior patterns:
    - Students with StudentEnrollment records can save grades successfully
    - Professor authorization checks still prevent unauthorized grade saves
    - Grade field validation (P/M/D values, final_exam_score ranges) still works
    - Students from wrong specialty/year are still rejected
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Fix for grade save enrollment validation mismatch

  - [x] 3.1 Implement the fix in submitGrades function
    - Replace StudentEnrollment validation logic (lines 119-131 in server/controllers/gradeController.js)
    - Fetch Student record with Specialty include using Student.findByPk
    - Fetch Course record with Specialty and AcademicYear includes using Course.findByPk
    - Validate student.specialty_id matches course.specialty_id
    - Validate student.current_year matches course.academic_year_id
    - Update error messages to distinguish between "student not found", "specialty mismatch", and "year mismatch"
    - Optionally auto-create StudentEnrollment record when grades are saved for consistency
    - Preserve all existing professor authorization checks
    - Preserve all existing grade field validation logic
    - _Bug_Condition: isBugCondition(input) where student.specialty_id == course.specialty_id AND student.current_year == course.academic_year_id AND StudentEnrollment record == NULL_
    - _Expected_Behavior: Grades save successfully for all students matching specialty/year, regardless of StudentEnrollment records_
    - _Preservation: Students with existing StudentEnrollment records continue to save grades successfully; professor authorization and grade validation remain unchanged_
    - _Requirements: 1.1, 1.3, 1.5, 2.1, 2.3, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Grade Save Succeeds for Students Matching Specialty/Year
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify grades save successfully for students without StudentEnrollment records
    - Verify StudentEnrollment records are auto-created (if implemented)
    - _Requirements: 2.1, 2.3, 2.5_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Enrollment Validation Continues to Work
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm students with StudentEnrollment records still save grades successfully
    - Confirm professor authorization checks still work
    - Confirm grade field validation still works
    - Confirm students from wrong specialty/year are still rejected

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise
  - Verify bug condition exploration test passes (grades save for students without StudentEnrollment)
  - Verify preservation tests pass (existing enrollment validation still works)
  - Verify no regressions in professor authorization or grade validation
