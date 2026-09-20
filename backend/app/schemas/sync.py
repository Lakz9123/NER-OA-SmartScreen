from pydantic import BaseModel
from typing import List, Optional
from .patient import PatientCreate, Patient
from .screening import ScreeningCreate, Screening

class PatientSyncItem(BaseModel):
    id: str
    age_band: str
    sex: str
    village_code: str
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

class SyncBatchRequest(BaseModel):
    patients: List[PatientSyncItem] = []
    screenings: List[ScreeningSyncItem] = []

class SyncBatchResponse(BaseModel):
    synced_patients: int
    synced_screenings: int
    errors: List[str] = []
