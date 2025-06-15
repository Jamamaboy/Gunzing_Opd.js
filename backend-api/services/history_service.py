from typing import List, Optional, Dict, Any
from datetime import datetime, date, time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete, update, func
from sqlalchemy.orm import joinedload, Session
from geoalchemy2 import Geometry, WKTElement
from geoalchemy2.shape import to_shape
import re  # เพิ่มบรรทัดนี้ที่ด้านบน
from models import history as models
from models.exhibit import Exhibit
from models.user import User
from schemas import history as schemas
from services.image_service import upload_image_to_cloudinary
from config.database import get_db_connection

async def get_location_names(subdistrict_id: Optional[int]) -> Dict[str, str]:
    """Get location names from subdistrict ID using direct PostgreSQL connection"""
    location_info = {
        "province_name": None,
        "district_name": None,
        "subdistrict_name": None
    }
    
    if not subdistrict_id:
        return location_info
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get subdistrict, district and province info
        cursor.execute('''
            SELECT s.subdistrict_name, d.district_name, p.province_name
            FROM subdistricts s
            JOIN districts d ON s.district_id = d.id
            JOIN provinces p ON d.province_id = p.id
            WHERE s.id = %s
        ''', (subdistrict_id,))
        
        result = cursor.fetchone()
        if result:
            location_info["subdistrict_name"] = result[0]
            location_info["district_name"] = result[1]
            location_info["province_name"] = result[2]
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error fetching location names: {e}")
    
    return location_info

async def get_user_names(discovered_by: Optional[str], modified_by: Optional[str]) -> Dict[str, str]:
    """Get user names from user IDs using direct PostgreSQL connection"""
    user_info = {
        "discoverer_name": None,
        "modifier_name": None
    }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get discoverer name
        if discovered_by:
            cursor.execute('SELECT name FROM users WHERE user_id = %s', (discovered_by,))
            result = cursor.fetchone()
            if result:
                user_info["discoverer_name"] = result[0]
        
        # Get modifier name
        if modified_by:
            cursor.execute('SELECT name FROM users WHERE user_id = %s', (modified_by,))
            result = cursor.fetchone()
            if result:
                user_info["modifier_name"] = result[0]
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error fetching user names: {e}")
    
    return user_info

async def get_user_names_async(db: AsyncSession, discovered_by: Optional[str], modified_by: Optional[str]) -> Dict[str, str]:
    """Get user names from user IDs using SQLAlchemy async session"""
    user_info = {
        "discoverer_name": None,
        "modifier_name": None
    }
    
    try:
        # Get discoverer name
        if discovered_by:
            discoverer_stmt = select(User.firstname, User.lastname).where(User.user_id == discovered_by)
            discoverer_result = await db.execute(discoverer_stmt)
            discoverer_data = discoverer_result.first()
            
            if discoverer_data:
                user_info["discoverer_name"] = f"{discoverer_data[0]} {discoverer_data[1]}"
        
        # Get modifier name
        if modified_by:
            modifier_stmt = select(User.firstname, User.lastname).where(User.user_id == modified_by)
            modifier_result = await db.execute(modifier_stmt)
            modifier_data = modifier_result.first()
            
            if modifier_data:
                user_info["modifier_name"] = f"{modifier_data[0]} {modifier_data[1]}"
        
    except Exception as e:
        print(f"Error fetching user names: {e}")
    
    return user_info

async def get_all_histories(db: AsyncSession, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Get all history records with exhibit data and location names"""
    # Use func.ST_AsText to convert geometry to text for processing
    stmt = select(models.History, func.ST_AsText(models.History.location).label('location_wkt')).options(
        joinedload(models.History.exhibit).joinedload(Exhibit.firearm)
    )
    
    # Add filter for user_id if provided
    if user_id is not None:
        stmt = stmt.where(models.History.discovered_by == str(user_id))
        
    # Add ordering
    stmt = stmt.order_by(desc(models.History.created_at))
    
    # Add unique() to prevent the SQLAlchemy error with joined eager loads
    result = await db.execute(stmt)
    histories = result.unique().all()
    
    enhanced_histories = []
    for history, location_wkt in histories:
        # Convert ORM object to dict
        history_dict = {c.name: getattr(history, c.name) for c in history.__table__.columns}
        
        # Remove location from dict since we'll add lat/lon instead
        if 'location' in history_dict:
            del history_dict['location']
            
        # Parse location to get lat/lng
        if location_wkt:
            # Format: "POINT(longitude latitude)"
            # We need to extract and swap these values
            wkt_parts = location_wkt.replace('POINT(', '').replace(')', '').split()
            if len(wkt_parts) >= 2:
                history_dict['longitude'] = float(wkt_parts[0])
                history_dict['latitude'] = float(wkt_parts[1])
        
        # Format dates for JSON serialization
        if history_dict.get('discovery_date'):
            history_dict['discovery_date'] = history_dict['discovery_date'].isoformat()
        if history_dict.get('discovery_time'):
            # Format time as HH:MM only to match validator expectation
            time_obj = history_dict['discovery_time']
            history_dict['discovery_time'] = f"{time_obj.hour:02d}:{time_obj.minute:02d}"
        if history_dict.get('created_at'):
            history_dict['created_at'] = history_dict['created_at'].isoformat()
        if history_dict.get('modified_at'):
            history_dict['modified_at'] = history_dict['modified_at'].isoformat()
            
        # Format ai_confidence to 2 decimal places if it exists
        if history_dict.get('ai_confidence') is not None:
            history_dict['ai_confidence'] = float(history_dict['ai_confidence'])
        
        # Add exhibit data if available
        if history.exhibit:
            exhibit_dict = {c.name: getattr(history.exhibit, c.name) for c in history.exhibit.__table__.columns}
            
            # Add firearm data if available
            if history.exhibit.firearm:
                if hasattr(history.exhibit.firearm, '__iter__') and not isinstance(history.exhibit.firearm, str):
                    firearm_list = []
                    for firearm in history.exhibit.firearm:
                        if hasattr(firearm, '__table__'):
                            firearm_dict = {c.name: getattr(firearm, c.name) for c in firearm.__table__.columns}
                            firearm_list.append(firearm_dict)
                    
                    exhibit_dict['firearms'] = firearm_list
                else:
                    if hasattr(history.exhibit.firearm, '__table__'):
                        firearm_dict = {c.name: getattr(history.exhibit.firearm, c.name) for c in history.exhibit.firearm.__table__.columns}
                        exhibit_dict['firearm'] = firearm_dict
            
            history_dict['exhibit'] = exhibit_dict
        
        # Get location names
        location_names = await get_location_names(history.subdistrict_id)
        
        # Get user names
        user_names = await get_user_names(history.discovered_by, history.modified_by)
        
        # Merge additional info into history dict
        history_dict.update(location_names)
        history_dict.update(user_names)
        
        enhanced_histories.append(history_dict)
    
    return enhanced_histories

async def get_history_by_id(db: AsyncSession, history_id: int) -> Dict[str, Any]:
    """Get a specific history record by ID with exhibit data and location names"""
    # Use func.ST_AsText to convert geometry to text for processing
    stmt = select(models.History, func.ST_AsText(models.History.location).label('location_wkt')).options(
        joinedload(models.History.exhibit).joinedload(Exhibit.firearm)
    ).where(models.History.id == history_id)
    
    result = await db.execute(stmt)
    history_with_location = result.unique().first()
    
    if not history_with_location:
        return None
        
    history, location_wkt = history_with_location
    
    # Convert ORM object to dict
    history_dict = {c.name: getattr(history, c.name) for c in history.__table__.columns}
    
    # Remove location from dict since we'll add lat/lon instead
    if 'location' in history_dict:
        del history_dict['location']
        
    # Parse location to get lat/lng
    if location_wkt:
        # Format: "POINT(longitude latitude)"
        # We need to extract and swap these values
        wkt_parts = location_wkt.replace('POINT(', '').replace(')', '').split()
        if len(wkt_parts) >= 2:
            history_dict['longitude'] = float(wkt_parts[0])
            history_dict['latitude'] = float(wkt_parts[1])
    
    # Format dates for JSON serialization
    if history_dict.get('discovery_date'):
        history_dict['discovery_date'] = history_dict['discovery_date'].isoformat()
    if history_dict.get('discovery_time'):
        # Format time as HH:MM only
        time_obj = history_dict['discovery_time']
        history_dict['discovery_time'] = f"{time_obj.hour:02d}:{time_obj.minute:02d}"
    if history_dict.get('created_at'):
        history_dict['created_at'] = history_dict['created_at'].isoformat()
    if history_dict.get('modified_at'):
        history_dict['modified_at'] = history_dict['modified_at'].isoformat()
    
    # Format ai_confidence to 2 decimal places if it exists
    if history_dict.get('ai_confidence') is not None:
        history_dict['ai_confidence'] = float(history_dict['ai_confidence'])
    
    # Add exhibit data if available
    if history.exhibit:
        exhibit_dict = {c.name: getattr(history.exhibit, c.name) for c in history.exhibit.__table__.columns}
        
        # Add firearm data if available
        if history.exhibit.firearm:
            if hasattr(history.exhibit.firearm, '__iter__') and not isinstance(history.exhibit.firearm, str):
                firearm_list = []
                for firearm in history.exhibit.firearm:
                    if hasattr(firearm, '__table__'):
                        firearm_dict = {c.name: getattr(firearm, c.name) for c in firearm.__table__.columns}
                        firearm_list.append(firearm_dict)
                
                exhibit_dict['firearms'] = firearm_list
            else:
                if hasattr(history.exhibit.firearm, '__table__'):
                    firearm_dict = {c.name: getattr(history.exhibit.firearm, c.name) for c in history.exhibit.firearm.__table__.columns}
                    exhibit_dict['firearm'] = firearm_dict
        
        history_dict['exhibit'] = exhibit_dict
    
    # Get location names
    location_names = await get_location_names(history.subdistrict_id)
    
    # Get user names
    user_names = await get_user_names(history.discovered_by, history.modified_by)
    
    # Merge additional info into history dict
    history_dict.update(location_names)
    history_dict.update(user_names)
    
    return history_dict

async def create_history(db: AsyncSession, history_data: schemas.HistoryCreate, image_file=None) -> Dict[str, Any]:
    """Create a new history record with optional image upload"""
    try:
        print(f"Creating history record with data: {history_data}")
        
        # Prepare history dict from data
        history_dict = history_data.model_dump(exclude_unset=True)
        
        # Extract latitude and longitude from the data and create WKTElement
        latitude = history_dict.pop('latitude', None)
        longitude = history_dict.pop('longitude', None)
        
        print(f"Processing coordinates: lat={latitude}, lng={longitude}")
        
        # Create PostGIS POINT from lat/lon
        if latitude is not None and longitude is not None:
            # Create a WKT string for the point with longitude first, then latitude
            point_wkt = f'POINT({longitude} {latitude})'
            print(f"Creating WKT point: {point_wkt}")
            history_dict['location'] = WKTElement(point_wkt, srid=4326)
        else:
            print("ERROR: Missing latitude or longitude!")
            raise ValueError("Latitude and longitude are required")
        
        # Check required fields
        if 'discovered_by' not in history_dict or not history_dict['discovered_by']:
            print("ERROR: Missing discovered_by!")
            # Try to set a default value to prevent error
            history_dict['discovered_by'] = 'system'
        
        # แปลงค่าความมั่นใจให้เป็นรูปแบบที่ถูกต้อง
        if 'ai_confidence' in history_dict:
            ai_confidence = history_dict.get('ai_confidence')
            if ai_confidence is not None:
                history_dict['ai_confidence'] = float(ai_confidence)
                print(f"AI Confidence set to: {history_dict['ai_confidence']}%")
        
        # Handle image upload if present
        if image_file:
            try:
                print(f"Processing image upload: {type(image_file)}")
                image_result = await upload_image_to_cloudinary(image_file, 'evidence_history')
                
                # แก้ไขตรงนี้: แปลงข้อมูล dictionary เป็น string URL
                if isinstance(image_result, dict) and 'secure_url' in image_result:
                    history_dict['photo_url'] = image_result['secure_url']
                    print(f"Image uploaded successfully: {history_dict['photo_url']}")
                else:
                    print(f"Warning: Unexpected format for image_result: {image_result}")
                    history_dict['photo_url'] = str(image_result)
            except Exception as e:
                print(f"Image upload error: {e}")
        
        # Create new history record
        print(f"Final history dict for DB: {history_dict}")
        db_history = models.History(**history_dict)
        db.add(db_history)
        
        try:
            await db.commit()
            print("Database commit successful")
        except Exception as e:
            await db.rollback()
            print(f"Database commit failed: {e}")
            import traceback
            traceback.print_exc()
            raise
        
        await db.refresh(db_history)
        print(f"History record created with ID: {db_history.id}")
        
        # Return the created history with additional details
        return await get_history_by_id(db, db_history.id)
    except Exception as e:
        print(f"Error creating history record: {e}")
        import traceback
        traceback.print_exc()
        await db.rollback()
        raise

async def update_history(db: AsyncSession, history_id: int, history_data: schemas.HistoryUpdate, image_file=None) -> Dict[str, Any]:
    """Update a history record with optional image upload"""
    # Get the history record
    stmt = select(models.History).where(models.History.id == history_id)
    result = await db.execute(stmt)
    history = result.scalars().first()
    
    if not history:
        return None
    
    # Prepare update data
    update_data = history_data.model_dump(exclude_unset=True)
    
    # Update the 'modified_at' timestamp
    update_data['modified_at'] = datetime.now()
    
    # Extract latitude and longitude and update location if both are provided
    latitude = update_data.pop('latitude', None)
    longitude = update_data.pop('longitude', None)
    
    if latitude is not None and longitude is not None:
        # Create a WKT string for the point with longitude first
        point_wkt = f'POINT({longitude} {latitude})'
        update_data['location'] = WKTElement(point_wkt, srid=4326)
    
    # แปลงค่าความมั่นใจให้เป็นรูปแบบที่ถูกต้อง
    if 'ai_confidence' in update_data:
        ai_confidence = update_data.get('ai_confidence')
        if ai_confidence is not None:
            update_data['ai_confidence'] = float(ai_confidence)
            print(f"AI Confidence updated to: {update_data['ai_confidence']}%")
    
    # Handle image upload if present
    if image_file:
        try:
            image_url = await upload_image_to_cloudinary(image_file, 'evidence_history')
            update_data['photo_url'] = image_url
        except Exception as e:
            print(f"Image upload error: {e}")
    
    # Update history fields
    for key, value in update_data.items():
        setattr(history, key, value)
    
    await db.commit()
    await db.refresh(history)
    
    # Get the updated history with additional details
    return await get_history_by_id(db, history.id)

async def delete_history(db: AsyncSession, history_id: int) -> bool:
    """Delete a history record"""
    # Get the history record
    stmt = select(models.History).where(models.History.id == history_id)
    result = await db.execute(stmt)
    history = result.scalars().first()
    
    if not history:
        return False
    
    await db.delete(history)
    await db.commit()
    return True

async def get_histories_by_exhibit_id(db: AsyncSession, exhibit_id: int) -> List[Dict[str, Any]]:
    """Get history records by exhibit ID with additional details"""
    # Use func.ST_AsText to convert geometry to text for processing
    stmt = select(models.History, func.ST_AsText(models.History.location).label('location_wkt')).options(
        joinedload(models.History.exhibit).joinedload(Exhibit.firearm)
    ).where(
        models.History.exhibit_id == exhibit_id
    ).order_by(
        desc(models.History.created_at)
    )
    
    result = await db.execute(stmt)
    histories = result.unique().all()
    
    if not histories:
        return []
    
    enhanced_histories = []
    for history, location_wkt in histories:
        # Convert ORM object to dict
        history_dict = {c.name: getattr(history, c.name) for c in history.__table__.columns}
        
        # Remove location from dict since we'll add lat/lon instead
        if 'location' in history_dict:
            del history_dict['location']
            
        # Parse location to get lat/lng
        if location_wkt:
            # Format: "POINT(longitude latitude)"
            # We need to extract and swap these values
            wkt_parts = location_wkt.replace('POINT(', '').replace(')', '').split()
            if len(wkt_parts) >= 2:
                history_dict['longitude'] = float(wkt_parts[0])
                history_dict['latitude'] = float(wkt_parts[1])
        
        # Format dates for JSON serialization
        if history_dict.get('discovery_date'):
            history_dict['discovery_date'] = history_dict['discovery_date'].isoformat()
        if history_dict.get('discovery_time'):
            # Format time as HH:MM only
            time_obj = history_dict['discovery_time']
            history_dict['discovery_time'] = f"{time_obj.hour:02d}:{time_obj.minute:02d}"
        if history_dict.get('created_at'):
            history_dict['created_at'] = history_dict['created_at'].isoformat()
        if history_dict.get('modified_at'):
            history_dict['modified_at'] = history_dict['modified_at'].isoformat()
        
        # Format ai_confidence to 2 decimal places if it exists
        if history_dict.get('ai_confidence') is not None:
            history_dict['ai_confidence'] = float(history_dict['ai_confidence'])
    
        # Add exhibit data if available
        if history.exhibit:
            exhibit_dict = {c.name: getattr(history.exhibit, c.name) for c in history.exhibit.__table__.columns}
            
            # Add firearm data if available
            if history.exhibit.firearm:
                if hasattr(history.exhibit.firearm, '__iter__') and not isinstance(history.exhibit.firearm, str):
                    firearm_list = []
                    for firearm in history.exhibit.firearm:
                        if hasattr(firearm, '__table__'):
                            firearm_dict = {c.name: getattr(firearm, c.name) for c in firearm.__table__.columns}
                            firearm_list.append(firearm_dict)
                    
                    exhibit_dict['firearms'] = firearm_list
                else:
                    if hasattr(history.exhibit.firearm, '__table__'):
                        firearm_dict = {c.name: getattr(history.exhibit.firearm, c.name) for c in history.exhibit.firearm.__table__.columns}
                        exhibit_dict['firearm'] = firearm_dict
            
            history_dict['exhibit'] = exhibit_dict
        
        # Get location names
        location_names = await get_location_names(history.subdistrict_id)
        
        # Get user names
        user_names = await get_user_names(history.discovered_by, history.modified_by)
        
        # Merge additional info into history dict
        history_dict.update(location_names)
        history_dict.update(user_names)
        
        enhanced_histories.append(history_dict)
    
    return enhanced_histories

async def get_unknown_firearms(db: AsyncSession) -> List[Dict[str, Any]]:
    """Get all history records linked to firearms with unknown subcategory"""
    # ใช้ joinedload เพื่อดึงข้อมูล exhibit พร้อมกับ history
    stmt = select(models.History, func.ST_AsText(models.History.location).label('location_wkt')).options(
        joinedload(models.History.exhibit)
    ).join(models.History.exhibit).filter(
        Exhibit.category == "อาวุธปืน",
        Exhibit.subcategory == "unknown"
    ).order_by(desc(models.History.created_at))
    
    result = await db.execute(stmt)
    histories = result.unique().all()
    
    unknown_firearms = []
    for history, location_wkt in histories:
        # สร้าง dict จาก ORM object
        history_dict = {c.name: getattr(history, c.name) for c in history.__table__.columns}
        
        # ลบ location เพราะเราจะเพิ่ม lat/lon แทน
        if 'location' in history_dict:
            history_dict.pop('location')
        
        # แปลง location จาก WKT เป็น lat/lng
        if location_wkt:
            point = to_shape(WKTElement(location_wkt))
            history_dict['latitude'] = point.y
            history_dict['longitude'] = point.x
        
        # จัดการกับเวลาและวันที่เพื่อให้ serializable
        if history_dict.get('discovery_date'):
            history_dict['discovery_date'] = history_dict['discovery_date'].isoformat()
        if history_dict.get('discovery_time'):
            history_dict['discovery_time'] = history_dict['discovery_time'].isoformat()
        if history_dict.get('created_at'):
            history_dict['created_at'] = history_dict['created_at'].isoformat()
        if history_dict.get('modified_at'):
            history_dict['modified_at'] = history_dict['modified_at'].isoformat()
        
        # Format ai_confidence if it exists
        if history_dict.get('ai_confidence') is not None:
            history_dict['ai_confidence'] = float(history_dict['ai_confidence'])
    
        # เพิ่มข้อมูล exhibit
        if history.exhibit:
            history_dict['exhibit'] = {
                'id': history.exhibit.id,
                'category': history.exhibit.category,
                'subcategory': history.exhibit.subcategory
            }
        
        # เพิ่มข้อมูลตำแหน่ง
        location_names = await get_location_names(history.subdistrict_id)
        history_dict.update(location_names)
        
        # เพิ่มข้อมูลผู้ใช้งาน
        user_names = await get_user_names(history.discovered_by, history.modified_by)
        history_dict.update(user_names)
        
        unknown_firearms.append(history_dict)
    
    return unknown_firearms

async def get_firearm_classes(db: AsyncSession) -> List[str]:
    """Get all available firearm classes (subcategories)"""
    stmt = select(Exhibit.subcategory).filter(
        Exhibit.category == "อาวุธปืน",
        Exhibit.subcategory != "unknown",
        Exhibit.subcategory.is_not(None)
    ).distinct()
    
    result = await db.execute(stmt)
    classes = result.scalars().all()
    
    # เพิ่มค่าเริ่มต้นหากไม่มีข้อมูล
    if not classes:
        classes = ["ปืนพก", "ปืนยาว", "ปืนลูกซอง", "ปืนกล", "ปืนลูกโม่"]
    
    return sorted(classes)

async def update_firearm_class(db: AsyncSession, history_id: int, class_name: str) -> bool:
    """
    Update firearm classification by linking history to an existing exhibit with the specified class
    or creating a new one if it doesn't exist
    """
    try:
        # 1. หา history record
        history_stmt = select(models.History).where(models.History.id == history_id)
        result = await db.execute(history_stmt)
        history = result.scalars().first()
        
        if not history:
            return False
        
        # 2. หา exhibit ที่มีชนิดปืนตามที่ระบุ
        exhibit_stmt = select(Exhibit).filter(
            Exhibit.category == "อาวุธปืน", 
            Exhibit.subcategory == class_name
        ).order_by(Exhibit.id).limit(1)  # เลือกรายการแรกที่พบ
        
        exhibit_result = await db.execute(exhibit_stmt)
        target_exhibit = exhibit_result.scalars().first()
        
        # 3. ถ้าไม่พบ exhibit ที่มีชนิดปืนตามที่ระบุ ให้สร้างใหม่
        if not target_exhibit:
            target_exhibit = Exhibit(
                category="อาวุธปืน",
                subcategory=class_name
            )
            db.add(target_exhibit)
            await db.flush()  # สร้าง ID ก่อนใช้งาน
        
        # 4. ดึง exhibit_id เดิมและเก็บไว้ (ในกรณีที่เราต้องการจัดการกับ exhibit เดิมที่ไม่มีการอ้างอิงแล้ว)
        old_exhibit_id = history.exhibit_id
        
        # 5. อัปเดต exhibit_id ของ history เป็น ID ของ exhibit ชนิดปืนที่ถูกระบุ
        history.exhibit_id = target_exhibit.id
        
        await db.commit()
        
        # 6. เช็คว่า exhibit เดิมยังมีการอ้างอิงจาก history อื่นอยู่อีกหรือไม่
        # หากไม่มีการอ้างอิงแล้ว และชนิดปืนเป็น unknown อาจพิจารณาลบทิ้ง
        # (ส่วนนี้เป็น optional ไม่จำเป็นต้องทำก็ได้)
        if old_exhibit_id:
            ref_check = select(models.History).filter(models.History.exhibit_id == old_exhibit_id)
            ref_result = await db.execute(ref_check)
            has_references = ref_result.scalar() is not None
            
            if not has_references:
                # ถ้าไม่มี history อื่นอ้างถึง exhibit เดิมแล้ว อาจพิจารณาลบทิ้ง
                old_exhibit_stmt = select(Exhibit).filter(Exhibit.id == old_exhibit_id)
                old_exhibit_result = await db.execute(old_exhibit_stmt)
                old_exhibit = old_exhibit_result.scalars().first()
                
                if old_exhibit and old_exhibit.subcategory == "unknown":
                    await db.delete(old_exhibit)
                    await db.commit()
        
        return True
    except Exception as e:
        await db.rollback()
        print(f"Error updating firearm class: {e}")
        return False

async def add_firearm_class(db: AsyncSession, class_name: str) -> bool:
    """Add a new firearm class - this just ensures the category exists"""
    try:
        # ตรวจสอบว่ามี exhibit ที่มีชนิดนี้หรือไม่
        check_stmt = select(Exhibit).filter(
            Exhibit.category == "อาวุธปืน", 
            Exhibit.subcategory == class_name
        ).limit(1)
        
        result = await db.execute(check_stmt)
        existing = result.scalars().first()
        
        # ถ้ามีแล้ว ไม่ต้องทำอะไร
        if existing:
            return True
        
        # ถ้ายังไม่มี สร้าง placeholder exhibit เพื่อเก็บชนิดปืนใหม่
        new_exhibit = Exhibit(
            category="อาวุธปืน",
            subcategory=class_name,
            description=f"Class reference: {class_name}"
        )
        db.add(new_exhibit)
        await db.commit()
        
        return True
    except Exception as e:
        await db.rollback()
        print(f"Error adding firearm class: {e}")
        return False

async def get_histories_by_exhibit_and_user(db: AsyncSession, exhibit_id: int, user_id: str):
    """
    Get history records by exhibit ID and user ID with related exhibit and location data
    """
    try:
        # เปลี่ยนการใช้ db.query เป็นรูปแบบ async
        stmt = select(models.History, func.ST_AsText(models.History.location).label('location_wkt')).options(
            joinedload(models.History.exhibit).joinedload(Exhibit.firearm)
        ).where(
            models.History.exhibit_id == exhibit_id,
            models.History.discovered_by == user_id
        ).order_by(
            desc(models.History.created_at)
        )
        
        result = await db.execute(stmt)
        histories = result.unique().all()
        
        if not histories:
            return []
        
        enhanced_histories = []
        for history, location_wkt in histories:
            # แทนที่จะใช้ format_history_with_location_names ให้ใช้โค้ดที่คล้ายกับใน get_histories_by_exhibit_id
            # สร้าง dictionary จาก ORM object
            history_dict = {c.name: getattr(history, c.name) for c in history.__table__.columns}
            
            # Remove location from dict since we'll add lat/lon instead
            if 'location' in history_dict:
                del history_dict['location']
                
            # Parse location to get lat/lng
            if location_wkt:
                wkt_parts = location_wkt.replace('POINT(', '').replace(')', '').split()
                if len(wkt_parts) >= 2:
                    history_dict['longitude'] = float(wkt_parts[0])
                    history_dict['latitude'] = float(wkt_parts[1])
            
            # Format dates for JSON serialization
            if history_dict.get('discovery_date'):
                history_dict['discovery_date'] = history_dict['discovery_date'].isoformat()
            if history_dict.get('discovery_time'):
                time_obj = history_dict['discovery_time']
                history_dict['discovery_time'] = f"{time_obj.hour:02d}:{time_obj.minute:02d}"
            if history_dict.get('created_at'):
                history_dict['created_at'] = history_dict['created_at'].isoformat()
            if history_dict.get('modified_at'):
                history_dict['modified_at'] = history_dict['modified_at'].isoformat()
            
            # Format ai_confidence
            if history_dict.get('ai_confidence') is not None:
                history_dict['ai_confidence'] = float(history_dict['ai_confidence'])
        
            # Add exhibit data if available
            if history.exhibit:
                exhibit_dict = {c.name: getattr(history.exhibit, c.name) for c in history.exhibit.__table__.columns}
                
                # Add firearm data if available
                if history.exhibit.firearm:
                    if hasattr(history.exhibit.firearm, '__iter__') and not isinstance(history.exhibit.firearm, str):
                        firearm_list = []
                        for firearm in history.exhibit.firearm:
                            if hasattr(firearm, '__table__'):
                                firearm_dict = {c.name: getattr(firearm, c.name) for c in firearm.__table__.columns}
                                firearm_list.append(firearm_dict)
                        
                        exhibit_dict['firearms'] = firearm_list
                    else:
                        if hasattr(history.exhibit.firearm, '__table__'):
                            firearm_dict = {c.name: getattr(history.exhibit.firearm, c.name) for c in history.exhibit.firearm.__table__.columns}
                            exhibit_dict['firearm'] = firearm_dict
                
                history_dict['exhibit'] = exhibit_dict
            
            # Get location names
            location_names = await get_location_names(history.subdistrict_id)
            
            # Get user names
            user_names = await get_user_names(history.discovered_by, history.modified_by)
            
            # Merge additional info into history dict
            history_dict.update(location_names)
            history_dict.update(user_names)
            
            enhanced_histories.append(history_dict)
        
        return enhanced_histories
    except Exception as e:
        print(f"Error in get_histories_by_exhibit_and_user: {str(e)}")
        import traceback
        traceback.print_exc()
        raise e

def format_history_with_location_names(db: Session, history):
    """
    Format a history record with location names and related data
    """
    # Convert to dict for easier manipulation
    history_dict = {c.name: getattr(history, c.name) for c in history.__table__.columns}
    
    # Convert Point geometry to lat/long
    if history.location:
        from sqlalchemy import func
        point_wkt = db.scalar(func.ST_AsText(history.location))
        if point_wkt:
            # WKT format is 'POINT(longitude latitude)'
            match = re.search(r'POINT\(([-\d.]+) ([-\d.]+)\)', point_wkt)
            if match:
                history_dict['longitude'] = float(match.group(1))
                history_dict['latitude'] = float(match.group(2))
    
    # Add exhibit data if available
    if history.exhibit:
        history_dict['exhibit'] = {
            'id': history.exhibit.id,
            'category': history.exhibit.category,
            'subcategory': history.exhibit.subcategory
        }
        
        # Add more specific data based on exhibit type (e.g., firearms)
        if history.exhibit.firearms:
            firearms = history.exhibit.firearms
            if isinstance(firearms, list) and len(firearms) > 0:
                firearm = firearms[0]
            else:
                firearm = firearms
                
            if firearm:
                history_dict['exhibit']['firearms'] = {
                    'id': firearm.id,
                    'brand': firearm.brand,
                    'model': firearm.model,
                    'series': firearm.series,
                    'mechanism': firearm.mechanism
                }
    
    # Add location names
    if history.subdistrict:
        history_dict['subdistrict_name'] = history.subdistrict.name
        if history.subdistrict.district:
            history_dict['district_name'] = history.subdistrict.district.name
            if history.subdistrict.district.province:
                history_dict['province_name'] = history.subdistrict.district.province.name
    
    # Add user names
    if history.discoverer:
        history_dict['discoverer_name'] = f"{history.discoverer.first_name} {history.disdiscoverer.last_name}"
    
    if history.modifier:
        history_dict['modifier_name'] = f"{history.modifier.first_name} {history.modifier.last_name}"
    
    return history_dict

async def get_firearm_histories(db: AsyncSession) -> List[Dict[str, Any]]:
    """Get all history records that have firearms category (อาวุธปืน)"""
    # Use func.ST_AsText to convert geometry to text for processing
    stmt = select(models.History, func.ST_AsText(models.History.location).label('location_wkt')).options(
        joinedload(models.History.exhibit).joinedload(Exhibit.firearm)
    ).join(models.History.exhibit).filter(
        Exhibit.category == "อาวุธปืน"
    ).order_by(desc(models.History.created_at))
    
    result = await db.execute(stmt)
    histories = result.unique().all()
    
    enhanced_histories = []
    for history, location_wkt in histories:
        # Convert ORM object to dict
        history_dict = {c.name: getattr(history, c.name) for c in history.__table__.columns}
        
        # Remove location from dict since we'll add lat/lon instead
        if 'location' in history_dict:
            del history_dict['location']
            
        # Parse location to get lat/lng
        if location_wkt:
            # Format: "POINT(longitude latitude)"
            # We need to extract and swap these values
            wkt_parts = location_wkt.replace('POINT(', '').replace(')', '').split()
            if len(wkt_parts) >= 2:
                history_dict['longitude'] = float(wkt_parts[0])
                history_dict['latitude'] = float(wkt_parts[1])
        
        # Format dates for JSON serialization
        if history_dict.get('discovery_date'):
            history_dict['discovery_date'] = history_dict['discovery_date'].isoformat()
        if history_dict.get('discovery_time'):
            # Format time as HH:MM:SS
            time_obj = history_dict['discovery_time']
            history_dict['discovery_time'] = f"{time_obj.hour:02d}:{time_obj.minute:02d}:{time_obj.second:02d}"
        if history_dict.get('created_at'):
            history_dict['created_at'] = history_dict['created_at'].isoformat()
        if history_dict.get('modified_at'):
            history_dict['modified_at'] = history_dict['modified_at'].isoformat()
            
        # Format ai_confidence to 2 decimal places if it exists
        if history_dict.get('ai_confidence') is not None:
            history_dict['ai_confidence'] = float(history_dict['ai_confidence'])
        
        # Add exhibit data if available
        if history.exhibit:
            exhibit_dict = {c.name: getattr(history.exhibit, c.name) for c in history.exhibit.__table__.columns}
            
            # Add firearm data if available
            if history.exhibit.firearm:
                firearm_list = []
                for firearm in history.exhibit.firearm:
                    firearm_dict = {c.name: getattr(firearm, c.name) for c in firearm.__table__.columns}
                    firearm_list.append(firearm_dict)
                exhibit_dict['firearms'] = firearm_list
            
            history_dict['exhibit'] = exhibit_dict
        
        # Get location names
        location_names = await get_location_names(history.subdistrict_id)
        
        # Get user names
        user_names = await get_user_names(history.discovered_by, history.modified_by)
        
        # Merge additional info into history dict
        history_dict.update(location_names)
        history_dict.update(user_names)
        
        enhanced_histories.append(history_dict)
    
    return enhanced_histories

async def get_firearm_history_by_id(db: AsyncSession, history_id: int) -> Optional[Dict[str, Any]]:
    """Get a specific firearm history record by ID with exhibit data and location names"""
    # Use func.ST_AsText to convert geometry to text for processing
    stmt = select(models.History, func.ST_AsText(models.History.location).label('location_wkt')).options(
        joinedload(models.History.exhibit).joinedload(Exhibit.firearm)
    ).join(models.History.exhibit).filter(
        models.History.id == history_id,
        Exhibit.category == "อาวุธปืน"
    )
    
    result = await db.execute(stmt)
    history_with_location = result.unique().first()
    
    if not history_with_location:
        return None
        
    history, location_wkt = history_with_location
    
    # Convert ORM object to dict
    history_dict = {c.name: getattr(history, c.name) for c in history.__table__.columns}
    
    # Remove location from dict since we'll add lat/lon instead
    if 'location' in history_dict:
        del history_dict['location']
        
    # Parse location to get lat/lng
    if location_wkt:
        # Format: "POINT(longitude latitude)"
        # We need to extract and swap these values
        wkt_parts = location_wkt.replace('POINT(', '').replace(')', '').split()
        if len(wkt_parts) >= 2:
            history_dict['longitude'] = float(wkt_parts[0])
            history_dict['latitude'] = float(wkt_parts[1])
    
    # Format dates for JSON serialization
    if history_dict.get('discovery_date'):
        history_dict['discovery_date'] = history_dict['discovery_date'].isoformat()
    if history_dict.get('discovery_time'):
        # Format time as HH:MM:SS
        time_obj = history_dict['discovery_time']
        history_dict['discovery_time'] = f"{time_obj.hour:02d}:{time_obj.minute:02d}:{time_obj.second:02d}"
    if history_dict.get('created_at'):
        history_dict['created_at'] = history_dict['created_at'].isoformat()
    if history_dict.get('modified_at'):
        history_dict['modified_at'] = history_dict['modified_at'].isoformat()
    
    # Format ai_confidence to 2 decimal places if it exists
    if history_dict.get('ai_confidence') is not None:
        history_dict['ai_confidence'] = float(history_dict['ai_confidence'])
    
    # Add exhibit data if available
    if history.exhibit:
        exhibit_dict = {c.name: getattr(history.exhibit, c.name) for c in history.exhibit.__table__.columns}
        
        # Add firearm data if available
        if history.exhibit.firearm:
            if hasattr(history.exhibit.firearm, '__iter__') and not isinstance(history.exhibit.firearm, str):
                # Multiple firearms (list)
                firearms_data = []
                for firearm in history.exhibit.firearm:
                    firearm_dict = {c.name: getattr(firearm, c.name) for c in firearm.__table__.columns}
                    firearms_data.append(firearm_dict)
                exhibit_dict['firearms'] = firearms_data
            else:
                # Single firearm
                firearm_dict = {c.name: getattr(history.exhibit.firearm, c.name) for c in history.exhibit.firearm.__table__.columns}
                exhibit_dict['firearms'] = [firearm_dict]
        
        history_dict['exhibit'] = exhibit_dict
    
    # Get location names
    location_names = await get_location_names(history.subdistrict_id)
    
    # Get user names ด้วย discovered_by และ modified_by ที่เป็น user_id
    user_names = await get_user_names_async(db, history.discovered_by, history.modified_by)
    
    # Merge additional info into history dict
    history_dict.update(location_names)
    history_dict.update(user_names)
    
    return history_dict

async def get_narcotic_histories(db: AsyncSession) -> List[Dict[str, Any]]:
    """Get all history records for narcotic exhibits only"""
    # Use func.ST_AsText to convert geometry to text for processing
    stmt = select(models.History, func.ST_AsText(models.History.location).label('location_wkt')).options(
        joinedload(models.History.exhibit).joinedload(Exhibit.narcotic)
    ).where(models.History.exhibit.has(Exhibit.category == "ยาเสพติด"))
    
    # Add ordering
    stmt = stmt.order_by(desc(models.History.created_at))
    
    # Add unique() to prevent the SQLAlchemy error with joined eager loads
    result = await db.execute(stmt)
    histories = result.unique().all()
    
    enhanced_histories = []
    for history, location_wkt in histories:
        # Process location data
        latitude, longitude = None, None
        if location_wkt:
            try:
                # Parse WKT point format: "POINT(longitude latitude)"
                coords_match = re.search(r'POINT\(([+-]?\d+\.?\d*)\s+([+-]?\d+\.?\d*)\)', location_wkt)
                if coords_match:
                    longitude = float(coords_match.group(1))
                    latitude = float(coords_match.group(2))
            except Exception as e:
                print(f"Error parsing location: {e}")
        
        # Get location names
        location_info = await get_location_names(history.subdistrict_id)
        
        # Get user names
        user_info = await get_user_names_async(db, history.discovered_by, history.modified_by)
        
        # Format exhibit data with narcotic information
        exhibit_dict = None
        if history.exhibit:
            exhibit_dict = {
                'id': history.exhibit.id,
                'category': history.exhibit.category,
                'subcategory': history.exhibit.subcategory,
            }
            
            # Add narcotic information if available
            # Check if narcotic is a list or single object
            narcotic_data = history.exhibit.narcotic
            if narcotic_data:
                # If it's a list, take the first item
                if isinstance(narcotic_data, list) and len(narcotic_data) > 0:
                    narcotic = narcotic_data[0]
                else:
                    narcotic = narcotic_data
                
                # Only add if narcotic is not None and has id attribute
                if narcotic and hasattr(narcotic, 'id'):
                    exhibit_dict['narcotic'] = {
                        'id': narcotic.id,
                        'form_id': narcotic.form_id,
                        'characteristics': narcotic.characteristics,
                        'drug_type': narcotic.drug_type,
                        'drug_category': narcotic.drug_category,
                        'consumption_method': narcotic.consumption_method,
                        'effect': narcotic.effect,
                        'weight_grams': float(narcotic.weight_grams) if narcotic.weight_grams else None,
                    }
        
        # Create enhanced history record
        history_dict = {
            'id': history.id,
            'exhibit_id': history.exhibit_id,
            'subdistrict_id': history.subdistrict_id,
            'discovery_date': history.discovery_date,
            'discovery_time': history.discovery_time,
            'discovered_by': history.discovered_by,
            'photo_url': history.photo_url,
            'quantity': float(history.quantity) if history.quantity else None,
            'latitude': latitude,
            'longitude': longitude,
            'ai_confidence': float(history.ai_confidence) if history.ai_confidence else None,
            'created_at': history.created_at,
            'modified_at': history.modified_at,
            'modified_by': history.modified_by,
            'exhibit': exhibit_dict,
            'subdistrict_name': location_info['subdistrict_name'],
            'district_name': location_info['district_name'],
            'province_name': location_info['province_name'],
            'discoverer_name': user_info['discoverer_name'],
            'modifier_name': user_info['modifier_name']
        }
        
        enhanced_histories.append(history_dict)
    
    return enhanced_histories

async def get_narcotic_history_by_id(db: AsyncSession, history_id: int) -> Optional[Dict[str, Any]]:
    """Get a specific narcotic history record by ID"""
    # Use func.ST_AsText to convert geometry to text for processing
    stmt = select(models.History, func.ST_AsText(models.History.location).label('location_wkt')).options(
        joinedload(models.History.exhibit).joinedload(Exhibit.narcotic)
    ).where(
        models.History.id == history_id,
        models.History.exhibit.has(Exhibit.category == "ยาเสพติด")
    )
    
    result = await db.execute(stmt)
    history_row = result.unique().first()
    
    if not history_row:
        return None
    
    history, location_wkt = history_row
    
    # Process location data
    latitude, longitude = None, None
    if location_wkt:
        try:
            coords_match = re.search(r'POINT\(([+-]?\d+\.?\d*)\s+([+-]?\d+\.?\d*)\)', location_wkt)
            if coords_match:
                longitude = float(coords_match.group(1))
                latitude = float(coords_match.group(2))
        except Exception as e:
            print(f"Error parsing location: {e}")
    
    # Get location names
    location_info = await get_location_names(history.subdistrict_id)
    
    # Get user names
    user_info = await get_user_names_async(db, history.discovered_by, history.modified_by)
    
    # Format exhibit data with narcotic information
    exhibit_dict = None
    if history.exhibit:
        exhibit_dict = {
            'id': history.exhibit.id,
            'category': history.exhibit.category,
            'subcategory': history.exhibit.subcategory,
        }
        
        # Add narcotic information if available
        # Check if narcotic is a list or single object
        narcotic_data = history.exhibit.narcotic
        if narcotic_data:
            # If it's a list, take the first item
            if isinstance(narcotic_data, list) and len(narcotic_data) > 0:
                narcotic = narcotic_data[0]
            else:
                narcotic = narcotic_data
            
            # Only add if narcotic is not None and has id attribute
            if narcotic and hasattr(narcotic, 'id'):
                exhibit_dict['narcotic'] = {
                    'id': narcotic.id,
                    'form_id': narcotic.form_id,
                    'characteristics': narcotic.characteristics,
                    'drug_type': narcotic.drug_type,
                    'drug_category': narcotic.drug_category,
                    'consumption_method': narcotic.consumption_method,
                    'effect': narcotic.effect,
                    'weight_grams': float(narcotic.weight_grams) if narcotic.weight_grams else None,
                }
    
    # Create enhanced history record
    history_dict = {
        'id': history.id,
        'exhibit_id': history.exhibit_id,
        'subdistrict_id': history.subdistrict_id,
        'discovery_date': history.discovery_date,
        'discovery_time': history.discovery_time,
        'discovered_by': history.discovered_by,
        'photo_url': history.photo_url,
        'quantity': float(history.quantity) if history.quantity else None,
        'latitude': latitude,
        'longitude': longitude,
        'ai_confidence': float(history.ai_confidence) if history.ai_confidence else None,
        'created_at': history.created_at,
        'modified_at': history.modified_at,
        'modified_by': history.modified_by,
        'exhibit': exhibit_dict,
        'subdistrict_name': location_info['subdistrict_name'],
        'district_name': location_info['district_name'],
        'province_name': location_info['province_name'],
        'discoverer_name': user_info['discoverer_name'],
        'modifier_name': user_info['modifier_name']
    }
    
    return history_dict