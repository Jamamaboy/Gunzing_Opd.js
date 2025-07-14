import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API settings
    HOST: str = os.environ.get("HOST", "0.0.0.0")
    PORT: int = int(os.environ.get("PORT", 8080))
    DEBUG: bool = os.environ.get("DEBUG", "False").lower() == "true"

    # CORS
    BACKEND_API_URL: str = os.environ.get("BACKEND_API_URL")

    # Model paths
    MODEL_PATH: str = os.environ.get("MODEL_PATH", "/app/model")
    OBJECT_DETECTION_MODEL: str = os.path.join(MODEL_PATH, "best.pt")
    PILL_MODEL: str = os.path.join(MODEL_PATH, "pill_model.h5")
    PILL_PROTOTYPES: str = os.path.join(MODEL_PATH, "pill_prototypes.json")

    class Config:
        env_file = ".env"

settings = Settings()
