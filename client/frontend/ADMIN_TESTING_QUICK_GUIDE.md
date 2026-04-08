# Admin Dashboard Testing Guide - Automated Verification

## Environment Status
- ✅ Backend: Running on http://localhost:5000
- ✅ Frontend: Running on http://localhost:5173
- ✅ Admin Login: Working

## Quick Test Checklist

### 1. Login Flow Test
```bash
# Step 1: Open browser
http://localhost:5173/login

# Step 2: Enter credentials
Username: admin
Password: admin123

# Step 3: Verify redirect
Should redirect to http://localhost:5173/admin/dashboard
```

### 2. Admin Dashboard Pages

#### Dashboard Home
- URL: http://localhost:5173/admin/dashboard
- Should show: 6 feature cards (Courses, Professors, Grades, Pending, QR, Timetables)
- Expected: Welcome message with admin name

#### Courses Management
- URL: http://localhost:5173/admin/courses
- Features:
  - Click "Add Course" button
  - Fill form: Code, Name, Specialty, Credit Hours
  - Click Save
  - View table with courses
  - Edit/Delete buttons should work

#### Professors Management
- URL: http://localhost:5173/admin/professors
- Features:
  - Add Professor (Name, Email, Phone)
  - Assign Courses (multi-select modal appears)
  - Edit/Delete functionality

#### Grade Settings
- URL: http://localhost:5173/admin/grade-settings
- Features:
  - Show current grading scale
  - Update Pass/Merit/Distinction/MaxExam scores
  - Validation: Pass < Merit < Distinction
  - Save successful message

#### Pending Grades
- URL: http://localhost:5173/admin/pending-grades
- Features:
  - Show table of pending grades
  - Approve button → changes status to approved
  - Edit button → opens modal to modify scores
  - Reject button → prompts for reason

#### QR Code Generation
- URL: http://localhost:5173/admin/qr-code
- Features:
  - "Generate QR Code" button
  - Shows QR image
  - Download button works
  - Shows secret code and metadata

#### Timetables Management
- URL: http://localhost:5173/admin/timetables
- Features:
  - Upload PDF file
  - Shows table of uploaded timetables
  - Edit title or file
  - Delete functionality
  - File validation (PDF only, max 5MB)

### 3. API Endpoints Verification

All endpoints should be accessible with admin token:

```bash
# Get all courses
GET /api/admin/courses

# Get all professors
GET /api/admin/professors

# Get grade settings
GET /api/admin/grade-settings

# Get pending grades
GET /api/admin/grades/pending

# Generate QR Code
POST /api/admin/qr-code/generate

# Get timetables
GET /api/admin/timetables
```

## Manual Testing Steps

### Step 1: Login
1. Open http://localhost:5173/login
2. Enter username: **admin**
3. Enter password: **admin123**
4. Click Login
5. **Expected**: Redirect to /admin/dashboard

### Step 2: Verify Dashboard
1. You should see 6 cards:
   - Courses Management
   - Professors Management
   - Grade Settings
   - Pending Grades
   - QR Code
   - Timetables
2. Sidebar should show all 6 menu items
3. Top bar should show "Welcome, [admin name]"
4. Logout button should be present

### Step 3: Test Courses Page
1. Click "Courses" in sidebar
2. Click "+ Add Course"
3. Fill form:
   - Code: CS101
   - Name: Introduction to Programming
   - Specialty: Select one
   - Credit Hours: 3
4. Click Save
5. **Expected**: Course appears in table
6. Click Edit → modal shows data
7. Click Delete → removes course

### Step 4: Test Professors Page
1. Click "Professors" in sidebar
2. Click "+ Add Professor"
3. Fill form:
   - Name: Dr. Ahmed
   - Email: ahmed@nctu.edu
   - Phone: 0123456789
4. Click Save
5. **Expected**: Professor appears in table
6. Click "Assign Courses" → modal opens
7. Select 2-3 courses with checkboxes
8. Click Save → updates assignments

### Step 5: Test Grade Settings
1. Click "Settings" in sidebar
2. Update scores (Pass: 50, Merit: 65, Distinction: 75, Max: 100)
3. Verify: Pass < Merit < Distinction
4. Click Save
5. **Expected**: Success message shown

### Step 6: Test Pending Grades
1. Click "Pending" in sidebar
2. View pending grades table
3. Click "Approve" → status changes to approved
4. Click "Edit" → modal shows scores
5. Click "Reject" → enter reason

### Step 7: Test QR Codes
1. Click "QR Code" in sidebar
2. Click "Generate QR Code"
3. **Expected**: QR image appears with code
4. Click "Download" → saves image

### Step 8: Test Timetables
1. Click "Timetables" in sidebar
2. Click "+ Add Timetable"
3. Upload PDF file (max 5MB)
4. Click Save
5. **Expected**: File appears in table
6. Click filename → opens PDF in new tab

## Success Criteria

✅ All pages load without errors
✅ All forms submit successfully
✅ All data displays correctly in tables
✅ Sidebar navigation works
✅ Logout functionality works
✅ API calls complete successfully
✅ Error messages display for invalid inputs

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 404 on API calls | Ensure backend is running on :5000 |
| Form won't submit | Check all required fields are filled |
| Table is empty | Create sample data first |
| Page won't load | Clear browser cache, refresh |
| Sidebar won't expand | Check CSS is loaded properly |

## Next Steps After Testing

1. Fix any UI/UX issues identified during testing
2. Optimize performance if needed
3. Deploy to production
4. Set up monitoring and logging
5. Create user documentation
