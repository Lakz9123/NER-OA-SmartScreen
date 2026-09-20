from pydantic import BaseModel
from typing import Optional, Dict, Any
from enum import Enum

class FollowupStatus(str, Enum):
    pending = "pending"
    referred = "referred"
    completed = "completed"

from datetime import datetime

class ScreeningBase(BaseModel):
    patient_id: str
    pain_score: int = 0
    stiffness_score: int = 0
    function_score: int = 0
    knee_angle_left: Optional[float] = None
    knee_angle_right: Optional[float] = None
    knee_rom_left: Optional[float] = None
    knee_rom_right: Optional[float] = None
    symmetry_index: Optional[float] = None
    cadence: Optional[float] = None
    step_time: Optional[float] = None

class ScreeningCreate(ScreeningBase):
    pass

class ScreeningUpdate(BaseModel):
    risk_level: str
    risk_score: float
    model_version: str
    explainability_data: Optional[Any] = None

class ScreeningFollowupUpdate(BaseModel):
    followup_status: FollowupStatus
    followup_note: Optional[str] = None

class Screening(ScreeningBase):
    id: str
    health_worker_id: int
    risk_level: Optional[str] = None
    risk_score: Optional[float] = None
    model_version: Optional[str] = None
    explainability_data: Optional[Any] = None
    created_at: datetime
    is_synced: bool
    followup_status: str
    followup_note: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True
