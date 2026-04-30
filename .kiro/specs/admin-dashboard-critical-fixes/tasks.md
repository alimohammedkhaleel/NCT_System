# Implementation Plan

- [ ] 1. Write bug condition exploration tests (BEFORE implementing fixes)
  - **Property 1: Bug Condition** - Registration Link Validation, Token Extraction, and Styling Inconsistency
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bugs exist
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility

  - [ ] 1.1 Bug 1 - Registration Link Validation Test
    - Test that StudentRegistration.jsx uses raw axios and creates duplicate `/api` prefix
    - Navigate to `/register/valid-token-123` and observe network request in browser DevTools
    - **EXPECTED OUTCOME**: Request goes to `/api/api/auth/register-link/valid-token-123` (duplicate prefix) and returns 404
    - Document the counterexample: "Registration link validation fails with 404 due to duplicate /api prefix"
    - Verify "رابط غير صالح" message is displayed
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 1.2 Bug 2 - Token Extraction Test
    - Test that RegistrationRequests.jsx accesses incorrect response path `response.data.token`
    - Click "إنشاء رابط تسجيل" button and observe console errors
    - **EXPECTED OUTCOME**: TypeError: Cannot read properties of undefined (reading 'token')
    - Document the counterexample: "Token extraction fails because code accesses response.data.token instead of response.data.data.token"
    - Verify no link is generated or displayed
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 1.3 Bug 3 - Styling Inconsistency Test
    - Test that admin CSS modules use solid white backgrounds instead of glass morphism
    - Inspect RegistrationRequests.module.css, YearManagement.module.css, and other admin CSS files
    - **EXPECTED OUTCOME**: Find `background: white` without `backdrop-filter: blur()`, hardcoded colors instead of CSS variables
    - Document counterexamples: "Admin pages use solid backgrounds, hardcoded colors like #ddd, #8b5cf6, missing glass morphism effects"
    - Take screenshots of current styling for comparison
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 2. Write preservation property tests (BEFORE implementing fixes)
  - **Property 2: Preservation** - Existing Functionality and Non-Admin Styling
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code

  - [ ] 2.1 API Service Preservation Test
    - Observe that other components using `api` instance work correctly on unfixed code
    - Test professor management API calls (GET /admin/professors)
    - Test course management API calls (GET /admin/courses)
    - Test grades API calls (GET /admin/grades)
    - Write property-based test: for all API endpoints NOT in ['/auth/register-link/:token', '/admin/registration-links'], responses are unchanged
    - **EXPECTED OUTCOME**: Tests PASS on unfixed code
    - _Requirements: 7.1, 7.2, 7.7, 7.8, 7.9_

  - [ ] 2.2 Admin Dashboard Functionality Preservation Test
    - Observe that navigation, CRUD operations, modals work correctly on unfixed code
    - Test navigation between admin pages (YearManagement, StudentManagement, ProfessorManagement)
    - Test modal open/close behavior in various admin pages
    - Test form submissions and validations
    - Write property-based test: for all admin functionality NOT related to registration links or styling, behavior is unchanged
    - **EXPECTED OUTCOME**: Tests PASS on unfixed code
    - _Requirements: 7.3, 7.4, 7.5_

  - [ ] 2.3 Non-Admin Styling Preservation Test
    - Observe that student pages, professor pages, navbar, and shared components maintain current styling on unfixed code
    - Inspect computed styles for student dashboard, professor dashboard, authentication pages
    - Verify global styles in index.css are not affected
    - Write property-based test: for all CSS files NOT in admin CSS modules, styles are unchanged
    - **EXPECTED OUTCOME**: Tests PASS on unfixed code
    - _Requirements: 7.6_

- [-] 3. Fix for Registration Link Validation, Token Extraction, and Styling Inconsistency

  - [x] 3.1 Implement Bug 1 Fix - Registration Link Validation
    - Open `client/frontend/src/pages/StudentRegistration/StudentRegistration.jsx`
    - Line 3: Remove `import axios from 'axios';`
    - Line 3: Add `import api from '../../services/apiService';`
    - Line 35: Change `await axios.get(\`/api/auth/register-link/${token}\`)` to `await api.get(\`/auth/register-link/${token}\`)`
    - Line 62: Change `await axios.post(\`/api/auth/register-link/${token}\`, formData)` to `await api.post(\`/auth/register-link/${token}\`, formData)`
    - _Bug_Condition: isBugCondition1(request) where request.url CONTAINS '/api/api/auth/register-link/' AND request.uses_raw_axios == true_
    - _Expected_Behavior: Request goes to '/api/auth/register-link/:token' (single /api prefix) and returns 200 OK with specialties data_
    - _Preservation: All other components using api instance continue working (Requirements 7.7, 7.8, 7.9)_
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 3.2 Implement Bug 2 Fix - Token Extraction
    - Open `client/frontend/src/pages/Admin/RegistrationRequests.jsx`
    - Line 45: Change `const linkData = response.data;` to `const linkData = response.data.data;`
    - Keep existing error logging at line 51 for debugging
    - _Bug_Condition: isBugCondition2(response) where response.data.data.token EXISTS AND code_accesses 'response.data.token' (incorrect path)_
    - _Expected_Behavior: Token is correctly extracted from response.data.data.token and full URL is constructed and displayed_
    - _Preservation: All other API response handling remains unchanged (Requirements 7.1, 7.2, 7.3)_
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 3.3 Implement Bug 3 Fix - Admin Dashboard Styling
    - Update all CSS modules in `client/frontend/src/pages/Admin/` to use glass morphism and purple theme variables
    - Apply glass morphism to white containers: `background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border: 1px solid rgba(179, 110, 255, 0.2);`
    - Replace hardcoded purple colors with CSS variables: `#8b5cf6` → `var(--purple-primary)`, `#7c3aed` → `var(--purple-dark)`, `#a78bfa` → `var(--purple-light)`
    - Replace hardcoded grays with theme-aware values: `#ddd` → `rgba(179, 110, 255, 0.1)`, `#f9f9f9` → `rgba(179, 110, 255, 0.05)`
    - Update table containers with glass card effect: `background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(179, 110, 255, 0.2);`
    - Update modal content with enhanced glass morphism: `background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(20px); border: 1px solid rgba(179, 110, 255, 0.3);`
    - Update primary buttons with purple gradients: `background: linear-gradient(135deg, var(--purple-primary), var(--purple-light));`
    - Files to update: RegistrationRequests.module.css, YearManagement.module.css, StudentManagement.module.css, ProfessorManagement.module.css, CourseManagement.module.css
    - _Bug_Condition: isBugCondition3(cssFile) where cssFile.path CONTAINS '/pages/Admin/' AND (uses_solid_white_backgrounds OR missing_glass_morphism OR uses_hardcoded_colors)_
    - _Expected_Behavior: All admin pages use glass morphism effects, purple theme CSS variables, and maintain visual consistency_
    - _Preservation: Non-admin styling (student pages, professor pages, navbar, shared components) remains unchanged (Requirements 7.6)_
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 3.4 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Registration Link Validation, Token Extraction, and Styling Consistency
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied

    - [ ] 3.4.1 Verify Bug 1 Fix
      - Re-run registration link validation test from task 1.1
      - Navigate to `/register/valid-token-123` and observe network request
      - **EXPECTED OUTCOME**: Request goes to `/api/auth/register-link/valid-token-123` (single /api prefix) and returns 200 OK
      - Verify registration form displays with specialties
      - Submit form and verify POST request goes to correct endpoint
      - _Requirements: 4.1, 4.2, 4.3, 4.4_

    - [ ] 3.4.2 Verify Bug 2 Fix
      - Re-run token extraction test from task 1.2
      - Click "إنشاء رابط تسجيل" button
      - **EXPECTED OUTCOME**: Token is extracted successfully, full URL is generated and displayed in modal
      - Verify no console errors
      - Verify link can be copied to clipboard
      - _Requirements: 5.1, 5.2, 5.3_

    - [ ] 3.4.3 Verify Bug 3 Fix
      - Re-run styling inconsistency test from task 1.3
      - Inspect all admin CSS modules
      - **EXPECTED OUTCOME**: All containers use glass morphism, all colors use CSS variables, visual consistency across all admin pages
      - Compare screenshots with before-fix screenshots
      - Verify no layout breakage or content overflow
      - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Functionality and Non-Admin Styling
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

    - [ ] 3.5.1 Verify API Service Preservation
      - Re-run API service preservation test from task 2.1
      - Test professor management, course management, grades API calls
      - **EXPECTED OUTCOME**: All API calls work identically to before the fix
      - _Requirements: 7.1, 7.2, 7.7, 7.8, 7.9_

    - [ ] 3.5.2 Verify Admin Dashboard Functionality Preservation
      - Re-run admin dashboard functionality preservation test from task 2.2
      - Test navigation, CRUD operations, modals, forms
      - **EXPECTED OUTCOME**: All functionality works identically to before the fix
      - _Requirements: 7.3, 7.4, 7.5_

    - [ ] 3.5.3 Verify Non-Admin Styling Preservation
      - Re-run non-admin styling preservation test from task 2.3
      - Inspect student pages, professor pages, navbar, shared components
      - **EXPECTED OUTCOME**: All non-admin styling remains unchanged
      - _Requirements: 7.6_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Verify all bug condition exploration tests pass (task 3.4)
  - Verify all preservation tests pass (task 3.5)
  - Test full student registration workflow: link validation → form display → form submission
  - Test full admin link creation workflow: button click → link generation → link copy
  - Visually inspect all admin pages for consistent purple glass morphism styling
  - Ensure no console errors or warnings
  - Ask the user if questions arise
