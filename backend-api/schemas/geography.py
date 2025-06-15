from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class GeometryModel(BaseModel):
    type: str
    coordinates: List[List[List[float]]]

class ProvinceBase(BaseModel):
    id: int
    province_name: str
    geometry: Optional[Dict[str, Any]] = None

class Province(ProvinceBase):
    class Config:
        from_attributes = True

class DistrictBase(BaseModel):
    id: int
    district_name: str
    province_id: int
    geometry: Optional[Dict[str, Any]] = None

class District(DistrictBase):
    class Config:
        from_attributes = True

class SubdistrictBase(BaseModel):
    id: int
    subdistrict_name: str
    district_id: int
    geometry: Optional[Dict[str, Any]] = None

class Subdistrict(SubdistrictBase):
    class Config:
        from_attributes = True