# API Endpoints Audit Report
**Date:** April 13, 2026  
**Project:** NCT System  

---

## Executive Summary

This report documents all API endpoints related to Timetables, Registration Requests, Grade Settings, and Student Registration. The audit found that **most endpoints exist but there is a critical routing issue with Timetables**.

### Key Finding: CRITICAL ROUTE MOUNTING ISSUE ⚠️
**Timetables routes are doubly prefixed, resulting in incorrect URL paths:**
- **Current (WRONG):** `/api/timetables/timetables`
- **Expected:** `/api/admin/timetables` or `/api/timetables`

---

## 1. TIMETABLES ENDPOINTS (admin/timetables routes)

### ✅ Routes Defined
**File:** [routes/timetableRoutes.js](routes/timetableRoutes.js)

| Endpoint | HTTP Method | Route Definition | Controller | Status | Issues |
|----------|------------|------------------|-----------|--------|--------|
| Get Student Timetable | GET | `/timetables/student` | `TimetableController.getTimetableById()` | ✅ Implemented | Routes mounted wrong: changes to `/api/timetables/timetables/student` |
| Get All Timetables | GET | `/timetables` | `timetableController.getAllTimetables()` | ✅ Implemented | Routes mounted wrong: changes to `/api/timetables/timetables` |
| Create Timetable | POST | `/timetables` | `timetableController.createTimetable()` | ✅ Implemented | Routes mounted wrong + requires file upload |
| Get Timetable by ID | GET | `/timetables/:id` | `timetableController.getTimetableById()` | ✅ Implemented | Routes mounted wrong: changes to `/api/timetables/timetables/:id` |
| Update Timetable | PUT | `/timetables/:id` | `timetableController.updateTimetable()` | ✅ Implemented | Routes mounted wrong + file upload |
| Delete Timetable | DELETE | `/timetables/:id` | `timetableController.deleteTimetable()` | ✅ Implemented | Routes mounted wrong |

### 📋 Controller Functions
**File:** [controllers/timetableController.js](controllers/timetableController.js)

- `createTimetable()` ✅ - Creates timetable with PDF upload
- `getAllTimetables()` ✅ - Fetches with optional specialty filter
- `getTimetableById()` ✅ - Retrieves single timetable
- `updateTimetable()` ✅ - Updates title and/or file
- `deleteTimetable()` ✅ - Deletes timetable and file

### 📦 Model
**File:** [models/Timetable.js](models/Timetable.js)

```javascript
Timetable {
  id: INTEGER PRIMARY KEY
  title: STRING (3-255 chars, required)
  specialty_id: INTEGER FK -> Specialty
  file_url: STRING (required)
  file_name: STRING (required)
  file_size: INTEGER
  created_by: INTEGER FK -> User (required)
  created_at: DATE
  updated_at: DATE
}
```

### 🔴 **CRITICAL ISSUE - Route Mounting Problem**

**Current Server Configuration** (server.js:111):
```javascript
app.use('/api/timetables', timetableRoutes);
```

**Routes in timetableRoutes.js:**
```javascript
router.get('/timetables', ...);
router.post('/timetables', ...);
router.get('/timetables/:id', ...);
```

**Result:** Routes are accessible at:
- `GET /api/timetables/timetables` ❌
- `POST /api/timetables/timetables` ❌
- `GET /api/timetables/timetables/:id` ❌

**Fix Required:** Change server.js line 111 to:
```javascript
app.use('/api/admin', timetableRoutes);
```

---

## 2. REGISTRATION REQUESTS ENDPOINTS (admin/registration-requests routes)

### ✅ Routes Defined
**File:** [routes/adminRoutes.js](routes/adminRoutes.js)

| Endpoint | HTTP Method | Function Name | Status | Auth | Issues |
|----------|------------|---------------|--------|------|--------|
| Get All Registration Requests | GET | `getRegistrationRequests` | ✅ Implemented | Admin | None known |
| Approve Registration Request | POST | `approveRegistrationRequest` | ✅ Implemented | Admin | None known |
| Reject Registration Request | POST | `rejectRegistrationRequest` | ✅ Implemented | Admin | None known |

### 📋 Detailed Routes

**File:** [routes/adminRoutes.js](routes/adminRoutes.js) (Lines 84-88)

```javascript
router.get('/registration-requests', getRegistrationRequests);
router.post('/registration-requests/:id/approve', approveRegistrationRequest);
router.post('/registration-requests/:id/reject', rejectRegistrationRequest);
```

**Mount Point:** `/api/admin` (server.js:109)

**Actual Endpoints:**
- `GET /api/admin/registration-requests` ✅
- `POST /api/admin/registration-requests/:id/approve` ✅
- `POST /api/admin/registration-requests/:id/reject` ✅

### 📋 Controller Functions
**File:** [controllers/adminController.js](controllers/adminController.js)

| Function | Lines | Implementation Status |
|----------|-------|----------------------|
| `getRegistrationRequests()` | 1096-1123 | ✅ Complete - Fetches with status filter, includes Specialty |
| `approveRegistrationRequest()` | 1125-1200 | ✅ Complete - Creates User & Student, generates credentials |
| `rejectRegistrationRequest()` | 1203-1240 | ✅ Complete - Updates status, stores rejection reason |

### 📦 Model
**File:** [models/RegistrationRequest.js](models/RegistrationRequest.js)

```javascript
RegistrationRequest {
  id: INTEGER PRIMARY KEY
  full_name: STRING (required)
  national_id: STRING (14, unique, required)
  birth_date: DATEONLY
  gender: ENUM('male','female')
  email: STRING (unique, required)
  phone: STRING (required)
  address: TEXT
  specialty_id: INTEGER FK -> Specialty
  link_token: UUID
  status: ENUM('pending','approved','rejected') DEFAULT 'pending'
  reviewed_by: INTEGER FK -> User
  reviewed_at: DATE
  rejection_reason: TEXT
  created_user_id: INTEGER FK -> User
  created_at: DATE
  updated_at: DATE
}
```

### ✅ Implementation Status: COMPLETE
All endpoints implemented and mounted correctly at `/api/admin`.

---

## 3. GRADE SETTINGS ENDPOINTS (admin/grade-settings routes)

### ✅ Routes Defined
**File:** [routes/extendedAdminRoutes.js](routes/extendedAdminRoutes.js)

| Endpoint | HTTP Method | Function Name | Status | Issues |
|----------|------------|---------------|--------|--------|
| Get All Grade Settings | GET | `getAllGradeSettings` | ✅ Implemented | None known |
| Get Single Grade Setting | GET | `getGradeSetting` | ✅ Implemented | None known |
| Update Grade Setting | PUT | `updateGradeSetting` | ✅ Implemented | Requires validation |
| Initialize Default Settings | POST | `initializeGradeSettings` | ✅ Implemented | One-time setup only |

### 📋 Detailed Routes

**File:** [routes/extendedAdminRoutes.js](routes/extendedAdminRoutes.js) (Lines 162-199)

```javascript
router.get('/grade-settings', extendedAdminController.getAllGradeSettings);
router.get('/grade-settings/:name', extendedAdminController.getGradeSetting);
router.put('/grade-settings/:name', validateGradeSettingUpdate, extendedAdminController.updateGradeSetting);
router.post('/grade-settings/initialize', extendedAdminController.initializeGradeSettings);
```

**Mount Point:** `/api/admin` (server.js:110)

**Actual Endpoints:**
- `GET /api/admin/grade-settings` ✅
- `GET /api/admin/grade-settings/:name` ✅ (e.g., `pass_grade_value`)
- `PUT /api/admin/grade-settings/:name` ✅
- `POST /api/admin/grade-settings/initialize` ✅

### 📋 Controller Functions
**File:** [controllers/extendedAdminController.js](controllers/extendedAdminController.js)

| Function | Lines | Implementation Status |
|----------|-------|----------------------|
| `getAllGradeSettings()` | 366-380 | ✅ Complete |
| `getGradeSetting()` | 387-410 | ✅ Complete |
| `updateGradeSetting()` | 416-438 | ✅ Complete |
| `initializeGradeSettings()` | 442-459 | ✅ Complete |

### 📦 Model
**File:** [models/GradeSetting.js](models/GradeSetting.js)

```javascript
GradeSetting {
  id: INTEGER PRIMARY KEY
  setting_name: STRING (100, unique, required)
  setting_value: DECIMAL(10,2) (required)
  description: TEXT
  setting_type: ENUM('grade_value','max_score','other')
  updated_by: INTEGER FK -> User
  created_at: DATE
  updated_at: DATE
}
```

### ✅ Implementation Status: COMPLETE
All endpoints implemented and mounted correctly at `/api/admin`.

### Expected Settings (from initialization):
- `pass_grade_value` = 20
- `merit_grade_value` = 30
- `distinction_grade_value` = 40
- `max_final_exam` = 150
- `max_total_score` = 200
- Grade brackets for letter grades (A, B, C, D, F)

---

## 4. STUDENT REGISTRATION ENDPOINTS (auth/register-link routes)

### ✅ Routes Defined
**File:** [routes/authRoutes.js](routes/authRoutes.js)

| Endpoint | HTTP Method | Handler | Status | Auth | Notes |
|----------|------------|---------|--------|------|-------|
| Validate Registration Link | GET | Inline handler | ✅ Implemented | None | Gets link validity & specialties |
| Submit Registration Request | POST | Inline handler | ✅ Implemented | None | Creates RegistrationRequest record |

### 📋 Detailed Routes

**File:** [routes/authRoutes.js](routes/authRoutes.js) (Lines 61-104)

```javascript
// GET /api/auth/register-link/:token — validate link and return specialties
router.get('/register-link/:token', async (req, res) => {...});

// POST /api/auth/register-link/:token — submit registration request
router.post('/register-link/:token', async (req, res) => {...});
```

**Mount Point:** `/api/auth` (server.js:108)

**Actual Endpoints:**
- `GET /api/auth/register-link/:token` ✅
- `POST /api/auth/register-link/:token` ✅

### 📋 Implementation Details

#### GET /api/auth/register-link/:token
**Purpose:** Validate registration link and retrieve available specialties

**Request:**
```javascript
GET /api/auth/register-link/12345-token-uuid
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "expires_at": "2026-04-20T10:00:00.000Z",
    "specialties": [
      {
        "id": 1,
        "code": "CS",
        "name": "Computer Science",
        "arabic_name": "علوم الحاسب"
      },
      {...}
    ]
  }
}
```

**Response (Invalid - 404/400):**
```json
{
  "success": false,
  "message": "رابط غير صالح" | "تم استخدام هذا الرابط من قبل" | "انتهت صلاحية الرابط"
}
```

#### POST /api/auth/register-link/:token
**Purpose:** Submit student registration request via link

**Request Body:**
```json
{
  "full_name": "Ahmed Mohamed",
  "national_id": "12345678901234",
  "email": "ahmed@example.com",
  "phone": "01012345678",
  "specialty_id": 1
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "تم إرسال طلبك بنجاح، انتظر موافقة الإدارة"
}
```

**Validation:**
- Link must exist and not be used
- Link must not be expired
- All fields are required (full_name, national_id, email, specialty_id)
- Checks for duplicate national_id with pending status
- Marks link as used after successful submission

### ✅ Implementation Status: COMPLETE
Both endpoints implemented and mounted correctly at `/api/auth`.

---

## 5. REGISTRATION LINK CREATION (admin/registration-links routes)

### ✅ Routes Defined
**File:** [routes/adminRoutes.js](routes/adminRoutes.js)

| Endpoint | HTTP Method | Function Name | Status | Auth | Issues |
|----------|------------|---------------|--------|------|--------|
| Create Registration Link | POST | `createRegistrationLink` | ✅ Implemented | Admin | None known |
| Get All Registration Links | GET | `getRegistrationLinks` | ✅ Implemented | Admin | None known |

### 📋 Detailed Routes

**File:** [routes/adminRoutes.js](routes/adminRoutes.js) (Lines 84-85)

```javascript
router.post('/registration-links', createRegistrationLink);
router.get('/registration-links', getRegistrationLinks);
```

**Mount Point:** `/api/admin` (server.js:109)

**Actual Endpoints:**
- `POST /api/admin/registration-links` ✅
- `GET /api/admin/registration-links` ✅

### 📋 Controller Functions
**File:** [controllers/adminController.js](controllers/adminController.js)

| Function | Lines | Implementation Status |
|----------|-------|----------------------|
| `createRegistrationLink()` | 1030-1061 | ✅ Complete |
| `getRegistrationLinks()` | 1064-1093 | ✅ Complete |

### 📦 Model
**File:** [models/RegistrationLink.js](models/RegistrationLink.js)

```javascript
RegistrationLink {
  id: INTEGER PRIMARY KEY
  token: UUID (unique, required)
  expires_at: DATE (required)
  is_used: BOOLEAN DEFAULT false
  created_by: INTEGER FK -> User (required)
  used_by: INTEGER FK -> User
  used_at: DATE
  created_at: DATE
  updated_at: DATE
}
```

### ✅ Implementation Status: COMPLETE
Both endpoints implemented and mounted correctly at `/api/admin`.

---

## Summary Table: All Endpoints Status

| Category | Endpoint | HTTP | Route Prefix | Mount Point | Status | Issues |
|----------|----------|------|--------------|------------|--------|---------|
| **TIMETABLES** | List Timetables | GET | `/timetables` | `/api/timetables` | ✅ Impl | ⚠️ **WRONG MOUNT** |
| | Create Timetable | POST | `/timetables` | `/api/timetables` | ✅ Impl | ⚠️ **WRONG MOUNT** |
| | Get Timetable | GET | `/timetables/:id` | `/api/timetables` | ✅ Impl | ⚠️ **WRONG MOUNT** |
| | Update Timetable | PUT | `/timetables/:id` | `/api/timetables` | ✅ Impl | ⚠️ **WRONG MOUNT** |
| | Delete Timetable | DEL | `/timetables/:id` | `/api/timetables` | ✅ Impl | ⚠️ **WRONG MOUNT** |
| **REG LINKS** | Create Link | POST | `/registration-links` | `/api/admin` | ✅ Impl | None |
| | Get Links | GET | `/registration-links` | `/api/admin` | ✅ Impl | None |
| **REG REQUESTS** | List Requests | GET | `/registration-requests` | `/api/admin` | ✅ Impl | None |
| | Approve Request | POST | `/registration-requests/:id/approve` | `/api/admin` | ✅ Impl | None |
| | Reject Request | POST | `/registration-requests/:id/reject` | `/api/admin` | ✅ Impl | None |
| **GRADE SETTINGS** | List Settings | GET | `/grade-settings` | `/api/admin` | ✅ Impl | None |
| | Get Setting | GET | `/grade-settings/:name` | `/api/admin` | ✅ Impl | None |
| | Update Setting | PUT | `/grade-settings/:name` | `/api/admin` | ✅ Impl | Validation required |
| | Initialize | POST | `/grade-settings/initialize` | `/api/admin` | ✅ Impl | One-time setup |
| **AUTH/REGISTER** | Validate Link | GET | `/register-link/:token` | `/api/auth` | ✅ Impl | None |
| | Submit Request | POST | `/register-link/:token` | `/api/auth` | ✅ Impl | None |

---

## Issues Found

### 🔴 Critical Issues

1. **Timetable Route Mounting (CRITICAL)**
   - **Problem:** Routes are mounted at `/api/timetables` with `/timetables` prefix in route definitions
   - **Result:** URLs become `/api/timetables/timetables` instead of `/api/timetables`
   - **Location:** [server.js](server.js#L111)
   - **Fix:** Change to mount at `/api/admin` to align with other admin routes

### ⚠️ Potential Issues

2. **Timetable File Upload**
   - Routes expect file uploads via multer middleware
   - Ensure frontend is sending files correctly with `multipart/form-data`
   - Check multer configuration in [config/multer.js](config/multer.js)

3. **Grade Settings Validation**
   - When updating settings, ensure validation middleware is functioning
   - Check [middleware/validators.js](middleware/validators.js) for `validateGradeSettingUpdate`

4. **Registration Link Expiration**
   - Links are checked against `expires_at` on each request
   - Ensure system time is synchronized for accurate validation

5. **Authentication Requirements**
   - All admin routes require `authenticateToken` and `authorizeRoles('admin')`
   - Auth routes don't require authentication
   - Verify middleware is properly enforcing these rules

---

## Recommendations

1. **Fix Timetable Routes (URGENT)**
   ```javascript
   // Current (WRONG):
   app.use('/api/timetables', timetableRoutes);
   
   // Should be ONE of:
   // Option A: Mount at /api/admin
   app.use('/api/admin', timetableRoutes);
   
   // Option B: Remove /timetables prefix from routes and mount at /api
   // (requires modifying timetableRoutes.js)
   app.use('/api', timetableRoutes);
   ```

2. **Test All Registration Endpoints**
   - Create registration link
   - Validate link
   - Submit registration request
   - Approve request
   - Verify user and student accounts created

3. **Test Grade Settings**
   - Initialize default settings (Should be one-time)
   - Update individual settings
   - Verify values persist in database

4. **Test Timetable Routes Once Fixed**
   - Upload PDF files
   - Retrieve by specialty
   - Update and delete operations

5. **Add Missing Database Models Exports**
   - Ensure RegistrationLink and RegistrationRequest are exported from [config/models.js](config/models.js)

---

## Database Dependencies

All endpoints require these models to be properly initialized:
- ✅ User
- ✅ Specialty
- ✅ Timetable
- ✅ RegistrationLink
- ✅ RegistrationRequest
- ✅ GradeSetting
- ✅ Student

All models are defined and their associations are configured in [config/models.js](config/models.js).

---

## API Testing Checklist

- [ ] Fix Timetable route mounting
- [ ] Test: Create registration link
- [ ] Test: Validate registration link
- [ ] Test: Submit registration request via link
- [ ] Test: Get all registration requests
- [ ] Test: Approve registration request
- [ ] Test: Reject registration request
- [ ] Test: Get all grade settings
- [ ] Test: Get single grade setting
- [ ] Test: Update grade setting
- [ ] Test: Initialize grade settings
- [ ] Test: List timetables (after route fix)
- [ ] Test: Create timetable with file (after route fix)
- [ ] Test: Get timetable by ID (after route fix)
- [ ] Test: Update timetable (after route fix)
- [ ] Test: Delete timetable (after route fix)

---

**Generated:** April 13, 2026  
**Status:** Ready for Implementation
