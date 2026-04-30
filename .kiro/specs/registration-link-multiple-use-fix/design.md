# Registration Link Multiple-Use Fix Design

## Overview

The registration link system currently restricts each link to a single use, marking it as "used" after the first student registration. This defeats the intended purpose of allowing multiple students to register using the same link within a 24-hour expiration window. The fix removes the `is_used` flag checks and update logic, relying solely on the `expires_at` timestamp for link validation. This enables batch registration workflows where administrators can share one link with multiple students.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a second or subsequent student attempts to use a registration link that has already been used by another student
- **Property (P)**: The desired behavior - multiple students should be able to use the same registration link until it expires after 24 hours
- **Preservation**: Existing validation behaviors (expiration check, invalid token check, duplicate national_id check) that must remain unchanged by the fix
- **handleKeyPress**: The GET endpoint `/api/auth/register-link/:token` in `server/routes/authRoutes.js` that validates the link and returns available specialties
- **handleSubmit**: The POST endpoint `/api/auth/register-link/:token` in `server/routes/authRoutes.js` that processes registration requests
- **is_used**: The boolean flag in the `RegistrationLink` model that currently tracks whether a link has been used

## Bug Details

### Bug Condition

The bug manifests when a second student attempts to access or use a registration link that has already been used by another student. The system incorrectly rejects valid, non-expired links based on the `is_used` flag rather than allowing multiple uses until expiration.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { token: string, requestType: 'GET' | 'POST' }
  OUTPUT: boolean
  
  link := findRegistrationLink(input.token)
  
  RETURN link EXISTS
         AND link.is_used == true
         AND new Date(link.expires_at) >= new Date()
         AND (input.requestType == 'GET' OR input.requestType == 'POST')
END FUNCTION
```

### Examples

- **Example 1**: Student A uses link token `abc-123` to register at 10:00 AM. Student B attempts to access the same link at 10:30 AM (within 24 hours). Expected: Student B sees the registration form. Actual: Student B sees error "تم استخدام هذا الرابط من قبل" (This link has already been used).

- **Example 2**: Admin generates a link at 9:00 AM for a batch of 20 students. First student registers at 9:15 AM. Expected: Remaining 19 students can register until 9:00 AM next day. Actual: Only the first student can register; all others are blocked.

- **Example 3**: Student C accesses link token `xyz-789` at 2:00 PM, views the form, but doesn't submit. Student D submits registration using the same link at 2:30 PM. Student C returns at 3:00 PM to submit. Expected: Both students can submit. Actual: Student C is blocked after Student D's submission.

- **Edge Case**: Link expires at exactly 11:59:59 PM. Student attempts to use it at 11:59:58 PM. Expected: Registration succeeds regardless of previous uses. Actual: If link was previously used, registration is blocked even though link hasn't expired.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Invalid or non-existent token validation must continue to reject with error "رابط غير صالح" (Invalid link)
- Expired link validation must continue to reject with error "انتهت صلاحية الرابط" (Link has expired)
- Duplicate national_id validation must continue to reject with error "يوجد طلب مسبق بهذا الرقم القومي" (A previous request exists with this national ID)
- Required field validation must continue to work exactly as before
- Specialty retrieval and display must remain unchanged
- Registration request creation logic must remain unchanged

**Scope:**
All inputs that do NOT involve the `is_used` flag should be completely unaffected by this fix. This includes:
- Expiration-based validation (expired links should still be rejected)
- Token existence validation (invalid tokens should still be rejected)
- Business logic validation (duplicate national_id, missing fields)
- Database operations (creating registration requests, querying specialties)

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is clear:

1. **Incorrect Single-Use Logic**: The system was designed with a single-use assumption, implementing `is_used` flag checks at lines 68-69 (GET endpoint) and line 82 (POST endpoint) in `server/routes/authRoutes.js`

2. **Premature Link Invalidation**: Line 115 marks the link as `is_used = true` immediately after the first successful registration, preventing subsequent uses

3. **Misaligned Validation Priority**: The `is_used` check takes precedence over the intended expiration-based validation, contradicting the 24-hour expiration design

4. **Model Schema Mismatch**: The `RegistrationLink` model includes `is_used`, `used_by`, and `used_at` fields that suggest single-use design, but the business requirement is for multiple-use until expiration

## Correctness Properties

Property 1: Bug Condition - Multiple Students Can Use Same Link Until Expiration

_For any_ registration link where the expiration time has not passed (expires_at >= current time), the system SHALL allow any number of students to access the registration form (GET endpoint) and submit registration requests (POST endpoint), regardless of how many previous registrations have been completed using that link.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Expiration and Validation Logic Unchanged

_For any_ registration link request that does NOT involve the is_used flag (invalid tokens, expired links, duplicate national_id, missing required fields), the system SHALL produce exactly the same validation behavior as the original code, preserving all existing error messages and rejection logic.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

**File**: `server/routes/authRoutes.js`

**Function**: GET `/api/auth/register-link/:token` (lines 62-75)

**Specific Changes**:
1. **Remove is_used Check (Line 68-69)**: Delete the line `if (link.is_used) return res.status(400).json({ success: false, message: 'تم استخدام هذا الرابط من قبل' });`
   - This check prevents multiple students from accessing the registration form
   - After removal, only expiration and token validity will be checked

2. **Keep Expiration Check (Line 70)**: Retain `if (new Date(link.expires_at) < new Date()) return res.status(400).json({ success: false, message: 'انتهت صلاحية الرابط' });`
   - This is the correct validation mechanism for link validity

**Function**: POST `/api/auth/register-link/:token` (lines 77-120)

**Specific Changes**:
3. **Remove is_used Check from Compound Condition (Line 82)**: Change `if (!link || link.is_used || new Date(link.expires_at) < new Date())` to `if (!link || new Date(link.expires_at) < new Date())`
   - Remove the `link.is_used` condition from the validation
   - Keep the expiration check and null check

4. **Remove Link Update (Line 115)**: Delete the line `await link.update({ is_used: true });`
   - This prevents the link from being marked as used after registration
   - The link will remain usable until expiration

5. **Preserve All Other Logic**: Keep all validation logic for required fields, duplicate national_id checks, and registration request creation exactly as-is

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that the `is_used` flag is the root cause by observing rejection of valid, non-expired links after first use.

**Test Plan**: Write tests that simulate multiple students attempting to use the same registration link. Run these tests on the UNFIXED code to observe failures and confirm the root cause.

**Test Cases**:
1. **Second Student GET Request**: First student accesses link, second student attempts GET request (will fail on unfixed code with "تم استخدام هذا الرابط من قبل")
2. **Second Student POST Request**: First student completes registration, second student attempts POST request (will fail on unfixed code with "الرابط غير صالح أو منتهي الصلاحية")
3. **Multiple Sequential Registrations**: Three students attempt to register sequentially using the same link within expiration window (only first will succeed on unfixed code)
4. **Concurrent Registration Attempts**: Two students submit registration forms simultaneously using the same link (may cause race condition on unfixed code)

**Expected Counterexamples**:
- GET requests after first use are rejected with "تم استخدام هذا الرابط من قبل"
- POST requests after first registration are rejected with "الرابط غير صالح أو منتهي الصلاحية"
- Root cause confirmed: `is_used` flag check at lines 68-69 and 82, and update at line 115

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (valid, non-expired links that have been previously used), the fixed function produces the expected behavior (allows access and registration).

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := handleRequest_fixed(input)
  ASSERT expectedBehavior(result)
END FOR

FUNCTION expectedBehavior(result)
  IF input.requestType == 'GET' THEN
    RETURN result.success == true 
           AND result.data.specialties EXISTS
           AND result.data.valid == true
  ELSE IF input.requestType == 'POST' THEN
    RETURN result.success == true
           AND registrationRequestCreated(input.data)
  END IF
END FUNCTION
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (invalid tokens, expired links, duplicate national_id, missing fields), the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT handleRequest_original(input) = handleRequest_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (various token formats, expiration times, request payloads)
- It catches edge cases that manual unit tests might miss (boundary conditions on expiration times, malformed tokens)
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for invalid tokens, expired links, and validation errors, then write property-based tests capturing that exact behavior.

**Test Cases**:
1. **Invalid Token Preservation**: Observe that invalid tokens return "رابط غير صالح" on unfixed code, then verify this continues after fix
2. **Expired Link Preservation**: Observe that expired links return "انتهت صلاحية الرابط" on unfixed code, then verify this continues after fix
3. **Duplicate National ID Preservation**: Observe that duplicate national_id returns "يوجد طلب مسبق بهذا الرقم القومي" on unfixed code, then verify this continues after fix
4. **Missing Fields Preservation**: Observe that missing required fields return validation error on unfixed code, then verify this continues after fix

### Unit Tests

- Test GET endpoint with valid, non-expired link that has been used multiple times (should succeed after fix)
- Test POST endpoint with valid, non-expired link that has been used multiple times (should succeed after fix)
- Test GET endpoint with invalid token (should fail with "رابط غير صالح" before and after fix)
- Test GET endpoint with expired link (should fail with "انتهت صلاحية الرابط" before and after fix)
- Test POST endpoint with duplicate national_id (should fail with "يوجد طلب مسبق بهذا الرقم القومي" before and after fix)
- Test POST endpoint with missing required fields (should fail with validation error before and after fix)
- Test edge case: link expires exactly at current time (should be rejected)
- Test edge case: link expires 1 second in the future (should be accepted)

### Property-Based Tests

- Generate random valid tokens with various expiration times and usage counts, verify that non-expired links always allow access regardless of usage count
- Generate random invalid tokens (malformed UUIDs, non-existent tokens), verify that all are rejected with "رابط غير صالح"
- Generate random expired links with various expiration times in the past, verify that all are rejected with "انتهت صلاحية الرابط"
- Generate random registration payloads with missing required fields, verify that all are rejected with appropriate validation errors
- Generate random registration payloads with duplicate national_id values, verify that all are rejected with "يوجد طلب مسبق بهذا الرقم القومي"

### Integration Tests

- Test full registration flow: admin creates link, multiple students (5+) successfully register using the same link within 24 hours
- Test expiration flow: admin creates link, students register successfully for 23 hours, then link expires and subsequent attempts are rejected
- Test mixed scenario: some students register successfully, some have duplicate national_id (rejected), some have missing fields (rejected), all using the same link
- Test database state: verify that after multiple registrations using the same link, the `is_used` field remains false (or is ignored), and all registration requests are created correctly
