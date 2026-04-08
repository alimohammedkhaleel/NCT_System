import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import StudentPortal from './pages/StudentPortal';
import Login from './pages/Login';
import QRCodeRegistration from './pages/QRCodeRegistration';
import Dashboard from './pages/Dashboard';
import ProfessorGrades from './pages/ProfessorGrades';
import AdminScheduleUpload from './pages/AdminScheduleUpload';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import CoursesPage from './pages/Admin/CoursesPage';
import ProfessorsPage from './pages/Admin/ProfessorsPage';
import GradeSettingsPage from './pages/Admin/GradeSettingsPage';
import PendingGradesPage from './pages/Admin/PendingGradesPage';
import QRCodePage from './pages/Admin/QRCodePage';
import TimetablesPage from './pages/Admin/TimetablesPage';

// Components
import BotpressChat from './components/chat/BotpressChat';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

// Styles
import './App.css';

// Conditional BotpressChat - Only show after authentication
const ConditionalBotpressChat = () => {
  const { isAuthenticated } = useAuth();
  
  // Only load Botpress after user is authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return <BotpressChat />;
};

// App Layout Component
const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/qr-register" element={<QRCodeRegistration />} />
      <Route path="/portal" element={<StudentPortal />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
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
        <Route path="courses" element={<CoursesPage />} />
        <Route path="professors" element={<ProfessorsPage />} />
        <Route path="grade-settings" element={<GradeSettingsPage />} />
        <Route path="pending-grades" element={<PendingGradesPage />} />
        <Route path="qr-code" element={<QRCodePage />} />
        <Route path="timetables" element={<TimetablesPage />} />
        <Route path="schedules" element={<AdminScheduleUpload />} />
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
      <Router>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
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
        <ConditionalBotpressChat />
      </Router>
    </AuthProvider>
  );
}

export default App;
