# Manual E2E Test Plan

This document outlines the End-to-End (E2E) testing steps to verify the core flows of the NER-OA SmartScreen application.

## 1. Authentication & Access
- **Test**: Open the app. You should be redirected to `/login`.
- **Test**: Enter invalid credentials. Verify error message appears.
- **Test**: Enter `admin` / `adminpassword`. Verify successful login and redirect to `/dashboard`.

## 2. Patient Registration
- **Test**: Click "New Patient Screening".
- **Test**: Fill out demographic details (Age Band, Sex, Village, Occupation).
- **Test**: Click "Save & Proceed". Verify navigation to Consent screen.
- **Test**: Decline consent. Verify it returns to the dashboard.
- **Test**: Accept consent. Verify navigation to the Questionnaire.

## 3. Clinical Questionnaire
- **Test**: Complete Part 1 (Pain), Part 2 (Stiffness), and Part 3 (Function).
- **Test**: Verify that answering options correctly calculates the WOMAC score in the background.

## 4. Kinematics Capture (Edge AI)
- **Test**: Verify the camera permissions prompt appears and the camera feed is displayed.
- **Test**: Walk back and forth in front of the camera. Verify the scanning laser and progress bar appear when recording.
- **Test**: Verify that it automatically proceeds to the Review screen after capturing.

## 5. Review & ML Analysis
- **Test**: Review the captured parameters (Gait Speed, ROM, Knee Angles).
- **Test**: Click "Analyze Risk".
- **Test**: Verify the loading spinner while it contacts the backend ML model.
- **Test**: Verify the resulting Report page shows Risk Level (High/Moderate/Low), Model Confidence, and the correct metric values.
- **Test**: Verify the synthetic data disclaimer is visible on the report.

## 6. Offline Flow
- **Test**: Turn off network connectivity (via DevTools Network tab -> Offline).
- **Test**: Go through the registration and capture flow.
- **Test**: On the Review screen, click "Analyze Risk".
- **Test**: Verify the app catches the network error, queues the data, and redirects to the Offline Queue.
- **Test**: Turn network connectivity back on.
- **Test**: Go to the Offline Queue page and click "Sync Now". Verify the data is sent to the backend and cleared from the queue.
