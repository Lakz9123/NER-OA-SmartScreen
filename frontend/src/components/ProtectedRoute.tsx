import { Navigate, Outlet } from 'react-router-dom';
import { getRole, homePathFor } from '../utils/roles';

export default function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Read role from cached user data
  const userStr = localStorage.getItem('user');
  let role = null;
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      role = getRole(user);
    } catch (e) {
      // ignore parse error
    }
  }

  if (!role) {
    // If role is missing or unknown, redirect to login instead of guessing
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect based on role safely
    return <Navigate to={homePathFor(role)} replace />;
  }

  return <Outlet />;
}
