import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  requiredRole?: string;
}

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  // Simple check for now. In a full app, we would also verify the token signature
  // and check the user's role against requiredRole.
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
