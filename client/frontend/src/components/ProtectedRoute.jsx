import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingPage from './common/LoadingPage';

/**
 * ProtectedRoute — waits for AuthContext to finish its async /auth/profile check
 * before deciding to redirect or render.
 *
 * The root cause of "refresh → redirect to login" was a fixed 300ms timer in the old
 * ProtectedRoute that expired before the API call completed. Now we rely solely on
 * the `loading` flag from AuthContext, which is `true` until `checkAuth()` resolves.
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading page while AuthContext is verifying the token via API
  if (loading) {
    return <LoadingPage message="جاري التحقق من الصلاحيات..." timeout={10000} />;
  }

  // Not authenticated — redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
