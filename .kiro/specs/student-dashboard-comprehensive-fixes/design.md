# Student Dashboard Comprehensive Fixes - Bugfix Design

## Overview

This design document addresses four critical bugs in the Student Dashboard that prevent students from accessing their academic information. The bugs span authentication/authorization (timetable API 403 error), file serving (avatar CORS errors), UI display (timetable format inconsistencies), and data presentation (payment records showing incorrect information). The fix strategy involves correcting route configurations, fixing avatar URL storage, standardizing UI components, and adjusting payment display logic to show student-appropriate information.

## Glossary

- **Bug_Condition (C)**: The conditions that trigger each of the four bugs - timetable API permission errors, avatar loading failures, timetable display inconsistencies, and payment record display issues
- **Property (P)**: The desired behavior when bugs are fixed - successful API access, proper image loading, consistent UI display, and accurate payment information
- **Preservation**: Existing functionality that must remain unchanged - other dashboard tabs, admin functionality, professor/accountant features, and non-affected API endpoints
- **authorizeRoles**: Middleware function in `server/middleware/auth.js` that checks if user has required role permissions
- **profile_image**: Field in User model that stores the file system path to avatar (e.g., `uploads/avatars/avatar_6_1776823812348.jpg`)
- **avatar_url**: The URL path returned to frontend for displaying avatar (e.g., `/uploads/avatars/avatar_6_1776823812348.jpg`)
- **timetableRoutes**: Express router in `server/routes/timetableRoutes.js` that handles timetable CRUD operations
- **StudentDashboard.jsx**: Main React component at `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx` that renders student portal

## Bug Details

### Bug Condition

The bugs manifest in four distinct scenarios:

**Bug 1: Timetable API 403 Error**
The bug occurs when a student clicks the "جدولي الدراسي" (My Timetable) tab. The frontend sends a GET request to `/api/admin/timetables/student`, but the `authorizeRoles('admin')` middleware on the parent router (`adminRoutes.js`) blocks the request before it reaches the student-specific handler in `timetableRoutes.js`.

**Bug 2: Avatar Image Loading Failure**
The bug occurs when the system tries to display a student's avatar image. The `profile_image` field stores the file system path (`uploads/avatars/avatar_6_1776823812348.jpg`) but the frontend expects a URL path starting with `/`. Additionally, CORS configuration may block image requests, and there's no proper fallback handling when images fail to load.

**Bug 3: Timetable Display Format**
The bug occurs when students view their timetable (if Bug 1 is fixed). The Student Dashboard may use different styling, layout, or filtering options compared to the Admin Dashboard, creating an inconsistent user experience.

**Bug 4: Payment Records Display**
The bug occurs when students view the "سجل المدفوعات" (Payment Records) tab. The system displays:
- Tab title as "فواتيري" (My Invoices) instead of "سجل المدفوعات" (Payment Records)
- Academic year (2024-2025) instead of student's current year (السنة الأولى، الثانية، etc.)
- No payment status column (تم الدفع ✅ / لم يتم الدفع ❌)
- Potentially accountant-specific information not relevant to students

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { bugType: string, context: object }
  OUTPUT: boolean
  
  IF input.bugType == 'timetable_403' THEN
    RETURN input.context.userRole == 'student'
           AND input.context.endpoint == '/api/admin/timetables/student'
           AND input.context.parentRouterHasAdminAuth == true
  
  ELSE IF input.bugType == 'avatar_loading' THEN
    RETURN input.context.profileImageField EXISTS
           AND (NOT input.context.profileImageField.startsWith('/'))
           OR input.context.corsError == true
           OR input.context.fallbackMissing == true
  
  ELSE IF input.bugType == 'timetable_display' THEN
    RETURN input.context.timetableView == 'student'
           AND input.context.formatDiffersFromAdmin == true
  
  ELSE IF input.bugType == 'payment_display' THEN
    RETURN input.context.tabTitle == 'فواتيري'
           OR input.context.yearDisplayFormat == 'academic_year'
           OR input.context.statusColumnMissing == true
           OR input.context.showsAccountantInfo == true
  
  ELSE
    RETURN false
  END IF
END FUNCTION
```

### Examples

**Bug 1: Timetable API 403 Error**
- **Input**: Student with role='student' clicks "جدولي الدراسي" tab
- **Current Behavior**: GET `/api/admin/timetables/student` → 403 Forbidden (Insufficient permissions)
- **Expected Behavior**: GET `/api/admin/timetables/student` → 200 OK with timetable data

**Bug 2: Avatar Image Loading**
- **Input**: Student uploads avatar, system stores `uploads/avatars/avatar_6_1776823812348.jpg` in database
- **Current Behavior**: Frontend tries to load `http://localhost:5000uploads/avatars/avatar_6_1776823812348.jpg` (missing `/`) → 404 or CORS error
- **Expected Behavior**: Frontend loads `http://localhost:5000/uploads/avatars/avatar_6_1776823812348.jpg` → Image displays successfully

**Bug 3: Timetable Display**
- **Input**: Student views timetable after Bug 1 is fixed
- **Current Behavior**: Timetable may use different card layout, missing filters, or inconsistent styling
- **Expected Behavior**: Timetable uses same format as Admin Dashboard with appropriate filters

**Bug 4: Payment Records Display**
- **Input**: Student views "سجل المدفوعات" tab
- **Current Behavior**: Shows "فواتيري" title, displays "2024-2025" for academic year, no status column
- **Expected Behavior**: Shows "سجل المدفوعات" title, displays "السنة الأولى" for student year, includes status column with ✅/❌

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- All other Student Dashboard tabs (Grades, Invoices, QR Code) must continue to work exactly as before
- Admin Dashboard timetable management functionality must remain unchanged
- Professor and Accountant dashboards must continue to work normally
- Avatar upload and delete functionality must continue to work
- Mouse clicks, keyboard inputs, and all other UI interactions must remain unchanged
- All non-timetable API endpoints must continue to respond as before
- Database schema and data integrity must be preserved

**Scope:**
All functionality that does NOT involve the four specific bugs should be completely unaffected by this fix. This includes:
- Grade viewing and payment-required logic
- Invoice display and calculations
- QR code generation and display
- Branch selection modal for ICT students
- User authentication and authorization for other endpoints
- File upload functionality for other file types
- All admin, professor, and accountant features

## Hypothesized Root Cause

Based on the bug analysis and code investigation, the most likely root causes are:

### Bug 1: Timetable API 403 Error

**Root Cause**: Route middleware ordering issue

The timetable routes are mounted at `/api/admin` in `server.js`:
```javascript
app.use('/api/admin', timetableRoutes);
```

However, `timetableRoutes.js` defines a student-accessible endpoint:
```javascript
router.get('/timetables/student', authenticateToken, authorizeRoles('student'), async (req, res) => {
  // Student timetable logic
});
```

The problem is that `adminRoutes.js` is ALSO mounted at `/api/admin` and has:
```javascript
router.use(authenticateToken, authorizeRoles('admin'));
```

This means ALL routes under `/api/admin` are checked for admin role FIRST, before the specific route handlers in `timetableRoutes.js` can execute. The student-specific handler never gets a chance to run.

**Solution**: Move the student timetable endpoint to a different base path (e.g., `/api/student/timetables`) OR restructure the middleware to allow student access to specific timetable endpoints.

### Bug 2: Avatar Image Loading Failure

**Root Cause 1**: Incorrect avatar URL format in database

In `server/routes/authRoutes.js`, the avatar upload handler stores:
```javascript
await user.update({ profile_image: req.file.path });
const avatarUrl = `/uploads/avatars/${req.file.filename}`;
res.json({ success: true, data: { avatar_url: avatarUrl }, message: 'تم رفع الصورة بنجاح' });
```

The `profile_image` field stores `req.file.path` (e.g., `uploads/avatars/avatar_6_1776823812348.jpg` without leading `/`), but the response returns `avatarUrl` with leading `/`. When the dashboard fetches user data later, it may return the database value without the leading `/`.

**Root Cause 2**: CORS configuration

The server has CORS enabled for localhost origins, but the `helmet()` middleware may be blocking cross-origin image requests or the static file serving may not have proper CORS headers.

**Root Cause 3**: Missing fallback handling

The frontend code shows:
```jsx
{avatarUrl ? (
  <img src={`http://localhost:5000${avatarUrl}`} alt="صورة الطالب" className="avatar-img" />
) : (
  <div className="sp-avatar">
    {info.full_name ? info.full_name.charAt(0) : '؟'}
  </div>
)}
```

There's no error handling for failed image loads (e.g., `onError` handler).

**Solution**: Ensure `profile_image` always stores paths with leading `/`, add proper CORS headers for static files, and implement `onError` fallback for images.

### Bug 3: Timetable Display Format

**Root Cause**: Inconsistent UI implementation

The Student Dashboard timetable rendering (lines 691-768 in `StudentDashboard.jsx`) uses custom styling and layout that may differ from the Admin Dashboard. The code shows a card-based layout with SVG icons, but we need to verify if this matches the Admin Dashboard format.

**Solution**: Review Admin Dashboard timetable display and ensure Student Dashboard uses the same component structure, styling, and filtering options.

### Bug 4: Payment Records Display

**Root Cause 1**: Incorrect tab title

Line 545 in `StudentDashboard.jsx`:
```jsx
<button
  className={`sp-tab ${activeTab === 'payments' ? 'active' : ''}`}
  onClick={() => setActiveTab('payments')}
>
  سجل المدفوعات
</button>
```

The tab button shows "سجل المدفوعات" but the requirements state it shows "فواتيري". This may be a discrepancy in the requirements document, or there's another location where the title is set incorrectly.

**Root Cause 2**: Academic year vs. student year display

Lines 625-638 show the payment records table:
```jsx
<td>{payment.academic_year || '—'}</td>
```

The code displays `payment.academic_year` (e.g., "2024-2025") instead of mapping it to the student's current year (e.g., "السنة الأولى").

**Root Cause 3**: Missing payment status column

The table headers (lines 617-624) show:
```jsx
<th>رقم الإيصال</th>
<th>رقم الفاتورة</th>
<th>السنة الدراسية</th>
<th>الترم</th>
<th>المبلغ المدفوع</th>
<th>طريقة الدفع</th>
<th>تاريخ الدفع</th>
<th>ملاحظات</th>
```

There's no "حالة الدفع" (Payment Status) column.

**Solution**: Verify tab title, add logic to map academic year to student year, and add a payment status column that shows ✅ for completed payments and ❌ for pending payments.

## Correctness Properties

Property 1: Bug Condition - Timetable API Access

_For any_ authenticated student user who requests their timetable via `/api/admin/timetables/student`, the fixed system SHALL return a 200 OK response with timetable data filtered by the student's specialty, without triggering a 403 Forbidden error.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Bug Condition - Avatar Image Loading

_For any_ student who has uploaded an avatar image, the fixed system SHALL serve the image successfully with proper CORS headers, using a correctly formatted URL path (starting with `/`), and SHALL display a fallback avatar (first letter of name) when the image fails to load for any reason.

**Validates: Requirements 2.4, 2.5, 2.6, 2.7**

Property 3: Bug Condition - Timetable Display Format

_For any_ student viewing their timetable, the fixed system SHALL display the timetable using the same format, styling, and filtering options as the Admin Dashboard, ensuring a consistent user experience across roles.

**Validates: Requirements 2.8, 2.9, 2.10**

Property 4: Bug Condition - Payment Records Display

_For any_ student viewing their payment records, the fixed system SHALL display the correct tab title ("سجل المدفوعات"), show the student's current year (السنة الأولى، الثانية، etc.) instead of academic year (2024-2025), include a payment status column with visual indicators (✅/❌), and show only student-appropriate information without accountant-specific data.

**Validates: Requirements 2.11, 2.12, 2.13, 2.14**

Property 5: Preservation - Non-Timetable Functionality

_For any_ student interaction with dashboard features OTHER than the four bug areas (grades, invoices, QR code, profile, avatar upload/delete), the fixed system SHALL produce exactly the same behavior as the original system, preserving all existing functionality.

**Validates: Requirements 3.1, 3.4, 3.5**

Property 6: Preservation - Admin and Other Roles

_For any_ admin, professor, or accountant user performing their role-specific tasks, the fixed system SHALL produce exactly the same behavior as the original system, with no impact on their dashboards, API endpoints, or functionality.

**Validates: Requirements 3.2, 3.3, 3.6, 3.7, 3.8, 3.9**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

#### Bug 1: Timetable API 403 Error

**File**: `server/routes/timetableRoutes.js`

**Approach**: Move student timetable endpoint to a separate route that doesn't require admin authorization

**Specific Changes**:
1. **Keep the existing student endpoint** in `timetableRoutes.js` but ensure it's accessible
2. **Modify server.js routing**: The current setup mounts timetableRoutes at `/api/admin`, which causes the issue. We need to either:
   - Option A: Mount timetableRoutes BEFORE adminRoutes so student endpoints are registered first
   - Option B: Create a separate student-specific timetable route outside the admin router
   - Option C: Modify the middleware chain to allow student access to specific endpoints

**Recommended Solution (Option B)**:
```javascript
// In server.js, add BEFORE the admin routes:
app.use('/api/student', timetableRoutes); // This will handle /api/student/timetables/student

// Then modify timetableRoutes.js to have both paths:
// Student path (no admin auth required)
router.get('/timetables/student', authenticateToken, authorizeRoles('student'), async (req, res) => {
  // Existing student timetable logic
});

// Admin paths (require admin auth)
router.get('/timetables', authenticateToken, authorizeRoles('admin'), TimetableController.getAllTimetables);
router.post('/timetables', authenticateToken, authorizeRoles('admin'), upload.single('file'), TimetableController.createTimetable);
// ... other admin endpoints
```

3. **Update frontend API call** in `StudentDashboard.jsx`:
```javascript
// Change from:
const res = await api.get('/admin/timetables/student');
// To:
const res = await api.get('/student/timetables/student');
```

#### Bug 2: Avatar Image Loading Failure

**File**: `server/routes/authRoutes.js`

**Function**: Avatar upload handler (POST `/api/auth/upload-avatar`)

**Specific Changes**:
1. **Fix avatar URL storage**: Ensure `profile_image` field always stores path with leading `/`
```javascript
// Change from:
await user.update({ profile_image: req.file.path });
const avatarUrl = `/uploads/avatars/${req.file.filename}`;

// To:
const avatarUrl = `/uploads/avatars/${req.file.filename}`;
await user.update({ profile_image: avatarUrl }); // Store the URL path, not file system path
```

2. **Add CORS headers for static files** in `server.js`:
```javascript
// Change from:
app.use('/uploads', express.static('uploads'));

// To:
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));
```

3. **Add image error handling** in `StudentDashboard.jsx`:
```javascript
// Add onError handler to img tag:
<img 
  src={`http://localhost:5000${avatarUrl}`} 
  alt="صورة الطالب" 
  className="avatar-img"
  onError={(e) => {
    e.target.style.display = 'none';
    e.target.parentElement.innerHTML = `<div class="sp-avatar">${info.full_name ? info.full_name.charAt(0) : '؟'}</div>`;
  }}
/>
```

4. **Fix existing avatar URLs in database**: Run a migration script to add leading `/` to existing `profile_image` values that don't have it

#### Bug 3: Timetable Display Format

**File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx`

**Section**: Timetable tab rendering (lines 691-768)

**Specific Changes**:
1. **Review Admin Dashboard timetable display**: First, we need to check how Admin Dashboard displays timetables
2. **Standardize card layout**: Ensure the timetable card structure matches Admin Dashboard
3. **Add filtering options**: If Admin Dashboard has filters for academic year or specialty, add them to Student Dashboard
4. **Ensure consistent styling**: Use the same CSS classes or create shared components
5. **Verify PDF viewing**: Ensure the "عرض الجدول" button opens PDFs the same way as Admin Dashboard

**Note**: This requires investigating the Admin Dashboard timetable component first to identify the exact differences.

#### Bug 4: Payment Records Display

**File**: `client/frontend/src/pages/StudentDashboard/StudentDashboard.jsx`

**Section**: Payments tab rendering (lines 605-650)

**Specific Changes**:
1. **Verify tab title**: Check if "فواتيري" appears elsewhere and change to "سجل المدفوعات"
   - The code at line 545 already shows "سجل المدفوعات", so this may already be correct
   - If requirements are outdated, verify with user

2. **Add student year mapping logic**:
```javascript
// Add helper function to map academic year to student year
const getStudentYearLabel = (academicYear, studentCurrentYear) => {
  const yearLabels = {
    1: 'السنة الأولى',
    2: 'السنة الثانية',
    3: 'السنة الثالثة',
    4: 'السنة الرابعة'
  };
  return yearLabels[studentCurrentYear] || academicYear;
};

// In the table cell:
<td>{getStudentYearLabel(payment.academic_year, info.current_year)}</td>
```

3. **Add payment status column**:
```javascript
// Add to table headers:
<th>حالة الدفع</th>

// Add to table body:
<td>
  <span className={`sp-payment-status ${payment.status === 'paid' ? 'paid' : 'unpaid'}`}>
    {payment.status === 'paid' ? '✅ تم الدفع' : '❌ لم يتم الدفع'}
  </span>
</td>
```

4. **Add CSS for payment status**:
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

5. **Filter accountant-specific information**: Review the payment data structure and ensure only student-relevant fields are displayed

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate each bug scenario and assert the expected failures. Run these tests on the UNFIXED code to observe failures and understand the root causes.

**Test Cases**:

1. **Timetable API 403 Test**: 
   - Simulate authenticated student user making GET request to `/api/admin/timetables/student`
   - Assert response status is 403 (will fail on unfixed code)
   - Assert error message contains "Insufficient permissions"
   - Verify that admin users CAN access the endpoint successfully

2. **Avatar Loading Test**:
   - Create test user with `profile_image` = `uploads/avatars/test.jpg` (no leading `/`)
   - Attempt to load image from frontend URL construction
   - Assert image request fails with 404 or CORS error (will fail on unfixed code)
   - Verify that images with leading `/` DO load successfully

3. **Timetable Display Test**:
   - Render Student Dashboard timetable component
   - Compare DOM structure, CSS classes, and layout with Admin Dashboard timetable
   - Assert differences exist (will fail on unfixed code)
   - Document specific differences found

4. **Payment Records Display Test**:
   - Render Student Dashboard payments tab
   - Assert tab title is "فواتيري" (if bug exists) or "سجل المدفوعات" (if already fixed)
   - Assert academic year column shows format like "2024-2025" instead of "السنة الأولى"
   - Assert payment status column is missing from table headers
   - Count table columns and verify status column is absent

**Expected Counterexamples**:
- Timetable API returns 403 for student users due to admin-only middleware
- Avatar images fail to load due to missing leading `/` in URL path
- Timetable display uses different card layout or missing filters compared to Admin Dashboard
- Payment records show academic year format and missing status column

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedSystem(input)
  ASSERT expectedBehavior(result)
END FOR
```

**Test Cases**:

1. **Timetable API Fix Verification**:
```javascript
// Test that student users can access timetable endpoint
const studentToken = generateStudentToken();
const response = await api.get('/student/timetables/student', {
  headers: { Authorization: `Bearer ${studentToken}` }
});
assert(response.status === 200);
assert(response.data.success === true);
assert(Array.isArray(response.data.data));
```

2. **Avatar Loading Fix Verification**:
```javascript
// Test that avatar URLs are correctly formatted
const user = await User.findByPk(testUserId);
assert(user.profile_image.startsWith('/'));

// Test that images load successfully
const imageResponse = await fetch(`http://localhost:5000${user.profile_image}`);
assert(imageResponse.status === 200);
assert(imageResponse.headers.get('content-type').startsWith('image/'));
```

3. **Timetable Display Fix Verification**:
```javascript
// Test that Student Dashboard timetable matches Admin Dashboard format
const studentTimetable = renderStudentTimetable();
const adminTimetable = renderAdminTimetable();
assert(studentTimetable.cardLayout === adminTimetable.cardLayout);
assert(studentTimetable.hasFilters === adminTimetable.hasFilters);
assert(studentTimetable.cssClasses === adminTimetable.cssClasses);
```

4. **Payment Records Fix Verification**:
```javascript
// Test that payment records display correctly
const paymentsTab = renderPaymentsTab();
assert(paymentsTab.tabTitle === 'سجل المدفوعات');
assert(paymentsTab.yearColumn.text === 'السنة الأولى'); // For year 1 student
assert(paymentsTab.hasStatusColumn === true);
assert(paymentsTab.statusCell.includes('✅') || paymentsTab.statusCell.includes('❌'));
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalSystem(input) = fixedSystem(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-affected features, then write property-based tests capturing that behavior.

**Test Cases**:

1. **Grades Tab Preservation**:
   - Verify grades display, payment-required logic, and semester summary cards work identically
   - Test with various grade data scenarios (empty, partial, complete)
   - Verify GPA calculations and classification badges remain unchanged

2. **Invoices Tab Preservation**:
   - Verify invoice summary cards and table display work identically
   - Test invoice status rendering (paid, partial, overdue, unpaid)
   - Verify date formatting and amount calculations remain unchanged

3. **QR Code Tab Preservation**:
   - Verify QR code generation and display work identically
   - Test QR code download functionality remains unchanged

4. **Profile Card Preservation**:
   - Verify profile information display (name, code, email, specialty, year, status, branch, GPA, enrolled courses, approved grades) works identically
   - Test branch badge display for ICT students remains unchanged

5. **Admin Dashboard Preservation**:
   - Verify admin timetable management (create, read, update, delete) works identically
   - Test admin timetable list view and filters remain unchanged
   - Verify admin can still access `/api/admin/timetables` endpoint

6. **Other User Roles Preservation**:
   - Verify professor dashboard and grade management work identically
   - Verify accountant payment management works identically
   - Test that all role-specific API endpoints remain unchanged

### Unit Tests

- Test timetable API endpoint with student authentication token
- Test timetable API endpoint with admin authentication token
- Test avatar URL formatting in upload handler
- Test avatar URL retrieval in profile endpoint
- Test image error handling in frontend component
- Test student year mapping function with various inputs
- Test payment status determination logic
- Test CORS headers on static file serving

### Property-Based Tests

- Generate random student users and verify timetable API access works for all
- Generate random avatar filenames and verify URL formatting is correct for all
- Generate random payment records and verify status column displays correctly for all
- Generate random student years (1-4) and verify year label mapping is correct for all
- Test that all non-timetable API endpoints continue to work across many scenarios

### Integration Tests

- Test full student login → dashboard load → timetable tab click → timetable display flow
- Test full avatar upload → profile refresh → image display flow
- Test full payment records tab click → data fetch → table render flow
- Test that admin users can still manage timetables after student endpoint is added
- Test that switching between dashboard tabs preserves state correctly
- Test that visual feedback (loading spinners, error messages) occurs correctly for all tabs
