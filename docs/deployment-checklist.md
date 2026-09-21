# Deployment Checklist

## Environment Variables
The following environment variables are required in production for the backend (Render):
- `DATABASE_URL`: PostgreSQL connection string.
- `SECRET_KEY`: A strong secret key (at least 32 characters) for JWT encryption.
- `ENVIRONMENT`: Must be set to `production`.
- `CORS_ORIGINS`: Comma-separated list of exact frontend origins (e.g., `https://ner-oa-smartscreen.vercel.app`). Do not use `*`.
- `SEED_ADMIN_PASSWORD`: Optional, sets the initial admin password on seed.
- `SEED_WORKER_PASSWORD`: Optional, sets the initial worker password on seed.

## Backend Deployment (Render)
1. Use the provided `render.yaml` to deploy the backend.
2. The deployment runs `alembic upgrade head` on build to apply migrations.
3. Ensure PostgreSQL is set up and `DATABASE_URL` is configured correctly.
4. Set the `SECRET_KEY` and `CORS_ORIGINS`.
5. Run `python seed.py` manually (via Render shell or similar) to seed the database initially.

## Frontend Deployment (Vercel)
1. Deploy the `frontend` directory using Vercel.
2. Set the `VITE_API_URL` to point to the backend's URL.
3. The build command should be `npm run build` and output directory `dist`.

## Health Check
- The backend provides a `GET /health` endpoint that can be used for uptime monitoring.
