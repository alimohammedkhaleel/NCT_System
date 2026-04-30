import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Dashboard Router Component
 * Redirects authenticated users to their role-specific dashboard
 */
const Dashboard = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #0A2472',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'professor':
      return <Navigate to="/professor/dashboard" replace />;
    case 'accountant':
      return <Navigate to="/accountant/dashboard" replace />;
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    default:
      // Unknown role - redirect to login
      return <Navigate to="/login" replace />;
  }
};

export default Dashboard;