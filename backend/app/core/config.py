from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NER-OA SmartScreen Backend"
    SECRET_KEY: str = "supersecretkey_please_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days for offline field work
    DATABASE_URL: str = "sqlite:///./ner_oa.db"
    CORS_ORIGINS: str = "*"

    class Config:
        env_file = ".env"

settings = Settings()
