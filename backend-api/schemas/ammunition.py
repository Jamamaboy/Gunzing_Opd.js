from pydantic import BaseModel, ConfigDict
from typing import Optional

class AmmunitionBase(BaseModel):
    caliber: str
    type: Optional[str] = None
    description: Optional[str] = None

class AmmunitionCreate(AmmunitionBase):
    pass

class Ammunition(AmmunitionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)