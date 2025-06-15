from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from schemas.ammunition import Ammunition

class FirearmExampleImageBase(BaseModel):
    image_url: str
    description: Optional[str] = None
    priority: Optional[int] = None

class FirearmExampleImageCreate(FirearmExampleImageBase):
    firearm_id: int

class FirearmExampleImage(FirearmExampleImageBase):
    id: int
    firearm_id: int

    model_config = ConfigDict(from_attributes=True)

# Firearm schemas
class FirearmBase(BaseModel):
    mechanism: str
    brand: str
    series: Optional[str] = None
    model: Optional[str] = None
    normalized_name: Optional[str] = None

class FirearmCreate(FirearmBase):
    exhibit_id: int

# ✅ เพิ่ม FirearmUpdate schema ที่ไม่ต้องการ exhibit_id
class FirearmUpdate(FirearmBase):
    mechanism: Optional[str] = None
    brand: Optional[str] = None
    series: Optional[str] = None
    model: Optional[str] = None
    normalized_name: Optional[str] = None

class Firearm(FirearmBase):
    id: int
    exhibit_id: int
    example_images: List[FirearmExampleImage] = []
    ammunitions: List[Ammunition] = []

    model_config = ConfigDict(from_attributes=True)