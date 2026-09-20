from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class PatientBase(BaseModel):
    age_band: str
    sex: str
    village_code: str
    occupation_type: Optional[str] = None
    consent_flag: bool = False

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: str
    registered_by_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True
        from_attributes = True
