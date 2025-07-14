from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional
from urllib.parse import unquote
from schemas.defendant import (
    DefendantCreate,
    DefendantUpdate, 
    DefendantListResponse
)
from schemas.case import APIResponse
from services.defendant_service import DefendantService

router = APIRouter(tags=["defendant"])

# ✅ เพิ่ม Search Endpoint ที่หายไป
@router.get("/defendants/search",
            response_model=DefendantListResponse,
            summary="ค้นหา Defendant",
            description="ค้นหาจำเลยตามชื่อ")
async def search_defendants(
    name: str = Query(..., description="ชื่อผู้ต้องหา (รองรับภาษาไทย)", min_length=1)
):
    """ค้นหา Defendant ตามชื่อ"""
    try:
        # ✅ เพิ่ม URL decoding และ validation
        decoded_name = unquote(name).strip()
        print(f"🔍 Search defendant - Original: '{name}', Decoded: '{decoded_name}'")
        
        # ✅ ตรวจสอบความยาวหลัง decode
        if len(decoded_name) < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Name must be at least 1 character long"
            )
        
        result = DefendantService.search_defendants(decoded_name)
        
        if not result['success']:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result['message']
            )
        
        return {
            "success": True,
            "data": result['data'],
            "total": result.get('total', len(result['data'])),
            "message": f"Found {len(result['data'])} defendants matching '{decoded_name}'"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in search_defendants: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# ✅ เพิ่ม debug endpoint สำหรับ defendant search
@router.get("/defendants/debug/search",
            summary="Debug Defendant Search",
            description="ตรวจสอบการทำงานของ Defendant search")
async def debug_defendant_search(
    name: str = Query(..., description="ชื่อผู้ต้องหา for debugging")
):
    """Debug endpoint สำหรับตรวจสอบ Defendant search"""
    try:
        decoded_name = unquote(name).strip()
        
        return {
            "success": True,
            "data": {
                "original_name": name,
                "decoded_name": decoded_name,
                "name_length": len(decoded_name),
                "is_different": name != decoded_name,
                "char_analysis": [
                    {
                        "char": char,
                        "unicode": ord(char),
                        "is_ascii": ord(char) < 128,
                        "is_thai": 3584 <= ord(char) <= 3711,  # Thai Unicode range
                        "is_space": char == ' ',
                        "is_allowed": char.isalnum() or char in [' ', '.', '-', '_']
                    }
                    for char in decoded_name
                ]
            },
            "message": "Debug information retrieved successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Debug failed"
        }

@router.post("/defendants",
             response_model=APIResponse,
             status_code=status.HTTP_201_CREATED,
             summary="สร้าง Defendant ใหม่",
             description="เพิ่มจำเลยใหม่ในระบบ")
async def create_defendant(defendant_data: DefendantCreate):
    """สร้าง defendant ใหม่"""
    result = DefendantService.create_defendant(defendant_data.dict())
    
    if not result['success']:
        if 'already exists' in result['message']:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail=result['message']
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=result['message']
        )
    
    return result

@router.get("/defendants/{defendant_id}",
            response_model=APIResponse,
            summary="ดึงข้อมูล Defendant ตาม ID",
            description="ดึงข้อมูลจำเลยตาม ID")
async def get_defendant(
    defendant_id: int, 
    include_evidences: bool = Query(False, description="รวมข้อมูลของกลางหรือไม่")
):
    """ดึงข้อมูล defendant ตาม ID"""
    result = DefendantService.get_defendant_by_id(defendant_id, include_evidences)
    
    if not result['success']:
        if 'not found' in result['message']:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=result['message']
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=result['message']
        )
    
    return result

@router.get("/defendants",
            response_model=DefendantListResponse,
            summary="ดึงรายการ Defendants",
            description="ดึงรายการจำเลยทั้งหมด หรือค้นหาจำเลย")
async def get_all_defendants(
    skip: int = Query(0, ge=0, description="จำนวนข้อมูลที่จะข้าม"),
    limit: int = Query(100, ge=1, le=1000, description="จำนวนข้อมูลสูงสุดที่จะแสดง"),
    search: Optional[str] = Query(None, description="คำค้นหา")
):
    """ดึงรายการ defendants ทั้งหมด หรือค้นหา"""
    if search:
        result = DefendantService.search_defendants(search, skip, limit)
    else:
        result = DefendantService.get_all_defendants(skip, limit)
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=result['message']
        )
    
    return result

@router.put("/defendants/{defendant_id}",
            response_model=APIResponse,
            summary="อัปเดต Defendant",
            description="แก้ไขข้อมูลจำเลย")
async def update_defendant(defendant_id: int, defendant_data: DefendantUpdate):
    """อัปเดต defendant"""
    result = DefendantService.update_defendant(defendant_id, defendant_data.fullname)
    
    if not result['success']:
        if 'not found' in result['message']:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=result['message']
            )
        if 'already exists' in result['message']:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail=result['message']
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=result['message']
        )
    
    return result

@router.delete("/defendants/{defendant_id}",
               response_model=APIResponse,
               summary="ลบ Defendant",
               description="ลบจำเลยออกจากระบบ")
async def delete_defendant(defendant_id: int):
    """ลบ defendant"""
    result = DefendantService.delete_defendant(defendant_id)
    
    if not result['success']:
        if 'not found' in result['message']:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=result['message']
            )
        if 'Cannot delete' in result['message']:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail=result['message']
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=result['message']
        )
    
    return result

@router.post("/defendants/find-or-create",
             response_model=APIResponse,
             summary="หาหรือสร้าง Defendant",
             description="ค้นหาจำเลย ถ้าไม่พบจะสร้างใหม่")
async def find_or_create_defendant(defendant_data: DefendantCreate):
    """หาหรือสร้าง defendant"""
    result = DefendantService.find_or_create_defendant(defendant_data.fullname)
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=result['message']
        )
    
    return result