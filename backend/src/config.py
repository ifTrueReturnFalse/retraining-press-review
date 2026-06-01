from pathlib import Path
from pydantic import EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    DATABASE_URL: str
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    DATABASE: str

    FIRST_USER_EMAIL: EmailStr = "test@test.com"
    FIRST_USER_PASSWORD: str = "password"

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8"
    )


settings = Settings()
