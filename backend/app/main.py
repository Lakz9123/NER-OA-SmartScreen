import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .core.config import settings
from .routers import auth, patients, screenings, sync, admin

# Accept both ENV and ENVIRONMENT variable names for flexibility
import os
_env = settings.ENV or os.getenv("ENVIRONMENT", "development")

if _env == "production":
    if len(settings.SECRET_KEY) < 32 or settings.SECRET_KEY == "supersecretkey_please_change_in_production":
        print("FATAL: Insecure SECRET_KEY in production mode.")
        sys.exit(1)
    if settings.CORS_ORIGINS == "*":
        print("FATAL: Wildcard CORS_ORIGINS not allowed in production mode.")
        sys.exit(1)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title=settings.PROJECT_NAME)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.CORS_ORIGINS == "*" else [origin.strip() for origin in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(patients.router, prefix="/patients", tags=["patients"])
app.include_router(screenings.router, prefix="/screenings", tags=["screenings"])
app.include_router(sync.router, prefix="/sync", tags=["sync"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

@app.on_event("startup")
def on_startup():
    """Create tables and seed admin user on first startup."""
    from .models.base import Base
    from .models import user, patient, screening  # noqa: ensure models are registered
    from .core.database import engine, SessionLocal
    from .core.security import get_password_hash
    from .models.user import User as UserModel
    import secrets

    # Create all tables (safe no-op if they already exist)
    Base.metadata.create_all(bind=engine)

    # Seed or update admin and worker users
    db = SessionLocal()
    try:
        admin_password = settings.SEED_ADMIN_PASSWORD
        worker_password = settings.SEED_WORKER_PASSWORD
        
        # Admin
        admin_user = db.query(UserModel).filter_by(username="admin").first()
        if not admin_user:
            admin_pass = admin_password or secrets.token_urlsafe(16)
            print(f"[SEED] Creating admin user. Password: {admin_pass}")
            db.add(UserModel(
                username="admin",
                email="admin@ner-oa.local",
                hashed_password=get_password_hash(admin_pass),
                full_name="Administrator",
                role="admin",
                is_active=True,
            ))
        elif admin_password:
            print(f"[SEED] Updating admin password from environment variable.")
            admin_user.hashed_password = get_password_hash(admin_password)

        # Worker
        worker_user = db.query(UserModel).filter_by(username="worker").first()
        if not worker_user:
            worker_pass = worker_password or secrets.token_urlsafe(16)
            print(f"[SEED] Creating worker user. Password: {worker_pass}")
            db.add(UserModel(
                username="worker",
                email="worker@ner-oa.local",
                hashed_password=get_password_hash(worker_pass),
                full_name="Health Worker",
                role="health_worker",
                is_active=True,
            ))
        elif worker_password:
            print(f"[SEED] Updating worker password from environment variable.")
            worker_user.hashed_password = get_password_hash(worker_password)

        db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "NER-OA SmartScreen API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
