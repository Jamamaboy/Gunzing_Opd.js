from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy import update, delete, or_, text
from decimal import Decimal

from models.narcotic import (
    Narcotic, 
    DrugForm, 
    NarcoticExampleImage, 
    NarcoticChemicalCompound, 
    NarcoticImageVector, 
    NarcoticPill
)
from schemas.narcotic import (
    NarcoticCreate, 
    NarcoticUpdate, 
    DrugFormBase,
    NarcoticExampleImageBase,
    NarcoticPillBase,
    NarcoticChemicalCompoundBase
)


class NarcoticService:
    @staticmethod
    async def get_drug_forms(db: AsyncSession):
        result = await db.execute(select(DrugForm))
        return result.scalars().all()

    @staticmethod
    async def get_drug_form(db: AsyncSession, form_id: int) -> Optional[DrugForm]:
        result = await db.execute(select(DrugForm).filter(DrugForm.id == form_id))
        return result.scalars().first()

    @staticmethod
    async def create_drug_form(db: AsyncSession, drug_form: DrugFormBase) -> DrugForm:
        db_drug_form = DrugForm(name=drug_form.name)
        db.add(db_drug_form)
        await db.commit()
        await db.refresh(db_drug_form)
        return db_drug_form

    @staticmethod
    async def get_narcotics(
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None,
        drug_category: Optional[str] = None,
        drug_type: Optional[str] = None,
        form_id: Optional[int] = None,
        include_relations: bool = True
    ) -> List[Narcotic]:
        """Get all narcotics with optional filtering"""
        query = select(Narcotic)
        
        # เพิ่มการโหลดข้อมูลที่เกี่ยวข้อง (relations)
        if include_relations:
            query = query.options(
                # เพิ่ม exhibit relationship
                joinedload(Narcotic.exhibit),
                joinedload(Narcotic.example_images),
                joinedload(Narcotic.example_images).joinedload(NarcoticExampleImage.image_vectors),
                joinedload(Narcotic.drug_form),
                joinedload(Narcotic.pill_info)
            )
        
        # เพิ่มเงื่อนไขการค้นหา (existing code)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Narcotic.drug_type.ilike(search_term),
                    Narcotic.drug_category.ilike(search_term),
                    Narcotic.characteristics.ilike(search_term)
                )
            )
        
        if drug_category:
            query = query.filter(Narcotic.drug_category == drug_category)
        
        if drug_type:
            query = query.filter(Narcotic.drug_type == drug_type)
        
        if form_id:
            query = query.filter(Narcotic.form_id == form_id)
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().unique().all()

    @staticmethod
    async def get_narcotic(db: AsyncSession, narcotic_id: int) -> Optional[Narcotic]:
        result = await db.execute(select(Narcotic).filter(Narcotic.id == narcotic_id))
        return result.scalars().first()

    @staticmethod
    async def get_narcotic_with_relations(db: AsyncSession, narcotic_id: int) -> Optional[Narcotic]:
        result = await db.execute(
            select(Narcotic).options(
                joinedload(Narcotic.exhibit),
                joinedload(Narcotic.drug_form),
                joinedload(Narcotic.example_images).joinedload(NarcoticExampleImage.image_vectors),
                joinedload(Narcotic.pill_info)
            ).filter(Narcotic.id == narcotic_id)
        )
        return result.scalars().first()

    @staticmethod
    async def create_narcotic(db: AsyncSession, narcotic: NarcoticCreate) -> Narcotic:
        db_narcotic = Narcotic(
            exhibit_id=narcotic.exhibit_id,
            form_id=narcotic.form_id,
            characteristics=narcotic.characteristics,
            drug_type=narcotic.drug_type,
            drug_category=narcotic.drug_category,
            consumption_method=narcotic.consumption_method,
            effect=narcotic.effect,
            weight_grams=narcotic.weight_grams
        )
        db.add(db_narcotic)
        await db.commit()
        await db.refresh(db_narcotic)
        return db_narcotic

    @classmethod
    async def create_narcotic_from_dict(cls, db: AsyncSession, narcotic_data: Dict[str, Any]):
        """Create a new narcotic from a dictionary."""
        narcotic = Narcotic(**narcotic_data)
        db.add(narcotic)
        await db.commit()
        await db.refresh(narcotic)
        return narcotic

    @staticmethod
    async def update_narcotic(db: AsyncSession, narcotic_id: int, narcotic: NarcoticUpdate) -> Optional[Narcotic]:
        db_narcotic = await NarcoticService.get_narcotic(db, narcotic_id)
        if db_narcotic:
            update_data = narcotic.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_narcotic, key, value)
            
            await db.commit()
            await db.refresh(db_narcotic)
        return db_narcotic

    @staticmethod
    async def delete_narcotic(db: AsyncSession, narcotic_id: int) -> bool:
        db_narcotic = await NarcoticService.get_narcotic(db, narcotic_id)
        if db_narcotic:
            await db.execute(delete(Narcotic).where(Narcotic.id == narcotic_id))
            await db.commit()
            return True
        return False

    @staticmethod
    async def add_example_image(db: AsyncSession, image: NarcoticExampleImageBase) -> NarcoticExampleImage:
        # แก้ไขจาก image.dict() เป็น image.model_dump()
        db_image = NarcoticExampleImage(**image.model_dump())
        db.add(db_image)
        await db.commit()
        await db.refresh(db_image)
        return db_image

    @staticmethod
    async def update_example_image(db: AsyncSession, image_id: int, image_data: Dict[str, Any]) -> Optional[NarcoticExampleImage]:
        result = await db.execute(select(NarcoticExampleImage).filter(NarcoticExampleImage.id == image_id))
        db_image = result.scalars().first()
        if db_image:
            for key, value in image_data.items():
                if hasattr(db_image, key):
                    setattr(db_image, key, value)
            await db.commit()
            await db.refresh(db_image)
        return db_image

    @staticmethod
    async def delete_example_image(db: AsyncSession, image_id: int) -> bool:
        result = await db.execute(select(NarcoticExampleImage).filter(NarcoticExampleImage.id == image_id))
        db_image = result.scalars().first()
        if db_image:
            await db.execute(delete(NarcoticExampleImage).where(NarcoticExampleImage.id == image_id))
            await db.commit()
            return True
        return False

    @staticmethod
    async def create_pill_info(db: AsyncSession, narcotic_id: int, pill_info: NarcoticPillBase) -> Optional[NarcoticPill]:
        """Update or create pill information for a narcotic"""
        # Validate narcotic existence first
        narcotic_exists = await db.execute(select(Narcotic).filter(Narcotic.id == narcotic_id))
        if not narcotic_exists.scalars().first():
            return None
        
        # Check if pill info exists
        result = await db.execute(
            select(NarcoticPill).filter(NarcoticPill.narcotic_id == narcotic_id)
        )
        existing_pill = result.scalars().first()
        
        if existing_pill:
            # Update existing pill info
            update_data = {k: v for k, v in pill_info.dict(exclude={"narcotic_id"}).items() if v is not None}
            if update_data:
                await db.execute(
                    update(NarcoticPill)
                    .where(NarcoticPill.narcotic_id == narcotic_id)
                    .values(**update_data)
                )
                await db.commit()
                
                # Refresh the instance
                result = await db.execute(
                    select(NarcoticPill).filter(NarcoticPill.narcotic_id == narcotic_id)
                )
                return result.scalars().first()
            return existing_pill
        else:
            # Create new pill info
            pill_data = pill_info.dict()
            pill_data["narcotic_id"] = narcotic_id
            
            new_pill = NarcoticPill(**pill_data)
            db.add(new_pill)
            
            try:
                await db.commit()
                await db.refresh(new_pill)
                return new_pill
            except Exception as e:
                await db.rollback()
                raise e

    @staticmethod
    async def add_chemical_compound(db: AsyncSession, compound: NarcoticChemicalCompoundBase) -> NarcoticChemicalCompound:
        db_compound = NarcoticChemicalCompound(**compound.dict())
        db.add(db_compound)
        await db.commit()
        return db_compound

    @staticmethod
    async def get_categories(db: AsyncSession) -> List[str]:
        """Get all unique drug categories"""
        result = await db.execute(select(Narcotic.drug_category).distinct())
        return [r[0] for r in result.scalars() if r[0] is not None]

    @staticmethod
    async def get_drug_types(db: AsyncSession, category: Optional[str] = None) -> List[str]:
        """Get all unique drug types, optionally filtered by category"""
        query = select(Narcotic.drug_type).distinct()
        if category:
            query = query.filter(Narcotic.drug_category == category)
        result = await db.execute(query)
        return [r[0] for r in result.scalars() if r[0] is not None]

    @staticmethod
    async def add_image_vector(db: AsyncSession, narcotic_id: int, image_id: int, vector_data: List[float]) -> NarcoticImageVector:
        """Add a new image vector"""
        db_vector = NarcoticImageVector(
            narcotic_id=narcotic_id,
            image_id=image_id,
            image_vector=vector_data
        )
        db.add(db_vector)
        await db.commit()
        await db.refresh(db_vector)
        return db_vector

    @staticmethod
    async def get_image_vectors(db: AsyncSession, narcotic_id: Optional[int] = None) -> List[NarcoticImageVector]:
        """Get image vectors, optionally filtered by narcotic_id"""
        query = select(NarcoticImageVector)
        if narcotic_id:
            query = query.filter(NarcoticImageVector.narcotic_id == narcotic_id)
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_image_vector(db: AsyncSession, vector_id: int) -> Optional[NarcoticImageVector]:
        """Get a specific image vector by ID"""
        result = await db.execute(select(NarcoticImageVector).filter(NarcoticImageVector.id == vector_id))
        return result.scalars().first()

    @staticmethod
    async def update_image_vector(db: AsyncSession, vector_id: int, vector_data: List[float]) -> Optional[NarcoticImageVector]:
        """Update an existing image vector"""
        result = await db.execute(select(NarcoticImageVector).filter(NarcoticImageVector.id == vector_id))
        db_vector = result.scalars().first()
        if db_vector:
            db_vector.image_vector = vector_data
            await db.commit()
            await db.refresh(db_vector)
        return db_vector

    @staticmethod
    async def delete_image_vector(db: AsyncSession, vector_id: int) -> bool:
        """Delete an image vector"""
        result = await db.execute(select(NarcoticImageVector).filter(NarcoticImageVector.id == vector_id))
        db_vector = result.scalars().first()
        if db_vector:
            await db.execute(delete(NarcoticImageVector).where(NarcoticImageVector.id == vector_id))
            await db.commit()
            return True
        return False

    @staticmethod
    async def get_chemical_compounds(db: AsyncSession, narcotic_id: int) -> List[NarcoticChemicalCompound]:
        """Get all chemical compounds for a narcotic"""
        result = await db.execute(select(NarcoticChemicalCompound).filter(
            NarcoticChemicalCompound.narcotic_id == narcotic_id
        ))
        return result.scalars().all()

    @staticmethod
    async def update_chemical_compound(
        db: AsyncSession, 
        narcotic_id: int, 
        compound_id: int, 
        percentage: Optional[Decimal]
    ) -> Optional[NarcoticChemicalCompound]:
        """Update a chemical compound percentage"""
        result = await db.execute(select(NarcoticChemicalCompound).filter(
            NarcoticChemicalCompound.narcotic_id == narcotic_id,
            NarcoticChemicalCompound.chemical_compound_id == compound_id
        ))
        db_compound = result.scalars().first()
        
        if db_compound:
            db_compound.percentage = percentage
            await db.commit()
            await db.refresh(db_compound)
            return db_compound
        return None

    @staticmethod
    async def delete_chemical_compound(db: AsyncSession, narcotic_id: int, compound_id: int) -> bool:
        """Delete a chemical compound association"""
        result = await db.execute(select(NarcoticChemicalCompound).filter(
            NarcoticChemicalCompound.narcotic_id == narcotic_id,
            NarcoticChemicalCompound.chemical_compound_id == compound_id
        ))
        db_compound = result.scalars().first()
        
        if db_compound:
            await db.execute(delete(NarcoticChemicalCompound).where(
                NarcoticChemicalCompound.narcotic_id == narcotic_id,
                NarcoticChemicalCompound.chemical_compound_id == compound_id
            ))
            await db.commit()
            return True
        return False
    
    @staticmethod
    async def search_similar_narcotics(db: AsyncSession, vector_str: str, top_k: int = 10):
        """Search for narcotics with similar image vectors"""
        # ลบเงื่อนไข WHERE ออกเพื่อดูทุกรายการ (เปลี่ยนแปลงชั่วคราวเพื่อการทดสอบ)
        query = text(f"""
            WITH query_vector AS (
                SELECT '{vector_str}'::vector AS v
            )
            SELECT 
                n.id as narcotic_id,
                n.drug_type as drug_type,
                n.drug_category as drug_category,
                n.effect as description,
                1 - (niv.image_vector <=> (SELECT v FROM query_vector)) as similarity
            FROM 
                narcotics_image_vectors niv
            JOIN 
                narcotics n ON niv.narcotic_id = n.id
            ORDER BY 
                niv.image_vector <=> (SELECT v FROM query_vector)
            LIMIT :top_k
        """)

        # ลอง print ค่า similarity ของผลลัพธ์ที่ได้ออกมาดู
        result = await db.execute(query, {"top_k": 10})
        rows = result.mappings().all()
        # เพิ่มการตรวจสอบข้อมูลในฟังก์ชัน search_similar_narcotics
        check_query = text("SELECT COUNT(*) FROM narcotics_image_vectors")
        count_result = await db.execute(check_query)
        count = count_result.scalar_one()
        print(f"Database has {count} vectors stored")
        
        return rows

async def format_narcotic(narcotic):
    """Format a narcotic object to a dictionary"""
    narcotic_dict = {
        'id': narcotic.id,
        'form_id': narcotic.form_id,
        'characteristics': narcotic.characteristics,
        'drug_type': narcotic.drug_type,
        'drug_category': narcotic.drug_category,
        'consumption_method': narcotic.consumption_method,
        'effect': narcotic.effect,
        'weight_grams': float(narcotic.weight_grams) if narcotic.weight_grams else None,
    }
    
    # Add pill info if exists
    if hasattr(narcotic, 'pill_info') and narcotic.pill_info:
        narcotic_dict['pill_info'] = {
            'narcotic_id': narcotic.pill_info.narcotic_id,
            'color': narcotic.pill_info.color,
            'diameter_mm': float(narcotic.pill_info.diameter_mm) if narcotic.pill_info.diameter_mm else None,
            'thickness_mm': float(narcotic.pill_info.thickness_mm) if narcotic.pill_info.thickness_mm else None,
            'edge_shape': narcotic.pill_info.edge_shape,
        }
    
    # Add example images if exist
    if hasattr(narcotic, 'example_images') and narcotic.example_images:
        narcotic_dict['example_images'] = []
        for img in narcotic.example_images:
            image_data = {
                'id': img.id,
                'image_url': img.image_url,
                'description': img.description,
                'priority': img.priority,
                'image_type': img.image_type,
                'vectors': []  # เพิ่มข้อมูล vectors
            }
            
            # เพิ่มข้อมูล vectors ถ้ามี - ใช้ awaitable_attrs
            if hasattr(img, 'image_vectors'):
                vectors = await img.awaitable_attrs.image_vectors
                if vectors:
                    for vector in vectors:
                        image_data['vectors'].append({
                            'id': vector.id,
                            'vector_id': vector.id,
                        })
            
            narcotic_dict['example_images'].append(image_data)
    
    return narcotic_dict