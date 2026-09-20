from pydantic import BaseModel
from typing import List, Optional
from .patient import PatientCreate, Patient
from .screening import ScreeningCreate, Screening, FollowupStatus

class PatientSyncItem(BaseModel):
    id: str
    age_band: str
    sex: str
    village_code: str
    occupation_type: Optional[str] = None
    consent_flag: bool
    created_at: str

class ScreeningSyncItem(BaseModel):
    id: str
    patient_id: str
    pain_score: int
    stiffness_score: int
    function_score: int
    knee_angle_left: Optional[float] = None
    knee_angle_right: Optional[float] = None
    knee_rom_left: Optional[float] = None
    knee_rom_right: Optional[float] = None
    symmetry_index: Optional[float] = None
    cadence: Optional[float] = None
    step_time: Optional[float] = None
    risk_level: str
    risk_score: float
    model_version: str
    explainability_data: Optional[dict] = None
    created_at: str
    followup_status: Optional[FollowupStatus] = None
    followup_note: Optional[str] = None

class SyncBatchRequest(BaseModel):
    patients: List[PatientSyncItem] = []
    screenings: List[ScreeningSyncItem] = []

class SyncRecordResult(BaseModel):
    id: str
    type: str # 'patient' or 'screening'
    status: str # 'created', 'already_synced', or 'failed'
    reason: Optional[str] = None
    server_risk_level: Optional[str] = None
    server_risk_score: Optional[float] = None
    server_model_version: Optional[str] = None
    server_explainability_data: Optional[dict] = None

class SyncBatchResponse(BaseModel):
    synced_patients: int
    synced_screenings: int
    results: List[SyncRecordResult] = []

class SyncStatusResponse(BaseModel):
    total_patients: int
    total_screenings: int
