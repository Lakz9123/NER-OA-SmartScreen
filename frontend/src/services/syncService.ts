import { db } from '../db/db';

const API_BASE_URL = '/api';

export const syncOutbox = async () => {
  const pendingItems = await db.outbox.where('status').equals('pending').toArray();
  
  if (pendingItems.length === 0) {
    return { success: true, message: 'Nothing to sync' };
  }

  // Mark as syncing
  for (const item of pendingItems) {
    await db.outbox.update(item.id, { status: 'syncing' });
  }

  const payload = {
    patients: pendingItems.filter(i => i.type === 'PatientSync').map(i => i.payload),
    screenings: pendingItems.filter(i => i.type === 'ScreeningSync').map(i => i.payload)
  };

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/sync/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Sync failed with status: ${response.status}`);
    }

    // Success, remove from outbox and update entities
    for (const item of pendingItems) {
      await db.outbox.delete(item.id);
      if (item.type === 'PatientSync') {
        await db.patients.update(item.payload.id, { sync_status: 'synced' });
      } else if (item.type === 'ScreeningSync') {
        await db.screenings.update(item.payload.id, { sync_status: 'synced' });
      }
    }

    return { success: true, message: `Synced ${pendingItems.length} records successfully.` };
  } catch (error: any) {
    // Revert status to pending so they can be tried again
    for (const item of pendingItems) {
      await db.outbox.update(item.id, { status: 'pending' });
    }
    return { success: false, message: error.message || 'Sync failed.' };
  }
};
