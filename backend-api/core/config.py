from pydantic_settings import BaseSettings  
from pydantic import Field, validator
from typing import Optional
import os

class Settings(BaseSettings):
    # Database - อ่านจาก .env เท่านั้น
    DB_USER: str = Field(..., description="Database user")
    DB_PASSWORD: str = Field(..., description="Database password") 
    DB_HOST: str = Field(..., description="Database host")
    DB_PORT: int = Field(..., description="Database port")
    DB_NAME: str = Field(..., description="Database name")
    DATABASE_URL: Optional[str] = Field(default=None, description="Full database URL")
    
    # Service URLs - อ่านจาก .env เท่านั้น
    AI_SERVICE_URL: str = Field(..., description="AI service URL")
    
    # API Settings - อ่านจาก .env หรือใช้ default
    API_HOST: str = Field(default="0.0.0.0", description="API host")
    API_PORT: int = Field(default=8000, description="API port")
    
    # Environment - อ่านจาก .env เท่านั้น
    ENVIRONMENT: str = Field(..., description="Environment")
    DEBUG: bool = Field(default=False, description="Debug mode")
    LOG_LEVEL: str = Field(default="INFO", description="Log level")
    
    # Security - อ่านจาก .env เท่านั้น
    JWT_SECRET_KEY: str = Field(..., description="JWT secret")
    SECRET_KEY: Optional[str] = Field(default=None, description="General secret key")
    
    # Cloudinary - อ่านจาก .env เท่านั้น
    CLOUDINARY_CLOUD_NAME: str = Field(..., description="Cloudinary cloud name")
    CLOUDINARY_API_KEY: str = Field(..., description="Cloudinary API key")
    CLOUDINARY_API_SECRET: str = Field(..., description="Cloudinary API secret")
    
    class Config:
        env_file = ".env"  # ✅ กำหนดให้อ่าน .env file
        env_file_encoding = 'utf-8'
        case_sensitive = False
        validate_assignment = True
    
    @validator('DATABASE_URL', always=True)
    def build_database_url(cls, v, values):
        """Build DATABASE_URL from components"""
        if v:
            return v
        
        user = values.get('DB_USER')
        password = values.get('DB_PASSWORD')
        host = values.get('DB_HOST')
        port = values.get('DB_PORT')
        name = values.get('DB_NAME')
        
        if not all([user, password, host, port, name]):
            raise ValueError("Missing required database configuration")
        
        return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{name}"
    
    @validator('SECRET_KEY', always=True)
    def set_secret_key(cls, v, values):
        """Use JWT_SECRET_KEY as SECRET_KEY if not provided"""
        return v if v is not None else values.get('JWT_SECRET_KEY')
    
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
    print("✅ Configuration loaded successfully from .env")
except Exception as e:
    print(f"❌ Configuration error: {e}")
    print("📋 Make sure .env file exists with all required variables:")
    print("   - DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME")
    print("   - AI_SERVICE_URL")
    print("   - ENVIRONMENT")
    print("   - JWT_SECRET_KEY")
    print("   - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET")
    raise

# Helper functions
def get_database_url() -> str:
    return settings.DATABASE_URL

def get_ai_service_url() -> str:
    return settings.AI_SERVICE_URL

# Export commonly used variables
DATABASE_URL = settings.DATABASE_URL
AI_SERVICE_URL = settings.AI_SERVICE_URL
JWT_SECRET_KEY = settings.JWT_SECRET_KEY
SECRET_KEY = settings.SECRET_KEY
CLOUDINARY_CLOUD_NAME = settings.CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY = settings.CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET = settings.CLOUDINARY_API_SECRET

# Debug output
if not settings.is_production:
    print("🔧 Configuration loaded from .env:")
    print(f"   DATABASE_URL: {DATABASE_URL}")
    print(f"   AI_SERVICE_URL: {AI_SERVICE_URL}")
    print(f"   DEBUG: {settings.DEBUG}")
    print(f"   ENVIRONMENT: {settings.ENVIRONMENT}")
    print(f"   CLOUDINARY_CLOUD_NAME: {CLOUDINARY_CLOUD_NAME}")