# 👨‍💻 مرجع المطور - نظام الجداول الدراسية

## 📚 نظرة عامة

نظام عرض الجداول الدراسية في Student Portal مع تصميم احترافي وميزات متقدمة.

---

## 🗂️ البنية

```
client/frontend/src/pages/StudentDashboard/
├── StudentDashboard.jsx          # المكون الرئيسي
└── StudentDashboard.css          # التنسيقات

server/
├── routes/timetableRoutes.js     # API Routes
├── controllers/timetableController.js
├── services/timetableService.js
└── models/Timetable.js           # Database Model
```

---

## 🔌 API Reference

### GET /api/admin/timetables/student

**Description:** جلب جداول الطالب بناءً على تخصصه

**Authentication:** Required (Student role)

**Request:**
```http
GET /api/admin/timetables/student
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "جدول السنة الأولى - الترم الأول",
      "specialty_id": 3,
      "file_url": "/uploads/timetables/timetable_1234567890.pdf",
      "file_name": "ICT_Y1_S1.pdf",
      "file_size": 245678,
      "created_at": "2024-09-15T10:30:00.000Z",
      "updated_at": "2024-09-15T10:30:00.000Z",
      "Specialty": {
        "id": 3,
        "name": "Information Technology",
        "arabic_name": "تكنولوجيا المعلومات",
        "code": "ICT"
      }
    }
  ],
  "count": 1
}
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "success": false,
  "message": "Authentication required"
}

// 404 Not Found
{
  "success": false,
  "message": "Student not found"
}

// 500 Server Error
{
  "success": false,
  "message": "Server error"
}
```

---

## 🎨 Component Structure

### StudentDashboard.jsx

```jsx
const StudentDashboard = () => {
  // State Management
  const [timetables, setTimetables] = useState([]);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [timetableError, setTimetableError] = useState(null);
  const [timetableFetched, setTimetableFetched] = useState(false);

  // Fetch Function
  const fetchTimetable = useCallback(async () => {
    setTimetableLoading(true);
    setTimetableError(null);
    try {
      const res = await api.get('/admin/timetables/student');
      setTimetables(res.data.data || []);
      setTimetableFetched(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل تحميل الجدول الدراسي';
      setTimetableError(msg);
    } finally {
      setTimetableLoading(false);
    }
  }, []);

  // Lazy Load on Tab Visit
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'timetable' && !timetableFetched) {
      fetchTimetable();
    }
  }, [activeTab, isAuthenticated, timetableFetched, fetchTimetable]);

  return (
    // JSX...
  );
};
```

---

## 🎨 CSS Classes Reference

### Main Container
```css
.sp-timetable-tab {
  min-height: 300px;
}

.sp-timetable-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

### Timetable Card
```css
.sp-timetable-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: var(--purple-transparent);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-purple);
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--glow-purple);
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}
```

### Icon
```css
.sp-timetable-icon {
  width: 56px;
  height: 56px;
  min-width: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    rgba(179, 110, 255, 0.2), 
    rgba(179, 110, 255, 0.1)
  );
  border: 1px solid var(--border-purple);
  border-radius: 12px;
  color: var(--purple-light);
  transition: all var(--transition-fast);
}
```

### Content
```css
.sp-timetable-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.sp-timetable-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.sp-timetable-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--white);
  text-shadow: 0 2px 6px var(--glow-purple);
  line-height: 1.3;
}
```

### Badge
```css
.sp-timetable-specialty-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: rgba(179, 110, 255, 0.15);
  border: 1px solid rgba(179, 110, 255, 0.3);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--purple-light);
  white-space: nowrap;
}
```

### Meta Information
```css
.sp-timetable-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.sp-timetable-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--white-dim);
  white-space: nowrap;
}

.sp-timetable-meta-item svg {
  color: var(--purple-light);
  opacity: 0.7;
  flex-shrink: 0;
}
```

### Button
```css
.sp-timetable-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, 
    var(--purple-primary), 
    var(--purple-light)
  );
  color: var(--white);
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 12px var(--glow-purple);
  border: 1px solid transparent;
}
```

### Empty State
```css
.sp-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 24px;
  gap: 16px;
}

.sp-empty-icon {
  font-size: 4rem;
  filter: drop-shadow(0 4px 12px var(--glow-purple));
  animation: float 3s ease-in-out infinite;
}
```

---

## 🎨 CSS Variables

```css
/* Colors */
--purple-primary: #b36eff;
--purple-light: #d4a5ff;
--purple-transparent: rgba(179, 110, 255, 0.1);
--border-purple: rgba(179, 110, 255, 0.2);
--glow-purple: rgba(179, 110, 255, 0.3);

--white: #ffffff;
--white-dim: rgba(255, 255, 255, 0.7);

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;

/* Transitions */
--transition-fast: 0.2s ease;
--transition-normal: 0.3s ease;
```

---

## 🎬 Animations

### Float Animation
```css
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Usage */
.sp-empty-icon {
  animation: float 3s ease-in-out infinite;
}
```

### Fade In Animation
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Usage */
.sp-tab-content {
  animation: fadeIn 0.6s ease-out;
}
```

---

## 📱 Responsive Breakpoints

### Desktop (> 768px)
```css
/* Default styles */
.sp-timetable-card {
  flex-direction: row;
  align-items: center;
}
```

### Tablet (≤ 768px)
```css
@media (max-width: 768px) {
  .sp-timetable-card {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px;
  }
  
  .sp-timetable-icon {
    width: 48px;
    height: 48px;
    min-width: 48px;
    align-self: center;
  }
  
  .sp-timetable-content {
    text-align: center;
  }
  
  .sp-timetable-header {
    flex-direction: column;
    align-items: center;
  }
  
  .sp-timetable-meta {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
  
  .sp-timetable-btn {
    width: 100%;
    justify-content: center;
  }
}
```

### Mobile (≤ 480px)
```css
@media (max-width: 480px) {
  .sp-timetable-meta-item {
    font-size: 0.75rem;
  }
  
  .sp-timetable-title {
    font-size: 0.95rem;
  }
}
```

---

## 🎨 SVG Icons

### Calendar Icon (40x40)
```jsx
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M15.6947 13.7H15.7037M15.6947 16.7H15.7037M11.9955 13.7H12.0045M11.9955 16.7H12.0045M8.29431 13.7H8.30329M8.29431 16.7H8.30329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
```

### File Icon (16x16)
```jsx
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M15.5 18.5C16.6 18.5 17.5 17.6 17.5 16.5V7.5C17.5 6.4 16.6 5.5 15.5 5.5C14.4 5.5 13.5 6.4 13.5 7.5V16.5C13.5 17.6 14.4 18.5 15.5 18.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M8.5 18.5C9.6 18.5 10.5 17.6 10.5 16.5V12.5C10.5 11.4 9.6 10.5 8.5 10.5C7.4 10.5 6.5 11.4 6.5 12.5V16.5C6.5 17.6 7.4 18.5 8.5 18.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
```

### Download Icon (16x16)
```jsx
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M9 11.51L12 14.51L15 11.51" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M12 14.51V6.51001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M6 16.51C9.89 17.81 14.11 17.81 18 16.51" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
```

### Eye Icon (20x20)
```jsx
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M15.58 12C15.58 13.98 13.98 15.58 12 15.58C10.02 15.58 8.42004 13.98 8.42004 12C8.42004 10.02 10.02 8.42004 12 8.42004C13.98 8.42004 15.58 10.02 15.58 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M12 20.27C15.53 20.27 18.82 18.19 21.11 14.59C22.01 13.18 22.01 10.81 21.11 9.39997C18.82 5.79997 15.53 3.71997 12 3.71997C8.46997 3.71997 5.17997 5.79997 2.88997 9.39997C1.98997 10.81 1.98997 13.18 2.88997 14.59C5.17997 18.19 8.46997 20.27 12 20.27Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
```

---

## 🔧 Utility Functions

### Format File Size
```javascript
const formatFileSize = (bytes) => {
  return `${(bytes / 1024).toFixed(1)} KB`;
};

// Usage
{t.file_size && (
  <span>{formatFileSize(t.file_size)}</span>
)}
```

### Format Date (Arabic)
```javascript
const formatDateArabic = (dateString) => {
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Usage
{t.created_at && (
  <span>{formatDateArabic(t.created_at)}</span>
)}
```

### Build File URL
```javascript
const buildFileURL = (fileUrl) => {
  const backendURL = 'http://localhost:5000';
  return fileUrl.startsWith('/') 
    ? `${backendURL}${fileUrl}` 
    : fileUrl;
};

// Usage
<a href={buildFileURL(t.file_url)} target="_blank" rel="noopener noreferrer">
  عرض الجدول
</a>
```

---

## 🐛 Debugging Tips

### Check API Response
```javascript
const fetchTimetable = async () => {
  try {
    const res = await api.get('/admin/timetables/student');
    console.log('📊 Timetables Response:', res.data);
    console.log('📊 Count:', res.data.count);
    console.log('📊 Data:', res.data.data);
  } catch (err) {
    console.error('❌ Error:', err.response?.data);
  }
};
```

### Check Student Specialty
```javascript
// في Backend
const student = await Student.findOne({ 
  where: { user_id: req.user.id } 
});
console.log('👤 Student:', student);
console.log('🎓 Specialty ID:', student.specialty_id);
```

### Check Timetables Query
```javascript
// في Backend
const timetables = await Timetable.findAll({
  where: { specialty_id: student.specialty_id },
  include: [{ model: Specialty }],
  order: [['created_at', 'DESC']]
});
console.log('📅 Timetables:', timetables);
```

---

## 📦 Dependencies

### Frontend:
```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "react-hot-toast": "^2.x"
}
```

### Backend:
```json
{
  "express": "^4.x",
  "sequelize": "^6.x",
  "multer": "^1.x"
}
```

---

## 🚀 Performance Tips

### 1. Lazy Loading
```javascript
// Load data only when tab is visited
useEffect(() => {
  if (activeTab === 'timetable' && !timetableFetched) {
    fetchTimetable();
  }
}, [activeTab, timetableFetched]);
```

### 2. Memoization
```javascript
const fetchTimetable = useCallback(async () => {
  // ...
}, []); // Empty deps - function never changes
```

### 3. CSS Transitions
```css
/* Use CSS transitions instead of JS animations */
.sp-timetable-card {
  transition: all 0.2s ease;
}
```

### 4. SVG Icons
```jsx
/* Use inline SVG instead of image files */
<svg>...</svg>
```

---

## 🔐 Security

### File Access
```javascript
// Always use backend URL for file access
const fileURL = `http://localhost:5000${t.file_url}`;

// Open in new tab with security attributes
<a 
  href={fileURL} 
  target="_blank" 
  rel="noopener noreferrer"
>
```

### Authentication
```javascript
// API requires authentication
router.get('/timetables/student', 
  authenticateToken, 
  authorizeRoles('student'), 
  async (req, res) => {
    // ...
  }
);
```

---

## 📝 Code Style

### Naming Conventions:
- **Components:** PascalCase (`StudentDashboard`)
- **Functions:** camelCase (`fetchTimetable`)
- **CSS Classes:** kebab-case with prefix (`sp-timetable-card`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`)

### File Organization:
```
Component.jsx
├── Imports
├── Constants
├── Component Definition
│   ├── State
│   ├── Effects
│   ├── Handlers
│   └── Render
└── Export
```

---

**تاريخ الإنشاء:** 2026-04-22  
**الإصدار:** 1.0.0  
**الحالة:** ✅ مكتمل
