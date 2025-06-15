from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
import json
from pydantic import BaseModel

from config.database import get_db
from schemas.user import UserResponse, UserBrief, UserUpdate
from services.user_service import create_user, get_all_users, get_user_by_id, update_user, delete_user
from services.image_service import upload_image_to_cloudinary

router = APIRouter(tags=["users"])

class PaginatedUserResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    limit: int
    total_pages: int
    
    class Config:
        from_attributes = True


@router.post("/users/create", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_new_user(
    title: str = Form(...),
    firstname: str = Form(...),
    lastname: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    department: Optional[str] = Form(None),
    role_id: int = Form(...),
    profile_image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new user with profile image support
    """
    # Handle profile image upload if provided
    profile_image_url = None
    if profile_image:
        try:
            result = await upload_image_to_cloudinary(profile_image, folder="user_profiles")
            profile_image_url = result.get('secure_url')
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload profile image: {str(e)}"
            )

    # Create user with the image URL
    user_data = {
        "title": title,
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "password": password,
        "department": department,
        "role_id": role_id,
        "profile_image_url": profile_image_url
    }

    db_user = await create_user(db=db, user_data=user_data)
    return db_user


@router.get("/users", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
    Get all users with their role information
    """
    users = await get_all_users(db, skip=skip, limit=limit)
    return users


@router.get("/users/list", response_model=PaginatedUserResponse)
async def list_users(
    page: int = Query(1, description="Page number"),
    limit: int = Query(10, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    role_id: Optional[int] = Query(None, description="Filter by role ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated list of users with optional search and role filtering
    """
    # Calculate skip based on page and limit
    skip = (page - 1) * limit
    
    # Get users with filtering
    users = await get_all_users(db, skip=skip, limit=limit, search=search, role_id=role_id)
    
    # Get total count for pagination
    total_count = len(users) if page == 1 else await get_all_users(db, count_only=True, search=search, role_id=role_id)
    
    # Calculate total pages
    total_pages = (total_count + limit - 1) // limit
    
    return {
        "users": users,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a user by ID
    """
    return await get_user_by_id(db, user_id=user_id)


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user_info(
    user_id: int,
    title: str = Form(...),
    firstname: str = Form(...),
    lastname: str = Form(...),
    email: str = Form(...),
    password: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    role_id: int = Form(...),
    is_active: bool = Form(...),
    profile_image: Optional[UploadFile] = File(None),
    remove_profile_image: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a user's information with profile image support
    """
    # Check if user exists
    user = await get_user_by_id(db, user_id)
    
    # Handle profile image
    profile_image_url = user.profile_image_url
    
    # If a new image is provided, upload it
    if profile_image:
        try:
            result = await upload_image_to_cloudinary(profile_image, folder="user_profiles")
            profile_image_url = result.get('secure_url')
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload profile image: {str(e)}"
            )
    # If remove_profile_image flag is set to 'true', remove the profile image
    elif remove_profile_image == 'true':
        profile_image_url = None

    # Build update data
    user_data = {
        "title": title,
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "department": department,
        "role_id": role_id,
        "is_active": is_active,
        "profile_image_url": profile_image_url
    }
    
    # Only update password if it was provided
    if password:
        user_data["password"] = password

    # Update the user
    updated_user = await update_user(db=db, user_id=user_id, user_data=user_data)
    return updated_user


@router.delete("/users/{user_id}")
async def remove_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """
    Delete a user
    """
    result = await delete_user(db=db, user_id=user_id)
    return result