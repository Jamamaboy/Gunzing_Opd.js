from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints.provinces import router as province_router
from api.endpoints.districts import router as district_router
from api.endpoints.subdistricts import router as subdistrict_router
from api.endpoints.exhibits import router as exhibits_router
from api.endpoints.history import router as history_router
from api.endpoints.users import router as user_router
from api.endpoints.roles import router as role_router
from api.endpoints.auth import router as auth_router
from api.endpoints.permissions import router as permissions_router
from api.endpoints.notifications import router as notifications_router
from api.endpoints.inference import router as inference_router
from api.endpoints.firearm import router as firearm_router
from api.endpoints.ammunition import router as ammunition_router
from api.endpoints.narcotic import router as narcotics_router
from api.endpoints import image_search
from api.endpoints.case import router as case_router
from api.endpoints.evidence import router as evidence_router
from api.endpoints.defendant import router as defendant_router
from api.endpoints.statistic import router as statistic_router
from config.logging_config import setup_logging

# Setup logging
logger = setup_logging()

app = FastAPI()

# Log application startup
logger.info("Starting FastAPI application")

# Configure CORS - modified to support cookies
app.add_middleware(
    CORSMiddleware,
    # Include all possible frontend origins
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost",
        "http://localhost:80",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "http://frontend:5173",
        "http://ai-inference-service:8080",
        "https://vz1gzb52-5173.asse.devtunnels.ms",
        "https://vz1gzb52-4173.asse.devtunnels.ms/",
        "https://frontend.ashyisland-0d4cc8a1.australiaeast.azurecontainerapps.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(province_router, prefix="/api")
app.include_router(district_router, prefix="/api")
app.include_router(subdistrict_router, prefix="/api")
app.include_router(exhibits_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(role_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(permissions_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(inference_router, prefix="/api")
app.include_router(firearm_router, prefix="/api")
app.include_router(ammunition_router, prefix="/api")
app.include_router(narcotics_router, prefix="/api")
app.include_router(image_search.router, prefix="/api")
app.include_router(case_router, prefix="/api")
app.include_router(evidence_router, prefix="/api")
app.include_router(defendant_router, prefix="/api")
app.include_router(statistic_router, prefix="/api")

@app.get("/api/health")
async def health_check():
    logger.info("Health check endpoint called")
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting uvicorn server")
    uvicorn.run(app, host="0.0.0.0", port=8000)