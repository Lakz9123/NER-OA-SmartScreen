from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core import deps
from ..models.patient import Patient
from ..models.user import User
from ..schemas.patient import Patient as PatientSchema, PatientCreate

router = APIRouter()

@router.post("/", response_model=PatientSchema)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    patient = Patient(
        **patient_in.dict(),
        registered_by_id=current_user.id
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

@router.get("/", response_model=List[PatientSchema])
def read_patients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    # Only return patients registered by this user unless they are admin
    if current_user.role == "admin":
        patients = db.query(Patient).offset(skip).limit(limit).all()
    else:
        patients = db.query(Patient).filter(Patient.registered_by_id == current_user.id).offset(skip).limit(limit).all()
    return patients

@router.get("/{patient_id}", response_model=PatientSchema)
def read_patient(
    patient_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if current_user.role != "admin" and patient.registered_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough privileges to view this patient")
    return patient
