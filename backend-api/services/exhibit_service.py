from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete as sql_delete
from sqlalchemy.orm import joinedload
from typing import List, Optional, Dict, Any
from models.exhibit import Exhibit
from models.firearm import Firearm, FirearmExampleImage, Ammunition
from pydantic import BaseModel
from fastapi import APIRouter
from config.database import get_db
from services.firearm_service import format_firearm, create_firearm, update_firearm
from models.firearm import firearm_ammunitions

router = APIRouter()

class ExhibitWithFirearm(BaseModel):
    """Helper model to convert SQLAlchemy objects to dict format"""
    id: int
    category: str
    subcategory: str
    firearm: Optional[Dict] = None

async def get_exhibits(db: AsyncSession) -> List[Dict]:
    """Get all exhibits with relationships loaded"""
    result = await db.execute(
        select(Exhibit)
        .options(
            joinedload(Exhibit.firearm)
            .joinedload(Firearm.example_images),
            joinedload(Exhibit.firearm)
            .joinedload(Firearm.ammunitions)
        )
    )
    
    exhibits = result.unique().scalars().all()
    formatted_exhibits = []
    
    for exhibit in exhibits:
        exhibit_dict = {
            'id': exhibit.id,
            'category': exhibit.category,
            'subcategory': exhibit.subcategory,
            'firearm': None
        }
        
        # Handle firearm relationship
        if exhibit.firearm:
            # Take the first firearm if there are multiple
            firearm = exhibit.firearm[0] if isinstance(exhibit.firearm, list) else exhibit.firearm
            exhibit_dict['firearm'] = format_firearm(firearm)
            
        formatted_exhibits.append(exhibit_dict)
    
    return formatted_exhibits

async def get_exhibit_by_id(db: AsyncSession, exhibit_id: int) -> Optional[Dict]:
    """Get a single exhibit by ID with relationships loaded"""
    result = await db.execute(
        select(Exhibit)
        .options(
            joinedload(Exhibit.firearm).joinedload(Firearm.example_images),
            joinedload(Exhibit.firearm).joinedload(Firearm.ammunitions)
        )
        .filter(Exhibit.id == exhibit_id)
    )
    
    exhibit = result.unique().scalars().first()
    if not exhibit:
        return None
        
    # Format the exhibit with its relationships
    exhibit_dict = {
        'id': exhibit.id,
        'category': exhibit.category,
        'subcategory': exhibit.subcategory,
        'firearm': None
    }
    
    # Handle firearm relationship
    if exhibit.firearm:
        # Take the first firearm if there are multiple
        firearm = exhibit.firearm[0] if isinstance(exhibit.firearm, list) else exhibit.firearm
        exhibit_dict['firearm'] = format_firearm(firearm)
        
    return exhibit_dict

async def get_exhibit_by_firearm_id(db: AsyncSession, firearm_id: int) -> Optional[Dict]:
    """
    Get an exhibit by its associated firearm_id.
    """
    # First, find the firearm to get its exhibit_id
    firearm_result = await db.execute(
        select(Firearm.exhibit_id).where(Firearm.id == firearm_id)
    )
    exhibit_id_from_firearm = firearm_result.scalar_one_or_none()

    if exhibit_id_from_firearm is None:
        # Firearm not found or not linked to an exhibit
        return None

    # Now use the existing function to get the fully formatted exhibit
    return await get_exhibit_by_id(db, exhibit_id_from_firearm)

async def update_exhibit(db: AsyncSession, exhibit_id: int, exhibit_data: Dict[str, Any], 
                        firearm_data: Optional[Dict[str, Any]] = None) -> Optional[Dict]:
    """
    Update an existing exhibit and optionally its firearm data
    """
    # Get the exhibit
    result = await db.execute(select(Exhibit).filter(Exhibit.id == exhibit_id))
    exhibit = result.scalars().first()
    if not exhibit:
        return None
    
    # Update exhibit fields
    for key, value in exhibit_data.items():
        setattr(exhibit, key, value)
    
    # Handle firearm update if provided
    if firearm_data:
        # Check if firearm exists
        firearm_result = await db.execute(
            select(Firearm).filter(Firearm.exhibit_id == exhibit_id)
        )
        firearm = firearm_result.scalars().first()
        
        if firearm:
            # Update existing firearm using firearm_service
            await update_firearm(db, firearm.id, firearm_data)
        else:
            # Create new firearm using firearm_service
            firearm_data['exhibit_id'] = exhibit_id
            await create_firearm(db, firearm_data)
    
    await db.commit()
    await db.refresh(exhibit)
    
    # Get the updated exhibit with all relationships loaded
    return await get_exhibit_by_id(db, exhibit_id)

async def delete_exhibit_and_firearm(db: AsyncSession, exhibit_id: int) -> bool:
    """
    ลบ exhibit และ firearm ที่เกี่ยวข้องทั้งหมด
    """
    try:
        # ค้นหา exhibit และ firearm ที่เกี่ยวข้อง
        result = await db.execute(
            select(Exhibit)
            .options(joinedload(Exhibit.firearm))
            .filter(Exhibit.id == exhibit_id)
        )
        exhibit = result.unique().scalars().first()
        
        if not exhibit:
            return False
        
        # ลบ firearm ก่อน (ถ้ามี)
        if exhibit.firearm:
            # ✅ แก้ไขการจัดการ firearm ที่อาจเป็น list หรือ single object
            firearms = exhibit.firearm if isinstance(exhibit.firearm, list) else [exhibit.firearm]
            
            for firearm in firearms:
                # ลบ firearm ammunition relationships
                await db.execute(
                    sql_delete(firearm_ammunitions).where(
                        firearm_ammunitions.c.firearm_id == firearm.id
                    )
                )
                
                # ลบ firearm images
                await db.execute(
                    sql_delete(FirearmExampleImage).where(
                        FirearmExampleImage.firearm_id == firearm.id
                    )
                )
                
                # ลบ firearm
                await db.delete(firearm)
        
        # ลบ exhibit
        await db.delete(exhibit)
        await db.commit()
        return True
        
    except Exception as e:
        await db.rollback()
        print(f"Error deleting exhibit and firearm: {e}")
        return False

async def delete_exhibit(db: AsyncSession, exhibit_id: int) -> bool:
    """
    Delete an exhibit and its related data
    """
    # ใช้ฟังก์ชันใหม่ที่ลบทั้งหมด
    return await delete_exhibit_and_firearm(db, exhibit_id)

async def create_exhibit(db: AsyncSession, exhibit_data: Dict[str, Any], firearm_data: Optional[Dict[str, Any]] = None) -> Dict:
    """
    Create a new exhibit with optional firearm data
    """
    # Create the exhibit
    new_exhibit = Exhibit(**exhibit_data)
    db.add(new_exhibit)
    await db.flush()  # Flush to get the ID but don't commit yet
    
    # If firearm data is provided, create the firearm record using firearm_service
    if firearm_data:
        # Make sure to link the firearm to the exhibit
        firearm_data['exhibit_id'] = new_exhibit.id
        await create_firearm(db, firearm_data)
    
    await db.commit()
    await db.refresh(new_exhibit)
    
    # Get the created exhibit with all relationships loaded
    return await get_exhibit_by_id(db, new_exhibit.id)