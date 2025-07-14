from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class EvidenceBase(BaseModel):
    case_id: int = Field(..., description="ID ของคดี")
    sequence_number: Optional[int] = Field(None, description="ลำดับของกลาง")
    quantity: Optional[int] = Field(None, ge=0, description="จำนวน")
    unit: Optional[str] = Field(None, max_length=50, description="หน่วย")
    color: Optional[str] = Field(None, max_length=50, description="สี")
    diameter_mm: Optional[Decimal] = Field(None, ge=0, description="เส้นผ่านศูนย์กลาง (มม.)")
    thickness_mm: Optional[Decimal] = Field(None, ge=0, description="ความหนา (มม.)")
    edge_shape: Optional[str] = Field(None, max_length=50, description="รูปร่างขอบ")
    weight: Optional[Decimal] = Field(None, ge=0, description="น้ำหนัก")
    characteristics: Optional[str] = Field(None, description="ลักษณะเฉพาะ")
    drug_type: Optional[str] = Field(None, max_length=100, description="ประเภทยาเสพติด")
    defendant_id: Optional[int] = Field(None, description="ID ของจำเลย")

class EvidenceCreate(EvidenceBase):
    """Schema สำหรับสร้าง Evidence ใหม่"""
    pass

class EvidenceUpdate(BaseModel):
    """Schema สำหรับอัปเดต Evidence"""
    case_id: Optional[int] = Field(None, description="ID ของคดี")
    sequence_number: Optional[int] = Field(None, description="ลำดับของกลาง")
    quantity: Optional[int] = Field(None, ge=0, description="จำนวน")
    unit: Optional[str] = Field(None, max_length=50, description="หน่วย")
    color: Optional[str] = Field(None, max_length=50, description="สี")
    diameter_mm: Optional[Decimal] = Field(None, ge=0, description="เส้นผ่านศูนย์กลาง (มม.)")
    thickness_mm: Optional[Decimal] = Field(None, ge=0, description="ความหนา (มม.)")
    edge_shape: Optional[str] = Field(None, max_length=50, description="รูปร่างขอบ")
    weight: Optional[Decimal] = Field(None, ge=0, description="น้ำหนัก")
    characteristics: Optional[str] = Field(None, description="ลักษณะเฉพาะ")
    drug_type: Optional[str] = Field(None, max_length=100, description="ประเภทยาเสพติด")
    defendant_id: Optional[int] = Field(None, description="ID ของจำเลย")

class EvidenceChemicalCompoundBase(BaseModel):
    chemical_compound_id: int = Field(..., description="ID ของสารเคมี")
    percentage: Optional[Decimal] = Field(None, ge=0, le=100, description="เปอร์เซ็นต์")

class EvidenceChemicalCompoundCreate(EvidenceChemicalCompoundBase):
    """Schema สำหรับเพิ่มสารเคมีใน Evidence"""
    pass

class EvidenceChemicalCompoundResponse(EvidenceChemicalCompoundBase):
    """Schema สำหรับ response ของสารเคมีใน Evidence"""
    evidence_id: int = Field(..., description="ID ของของกลาง")
    
    class Config:
        from_attributes = True

class EvidenceImageBase(BaseModel):
    image_url: str = Field(..., description="URL ของรูปภาพ")
    description: Optional[str] = Field(None, description="คำอธิบายรูปภาพ")
    priority: int = Field(1, ge=1, description="ลำดับความสำคัญ")
    image_type: str = Field("photo", description="ประเภทรูปภาพ")

class EvidenceImageCreate(EvidenceImageBase):
    """Schema สำหรับเพิ่มรูปภาพใน Evidence"""
    pass

class EvidenceImageResponse(EvidenceImageBase):
    """Schema สำหรับ response ของรูปภาพใน Evidence"""
    id: int = Field(..., description="ID ของรูปภาพ")
    evidence_id: int = Field(..., description="ID ของของกลาง")
    
    class Config:
        from_attributes = True

class EvidenceResponse(EvidenceBase):
    """Schema สำหรับ response ของ Evidence"""
    id: int = Field(..., description="ID ของของกลาง")
    case_number: Optional[str] = Field(None, description="รหัสคดี")
    defendant_name: Optional[str] = Field(None, description="ชื่อจำเลย")
    created_at: Optional[datetime] = Field(None, description="วันที่สร้าง")
    updated_at: Optional[datetime] = Field(None, description="วันที่แก้ไขล่าสุด")
    
    class Config:
        from_attributes = True

class EvidenceDetailResponse(EvidenceResponse):
    """Schema สำหรับ response ของ Evidence พร้อมรายละเอียด"""
    chemical_compounds: List[EvidenceChemicalCompoundResponse] = Field(default_factory=list, description="สารเคมี")
    images: List[EvidenceImageResponse] = Field(default_factory=list, description="รูปภาพ")

class EvidenceListResponse(BaseModel):
    """Schema สำหรับ response รายการ Evidences"""
    success: bool = Field(True, description="สถานะการทำงาน")
    data: List[EvidenceResponse] = Field(..., description="รายการของกลาง")
    total: int = Field(..., description="จำนวนทั้งหมด")
    message: Optional[str] = Field(None, description="ข้อความ")

class EvidenceCreateWithDetails(EvidenceCreate):
    """Schema สำหรับสร้าง Evidence พร้อมรายละเอียด"""
    chemical_compounds: Optional[List[EvidenceChemicalCompoundCreate]] = Field(default_factory=list, description="สารเคมี")
    images: Optional[List[EvidenceImageCreate]] = Field(default_factory=list, description="รูปภาพ")