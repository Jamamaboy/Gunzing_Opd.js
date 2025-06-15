import os
import httpx
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any
import logging
import time

logger = logging.getLogger(__name__)
router = APIRouter(tags=["inference"])

ML_SERVICE_URL = "https://ai-inference-service--qfsm91q.ashyisland-0d4cc8a1.australiaeast.azurecontainerapps.io"

@router.post("/analyze", response_model=Dict[str, Any])
async def analyze_image(image: UploadFile = File(...)):
    """
    ส่งรูปภาพไปวิเคราะห์ด้วย AI Inference Service
    """
    start_time = time.time()
    logger.info(f"Starting image analysis for file: {image.filename}")
    
    try:
        file_content = await image.read()
        logger.info(f"File read completed. Size: {len(file_content)} bytes")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            logger.info(f"Preparing request to AI service at: {ML_SERVICE_URL}")
            
            headers = {
                "Accept": "application/json",
                "User-Agent": "Backend-API/1.0"
            }
            
            logger.info("Sending request to AI service...")
            try:
                response = await client.post(
                    f"{ML_SERVICE_URL}/api/analyze",
                    files={"image": (image.filename, file_content)},
                    headers=headers,
                    timeout=30.0
                )
                logger.info(f"Received response from AI service. Status: {response.status_code}")
                
            except httpx.TimeoutException as timeout_exc:
                logger.error(f"Request to AI service timed out after 30 seconds: {str(timeout_exc)}")
                raise HTTPException(
                    status_code=504,
                    detail="AI service request timed out after 30 seconds"
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
            return response.json()
            
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