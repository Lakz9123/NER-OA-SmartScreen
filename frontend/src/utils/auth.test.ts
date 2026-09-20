import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { logout } from './auth';
import { db } from '../db/db';
import * as syncService from '../services/syncService';

describe('auth utilities', () => {
  beforeEach(async () => {
    localStorage.clear();
    await db.outbox.clear();
    vi.stubGlobal('location', { href: '' });
    vi.stubGlobal('alert', vi.fn());
    // Mock navigator.onLine
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logout clears token and user from localStorage', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ id: 123 }));

    await logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('logout attempts sync if online', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 123 }));
    const syncSpy = vi.spyOn(syncService, 'syncOutbox').mockResolvedValue({ success: true, message: '' });
    
    await logout();

    expect(syncSpy).toHaveBeenCalledWith(false);
  });

  it('logout warns if offline and there are pending records', async () => {
    // Offline
    Object.defineProperty(window.navigator, 'onLine', { value: false });
    
    localStorage.setItem('user', JSON.stringify({ id: 123 }));
    
    // Add pending record
    await db.outbox.add({
      id: 'test-outbox-id-1',
      owner_id: 123,
      type: 'PatientSync',
      payload: {},
      status: 'pending',
      created_at: new Date().toISOString()
    });

    await logout();

    expect(window.alert).toHaveBeenCalledWith('Unsynced records will upload the next time you log in as this user.');
    expect(localStorage.getItem('token')).toBeNull(); // Still logs out
  });
});
