import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API settings
    HOST: str = os.environ.get("HOST", "0.0.0.0")
    PORT: int = int(os.environ.get("PORT", 8080))
    DEBUG: bool = os.environ.get("DEBUG", "False").lower() == "true"
    
    # CORS
    BACKEND_API_URL: str = "https://backend.ashyisland-0d4cc8a1.australiaeast.azurecontainerapps.io"
    
    class Config:
        env_file = ".env"

settings = Settings()