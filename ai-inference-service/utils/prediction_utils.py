from typing import List, Dict, Any
import numpy as np

def get_top3(pred, class_names) -> List[Dict[str, Any]]:
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