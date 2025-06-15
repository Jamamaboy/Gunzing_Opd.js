from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from config.database import get_db
from schemas.ammunition import Ammunition as AmmunitionSchema, AmmunitionCreate

from services.firearm_service import (
    get_all_ammunitions,
    get_ammunition_by_id,
    create_ammunition,
    update_ammunition,
    delete_ammunition
)

router = APIRouter(tags=["ammunitions"])

@router.get("/ammunitions", response_model=List[AmmunitionSchema])
async def read_ammunitions(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """Get all ammunition types"""
    ammunitions = await get_all_ammunitions(db)
    return ammunitions[skip: skip + limit]

@router.get("/ammunitions/{ammunition_id}", response_model=AmmunitionSchema)
async def read_ammunition(
    ammunition_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Get a specific ammunition type by ID"""
    ammunition = await get_ammunition_by_id(db, ammunition_id)
    if ammunition is None:
        raise HTTPException(status_code=404, detail="Ammunition not found")
    return ammunition

@router.post("/ammunitions", response_model=AmmunitionSchema, status_code=status.HTTP_201_CREATED)
async def create_new_ammunition(
    ammunition: AmmunitionCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new ammunition type"""
    ammunition_data = ammunition.model_dump()
    new_ammunition = await create_ammunition(db, ammunition_data)
    return new_ammunition

@router.put("/ammunitions/{ammunition_id}", response_model=AmmunitionSchema)
async def update_existing_ammunition(
    ammunition_id: int,
    ammunition: AmmunitionCreate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing ammunition type"""
    ammunition_data = ammunition.model_dump()
    updated_ammunition = await update_ammunition(db, ammunition_id, ammunition_data)
    if updated_ammunition is None:
        raise HTTPException(status_code=404, detail="Ammunition not found")
    return updated_ammunition

@router.delete("/ammunitions/{ammunition_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_ammunition(
    ammunition_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Delete an ammunition type"""
    success = await delete_ammunition(db, ammunition_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ammunition not found")
    return None