import os
import httpx
import base64
import numpy as np

from typing import List
from fastapi import APIRouter, Depends, Body, HTTPException, status, File, UploadFile, Form
from sqlalchemy import func, literal_column, text
from sqlalchemy.orm import aliased

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional, Dict, Any

from config.database import get_db
from config.cloudinary_config import upload_image_to_cloudinary
from models.narcotic import (
    Narcotic, NarcoticExampleImage, NarcoticChemicalCompound,
    NarcoticPill, NarcoticImageVector, ChemicalCompound,
    DrugForm
)
from schemas.narcotic import (
    Narcotic as NarcoticSchema,
    NarcoticCreate,
    NarcoticUpdate,
    NarcoticWithRelations,
    NarcoticExampleImage as NarcoticImageSchema,
    NarcoticExampleImageBase,
    NarcoticChemicalCompoundBase,
    NarcoticPillBase,
    ChemicalCompound as ChemicalCompoundSchema,
    DrugForm as DrugFormSchema
)
from services.exhibit_service import get_exhibit_by_id
from services.narcotic_service import NarcoticService
from pgvector.sqlalchemy import Vector
from core.config import get_ai_service_url


router = APIRouter(tags=["narcotics"])

async def run_sync_to_async(func, *args, **kwargs):
    """Run a synchronous function in an asynchronous way"""
    import asyncio
    from functools import partial
    return await asyncio.get_event_loop().run_in_executor(
        None, partial(func, *args, **kwargs)
    )

@router.get("/narcotics", response_model=List[NarcoticWithRelations])
async def read_narcotics(
    db: AsyncSession = Depends(get_db),
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    drug_category: Optional[str] = None,
    drug_type: Optional[str] = None,
    form_id: Optional[int] = None,
    include_relations: bool = True
):
    """
    Get all narcotics with filtering options.
    Can include relationships like images and vectors.
    """
    narcotics = await NarcoticService.get_narcotics(
        db,
        skip=skip,
        limit=limit,
        search=search,
        drug_category=drug_category,
        drug_type=drug_type,
        form_id=form_id,
        include_relations=include_relations
    )
    
    return narcotics

@router.get("/narcotics/{narcotic_id}", response_model=NarcoticWithRelations)
async def read_narcotic(
    narcotic_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific narcotic by ID with all relationships.
    """
    narcotic = await NarcoticService.get_narcotic_with_relations(
        db,
        narcotic_id
    )
    
    if not narcotic:
        raise HTTPException(status_code=404, detail="Narcotic not found")
        
    return narcotic

@router.get("/exhibits/{exhibit_id}/narcotic", response_model=NarcoticWithRelations)
async def read_exhibit_narcotic(
    exhibit_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """
    Get the narcotic associated with a specific exhibit.
    """
    # First check if exhibit exists
    exhibit = await get_exhibit_by_id(db, exhibit_id)
    if not exhibit:
        raise HTTPException(status_code=404, detail="Exhibit not found")
    
    # Find narcotic by exhibit_id
    narcotics = await NarcoticService.get_narcotics(
        db,
        search=None,
        drug_category=None,
        drug_type=None,
        form_id=None
    )
    
    narcotic = next((n for n in narcotics if n.exhibit_id == exhibit_id), None)
    
    if not narcotic:
        raise HTTPException(status_code=404, detail="Narcotic not found for this exhibit")
    
    narcotic_with_relations = await NarcoticService.get_narcotic_with_relations(
        db,
        narcotic.id
    )
    
    return narcotic_with_relations

@router.post("/narcotic/{exhibit_id}", response_model=NarcoticWithRelations, status_code=status.HTTP_201_CREATED)
async def create_exhibit_narcotic(
    exhibit_id: int,
    narcotic: NarcoticCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new narcotic linked to an exhibit.
    """
    # Check if exhibit exists
    exhibit = await get_exhibit_by_id(db, exhibit_id)
    if not exhibit:
        raise HTTPException(status_code=404, detail="Exhibit not found")
    
    # Check if narcotic already exists for this exhibit
    narcotics = await NarcoticService.get_narcotics(db)
    
    existing_narcotic = next((n for n in narcotics if n.exhibit_id == exhibit_id), None)
    if existing_narcotic:
        raise HTTPException(
            status_code=400, 
            detail="This exhibit already has an associated narcotic"
        )
    
    try:
        # วิธีที่ 1: ใช้ ORM โดยตรงกับรูปแบบของ SQLAlchemy
        from models.narcotic import Narcotic as NarcoticModel
        
        # สร้างข้อมูลพื้นฐาน
        narcotic_dict = narcotic.model_dump()
        # เพิ่ม exhibit_id เข้าไปในข้อมูล
        narcotic_dict["exhibit_id"] = exhibit_id
        
        # สร้าง entity ใหม่
        db_narcotic = NarcoticModel(**narcotic_dict)
        db.add(db_narcotic)
        await db.commit()
        await db.refresh(db_narcotic)
        
        # ดึงข้อมูลที่ถูกสร้างพร้อมความสัมพันธ์
        return await NarcoticService.get_narcotic_with_relations(
            db,
            db_narcotic.id
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create narcotic using ORM: {str(e)}"
        )

@router.put("/exhibits/{exhibit_id}/narcotic/{narcotic_id}", response_model=NarcoticWithRelations)
async def update_exhibit_narcotic(
    exhibit_id: int,
    narcotic_id: int,
    narcotic: NarcoticUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing narcotic linked to an exhibit.
    """
    # Check if exhibit exists
    exhibit = await get_exhibit_by_id(db, exhibit_id)
    if not exhibit:
        raise HTTPException(status_code=404, detail="Exhibit not found")
    
    # Get narcotic to verify it belongs to this exhibit
    db_narcotic = await NarcoticService.get_narcotic(
        db,
        narcotic_id
    )
    
    if not db_narcotic:
        raise HTTPException(status_code=404, detail="Narcotic not found")
    
    if db_narcotic.exhibit_id != exhibit_id:
        raise HTTPException(status_code=400, detail="This narcotic doesn't belong to the specified exhibit")
    
    # Update narcotic
    updated_narcotic = await NarcoticService.update_narcotic(
        db,
        narcotic_id,
        narcotic
    )
    
    # Get updated narcotic with relations
    return await NarcoticService.get_narcotic_with_relations(
        db,
        narcotic_id
    )

@router.delete("/exhibits/{exhibit_id}/narcotic/{narcotic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exhibit_narcotic(
    exhibit_id: int,
    narcotic_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a narcotic linked to an exhibit.
    """
    # Check if exhibit exists
    exhibit = await get_exhibit_by_id(db, exhibit_id)
    if not exhibit:
        raise HTTPException(status_code=404, detail="Exhibit not found")
    
    # Get narcotic to verify it belongs to this exhibit
    db_narcotic = await NarcoticService.get_narcotic(
        db,
        narcotic_id
    )
    
    if not db_narcotic:
        raise HTTPException(status_code=404, detail="Narcotic not found")
    
    if db_narcotic.exhibit_id != exhibit_id:
        raise HTTPException(status_code=400, detail="This narcotic doesn't belong to the specified exhibit")
    
    # Delete narcotic
    success = await NarcoticService.delete_narcotic(
        db,
        narcotic_id
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete narcotic")
    
    return None

# Example Images endpoints
@router.post("/exhibits/{exhibit_id}/narcotic/{narcotic_id}/images", response_model=NarcoticImageSchema)
async def upload_narcotic_image(
    exhibit_id: int,
    narcotic_id: int,
    file: UploadFile = File(...),
    description: str = Form(""),
    priority: int = Form(0),
    image_type: str = Form("default"),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload an image for a narcotic linked to an exhibit.
    """
    # Verify exhibit and narcotic
    exhibit = await get_exhibit_by_id(db, exhibit_id)
    if not exhibit:
        raise HTTPException(status_code=404, detail="Exhibit not found")
    
    db_narcotic = await NarcoticService.get_narcotic(
        db,
        narcotic_id
    )
    
    if not db_narcotic or db_narcotic.exhibit_id != exhibit_id:
        raise HTTPException(status_code=404, detail="Narcotic not found for this exhibit")
    
    # Upload image to Cloudinary
    try:
        cloudinary_result = await upload_image_to_cloudinary(file)
        
        # Create image record
        image_data = NarcoticExampleImageBase(
            narcotic_id=narcotic_id,
            image_url=cloudinary_result["secure_url"],
            description=description,
            priority=priority,
            image_type=image_type
        )
        
        # Add image to database
        image = await NarcoticService.add_example_image(
            db,
            image_data
        )
        
        return image
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

@router.get("/exhibits/{exhibit_id}/narcotic/{narcotic_id}/images", response_model=List[NarcoticImageSchema])
async def get_narcotic_images(
    exhibit_id: int,
    narcotic_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all images for a narcotic linked to an exhibit.
    """
    # Verify exhibit and narcotic
    exhibit = await get_exhibit_by_id(db, exhibit_id)
    if not exhibit:
        raise HTTPException(status_code=404, detail="Exhibit not found")
    
    narcotic = await NarcoticService.get_narcotic_with_relations(
        db,
        narcotic_id
    )
    
    if not narcotic or narcotic.exhibit_id != exhibit_id:
        raise HTTPException(status_code=404, detail="Narcotic not found for this exhibit")
    
    return narcotic.example_images

# ChemicalCompound endpoints
@router.get("/chemical-compounds", response_model=List[ChemicalCompoundSchema])
async def get_chemical_compounds(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all chemical compounds.
    """
    result = await db.execute(select(ChemicalCompound))
    compounds = result.scalars().all()
    return compounds

@router.post("/exhibits/{exhibit_id}/narcotic/{narcotic_id}/chemical-compounds", status_code=status.HTTP_204_NO_CONTENT)
async def add_chemical_compound(
    exhibit_id: int,
    narcotic_id: int,
    compound_data: NarcoticChemicalCompoundBase,
    db: AsyncSession = Depends(get_db)
):
    """
    Add a chemical compound to a narcotic.
    """
    # Verify exhibit and narcotic
    exhibit = await get_exhibit_by_id(db, exhibit_id)
    if not exhibit:
        raise HTTPException(status_code=404, detail="Exhibit not found")
    
    db_narcotic = await NarcoticService.get_narcotic(
        db,
        narcotic_id
    )
    
    if not db_narcotic or db_narcotic.exhibit_id != exhibit_id:
        raise HTTPException(status_code=404, detail="Narcotic not found for this exhibit")
    
    # Ensure correct narcotic_id
    compound_data.narcotic_id = narcotic_id
    
    # Add chemical compound
    await NarcoticService.add_chemical_compound(
        db,
        compound_data
    )
    
    return None

# Pill info endpoints
@router.post("/narcotics/pill", status_code=status.HTTP_200_OK, response_model=NarcoticPillBase)
async def create_pill_info(
    pill_info: NarcoticPillBase,
    db: AsyncSession = Depends(get_db)
):
    """
    Create pill information for a narcotic.
    """
    # ดึง narcotic_id จาก request body
    narcotic_id = pill_info.narcotic_id
    
    if not narcotic_id:
        raise HTTPException(status_code=400, detail="narcotic_id is required")
    
    # ตรวจสอบว่า narcotic มีอยู่จริง
    db_narcotic = await NarcoticService.get_narcotic(db, narcotic_id)
    
    if not db_narcotic:
        raise HTTPException(status_code=404, detail="Narcotic not found")
    
    # สร้างข้อมูล pill info โดยใช้ create_pill_info จาก service
    result = await NarcoticService.create_pill_info(
        db,
        narcotic_id,
        pill_info
    )
    
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create pill information")
    
    return result

@router.post("/narcotics/images/vector")
async def create_image_vector_dataform(
    file: UploadFile,
    narcotic_id: int = Form(...),
    image_id: int = Form(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Create and store a vector representation for an existing narcotic image using form data
    """
    # Get ML service URL from config
    ml_service_url = get_ai_service_url()
    
    # 1. ตรวจสอบว่า narcotic และ image มีอยู่จริง
    db_narcotic = await NarcoticService.get_narcotic(db, narcotic_id)
    if not db_narcotic:
        raise HTTPException(status_code=404, detail="Narcotic not found")
    
    # ตรวจสอบรูปภาพ
    result = await db.execute(
        select(NarcoticExampleImage).filter(
            NarcoticExampleImage.id == image_id,
            NarcoticExampleImage.narcotic_id == narcotic_id
        )
    )
    image = result.scalars().first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found for this narcotic")
    
    try:
        # 2. เรียกใช้ AI service เพื่อสร้าง vector
        import httpx
        
        # อ่านไฟล์
        file_content = await file.read()
        file.file.seek(0)
        
        # ส่งไปยัง AI service
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{ml_service_url}/api/convert",
                files={"file": (file.filename, file_content, file.content_type)},
                data={"normalize": True, "return_raw_vector": True}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to generate vector: {response.text}"
                )
                
            vector_result = response.json()
        
        # แก้ไขส่วนนี้ให้อ่าน vector_base64 แทน
        vector_list = None
        
        # ตรวจสอบว่ามี vector_base64 หรือไม่ (รูปแบบใหม่)
        if "vector_base64" in vector_result:
            vector_data = base64.b64decode(vector_result["vector_base64"])
            numpy_vector = np.frombuffer(vector_data, dtype=np.float32)
            vector_list = numpy_vector.tolist()
        # รองรับรูปแบบเดิมในกรณีที่ยังไม่ได้อัพเดทระบบทั้งหมด
        elif "vector_info" in vector_result and "vector" in vector_result["vector_info"]:
            vector_list = vector_result["vector_info"]["vector"]
        elif "vector" in vector_result:
            vector_list = vector_result["vector"]
        else:
            raise HTTPException(
                status_code=500,
                detail="Vector data not found in AI service response"
            )
        
        # เพิ่ม logging เพื่อตรวจสอบข้อมูล
        print(f"Vector dimension: {len(vector_list)}")
        if len(vector_list) > 0:
            print(f"First 5 values: {vector_list[:5]}")
        
        # 4. บันทึกลงฐานข้อมูลโดยใช้ ORM
        db_vector = await NarcoticService.add_image_vector(
            db=db,
            narcotic_id=narcotic_id,
            image_id=image_id,
            vector_data=vector_list
        )
        
        # 5. ส่งคืนผลลัพธ์
        return {
            "success": True,
            "vector_id": db_vector.id,
            "narcotic_id": narcotic_id,
            "image_id": image_id,
            "vector_dimension": len(vector_list)
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"ERROR in create_image_vector_dataform: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create and store vector: {str(e)}"
        )
    
@router.post("/narcotics/{narcotic_id}/images/with-vector")
async def upload_and_vectorize_image(
    narcotic_id: int,
    file: UploadFile = File(...),
    description: str = Form(""),
    priority: int = Form(0),
    image_type: str = Form("default"),
    process_vector: str = Form("true"),
    db: AsyncSession = Depends(get_db)
):
    """
    API endpoint that matches the frontend pattern - upload image and create vector
    """
    # Get ML service URL from config
    ml_service_url = get_ai_service_url()
    
    # 1. ตรวจสอบว่า narcotic มีอยู่จริง
    db_narcotic = await NarcoticService.get_narcotic(db, narcotic_id)
    if not db_narcotic:
        raise HTTPException(status_code=404, detail="Narcotic not found")
    
    try:
        # 2. อัพโหลดรูปภาพไปยัง Cloudinary
        cloudinary_result = await upload_image_to_cloudinary(file)
        image_url = cloudinary_result["secure_url"]
        
        # 3. บันทึกข้อมูลรูปภาพ
        image_data = NarcoticExampleImageBase(
            narcotic_id=narcotic_id,
            image_url=image_url,
            description=description,
            priority=priority,
            image_type=image_type
        )
        db_image = await NarcoticService.add_example_image(db, image_data)
        
        # 4. ถ้าต้องการสร้าง vector
        if process_vector.lower() == "true":
            # อ่านไฟล์อีกครั้ง
            file.file.seek(0)
            file_content = await file.read()
            file.file.seek(0)
            
            # ส่งไปยัง AI service
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{ml_service_url}/api/convert",
                    files={"file": (file.filename, file_content, file.content_type)},
                    data={"normalize": True, "return_raw_vector": True, "target_dim": 16000}
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=500, 
                        detail=f"Failed to generate vector: {response.text}"
                    )
                    
                vector_result = response.json()
            
            vector_data = base64.b64decode(vector_result["vector_base64"])
            numpy_vector = np.frombuffer(vector_data, dtype=np.float32)
            vector_list = numpy_vector.tolist()
            
            # 5. บันทึก vector ลงฐานข้อมูล
            db_vector = await NarcoticService.add_image_vector(
                db=db,
                narcotic_id=narcotic_id,
                image_id=db_image.id,
                vector_data=vector_list
            )
            
            # 6. ส่งคืนผลลัพธ์
            return {
                "success": True,
                "image": {
                    "id": db_image.id,
                    "url": image_url,
                    "description": description
                },
                "vector": {
                    "id": db_vector.id,
                    "dimension": len(vector_list)
                }
            }
        
        # ถ้าไม่ต้องการสร้าง vector
        return {
            "success": True,
            "image": {
                "id": db_image.id,
                "url": image_url,
                "description": description
            }
        }
    
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload and vectorize image: {str(e)}"
        )

@router.post("/narcotics/search-similar")
async def search_similar_narcotics(
    file: UploadFile,
    top_k: int = 5,
    similarity_threshold: float = 0.7,
    db: AsyncSession = Depends(get_db)
):
    """
    Search for similar narcotics based on a query image using SQLAlchemy ORM
    """
    # Get ML service URL from config
    ml_service_url = get_ai_service_url()
    
    try:
        # 1. สร้าง vector จากรูปภาพค้นหา
        file_content = await file.read()
        file.file.seek(0)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{ml_service_url}/api/convert",
                files={"file": (file.filename, file_content, file.content_type)},
                data={"normalize": True, "return_raw_vector": True}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to generate vector: {response.text}"
                )
                
            vector_result = response.json()
        
        vector_data = base64.b64decode(vector_result["vector_base64"])
        search_vector = np.frombuffer(vector_data, dtype=np.float32)
        
        # ตรวจสอบว่ามีข้อมูลในตาราง vector หรือไม่
        check_query = text("SELECT COUNT(*) FROM narcotics_image_vectors")
        count_result = await db.execute(check_query)
        count = count_result.scalar_one()
        print(f"Database has {count} vectors stored")
        
        # สร้าง custom function สำหรับ cosine similarity
        cosine_similarity = func.text("1 - (image_vector <=> :search_vector)")
        
        # สร้าง subquery ที่คำนวณ similarity
        subq = (
            select(
                NarcoticImageVector.narcotic_id,
                NarcoticImageVector.image_id,
                func.text("1 - (image_vector <=> :search_vector)").label("similarity")
            )
            .where(func.text("1 - (image_vector <=> :search_vector)") > similarity_threshold)
            .order_by(func.text("similarity").desc())
            .limit(top_k)
            .params(search_vector=search_vector.tolist())
            .subquery()
        )
        
        # Join กับตารางอื่นๆ เพื่อดึงข้อมูลที่ต้องการ
        query = (
            select(
                Narcotic.id.label("narcotic_id"),
                Narcotic.drug_type,
                Narcotic.drug_category,
                Narcotic.characteristics,
                NarcoticExampleImage.id.label("image_id"),
                NarcoticExampleImage.image_url,
                NarcoticExampleImage.description,
                subq.c.similarity
            )
            .join(subq, Narcotic.id == subq.c.narcotic_id)
            .join(NarcoticExampleImage, NarcoticExampleImage.id == subq.c.image_id)
            .order_by(subq.c.similarity.desc())
        )
        
        # 4. ค้นหาในฐานข้อมูล
        result = await db.execute(query)
        similar_items = result.mappings().all()
        
        # 5. แปลงผลลัพธ์เป็น dictionary (เหมือนเดิม)
        results = []
        for item in similar_items:
            results.append({
                "narcotic_id": item["narcotic_id"],
                "drug_type": item["drug_type"],
                "drug_category": item["drug_category"],
                "characteristics": item["characteristics"],
                "image_id": item["image_id"],
                "image_url": item["image_url"],
                "description": item["description"],
                "similarity": round(float(item["similarity"]), 4)
            })
        
        return {
            "query_image": file.filename,
            "results_count": len(results),
            "results": results
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching similar narcotics: {str(e)}"
        )

@router.get("/drug-forms", response_model=List[DrugFormSchema])
async def get_drug_forms(db: AsyncSession = Depends(get_db)):
    """
    Get all drug forms for dropdown selection
    """
    try:
        result = await db.execute(select(DrugForm))
        drug_forms = result.scalars().all()
        return drug_forms
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching drug forms: {str(e)}")

@router.post("/narcotic", response_model=NarcoticWithRelations, status_code=status.HTTP_201_CREATED)
async def create_narcotic(
    narcotic: NarcoticCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new narcotic from frontend.
    """
    try:
        # ตรวจสอบว่า exhibit ที่อ้างถึงมีอยู่จริง
        exhibit_id = narcotic.exhibit_id
        exhibit = await get_exhibit_by_id(db, exhibit_id)
        if not exhibit:
            raise HTTPException(status_code=404, detail="Exhibit not found")
        
        # ตรวจสอบว่ามี narcotic อยู่แล้วหรือไม่
        narcotics = await NarcoticService.get_narcotics(db)
        existing_narcotic = next((n for n in narcotics if n.exhibit_id == exhibit_id), None)
        if existing_narcotic:
            raise HTTPException(
                status_code=400, 
                detail="This exhibit already has an associated narcotic"
            )
        
        # สร้างข้อมูล narcotic
        from models.narcotic import Narcotic as NarcoticModel
        narcotic_dict = narcotic.model_dump()
        db_narcotic = NarcoticModel(**narcotic_dict)
        db.add(db_narcotic)
        await db.commit()
        await db.refresh(db_narcotic)
        
        # ส่งคืนข้อมูลที่สร้างพร้อมความสัมพันธ์
        return await NarcoticService.get_narcotic_with_relations(
            db,
            db_narcotic.id
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create narcotic: {str(e)}"
        )

@router.post("/search-vector", response_model=Dict[str, List[Dict[str, Any]]])
async def search_similar_narcotics(
    vector: List[float] = Body(None),  # เปลี่ยนเป็น optional
    vector_base64: str = Body(None),   # เพิ่มพารามิเตอร์นี้
    top_k: int = Body(3),
    similarity_threshold: float = Body(0.05),
    db: AsyncSession = Depends(get_db)
):
    """
    ค้นหายาเสพติดที่มีลักษณะคล้ายคลึงกันจาก vector หรือ vector_base64
    """
    try:
        # ตรวจสอบว่ามี vector_base64 หรือ vector
        if vector_base64:
            # แปลง base64 เป็น vector
            try:
                vector_data = base64.b64decode(vector_base64)
                vector = np.frombuffer(vector_data, dtype=np.float32).tolist()
                print(f"Using vector_base64: decoded to vector of length {len(vector)}")
            except Exception as e:
                print(f"Error decoding vector_base64: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Invalid vector_base64 format: {str(e)}")
        
        # ตรวจสอบว่ามี vector หรือไม่
        if not vector or len(vector) == 0:
            raise HTTPException(status_code=400, detail="Either vector or vector_base64 is required")
            
        # แสดงตัวอย่าง vector ที่ส่งเข้ามา
        print(f"Input vector length: {len(vector)}")
        print(f"Input vector sample: {vector[:10]}...")
        
        # โค้ดที่เหลือเหมือนเดิม
        # ...
        # ตรวจสอบจำนวน vectors ในฐานข้อมูล
        check_query = text("SELECT COUNT(*) FROM narcotics_image_vectors")
        count_result = await db.execute(check_query)
        count = count_result.scalar_one()
        print(f"Database has {count} vectors stored")
        
        # ดึงข้อมูล vector จากฐานข้อมูล (ข้อมูลพื้นฐานก่อน)
        basic_query = text("""
            SELECT 
                id,
                narcotic_id,
                image_id
            FROM 
                narcotics_image_vectors
        """)
        
        basic_result = await db.execute(basic_query)
        basic_info = basic_result.mappings().all()
        
        print("\n==== VECTOR ENTRIES IN DATABASE ====")
        for v in basic_info:
            print(f"ID: {v['id']}, Narcotic ID: {v['narcotic_id']}, Image ID: {v['image_id']}")
        
        # แทนที่จะใช้ json_array_elements ให้ใช้ ::text โดยตรง
        vector_query = text("""
            SELECT 
                id,
                narcotic_id,
                image_id,
                image_vector::text as vector_text
            FROM 
                narcotics_image_vectors
        """)
        
        try:
            vector_result = await db.execute(vector_query)
            vector_data = vector_result.mappings().all()
            
            print("\n==== VECTOR VALUES ====")
            for v in vector_data:
                vector_text = v['vector_text']
                # แสดงรูปแบบ vector และตัดให้เหลือแค่ 100 ตัวอักษรแรก
                print(f"ID: {v['id']}, Narcotic ID: {v['narcotic_id']}")
                print(f"Vector (sample): {vector_text[:100]}...")
                
                # แปลง vector text เป็น Python list เพื่อแสดงค่าตัวเลข
                try:
                    # ลบวงเล็บ [] ที่ห่อหุ้มและแยกด้วย comma
                    vector_text = vector_text.strip('[]')
                    vector_values = [float(x) for x in vector_text.split(',')]
                    print(f"Vector first 10 elements: {vector_values[:10]}")
                    print(f"Vector length: {len(vector_values)}")
                except Exception as parse_err:
                    print(f"Could not parse vector values: {parse_err}")
        except Exception as e:
            print(f"Could not extract vector values: {e}")
            
            # แสดงค่า vector แบบแยกทีละรายการ
            for vid in [v['id'] for v in basic_info]:
                single_vector_query = text(f"""
                    SELECT 
                        id,
                        image_vector::text as vector_text
                    FROM 
                        narcotics_image_vectors
                    WHERE
                        id = {vid}
                """)
                
                try:
                    single_result = await db.execute(single_vector_query)
                    single_data = single_result.mappings().first()
                    if single_data:
                        vector_text = single_data['vector_text']
                        print(f"\nVector ID: {single_data['id']}")
                        print(f"Vector (first 100 chars): {vector_text[:100]}...")
                except Exception as inner_e:
                    print(f"Error getting vector {vid}: {inner_e}")
        
        # ทำการค้นหาตามปกติ
        vector_str = f"[{','.join(str(x) for x in vector)}]"
        
        # ใช้ string interpolation โดยตรงเพื่อแก้ปัญหา parameter binding
        query = text(f"""
            WITH query_vector AS (
                SELECT '{vector_str}'::vector AS v
            ),
            similarity_calc AS (
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
            )
            SELECT * FROM similarity_calc
            WHERE similarity > :threshold
        """)
        
        # ส่งทั้ง top_k และ threshold
        result = await db.execute(
            query, 
            {"top_k": top_k, "threshold": similarity_threshold}
        )
        rows = result.mappings().all()
        
        similar_items = []
        for row in rows:
            similar_items.append({
                "narcotic_id": row["narcotic_id"],
                "name": row["drug_type"] or f"ยาเสพติด #{row['narcotic_id']}",
                "drug_type": row["drug_type"],
                "drug_category": row["drug_category"],
                "description": row["description"],
                "similarity": float(row["similarity"])
            })
        
        return {"results": similar_items}
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error searching similar narcotics: {str(e)}")

@router.delete("/narcotics/{narcotic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_narcotic_by_id(
    narcotic_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a narcotic by its ID directly
    """
    success = await NarcoticService.delete_narcotic(db, narcotic_id)
    if not success:
        raise HTTPException(status_code=404, detail="Narcotic not found")
    return None