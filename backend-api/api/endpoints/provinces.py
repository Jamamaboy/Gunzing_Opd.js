from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from config.database import get_db
from schemas.geography import Province
from services.province_service import (
    get_provinces, 
    get_province_by_id, 
    search_provinces_by_name,
    get_province_statistics
)

router = APIRouter(tags=["geography"])

@router.get("/provinces", response_model=List[Province])
async def read_provinces(db: AsyncSession = Depends(get_db)):
    """
    ดึงข้อมูลจังหวัดทั้งหมด (ORM)
    """
    try:
        provinces = await get_provinces(db)
        return provinces
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching provinces: {str(e)}")

@router.get("/provinces/search", response_model=List[Province])
async def search_provinces(
    q: str = Query(..., description="Search term for province name", min_length=1),
    db: AsyncSession = Depends(get_db)
):
    """
    ค้นหาจังหวัดจากชื่อ (ORM)
    """
    try:
        provinces = await search_provinces_by_name(db, q.strip())
        return provinces
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching provinces: {str(e)}")

@router.get("/provinces/statistics")
async def get_statistics(db: AsyncSession = Depends(get_db)):
    """
    ดึงสถิติจังหวัด (ORM)
    """
    try:
        stats = await get_province_statistics(db)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching province statistics: {str(e)}")

@router.get("/provinces/{province_id}", response_model=Province)
async def read_province(province_id: int, db: AsyncSession = Depends(get_db)):
    """
    ดึงข้อมูลจังหวัดตาม ID (ORM)
    """
    try:
        province = await get_province_by_id(db, province_id)
        if province is None:
            raise HTTPException(status_code=404, detail="Province not found")
        return province
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching province: {str(e)}")