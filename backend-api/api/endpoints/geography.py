from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from services.geography_service import (
    search_geography_hierarchy,
    get_geography_statistics
)

router = APIRouter(tags=["geography-hierarchy"])

@router.get("/geography/search-hierarchy")
async def search_hierarchy(
    province: str = Query(..., description="Province name", min_length=1),
    district: str = Query(..., description="District name", min_length=1),
    subdistrict: str = Query(..., description="Subdistrict name", min_length=1),
    db: AsyncSession = Depends(get_db)
):
    """
    ค้นหา geography hierarchy จากชื่อทั้ง 3 ระดับ (ORM)
    """
    try:
        result = await search_geography_hierarchy(
            db, 
            province.strip(), 
            district.strip(), 
            subdistrict.strip()
        )
        
        if not result["found"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching geography hierarchy: {str(e)}")

@router.get("/geography/statistics")
async def get_statistics(db: AsyncSession = Depends(get_db)):
    """
    ดึงสถิติข้อมูล geography ทั้งหมด (ORM)
    """
    try:
        stats = await get_geography_statistics(db)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching geography statistics: {str(e)}")