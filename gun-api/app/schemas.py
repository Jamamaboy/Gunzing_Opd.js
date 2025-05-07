from pydantic import BaseModel
from typing import List, Optional

class GunBase(BaseModel):
    brand: str
    model: str
    categories: str
    caliber: List[str]
    manufacturer: Optional[str] = None
    series: Optional[str] = None
    magazine_capacity: Optional[str] = None
    serial_position: Optional[str] = None
    image: List[str]
    serial_image: Optional[str] = None

class Gun(GunBase):
    id: int

    class Config:
        orm_mode = True

class NarcoticBase(BaseModel):
    exhibit_id: int
    form_id: int
    stamp: str
    drug_type: str
    drug_category: str
    consumption_method: str
    effect: str
    weight_grams: Optional[float] = None
    image: List[str] = []

class Narcotic(NarcoticBase):
    id: int

    class Config:
        orm_mode = True
