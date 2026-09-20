import { syncOutbox } from '../services/syncService';
import { db } from '../db/db';

export async function logout() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (user) {
    if (navigator.onLine) {
      // Try to sync THIS user's records before logging out
      try {
        await syncOutbox(false);
      } catch (err) {
        console.error('Failed to sync before logout', err);
      }
    } else {
      // Check if there are unsynced records
      const pendingCount = await db.outbox.filter(o => o.owner_id === user.id).count();
      if (pendingCount > 0) {
        alert('Unsynced records will upload the next time you log in as this user.');
      }
    }
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
