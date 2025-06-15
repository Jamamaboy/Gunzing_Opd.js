from sqlalchemy import delete as sql_delete, func
from sqlalchemy.sql import text
from models.exhibit import Exhibit
from models.firearm import Firearm, FirearmExampleImage, Ammunition, firearm_ammunitions
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete, insert
from sqlalchemy.orm import joinedload
from typing import List, Optional, Dict, Any
from config.database import get_db

async def get_firearm_by_id(db: AsyncSession, firearm_id: int) -> Optional[Dict]:
    """Get a single firearm by ID with relationships loaded"""
    result = await db.execute(
        select(Firearm)
        .options(
            joinedload(Firearm.example_images),
            joinedload(Firearm.ammunitions)
        )
        .filter(Firearm.id == firearm_id)
    )
    
    firearm = result.unique().scalars().first()
    if not firearm:
        return None
    
    return format_firearm(firearm)

def format_firearm(firearm: Firearm) -> Dict:
    """Format a firearm object into a dictionary with related data"""
    if not firearm:
        return None
        
    firearm_dict = {
        'id': firearm.id,
        'exhibit_id': firearm.exhibit_id,
        'mechanism': firearm.mechanism,
        'brand': firearm.brand,
        'series': firearm.series,
        'model': firearm.model,
        'normalized_name': firearm.normalized_name,
        'example_images': [],
        'ammunitions': []
    }
    
    # ✅ แก้ไข: ตรวจสอบว่ามี example_images ที่ load มาแล้วหรือไม่
    try:
        if hasattr(firearm, 'example_images') and firearm.example_images is not None:
            # ตรวจสอบว่า example_images ถูก load แล้วหรือยัง
            images = firearm.example_images
            if images:  # ถ้ามี images
                for img in images:
                    img_dict = {
                        'id': img.id,
                        'firearm_id': img.firearm_id,
                        'image_url': img.image_url,
                        'description': img.description,
                        'priority': img.priority
                    }
                    firearm_dict['example_images'].append(img_dict)
    except Exception as e:
        print(f"Warning: Could not load example_images for firearm {firearm.id}: {e}")
        firearm_dict['example_images'] = []

    # ✅ แก้ไข: ตรวจสอบว่ามี ammunitions ที่ load มาแล้วหรือไม่
    try:
        if hasattr(firearm, 'ammunitions') and firearm.ammunitions is not None:
            # ตรวจสอบว่า ammunitions ถูก load แล้วหรือยัง
            ammos = firearm.ammunitions
            if ammos:  # ถ้ามี ammunitions
                for ammo in ammos:
                    ammo_dict = {
                        'id': ammo.id,
                        'caliber': ammo.caliber,
                        'type': ammo.type,
                        'description': ammo.description
                    }
                    firearm_dict['ammunitions'].append(ammo_dict)
    except Exception as e:
        print(f"Warning: Could not load ammunitions for firearm {firearm.id}: {e}")
        firearm_dict['ammunitions'] = []
            
    return firearm_dict

async def create_firearm(db: AsyncSession, firearm_data: Dict[str, Any]) -> Dict:
    """Create a new firearm with relationships preloaded"""
    new_firearm = Firearm(**firearm_data)
    db.add(new_firearm)
    await db.commit()
    await db.refresh(new_firearm)
    
    # ✅ แก้ไข: ดึงข้อมูล firearm พร้อม relationships ที่ load แล้ว
    result = await db.execute(
        select(Firearm)
        .options(
            joinedload(Firearm.example_images),
            joinedload(Firearm.ammunitions)
        )
        .filter(Firearm.id == new_firearm.id)
    )
    
    firearm_with_relations = result.unique().scalars().first()
    return format_firearm(firearm_with_relations)

async def update_firearm(db: AsyncSession, firearm_id: int, firearm_data: Dict[str, Any]) -> Optional[Dict]:
    """Update an existing firearm"""
    result = await db.execute(select(Firearm).filter(Firearm.id == firearm_id))
    firearm = result.scalars().first()
    if not firearm:
        return None
    
    for key, value in firearm_data.items():
        setattr(firearm, key, value)
    
    await db.commit()
    await db.refresh(firearm)
    
    # ✅ แก้ไข: ดึงข้อมูล firearm พร้อม relationships ที่ load แล้ว
    result = await db.execute(
        select(Firearm)
        .options(
            joinedload(Firearm.example_images),
            joinedload(Firearm.ammunitions)
        )
        .filter(Firearm.id == firearm_id)
    )
    
    firearm_with_relations = result.unique().scalars().first()
    return format_firearm(firearm_with_relations)

async def delete_firearm_complete(db: AsyncSession, firearm_id: int) -> bool:
    """
    ลบ firearm และข้อมูลที่เกี่ยวข้องทั้งหมด รวมถึง exhibit
    """
    try:
        # 1. ค้นหา firearm และ exhibit_id
        firearm_result = await db.execute(
            select(Firearm)
            .options(joinedload(Firearm.exhibit))
            .filter(Firearm.id == firearm_id)
        )
        firearm = firearm_result.unique().scalars().first()
        
        if not firearm:
            return False
        
        exhibit_id = firearm.exhibit_id
        
        # 2. ลบ relationships ใน firearm_ammunitions ก่อน
        await db.execute(
            sql_delete(firearm_ammunitions).where(
                firearm_ammunitions.c.firearm_id == firearm_id
            )
        )
        
        # 3. ลบ firearm example images
        await db.execute(
            sql_delete(FirearmExampleImage).where(
                FirearmExampleImage.firearm_id == firearm_id
            )
        )
        
        # 4. ลบ firearm
        await db.delete(firearm)
        
        # 5. ลบ exhibit ที่เกี่ยวข้อง (ถ้ามี)
        if exhibit_id:
            exhibit_result = await db.execute(
                select(Exhibit).filter(Exhibit.id == exhibit_id)
            )
            exhibit = exhibit_result.scalars().first()
            
            if exhibit:
                # ตรวจสอบว่า exhibit นี้มี narcotic หรือ history อื่นๆ หรือไม่
                # ✅ แก้ไขการตรวจสอบ narcotic count
                narcotic_count_result = await db.execute(
                    text("SELECT COUNT(*) FROM narcotics WHERE exhibit_id = :exhibit_id"),
                    {"exhibit_id": exhibit_id}
                )
                narcotic_count = narcotic_count_result.scalar() or 0
                
                # ✅ แก้ไขการตรวจสอบ history count
                history_count_result = await db.execute(
                    text("SELECT COUNT(*) FROM history WHERE exhibit_id = :exhibit_id"),
                    {"exhibit_id": exhibit_id}
                )
                history_count = history_count_result.scalar() or 0
                
                # ถ้าไม่มีข้อมูลอื่นที่อ้างอิง exhibit นี้ ก็ลบ exhibit
                if narcotic_count == 0 and history_count == 0:
                    await db.delete(exhibit)
                    print(f"Deleted exhibit {exhibit_id} as it has no other references")
                else:
                    print(f"Keeping exhibit {exhibit_id} - narcotic_count: {narcotic_count}, history_count: {history_count}")
        
        await db.commit()
        return True
        
    except Exception as e:
        await db.rollback()
        print(f"Error deleting firearm completely: {e}")
        return False

# ✅ ปรับปรุงฟังก์ชันเดิม
async def delete_firearm(db: AsyncSession, firearm_id: int) -> bool:
    """Delete a firearm and its related data (ไม่ลบ exhibit)"""
    try:
        result = await db.execute(select(Firearm).filter(Firearm.id == firearm_id))
        firearm = result.scalars().first()
        if not firearm:
            return False
        
        # ลบ relationships ใน firearm_ammunitions ก่อน
        await db.execute(
            sql_delete(firearm_ammunitions).where(
                firearm_ammunitions.c.firearm_id == firearm_id
            )
        )
        
        # ลบ firearm (images จะถูกลบด้วย cascade)
        await db.delete(firearm)
        await db.commit()
        return True
        
    except Exception as e:
        await db.rollback()
        print(f"Error deleting firearm: {e}")
        return False

# Ammunition management functions
async def get_all_ammunitions(db: AsyncSession) -> List[Dict]:
    """Get all ammunition types"""
    result = await db.execute(select(Ammunition))
    ammunitions = result.scalars().all()
    return [
        {
            'id': ammo.id,
            'caliber': ammo.caliber,
            'type': ammo.type,
            'description': ammo.description
        }
        for ammo in ammunitions
    ]

async def get_ammunition_by_id(db: AsyncSession, ammunition_id: int) -> Optional[Dict]:
    """Get a single ammunition type by ID"""
    result = await db.execute(select(Ammunition).filter(Ammunition.id == ammunition_id))
    ammunition = result.scalars().first()
    if not ammunition:
        return None
        
    return {
        'id': ammunition.id,
        'caliber': ammunition.caliber,
        'type': ammunition.type,
        'description': ammunition.description
    }

async def create_ammunition(db: AsyncSession, ammunition_data: Dict[str, Any]) -> Dict:
    """Create a new ammunition type"""
    new_ammunition = Ammunition(**ammunition_data)
    db.add(new_ammunition)
    await db.commit()
    await db.refresh(new_ammunition)
    
    return {
        'id': new_ammunition.id,
        'caliber': new_ammunition.caliber,
        'type': new_ammunition.type,
        'description': new_ammunition.description
    }

async def update_ammunition(db: AsyncSession, ammunition_id: int, ammunition_data: Dict[str, Any]) -> Optional[Dict]:
    """Update an existing ammunition type"""
    result = await db.execute(select(Ammunition).filter(Ammunition.id == ammunition_id))
    ammunition = result.scalars().first()
    if not ammunition:
        return None
        
    for key, value in ammunition_data.items():
        setattr(ammunition, key, value)
        
    await db.commit()
    await db.refresh(ammunition)
    
    return {
        'id': ammunition.id,
        'caliber': ammunition.caliber,
        'type': ammunition.type,
        'description': ammunition.description
    }

async def delete_ammunition(db: AsyncSession, ammunition_id: int) -> bool:
    """Delete an ammunition type"""
    result = await db.execute(select(Ammunition).filter(Ammunition.id == ammunition_id))
    ammunition = result.scalars().first()
    if not ammunition:
        return False
        
    await db.delete(ammunition)
    await db.commit()
    return True

# Firearm and ammunition relationship functions
async def link_firearm_ammunition(db: AsyncSession, firearm_id: int, ammunition_id: int) -> bool:
    """Create a link between a firearm and an ammunition type"""
    try:
        # Check if firearm exists
        firearm_result = await db.execute(select(Firearm.id).filter(Firearm.id == firearm_id))
        if not firearm_result.scalar_one_or_none():
            return False
            
        # Check if ammunition exists
        ammo_result = await db.execute(select(Ammunition.id).filter(Ammunition.id == ammunition_id))
        if not ammo_result.scalar_one_or_none():
            return False
            
        # Link them using direct SQL
        stmt = text("""
            INSERT INTO firearm_ammunitions (firearm_id, ammunition_id) 
            VALUES (:firearm_id, :ammunition_id) 
            ON CONFLICT DO NOTHING
        """)
        await db.execute(stmt, {"firearm_id": firearm_id, "ammunition_id": ammunition_id})
        await db.commit()
        return True
    except Exception as e:
        await db.rollback()
        print(f"Error linking firearm to ammunition: {e}")
        return False

async def unlink_firearm_ammunition(db: AsyncSession, firearm_id: int, ammunition_id: int) -> bool:
    try:
        stmt = delete(firearm_ammunitions).where(
            (firearm_ammunitions.c.firearm_id == firearm_id) & 
            (firearm_ammunitions.c.ammunition_id == ammunition_id)
        )
        
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0
    except Exception as e:
        await db.rollback()
        print(f"Error unlinking firearm from ammunition: {e}")
        return False

async def link_multiple_firearm_ammunition(db: AsyncSession, firearm_id: int, ammunition_ids: List[int]) -> bool:
    """Link a firearm to multiple ammunition types"""
    try:
        success = True
        for ammunition_id in ammunition_ids:
            result = await link_firearm_ammunition(db, firearm_id, ammunition_id)
            if not result:
                success = False
        return success
    except Exception as e:
        print(f"Error linking firearm to multiple ammunition: {e}")
        return False