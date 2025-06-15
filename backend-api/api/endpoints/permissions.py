from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from config.database import get_db
from schemas.user import UserPermissionCreate, UserPermissionResponse, UserPermissionUpdate
from services.user_service import add_user_permission, update_user_permission, delete_user_permission
from core.auth import get_current_user

router = APIRouter(tags=["permissions"])

@router.post("/permissions", response_model=UserPermissionResponse, status_code=status.HTTP_201_CREATED)
async def create_permission(
    permission: UserPermissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Add a new permission to a user
    """
    return await add_user_permission(db=db, permission=permission)


@router.put("/permissions/{permission_id}", response_model=UserPermissionResponse)
async def update_permission_status(
    permission_id: int,
    permission_update: UserPermissionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update a permission's granted status
    """
    return await update_user_permission(db=db, permission_id=permission_id, granted=permission_update.granted)


@router.delete("/permissions/{permission_id}")
async def remove_permission(
    permission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a permission
    """
    return await delete_user_permission(db=db, permission_id=permission_id)