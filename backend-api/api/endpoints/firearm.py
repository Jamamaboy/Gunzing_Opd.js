from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from pydantic import BaseModel

from config.database import get_db
from schemas.firearm import Firearm as FirearmSchema

from services.firearm_service import (
    link_firearm_ammunition,
    unlink_firearm_ammunition,
    link_multiple_firearm_ammunition,
    delete_firearm,
    delete_firearm_complete,  # ✅ เพิ่ม import
    get_firearm_by_id
)

router = APIRouter(tags=["firearms"])

# ✅ เพิ่ม endpoint สำหรับลบ firearm แบบสมบูรณ์
@router.delete("/firearms/{firearm_id}/complete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_firearm_and_exhibit(
    firearm_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    ลบ firearm และข้อมูลที่เกี่ยวข้องทั้งหมด รวมถึง exhibit, images, และ ammunition relationships
    """
    # ตรวจสอบว่า firearm มีอยู่จริง
    firearm = await get_firearm_by_id(db, firearm_id)
    if not firearm:
        raise HTTPException(status_code=404, detail="Firearm not found")
    
    success = await delete_firearm_complete(db, firearm_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete firearm completely")
    return None

# ✅ เพิ่ม endpoint สำหรับลบ firearm เฉพาะ (ไม่ลบ exhibit)
@router.delete("/firearms/{firearm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_firearm_only(
    firearm_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    ลบ firearm และข้อมูลที่เกี่ยวข้อง (images, ammunition relationships) แต่ไม่ลบ exhibit
    """
    # ตรวจสอบว่า firearm มีอยู่จริง
    firearm = await get_firearm_by_id(db, firearm_id)
    if not firearm:
        raise HTTPException(status_code=404, detail="Firearm not found")
    
    success = await delete_firearm(db, firearm_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete firearm")
    return None

# Firearm-Ammunition relationship endpoints
class AmmunitionIdsPayload(BaseModel):
    ammunition_ids: List[int]

@router.post("/firearms/{firearm_id}/ammunitions", status_code=status.HTTP_204_NO_CONTENT)
async def link_multiple_ammunition(
    firearm_id: int,
    payload: AmmunitionIdsPayload,
    db: AsyncSession = Depends(get_db)
):
    """Link a firearm to multiple ammunition types at once"""
    success = await link_multiple_firearm_ammunition(db, firearm_id, payload.ammunition_ids)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Failed to link some ammunition items. Verify all IDs exist."
        )
    return None

@router.post("/firearms/{firearm_id}/ammunitions/{ammunition_id}", status_code=status.HTTP_204_NO_CONTENT)
async def link_firearm_to_ammunition(
    firearm_id: int,
    ammunition_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Link a firearm to an ammunition type"""
    success = await link_firearm_ammunition(db, firearm_id, ammunition_id)
    if not success:
        raise HTTPException(status_code=404, detail="Firearm or ammunition not found")
    return None

@router.delete("/firearms/{firearm_id}/ammunitions/{ammunition_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unlink_firearm_from_ammunition(
    firearm_id: int,
    ammunition_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Remove a link between a firearm and an ammunition type"""
    success = await unlink_firearm_ammunition(db, firearm_id, ammunition_id)
    if not success:
        raise HTTPException(status_code=404, detail="Relationship not found")
    return None