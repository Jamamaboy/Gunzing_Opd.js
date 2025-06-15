from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, text, desc, and_, or_
from sqlalchemy.orm import selectinload, joinedload
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
from decimal import Decimal
import logging

from models.exhibit import Exhibit
from models.firearm import Firearm, Ammunition, firearm_ammunitions
from models.narcotic import Narcotic, DrugForm, ChemicalCompound, NarcoticChemicalCompound
from models.history import History
from models.geography import Province, District, Subdistrict
from models.user import User

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_evidence_summary(db: AsyncSession) -> Dict[str, Any]:
    """
    ดึงข้อมูลสรุปหลักของหลักฐาน - นับจาก History (การค้นพบจริง)
    """
    try:
        # คำนวณช่วงเวลา
        today = date.today()
        last_month_start = (today.replace(day=1) - timedelta(days=1)).replace(day=1)
        this_month_start = today.replace(day=1)
        
        # ดึงข้อมูลจำนวน History ทั้งหมด (การค้นพบหลักฐานจริง)
        total_query = select(func.count(History.id)).select_from(History)
        total_result = await db.execute(total_query)
        total_evidence = total_result.scalar() or 0
        
        # ดึงข้อมูลแยกตามประเภท - นับจาก History ที่ join กับ Exhibit
        firearm_query = select(func.count(History.id)).select_from(History).join(Exhibit).where(Exhibit.category == 'อาวุธปืน')
        firearm_result = await db.execute(firearm_query)
        total_firearms = firearm_result.scalar() or 0
        
        narcotic_query = select(func.count(History.id)).select_from(History).join(Exhibit).where(Exhibit.category == 'ยาเสพติด')
        narcotic_result = await db.execute(narcotic_query)
        total_narcotics = narcotic_result.scalar() or 0
        
        # ข้อมูลเดือนนี้ - นับจาก History
        this_month_query = select(func.count(History.id)).select_from(History).where(
            func.date(History.discovery_date) >= this_month_start
        )
        this_month_result = await db.execute(this_month_query)
        this_month_evidence = this_month_result.scalar() or 0
        
        # ข้อมูลเดือนที่แล้ว - นับจาก History
        last_month_query = select(func.count(History.id)).select_from(History).where(
            and_(
                func.date(History.discovery_date) >= last_month_start,
                func.date(History.discovery_date) < this_month_start
            )
        )
        last_month_result = await db.execute(last_month_query)
        last_month_evidence = last_month_result.scalar() or 0
        
        # คำนวณเปอร์เซ็นต์การเปลี่ยนแปลง
        def calculate_change(current, previous):
            if previous == 0:
                return 100.0 if current > 0 else 0.0
            return ((current - previous) / previous) * 100
        
        # ข้อมูลที่ไม่ทราบชนิด (Unknown) - นับจาก History ที่เชื่อมกับ Exhibit ที่ไม่มี category
        unknown_query = select(func.count(History.id)).select_from(History).join(Exhibit).where(
            or_(Exhibit.category.is_(None), Exhibit.category == '')
        )
        unknown_result = await db.execute(unknown_query)
        unknown_items = unknown_result.scalar() or 0
        
        # ความมั่นใจเฉลี่ยจาก AI - จาก History (แปลงเป็นเปอร์เซ็นต์)
        confidence_query = select(func.avg(History.ai_confidence)).select_from(History).where(
            History.ai_confidence.is_not(None)
        )
        confidence_result = await db.execute(confidence_query)
        avg_confidence = confidence_result.scalar() or 0
        
        return {
            "total_evidence": {
                "value": total_evidence,
                "change_percentage": calculate_change(this_month_evidence, last_month_evidence)
            },
            "firearms": {
                "value": total_firearms,
                "percentage": (total_firearms / total_evidence * 100) if total_evidence > 0 else 0
            },
            "narcotics": {
                "value": total_narcotics,
                "percentage": (total_narcotics / total_evidence * 100) if total_evidence > 0 else 0
            },
            "others": {
                "value": total_evidence - total_firearms - total_narcotics,
                "percentage": ((total_evidence - total_firearms - total_narcotics) / total_evidence * 100) if total_evidence > 0 else 0
            },
            "this_month": {
                "value": this_month_evidence,
                "change_percentage": calculate_change(this_month_evidence, last_month_evidence)
            },
            "unknown_items": {
                "value": unknown_items,
                "percentage": (unknown_items / total_evidence * 100) if total_evidence > 0 else 0
            },
            "ai_confidence_avg": (float(avg_confidence) * 100) if avg_confidence else 0.0  # แปลงเป็นเปอร์เซ็นต์
        }
        
    except Exception as e:
        logger.error(f"Error getting evidence summary: {str(e)}", exc_info=True)
        return {}

async def get_time_series_data(
    db: AsyncSession, 
    period: str = "monthly",
    category: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    ดึงข้อมูล Time Series ตามช่วงเวลา - นับจาก History
    """
    try:
        # สร้าง query ฐาน - นับจาก History
        base_query = select(
            func.date_trunc(period, History.discovery_date).label('period'),
            func.count(History.id).label('count')
        ).select_from(History)
        
        # เพิ่มเงื่อนไขตาม category ถ้ามี - join กับ Exhibit
        if category:
            base_query = base_query.join(Exhibit).where(Exhibit.category == category)
        
        # จัดกลุ่มและเรียงลำดับ
        base_query = base_query.group_by('period').order_by('period')
        
        result = await db.execute(base_query)
        data = result.fetchall()
        
        return [
            {
                "period": row.period.strftime("%Y-%m") if period == "monthly" else row.period.strftime("%Y-%m-%d"),
                "count": row.count
            }
            for row in data
        ]
        
    except Exception as e:
        logger.error(f"Error getting time series data: {str(e)}", exc_info=True)
        return []

async def get_geographic_distribution(db: AsyncSession) -> Dict[str, Any]:
    """
    ดึงข้อมูลการกระจายตามพื้นที่ - นับจาก History
    """
    try:
        # การกระจายตามจังหวัด - นับจาก History
        province_query = select(
            Province.province_name,
            func.count(History.id).label('count')
        ).select_from(History)\
         .join(Subdistrict, History.subdistrict_id == Subdistrict.id)\
         .join(District, Subdistrict.district_id == District.id)\
         .join(Province, District.province_id == Province.id)\
         .group_by(Province.province_name)\
         .order_by(desc('count'))
        
        province_result = await db.execute(province_query)
        provinces_data = [
            {"province": row.province_name, "count": row.count}
            for row in province_result.fetchall()
        ]
        
        # การกระจายตามประเภท - นับจาก History
        category_geo_query = select(
            Province.province_name,
            Exhibit.category,
            func.count(History.id).label('count')
        ).select_from(History)\
         .join(Exhibit, History.exhibit_id == Exhibit.id)\
         .join(Subdistrict, History.subdistrict_id == Subdistrict.id)\
         .join(District, Subdistrict.district_id == District.id)\
         .join(Province, District.province_id == Province.id)\
         .group_by(Province.province_name, Exhibit.category)\
         .order_by(Province.province_name, desc('count'))
        
        category_geo_result = await db.execute(category_geo_query)
        category_data = {}
        for row in category_geo_result.fetchall():
            if row.province_name not in category_data:
                category_data[row.province_name] = {}
            category_data[row.province_name][row.category] = row.count
        
        return {
            "by_province": provinces_data,
            "by_category_province": category_data
        }
        
    except Exception as e:
        logger.error(f"Error getting geographic distribution: {str(e)}", exc_info=True)
        return {}