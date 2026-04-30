# Bugfix Requirements Document

## Introduction

When a user visits the professor registration page at `/register/professor/` with a valid registration link token (UUID), the server returns a **500 Internal Server Error** with the message "حدث خطأ في الخادم" instead of validating the link and returning the registration form data (specialties list, expiry date, etc.).

The affected endpoint is:
`GET /api/professor-registration/register-link/:token`

**Root Cause (identified via code investigation):**

The `professor_registration_links` table is created by a migration (`server/migrations/create-professor-registration-links.js`) that runs at server startup inside a `try/catch` block that silently swallows failures with only a non-fatal warning. If the migration fails for any reason (e.g., database permissions, prior partial run, or startup race condition), the table is never created. When `validateProfessorLink` subsequently calls `ProfessorRegistrationLink.findOne({ where: { token } })`, Sequelize throws a `SequelizeDatabaseError: Table 'professor_registration_links' doesn't exist`, which is caught by the outer error handler and returned as a 500 response.

A secondary issue exists in `registerProfessor`: the `ProfessorRegistrationRequest` Sequelize model defines `national_id` as `allowNull: false` with a strict 14-digit validator, but the controller attempts to insert `national_id: null` for link-based registrations where the field is optional. This causes a Sequelize validation error (500) when a professor submits the registration form without a national ID.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user visits `GET /api/professor-registration/register-link/:token` with a valid UUID token AND the `professor_registration_links` table does not exist in the database THEN the system throws a `SequelizeDatabaseError` and returns HTTP 500 with "حدث خطأ في الخادم"

1.2 WHEN the server starts up AND the `create-professor-registration-links` migration fails for any reason THEN the system silently swallows the error (logs only a non-fatal warning) and continues without the required table, leaving the endpoint permanently broken

1.3 WHEN a professor submits the registration form via `POST /api/professor-registration/register-link/:token` WITHOUT providing a `national_id` THEN the system attempts to insert `national_id: null` into the `professor_registration_requests` table which has a `NOT NULL` constraint, causing a Sequelize validation error and returning HTTP 500

### Expected Behavior (Correct)

2.1 WHEN a user visits `GET /api/professor-registration/register-link/:token` with a valid UUID token AND the `professor_registration_links` table exists THEN the system SHALL query the table, validate the token, and return HTTP 200 with `{ success: true, data: { valid: true, expires_at, specialties: [...] } }`

2.2 WHEN the server starts up AND the `create-professor-registration-links` migration is required THEN the system SHALL ensure the table is created reliably before the server begins accepting requests, and SHALL surface migration failures as fatal startup errors rather than silent warnings

2.3 WHEN a professor submits the registration form via `POST /api/professor-registration/register-link/:token` WITHOUT providing a `national_id` THEN the system SHALL accept the submission and store `national_id` as `NULL`, because `national_id` is optional for link-based professor registration

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user visits `GET /api/professor-registration/register-link/:token` with a token that does NOT exist in the database THEN the system SHALL CONTINUE TO return HTTP 404 with "رابط التسجيل غير صالح أو لم يتم إنشاؤه"

3.2 WHEN a user visits `GET /api/professor-registration/register-link/:token` with a token that has expired THEN the system SHALL CONTINUE TO return HTTP 400 with "انتهت صلاحية رابط التسجيل"

3.3 WHEN a professor submits the registration form WITH a valid `national_id` (14 digits) THEN the system SHALL CONTINUE TO validate the format and store it correctly

3.4 WHEN an admin creates a professor registration link via `POST /api/professor-registration/admin/links` THEN the system SHALL CONTINUE TO create and return the link token successfully

3.5 WHEN an admin views professor registration links via `GET /api/professor-registration/admin/links` THEN the system SHALL CONTINUE TO return the list of all links with their status

3.6 WHEN a professor submits a complete registration form with all required fields via `POST /api/professor-registration/register-link/:token` THEN the system SHALL CONTINUE TO create a pending registration request and return HTTP 201

---

## Bug Condition Pseudocode

**Bug Condition Function** — identifies inputs that trigger the 500 error:

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type HTTP Request to GET /api/professor-registration/register-link/:token
  OUTPUT: boolean

  // Bug is triggered when the table is missing (primary cause)
  RETURN professor_registration_links_table_exists() = FALSE
         OR (X.method = POST AND X.body.national_id IS NULL AND professor_registration_requests.national_id_column.allowNull = FALSE)
END FUNCTION
```

**Property: Fix Checking**
```pascal
FOR ALL X WHERE isBugCondition(X) DO
  result ← validateProfessorLink'(X)
  ASSERT result.status ≠ 500
  ASSERT result.body.message ≠ 'حدث خطأ في الخادم' (for table-missing case: table now exists)
  ASSERT result.body.message ≠ 'حدث خطأ في الخادم' (for null national_id case: field is nullable)
END FOR
```

**Property: Preservation Checking**
```pascal
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT validateProfessorLink(X) = validateProfessorLink'(X)
END FOR
```
