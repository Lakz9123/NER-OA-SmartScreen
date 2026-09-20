from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..core import deps, security
from ..core.config import settings
from ..models.user import User
from ..schemas.token import Token
from ..schemas.user import User as UserSchema, UserCreate
from ..core.audit import log_audit

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(request: Request, db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        log_audit(db, action="login_failed", user_id=None, entity_type="user", entity_id=form_data.username, request=request)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        log_audit(db, action="login_failed", user_id=user.id, entity_type="user", entity_id=str(user.id), request=request)
        raise HTTPException(status_code=403, detail="Account disabled")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.username, expires_delta=access_token_expires
    )
    log_audit(db, action="login", user_id=user.id, entity_type="user", entity_id=str(user.id), request=request)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserSchema)
def register_user(user_in: UserCreate, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user_by_email = db.query(User).filter(User.email == user_in.email).first()
    if user_by_email:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    user_obj = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj

@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(deps.get_current_active_user)):
    return current_user
