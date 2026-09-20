from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .routers import auth, patients, screenings, sync, admin
from .models.base import Base
from .models.user import User
from .core.database import engine, SessionLocal
from .core.security import get_password_hash

# Create all tables
Base.metadata.create_all(bind=engine)

# Auto-seed default users if DB is empty
def seed_default_users():
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "admin").first():
            db.add(User(
                username="admin",
                email="admin@ner-oa.in",
                full_name="System Admin",
                role="admin",
                hashed_password=get_password_hash("admin123")
            ))
        if not db.query(User).filter(User.username == "hw_asha").first():
            db.add(User(
                username="hw_asha",
                email="asha@ner-oa.in",
                full_name="Asha (Health Worker)",
                role="health_worker",
                hashed_password=get_password_hash("password123")
            ))
        db.commit()
    finally:
        db.close()

seed_default_users()

app = FastAPI(title=settings.PROJECT_NAME)

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

@app.get("/")
def root():
    return {"message": "NER-OA SmartScreen API is running"}
