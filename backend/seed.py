import secrets
from app.core.database import SessionLocal, engine
from app.models.base import Base
from app.models.user import User
from app.core.security import get_password_hash
from app.core.config import settings

def seed_users():
    db = SessionLocal()
    
    admin_exists = db.query(User).filter(User.username == "admin").first()
    hw_exists = db.query(User).filter(User.username == "hw_asha").first()

    admin_pw = settings.SEED_ADMIN_PASSWORD
    worker_pw = settings.SEED_WORKER_PASSWORD

    if not admin_pw:
        admin_pw = secrets.token_urlsafe(12)
        print(f"Generated default admin password: {admin_pw}")
    if not worker_pw:
        worker_pw = secrets.token_urlsafe(12)
        print(f"Generated default worker password: {worker_pw}")

    if not admin_exists:
        admin = User(
            username="admin",
            email="admin@ner-oa.in",
            full_name="System Admin",
            role="admin",
            hashed_password=get_password_hash(admin_pw)
        )
        db.add(admin)
        
    if not hw_exists:
        health_worker = User(
            username="hw_asha",
            email="asha@ner-oa.in",
            full_name="Asha (Health Worker)",
            role="health_worker",
            hashed_password=get_password_hash(worker_pw)
        )
        db.add(health_worker)

    db.commit()
    print("Successfully seeded users!")
    db.close()

if __name__ == "__main__":
    seed_users()
