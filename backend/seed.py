from app.core.database import SessionLocal, engine
from app.models.base import Base
from app.models.user import User
from app.core.security import get_password_hash

# Create tables
Base.metadata.create_all(bind=engine)

def seed_users():
    db = SessionLocal()
    
    admin_exists = db.query(User).filter(User.username == "admin").first()
    hw_exists = db.query(User).filter(User.username == "hw_asha").first()

    if not admin_exists:
        admin = User(
            username="admin",
            email="admin@ner-oa.in",
            full_name="System Admin",
            role="admin",
            hashed_password=get_password_hash("admin123")
        )
        db.add(admin)
        
    if not hw_exists:
        health_worker = User(
            username="hw_asha",
            email="asha@ner-oa.in",
            full_name="Asha (Health Worker)",
            role="health_worker",
            hashed_password=get_password_hash("password123")
        )
        db.add(health_worker)

    db.commit()
    print("Successfully seeded users!")
    db.close()

if __name__ == "__main__":
    seed_users()
