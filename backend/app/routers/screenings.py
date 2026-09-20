from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core import deps
from ..models.screening import Screening
from ..models.user import User
from ..schemas.screening import Screening as ScreeningSchema, ScreeningCreate
from ..services.ml_service import analyze_risk

router = APIRouter()

@router.post("/", response_model=ScreeningSchema)
def create_screening(
    screening_in: ScreeningCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    # Analyze risk
    risk_result = analyze_risk(screening_in)
    
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
    return screening

@router.get("/{screening_id}", response_model=ScreeningSchema)
def read_screening(
    screening_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    screening = db.query(Screening).filter(Screening.id == screening_id).first()
    if not screening:
        raise HTTPException(status_code=404, detail="Screening not found")
    if current_user.role != "admin" and screening.health_worker_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough privileges to view this screening")
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
