import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.deps import get_db
from app.models.base import Base
from app.core.security import create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db_engine():
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db_engine):
    connection = db_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]

@pytest.fixture(scope="function")
def admin_token(db_session):
    from app.models.user import User
    from app.core.security import get_password_hash
    user = User(username="testadmin", email="admin@example.com", hashed_password=get_password_hash("testadmin"), role="admin")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return create_access_token(subject=user.username)

@pytest.fixture(scope="function")
def normal_user_token(db_session):
    from app.models.user import User
    from app.core.security import get_password_hash
    user = User(username="testuser", email="user@example.com", hashed_password=get_password_hash("testuser"), role="health_worker")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return create_access_token(subject=user.username)

@pytest.fixture(scope="function")
def normal_user2_token(db_session):
    from app.models.user import User
    from app.core.security import get_password_hash
    user = User(username="testuser2", email="user2@example.com", hashed_password=get_password_hash("testuser2"), role="health_worker")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return create_access_token(subject=user.username)
