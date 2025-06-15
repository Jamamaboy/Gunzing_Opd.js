from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
import base64
import numpy as np

from config.database import get_db
from models.narcotic import Narcotic, NarcoticExampleImage, NarcoticImageVector
from services.ai_image_search import get_ai_image_search_service, AIImageSearchService

router = APIRouter(tags=["image_search"])

@router.post("/narcotics/search-by-image")
async def search_narcotics_by_image(
    file: UploadFile = File(...),
    top_k: int = Query(5, description="จำนวนผลลัพธ์ที่ต้องการ"),
    threshold: float = Query(0.6, description="ค่าความคล้ายขั้นต่ำ (0-1)"),
    db: AsyncSession = Depends(get_db),
    ai_service: AIImageSearchService = Depends(get_ai_image_search_service)
):
    """
    ค้นหายาเสพติดโดยใช้รูปภาพ:
    1. ทำ segmentation เพื่อแยกส่วนที่เป็นยาเสพติด
    2. แปลงเป็น vector
    3. ค้นหาในฐานข้อมูล
    """
    try:
        # 1. ส่งรูปภาพไปทำ segmentation
        segment_result = await ai_service.segment_drug_image(file)
        
        # ตรวจสอบว่าพบยาเสพติดหรือไม่
        drug_objects = [obj for obj in segment_result.get("objects", []) 
                       if obj.get("class") in ["Drug", "drug", "narcotic", "Narcotic"]]
        
        if not drug_objects:
            return {
                "success": False,
                "message": "ไม่พบยาเสพติดในรูปภาพ",
                "results": []
            }
        
        # 2. แปลงรูปภาพเป็น vector
        vector_result = await ai_service.convert_to_vector(file)
        
        if not vector_result or "vector_base64" not in vector_result:
            raise HTTPException(status_code=500, detail="ไม่สามารถสร้าง vector จากรูปภาพได้")
        
        # แปลง vector จาก base64 เป็น numpy array
        vector_bytes = base64.b64decode(vector_result["vector_base64"])
        search_vector = np.frombuffer(vector_bytes, dtype=np.float32)
        
        # 3. ค้นหา vector ที่คล้ายคลึงในฐานข้อมูล
        cosine_similarity = func.text("1 - (image_vector <=> :search_vector)")
        
        # สร้าง subquery
        subq = (
            select(
                NarcoticImageVector.narcotic_id,
                NarcoticImageVector.image_id,
                cosine_similarity.label("similarity")
            )
            .where(cosine_similarity > threshold)
            .order_by(func.text("similarity").desc())
            .limit(top_k)
            .params(search_vector=search_vector.tolist())
            .subquery()
        )
        
        # สร้าง query หลัก
        query = (
            select(
                Narcotic.id.label("narcotic_id"),
                Narcotic.drug_type,
                Narcotic.drug_category,
                Narcotic.characteristics,
                NarcoticExampleImage.id.label("image_id"),
                NarcoticExampleImage.image_url,
                subq.c.similarity
            )
            .join(subq, Narcotic.id == subq.c.narcotic_id)
            .join(NarcoticExampleImage, NarcoticExampleImage.id == subq.c.image_id)
            .order_by(subq.c.similarity.desc())
        )
        
        # ดึงข้อมูล
        result = await db.execute(query)
        similar_items = result.mappings().all()
        
        # แปลงผลลัพธ์
        results = []
        for item in similar_items:
            result_item = {
                "narcotic_id": item["narcotic_id"],
                "drug_type": item["drug_type"],
                "drug_category": item["drug_category"],
                "characteristics": item["characteristics"],
                "image": {
                    "id": item["image_id"],
                    "url": item["image_url"]
                },
                "similarity": round(float(item["similarity"]), 4)
            }
            
            # ดึงข้อมูลเพิ่มเติม
            drug_query = select(Narcotic).filter(Narcotic.id == item["narcotic_id"])
            drug_result = await db.execute(drug_query)
            narcotic = drug_result.scalars().first()
            
            if narcotic:
                if hasattr(narcotic, "drug_form") and narcotic.drug_form:
                    result_item["drug_form"] = {
                        "id": narcotic.drug_form.id,
                        "name": narcotic.drug_form.name
                    }
                
                if hasattr(narcotic, "pill_info") and narcotic.pill_info:
                    result_item["pill_info"] = {
                        "color": narcotic.pill_info.color,
                        "diameter_mm": narcotic.pill_info.diameter_mm,
                        "thickness_mm": narcotic.pill_info.thickness_mm,
                        "edge_shape": narcotic.pill_info.edge_shape
                    }
            
            results.append(result_item)
        
        # ส่งผลลัพธ์
        return {
            "success": True,
            "message": f"พบยาเสพติดที่คล้ายคลึง {len(results)} รายการ",
            "query_image": file.filename,
            "results_count": len(results),
            "results": results
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"เกิดข้อผิดพลาดในการค้นหา: {str(e)}"
        )