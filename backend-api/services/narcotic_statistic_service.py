from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, text, desc, and_, or_
from sqlalchemy.orm import selectinload, joinedload
from typing import List, Dict, Any, Optional
import logging

from models.exhibit import Exhibit
from models.narcotic import Narcotic, DrugForm, ChemicalCompound, NarcoticChemicalCompound
from models.history import History
from models.geography import Province, District, Subdistrict

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_drug_type_statistics(db: AsyncSession) -> List[Dict[str, Any]]:
    """
    ดึงสถิติประเภทยาเสพติด - นับจาก History
    """
    try:
        drug_type_query = select(
            Narcotic.drug_type,
            func.count(History.id).label('count'),
            func.sum(Narcotic.weight_grams).label('total_weight')
        ).select_from(History)\
         .join(Exhibit, History.exhibit_id == Exhibit.id)\
         .join(Narcotic, Exhibit.id == Narcotic.exhibit_id)\
         .where(
             and_(
                 Exhibit.category == 'ยาเสพติด',
                 Narcotic.drug_type.is_not(None)
             )
         )\
         .group_by(Narcotic.drug_type)\
         .order_by(desc('count'))
        
        result = await db.execute(drug_type_query)
        return [
            {
                "drug_type": row.drug_type,
                "count": row.count,
                "total_weight": float(row.total_weight) if row.total_weight else 0
            }
            for row in result.fetchall()
        ]
        
    except Exception as e:
        logger.error(f"Error getting drug type statistics: {str(e)}", exc_info=True)
        return []

async def get_drug_form_statistics(db: AsyncSession) -> List[Dict[str, Any]]:
    """
    ดึงสถิติรูปแบบยาเสพติด (pill, powder, etc.)
    """
    try:
        form_query = select(
            DrugForm.name,
            func.count(Narcotic.id).label('count')
        ).select_from(Narcotic)\
         .join(DrugForm)\
         .group_by(DrugForm.name)\
         .order_by(desc('count'))
        
        result = await db.execute(form_query)
        return [
            {
                "form": row.name,
                "count": row.count
            }
            for row in result.fetchall()
        ]
        
    except Exception as e:
        logger.error(f"Error getting drug form statistics: {str(e)}", exc_info=True)
        return []

async def get_chemical_compound_statistics(db: AsyncSession) -> List[Dict[str, Any]]:
    """
    ดึงสถิติสารเคมีในยาเสพติด
    """
    try:
        compound_query = select(
            ChemicalCompound.name,
            func.count(NarcoticChemicalCompound.narcotic_id).label('count')
        ).select_from(ChemicalCompound)\
         .join(NarcoticChemicalCompound)\
         .group_by(ChemicalCompound.name)\
         .order_by(desc('count'))
        
        result = await db.execute(compound_query)
        return [
            {
                "compound": row.name,
                "count": row.count
            }
            for row in result.fetchall()
        ]
        
    except Exception as e:
        logger.error(f"Error getting chemical compound statistics: {str(e)}", exc_info=True)
        return []

async def get_narcotic_geographic_patterns(db: AsyncSession) -> Dict[str, Any]:
    """
    ดึงข้อมูลรูปแบบการกระจายยาเสพติดตามพื้นที่
    """
    try:
        geo_query = select(
            Province.province_name,
            Narcotic.drug_type,
            func.count(History.id).label('count'),
            func.sum(Narcotic.weight_grams).label('total_weight')
        ).select_from(History)\
         .join(Exhibit)\
         .join(Narcotic)\
         .join(Subdistrict)\
         .join(District)\
         .join(Province)\
         .where(Exhibit.category == 'ยาเสพติด')\
         .group_by(Province.province_name, Narcotic.drug_type)\
         .order_by(Province.province_name, desc('count'))
        
        result = await db.execute(geo_query)
        geographic_data = {}
        
        for row in result.fetchall():
            if row.province_name not in geographic_data:
                geographic_data[row.province_name] = []
            geographic_data[row.province_name].append({
                "drug_type": row.drug_type,
                "count": row.count,
                "total_weight": float(row.total_weight) if row.total_weight else 0
            })
        
        return {"by_province": geographic_data}
        
    except Exception as e:
        logger.error(f"Error getting narcotic geographic patterns: {str(e)}", exc_info=True)
        return {}

async def get_narcotic_discovery_analytics(db: AsyncSession) -> Dict[str, Any]:
    """
    ดึงข้อมูลวิเคราะห์การค้นพบยาเสพติด - นับจาก History
    """
    try:
        # Discovery timeline - นับจาก History
        time_query = select(
            func.date_trunc('month', History.discovery_date).label('month'),
            func.count(History.id).label('count'),
            func.sum(Narcotic.weight_grams).label('total_weight')
        ).select_from(History)\
         .join(Exhibit, History.exhibit_id == Exhibit.id)\
         .join(Narcotic, Exhibit.id == Narcotic.exhibit_id)\
         .where(Exhibit.category == 'ยาเสพติด')\
         .group_by('month')\
         .order_by('month')
        
        time_result = await db.execute(time_query)
        time_data = [
            {
                "month": row.month.strftime("%Y-%m"),
                "count": row.count,
                "total_weight": float(row.total_weight) if row.total_weight else 0
            }
            for row in time_result.fetchall()
        ]
        
        # AI confidence for narcotics - จาก History (แปลงเป็นเปอร์เซ็นต์)
        confidence_query = select(
            func.avg(History.ai_confidence).label('avg_confidence'),
            func.min(History.ai_confidence).label('min_confidence'),
            func.max(History.ai_confidence).label('max_confidence')
        ).select_from(History)\
         .join(Exhibit, History.exhibit_id == Exhibit.id)\
         .where(
             and_(
                 Exhibit.category == 'ยาเสพติด',
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
        logger.error(f"Error getting narcotic discovery analytics: {str(e)}", exc_info=True)
        return {}