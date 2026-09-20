from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, JSON
from sqlalchemy.sql import func
from .base import Base
import uuid

class Screening(Base):
    __tablename__ = "screenings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    health_worker_id = Column(Integer, ForeignKey("users.id"))
    
    # Symptom Questionnaire Scores
    pain_score = Column(Integer, default=0)
    stiffness_score = Column(Integer, default=0)
    function_score = Column(Integer, default=0)
    
    # Movement Features (MediaPipe derived)
    knee_angle_left = Column(Float, nullable=True)
    knee_angle_right = Column(Float, nullable=True)
    knee_rom_left = Column(Float, nullable=True)
    knee_rom_right = Column(Float, nullable=True)
    symmetry_index = Column(Float, nullable=True)
    cadence = Column(Float, nullable=True)
    step_time = Column(Float, nullable=True)
    
    # Risk Assessment
    risk_level = Column(String) # Low, Moderate, High
    risk_score = Column(Float)
    model_version = Column(String)
    explainability_data = Column(JSON) # Store feature importances for this prediction
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_synced = Column(Boolean, default=True) # Used if synced from offline
