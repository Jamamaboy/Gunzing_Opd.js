from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from config.database import get_db
from schemas.geography import District
from services.district_service import (
    get_districts, 
    get_district_by_id, 
    search_districts_by_name
)

router = APIRouter(tags=["geography"])

@router.get("/districts", response_model=List[District])
async def read_districts(
    province_id: Optional[int] = Query(None, description="Filter districts by province ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    ดึงข้อมูลอำเภอทั้งหมดหรือกรองตามจังหวัด (ORM)
    """
    try:
        districts = await get_districts(db, province_id)
        if province_id and not districts:
            raise HTTPException(status_code=404, detail=f"No districts found for province ID: {province_id}")
        return districts
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching districts: {str(e)}")

@router.get("/districts/search", response_model=List[District])
async def search_districts(
    q: str = Query(..., description="Search term for district name", min_length=1),
    province_id: Optional[int] = Query(None, description="Filter by province ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    ค้นหาอำเภอจากชื่อ (ORM)
    """
    try:
        districts = await search_districts_by_name(db, q.strip(), province_id)
        return districts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching districts: {str(e)}")

@router.get("/districts/{district_id}", response_model=District)
async def read_district(district_id: int, db: AsyncSession = Depends(get_db)):
    """
    ดึงข้อมูลอำเภอตาม ID (ORM)
    """
    try:
        district = await get_district_by_id(db, district_id)
        if district is None:
            raise HTTPException(status_code=404, detail="District not found")
        return district
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching district: {str(e)}")