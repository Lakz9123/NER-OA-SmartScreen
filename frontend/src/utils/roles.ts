export type Role = 'admin' | 'health_worker';

/**
 * Safely parse a role from the cached user object.
 * Returns null if the role is missing or unknown.
 */
export function getRole(user: any): Role | null {
  if (!user || !user.role) return null;
  if (user.role === 'admin' || user.role === 'health_worker') {
    return user.role;
  }
  return null;
}

/**
 * Returns the default home path for a given role.
 */
export function homePathFor(role: Role): string {
  if (role === 'admin') {
    return '/admin/dashboard';
  }
  return '/dashboard';
}
