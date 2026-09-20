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

Create a `.env` file (see `.env.example`) and point `VITE_API_BASE_URL` to the backend.

Run the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.
