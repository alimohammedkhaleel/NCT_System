# 🧪 Admin Dashboard - Testing Instructions

## 📋 Pre-Testing Checklist

### 1. Verify Server is Running
```bash
# Check server health
curl http://localhost:5000/api/health

# Expected output:
# {"status":"OK","timestamp":"2026-04-13T..."}
```

### 2. Verify Frontend is Running
```bash
# Navigate to frontend
cd client/frontend

# Start dev server
npm run dev

# Should open on http://localhost:5173
```

### 3. Verify Database Connection
```bash
# Check server logs for:
# ✅ Database connection established successfully
# ✅ Model associations defined successfully
# ✅ Database tables synced successfully
```

---

## 🔬 Automated API Testing

### Run Postman Collection with Newman

```bash
# Install Newman globally (if not installed)
npm install -g newman

# Run the complete test suite
newman run .postman.json --env-var "base_url=http://localhost:5000"

# Expected Results:
# ┌─────────────────────────┬───────────────────┬──────────────────┐
# │                         │          executed │           failed │
# ├─────────────────────────┼───────────────────┼──────────────────┤
# │              iterations │                 1 │                0 │
# ├─────────────────────────┼───────────────────┼──────────────────┤
# │                requests │                20 │                0 │
# ├─────────────────────────┼───────────────────┼──────────────────┤
# │            test-scripts │                19 │                0 │
# ├─────────────────────────┼───────────────────┼──────────────────┤
# │      prerequest-scripts │                 1 │                0 │
# ├─────────────────────────┼───────────────────┼──────────────────┤
# │              assertions │                36 │                0 │
# └─────────────────────────┴───────────────────┴──────────────────┘
```

### Test Categories Covered
- ✅ Authentication (Admin & Student login)
- ✅ Specialties retrieval
- ✅ Courses retrieval
- ✅ CourseGradeConfig CRUD operations
- ✅ Student payment status & grades
- ✅ Registration links management
- ✅ Registration requests
- ✅ Import/Export grade configs

---

## 🖱️ Manual Frontend Testing

### Test 1: Admin Dashboard Page
**URL**: `http://localhost:5173/admin/dashboard`

**Login Credentials**:
- Username: `admin`
- Password: `admin123`

**Checklist**:
- [ ] Page loads without errors
- [ ] Sidebar is visible on the left
- [ ] Stats cards display (Students, Professors, Specialties, Pending Grades, Requests)
- [ ] Specialty cards display with icons and student counts
- [ ] Promotion cards display (Publish Results, Promote Semester, Promote Year)
- [ ] Management cards display (8 cards total)
- [ ] QR Code card is NOT present
- [ ] Clicking sidebar items navigates correctly
- [ ] Clicking dashboard cards navigates correctly
- [ ] Mobile toggle button appears on small screens
- [ ] Sidebar slides in/out on mobile

**Expected Stats**:
- Students: > 0
- Professors: > 0
- Specialties: 6
- Pending Grades: >= 0
- Pending Requests: >= 0

**Expected Specialties**:
1. 💻 تكنولوجيا المعلومات (ICT)
2. 🤖 الميكاترونكس (MCT)
3. 🚗 الأوتوترونكس (AUT)
4. ⚡ الطاقة المتجددة (REN)
5. 🛢️ تكنولوجيا البترول (OIL)
6. 🦾 الأطراف الصناعية (PRO)

**Expected Management Cards**:
1. 📚 إدارة المواد → `/admin/courses`
2. 👨‍🏫 إدارة الدكاترة → `/admin/professors`
3. 🎓 إدارة الطلاب → `/admin/students`
4. ⚙️ إعدادات الدرجات → `/admin/grade-settings`
5. ✅ الدرجات المعلقة → `/admin/pending-grades`
6. 📅 الجداول الدراسية → `/admin/timetables`
7. 🔗 روابط التسجيل → `/admin/registration-links`
8. 📋 طلبات التسجيل → `/admin/registration-requests`

---

### Test 2: Sidebar Navigation
**Starting Point**: Dashboard

**Checklist**:
- [ ] Click "الرئيسية" → Returns to dashboard
- [ ] Click "الدرجات المعلقة" → Navigates to pending grades
- [ ] Click "طلبات التسجيل" → Navigates to registration requests
- [ ] Click "إعدادات الدرجات" → Navigates to grade settings
- [ ] Click "الجداول" → Navigates to timetables
- [ ] Click each specialty → Navigates to specialty dashboard
- [ ] Active route is highlighted in sidebar
- [ ] Sidebar remains visible during navigation

---

### Test 3: Courses Page
**URL**: `http://localhost:5173/admin/courses`

**Checklist**:
- [ ] Page loads without errors
- [ ] Sidebar is visible
- [ ] Page uses purple theme colors
- [ ] Table displays courses
- [ ] Filter by specialty works
- [ ] "Create Course" button exists
- [ ] Edit button works for each course
- [ ] Delete button works for each course
- [ ] Confirmation dialog appears before delete
- [ ] Success/error messages display

**Test Create Course**:
1. Click "Create Course" button
2. Fill in form:
   - Specialty: Select one
   - Academic Year: Select one
   - Semester: Select one
   - Course Code: "TEST101"
   - Course Name: "Test Course"
   - Arabic Name: "مادة تجريبية"
   - Credit Hours: 3
3. Submit form
4. Verify course appears in list
5. Verify success message

**Test Edit Course**:
1. Click edit button on a course
2. Change course name
3. Submit form
4. Verify changes saved
5. Verify success message

**Test Delete Course**:
1. Click delete button on a course
2. Confirm deletion
3. Verify course removed from list
4. Verify success message

---

### Test 4: Professors Page
**URL**: `http://localhost:5173/admin/professors`

**Checklist**:
- [ ] Page loads without errors
- [ ] Sidebar is visible
- [ ] Page uses purple theme colors
- [ ] Table displays professors
- [ ] "Create Professor" button exists
- [ ] Edit button works
- [ ] Delete button works
- [ ] Assign course button works
- [ ] Remove course button works

**Test Create Professor**:
1. Click "Create Professor" button
2. Fill in form:
   - Username: "test_prof"
   - Email: "test@prof.com"
   - Password: "password123"
   - Full Name: "Test Professor"
   - Phone: "1234567890"
   - Department: "Computer Science"
   - Specialization: "AI"
3. Submit form
4. Verify professor appears in list

---

### Test 5: Students Page
**URL**: `http://localhost:5173/admin/students`

**Checklist**:
- [ ] Page loads without errors
- [ ] Sidebar is visible
- [ ] Page uses purple theme colors
- [ ] Table displays students
- [ ] Filter by specialty works
- [ ] "Create Student" button exists
- [ ] Edit button works
- [ ] Delete button works
- [ ] Promote button works

---

### Test 6: Grade Settings Page
**URL**: `http://localhost:5173/admin/grade-settings`

**Checklist**:
- [ ] Page loads without errors
- [ ] Sidebar is visible
- [ ] Page uses purple theme colors
- [ ] Table displays grade configs
- [ ] "Create Config" button exists
- [ ] Edit button works
- [ ] Delete button works
- [ ] Export button works
- [ ] Import button works
- [ ] Validation works (percentages must = 100%)

**Test Validation**:
1. Try to create config with percentages != 100%
2. Verify error message appears
3. Verify config is not created

---

### Test 7: Pending Grades Page
**URL**: `http://localhost:5173/admin/pending-grades`

**Checklist**:
- [ ] Page loads without errors
- [ ] Sidebar is visible
- [ ] Page uses purple theme colors
- [ ] Table displays pending grades
- [ ] Approve button works
- [ ] Reject button works
- [ ] Badge count in sidebar updates after approval/rejection

---

### Test 8: Timetables Page
**URL**: `http://localhost:5173/admin/timetables`

**Checklist**:
- [ ] Page loads without errors
- [ ] Sidebar is visible
- [ ] Page uses purple theme colors
- [ ] Filter by specialty works
- [ ] "Upload Timetable" button exists
- [ ] Upload form accepts PDF files
- [ ] View/Download button works
- [ ] Delete button works

---

### Test 9: Registration Links Page
**URL**: `http://localhost:5173/admin/registration-links`

**Checklist**:
- [ ] Page loads without errors
- [ ] Sidebar is visible
- [ ] Page uses purple theme colors
- [ ] Table displays registration links
- [ ] "Create Link" button exists
- [ ] Copy link button works
- [ ] Delete button works
- [ ] Expiry status displays correctly
- [ ] Active/Inactive status displays correctly

**Test Create Link**:
1. Click "Create Link" button
2. Set expiry days (e.g., 7)
3. Submit form
4. Verify link appears in list
5. Copy link and verify format: `http://localhost:5173/register/{token}`

---

### Test 10: Registration Requests Page
**URL**: `http://localhost:5173/admin/registration-requests`

**Checklist**:
- [ ] Page loads without errors
- [ ] Sidebar is visible
- [ ] Page uses purple theme colors
- [ ] Table displays registration requests
- [ ] Filter by status works
- [ ] Approve button works
- [ ] Reject button works
- [ ] Badge count in sidebar updates

---

### Test 11: Specialty Dashboard
**URL**: `http://localhost:5173/admin/specialty/ICT`

**Checklist**:
- [ ] Page loads without errors
- [ ] Sidebar is visible
- [ ] Page uses purple theme colors
- [ ] Specialty information displays
- [ ] Academic years display
- [ ] Courses display
- [ ] Students display
- [ ] Navigation back to dashboard works

---

### Test 12: Mobile Responsiveness

**Test on Mobile Screen Size** (< 1024px):
- [ ] Sidebar is hidden by default
- [ ] Mobile toggle button appears
- [ ] Clicking toggle opens sidebar
- [ ] Overlay appears behind sidebar
- [ ] Clicking overlay closes sidebar
- [ ] Sidebar slides in from right
- [ ] All pages are responsive
- [ ] Tables scroll horizontally if needed
- [ ] Cards stack vertically
- [ ] Buttons are touch-friendly

**Test Breakpoints**:
- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

---

### Test 13: Color Consistency

**Check on All Pages**:
- [ ] Background: Dark purple gradient
- [ ] Cards: Purple transparent with blur
- [ ] Borders: Purple (#b36eff)
- [ ] Text: White and white-dim
- [ ] Buttons: Purple gradient
- [ ] Hover effects: Purple glow
- [ ] Shadows: Purple glow
- [ ] Active states: Purple highlight

---

### Test 14: Error Handling

**Test Scenarios**:
1. **Network Error**:
   - Stop server
   - Try to load a page
   - Verify error message displays
   - Verify user-friendly message

2. **Validation Error**:
   - Submit form with invalid data
   - Verify validation messages display
   - Verify form doesn't submit

3. **Authorization Error**:
   - Try to access admin page without login
   - Verify redirect to login page

4. **404 Error**:
   - Navigate to non-existent route
   - Verify 404 page or redirect

---

## 📊 Test Results Template

### API Tests
```
Date: ___________
Tester: ___________

Newman Test Results:
- Total Requests: ___/20
- Total Assertions: ___/36
- Failed Tests: ___
- Pass Rate: ___%

Issues Found:
1. ___________
2. ___________
```

### Frontend Tests
```
Date: ___________
Tester: ___________
Browser: ___________

Pages Tested:
- [ ] Dashboard
- [ ] Courses
- [ ] Professors
- [ ] Students
- [ ] Grade Settings
- [ ] Pending Grades
- [ ] Timetables
- [ ] Registration Links
- [ ] Registration Requests
- [ ] Specialty Dashboard

Mobile Testing:
- [ ] Sidebar toggle works
- [ ] All pages responsive
- [ ] Touch interactions work

Issues Found:
1. ___________
2. ___________
```

---

## 🐛 Bug Report Template

```markdown
### Bug Report

**Title**: ___________

**Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low

**Page/Endpoint**: ___________

**Steps to Reproduce**:
1. ___________
2. ___________
3. ___________

**Expected Behavior**:
___________

**Actual Behavior**:
___________

**Screenshots**:
(Attach if applicable)

**Browser/Environment**:
- Browser: ___________
- OS: ___________
- Screen Size: ___________

**Additional Notes**:
___________
```

---

## ✅ Sign-Off Checklist

### Before Deployment
- [ ] All API tests passing (36/36)
- [ ] All frontend pages tested
- [ ] Mobile responsiveness verified
- [ ] Error handling tested
- [ ] Color consistency verified
- [ ] Performance acceptable
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Backup created

### Deployment Approval
- [ ] Product Owner: ___________
- [ ] Tech Lead: ___________
- [ ] QA Lead: ___________
- [ ] Date: ___________

---

**Last Updated**: 2026-04-13
**Version**: 1.0.0
