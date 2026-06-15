from pathlib import Path
from pydantic import EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    APP_ENV: str = "production"
    
    DATABASE_URL: str
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    DATABASE: str

    FIRST_USER_EMAIL: EmailStr = "test@test.com"
    FIRST_USER_PASSWORD: str = "password"

    JWT_SECRET_KEY: str = "ultra_secret_key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 240  # 4h

    MISTRAL_API_KEY: str

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8"
    )


settings = Settings()
