# Complete Directory Structure & Import Paths

## Current Pages Directory Structure

```
client/frontend/src/pages/
│
├── About/
│   ├── About.jsx
│   ├── About.css
│   └── index.js
│
├── AccountantDashboard/
│   ├── AccountantDashboard.jsx
│   ├── AccountantDashboard.module.css
│   └── index.js
│
├── Admin/ (NOT reorganized - kept as flat structure)
│   ├── AdminDashboard.jsx
│   ├── AdminDashboard.module.css
│   ├── CoursesManagement.jsx (DUPLICATE - should be removed)
│   ├── CoursesManagement.module.css (DUPLICATE - should be removed)
│   ├── CoursesPage.jsx
│   ├── CoursesPage.module.css
│   ├── GradeSettings.jsx
│   ├── GradeSettings.module.css
│   ├── GradeSettingsPage.jsx (DUPLICATE - should be removed)
│   ├── PendingGrades.jsx (DUPLICATE - should be removed)
│   ├── PendingGrades.module.css (DUPLICATE - should be removed)
│   ├── PendingGradesPage.jsx
│   ├── ProfessorsManagement.jsx (DUPLICATE - should be removed)
│   ├── ProfessorsManagement.module.css (DUPLICATE - should be removed)
│   ├── ProfessorsPage.jsx
│   ├── RegistrationLinks.jsx
│   ├── RegistrationLinks.module.css
│   ├── RegistrationRequests.jsx
│   ├── RegistrationRequests.module.css
│   ├── SpecialtyDashboard.jsx
│   ├── SpecialtyDashboard.module.css
│   ├── StudentsManagement.jsx
│   ├── StudentsManagement.module.css
│   ├── TimetablesPage.jsx
│   ├── YearManagement.jsx
│   └── YearManagement.module.css
│
├── AdminScheduleUpload/
│   ├── AdminScheduleUpload.jsx
│   ├── AdminScheduleUpload.css
│   └── index.js
│
├── Contact/
│   ├── Contact.jsx
│   ├── Contact.css
│   └── index.js
│
├── Dashboard/
│   ├── Dashboard.jsx
│   ├── Dashboard.css
│   └── index.js
│
├── Home/
│   ├── Home.jsx
│   ├── Home.css
│   └── index.js
│
├── HomeModern/
│   ├── HomeModern.jsx
│   ├── HomeModern.css
│   └── index.js
│
├── Login/
│   ├── Login.jsx
│   ├── Login.css
│   └── index.js
│
├── ProfessorDashboard/
│   ├── ProfessorDashboard.jsx
│   ├── ProfessorDashboard.module.css
│   └── index.js
│
├── ProfessorGrades/
│   ├── ProfessorGrades.jsx
│   ├── ProfessorGrades.css
│   └── index.js
│
├── StudentDashboard/
│   ├── StudentDashboard.jsx
│   ├── StudentDashboard.css
│   └── index.js
│
└── StudentPortal/
    ├── StudentPortal.jsx
    ├── StudentPortal.module.css
    └── index.js
```

## Missing Folder (Need to create)
```
├── StudentRegistration/
│   ├── StudentRegistration.jsx
│   ├── StudentRegistration.module.css
│   └── index.js
```

## Import Paths Reference

### For Components in Page Folders (2 levels deep)
Example: `client/frontend/src/pages/Home/Home.jsx`

```javascript
// ✅ CORRECT IMPORTS (use ../../)
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navComponent/Navbar';
import { CustomCursor } from '../../components/animations';
import AutotronicsImg from '../../assets/Autotronics.jpg';
import { validateLoginForm } from '../../api/auth';
import './Home.css'; // Relative to component
```

### For Components in Admin Folder (1 level deep)
Example: `client/frontend/src/pages/Admin/AdminDashboard.jsx`

```javascript
// ✅ CORRECT IMPORTS (use ../)
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/navComponent/Navbar';
import { CustomCursor } from '../components/animations';
import styles from './AdminDashboard.module.css'; // Relative to component
```

## App.jsx Import Paths

```javascript
// ✅ CORRECT - All pages import from folders (index.js handles export)
import HomeModern from './pages/HomeModern';
import About from './pages/About';
import Contact from './pages/Contact';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import StudentPortal from './pages/StudentPortal';
import ProfessorDashboard from './pages/ProfessorDashboard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProfessorGrades from './pages/ProfessorGrades';
import AdminScheduleUpload from './pages/AdminScheduleUpload';
import StudentRegistration from './pages/StudentRegistration';
import AccountantDashboard from './pages/AccountantDashboard';

// Admin pages - direct imports (not in folders)
import AdminDashboard from './pages/Admin/AdminDashboard';
import SpecialtyDashboard from './pages/Admin/SpecialtyDashboard';
import YearManagement from './pages/Admin/YearManagement';
import CoursesPage from './pages/Admin/CoursesPage';
import ProfessorsPage from './pages/Admin/ProfessorsPage';
import StudentsManagement from './pages/Admin/StudentsManagement';
import GradeSettings from './pages/Admin/GradeSettings';
import PendingGradesPage from './pages/Admin/PendingGradesPage';
import TimetablesPage from './pages/Admin/TimetablesPage';
import RegistrationRequests from './pages/Admin/RegistrationRequests';
import RegistrationLinks from './pages/Admin/RegistrationLinks';
```

## Files That Need Import Path Updates

### 1. Home/Home.jsx
```javascript
// Current imports should be:
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navComponent/Navbar';
import NCTPresentation from '../../NCT-presentation/NCT-presentation';
import { SplashCursor, ClickSpark, CustomCursor, ... } from '../../components/animations';
import './Home.css';
import AutotronicsImg from '../../assets/Autotronics.jpg';
// ... other images
```

### 2. HomeModern/HomeModern.jsx
```javascript
import { useAuth } from '../../context/AuthContext';
import ModernFooter from '../../components/common/ModernFooter';
import NCTPresentation from '../../NCT-presentation/NCT-presentation';
import { TypewriterEffect, ... } from '../../components/animations';
import './HomeModern.css';
```

### 3. Login/Login.jsx
```javascript
import { useAuth } from '../../context/AuthContext';
import { validateLoginForm } from '../../api/auth';
import LoadingPage from '../../components/common/LoadingPage';
import './Login.css';
```

### 4. About/About.jsx
```javascript
import Navbar from '../../components/navComponent/Navbar';
import './About.css';
```

### 5. Contact/Contact.jsx
```javascript
import Navbar from '../../components/navComponent/Navbar';
import './Contact.css';
```

### 6. Dashboard/Dashboard.jsx
```javascript
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';
```

### 7. StudentDashboard/StudentDashboard.jsx
```javascript
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navComponent/Navbar';
import './StudentDashboard.css';
```

### 8. StudentPortal/StudentPortal.jsx
```javascript
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navComponent/Navbar';
import { SplashCursor, TrueFocus, FadeIn } from '../../components/animations';
import styles from './StudentPortal.module.css';
```

### 9. ProfessorDashboard/ProfessorDashboard.jsx
```javascript
import { useAuth } from '../../context/AuthContext';
import styles from './ProfessorDashboard.module.css';
```

### 10. ProfessorGrades/ProfessorGrades.jsx
```javascript
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navComponent/Navbar';
import { ClickSpark } from '../../components/animations';
import './ProfessorGrades.css';
```

### 11. AccountantDashboard/AccountantDashboard.jsx
```javascript
import { useAuth } from '../../context/AuthContext';
import { BounceCards, FadeIn } from '../../components/animations';
import styles from './AccountantDashboard.module.css';
```

### 12. AdminScheduleUpload/AdminScheduleUpload.jsx
```javascript
import { useAuth } from '../../context/AuthContext';
import './AdminScheduleUpload.css';
```

### 13. StudentRegistration/StudentRegistration.jsx (if exists)
```javascript
// Should use ../../ for imports
import styles from './StudentRegistration.module.css';
```

## Duplicate Files to Remove

These files are duplicates and should be deleted:

```
❌ client/frontend/src/pages/Admin/CoursesManagement.jsx
❌ client/frontend/src/pages/Admin/CoursesManagement.module.css
❌ client/frontend/src/pages/Admin/ProfessorsManagement.jsx
❌ client/frontend/src/pages/Admin/ProfessorsManagement.module.css
❌ client/frontend/src/pages/Admin/GradeSettingsPage.jsx
❌ client/frontend/src/pages/Admin/PendingGrades.jsx
❌ client/frontend/src/pages/Admin/PendingGrades.module.css
```

Keep these instead:
```
✅ CoursesPage.jsx
✅ ProfessorsPage.jsx
✅ GradeSettings.jsx
✅ PendingGradesPage.jsx
```

## Quick Reference: Import Path Rules

| Component Location | Context/API | Components | Assets | Styles |
|-------------------|-------------|------------|--------|--------|
| `pages/Folder/Component.jsx` | `../../context/` | `../../components/` | `../../assets/` | `./Style.css` |
| `pages/Admin/Component.jsx` | `../context/` | `../components/` | `../assets/` | `./Style.css` |
| `components/folder/Component.jsx` | `../../context/` | `../` | `../../assets/` | `./Style.css` |

## Common Import Errors to Fix

### ❌ WRONG
```javascript
// In pages/Home/Home.jsx
import { useAuth } from '../context/AuthContext'; // Missing one level
import Navbar from '../components/navComponent/Navbar'; // Missing one level
```

### ✅ CORRECT
```javascript
// In pages/Home/Home.jsx
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/navComponent/Navbar';
```

## Verification Checklist

- [ ] All page folders have `index.js` that exports default
- [ ] All imports in page folders use `../../` for src-level imports
- [ ] Admin page imports use `../` for src-level imports
- [ ] App.jsx imports all pages correctly
- [ ] No duplicate files in Admin folder
- [ ] StudentRegistration folder created with index.js
- [ ] All image imports point to `../../assets/`
- [ ] Navbar imports from `../../components/navComponent/Navbar`
- [ ] No broken imports (check with getDiagnostics)
- [ ] Dev server runs without errors
