# Role & Authentication Test Plan

This document outlines the manual test scenarios to verify that the unified role system (`admin` and `health_worker`) and background sync work correctly, particularly when multiple users share a single device.

## Scenario 1: Basic Role Routing

1. **Login as Health Worker**
   - **Action**: Go to `/login`. Enter `hw_asha` / `password123`.
   - **Expected**: Redirects to `/dashboard`.
   - **Action**: Try to navigate to `/admin/dashboard`.
   - **Expected**: Redirects back to `/dashboard`.

2. **Login as Admin**
   - **Action**: Log out, go to `/login`. Enter `admin` / `adminpassword` (or `admin123` depending on seed).
   - **Expected**: Redirects to `/admin/dashboard`.
   - **Action**: Try to navigate to `/dashboard` (worker routes).
   - **Expected**: Redirects back to `/admin/dashboard`.

## Scenario 2: Shared Device Data Isolation (Sync)

1. **Worker A Creates Offline Data**
   - **Action**: Login as `hw_asha`. Turn off network (simulate offline).
   - **Action**: Go to `/patients/new`, create a patient "John Doe".
   - **Action**: Verify the sync indicator shows unsynced items.
   - **Action**: Click Logout.
   - **Expected**: A warning appears saying data cannot be synced. The local records remain in IndexedDB, tied to `hw_asha`.

2. **Worker B Logs In Offline**
   - **Action**: Login as another health worker (if available) while still offline.
   - **Expected**: The unsynced data from `hw_asha` is **NOT** visible. The sync service does not attempt to upload `hw_asha`'s data under Worker B's token.

3. **Admin Logs In**
   - **Action**: Turn network on. Log in as `admin`.
   - **Expected**: The sync service does **not** push `hw_asha`'s unsynced data. It remains in the IndexedDB outbox.

4. **Worker A Logs In Online**
   - **Action**: Log back in as `hw_asha`.
   - **Expected**: The sync service runs in the background and successfully uploads "John Doe" using `hw_asha`'s token. The local outbox is cleared.

## Scenario 3: Unknown or Missing Roles

1. **Simulate Corrupted LocalStorage**
   - **Action**: Login as `hw_asha`. Open DevTools > Application > Local Storage.
   - **Action**: Edit the `user` key to `{"username":"test","role":"unknown"}`.
   - **Action**: Refresh the page.
   - **Expected**: The app forces a redirect to `/login`.

2. **Simulate Missing Role**
   - **Action**: Login again. Edit the `user` key to `{"username":"test"}` (remove role).
   - **Action**: Refresh the page.
   - **Expected**: The app forces a redirect to `/login`.
