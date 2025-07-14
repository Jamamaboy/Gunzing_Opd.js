from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status, Cookie, Header, Response
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from config.database import get_db
import logging

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET_KEY")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
ACCESS_COOKIE_NAME = "access_token"
CSRF_TOKEN_NAME = "csrf_token"

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT.lower() == "production"
USE_SECURE_COOKIE = IS_PRODUCTION

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    token: str = Cookie(None, alias=ACCESS_COOKIE_NAME),
    csrf_token: str = Header(None, alias="X-CSRF-Token"),
    cookie_csrf_token: str = Cookie(None, alias=CSRF_TOKEN_NAME),
    db: AsyncSession = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception

    if csrf_token and cookie_csrf_token and csrf_token != cookie_csrf_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token verification failed"
        )
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload.get("sub")
        if user_email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await get_user_by_email(db, user_email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user = Depends(get_current_user)):
    if current_user.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user

async def get_user_by_email(db: AsyncSession, email: str):
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from models.user import User
    
    result = await db.execute(
        select(User).filter(User.email == email).options(selectinload(User.role))
    )
    return result.scalar_one_or_none()

async def get_admin_user(
    token: str = Cookie(None, alias=ACCESS_COOKIE_NAME),
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user(token=token, db=db)
    
    if not user.role or user.role.role_name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    return user

# ตั้งค่า cookie options สำหรับ production
def get_cookie_options():
    # ✅ สำหรับ development ให้ใช้ค่าที่ปลอดภัย
    is_development = os.getenv("ENVIRONMENT", "development").lower() == "development"
    
    base_options = {
        "httponly": True,
        "samesite": "lax" if is_development else "none",  # ✅ ใช้ lax ใน development, none ใน production
        "secure": False if is_development else True,  # ✅ ไม่ใช้ secure ใน development
        "path": "/"
    }
    
    logger.info(f"Cookie options: {base_options}")
    return base_options

def set_auth_cookies(response: Response, access_token: str, refresh_token: str, csrf_token: str):
    cookie_options = get_cookie_options()
    
    # ✅ เพิ่ม debug logging
    logger.info(f"Setting cookies with options: {cookie_options}")
    logger.info(f"Access token length: {len(access_token)}")
    
    # ตั้งค่า access token cookie
    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **cookie_options
    )
    
    # ✅ เพิ่ม logging เพื่อดูว่า cookie ถูกตั้งค่าหรือไม่
    logger.info(f"Access token cookie set: {ACCESS_COOKIE_NAME}")

    # ตั้งค่า refresh token cookie
    refresh_options = cookie_options.copy()
    refresh_options["path"] = "/api/auth"  # จำกัดให้ใช้ได้เฉพาะกับ refresh endpoint
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=7 * 24 * 60 * 60,  # 7 วัน
        **refresh_options
    )
    
    # ตั้งค่า CSRF token cookie (ไม่ใช่ httponly)
    csrf_options = {
        "httponly": False,  # ให้ JS เข้าถึงได้
        "samesite": cookie_options["samesite"],
        "secure": cookie_options["secure"],
        "path": "/"
    }
    response.set_cookie(
        key=CSRF_TOKEN_NAME,
        value=csrf_token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **csrf_options
    )

def clear_auth_cookies(response: Response):
    cookie_options = get_cookie_options()
    
    # ลบ access token cookie
    response.delete_cookie(
        key=ACCESS_COOKIE_NAME,
        **cookie_options
    )
    
    # ลบ refresh token cookie
    refresh_options = cookie_options.copy()
    refresh_options["path"] = "/api/auth"
    response.delete_cookie(
        key="refresh_token",
        **refresh_options
    )
    
    # ลบ CSRF token cookie
    csrf_options = {
        "httponly": False,
        "samesite": cookie_options["samesite"],
        "secure": cookie_options["secure"],
        "path": "/"
    }
    response.delete_cookie(
        key=CSRF_TOKEN_NAME,
        **csrf_options
    )