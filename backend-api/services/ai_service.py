import os
import httpx
from fastapi import UploadFile, HTTPException
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

AI_SERVICE_URL = os.environ.get("AI_SERVICE_URL", "https://ai-inference-service--qfsm91q.ashyisland-0d4cc8a1.australiaeast.azurecontainerapps.io")

class AIService:
    def __init__(self, base_url: str = AI_SERVICE_URL):
        self.base_url = base_url
        self.timeout = 60

    async def analyze_evidence(self, file: UploadFile, db: AsyncSession = None) -> Dict[str, Any]:
        """วิเคราะห์รูปภาพและค้นหาข้อมูลที่คล้ายคลึงถ้าเป็นยาเสพติด"""
        try:
            file_content = await file.read()
            file.file.seek(0)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                files = {"image": (file.filename, file_content, file.content_type)}
                response = await client.post(f"{self.base_url}/api/analyze", files=files)
                
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail="Error analyzing evidence")
                
                result = response.json()
                
                if db and result.get("detectionType") == "drug" and "drugs" in result:
                    for drug_obj in result["drugs"]:
                        if "vector" in drug_obj:
                            similar_narcotics = await self.find_similar_narcotics_by_vector(
                                drug_obj["vector"], db, top_k=3
                            )
                            
                            drug_obj["similar_narcotics"] = similar_narcotics
                
                return result
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error analyzing evidence: {str(e)}")
    
    async def find_similar_narcotics_by_vector(
            self, vector_data, db: AsyncSession, top_k: int = 3
        ) -> List[Dict[str, Any]]:
        """ค้นหายาเสพติดที่มีลักษณะใกล้เคียงจาก vector"""
        try:
            stmt = text("""
                SELECT 
                    n.id as narcotic_id,
                    n.name as narcotic_name,
                    1 - (niv.image_vector <=> :query_vector) as similarity
                FROM 
                    narcotics_image_vectors niv
                JOIN 
                    narcotics n ON niv.narcotic_id = n.id
                ORDER BY 
                    niv.image_vector <=> :query_vector
                LIMIT :top_k
            """)
            
            # Execute query
            result = await db.execute(
                stmt, 
                {"query_vector": vector_data, "top_k": top_k}
            )
            rows = result.mappings().all()
            
            # Format results
            similar_items = []
            for row in rows:
                similar_items.append({
                    "narcotic_id": row["narcotic_id"],
                    "name": row["narcotic_name"],
                    "similarity": float(row["similarity"])
                })
                
            return similar_items
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error searching for similar narcotics: {str(e)}")