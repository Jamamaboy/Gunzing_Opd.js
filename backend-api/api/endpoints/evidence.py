from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List
from schemas.evidence import (
    EvidenceCreate,
    EvidenceUpdate,
    EvidenceResponse,
    EvidenceDetailResponse,
    EvidenceListResponse,
    EvidenceCreateWithDetails,
    EvidenceChemicalCompoundCreate,
    EvidenceImageCreate
)
from schemas.case import APIResponse
from services.evidence_service import EvidenceService

router = APIRouter(tags=["evidence"])

@router.post("/evidences",
             response_model=APIResponse,
             status_code=status.HTTP_201_CREATED,
             summary="สร้าง Evidence ใหม่",
             description="เพิ่มของกลางใหม่ในระบบ")
async def create_evidence(evidence_data: EvidenceCreate):
    """สร้าง evidence ใหม่"""
    result = EvidenceService.create_evidence(evidence_data.dict())
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result['message']
        )
    
    return result

@router.post("/evidences/with-details",
             response_model=APIResponse,
             status_code=status.HTTP_201_CREATED,
             summary="สร้าง Evidence พร้อมรายละเอียด",
             description="เพิ่มของกลางใหม่พร้อมสารเคมีและรูปภาพ")
async def create_evidence_with_details(evidence_data: EvidenceCreateWithDetails):
    """สร้าง evidence พร้อมรายละเอียด"""
    data = evidence_data.dict()
    chemical_compounds = data.pop('chemical_compounds', [])
    images = data.pop('images', [])
    
    result = EvidenceService.create_evidence(data, chemical_compounds, images)
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result['message']
        )
    
    return result

@router.get("/evidences/{evidence_id}",
            response_model=APIResponse,
            summary="ดึงข้อมูล Evidence ตาม ID",
            description="ดึงข้อมูลของกลางตาม ID")
async def get_evidence(
    evidence_id: int,
    include_details: bool = Query(True, description="รวมรายละเอียดทั้งหมดหรือไม่")
):
    """ดึงข้อมูล evidence ตาม ID"""
    result = EvidenceService.get_evidence_by_id(evidence_id, include_details)
    
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

@router.get("/evidences",
            response_model=EvidenceListResponse,
            summary="ดึงรายการ Evidence",
            description="ดึงรายการของกลางทั้งหมด หรือค้นหาของกลาง")
async def get_all_evidences(
    skip: int = Query(0, ge=0, description="จำนวนข้อมูลที่จะข้าม"),
    limit: int = Query(100, ge=1, le=1000, description="จำนวนข้อมูลสูงสุดที่จะแสดง"),
    search: Optional[str] = Query(None, description="คำค้นหา")
):
    """ดึงรายการ evidences ทั้งหมด หรือค้นหา"""
    if search:
        result = EvidenceService.search_evidences(search, skip, limit)
    else:
        result = EvidenceService.get_all_evidences(skip, limit)
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result['message']
        )
    
    return result

@router.get("/evidences/case/{case_id}",
            response_model=EvidenceListResponse,
            summary="ดึงรายการ Evidence ตาม Case ID",
            description="ดึงรายการของกลางในคดีที่ระบุ")
async def get_evidences_by_case_id(case_id: int):
    """ดึงข้อมูล evidences ตาม case_id"""
    result = EvidenceService.get_evidences_by_case_id(case_id)
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result['message']
        )
    
    return result

@router.get("/evidences/defendant/{defendant_id}",
            response_model=EvidenceListResponse,
            summary="ดึงรายการ Evidence ตาม Defendant ID",
            description="ดึงรายการของกลางของจำเลยที่ระบุ")
async def get_evidences_by_defendant_id(defendant_id: int):
    """ดึงข้อมูล evidences ตาม defendant_id"""
    result = EvidenceService.get_evidences_by_defendant_id(defendant_id)
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result['message']
        )
    
    return result

@router.put("/evidences/{evidence_id}",
            response_model=APIResponse,
            summary="อัปเดต Evidence",
            description="แก้ไขข้อมูลของกลาง")
async def update_evidence(evidence_id: int, evidence_data: EvidenceUpdate):
    """อัปเดต evidence"""
    result = EvidenceService.update_evidence(evidence_id, evidence_data.dict(exclude_unset=True))
    
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

@router.delete("/evidences/{evidence_id}",
               response_model=APIResponse,
               summary="ลบ Evidence",
               description="ลบของกลางออกจากระบบ")
async def delete_evidence(evidence_id: int):
    """ลบ evidence"""
    result = EvidenceService.delete_evidence(evidence_id)
    
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

# Chemical Compounds Routes
@router.post("/evidences/{evidence_id}/chemical-compounds",
             response_model=APIResponse,
             summary="เพิ่มสารเคมีใน Evidence",
             description="เพิ่มข้อมูลสารเคมีในของกลาง")
async def add_chemical_compound(evidence_id: int, compound_data: EvidenceChemicalCompoundCreate):
    """เพิ่มสารเคมีใน evidence"""
    result = EvidenceService.add_chemical_compound(evidence_id, compound_data.dict())
    
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

@router.delete("/evidences/{evidence_id}/chemical-compounds/{compound_id}",
               response_model=APIResponse,
               summary="ลบสารเคมีจาก Evidence",
               description="ลบข้อมูลสารเคมีออกจากของกลาง")
async def remove_chemical_compound(evidence_id: int, compound_id: int):
    """ลบสารเคมีจาก evidence"""
    result = EvidenceService.remove_chemical_compound(evidence_id, compound_id)
    
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

# Images Routes
@router.post("/evidences/{evidence_id}/images",
             response_model=APIResponse,
             summary="เพิ่มรูปภาพใน Evidence",
             description="เพิ่มรูปภาพในของกลาง")
async def add_image(evidence_id: int, image_data: EvidenceImageCreate):
    """เพิ่มรูปภาพใน evidence"""
    result = EvidenceService.add_image(evidence_id, image_data.dict())
    
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

@router.delete("/evidences/{evidence_id}/images/{image_id}",
               response_model=APIResponse,
               summary="ลบรูปภาพจาก Evidence",
               description="ลบรูปภาพออกจากของกลาง")
async def remove_image(evidence_id: int, image_id: int):
    """ลบรูปภาพจาก evidence"""
    result = EvidenceService.remove_image(evidence_id, image_id)
    
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

@router.get("/evidences/statistics/overview",
            response_model=APIResponse,
            summary="ดึงสถิติ Evidence",
            description="ดึงข้อมูลสถิติของของกลาง")
async def get_evidence_statistics():
    """ดึงสถิติของ evidences"""
    result = EvidenceService.get_evidence_statistics()
    
    if not result['success']:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result['message']
        )
    
    return result