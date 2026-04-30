# Implementation Plan

- [ ] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Professor Registration 500 Errors
  - **CRITICAL**: These tests MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior — they will validate the fix when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate both bugs exist
  - **Scoped PBT Approach**: Scope to the two concrete failing cases for reproducibility
  - **Scenario A — Table Missing:**
    - Mock `ProfessorRegistrationLink.findOne` to throw `new Error("Table 'professor_registration_links' doesn't exist")`
    - Call `validateProfessorLink` with a valid UUID token
    - Assert response status is NOT 500 (test will FAIL on unfixed code — confirms bug A)
    - Document counterexample: `GET /api/professor-registration/register-link/<uuid>` → HTTP 500 "حدث خطأ في الخادم"
  - **Scenario B — Null National ID:**
    - Call `registerProfessor` with `{ full_name: 'Dr. Test', email: 'test@test.com', password: 'password123' }` (no `national_id`)
    - Assert response status is 201 (test will FAIL on unfixed code — confirms bug B)
    - Document counterexample: `POST /api/professor-registration/register-link/<uuid>` with no `national_id` → HTTP 500 "حدث خطأ في الخادم"
  - **Scenario C — Silent Migration Swallow:**
    - Mock `createProfessorLinks` migration to throw an error
    - Assert that unfixed `startServer` re-throws (test will FAIL on unfixed code — confirms silent-swallow behavior)
    - Document counterexample: migration failure → server starts without `professor_registration_links` table
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bugs exist)
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Buggy Professor Registration Behaviors
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for all non-buggy inputs (cases where `isBugCondition` returns false)
  - **Observations to capture:**
    - `GET /api/professor-registration/register-link/<non-existent-uuid>` → HTTP 404 "رابط التسجيل غير صالح أو لم يتم إنشاؤه"
    - `GET /api/professor-registration/register-link/<expired-token>` → HTTP 400 "انتهت صلاحية رابط التسجيل"
    - `POST /api/professor-registration/register-link/<token>` with valid 14-digit `national_id` → HTTP 201
    - `POST /api/professor-registration/admin/links` → HTTP 201 with link token
    - `GET /api/professor-registration/admin/links` → HTTP 200 with links array
  - Write property-based tests: for all non-buggy inputs (table exists AND national_id is valid or request is not a registration POST), responses match observed behavior
  - Verify tests PASS on UNFIXED code (confirms baseline behavior to preserve)
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [-] 3. Fix professor registration 500 errors

  - [x] 3.1 Fix server.js — replace silent-swallow migration with fatal sync
    - Open `server/server.js` and locate the `startServer` function
    - Remove the entire `try/catch` block that calls `require('./migrations/create-professor-registration-links')` and swallows errors with `console.warn`
    - Add `const ProfessorRegistrationLink = require('./models/ProfessorRegistrationLink');` import (or use existing import if already present)
    - After `defineAssociations()` and before `app.listen`, add:
      ```javascript
      // Ensure professor_registration_links table exists (fatal if it fails)
      await ProfessorRegistrationLink.sync({ force: false });
      console.log('✅ professor_registration_links table verified.');
      ```
    - Let any failure propagate to the outer `catch` block in `startServer` (which already calls `process.exit(1)`)
    - _Bug_Condition: isBugCondition(X) where professor_registration_links_table_exists() = FALSE_
    - _Expected_Behavior: table exists before app.listen is called; startup failure is fatal_
    - _Preservation: server startup with healthy DB continues to succeed and log ✅ messages_
    - _Requirements: 2.2_

  - [x] 3.2 Fix ProfessorRegistrationRequest model — make national_id nullable
    - Open `server/models/ProfessorRegistrationRequest.js`
    - Change `national_id.allowNull` from `false` to `true`
    - Remove the `notEmpty` validator from `national_id` (it conflicts with null values)
    - Keep the `is` regex validator (`/^[0-9]{14}$/`) — Sequelize skips it automatically when the value is null and `allowNull: true`
    - Keep the `unique` constraint as-is (MySQL/MariaDB allows multiple NULLs in a UNIQUE column)
    - Result:
      ```javascript
      national_id: {
        type: DataTypes.STRING(14),
        allowNull: true,
        unique: { msg: 'الرقم القومي مستخدم بالفعل' },
        validate: {
          is: { args: /^[0-9]{14}$/, msg: 'الرقم القومي يجب أن يكون 14 رقم' }
        }
      }
      ```
    - _Bug_Condition: isBugCondition(X) where X.body.national_id IS NULL AND allowNull = FALSE_
    - _Expected_Behavior: ProfessorRegistrationRequest.create({ national_id: null }) succeeds; returns HTTP 201_
    - _Preservation: valid 14-digit national_id continues to be validated and stored correctly_
    - _Requirements: 2.3_

  - [x] 3.3 Add ALTER TABLE migration to relax DB-level NOT NULL constraint
    - Create new file `server/migrations/alter-professor-registration-requests-national-id-nullable.js`
    - Implement a migration that calls `queryInterface.changeColumn('professor_registration_requests', 'national_id', { type: DataTypes.STRING(14), allowNull: true, unique: true })`
    - Invoke this migration in `startServer` (inline, after the `ProfessorRegistrationLink.sync` call) with fatal error handling — let failures propagate to the outer `catch`
    - This handles databases where the table was already created with the old `NOT NULL` constraint
    - _Requirements: 2.3_

  - [x] 3.4 Fix controller — guard national_id uniqueness check against null
    - Open `server/controllers/professorRegistrationController.js`
    - Locate the `registerProfessor` function
    - Find the block that calls `User.findOne({ where: { national_id } })` and `ProfessorRegistrationRequest.findOne({ where: { national_id, ... } })`
    - Wrap both calls in an `if (national_id)` guard so they only execute when `national_id` is truthy:
      ```javascript
      if (national_id) {
        const existingNationalId = await User.findOne({ where: { national_id } });
        if (existingNationalId) { ... }
        const existingNationalIdRequest = await ProfessorRegistrationRequest.findOne({
          where: { national_id, status: { [Op.in]: ['pending', 'approved'] } }
        });
        if (existingNationalIdRequest) { ... }
      }
      ```
    - This prevents `WHERE national_id = NULL` SQL (which never matches) and avoids unexpected behavior
    - _Requirements: 2.3_

  - [ ] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Professor Registration 500 Errors Resolved
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    - Run all three scenarios from task 1 on the FIXED code
    - **EXPECTED OUTCOME**: All three tests PASS (confirms both bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Buggy Behaviors Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from task 2 on the FIXED code
    - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions)
    - Confirm: 404 for missing token, 400 for expired token, 201 for valid national_id, admin link creation and listing still work
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite for the professor registration module
  - Verify Property 1 (bug condition) tests pass — both bugs are fixed
  - Verify Property 2 (preservation) tests pass — no regressions introduced
  - Confirm server starts cleanly with `✅ professor_registration_links table verified.` in logs
  - Confirm a full end-to-end flow works: create link → GET link → POST registration without national_id → HTTP 201
  - Ensure all tests pass; ask the user if questions arise

- [x] 5. Fix student deletion 500 error
  - **Bug:** `DELETE /api/admin/students/:id` returns 500 because the student has related records in `grades`, `student_enrollments`, `payments`, `fee_invoices`, `student_qr_codes`, and `activity_logs` tables that violate FK constraints when the student is deleted directly
  - **Fix (already applied):** Updated `deleteStudent` in `server/controllers/studentController.js` to delete all child records first within the same transaction before deleting the student and user records
  - **Note:** Students registered via the registration form also have a linked `User` record and may have `RegistrationRequest` records — the fix handles all FK-constrained tables
  - Verify the fix by attempting to delete a student that has grades and enrollments — should return HTTP 200 "تم حذف الطالب بنجاح"
  - Verify that deleting a non-existent student still returns HTTP 404

- [x] 6. Add bulk grade approval and all-grades view for admin
  - **Feature:** Admin needs to view all student grades and approve them all at once instead of one by one
  - **Already implemented:**
    - `GET /api/grades/admin/all` — returns all grades with filters (status, course_id, specialty_id, academic_year_id, semester_id) and a summary count by status
    - `PUT /api/grades/admin/approve-all` — bulk approves all `pending_admin_approval` grades; supports filtering by `course_id`, `specialty_id`, `academic_year_id`, `semester_id`, or specific `grade_ids` array
  - Wire up the frontend admin grades page to use these new endpoints:
    - Add a "عرض جميع الدرجات" view that calls `GET /api/grades/admin/all`
    - Add an "اعتماد الكل" button that calls `PUT /api/grades/admin/approve-all` with current filter params
    - Show summary counts (pending / approved / total) at the top of the grades table
  - Verify `PUT /api/grades/admin/approve-all` returns 404 when no pending grades exist
  - Verify `PUT /api/grades/admin/approve-all` with `grade_ids` array approves only those specific grades
