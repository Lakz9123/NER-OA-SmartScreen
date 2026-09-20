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
        delete: vi.fn()
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
    
    global.localStorage = { getItem: vi.fn(() => 'fake-token') } as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('handles success correctly', async () => {
    const mockItems = [
      { id: '1', type: 'PatientSync', payload: { id: 'p1' }, status: 'pending' },
      { id: '2', type: 'ScreeningSync', payload: { id: 's1' }, status: 'pending' }
    ];
    (db.outbox.toArray as any).mockResolvedValue(mockItems);
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          { id: 'p1', type: 'patient', status: 'created' },
          { id: 's1', type: 'screening', status: 'created', server_risk_level: 'High' }
        ]
      })
    });

    const result = await syncOutbox();

    expect(result.success).toBe(true);
    expect(db.outbox.delete).toHaveBeenCalledTimes(2);
    expect(db.patients.update).toHaveBeenCalledWith('p1', { sync_status: 'synced' });
    expect(db.screenings.update).toHaveBeenCalledWith('s1', { sync_status: 'synced', risk_level: 'High' });
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
    
    // Should be marked as failed in outbox
    expect(db.outbox.update).toHaveBeenCalledWith('1', { status: 'failed', reason: 'Network disconnected' });
  });
});
