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

load_dotenv()

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
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

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

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Cookie(None, alias=ACCESS_COOKIE_NAME), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # ถ้าไม่มี cookie token
    if not token:
        raise credentials_exception
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    # แก้โดยใช้ selectinload เพื่อโหลด role พร้อมกับ user (eager loading)
    result = await db.execute(
        select(User).filter(User.email == token_data.username).options(selectinload(User.role))
    )
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    return user

# Routes
@router.post("/auth/login")
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # เข้าถึง role โดย user.role ได้เลย เพราะมีการโหลดด้วย selectinload แล้ว
    role_data = {
        "id": user.role.id,
        "role_name": user.role.role_name,
        "description": user.role.description
    } if user.role else {"id": 0, "role_name": "Unknown", "description": "No role"}
    
    # สร้าง access token (อายุสั้น)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # สร้าง refresh token (อายุยาว)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_access_token(
        data={"sub": user.email, "token_type": "refresh"}, 
        expires_delta=refresh_token_expires
    )
    
    # สร้าง CSRF token
    csrf_token = secrets.token_urlsafe(32)
    
    # ตั้งค่า access token cookie
    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access_token,
        httponly=True,  # ป้องกัน JavaScript อ่าน cookie
        secure=USE_SECURE_COOKIE,   # ใช้ True ถ้าใช้งานบน HTTPS
        samesite="lax", # ป้องกัน CSRF
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )
    
    # ตั้งค่า refresh token cookie
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,  # ป้องกัน JavaScript อ่าน cookie
        secure=USE_SECURE_COOKIE,   # ใช้ True ถ้าใช้งานบน HTTPS
        samesite="lax", # ป้องกัน CSRF
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/auth"  # จำกัดให้ใช้ได้เฉพาะกับ refresh endpoint
    )
    
    # ตั้งค่า CSRF token cookie (ไม่ใช่ httponly เพื่อให้ JS อ่านได้)
    response.set_cookie(
        key=CSRF_TOKEN_NAME,
        value=csrf_token,
        httponly=False,  # ให้ JS เข้าถึงได้
        secure=USE_SECURE_COOKIE,    # ใช้ True ถ้าใช้งานบน HTTPS
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # อายุเท่ากับ access token
        path="/"
    )
    
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
    
    return {
        "success": True,
        "user": user_info,
        "csrf_token": csrf_token  # ส่ง CSRF token กลับไปให้ frontend
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
    response.delete_cookie(
        key=ACCESS_COOKIE_NAME,
        path="/", 
        samesite="lax"
    )
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/api/auth", 
        samesite="lax"
    )
    response.delete_cookie(
        key=CSRF_TOKEN_NAME,
        path="/", 
        samesite="lax"
    )
    return {"message": "Logged out successfully"}

@router.post("/auth/refresh")
async def refresh_access_token(
    response: Response,
    refresh_token: str = Cookie(None, alias=REFRESH_COOKIE_NAME),
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not refresh_token:
        raise credentials_exception
        
    try:
        # ตรวจสอบ refresh token
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        token_type = payload.get("token_type")
        
        # ต้องเป็น refresh token เท่านั้น
        if not username or token_type != "refresh":
            raise credentials_exception
            
        # สร้าง access token ใหม่
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": username},
            expires_delta=access_token_expires
        )
        
        # สร้าง CSRF token ใหม่
        csrf_token = secrets.token_urlsafe(32)
        
        # ตั้งค่า cookie ใหม่
        response.set_cookie(
            key=ACCESS_COOKIE_NAME,
            value=access_token,
            httponly=True,
            secure=USE_SECURE_COOKIE,  # ควรเป็น True ในโหมด production
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            path="/"
        )
        
        # ตั้งค่า CSRF token cookie ใหม่
        response.set_cookie(
            key=CSRF_TOKEN_NAME,
            value=csrf_token,
            httponly=False,
            secure=USE_SECURE_COOKIE,
            samesite="lax",
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            path="/"
        )
        
        return {"success": True, "csrf_token": csrf_token}
    except JWTError:
        raise credentials_exception