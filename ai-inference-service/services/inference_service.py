import os
import cv2
import traceback
import tempfile
import logging
import base64
from ml_managers.ai_model_manager import get_model_manager
from services.gun_service import analyze_gun_brand, analyze_gun_model
from services.narcotic_service import analyze_drug
from services.image_service import segment_image
from utils.image_utils import save_temp_image

# Get logger
logger = logging.getLogger(__name__)

def process_image_with_gun_models(image_path):
    """
    ฟังก์ชันหลักสำหรับประมวลผลภาพด้วยโมเดลปืนและยาเสพติด
    """
    logger.info(f"Processing image: {image_path}")
    image = cv2.imread(image_path)
    if image is None:
        logger.error(f"Could not read image at {image_path}")
        return {"error": f"Could not read image at {image_path}"}
    
    logger.info("Segmenting image")
    _, segmented_objects = segment_image(image)
    
    processed_objects = []
    temp_files = []
    
    # ✅ เพิ่มตัวแปรเก็บภาพที่ crop แล้วจากการ segment หลัก
    main_cropped_images = {}
    
    for obj in segmented_objects:
        logger.info(f"Processing object: {obj['class_name']} (confidence: {obj['confidence']})")
        temp_path = save_temp_image(obj["cropped_image"], image_path, obj["index"], obj["class_name"])
        temp_files.append(temp_path)
        
        # ✅ แปลงภาพที่ crop แล้วเป็น base64
        _, buffer = cv2.imencode('.jpg', obj["cropped_image"])
        cropped_image_base64 = base64.b64encode(buffer).decode('utf-8')
        cropped_image_data_url = f"data:image/jpeg;base64,{cropped_image_base64}"
        
        obj_data = {
            "object_index": obj["index"],
            "class": obj["class_name"],
            "confidence": obj["confidence"],
            "cropped_path": temp_path,
            "cropped_image_base64": cropped_image_base64,  # ✅ เพิ่มภาพ base64
            "cropped_image_data_url": cropped_image_data_url  # ✅ เพิ่ม data URL
        }
        
        # ✅ เก็บภาพหลักสำหรับแต่ละประเภท
        if obj["class_name"] in ['Drug', 'PackageDrug']:
            main_cropped_images['drug'] = cropped_image_data_url
        elif obj["class_name"] in ['BigGun', 'Pistol', 'Revolver']:
            main_cropped_images['gun'] = cropped_image_data_url
        
        if obj["class_name"] in ['BigGun', 'Pistol', 'Revolver']:
            logger.info(f"Analyzing gun brand for {obj['class_name']}")
            brand_info = analyze_gun_brand(obj["cropped_image"])
            obj_data.update(brand_info)
            
            if brand_info["selected_brand"] != "Unknown":
                logger.info(f"Analyzing gun model for brand: {brand_info['selected_brand']}")
                model_info = analyze_gun_model(obj["cropped_image"], brand_info["selected_brand"])
                obj_data.update(model_info)
        
        elif obj["class_name"] in ['Drug', 'PackageDrug']:
            logger.info(f"Analyzing drug: {obj['class_name']}")
            drug_info = analyze_drug(obj["cropped_image"], temp_path)
            obj_data.update(drug_info)
        
        processed_objects.append(obj_data)
    
    for temp_file in temp_files:
        if os.path.exists(temp_file):
            os.remove(temp_file)
    
    logger.info(f"Processing complete. Found {len(processed_objects)} objects")
    
    # ✅ เพิ่มภาพที่ crop แล้วใน response
    result = {
        "original_image": image_path,
        "detected_objects": processed_objects,
        "main_cropped_images": main_cropped_images  # ✅ เพิ่มภาพหลักที่ตัดแล้ว
    }
    
    return result

async def analyze_image_service(image_path: str):
    """
    บริการวิเคราะห์รูปภาพสำหรับทั้งยาเสพติดและอาวุธ
    """
    try:
        logger.info(f"Starting image analysis for: {image_path}")
        
        model_manager = get_model_manager()
        
        if model_manager.get_segmentation_model() is not None:
            logger.info("Using segment model for analysis")
            result = process_image_with_gun_models(image_path)
            
            gun_classes = ['BigGun', 'Pistol', 'Revolver']
            gun_objects = [obj for obj in result["detected_objects"] if obj["class"] in gun_classes]
            drug_objects = [obj for obj in result["detected_objects"] if obj["class"] in ["Drug", "PackageDrug"]]
            other_objects = [obj for obj in result["detected_objects"] 
                            if obj["class"] not in gun_classes + ["Drug", "PackageDrug"]]
            
            if gun_objects:
                logger.info("Detected firearm objects")
                result["detectionType"] = "firearm"
                result["primaryObjects"] = gun_objects
                result["secondaryObjects"] = other_objects
                
            elif drug_objects:
                logger.info("Detected drug objects")
                result["detectionType"] = "narcotic"
            else:
                logger.info("No specific objects detected")
                result["detectionType"] = "unknown"
                result["primaryObjects"] = other_objects
            
            return result
        else:
            logger.error("Gun models not loaded")
            return {
                "detectionType": "unknown",
                "error": "Detection models not loaded",
                "message": "Cannot analyze image because required models are not available"
            }
            
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        raise Exception(f"Failed to process image: {str(e)}")

async def detect_realtime_service(image_data, mode=None):
    """
    บริการตรวจจับแบบเรียลไทม์สำหรับการใช้งานผ่านกล้อง
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp:
        temp_path = temp.name
        temp.write(image_data)
    
    try:
        model_manager = get_model_manager()
        weapon_model = model_manager.get_weapon_model()
        
        if mode == "fast" and weapon_model:
            image = cv2.imread(temp_path)
            results = weapon_model(image)[0]
            
            detections = []
            for i, box in enumerate(results.boxes):
                cls_id = int(box.cls[0].item())
                cls_name = results.names[cls_id]
                confidence = float(box.conf[0].item())
                
                if confidence > 0.3:
                    detections.append({
                        "class": cls_name,
                        "confidence": round(confidence, 2)
                    })
            
            return {
                "mode": "fast",
                "detections": detections
            }
        else:
            result = await analyze_image_service(temp_path)
            
            simplified = {
                "mode": "accurate",
                "detectionType": result.get("detectionType", "unknown"),
                "detections": []
            }
            
            primary = result.get("primaryObjects", [])
            secondary = result.get("secondaryObjects", [])
            
            for obj in primary + secondary:
                simplified["detections"].append({
                    "class": obj["class"],
                    "confidence": obj["confidence"],
                    "selected_brand": obj.get("selected_brand") if "selected_brand" in obj else None,
                    "selected_model": obj.get("selected_model") if "selected_model" in obj else None
                })
            
            return simplified
    
    except Exception as e:
        print(f"Error in real-time detection: {e}")
        return {"error": str(e)}
    
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)