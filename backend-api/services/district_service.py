import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any, Optional
from models.geography import District, Province

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_districts(db: AsyncSession, province_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    ดึงข้อมูลอำเภอตามจังหวัดหรือทั้งหมด (ORM)
    """
    try:
        query = select(District).options(
            selectinload(District.province)
        )
        
        if province_id:
            query = query.where(District.province_id == province_id)
        
        query = query.order_by(District.province_id, District.district_name)
        
        result = await db.execute(query)
        districts = result.scalars().all()
        
        districts_data = []
        for district in districts:
            district_dict = district.to_dict()
            
            # ดึง geometry แยก
            if district.geom:
                geom_query = select(func.ST_AsGeoJSON(District.geom)).where(District.id == district.id)
                geom_result = await db.execute(geom_query)
                geom_json = geom_result.scalar()
                if geom_json:
                    try:
                        district_dict["geometry"] = json.loads(geom_json)
                    except json.JSONDecodeError:
                        district_dict["geometry"] = None
            
            districts_data.append(district_dict)
        
        logger.info(f"Fetched {len(districts_data)} districts")
        return districts_data
        
    except Exception as e:
        logger.error(f"Error fetching districts: {str(e)}", exc_info=True)
        return []

async def get_district_by_id(db: AsyncSession, district_id: int) -> Dict[str, Any]:
    """
    ดึงข้อมูลอำเภอตาม ID (ORM)
    """
    try:
        query = select(District).options(
            selectinload(District.province)
        ).where(District.id == district_id)
        
        result = await db.execute(query)
        district = result.scalar_one_or_none()
        
        if not district:
            return None
            
        district_dict = district.to_dict()
        
        # ดึง geometry แยก
        if district.geom:
            geom_query = select(func.ST_AsGeoJSON(District.geom)).where(District.id == district.id)
            geom_result = await db.execute(geom_query)
            geom_json = geom_result.scalar()
            if geom_json:
                try:
                    district_dict["geometry"] = json.loads(geom_json)
                except json.JSONDecodeError:
                    district_dict["geometry"] = None
        
        return district_dict
        
    except Exception as e:
        logger.error(f"Error fetching district by ID: {str(e)}", exc_info=True)
        return None

async def search_districts_by_name(
    db: AsyncSession, 
    search_term: str,
    province_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    ค้นหาอำเภอจากชื่อ (ORM)
    """
    try:
        # สร้าง query ด้วย ORM พร้อม join province
        query = select(District).options(
            selectinload(District.province)
        ).where(
            func.lower(District.district_name).like(func.lower(f"%{search_term}%"))
        )
        
        # เพิ่มเงื่อนไข province_id ถ้ามี
        if province_id:
            query = query.where(District.province_id == province_id)
        
        # เรียงลำดับ
        query = query.order_by(
            case(
                (func.lower(District.district_name) == func.lower(search_term), 1),
                (func.lower(District.district_name).like(func.lower(f"{search_term}%")), 2),
                else_=3
            ),
            District.province_id,
            District.district_name
        )
        
        result = await db.execute(query)
        districts = result.scalars().all()
        
        # แปลงเป็น dict และเพิ่ม geometry
        districts_data = []
        for district in districts:
            district_dict = district.to_dict()
            
            # ดึง geometry แยก
            if district.geom:
                geom_query = select(func.ST_AsGeoJSON(District.geom)).where(District.id == district.id)
                geom_result = await db.execute(geom_query)
                geom_json = geom_result.scalar()
                if geom_json:
                    try:
                        district_dict["geometry"] = json.loads(geom_json)
                    except json.JSONDecodeError:
                        district_dict["geometry"] = None
            
            districts_data.append(district_dict)
        
        logger.info(f"Found {len(districts_data)} districts for search term: {search_term}")
        return districts_data
        
    except Exception as e:
        logger.error(f"Error searching districts: {str(e)}", exc_info=True)
        return []