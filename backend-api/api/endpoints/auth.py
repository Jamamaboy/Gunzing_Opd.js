from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie, Header, Request
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from config.database import get_db
from models.user import User
from pydantic import BaseModel
import os
import secrets
from dotenv import load_dotenv
import logging
from core.auth import (
    verify_password, hash_password, create_access_token,
    get_current_user, set_auth_cookies, clear_auth_cookies
)

load_dotenv()

# ตั้งค่า logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["auth"])

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    # ถ้าไม่มี SECRET_KEY กำหนดใน .env ให้แสดงคำเตือนและสร้างคีย์ชั่วคราว
    SECRET_KEY = secrets.token_hex(32)
    print("WARNING: Using randomly generated SECRET_KEY. Set JWT_SECRET_KEY in .env for production!")
    
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # ลดเหลือ 15 นาทีเพื่อความปลอดภัย
REFRESH_TOKEN_EXPIRE_DAYS = 7  # Refresh token มีอายุ 7 วัน
ACCESS_COOKIE_NAME = "access_token"
REFRESH_COOKIE_NAME = "refresh_token"
CSRF_TOKEN_NAME = "csrf_token"

# Environment check - ตรวจสอบว่าเป็น production หรือไม่
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT.lower() == "production"
USE_SECURE_COOKIE = IS_PRODUCTION  # ใช้ secure cookie เมื่อเป็น production (ควรใช้ HTTPS)

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Models
class TokenData(BaseModel):
    username: Optional[str] = None
    token_type: Optional[str] = None

class UserInfo(BaseModel):
    user_id: str
    firstname: str
    lastname: str
    email: str
    role: dict
    title: Optional[str] = None
    department: Optional[str] = None

# Authentication helpers
async def authenticate_user(db: AsyncSession, email: str, password: str):
    # แก้โดยใช้ selectinload เพื่อโหลด role พร้อมกับ user (eager loading)
    result = await db.execute(
        select(User).filter(User.email == email).options(selectinload(User.role))
    )
    user = result.scalar_one_or_none()
    
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

# Routes
@router.post("/auth/login")
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    logger.info(f"Login attempt for user: {form_data.username}")
    
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        logger.warning(f"Login failed for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    logger.info(f"Login successful for user: {user.email}")
    
    # เข้าถึง role โดย user.role ได้เลย เพราะมีการโหลดด้วย selectinload แล้ว
    role_data = {
        "id": user.role.id,
        "role_name": user.role.role_name,
        "description": user.role.description
    } if user.role else {"id": 0, "role_name": "Unknown", "description": "No role"}
    
    # สร้าง tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_access_token(
        data={"sub": user.email, "token_type": "refresh"}, 
        expires_delta=refresh_token_expires
    )
    
    # สร้าง CSRF token
    csrf_token = secrets.token_urlsafe(32)
    
    # ตั้งค่า cookies
    set_auth_cookies(response, access_token, refresh_token, csrf_token)
    
    # Return user info และ CSRF token
    user_info = {
        "user_id": user.user_id,
        "firstname": user.firstname,
        "lastname": user.lastname,
        "email": user.email,
        "title": user.title,
        "department": user.department,
        "role": role_data
    }
    
    logger.info(f"Cookies set for user: {user.email}")
    
    return {
        "success": True,
        "user": user_info,
        "csrf_token": csrf_token
    }

@router.get("/auth/user")
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user information - requires valid JWT in cookie
    """
    # เข้าถึง role โดย current_user.role ได้เลย เพราะมีการโหลดด้วย selectinload แล้ว
    role_data = {
        "id": current_user.role.id,
        "role_name": current_user.role.role_name,
        "description": current_user.role.description
    } if current_user.role else {"id": 0, "role_name": "Unknown", "description": "No role"}
    
    return {
        "user_id": current_user.user_id,
        "firstname": current_user.firstname,
        "lastname": current_user.lastname,
        "email": current_user.email,
        "title": current_user.title,
        "department": current_user.department,
        "role": role_data
    }

@router.post("/auth/logout")
async def logout(response: Response):
    """
    Logout user by clearing all authentication cookies
    """
    clear_auth_cookies(response)
    return {"message": "Logged out successfully"}

@router.post("/auth/refresh")
async def refresh_access_token(
    response: Response,
    refresh_token: str = Cookie(None, alias=REFRESH_COOKIE_NAME),
    db: AsyncSession = Depends(get_db)
):
    logger.info("Token refresh attempt")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not refresh_token:
        logger.warning("Refresh token not found in cookies")
        raise credentials_exception
        
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        token_type = payload.get("token_type")
        
        if not username or token_type != "refresh":
            logger.warning(f"Invalid refresh token for user: {username}")
            raise credentials_exception
            
        logger.info(f"Creating new access token for user: {username}")
        
        # สร้าง tokens ใหม่
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": username},
            expires_delta=access_token_expires
        )
        
        refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        new_refresh_token = create_access_token(
            data={"sub": username, "token_type": "refresh"},
            expires_delta=refresh_token_expires
        )
        
        csrf_token = secrets.token_urlsafe(32)
        
        # ตั้งค่า cookies ใหม่
        set_auth_cookies(response, access_token, new_refresh_token, csrf_token)
        
        logger.info(f"New tokens created for user: {username}")
        
        return {"success": True, "csrf_token": csrf_token}
    except JWTError as e:
        logger.error(f"Token refresh failed: {str(e)}")
        raise credentials_exception