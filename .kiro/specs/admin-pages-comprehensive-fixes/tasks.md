# Implementation Plan

## Phase 1: Bug Condition Exploration Tests

- [x] 1. Write bug condition exploration tests for API endpoints
  - **Property 1: Bug Condition** - API Endpoints Return Errors
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fix when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bugs exist
  - Test that StudentsManagement calls `/admin/specialties` endpoint (should return 404 on unfixed code)
  - Test that CoursesPage uses axios directly in handleSubmit function (should find axios usage on unfixed code)
  - Test that ProfessorsPage uses axios directly for API calls (should find axios usage on unfixed code)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found:
    - `/admin/specialties` returns 404 error
    - Direct axios usage found in CoursesPage.jsx line 155 and 160
    - Direct axios usage found in ProfessorsPage.jsx
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. Write bug condition exploration tests for specialty display
  - **Property 1: Bug Condition** - Specialty Names Show English Instead of Arabic
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fix when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate incorrect field usage
  - Test that StudentsManagement filter dropdown displays `name` field instead of `arabic_name` (should show English on unfixed code)
  - Test that CoursesPage modal dropdown displays `name` field instead of `arabic_name` (should show English on unfixed code)
  - Test that ProfessorsPage modal dropdown displays `name` field instead of `arabic_name` (should show English on unfixed code)
  - Test that table columns display `name` field instead of `arabic_name` (should show English on unfixed code)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found:
    - Filter dropdown shows "Mechatronics Technology" instead of "تكنولوجيا الميكاترونكس"
    - Modal dropdown shows "Information Technology" instead of "تكنولوجيا المعلومات"
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 2.6, 2.7_

- [x] 3. Write bug condition exploration tests for modal styling
  - **Property 1: Bug Condition** - Modals Use Light Colors Instead of Dark Theme
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fix when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate styling inconsistencies
  - Test that CoursesPage notifications use inline styles with light colors (#ffebee, #e8f5e9) (should find inline styles on unfixed code)
  - Test that ProfessorsPage notifications use inline styles with light colors (should find inline styles on unfixed code)
  - Test that ProfessorsPage course modal uses inline styles instead of CSS modules (should find inline styles on unfixed code)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found:
    - Notifications use backgroundColor: '#ffebee' and '#e8f5e9'
    - Course modal filter section uses inline styles with light backgrounds
    - Course cards use inline styles instead of CSS module classes
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 2.8, 2.9, 2.10, 2.11_

## Phase 2: Preservation Property Tests

- [x] 4. Write preservation property tests for CRUD operations (BEFORE implementing fix)
  - **Property 2: Preservation** - CRUD Operations Continue to Work
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for student create/edit/delete operations
  - Observe behavior on UNFIXED code for course create/edit/delete operations
  - Observe behavior on UNFIXED code for professor create/edit/delete operations
  - Observe behavior on UNFIXED code for course assignment to professors
  - Observe behavior on UNFIXED code for student promotion operations
  - Write property-based tests capturing observed behavior patterns
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Write preservation property tests for filtering and search (BEFORE implementing fix)
  - **Property 2: Preservation** - Filtering and Search Accuracy Maintained
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for filtering students by specialty, year, status
  - Observe behavior on UNFIXED code for searching students by code, national_id, name
  - Observe behavior on UNFIXED code for course filtering and search
  - Write property-based tests capturing observed filtering and search behavior
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.6, 3.7_

- [x] 6. Write preservation property tests for UI/UX behavior (BEFORE implementing fix)
  - **Property 2: Preservation** - UI/UX Behavior Remains Consistent
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for modal open/close functionality
  - Observe behavior on UNFIXED code for form submission and validation
  - Observe behavior on UNFIXED code for table rendering and RTL support
  - Observe behavior on UNFIXED code for navigation between admin pages
  - Write property-based tests capturing observed UI/UX behavior
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.8, 3.9, 3.10, 3.11, 3.12_

## Phase 3: Implementation

- [x] 7. Fix API endpoints and specialty display in StudentsManagement.jsx

  - [x] 7.1 Fix API endpoint for fetching specialties
    - Change `/admin/specialties` to `/specialties` in fetchSpecialties function (line 67)
    - Test that the endpoint returns data successfully
    - _Bug_Condition: isBugCondition(input) where input.page === 'StudentsManagement' AND input.action === 'fetchSpecialties' AND endpoint === '/admin/specialties'_
    - _Expected_Behavior: API call to `/specialties` returns specialty data without 404 error_
    - _Preservation: All other API calls and data fetching operations remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 7.2 Fix specialty display in filter dropdown
    - Update specialty dropdown to display `arabic_name` instead of `name` (lines 227-232)
    - Change `{sp.specialty_name || sp.name}` to `{sp.arabic_name || sp.name}`
    - _Bug_Condition: isBugCondition(input) where input.action === 'displaySpecialty' AND input.element === 'dropdown' AND displayField === 'name'_
    - _Expected_Behavior: Dropdown shows Arabic specialty names to users_
    - _Preservation: Dropdown functionality and filtering logic remain unchanged_
    - _Requirements: 2.6, 2.7_

  - [x] 7.3 Fix specialty display in getSpecialtyName function
    - Update getSpecialtyName function to prioritize `arabic_name` over `name` (lines 189-193)
    - Ensure table column displays Arabic names
    - _Bug_Condition: isBugCondition(input) where input.action === 'displaySpecialty' AND input.element === 'table' AND displayField === 'name'_
    - _Expected_Behavior: Table column shows Arabic specialty names_
    - _Preservation: Table rendering and data display logic remain unchanged_
    - _Requirements: 2.6, 2.7_

  - [x] 7.4 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - API Endpoints and Specialty Display Fixed
    - **IMPORTANT**: Re-run the SAME tests from tasks 1 and 2 - do NOT write new tests
    - The tests from tasks 1 and 2 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    - Run bug condition exploration tests from steps 1 and 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7_

  - [x] 7.5 Verify preservation tests still pass
    - **Property 2: Preservation** - StudentsManagement Functionality Preserved
    - **IMPORTANT**: Re-run the SAME tests from tasks 4, 5, and 6 - do NOT write new tests
    - Run preservation property tests from steps 4, 5, and 6
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 8. Fix API usage and specialty display in CoursesPage.jsx

  - [x] 8.1 Remove direct axios import and fix API calls
    - Remove `import axios from 'axios';` from line 3
    - Replace `axios.get` with `api.get` in handleSubmit function (lines 155-162)
    - Update both yearsRes and semsRes API calls
    - _Bug_Condition: isBugCondition(input) where input.page === 'CoursesPage' AND input.action === 'apiCall' AND usesAxiosDirectly === true_
    - _Expected_Behavior: All API calls use unified `api` instance_
    - _Preservation: API call functionality and data handling remain unchanged_
    - _Requirements: 2.4_

  - [x] 8.2 Verify specialty display is correct
    - Confirm that specialty dropdown already uses `arabic_name || name` (line 195)
    - Confirm that table column already uses `arabic_name || name` (lines 237-242)
    - No changes needed if already correct
    - _Requirements: 2.6, 2.7_

  - [x] 8.3 Create CSS module classes for notifications
    - Add notification classes to CoursesPage.module.css
    - Create `.notification`, `.notificationError`, `.notificationSuccess`, `.notificationCloseBtn` classes
    - Use dark theme colors: rgba(239, 68, 68, 0.15) for error, rgba(16, 185, 129, 0.15) for success
    - Add backdrop-filter blur effects
    - _Bug_Condition: isBugCondition(input) where input.element === 'notification' AND hasInlineStyles === true_
    - _Expected_Behavior: Notifications use dark glass theme styling from CSS modules_
    - _Preservation: Notification functionality and display logic remain unchanged_
    - _Requirements: 2.8, 2.9_

  - [x] 8.4 Replace inline notification styles with CSS modules
    - Update notification rendering in CoursesPage.jsx (lines 113-128)
    - Replace inline styles with CSS module classes
    - Apply `.notification`, `.notificationError`, or `.notificationSuccess` based on type
    - _Requirements: 2.8, 2.9_

  - [x] 8.5 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - API Usage and Notification Styling Fixed
    - **IMPORTANT**: Re-run the SAME tests from tasks 1 and 3 - do NOT write new tests
    - Run bug condition exploration tests for API usage and notification styling
    - **EXPECTED OUTCOME**: Tests PASS (confirms bugs are fixed)
    - _Requirements: 2.4, 2.8, 2.9_

  - [x] 8.6 Verify preservation tests still pass
    - **Property 2: Preservation** - CoursesPage Functionality Preserved
    - **IMPORTANT**: Re-run the SAME tests from tasks 4, 5, and 6 - do NOT write new tests
    - Run preservation property tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

- [x] 9. Fix API usage and modal styling in ProfessorsPage.jsx

  - [x] 9.1 Remove direct axios import
    - Remove `import axios from 'axios';` from line 3
    - Replace any `axios` calls with `api` instance
    - _Bug_Condition: isBugCondition(input) where input.page === 'ProfessorsPage' AND input.action === 'apiCall' AND usesAxiosDirectly === true_
    - _Expected_Behavior: All API calls use unified `api` instance_
    - _Preservation: API call functionality remains unchanged_
    - _Requirements: 2.5_

  - [x] 9.2 Verify specialty display is correct
    - Confirm that specialty dropdown already uses `arabic_name || name` (lines 289-295)
    - No changes needed if already correct
    - _Requirements: 2.6, 2.7_

  - [x] 9.3 Create CSS module classes for course modal
    - Add course modal classes to CoursesPage.module.css (will be shared)
    - Create `.filterSection`, `.filterLabel`, `.filterInfo` classes
    - Create `.courseGrid`, `.courseCard`, `.courseCardSelected` classes
    - Create `.courseCheckbox`, `.courseInfo`, `.courseCode`, `.courseName`, `.courseDetails` classes
    - Create `.emptyState`, `.emptyStateSubtext` classes
    - Use dark theme colors with purple accents
    - _Bug_Condition: isBugCondition(input) where input.element === 'modal' AND hasInlineStyles === true_
    - _Expected_Behavior: Modal uses dark glass theme styling from CSS modules_
    - _Preservation: Modal functionality remains unchanged_
    - _Requirements: 2.10, 2.11_

  - [x] 9.4 Replace inline notification styles with CSS modules
    - Update notification rendering in ProfessorsPage.jsx (lines 177-195)
    - Replace inline styles with CSS module classes from CoursesPage.module.css
    - Import and apply notification classes
    - _Requirements: 2.8, 2.9_

  - [x] 9.5 Replace inline course modal styles with CSS modules
    - Update filter section styling (lines 365-380)
    - Replace inline styles with `.filterSection`, `.filterLabel`, `.filterInfo` classes
    - Update course selection cards styling (lines 382-420)
    - Replace inline styles with `.courseGrid`, `.courseCard`, `.courseCardSelected` classes
    - Apply course info classes: `.courseCode`, `.courseName`, `.courseDetails`
    - _Requirements: 2.10, 2.11_

  - [x] 9.6 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - API Usage and Modal Styling Fixed
    - **IMPORTANT**: Re-run the SAME tests from tasks 1 and 3 - do NOT write new tests
    - Run bug condition exploration tests for API usage and modal styling
    - **EXPECTED OUTCOME**: Tests PASS (confirms bugs are fixed)
    - _Requirements: 2.5, 2.8, 2.9, 2.10, 2.11_

  - [x] 9.7 Verify preservation tests still pass
    - **Property 2: Preservation** - ProfessorsPage Functionality Preserved
    - **IMPORTANT**: Re-run the SAME tests from tasks 4, 5, and 6 - do NOT write new tests
    - Run preservation property tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

## Phase 4: Final Validation

- [x] 10. Checkpoint - Ensure all tests pass
  - Run all bug condition exploration tests - all should PASS
  - Run all preservation property tests - all should PASS
  - Verify no console errors when loading admin pages
  - Verify specialties load correctly in all pages
  - Verify Arabic names display in all dropdowns and tables
  - Verify all modals and notifications use dark glass theme
  - Verify all CRUD operations work correctly
  - Verify filtering and search functionality works correctly
  - Ask the user if questions arise
