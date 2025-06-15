from fastapi import APIRouter, UploadFile, File
from services.vector_service import create_vector_embedding
import tempfile
import os
import shutil

router = APIRouter()

@router.post("/generate-vector")
async def generate_vector_endpoint(file: UploadFile = File(...)):
    """สร้าง vector embedding จากรูปภาพยาเสพติด"""
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp:
        shutil.copyfileobj(file.file, temp)
        temp_path = temp.name
    
    try:
        vector = create_vector_embedding(temp_path)
        return {"vector": vector, "dimensions": len(vector) if vector else 0}
    finally:
        os.unlink(temp_path)