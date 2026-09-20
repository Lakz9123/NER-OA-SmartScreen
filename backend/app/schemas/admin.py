from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class AuditLogSchema(BaseModel):
    id: int
    timestamp: datetime
    user_id: Optional[int] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    ip: Optional[str] = None
    
    class Config:
        orm_mode = True
        from_attributes = True

class AuditLogsResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[AuditLogSchema]

class AnalyticsSummary(BaseModel):
    total_screenings: int
    screenings_by_risk: Dict[str, int]
    referrals: int
    pending_followups: int
    screenings_per_day: Dict[str, int]
    screenings_by_village: Dict[str, int]
