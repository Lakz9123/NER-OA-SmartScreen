import { Navigate, Outlet } from 'react-router-dom';


export default function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Read role from cached user data
  const userStr = localStorage.getItem('user');
  let role = 'hw'; // default if not found
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      role = user.role || 'hw';
    } catch (e) {
      // ignore parse error
    }
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect based on role
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
