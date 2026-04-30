# Professor Registration 500 Fix — Bugfix Design

## Overview

Two bugs cause HTTP 500 errors in the professor registration flow:

1. **Primary (table-missing)**: `server/server.js` runs the `create-professor-registration-links` migration inside a `try/catch` that swallows failures with only a non-fatal `console.warn`. If the migration fails for any reason (permissions, partial prior run, race condition), the `professor_registration_links` table is never created. Every subsequent call to `GET /api/professor-registration/register-link/:token` then throws `SequelizeDatabaseError: Table 'professor_registration_links' doesn't exist`, which the outer handler converts to a 500 response.

2. **Secondary (null national_id)**: `ProfessorRegistrationRequest` (model + migration) defines `national_id` as `allowNull: false` with a strict 14-digit validator. The controller's `registerProfessor` function correctly passes `national_id: null` for link-based registrations where the field is optional, but Sequelize rejects the insert with a validation error (500) because the model constraint forbids null.

The fix strategy is:
- Replace the silent-swallow migration pattern with `ProfessorRegistrationLink.sync({ alter: true })` called before the server starts accepting requests, and treat failure as a fatal startup error.
- Change `national_id` in the `ProfessorRegistrationRequest` model to `allowNull: true` and remove the `notEmpty` validator, keeping only the format validator (applied conditionally when a value is present). Also add an `ALTER TABLE` migration to relax the DB-level `NOT NULL` constraint.

---

## Glossary

- **Bug_Condition (C)**: The set of runtime states that trigger a 500 response — either the `professor_registration_links` table is absent, or a POST registration request carries `national_id: null` while the model/DB enforces `NOT NULL`.
- **Property (P)**: The desired behavior when the bug condition holds — the server SHALL NOT return HTTP 500; it SHALL return the correct success or domain-error response.
- **Preservation**: All existing behaviors for non-buggy inputs (valid token lookups, expired/missing token errors, full-form submissions with a valid national ID, admin link management) that must remain unchanged after the fix.
- **`validateProfessorLink`**: The controller function in `server/controllers/professorRegistrationController.js` that handles `GET /api/professor-registration/register-link/:token`. It calls `ProfessorRegistrationLink.findOne({ where: { token } })`, which throws if the table does not exist.
- **`registerProfessor`**: The controller function that handles both `POST /api/professor-registration/register` and (via delegation from `registerProfessorViaLink`) `POST /api/professor-registration/register-link/:token`. It calls `ProfessorRegistrationRequest.create({ national_id: national_id || null, ... })`.
- **`startServer`**: The async function in `server/server.js` that authenticates the DB connection, runs migrations, seeds data, and calls `app.listen`. The migration `try/catch` block that swallows errors lives here.
- **`ProfessorRegistrationLink`**: Sequelize model (`server/models/ProfessorRegistrationLink.js`) mapped to the `professor_registration_links` table.
- **`ProfessorRegistrationRequest`**: Sequelize model (`server/models/ProfessorRegistrationRequest.js`) mapped to the `professor_registration_requests` table. Currently defines `national_id` as `allowNull: false`.
- **`create-professor-registration-links` migration**: `server/migrations/create-professor-registration-links.js` — a custom migration that creates the `professor_registration_links` table. It is `require()`-d and called inside a swallowed `try/catch` in `startServer`.

---

## Bug Details

### Bug Condition

The bug manifests in two independent scenarios:

**Scenario A — Table Missing:**
The `professor_registration_links` table does not exist in the database at the time a request arrives at `GET /api/professor-registration/register-link/:token`. This happens because the migration that creates the table ran inside a `try/catch` block in `startServer` that catches any error and logs only a non-fatal warning, allowing the server to continue without the table.

**Scenario B — Null National ID:**
A professor submits the registration form via `POST /api/professor-registration/register-link/:token` without providing a `national_id`. The controller passes `national_id: null` to `ProfessorRegistrationRequest.create(...)`, but the Sequelize model defines `national_id` with `allowNull: false` and a `notEmpty` validator, causing Sequelize to throw a `SequelizeValidationError` before the INSERT reaches the database.

**Formal Specification:**

```
FUNCTION isBugCondition(X)
  INPUT: X — an HTTP request to the professor registration API
  OUTPUT: boolean

  IF X.method = 'GET'
     AND X.path MATCHES '/api/professor-registration/register-link/:token'
     AND professor_registration_links_table_exists() = FALSE
  THEN RETURN TRUE

  IF X.method = 'POST'
     AND X.path MATCHES '/api/professor-registration/register-link/:token'
                     OR '/api/professor-registration/register'
     AND X.body.national_id IS NULL OR X.body.national_id = ''
     AND ProfessorRegistrationRequest.national_id.allowNull = FALSE
  THEN RETURN TRUE

  RETURN FALSE
END FUNCTION
```

### Examples

**Scenario A — Table Missing:**
- Request: `GET /api/professor-registration/register-link/550e8400-e29b-41d4-a716-446655440000`
- Actual: HTTP 500 `{ success: false, message: 'حدث خطأ في الخادم' }`
- Expected: HTTP 200 `{ success: true, data: { valid: true, expires_at: '...', specialties: [...] } }`
- Root cause: `SequelizeDatabaseError: Table 'professor_registration_links' doesn't exist`

**Scenario B — Null National ID:**
- Request: `POST /api/professor-registration/register-link/550e8400-e29b-41d4-a716-446655440000` with body `{ full_name: 'Dr. Ahmed', email: 'ahmed@example.com', password: 'pass1234' }` (no `national_id`)
- Actual: HTTP 500 `{ success: false, message: 'حدث خطأ في الخادم' }`
- Expected: HTTP 201 `{ success: true, message: 'تم إرسال طلب التسجيل بنجاح...', data: { request_id: ..., ... } }`
- Root cause: `SequelizeValidationError: notEmpty on national_id` / `allowNull violation`

**Edge case — Table missing AND null national_id:**
- Both conditions hold simultaneously; the table-missing error surfaces first (during `validateProfessorLink` on GET), and the null national_id error surfaces on POST. Both must be fixed independently.

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- `GET /api/professor-registration/register-link/:token` with a token that does NOT exist in the database SHALL continue to return HTTP 404 with `رابط التسجيل غير صالح أو لم يتم إنشاؤه`
- `GET /api/professor-registration/register-link/:token` with an expired token SHALL continue to return HTTP 400 with `انتهت صلاحية رابط التسجيل`
- `POST /api/professor-registration/register-link/:token` with a valid `national_id` (14 digits) SHALL continue to validate the format and store it correctly
- `POST /api/professor-registration/admin/links` SHALL continue to create and return a link token successfully
- `GET /api/professor-registration/admin/links` SHALL continue to return the list of all links with their status
- `POST /api/professor-registration/register-link/:token` with all required fields SHALL continue to create a pending registration request and return HTTP 201
- Server startup with a healthy database SHALL continue to succeed and log `✅` messages as before

**Scope:**
All inputs that do NOT involve the bug condition (table-missing state or null national_id on a constrained model) should be completely unaffected by this fix. This includes:
- All admin-authenticated routes
- All student registration routes
- All grade, timetable, and auth routes
- Any professor registration request that includes a valid 14-digit national_id

**Note:** The actual expected correct behavior for buggy inputs is defined in the Correctness Properties section (Properties 1 and 2). This section focuses on what must NOT change.

---

## Hypothesized Root Cause

### Root Cause A — Silent Migration Swallow

In `server/server.js`, the `startServer` function contains:

```javascript
try {
  const { up: createProfessorLinks } = require('./migrations/create-professor-registration-links');
  await createProfessorLinks();
} catch (migrationError) {
  console.warn('⚠️ Migration warning (non-fatal):', migrationError.message);
}
```

The `catch` block logs a warning and continues. If `createProfessorLinks()` throws for any reason — database permission error, foreign key constraint failure because `users` table doesn't exist yet, or any other transient error — the server starts without the `professor_registration_links` table. The `ProfessorRegistrationLink` Sequelize model is defined and imported, but Sequelize does not auto-create tables unless `sync()` is called. The model definition alone does not create the table.

**Why `sync()` is the right fix:** The model already exists as a Sequelize model (`ProfessorRegistrationLink`). Calling `ProfessorRegistrationLink.sync({ alter: true })` (or `{ force: false }`) is idempotent — it creates the table if absent and does nothing if it already exists. This is more reliable than the custom migration script because it uses Sequelize's own DDL generation, which is consistent with the model definition. Failure should be treated as fatal (re-throw after logging) so the server does not start in a broken state.

### Root Cause B — Model Constraint Mismatch

In `server/models/ProfessorRegistrationRequest.js`, `national_id` is defined as:

```javascript
national_id: {
  type: DataTypes.STRING(14),
  allowNull: false,          // ← blocks null inserts at Sequelize level
  unique: { msg: '...' },
  validate: {
    notEmpty: { msg: '...' }, // ← also blocks empty string
    is: { args: /^[0-9]{14}$/, msg: '...' }
  }
}
```

The controller's `registerProfessor` function already handles the optional nature of `national_id` for link-based registrations:

```javascript
// national_id is optional for link-based registration (professor may not have it)
if (national_id && !/^[0-9]{14}$/.test(national_id)) { ... }
```

And passes `national_id: national_id || null` to `ProfessorRegistrationRequest.create(...)`. However, the model's `allowNull: false` and `notEmpty` validator reject the null value before the INSERT is attempted. The migration (`create-professor-registration-requests.js`) also defines `national_id` as `allowNull: false` at the DB level, so even if the Sequelize model were fixed, the DB constraint would still reject the null.

Additionally, the `approveProfessorRequest` controller has a potential secondary issue: it queries `User.findOne({ where: { [Op.or]: [{ email }, { national_id }] } })` where `national_id` may be null — this could produce unexpected SQL (`national_id = NULL` instead of `national_id IS NULL`), but this is a pre-existing issue outside the scope of this fix.

---

## Correctness Properties

Property 1: Bug Condition A — Table Existence Guaranteed at Startup

_For any_ server startup sequence where the database connection succeeds, the fixed `startServer` function SHALL ensure the `professor_registration_links` table exists before `app.listen` is called, and SHALL treat table-creation failure as a fatal error that prevents the server from starting.

**Validates: Requirements 2.2**

Property 2: Bug Condition B — Null National ID Accepted for Link-Based Registration

_For any_ POST request to `/api/professor-registration/register-link/:token` or `/api/professor-registration/register` where `national_id` is absent or null AND all other required fields (`full_name`, `email`, `password`) are present AND the token is valid and unexpired, the fixed `registerProfessor` function SHALL successfully create a `ProfessorRegistrationRequest` record with `national_id = NULL` and return HTTP 201.

**Validates: Requirements 2.3**

Property 3: Preservation — Non-Buggy Inputs Unchanged

_For any_ input where the bug condition does NOT hold (table exists AND either `national_id` is a valid 14-digit string or the request is not a registration POST), the fixed code SHALL produce exactly the same response as the original code, preserving all existing validation, error handling, and success behaviors.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

---

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

---

**File 1**: `server/server.js`

**Function**: `startServer`

**Specific Changes**:

1. **Remove the silent-swallow migration block**: Delete the `try/catch` block that calls `createProfessorLinks()` and swallows errors.

2. **Add `ProfessorRegistrationLink.sync()`**: After `defineAssociations()` and the existing table-existence check, add a call to `ProfessorRegistrationLink.sync({ alter: false })` (create if not exists, do not alter existing columns). Import `ProfessorRegistrationLink` from the models config or directly. Treat failure as fatal — let the error propagate to the outer `catch` block in `startServer`, which already calls `process.exit(1)`.

   ```javascript
   // Ensure professor_registration_links table exists (fatal if it fails)
   const ProfessorRegistrationLink = require('./models/ProfessorRegistrationLink');
   await ProfessorRegistrationLink.sync({ force: false });
   console.log('✅ professor_registration_links table verified.');
   ```

   This replaces the entire existing migration `try/catch` block.

---

**File 2**: `server/models/ProfessorRegistrationRequest.js`

**Specific Changes**:

1. **Change `allowNull` on `national_id` from `false` to `true`**.

2. **Remove the `notEmpty` validator** from `national_id` (it is meaningless when the field is nullable and conflicts with null values).

3. **Keep the `is` regex validator** but it will only fire when a non-null value is provided (Sequelize skips validators for null when `allowNull: true`).

4. **Remove the `unique` constraint object** from `national_id` — or change it to allow multiple nulls. MySQL/MariaDB allows multiple NULL values in a UNIQUE column, so the unique index itself is fine; only the `allowNull: false` needs to change. Keep the unique constraint.

   ```javascript
   national_id: {
     type: DataTypes.STRING(14),
     allowNull: true,           // ← changed from false
     unique: {
       msg: 'الرقم القومي مستخدم بالفعل'
     },
     validate: {
       // notEmpty removed — field is optional
       is: {
         args: /^[0-9]{14}$/,
         msg: 'الرقم القومي يجب أن يكون 14 رقم'
       }
     }
   }
   ```

---

**File 3**: `server/migrations/create-professor-registration-requests.js` (or a new alter migration)

**Specific Changes**:

1. **Add an `ALTER TABLE` step** to change the `national_id` column from `NOT NULL` to `NULL` in the existing `professor_registration_requests` table. This is needed for databases where the table was already created with the old constraint.

   The cleanest approach is to add this as a new migration file (e.g., `server/migrations/alter-professor-registration-requests-national-id-nullable.js`) that calls `queryInterface.changeColumn(...)`, and invoke it in `startServer` using the same `sync`-style pattern (or inline in `startServer` with a fatal error on failure).

   ```javascript
   await queryInterface.changeColumn('professor_registration_requests', 'national_id', {
     type: DataTypes.STRING(14),
     allowNull: true,
     unique: true
   });
   ```

---

**File 4**: `server/controllers/professorRegistrationController.js`

**Specific Changes** (minor, defensive):

1. **Remove the duplicate national_id existence check for null**: The block `const existingNationalId = await User.findOne({ where: { national_id } })` will query `WHERE national_id = NULL` when `national_id` is null, which never matches any row in MySQL (should use `IS NULL`). Guard this check: only run it when `national_id` is truthy.

   ```javascript
   // Only check national_id uniqueness if one was provided
   if (national_id) {
     const existingNationalId = await User.findOne({ where: { national_id } });
     if (existingNationalId) { ... }
     const existingNationalIdRequest = await ProfessorRegistrationRequest.findOne({
       where: { national_id, status: { [Op.in]: ['pending', 'approved'] } }
     });
     if (existingNationalIdRequest) { ... }
   }
   ```

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate each bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate both bugs BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Write unit tests that simulate the failure conditions — a missing table (mock `ProfessorRegistrationLink.findOne` to throw `SequelizeDatabaseError`) and a null national_id POST — and assert that the unfixed code returns 500. Run these on the UNFIXED code to observe failures and confirm root causes.

**Test Cases**:

1. **Table-Missing GET Test**: Mock `ProfessorRegistrationLink.findOne` to throw `new Error('Table professor_registration_links doesn\'t exist')`. Call `validateProfessorLink` with a valid UUID token. Assert response is HTTP 500. (Will pass on unfixed code, confirming the bug.)

2. **Null National ID POST Test**: Call `registerProfessor` with `{ full_name: 'Dr. Test', email: 'test@test.com', password: 'password123' }` (no `national_id`) against the unfixed model. Assert response is HTTP 500 due to Sequelize validation error. (Will pass on unfixed code, confirming the bug.)

3. **Startup Migration Swallow Test**: Mock `createProfessorLinks` to throw an error. Assert that the unfixed `startServer` continues without re-throwing (i.e., the server starts despite the migration failure). (Confirms the silent-swallow behavior.)

**Expected Counterexamples**:
- `validateProfessorLink` returns 500 when the table is missing — confirmed by `SequelizeDatabaseError` in the catch block
- `registerProfessor` returns 500 when `national_id` is null — confirmed by `SequelizeValidationError: notEmpty on national_id`

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed code produces the expected behavior.

**Pseudocode:**
```
FOR ALL X WHERE isBugCondition(X) DO
  result := fixedHandler(X)
  ASSERT result.status ≠ 500
  IF X is GET register-link/:token AND table now exists THEN
    ASSERT result.status = 200 OR 404 OR 400 (domain errors, not server errors)
  IF X is POST register-link/:token AND national_id IS NULL THEN
    ASSERT result.status = 201
    ASSERT result.body.success = TRUE
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed code produces the same result as the original code.

**Pseudocode:**
```
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT originalHandler(X) = fixedHandler(X)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for valid token lookups, expired tokens, missing tokens, and full-form submissions with a valid national_id, then write property-based tests capturing that behavior.

**Test Cases**:

1. **Token Not Found Preservation**: Verify that a GET with a non-existent UUID token continues to return HTTP 404 with the Arabic error message after the fix.

2. **Expired Token Preservation**: Verify that a GET with an expired token continues to return HTTP 400 after the fix.

3. **Valid National ID Preservation**: Verify that a POST with a valid 14-digit `national_id` continues to be accepted and stored correctly after the fix.

4. **Admin Link Creation Preservation**: Verify that `POST /api/professor-registration/admin/links` continues to create links successfully after the fix.

5. **Admin Link Listing Preservation**: Verify that `GET /api/professor-registration/admin/links` continues to return the link list after the fix.

### Unit Tests

- Test `validateProfessorLink` with a mocked `ProfessorRegistrationLink.findOne` that throws a `SequelizeDatabaseError` — fixed code should not return 500 (table now exists, so this scenario should not occur; test that the sync step prevents it)
- Test `registerProfessor` with `national_id: null` — fixed model should accept the insert and return 201
- Test `registerProfessor` with `national_id: null` and a duplicate email — should still return 400 (not 500)
- Test `registerProfessor` with a valid 14-digit `national_id` — should continue to work as before
- Test `registerProfessor` with an invalid national_id format (e.g., `'abc'`) — should still return 400 with the format error message
- Test `startServer` migration block: mock `ProfessorRegistrationLink.sync` to throw — fixed code should propagate the error and call `process.exit(1)`

### Property-Based Tests

- Generate random valid UUID tokens and verify that `validateProfessorLink` never returns 500 when the table exists (Property 1)
- Generate random registration form payloads with `national_id` absent, null, or a valid 14-digit string, and verify that `registerProfessor` returns 201 for null/absent and 201 for valid, never 500 (Property 2)
- Generate random non-buggy inputs (valid tokens, expired tokens, missing tokens) and verify that responses match the original behavior (Property 3)

### Integration Tests

- Full flow: start server → create a professor registration link via admin API → visit the link via GET → submit the registration form without `national_id` → verify HTTP 201 and a pending request in the DB
- Full flow: start server → create a professor registration link → submit the form WITH a valid `national_id` → verify HTTP 201 and correct storage
- Startup test: verify that if `ProfessorRegistrationLink.sync` fails, the server does not start (process exits with code 1)
- Verify that all admin link management endpoints continue to work after the fix
