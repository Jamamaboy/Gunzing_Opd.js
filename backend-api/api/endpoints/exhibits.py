from fastapi import APIRouter, Depends, HTTPException, status, Body, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text
from sqlalchemy.future import select
from typing import List, Optional

from config.database import get_db
from config.cloudinary_config import upload_image_to_cloudinary
from schemas.exhibit import (
    Exhibit as ExhibitSchema,
    ExhibitCreate,
    ExhibitUpdate,
)
from schemas.firearm import (
    Firearm as FirearmSchema, 
    FirearmCreate, 
    FirearmUpdate,  # ✅ เพิ่ม import
    FirearmExampleImage as ImageSchema, 
    FirearmExampleImageCreate, 
    FirearmExampleImageBase
)
from services.exhibit_service import (
    get_exhibits,
    get_exhibit_by_id,
    get_exhibit_by_firearm_id,
    create_exhibit,
    update_exhibit,
    delete_exhibit,
)

from services.image_service import (
    get_images_by_exhibit_id,
    create_image,
    get_image_by_id,
    update_image,
    delete_image
)

router = APIRouter(tags=["exhibits"])

@router.get("/exhibits", response_model=List[ExhibitSchema])
async def read_exhibits(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None
):
    """
    Get all exhibits with their related firearms and images.
    Can filter by category.
    """
    exhibits = await get_exhibits(db)
    
    # Filter by category if specified
    if category:
        exhibits = [e for e in exhibits if e.category == category]
    
    # Apply pagination
    return exhibits[skip: skip + limit]

@router.get("/exhibits/{exhibit_id}", response_model=ExhibitSchema)
async def read_exhibit(exhibit_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific exhibit by ID with its related firearm and images
    """
    exhibit = await get_exhibit_by_id(db, exhibit_id)
    if exhibit is None:
        raise HTTPException(status_code=404, detail="Exhibit not found")
    return exhibit

@router.get("/exhibits/by-firearm/{firearm_id}", response_model=ExhibitSchema)
async def read_exhibit_by_firearm(firearm_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific exhibit by its associated firearm_id
    """
    exhibit = await get_exhibit_by_firearm_id(db, firearm_id)
    if exhibit is None:
        raise HTTPException(status_code=404, detail="Exhibit not found for the given firearm ID")
    return exhibit

@router.post("/exhibits", response_model=ExhibitSchema, status_code=status.HTTP_201_CREATED)
async def create_new_exhibit(
    exhibit: ExhibitCreate,
    firearm: Optional[FirearmCreate] = Body(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new exhibit with optional firearm data
    """
    exhibit_data = exhibit.model_dump()
    firearm_data = firearm.model_dump() if firearm else None
    
    new_exhibit = await create_exhibit(db, exhibit_data, firearm_data)
    return new_exhibit

@router.put("/exhibits/{exhibit_id}", response_model=ExhibitSchema)
async def update_existing_exhibit(
    exhibit_id: int,
    exhibit: ExhibitUpdate,
    firearm: Optional[FirearmUpdate] = Body(None),  # ✅ เปลี่ยนจาก FirearmCreate เป็น FirearmUpdate
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing exhibit and optionally its firearm data
    """
    # Check if exhibit exists
    existing_exhibit = await get_exhibit_by_id(db, exhibit_id)
    if existing_exhibit is None:
        raise HTTPException(status_code=404, detail="Exhibit not found")
    
    exhibit_data = {k: v for k, v in exhibit.model_dump().items() if v is not None}
    firearm_data = {k: v for k, v in firearm.model_dump().items() if v is not None} if firearm else None
    
    updated_exhibit = await update_exhibit(db, exhibit_id, exhibit_data, firearm_data)
    return updated_exhibit

@router.delete("/exhibits/{exhibit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_exhibit(exhibit_id: int, db: AsyncSession = Depends(get_db)):
    """
    Delete an exhibit and related data
    """
    success = await delete_exhibit(db, exhibit_id)
    if not success:
        raise HTTPException(status_code=404, detail="Exhibit not found")
    return None

# Image endpoints
@router.post("/exhibits/{exhibit_id}/images", response_model=ImageSchema)
async def upload_image(
    exhibit_id: int, 
    file: UploadFile = File(...),
    description: str = Form(""),
    priority: int = Form(0),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload an image for an exhibit and link it to the associated firearm
    """
    # 1. ตรวจสอบว่า exhibit มีอยู่จริงและมี firearm ที่เชื่อมโยงอยู่
    exhibit = await get_exhibit_by_id(db, exhibit_id)
    if not exhibit:
        raise HTTPException(status_code=404, detail="Exhibit not found")
    
    # 2. ดึง firearm_id จาก exhibit
    firearm_id = exhibit.get('firearm', {}).get('id')
    if not firearm_id:
        raise HTTPException(status_code=400, detail="Exhibit has no associated firearm")
    
    # 3. อัพโหลดรูปภาพไปยัง Cloudinary
    try:
        cloudinary_result = await upload_image_to_cloudinary(file)
        
        # 4. บันทึกข้อมูลรูปภาพลงในฐานข้อมูล โดยใช้ firearm_id แทน exhibit_id
        image_data = {
            "firearm_id": firearm_id,  # เปลี่ยนจาก exhibit_id เป็น firearm_id
            "image_url": cloudinary_result["secure_url"],
            "description": description,
            "priority": priority
        }
        
        image = await create_image(db, image_data)
        return image
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

@router.get("/exhibits/{exhibit_id}/images", response_model=List[ImageSchema])
async def get_exhibit_images(
    exhibit_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all images associated with an exhibit
    """
    # Check if exhibit exists
    exhibit = await get_exhibit_by_id(db, exhibit_id)
    if not exhibit:
        raise HTTPException(status_code=404, detail="Exhibit not found")
    
    images = await get_images_by_exhibit_id(db, exhibit_id)
    return images

@router.put("/exhibits/{exhibit_id}/images/{image_id}", response_model=ImageSchema)
async def update_exhibit_image(
    exhibit_id: int,
    image_id: int,
    image_data: FirearmExampleImageBase,
    db: AsyncSession = Depends(get_db)
):
    """
    Update image details (except the actual image file)
    """
    # Get exhibit first to find firearm_id
    exhibit = await get_exhibit_by_id(db, exhibit_id)
    if not exhibit:
        raise HTTPException(status_code=404, detail="Exhibit not found")
    
    firearm_id = exhibit.get('firearm', {}).get('id')
    if not firearm_id:
        raise HTTPException(status_code=400, detail="Exhibit has no associated firearm")
    
    # Check if image exists and belongs to the firearm
    image = await get_image_by_id(db, image_id)
    if not image or image.firearm_id != firearm_id:
        raise HTTPException(status_code=404, detail="Image not found for this exhibit")
    
    # Update only permitted fields
    update_data = image_data.model_dump()
    
    updated_image = await update_image(db, image_id, update_data)
    return updated_image

@router.delete("/exhibits/{exhibit_id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exhibit_image(
    exhibit_id: int,
    image_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an image from an exhibit (both from database and Cloudinary)
    """
    # Get exhibit first to find firearm_id
    exhibit = await get_exhibit_by_id(db, exhibit_id)
    if not exhibit:
        raise HTTPException(status_code=404, detail="Exhibit not found")
    
    firearm_id = exhibit.get('firearm', {}).get('id')
    if not firearm_id:
        raise HTTPException(status_code=400, detail="Exhibit has no associated firearm")
    
    # Check if image belongs to the firearm
    image = await get_image_by_id(db, image_id)
    if not image or image.firearm_id != firearm_id:
        raise HTTPException(status_code=404, detail="Image not found for this exhibit")
    
    success = await delete_image(db, image_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete image")
    return None

# เพิ่ม endpoint สำหรับลบภาพเดี่ยวโดยใช้ image_id โดยตรง
@router.delete("/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_image_by_id(
    image_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete an image by its ID (both from database and Cloudinary)
    """
    success = await delete_image(db, image_id)
    if not success:
        raise HTTPException(status_code=404, detail="Image not found")
    return None