import uvicorn
import logging
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from api.routes import inference, narcotic, vector
from core.config import settings
from core.logging_config import setup_logging

# Setup logging
logger = setup_logging()

app = FastAPI(
    title="Evidence Analysis ML Service",
    description="API for evidence analysis using machine learning",
    version="1.0.0"
)

# Log application startup
logger.info("Starting AI Inference Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend.ashyisland-0d4cc8a1.australiaeast.azurecontainerapps.io",
        "https://backend.ashyisland-0d4cc8a1.australiaeast.azurecontainerapps.io",
        "http://localhost:3000",  # สำหรับ local development
        "http://localhost:8000"   # สำหรับ local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Add routes
app.include_router(inference.router, prefix="/api")
app.include_router(narcotic.router, prefix="/api")
app.include_router(vector.router, prefix="/api")

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"Response: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request failed: {str(e)}")
        raise

# Health check endpoint
@app.get("/health")
def health_check():
    logger.info("Health check endpoint called")
    return {"status": "healthy"}

if __name__ == "__main__":
    logger.info(f"Starting server on {settings.HOST}:{settings.PORT}")
    uvicorn.run(
        "app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
        access_log=True
    )