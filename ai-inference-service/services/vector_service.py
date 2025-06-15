import torch
import torch.nn.functional as F
import numpy as np
import cv2
import os
import uuid
import base64

from PIL import Image
from torchvision import transforms
from ultralytics import YOLO
from pathlib import Path
from typing import Union, List, Tuple, Optional, Dict, Any

class VectorService:
    def __init__(self, model_path: Optional[str] = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Standard image transformation - same as in gun_classification.py
        self.transform = transforms.Compose([
            transforms.Resize((640, 640)),
            transforms.ToTensor(),
        ])
        
        # สร้าง paths ของโมเดลต่างๆ
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        # 📁 โมเดลสำหรับ Segmentation
        self.segment_model_path = os.path.join(backend_dir, "app", "model", "Model V2", "5M_Segment", "best_v8.pt")
        self.segment_model = None
        
        # 📁 โมเดลสำหรับ Feature Extraction
        self.narcotic_model_path = os.path.join(backend_dir, "app", "model", "Model V2", "Narcotics", "best.pt")
        if model_path:
            self.narcotic_model_path = model_path
            
        self.narcotic_model = None
        
        # 📁 โฟลเดอร์สำหรับบันทึกภาพที่ segment แล้วสำหรับการ debug
        self.debug_dir = os.path.join(backend_dir, "debug_images")
        if not os.path.exists(self.debug_dir):
            os.makedirs(self.debug_dir)
            
        # 📊 ตัวแปรสำหรับ class mapping
        self.segment_classes = {0: 'BigGun', 1: 'Bullet', 2: 'Drug', 3: 'Magazine', 4: 'PackageDrug', 5: 'Pistol', 6: 'Revolver'}
        
        # ⚙️ โหลดโมเดล
        self.load_segmentation_model()
        self.load_narcotic_model()
    
    def load_segmentation_model(self) -> None:
        """โหลดโมเดลสำหรับ segmentation"""
        try:
            if os.path.exists(self.segment_model_path):
                self.segment_model = YOLO(self.segment_model_path)
            else:
                pass
        except Exception as e:
            pass
    
    def load_narcotic_model(self) -> None:
        """โหลดโมเดลสำหรับสร้าง feature vector"""
        try:
            if os.path.exists(self.narcotic_model_path):
                self.narcotic_model = YOLO(self.narcotic_model_path)
            else:
                pass
        except Exception as e:
            pass
    
    def crop_mask_on_white(self, img: np.ndarray, mask: np.ndarray) -> np.ndarray:
        """
        ตัดวัตถุตาม mask และวางบนพื้นหลังสีขาว เหมือนในไฟล์ gun_classification.py
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
    
    def process_image_for_vector(self, 
                               image: Union[str, Path, Image.Image, np.ndarray, bytes], 
                               save_debug_image: bool = True) -> Tuple[np.ndarray, Dict]:
        """
        ประมวลผลรูปภาพโดย segment วัตถุที่เป็นยาเสพติดออกมาก่อน
        แล้วจึงส่งผ่านไปยัง feature extraction
        
        Args:
            image: รูปภาพในรูปแบบต่างๆ
            save_debug_image: บันทึกรูปภาพที่ตัดแล้วเพื่อการ debug
            
        Returns:
            cropped_image: รูปภาพที่ตัดส่วนที่เป็นยาเสพติดแล้ว
            result_info: ข้อมูลเพิ่มเติมเกี่ยวกับผลลัพธ์ (เช่น confidence, class)
        """
        if self.segment_model is None:
            raise ValueError("Segmentation model not loaded. Please load the model first.")
            
        # แปลงรูปภาพให้เป็นรูปแบบที่ถูกต้อง
        if isinstance(image, str) or isinstance(image, Path):
            cv_image = cv2.imread(str(image))
        elif isinstance(image, Image.Image):
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        elif isinstance(image, np.ndarray):
            cv_image = image
        elif isinstance(image, bytes):
            import io
            pil_image = Image.open(io.BytesIO(image))
            cv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        else:
            raise TypeError("Image must be a file path, PIL Image, numpy array, or bytes")
        
        # ใช้โมเดล segment เพื่อแยกวัตถุ
        results = self.segment_model(cv_image)[0]
        
        # ข้อมูลผลลัพธ์
        result_info = {
            "found_drug": False,
            "confidence": 0.0,
            "class_name": "",
            "debug_image_path": None
        }
        
        # ไม่พบวัตถุใดๆ
        if len(results.boxes) == 0:
            return cv_image, result_info
        
        # ค้นหาวัตถุที่เป็นยาเสพติด (Drug หรือ PackageDrug)
        drug_indices = []
        for i, box in enumerate(results.boxes):
            cls_id = int(box.cls[0].item())
            cls_name = self.segment_classes.get(cls_id, "Unknown")
            confidence = float(box.conf[0].item())
            
            if cls_name in ['Drug', 'PackageDrug']:
                drug_indices.append((i, cls_name, confidence))
        
        # ถ้าไม่พบยาเสพติด ใช้รูปภาพเดิม
        if not drug_indices:
            return cv_image, result_info
        
        # เลือกยาเสพติดที่มีความมั่นใจสูงสุด
        drug_indices.sort(key=lambda x: x[2], reverse=True)
        best_match = drug_indices[0]
        idx, cls_name, confidence = best_match
        
        # ตัดภาพตาม mask
        mask = results.masks.data[idx].cpu().numpy()
        cropped = self.crop_mask_on_white(cv_image, mask)
        
        # บันทึกภาพสำหรับการ debug
        if save_debug_image:
            debug_path = os.path.join(self.debug_dir, f"cropped_{cls_name}_{uuid.uuid4()}.jpg")
            cv2.imwrite(debug_path, cropped)
            result_info["debug_image_path"] = debug_path
        
        # อัพเดทข้อมูลผลลัพธ์
        result_info.update({
            "found_drug": True,
            "confidence": round(confidence, 2),
            "class_name": cls_name
        })
        
        return cropped, result_info
    
    def image_to_vector(self, 
                       image: Union[str, Path, Image.Image, np.ndarray, bytes], 
                       normalize: bool = True,
                       segment_first: bool = True,
                       save_debug_image: bool = True) -> torch.Tensor:
        """
        แปลงรูปภาพเป็น vector โดยอาจจะผ่านการ segment ก่อน
        
        Args:
            image: รูปภาพในรูปแบบต่างๆ
            normalize: ต้องการ normalize vector หรือไม่
            segment_first: ต้องการ segment รูปภาพก่อนหรือไม่
            save_debug_image: บันทึกรูปภาพที่ตัดแล้วเพื่อการ debug
            
        Returns:
            vector: vector representation ของรูปภาพ
        """
        if self.narcotic_model is None:
            raise ValueError("Narcotic model not loaded. Please load the model first.")
        
        processed_image = image
        result_info = {}
        
        # ถ้าต้องการ segment ก่อน
        if segment_first:
            try:
                processed_image, result_info = self.process_image_for_vector(
                    image, save_debug_image=save_debug_image
                )
            except Exception as e:
                # ใช้รูปภาพเดิมถ้ามีปัญหา
                processed_image = image
        
        # แปลงรูปภาพเป็นรูปแบบที่เหมาะกับ feature extraction
        if isinstance(processed_image, np.ndarray):
            processed_image = Image.fromarray(cv2.cvtColor(processed_image, cv2.COLOR_BGR2RGB))
        elif isinstance(processed_image, str) or isinstance(processed_image, Path):
            processed_image = Image.open(processed_image).convert("RGB")
        elif isinstance(processed_image, bytes):
            import io
            processed_image = Image.open(io.BytesIO(processed_image)).convert("RGB")
        
        # แปลงภาพเป็น tensor
        tensor = self.transform(processed_image).unsqueeze(0)
        tensor = tensor.to(self.device)
        
        # สกัด feature vector
        with torch.no_grad():
            backbone = self.narcotic_model.model.model[:-1]
            features = backbone(tensor)
            vector = features.view(features.size(0), -1)[0]
        
        # Normalize vector if requested
        if normalize:
            vector = F.normalize(vector, p=2, dim=0)
            
        return vector
    
    def torch_vector_resize(self, vector: torch.Tensor, target_dim: int = 16000) -> torch.Tensor:
        """
        ลดขนาด vector ด้วย PyTorch operations โดยตรง เร็วกว่าการใช้ NumPy
        
        Args:
            vector: PyTorch tensor ที่ต้องการลดขนาด
            target_dim: มิติที่ต้องการ
            
        Returns:
            PyTorch tensor ที่มีขนาดตามต้องการ
        """
        current_dim = vector.size(0)
        
        # ถ้าขนาดถูกต้องแล้ว ไม่ต้องแก้ไข
        if current_dim == target_dim:
            return vector
        
        # ถ้า vector มีขนาดน้อยกว่า target_dim ทำ padding ด้วย 0
        if current_dim < target_dim:
            padded = torch.zeros(target_dim, device=vector.device)
            padded[:current_dim] = vector
            return padded
        
        # ถ้า vector มีขนาดใหญ่กว่า target_dim ลดขนาดด้วย adaptive avg pooling
        # ซึ่งมีประสิทธิภาพกว่าการใช้ mean pooling ด้วย NumPy
        vector_reshaped = vector.view(1, 1, -1)  # [1, 1, dim]
        pooled = F.adaptive_avg_pool1d(vector_reshaped, target_dim)
        return pooled.view(-1)  # [target_dim]

    def vector_to_numpy(self, vector: torch.Tensor, target_dim: int = 16000) -> np.ndarray:
        """
        แปลง PyTorch tensor เป็น numpy array โดยทำการลดขนาดด้วย PyTorch ก่อน
        """
        # ตรวจสอบว่า vector มีข้อมูลจริงหรือไม่
        if vector.numel() == 0 or (vector.numel() == 1 and vector.item() == 0):
            np.random.seed(42)  # ใช้ seed คงที่
            return np.random.normal(0, 0.1, target_dim).astype(np.float32)
        
        # ลดขนาด vector ด้วย PyTorch operations
        resized_vector = self.torch_vector_resize(vector, target_dim)
        
        # แปลงเป็น NumPy array หลังจากลดขนาดแล้ว
        return resized_vector.cpu().numpy()
    
    @staticmethod
    def calculate_similarity(vector1: Union[torch.Tensor, np.ndarray], 
                           vector2: Union[torch.Tensor, np.ndarray]) -> float:
        # แปลงเป็น PyTorch tensor ถ้ายังไม่ใช่
        if isinstance(vector1, np.ndarray):
            vector1 = torch.from_numpy(vector1).float()
        if isinstance(vector2, np.ndarray):
            vector2 = torch.from_numpy(vector2).float()
            
        # คำนวณ cosine similarity
        return F.cosine_similarity(vector1.unsqueeze(0), vector2.unsqueeze(0)).item()
    
    def find_similar_images(self, 
                          query_image: Union[str, Path, Image.Image, np.ndarray],
                          database: Dict[str, Dict[str, Any]],
                          top_k: int = 5) -> List[Dict[str, Any]]:
        query_vector = self.image_to_vector(query_image)
        
        results = []
        for image_id, image_data in database.items():
            if "vector" in image_data:
                # อาจเก็บเป็น list หรือ numpy array ใน database
                db_vector = image_data["vector"]
                if isinstance(db_vector, list):
                    db_vector = torch.tensor(db_vector)
                
                # คำนวณความคล้ายคลึง
                similarity = self.calculate_similarity(query_vector, db_vector)
                
                results.append({
                    "id": image_id,
                    "similarity": round(similarity, 4),
                    "metadata": {k: v for k, v in image_data.items() if k != "vector"}
                })
        
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]
    
    def process_image_batch(self, 
                          images: List[Union[str, Path, Image.Image, np.ndarray]],
                          normalize: bool = True) -> List[torch.Tensor]:
        """
        Process a batch of images to vectors
        
        Args:
            images: List of images
            normalize: Whether to normalize vectors
            
        Returns:
            List of feature vectors (PyTorch tensors)
        """
        vectors = []
        for img in images:
            try:
                vector = self.image_to_vector(img, normalize)
                vectors.append(vector)
            except Exception as e:
                vectors.append(None)
        return vectors

_vector_service = VectorService()

def create_vector_embedding(image_data: Union[str, Path, Image.Image, np.ndarray, bytes], segment_first: bool = True) -> Dict:
    """
    สร้าง vector embedding จากรูปภาพ พร้อมทั้งข้อมูลเพิ่มเติม
    """
    global _vector_service
    
    if _vector_service.segment_model is None:
        _vector_service.load_segmentation_model()
        
    if _vector_service.narcotic_model is None:
        _vector_service.load_narcotic_model()
    
    result_info = {}
    try:
        if segment_first:
            processed_image, result_info = _vector_service.process_image_for_vector(image_data)
            vector = _vector_service.image_to_vector(processed_image, normalize=True, segment_first=False)
        else:
            vector = _vector_service.image_to_vector(image_data, normalize=True, segment_first=False)
    except Exception as e:
        raise
    
    vector_np = _vector_service.vector_to_numpy(vector)
    
    # Convert vector to base64 instead of JSON list
    vector_bytes = vector_np.tobytes()
    vector_base64 = base64.b64encode(vector_bytes).decode('utf-8')

    result = {
        # Remove JSON list and use base64 instead
        "vector_base64": vector_base64,
        "vector_dimension": len(vector_np),
        "segmentation_result": result_info
    }
    
    return result

def preview_vector(vector: Union[torch.Tensor, np.ndarray]) -> None:
    """
    แสดงรายละเอียดของ vector ในรูปแบบเดียวกับในไฟล์ gun_classification.py
    
    Args:
        vector: PyTorch tensor หรือ NumPy array ที่ต้องการแสดงรายละเอียด
    """
    # แปลงให้เป็น PyTorch tensor ถ้าเป็น NumPy array
    if isinstance(vector, np.ndarray):
        vector = torch.from_numpy(vector).float()
    
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