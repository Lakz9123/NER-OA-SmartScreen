from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..models.patient import Patient
from ..models.screening import Screening
from ..schemas.sync import SyncBatchRequest, SyncBatchResponse
from ..core.deps import get_current_user

router = APIRouter()

@router.post("/batch", response_model=SyncBatchResponse)
def sync_batch(
    batch: SyncBatchRequest, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    synced_patients = 0
    synced_screenings = 0
    errors = []

    # Process patients
    for p_in in batch.patients:
        try:
            existing = db.query(Patient).filter(Patient.id == p_in.id).first()
            if not existing:
                new_patient = Patient(
                    id=p_in.id,
                    age_band=p_in.age_band,
                    sex=p_in.sex,
                    village_code=p_in.village_code,
                    consent_flag=p_in.consent_flag,
                    registered_by_id=current_user.id
                )
                db.add(new_patient)
                synced_patients += 1
        except Exception as e:
            errors.append(f"Failed to sync patient {p_in.id}: {str(e)}")

    # Process screenings
    for s_in in batch.screenings:
        try:
            existing = db.query(Screening).filter(Screening.id == s_in.id).first()
            if not existing:
                new_screening = Screening(
                    id=s_in.id,
                    patient_id=s_in.patient_id,
                    health_worker_id=current_user.id,
                    pain_score=s_in.pain_score,
                    stiffness_score=s_in.stiffness_score,
                    function_score=s_in.function_score,
                    knee_angle_left=s_in.knee_angle_left,
                    knee_angle_right=s_in.knee_angle_right,
                    knee_rom_left=s_in.knee_rom_left,
                    knee_rom_right=s_in.knee_rom_right,
                    symmetry_index=s_in.symmetry_index,
                    cadence=s_in.cadence,
                    step_time=s_in.step_time,
                    risk_level=s_in.risk_level,
                    risk_score=s_in.risk_score,
                    model_version=s_in.model_version,
                    explainability_data=s_in.explainability_data
                )
                db.add(new_screening)
                synced_screenings += 1
        except Exception as e:
            errors.append(f"Failed to sync screening {s_in.id}: {str(e)}")

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database commit failed: {str(e)}")

    return SyncBatchResponse(
        synced_patients=synced_patients,
        synced_screenings=synced_screenings,
        errors=errors
    )
