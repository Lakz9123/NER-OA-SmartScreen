import logging
import dateutil.parser
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..models.patient import Patient
from ..models.screening import Screening
from ..schemas.sync import SyncBatchRequest, SyncBatchResponse, SyncRecordResult, SyncStatusResponse
from ..schemas.screening import ScreeningCreate
from ..core.deps import get_current_active_user
from ..services.ml_service import analyze_risk
from ..core.audit import log_audit

router = APIRouter()

@router.get("/status", response_model=SyncStatusResponse)
def get_sync_status(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    total_patients = db.query(Patient).filter(Patient.registered_by_id == current_user.id).count()
    total_screenings = db.query(Screening).filter(Screening.health_worker_id == current_user.id).count()
    return SyncStatusResponse(total_patients=total_patients, total_screenings=total_screenings)

@router.post("/batch", response_model=SyncBatchResponse)
def sync_batch(
    batch: SyncBatchRequest, 
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    synced_patients = 0
    synced_screenings = 0
    results: List[SyncRecordResult] = []

    # Process patients
    for p_in in batch.patients:
        try:
            existing = db.query(Patient).filter(Patient.id == p_in.id).first()
            if existing:
                results.append(SyncRecordResult(id=p_in.id, type='patient', status='already_synced'))
                continue
            
            new_patient = Patient(
                id=p_in.id,
                age_band=p_in.age_band,
                sex=p_in.sex,
                village_code=p_in.village_code,
                occupation_type=p_in.occupation_type,
                consent_flag=p_in.consent_flag,
                registered_by_id=current_user.id,
                created_at=dateutil.parser.isoparse(p_in.created_at)
            )
            db.add(new_patient)
            db.commit() # Commit per record so one failure doesn't rollback others
            synced_patients += 1
            results.append(SyncRecordResult(id=p_in.id, type='patient', status='created'))
        except Exception as e:
            db.rollback()
            logging.exception(f"Error syncing patient {p_in.id}")
            results.append(SyncRecordResult(id=p_in.id, type='patient', status='failed', reason="An unexpected error occurred."))

    # Process screenings
    for s_in in batch.screenings:
        try:
            existing = db.query(Screening).filter(Screening.id == s_in.id).first()
            if existing:
                updated = False
                if getattr(s_in, 'followup_status', None) is not None and existing.followup_status != s_in.followup_status:
                    existing.followup_status = s_in.followup_status
                    updated = True
                if getattr(s_in, 'followup_note', None) is not None and existing.followup_note != s_in.followup_note:
                    existing.followup_note = s_in.followup_note
                    updated = True
                
                if updated:
                    db.commit()
                    results.append(SyncRecordResult(id=s_in.id, type='screening', status='updated'))
                else:
                    results.append(SyncRecordResult(id=s_in.id, type='screening', status='already_synced'))
                continue

            # Verify patient exists and belongs to current_user
            patient = db.query(Patient).filter(Patient.id == s_in.patient_id).first()
            if not patient:
                results.append(SyncRecordResult(id=s_in.id, type='screening', status='failed', reason="Patient not found"))
                continue
            if patient.registered_by_id != current_user.id:
                results.append(SyncRecordResult(id=s_in.id, type='screening', status='failed', reason="Patient belongs to another user"))
                continue

            # Re-run ML model on server
            screening_data = ScreeningCreate(
                patient_id=s_in.patient_id,
                pain_score=s_in.pain_score,
                stiffness_score=s_in.stiffness_score,
                function_score=s_in.function_score,
                knee_angle_left=s_in.knee_angle_left,
                knee_angle_right=s_in.knee_angle_right,
                knee_rom_left=s_in.knee_rom_left,
                knee_rom_right=s_in.knee_rom_right,
                symmetry_index=s_in.symmetry_index,
                cadence=s_in.cadence,
                step_time=s_in.step_time
            )
            
            ml_result = analyze_risk(screening_data)

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
                risk_level=ml_result['risk_level'],
                risk_score=ml_result['risk_score'],
                model_version=ml_result['model_version'],
                explainability_data=ml_result['explainability_data'],
                created_at=dateutil.parser.isoparse(s_in.created_at)
            )
            db.add(new_screening)
            db.commit()
            synced_screenings += 1
            results.append(SyncRecordResult(
                id=s_in.id, 
                type='screening', 
                status='created',
                server_risk_level=ml_result['risk_level'],
                server_risk_score=ml_result['risk_score'],
                server_model_version=ml_result['model_version'],
                server_explainability_data=ml_result['explainability_data']
            ))
        except Exception as e:
            db.rollback()
            logging.exception(f"Error syncing screening {s_in.id}")
            results.append(SyncRecordResult(id=s_in.id, type='screening', status='failed', reason="An unexpected error occurred."))

    log_audit(db, action="sync", user_id=current_user.id, entity_type="sync_batch", entity_id=None, request=request)

    return SyncBatchResponse(
        synced_patients=synced_patients,
        synced_screenings=synced_screenings,
        results=results
    )
