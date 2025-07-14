from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class DefendantBase(BaseModel):
    fullname: str = Field(..., min_length=1, description="ชื่อ-นามสกุล")

class DefendantCreate(DefendantBase):
    """Schema สำหรับสร้าง Defendant ใหม่"""
    pass

class DefendantUpdate(DefendantBase):
    """Schema สำหรับอัปเดต Defendant"""
    pass

class DefendantResponse(DefendantBase):
    """Schema สำหรับ response ของ Defendant"""
    id: int = Field(..., description="ID ของจำเลย")
    evidence_count: int = Field(0, description="จำนวนของกลาง")
    
    class Config:
        from_attributes = True

class DefendantDetailResponse(DefendantResponse):
    """Schema สำหรับ response ของ Defendant พร้อมรายละเอียด"""
    evidences: List[dict] = Field(default_factory=list, description="รายการของกลาง")

class DefendantListResponse(BaseModel):
    """Schema สำหรับ response รายการ Defendants"""
    success: bool = Field(True, description="สถานะการทำงาน")
    data: List[DefendantResponse] = Field(..., description="รายการจำเลย")
    total: int = Field(..., description="จำนวนทั้งหมด")
    message: Optional[str] = Field(None, description="ข้อความ")