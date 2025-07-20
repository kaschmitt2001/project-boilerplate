import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Anthropic API Key (commented out for review)
    # API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Document types
    ALLOWED_DOCUMENT_TYPES: list[str] = [".pdf", ".xlsx", ".xls"]
    
    # File upload limits
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    MAX_FILES: int = 10
    
    # App settings
    APP_NAME: str = "Document Processing API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

settings = Settings()
