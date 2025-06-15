import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, case
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any, Optional
from models.geography import Province

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_provinces(db: AsyncSession) -> List[Dict[str, Any]]:
    """
    ดึงข้อมูลจังหวัดทั้งหมด (ORM)
    """
    try:
        query = select(Province).order_by(Province.province_name)
        result = await db.execute(query)
        provinces = result.scalars().all()
        
        provinces_data = []
        for province in provinces:
            province_dict = province.to_dict()
            
            # ดึง geometry แยก
            if province.geom:
                geom_query = select(func.ST_AsGeoJSON(Province.geom)).where(Province.id == province.id)
                geom_result = await db.execute(geom_query)
                geom_json = geom_result.scalar()
                if geom_json:
                    try:
                        province_dict["geometry"] = json.loads(geom_json)
                    except json.JSONDecodeError:
                        province_dict["geometry"] = None
            
            provinces_data.append(province_dict)
        
        logger.info(f"Fetched {len(provinces_data)} provinces")
        return provinces_data
        
    except Exception as e:
        logger.error(f"Error fetching provinces: {str(e)}", exc_info=True)
        return []

async def get_province_by_id(db: AsyncSession, province_id: int) -> Dict[str, Any]:
    """
    ดึงข้อมูลจังหวัดตาม ID (ORM)
    """
    try:
        query = select(Province).where(Province.id == province_id)
        result = await db.execute(query)
        province = result.scalar_one_or_none()
        
        if not province:
            return None
            
        province_dict = province.to_dict()
        
        # ดึง geometry แยก
        if province.geom:
            geom_query = select(func.ST_AsGeoJSON(Province.geom)).where(Province.id == province.id)
            geom_result = await db.execute(geom_query)
            geom_json = geom_result.scalar()
            if geom_json:
                try:
                    province_dict["geometry"] = json.loads(geom_json)
                except json.JSONDecodeError:
                    province_dict["geometry"] = None
        
        return province_dict
        
    except Exception as e:
        logger.error(f"Error fetching province by ID: {str(e)}", exc_info=True)
        return None

async def search_provinces_by_name(
    db: AsyncSession, 
    search_term: str
) -> List[Dict[str, Any]]:
    """
    ค้นหาจังหวัดจากชื่อ (ORM)
    """
    try:
        # สร้าง query ด้วย ORM
        query = select(Province).where(
            or_(
                func.lower(Province.province_name).like(func.lower(f"%{search_term}%")),
                func.lower(Province.reg_nesdb).like(func.lower(f"%{search_term}%")),
                func.lower(Province.reg_royin).like(func.lower(f"%{search_term}%"))
            )
        ).order_by(
            # Custom ordering สำหรับ exact match > starts with > contains
            case(
                (func.lower(Province.province_name) == func.lower(search_term), 1),
                (func.lower(Province.province_name).like(func.lower(f"{search_term}%")), 2),
                else_=3
            ),
            Province.province_name
        )
        
        result = await db.execute(query)
        provinces = result.scalars().all()
        
        # แปลงเป็น dict และเพิ่ม geometry
        provinces_data = []
        for province in provinces:
            province_dict = province.to_dict()
            
            # ดึง geometry แยก
            if province.geom:
                geom_query = select(func.ST_AsGeoJSON(Province.geom)).where(Province.id == province.id)
                geom_result = await db.execute(geom_query)
                geom_json = geom_result.scalar()
                if geom_json:
                    try:
                        province_dict["geometry"] = json.loads(geom_json)
                    except json.JSONDecodeError:
                        province_dict["geometry"] = None
            
            provinces_data.append(province_dict)
        
        logger.info(f"Found {len(provinces_data)} provinces for search term: {search_term}")
        return provinces_data
        
    except Exception as e:
        logger.error(f"Error searching provinces: {str(e)}", exc_info=True)
        return []

async def get_province_statistics(db: AsyncSession) -> Dict[str, Any]:
    """
    ดึงสถิติจังหวัด (ORM)
    """
    try:
        # นับจำนวนจังหวัด
        count_query = select(func.count(Province.id))
        count_result = await db.execute(count_query)
        total_provinces = count_result.scalar()
        
        # สถิติพื้นที่
        stats_query = select(
            func.avg(Province.area_sqkm).label('avg_area'),
            func.max(Province.area_sqkm).label('max_area'),
            func.min(Province.area_sqkm).label('min_area')
        ).where(Province.area_sqkm.isnot(None))
        
        stats_result = await db.execute(stats_query)
        stats = stats_result.first()
        
        return {
            "total_provinces": total_provinces,
            "average_area_sqkm": float(stats.avg_area) if stats.avg_area else None,
            "largest_area_sqkm": float(stats.max_area) if stats.max_area else None,
            "smallest_area_sqkm": float(stats.min_area) if stats.min_area else None
        }
        
    except Exception as e:
        logger.error(f"Error getting province statistics: {str(e)}", exc_info=True)
        return {}