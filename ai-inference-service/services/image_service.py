import cv2
import numpy as np
from ml_managers.ai_model_manager import get_model_manager
from utils.image_utils import crop_mask_on_white

def segment_image(image):
    """
    ทำการแบ่งส่วนภาพและระบุประเภทวัตถุ
    
    Args:
        image: ภาพในรูปแบบ numpy array (BGR)
        
    Returns:
        results: ผลลัพธ์จาก model_segment
        segmented_objects: list ของอ็อบเจ็กต์ที่แบ่งส่วนเสร็จแล้ว
    """
    # รับโมเดลและคลาสจาก ModelManager
    model_manager = get_model_manager()
    model_segment = model_manager.get_segmentation_model()
    segment_classes = model_manager.get_segment_classes()
    
    if model_segment is None:
        return None, []
    
    # ประมวลผลภาพด้วยโมเดล segmentation
    results = model_segment(image)[0]
    
    segmented_objects = []
    
    # วนลูปผ่านแต่ละ mask
    for i, mask in enumerate(results.masks.data):
        cls_id = int(results.boxes.cls[i].item())
        confidence = float(results.boxes.conf[i].item())
        cls_name = segment_classes.get(cls_id, "Unknown")
        
        # สร้างภาพที่ตัดเฉพาะส่วนที่ต้องการบนพื้นขาว
        cropped = crop_mask_on_white(image, mask.cpu().numpy())
        
        segmented_objects.append({
            "index": i,
            "class_id": cls_id,
            "class_name": cls_name,
            "confidence": round(confidence, 3),
            "mask": mask.cpu().numpy(),
            "cropped_image": cropped
        })
    
    return results, segmented_objects