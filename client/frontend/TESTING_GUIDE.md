# Admin Dashboard - Setup and Testing Guide

## 🚀 Quick Setup

### Prerequisites
- Node.js 14+ installed
- npm or yarn
- Backend server running on `http://localhost:5000`
- Admin user account created in the database

### Installation Steps

```bash
# Navigate to frontend directory
cd client/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔐 Admin Login

1. Go to `http://localhost:5173/login`
2. Enter admin credentials:
   - **Username:** `admin` (or your admin username)
   - **Password:** Your admin password
3. Click Login
4. You'll be redirected to the home page
5. Click on any "Admin" or gear icon to access the **Admin Dashboard**

**Direct Access:** `http://localhost:5173/admin/dashboard`

## 📋 Testing Checklist

### 1. Admin Layout & Navigation ✅

- [ ] Sidebar displays correctly with all menu items
- [ ] Sidebar icons visible (📚 📋 👨‍🏫 ⚙️ ✓ 📱 📅)
- [ ] Navigation links work and change pages
- [ ] Active page is highlighted in sidebar
- [ ] User name displayed in top bar
- [ ] Logout button works and returns to login
- [ ] Responsive design works on mobile (hamburger menu)
- [ ] Sidebar scrolls on mobile devices

### 2. Courses Management Page 📚

#### Display & Loading
- [ ] Courses load from API on page open
- [ ] Loading spinner appears while fetching
- [ ] All courses displayed in table format
- [ ] "Add New Course" button visible and clickable
- [ ] Empty state shows when no courses exist

#### Create Course
- [ ] Modal opens when clicking "Add New Course"
- [ ] Form has all required fields:
  - [ ] Course Code input
  - [ ] Course Name input
  - [ ] Specialty dropdown (populated from API)
  - [ ] Credit Hours input
  - [ ] Active checkbox
- [ ] Submit button disabled if required fields empty
- [ ] Success notification shown after creating
- [ ] New course appears in table immediately
- [ ] Modal closes after successful submission

#### Edit Course
- [ ] Click "Edit" button opens modal with pre-filled data
- [ ] All fields populated correctly
- [ ] Can modify any field
- [ ] Submit updates the course
- [ ] Success notification displayed
- [ ] Table updates with new values

#### Delete Course
- [ ] Click "Delete" shows confirmation dialog
- [ ] Canceling the dialog doesn't delete
- [ ] Confirming deletes the course
- [ ] Course removed from table immediately
- [ ] Success notification displayed

#### Validation
- [ ] Error shown if required fields missing
- [ ] Error notification displays for API errors
- [ ] Form clears after successful submission

### 3. Professors Management Page 👨‍🏫

#### Display
- [ ] All professors load and display in table
- [ ] Columns show: Name, Email, Phone, Assigned Courses
- [ ] "Add New Professor" button visible
- [ ] Professor count displayed

#### CRUD Operations
- [ ] Create new professor (same as courses)
- [ ] Edit professor information
- [ ] Delete professor with confirmation
- [ ] Form validation working

#### Assign Courses (Very Important!)
- [ ] "Assign Courses" button visible for each professor
- [ ] Modal shows available courses
- [ ] Courses displayed as checkboxes
- [ ] Previously assigned courses are pre-checked
- [ ] Can select/deselect multiple courses
- [ ] "Save Assignments" button working
- [ ] Success notification after assignment
- [ ] Assigned course count updates in table
- [ ] Can reassign courses to different professor

### 4. Grade Settings Page ⚙️

#### Display
- [ ] Current grade values shown as cards:
  - [ ] Pass (P) score displayed
  - [ ] Merit (M) score displayed
  - [ ] Distinction (D) score displayed
  - [ ] Max Final Exam score displayed
- [ ] Large, easy-to-read format
- [ ] Color-coded values

#### Update Settings
- [ ] All input fields editable
- [ ] Can modify any value
- [ ] Input validation shows errors:
  - [ ] All values must be positive
  - [ ] Pass < Merit < Distinction check
- [ ] Save button updates settings
- [ ] Success notification after saving
- [ ] Updated values reflect immediately
- [ ] Validation message: "Pass Score < Merit Score < Distinction Score"

#### Validation
- [ ] Error shown if Pass >= Merit
- [ ] Error shown if Merit >= Distinction
- [ ] Warning about value ordering displayed
- [ ] Cannot save invalid settings

### 5. Pending Grades Page ✓

#### Display
- [ ] All pending grades loaded from API
- [ ] Pending count badge displayed
- [ ] Table columns show:
  - [ ] Student Name
  - [ ] Course Name
  - [ ] Assignment 1 Score
  - [ ] Assignment 2 Score
  - [ ] Final Exam Score
  - [ ] Total Score (calculated)
  - [ ] Status (Pending)
- [ ] Empty state when all approved
- [ ] Green checkmark icon when done

#### Approve Grade
- [ ] Click "Approve" button
- [ ] Grade immediately changes status
- [ ] Disappears from pending list
- [ ] Success notification shown
- [ ] Confirmation in table

#### Reject Grade
- [ ] Click "Reject" button
- [ ] Prompt asks for rejection reason
- [ ] Grade rejected with reason recorded
- [ ] Removed from pending list
- [ ] Success notification shown

#### Edit Grade
- [ ] Click "Edit" opens modal
- [ ] Scores pre-filled correctly
- [ ] Can modify any score:
  - [ ] Assignment 1
  - [ ] Assignment 2
  - [ ] Final Exam
- [ ] Total score updates automatically
- [ ] Save updates the grades
- [ ] Grade remains pending after edit
- [ ] Can still approve after editing

### 6. QR Code Generation Page 📱

#### Generate QR Code
- [ ] "Generate New QR Code" button visible
- [ ] Click button fetches new QR code
- [ ] Loading state shows during generation
- [ ] QR code image displays after generation
- [ ] Can generate multiple times

#### QR Code Display
- [ ] QR Code image visible (300x300px)
- [ ] Crystal clear, scannable barcode
- [ ] QR Secret code displayed
- [ ] QR details shown:
  - [ ] QR Secret (alphanumeric code)
  - [ ] Status (Active/Inactive)
  - [ ] Generated At (timestamp)
  - [ ] Scan Count (number of scans)
- [ ] All info properly formatted

#### Download QR Code
- [ ] "Download QR Code" button works
- [ ] PNG image downloads to device
- [ ] File name includes timestamp
- [ ] Downloaded image is scannable
- [ ] Multiple downloads possible

#### Functionality
- [ ] New QR code has different secret
- [ ] Scan count updates on new code
- [ ] Status toggles correctly
- [ ] Error handling for API failures

### 7. Timetables Management Page 📅

#### Display & Loading
- [ ] Timetables load from API
- [ ] Table shows:
  - [ ] Title
  - [ ] Specialty Name
  - [ ] File Name (clickable link)
  - [ ] File Size (in KB)
  - [ ] Creation Date
- [ ] "Upload New Timetable" button visible
- [ ] Empty state when no timetables

#### Upload Timetable
- [ ] Modal opens with form
- [ ] Form fields:
  - [ ] Title input (required)
  - [ ] Specialty dropdown (required)
  - [ ] File input (PDF only, required)
- [ ] File upload accepts drag & drop
- [ ] File type validation:
  - [ ] Only PDF files accepted
  - [ ] Error for non-PDF files
- [ ] File size validation:
  - [ ] Accepts max 5MB
  - [ ] Error if > 5MB
- [ ] Selected file name displayed
- [ ] Upload button shows progress
- [ ] Success notification after upload
- [ ] New timetable appears in table
- [ ] File URL accessible

#### View Timetable
- [ ] Click file name opens PDF in new tab
- [ ] PDF previews/downloads correctly
- [ ] "View" button also opens PDF
- [ ] Works in all browsers

#### Edit Timetable
- [ ] Click "Edit" opens modal
- [ ] Current title pre-filled
- [ ] Current specialty pre-filled
- [ ] Can change title only
- [ ] Can replace PDF file
- [ ] Can keep same file (no upload)
- [ ] Help text: "Leave empty to keep current PDF"
- [ ] Save updates the record
- [ ] New file accessible after edit
- [ ] Success notification shown

#### Delete Timetable
- [ ] Click "Delete" shows confirmation
- [ ] Confirming removes from table
- [ ] File removed from server
- [ ] Success notification
- [ ] Cannot restore deleted timetable

#### Validation
- [ ] Error if title empty
- [ ] Error if specialty not selected
- [ ] Error if create without file
- [ ] API errors handled gracefully
- [ ] User-friendly error messages

### 8. Error Handling & Notifications

#### Success Notifications
- [ ] Green toast appears for successful actions
- [ ] Message is clear and specific
- [ ] Auto-dismisses after 3 seconds
- [ ] Can be manually closed

#### Error Notifications
- [ ] Red toast appears for errors
- [ ] Shows API error message or friendly message
- [ ] Auto-dismisses after 3 seconds
- [ ] User can take action

#### Network Errors
- [ ] Handles 400 errors gracefully
- [ ] Handles 401 (unauthorized) - redirect to login
- [ ] Handles 404 (not found) - shows message
- [ ] Handles 500 (server error) - shows message
- [ ] Connection timeout shows error
- [ ] Retry button or refresh works

### 9. Authentication & Authorization

#### Protected Routes
- [ ] Non-admin users cannot access `/admin/*`
- [ ] Redirect to login if not authenticated
- [ ] Redirect to home if not admin role
- [ ] Auth check on page load
- [ ] Token auto-injected in API calls
- [ ] 401 response logs out user

#### Session Management
- [ ] Token stored in localStorage
- [ ] User info available in sidebar
- [ ] Logout clears token and user
- [ ] Cannot access admin pages after logout
- [ ] Login again required after logout

### 10. Responsive Design

#### Desktop (1920px+)
- [ ] Full sidebar visible
- [ ] Multi-column tables
- [ ] All forms fully visible
- [ ] Optimal spacing

#### Tablet (768-1024px)
- [ ] Sidebar collapses/responsive
- [ ] Tables remain readable
- [ ] Forms adapt to width
- [ ] Touch-friendly buttons

#### Mobile (< 768px)
- [ ] Hamburger menu for navigation
- [ ] Stacked form layouts
- [ ] Scrollable tables
- [ ] Properly sized buttons
- [ ] All content accessible

### 11. Performance

- [ ] Pages load quickly (< 2s)
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] No lag during interactions
- [ ] Tables handle large datasets
- [ ] API calls use proper loading states

### 12. Browser Compatibility

Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

## 🧪 API Testing with Postman/cURL

### Test Courses Endpoint
```bash
# Get all courses
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/courses

# Create course
curl -X POST http://localhost:5000/api/admin/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code":"CS101",
    "name":"Programming Basics",
    "specialty_id":1,
    "credit_hours":3,
    "is_active":true
  }'
```

### Test Timetables Endpoint
```bash
# Upload timetable
curl -X POST http://localhost:5000/api/admin/timetables \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Fall 2024 Schedule" \
  -F "specialty_id=1" \
  -F "file=@/path/to/timetable.pdf"

# Get all timetables
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/timetables

# Get timetable by specialty
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/admin/timetables?specialty_id=1"
```

## 🐛 Common Test Scenarios

### Scenario 1: Complete Course Management Workflow
1. Login as admin
2. Navigate to Courses
3. Add new course with all fields
4. Verify course appears in table
5. Edit course title
6. Verify update successful
7. Delete course
8. Verify deletion

### Scenario 2: Professor-Course Assignment
1. Go to Professors
2. Add new professor
3. Click "Assign Courses"
4. Select 3-5 courses
5. Save assignments
6. Verify count updated
7. Click again to verify pre-selected
8. Deselect some courses
9. Save again
10. Verify updated assignments

### Scenario 3: Grade Approval Workflow
1. Verify pending grades display
2. Review grade scores
3. Edit one grade
4. Approve another grade
5. Reject one with reason
6. Verify all actions reflected
7. Verify pending count decreased

### Scenario 4: Timetable Upload Workflow
1. Go to Timetables
2. Try uploading non-PDF (should fail)
3. Try uploading >5MB file (should fail)
4. Upload valid PDF
5. Verify appears in table
6. Click to view/download
7. Edit timetable (change title)
8. Delete timetable
9. Create two for different specialties
10. Verify all working

### Scenario 5: QR Code Generation
1. Go to QR Code page
2. Generate code
3. Copy secret
4. Download image
5. Generate new code
6. Verify different secret
7. Verify scan count
8. Download multiple times

## 🔍 Developer Tools

### Enable React DevTools
- Install React Developer Tools extension
- Inspect component state
- Check props passed to components
- Monitor re-renders

### Browser Console
- No errors on page load
- Check API responses in Network tab
- Monitor performance
- Check localStorage for token

### VS Code Debugging
- Set breakpoints in code
- Use debugger: pause execution
- Inspect variables
- Step through code

## 📊 Sample Test Data

### Test Course
```json
{
  "code": "CS101",
  "name": "Introduction to Programming",
  "specialty_id": 1,
  "credit_hours": 3,
  "is_active": true
}
```

### Test Professor
```json
{
  "full_name": "Dr. Ahmed Mohamed",
  "email": "ahmed@nctu.edu",
  "phone": "01012345678"
}
```

### Test Grade Settings
```json
{
  "pass_score": 50,
  "merit_score": 70,
  "distinction_score": 85,
  "max_final_exam_score": 40
}
```

## ✅ Final Verification

Before deploying, verify:
- [ ] All CRUD operations work
- [ ] All validations work
- [ ] All error cases handled
- [ ] Responsive design perfect
- [ ] No console errors
- [ ] All API endpoints accessible
- [ ] Authentication working
- [ ] Authorization working
- [ ] File uploads working
- [ ] Notifications showing
- [ ] Navigation smooth
- [ ] Performance acceptable

## 📱 Mobile App Testing

For testing on actual mobile:
1. Get your computer's IP address
2. Access `http://YOUR_IP:5173` from phone
3. Login with admin account
4. Test all features on mobile
5. Check touch interactions
6. Verify responsive layout

## 🚀 Production Checklist

- [ ] Build passes without errors: `npm run build`
- [ ] All console warnings resolved
- [ ] Environment variables configured
- [ ] API base URL set to production
- [ ] CORS properly configured on backend
- [ ] Error logging configured
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Deployment ready

## 📞 Report Issues

If you find any issues:
1. Document the steps to reproduce
2. Take screenshots/videos
3. Check browser console for errors
4. Check network tab for failed requests
5. Report with all details

---

**Testing Status:** Ready for QA
**Last Updated:** April 7, 2026
