import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Incident Management Agent"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = "sqlite:///./incident_agent.db"
    
    # Auto-healing Safety Thresholds (Configurable)
    AUTO_HEAL_CONFIDENCE_THRESHOLD: float = 90.0
    HUMAN_APPROVAL_CONFIDENCE_THRESHOLD: float = 70.0
    
    # API Keys & LLM Provider Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    USE_LOCAL_AI_FALLBACK: bool = True

    class Config:
        case_sensitive = True

settings = Settings()
