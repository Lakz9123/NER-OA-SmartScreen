# Security & Offline JWT Strategy

## Overview
NER-OA SmartScreen operates in low-connectivity regions. This poses a challenge for traditional authentication mechanisms which rely on real-time token validation. This document outlines the security architecture and the offline JWT strategy used in the application.

## Offline JWT Strategy

1. **Token Storage**: Upon successful login, the JWT (`access_token`) is stored in `localStorage`. 
2. **Offline Resilience**: The application reads the token from `localStorage` on startup. If present, the user is allowed into the dashboard. When the device is offline, the app *trusts* this token to allow data collection (Screenings).
3. **Data Queueing**: Captured patient and screening data are stored in `localStorage` (`offlineQueue`) when offline.
4. **Re-Authentication on Sync**: When connectivity is restored, the `OfflineQueue` attempts to push data to the backend. The backend validates the JWT. If the JWT has expired, the sync will fail with a `401 Unauthorized`.
5. **Session Expiry**: The user will be forced to log in again if the backend rejects the token. 

## Best Practices Implemented
- **No PII Collection**: To mitigate data exposure risks if a device is stolen while offline, we do not collect names, phone numbers, or exact addresses. We only collect Age Band, Sex, and Village Code.
- **Edge Processing**: The video feed for the AI model is processed entirely on-device (Edge AI) using WebAssembly. No video data is ever sent to the server or saved to the disk.
- **Local State**: State and queue data are ephemeral to the browser.
- **Role-Based Access Control**: The backend enforces `role="admin"` or standard roles for various routes.

## Future Improvements
- **Encrypted LocalStorage**: Using a library to encrypt offline data at rest in IndexedDB/LocalStorage.
- **Short-lived JWTs + Refresh Tokens**: Implementing a refresh token flow to limit access window if a token is compromised.
