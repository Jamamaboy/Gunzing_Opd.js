from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, text, desc, and_, or_
from sqlalchemy.orm import selectinload, joinedload
from typing import List, Dict, Any, Optional
import logging

from models.exhibit import Exhibit
from models.firearm import Firearm, Ammunition, firearm_ammunitions
from models.history import History
from models.geography import Province, District, Subdistrict

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_firearm_brand_statistics(db: AsyncSession) -> Dict[str, Any]:
    """
    ดึงสถิติแบรนด์อาวุธปืน - นับจาก History ที่เชื่อมกับ Firearm
    """
    try:
        # Brand distribution - นับจาก History
        brand_query = select(
            Firearm.brand,
            func.count(History.id).label('count')
        ).select_from(History)\
         .join(Exhibit, History.exhibit_id == Exhibit.id)\
         .join(Firearm, Exhibit.id == Firearm.exhibit_id)\
         .where(Exhibit.category == 'อาวุธปืน')\
         .group_by(Firearm.brand)\
         .order_by(desc('count'))
        
        brand_result = await db.execute(brand_query)
        brands_data = []
        
        for row in brand_result.fetchall():
            if row.brand:  # Skip null brands
                brands_data.append({
                    "brand": row.brand,
                    "count": row.count
                })
        
        # Model distribution by brand - นับจาก History
        model_query = select(
            Firearm.brand,
            Firearm.model,
            func.count(History.id).label('count')
        ).select_from(History)\
         .join(Exhibit, History.exhibit_id == Exhibit.id)\
         .join(Firearm, Exhibit.id == Firearm.exhibit_id)\
         .where(
             and_(
                 Exhibit.category == 'อาวุธปืน',
                 Firearm.brand.is_not(None),
                 Firearm.model.is_not(None)
             )
         )\
         .group_by(Firearm.brand, Firearm.model)\
         .order_by(Firearm.brand, desc('count'))
        
        model_result = await db.execute(model_query)
        models_by_brand = {}
        
        for row in model_result.fetchall():
            if row.brand not in models_by_brand:
                models_by_brand[row.brand] = []
            models_by_brand[row.brand].append({
                "model": row.model,
                "count": row.count
            })
        
        return {
            "brands": brands_data,
            "models_by_brand": models_by_brand
        }
        
    except Exception as e:
        logger.error(f"Error getting firearm brand statistics: {str(e)}", exc_info=True)
        return {}

async def get_firearm_mechanism_statistics(db: AsyncSession) -> List[Dict[str, Any]]:
    """
    ดึงสถิติกลไกการทำงานของอาวุธปืน - นับจาก History
    """
    try:
        mechanism_query = select(
            Firearm.mechanism,
            func.count(History.id).label('count')
        ).select_from(History)\
         .join(Exhibit, History.exhibit_id == Exhibit.id)\
         .join(Firearm, Exhibit.id == Firearm.exhibit_id)\
         .where(
             and_(
                 Exhibit.category == 'อาวุธปืน',
                 Firearm.mechanism.is_not(None)
             )
         )\
         .group_by(Firearm.mechanism)\
         .order_by(desc('count'))
        
        result = await db.execute(mechanism_query)
        return [
            {
                "mechanism": row.mechanism,
                "count": row.count
            }
            for row in result.fetchall()
        ]
        
    except Exception as e:
        logger.error(f"Error getting firearm mechanism statistics: {str(e)}", exc_info=True)
        return []

async def get_ammunition_statistics(db: AsyncSession) -> Dict[str, Any]:
    """
    ดึงสถิติกระสุนและความเข้ากันได้
    """  
    try:
        # Top ammunition types
        ammo_query = select(
            Ammunition.caliber,
            func.count(Ammunition.id).label('count')
        ).group_by(Ammunition.caliber).order_by(desc('count'))
        
        ammo_result = await db.execute(ammo_query)
        ammunition_data = [
            {"caliber": row.caliber, "count": row.count}
            for row in ammo_result.fetchall()
        ]
        
        # Firearm-ammunition compatibility
        compatibility_query = select(
            Firearm.brand,
            Firearm.model,
            Ammunition.caliber,
            func.count().label('count')
        ).select_from(Firearm)\
         .join(firearm_ammunitions)\
         .join(Ammunition)\
         .group_by(Firearm.brand, Firearm.model, Ammunition.caliber)\
         .order_by(desc('count'))
        
        compatibility_result = await db.execute(compatibility_query)
        compatibility_data = [
            {
                "firearm": f"{row.brand} {row.model}",
                "caliber": row.caliber,
                "count": row.count
            }
            for row in compatibility_result.fetchall()
        ]
        
        return {
            "ammunition_types": ammunition_data,
            "compatibility": compatibility_data
        }
        
    except Exception as e:
        logger.error(f"Error getting ammunition statistics: {str(e)}", exc_info=True)
        return {}

async def get_firearm_geographic_distribution(db: AsyncSession) -> Dict[str, Any]:
    """
    ดึงข้อมูลการกระจายอาวุธปืนตามพื้นที่
    """
    try:
        geo_query = select(
            Province.province_name,
            Firearm.brand,
            func.count(History.id).label('count')
        ).select_from(History)\
         .join(Exhibit)\
         .join(Firearm)\
         .join(Subdistrict)\
         .join(District)\
         .join(Province)\
         .where(Exhibit.category == 'อาวุธปืน')\
         .group_by(Province.province_name, Firearm.brand)\
         .order_by(Province.province_name, desc('count'))
        
        result = await db.execute(geo_query)
        geographic_data = {}
        
        for row in result.fetchall():
            if row.province_name not in geographic_data:
                geographic_data[row.province_name] = []
            geographic_data[row.province_name].append({
                "brand": row.brand,
                "count": row.count
            })
        
        return {"by_province": geographic_data}
        
    except Exception as e:
        logger.error(f"Error getting firearm geographic distribution: {str(e)}", exc_info=True)
        return {}

async def get_firearm_discovery_analytics(db: AsyncSession) -> Dict[str, Any]:
    """
    ดึงข้อมูลวิเคราะห์การค้นพบอาวุธปืน - นับจาก History
    """
    try:
        # Discovery by time - นับจาก History
        time_query = select(
            func.date_trunc('month', History.discovery_date).label('month'),
            func.count(History.id).label('count')
        ).select_from(History)\
         .join(Exhibit, History.exhibit_id == Exhibit.id)\
         .where(Exhibit.category == 'อาวุธปืน')\
         .group_by('month')\
         .order_by('month')
        
        time_result = await db.execute(time_query)
        time_data = [
            {
                "month": row.month.strftime("%Y-%m"),
                "count": row.count
            }
            for row in time_result.fetchall()
        ]
        
        # AI confidence for firearms - จาก History (แปลงเป็นเปอร์เซ็นต์)
        confidence_query = select(
            func.avg(History.ai_confidence).label('avg_confidence'),
            func.min(History.ai_confidence).label('min_confidence'),
            func.max(History.ai_confidence).label('max_confidence')
        ).select_from(History)\
         .join(Exhibit, History.exhibit_id == Exhibit.id)\
         .where(
             and_(
                 Exhibit.category == 'อาวุธปืน',
                 History.ai_confidence.is_not(None)
             )
         )
        
        confidence_result = await db.execute(confidence_query)
        confidence_row = confidence_result.fetchone()
        
        return {
            "discovery_timeline": time_data,
            "ai_confidence": {
                "average": (float(confidence_row.avg_confidence) * 100) if confidence_row.avg_confidence else 0,  # แปลงเป็นเปอร์เซ็นต์
                "minimum": (float(confidence_row.min_confidence) * 100) if confidence_row.min_confidence else 0,  # แปลงเป็นเปอร์เซ็นต์
                "maximum": (float(confidence_row.max_confidence) * 100) if confidence_row.max_confidence else 0   # แปลงเป็นเปอร์เซ็นต์
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting firearm discovery analytics: {str(e)}", exc_info=True)
        return {}