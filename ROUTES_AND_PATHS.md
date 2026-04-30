# Routes and File Paths Documentation

## Application Routes

### Public Routes
- `/` - Home page (HomeModern component)
- `/about` - About page
- `/contact` - Contact page
- `/login` - Login page
- `/register/:token` - Student registration with token

### Protected Routes (Require Authentication)

#### Student Routes
- `/student/dashboard` - Student dashboard
- `/student/portal` - Student portal (grades & payments)

#### Professor Routes
- `/professor/dashboard` - Professor dashboard
- `/professor/grades` - Professor grades management

#### Accountant Routes
- `/accountant/dashboard` - Accountant dashboard

#### Admin Routes (Require admin role)
- `/admin` - Redirects to `/admin/dashboard`
- `/admin/dashboard` - Main admin dashboard
- `/admin/specialty/:code` - Specialty dashboard
- `/admin/specialty/:code/year/:yearNum` - Year management
- `/admin/courses` - Courses management
- `/admin/professors` - Professors management
- `/admin/students` - Students management
- `/admin/grade-settings` - Grade settings
- `/admin/pending-grades` - Pending grades
- `/admin/timetables` - Timetables management
- `/admin/schedules` - Schedule upload
- `/admin/registration-links` - Registration links management
- `/admin/registration-requests` - Registration requests approval

#### Legacy Routes (Redirects)
- `/dashboard` - Redirects to role-specific dashboard
- `/portal` - Redirects to `/student/dashboard`
- `/grades` - Professor grades page
- `/reports` - Redirects to `/dashboard`
- `/accountant` - Redirects to `/accountant/dashboard`

## File Structure and Import Paths

### Pages Directory Structure
```
client/frontend/src/pages/
├── Home/
│   ├── Home.jsx
│   ├── Home.css
│   └── index.js → exports Home.jsx
│
├── HomeModern/
│   ├── HomeModern.jsx
│   ├── HomeModern.css
│   └── index.js → exports HomeModern.jsx
│
├── About/
│   ├── About.jsx
│   ├── About.css
│   └── index.js → exports About.jsx
│
├── Contact/
│   ├── Contact.jsx
│   ├── Contact.css
│   └── index.js → exports Contact.jsx
│
├── Login/
│   ├── Login.jsx
│   ├── Login.css
│   └── index.js → exports Login.jsx
│
├── Dashboard/
│   ├── Dashboard.jsx (Router component)
│   ├── Dashboard.css
│   └── index.js → exports Dashboard.jsx
│
├── StudentDashboard/
│   ├── StudentDashboard.jsx
│   ├── StudentDashboard.css
│   └── index.js → exports StudentDashboard.jsx
│
├── StudentPortal/
│   ├── StudentPortal.jsx
│   ├── StudentPortal.module.css
│   └── index.js → exports StudentPortal.jsx
│
├── ProfessorDashboard/
│   ├── ProfessorDashboard.jsx
│   ├── ProfessorDashboard.module.css
│   └── index.js → exports ProfessorDashboard.jsx
│
├── ProfessorGrades/
│   ├── ProfessorGrades.jsx
│   ├── ProfessorGrades.css
│   └── index.js → exports ProfessorGrades.jsx
│
├── AccountantDashboard/
│   ├── AccountantDashboard.jsx
│   ├── AccountantDashboard.module.css
│   └── index.js → exports AccountantDashboard.jsx
│
├── AdminScheduleUpload/
│   ├── AdminScheduleUpload.jsx
│   ├── AdminScheduleUpload.css
│   └── index.js → exports AdminScheduleUpload.jsx
│
├── StudentRegistration/
│   ├── StudentRegistration.jsx
│   ├── StudentRegistration.module.css
│   └── index.js → exports StudentRegistration.jsx
│
└── Admin/ (No reorganization - kept as is)
    ├── AdminDashboard.jsx
    ├── AdminDashboard.module.css
    ├── SpecialtyDashboard.jsx
    ├── SpecialtyDashboard.module.css
    ├── YearManagement.jsx
    ├── YearManagement.module.css
    ├── CoursesPage.jsx
    ├── CoursesPage.module.css
    ├── ProfessorsPage.jsx
    ├── StudentsManagement.jsx
    ├── StudentsManagement.module.css
    ├── GradeSettings.jsx
    ├── GradeSettings.module.css
    ├── PendingGradesPage.jsx
    ├── TimetablesPage.jsx
    ├── RegistrationRequests.jsx
    ├── RegistrationRequests.module.css
    ├── RegistrationLinks.jsx
    └── RegistrationLinks.module.css
```

### Import Paths in App.jsx
```javascript
// Pages - Using folder imports (index.js handles export)
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

// Admin Pages - Direct imports (not reorganized)
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

### Import Paths Within Page Components

#### For components in page folders (e.g., Home/, Login/, etc.)
```javascript
// Context imports
import { useAuth } from '../../context/AuthContext';

// Component imports
import Navbar from '../../components/navComponent/Navbar';
import LoadingPage from '../../components/common/LoadingPage';

// Animation imports
import { CustomCursor, ClickSpark } from '../../components/animations';

// Asset imports
import AutotronicsImg from '../../assets/Autotronics.jpg';

// API imports
import { validateLoginForm } from '../../api/auth';

// Service imports
import axios from 'axios';

// Styles (relative to component)
import './ComponentName.css';
// or
import styles from './ComponentName.module.css';
```

#### For Admin pages (not in folders)
```javascript
// Context imports
import { useAuth } from '../context/AuthContext';

// Component imports
import Navbar from '../components/navComponent/Navbar';

// Styles
import styles from './ComponentName.module.css';
```

## Components Directory Structure

### Key Component Locations
```
client/frontend/src/components/
├── admin/
│   ├── AdminLayout.jsx
│   ├── AdminLayout.module.css (Purple gradient applied)
│   ├── PromotionModal.jsx
│   ├── PromotionModal.module.css
│   └── ProtectedRoute.jsx
│
├── animations/
│   ├── index.js (exports all animations)
│   ├── CustomCursor.jsx
│   ├── ClickSpark.jsx
│   ├── SplashCursor.jsx
│   ├── FadeIn.jsx
│   ├── TypewriterEffect.jsx
│   └── ... (other animation components)
│
├── authComponent/
│   └── LoginRegister.jsx
│
├── common/
│   ├── HeroSection.jsx
│   ├── HeroSection.css
│   ├── LoadingPage.jsx
│   ├── LoadingPage.css
│   ├── LoadingSpinner.jsx
│   ├── LoadingSpinner.module.css
│   ├── Modal.jsx
│   ├── Modal.module.css
│   ├── ModernCard.jsx
│   ├── ModernCard.css
│   ├── ModernFooter.jsx
│   ├── ModernFooter.css
│   ├── Notification.jsx
│   ├── Notification.module.css
│   ├── Table.jsx
│   └── Table.module.css
│
└── navComponent/
    ├── Navbar.jsx (Real navbar - used in Home page)
    └── Navbar.css
```

## Assets Directory
```
client/frontend/src/assets/
├── Autotronics.jpg
├── Mechatronic.jpg
├── Petroleum engineering.jpg
├── Renewable energy.jpg
├── china-cooperation-protocol.jpg
├── koica-koreatech-meeting.jpg
├── saudi-franchise-committee.jpg
├── image.png
├── hero.png
├── react.svg
└── vite.svg
```

## Navbar Menu Items

### For Non-Authenticated Users
1. Home (/)
2. About (/about)
3. Contact (/contact)
4. Services (/services)
5. Login (/login)

### For Authenticated Admin Users
1. Home (/)
2. About (/about)
3. Contact (/contact)
4. Services (/services)
5. Dashboard (/admin/dashboard) - Admin only
6. Profile Menu (with logout)

### For Authenticated Non-Admin Users
1. Home (/)
2. About (/about)
3. Contact (/contact)
4. Services (/services)
5. Profile Menu (with logout)

## Animation System

### Conditional Rendering
- **Home Page Only**: CustomCursor, SplashCursor, ClickSpark
- **All Other Pages**: No animations (performance optimization)

### Implementation in App.jsx
```javascript
const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/home';
  
  return (
    <>
      {isHomePage && (
        <>
          <CustomCursor />
          <SplashCursor />
          <ClickSpark />
        </>
      )}
      <Routes>
        {/* ... routes ... */}
      </Routes>
    </>
  );
};
```

## Styling

### Admin Dashboard
- Background: `linear-gradient(135deg, #0a043c, #1c062e, #2c003e)`
- Background attachment: `fixed`
- Applied in: `client/frontend/src/components/admin/AdminLayout.module.css`

### CSS Modules vs Regular CSS
- **CSS Modules** (`.module.css`): Scoped styles, imported as object
  - Example: `import styles from './Component.module.css'`
  - Usage: `className={styles.className}`
  
- **Regular CSS** (`.css`): Global styles
  - Example: `import './Component.css'`
  - Usage: `className="className"`

## Important Notes

### Removed Features
- ❌ Botpress chatbot (completely removed)
- ❌ QR code registration (removed, kept registration links/requests)
- ❌ ModernNavbar (removed, using real Navbar from navComponent)
- ❌ Duplicate files (Dashboard.jsx in Admin, AdminTestPage, etc.)

### Kept Features
- ✅ Registration Links (admin creates time-limited links)
- ✅ Registration Requests (admin approves/rejects students)
- ✅ All role-based dashboards
- ✅ Protected routes with role checking

### Key Files Modified
1. `client/frontend/src/App.jsx` - Routes and conditional animations
2. `client/frontend/src/components/navComponent/Navbar.jsx` - Menu items updated
3. `client/frontend/src/components/admin/AdminLayout.module.css` - Purple gradient
4. All page components - Import paths updated to `../../`

## Troubleshooting

### If page shows blank/white screen:
1. Check browser console for errors
2. Verify all import paths use correct relative paths
3. Check that index.js files exist in page folders
4. Verify App.jsx syntax (especially closing tags)

### If imports fail:
1. Components in page folders use `../../` for imports
2. Admin pages (not in folders) use `../` for imports
3. All images import from `../../assets/`
4. Navbar imports from `../../components/navComponent/Navbar`

### If animations don't work:
1. Check route is exactly `/` or `/home`
2. Verify conditional rendering in App.jsx
3. Check animation components are imported correctly
