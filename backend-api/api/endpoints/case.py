from fastapi import APIRouter, HTTPException, Query, status, Path
from fastapi import status as http_status
from urllib.parse import unquote
from typing import Optional
from schemas.case import (
    CaseCreate, 
    CaseUpdate,  
    CaseListResponse,
    CaseListWithRelationshipsResponse,  # ✅ เพิ่ม import ใหม่
    CaseStatisticsResponse,
    APIResponse
)
from services.case_service import CaseService

router = APIRouter(tags=["case"])

@router.post("/cases", 
             response_model=APIResponse, 
             status_code=status.HTTP_201_CREATED,
             summary="สร้าง Case ใหม่",
             description="สร้างคดีใหม่ในระบบ")
async def create_case(case_data: CaseCreate):
    """สร้าง Case ใหม่"""
    result = CaseService.create_case(case_data.dict())
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=result['message']
        )
    
    return result

# ✅ ย้าย endpoint นี้ขึ้นมาก่อน /cases/{case_id}
@router.get("/cases/with-relationships",
            response_model=CaseListWithRelationshipsResponse,  # ✅ เปลี่ยน response_model
            summary="ดึงรายการ Cases พร้อมความสัมพันธ์ทั้งหมด",
            description="ดึงรายการคดีพร้อม evidences, defendants, และ geography")
async def get_cases_with_relationships(
    search: Optional[str] = Query(None, description="คำค้นหา"),
    case_type: Optional[str] = Query(None, description="ประเภทคดี"),
    status_filter: Optional[str] = Query(None, alias="status", description="สถานะคดี"),
    start_date: Optional[str] = Query(None, description="วันที่เริ่มต้น (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="วันที่สิ้นสุด (YYYY-MM-DD)"),
    province: Optional[str] = Query(None, description="จังหวัด"),
    district: Optional[str] = Query(None, description="อำเภอ"),
    drug_type: Optional[str] = Query(None, description="ประเภทยาเสพติด")
):
    """ดึงรายการ Cases พร้อมความสัมพันธ์ทั้งหมด สำหรับหน้า Drug Cases List"""
    try:
        # ✅ สร้าง filters object
        filters = {}
        if search:
            filters['search'] = search
        if case_type:
            filters['case_type'] = case_type
        if status_filter:  # ✅ ใช้ status_filter แทน
            filters['status'] = status_filter
        if start_date:
            filters['start_date'] = start_date
        if end_date:
            filters['end_date'] = end_date
        if province:
            filters['province'] = province
        if district:
            filters['district'] = district
        if drug_type:
            filters['drug_type'] = drug_type
        
        print(f"🔍 Cases with relationships - Filters: {filters}")
        
        # ✅ เรียกใช้ service method
        result = CaseService.get_cases_with_relationships(filters)
        
        if not result['success']:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get('message', 'Unknown error')
            )
        
        # ✅ Debug logging - แสดงข้อมูลเพิ่มเติม
        print(f"✅ API returning {len(result['data'])} cases with relationships")
        if result['data']:
            sample_case = result['data'][0]
            print(f"📋 Sample case structure:")
            print(f"   - case_id: {sample_case.get('case_id')}")
            print(f"   - has evidences: {'evidences' in sample_case}")
            print(f"   - has defendants: {'defendants' in sample_case}")
            print(f"   - evidences count: {len(sample_case.get('evidences', []))}")
            print(f"   - defendants count: {len(sample_case.get('defendants', []))}")
            
            if sample_case.get('evidences'):
                first_evidence = sample_case['evidences'][0]
                print(f"   - first evidence drug_type: {first_evidence.get('drug_type', 'N/A')}")
                print(f"   - first evidence quantity: {first_evidence.get('quantity', 'N/A')}")
                print(f"   - first evidence weight: {first_evidence.get('weight', 'N/A')}")
            
            if sample_case.get('defendants'):
                first_defendant = sample_case['defendants'][0]
                print(f"   - first defendant: {first_defendant.get('fullname', 'N/A')}")
                print(f"   - first defendant id: {first_defendant.get('id', 'N/A')}")
        
        return {
            "success": True,
            "data": result['data'],
            "total": result.get('total', len(result['data'])),
            "message": f"Found {len(result['data'])} cases with relationships"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in get_cases_with_relationships: {str(e)}")
        import traceback
        print(f"❌ API traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# ✅ ย้าย endpoint นี้ขึ้นมาก่อน /cases/{case_id}
@router.get("/cases/statistics/overview",
            response_model=CaseStatisticsResponse,
            summary="ดึงสถิติ Cases",
            description="ดึงข้อมูลสถิติของคดี")
async def get_case_statistics():
    """ดึงสถิติของ Cases"""
    result = CaseService.get_case_statistics()
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=result['message']
        )
    
    return result

# ✅ เปลี่ยนจาก Path Parameter เป็น Query Parameter
@router.get("/cases/by-case-id",
            response_model=APIResponse,
            summary="ดึงข้อมูล Case ตาม Case ID",
            description="ดึงข้อมูลคดีตามรหัสคดี (รองรับ special characters)")
async def get_case_by_case_id(
    case_id: str = Query(..., description="Case ID (รองรับ special characters เช่น 1/2568)")
):
    """ดึงข้อมูล Case ตาม case_id โดยใช้ Query Parameter"""
    try:
        # ✅ ไม่ต้อง decode เพราะ FastAPI จัดการให้อัตโนมัติ
        print(f"🔍 Received case_id: '{case_id}'")
        
        result = CaseService.get_case_by_case_id(case_id)
        
        if not result['success']:
            if 'not found' in result['message'].lower():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, 
                    detail=f"Case with ID '{case_id}' not found"
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail=result['message']
            )
        
        return {
            "success": True,
            "data": result['data'],
            "message": f"Case '{case_id}' retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in get_case_by_case_id: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# ✅ เก็บ endpoint เดิมไว้สำหรับ backward compatibility
@router.get("/cases/case-id/{case_id}",
            response_model=APIResponse,
            summary="ดึงข้อมูล Case ตาม Case ID (Path Parameter)",
            description="ดึงข้อมูลคดีตามรหัสคดี (ต้อง URL encode)")
async def get_case_by_case_id_path(
    case_id: str = Path(..., description="Case ID (ต้อง URL encode)")
):
    """ดึงข้อมูล Case ตาม case_id โดยใช้ Path Parameter (ต้อง encode)"""
    try:
        decoded_case_id = unquote(case_id)
        print(f"🔍 Path Parameter - Original: '{case_id}', Decoded: '{decoded_case_id}'")
        
        result = CaseService.get_case_by_case_id(decoded_case_id)
        
        if not result['success']:
            if 'not found' in result['message'].lower():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, 
                    detail=f"Case with ID '{decoded_case_id}' not found"
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail=result['message']
            )
        
        return {
            "success": True,
            "data": result['data'],
            "message": f"Case '{decoded_case_id}' retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in get_case_by_case_id_path: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

# ✅ เพิ่ม debug endpoint ด้วย Query Parameter
@router.get("/cases/debug/by-case-id",
            summary="Debug Case ID (Query Parameter)",
            description="ตรวจสอบการทำงานของ Query Parameter")
async def debug_case_id_query(
    case_id: str = Query(..., description="Case ID for debugging")
):
    """Debug endpoint สำหรับตรวจสอบ Query Parameter"""
    try:
        print(f"🔍 Debug Query Parameter - case_id: '{case_id}'")
        
        # ตรวจสอบใน database
        result = CaseService.get_case_by_case_id(case_id)
        
        return {
            "success": True,
            "data": {
                "received_case_id": case_id,
                "found_in_database": result['success'],
                "database_result": result.get('data', {}).get('case_id', None) if result['success'] else None,
                "method": "Query Parameter",
                "encoding_required": False
            },
            "message": "Debug information retrieved successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Debug failed"
        }

@router.get("/cases",
            response_model=CaseListResponse,
            summary="ดึงรายการ Cases",
            description="ดึงรายการคดีทั้งหมด หรือค้นหาคดี")
async def get_all_cases(
    skip: int = Query(0, ge=0, description="จำนวนข้อมูลที่จะข้าม"),
    limit: int = Query(100, ge=1, le=1000, description="จำนวนข้อมูลสูงสุดที่จะแสดง"),
    search: Optional[str] = Query(None, description="คำค้นหา")
):
    """ดึงรายการ Cases ทั้งหมด หรือค้นหา"""
    if search:
        result = CaseService.search_cases(search, skip, limit)
    else:
        result = CaseService.get_all_cases(skip, limit)
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=result['message']
        )
    
    return result

# ⚠️ ต้องไปอยู่หลัง specific routes
@router.get("/cases/{case_id}", 
            response_model=APIResponse,
            summary="ดึงข้อมูล Case ตาม ID",
            description="ดึงข้อมูลคดีตาม ID พร้อมรายการของกลาง")
async def get_case(case_id: int):
    """ดึงข้อมูล Case ตาม ID พร้อม evidences"""
    result = CaseService.get_case_by_id(case_id)
    
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

@router.put("/cases/{case_id}",
            response_model=APIResponse,
            summary="อัปเดต Case",
            description="แก้ไขข้อมูลคดี")
async def update_case(case_id: int, case_data: CaseUpdate):
    """อัปเดต Case"""
    result = CaseService.update_case(case_id, case_data.dict(exclude_unset=True))
    
    if not result['success']:
        if 'not found' in result['message']:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=result['message']
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=result['message']
        )
    
    return result

@router.delete("/cases/{case_id}",
               response_model=APIResponse,
               summary="ลบ Case",
               description="ลบคดีออกจากระบบ")
async def delete_case(case_id: int):
    """ลบ Case"""
    result = CaseService.delete_case(case_id)
    
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