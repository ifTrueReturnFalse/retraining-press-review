"""Application configuration management.

This module defines the application's configuration settings using Pydantic's
BaseSettings. It allows for loading configuration from environment variables
and a `.env` file, ensuring that all necessary settings are present and
correctly typed.
"""

from pathlib import Path
from pydantic import EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Defines the application's configuration settings.

    Settings are loaded from environment variables or a `.env` file.
    """

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
    WORLD_NEWS_API_KEY: str

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8"
    )


settings = Settings()
