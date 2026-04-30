# Implementation Plan

## Overview

This task list implements fixes for four critical bugs in the Student Dashboard:
1. **Timetable API 403 Error** - Students cannot access their timetables due to authorization middleware blocking the endpoint
2. **Avatar Image Loading Failure** - Avatar images fail to load due to incorrect URL format and CORS issues
3. **Timetable Display Format** - Timetable display inconsistent with Admin Dashboard format
4. **Payment Records Display** - Payment records show incorrect labels, year format, and missing status column

The implementation follows the bug condition methodology: explore bugs first, write preservation tests, then implement fixes with verification.

---

## Tasks

- [x] 1. Write bug condition exploration tests (BEFORE implementing fixes)
  - **Property 1: Bug Condition** - Student Dashboard Four Critical Bugs
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate all four bugs exist
  - **Test File**: `client/frontend/src/pages/StudentDashboard/__tests__/student-dashboard-bugs.test.js`
  
  - [x] 1.1 Test Bug 1: Timetable API 403 Error
    - Mock authenticated student user with role='student'
    - Simulate GET request to `/api/admin/timetables/student`
    - Assert response status is 403 (Forbidden)
    - Assert error message contains "Insufficient permissions" or similar
    - Document: This confirms the admin middleware blocks student access
    - _Bug_Condition: isBugCondition({ bugType: 'timetable_403', context: { userRole: 'student', endpoint: '/api/admin/timetables/student', parentRouterHasAdminAuth: true } })_
    - _Expected_Behavior: Response status should be 200 OK with timetable data_
  
  - [x] 1.2 Test Bug 2: Avatar Image Loading Failure
    - Create test user with `profile_image` = `uploads/avatars/test.jpg` (no leading `/`)
    - Attempt to construct frontend URL: `http://localhost:5000${profile_image}`
    - Assert constructed URL is malformed (missing `/` after domain)
    - Test CORS headers on `/uploads` static route
    - Assert CORS headers may be missing or restrictive
    - Document: This confirms avatar URL format issue and potential CORS problems
    - _Bug_Condition: isBugCondition({ bugType: 'avatar_loading', context: { profileImageField: 'uploads/avatars/test.jpg', corsError: true } })_
    - _Expected_Behavior: profile_image should start with `/`, CORS headers should allow cross-origin requests_
  
  - [x] 1.3 Test Bug 3: Timetable Display Format
    - Render Student Dashboard timetable component (mock data)
    - Render Admin Dashboard timetable component (same mock data)
    - Compare DOM structure, CSS classes, and layout
    - Assert differences exist in card layout, filters, or styling
    - Document specific differences found
    - _Bug_Condition: isBugCondition({ bugType: 'timetable_display', context: { timetableView: 'student', formatDiffersFromAdmin: true } })_
    - _Expected_Behavior: Student and Admin timetable displays should use identical format_
  
  - [x] 1.4 Test Bug 4: Payment Records Display
    - Render Student Dashboard payments tab component
    - Assert academic year column shows format like "2024-2025" instead of "السنة الأولى"
    - Count table header columns
    - Assert payment status column ("حالة الدفع") is missing
    - Verify tab title (check if "فواتيري" or "سجل المدفوعات")
    - Document: This confirms payment display issues
    - _Bug_Condition: isBugCondition({ bugType: 'payment_display', context: { yearDisplayFormat: 'academic_year', statusColumnMissing: true } })_
    - _Expected_Behavior: Should show student year label, include status column with ✅/❌_
  
  - [x] 1.5 Run exploration tests on UNFIXED code
    - Run: `npm test -- student-dashboard-bugs.test.js`
    - **EXPECTED OUTCOME**: All tests FAIL (this is correct - it proves the bugs exist)
    - Document counterexamples found for each bug
    - Mark task complete when tests are written, run, and failures are documented
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14_

- [ ] 2. Write preservation property tests (BEFORE implementing fixes)
  - **Property 2: Preservation** - Non-Affected Student Dashboard Features
  - **IMPORTANT**: Follow observation-first methodology
  - **Test File**: `client/frontend/src/pages/StudentDashboard/__tests__/student-dashboard-preservation.test.js`
  
  - [x] 2.1 Observe and test Grades tab preservation
    - Observe behavior on UNFIXED code: grades display, payment-required logic, semester cards
    - Write property-based test: for all grade data scenarios (empty, partial, complete), grades tab renders correctly
    - Test GPA calculations and classification badges
    - Verify test PASSES on UNFIXED code
    - _Preservation: Grades tab functionality must remain unchanged_
  
  - [x] 2.2 Observe and test Invoices tab preservation
    - Observe behavior on UNFIXED code: invoice cards, table display, status rendering
    - Write property-based test: for all invoice data scenarios, invoices tab renders correctly
    - Test date formatting and amount calculations
    - Verify test PASSES on UNFIXED code
    - _Preservation: Invoices tab functionality must remain unchanged_
  
  - [ ] 2.3 Observe and test QR Code tab preservation
    - Observe behavior on UNFIXED code: QR code generation, display, download
    - Write property-based test: QR code tab generates and displays QR codes correctly
    - Verify test PASSES on UNFIXED code
    - _Preservation: QR Code tab functionality must remain unchanged_
  
  - [ ] 2.4 Observe and test Profile card preservation
    - Observe behavior on UNFIXED code: profile info display (name, code, email, specialty, year, status, branch, GPA)
    - Write property-based test: profile card displays all information correctly
    - Test branch badge display for ICT students
    - Verify test PASSES on UNFIXED code
    - _Preservation: Profile card display must remain unchanged_
  
  - [ ] 2.5 Observe and test Avatar upload/delete preservation
    - Observe behavior on UNFIXED code: avatar upload flow, delete flow
    - Write test: avatar upload replaces old image, delete shows first letter fallback
    - Verify test PASSES on UNFIXED code
    - _Preservation: Avatar upload/delete functionality must remain unchanged (only loading/display is being fixed)_
  
  - [ ] 2.6 Run preservation tests on UNFIXED code
    - Run: `npm test -- student-dashboard-preservation.test.js`
    - **EXPECTED OUTCOME**: All tests PASS (this confirms baseline behavior to preserve)
    - Mark task complete when tests are written, run, and passing on unfixed code
    - _Requirements: 3.1, 3.4, 3.5_

- [ ] 3. Fix Bug 1: Timetable API 403 Error
  
  - [ ] 3.1 Create student-specific timetable route
    - **File**: `server/routes/timetableRoutes.js`
    - Add new route for student timetable access at `/timetables/student`
    - Use `authenticateToken` and `authorizeRoles('student')` middleware
    - Keep existing logic that filters timetables by student's specialty
    - Ensure route returns 200 OK with timetable data array
    - _Bug_Condition: isBugCondition({ bugType: 'timetable_403', userRole: 'student', endpoint: '/api/admin/timetables/student' })_
    - _Expected_Behavior: Student users can access their timetables without 403 error_
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 3.2 Mount student timetable routes separately in server.js
    - **File**: `server/server.js`
    - Add new route mount: `app.use('/api/student', timetableRoutes);`
    - Place this BEFORE the admin routes mount to ensure student endpoints are registered first
    - This allows `/api/student/timetables/student` to bypass admin authorization
    - Keep existing admin timetable routes unchanged
    - _Preservation: Admin timetable management must continue to work_
    - _Requirements: 2.1, 3.2, 3.3_
  
  - [ ] 3.3 Update frontend API call in StudentDashboard.jsx
    - **File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx`
    - Find the timetable fetch logic (around line 691-768)
    - Change API endpoint from `/admin/timetables/student` to `/student/timetables/student`
    - Keep all other logic unchanged (error handling, loading states, data processing)
    - _Expected_Behavior: Frontend calls correct student-accessible endpoint_
    - _Requirements: 2.1, 2.2_
  
  - [ ] 3.4 Verify Bug 1 exploration test now passes
    - **Property 1: Expected Behavior** - Timetable API Access Works
    - **IMPORTANT**: Re-run the SAME test from task 1.1 - do NOT write a new test
    - Run: `npm test -- student-dashboard-bugs.test.js -t "Bug 1"`
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Update test assertions to verify 200 OK response with timetable data
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 4. Fix Bug 2: Avatar Image Loading Failure
  
  - [ ] 4.1 Fix avatar URL storage in upload handler
    - **File**: `server/routes/authRoutes.js`
    - Find the avatar upload handler (POST `/api/auth/upload-avatar`)
    - Change from: `await user.update({ profile_image: req.file.path });`
    - Change to: `const avatarUrl = \`/uploads/avatars/\${req.file.filename}\`; await user.update({ profile_image: avatarUrl });`
    - Ensure `profile_image` field stores URL path with leading `/` (e.g., `/uploads/avatars/avatar_6_1776823812348.jpg`)
    - Keep response format unchanged
    - _Bug_Condition: profile_image stored without leading `/` causes malformed URLs_
    - _Expected_Behavior: profile_image always stores correctly formatted URL path_
    - _Requirements: 2.4, 2.7_
  
  - [ ] 4.2 Add CORS headers for static file serving
    - **File**: `server/server.js`
    - Find the static file serving middleware: `app.use('/uploads', express.static('uploads'));`
    - Replace with:
      ```javascript
      app.use('/uploads', (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Cross-Origin-Resource-Policy', 'cross-origin');
        next();
      }, express.static('uploads'));
      ```
    - This ensures avatar images can be loaded cross-origin
    - _Expected_Behavior: Avatar images load without CORS errors_
    - _Requirements: 2.5_
  
  - [ ] 4.3 Add image error handling in StudentDashboard.jsx
    - **File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx`
    - Find the avatar image rendering (around line 200-210)
    - Add `onError` handler to `<img>` tag:
      ```jsx
      <img 
        src={`http://localhost:5000${avatarUrl}`} 
        alt="صورة الطالب" 
        className="avatar-img"
        onError={(e) => {
          e.target.style.display = 'none';
          const fallback = document.createElement('div');
          fallback.className = 'sp-avatar';
          fallback.textContent = info.full_name ? info.full_name.charAt(0) : '؟';
          e.target.parentElement.appendChild(fallback);
        }}
      />
      ```
    - This provides graceful fallback when image fails to load
    - _Expected_Behavior: Failed image loads show first letter fallback_
    - _Requirements: 2.6_
  
  - [ ] 4.4 Create database migration script for existing avatar URLs
    - **File**: `server/migrations/fix-avatar-urls.js`
    - Create script to update existing `profile_image` values
    - Find all users where `profile_image` does NOT start with `/`
    - Prepend `/` to those values: `UPDATE users SET profile_image = CONCAT('/', profile_image) WHERE profile_image NOT LIKE '/%'`
    - Run migration: `node server/migrations/fix-avatar-urls.js`
    - _Expected_Behavior: All existing avatar URLs are correctly formatted_
    - _Requirements: 2.4_
  
  - [ ] 4.5 Verify Bug 2 exploration test now passes
    - **Property 1: Expected Behavior** - Avatar Images Load Successfully
    - **IMPORTANT**: Re-run the SAME test from task 1.2 - do NOT write a new test
    - Run: `npm test -- student-dashboard-bugs.test.js -t "Bug 2"`
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify avatar URLs are correctly formatted and images load without CORS errors
    - _Requirements: 2.4, 2.5, 2.6, 2.7_

- [ ] 5. Fix Bug 3: Timetable Display Format
  
  - [ ] 5.1 Investigate Admin Dashboard timetable display
    - **File**: Find Admin Dashboard timetable component (likely in `client/frontend/src/pages/Admin/`)
    - Document the exact structure: card layout, CSS classes, filters, PDF viewing
    - Identify specific differences from Student Dashboard timetable display
    - Create comparison notes for standardization
    - _Goal: Understand target format to replicate in Student Dashboard_
    - _Requirements: 2.8_
  
  - [ ] 5.2 Standardize Student Dashboard timetable card layout
    - **File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx`
    - Update timetable rendering section (lines 691-768)
    - Match card structure to Admin Dashboard format
    - Use same CSS classes or create shared component
    - Ensure consistent spacing, typography, and visual hierarchy
    - _Expected_Behavior: Timetable cards look identical to Admin Dashboard_
    - _Requirements: 2.8, 2.9_
  
  - [ ] 5.3 Add filtering options if present in Admin Dashboard
    - **File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx`
    - If Admin Dashboard has filters (academic year, specialty), add them to Student Dashboard
    - Implement filter state management and filtering logic
    - Ensure filters work correctly with student's timetable data
    - _Expected_Behavior: Student Dashboard has same filtering capabilities_
    - _Requirements: 2.9_
  
  - [ ] 5.4 Ensure consistent PDF viewing behavior
    - **File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx`
    - Verify "عرض الجدول" button opens PDF the same way as Admin Dashboard
    - Test PDF URL construction and window.open behavior
    - Ensure consistent error handling for missing PDFs
    - _Expected_Behavior: PDF viewing works identically across dashboards_
    - _Requirements: 2.10_
  
  - [ ] 5.5 Update StudentDashboard CSS for consistency
    - **File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.css`
    - Add or update CSS classes to match Admin Dashboard styling
    - Ensure responsive behavior matches Admin Dashboard
    - Test on different screen sizes
    - _Expected_Behavior: Timetable styling is consistent with Admin Dashboard_
    - _Requirements: 2.8_
  
  - [ ] 5.6 Verify Bug 3 exploration test now passes
    - **Property 1: Expected Behavior** - Timetable Display Format Matches Admin
    - **IMPORTANT**: Re-run the SAME test from task 1.3 - do NOT write a new test
    - Run: `npm test -- student-dashboard-bugs.test.js -t "Bug 3"`
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify Student and Admin timetable displays are now identical
    - _Requirements: 2.8, 2.9, 2.10_

- [ ] 6. Fix Bug 4: Payment Records Display
  
  - [ ] 6.1 Verify and fix tab title if needed
    - **File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx`
    - Check tab button text around line 545
    - Current code shows "سجل المدفوعات" which is correct
    - If requirements document is outdated, verify with user
    - No change needed if already correct
    - _Expected_Behavior: Tab title shows "سجل المدفوعات"_
    - _Requirements: 2.11_
  
  - [ ] 6.2 Add student year mapping helper function
    - **File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx`
    - Add helper function before component:
      ```javascript
      const getStudentYearLabel = (academicYear, studentCurrentYear) => {
        const yearLabels = {
          1: 'السنة الأولى',
          2: 'السنة الثانية',
          3: 'السنة الثالثة',
          4: 'السنة الرابعة'
        };
        return yearLabels[studentCurrentYear] || academicYear;
      };
      ```
    - This maps student's current year number to Arabic year label
    - _Expected_Behavior: Function returns correct Arabic year label_
    - _Requirements: 2.12_
  
  - [ ] 6.3 Update payment records table to show student year
    - **File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx`
    - Find payment records table rendering (around line 625-638)
    - Change from: `<td>{payment.academic_year || '—'}</td>`
    - Change to: `<td>{getStudentYearLabel(payment.academic_year, info.current_year)}</td>`
    - This displays "السنة الأولى" instead of "2024-2025"
    - _Expected_Behavior: Payment records show student year label_
    - _Requirements: 2.12_
  
  - [ ] 6.4 Add payment status column to table headers
    - **File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx`
    - Find table headers section (lines 617-624)
    - Add new header after "تاريخ الدفع": `<th>حالة الدفع</th>`
    - Ensure proper alignment with other columns
    - _Expected_Behavior: Table has payment status header_
    - _Requirements: 2.13_
  
  - [ ] 6.5 Add payment status cell to table body
    - **File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx`
    - Find payment records table body (around line 625-638)
    - Add new cell after date column:
      ```jsx
      <td>
        <span className={`sp-payment-status ${payment.status === 'paid' ? 'paid' : 'unpaid'}`}>
          {payment.status === 'paid' ? '✅ تم الدفع' : '❌ لم يتم الدفع'}
        </span>
      </td>
      ```
    - This shows visual status indicator
    - _Expected_Behavior: Each payment row shows status with ✅ or ❌_
    - _Requirements: 2.13_
  
  - [ ] 6.6 Add CSS styling for payment status
    - **File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.css`
    - Add styles:
      ```css
      .sp-payment-status {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
      }
      
      .sp-payment-status.paid {
        background-color: rgba(110, 231, 183, 0.1);
        color: #6ee7b7;
      }
      
      .sp-payment-status.unpaid {
        background-color: rgba(252, 165, 165, 0.1);
        color: #fca5a5;
      }
      ```
    - _Expected_Behavior: Payment status has proper styling_
    - _Requirements: 2.13_
  
  - [ ] 6.7 Filter accountant-specific information if present
    - **File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx`
    - Review payment data structure returned from API
    - Ensure only student-relevant fields are displayed
    - Remove any accountant-specific columns or data
    - _Expected_Behavior: Only student-appropriate information is shown_
    - _Requirements: 2.14_
  
  - [ ] 6.8 Verify Bug 4 exploration test now passes
    - **Property 1: Expected Behavior** - Payment Records Display Correctly
    - **IMPORTANT**: Re-run the SAME test from task 1.4 - do NOT write a new test
    - Run: `npm test -- student-dashboard-bugs.test.js -t "Bug 4"`
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify payment records show correct year format and status column
    - _Requirements: 2.11, 2.12, 2.13, 2.14_

- [ ] 7. Verify all preservation tests still pass
  - **Property 2: Preservation** - Non-Affected Features Unchanged
  - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
  - Run: `npm test -- student-dashboard-preservation.test.js`
  - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions)
  - Verify Grades, Invoices, QR Code, Profile, and Avatar upload/delete still work
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [ ] 8. Integration testing
  
  - [ ] 8.1 Test full student timetable flow
    - Login as student user
    - Navigate to "جدولي الدراسي" tab
    - Verify timetable loads without 403 error
    - Verify timetable displays in correct format
    - Test "عرض الجدول" button opens PDF
    - _Expected_Behavior: Complete timetable flow works end-to-end_
    - _Requirements: 2.1, 2.2, 2.3, 2.8, 2.9, 2.10_
  
  - [ ] 8.2 Test full avatar flow
    - Login as student user
    - Upload new avatar image
    - Verify image displays correctly without CORS errors
    - Refresh page and verify image persists
    - Test image error handling by breaking URL
    - Verify fallback (first letter) appears
    - _Expected_Behavior: Complete avatar flow works end-to-end_
    - _Requirements: 2.4, 2.5, 2.6, 2.7_
  
  - [ ] 8.3 Test full payment records flow
    - Login as student user
    - Navigate to "سجل المدفوعات" tab
    - Verify tab title is correct
    - Verify year column shows student year labels
    - Verify status column shows ✅/❌ indicators
    - Test with different student years (1-4)
    - _Expected_Behavior: Complete payment records flow works end-to-end_
    - _Requirements: 2.11, 2.12, 2.13, 2.14_
  
  - [ ] 8.4 Test admin timetable management still works
    - Login as admin user
    - Navigate to Admin Dashboard timetable management
    - Verify admin can view all timetables
    - Test creating new timetable
    - Test editing existing timetable
    - Test deleting timetable
    - Verify `/api/admin/timetables` endpoint still works for admin
    - _Expected_Behavior: Admin timetable management unchanged_
    - _Requirements: 3.2, 3.3_
  
  - [ ] 8.5 Test other user roles (Professor, Accountant)
    - Login as professor user
    - Verify professor dashboard works normally
    - Login as accountant user
    - Verify accountant payment management works normally
    - _Expected_Behavior: Other user roles unaffected_
    - _Requirements: 3.6, 3.7_
  
  - [ ] 8.6 Test tab switching and state preservation
    - Login as student user
    - Switch between all tabs (Profile, Grades, Timetable, Invoices, Payments, QR Code)
    - Verify each tab loads correctly
    - Verify no state leakage between tabs
    - Verify loading spinners and error messages work correctly
    - _Expected_Behavior: Tab switching works smoothly_
    - _Requirements: 3.1_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Run full test suite: `npm test`
  - Verify all bug condition tests pass (confirms bugs are fixed)
  - Verify all preservation tests pass (confirms no regressions)
  - Verify all integration tests pass
  - Review test coverage for all four bug fixes
  - If any tests fail, investigate and fix before proceeding
  - Ask the user if questions arise

---

## Notes

### Bug Condition Methodology

This implementation follows the bug condition methodology:
- **C(X)**: Bug Condition - identifies inputs that trigger each bug
- **P(result)**: Property - desired behavior for buggy inputs
- **¬C(X)**: Non-buggy inputs that should be preserved
- **F**: Original (unfixed) function
- **F'**: Fixed function

### Test Execution Order

1. **Exploration Tests (Task 1)**: Run BEFORE fixes, expect FAILURES
2. **Preservation Tests (Task 2)**: Run BEFORE fixes, expect PASSES
3. **Implementation (Tasks 3-6)**: Apply fixes
4. **Verification**: Re-run exploration tests, expect PASSES
5. **Preservation Check (Task 7)**: Re-run preservation tests, expect PASSES
6. **Integration Tests (Task 8)**: End-to-end validation

### Key Files Modified

**Backend:**
- `server/routes/timetableRoutes.js` - Add student-specific route
- `server/server.js` - Mount student routes separately, add CORS headers
- `server/routes/authRoutes.js` - Fix avatar URL storage
- `server/migrations/fix-avatar-urls.js` - Migrate existing avatar URLs

**Frontend:**
- `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx` - Fix API calls, avatar error handling, timetable display, payment records display
- `client/frontend/src/pages/StudentDashboard/StudentDashboard.css` - Add payment status styling, update timetable styling

**Tests:**
- `client/frontend/src/pages/StudentDashboard/__tests__/student-dashboard-bugs.test.js` - Bug condition exploration tests
- `client/frontend/src/pages/StudentDashboard/__tests__/student-dashboard-preservation.test.js` - Preservation property tests

### Requirements Traceability

All tasks include `_Requirements: X.Y_` annotations linking back to the bugfix.md requirements document. This ensures complete coverage of all specified behaviors.
