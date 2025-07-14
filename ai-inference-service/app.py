import uvicorn
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api.routes import inference, narcotic, vector
from core.config import settings
from core.logging_config import setup_logging
from ml_managers.ai_model_manager import get_model_manager

# Setup logging
logger = setup_logging()

app = FastAPI(
    title="Evidence Analysis ML Service",
    description="API for evidence analysis using machine learning",
    version="1.0.0"
)

# Global variable to track readiness
models_ready = False

@app.on_event("startup")
async def startup_event():
    global models_ready
    logger.info("🚀 Starting AI Inference Service...")
    
    try:
        # Initialize model manager (starts background loading)
        model_manager = get_model_manager()
        
        # Wait for critical models to load (with timeout)
        logger.info("⏳ Waiting for critical models to load...")
        if model_manager.wait_for_models(timeout=120):  # 2 minutes timeout
            logger.info("✅ Critical models loaded successfully")
            
            # Warm up models using ModelManager
            warmup_result = await model_manager.warmup_models()
            
            if "error" not in warmup_result:
                models_ready = True
                logger.info("🎯 Service is ready to accept requests")
                logger.info(f"Warmup summary: {warmup_result}")
            else:
                logger.error(f"❌ Model warmup failed: {warmup_result['error']}")
                models_ready = False
        else:
            logger.error("❌ Model loading timeout - service may not work properly")
            models_ready = False

    except Exception as e:
        logger.error(f"💥 Error during startup: {e}")
        models_ready = False

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend.ashyisland-0d4cc8a1.australiaeast.azurecontainerapps.io",
        "https://backend.ashyisland-0d4cc8a1.australiaeast.azurecontainerapps.io",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Add readiness check middleware
@app.middleware("http")
async def check_readiness(request: Request, call_next):
    # Skip readiness check for health endpoints
    if request.url.path in ["/health", "/ready", "/warmup", "/status"]:
        response = await call_next(request)
        return response
    
    # Check if models are ready for other endpoints
    if not models_ready:
        raise HTTPException(
            status_code=503, 
            detail="Service not ready - models are still loading"
        )
    
    response = await call_next(request)
    return response

# Add routes
app.include_router(inference.router, prefix="/api")
app.include_router(narcotic.router, prefix="/api")
app.include_router(vector.router, prefix="/api")

# Enhanced health check endpoints
@app.get("/health")
def health_check():
    """Basic health check"""
    return {"status": "healthy"}

@app.get("/ready")
def readiness_check():
    """Readiness check for load balancer"""
    global models_ready
    model_manager = get_model_manager()
    
    status = {
        "ready": models_ready and model_manager.is_ready(),
        "models": model_manager.models_loaded.copy()
    }
    
    if not status["ready"]:
        raise HTTPException(status_code=503, detail=status)
    
    return status

@app.get("/status")
def detailed_status():
    """Detailed status including warmup information"""
    global models_ready
    model_manager = get_model_manager()
    
    return {
        "service_ready": models_ready,
        "warmup_status": model_manager.get_warmup_status()
    }

@app.post("/warmup")
async def manual_warmup():
    """Manual warmup endpoint"""
    global models_ready
    model_manager = get_model_manager()
    
    if not model_manager.is_ready():
        raise HTTPException(
            status_code=503, 
            detail="Models not loaded yet - cannot perform warmup"
        )
    
    warmup_result = await model_manager.warmup_models()
    
    if "error" not in warmup_result:
        models_ready = True
        return {"status": "warmup completed", "results": warmup_result}
    else:
        return {"status": "warmup failed", "error": warmup_result["error"]}

# Request logging middleware
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
