# NER-OA SmartScreen

NER-OA SmartScreen is an offline-first Progressive Web App (PWA) and clinical screening aid designed for community health workers to assess Osteoarthritis risk in rural populations. 

> [!WARNING]
> **Product Rule:** This tool is a screening aid, NOT a diagnosis. It provides a preliminary risk indication and suggests when clinical evaluation is recommended. Any included machine learning models are trained on synthetic sample data, not clinically validated.

## Architecture
- **Frontend**: React + Vite + TypeScript. Uses `@mediapipe/tasks-vision` for edge-based pose detection. PWA capabilities provided by `vite-plugin-pwa` for offline queuing of screenings. Local state managed via React hooks, and fallback queue in `localStorage`.
- **Backend**: FastAPI + SQLAlchemy + SQLite.
- **Machine Learning**: `train_model.py` generates synthetic sample data to train a logistic regression model. This outputs feature weights (`coef_`) for explainability, displayed on the frontend as contribution factors.

## Setup and Run Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- npm or yarn

### 1. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file (see `.env.example`) and configure your keys.

Run the backend:
```bash
uvicorn app.main:app --reload --port 8000
```
*Wait for the DB to be created. You can optionally run `python seed.py` to create demo users.*

### 2. Frontend Setup
Navigate to the `frontend` directory:
```bash
cd frontend
npm install
```

Create a `.env` file (see `.env.example`) and configure `VITE_API_BASE_URL`.
Use `/api` when testing through the proxy or tunnel, and `http://localhost:8000` when calling the backend directly.

Run the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 3. Test on a phone (via Cloudflare Tunnel)
You can test the app on your mobile device by exposing the local frontend via an HTTPS tunnel (HTTPS is required for camera access).

Steps:
1. Run the backend:
   ```bash
   uvicorn app.main:app --port 8000
   ```
2. Run the frontend:
   ```bash
   npm run dev
   ```
3. Run the tunnel:
   ```bash
   cloudflared tunnel --url http://localhost:5173
   ```
4. Open the printed `https://...trycloudflare.com` link on your phone.

**Troubleshooting:**
- **Blocked Host:** Ensure `allowedHosts: true` is set in `vite.config.ts`.
- **Login Failure:** Ensure backend CORS is set to allow `*` (only for local testing).
- **Camera Permission:** Must use the `https` tunnel link, as browsers block camera access on `http` (except `localhost`).
