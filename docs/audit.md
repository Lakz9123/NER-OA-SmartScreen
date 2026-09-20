# Project Audit: NER-OA SmartScreen

This audit reviews the current state of the codebase against the requirements of the Phase 0-6 improvement plan.

## 0. Housekeeping
*   **Done**: Frontend and Backend directories exist.
*   **Broken/Missing**:
    *   `backend/requirements.txt` is empty.
    *   Root `.gitignore` and `.env.example` are missing.
    *   Unused/duplicate pages (`Capture.tsx`, `Analysis.tsx`, `Questionnaire.tsx`) are still present in `frontend/src/pages/`.
    *   `SECRET_KEY` is hardcoded in `backend/app/core/config.py`. CORS origins are not configurable via `.env`.
    *   Frontend lacks a `ProtectedRoute` wrapper; `Dashboard.tsx` uses hardcoded user data ("hw_asha") instead of `GET /auth/me`.
    *   Missing `README.md` with setup/run steps.

## 1. Data Contract
*   **Done**: `backend/app/models/screening.py` defines some of the required fields (`pain_score`, `stiffness_score`, `function_score`, `knee_angle_left`, `knee_angle_right`, `symmetry_index`, `cadence`, `step_time`, `risk_level`, `risk_score`, `model_version`, `explainability_data`).
*   **Broken/Missing**:
    *   `backend/app/models/screening.py` is missing `knee_rom_left` and `knee_rom_right`.
    *   `CaptureReview.tsx` payload doesn't match the new data contract (sends `womac_pain_score`, `gait_speed`, etc. instead of the exact agreed fields).
    *   Proper scoring calculation for `pain_score`, `stiffness_score`, `function_score` is missing. Scoring docs (`/docs/scoring.md`) are missing.
    *   TypeScript types (`Patient`, `Screening`, `RiskResult`) are missing in `/src/types`.
    *   Patient model and registration flow still contain PII (first name, last name, dob, phone) instead of minimal data (age band, sex, village code, occupation, consent).
    *   Result flow mismatch: `CaptureReview` uses `state.result` but `RiskAnalysis` expects `state.analysisData` (or similar mismatch). Fake "offline-mock" fallback still exists.

## 2. Real Movement Analysis
*   **Done**: Basic MediaPipe setup exists in `CaptureTracking.tsx`.
*   **Broken/Missing**:
    *   `CaptureTracking.tsx` relies on a fake progress simulation and hard-coded telemetry.
    *   Real 10-second guided capture with pose landmark recording is missing.
    *   `/src/features/gait.ts` (pure functions for knee angle, ROM, cadence, step time, symmetry) is missing.
    *   Unit tests for gait features are missing.
    *   `/src/capture/quality.ts` (landmark visibility, body in frame) and a "Recapture" flow are missing.
    *   Real measurements and knee-angle-over-time chart are missing in `CaptureReview.tsx`.

## 3. Risk Model and Explainability
*   **Done**: Nothing yet.
*   **Broken/Missing**:
    *   `/ml/data_gen.py`, `train.py`, `evaluate.py`, `export_model.py` are missing.
    *   Synthetic data label is missing across the app.
    *   `model.json` and `model.pkl` are missing.
    *   Frontend `/src/risk/riskModel.ts` to compute risk offline is missing.
    *   `RiskAnalysis.tsx` lacks real contribution bars and proper referral flag.
    *   Backend `services/risk.py` and endpoints `POST /risk/predict` / `GET /model/current` are missing.

## 4. Offline-First and PWA
*   **Done**: Vite PWA plugin might be configured partially, but offline DB is missing.
*   **Broken/Missing**:
    *   Dexie (IndexedDB) setup for offline storage (`patients`, `screenings`, `outbox`) is missing. Client-generated UUID logic needs enforcement.
    *   Sync service (background pushing to backend) is missing.
    *   Backend `POST /sync/batch` and `GET /sync/status` are missing.
    *   `OfflineQueue.tsx` and `PatientList.tsx` use mock data instead of IndexedDB.
    *   PWA assets (icons, manifest config) and precise precaching (model.json, MediaPipe task/WASM) are missing or incomplete.
    *   Offline login caching is missing.

## 5. Report, Languages, Admin
*   **Done**: Static report page exists.
*   **Broken/Missing**:
    *   PDF report generation (backend `GET /reports/{id}.pdf` or frontend-based) is missing.
    *   i18n (react-i18next) is completely missing.
    *   Backend `facilities`, `audit_logs` tables, logging logic, `PATCH /screenings/{id}/followup`, `GET /analytics/summary` are missing.
    *   Frontend Admin pages (analytics dashboard, users, audit-log) are missing.
    *   Patient history page with follow-up status and trend chart is missing.

## 6. Quality and Security Pass
*   **Done**: Basic layout matching designs.
*   **Done**: Strict TypeScript checks, error boundaries, loading/empty states are complete.
*   **Done**: Backend validation, rate limiting, role checks, Alembic migrations, Pytest suite are complete.
*   **Done**: JWT storage strategy review (`/docs/security.md`) is complete.
*   **Done**: Test plan (`/docs/test-plan.md`) is complete.
*   **Done**: Final README updates (architecture, screenshots, demo script) are complete.
