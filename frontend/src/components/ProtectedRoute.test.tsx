import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Helper component to show where we ended up
function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
}

function renderRoute(initialPath: string, allowedRoles?: string[]) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        {/* Protected route we are testing */}
        <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
          <Route path="/worker-path" element={<div>Worker Content</div>} />
          <Route path="/admin-path" element={<div>Admin Content</div>} />
        </Route>
        
        {/* Destination routes for redirects */}
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Worker Home</div>} />
        <Route path="/admin/dashboard" element={<div>Admin Home</div>} />
        
        {/* Catch-all location display to verify where we ended up */}
        <Route path="*" element={<LocationDisplay />} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(cleanup);

  it('redirects to /login if no token', () => {
    renderRoute('/worker-path', ['health_worker']);
    expect(screen.getByTestId('location-display').textContent).toBe('/login');
  });

  it('redirects to /login if token exists but role is missing', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ username: 'test' })); // missing role
    
    renderRoute('/worker-path', ['health_worker']);
    expect(screen.getByTestId('location-display').textContent).toBe('/login');
  });

  it('redirects to /login if token exists but role is unknown', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ username: 'test', role: 'unknown_role' }));
    
    renderRoute('/worker-path', ['health_worker']);
    expect(screen.getByTestId('location-display').textContent).toBe('/login');
  });

  describe('when user is health_worker', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('user', JSON.stringify({ role: 'health_worker' }));
    });

    it('allows access to health_worker allowed routes', () => {
      renderRoute('/worker-path', ['health_worker']);
      expect(screen.getByText('Worker Content')).toBeDefined();
    });

    it('redirects from admin allowed routes to /dashboard', () => {
      renderRoute('/admin-path', ['admin']);
      expect(screen.getByTestId('location-display').textContent).toBe('/dashboard');
    });
  });

  describe('when user is admin', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
    });

    it('allows access to admin allowed routes', () => {
      renderRoute('/admin-path', ['admin']);
      expect(screen.getByText('Admin Content')).toBeDefined();
    });

    it('redirects from health_worker allowed routes to /admin/dashboard', () => {
      renderRoute('/worker-path', ['health_worker']);
      expect(screen.getByTestId('location-display').textContent).toBe('/admin/dashboard');
    });
  });
});
