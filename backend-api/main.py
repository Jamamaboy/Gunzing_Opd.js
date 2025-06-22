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
import os
import logging
from dotenv import load_dotenv

class GeographyLogFilter(logging.Filter):
    """Filter เฉพาะ Geography SQL logs"""
    
    def filter(self, record):
        if hasattr(record, 'getMessage'):
            message = record.getMessage()
            # ✅ ปิดเฉพาะ logs ที่เกี่ยวกับ geography
            geography_patterns = [
                'ST_AsGeoJSON',
                'subdistricts.geom',
                'districts.geom',
                'provinces.geom',
                'FROM subdistricts',
                'FROM districts',
                'FROM provinces',
                'SELECT subdistricts.',
                'SELECT districts.',
                'SELECT provinces.'
            ]
            
            for pattern in geography_patterns:
                if pattern in message:
                    return False  # ปิด geography logs
        
        return True  # อนุญาต logs อื่นๆ

# Setup logging
logger = setup_logging()

# ✅ เพิ่ม filter เฉพาะ geography
geography_filter = GeographyLogFilter()
logging.getLogger('sqlalchemy.engine').addFilter(geography_filter)

app = FastAPI()

# ตรวจสอบ environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT.lower() == "production"

# กำหนด allowed origins ตาม environment
if IS_PRODUCTION:
    allowed_origins = [
        "http://localhost",      # สำหรับ local container
        "http://localhost:80",   # สำหรับ local container
        "http://frontend:80",    # สำหรับ container network
        "http://frontend",
        "https://frontend.ashyisland-0d4cc8a1.australiaeast.azurecontainerapps.io"
    ]
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://frontend:5173",
        "https://frontend.ashyisland-0d4cc8a1.australiaeast.azurecontainerapps.io"
    ]

# ตั้งค่า CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,  # สำคัญ: ต้องเป็น True เพื่อให้ส่ง cookies
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# ตั้งค่า cookie middleware
@app.middleware("http")
async def add_cookie_middleware(request, call_next):
    response = await call_next(request)
    
    # ตรวจสอบว่ามี cookie ที่ต้องการเพิ่มหรือไม่
    if "Set-Cookie" in response.headers:
        cookies = response.headers.getlist("Set-Cookie")
        new_cookies = []
        
        for cookie in cookies:
            # ตรวจสอบ environment และตั้งค่า cookie ตามนั้น
            if IS_PRODUCTION:
                # Production: ใช้ Secure และ SameSite=None
                if "SameSite" not in cookie:
                    cookie += "; SameSite=None"
                if "Secure" not in cookie:
                    cookie += "; Secure"
            else:
                # Development: ใช้ SameSite=Lax และไม่ใช้ Secure
                if "SameSite" not in cookie:
                    cookie += "; SameSite=Lax"
                # ลบ Secure ออกถ้ามี (สำหรับ development)
                if "Secure" in cookie:
                    cookie = cookie.replace("; Secure", "")
            
            new_cookies.append(cookie)
        
        # อัพเดท cookies ใน response
        response.headers["Set-Cookie"] = ", ".join(new_cookies)
    
    return response

# Log application startup
logger.info("Starting FastAPI application")

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

@app.get("/api/debug")
async def debug_info():
    """Debug endpoint to check environment and configuration"""
    return {
        "environment": ENVIRONMENT,
        "is_production": IS_PRODUCTION,
        "allowed_origins": allowed_origins,
        "timestamp": "2025-06-21T02:00:00Z"
    }

@app.get("/")
async def root():
    return {"message": "AI Detection API is running"}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting uvicorn server")
    uvicorn.run(app, host="0.0.0.0", port=8000)