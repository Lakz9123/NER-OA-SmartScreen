from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from ..core import deps, security
from ..core.audit import log_audit
from ..models.user import User
from ..models.audit_log import AuditLog
from ..models.screening import Screening
from ..models.patient import Patient
from ..schemas.user import User as UserSchema, UserCreate, UserUpdate
from ..schemas.admin import AuditLogsResponse, AnalyticsSummary, AuditLogSchema

router = APIRouter()

@router.get("/analytics/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    db: Session = Depends(deps.get_db),
    current_admin: User = Depends(deps.get_current_admin_user)
):
    total_screenings = db.query(Screening).count()
    
    # By risk level
    risk_counts = db.query(Screening.risk_level, func.count(Screening.id)).group_by(Screening.risk_level).all()
    screenings_by_risk = {level: count for level, count in risk_counts if level}
    
    # Total referrals and pending
    referrals = db.query(Screening).filter(Screening.followup_status == "referred").count()
    pending_followups = db.query(Screening).filter(Screening.followup_status == "pending").count()
    
    # Screenings per day (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    day_counts = (
        db.query(func.date(Screening.created_at).label('date'), func.count(Screening.id))
        .filter(Screening.created_at >= thirty_days_ago)
        .group_by(func.date(Screening.created_at))
        .all()
    )
    screenings_per_day = {str(day): count for day, count in day_counts}
    
    # By village (join via Patient)
    village_counts = (
        db.query(Patient.village_code, func.count(Screening.id))
        .join(Screening, Patient.id == Screening.patient_id)
        .group_by(Patient.village_code)
        .all()
    )
    screenings_by_village = {code: count for code, count in village_counts}
    
    return AnalyticsSummary(
        total_screenings=total_screenings,
        screenings_by_risk=screenings_by_risk,
        referrals=referrals,
        pending_followups=pending_followups,
        screenings_per_day=screenings_per_day,
        screenings_by_village=screenings_by_village
    )

@router.get("/audit-logs", response_model=AuditLogsResponse)
def get_audit_logs(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(deps.get_db),
    current_admin: User = Depends(deps.get_current_admin_user)
):
    query = db.query(AuditLog)
    
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if action:
        query = query.filter(AuditLog.action == action)
    if date_from:
        query = query.filter(AuditLog.timestamp >= date_from)
    if date_to:
        query = query.filter(AuditLog.timestamp <= date_to)
        
    total = query.count()
    items = query.order_by(AuditLog.timestamp.desc()).offset((page - 1) * size).limit(size).all()
    
    return AuditLogsResponse(total=total, page=page, size=size, items=items)

@router.get("/users", response_model=List[UserSchema])
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_admin: User = Depends(deps.get_current_admin_user)
):
    return db.query(User).offset(skip).limit(limit).all()

@router.post("/users", response_model=UserSchema)
def create_user(
    user_in: UserCreate,
    request: Request,
    db: Session = Depends(deps.get_db),
    current_admin: User = Depends(deps.get_current_admin_user)
):
    existing_user = db.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
        
    user_obj = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        facility=user_in.facility
    )
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    
    log_audit(db, action="create_user", user_id=current_admin.id, entity_type="user", entity_id=str(user_obj.id), request=request)
    return user_obj

@router.patch("/users/{user_id}", response_model=UserSchema)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    request: Request,
    db: Session = Depends(deps.get_db),
    current_admin: User = Depends(deps.get_current_admin_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_in.role is not None:
        if user_id == current_admin.id and user_in.role != "admin":
            raise HTTPException(status_code=400, detail="Cannot remove own admin role")
        user.role = user_in.role
    if user_in.facility is not None:
        user.facility = user_in.facility
    if user_in.is_active is not None:
        if user_id == current_admin.id and not user_in.is_active:
            raise HTTPException(status_code=400, detail="Cannot disable own account")
        user.is_active = user_in.is_active
    if user_in.password is not None:
        user.hashed_password = security.get_password_hash(user_in.password)
        
    db.commit()
    db.refresh(user)
    
    log_audit(db, action="update_user", user_id=current_admin.id, entity_type="user", entity_id=str(user.id), request=request)
    return user
