import os
import httpx
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any
import logging
import time
from core.config import get_ai_service_url

logger = logging.getLogger(__name__)
router = APIRouter(tags=["inference"])

@router.post("/analyze", response_model=Dict[str, Any])
async def analyze_image(image: UploadFile = File(...)):
    """
    ส่งรูปภาพไปวิเคราะห์ด้วย AI Inference Service
    """
    # Get AI service URL from config
    ai_service_url = get_ai_service_url()
    
    start_time = time.time()
    logger.info(f"Starting image analysis for file: {image.filename}")
    logger.info(f"Using AI service URL: {ai_service_url}")
    
    try:
        file_content = await image.read()
        logger.info(f"File read completed. Size: {len(file_content)} bytes")
        
        # เพิ่ม timeout เป็น 120 วินาที สำหรับการวิเคราะห์ยาเสพติดที่ใช้เวลานาน
        async with httpx.AsyncClient(timeout=120.0) as client:
            logger.info(f"Preparing request to AI service at: {ai_service_url}")
            
            headers = {
                "Accept": "application/json",
                "User-Agent": "Backend-API/1.0"
            }
            
            logger.info("Sending request to AI service...")
            try:
                response = await client.post(
                    f"{ai_service_url}/api/analyze",
                    files={"image": (image.filename, file_content, image.content_type)},
                    headers=headers,
                    timeout=120.0  # เพิ่ม timeout
                )
                logger.info(f"Received response from AI service. Status: {response.status_code}")
                
            except httpx.TimeoutException as timeout_exc:
                logger.error(f"Request to AI service timed out after 120 seconds: {str(timeout_exc)}")
                raise HTTPException(
                    status_code=504,
                    detail="AI service request timed out after 120 seconds"
                )
            except httpx.ConnectError as conn_exc:
                logger.error(f"Failed to connect to AI service: {str(conn_exc)}")
                raise HTTPException(
                    status_code=503,
                    detail=f"Could not connect to AI service: {str(conn_exc)}"
                )
            
            if response.status_code != 200:
                logger.error(f"AI service returned error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"AI service returned an error: {response.text}"
                )
            
            logger.info("Successfully received response from AI service")
            end_time = time.time()
            logger.info(f"Total processing time: {end_time - start_time:.2f} seconds")
            
            # Log response สำหรับ debug
            response_data = response.json()
            logger.info(f"Response data keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Not a dict'}")
            
            return response_data
            
    except httpx.RequestError as exc:
        logger.error(f"Request to AI service failed: {str(exc)}")
        raise HTTPException(
            status_code=503, 
            detail=f"AI service unavailable: {str(exc)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error during image analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )