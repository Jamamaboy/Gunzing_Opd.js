from sqlalchemy.orm import Session, selectinload
from sqlalchemy import desc, select, text, func, or_
from fastapi import HTTPException, status
from typing import List, Optional, Dict, Any, Union
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from models.user import User
from models.user_permission import UserPermission
from schemas.user_permission import UserPermissionCreate


async def get_user_by_email(db: AsyncSession, email: str):
    # ใช้ selectinload เพื่อโหลด role relationship ล่วงหน้า
    result = await db.execute(
        select(User)
        .options(selectinload(User.role), selectinload(User.permissions))
        .where(User.email == email)
    )
    return result.scalars().first()


async def authenticate_user(db: AsyncSession, email: str, password: str):
    """Authenticate a user by email and password"""
    user = await get_user_by_email(db, email)
    if not user:
        return False
    
    # ใช้ pgcrypto สำหรับเข้ารหัส password บน PostgreSQL
    # การตรวจสอบจะถูกจัดการโดย SQL เมื่อใช้ crypt function
    # ต้องใช้ text() ในการสร้าง SQL expression
    sql_query = text("""
        SELECT * FROM users 
        WHERE email = :email 
        AND password = crypt(:password, password)
    """)
    
    result = await db.execute(
        sql_query,
        {"email": email, "password": password}
    )
    
    authenticated_user = result.fetchone()
    
    if not authenticated_user:
        return False
    
    # Update last login time
    user.last_login = datetime.utcnow()
    await db.commit()
    
    return user


async def get_user_by_id(db: AsyncSession, user_id: int):
    result = await db.execute(
        select(User)
        .options(selectinload(User.role), selectinload(User.permissions))
        .where(User.id == user_id)
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


async def get_all_users(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None, 
    role_id: Optional[int] = None,
    count_only: bool = False
) -> Union[List[User], int]:
    """
    Get users with optional filtering and search
    
    Args:
        db: Database session
        skip: Number of records to skip for pagination
        limit: Maximum number of records to return
        search: Optional search string to filter users
        role_id: Optional role ID to filter users
        count_only: If True, return only the count of users

    Returns:
        Either a list of users or the count of users matching the criteria
    """
    # Start building the query
    query = select(User).options(selectinload(User.role), selectinload(User.permissions))
    
    # Apply filters if provided
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                User.firstname.ilike(search_term),
                User.lastname.ilike(search_term),
                User.email.ilike(search_term),
                User.user_id.ilike(search_term),
                User.department.ilike(search_term)
            )
        )
    
    if role_id:
        query = query.where(User.role_id == role_id)
    
    # If we only need the count, return it
    if count_only:
        count_query = select(func.count()).select_from(query.subquery())
        result = await db.execute(count_query)
        return result.scalar()
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    # Execute the query
    result = await db.execute(query)
    return result.scalars().all()


async def create_user(db: AsyncSession, user_data: Dict[str, Any]):
    # Check if email exists
    existing_user = await get_user_by_email(db, email=user_data["email"])
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already in use"
        )
    
    # Note: user_id จะถูกสร้างอัตโนมัติโดย Trigger ใน PostgreSQL
    
    # Create new user - ไม่ต้องกำหนด user_id และไม่ต้อง hash password ด้วย bcrypt
    # เนื่องจาก PostgreSQL จะจัดการส่วนนี้ให้เราด้วย Trigger
    db_user = User(
        title=user_data.get("title"),
        firstname=user_data.get("firstname"),
        lastname=user_data.get("lastname"),
        email=user_data.get("email"),
        password=user_data.get("password"),  # PostgreSQL จะเข้ารหัสให้ด้วย crypt function ผ่าน Trigger
        department=user_data.get("department"),
        role_id=user_data.get("role_id"),
        profile_image_url=user_data.get("profile_image_url")
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    # สร้าง permissions ถ้ามีการระบุมา
    if "permissions" in user_data and user_data["permissions"]:
        for permission_type in user_data["permissions"]:
            permission = UserPermission(
                user_id=db_user.id,
                permission_type=permission_type
            )
            db.add(permission)
        
        await db.commit()
    
    # Reload user with relationships
    return await get_user_by_id(db, db_user.id)


async def update_user(db: AsyncSession, user_id: int, user_data: Dict[str, Any]):
    db_user = await get_user_by_id(db, user_id)
    
    # Update email if it changed and check for duplicates
    if user_data.get("email") and user_data["email"] != db_user.email:
        existing_user = await get_user_by_email(db, user_data["email"])
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use by another user"
            )
    
    # Update all provided fields
    for key, value in user_data.items():
        if value is not None:  # Only update fields that are provided
            setattr(db_user, key, value)
    
    await db.commit()
    await db.refresh(db_user)
    
    return db_user


async def delete_user(db: AsyncSession, user_id: int):
    db_user = await get_user_by_id(db, user_id)
    
    await db.delete(db_user)
    await db.commit()
    
    return {"message": "User deleted successfully"}


async def add_user_permission(db: AsyncSession, permission: UserPermissionCreate):
    # Check if user exists
    user = await get_user_by_id(db, permission.user_id)
    
    # Check if permission already exists
    result = await db.execute(
        select(UserPermission)
        .where(
            (UserPermission.user_id == permission.user_id) & 
            (UserPermission.permission_type == permission.permission_type)
        )
    )
    existing_permission = result.scalars().first()
    
    if existing_permission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Permission already exists for this user"
        )
    
    # Add permission
    db_permission = UserPermission(
        user_id=permission.user_id,
        permission_type=permission.permission_type,
        granted=permission.granted
    )
    
    db.add(db_permission)
    await db.commit()
    await db.refresh(db_permission)
    
    return db_permission


async def update_user_permission(db: AsyncSession, permission_id: int, granted: bool):
    # Get permission
    result = await db.execute(
        select(UserPermission).where(UserPermission.id == permission_id)
    )
    db_permission = result.scalars().first()
    
    if not db_permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    
    # Update permission
    db_permission.granted = granted
    db_permission.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(db_permission)
    
    return db_permission


async def delete_user_permission(db: AsyncSession, permission_id: int):
    # Get permission
    result = await db.execute(
        select(UserPermission).where(UserPermission.id == permission_id)
    )
    db_permission = result.scalars().first()
    
    if not db_permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    
    await db.delete(db_permission)
    await db.commit()
    
    return {"message": "Permission deleted successfully"}