د# Admin Dashboard - Complete Frontend Implementation

## 📋 Overview

A complete React 18 + Vite Admin Dashboard for the NCTU ERP system with full CRUD operations for courses, professors, grades, QR codes, and timetables.

## ✨ Features Implemented

### 1. **Courses Management** 📚
- View all courses in a sortable table
- Add new course (modal form)
- Edit existing courses
- Delete courses (soft delete)
- Filter by specialty
- Real-time validation
- Status indicator (Active/Inactive)

**API Endpoints Used:**
```
GET    /api/admin/courses
POST   /api/admin/courses
PUT    /api/admin/courses/:id
DELETE /api/admin/courses/:id
```

### 2. **Professors Management** 👨‍🏫
- Display all professors with contact information
- Add new professor
- Edit professor details
- Delete professors
- **Assign courses to professors** (multi-select dropdown)
- View assigned course count
- Manage course assignments

**API Endpoints Used:**
```
GET    /api/admin/professors
POST   /api/admin/professors
PUT    /api/admin/professors/:id
DELETE /api/admin/professors/:id
POST   /api/admin/professors/:id/assign-courses
GET    /api/admin/professors/:id/courses
```

### 3. **Grade Settings** ⚙️
- Display current grading scale:
  - Pass (P) Score
  - Merit (M) Score
  - Distinction (D) Score
  - Max Final Exam Score
- Update all values with validation
- Visual representation of current values
- Input validation (Pass < Merit < Distinction)
- Live grade scale display

**API Endpoints Used:**
```
GET /api/admin/grade-settings
PUT /api/admin/grade-settings
```

### 4. **Pending Grade Approvals** ✓
- View all pending grades (status: pending_admin_approval)
- Detailed grade information:
  - Student name
  - Course name
  - Assignment 1 & 2 scores
  - Final exam score
  - Total score
- **Actions:**
  - Approve grade
  - Edit scores
  - Reject with reason
- Status badges
- Pending counter

**API Endpoints Used:**
```
GET    /api/admin/grades/pending
PUT    /api/admin/grades/:id
POST   /api/admin/grades/:id/approve
POST   /api/admin/grades/:id/reject
```

### 5. **QR Code Generation** 📱
- Generate unique student QR codes
- Display QR code image
- Show QR secret code
- Track scan count
- Display generation timestamp
- Download QR code as image
- Generate new codes anytime
- QR code status tracking

**API Endpoints Used:**
```
POST /api/admin/qr/generate
```

### 6. **Timetables Management** 📅 (NEW FEATURE)
- Upload PDF timetables for each specialty
- Display timetables in organized table
- View/download PDF files
- Edit timetable (title + file)
- Delete timetables
- File validation (PDF only, max 5MB)
- Specialty filtering
- File size display
- Upload progress indication

**API Endpoints Used:**
```
GET    /api/admin/timetables
POST   /api/admin/timetables
PUT    /api/admin/timetables/:id
DELETE /api/admin/timetables/:id
```

## 🏗️ Project Structure

```
client/frontend/src/
├── pages/
│   ├── Login.jsx                      (Existing Login Page)
│   ├── Home.jsx                       (Existing Home Page)
│   ├── admin/
│   │   ├── AdminDashboard.jsx         (Admin Home with Card Links)
│   │   ├── CoursesPage.jsx            (Courses CRUD)
│   │   ├── ProfessorsPage.jsx         (Professors CRUD + Course Assignment)
│   │   ├── GradeSettingsPage.jsx      (Grade Configuration)
│   │   ├── PendingGradesPage.jsx      (Grade Approval)
│   │   ├── QRCodePage.jsx             (QR Code Generation)
│   │   ├── TimetablesPage.jsx         (Timetable PDF Management)
│   │   └── CoursesPage.module.css     (Shared Styles)
│
├── components/
│   ├── admin/
│   │   ├── AdminLayout.jsx            (Main Layout with Sidebar)
│   │   ├── AdminLayout.module.css     (Layout Styles)
│   │   └── ProtectedRoute.jsx         (Admin Route Protection)
│   │
│   ├── common/
│   │   ├── Modal.jsx                  (Reusable Modal Component)
│   │   ├── Modal.module.css
│   │   ├── Table.jsx                  (Reusable Table Component)
│   │   ├── Table.module.css
│   │   ├── Notification.jsx           (Toast Notifications)
│   │   ├── Notification.module.css
│   │   ├── LoadingSpinner.jsx         (Loading Indicator)
│   │   └── LoadingSpinner.module.css
│   │
│   └── ProtectedRoute.jsx             (Updated with role check)
│
├── services/
│   └── apiService.js                  (Axios API Integration)
│
├── context/
│   └── AuthContext.jsx                (Existing Auth Context)
│
└── App.jsx                            (Updated with Admin Routes)
```

## 🔌 API Service Layer

**File:** `src/services/apiService.js`

Comprehensive axios integration with:
- Automatic JWT token injection
- Base URL configuration
- Interceptors for error handling
- Organized API methods by resource:
  - `coursesAPI`
  - `professorsAPI`
  - `gradeSettingsAPI`
  - `gradesAPI`
  - `qrCodeAPI`
  - `timetablesAPI`
  - `specialtiesAPI`

```javascript
import { coursesAPI, professorsAPI, gradeSettingsAPI } from '../../services/apiService';

// Usage
const courses = await coursesAPI.getAll();
const professors = await professorsAPI.create(data);
```

## 🎨 UI Components

### Modal Component
```jsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Add New Course"
  size="medium"
  footer={<div>Footer content</div>}
>
  {children}
</Modal>
```

### Table Component
```jsx
<Table
  columns={[
    { key: 'name', label: 'Course Name' },
    { key: 'code', label: 'Code' }
  ]}
  data={courses}
  actions={[
    {
      label: 'Edit',
      onClick: (row) => handleEdit(row),
      variant: 'primary'
    }
  ]}
/>
```

### Notification Component
```jsx
<Notification message="Success!" type="success" />
<Notification message="Error occurred" type="error" />
```

## 🔐 Security Features

✅ **Authentication:** JWT token-based auth
✅ **Authorization:** Admin-only routes with `requiredRole="admin"`
✅ **Token Management:** Automatic token injection in all requests
✅ **Protected Routes:** ProtectedRoute wrapper component
✅ **Session Management:** Auto-logout on 401 response
✅ **Input Validation:** Form validation on client side
✅ **File Validation:** PDF-only upload with size limits (5MB)
✅ **CORS:** Properly configured for API gateway

## 📱 Responsive Design

All pages are fully responsive:
- Mobile-first approach
- Sidebar collapses on mobile
- Tables become scrollable on small screens
- Forms stack vertically on mobile
- Touch-friendly buttons and inputs
- CSS Module organization for scoped styles

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd client/frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access Admin Dashboard
```
http://localhost:5173/admin/dashboard
```

### 4. Login as Admin
Required user type: `admin`

## 📝 Usage Examples

### Add New Course
1. Navigate to **Courses** from sidebar
2. Click **"+ Add New Course"**
3. Fill in form:
   - Course Code (e.g., CS101)
   - Course Name
   - Select Specialty
   - Credit Hours
   - Mark as Active
4. Click **Create**

### Assign Courses to Professor
1. Go to **Professors** page
2. Click **"Assign Courses"** next to professor
3. Select courses using checkboxes
4. Click **"Save Assignments"**

### Update Grade Settings
1. Navigate to **Grade Settings**
2. Modify values:
   - Pass Score
   - Merit Score
   - Distinction Score
   - Max Final Exam Score
3. Click **"Save Changes"**
4. Validation ensures: Pass < Merit < Distinction

### Approve/Reject Grades
1. Go to **Pending Grades**
2. Review grade details
3. Choose action:
   - **Edit:** Modify scores before approval
   - **Approve:** Accept the grade
   - **Reject:** Decline with reason
4. Grade status updates automatically

### Generate QR Code
1. Navigate to **QR Code**
2. Click **"Generate New QR Code"**
3. QR code displays with:
   - Image preview
   - Secret code
   - Scan count
   - Status
4. Click **"Download QR Code"** to save image

### Manage Timetables
1. Go to **Timetables**
2. **Upload:**
   - Click **"+ Upload New Timetable"**
   - Enter title
   - Select specialty
   - Select PDF file (max 5MB)
   - Click **Upload**
3. **View:** Click PDF filename in table
4. **Edit:** Click **Edit** to change title/file
5. **Delete:** Click **Delete** to remove

## 🛠️ Development Notes

### Adding New Admin Page

1. Create new page component:
```jsx
// src/pages/admin/NewPage.jsx
import { useState, useEffect } from 'react';
import styles from './CoursesPage.module.css'; // Reuse styles

export default function NewPage() {
  // Component logic
}
```

2. Create API methods in `apiService.js`:
```javascript
export const newResourceAPI = {
  getAll: () => api.get('/admin/new-resource'),
  create: (data) => api.post('/admin/new-resource', data),
  // ... more methods
};
```

3. Import page in `App.jsx`:
```jsx
import NewPage from './pages/admin/NewPage';
```

4. Add route:
```jsx
<Route path="new-page" element={<NewPage />} />
```

5. Add sidebar navigation in `AdminLayout.jsx`:
```jsx
{ path: '/admin/new-page', label: 'New Feature', icon: '📌' }
```

### CSS Module Usage

```jsx
import styles from './MyComponent.module.css';

export default function MyComponent() {
  return <div className={styles.container}>Content</div>;
}
```

All styles are scoped to the component automatically.

## 🐛 Error Handling

All pages include:
- Try-catch blocks for API errors
- User-friendly error messages
- Loading states during API calls
- Toast notifications for feedback
- Validation before submission

```javascript
try {
  await coursesAPI.create(formData);
  showNotification('Course created successfully', 'success');
} catch (error) {
  showNotification(error.response?.data?.message || 'Error', 'error');
}
```

## 📊 Performance Optimizations

- React 18 concurrent rendering
- CSS Modules for scoped styles
- Lazy component loading via routes
- Efficient state management
- Minimal re-renders with proper dependencies
- Table pagination ready (for future)

## 🔄 State Management

**Current:** React hooks (useState, useEffect)
**Future:** Redux or Zustand for complex state

```javascript
const [courses, setCourses] = useState([]);
const [loading, setLoading] = useState(true);
const [notification, setNotification] = useState(null);
```

## 📚 API Integration Examples

### Fetch and Display Data
```javascript
useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    const res = await coursesAPI.getAll();
    setCourses(res.data.data || []);
  } catch (error) {
    showNotification('Error loading data', 'error');
  }
};
```

### Create with Form Data
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await coursesAPI.create(formData);
    showNotification('Created successfully', 'success');
    fetchData();
  } catch (error) {
    showNotification('Error creating', 'error');
  }
};
```

### File Upload with FormData
```javascript
const handleSubmit = async () => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);
  
  await timetablesAPI.create(formData);
};
```

## 🎯 Future Enhancements

- [ ] Add pagination for large datasets
- [ ] Implement search/filter functionality
- [ ] Add export to CSV/Excel
- [ ] Bulk operations (delete multiple)
- [ ] Advanced grade analytics
- [ ] Timetable schedule visualization
- [ ] Email notifications
- [ ] Audit logs dashboard
- [ ] User activity tracking
- [ ] Dark mode theme

## 🚨 Common Issues & Solutions

**Issue:** Admin routes showing unauthorized
**Solution:** Ensure user has `user_type: 'admin'` from login

**Issue:** API calls failing
**Solution:** Check if backend is running on port 5000 and token is valid

**Issue:** File upload not working
**Solution:** Verify PDF file format and size (max 5MB)

**Issue:** Modal not closing
**Solution:** Call `handleCloseModal()` after form submission

## 📞 Support

For detailed API documentation, see `TIMETABLE_API.md` in the root directory.

---

**Status:** ✅ Complete and Ready for Testing
**Last Updated:** April 7, 2026
**Version:** 1.0.0
