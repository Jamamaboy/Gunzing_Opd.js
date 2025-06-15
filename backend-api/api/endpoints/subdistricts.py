from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from config.database import get_db
from schemas.geography import Subdistrict
from services.subdistrict_service import (
    get_subdistricts, 
    get_subdistrict_by_id, 
    search_subdistricts_by_name
)

router = APIRouter(tags=["geography"])

@router.get("/subdistricts", response_model=List[Subdistrict])
async def read_subdistricts(
    district_id: Optional[int] = Query(None, description="Filter subdistricts by district ID"),
    province_id: Optional[int] = Query(None, description="Filter subdistricts by province ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    ดึงข้อมูลตำบลทั้งหมดหรือกรองตามอำเภอและ/หรือจังหวัด (ORM)
    """
    try:
        subdistricts = await get_subdistricts(db, district_id, province_id)
        
        if (district_id or province_id) and not subdistricts:
            filter_desc = []
            if district_id:
                filter_desc.append(f"district ID: {district_id}")
            if province_id:
                filter_desc.append(f"province ID: {province_id}")
            
            raise HTTPException(
                status_code=404, 
                detail=f"No subdistricts found for {' and '.join(filter_desc)}"
            )
            
        return subdistricts
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching subdistricts: {str(e)}")

@router.get("/subdistricts/search", response_model=List[Subdistrict])
async def search_subdistricts(
    q: str = Query(..., description="Search term for subdistrict name", min_length=1),
    district_id: Optional[int] = Query(None, description="Filter by district ID"),
    province_id: Optional[int] = Query(None, description="Filter by province ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    ค้นหาตำบลจากชื่อ (ORM)
    """
    try:
        subdistricts = await search_subdistricts_by_name(
            db, q.strip(), district_id, province_id
        )
        return subdistricts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching subdistricts: {str(e)}")

@router.get("/subdistricts/{subdistrict_id}", response_model=Subdistrict)
async def read_subdistrict(subdistrict_id: int, db: AsyncSession = Depends(get_db)):
    """
    ดึงข้อมูลตำบลตาม ID (ORM)
    """
    try:
        subdistrict = await get_subdistrict_by_id(db, subdistrict_id)
        if subdistrict is None:
            raise HTTPException(status_code=404, detail="Subdistrict not found")
        return subdistrict
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching subdistrict: {str(e)}")