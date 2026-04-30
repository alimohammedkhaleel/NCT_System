# Implementation Tasks

## Task 1: Write Bug Condition Exploration Property Test

Write a property-based test that explores the bug condition on the UNFIXED code to surface counterexamples demonstrating that the `is_used` flag incorrectly blocks valid, non-expired registration links after first use.

**Acceptance Criteria:**
- Test file created at `server/__tests__/registration-link-bug-exploration.test.js`
- Test simulates multiple students attempting to use the same registration link
- Test runs against UNFIXED code (before implementing the fix)
- Test MUST FAIL on unfixed code, demonstrating the bug exists
- Test captures specific error messages: "تم استخدام هذا الرابط من قبل" for GET requests and "الرابط غير صالح أو منتهي الصلاحية" for POST requests
- Test documents counterexamples showing that valid, non-expired links are rejected after first use
- Test confirms root cause: `is_used` flag checks at lines 68-69 and 82, and update at line 115 in `server/routes/authRoutes.js`

**Sub-tasks:**
- [x] 1.1 Create test file with setup for database and test data (registration link with valid expiration)
- [x] 1.2 Write test case: First student accesses link (GET), second student attempts GET request (should fail with "تم استخدام هذا الرابط من قبل")
- [x] 1.3 Write test case: First student completes registration (POST), second student attempts POST request (should fail with "الرابط غير صالح أو منتهي الصلاحية")
- [x] 1.4 Write test case: Three students attempt sequential registrations using same link (only first should succeed on unfixed code)
- [x] 1.5 Run tests on UNFIXED code and document counterexamples in test output
- [x] 1.6 Verify that tests confirm the bug exists and identify the root cause

**Validates:** Bug Condition (Requirements 1.1, 1.2, 1.3)

---

## Task 2: Implement Fix - Remove is_used Checks and Update Logic

Modify `server/routes/authRoutes.js` to remove all `is_used` flag checks and the link update logic, allowing multiple students to use the same registration link until it expires.

**Acceptance Criteria:**
- Line 68-69 in GET endpoint: `if (link.is_used) return res.status(400).json({ success: false, message: 'تم استخدام هذا الرابط من قبل' });` is REMOVED
- Line 82 in POST endpoint: `link.is_used` condition is REMOVED from compound validation (change `if (!link || link.is_used || new Date(link.expires_at) < new Date())` to `if (!link || new Date(link.expires_at) < new Date())`)
- Line 115 in POST endpoint: `await link.update({ is_used: true });` is REMOVED
- Expiration check remains intact: `if (new Date(link.expires_at) < new Date()) return res.status(400).json({ success: false, message: 'انتهت صلاحية الرابط' });`
- All other validation logic (invalid token, duplicate national_id, missing fields) remains unchanged
- Code compiles without errors

**Sub-tasks:**
- [x] 2.1 Remove `is_used` check from GET endpoint (line 68-69)
- [x] 2.2 Remove `is_used` condition from POST endpoint validation (line 82)
- [x] 2.3 Remove `link.update({ is_used: true })` call (line 115)
- [x] 2.4 Verify expiration check is still present and functional
- [x] 2.5 Run linter and ensure no syntax errors

**Validates:** Expected Behavior (Requirements 2.1, 2.2, 2.3)

---

## Task 3: Write Fix Validation Tests

Write tests that verify the fix works correctly for all inputs where the bug condition holds (valid, non-expired links that have been previously used).

**Acceptance Criteria:**
- Test file created at `server/__tests__/registration-link-fix-validation.test.js`
- Tests run against FIXED code (after implementing Task 2)
- All tests PASS on fixed code
- Tests verify that multiple students can access and use the same registration link within expiration period
- Tests verify that link expiration still works correctly (expired links are rejected)
- Tests cover edge cases (link expires exactly at current time, link expires 1 second in future)

**Sub-tasks:**
- [x] 3.1 Write test: Multiple students can access same link via GET endpoint (all should succeed)
- [x] 3.2 Write test: Multiple students can submit registrations via POST endpoint using same link (all should succeed)
- [x] 3.3 Write test: Link expiration still works (expired links are rejected with "انتهت صلاحية الرابط")
- [x] 3.4 Write test: Edge case - link expires exactly at current time (should be rejected)
- [x] 3.5 Write test: Edge case - link expires 1 second in future (should be accepted)
- [x] 3.6 Run all tests and verify they pass on fixed code

**Validates:** Correctness Property 1 (Requirements 2.1, 2.2, 2.3, 2.4)

---

## Task 4: Write Preservation Tests

Write property-based tests that verify all existing validation behaviors (invalid tokens, expired links, duplicate national_id, missing fields) remain unchanged after the fix.

**Acceptance Criteria:**
- Test file created at `server/__tests__/registration-link-preservation.test.js`
- Tests verify that behavior for non-buggy inputs is identical before and after fix
- Tests use property-based testing approach to generate many test cases automatically
- All tests PASS on both unfixed and fixed code (demonstrating preservation)
- Tests cover: invalid tokens, expired links, duplicate national_id, missing required fields

**Sub-tasks:**
- [x] 4.1 Write property test: Invalid tokens are rejected with "رابط غير صالح" (before and after fix)
- [x] 4.2 Write property test: Expired links are rejected with "انتهت صلاحية الرابط" (before and after fix)
- [x] 4.3 Write property test: Duplicate national_id is rejected with "يوجد طلب مسبق بهذا الرقم القومي" (before and after fix)
- [x] 4.4 Write property test: Missing required fields are rejected with validation error (before and after fix)
- [x] 4.5 Run tests on both unfixed and fixed code to verify preservation
- [x] 4.6 Document that all preservation tests pass, confirming no regression

**Validates:** Correctness Property 2 (Requirements 3.1, 3.2, 3.3, 3.4, 3.5)

---

## Task 5: Integration Testing

Write end-to-end integration tests that verify the complete registration flow works correctly with multiple students using the same link.

**Acceptance Criteria:**
- Test file created at `server/__tests__/registration-link-integration.test.js`
- Tests simulate real-world scenarios with multiple students, admin actions, and database state verification
- All tests PASS on fixed code
- Tests verify database state after multiple registrations (registration requests created, link remains usable)
- Tests cover mixed scenarios (some students succeed, some fail validation, all using same link)

**Sub-tasks:**
- [x] 5.1 Write test: Admin creates link, 5+ students successfully register using same link within 24 hours
- [x] 5.2 Write test: Admin creates link, students register for 23 hours, then link expires and subsequent attempts are rejected
- [x] 5.3 Write test: Mixed scenario - some students succeed, some have duplicate national_id (rejected), some have missing fields (rejected), all using same link
- [x] 5.4 Write test: Verify database state after multiple registrations (all registration requests created, link not marked as used)
- [x] 5.5 Run all integration tests and verify they pass
- [x] 5.6 Document test results and confirm end-to-end flow works correctly

**Validates:** Full system behavior (Requirements 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5)

---

## Task 6: Manual Testing and Documentation

Perform manual testing of the registration flow in a development environment and update any relevant documentation.

**Acceptance Criteria:**
- Manual test performed: Admin creates registration link, shares with multiple test users, verifies all can register
- Manual test performed: Verify link expiration works correctly (link becomes invalid after 24 hours)
- Manual test performed: Verify existing validations still work (duplicate national_id, missing fields)
- Documentation updated (if any user-facing documentation exists for registration links)
- Test results documented in a manual test report

**Sub-tasks:**
- [x] 6.1 Set up development environment with test database
- [x] 6.2 Create registration link as admin user
- [x] 6.3 Attempt registration with 3+ different test student accounts using same link
- [x] 6.4 Verify all registrations succeed and appear in admin dashboard
- [x] 6.5 Test link expiration by creating a link with short expiration (e.g., 1 minute) and verifying it becomes invalid
- [x] 6.6 Test existing validations (duplicate national_id, missing fields) still work correctly
- [x] 6.7 Update documentation if needed
- [x] 6.8 Document manual test results

**Validates:** User experience and documentation accuracy
