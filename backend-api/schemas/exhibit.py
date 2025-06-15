from pydantic import BaseModel, ConfigDict
from typing import Optional
from schemas.firearm import Firearm
from schemas.narcotic import Narcotic

class ExhibitBase(BaseModel):
    category: str
    subcategory: str

class ExhibitCreate(ExhibitBase):
    pass

class ExhibitUpdate(BaseModel):
    category: Optional[str] = None
    subcategory: Optional[str] = None

class Exhibit(ExhibitBase):
    id: int
    firearm: Optional[Firearm] = None
    narcotic: Optional[Narcotic] = None

    model_config = ConfigDict(from_attributes=True)