import { db } from '../db/db';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const resetSyncingItems = async () => {
  const stuckItems = await db.outbox.where('status').equals('syncing').toArray();
  for (const item of stuckItems) {
    await db.outbox.update(item.id, { status: 'pending' });
  }
};

export const syncOutbox = async () => {
  // Reset any stuck items just in case (though typically called on startup)
  
  const pendingItems = await db.outbox
    .where('status')
    .anyOf('pending', 'failed') // We can retry failed items too when sync is triggered
    .toArray();
    
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

  let response: Response | null = null;
  const token = localStorage.getItem('token');
  
  let retries = 0;
  const maxRetries = 3;
  let delay = 1000;
  let fetchError = null;

  while (retries < maxRetries) {
    try {
      response = await fetch(`${API_BASE_URL}/sync/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      fetchError = null; // Success!
      break; 
    } catch (error: any) {
      fetchError = error;
      retries++;
      if (retries < maxRetries) {
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }

  if (fetchError) {
    // Network error after retries
    for (const item of pendingItems) {
      // Restore previous status or mark failed
      await db.outbox.update(item.id, { status: 'failed', reason: fetchError.message || 'Network error' });
    }
    return { success: false, message: 'Network error during sync.' };
  }

  if (!response) {
    return { success: false, message: 'Unknown error.' };
  }

  if (response.status === 401) {
    for (const item of pendingItems) {
      await db.outbox.update(item.id, { status: 'pending' }); // Keep pending
    }
    return { success: false, message: 'Please log in again to sync' };
  }

  if (!response.ok) {
    for (const item of pendingItems) {
      await db.outbox.update(item.id, { status: 'failed', reason: `Server error: ${response.status}` });
    }
    return { success: false, message: `Sync failed with status: ${response.status}` };
  }

  const data = await response.json();
  const results = data.results || [];

  for (const item of pendingItems) {
    const result = results.find((r: any) => r.id === item.payload.id);
    if (!result) {
      // Server didn't process it? Mark failed
      await db.outbox.update(item.id, { status: 'failed', reason: 'Server did not return a result for this record' });
      continue;
    }

    if (result.status === 'created' || result.status === 'already_synced') {
      await db.outbox.delete(item.id);
      if (item.type === 'PatientSync') {
        await db.patients.update(item.payload.id, { sync_status: 'synced' });
      } else if (item.type === 'ScreeningSync') {
        const updateData: any = { sync_status: 'synced' };
        if (result.server_risk_level) updateData.risk_level = result.server_risk_level;
        if (result.server_risk_score !== undefined) updateData.risk_score = result.server_risk_score;
        await db.screenings.update(item.payload.id, updateData);
      }
    } else {
      // Failed
      await db.outbox.update(item.id, { status: 'failed', reason: result.reason || 'Unknown error' });
      if (item.type === 'PatientSync') {
        await db.patients.update(item.payload.id, { sync_status: 'failed' });
      } else if (item.type === 'ScreeningSync') {
        await db.screenings.update(item.payload.id, { sync_status: 'failed' });
      }
    }
  }

  return { success: true, message: `Synced successfully.` };
};
