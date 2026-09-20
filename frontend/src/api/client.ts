const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function login(username: string, password: string) {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
  } catch (error: any) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Cannot reach the server. Check your internet or try again.');
    }
    throw error;
  }

  if (response.status === 401 || response.status === 400) {
    throw new Error('Incorrect username or password.');
  }
  if (response.status === 403) {
    throw new Error('Account disabled or unauthorized.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Login failed');
  }

  return response.json();
}

export async function registerPatient(data: any) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/patients/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to register patient');
  }

  return response.json();
}

export async function createScreening(data: any) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/screenings/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create screening');
  }

  return response.json();
}

export async function getMe() {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Unauthorized');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) {
      throw new Error('Server error');
    }
    
    const user = await response.json();
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      throw error;
    }
    // Network error or server error: fallback to cached user
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }
    return { username: 'Offline User', role: 'hw' };
  }
}
