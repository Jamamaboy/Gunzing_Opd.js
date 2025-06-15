from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from config.database import get_db
from schemas.statistic import (
    EvidenceSummary,
    FirearmAnalytics,
    NarcoticAnalytics,
    StatisticsOverview,
    StatisticsFilter
)
from services.statistic_service import (
    get_evidence_summary,
    get_time_series_data,
    get_geographic_distribution
)
from services.firearm_statistic_service import (
    get_firearm_brand_statistics,
    get_firearm_mechanism_statistics,
    get_ammunition_statistics,
    get_firearm_geographic_distribution,
    get_firearm_discovery_analytics
)
from services.narcotic_statistic_service import (
    get_drug_type_statistics,
    get_drug_form_statistics,
    get_chemical_compound_statistics,
    get_narcotic_geographic_patterns,
    get_narcotic_discovery_analytics
)

router = APIRouter(tags=["statistics"])

@router.get("/statistics/overview")
async def get_statistics_overview(db: AsyncSession = Depends(get_db)):
    """
    ดึงข้อมูลสถิติภาพรวมทั้งหมด
    """
    try:
        # ดึงข้อมูลสรุปหลักฐาน
        evidence_summary = await get_evidence_summary(db)
        
        # ดึงข้อมูลการกระจายทางภูมิศาสตร์
        geographic_data = await get_geographic_distribution(db)
        
        # ดึงข้อมูล time series
        time_series = await get_time_series_data(db, "monthly")
        
        return {
            "evidence_summary": evidence_summary,
            "geographic_distribution": geographic_data,
            "time_series": time_series,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching overview statistics: {str(e)}")

@router.get("/statistics/summary")
async def get_evidence_summary_endpoint(db: AsyncSession = Depends(get_db)):
    """
    ดึงข้อมูลสรุปหลักฐาน Summary Cards
    """
    try:
        summary = await get_evidence_summary(db)
        return {
            "data": summary,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching evidence summary: {str(e)}")

@router.get("/statistics/time-series")
async def get_time_series_endpoint(
    period: str = Query("monthly", regex="^(daily|weekly|monthly|yearly)$"),
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    ดึงข้อมูล Time Series ตามช่วงเวลา
    """
    try:
        data = await get_time_series_data(db, period, category)
        return {
            "data": data,
            "period": period,
            "category": category,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching time series data: {str(e)}")

@router.get("/statistics/geographic")
async def get_geographic_endpoint(db: AsyncSession = Depends(get_db)):
    """
    ดึงข้อมูลการกระจายทางภูมิศาสตร์
    """
    try:
        data = await get_geographic_distribution(db)
        return {
            "data": data,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching geographic data: {str(e)}")

# ===== FIREARM STATISTICS =====

@router.get("/statistics/firearms")
async def get_firearm_statistics(db: AsyncSession = Depends(get_db)):
    """
    ดึงสถิติอาวุธปืนแบบครบถ้วน
    """
    try:
        brand_stats = await get_firearm_brand_statistics(db)
        mechanism_stats = await get_firearm_mechanism_statistics(db)
        ammunition_stats = await get_ammunition_statistics(db)
        geographic_stats = await get_firearm_geographic_distribution(db)
        discovery_analytics = await get_firearm_discovery_analytics(db)
        
        return {
            "brands": brand_stats,
            "mechanisms": mechanism_stats,
            "ammunition": ammunition_stats,
            "geographic": geographic_stats,
            "discovery_analytics": discovery_analytics,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching firearm statistics: {str(e)}")

@router.get("/statistics/firearms/brands")
async def get_firearm_brand_stats(db: AsyncSession = Depends(get_db)):
    """
    ดึงสถิติแบรนด์อาวุธปืน
    """
    try:
        data = await get_firearm_brand_statistics(db)
        return {
            "data": data,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching firearm brand statistics: {str(e)}")

@router.get("/statistics/firearms/mechanisms")
async def get_firearm_mechanism_stats(db: AsyncSession = Depends(get_db)):
    """
    ดึงสถิติกลไกอาวุธปืน
    """
    try:
        data = await get_firearm_mechanism_statistics(db)
        return {
            "data": data,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching firearm mechanism statistics: {str(e)}")

@router.get("/statistics/firearms/ammunition")
async def get_ammunition_stats(db: AsyncSession = Depends(get_db)):
    """
    ดึงสถิติกระสุน
    """
    try:
        data = await get_ammunition_statistics(db)
        return {
            "data": data,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching ammunition statistics: {str(e)}")

@router.get("/statistics/firearms/geographic")
async def get_firearm_geographic_stats(db: AsyncSession = Depends(get_db)):
    """
    ดึงสถิติการกระจายอาวุธปืนตามพื้นที่
    """
    try:
        data = await get_firearm_geographic_distribution(db)
        return {
            "data": data,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching firearm geographic statistics: {str(e)}")

# ===== NARCOTIC STATISTICS =====

@router.get("/statistics/narcotics")
async def get_narcotic_statistics(db: AsyncSession = Depends(get_db)):
    """
    ดึงสถิติยาเสพติดแบบครบถ้วน
    """
    try:
        drug_types = await get_drug_type_statistics(db)
        drug_forms = await get_drug_form_statistics(db)
        chemical_compounds = await get_chemical_compound_statistics(db)
        geographic_patterns = await get_narcotic_geographic_patterns(db)
        discovery_analytics = await get_narcotic_discovery_analytics(db)
        
        return {
            "drug_types": drug_types,
            "drug_forms": drug_forms,
            "chemical_compounds": chemical_compounds,
            "geographic": geographic_patterns,
            "discovery_analytics": discovery_analytics,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching narcotic statistics: {str(e)}")

@router.get("/statistics/narcotics/drug-types")
async def get_drug_type_stats(db: AsyncSession = Depends(get_db)):
    """
    ดึงสถิติประเภทยาเสพติด
    """
    try:
        data = await get_drug_type_statistics(db)
        return {
            "data": data,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching drug type statistics: {str(e)}")

@router.get("/statistics/narcotics/forms")
async def get_drug_form_stats(db: AsyncSession = Depends(get_db)):
    """
    ดึงสถิติรูปแบบยาเสพติด
    """
    try:
        data = await get_drug_form_statistics(db)
        return {
            "data": data,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching drug form statistics: {str(e)}")

@router.get("/statistics/narcotics/chemicals")
async def get_chemical_compound_stats(db: AsyncSession = Depends(get_db)):
    """
    ดึงสถิติสารเคมี
    """
    try:
        data = await get_chemical_compound_statistics(db)
        return {
            "data": data,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching chemical compound statistics: {str(e)}")

@router.get("/statistics/narcotics/geographic")
async def get_narcotic_geographic_stats(db: AsyncSession = Depends(get_db)):
    """
    ดึงสถิติการกระจายยาเสพติดตามพื้นที่
    """
    try:
        data = await get_narcotic_geographic_patterns(db)
        return {
            "data": data,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching narcotic geographic statistics: {str(e)}")

# ===== ADVANCED ANALYTICS =====

@router.get("/statistics/discovery-analytics")
async def get_discovery_analytics(
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    ดึงข้อมูลวิเคราะห์การค้นพบ
    """
    try:
        if category == "อาวุธปืน":
            data = await get_firearm_discovery_analytics(db)
        elif category == "ยาเสพติด":
            data = await get_narcotic_discovery_analytics(db)
        else:
            # ดึงข้อมูลทั้งหมด
            firearm_data = await get_firearm_discovery_analytics(db)
            narcotic_data = await get_narcotic_discovery_analytics(db)
            data = {
                "firearms": firearm_data,
                "narcotics": narcotic_data
            }
        
        return {
            "data": data,
            "category": category,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching discovery analytics: {str(e)}")

@router.get("/statistics/export")
async def export_statistics(
    format: str = Query("json", regex="^(json|csv|excel)$"),
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Export สถิติในรูปแบบต่างๆ
    """
    try:
        # Implementation for exporting statistics
        # This would typically generate files for download
        return {
            "message": "Export functionality not yet implemented",
            "format": format,
            "category": category,
            "status": "pending"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting statistics: {str(e)}")