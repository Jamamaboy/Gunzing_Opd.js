import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any, Optional
from models.geography import Subdistrict, District, Province

# ✅ ปิด SQLAlchemy logs เฉพาะ subdistrict service (นี้คือต้นตอหลัก)
logging.getLogger('sqlalchemy.engine').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.dialects').setLevel(logging.ERROR)

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_subdistricts(
    db: AsyncSession, 
    district_id: Optional[int] = None,
    province_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    ดึงข้อมูลตำบลตามอำเภอและ/หรือจังหวัด (ORM)
    """
    try:
        query = select(Subdistrict).options(
            selectinload(Subdistrict.district).selectinload(District.province)
        )
        
        if district_id is not None:
            query = query.where(Subdistrict.district_id == district_id)
        elif province_id is not None:
            query = query.join(District).where(District.province_id == province_id)
        
        query = query.order_by(
            Subdistrict.district_id, 
            Subdistrict.subdistrict_name
        )
        
        result = await db.execute(query)
        subdistricts = result.scalars().all()
        
        subdistricts_data = []
        for subdistrict in subdistricts:
            subdistrict_dict = subdistrict.to_dict()
            
            # ดึง geometry แยก
            if subdistrict.geom:
                geom_query = select(func.ST_AsGeoJSON(Subdistrict.geom)).where(Subdistrict.id == subdistrict.id)
                geom_result = await db.execute(geom_query)
                geom_json = geom_result.scalar()
                if geom_json:
                    try:
                        subdistrict_dict["geometry"] = json.loads(geom_json)
                    except json.JSONDecodeError:
                        subdistrict_dict["geometry"] = None
            
            subdistricts_data.append(subdistrict_dict)
        
        logger.info(f"Fetched {len(subdistricts_data)} subdistricts")
        return subdistricts_data
        
    except Exception as e:
        logger.error(f"Error fetching subdistricts: {str(e)}", exc_info=True)
        return []

async def get_subdistrict_by_id(db: AsyncSession, subdistrict_id: int) -> Dict[str, Any]:
    """
    ดึงข้อมูลตำบลตาม ID (ORM)
    """
    try:
        query = select(Subdistrict).options(
            selectinload(Subdistrict.district).selectinload(District.province)
        ).where(Subdistrict.id == subdistrict_id)
        
        result = await db.execute(query)
        subdistrict = result.scalar_one_or_none()
        
        if not subdistrict:
            return None
        
        subdistrict_dict = subdistrict.to_dict()
        
        # ดึง geometry แยก
        if subdistrict.geom:
            geom_query = select(func.ST_AsGeoJSON(Subdistrict.geom)).where(Subdistrict.id == subdistrict.id)
            geom_result = await db.execute(geom_query)
            geom_json = geom_result.scalar()
            if geom_json:
                try:
                    subdistrict_dict["geometry"] = json.loads(geom_json)
                except json.JSONDecodeError:
                    subdistrict_dict["geometry"] = None
        
        return subdistrict_dict
        
    except Exception as e:
        logger.error(f"Error fetching subdistrict by ID: {str(e)}", exc_info=True)
        return None

async def search_subdistricts_by_name(
    db: AsyncSession, 
    search_term: str,
    district_id: Optional[int] = None,
    province_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    ค้นหาตำบลจากชื่อ (ORM)
    """
    try:
        # สร้าง query ด้วย ORM พร้อม join district และ province
        query = select(Subdistrict).options(
            selectinload(Subdistrict.district).selectinload(District.province)
        ).where(
            func.lower(Subdistrict.subdistrict_name).like(func.lower(f"%{search_term}%"))
        )
        
        # เพิ่มเงื่อนไข district_id ถ้ามี
        if district_id:
            query = query.where(Subdistrict.district_id == district_id)
        
        # เพิ่มเงื่อนไข province_id ถ้ามี
        if province_id:
            query = query.join(District).where(District.province_id == province_id)
        
        # เรียงลำดับ
        query = query.order_by(
            case(
                (func.lower(Subdistrict.subdistrict_name) == func.lower(search_term), 1),
                (func.lower(Subdistrict.subdistrict_name).like(func.lower(f"{search_term}%")), 2),
                else_=3
            ),
            Subdistrict.district_id,
            Subdistrict.subdistrict_name
        )
        
        result = await db.execute(query)
        subdistricts = result.scalars().all()
        
        # แปลงเป็น dict และเพิ่ม geometry
        subdistricts_data = []
        for subdistrict in subdistricts:
            subdistrict_dict = subdistrict.to_dict()
            
            # ดึง geometry แยก
            if subdistrict.geom:
                geom_query = select(func.ST_AsGeoJSON(Subdistrict.geom)).where(Subdistrict.id == subdistrict.id)
                geom_result = await db.execute(geom_query)
                geom_json = geom_result.scalar()
                if geom_json:
                    try:
                        subdistrict_dict["geometry"] = json.loads(geom_json)
                    except json.JSONDecodeError:
                        subdistrict_dict["geometry"] = None
            
            subdistricts_data.append(subdistrict_dict)
        
        logger.info(f"Found {len(subdistricts_data)} subdistricts for search term: {search_term}")
        return subdistricts_data
        
    except Exception as e:
        logger.error(f"Error searching subdistricts: {str(e)}", exc_info=True)
        return []