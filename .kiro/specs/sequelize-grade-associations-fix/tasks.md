# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Activity Logging Parameter Mismatch
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Test concrete grade operations that trigger activity logging (submit, approve, reject, submit-for-approval)
  - Test that grade operations calling logActivity with entity_type parameter fail with ValidationError: ActivityLog.entity cannot be null
  - Test implementation details from Bug Condition in design (function parameter named entity_type but model expects entity field)
  - The test assertions should match the Expected Behavior Properties from design (successful ActivityLog creation)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause (e.g., "POST /api/grades succeeds but logActivity throws ValidationError")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Activity-Logging Operations
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for operations that don't call logActivity
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test Grade.findAll with Student association (should work on unfixed code)
  - Test ProfessorCourse.findAll with Course association (should work on unfixed code)
  - Test grade calculation in beforeSave hook (should work on unfixed code)
  - Test grade validation rules for P/M/D values and score ranges (should work on unfixed code)
  - Test professor course access authorization checks (should work on unfixed code)
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Fix for logActivity parameter mismatch

  - [x] 3.1 Implement the fix
    - Open server/controllers/gradeController.js
    - Locate the logActivity helper function at the top of the file
    - Change parameter name from entity_type to entity in function signature
    - Update ActivityLog.create() call to use entity instead of entity_type
    - Verify all call sites already pass correct values (no changes needed to call sites)
    - _Bug_Condition: isBugCondition(input) where input.functionName == 'logActivity' AND input.parameterName == 'entity_type' AND ActivityLog.schema.field('entity').allowNull == false_
    - _Expected_Behavior: ActivityLog.create() succeeds without ValidationError when entity parameter is provided_
    - _Preservation: All non-activity-logging operations (associations, calculations, validations, authorization) remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Activity Logging Success
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify that grade operations (submit, approve, reject, submit-for-approval) now successfully create ActivityLog records
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Activity-Logging Operations
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions in associations, calculations, validations, authorization)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise
  - Verify Grade-Student association queries work correctly
  - Verify ProfessorCourse-Course association queries work correctly
  - Verify activity logging works for all grade operations
  - Verify no regressions in existing functionality
