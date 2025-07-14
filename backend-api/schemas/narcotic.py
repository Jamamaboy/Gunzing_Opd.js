from pydantic import BaseModel, Field, validator
from typing import Optional, List
from decimal import Decimal
from pgvector.sqlalchemy import Vector as SQLAVector
import numpy as np

class ChemicalCompoundBase(BaseModel):
    name: str
    description: Optional[str] = None

class ChemicalCompound(ChemicalCompoundBase):
    id: int

    class Config:
        from_attributes = True

class ChemicalCompoundCreate(ChemicalCompoundBase):
    pass

class ChemicalCompoundUpdate(ChemicalCompoundBase):
    name: Optional[str] = None

class DrugFormBase(BaseModel):
    name: str

class DrugForm(DrugFormBase):
    id: int

    class Config:
        from_attributes = True

class ExhibitBase(BaseModel):
    category: Optional[str] = None
    subcategory: Optional[str] = None

class Exhibit(ExhibitBase):
    id: int

    class Config:
        from_attributes = True

class NarcoticExampleImageBase(BaseModel):
    narcotic_id: Optional[int] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    image_type: Optional[str] = None

class NarcoticExampleImage(NarcoticExampleImageBase):
    id: int

    class Config:
        from_attributes = True

class NarcoticChemicalCompoundBase(BaseModel):
    narcotic_id: int
    chemical_compound_id: int
    percentage: Optional[Decimal] = None

class NarcoticChemicalCompound(NarcoticChemicalCompoundBase):
    """Data as stored in the database"""
    class Config:
        from_attributes = True

class NarcoticChemicalCompoundSchema(BaseModel):
    """Schema for API response with extended information"""
    narcotic_id: int
    chemical_compound_id: int
    percentage: Optional[Decimal] = None
    chemical_compound: Optional[ChemicalCompound] = None
    
    class Config:
        from_attributes = True

class VectorField(list):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
        
    @classmethod
    def validate(cls, v):
        if isinstance(v, list) and all(isinstance(x, (int, float)) for x in v):
            return v
        if isinstance(v, np.ndarray):
            return v.tolist()
        if isinstance(v, SQLAVector):
            return list(v)
        raise ValueError('Invalid vector format')

class NarcoticImageVectorBase(BaseModel):
    narcotic_id: Optional[int] = None
    image_id: Optional[int] = None
    image_vector: Optional[VectorField] = None

class NarcoticImageVector(NarcoticImageVectorBase):
    id: int

    class Config:
        from_attributes = True

class NarcoticPillBase(BaseModel):
    narcotic_id: Optional[int] = None
    color: Optional[str] = None
    diameter_mm: Optional[Decimal] = None
    thickness_mm: Optional[Decimal] = None
    edge_shape: Optional[str] = None
    
    class Config:
        from_attributes = True

class NarcoticPill(NarcoticPillBase):
    narcotic_id: int
    
    class Config:
        from_attributes = True

class NarcoticBase(BaseModel):
    exhibit_id: Optional[int] = None
    form_id: Optional[int] = None
    characteristics: Optional[str] = None
    drug_type: Optional[str] = None
    drug_category: Optional[str] = None
    consumption_method: Optional[str] = None
    effect: Optional[str] = None
    weight_grams: Optional[Decimal] = None

class Narcotic(NarcoticBase):
    id: int

    class Config:
        from_attributes = True

class NarcoticCreate(NarcoticBase):
    pass

class NarcoticUpdate(NarcoticBase):
    pass

class NarcoticWithRelations(Narcotic):
    exhibit: Optional[Exhibit] = None
    drug_form: Optional[DrugForm] = None
    example_images: List[NarcoticExampleImage] = Field(default_factory=list)
    pill_info: Optional[NarcoticPill] = None

    class Config:
        from_attributes = True

class NarcoticImageWithVectorsSchema(BaseModel):
    id: int
    image_url: str
    description: Optional[str] = None
    priority: int = 0
    image_type: str = "default"
    image_vectors: List[NarcoticImageVector] = []
    
    class Config:
        from_attributes = True

class NarcoticFullResponse(BaseModel):
    id: int
    exhibit_id: int
    form_id: Optional[int] = None
    characteristics: Optional[str] = None
    drug_type: Optional[str] = None
    drug_category: Optional[str] = None
    consumption_method: Optional[str] = None
    effect: Optional[str] = None
    weight_grams: Optional[float] = None
    
    # ความสัมพันธ์กับตารางอื่น
    drug_form: Optional[DrugForm] = None
    pill_info: Optional[NarcoticPill] = None
    example_images: List[NarcoticImageWithVectorsSchema] = []
    chemical_compounds: List[NarcoticChemicalCompoundSchema] = []
    
    class Config:
        from_attributes = True