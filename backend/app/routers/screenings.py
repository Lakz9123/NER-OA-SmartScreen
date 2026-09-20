from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from ..core import deps
from ..models.screening import Screening
from ..models.user import User
from ..schemas.screening import Screening as ScreeningSchema, ScreeningCreate, ScreeningFollowupUpdate
from ..services.ml_service import analyze_risk
from ..core.audit import log_audit

router = APIRouter()

@router.post("/", response_model=ScreeningSchema)
def create_screening(
    screening_in: ScreeningCreate,
    request: Request,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    if current_user.role == "admin":
        raise HTTPException(status_code=403, detail="Admins cannot create screenings")
        
    try:
        risk_result = analyze_risk(screening_in)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Validation or ML Inference Error: {str(e)}")
    
    screening = Screening(
        **screening_in.dict(),
        health_worker_id=current_user.id,
        risk_level=risk_result["risk_level"],
        risk_score=risk_result["risk_score"],
        model_version=risk_result["model_version"],
        explainability_data=risk_result["explainability_data"]
    )
    db.add(screening)
    db.commit()
    db.refresh(screening)
    log_audit(db, action="create", user_id=current_user.id, entity_type="screening", entity_id=screening.id, request=request)
    return screening

@router.get("/{screening_id}", response_model=ScreeningSchema)
def read_screening(
    screening_id: str,
    request: Request,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    screening = db.query(Screening).filter(Screening.id == screening_id).first()
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found")
    if current_user.role != "admin" and screening.health_worker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough privileges to view this screening")
    log_audit(db, action="read", user_id=current_user.id, entity_type="screening", entity_id=screening.id, request=request)
    return screening

@router.get("/patient/{patient_id}", response_model=List[ScreeningSchema])
def read_patient_screenings(
    patient_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    # In a full app, verify the user has access to this patient first
    screenings = db.query(Screening).filter(Screening.patient_id == patient_id).all()
    return screenings

@router.patch("/{screening_id}/followup", response_model=ScreeningSchema)
def update_followup(
    screening_id: str,
    followup_in: ScreeningFollowupUpdate,
    request: Request,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    screening = db.query(Screening).filter(Screening.id == screening_id).first()
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found")
    if current_user.role != "admin" and screening.health_worker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough privileges to update this screening")
    
    screening.followup_status = followup_in.followup_status
    if followup_in.followup_note is not None:
        screening.followup_note = followup_in.followup_note
        
    db.commit()
    db.refresh(screening)
    log_audit(db, action="update_followup", user_id=current_user.id, entity_type="screening", entity_id=screening.id, request=request)
    return screening

