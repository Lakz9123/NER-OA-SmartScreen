import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .core.config import settings
from .routers import auth, patients, screenings, sync, admin

if settings.ENV == "production":
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

@app.get("/")
def root():
    return {"message": "NER-OA SmartScreen API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}
