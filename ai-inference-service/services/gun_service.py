import cv2
from ml_managers.ai_model_manager import get_model_manager
from utils.image_utils import crop_mask_on_white
from utils.prediction_utils import get_top3

def analyze_gun_brand(cropped_image):
    """
    วิเคราะห์ยี่ห้อปืนจากภาพที่ตัดมา
    
    Args:
        cropped_image: ภาพที่ตัดเฉพาะปืนบนพื้นขาว
        
    Returns:
        dict: ข้อมูลยี่ห้อปืนและความมั่นใจ
    """
    # รับโมเดลจาก ModelManager
    model_manager = get_model_manager()
    model_brand = model_manager.get_brand_model()
    
    if model_brand is None:
        return {"selected_brand": "Unknown", "brand_top3": []}
    
    # ทำนายยี่ห้อ
    pred_brand = model_brand(cropped_image)[0]
    brand_top3 = get_top3(pred_brand, model_brand.names)
    selected_brand = brand_top3[0]['label'] if brand_top3 else "Unknown"
    
    return {
        "selected_brand": selected_brand,
        "brand_top3": brand_top3
    }

def analyze_gun_model(cropped_image, brand_name):
    """
    วิเคราะห์รุ่นปืนจากภาพที่ตัดมาและยี่ห้อ
    
    Args:
        cropped_image: ภาพที่ตัดเฉพาะปืนบนพื้นขาว
        brand_name: ชื่อยี่ห้อปืน
        
    Returns:
        dict: ข้อมูลรุ่นปืนและความมั่นใจ
    """
    # รับโมเดลจาก ModelManager
    model_manager = get_model_manager()
    model_model = model_manager.get_brand_specific_model(brand_name)
    
    # ถ้าไม่มีโมเดลสำหรับยี่ห้อนี้
    if model_model is None:
        return {"selected_model": "Unknown", "model_top3": []}
    
    # ใช้โมเดลเฉพาะยี่ห้อเพื่อทำนายรุ่น
    pred_model = model_model(cropped_image)[0]
    model_top3 = get_top3(pred_model, model_model.names)
    selected_model = model_top3[0]['label'] if model_top3 else "Unknown"
    
    return {
        "selected_model": selected_model,
        "model_top3": model_top3
    }