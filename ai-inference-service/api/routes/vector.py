import base64
import numpy as np

from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from services.vector_service import VectorService, create_vector_embedding

router = APIRouter(tags=["vectors"])

vector_service = VectorService()

@router.post("/convert")
async def convert_image_to_vector(
    file: UploadFile = File(...),
    return_raw_vector: bool = Form(True),
    target_dim: int = Form(16000),
    segment_first: bool = Form(True)
):
    try:
        contents = await file.read()
        
        # ใช้ create_vector_embedding โดยตรง
        vector_result = create_vector_embedding(contents, segment_first=segment_first)
        
        # เปลี่ยนรูปแบบการส่งคืนข้อมูลเป็น base64
        response = {
            "status": "success",
            "filename": file.filename,
            "vector_info": {
                "dimensions": vector_result.get("vector_dimension", 0),
                # ไม่ส่ง vector เป็น JSON array อีกต่อไป
            },
            "vector_base64": vector_result.get("vector_base64"),
            "segmentation_info": vector_result.get("segmentation_result", {})
        }
        
        # ตรวจสอบมิติของ vector
        if response["vector_info"]["dimensions"] != target_dim:
            print(f"Warning: Vector dimension mismatch. Expected {target_dim}, got {response['vector_info']['dimensions']}")
        
        return response
    except Exception as e:
        print(f"Error in convert_image_to_vector: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@router.post("/similarity")
async def calculate_image_similarity(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
    normalize: bool = Form(True)
):
    """
    คำนวณความคล้ายคลึงระหว่างรูปภาพสองรูป
    
    - **file1**: รูปภาพที่ 1
    - **file2**: รูปภาพที่ 2
    - **normalize**: ต้องการ normalize vector หรือไม่ (default: True)
    
    Returns:
        - similarity: ค่าความคล้ายคลึง (0-1)
    """
    try:
        contents1 = await file1.read()
        contents2 = await file2.read()
        
        vector1 = vector_service.image_to_vector(contents1, normalize)
        vector2 = vector_service.image_to_vector(contents2, normalize)
        
        similarity = vector_service.calculate_similarity(vector1, vector2)
        
        return {
            "status": "success",
            "similarity": round(similarity, 4),
            "file1": file1.filename,
            "file2": file2.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating similarity: {str(e)}")