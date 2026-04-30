# Task 1: Bug Condition Exploration Tests - API Endpoints

## Task Status: ✅ COMPLETE

**Task ID**: Task 1  
**Property**: Bug Condition - API Endpoints Return Errors  
**Requirements Validated**: 2.1, 2.2, 2.3, 2.4, 2.5

## What Was Done

### 1. Testing Framework Setup
- ✅ Installed Vitest testing framework (`vitest`, `@vitest/ui`)
- ✅ Installed fast-check for property-based testing support
- ✅ Created `vitest.config.js` configuration file
- ✅ Added test scripts to `package.json`:
  - `npm test` - Run tests once
  - `npm test:watch` - Run tests in watch mode
  - `npm test:ui` - Run tests with UI

### 2. Bug Condition Exploration Tests Created
- ✅ Created `bug-condition-api-endpoints.test.js` with 9 comprehensive tests
- ✅ Tests check for:
  - StudentsManagement using incorrect `/admin/specialties` endpoint
  - CoursesPage importing axios directly
  - CoursesPage using axios.get in handleSubmit function
  - ProfessorsPage importing axios directly
  - ProfessorsPage using axios for API calls

### 3. Tests Executed on Unfixed Code
- ✅ Ran tests on unfixed codebase
- ✅ **4 tests FAILED** (Expected - confirms bugs exist)
- ✅ **5 tests PASSED** (Expected - no bugs in those areas)

## Counterexamples Found (Bugs Confirmed)

### Bug 1: CoursesPage.jsx - Direct axios import ❌
- **File**: `client/frontend/src/pages/Admin/CoursesPage.jsx`
- **Line**: 3
- **Issue**: `import axios from 'axios';`
- **Expected**: Should only import and use `api` instance from `apiService`
- **Requirement**: 2.4

### Bug 2: CoursesPage.jsx - Direct axios.get usage ❌
- **File**: `client/frontend/src/pages/Admin/CoursesPage.jsx`
- **Lines**: 155, 160
- **Issue**: 
  ```javascript
  const yearsRes = await axios.get(`/admin/academic-years?specialty_id=${formData.specialty_id}`);
  const semsRes = await axios.get(`/admin/semesters?academic_year_id=${matchedYear.id}`);
  ```
- **Expected**: Should use `api.get()` from unified api instance
- **Requirement**: 2.4

### Bug 3: ProfessorsPage.jsx - Direct axios import ❌
- **File**: `client/frontend/src/pages/Admin/ProfessorsPage.jsx`
- **Line**: 3
- **Issue**: `import axios from 'axios';`
- **Expected**: Should only import and use `api` instance from `apiService`
- **Requirement**: 2.5
- **Note**: While the import exists, the file doesn't actually use axios for API calls (uses api instance instead)

## Important Findings

### StudentsManagement.jsx - Already Fixed ✅
The bugfix requirements document mentioned that StudentsManagement calls `/admin/specialties` endpoint which returns 404. However, testing revealed that **this bug has already been fixed**:
- Current code uses: `api.get('/specialties')` (correct)
- No `/admin/specialties` usage found
- Tests for this bug PASSED (no bug exists)

## Test Results Summary

```
Test Files:  1 failed (1)
Tests:       4 failed | 5 passed (9 total)
Duration:    556ms
```

### Failed Tests (Expected - Bugs Confirmed):
1. ❌ CoursesPage: should detect direct axios import
2. ❌ CoursesPage: should detect direct axios.get usage in handleSubmit
3. ❌ CoursesPage: should use api.get consistently for all API calls
4. ❌ ProfessorsPage: should detect direct axios import

### Passed Tests (No Bugs Found):
1. ✅ StudentsManagement: should detect /admin/specialties endpoint usage
2. ✅ StudentsManagement: should use correct /specialties endpoint
3. ✅ ProfessorsPage: should not use axios directly for any API calls
4. ✅ ProfessorsPage: should use api instance consistently
5. ✅ Summary: should document all counterexamples found

## Critical Notes

### ⚠️ DO NOT FIX THE CODE YET
These tests are **bug condition exploration tests**. They are designed to:
1. **FAIL on unfixed code** (confirms bugs exist) ✅ Done
2. **PASS after code is fixed** (confirms bugs are resolved) ⏳ Pending

### Test Behavior
- **Current State**: Tests FAIL (Expected - bugs exist)
- **After Fix**: Same tests will PASS (confirms fix works)
- **DO NOT**: Modify these tests to make them pass
- **DO NOT**: Fix the code during this task

## Files Created

1. `client/frontend/src/pages/Admin/__tests__/bug-condition-api-endpoints.test.js`
   - Main test file with 9 comprehensive tests
   - Uses static code analysis to detect bugs
   - Documents counterexamples when bugs are found

2. `client/frontend/vitest.config.js`
   - Vitest configuration for the project
   - Configured for Node environment
   - Includes test file patterns and coverage settings

3. `client/frontend/src/pages/Admin/__tests__/BUG_CONDITION_TEST_RESULTS.md`
   - Detailed test results documentation
   - Lists all counterexamples found
   - Explains test failures and passes

4. `client/frontend/src/pages/Admin/__tests__/TASK_1_COMPLETION_SUMMARY.md`
   - This file - comprehensive task summary

## Next Steps

According to the task plan:
- ✅ **Task 1**: Write bug condition exploration tests (COMPLETE)
- ⏳ **Task 2**: Write bug condition exploration tests for specialty display
- ⏳ **Task 3**: Write bug condition exploration tests for modal styling
- ⏳ **Phase 2**: Write preservation property tests
- ⏳ **Phase 3**: Implement fixes (tests will transition from FAIL to PASS)

## How to Run Tests

```bash
# Run all tests once
npm test

# Run specific test file
npm test bug-condition-api-endpoints.test.js

# Run tests in watch mode
npm test:watch

# Run tests with UI
npm test:ui

# Run with verbose output
npm test -- --reporter=verbose
```

## Validation

Task 1 is complete when:
- ✅ Tests are written
- ✅ Tests are run on unfixed code
- ✅ Test failures are documented (confirms bugs exist)
- ✅ Counterexamples are captured and documented

**All criteria met. Task 1 is COMPLETE.**
