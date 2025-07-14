import cv2
import numpy as np
import os
import tempfile
import uuid
from typing import Union, List, Tuple

def crop_mask_on_white(img: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """
    ตัดวัตถุตาม mask และวางบนพื้นหลังสีขาว
    
    Args:
        img: รูปภาพต้นฉบับ (numpy array)
        mask: mask ของวัตถุ (numpy array)
        
    Returns:
        numpy array: รูปภาพที่ตัดแล้ว
    """
    # Resize mask ให้ตรงกับ shape ของ image
    if mask.shape != img.shape[:2]:
        mask = cv2.resize(mask.astype(np.uint8), (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)

    white_bg = np.ones_like(img) * 255
    mask = mask.astype(bool)

    # Apply mask to each channel
    for c in range(3):
        white_bg[:, :, c][mask] = img[:, :, c][mask]
    return white_bg

def save_temp_image(image: np.ndarray, prefix: str, index: int, class_name: str) -> str:
    """
    บันทึกรูปภาพชั่วคราว
    
    Args:
        image: รูปภาพที่จะบันทึก
        prefix: คำนำหน้าชื่อไฟล์
        index: ลำดับ
        class_name: ชื่อประเภท
        
    Returns:
        str: พาธของไฟล์ที่บันทึก
    """
    temp_path = f"{prefix}_crop_{index}_{class_name}.jpg"
    cv2.imwrite(temp_path, image)
    return temp_path

def get_top3(pred, class_names) -> List[dict]:
    """
    รับค่าความน่าจะเป็น top 3 จาก prediction
    
    Args:
        pred: ผลลัพธ์จากโมเดล
        class_names: dictionary ของชื่อคลาส
        
    Returns:
        List[dict]: รายการของ top 3 predictions
    """
    probs = pred.probs.data.cpu().numpy()
    top3 = probs.argsort()[-3:][::-1]
    return [{"label": class_names[i], "confidence": round(float(probs[i]), 2)} for i in top3]