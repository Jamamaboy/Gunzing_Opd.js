from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from schemas.evidence import EvidenceResponse  # ✅ ต้อง import
from schemas.defendant import DefendantResponse  # ✅ ต้อง import

class CaseBase(BaseModel):
    case_id: str = Field(..., min_length=1, max_length=50, description="รหัสคดี")
    seized_from: Optional[str] = Field(None, description="ยึดได้จาก")
    occurrence_date: Optional[date] = Field(None, description="วันที่เกิดเหตุ")
    occurrence_place: Optional[str] = Field(None, description="สถานที่เกิดเหตุ")
    house_number: Optional[str] = Field(None, max_length=50, description="บ้านเลขที่")
    moo: Optional[str] = Field(None, max_length=50, description="หมู่ที่")
    soi: Optional[str] = Field(None, max_length=50, description="ซอย")
    street: Optional[str] = Field(None, max_length=100, description="ถนน")
    
    # ✅ อัปเดต: เปลี่ยนเป็น subdistrict_id
    subdistrict_id: Optional[int] = Field(None, description="ID ของตำบล/แขวง")
    
    inspection_number: Optional[str] = Field(None, max_length=50, description="เลขที่การตรวจ")

class CaseCreate(CaseBase):
    """Schema สำหรับสร้าง Case ใหม่"""
    pass

class CaseUpdate(BaseModel):
    """Schema สำหรับอัปเดต Case"""
    case_id: Optional[str] = Field(None, min_length=1, max_length=50, description="รหัสคดี")
    seized_from: Optional[str] = Field(None, description="ยึดได้จาก")
    occurrence_date: Optional[date] = Field(None, description="วันที่เกิดเหตุ")
    occurrence_place: Optional[str] = Field(None, description="สถานที่เกิดเหตุ")
    house_number: Optional[str] = Field(None, max_length=50, description="บ้านเลขที่")
    moo: Optional[str] = Field(None, max_length=50, description="หมู่ที่")
    soi: Optional[str] = Field(None, max_length=50, description="ซอย")
    street: Optional[str] = Field(None, max_length=100, description="ถนน")
    
    # ✅ อัปเดต: เปลี่ยนเป็น subdistrict_id
    subdistrict_id: Optional[int] = Field(None, description="ID ของตำบล/แขวง")
    
    inspection_number: Optional[str] = Field(None, max_length=50, description="เลขที่การตรวจ")

class CaseResponse(CaseBase):
    """Schema สำหรับ response ของ Case"""
    id: int = Field(..., description="ID ของคดี")
    created_at: Optional[datetime] = Field(None, description="วันที่สร้าง")
    updated_at: Optional[datetime] = Field(None, description="วันที่แก้ไขล่าสุด")
    evidence_count: int = Field(0, description="จำนวนของกลาง")
    
    # ✅ เพิ่ม Geography fields สำหรับ response
    subdistrict_name: Optional[str] = Field(None, description="ชื่อตำบล/แขวง")
    district_id: Optional[int] = Field(None, description="ID ของอำเภอ/เขต")
    district_name: Optional[str] = Field(None, description="ชื่ออำเภอ/เขต")
    province_id: Optional[int] = Field(None, description="ID ของจังหวัด")
    province_name: Optional[str] = Field(None, description="ชื่อจังหวัด")
    
    class Config:
        from_attributes = True

class CaseDetailResponse(CaseResponse):
    """Schema สำหรับ response ของ Case พร้อมรายละเอียด"""
    evidences: List[dict] = Field(default_factory=list, description="รายการของกลาง")

class CaseListResponse(BaseModel):
    """Schema สำหรับ response รายการ Cases"""
    success: bool = Field(True, description="สถานะการทำงาน")
    data: List[CaseResponse] = Field(..., description="รายการ Cases")
    total: int = Field(..., description="จำนวนทั้งหมด")
    message: Optional[str] = Field(None, description="ข้อความ")

class CaseStatistics(BaseModel):
    """Schema สำหรับสถิติ Cases"""
    year: int = Field(..., description="ปี")
    month: int = Field(..., description="เดือน")
    case_count: int = Field(..., description="จำนวนคดี")

class CaseStatisticsResponse(BaseModel):
    """Schema สำหรับ response สถิติ Cases"""
    success: bool = Field(True, description="สถานะการทำงาน")
    data: dict = Field(..., description="ข้อมูลสถิติ")
    message: Optional[str] = Field(None, description="ข้อความ")

class APIResponse(BaseModel):
    """Schema สำหรับ response ทั่วไป"""
    success: bool = Field(..., description="สถานะการทำงาน")
    message: str = Field(..., description="ข้อความ")
    data: Optional[dict] = Field(None, description="ข้อมูล")
    error: Optional[str] = Field(None, description="ข้อผิดพลาด")

class CaseWithRelationships(BaseModel):
    """Case พร้อมความสัมพันธ์ทั้งหมด"""
    # ✅ All existing case fields
    id: int
    case_id: str
    seized_from: Optional[str] = None
    occurrence_date: Optional[date] = None
    occurrence_place: Optional[str] = None
    house_number: Optional[str] = None
    moo: Optional[str] = None
    soi: Optional[str] = None
    street: Optional[str] = None
    subdistrict_id: Optional[int] = None
    subdistrict_name: Optional[str] = None
    district_id: Optional[int] = None
    district_name: Optional[str] = None
    province_id: Optional[int] = None
    province_name: Optional[str] = None
    inspection_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    evidence_count: int = 0
    
    # ✅ New relationship fields
    evidences: List[EvidenceResponse] = Field(default_factory=list, description="รายการของกลาง")
    defendants: List[DefendantResponse] = Field(default_factory=list, description="รายการจำเลย")
    summary: Optional[Dict[str, Any]] = Field(default_factory=dict, description="ข้อมูลสรุป")

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat() if v else None
        }

class CaseListWithRelationshipsResponse(BaseModel):
    """Response สำหรับรายการ Cases พร้อมความสัมพันธ์"""
    success: bool = True
    data: List[CaseWithRelationships]
    total: int
    message: Optional[str] = None

    class Config:
        from_attributes = True