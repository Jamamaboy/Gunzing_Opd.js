import httpx
import base64
import json
import numpy as np
from io import BytesIO
from fastapi import UploadFile, HTTPException
from core.config import get_ml_service_url

class AIImageSearchService:
    def __init__(self):
        self.ai_service_url = get_ml_service_url()
    
    async def segment_drug_image(self, file: UploadFile):
        """ทำ segmentation เพื่อแยกส่วนที่เป็นยาเสพติด"""
        try:
            content = await file.read()
            await file.seek(0)
            
            files = {'file': (file.filename, content, file.content_type)}
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.ai_service_url}/api/segment",
                    files=files
                )
            
            return response.json()
        except httpx.RequestError as e:
            print(f"Connection error to AI Service: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Cannot connect to AI Service: {str(e)}")
        except Exception as e:
            print(f"General error in segmentation: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error in segmentation: {str(e)}")
    
    async def convert_to_vector(self, file: UploadFile):
        """แปลงรูปภาพเป็น vector"""
        try:
            content = await file.read()
            await file.seek(0)
            
            files = {'file': (file.filename, content, file.content_type)}
            form_data = {
                'normalize': 'true',
                'return_raw_vector': 'false',
                'target_dim': '16000'
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.ai_service_url}/api/vectors/convert",
                    files=files,
                    data=form_data
                )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"AI Service error: {response.text}")
            
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error in vector conversion: {str(e)}")

ai_image_search_service = AIImageSearchService()

def get_ai_image_search_service():
    return ai_image_search_service