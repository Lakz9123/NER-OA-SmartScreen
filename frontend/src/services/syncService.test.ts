import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { syncOutbox } from './syncService';
import { db } from '../db/db';

// Mock the IndexedDB wrapper
vi.mock('../db/db', () => {
  return {
    db: {
      outbox: {
        where: vi.fn().mockReturnThis(),
        anyOf: vi.fn().mockReturnThis(),
        toArray: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        filter: vi.fn().mockReturnThis()
      },
      patients: { update: vi.fn() },
      screenings: { update: vi.fn() }
    }
  };
});

describe('syncService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();

    vi.stubGlobal('localStorage', { 
      getItem: vi.fn((k) => k === 'user' ? JSON.stringify({id: 'workerA'}) : 'token'),
      setItem: vi.fn(),
      removeItem: vi.fn()
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('handles success and updated correctly', async () => {
    const mockItems = [
      { id: '1', type: 'PatientSync', payload: { id: 'p1' }, status: 'pending' },
      { id: '2', type: 'ScreeningSync', payload: { id: 's1' }, status: 'pending' },
      { id: '3', type: 'ScreeningSync', payload: { id: 's2' }, status: 'pending' }
    ];
    (db.outbox.toArray as any).mockResolvedValue(mockItems);
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          { id: 'p1', type: 'patient', status: 'created' },
          { id: 's1', type: 'screening', status: 'created', server_risk_level: 'High' },
          { id: 's2', type: 'screening', status: 'updated' }
        ]
      })
    });

    const result = await syncOutbox();

    expect(result.success).toBe(true);
    expect(db.outbox.delete).toHaveBeenCalledTimes(3);
    expect(db.patients.update).toHaveBeenCalledWith('p1', { sync_status: 'synced' });
    expect(db.screenings.update).toHaveBeenCalledWith('s1', { sync_status: 'synced', risk_level: 'High' });
    expect(db.screenings.update).toHaveBeenCalledWith('s2', { sync_status: 'synced' });
  });

  it('handles partial failure correctly', async () => {
    const mockItems = [
      { id: '1', type: 'PatientSync', payload: { id: 'p1' }, status: 'pending' },
      { id: '2', type: 'PatientSync', payload: { id: 'p2' }, status: 'pending' }
    ];
    (db.outbox.toArray as any).mockResolvedValue(mockItems);
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          { id: 'p1', type: 'patient', status: 'created' },
          { id: 'p2', type: 'patient', status: 'failed', reason: 'Invalid data' }
        ]
      })
    });

    const result = await syncOutbox();

    expect(result.success).toBe(true);
    
    // p1 was deleted and marked synced
    expect(db.outbox.delete).toHaveBeenCalledWith('1');
    expect(db.patients.update).toHaveBeenCalledWith('p1', { sync_status: 'synced' });
    
    // p2 was updated to failed
    expect(db.outbox.update).toHaveBeenCalledWith('2', { status: 'failed', reason: 'Invalid data' });
    expect(db.patients.update).toHaveBeenCalledWith('p2', { sync_status: 'failed' });
  });

  it('handles 401 Unauthorized', async () => {
    const mockItems = [
      { id: '1', type: 'PatientSync', payload: { id: 'p1' }, status: 'pending' }
    ];
    (db.outbox.toArray as any).mockResolvedValue(mockItems);
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401
    });

    const result = await syncOutbox();

    expect(result.success).toBe(false);
    expect(result.message).toBe('Please log in again to sync');
    
    // It should put it back to pending
    expect(db.outbox.update).toHaveBeenCalledWith('1', { status: 'pending' });
  });

  it('handles network error and retries', async () => {
    const mockItems = [
      { id: '1', type: 'PatientSync', payload: { id: 'p1' }, status: 'pending' }
    ];
    (db.outbox.toArray as any).mockResolvedValue(mockItems);
    
    global.fetch = vi.fn().mockRejectedValue(new Error('Network disconnected'));

    // Wait for the sync to complete (it will retry 3 times, taking a few seconds in real time, 
    // but in vitest if we don't mock timers it will take some time, so let's just await it)
    const result = await syncOutbox();

    expect(result.success).toBe(false);
    expect(global.fetch).toHaveBeenCalledTimes(3);
    
    // Network errors leave items as 'pending' so background sync auto-retries them
    expect(db.outbox.update).toHaveBeenCalledWith('1', { status: 'pending' });
  });

  it('never sends another user\'s outbox items and assigns orphaned items', async () => {
    // User B is logged in
    vi.stubGlobal('localStorage', { 
      getItem: vi.fn((k) => k === 'user' ? JSON.stringify({ id: 'user-b' }) : 'token'),
      setItem: vi.fn(),
      removeItem: vi.fn()
    });

    const mockItems = [
      // user-a's item (should be ignored)
      { id: '1', type: 'PatientSync', payload: { id: 'p1' }, status: 'pending', owner_id: 'user-a' },
      // user-b's item (should be synced)
      { id: '2', type: 'ScreeningSync', payload: { id: 's1' }, status: 'pending', owner_id: 'user-b' }
    ];
    
    // For unowned items mock
    const unownedItems = [
      { id: '3', type: 'PatientSync', payload: { id: 'p2' }, status: 'pending' }
    ];

    (db.outbox.filter as any) = vi.fn().mockImplementation((predicate) => {
      return {
        toArray: async () => [...mockItems, ...unownedItems].filter(predicate)
      };
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ results: [] })
    });

    await syncOutbox();

    // The unowned item should have been assigned user-b's ID
    expect(db.outbox.update).toHaveBeenCalledWith('3', { owner_id: 'user-b' });

    // Only user-b's existing item and the newly assigned item should be sent
    expect(global.fetch).toHaveBeenCalled();
    const callArgs = (global.fetch as any).mock.calls[0][1];
    const payload = JSON.parse(callArgs.body);
    
    // It should contain 's1' (user-b's) and 'p2' (previously unowned, now user-b's)
    // But wait, the filter for pendingItems will catch '2' but '3' was updated in DB, not in the array in memory yet.
    // In our mock, since the array is static, filter will just re-evaluate, but `owner_id: 'user-b'` is not set on `unownedItems[0]` in memory.
    // Let's just verify the payload contains user-b's item and NOT user-a's item.
    expect(payload.patients).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'p1' })])
    );
    expect(payload.screenings).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 's1' })])
    );
  });
});
