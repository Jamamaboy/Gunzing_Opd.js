import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Dict, Any
from services.province_service import search_provinces_by_name
from services.district_service import search_districts_by_name
from services.subdistrict_service import search_subdistricts_by_name
from models.geography import Province, District, Subdistrict

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def search_geography_hierarchy(
    db: AsyncSession,
    province_name: str,
    district_name: str,
    subdistrict_name: str
) -> Dict[str, Any]:
    """
    ค้นหา geography hierarchy จากชื่อทั้ง 3 ระดับ (ORM)
    """
    try:
        logger.info(f"Searching hierarchy: {province_name} > {district_name} > {subdistrict_name}")
        
        # ค้นหาจังหวัดก่อน
        provinces = await search_provinces_by_name(db, province_name)
        if not provinces:
            return {
                "found": False,
                "error": f"ไม่พบจังหวัด '{province_name}'"
            }
        
        # หาจังหวัดที่ตรงที่สุด
        exact_province = None
        for province in provinces:
            if province["province_name"].lower() == province_name.lower():
                exact_province = province
                break
        
        if not exact_province:
            exact_province = provinces[0]  # ใช้ตัวแรกถ้าไม่พบ exact match
        
        logger.info(f"Selected province: {exact_province['province_name']} (ID: {exact_province['id']})")
        
        # ค้นหาอำเภอในจังหวัดนั้น
        districts = await search_districts_by_name(db, district_name, exact_province["id"])
        if not districts:
            return {
                "found": False,
                "error": f"ไม่พบอำเภอ '{district_name}' ในจังหวัด '{exact_province['province_name']}'"
            }
        
        # หาอำเภอที่ตรงที่สุด
        exact_district = None
        for district in districts:
            if district["district_name"].lower() == district_name.lower():
                exact_district = district
                break
        
        if not exact_district:
            exact_district = districts[0]
        
        logger.info(f"Selected district: {exact_district['district_name']} (ID: {exact_district['id']})")
        
        # ค้นหาตำบลในอำเภอนั้น
        subdistricts = await search_subdistricts_by_name(db, subdistrict_name, exact_district["id"])
        if not subdistricts:
            return {
                "found": False,
                "error": f"ไม่พบตำบล '{subdistrict_name}' ในอำเภอ '{exact_district['district_name']}'"
            }
        
        # หาตำบลที่ตรงที่สุด
        exact_subdistrict = None
        for subdistrict in subdistricts:
            if subdistrict["subdistrict_name"].lower() == subdistrict_name.lower():
                exact_subdistrict = subdistrict
                break
        
        if not exact_subdistrict:
            exact_subdistrict = subdistricts[0]
        
        logger.info(f"Selected subdistrict: {exact_subdistrict['subdistrict_name']} (ID: {exact_subdistrict['id']})")
        
        result = {
            "found": True,
            "province": exact_province,
            "district": exact_district,
            "subdistrict": exact_subdistrict,
            "subdistrict_id": exact_subdistrict["id"],
            "district_id": exact_district["id"],
            "province_id": exact_province["id"]
        }
        
        logger.info(f"Successfully found hierarchy: P:{result['province_id']}, D:{result['district_id']}, S:{result['subdistrict_id']}")
        return result
        
    except Exception as e:
        logger.error(f"Error in search_geography_hierarchy: {str(e)}", exc_info=True)
        return {
            "found": False,
            "error": f"เกิดข้อผิดพลาด: {str(e)}"
        }

async def get_geography_statistics(db: AsyncSession) -> Dict[str, Any]:
    """
    ดึงสถิติข้อมูล geography ทั้งหมด (ORM)
    """
    try:
        # นับจำนวนจังหวัด
        province_count_query = select(func.count(Province.id))
        province_result = await db.execute(province_count_query)
        province_count = province_result.scalar()
        
        # นับจำนวนอำเภอ
        district_count_query = select(func.count(District.id))
        district_result = await db.execute(district_count_query)
        district_count = district_result.scalar()
        
        # นับจำนวนตำบล
        subdistrict_count_query = select(func.count(Subdistrict.id))
        subdistrict_result = await db.execute(subdistrict_count_query)
        subdistrict_count = subdistrict_result.scalar()
        
        return {
            "provinces": province_count,
            "districts": district_count,
            "subdistricts": subdistrict_count,
            "total": province_count + district_count + subdistrict_count
        }
        
    except Exception as e:
        logger.error(f"Error fetching geography statistics: {str(e)}", exc_info=True)
        return {}