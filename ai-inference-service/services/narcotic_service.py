import cv2
import os
import shutil
import tempfile

from ml_managers.ai_model_manager import get_model_manager
from services.vector_service import create_vector_embedding

def analyze_drug(cropped_image, temp_path=None):
    """
    วิเคราะห์ยาเสพติดและสร้าง vector
    
    Args:
        cropped_image: ภาพที่ตัดเฉพาะยาเสพติดบนพื้นขาว
        temp_path: path ชั่วคราวสำหรับบันทึกภาพ (optional)
        
    Returns:
        dict: ข้อมูลการวิเคราะห์ยาเสพติด
    """
    result = {"drug_type": "Unknown"}
    
    # บันทึกภาพไว้ชั่วคราวหากต้องการ
    if temp_path is not None:
        cv2.imwrite(temp_path, cropped_image)
        result["temp_path"] = temp_path
    
    # สร้าง vector จากภาพยาเสพติด
    try:
        vector_result = create_vector_embedding(
            cropped_image if temp_path is None else temp_path, 
            segment_first=False
        )
        
        # บันทึกข้อมูลจำนวนมิติของ vector
        vector_dimensions = vector_result.get("vector_dimension", 0)
        
        # เก็บข้อมูล vector แบบ base64
        result["vector_info"] = {
            "dimensions": vector_dimensions
        }
        # เพิ่ม vector_base64 แทนการส่ง vector เป็น JSON list
        result["vector_base64"] = vector_result.get("vector_base64")
    except Exception as e:
        print(f"Error creating drug vector: {str(e)}")
    
    return result
    
async def generate_narcotic_vector(file):
    """สร้าง vector embedding จากรูปภาพยาเสพติด"""
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp:
        shutil.copyfileobj(file.file, temp)
        temp_path = temp.name
    
    try:
        # เรียกใช้ vector_service เพื่อสร้าง embedding
        vector = create_vector_embedding(temp_path)
        return vector
    finally:
        os.unlink(temp_path)