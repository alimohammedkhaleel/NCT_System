import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MotionProvider } from './context/MotionContext';
import { Toaster } from 'react-hot-toast';

// Modern Styles
import './styles/glassomorphism.css';
import './styles/modern-design.css';

// Animations
import { CustomCursor, ClickSpark, SplashCursor } from './components/animations';

// Pages
import About from './pages/About';
import Contact from './pages/Contact';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import StudentPortal from './pages/StudentPortal';
import StudentDataPage from './pages/Student/StudentDataPage';
import ProfessorDashboard from './pages/ProfessorDashboard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProfessorGrades from './pages/ProfessorGrades';
import AdminScheduleUpload from './pages/AdminScheduleUpload';
import StudentRegistration from './pages/StudentRegistration';
import ProfessorRegistration from './pages/ProfessorRegistration/ProfessorRegistration';
import Services from './pages/Services';

// Accountant
import AccountantDashboard from './pages/AccountantDashboard';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import SpecialtyDashboard from './pages/Admin/SpecialtyDashboard';
import CoursesPage from './pages/Admin/CoursesPage';
import ProfessorsPage from './pages/Admin/ProfessorsPage';
import StudentsManagement from './pages/Admin/StudentsManagement';
import GradeSettings from './pages/Admin/GradeSettings';
import PendingGradesPage from './pages/Admin/PendingGradesPage';
import TimetablesPage from './pages/Admin/TimetablesPage';
import RegistrationRequests from './pages/Admin/RegistrationRequests';
import RegistrationLinks from './pages/Admin/RegistrationLinks';
import ResultsPublishing from './pages/Admin/ResultsPublishing';
import SpecialtyFeesPage from './pages/Admin/SpecialtyFeesPage';
import ProfessorRequests from './pages/Admin/ProfessorRequests';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

// Styles
import './App.css';



// Home Route - always shows Home page regardless of auth status
// Authenticated users can still visit the home page
const HomeRoute = () => {
  return <Home />;
};

// App Layout Component
const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/services" element={<Services />} />
      <Route path="/login" element={<Login />} />
      <Route path="/qr-register" element={<Navigate to="/login" replace />} />
      <Route path="/register/professor/:token" element={<ProfessorRegistration />} />
      <Route path="/register/:token" element={<StudentRegistration />} />
      
      {/* Dashboard Router - redirects to role-specific dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Student Dashboard */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Student Portal - Enhanced Grading and Payment System */}
      <Route
        path="/student/portal"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentPortal />
          </ProtectedRoute>
        }
      />

      {/* Student Data Page - My Data */}
      <Route
        path="/student/my-data"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDataPage />
          </ProtectedRoute>
        }
      />

      {/* Legacy portal route - redirect to student dashboard */}
      <Route
        path="/portal"
        element={<Navigate to="/student/dashboard" replace />}
      />

      {/* Professor Dashboard */}
      <Route
        path="/professor/dashboard"
        element={
          <ProtectedRoute requiredRole="professor">
            <ProfessorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Professor Grades */}
      <Route
        path="/professor/grades"
        element={
          <ProtectedRoute requiredRole="professor">
            <ProfessorGrades />
          </ProtectedRoute>
        }
      />

      {/* Legacy grades route */}
      <Route
        path="/grades"
        element={
          <ProtectedRoute>
            <ProfessorGrades />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* Accountant Route */}
      <Route
        path="/accountant/dashboard"
        element={
          <ProtectedRoute requiredRole="accountant">
            <AccountantDashboard />
          </ProtectedRoute>
        }
      />

      {/* Legacy accountant route */}
      <Route
        path="/accountant"
        element={<Navigate to="/accountant/dashboard" replace />}
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="specialty/:code" element={<SpecialtyDashboard />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="professors" element={<ProfessorsPage />} />
        <Route path="students" element={<StudentsManagement />} />
        <Route path="grade-settings" element={<GradeSettings />} />
        <Route path="pending-grades" element={<PendingGradesPage />} />
        <Route path="qr-code" element={<Navigate to="dashboard" replace />} />
        <Route path="timetables" element={<TimetablesPage />} />
        <Route path="schedules" element={<AdminScheduleUpload />} />
        <Route path="registration-links" element={<RegistrationLinks />} />
        <Route path="registration-requests" element={<RegistrationRequests />} />
        <Route path="professor-requests" element={<ProfessorRequests />} />
        <Route path="results-publishing" element={<ResultsPublishing />} />
        <Route path="specialty-fees" element={<SpecialtyFeesPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <MotionProvider>
        <Router>
          {/* Background animations & Effects */}
          <CustomCursor />
          <SplashCursor />
          
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--purple-dark)',
                color: 'var(--white)',
                border: '1px solid var(--border-purple)',
                boxShadow: 'var(--shadow-glow)',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </MotionProvider>
    </AuthProvider>
  );
}

export default App;
