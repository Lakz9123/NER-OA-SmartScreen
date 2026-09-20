from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Enum, Float
from sqlalchemy.sql import func
from .base import Base
import uuid

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    age_band = Column(String, nullable=False)
    sex = Column(String, nullable=False)
    village_code = Column(String, nullable=False)
    occupation_type = Column(String)
    consent_flag = Column(Boolean, default=False)
    registered_by_id = Column(Integer) # ID of health worker
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
