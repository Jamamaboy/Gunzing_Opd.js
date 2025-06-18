from pydantic_settings import BaseSettings  
from pydantic import Field, validator
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: Optional[str] = Field(default=None, description="Full database URL")
    DB_USER: str = Field(default="postgres", description="Database user")
    DB_PASSWORD: str = Field(default="password", description="Database password") 
    DB_HOST: str = Field(default="localhost", description="Database host")
    DB_PORT: int = Field(default=5432, description="Database port")
    DB_NAME: str = Field(default="raven_db", description="Database name")
    
    # Service URLs
    ML_SERVICE_URL: str = Field(default="http://localhost:8080", description="ML service URL")
    AI_SERVICE_URL: Optional[str] = Field(default=None, description="AI service URL")
    
    # API Settings
    API_HOST: str = Field(default="0.0.0.0", description="API host")
    API_PORT: int = Field(default=8000, description="API port")
    
    # Environment
    ENVIRONMENT: str = Field(default="development", description="Environment")
    DEBUG: bool = Field(default=False, description="Debug mode")
    LOG_LEVEL: str = Field(default="INFO", description="Log level")
    
    # Security
    JWT_SECRET_KEY: str = Field(default="dev-jwt-secret-key", description="JWT secret")
    SECRET_KEY: Optional[str] = Field(default=None, description="General secret key")
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: Optional[str] = Field(default=None, description="Cloudinary cloud name")
    CLOUDINARY_API_KEY: Optional[str] = Field(default=None, description="Cloudinary API key")
    CLOUDINARY_API_SECRET: Optional[str] = Field(default=None, description="Cloudinary API secret")
    
    class Config:
        extra = "allow"
        env_file = None
        case_sensitive = False
        validate_assignment = True
    
    @validator('DATABASE_URL', always=True)
    def build_database_url(cls, v, values):
        """Build DATABASE_URL if not provided"""
        if v:
            return v
        
        user = values.get('DB_USER', 'postgres')
        password = values.get('DB_PASSWORD', 'password')
        host = values.get('DB_HOST', 'localhost')
        port = values.get('DB_PORT', 5432)
        name = values.get('DB_NAME', 'raven_db')
        
        return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{name}"
    
    @validator('AI_SERVICE_URL', always=True)
    def set_ai_service_url(cls, v, values):
        """Set AI_SERVICE_URL to ML_SERVICE_URL if not provided"""
        return v or values.get('ML_SERVICE_URL', 'http://localhost:8080')
    
    @validator('SECRET_KEY', always=True)
    def set_secret_key(cls, v, values):
        """Use JWT_SECRET_KEY as fallback"""
        return v or values.get('JWT_SECRET_KEY', 'dev-secret-key')
    
    @validator('DEBUG', pre=True)
    def parse_debug(cls, v):
        """Parse DEBUG from string"""
        if isinstance(v, str):
            return v.lower() in ('true', '1', 'yes', 'on')
        return bool(v)
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

# Create settings instance
try:
    settings = Settings()
    print("✅ Configuration loaded successfully")
except Exception as e:
    print(f"❌ Configuration error: {e}")
    raise

# Helper functions
def get_database_url() -> str:
    return settings.DATABASE_URL

def get_ml_service_url() -> str:
    return settings.ML_SERVICE_URL

def get_ai_service_url() -> str:
    return settings.AI_SERVICE_URL

# Export commonly used variables
DATABASE_URL = settings.DATABASE_URL
ML_SERVICE_URL = settings.ML_SERVICE_URL
AI_SERVICE_URL = settings.AI_SERVICE_URL
JWT_SECRET_KEY = settings.JWT_SECRET_KEY
SECRET_KEY = settings.SECRET_KEY
CLOUDINARY_CLOUD_NAME = settings.CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY = settings.CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET = settings.CLOUDINARY_API_SECRET

# Debug output
if not settings.is_production:
    print("🔧 Configuration:")
    print(f"   DATABASE_URL: {DATABASE_URL}")
    print(f"   ML_SERVICE_URL: {ML_SERVICE_URL}")
    print(f"   AI_SERVICE_URL: {AI_SERVICE_URL}")
    print(f"   DEBUG: {settings.DEBUG}")
    print(f"   ENVIRONMENT: {settings.ENVIRONMENT}")