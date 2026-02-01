"""
Configuration management for Little Red Coffee Dashboard
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Square API
    square_access_token: Optional[str] = None
    square_environment: str = "production"  # or "sandbox"
    square_location_id: Optional[str] = None

    # App settings
    app_name: str = "Little Red Coffee - Financial Dashboard"
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Allow extra env vars


settings = Settings()


def is_square_configured() -> bool:
    """Check if Square API credentials are configured"""
    return settings.square_access_token is not None and len(settings.square_access_token) > 10
