# Admin Dashboard - Quick Reference Guide

## 🏃 Quick Start

```bash
# Install & Run
cd client/frontend
npm install
npm run dev

# Access at http://localhost:5173
# Login with admin account
# Go to http://localhost:5173/admin/dashboard
```

## 📁 File Structure Quick Reference

```
src/
├── pages/admin/
│   ├── AdminDashboard.jsx          # Home page with links
│   ├── CoursesPage.jsx             # Courses CRUD
│   ├── ProfessorsPage.jsx          # Professors + Courses
│   ├── GradeSettingsPage.jsx       # Grade config
│   ├── PendingGradesPage.jsx       # Grade approval
│   ├── QRCodePage.jsx              # QR generation
│   ├── TimetablesPage.jsx          # PDF upload
│   └── CoursesPage.module.css      # Shared styles
│
├── components/admin/
│   ├── AdminLayout.jsx             # Main layout
│   ├── AdminLayout.module.css      # Layout styles
│   └── ProtectedRoute.jsx          # Auth guard
│
├── services/
│   └── apiService.js               # API methods
│
└── App.jsx                         # Routes config
```

## 🔌 API Methods Cheat Sheet

```javascript
// Courses
await coursesAPI.getAll()
await coursesAPI.create(data)
await coursesAPI.update(id, data)
await coursesAPI.delete(id)

// Professors
await professorsAPI.getAll()
await professorsAPI.create(data)
await professorsAPI.update(id, data)
await professorsAPI.delete(id)
await professorsAPI.assignCourses(profId, courseIds)

// Grade Settings
await gradeSettingsAPI.getSettings()
await gradeSettingsAPI.updateSettings(data)

// Grades
await gradesAPI.getPending()
await gradesAPI.update(id, data)
await gradesAPI.approve(id)
await gradesAPI.reject(id, reason)

// Timetables
await timetablesAPI.getAll()
await timetablesAPI.create(formData)
await timetablesAPI.update(id, formData)
await timetablesAPI.delete(id)

// QR Codes
await qrCodeAPI.generate()
```

## 🎣 Custom Hooks Pattern

```javascript
// Fetch data
useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    setLoading(true);
    const res = await API.getAll();
    setData(res.data.data || []);
  } catch (error) {
    showNotification('Error', 'error');
  } finally {
    setLoading(false);
  }
};

// Show notification
const showNotification = (message, type) => {
  setNotification({ message, type });
  setTimeout(() => setNotification(null), 3000);
};
```

## 📝 Form Pattern

```javascript
const [formData, setFormData] = useState({
  field1: '',
  field2: ''
});

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.field1) {
    showNotification('Required', 'error');
    return;
  }
  // API call
};
```

## 🎨 Component Templates

### Page Header
```jsx
<div className={styles.pageHeader}>
  <h1 className={styles.pageTitle}>Title</h1>
  <button className={styles.addBtn}>+ Add New</button>
</div>
```

### Modal Form
```jsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  footer={
    <div style={{ display: 'flex', gap: '10px' }}>
      <button onClick={handleClose}>Cancel</button>
      <button onClick={handleSubmit}>Save</button>
    </div>
  }
>
  {/* Form content */}
</Modal>
```

### Table Display
```jsx
<Table
  columns={[{ key: 'name', label: 'Name' }]}
  data={data}
  actions={[
    { label: 'Edit', onClick: handleEdit },
    { label: 'Delete', onClick: handleDelete }
  ]}
/>
```

## 🎯 Common Patterns

### Confirm Before Delete
```javascript
if (window.confirm('Are you sure?')) {
  await API.delete(id);
}
```

### Loading State
```jsx
{loading ? (
  <div className={styles.loading}>
    <div className={styles.loadingSpinner}></div>
    <p>Loading...</p>
  </div>
) : (
  <Table data={data} />
)}
```

### Form Input
```jsx
<input
  type="text"
  name="field"
  className={styles.input}
  value={formData.field}
  onChange={handleInputChange}
  placeholder="Placeholder"
/>
```

### Select Dropdown
```jsx
<select
  name="category"
  className={styles.select}
  value={formData.category}
  onChange={handleInputChange}
>
  <option value="">Select one</option>
  {options.map(opt => (
    <option key={opt.id} value={opt.id}>
      {opt.name}
    </option>
  ))}
</select>
```

## 🔐 Auth Check

```javascript
// In ProtectedRoute
if (!isAuthenticated || !user) {
  return <Navigate to="/login" />;
}

if (user.user_type !== 'admin') {
  return <Navigate to="/" />;
}

return children;
```

## 🧹 Cleanup Pattern

```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    // Cleanup after timeout
  }, 3000);

  return () => clearTimeout(timer); // Cleanup function
}, []);
```

## 📊 Status Badge

```jsx
<span style={{
  padding: '4px 8px',
  borderRadius: '4px',
  backgroundColor: value ? '#d4edda' : '#f8d7da',
  color: value ? '#155724' : '#721c24',
  fontSize: '12px',
  fontWeight: '600'
}}>
  {value ? 'Active' : 'Inactive'}
</span>
```

## 🎯 Add New Feature Checklist

- [ ] Create page component in `pages/admin/`
- [ ] Create CSS module for page
- [ ] Add API methods to `apiService.js`
- [ ] Import page in `App.jsx`
- [ ] Add route in `App.jsx`
- [ ] Add sidebar link in `AdminLayout.jsx`
- [ ] Test all CRUD operations
- [ ] Test error handling
- [ ] Test validation
- [ ] Test responsiveness

## 🐛 Debug Tips

### Check API Response
```javascript
console.log('Response:', res.data);
```

### Check Form Data
```javascript
console.log('Form Data:', formData);
```

### Check Component Props
```javascript
// Inspect in React DevTools
```

### Check Network Requests
```javascript
// Open Network tab in DevTools
// Filter by XHR
// Check request/response
```

## 🚀 Performance Tips

1. Use `useCallback` for frequently used handlers
2. Implement pagination for large lists
3. Use `useMemo` for expensive calculations
4. Lazy load components with `React.lazy()`
5. Optimize CSS with CSS modules

## 📱 Responsive Breakpoints

```css
/* Mobile (< 768px) */
@media (max-width: 768px) {
  /* Mobile styles */
}

/* Tablet & Desktop */
@media (min-width: 769px) {
  /* Desktop styles */
}
```

## 🔗 Useful Links

- Frontend: http://localhost:5173
- Admin Dashboard: http://localhost:5173/admin/dashboard
- Backend API: http://localhost:5000
- API Docs: `/TIMETABLE_API.md`
- Testing Guide: `/TESTING_GUIDE.md`

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Routes not working | Check `App.jsx` imports and route paths |
| API call failing | Check backend running, verify token valid |
| Modal not closing | Call `handleClose()` after submit |
| Styles not applying | Check CSS module imported, class name correct |
| Auth failing | Check user has `user_type: 'admin'` |
| File upload failing | Check file is PDF, size < 5MB, backend configured |
| Component not rendering | Check imports, conditional rendering logic |

## 📚 CSS Module Reference

```css
/* Reusable classes from CoursesPage.module.css */
.pageWrapper        /* Main container */
.pageHeader         /* Header with title */
.pageTitle          /* Page h1 */
.addBtn             /* Green add button */
.formGroup          /* Form field wrapper */
.label              /* Form label */
.input              /* Text input */
.select             /* Select dropdown */
.submitBtn          /* Blue submit button */
.cancelBtn          /* Gray cancel button */
.loading            /* Loading state */
.loadingSpinner     /* Spinning animation */
```

## 🎓 Learning Path

1. Start with `AdminDashboard.jsx` (simple display)
2. Learn `CoursesPage.jsx` (complete CRUD)
3. Study `TimetablesPage.jsx` (file upload)
4. Review `ProfessorsPage.jsx` (multi-select)
5. Advanced: Add new feature yourself

## 💡 Pro Tips

1. Use browser DevTools for API debugging
2. Test with network throttling (slow 3G)
3. Test with different screen sizes
4. Use console logs strategically
5. Keep components small and focused
6. Reuse CSS modules styles
7. Comment complex logic
8. Always handle errors gracefully

---

**Last Updated:** April 7, 2026
**Version:** 1.0.0
