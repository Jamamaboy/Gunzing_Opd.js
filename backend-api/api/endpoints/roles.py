from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from config.database import get_db
from schemas.role import RoleCreate, RoleResponse, RoleUpdate
from services.role_service import create_role, get_all_roles, get_role_by_id, update_role, delete_role

router = APIRouter(tags=["roles"])

@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_new_role(role: RoleCreate, db: AsyncSession = Depends(get_db)):
    """
    Create a new role
    """
    return await create_role(db=db, role=role)


@router.get("/roles", response_model=List[RoleResponse])
async def get_roles(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
    Get all roles
    """
    return await get_all_roles(db, skip=skip, limit=limit)


@router.get("/roles/{role_id}", response_model=RoleResponse)
async def get_role(role_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a role by ID
    """
    return await get_role_by_id(db, role_id=role_id)


@router.put("/roles/{role_id}", response_model=RoleResponse)
async def update_role_info(role_id: int, role_update: RoleUpdate, db: AsyncSession = Depends(get_db)):
    """
    Update a role
    """
    return await update_role(db=db, role_id=role_id, role_update=role_update)


@router.delete("/roles/{role_id}")
async def remove_role(role_id: int, db: AsyncSession = Depends(get_db)):
    """
    Delete a role
    """
    return await delete_role(db=db, role_id=role_id)