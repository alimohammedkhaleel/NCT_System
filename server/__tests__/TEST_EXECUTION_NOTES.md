# Bug Condition Exploration Test - Execution Notes

## Test File
`server/__tests__/professor-grades-save-enrollment-bug.test.js`

## Current Status
The test has been written and partially executes, but reveals a deeper issue in the codebase.

## Key Findings

### Issue 1: Model Association Bug
The `getStudentsByCourse` function in `server/controllers/gradeController.js` (line 1720) has a logic bug:

```javascript
const students = await Student.findAll({
  where: {
    specialty_id: course.specialty_id,
    current_year: course.academic_year_id  // BUG: Comparing year (1-4) with ID
  },
```

The `Student.current_year` field is validated to be between 1-4 (see `server/models/Student.js` line 42-46), but it's being compared with `course.academic_year_id`, which is a database ID (much larger number).

This means the `getStudentsByCourse` function is ALSO buggy, not just the `submitGrades` function.

### Issue 2: Test Cannot Run on Unfixed Code
Because `getStudentsByCourse` has this bug, students don't appear in the UI at all when using proper `current_year` values (1-4). This contradicts the bug description which states "students display correctly but cannot save grades".

### Possible Scenarios

**Scenario A**: The production database has students with `current_year` set to `academic_year_id` values (violating the model validation), which makes `getStudentsByCourse` work but is semantically wrong.

**Scenario B**: The `getStudentsByCourse` function should be comparing with `AcademicYear.year_number` instead of `course.academic_year_id`.

## Test Execution Results

### What Works
- Test setup creates all necessary data (specialty, academic year, semester, course, professor, student)
- Authentication works correctly
- The `/api/grades/professor/students-by-course` endpoint returns 200
- The security test (wrong specialty) passes correctly

### What Fails
1. **Student doesn't appear in `getStudentsByCourse` results** - Because of the `current_year` vs `academic_year_id` mismatch
2. **Grade save returns 400 "Student is not enrolled"** - This is the expected bug condition, but we can't verify the full flow because step 1 fails

## Recommendations

### Option 1: Fix Both Bugs
The fix should address BOTH issues:
1. Change `getStudentsByCourse` to compare `current_year` with `AcademicYear.year_number`
2. Change `submitGrades` to use the same logic instead of requiring `StudentEnrollment`

### Option 2: Document Current Behavior
If the production system actually has `current_year` set to `academic_year_id` values, the test should be updated to match that reality, and the model validation should be removed or changed.

## Next Steps

1. **Investigate production data**: Check what values `current_year` actually has in the production database
2. **Clarify requirements**: Confirm whether `current_year` should be 1-4 (year number) or should match `academic_year_id`
3. **Update test accordingly**: Once the intended behavior is clear, update the test to match

## Test File Location
`server/__tests__/professor-grades-save-enrollment-bug.test.js`

## How to Run
```bash
cd server
npm test -- professor-grades-save-enrollment-bug.test.js
```

## Expected Behavior (After Fix)
- All 4 tests should FAIL on unfixed code
- Test 1-3 should show "Student is not enrolled in this course" error (400)
- Test 4 should pass (security validation for wrong specialty)
- After implementing the fix, all 4 tests should PASS
