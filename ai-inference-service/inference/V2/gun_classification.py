import os
import cv2
import torch
import json
import pathlib
import numpy as np
import pandas as pd
import torch.nn.functional as F
import torchvision.transforms as transforms
from PIL import Image
from pathlib import Path
from ultralytics import YOLO

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(os.path.dirname(current_dir))

# 📁 Path หลักของ Model ต่าง ๆ
path_model_5MSegment = os.path.join(backend_dir, "model", "Model V2", "5M_Segment", "best_v8.pt")
path_model_CLS_Brand = os.path.join(backend_dir, "model", "Model V2", "Model-CLS-Brand V1", "best.pt")
path_model_CLS_MGUN = os.path.join(backend_dir, "model", "Model V2", "Model-CLS-MGun-V1")
path_model_CLS_MGUN = Path(path_model_CLS_MGUN)

# เพิ่ม path ของ model สำหรับ narcotics
narcotic_model_path = os.path.join(backend_dir, "model", "Model V2", "Narcotics", "best.pt")
model_narcotic = YOLO(narcotic_model_path)

# ✅ Dictionary ของชื่อแบรนด์ (index -> brand)
brand_map = {
    0: 'BERETTA', 1: 'CZ', 2: 'Colt', 3: 'GLOCK', 4: 'Kimber', 5: 'LES BAER',
    6: 'Mauser', 7: 'Norinco', 8: 'SIG', 9: 'Smith & wesson', 10: 'Sphinx', 11: 'Walther'
}

# 🔍 สร้าง mapping จากชื่อแบรนด์ → ชื่อโฟลเดอร์
def find_model_path_for_brand(brand_name):
    for folder in path_model_CLS_MGUN.iterdir():
        if folder.is_dir() and brand_name.lower() in folder.name.lower():
            model_path = folder / "best.pt"
            if model_path.exists():
                return str(model_path)
    return None

# ✅ สร้าง DataFrame
records = []
for idx, brand in brand_map.items():
    path = find_model_path_for_brand(brand)
    if path:
        records.append({"index": idx, "brand": brand, "path": path})

df_models = pd.DataFrame(records)

# ===== Load Models =====
model_segment = YOLO(path_model_5MSegment)
model_brand = YOLO(path_model_CLS_Brand)
model_map = {row['brand']: YOLO(row['path']) for _, row in df_models.iterrows()}

# ===== Class Map from Segment =====
segment_classes = {0: 'BigGun', 1: 'Bullet', 2: 'Drug', 3: 'Magazine', 4: 'PackageDrug', 5: 'Pistol', 6: 'Revolver'}

# ===== Utils =====
def crop_mask_on_white(img, mask):
    # Resize mask ให้ตรงกับ shape ของ image
    if mask.shape != img.shape[:2]:
        mask = cv2.resize(mask.astype(np.uint8), (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)

    white_bg = np.ones_like(img) * 255
    mask = mask.astype(bool)

    # Apply mask to each channel
    for c in range(3):
        white_bg[:, :, c][mask] = img[:, :, c][mask]
    return white_bg

def get_top3(pred, class_names):
    probs = pred.probs.data.cpu().numpy()
    top3 = probs.argsort()[-3:][::-1]
    return [{"label": class_names[i], "confidence": round(float(probs[i]), 2)} for i in top3]

# ฟังก์ชันสำหรับสร้าง vector จากภาพ (จาก pill_classification.py)
def image_to_vector(image):
    """
    สร้าง feature vector จากภาพโดยใช้ backbone ของ YOLO model
    
    Args:
        image: ภาพในรูปแบบ OpenCV (numpy array), PIL Image หรือ path ไปยังไฟล์ภาพ
    
    Returns:
        PyTorch tensor ของ feature vector
    """
    if model_narcotic is None:
        return None
    
    # ถ้า image เป็น string (path) เปิดไฟล์ก่อน
    if isinstance(image, str):
        try:
            image = Image.open(image).convert("RGB")
        except Exception as e:
            print(f"Error opening image file: {e}")
            return None
    
    # แปลง OpenCV image เป็น PIL image ถ้าจำเป็น
    if isinstance(image, np.ndarray):
        image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    
    transform = transforms.Compose([
        transforms.Resize((640, 640)),
        transforms.ToTensor(),
    ])
    
    tensor = transform(image).unsqueeze(0)
    
    with torch.no_grad():
        # ใช้ backbone ของ YOLO model (ตัดส่วนสุดท้ายที่เป็น classifier ออก)
        backbone = model_narcotic.model.model[:-1]
        features = backbone(tensor)
        vector = features.view(features.size(0), -1)
    
    return vector[0]

# ฟังก์ชันหาภาพที่คล้ายคลึง (จาก pill_classification.py)
def find_similar_drugs(drug_vector, database, top_k=5):
    if drug_vector is None or len(database) == 0:
        return []
    
    results = []
    
    for drug_id, drug_data in database.items():
        if "vector" in drug_data:
            db_vector = torch.tensor(drug_data["vector"])
            similarity = F.cosine_similarity(drug_vector.unsqueeze(0), db_vector.unsqueeze(0)).item()
            results.append({
                "id": drug_id,
                "similarity": round(similarity, 4),
                "path": drug_data.get("path", ""),
                "name": drug_data.get("name", "Unknown")
            })
    
    # เรียงตามความคล้ายคลึงจากมากไปน้อย
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:top_k]

# ===== Drug Database =====
# ตัวอย่าง drug database (ควรจะโหลดจากไฟล์หรือฐานข้อมูลจริง)
drug_database = {
    "drug_id1": {"vector": image_to_vector("C:/Users/Kawee Lekmuenwai/University/TU/Years 3/S2/SF340/V2/version_1.2.0 - Copy - Copy/ai-inference-service/โดเรม่อน.png").tolist(), "path": "C:/Users/Kawee Lekmuenwai/University/TU/Years 3/S2/SF340/V2/version_1.2.0 - Copy - Copy/ai-inference-service/โดเรม่อน.png", "name": "Doraemon"},
    "drug_id2": {"vector": image_to_vector("C:/Users/Kawee Lekmuenwai/University/TU/Years 3/S2/SF340/V2/version_1.2.0 - Copy - Copy/frontend/public/Img/ยาเสพติด/Siam Bheasach Red Capsule.png").tolist(), "path": "C:/Users/Kawee Lekmuenwai/University/TU/Years 3/S2/SF340/V2/version_1.2.0 - Copy - Copy/frontend/public/Img/ยาเสพติด/Siam Bheasach Red Capsule.png", "name": "Red Capsule"},
}

# ===== Main pipeline =====
def process_image(image_path):
    image = cv2.imread(image_path)

    if image is None:
        return {
            "error": f"Failed to load image from {image_path}. Please ensure it's a valid image file.",
            "original_image": image_path,
            "detected_objects": []
        }
    
    results = model_segment(image)[0]

    objects = []

    for i, mask in enumerate(results.masks.data):
        cls_id = int(results.boxes.cls[i].item())
        cls_name = segment_classes.get(cls_id, "Unknown")

        confidence = float(results.boxes.conf[i].item())
        confidence_percent = round(confidence, 2)

        # Create cropped object on white background
        cropped = crop_mask_on_white(image, mask.cpu().numpy())
        crop_path = f"cropped_object_{i}_{cls_name}.jpg"
        cv2.imwrite(crop_path, cropped)

        obj_data = {
            "object_index": i,
            "class": cls_name,
            "confidence": confidence_percent,
            "cropped_path": crop_path
        }

        if cls_name in ['GUN', 'Pistol']:
            pred_brand = model_brand(cropped)[0]
            brand_top3 = get_top3(pred_brand, model_brand.names)
            selected_brand = brand_top3[0]['label']
            obj_data["brand_top3"] = brand_top3
            obj_data["selected_brand"] = selected_brand

            if selected_brand in model_map:
                model_model = model_map[selected_brand]
                pred_model = model_model(cropped)[0]
                model_top3 = get_top3(pred_model, model_model.names)
                selected_model = model_top3[0]['label']
                obj_data["model_top3"] = model_top3
                obj_data["selected_model"] = selected_model
            else:
                obj_data["model_top3"] = []
                obj_data["selected_model"] = "Unknown"
            
            objects.append(obj_data)

        elif cls_name in ['Drug']:
            if model_narcotic:
                # pred_drug = model_narcotic(cropped)[0]
                # drug_top3 = get_top3(pred_drug, model_narcotic.names)
                # obj_data["drug_top3"] = drug_top3
                # obj_data["selected_drug"] = drug_top3[0]['label']

                drug_vector = image_to_vector(cropped)
                if drug_vector is not None:
                    if len(drug_database) > 0:
                        similar_drugs = find_similar_drugs(drug_vector, drug_database)
                        
                        drug_top3 = [
                            {
                                "label": item["name"],
                                "confidence": item["similarity"]
                            }
                            for item in similar_drugs[:3]
                        ]
                        
                        obj_data["drug_top3"] = drug_top3
                        
                        if len(drug_top3) > 0:
                            obj_data["selected_drug"] = drug_top3[0]["label"]
                            
                            if len(similar_drugs) > 0:
                                most_similar = similar_drugs[0]
                                obj_data["most_similar_drug"] = {
                                    "id": most_similar["id"],
                                    "name": most_similar["name"],
                                    "similarity": most_similar["similarity"],
                                    "path": most_similar["path"]
                                }
                        else:
                            obj_data["selected_drug"] = "Unknown"
                            obj_data["note"] = "No similar drugs found in database"
                    else:
                        obj_data["drug_top3"] = []
                        obj_data["selected_drug"] = "Unknown"
                        obj_data["note"] = "Drug database is empty. No similarity search performed."
                else:
                    obj_data["note"] = "Failed to create feature vector for drug"
            else:
                obj_data["note"] = "Narcotic model not available. Cannot classify drug type."
            
            objects.append(obj_data)
        else:
            obj_data["note"] = f"Object is {cls_name}. Not a DRUG or GUN, detailed classification skipped."
            objects.append(obj_data)

    return {
        "original_image": image_path,
        "detected_objects": objects
    }

# พรีวิว vector
def preview_vector(image_path):
    print(f"Generating vector for: {image_path}")
    
    # สร้าง vector จากรูปภาพ
    vector = image_to_vector(image_path)
    
    if vector is None:
        print("Failed to generate vector")
        return
    
    # 1. แสดงข้อมูลพื้นฐานของ vector
    print(f"Vector type: {type(vector)}")
    print(f"Vector shape: {vector.shape}")
    print(f"Vector size: {vector.numel()} elements")
    
    # 2. แสดงค่าสถิติพื้นฐาน
    print(f"Min value: {vector.min().item()}")
    print(f"Max value: {vector.max().item()}")
    print(f"Mean value: {vector.mean().item()}")
    
    # 3. แสดงตัวอย่าง 10 ค่าแรก
    print("\nFirst 10 values:")
    first_ten = vector[:10].cpu().numpy()
    for i, val in enumerate(first_ten):
        print(f"  [{i}] = {val}")
    
    # 4. แสดงตัวอย่าง 5 ค่าสุดท้าย
    print("\nLast 5 values:")
    last_five = vector[-5:].cpu().numpy()
    for i, val in enumerate(last_five):
        idx = len(vector) - 5 + i
        print(f"  [{idx}] = {val}")
    
    # 5. แสดงฮิสโตแกรมจำนวนค่าในช่วงต่างๆ (แบ่งเป็น 10 ช่วง)
    hist_data = vector.cpu().numpy()
    hist, bin_edges = np.histogram(hist_data, bins=10)
    print("\nValue distribution (histogram):")
    for i in range(len(hist)):
        print(f"  [{bin_edges[i]:.3f} to {bin_edges[i+1]:.3f}]: {hist[i]} values")
    
    return vector

result = process_image("C:/Users/Kawee Lekmuenwai/Pictures/Screenshots/Screenshot 2025-05-22 170905.png")

print(json.dumps(result, indent=2))

# # ทดลองพรีวิว vector จากรูปภาพตัวอย่าง
# test_image_path = "C:/Users/Kawee Lekmuenwai/Downloads/58154_0.jpg"
# preview_vector(test_image_path)

# # พรีวิว vector ที่เก็บอยู่ใน database
# print("\nVector from database preview:")
# first_drug_id = list(drug_database.keys())[0]
# db_vector = torch.tensor(drug_database[first_drug_id]["vector"])
# print(f"Vector from {drug_database[first_drug_id]['name']}")
# print(f"Vector shape: {db_vector.shape}")
# print(f"First 5 values: {db_vector[:5].tolist()}")