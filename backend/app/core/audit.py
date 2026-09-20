from sqlalchemy.orm import Session
from fastapi import Request
from typing import Optional
from ..models.audit_log import AuditLog

def log_audit(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    request: Optional[Request] = None
):
    ip = request.client.host if request and request.client else None
    
    audit_entry = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id else None,
        ip=ip
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry
