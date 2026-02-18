"""
Configuration management for Little Red Coffee Financial Dashboard.

Square API, recipe, inventory, and POS config has been migrated to lrc-operations.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Little Red Coffee - Financial Dashboard"
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
